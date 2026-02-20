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
  RecordCollectionRef,
  RecordRef,
} from "@palantir/pack.document-schema.model-types";
import { useEffect, useMemo, useState } from "react";

const EMPTY_RECORD_REFS: readonly RecordRef[] = Object.freeze([]);

/**
 * Subscribes to all records of a specific model in a document.
 * @warning This may not always be the best approach for large documents, in which case
 * consider using custom subscription logic via the {@link RecordCollectionRef} API.
 *
 * @param doc The document reference to get records from.
 * @param modelSchema The model schema to get records for.
 * @returns An array of record references for the specified model in the document.
 *
 * @example
 * ```tsx
 * import { useDocRef, useRecords } from "@palantir/pack.state.react";
 * import { DocumentSchema, MyModel } from "@myapp/schema";
 * import { app } from "./appInstance";
 *
 * const MyComponent: React.FC<{ docRef: DocumentRef<DocumentSchema> }> = ({ docRef }) => {
 *   const recordRefs = useRecords(docRef, MyModel);
 *   const recordRefs = useRecords(docRef.getRecords(MyModel));
 *
 *   return (<div>
 *     {recordRefs.map(recordRef => (
 *       <MyComponent key={recordRef.id} recordRef={recordRef} />
 *     ))}
 *   </div>);
 * }
 */
export function useRecords<M extends Model>(
  doc: DocumentRef,
  modelSchema: M,
): readonly RecordRef<M>[];
/**
 * Subscribes to all records of a specific model in a document.
 * @warning This may not always be the best approach for large documents, in which case
 * consider using custom subscription logic via the {@link RecordCollectionRef} API.
 *
 * @param collectionRef The collection to get records from.
 * @returns An array of record references for the specified model in the document.
 *
 * @example
 * ```tsx
 * import { useDocRef, useRecords } from "@palantir/pack.state.react";
 * import { DocumentSchema, MyModel } from "@myapp/schema";
 * import { app } from "./appInstance";
 *
 * const MyComponent: React.FC<{ docRef: DocumentRef<DocumentSchema> }> = ({ docRef }) => {
 *   const recordRefs = useRecords(docRef, MyModel);
 *
 *   return (<div>
 *     {recordRefs.map(recordRef => (
 *       <MyComponent key={recordRef.id} recordRef={recordRef} />
 *     ))}
 *   </div>);
 * };
 * ```
 */
export function useRecords<M extends Model>(
  collectionRef: RecordCollectionRef<M>,
): readonly RecordRef<M>[];
export function useRecords<M extends Model>(
  docOrCollectionRef: DocumentRef | RecordCollectionRef<M>,
  modelSchema?: M,
): readonly RecordRef<M>[] {
  const collectionRef = useMemo(() => {
    if ("model" in docOrCollectionRef) {
      return docOrCollectionRef;
    }
    return docOrCollectionRef.getRecords(modelSchema!);
  }, [docOrCollectionRef, modelSchema]);

  const [recordRefs, setRecordRefs] = useState<readonly RecordRef<M>[]>(emptyRefs);

  useEffect(() => {
    setRecordRefs(emptyRefs());
  }, [collectionRef]);

  // Subscribe to changes on the collection ref to trigger re-renders.
  useEffect(() => {
    function refreshCollection() {
      // Maintain the insertion ordering from the recordCollection, otherwise we'd do a simpler set creation
      setRecordRefs([...collectionRef]);
    }

    const unsubscribeAdded = collectionRef.onItemsAdded(refreshCollection);
    const unsubscribeDeleted = collectionRef.onItemsDeleted(refreshCollection);

    refreshCollection();

    return () => {
      unsubscribeAdded();
      unsubscribeDeleted();
      setRecordRefs(emptyRefs());
    };
  }, [collectionRef]);

  return recordRefs;
}

function emptyRefs<R extends RecordRef>(): readonly R[] {
  return EMPTY_RECORD_REFS as readonly R[];
}
