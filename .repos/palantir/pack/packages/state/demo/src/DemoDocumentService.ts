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

import type { PackAppInternal, Unsubscribe } from "@palantir/pack.core";
import { generateId, getOntologyRid } from "@palantir/pack.core";
import type {
  ActivityEvent,
  ActivityEventId,
  DocumentId,
  DocumentMetadata,
  DocumentRef,
  DocumentSchema,
  EditDescription,
  Model,
  ModelData,
  PresenceEvent,
  PresencePublishOptions,
  UserId,
} from "@palantir/pack.document-schema.model-types";
import {
  ActivityEventDataType,
  getMetadata,
  hasMetadata,
} from "@palantir/pack.document-schema.model-types";
import type {
  CreateDocumentMetadata,
  InternalYjsDoc,
  SearchDocumentsResult,
} from "@palantir/pack.state.core";
import {
  BaseYjsDocumentService,
  createDocRef,
  DocumentLiveStatus,
  DocumentLoadStatus,
} from "@palantir/pack.state.core";
import { Base64 } from "js-base64";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { MetadataStore } from "./MetadataStore.js";
import { PresenceManager } from "./PresenceManager.js";

const EMPTY_DOCUMENT_SECURITY = Object.freeze({
  discretionary: {},
  mandatory: {},
});

const CLIENT_ID_STORAGE_KEY = "pack-demo-client-id";

function getOrCreateClientId(): string {
  try {
    const storedId = sessionStorage.getItem(CLIENT_ID_STORAGE_KEY);

    if (storedId != null) {
      return storedId;
    }

    const newId = crypto.randomUUID();

    sessionStorage.setItem(CLIENT_ID_STORAGE_KEY, newId);

    return newId;
  } catch {
    return crypto.randomUUID();
  }
}

export interface DemoDocumentServiceOptions {
  readonly dbPrefix?: string;
  readonly clearOnInit?: boolean;
}

interface DemoInternalDoc extends InternalYjsDoc {
  channel?: BroadcastChannel;
  presenceManager?: PresenceManager;
  provider?: IndexeddbPersistence;
  updateHandler?: (update: Uint8Array, origin: unknown) => void;
}

export class DemoDocumentService extends BaseYjsDocumentService<DemoInternalDoc> {
  private readonly clientId: string;
  private readonly dbPrefix: string;
  private readonly metadataStore: MetadataStore;

  constructor(app: PackAppInternal, options: DemoDocumentServiceOptions = {}) {
    super(app, app.config.logger.child({}, { level: "debug", msgPrefix: "DemoDocumentService" }), {
      isDemo: true,
    });

    this.clientId = getOrCreateClientId();
    this.dbPrefix = options.dbPrefix ?? "pack-demo";
    this.metadataStore = new MetadataStore(this.dbPrefix);
  }

  override createInternalDoc(
    ref: DocumentRef,
    metadata?: DocumentMetadata,
  ): DemoInternalDoc {
    const internalDoc = this.createBaseInternalDoc(ref, metadata) as DemoInternalDoc;
    this.ensureUpdateHandler(internalDoc, ref);
    return internalDoc;
  }

  private ensureUpdateHandler(internalDoc: DemoInternalDoc, docRef: DocumentRef): void {
    if (internalDoc.updateHandler) {
      return;
    }

    const channel = new BroadcastChannel(`pack-demo-doc-${docRef.id}`);
    internalDoc.channel = channel;

    const updateHandler = (update: Uint8Array, origin: unknown) => {
      if (origin === "remote") return;

      if (isEditDescription(origin)) {
        if (!internalDoc.presenceManager) {
          internalDoc.presenceManager = new PresenceManager(
            docRef.id,
            this.clientId,
            docRef.schema,
          );
        }

        const modelName = getMetadata(origin.model).name;
        const event: ActivityEvent = {
          aggregationKey: `${docRef.id}-${modelName}`,
          createdBy: this.clientId as UserId,
          createdInstant: Date.now(),
          eventData: {
            eventData: origin.data,
            model: origin.model,
            type: ActivityEventDataType.CUSTOM_EVENT,
          },
          eventId: generateId() as ActivityEventId,
          isRead: false,
        };

        internalDoc.presenceManager.broadcastActivity(event);
      }

      channel.postMessage({
        type: "update",
        data: Base64.fromUint8Array(update),
      });
    };

    internalDoc.yDoc.on("update", updateHandler);
    internalDoc.updateHandler = updateHandler;

    channel.onmessage = event => {
      if (event.data.type === "update") {
        const update = Base64.toUint8Array(event.data.data);
        Y.applyUpdate(internalDoc.yDoc, update, "remote");
      }
    };
  }

