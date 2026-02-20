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

import type { Logger } from "@osdk/api";
import type {
  ActivityCollaborativeUpdate,
  DocumentEditDescription,
  DocumentPublishMessage,
  DocumentUpdateMessage,
  DocumentUpdateSubscriptionRequest,
  PresenceCollaborativeUpdate,
  PresencePublishMessage,
} from "@osdk/foundry.pack";
import { getAuthModule } from "@palantir/pack.auth";
import { generateId, justOnce, type PackAppInternal } from "@palantir/pack.core";
import {
  type DocumentId,
  type EditDescription,
  getMetadata,
  hasMetadata,
} from "@palantir/pack.document-schema.model-types";
import { DocumentLoadStatus, type DocumentSyncStatus } from "@palantir/pack.state.core";
import { Base64 } from "js-base64";
import * as y from "yjs";
import { type CometDLoader, EventServiceCometD } from "./cometd/EventServiceCometD.js";
import type {
  EventService,
  SubscriptionId,
  TypedPublishChannelId,
  TypedReceiveChannelId,
} from "./types/EventService.js";

// TODO: replace with @osdk/foundry.pack types when they land.
export interface PresenceSubscriptionOptions {
  readonly ignoreSelfUpdates?: boolean;
}

export interface PresencePublishOptions {
  /**
   * If true (default), event is broadcast only and not persisted.
   * If false, event is persisted and replayed to new clients.
   *
   * @default true
   */
  readonly isEphemeral?: boolean;
}

const UPDATE_ORIGIN_REMOTE = "remote" as const;

const getDocumentUpdatesChannelId = (
  documentId: DocumentId,
): TypedReceiveChannelId<DocumentUpdateMessage> =>
  `/document/${documentId}/updates` as TypedReceiveChannelId<DocumentUpdateMessage>;

const getDocumentPublishChannelId = (
  documentId: DocumentId,
): TypedPublishChannelId<DocumentPublishMessage> =>
  `/document/${documentId}/publish` as TypedPublishChannelId<DocumentPublishMessage>;

const getDocumentActivityChannelId = (
  documentId: DocumentId,
): TypedReceiveChannelId<ActivityCollaborativeUpdate> =>
  `/document/${documentId}/activity` as TypedReceiveChannelId<ActivityCollaborativeUpdate>;

const getDocumentPresenceChannelId = (
  documentId: DocumentId,
): TypedReceiveChannelId<PresenceCollaborativeUpdate> =>
  `/document/${documentId}/presence` as TypedReceiveChannelId<PresenceCollaborativeUpdate>;

const getDocumentPresencePublishChannelId = (
  documentId: DocumentId,
): TypedPublishChannelId<PresencePublishMessage> =>
  `/document/${documentId}/presence-publish` as TypedPublishChannelId<PresencePublishMessage>;

export interface SyncSession {
  readonly clientId: string;
  readonly documentId: DocumentId;
}

interface SyncSessionInternal extends SyncSession {
  activitySubscriptionId?: SubscriptionId;
  documentSubscriptionId?: SubscriptionId;
  lastRevisionId?: number;
  localYDocUpdateHandler?: (update: Uint8Array, origin: unknown) => void;
  presenceSubscriptionId?: SubscriptionId;
  yDoc?: y.Doc;
}

/**
 * This manages event subscriptions and publishing of document related events via
 * our PACK Foundry backend's cometd service.
 */
export interface FoundryEventService {
  publishCustomPresence(
    documentId: DocumentId,
    eventType: string,
    eventData: unknown,
    options?: PresencePublishOptions,
  ): Promise<void>;

  startDocumentSync(
    documentId: DocumentId,
    yDoc: y.Doc,
    onStatusChange: (status: Partial<DocumentSyncStatus>) => void,
  ): SyncSession;

  stopDocumentSync(session: SyncSession): void;

  subscribeToActivityUpdates(
    documentId: DocumentId,
    callback: (event: ActivityCollaborativeUpdate) => void,
  ): Promise<SubscriptionId>;

  subscribeToPresenceUpdates(
    documentId: DocumentId,
    callback: (update: PresenceCollaborativeUpdate) => void,
    options?: PresenceSubscriptionOptions,
  ): Promise<SubscriptionId>;
}

class FoundryEventServiceImpl implements FoundryEventService {
  private readonly eventService: EventService;
  private readonly logger: Logger;
  private readonly sessions = new Map<string, SyncSessionInternal>();

  constructor(
    private readonly app: PackAppInternal,
    cometdLoader?: CometDLoader,
  ) {
    this.eventService = new EventServiceCometD(app, cometdLoader);
    this.logger = app.config.logger.child({}, {
      level: "debug",
      msgPrefix: "FoundryEventService",
    });
  }

  private getOrCreateSession(documentId: DocumentId, yDoc?: y.Doc): SyncSessionInternal {
    const sessionId = this.getSessionId(documentId);
    let session = this.sessions.get(sessionId);

    if (!session) {
      session = {
        activitySubscriptionId: undefined,
        clientId: crypto.randomUUID(),
        documentId,
        documentSubscriptionId: undefined,
        lastRevisionId: undefined,
        localYDocUpdateHandler: undefined,
        presenceSubscriptionId: undefined,
        yDoc,
      };
      this.sessions.set(sessionId, session);
    }

    return session;
  }

