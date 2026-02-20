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

import type { DocumentRef } from "./DocumentRef.js";
import type { Model, ModelData } from "./Model.js";
import type { RecordId, RecordRef } from "./RecordRef.js";

export const RecordCollectionRefBrand: unique symbol = Symbol(
  "pack:RecordCollectionRef",
);

/**
 * A reference providing an API to interact with a collection of records in a document.
 */
export interface RecordCollectionRef<M extends Model = Model> {
  readonly docRef: DocumentRef;
  readonly model: M;
  readonly [RecordCollectionRefBrand]: typeof RecordCollectionRefBrand;

  /**
   * Delete a record from the collection (and the document).
   *
   * @param id - The ID of the record to delete.
   * @returns A promise that resolves when the record is deleted.
   */
  delete(id: RecordId): Promise<void>;
  /**
   * Get a {@link RecordRef} from the collection. This provides the main API for
   * accessing and updating individual records in a document.
   *
   * @param id - The ID of the record to get.
   * @returns The record reference, or undefined if it doesn't exist. The
   * recordRef is a stable object and can be used for reference equality checks.
   */
  get(id: RecordId): RecordRef<M> | undefined;
  /**
   * Check if a record exists in the collection.
   *
   * @param id - The ID of the record to check.
   * @returns True if the record exists, false otherwise.
   */
  has(id: RecordId): boolean;
  /**
   * Set the data for a record in the collection (creating it if it doesn't exist).
   *
   * @param id - The ID of the record to set.
   * @param state - The data to set for the record.
   * @returns A promise that resolves when the record is set.
   *
   * @example
   * ```ts
   * const recordCollection = docRef.getRecords(MyModel);
   * await recordCollection.set("record-id", { field: "value" });
   * ```
   */
  set(id: RecordId, state: ModelData<M>): Promise<void>;
  readonly size: number;

  [Symbol.iterator](): Iterator<RecordRef<M>>;

  /**
   * Subscribe to added items in the collection.
   *
   * @param callback - The callback to invoke when items are added.
   * @returns An unsubscribe function.
   */
  readonly onItemsAdded: (
    callback: (items: readonly RecordRef<M>[]) => void,
  ) => () => void;

  /**
   * Subscribe to changed items in the collection.
   *
   * @param callback - The callback to invoke when items are changed.
   * @returns An unsubscribe function.
   */
  readonly onItemsChanged: (
    callback: (items: readonly RecordRef<M>[]) => void,
  ) => () => void;

  /**
   * Subscribe to deleted items in the collection.
   *
   * @param callback - The callback to invoke when items are deleted.
   * @returns An unsubscribe function.
   */
  readonly onItemsDeleted: (
    callback: (items: readonly RecordRef<M>[]) => void,
  ) => () => void;
}
