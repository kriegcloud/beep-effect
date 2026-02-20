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

import type { ModuleConfigTuple, PackAppInternal, Unsubscribe } from "@palantir/pack.core";
import { generateId } from "@palantir/pack.core";
import type {
  ActivityEvent,
  DocumentId,
  DocumentMetadata,
  DocumentRef,
  DocumentSchema,
  Model,
  ModelData,
  PresenceEvent,
  PresencePublishOptions,
  PresenceSubscriptionOptions,
} from "@palantir/pack.document-schema.model-types";
import { createDocumentServiceConfig } from "../DocumentServiceModule.js";
import type { CreateDocumentMetadata } from "../types/CreateDocumentMetadata.js";
import { createDocRef } from "../types/DocumentRefImpl.js";
import type { DocumentService, SearchDocumentsResult } from "../types/DocumentService.js";
import { DocumentLoadStatus } from "../types/DocumentService.js";
import type { InternalYjsDoc } from "./BaseYjsDocumentService.js";
import { BaseYjsDocumentService } from "./BaseYjsDocumentService.js";

export interface InMemoryDocumentServiceOptions {
  /**
   * Automatically create documents when referenced
   * @default true
   */
  readonly autoCreateDocuments?: boolean;
}

export function createInMemoryDocumentServiceConfig(
  { autoCreateDocuments = true }: InMemoryDocumentServiceOptions = {},
): ModuleConfigTuple<DocumentService> {
  const config: InMemoryDocumentServiceOptions = {
    autoCreateDocuments,
  };

  return createDocumentServiceConfig(internalCreateInMemoryDocumentService, config);
}

export function internalCreateInMemoryDocumentService(
  app: PackAppInternal,
  options: InMemoryDocumentServiceOptions,
): BaseYjsDocumentService {
  return new InMemoryDocumentService(app, options);
}

class InMemoryDocumentService extends BaseYjsDocumentService {
  constructor(
    app: PackAppInternal,
    readonly config: InMemoryDocumentServiceOptions,
  ) {
    super(
      app,
      app.config.logger.child({}, { level: "debug", msgPrefix: "InMemoryDocumentService" }),
    );
  }

  override createInternalDoc(
    ref: DocumentRef,
    metadata?: DocumentMetadata,
  ): InternalYjsDoc {
    return this.createBaseInternalDoc(ref, metadata);
  }

  get hasMetadataSubscriptions() {
    return Array.from(this.documents.values()).some(doc =>
      this.hasSubscriptions(doc) && doc.metadataSubscribers.size > 0
    );
  }

  get hasStateSubscriptions() {
    return Array.from(this.documents.values()).some(doc =>
      this.hasSubscriptions(doc) && doc.docStateSubscribers.size > 0
    );
  }

  readonly createDocument = <T extends DocumentSchema>(
    metadata: CreateDocumentMetadata,
    schema: T,
  ): Promise<DocumentRef<T>> => {
    const id = generateDocumentId();
    const docRef = createDocRef(this.app, id, schema);

    const yDoc = this.initializeYDoc(schema);
    this.getCreateInternalDoc(docRef, metadata, yDoc);

    return Promise.resolve(docRef);
  };

  readonly searchDocuments = <T extends DocumentSchema>(
    documentTypeName: string,
    schema: T,
    options?: {
      documentName?: string;
      pageSize?: number;
      pageToken?: string;
    },
  ): Promise<SearchDocumentsResult> => {
    const results: Array<DocumentMetadata & { readonly id: DocumentId }> = [];
    const { documentName, pageSize } = options ?? {};

    for (const [docId, internalDoc] of this.documents.entries()) {
      if (internalDoc.metadata?.documentTypeName === documentTypeName) {
        if (documentName && !internalDoc.metadata.name.includes(documentName)) {
          continue;
        }
        results.push({
          ...internalDoc.metadata,
          id: docId as DocumentId,
        });

        if (pageSize && results.length >= pageSize) {
          break;
        }
      }
    }

    // In-memory service doesn't support pagination
    return Promise.resolve({ data: results, nextPageToken: undefined });
  };

  // Lifecycle method implementations
  protected onMetadataSubscriptionOpened(
    internalDoc: InternalYjsDoc,
    docRef: DocumentRef,
  ): void {
    this.updateMetadataStatus(internalDoc, docRef, {
      load: DocumentLoadStatus.LOADING,
    });

    if (this.config.autoCreateDocuments === false && internalDoc.metadata == null) {
      this.updateMetadataStatus(internalDoc, docRef, {
        error: new Error("Document not found and autoCreateDocuments is disabled"),
        load: DocumentLoadStatus.ERROR,
      });
      return;
    }

    this.updateMetadataStatus(internalDoc, docRef, {
      load: DocumentLoadStatus.LOADED,
    });
  }

  protected onDataSubscriptionOpened(
    internalDoc: InternalYjsDoc,
    docRef: DocumentRef,
  ): void {
    this.updateDataStatus(internalDoc, docRef, {
      load: DocumentLoadStatus.LOADING,
    });

    if (this.config.autoCreateDocuments === false && internalDoc.metadata == null) {
      this.updateDataStatus(internalDoc, docRef, {
        error: new Error("Document not found and autoCreateDocuments is disabled"),
        load: DocumentLoadStatus.ERROR,
      });
      return;
    }

    this.updateDataStatus(internalDoc, docRef, {
      load: DocumentLoadStatus.LOADED,
    });
  }

  protected onMetadataSubscriptionClosed(
    _internalDoc: InternalYjsDoc,
    _docRef: DocumentRef,
  ): void {
    // No cleanup needed for in-memory service
  }

  protected onDataSubscriptionClosed(
    _internalDoc: InternalYjsDoc,
    _docRef: DocumentRef,
  ): void {
    // No cleanup needed for in-memory service
  }

  onActivity<T extends DocumentSchema>(
    _docRef: DocumentRef<T>,
    _callback: (docRef: DocumentRef<T>, event: ActivityEvent) => void,
  ): Unsubscribe {
    return () => {};
  }

  onPresence<T extends DocumentSchema>(
    _docRef: DocumentRef<T>,
    _callback: (docRef: DocumentRef<T>, event: PresenceEvent) => void,
    _options?: PresenceSubscriptionOptions,
  ): Unsubscribe {
    return () => {};
  }

  updateCustomPresence<M extends Model>(
    _docRef: DocumentRef,
    _model: M,
    _eventData: ModelData<M>,
    _options?: PresencePublishOptions,
  ): void {
  }
}

function generateDocumentId(): DocumentId {
  return generateId() as DocumentId;
}
