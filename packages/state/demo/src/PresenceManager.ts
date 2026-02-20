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
  ActivityEvent,
  DocumentId,
  DocumentSchema,
  Model,
  PresenceEvent,
  PresenceEventDataType,
  UserId,
} from "@palantir/pack.document-schema.model-types";
import { getMetadata, hasMetadata } from "@palantir/pack.document-schema.model-types";

const HEARTBEAT_INTERVAL_MS = 5000;
const STALE_CLIENT_TIMEOUT_MS = 15000;

type SerializableActivityEvent = Omit<ActivityEvent, "eventData"> & {
  readonly eventData:
    | { readonly type: "customEvent"; readonly eventData: unknown; readonly modelName: string }
    | ActivityEvent["eventData"];
};

type PresenceChannelMessage =
  | { readonly type: "heartbeat"; readonly userId: string; readonly timestamp: number }
  | {
    readonly type: "presence";
    readonly userId: string;
    readonly event: SerializablePresenceEvent;
  };

type ActivityChannelMessage = {
  readonly type: "activity";
  readonly userId: string;
  readonly event: SerializableActivityEvent;
};

type SerializablePresenceEvent = Omit<PresenceEvent, "eventData"> & {
  readonly eventData:
    | { readonly type: "customEvent"; readonly eventData: unknown; readonly modelName: string }
    | PresenceEvent["eventData"];
};

export class PresenceManager {
  private readonly activityChannel: BroadcastChannel;
  private readonly presenceChannel: BroadcastChannel;
  private readonly schema?: DocumentSchema;
  private readonly userId: UserId;
  private readonly activeClients = new Map<UserId, number>();
  private heartbeatInterval?: number;
  private staleCheckInterval?: number;
  private presenceCallbacks = new Set<(event: PresenceEvent) => void>();
  private activityCallbacks = new Set<(event: ActivityEvent) => void>();

  constructor(documentId: DocumentId, userId: string, schema?: DocumentSchema) {
    this.userId = userId as UserId;
    this.schema = schema;
    this.activityChannel = new BroadcastChannel(`pack-demo-activity-${documentId}`);
    this.presenceChannel = new BroadcastChannel(`pack-demo-presence-${documentId}`);

    this.activityChannel.onmessage = event => {
      this.handleActivityMessage(event.data as ActivityChannelMessage);
    };

    this.presenceChannel.onmessage = event => {
      this.handlePresenceMessage(event.data as PresenceChannelMessage);
    };

    this.startHeartbeat();
    this.startStaleCheck();
  }

  onPresence(callback: (event: PresenceEvent) => void): () => void {
    this.presenceCallbacks.add(callback);
    return () => {
      this.presenceCallbacks.delete(callback);
    };
  }

  onActivity(callback: (event: ActivityEvent) => void): () => void {
    this.activityCallbacks.add(callback);
    return () => {
      this.activityCallbacks.delete(callback);
    };
  }

  broadcastActivity(event: ActivityEvent): void {
    const serializableEvent: SerializableActivityEvent = {
      ...event,
      eventData: event.eventData.type === "customEvent"
        ? {
          eventData: event.eventData.eventData,
          modelName: getMetadata(event.eventData.model).name,
          type: "customEvent",
        }
        : event.eventData,
    };

    const message: ActivityChannelMessage = {
      event: serializableEvent,
      type: "activity",
      userId: this.userId,
    };
    this.activityChannel.postMessage(message);
  }

  broadcastPresence(event: PresenceEvent): void {
    const serializableEvent: SerializablePresenceEvent = {
      ...event,
      eventData: event.eventData.type === "customEvent"
        ? {
          eventData: event.eventData.eventData,
          modelName: getMetadata(event.eventData.model).name,
          type: "customEvent",
        }
        : event.eventData,
    };

    const message: PresenceChannelMessage = {
      event: serializableEvent,
      type: "presence",
      userId: this.userId,
    };
    this.presenceChannel.postMessage(message);
  }

  dispose(): void {
    if (this.heartbeatInterval != null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }

    if (this.staleCheckInterval != null) {
      clearInterval(this.staleCheckInterval);
      this.staleCheckInterval = undefined;
    }

    this.activityChannel.close();
    this.presenceChannel.close();
    this.presenceCallbacks.clear();
    this.activityCallbacks.clear();
    this.activeClients.clear();
  }

