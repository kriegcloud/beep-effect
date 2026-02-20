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

import type { DocumentModel, NodeShape, NodeShapeModel } from "@demo/canvas.sdk";
import { ActivityEventModel } from "@demo/canvas.sdk";
import type { DocumentRef, RecordRef } from "@palantir/pack.document-schema.model-types";
import { ActivityEvents } from "@palantir/pack.document-schema.model-types";
import type { MouseEvent } from "react";
import { useCallback, useState } from "react";
import { boundsToCenter } from "../utils/boundsToCenter.js";
import { centerToBounds } from "../utils/centerToBounds.js";
import type { ResizeHandle } from "../utils/getResizeHandles.js";
import { getResizeHandles } from "../utils/getResizeHandles.js";
import type { ShapeIndex } from "./useShapeIndex.js";

type DragMode = "move" | "resize";

interface DragState {
  readonly dragMode: DragMode;
  readonly handle?: ResizeHandle;
  readonly initialShape: NodeShape;
  readonly shapeRef: RecordRef<typeof NodeShapeModel>;
  readonly startX: number;
  readonly startY: number;
}

interface UseShapeDragResult {
  onMouseDown: (e: MouseEvent<SVGSVGElement>) => void;
  onMouseMove: (e: MouseEvent<SVGSVGElement>) => void;
  onMouseUp: () => void;
}

const HANDLE_INTERACTION_RADIUS_PX = 10;

export function useShapeDrag(
  docRef: DocumentRef<DocumentModel>,
  shapeIndex: ShapeIndex,
  selectedShapeRef: RecordRef<typeof NodeShapeModel> | undefined,
  onShapeSelect: (ref: RecordRef<typeof NodeShapeModel> | undefined) => void,
): UseShapeDragResult {
  const [dragState, setDragState] = useState<DragState | undefined>();

  const onMouseDown = useCallback(
    async (e: MouseEvent<SVGSVGElement>) => {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (selectedShapeRef != null) {
        const selectedShape = await selectedShapeRef.getSnapshot();
        if (selectedShape == null) {
          return;
        }

        const handle = findHandleAtPoint(x, y, selectedShape);
        if (handle != null && handle !== "center") {
          setDragState({
            dragMode: "resize",
            handle,
            initialShape: selectedShape,
            shapeRef: selectedShapeRef,
            startX: x,
            startY: y,
          });
          return;
        }
      }

      const shapeRef = shapeIndex.findShapesAtPoint(x, y)[0];
      if (shapeRef == null) {
        onShapeSelect(undefined);
        return;
      }

      const shape = await shapeRef.getSnapshot();
      if (shape == null) return;

      onShapeSelect(shapeRef);
      setDragState({
        dragMode: "move",
        initialShape: shape,
        shapeRef,
        startX: x,
        startY: y,
      });
    },
    [onShapeSelect, selectedShapeRef, shapeIndex],
  );

  const onMouseMove = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (dragState == null) return;

      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const dx = x - dragState.startX;
      const dy = y - dragState.startY;

      if (dragState.dragMode === "move") {
        const initial = dragState.initialShape;
        const newBounds = {
          bottom: initial.bottom + dy,
          left: initial.left + dx,
          right: initial.right + dx,
          top: initial.top + dy,
        };
        dragState.shapeRef.update(newBounds);
      } else if (dragState.dragMode === "resize" && dragState.handle != null) {
        const initial = dragState.initialShape;
        const centerSize = boundsToCenter(initial);

        let newCenterX = centerSize.centerX;
        let newCenterY = centerSize.centerY;
        let newWidth = centerSize.width;
        let newHeight = centerSize.height;

        switch (dragState.handle) {
          case "nw":
            newWidth = centerSize.width - dx;
            newHeight = centerSize.height - dy;
            newCenterX = centerSize.centerX + dx / 2;
            newCenterY = centerSize.centerY + dy / 2;
            break;
          case "ne":
            newWidth = centerSize.width + dx;
            newHeight = centerSize.height - dy;
            newCenterX = centerSize.centerX + dx / 2;
            newCenterY = centerSize.centerY + dy / 2;
            break;
          case "sw":
            newWidth = centerSize.width - dx;
            newHeight = centerSize.height + dy;
            newCenterX = centerSize.centerX + dx / 2;
            newCenterY = centerSize.centerY + dy / 2;
            break;
          case "se":
            newWidth = centerSize.width + dx;
            newHeight = centerSize.height + dy;
            newCenterX = centerSize.centerX + dx / 2;
            newCenterY = centerSize.centerY + dy / 2;
            break;
        }

        newWidth = Math.max(20, newWidth);
        newHeight = Math.max(20, newHeight);

        const newBounds = centerToBounds({
          centerX: newCenterX,
          centerY: newCenterY,
          height: newHeight,
          width: newWidth,
        });

        dragState.shapeRef.update(newBounds);
      }
    },
    [dragState],
  );

  const onMouseUp = useCallback(async () => {
    if (dragState == null) {
      return;
    }

    const finalShape = await dragState.shapeRef.getSnapshot();
    if (finalShape != null) {
      const initial = dragState.initialShape;

      const wasModified = finalShape.left !== initial.left
        || finalShape.top !== initial.top
        || finalShape.right !== initial.right
        || finalShape.bottom !== initial.bottom;

      if (wasModified) {
        const finalBounds = {
          bottom: finalShape.bottom,
          left: finalShape.left,
          right: finalShape.right,
          top: finalShape.top,
        };
        docRef.withTransaction(
          () => {
            dragState.shapeRef.update(finalBounds);
          },
          ActivityEvents.describeEdit(ActivityEventModel, {
            eventType: "shapeUpdate",
            newShape: finalShape,
            nodeId: dragState.shapeRef.id,
            oldShape: dragState.initialShape,
          }),
        );
      }
    }

    setDragState(undefined);
  }, [docRef, dragState]);

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
}

function findHandleAtPoint(x: number, y: number, shape: NodeShape): ResizeHandle | undefined {
  const handles = getResizeHandles(shape);
  for (const { handle, x: hx, y: hy } of handles) {
    const distance = Math.sqrt((x - hx) ** 2 + (y - hy) ** 2);
    if (distance <= HANDLE_INTERACTION_RADIUS_PX) {
      return handle;
    }
  }
  return undefined;
}
