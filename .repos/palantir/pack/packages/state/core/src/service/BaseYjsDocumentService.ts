/*
 * Copyright 2025 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-console */

import type { Logger } from "@osdk/api";
import type { PackAppInternal, Unsubscribe } from "@palantir/pack.core";
import {
  type ActivityEvent,
  type DocumentId,
  type DocumentMetadata,
  type DocumentRef,
  type DocumentSchema,
  type DocumentState,
  type EditDescription,
  getMetadata,
  type Model,
  type ModelData,
  type PresenceEvent,
  type PresencePublishOptions,
  type RecordCollectionRef,
  type RecordId,
  type RecordRef,
} from "@palantir/pack.document-schema.model-types";
import { isDeepEqual } from "remeda";
import invariant from "tiny-invariant";
import * as Y from "yjs";
import type { CreateDocumentMetadata } from "../types/CreateDocumentMetadata.js";
import { createDocRef } from "../types/DocumentRefImpl.js";
import type {
  DocumentMetadataChangeCallback,
  DocumentService,
  DocumentStateChangeCallback,
  DocumentStatus,
  DocumentStatusChangeCallback,
  DocumentSyncStatus,
  RecordChangeCallback,
  RecordCollectionChangeCallback,
  RecordDeleteCallback,
  SearchDocumentsResult,
} from "../types/DocumentService.js";
import { DocumentLiveStatus, DocumentLoadStatus } from "../types/DocumentService.js";
import { createRecordCollectionRef } from "../types/RecordCollectionRefImpl.js";
import { createRecordRef } from "../types/RecordRefImpl.js";
import * as YjsSchemaMapper from "./YjsSchemaMapper.js";

export interface RecordCollectionSubscriptions<M extends Model = Model> {
  added?: Set<RecordCollectionChangeCallback<M>>;
  changed?: Set<RecordCollectionChangeCallback<M>>;
  deleted?: Set<RecordCollectionChangeCallback<M>>;
}

export interface RecordSubscribers<M extends Model = Model> {
  readonly ref: RecordRef<M>;
  changed?: Set<RecordChangeCallback<M>>;
  deleted?: Set<RecordDeleteCallback<M>>;
}

export interface InternalYjsDoc {
  /**
   * Holds a weak reference to this doc for two purposes:
   * 1. Return stable createDocRef values for reference equality.
   * 2. We can collect and clean up documents that are no longer referenced anywhere (although ideally
   *    we can do this via subscription tracking alone).
   * Note that docRefs references are also held by RecordCollectionRef & RecordRef instances.
   */
  ref: WeakRef<DocumentRef>;
  metadata?: DocumentMetadata;
  readonly schema: DocumentSchema;
  readonly yDoc: Y.Doc;
  yDocUpdateHandler?: () => void;

  // Status tracking
  metadataStatus: DocumentSyncStatus;
  dataStatus: DocumentSyncStatus;
  metadataError?: unknown;
  dataError?: unknown;

  // Track if we have active subscriptions
  // TODO: ref counts instead? Are these even necessary on the doc or should just be service calls?
  hasMetadataSubscriptions: boolean;
  hasDataSubscriptions: boolean;

  // Ref caching for stable references
  readonly collectionRefs: Map<string, WeakRef<RecordCollectionRef>>;
  readonly recordRefs: Map<string, Map<RecordId, WeakRef<RecordRef>>>;

  // TODO: add modelName type
  readonly collectionSubscriptions: Map<string, RecordCollectionSubscriptions>;
  readonly metadataSubscribers: Set<DocumentMetadataChangeCallback>;
  readonly recordSubscriptions: Map<RecordId, RecordSubscribers>;
  readonly docStateSubscribers: Set<DocumentStateChangeCallback>;
  readonly statusSubscribers: Set<DocumentStatusChangeCallback>;

  readonly yjsCollectionHandlers: Map<string, () => void>;
}

export interface BaseYjsDocumentServiceOptions {
  readonly isDemo?: boolean;
}

/**
 * Base class for document services that use Y.js for local state management.
 * Provides common Y.js operations for both in-memory and backend services.
 *
 * // TODO: Move this to an internal package
 */