  private startHeartbeat(): void {
    const sendHeartbeat = () => {
      const message: PresenceChannelMessage = {
        timestamp: Date.now(),
        type: "heartbeat",
        userId: this.userId,
      };
      this.presenceChannel.postMessage(message);
    };

    sendHeartbeat();
    this.heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS) as unknown as number;
  }

  private startStaleCheck(): void {
    this.staleCheckInterval = setInterval(() => {
      this.checkStaleClients();
    }, HEARTBEAT_INTERVAL_MS) as unknown as number;
  }

  private handleActivityMessage(message: ActivityChannelMessage): void {
    if (message.type === "activity") {
      this.handleActivity(message.event);
    }
  }

  private handlePresenceMessage(message: PresenceChannelMessage): void {
    switch (message.type) {
      case "heartbeat":
        this.handleHeartbeat(message.userId, message.timestamp);
        break;
      case "presence":
        this.handlePresence(message.event);
        break;
    }
  }

  private handleHeartbeat(userId: UserId, timestamp: number): void {
    const wasActive = this.activeClients.has(userId);
    this.activeClients.set(userId, timestamp);

    if (!wasActive) {
      const event: PresenceEvent = {
        eventData: {
          type: "presenceArrived" as typeof PresenceEventDataType.ARRIVED,
        },
        userId,
      };
      this.emitPresenceEvent(event);
    }
  }

  private handleActivity(event: SerializableActivityEvent): void {
    let reconstructedEvent: ActivityEvent = event as ActivityEvent;

    if (
      event.eventData.type === "customEvent"
      && "modelName" in event.eventData
      && this.schema != null
    ) {
      const modelName = event.eventData.modelName;
      let model: Model | undefined;

      for (const key of Object.keys(this.schema)) {
        const candidate = this.schema[key as keyof DocumentSchema];
        if (
          candidate != null
          && typeof candidate === "object"
          && hasMetadata(candidate)
        ) {
          const metadata = getMetadata(candidate);
          if ("name" in metadata && metadata.name === modelName) {
            model = candidate as Model;
            break;
          }
        }
      }

      if (model != null) {
        reconstructedEvent = {
          ...event,
          eventData: {
            eventData: event.eventData.eventData,
            model,
            type: "customEvent",
          },
        };
      }
    }

    for (const callback of this.activityCallbacks) {
      callback(reconstructedEvent);
    }
  }

  private handlePresence(event: SerializablePresenceEvent): void {
    let reconstructedEvent: PresenceEvent = event as PresenceEvent;

    if (
      event.eventData.type === "customEvent"
      && "modelName" in event.eventData
      && this.schema != null
    ) {
      const modelName = event.eventData.modelName;
      let model: Model | undefined;

      for (const key of Object.keys(this.schema)) {
        const candidate = this.schema[key as keyof DocumentSchema];
        if (
          candidate != null
          && typeof candidate === "object"
          && hasMetadata(candidate)
        ) {
          const metadata = getMetadata(candidate);
          if ("name" in metadata && metadata.name === modelName) {
            model = candidate as Model;
            break;
          }
        }
      }

      if (model != null) {
        reconstructedEvent = {
          ...event,
          eventData: {
            eventData: event.eventData.eventData,
            model,
            type: "customEvent",
          },
        };
      }
    }

    for (const callback of this.presenceCallbacks) {
      callback(reconstructedEvent);
    }
  }

  private checkStaleClients(): void {
    const now = Date.now();
    const staleClients: UserId[] = [];

    for (const [userId, lastSeen] of this.activeClients.entries()) {
      if (now - lastSeen > STALE_CLIENT_TIMEOUT_MS) {
        staleClients.push(userId);
      }
    }

    for (const userId of staleClients) {
      this.activeClients.delete(userId);
      const event: PresenceEvent = {
        eventData: {
          type: "presenceDeparted" as typeof PresenceEventDataType.DEPARTED,
        },
        userId,
      };
      this.emitPresenceEvent(event);
    }
  }

  private emitPresenceEvent(event: PresenceEvent): void {
    for (const callback of this.presenceCallbacks) {
      callback(event);
    }
  }
}
