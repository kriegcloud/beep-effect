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

import type { ModuleKey, PackApp, PackAppInternal, Unsubscribe } from "@palantir/pack.core";
import { assertIsAppInternal } from "@palantir/pack.core";
import type {
  ActivityEvent,
  DocumentId,
  DocumentMetadata,
  DocumentRef,
  DocumentSchema,
  DocumentState,
  EditDescription,
  Model,
  ModelData,
  PresenceEvent,
  PresencePublishOptions,
  PresenceSubscriptionOptions,
  RecordCollectionRef,
  RecordId,
  RecordRef,
} from "@palantir/pack.document-schema.model-types";
import { DOCUMENT_SERVICE_MODULE_KEY } from "../DocumentServiceModule.js";
import type { CreateDocumentMetadata } from "./CreateDocumentMetadata.js";
import type {
  DocumentService,
  RecordChangeCallback,
  RecordCollectionChangeCallback,
  RecordDeleteCallback,
  SearchDocumentsResult,
} from "./DocumentService.js";

// Ensure state module is accessible on PackApp instances.
export const STATE_MODULE_ACCESSOR = "state";
export const STATE_MODULE_KEY: ModuleKey<StateModuleImpl> = {
  appMemberName: STATE_MODULE_ACCESSOR,
  key: Symbol.for("pack.state"),
  initModule: (app: PackAppInternal) => {
    const documentService = app.getModule(DOCUMENT_SERVICE_MODULE_KEY);
    return new StateModuleImpl(documentService);
  },
};
export type WithStateModule<T> = T & { readonly [STATE_MODULE_ACCESSOR]: StateModule };

export interface StateModule {
  readonly createDocRef: <const T extends DocumentSchema>(
    id: DocumentId,
    schema: T,
  ) => DocumentRef<T>;

  readonly createRecordRef: <const M extends Model>(
    docRef: DocumentRef,
    id: RecordId,
    model: M,
  ) => RecordRef<M>;

  readonly createDocument: <T extends DocumentSchema>(
    metadata: CreateDocumentMetadata,
    schema: T,
  ) => Promise<DocumentRef<T>>;

  readonly searchDocuments: <T extends DocumentSchema>(
    documentTypeName: string,
    schema: T,
    options?: {
      documentName?: string;
      pageSize?: number;
      pageToken?: string;
    },
  ) => Promise<SearchDocumentsResult>;

  readonly getDocumentSnapshot: <T extends DocumentSchema>(
    docRef: DocumentRef<T>,
  ) => Promise<DocumentState<T>>;

  readonly onActivity: <T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    callback: (docRef: DocumentRef<T>, event: ActivityEvent) => void,
  ) => Unsubscribe;

  readonly onMetadataChange: <T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    cb: (docRef: DocumentRef<T>, metadata: DocumentMetadata) => void,
  ) => Unsubscribe;

  readonly onPresence: <T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    callback: (docRef: DocumentRef<T>, event: PresenceEvent) => void,
    options?: PresenceSubscriptionOptions,
  ) => Unsubscribe;

  readonly onStateChange: <T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    cb: (docRef: DocumentRef<T>) => void,
  ) => Unsubscribe;

  readonly updateCustomPresence: <M extends Model>(
    docRef: DocumentRef,
    model: M,
    eventData: ModelData<M>,
    options?: PresencePublishOptions,
  ) => void;

  readonly getRecordSnapshot: <R extends Model>(
    recordRef: RecordRef<R>,
  ) => Promise<ModelData<R>>;

  readonly onCollectionItemsAdded: <M extends Model>(
    collection: RecordCollectionRef<M>,
    callback: RecordCollectionChangeCallback<M>,
  ) => Unsubscribe;

  readonly onCollectionItemsChanged: <M extends Model>(
    collection: RecordCollectionRef<M>,
    callback: RecordCollectionChangeCallback<M>,
  ) => Unsubscribe;

  readonly onCollectionItemsDeleted: <M extends Model>(
    collection: RecordCollectionRef<M>,
    callback: RecordCollectionChangeCallback<M>,
  ) => Unsubscribe;

  readonly setRecord: <R extends Model>(
    recordRef: RecordRef<R>,
    state: ModelData<R>,
  ) => Promise<void>;

  readonly updateRecord: <R extends Model>(
    recordRef: RecordRef<R>,
    partialState: Partial<ModelData<R>>,
  ) => Promise<void>;

  readonly withTransaction: (
    docRef: DocumentRef,
    fn: () => void,
    description?: EditDescription,
  ) => void;

  readonly onRecordChanged: <M extends Model>(
    record: RecordRef<M>,
    callback: RecordChangeCallback<M>,
  ) => Unsubscribe;

  readonly onRecordDeleted: <M extends Model>(
    record: RecordRef<M>,
    callback: RecordDeleteCallback<M>,
  ) => Unsubscribe;

  readonly deleteRecord: <M extends Model>(
    record: RecordRef<M>,
  ) => Promise<void>;

  // Status methods
  readonly getDocumentStatus: <T extends DocumentSchema>(
    docRef: DocumentRef<T>,
  ) => ReturnType<DocumentService["getDocumentStatus"]>;

  readonly onStatusChange: <T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    callback: Parameters<DocumentService["onStatusChange"]>[1],
  ) => Unsubscribe;

  readonly waitForMetadataLoad: <T extends DocumentSchema>(
    docRef: DocumentRef<T>,
  ) => Promise<void>;

  readonly waitForDataLoad: <T extends DocumentSchema>(
    docRef: DocumentRef<T>,
  ) => Promise<void>;
}