  startDocumentSync(
    documentId: DocumentId,
    yDoc: y.Doc,
    onStatusChange: (status: Partial<DocumentSyncStatus>) => void,
  ): SyncSession {
    const session = this.getOrCreateSession(documentId, yDoc);

    if (session.documentSubscriptionId != null) {
      throw new Error(`Document data sync already active for document ${documentId}`);
    }

    const localYDocUpdateHandler = (update: Uint8Array, origin: unknown) => {
      if (origin === UPDATE_ORIGIN_REMOTE) {
        return;
      }

      const lastRevisionId = session.lastRevisionId;
      if (lastRevisionId == null) {
        this.logger.error(
          "Cannot publish document update before initial load is complete. The local state will remain inconsistent.",
          { docId: documentId },
        );
        return;
      }

      const publishChannelId = getDocumentPublishChannelId(documentId);
      const editId = generateId();
      const description = isEditDescription(origin)
        ? createDocumentEditDescription(origin)
        : undefined;
      void this.eventService.publish(
        publishChannelId,
        {
          clientId: session.clientId,
          description,
          editId,
          yjsUpdate: {
            data: Base64.fromUint8Array(update),
          },
        },
      ).catch((error: unknown) => {
        this.logger.error("Failed to publish document update", error, {
          docId: documentId,
        });
      });
    };

    session.localYDocUpdateHandler = localYDocUpdateHandler;
    yDoc.on("update", localYDocUpdateHandler);

    onStatusChange({
      load: DocumentLoadStatus.LOADING,
    });

    const channelId = getDocumentUpdatesChannelId(documentId);

    this.eventService.subscribe(
      channelId,
      (message: DocumentUpdateMessage) => {
        if (session.localYDocUpdateHandler !== localYDocUpdateHandler) {
          return;
        }
        this.handleDocumentUpdateMessage(session, message, yDoc, onStatusChange);
      },
      () => ({
        clientId: session.clientId,
        lastRevisionId: session.lastRevisionId?.toString(),
      } satisfies DocumentUpdateSubscriptionRequest),
    ).then(subscriptionId => {
      if (session.localYDocUpdateHandler === localYDocUpdateHandler) {
        session.documentSubscriptionId = subscriptionId;
      } else {
        this.eventService.unsubscribe(subscriptionId);
        this.sessions.delete(this.getSessionId(documentId));
      }
    }).catch((e: unknown) => {
      if (session.localYDocUpdateHandler === localYDocUpdateHandler) {
        const error = new Error("Failed to setup document data subscription", { cause: e });
        onStatusChange({
          error,
          load: DocumentLoadStatus.ERROR,
        });
      } else {
        this.logger.warn("Document data subscription error after subscription was closed", {
          docId: documentId,
          error: e,
        });
      }
    });

    return {
      clientId: session.clientId,
      documentId: session.documentId,
    };
  }

  subscribeToActivityUpdates(
    documentId: DocumentId,
    callback: (event: ActivityCollaborativeUpdate) => void,
  ): Promise<SubscriptionId> {
    const session = this.getOrCreateSession(documentId);

    const channelId = getDocumentActivityChannelId(documentId);

    return this.eventService.subscribe(
      channelId,
      (event: ActivityCollaborativeUpdate) => {
        this.logger.debug("Received activity event", {
          docId: documentId,
          event,
        });
        callback(event);
      },
    ).then(subscriptionId => {
      session.activitySubscriptionId = subscriptionId;
      return subscriptionId;
    }).catch((e: unknown) => {
      this.logger.error("Failed to subscribe to activity updates", e, {
        docId: documentId,
      });
      throw new Error("Failed to subscribe to activity updates", { cause: e });
    });
  }

  subscribeToPresenceUpdates(
    documentId: DocumentId,
    callback: (update: PresenceCollaborativeUpdate) => void,
    options: PresenceSubscriptionOptions = {},
  ): Promise<SubscriptionId> {
    const { ignoreSelfUpdates = true } = options;
    const session = this.getOrCreateSession(documentId);

    const channelId = getDocumentPresenceChannelId(documentId);

    return this.eventService.subscribe(
      channelId,
      (update: PresenceCollaborativeUpdate) => {
        // TODO: api should provide clientId so we filter on our presence messages only,
        // but allow apps to decide what they do with same-user-different-client messages ie
        // from different tabs or devices.
        const localUserId = getAuthModule(this.app).getCurrentUser(true)?.userId;
        if (ignoreSelfUpdates && localUserId != null) {
          switch (update.type) {
            case "presenceChangeEvent":
              if (update.userId === localUserId) {
                return;
              }
              break;
            case "customPresenceEvent":
              if (update.userId === localUserId) {
                return;
              }
              break;
            default:
              update satisfies never;
              break;
          }
        }

        this.logger.debug("Received presence update", {
          docId: documentId,
          updateType: update.type,
        });
        callback(update);
      },
    ).then(subscriptionId => {
      session.presenceSubscriptionId = subscriptionId;
      return subscriptionId;
    }).catch((e: unknown) => {
      this.logger.error("Failed to subscribe to presence updates", e, {
        docId: documentId,
      });
      throw new Error("Failed to subscribe to presence updates", { cause: e });
    });
  }

