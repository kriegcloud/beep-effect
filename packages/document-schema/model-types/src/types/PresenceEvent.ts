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

import type { Model, ModelData } from "./Model.js";
import type { UserId } from "./UserRef.js";

export const PresenceEventDataType = {
  ARRIVED: "presenceArrived",
  DEPARTED: "presenceDeparted",
  CUSTOM_EVENT: "customEvent",
  UNKNOWN: "unknown",
} as const;

export type PresenceEventDataType =
  typeof PresenceEventDataType[keyof typeof PresenceEventDataType];

/**
 * Any client that subscribes to presence events via `DocumentRef.onPresence` will
 * be considered 'present' on the document, and trigger an 'arrived' presence event.
 * When they disconnect or unsubscribe from presence events, a 'departed' presence event
 * will be triggered.
 */
export interface PresenceEventDataArrived {
  readonly type: typeof PresenceEventDataType.ARRIVED;
}

/**
 * Any client that subscribes to presence events via `DocumentRef.onPresence` will
 * be considered 'present' on the document, and trigger an 'arrived' presence event.
 * When they disconnect or unsubscribe from presence events, a 'departed' presence event
 * will be triggered.
 */
export interface PresenceEventDataDeparted {
  readonly type: typeof PresenceEventDataType.DEPARTED;
}

/**
 * Application specific custom presence event data.
 *
 * Each different model type used for presence is expected to update the latest
 * 'presence state' for that model type.
 *
 * For example, your app may have need to broadcast user cursor positions and
 * selection ranges as presence data. You could define your schema to include a
 * `CursorPosition` and `SelectionRange` record types, and set them
 * independently via `{@link DocumentRef.updateCustomPresence}`. Each model type
 * sent as a custom presence event should be considered a separate 'channel' of
 * presence data on this document.
 */
export interface PresenceEventDataCustom<M extends Model = Model> {
  readonly type: typeof PresenceEventDataType.CUSTOM_EVENT;
  readonly eventData: ModelData<M>;
  readonly model: M;
}

/**
 * Fallback for unrecognized activity event types.
 *
 * This allows some flexibility with new event types added to the platform.
 * Likely unknown events represent a new platform event type and will be handled
 * in a future release of pack libraries and can be safely ignored by
 * applications.
 */
export interface PresenceEventDataUnknown {
  readonly type: typeof PresenceEventDataType.UNKNOWN;
  readonly rawType: string;
  readonly rawData: unknown;
}

export type PresenceEventData =
  | PresenceEventDataArrived
  | PresenceEventDataDeparted
  | PresenceEventDataCustom
  | PresenceEventDataUnknown;

/**
 * An event representing a transient awareness or presence change for a user on this document.
 * The presence channel is intended for ephemeral data such as user cursors, selections, or
 * other live collaboration indicators.
 *
 * PresenceEvents are not persisted in document history.
 *
 * When a client goes offline, its presence is considered departed and any presence events
 * associated with that user should be considered stale and / or cleared.
 */
export interface PresenceEvent {
  readonly userId: UserId;
  readonly eventData: PresenceEventData;
}