  get hasMetadataSubscriptions(): boolean {
    return Array.from(this.documents.values()).some(
      doc => this.hasSubscriptions(doc) && doc.metadataSubscribers.size > 0,
    );
  }

  get hasStateSubscriptions(): boolean {
    return Array.from(this.documents.values()).some(
      doc => this.hasSubscriptions(doc) && doc.docStateSubscribers.size > 0,
    );
  }

  readonly createDocument = async <T extends DocumentSchema>(
    { documentTypeName, name, security = EMPTY_DOCUMENT_SECURITY }: CreateDocumentMetadata,
    schema: T,
  ): Promise<DocumentRef<T>> => {
    await this.metadataStore.whenReady();
    const ontologyRid = await getOntologyRid(this.app);

    const id = generateDocumentId();
    const docRef = createDocRef(this.app, id, schema);

    const metadata: DocumentMetadata = {
      documentTypeName,
      name,
      ontologyRid,
      security, // TODO: may want to add in auth.getUserId() as owner here
    };

    this.metadataStore.addDocument(id, metadata);

    const yDoc = this.initializeYDoc(schema);
    this.getCreateInternalDoc(docRef, metadata, yDoc);

    return docRef;
  };

  readonly searchDocuments = async <T extends DocumentSchema>(
    documentTypeName: string,
    schema: T,
    options?: {
      documentName?: string;
      pageSize?: number;
      pageToken?: string;
    },
  ): Promise<SearchDocumentsResult> => {
    await this.metadataStore.whenReady();
    return this.metadataStore.searchDocuments(documentTypeName, options);
  };

  protected onMetadataSubscriptionOpened(
    internalDoc: DemoInternalDoc,
    docRef: DocumentRef,
  ): void {
    this.updateMetadataStatus(internalDoc, docRef, {
      load: DocumentLoadStatus.LOADING,
    });

    this.metadataStore.whenReady().then(() => {
      const metadata = this.metadataStore.getDocument(docRef.id);

      if (metadata == null) {
        this.updateMetadataStatus(internalDoc, docRef, {
          error: new Error("Document not found"),
          load: DocumentLoadStatus.ERROR,
        });
        return;
      }

      internalDoc.metadata = metadata;

      const unobserve = this.metadataStore.observeDocument(docRef.id, updatedMetadata => {
        if (updatedMetadata != null) {
          internalDoc.metadata = updatedMetadata;
          this.notifyMetadataSubscribers(internalDoc, docRef, updatedMetadata);
        }
      });

      this.updateMetadataStatus(internalDoc, docRef, {
        load: DocumentLoadStatus.LOADED,
      });
    }).catch((error: unknown) => {
      this.updateMetadataStatus(internalDoc, docRef, {
        error,
        load: DocumentLoadStatus.ERROR,
      });
    });
  }

