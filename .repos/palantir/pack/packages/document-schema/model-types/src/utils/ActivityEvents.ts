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
  ActivityEventData,
  ActivityEventDataCustom,
  ActivityEventDataUnknown,
} from "../types/ActivityEvent.js";
import { ActivityEventDataType } from "../types/ActivityEvent.js";
import type { EditDescription, Model, ModelData } from "../types/Model.js";

/**
 * Creates an edit description to describe an edit for activity purposes, for use with docRef.withTransaction.
 *
 * @param model The model to edit.
 * @param data The data to apply to the model.
 * @returns An edit description for the model.
 *
 * @example
 * ```ts
 * docRef.withTransaction(() => {
 *   // make some edits to the document here
 * }, ActivityEvents.describeEdit(MyEventModel, {
 *   myEventDataField: "some value",
 *   foo: 42,
 * }));
 * ```
 */
export function describeEdit<M extends Model>(model: M, data: ModelData<M>): EditDescription<M> {
  return {
    data,
    model,
  };
}

/**
 * Type guard for custom event data.
 *
 * @param eventData The event data to check.
 * @returns true if the event data is a custom event, false otherwise.
 */
export function isCustom(
  eventData: ActivityEventData,
): eventData is ActivityEventDataCustom {
  return eventData.type === ActivityEventDataType.CUSTOM_EVENT;
}

/**
 * Type guard for custom event data for a specific model.
 *
 * @param eventData The event data from a {@link ActivityEvent} to check.
 * @param model The model to check for.
 * @returns true if the event data is a custom event for the given model, false otherwise.
 *
 * @example
 * ```ts
 * docRef.onActivity((docRef, event) => {
 *   if (!ActivityEvents.isEdit(event.eventData, MyEventModel)) {
 *     return;
 *   }
 *
 *   console.log("Got event", event.eventData.eventData.myField);
 * });
 * ```
 */
export function isEdit<M extends Model>(
  eventData: ActivityEventData,
  model: M,
): eventData is ActivityEventDataCustom<M> {
  return (
    eventData.type === ActivityEventDataType.CUSTOM_EVENT
    && eventData.model === model
  );
}

/**
 * Type guard for unknown activity event data. These are fired when a user
 * performs an action that is not recognized by this client.
 *
 * This may be due to application version mismatch, or new platform features for
 * example, and should generally be ignorable.
 *
 * @experimental
 *
 * @param eventData The event data to check.
 * @returns true if the event data is an unknown event, false otherwise.
 */
export function isUnknown(
  eventData: ActivityEventData,
): eventData is ActivityEventDataUnknown {
  return eventData.type === ActivityEventDataType.UNKNOWN;
}