export class StateModuleImpl implements StateModule {
  constructor(
    private readonly documentService: DocumentService,
  ) {}

  createDocRef<const T extends DocumentSchema>(
    id: DocumentId,
    schema: T,
  ): DocumentRef<T> {
    return this.documentService.createDocRef(id, schema);
  }

  createRecordRef<const M extends Model>(
    docRef: DocumentRef,
    id: RecordId,
    model: M,
  ): RecordRef<M> {
    return this.documentService.getCreateRecordRef(docRef, id, model);
  }

  async createDocument<T extends DocumentSchema>(
    metadata: CreateDocumentMetadata,
    schema: T,
  ): Promise<DocumentRef<T>> {
    return this.documentService.createDocument(metadata, schema);
  }

  async searchDocuments<T extends DocumentSchema>(
    documentTypeName: string,
    schema: T,
    options?: {
      documentName?: string;
      pageSize?: number;
      pageToken?: string;
    },
  ): Promise<SearchDocumentsResult> {
    return this.documentService.searchDocuments(documentTypeName, schema, options);
  }

  async getDocumentSnapshot<T extends DocumentSchema>(
    docRef: DocumentRef<T>,
  ): Promise<DocumentState<T>> {
    return this.documentService.getDocumentSnapshot(docRef);
  }

