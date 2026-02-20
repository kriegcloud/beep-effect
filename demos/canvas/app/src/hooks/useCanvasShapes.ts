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

import type { DocumentModel, NodeShape } from "@demo/canvas.sdk";
import { ActivityEventModel, NodeShapeModel } from "@demo/canvas.sdk";
import { generateId } from "@palantir/pack.core";
import type { DocumentRef, RecordRef } from "@palantir/pack.document-schema.model-types";
import { ActivityEvents } from "@palantir/pack.document-schema.model-types";
import { isValidRecordRef } from "@palantir/pack.state.core";
import { useRecords } from "@palantir/pack.state.react";
import { useCallback } from "react";

export interface UseCanvasShapesResult {
  readonly addShape: (shape: NodeShape) => Promise<RecordRef<typeof NodeShapeModel>>;
  readonly shapeRefs: readonly RecordRef<typeof NodeShapeModel>[];
}

export function useCanvasShapes(docRef: DocumentRef<DocumentModel>): UseCanvasShapesResult {
  const shapeRefs = useRecords(docRef, NodeShapeModel);

  const addShape = useCallback(
    async (shape: NodeShape): Promise<RecordRef<typeof NodeShapeModel>> => {
      const collection = docRef.getRecords(NodeShapeModel);
      const id = `shape-${generateId()}`;

      await docRef.withTransaction(
        () => {
          return collection.set(id, shape);
        },
        ActivityEvents.describeEdit(ActivityEventModel, {
          eventType: "shapeAdd",
          nodeId: id,
        }),
      );

      const recordRef = collection.get(id);
      if (recordRef == null || !isValidRecordRef(recordRef)) {
        throw new Error(`Failed to create shape with id: ${id}`);
      }
      return recordRef;
    },
    [docRef],
  );

  return {
    addShape,
    shapeRefs,
  };
}
