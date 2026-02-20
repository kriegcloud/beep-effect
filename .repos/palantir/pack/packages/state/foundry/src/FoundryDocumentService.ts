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

import type {
  CreateDocumentRequest,
  DiscretionaryPrincipal,
  DiscretionaryPrincipal as WireDiscretionaryPrincipal,
  DocumentSecurity as WireDocumentSecurity,
  SearchDocumentsRequest,
} from "@osdk/foundry.pack";
import { Documents } from "@osdk/foundry.pack";
import {
  assertNever,
  getOntologyRid,
  type ModuleConfigTuple,
  type PackAppInternal,
  type Unsubscribe,
} from "@palantir/pack.core";
import type {
  ActivityEvent,
  DocumentId,
  DocumentMetadata,
  DocumentRef,
  DocumentSchema,
  DocumentSecurity,
  Model,
  ModelData,
  PresenceEvent,
  PresencePublishOptions,
  PresenceSubscriptionOptions,
} from "@palantir/pack.document-schema.model-types";
import { getMetadata } from "@palantir/pack.document-schema.model-types";
import type {
  CreateDocumentMetadata,
  DocumentService,
  InternalYjsDoc,
  SearchDocumentsResult,
} from "@palantir/pack.state.core";
import {
  BaseYjsDocumentService,
  createDocumentServiceConfig,
  DocumentLoadStatus,
} from "@palantir/pack.state.core";
import type { FoundryEventService, SyncSession } from "@palantir/pack.state.foundry-event";
import { createFoundryEventService } from "@palantir/pack.state.foundry-event";
import { getActivityEvent, getPresenceEvent } from "./eventMappers.js";

const DEFAULT_USE_PREVIEW_API = true;
const EMPTY_DOCUMENT_SECURITY: DocumentSecurity = Object.freeze({
  discretionary: {},
  mandatory: {},
});

interface FoundryDocumentServiceConfig {
  readonly usePreviewApi?: boolean;
}

export function createFoundryDocumentServiceConfig(
  config: FoundryDocumentServiceConfig = {},
): ModuleConfigTuple<DocumentService> {
  return createDocumentServiceConfig(
    (app: PackAppInternal, config: FoundryDocumentServiceConfig) =>
      internalCreateFoundryDocumentService(app, config),
    config,
  );
}

export function internalCreateFoundryDocumentService(
  app: PackAppInternal,
  config: FoundryDocumentServiceConfig,
  eventService?: FoundryEventService,
): FoundryDocumentService {
  return new FoundryDocumentService(
    app,
    config,
    eventService ?? createFoundryEventService(app),
  );
}

interface FoundryInternalDoc extends InternalYjsDoc {
  syncSession?: SyncSession;
}

export class FoundryDocumentService extends BaseYjsDocumentService<FoundryInternalDoc> {
  constructor(
    app: PackAppInternal,
    readonly config: FoundryDocumentServiceConfig,
    readonly eventService: FoundryEventService,
  ) {
    super(
      app,
      app.config.logger.child(
        {},
        { level: "debug", msgPrefix: "FoundryDocumentService" },
      ),
    );
  }

