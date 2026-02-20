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
  DocumentRef,
  Model,
  ModelData,
  RecordCollectionRef,
  RecordId,
  RecordRef,
  Unsubscribe,
} from "@palantir/pack.document-schema.model-types";
import { RecordCollectionRefBrand } from "@palantir/pack.document-schema.model-types";
import { invalidDocRef } from "./DocumentRefImpl.js";
import type { DocumentService } from "./DocumentService.js";

const INVALID_RECORD_COLLECTION_REF: RecordCollectionRef = Object.freeze(
  {
    docRef: invalidDocRef(),
    model: {} as Model,
    [RecordCollectionRefBrand]: RecordCollectionRefBrand,
    get: () => undefined,
    has: () => false,
    set: () => Promise.reject(new Error("Invalid record collection reference")),
    delete: () => Promise.reject(new Error("Invalid record collection reference")),
    size: 0,
    [Symbol.iterator]: () => ({
      next: () => ({ done: true as const, value: undefined as never }),
    }),
    onItemsAdded: () => () => {},
    onItemsChanged: () => () => {},
    onItemsDeleted: () => () => {},
  } as const,
);

export const createRecordCollectionRef = <const M extends Model>(
  documentService: DocumentService,
  docRef: DocumentRef,
  model: M,
): RecordCollectionRef<M> => {
  return new RecordCollectionRefImpl(documentService, docRef, model);
};

/**
 * Get an invalid record collection reference. This is a stable reference that
 * can be used to represent an invalid record collection.
 *
 * Not to be confused with a valid reference to a non-existent record
 * collection, an invalid reference is one that is not properly initialized. For
 * example, code that initializes with an undefined or empty model might produce
 * an invalid record collection reference rather than propagate nullish types.
 *
 * Most operations on an invalid reference are no-ops. For the rest, it is
 * recommended to check for validity using {@link isValidRecordCollectionRef}
 * before performing operations.
 */
export function invalidRecordCollectionRef<M extends Model = Model>(): RecordCollectionRef<M> {
  return INVALID_RECORD_COLLECTION_REF as RecordCollectionRef<M>;
}

/**
 * Check if a record collection reference is a valid reference.
 *
 * Not to be confused with a valid reference to a non-existent record
 * collection, an invalid reference is one that is not properly initialized.
 *
 * Most operations on an invalid reference are no-ops. For the rest, it is
 * recommended to check for validity using this function before performing
 * operations.
 */
export function isValidRecordCollectionRef<M extends Model = Model>(
  collectionRef: RecordCollectionRef<M>,
): collectionRef is RecordCollectionRef<M> {
  return collectionRef !== INVALID_RECORD_COLLECTION_REF;
}

class RecordCollectionRefImpl<M extends Model> implements RecordCollectionRef<M> {
  readonly docRef: DocumentRef;
  readonly model: M;
  declare readonly [RecordCollectionRefBrand]: typeof RecordCollectionRefBrand;
  readonly #documentService: DocumentService;

  constructor(documentService: DocumentService, docRef: DocumentRef, model: M) {
    this.docRef = docRef;
    this.model = model;
    this.#documentService = documentService;
  }

  get(id: RecordId): RecordRef<M> | undefined {
    return this.#documentService.getRecord(this, id);
  }

  has(id: RecordId): boolean {
    return this.#documentService.hasRecord(this, id);
  }

  async set(id: RecordId, state: ModelData<M>): Promise<void> {
    return this.#documentService.setCollectionRecord(this, id, state);
  }

  delete(id: RecordId): Promise<void> {
    const recordRefInstance = this.#documentService.getRecord(this, id);
    if (recordRefInstance) {
      return this.#documentService.deleteRecord(recordRefInstance);
    }
    return Promise.reject(new Error(`Unknown record`));
  }

  get size(): number {
    return this.#documentService.getCollectionSize(this);
  }

  [Symbol.iterator](): Iterator<RecordRef<M>> {
    return this.#documentService.getCollectionRecords(this)[Symbol.iterator]();
  }

  readonly onItemsAdded = (
    callback: (items: readonly RecordRef<M>[]) => void,
  ): Unsubscribe => {
    return this.#documentService.onCollectionItemsAdded(this, callback);
  };

  readonly onItemsChanged = (
    callback: (items: readonly RecordRef<M>[]) => void,
  ): Unsubscribe => {
    return this.#documentService.onCollectionItemsChanged(this, callback);
  };

  readonly onItemsDeleted = (
    callback: (items: readonly RecordRef<M>[]) => void,
  ): Unsubscribe => {
    return this.#documentService.onCollectionItemsDeleted(this, callback);
  };
}
