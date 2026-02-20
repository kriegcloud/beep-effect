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

import {
  type DocumentSchema,
  getMetadata,
  type Model,
  type ModelData,
  type RecordId,
} from "@palantir/pack.document-schema.model-types";
import * as Y from "yjs";

export function initializeDocumentStructure(
  yDoc: Y.Doc,
  schema: DocumentSchema,
): void {
  // Initialize storage for each model type using storageName directly on the root Y.Doc
  Object.values(schema).forEach(modelEntry => {
    yDoc.getMap(getMetadata(modelEntry).name);
  });
}

export function getRecordsMap(
  yDoc: Y.Doc,
  storageName: string,
): Y.Map<unknown> {
  return yDoc.getMap(storageName);
}

export function getRecordData(
  yDoc: Y.Doc,
  storageName: string,
  recordId: RecordId,
): Y.Map<unknown> | undefined {
  const recordsCollection = getRecordsMap(yDoc, storageName);
  return recordsCollection.get(recordId as string) as Y.Map<unknown> | undefined;
}

export function setRecord(
  yDoc: Y.Doc,
  storageName: string,
  recordId: RecordId,
  state: ModelData<Model>,
): boolean {
  const recordsCollection = getRecordsMap(yDoc, storageName);
  const currentRecord = recordsCollection.get(recordId as string) as Y.Map<unknown> | undefined;
  const wasExisting = currentRecord != null;

  // Use transaction for atomic update
  yDoc.transact(() => {
    if (currentRecord != null) {
      // Clear existing record completely
      currentRecord.clear();
      populateYMapFromState(currentRecord, state);
    } else {
      // Create new record
      const newRecord = new Y.Map();
      populateYMapFromState(newRecord, state);
      recordsCollection.set(recordId as string, newRecord);
    }
  });

  return wasExisting;
}

export function getRecordSnapshot(
  yDoc: Y.Doc,
  storageName: string,
  recordId: RecordId,
): unknown {
  const data = getRecordData(yDoc, storageName, recordId);
  if (!data) {
    return undefined;
  }

  return yMapToState(data);
}

export function updateRecord(
  yDoc: Y.Doc,
  storageName: string,
  recordId: RecordId,
  partialState: Partial<ModelData<Model>>,
): boolean {
  const recordsCollection = getRecordsMap(yDoc, storageName);
  const currentRecord = recordsCollection.get(recordId as string) as Y.Map<unknown> | undefined;

  if (currentRecord == null) {
    return false; // Record doesn't exist, cannot update
  }

  // Use transaction for atomic partial update
  yDoc.transact(() => {
    updateYMapFromPartialState(currentRecord, partialState);
  });

  return true;
}

export function getAllRecordIds(yDoc: Y.Doc, storageName: string): RecordId[] {
  const recordsCollection = getRecordsMap(yDoc, storageName);
  return Array.from(recordsCollection.keys()).map(key => key as RecordId);
}

function populateYMapFromState(
  yMap: Y.Map<unknown>,
  state: unknown,
): void {
  if (state != null && typeof state === "object") {
    Object.entries(state).forEach(([key, value]) => {
      if (value === undefined) return;

      if (Array.isArray(value)) {
        const yArray = new Y.Array();
        value.forEach(item => {
          yArray.push([item]);
        });
        yMap.set(key, yArray);
      } else if (typeof value === "object" && value != null) {
        const nestedMap = new Y.Map();
        populateYMapFromState(nestedMap, value as Model);
        yMap.set(key, nestedMap);
      } else {
        yMap.set(key, value);
      }
    });
  }
}

function updateYMapFromPartialState(
  yMap: Y.Map<unknown>,
  partialState: Partial<unknown>,
): void {
  if (typeof partialState === "object") {
    Object.entries(partialState).forEach(([key, value]) => {
      if (value === undefined) {
        // Remove the field if undefined is explicitly provided
        yMap.delete(key);
        return;
      }

      if (Array.isArray(value)) {
        const yArray = new Y.Array();
        value.forEach(item => {
          yArray.push([item]);
        });
        yMap.set(key, yArray);
      } else if (typeof value === "object" && value != null) {
        // For nested objects, we need to handle partial updates
        const existingValue = yMap.get(key);
        if (existingValue instanceof Y.Map) {
          // Recursively update nested Y.Map
          updateYMapFromPartialState(existingValue, value as Partial<unknown>);
        } else {
          // Replace with new nested map if existing value is not a Y.Map
          const nestedMap = new Y.Map();
          populateYMapFromState(nestedMap, value as Model);
          yMap.set(key, nestedMap);
        }
      } else {
        yMap.set(key, value);
      }
    });
  }
}

function yMapToState(yMap: Y.Map<unknown>): ModelData<Model> {
  const state: Record<string, unknown> = {};

  yMap.forEach((value, key) => {
    if (value instanceof Y.Array) {
      state[key] = value.toArray();
    } else if (value instanceof Y.Map) {
      state[key] = yMapToState(value);
    } else {
      state[key] = value;
    }
  });

  return state as ModelData<Model>;
}
