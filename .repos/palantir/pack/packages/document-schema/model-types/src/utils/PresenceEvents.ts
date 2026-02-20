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

import type { Model } from "../types/Model.js";
import type {
  PresenceEventData,
  PresenceEventDataArrived,
  PresenceEventDataCustom,
  PresenceEventDataDeparted,
  PresenceEventDataUnknown,
} from "../types/PresenceEvent.js";
import { PresenceEventDataType } from "../types/PresenceEvent.js";

/**
 * Type guard for Arrived presence events. These are fired when a user comes online on a document.
 * @param eventData The event data from a {@link PresenceEvent} to check.
 *
 * @example
 * ```ts
 * if (PresenceEvents.isArrived(event.eventData)) {
 *   console.log(`User ${event.userId} has arrived on the document.`);
 * }
 * ```
 */
export function isArrived(eventData: PresenceEventData): eventData is PresenceEventDataArrived {
  return eventData.type === PresenceEventDataType.ARRIVED;
}

/**
 * Type guard for custom presence events.
 * @param eventData The event data from a {@link PresenceEvent} to check.
 * @param model The model to check for.
 * @returns true if the event data is a custom event for the given model, false otherwise.
 *
 * @example
 * ```ts
 * if (PresenceEvents.isCustom(event.eventData, MyEventModel)) {
 *   console.log("Got event", event.eventData.data.myField);
 * }
 * ```
 */
export function isCustom<M extends Model>(
  eventData: PresenceEventData,
  model: M,
): eventData is PresenceEventDataCustom<M>;
/**
 * Type guard for custom presence events.
 * @param eventData The event data from a {@link PresenceEvent} to check.
 * @returns true if the event data is a custom event of some type, false otherwise.
 *
 * @example
 * ```ts
 * if (PresenceEvents.isCustom(event.eventData)) {
 *   console.log("Got a custom event:", event.eventData.model);
 * }
 * ```
 */
export function isCustom(eventData: PresenceEventData): eventData is PresenceEventDataCustom;
export function isCustom<M extends Model>(
  eventData: PresenceEventData,
  model?: M,
): eventData is PresenceEventDataCustom<M> {
  return (
    eventData.type === PresenceEventDataType.CUSTOM_EVENT
    && (model == null || eventData.model === model)
  );
}

/**
 * Type guard for Departed presence events. These are fired when a user goes offline from a document.
 * @param eventData The event data from a {@link PresenceEvent} to check.
 * @returns true if the event data is a departed event, false otherwise.
 *
 * @example
 * ```ts
 * if (PresenceEvents.isDeparted(event.eventData)) {
 *   console.log(`User ${event.userId} has departed from the document.`);
 * }
 * ```
 */
export function isDeparted(eventData: PresenceEventData): eventData is PresenceEventDataDeparted {
  return eventData.type === PresenceEventDataType.DEPARTED;
}

/**
 * Type guard for unknown presence events. These are fired when a user performs an action that is not
 * recognized.
 * This may be due to application version mismatch, or new platform features for example, and should
 * generally be ignorable.
 *
 * @experimental
 *
 * @param eventData The event data from a {@link PresenceEvent} to check.
 * @returns true if the event data is an unknown event, false otherwise.
 */
export function isUnknown(
  eventData: PresenceEventData,
): eventData is PresenceEventDataUnknown {
  return eventData.type === PresenceEventDataType.UNKNOWN;
}