  publishCustomPresence(
    documentId: DocumentId,
    eventType: string,
    eventData: unknown,
    options?: PresencePublishOptions,
  ): Promise<void> {
    const { isEphemeral = true } = options ?? {};
    const session = this.getOrCreateSession(documentId);
    const channelId = getDocumentPresencePublishChannelId(documentId);

    // TODO: maybe the session should hold userId
    // Though would need better reconnection handling to ensure userId doesn't change.
    const userId = getAuthModule(this.app).getCurrentUser(true)?.userId;
    if (userId == null) {
      throw new Error("Could not get current userId");
    }

    return this.eventService.publish(channelId, {
      clientId: session.clientId,
      // FIXME: why do we have to send this, we are authenticated
      eventData,
      eventType,
      isEphemeral,
      userId,
      type: "custom",
    }).catch((error: unknown) => {
      this.logger.error("Failed to publish custom presence", error, {
        docId: documentId,
      });
      throw error;
    });
  }

  stopDocumentSync(session: SyncSession): void {
    const sessionId = this.getSessionId(session.documentId);
    const internalSession = this.sessions.get(sessionId);

    if (internalSession == null) {
      this.logger.warn("Attempted to stop sync for unknown session", {
        documentId: session.documentId,
        clientId: session.clientId,
      });
      return;
    }

    if (internalSession.localYDocUpdateHandler != null) {
      internalSession.yDoc?.off("update", internalSession.localYDocUpdateHandler);
      internalSession.localYDocUpdateHandler = undefined;
    }

    if (internalSession.activitySubscriptionId) {
      this.eventService.unsubscribe(internalSession.activitySubscriptionId);
    }

    if (internalSession.presenceSubscriptionId) {
      this.eventService.unsubscribe(internalSession.presenceSubscriptionId);
    }

    if (internalSession.documentSubscriptionId) {
      this.eventService.unsubscribe(internalSession.documentSubscriptionId);
      this.sessions.delete(sessionId);
    }
  }

  private handleDocumentUpdateMessage(
    session: SyncSessionInternal,
    message: DocumentUpdateMessage,
    yDoc: y.Doc,
    onStatusChange: (status: Partial<DocumentSyncStatus>) => void,
  ): void {
    switch (message.type) {
      case "error":
        const { args, code, errorInstanceId } = message;
        this.logger.error("Received document update error message", {
          docId: session.documentId,
          code,
          errorInstanceId,
          args,
        });
        onStatusChange({
          error: new Error(`Subscription in error state [${errorInstanceId}]`, { cause: message }),
          load: DocumentLoadStatus.ERROR,
        });
        break;
      case "update":
        const { baseRevisionId, clientId, revisionId, update } = message;

        const data = update != null && typeof update.data === "string"
          ? Base64.toUint8Array(update.data)
          : undefined;

        const messageDetail = {
          baseRevisionId,
          clientId,
          revisionId,
          updateSize: data?.byteLength ?? 0,
        };

        // FIXME: the typescript generators for api types come out as string, hard to be clear that they are numbers.
        if (session.lastRevisionId != null && Number(baseRevisionId) !== session.lastRevisionId) {
          this.logger.error("Got unexpected update for baseRevisionId", {
            docId: session.documentId,
            lastRevisionId: session.lastRevisionId,
            message: messageDetail,
          });
          return;
        }

        this.logger.debug("Applying remote Y.js update", {
          docId: session.documentId,
          lastRevisionId: session.lastRevisionId,
          message: messageDetail,
        });

        session.lastRevisionId = Number(revisionId);
        if (data != null) {
          y.applyUpdate(yDoc, data, UPDATE_ORIGIN_REMOTE);
        }

        onStatusChange({
          load: DocumentLoadStatus.LOADED,
        });

        break;
      default:
        message satisfies never;
        const { type } = message as { type: string };
        justOnce(`unknown-collab-update-type:${type}`, () => {
          this.logger.warn(
            "Received unknown DocumentUpdateMessage type. This is only warned the first occurrence.",
            {
              docId: session.documentId,
              updateType: type,
            },
          );
        });
        break;
    }
  }

  private getSessionId(documentId: DocumentId): string {
    return documentId;
  }
}

export function createFoundryEventService(
  app: PackAppInternal,
  /** @internal */
  cometdLoader?: CometDLoader,
): FoundryEventService {
  return new FoundryEventServiceImpl(app, cometdLoader);
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

function createDocumentEditDescription(editDescription: EditDescription): DocumentEditDescription {
  return {
    eventData: {
      data: editDescription.data,
      version: 1,
    },
    eventType: getMetadata(editDescription.model).name,
  };
}