  protected onDataSubscriptionOpened(
    internalDoc: DemoInternalDoc,
    docRef: DocumentRef,
  ): void {
    this.updateDataStatus(internalDoc, docRef, {
      load: DocumentLoadStatus.LOADING,
      live: DocumentLiveStatus.CONNECTING,
    });

    try {
      // Ensure update handler is set up (may already be done in createInternalDoc)
      this.ensureUpdateHandler(internalDoc, docRef);

      // Set up persistence
      if (!internalDoc.provider) {
        const provider = new IndexeddbPersistence(
          `${this.dbPrefix}-doc-${docRef.id}`,
          internalDoc.yDoc,
        );
        internalDoc.provider = provider;

        provider.whenSynced.then(() => {
          this.updateDataStatus(internalDoc, docRef, {
            load: DocumentLoadStatus.LOADED,
            live: DocumentLiveStatus.CONNECTED,
          });
        }).catch((error: unknown) => {
          this.updateDataStatus(internalDoc, docRef, {
            error,
            load: DocumentLoadStatus.ERROR,
            live: DocumentLiveStatus.ERROR,
          });
        });
      } else {
        // Provider already exists, just update status
        this.updateDataStatus(internalDoc, docRef, {
          load: DocumentLoadStatus.LOADED,
          live: DocumentLiveStatus.CONNECTED,
        });
      }
    } catch (error) {
      this.updateDataStatus(internalDoc, docRef, {
        error,
        load: DocumentLoadStatus.ERROR,
        live: DocumentLiveStatus.ERROR,
      });
    }
  }

  protected onMetadataSubscriptionClosed(
    _internalDoc: DemoInternalDoc,
    _docRef: DocumentRef,
  ): void {
  }

  protected onDataSubscriptionClosed(
    internalDoc: DemoInternalDoc,
    _docRef: DocumentRef,
  ): void {
    if (internalDoc.updateHandler) {
      internalDoc.yDoc.off("update", internalDoc.updateHandler);
      internalDoc.updateHandler = undefined;
    }

    if (internalDoc.channel) {
      internalDoc.channel.close();
      internalDoc.channel = undefined;
    }

    if (internalDoc.provider) {
      void internalDoc.provider.destroy();
      internalDoc.provider = undefined;
    }

    if (internalDoc.presenceManager) {
      internalDoc.presenceManager.dispose();
      internalDoc.presenceManager = undefined;
    }
  }

  onActivity<T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    callback: (docRef: DocumentRef<T>, event: ActivityEvent) => void,
  ): Unsubscribe {
    const { internalDoc } = this.getCreateInternalDoc(docRef);

    if (!internalDoc.presenceManager) {
      internalDoc.presenceManager = new PresenceManager(docRef.id, this.clientId, docRef.schema);
    }

    const unsubscribe = internalDoc.presenceManager.onActivity(event => {
      callback(docRef, event);
    });

    return () => {
      unsubscribe();
    };
  }

  onPresence<T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    callback: (docRef: DocumentRef<T>, event: PresenceEvent) => void,
  ): Unsubscribe {
    const { internalDoc } = this.getCreateInternalDoc(docRef);

    if (!internalDoc.presenceManager) {
      internalDoc.presenceManager = new PresenceManager(docRef.id, this.clientId, docRef.schema);
    }

    const unsubscribe = internalDoc.presenceManager.onPresence(event => {
      callback(docRef, event);
    });

    return () => {
      unsubscribe();
    };
  }

  updateCustomPresence<M extends Model>(
    docRef: DocumentRef,
    model: M,
    eventData: ModelData<M>,
    _options?: PresencePublishOptions,
  ): void {
    const { internalDoc } = this.getCreateInternalDoc(docRef);

    if (!internalDoc.presenceManager) {
      internalDoc.presenceManager = new PresenceManager(docRef.id, this.clientId, docRef.schema);
    }

    const event: PresenceEvent = {
      eventData: {
        eventData,
        model,
        type: ActivityEventDataType.CUSTOM_EVENT,
      },
      userId: this.clientId as UserId,
    };

    internalDoc.presenceManager.broadcastPresence(event);
  }
}

function generateDocumentId(): DocumentId {
  return generateId() as DocumentId;
}

function isEditDescription(obj: unknown): obj is EditDescription {
  return (
    obj != null
    && typeof obj === "object"
    && "data" in obj
    && "model" in obj
    && typeof obj.model === "object"
    && obj.model != null
    && hasMetadata(obj.model)
  );
}