  onActivity<T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    callback: (docRef: DocumentRef<T>, event: ActivityEvent) => void,
  ): Unsubscribe {
    return this.documentService.onActivity(docRef, callback);
  }

  onMetadataChange<T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    cb: (doc: DocumentRef<T>, metadata: DocumentMetadata) => void,
  ): Unsubscribe {
    return this.documentService.onMetadataChange(docRef, cb);
  }

  onPresence<T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    callback: (docRef: DocumentRef<T>, event: PresenceEvent) => void,
    options?: PresenceSubscriptionOptions,
  ): Unsubscribe {
    return this.documentService.onPresence(docRef, callback, options);
  }

  onStateChange<T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    cb: (docRef: DocumentRef<T>) => void,
  ): Unsubscribe {
    return this.documentService.onStateChange(docRef, cb);
  }

  updateCustomPresence<M extends Model>(
    docRef: DocumentRef,
    model: M,
    eventData: ModelData<M>,
    options?: PresencePublishOptions,
  ): void {
    this.documentService.updateCustomPresence(docRef, model, eventData, options);
  }

  async getRecordSnapshot<R extends Model>(
    recordRef: RecordRef<R>,
  ): Promise<ModelData<R>> {
    return this.documentService.getRecordSnapshot(recordRef);
  }

  async setRecord<R extends Model>(
    recordRef: RecordRef<R>,
    state: ModelData<R>,
  ): Promise<void> {
    return this.documentService.setRecord(recordRef, state);
  }

  async updateRecord<R extends Model>(
    recordRef: RecordRef<R>,
    partialState: Partial<ModelData<R>>,
  ): Promise<void> {
    return this.documentService.updateRecord(recordRef, partialState);
  }

  withTransaction(
    docRef: DocumentRef,
    fn: () => void,
    description?: EditDescription,
  ): void {
    this.documentService.withTransaction(docRef, fn, description);
  }

  // Collection methods
  getCreateRecordCollectionRef<M extends Model>(
    docRef: DocumentRef,
    model: M,
  ): RecordCollectionRef<M> {
    return this.documentService.getCreateRecordCollectionRef(docRef, model);
  }

  // FIXME: confusing vs createRecordRef
  getRecord<M extends Model>(
    collection: RecordCollectionRef<M>,
    id: RecordId,
  ): RecordRef<M> | undefined {
    return this.documentService.getRecord(collection, id);
  }

  hasRecord<M extends Model>(
    collection: RecordCollectionRef<M>,
    id: RecordId,
  ): boolean {
    return this.documentService.hasRecord(collection, id);
  }

  async setCollectionRecord<M extends Model>(
    collection: RecordCollectionRef<M>,
    id: RecordId,
    state: ModelData<M>,
  ): Promise<void> {
    return this.documentService.setCollectionRecord(collection, id, state);
  }

  getCollectionSize<M extends Model>(
    collection: RecordCollectionRef<M>,
  ): number {
    return this.documentService.getCollectionSize(collection);
  }

  getCollectionRecords<M extends Model>(
    collection: RecordCollectionRef<M>,
  ): RecordRef<M>[] {
    return this.documentService.getCollectionRecords(collection);
  }

  onRecordChanged<M extends Model>(
    record: RecordRef<M>,
    callback: RecordChangeCallback<M>,
  ): Unsubscribe {
    return this.documentService.onRecordChanged(record, callback);
  }

  onRecordDeleted<M extends Model>(
    record: RecordRef<M>,
    callback: RecordDeleteCallback<M>,
  ): Unsubscribe {
    return this.documentService.onRecordDeleted(record, callback);
  }

  onCollectionItemsAdded<M extends Model>(
    collection: RecordCollectionRef<M>,
    callback: RecordCollectionChangeCallback<M>,
  ): Unsubscribe {
    return this.documentService.onCollectionItemsAdded(collection, callback);
  }

  onCollectionItemsChanged<M extends Model>(
    collection: RecordCollectionRef<M>,
    callback: RecordCollectionChangeCallback<M>,
  ): Unsubscribe {
    return this.documentService.onCollectionItemsChanged(collection, callback);
  }

  onCollectionItemsDeleted<M extends Model>(
    collection: RecordCollectionRef<M>,
    callback: RecordCollectionChangeCallback<M>,
  ): Unsubscribe {
    return this.documentService.onCollectionItemsDeleted(collection, callback);
  }

  // Status methods implementation
  getDocumentStatus<T extends DocumentSchema>(
    docRef: DocumentRef<T>,
  ): ReturnType<DocumentService["getDocumentStatus"]> {
    return this.documentService.getDocumentStatus(docRef);
  }

  onStatusChange<T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    callback: Parameters<DocumentService["onStatusChange"]>[1],
  ): Unsubscribe {
    return this.documentService.onStatusChange(docRef, callback);
  }

  async waitForMetadataLoad<T extends DocumentSchema>(
    docRef: DocumentRef<T>,
  ): Promise<void> {
    return this.documentService.waitForMetadataLoad(docRef);
  }

  async waitForDataLoad<T extends DocumentSchema>(
    docRef: DocumentRef<T>,
  ): Promise<void> {
    return this.documentService.waitForDataLoad(docRef);
  }

  async deleteRecord<M extends Model>(
    record: RecordRef<M>,
  ): Promise<void> {
    return this.documentService.deleteRecord(record);
  }
}

export function getStateModule(app: PackApp | PackAppInternal): StateModule {
  assertIsAppInternal(app);
  return app.getModule(STATE_MODULE_KEY);
}