  protected createInternalDoc(
    ref: DocumentRef,
    metadata: DocumentMetadata | undefined,
  ): FoundryInternalDoc {
    return {
      ...this.createBaseInternalDoc(ref, metadata),
      syncSession: undefined,
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
    metadata: CreateDocumentMetadata,
    schema: T,
  ): Promise<DocumentRef<T>> => {
    const { documentTypeName, name, parentFolderRid, security } = metadata;
    const ontologyRid = await getOntologyRid(this.app);

    const request: CreateDocumentRequest = {
      documentTypeName: documentTypeName,
      name: name,
      ontologyRid: ontologyRid,
      security: getWireSecurity(security),
    };

    if (parentFolderRid != null) {
      request.parentFolderRid = parentFolderRid;
    }

    const createResponse = await Documents.create(
      this.app.config.osdkClient,
      request,
      {
        preview: this.config.usePreviewApi ?? DEFAULT_USE_PREVIEW_API,
      },
    );

    const documentId = createResponse.id as DocumentId;
    const docRef = this.createDocRef(documentId, schema);
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
    const request: SearchDocumentsRequest = {
      documentTypeName,
      requestBody: {
        query: options?.documentName != null ? { documentName: options.documentName } : undefined,
        pageSize: options?.pageSize,
        pageToken: options?.pageToken,
      },
    };

    const searchResponse = await Documents.search(
      this.app.config.osdkClient,
      request,
      {
        preview: this.config.usePreviewApi ?? DEFAULT_USE_PREVIEW_API,
      },
    );

    return {
      data: searchResponse.data.map(doc => ({
        createdBy: doc.createdBy,
        createdTime: doc.createdTime,
        documentTypeName: doc.documentTypeName,
        id: doc.id as DocumentId,
        name: doc.name,
        ontologyRid: "unknown",
        security: { discretionary: { owners: [] }, mandatory: {} },
        updatedBy: doc.updatedBy,
        updatedTime: doc.updatedTime,
      })),
      nextPageToken: searchResponse.nextPageToken,
    };
  };

  protected onMetadataSubscriptionOpened(
    internalDoc: FoundryInternalDoc,
    docRef: DocumentRef,
  ): void {
    if (internalDoc.metadataStatus.load !== DocumentLoadStatus.UNLOADED) {
      throw new Error(
        `Cannot subscribe to document metadata when status is ${internalDoc.metadataStatus.load}`,
      );
    }

    this.updateMetadataStatus(internalDoc, docRef, {
      load: DocumentLoadStatus.LOADING,
    });

    Documents.get(this.app.config.osdkClient, docRef.id, {
      preview: this.config.usePreviewApi ?? DEFAULT_USE_PREVIEW_API,
    })
      .then(document => {
        const metadata: DocumentMetadata = {
          documentTypeName: document.documentTypeName,
          name: document.name,
          ontologyRid: document.ontologyRid,
          security: document.security,
        };

        internalDoc.metadata = metadata;
        this.notifyMetadataSubscribers(internalDoc, docRef, metadata);
        this.updateMetadataStatus(internalDoc, docRef, {
          load: DocumentLoadStatus.LOADED,
        });
      })
      .catch((e: unknown) => {
        const error = new Error("Failed to load document metadata", {
          cause: e,
        });
        this.updateMetadataStatus(internalDoc, docRef, {
          error,
          load: DocumentLoadStatus.ERROR,
        });
      });
  }

  protected onDataSubscriptionOpened(
    internalDoc: FoundryInternalDoc,
    docRef: DocumentRef,
  ): void {
    if (internalDoc.syncSession != null) {
      throw new Error("Document data subscription already opened");
    }

    internalDoc.syncSession = this.eventService.startDocumentSync(
      docRef.id,
      internalDoc.yDoc,
      status => {
        this.updateDataStatus(internalDoc, docRef, status);
      },
    );
  }

  protected onMetadataSubscriptionClosed(
    _internalDoc: FoundryInternalDoc,
    _docRef: DocumentRef,
  ): void {}

  protected onDataSubscriptionClosed(
    internalDoc: FoundryInternalDoc,
    _docRef: DocumentRef,
  ): void {
    if (internalDoc.syncSession) {
      this.eventService.stopDocumentSync(internalDoc.syncSession);
      internalDoc.syncSession = undefined;
    }
  }

  onActivity<T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    callback: (docRef: DocumentRef<T>, event: ActivityEvent) => void,
  ): Unsubscribe {
    let unsubscribed = false;
    const unsubscribeFn = () => {
      unsubscribed = true;
    };

    this.eventService
      .subscribeToActivityUpdates(docRef.id, foundryEvent => {
        if (!unsubscribed) {
          const localEvent = getActivityEvent(docRef.schema, foundryEvent);
          if (localEvent != null) {
            callback(docRef, localEvent);
          }
        }
      })
      .catch((e: unknown) => {
        this.logger.error("Failed to subscribe to activity updates", e, {
          docId: docRef.id,
        });
      });

    return unsubscribeFn;
  }

  onPresence<T extends DocumentSchema>(
    docRef: DocumentRef<T>,
    callback: (docRef: DocumentRef<T>, event: PresenceEvent) => void,
    options?: PresenceSubscriptionOptions,
  ): Unsubscribe {
    let unsubscribed = false;
    const unsubscribeFn = () => {
      unsubscribed = true;
    };

    this.eventService
      .subscribeToPresenceUpdates(
        docRef.id,
        foundryUpdate => {
          if (!unsubscribed) {
            const localEvent = getPresenceEvent(docRef.schema, foundryUpdate);
            callback(docRef, localEvent);
          }
        },
        options,
      )
      .catch((e: unknown) => {
        this.logger.error("Failed to subscribe to presence updates", e, {
          docId: docRef.id,
        });
      });

    return unsubscribeFn;
  }

  updateCustomPresence<M extends Model>(
    docRef: DocumentRef,
    model: M,
    eventData: ModelData<M>,
    options?: PresencePublishOptions,
  ): void {
    const eventType = getMetadata(model).name;

    void this.eventService
      .publishCustomPresence(docRef.id, eventType, eventData, options)
      .catch((e: unknown) => {
        this.logger.error("Failed to publish custom presence", e, {
          docId: docRef.id,
        });
      });
  }
}

function getWireSecurity({
  discretionary,
  mandatory,
}: DocumentSecurity = EMPTY_DOCUMENT_SECURITY): WireDocumentSecurity {
  const { editors = [], owners = [], viewers = [] } = discretionary;

  return {
    discretionary: {
      editors: editors.map(getWirePrincipal),
      owners: owners.map(getWirePrincipal),
      viewers: viewers.map(getWirePrincipal),
    },
    mandatory: {
      classification: mandatory.classification != null ? [...mandatory.classification] : [],
      markings: mandatory.markings != null ? [...mandatory.markings] : [],
    },
  };
}

function getWirePrincipal(
  principal: DiscretionaryPrincipal,
): WireDiscretionaryPrincipal {
  switch (principal.type) {
    case "all":
      return { type: "all" };
    case "groupId":
      return { type: "groupId", groupId: principal.groupId };
    case "userId":
      return { type: "userId", userId: principal.userId };
    default:
      assertNever(principal);
  }
}
