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

import type { Flavored } from "@palantir/pack.core";
import type { ActivityEvent } from "./ActivityEvent.js";
import type { DocumentMetadata } from "./DocumentMetadata.js";
import type { DocumentSchema, DocumentState } from "./DocumentSchema.js";
import type { EditDescription, Model, ModelData } from "./Model.js";
import type { PresenceEvent } from "./PresenceEvent.js";
import type { RecordCollectionRef } from "./RecordCollectionRef.js";
import type { Unsubscribe } from "./Unsubscribe.js";

export type DocumentId = Flavored<"DocumentId">;

/**
 * Options for subscribing to presence events on a document.
 */
export interface PresenceSubscriptionOptions {
  /**
   * If true, presence events originating from the local user will be ignored.
   *
   * @default true
   */
  readonly ignoreSelfUpdates?: boolean;
}

/**
 * Options for publishing custom presence events.
 */
export interface PresencePublishOptions {
  /**
   * If true (default), event is broadcast only and not persisted.
   * If false, event is persisted and replayed to new clients on catchup.
   *
   * @default true
   */
  readonly isEphemeral?: boolean;
}

export const DocumentRefBrand: unique symbol = Symbol("pack:DocumentRef");

/**
 * A reference to a document in the Pack system.
 *
 * A documentRef returned by various interfaces from the pack app instance or
 * utilities such as react hooks from @palantir/pack.state.react provides
 * methods to interact with the document, such as subscribing to & making
 * changes to the document state and also related activity or presence events.
 *
 * A stable documentRef object is guaranteed for the same document id within the
 * same app instance.
 */
export interface DocumentRef<D extends DocumentSchema = DocumentSchema> {
  readonly id: DocumentId;
  readonly schema: D;
  readonly [DocumentRefBrand]: typeof DocumentRefBrand;

  /**
   * Get a snapshot of the current document state.
   *
   * This is largely for debugging and dumps a json view of the whole document state.
   *
   * @experimental
   */
  getDocSnapshot(): Promise<DocumentState<D>>;

  /**
   * Get or create a ref to the collection of all records for the specified
   * model in this document.
   *
   * @param model The model type from the application's generated schema.
   * @returns A stable {@link RecordCollectionRef} object providing an interface
   * to interact with the records of the specified model type in this document.
   *
   * @example
   * ```ts
   * import { DocumentModel, MyModel } from "@myapp/schema";
   * import { app } from "./appInstance";
   *
   * const docRef = app.state.createDocRef(DocumentModel, someDocumentId);
   * const myRecordCollection = docRef.getRecords(MyModel);
   *
   * myRecordCollection.onItemsAdded((items) => {
   *   console.log("New records added:", items);
   * })
   * ```
   */
  getRecords<R extends Model>(model: R): RecordCollectionRef<R>;

  /**
   * Subscribe to activity events for the document.
   *
   * Activity is used by applications to describe changes to the document, for
   * populating activity feeds, change histories, notifications and similar
   * features.
   *
   * @see {withTransaction} for making edits that generate activity events.
   *
   * @returns An unsubscribe function.
   * @example
   * ```ts
   * const unsubscribe = docRef.onActivity((docRef, event) => {
   *   console.log("Activity event:", event);
   * });
   *
   * // Submit an edit with a description to generate an activity event.
   * docRef.withTransaction(() => {
   *   // make some edits to the document here
   * }, {
   *   model: MyEventModel,
   *   data: {
   *     myDataField: "some value",
   *     foo: 42,
   *   },
   * });
   *
   * // Later, to unsubscribe:
   * unsubscribe();
   * ```
   */
  onActivity(
    callback: (docRef: DocumentRef<D>, event: ActivityEvent) => void,
  ): Unsubscribe;

  /**
   * Subscribe to metadata changes for the document.
   *
   * @returns An unsubscribe function.
   * @example
   * ```ts
   * const unsubscribe = docRef.onMetadataChange((docRef, metadata) => {
   *   console.log("Metadata changed:", metadata);
   * });
   *
   * // Later, to unsubscribe:
   * unsubscribe();
   * ```
   */
  onMetadataChange(
    callback: (docRef: DocumentRef<D>, metadata: DocumentMetadata) => void,
  ): Unsubscribe;

  /**
   * Subscribe to presence events for the document.
   *
   * Presence events are a way to broadcast and receive non-persisted awareness
   * and presence events. For example, a user moving their cursor in a
   * collaborative editor could be broadcast via custom presence events.
   *
   * @see {@link updateCustomPresence} to publish custom presence updates.
   *
   * @param callback The callback to invoke on presence events.
   * @param options Options for the presence subscription.
   * @returns An unsubscribe function.
   * @example
   * ```ts
   * const unsubscribe = docRef.onPresence((docRef, event) => {
   *   console.log("Presence event:", event);
   *   if (event.model === MyPresenceModel) {
   *     updateCursor((event.eventData as ModelData<MyPresenceModel>).cursorPosition);
   *   }
   * }, { ignoreSelfUpdates: true });
   *
   * // Broadcast a presence update
   * docRef.updateCustomPresence(MyPresenceModel, {
   *  cursorPosition: [42, 7],
   * });
   *
   * // Later, to unsubscribe:
   * unsubscribe();
   * ```
   */
  onPresence(
    callback: (docRef: DocumentRef<D>, event: PresenceEvent) => void,
    options?: PresenceSubscriptionOptions,
  ): Unsubscribe;

  /**
   * Subscribe to be notified any time the document state changes.
   * This is largely for testing purposes.
   *
   * @experimental
   *
   * @param callback The callback to invoke on state changes.
   * @returns An unsubscribe function.
   * @example
   * ```ts
   * const unsubscribe = docRef.onStateChange((docRef) => {
   *   console.log("Document state changed:", docRef);
   * });
   *
   * // Later, to unsubscribe:
   * unsubscribe();
   * ```
   */
  onStateChange(
    callback: (docRef: DocumentRef<D>) => void,
  ): Unsubscribe;

  /**
   * Broadcasts an update for the specified model as presence data to other
   * subscribers.
   *
   * Presence data is ephemeral and not stored as part of the document state. It
   * is intended for broadcasting transient user presence and awareness
   * information. Each different model type used for presence is expected to
   * update the latest 'presence state' for that model type.
   *
   * @see {@link onPresence} to subscribe to presence updates.
   *
   * @param model The model type to update presence for.
   * @param eventData The new presence data for the model.
   * @param options Options for presence publishing.
   */
  updateCustomPresence<M extends Model = Model>(
    model: M,
    eventData: ModelData<M>,
    options?: PresencePublishOptions,
  ): void;

  /**
   * Execute one or more document edits within a transaction, optionally providing
   * a description of the edit for activity tracking.
   *
   * All edits made within the provided function will be treated as a single
   * atomic edit operation. If a description is provided, an activity event will
   * be generated for the edit.
   *
   * If this is called within an existing transaction, the inner edits will be
   * included in the outer transaction only, and the inner descriptions will be
   * discarded.
   *
   * @see {@link onActivity} to subscribe to activity events on this document.
   *
   * @param fn A lambda including some document edits.
   * @param description Optional description of the edit for activity tracking.
   *
   * @example
   * ```ts
   * docRef.withTransaction(() => {
   *   const myRecords = docRef.getRecords(MyModel);
   *   myRecords.set("record-1", { field: "new value" });
   *   myRecords.delete("record-2");
   * }, ActivityEvents.describeEdit(MyEditEventModel, {
   *   summary: "Updated record-1 and deleted record-2",
   * }));
   * ```
   */
  withTransaction(fn: () => void, description?: EditDescription): void;
}