export abstract class BaseYjsDocumentService<TDoc extends InternalYjsDoc = InternalYjsDoc>
  implements DocumentService
{
  protected readonly documents: Map<DocumentId, TDoc> = new Map();
  protected readonly isDemo?: boolean;

  constructor(
    protected readonly app: PackAppInternal,
    protected readonly logger: Logger,
    options?: BaseYjsDocumentServiceOptions,
  ) {
    this.isDemo = options?.isDemo;
  }

  abstract get hasMetadataSubscriptions(): boolean;
  abstract get hasStateSubscriptions(): boolean;
  abstract readonly createDocument: <T extends DocumentSchema>(
    metadata: CreateDocumentMetadata,
    schema: T,
  ) => Promise<DocumentRef<T>>;
  abstract readonly searchDocuments: <T extends DocumentSchema>(
    documentTypeName: string,
    schema: T,
    options?: {
      documentName?: string;
      pageSize?: number;
      pageToken?: string;
    },
  ) => Promise<SearchDocumentsResult>;

  readonly createDocRef = <const T extends DocumentSchema>(
    id: DocumentId,
    schema: T,
  ): DocumentRef<T> => {
    // Create a (likely) temporary doc ref - the internal doc will be created if it is unknown
    // If it is known, we will return the stable ref from getCreateInternalDoc
    const temporaryRef = createDocRef(this.app, id, schema);
    const { internalDocRef } = this.getCreateInternalDoc(temporaryRef);
    return internalDocRef;
  };

  readonly getCreateRecordCollectionRef = <const M extends Model>(
    docRef: DocumentRef,
    model: M,
  ): RecordCollectionRef<M> => {
    const { internalDoc } = this.getCreateInternalDoc(docRef);
    const modelName = getMetadata(model).name;

    const existingRef = internalDoc.collectionRefs.get(modelName)?.deref();
    if (existingRef != null) {
      return existingRef as RecordCollectionRef<M>;
    }

    const newRef = createRecordCollectionRef(this, docRef, model);
    internalDoc.collectionRefs.set(modelName, new WeakRef(newRef));
    return newRef;
  };

  readonly getCreateRecordRef = <const M extends Model>(
    docRef: DocumentRef,
    id: RecordId,
    model: M,
  ): RecordRef<M> => {
    const { internalDoc } = this.getCreateInternalDoc(docRef);
    const modelName = getMetadata(model).name;

    let modelMap = internalDoc.recordRefs.get(modelName);
    if (!modelMap) {
      modelMap = new Map();
      internalDoc.recordRefs.set(modelName, modelMap);
    }

    const existingRef = modelMap.get(id)?.deref();
    if (existingRef != null) {
      return existingRef as RecordRef<M>;
    }

    const newRef = createRecordRef(this, docRef, id, model);
    modelMap.set(id, new WeakRef(newRef));
    return newRef;
  };

  protected abstract createInternalDoc(
    ref: DocumentRef,
    metadata?: CreateDocumentMetadata,
    yDoc?: Y.Doc,
  ): TDoc;

  /**
   * Called when the first metadata subscription is opened for a document.
   * Implementation must:
   * - Set status to LOADING immediately
   * - Load/validate metadata asynchronously
   * - Set status to LOADED or ERROR when complete
   * - Handle all errors internally (never throw/reject)
   */
  protected abstract onMetadataSubscriptionOpened(
    internalDoc: TDoc,
    docRef: DocumentRef,
  ): void;

  /**
   * Called when the first data subscription is opened for a document.
   * Implementation must:
   * - Set status to LOADING immediately
   * - Set up data synchronization asynchronously
   * - Set status to LOADED or ERROR when ready
   * - Handle all errors internally (never throw/reject)
   */
  protected abstract onDataSubscriptionOpened(
    internalDoc: TDoc,
    docRef: DocumentRef,
  ): void;

  /**
   * Called when the last metadata subscription is closed for a document.
   * Implementation should clean up any resources related to metadata loading.
   */
  protected abstract onMetadataSubscriptionClosed(
    internalDoc: TDoc,
    docRef: DocumentRef,
  ): void;

  /**
   * Called when the last data subscription is closed for a document.
   * Implementation should clean up any resources related to data synchronization.
   */
  protected abstract onDataSubscriptionClosed(
    internalDoc: TDoc,
    docRef: DocumentRef,
  ): void;

  protected readonly createBaseInternalDoc = <T extends DocumentSchema>(
    ref: DocumentRef<T>,
    metadata: DocumentMetadata | undefined,
  ): InternalYjsDoc => {
    const schema = ref.schema;
    return {
      ref: new WeakRef(ref),
      metadata,
      schema,
      metadataStatus: {
        load: metadata ? DocumentLoadStatus.LOADED : DocumentLoadStatus.UNLOADED,
        live: DocumentLiveStatus.DISCONNECTED,
      },
      dataStatus: {
        load: DocumentLoadStatus.UNLOADED,
        live: DocumentLiveStatus.DISCONNECTED,
      },
      metadataError: undefined,
      dataError: undefined,
      statusSubscribers: new Set(),
      hasMetadataSubscriptions: false,
      hasDataSubscriptions: false,
      collectionRefs: new Map(),
      recordRefs: new Map(),
      collectionSubscriptions: new Map(),
      docStateSubscribers: new Set(),
      metadataSubscribers: new Set(),
      recordSubscriptions: new Map(),
      yDoc: this.initializeYDoc(schema),
      yDocUpdateHandler: undefined,
      yjsCollectionHandlers: new Map(),
    };
  };

  protected hasSubscriptions(internalDoc: TDoc): boolean {
    if (
      internalDoc.metadataSubscribers.size > 0
      || internalDoc.docStateSubscribers.size > 0
    ) {
      return true;
    }
    for (const subs of internalDoc.recordSubscriptions.values()) {
      if (!subs.changed?.size || !subs.deleted?.size) {
        return true;
      }
    }
    return false;
  }

  // Status helper methods
  protected notifyStatusSubscribers(
    internalDoc: TDoc,
    docRef: DocumentRef,
  ): void {
    const status: DocumentStatus = {
      metadata: internalDoc.metadataStatus,
      data: internalDoc.dataStatus,
      metadataError: internalDoc.metadataError,
      dataError: internalDoc.dataError,
    };
    for (const callback of internalDoc.statusSubscribers) {
      callback(docRef, status);
    }
  }

  protected updateMetadataStatus(
    internalDoc: TDoc,
    docRef: DocumentRef,
    update: {
      load?: DocumentLoadStatus;
      live?: DocumentLiveStatus;
      error?: unknown;
    },
  ): void {
    if (update.load != null || update.live != null) {
      internalDoc.metadataStatus = {
        isDemo: this.isDemo,
        load: update.load ?? internalDoc.metadataStatus.load,
        live: update.live ?? internalDoc.metadataStatus.live,
      };
    }
    if (update.error != null) {
      internalDoc.metadataError = update.error;
    } else if (update.load === DocumentLoadStatus.LOADED) {
      // Clear error on successful load
      internalDoc.metadataError = undefined;
    }
    this.notifyStatusSubscribers(internalDoc, docRef);
  }

  protected updateDataStatus(
    internalDoc: TDoc,
    docRef: DocumentRef,
    update: {
      load?: DocumentLoadStatus;
      live?: DocumentLiveStatus;
      error?: unknown;
    },
  ): void {
    if (update.load != null || update.live != null) {
      internalDoc.dataStatus = {
        isDemo: this.isDemo,
        load: update.load ?? internalDoc.dataStatus.load,
        live: update.live ?? internalDoc.dataStatus.live,
      };
    }
    if (update.error != null) {
      internalDoc.dataError = update.error;
    } else if (update.load === DocumentLoadStatus.LOADED) {
      // Clear error on successful load
      internalDoc.dataError = undefined;
    }
    this.notifyStatusSubscribers(internalDoc, docRef);
  }

  /**
   * Hook method called after a record is set. Subclasses can override to handle
   * backend synchronization, logging, or other side effects.
   */
  protected onRecordSet?<R extends Model>(
    recordRef: RecordRef<R>,
    state: ModelData<R>,
  ): void;

  /**
   * Initialize a Y.Doc with the given schema
   */
  protected initializeYDoc(schema: DocumentSchema): Y.Doc {
    const yDoc = new Y.Doc();
    YjsSchemaMapper.initializeDocumentStructure(yDoc, schema);
    return yDoc;
  }

  /**
   * Get existing internal doc or create one with placeholder metadata for lazy initialization
   */
  protected getCreateInternalDoc<T extends DocumentSchema>(
    ref: DocumentRef<T>,
    metadata?: CreateDocumentMetadata,
    initialYDoc?: Y.Doc,
  ): { internalDocRef: DocumentRef<T>; internalDoc: TDoc; wasExisting: boolean } {
    const { id, schema } = ref;
    const existingDoc = this.documents.get(id);
    if (existingDoc != null) {
      // Use reference equality first (fast path), then deep equality for hot reload compatibility
      invariant(
        existingDoc.schema === schema || isDeepEqual(existingDoc.schema, schema),
        "Schema mismatch for existing document",
      );

      // The caller has a strong ref - in most cases this will be the same instance as we already
      // have stored in the ref field. If it is not, we want to return a stable ref so users can
      // easily depend on reference equality.

      // It's possible the previous weak ref was collected as all references were dropped. If so,
      // we can update the weak ref.
      const existingRef = existingDoc.ref.deref() as DocumentRef<T> | undefined;

      if (existingRef == null) {
        existingDoc.ref = new WeakRef(ref);
      }

      return { internalDocRef: existingRef ?? ref, internalDoc: existingDoc, wasExisting: true };
    }

    const internalDoc = this.createInternalDoc(ref, metadata, initialYDoc);
    this.documents.set(id, internalDoc);
    return { internalDocRef: ref, internalDoc, wasExisting: false };
  }

  readonly getDocumentSnapshot = <T extends DocumentSchema>(
    docRef: DocumentRef<T>,
  ): Promise<DocumentState<T>> => {
    const { internalDoc } = this.getCreateInternalDoc(docRef);

    // For now, return the Y.Doc as the state
    // Later this can be enhanced to serialize Y.Doc content or return specific data
    return Promise.resolve(internalDoc.yDoc as unknown as DocumentState<T>);
  };

  readonly getRecordSnapshot = <M extends Model>(
    recordRef: RecordRef<M>,
  ): Promise<ModelData<M>> => {
    const { internalDoc } = this.getCreateInternalDoc(recordRef.docRef);
    const snapshot = this.getRecordSnapshotInternal(internalDoc, recordRef);

    // This is a promise interface for async loading for external API implementations to trigger a load first
    // For this base implementation, we always return from the local Y.Doc

    if (snapshot == null) {
      // TODO: well known error types
      return Promise.reject(new Error(`Record not found: ${recordRef.id}`));
    }
    return Promise.resolve(snapshot);
  };

  protected getRecordSnapshotInternal<M extends Model>(
    internalDoc: TDoc,
    recordRef: RecordRef<M>,
  ): ModelData<M> {
    return YjsSchemaMapper.getRecordSnapshot(
      internalDoc.yDoc,
      getMetadata(recordRef.model).name,
      recordRef.id,
    ) as ModelData<M>;
  }

  readonly setRecord = <R extends Model>(
    recordRef: RecordRef<R>,
    state: ModelData<R>,
  ): Promise<void> => {
    const internalDoc = this.documents.get(recordRef.docRef.id);
    invariant(
      internalDoc != null,
      `Cannot set record as document not found: ${recordRef.docRef.id}`,
    );

    // TODO: you cannot resurrect tomb stoned records I think, so need to check for that before notify
    // TODO: perhaps we just call this via onRecordSet instead?

    YjsSchemaMapper.setRecord(
      internalDoc.yDoc,
      getMetadata(recordRef.model).name,
      recordRef.id,
      state,
    );

    // Call hook method for subclass-specific handling
    this.onRecordSet?.(recordRef, state);

    return Promise.resolve();
  };

  readonly updateRecord = <R extends Model>(
    recordRef: RecordRef<R>,
    partialState: Partial<ModelData<R>>,
  ): Promise<void> => {
    const internalDoc = this.documents.get(recordRef.docRef.id);
    invariant(
      internalDoc != null,
      `Cannot update record as document not found: ${recordRef.docRef.id}`,
    );

    const wasUpdated = YjsSchemaMapper.updateRecord(
      internalDoc.yDoc,
      getMetadata(recordRef.model).name,
      recordRef.id,
      partialState,
    );

    if (!wasUpdated) {
      return Promise.reject(new Error(`Record not found for update: ${recordRef.id}`));
    }

    // Call hook method for subclass-specific handling
    this.onRecordSet?.(recordRef, partialState);

    return Promise.resolve();
  };

  readonly withTransaction = (
    docRef: DocumentRef,
    fn: () => void,
    description?: EditDescription,
  ): void => {
    const internalDoc = this.documents.get(docRef.id);
    invariant(
      internalDoc != null,
      `Cannot start transaction as document not found: ${docRef.id}`,
    );

    internalDoc.yDoc.transact(fn, description);
  };

  onMetadataChange<T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    callback: DocumentMetadataChangeCallback<T>,
  ): Unsubscribe {
    const { internalDoc, internalDocRef } = this.getCreateInternalDoc(docRef);
    const isFirstSubscription = !internalDoc.hasMetadataSubscriptions;

    internalDoc.metadataSubscribers.add(callback as DocumentMetadataChangeCallback);
    internalDoc.hasMetadataSubscriptions = true;

    // Trigger remote load if this is the first subscription and not yet loaded
    if (isFirstSubscription && internalDoc.metadataStatus.load === DocumentLoadStatus.UNLOADED) {
      this.onMetadataSubscriptionOpened(internalDoc, internalDocRef);
    }

    // Immediately call back with current metadata if available
    if (internalDoc.metadata != null) {
      callback(docRef, internalDoc.metadata);
    }

    return () => {
      const currentDoc = this.documents.get(docRef.id);
      if (currentDoc) {
        currentDoc.metadataSubscribers.delete(callback as DocumentMetadataChangeCallback);

        // Check if this was the last metadata subscription
        if (currentDoc.metadataSubscribers.size === 0) {
          currentDoc.hasMetadataSubscriptions = false;
          this.onMetadataSubscriptionClosed(currentDoc, internalDocRef);
        }
      }
    };
  }

  abstract onActivity<T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    callback: (docRef: DocumentRef<T>, event: ActivityEvent) => void,
  ): Unsubscribe;

  abstract onPresence<T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    callback: (docRef: DocumentRef<T>, event: PresenceEvent) => void,
  ): Unsubscribe;

  abstract updateCustomPresence<M extends Model>(
    docRef: DocumentRef,
    model: M,
    eventData: ModelData<M>,
    options?: PresencePublishOptions,
  ): void;

  readonly onStateChange = <T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    callback: DocumentStateChangeCallback<T>,
  ): Unsubscribe => {
    const { internalDoc, internalDocRef } = this.getCreateInternalDoc(docRef);

    const isFirstDataSubscription = !internalDoc.hasDataSubscriptions;
    const isFirstStateSubscription = internalDoc.docStateSubscribers.size === 0;

    internalDoc.docStateSubscribers.add(callback as DocumentStateChangeCallback);
    internalDoc.hasDataSubscriptions = true;

    // Trigger remote load if this is the first data subscription and not yet loaded
    if (isFirstDataSubscription && internalDoc.dataStatus.load === DocumentLoadStatus.UNLOADED) {
      this.onDataSubscriptionOpened(internalDoc, internalDocRef);
    }

    // Set up Y.Doc listener if this is the first state subscription
    if (isFirstStateSubscription && !internalDoc.yDocUpdateHandler) {
      const updateHandler = () => {
        this.notifyStateSubscribers(internalDoc, docRef);
      };
      internalDoc.yDoc.on("update", updateHandler);
      internalDoc.yDocUpdateHandler = updateHandler;
    }

    // Call callback immediately with current state
    callback(internalDocRef);

    return () => {
      const currentDoc = this.documents.get(docRef.id);
      if (!currentDoc) return;

      currentDoc.docStateSubscribers.delete(callback as DocumentStateChangeCallback);

      // Clean up Y.Doc listener if no more state subscriptions
      if (currentDoc.docStateSubscribers.size === 0 && currentDoc.yDocUpdateHandler) {
        currentDoc.yDoc.off("update", currentDoc.yDocUpdateHandler);
        currentDoc.yDocUpdateHandler = undefined;
      }

      // Check if this removes all data subscriptions (state + record + collection)
      const hasDataSubs = currentDoc.docStateSubscribers.size > 0
        || currentDoc.recordSubscriptions.size > 0
        || Array.from(currentDoc.collectionSubscriptions.values()).some(subs =>
          subs.added?.size || subs.changed?.size || subs.deleted?.size
        );

      if (!hasDataSubs) {
        currentDoc.hasDataSubscriptions = false;
        this.onDataSubscriptionClosed(currentDoc, internalDocRef);
      }
    };
  };

  protected getDocumentRef(docId: DocumentId): DocumentRef | null {
    const internalDoc = this.documents.get(docId);
    if (!internalDoc) return null;

    return createDocRef(this.app, docId, internalDoc.schema);
  }

  protected notifyMetadataSubscribers(
    internalDoc: TDoc,
    docRef: DocumentRef,
    metadata: DocumentMetadata,
  ): void {
    for (const callback of internalDoc.metadataSubscribers) {
      callback(docRef, metadata);
    }
  }

  protected notifyStateSubscribers(internalDoc: TDoc, docRef: DocumentRef): void {
    for (const callback of internalDoc.docStateSubscribers) {
      callback(docRef);
    }
  }

  updateMetadata(docId: DocumentId, metadata: DocumentMetadata): void {
    const internalDoc = this.documents.get(docId);
    if (internalDoc) {
      internalDoc.metadata = metadata;
      const docRef = this.getDocumentRef(docId);
      if (docRef) {
        this.notifyMetadataSubscribers(internalDoc, docRef, metadata);
      }
    }
  }

  protected notifyCollectionSubscribers<M extends Model>(
    internalDoc: TDoc,
    collection: RecordCollectionRef<M>,
    recordId: RecordId,
    changeType: "added" | "changed" | "deleted",
  ): void {
    const storageName = getMetadata(collection.model).name;
    const subs = internalDoc.collectionSubscriptions.get(storageName) as
      | RecordCollectionSubscriptions<M>
      | undefined;
    if (!subs) {
      return;
    }

    const subscribers = subs[changeType];
    if (subscribers == null || subscribers.size === 0) {
      return;
    }

    const recordRefInstance = this.getCreateRecordRef(
      collection.docRef,
      recordId,
      collection.model,
    );
    const records = [recordRefInstance];

    for (const callback of subscribers) {
      callback(records);
    }
  }

  protected notifyRecordSubscribers<M extends Model>(
    recordRef: RecordRef<M>,
    changeType: "changed" | "deleted",
  ): void {
    const internalDoc = this.documents.get(recordRef.docRef.id);
    invariant(internalDoc != null, "Document not found for record notifications");

    const recordSubs = internalDoc.recordSubscriptions.get(recordRef.id);
    if (recordSubs == null) {
      return;
    }

    // Verify model consistency
    invariant(
      getMetadata(recordSubs.ref.model).name === getMetadata(recordRef.model).name,
      `Model mismatch when notifying record subscribers for ${recordRef.id}: expected ${
        getMetadata(recordSubs.ref.model).name
      }, got ${getMetadata(recordRef.model).name}`,
    );

    switch (changeType) {
      case "changed": {
        const snapshot = this.getRecordSnapshotInternal(internalDoc, recordRef);
        for (const callback of recordSubs.changed ?? []) {
          try {
            callback(snapshot, recordRef);
          } catch (e) {
            console.error("Record onChanged callback threw unhandled error", e, {
              model: getMetadata(recordRef.model).name,
              id: recordRef.id,
            });
          }
        }
        break;
      }
      case "deleted": {
        for (const callback of recordSubs.deleted ?? []) {
          try {
            callback(recordRef);
          } catch (e) {
            console.error("Record onDeleted callback threw unhandled error", e, {
              model: getMetadata(recordRef.model).name,
              id: recordRef.id,
            });
          }
        }
        break;
      }
    }
  }

  // Collection methods implementation
  readonly getRecord = <M extends Model>(
    collection: RecordCollectionRef<M>,
    id: RecordId,
  ): RecordRef<M> | undefined => {
    const internalDoc = this.documents.get(collection.docRef.id);
    if (!internalDoc) return undefined;

    const storageName = getMetadata(collection.model).name;
    const recordExists = YjsSchemaMapper.getRecordData(internalDoc.yDoc, storageName, id);

    return recordExists
      ? this.getCreateRecordRef(collection.docRef, id, collection.model)
      : undefined;
  };

  readonly hasRecord = <M extends Model>(
    collection: RecordCollectionRef<M>,
    id: RecordId,
  ): boolean => {
    const internalDoc = this.documents.get(collection.docRef.id);
    if (!internalDoc) return false;

    const storageName = getMetadata(collection.model).name;
    return YjsSchemaMapper.getRecordData(internalDoc.yDoc, storageName, id) != null;
  };

  readonly setCollectionRecord = <M extends Model>(
    collection: RecordCollectionRef<M>,
    id: RecordId,
    state: ModelData<M>,
  ): Promise<void> => {
    // Create a RecordRef and delegate to existing setRecord method
    const recordRefInstance = this.getCreateRecordRef(collection.docRef, id, collection.model);
    return this.setRecord(recordRefInstance, state);
  };

  readonly deleteRecord = <M extends Model>(
    record: RecordRef<M>,
  ): Promise<void> => {
    const internalDoc = this.documents.get(record.docRef.id);
    if (!internalDoc) {
      // Document doesn't exist, record doesn't exist - this is a no-op
      return Promise.resolve();
    }

    const storageName = getMetadata(record.model).name;
    const recordsCollection = YjsSchemaMapper.getRecordsMap(internalDoc.yDoc, storageName);

    const existed = recordsCollection.has(record.id as string);
    if (existed) {
      recordsCollection.delete(record.id as string);
    }

    return Promise.resolve();
  };

  readonly getCollectionSize = <M extends Model>(
    collection: RecordCollectionRef<M>,
  ): number => {
    const internalDoc = this.documents.get(collection.docRef.id);
    if (!internalDoc) return 0;

    const storageName = getMetadata(collection.model).name;
    return YjsSchemaMapper.getAllRecordIds(internalDoc.yDoc, storageName).length;
  };

  readonly getCollectionRecords = <M extends Model>(
    collection: RecordCollectionRef<M>,
  ): RecordRef<M>[] => {
    const internalDoc = this.documents.get(collection.docRef.id);
    if (!internalDoc) return [];

    const storageName = getMetadata(collection.model).name;
    const recordIds = YjsSchemaMapper.getAllRecordIds(internalDoc.yDoc, storageName);

    return recordIds.map(id => this.getCreateRecordRef(collection.docRef, id, collection.model));
  };

  readonly onCollectionItemsAdded = <M extends Model>(
    collection: RecordCollectionRef<M>,
    callback: RecordCollectionChangeCallback<M>,
  ): Unsubscribe => {
    const { internalDoc, internalDocRef } = this.getCreateInternalDoc(collection.docRef);
    return this.subscribeToCollectionChanges(
      internalDoc,
      internalDocRef,
      collection,
      "added",
      callback,
    );
  };

  readonly onCollectionItemsChanged = <M extends Model>(
    collection: RecordCollectionRef<M>,
    callback: RecordCollectionChangeCallback<M>,
  ): Unsubscribe => {
    const { internalDoc, internalDocRef } = this.getCreateInternalDoc(collection.docRef);
    return this.subscribeToCollectionChanges(
      internalDoc,
      internalDocRef,
      collection,
      "changed",
      callback,
    );
  };

  readonly onCollectionItemsDeleted = <M extends Model>(
    collection: RecordCollectionRef<M>,
    callback: RecordCollectionChangeCallback<M>,
  ): Unsubscribe => {
    const { internalDoc, internalDocRef } = this.getCreateInternalDoc(collection.docRef);
    return this.subscribeToCollectionChanges(
      internalDoc,
      internalDocRef,
      collection,
      "deleted",
      callback,
    );
  };

  // TODO: clearer naming of subscription vs handlers etc.
  readonly onRecordChanged = <M extends Model>(
    record: RecordRef<M>,
    callback: RecordChangeCallback<M>,
  ): Unsubscribe => {
    const { internalDoc, internalDocRef } = this.getCreateInternalDoc(record.docRef);
    const isFirstDataSubscription = !internalDoc.hasDataSubscriptions;
    const storageName = getMetadata(record.model).name;
    const collectionRef = this.getCreateRecordCollectionRef(record.docRef, record.model);
    const needsCollectionListener = !internalDoc.yjsCollectionHandlers.has(storageName);

    const recordSubs = this.getCreateRecordSubscriptions(internalDoc, record);
    (recordSubs.changed ??= new Set()).add(callback);
    internalDoc.hasDataSubscriptions = true;

    // Trigger remote load if this is the first data subscription and not yet loaded
    if (isFirstDataSubscription && internalDoc.dataStatus.load === DocumentLoadStatus.UNLOADED) {
      // Call lifecycle method without awaiting
      this.onDataSubscriptionOpened(internalDoc, internalDocRef);
    }

    if (needsCollectionListener) {
      this.getCreateCollectionSubscriptions(internalDoc, collectionRef);
      this.setupCollectionListener(internalDoc, collectionRef);
    }

    const snapshot = this.getRecordSnapshotInternal(
      internalDoc,
      record,
    );
    if (snapshot != null) {
      callback(snapshot, record);
    }

    return () => {
      recordSubs.changed?.delete(callback);
      const currentDoc = this.documents.get(record.docRef.id);
      if (!currentDoc) return;

      if (isRecordSubscriptionsEmpty(recordSubs)) {
        currentDoc.recordSubscriptions.delete(record.id);
      }

      this.cleanupCollectionListenerIfUnused(currentDoc, record.docRef.id, storageName);

      const hasDataSubs = currentDoc.docStateSubscribers.size > 0
        || currentDoc.recordSubscriptions.size > 0
        || Array.from(currentDoc.collectionSubscriptions.values()).some(subs =>
          subs.added?.size || subs.changed?.size || subs.deleted?.size
        );

      if (!hasDataSubs) {
        currentDoc.hasDataSubscriptions = false;
        this.onDataSubscriptionClosed(currentDoc, internalDocRef);
      }
    };
  };

  readonly onRecordDeleted = <M extends Model>(
    record: RecordRef<M>,
    callback: RecordDeleteCallback<M>,
  ): Unsubscribe => {
    const { internalDoc, internalDocRef } = this.getCreateInternalDoc(record.docRef);
    const isFirstDataSubscription = !internalDoc.hasDataSubscriptions;
    const storageName = getMetadata(record.model).name;
    const collectionRef = this.getCreateRecordCollectionRef(record.docRef, record.model);
    const needsCollectionListener = !internalDoc.yjsCollectionHandlers.has(storageName);

    const recordSubs = this.getCreateRecordSubscriptions(internalDoc, record);
    (recordSubs.deleted ??= new Set()).add(callback);
    internalDoc.hasDataSubscriptions = true;

    if (isFirstDataSubscription && internalDoc.dataStatus.load === DocumentLoadStatus.UNLOADED) {
      this.onDataSubscriptionOpened(internalDoc, internalDocRef);
    }

    if (needsCollectionListener) {
      this.getCreateCollectionSubscriptions(internalDoc, collectionRef);
      this.setupCollectionListener(internalDoc, collectionRef);
    }

    return () => {
      recordSubs.deleted?.delete(callback);
      const currentDoc = this.documents.get(record.docRef.id);
      if (!currentDoc) return;

      if (isRecordSubscriptionsEmpty(recordSubs)) {
        currentDoc.recordSubscriptions.delete(record.id);
      }

      this.cleanupCollectionListenerIfUnused(currentDoc, record.docRef.id, storageName);

      const hasDataSubs = currentDoc.docStateSubscribers.size > 0
        || currentDoc.recordSubscriptions.size > 0
        || Array.from(currentDoc.collectionSubscriptions.values()).some(subs =>
          subs.added?.size || subs.changed?.size || subs.deleted?.size
        );

      if (!hasDataSubs) {
        currentDoc.hasDataSubscriptions = false;
        this.onDataSubscriptionClosed(currentDoc, internalDocRef);
      }
    };
  };

  private getCreateCollectionSubscriptions<M extends Model>(
    internalDoc: TDoc,
    collection: RecordCollectionRef<M>,
  ): RecordCollectionSubscriptions<M> {
    const storageName = getMetadata(collection.model).name;

    const docCollectionSubs = internalDoc.collectionSubscriptions.get(storageName)
      ?? internalDoc.collectionSubscriptions.set(storageName, {}).get(storageName)!;

    // Generic cast to specific types
    return docCollectionSubs;
  }

  private getCreateRecordSubscriptions<M extends Model>(
    internalDoc: TDoc,
    record: RecordRef<M>,
  ): RecordSubscribers<M> {
    let recordSubs = internalDoc.recordSubscriptions.get(record.id);

    if (!recordSubs) {
      // Create new subscription entry with the record ref
      recordSubs = { ref: record };
      internalDoc.recordSubscriptions.set(record.id, recordSubs);
    } else {
      // Verify model consistency - records with same ID should have same model
      if (getMetadata(recordSubs.ref.model).name !== getMetadata(record.model).name) {
        throw new Error(
          `Model mismatch for record ${record.id}: expected ${
            getMetadata(recordSubs.ref.model).name
          }, got ${getMetadata(record.model).name}`,
        );
      }
    }

    return recordSubs as unknown as RecordSubscribers<M>;
  }

  private subscribeToCollectionChanges<M extends Model>(
    internalDoc: TDoc,
    internalDocRef: DocumentRef,
    collection: RecordCollectionRef<M>,
    changeType: "added" | "changed" | "deleted",
    callback: RecordCollectionChangeCallback<M>,
  ): Unsubscribe {
    const isFirstDataSubscription = !internalDoc.hasDataSubscriptions;
    const modelSubscriptions = this.getCreateCollectionSubscriptions(internalDoc, collection);
    const wasEmpty = isCollectionSubscriptionsEmpty(modelSubscriptions);

    (modelSubscriptions[changeType] ??= new Set()).add(callback);
    internalDoc.hasDataSubscriptions = true;

    // Trigger remote load if this is the first data subscription and not yet loaded
    if (isFirstDataSubscription && internalDoc.dataStatus.load === DocumentLoadStatus.UNLOADED) {
      // Call lifecycle method without awaiting
      this.onDataSubscriptionOpened(internalDoc, internalDocRef);
    }

    // Set up Y.Map listener if this is the first subscription for this collection
    if (wasEmpty) {
      this.setupCollectionListener(internalDoc, collection);
    }

    return () => {
      modelSubscriptions[changeType]?.delete(callback);

      const currentDoc = this.documents.get(collection.docRef.id);
      if (!currentDoc) return;

      const storageName = getMetadata(collection.model).name;
      this.cleanupCollectionListenerIfUnused(currentDoc, collection.docRef.id, storageName);

      const hasDataSubs = currentDoc.docStateSubscribers.size > 0
        || currentDoc.recordSubscriptions.size > 0
        || Array.from(currentDoc.collectionSubscriptions.values()).some(subs =>
          subs.added?.size || subs.changed?.size || subs.deleted?.size
        );

      if (!hasDataSubs) {
        currentDoc.hasDataSubscriptions = false;
        this.onDataSubscriptionClosed(currentDoc, internalDocRef);
      }
    };
  }

  private setupCollectionListener<M extends Model>(
    internalDoc: TDoc,
    collection: RecordCollectionRef<M>,
  ): void {
    const docId = collection.docRef.id;
    const storageName = getMetadata(collection.model).name;
    const yCollection = internalDoc.yDoc.getMap(storageName);

    this.logger.debug("Setting up collection listener", {
      docId,
      storageName,
      existingKeys: Array.from(yCollection.keys()),
      allDocMaps: Array.from(internalDoc.yDoc.share.keys()),
    });

    // TODO: tidy this up
    const eventHandler = (events: readonly Y.YEvent<Y.Map<unknown>>[]) => {
      this.logger.debug("Y.Map observeDeep fired", {
        docId,
        storageName,
        eventCount: events.length,
      });

      const currentDoc = this.documents.get(docId);
      if (!currentDoc) return;

      const subs = currentDoc.collectionSubscriptions.get(storageName);
      if (!subs) return;

      const addedKeys = new Set<string>();
      const changedKeys = new Set<string>();
      const deletedKeys = new Set<string>();

      for (const event of events) {
        // Shallow change, ie the collection itself was modified
        if (event.target === yCollection) {
          // Collection-level change (add/remove/replace keys in collection)
          for (const [key, change] of event.changes.keys) {
            switch (change.action) {
              case "add":
                addedKeys.add(key);
                break;
              case "update": // this is a replacement within the map
                changedKeys.add(key);
                break;
              case "delete":
                deletedKeys.add(key);
                break;
            }
          }
        } else {
          // Nested change (property change within a record)
          // path[0] is the record ID since path is relative to currentTarget (yCollection)
          const recordId = event.path[0];
          if (recordId != null) {
            changedKeys.add(recordId as string);
          }
        }
      }

      // Notify subscribers
      if (addedKeys.size > 0) {
        const addedRecords = Array.from(addedKeys).map(id =>
          this.getCreateRecordRef(collection.docRef, id, collection.model)
        );

        if (subs.added != null) {
          for (const callback of subs.added) {
            callback(addedRecords);
          }
        }

        for (const record of addedRecords) {
          this.notifyRecordSubscribers(record, "changed");
        }
      }

      if (changedKeys.size > 0) {
        const changedRecords = Array.from(changedKeys).map(id =>
          this.getCreateRecordRef(collection.docRef, id, collection.model)
        );

        if (subs.changed != null) {
          for (const callback of subs.changed) {
            callback(changedRecords);
          }
        }

        for (const record of changedRecords) {
          this.notifyRecordSubscribers(record, "changed");
        }
      }

      if (deletedKeys.size > 0) {
        const deletedRecords = Array.from(deletedKeys).map(id =>
          this.getCreateRecordRef(collection.docRef, id, collection.model)
        );

        if (subs.deleted?.size) {
          for (const callback of subs.deleted) {
            callback(deletedRecords);
          }
        }

        for (const record of deletedRecords) {
          this.notifyRecordSubscribers(record, "deleted");
        }
      }
    };

    yCollection.observeDeep(eventHandler);

    // Store the handler for cleanup
    internalDoc.yjsCollectionHandlers.set(storageName, () => {
      yCollection.unobserveDeep(eventHandler);
    });
  }

  private cleanupCollectionListener(docId: DocumentId, storageName: string): void {
    const internalDoc = this.documents.get(docId);
    if (internalDoc == null) {
      return;
    }

    const cleanup = internalDoc.yjsCollectionHandlers.get(storageName);
    if (cleanup != null) {
      cleanup();
      internalDoc.yjsCollectionHandlers.delete(storageName);
    }
  }

  private cleanupCollectionListenerIfUnused(
    internalDoc: TDoc,
    docId: DocumentId,
    storageName: string,
  ): void {
    const collectionSubs = internalDoc.collectionSubscriptions.get(storageName);
    const hasCollectionSubs = collectionSubs != null
      && (collectionSubs.added?.size || collectionSubs.changed?.size
        || collectionSubs.deleted?.size);

    const hasRecordSubs = Array.from(internalDoc.recordSubscriptions.values()).some(
      recordSubs =>
        getMetadata(recordSubs.ref.model).name === storageName
        && (!isRecordSubscriptionsEmpty(recordSubs)),
    );

    if (!hasCollectionSubs && !hasRecordSubs) {
      this.cleanupCollectionListener(docId, storageName);
      if (collectionSubs != null) {
        internalDoc.collectionSubscriptions.delete(storageName);
      }
    }
  }

  // DocumentService status methods implementation
  readonly getDocumentStatus = <T extends DocumentSchema>(
    docRef: DocumentRef<T>,
  ): DocumentStatus => {
    const { internalDoc } = this.getCreateInternalDoc(docRef);
    return {
      metadata: internalDoc.metadataStatus,
      data: internalDoc.dataStatus,
      metadataError: internalDoc.metadataError,
      dataError: internalDoc.dataError,
    };
  };

  readonly onStatusChange = <T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    callback: DocumentStatusChangeCallback,
  ): Unsubscribe => {
    const { internalDoc } = this.getCreateInternalDoc(docRef);
    internalDoc.statusSubscribers.add(callback);

    // Call callback immediately with current status
    const status: DocumentStatus = {
      metadata: internalDoc.metadataStatus,
      data: internalDoc.dataStatus,
      metadataError: internalDoc.metadataError,
      dataError: internalDoc.dataError,
    };
    callback(docRef, status);

    return () => {
      const currentDoc = this.documents.get(docRef.id);
      if (currentDoc) {
        currentDoc.statusSubscribers.delete(callback);
      }
    };
  };

  readonly waitForMetadataLoad = async <T extends DocumentSchema>(
    docRef: DocumentRef<T>,
  ): Promise<void> => {
    const { internalDoc } = this.getCreateInternalDoc(docRef);

    if (internalDoc.metadataStatus.load === DocumentLoadStatus.LOADED) {
      return Promise.resolve();
    }

    if (internalDoc.metadataStatus.load === DocumentLoadStatus.ERROR) {
      return Promise.reject(new Error("Metadata load error", { cause: internalDoc.metadataError }));
    }

    // Wait for status to change to LOADED or ERROR
    return new Promise((resolve, reject) => {
      const unsubscribe = this.onStatusChange(docRef, (_, status) => {
        if (status.metadata.load === DocumentLoadStatus.LOADED) {
          unsubscribe();
          resolve();
        } else if (status.metadata.load === DocumentLoadStatus.ERROR) {
          unsubscribe();
          reject(new Error("Metadata load error", { cause: status.metadataError }));
        }
      });
    });
  };

  readonly waitForDataLoad = async <T extends DocumentSchema>(
    docRef: DocumentRef<T>,
  ): Promise<void> => {
    const { internalDoc } = this.getCreateInternalDoc(docRef);

    if (internalDoc.dataStatus.load === DocumentLoadStatus.LOADED) {
      return Promise.resolve();
    }

    if (internalDoc.dataStatus.load === DocumentLoadStatus.ERROR) {
      return Promise.reject(new Error("Data load error", { cause: internalDoc.dataError }));
    }

    // Wait for status to change to LOADED or ERROR
    return new Promise((resolve, reject) => {
      const unsubscribe = this.onStatusChange(docRef, (_, status) => {
        if (status.data.load === DocumentLoadStatus.LOADED) {
          unsubscribe();
          resolve();
        } else if (status.data.load === DocumentLoadStatus.ERROR) {
          unsubscribe();
          reject(new Error("Data load error", { cause: status.dataError }));
        }
      });
    });
  };

  // FIXME: don't expose in production builds
  /**
   * @internal
   */
  public getYDocForTesting(docId: DocumentId): Y.Doc | null {
    const internalDoc = this.documents.get(docId);
    return internalDoc ? internalDoc.yDoc : null;
  }
}

function isCollectionSubscriptionsEmpty<M extends Model>(
  subs: RecordCollectionSubscriptions<M>,
): boolean {
  return (
    !subs.added?.size
    && !subs.changed?.size
    && !subs.deleted?.size
  );
}

function isRecordSubscriptionsEmpty<M extends Model>(
  subs: RecordSubscribers<M>,
): boolean {
  return (
    !subs.changed?.size
    && !subs.deleted?.size
  );
}
