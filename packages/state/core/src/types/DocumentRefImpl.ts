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

import type { PackAppInternal } from "@palantir/pack.core";
import type {
  ActivityEvent,
  DocumentId,
  DocumentMetadata,
  DocumentRef,
  DocumentSchema,
  DocumentState,
  EditDescription,
  Model,
  ModelData,
  PresenceEvent,
  PresencePublishOptions,
  PresenceSubscriptionOptions,
  RecordCollectionRef,
  Unsubscribe,
} from "@palantir/pack.document-schema.model-types";
import { DocumentRefBrand } from "@palantir/pack.document-schema.model-types";
import type { StateModuleImpl } from "./StateModule.js";
import { getStateModule } from "./StateModule.js";

const INVALID_DOC_REF_ID: DocumentId = "INVALID_DOC_REF";
const INVALID_DOC_REF: DocumentRef = Object.freeze(
  {
    id: INVALID_DOC_REF_ID,
    schema: {} as DocumentSchema,
    [DocumentRefBrand]: DocumentRefBrand,
    getDocSnapshot: () => Promise.reject(new Error("Invalid document reference")),
    getRecords: () => {
      throw new Error("Invalid document reference");
    },
    onActivity: () => () => {},
    onMetadataChange: () => () => {},
    onPresence: () => () => {},
    onStateChange: () => () => {},
    updateCustomPresence: () => {},
    withTransaction: () => {
      throw new Error("Invalid document reference");
    },
  } as const,
);

export const createDocRef = <const D extends DocumentSchema>(
  app: PackAppInternal,
  id: DocumentId,
  schema: D,
): DocumentRef<D> => {
  return new DocumentRefImpl(app, id, schema);
};

/**
 * Get an invalid document reference. This is a stable reference that can be
 * used to represent a non-existent or invalid document.
 *
 * Not to be confused with a valid reference to a non-existent document, an
 * invalid reference is one that is not properly initialized. For example, code
 * that initializes with an undefined or empty documentId might produce an
 * invalid document reference rather than propagate nullish types.
 *
 * Most operations on an invalid reference are no-ops. For the rest, it is
 * recommended to check for validity using {@link isValidDocRef} before
 * performing operations.
 */
export function invalidDocRef<D extends DocumentSchema = DocumentSchema>(): DocumentRef<D> {
  return INVALID_DOC_REF as DocumentRef<D>;
}

/**
 * Check if a document reference is an invalid reference.
 * Not to be confused with a valid reference to a non-existent document, an invalid reference is one that is not properly initialized.
 * For example, code that initializes with an undefined or empty documentId might produce an invalid document reference rather than
 * propagate nullish types, as most operations on an invalid reference are no-ops. For the rest, it is recommended to check for
 * validity using this function before performing operations.
 */
export function isValidDocRef<D extends DocumentSchema = DocumentSchema>(
  docRef: DocumentRef<D>,
): docRef is DocumentRef<D> {
  return docRef.id !== INVALID_DOC_REF_ID && docRef.id !== "";
}

class DocumentRefImpl<T extends DocumentSchema> implements DocumentRef<T> {
  readonly id: DocumentId;
  readonly schema: T;
  declare readonly [DocumentRefBrand]: typeof DocumentRefBrand;
  readonly #stateModule: StateModuleImpl;

  constructor(app: PackAppInternal, id: DocumentId, schema: T) {
    this.#stateModule = getStateModule(app) as StateModuleImpl;
    this.id = id;
    this.schema = schema;
  }

  async getDocSnapshot(): Promise<DocumentState<T>> {
    return this.#stateModule.getDocumentSnapshot(this);
  }

  getRecords<R extends Model>(
    model: R,
  ): RecordCollectionRef<R> {
    return this.#stateModule.getCreateRecordCollectionRef(this, model);
  }

  onActivity(
    callback: (docRef: DocumentRef<T>, event: ActivityEvent) => void,
  ): Unsubscribe {
    return this.#stateModule.onActivity(this, callback);
  }

  onMetadataChange(
    cb: (docRef: DocumentRef<T>, metadata: DocumentMetadata) => void,
  ): Unsubscribe {
    return this.#stateModule.onMetadataChange(this, cb);
  }

  onPresence(
    callback: (docRef: DocumentRef<T>, event: PresenceEvent) => void,
    options?: PresenceSubscriptionOptions,
  ): Unsubscribe {
    return this.#stateModule.onPresence(this, callback, options);
  }

  onStateChange(
    callback: (docRef: DocumentRef<T>) => void,
  ): Unsubscribe {
    return this.#stateModule.onStateChange(this, callback);
  }

  updateCustomPresence<M extends Model = Model>(
    model: M,
    eventData: ModelData<M>,
    options?: PresencePublishOptions,
  ): void {
    this.#stateModule.updateCustomPresence(this, model, eventData, options);
  }

  withTransaction(
    fn: () => void,
    description?: EditDescription,
  ): void {
    this.#stateModule.withTransaction(this, fn, description);
  }
}
