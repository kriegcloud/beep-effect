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
import { useCallback, useRef, useState } from "react";
import { centerToBounds } from "../utils/centerToBounds.js";
import { getDefaultColor } from "../utils/getDefaultColor.js";
import { getDefaultShapeSize } from "../utils/getDefaultShapeSize.js";
import { useCanvasShapes } from "./useCanvasShapes.js";
import { useShapeDrag } from "./useShapeDrag.js";
import { useShapeIndex } from "./useShapeIndex.js";
import { useShapeSelection } from "./useShapeSelection.js";

export type ToolMode = "select" | "addBox" | "addCircle";

export interface UseCanvasInteractionResult {
  broadcastSelection: (nodeIds: readonly string[]) => void;
  readonly canvasProps: {
    onMouseDown: (e: MouseEvent<SVGSVGElement>) => void;
    onMouseMove: (e: MouseEvent<SVGSVGElement>) => void;
    onMouseUp: (e: MouseEvent<SVGSVGElement>) => void;
  };
  readonly currentColor: string;
  readonly currentTool: ToolMode;
  deleteSelected: () => void;
  readonly selectedShapeId: string | undefined;
  setColor: (color: string) => void;
  setTool: (tool: ToolMode) => void;
  readonly shapeRefs: readonly RecordRef<typeof NodeShapeModel>[];
}

export function useCanvasInteraction(
  doc: DocumentRef<DocumentModel>,
  broadcastSelection: (nodeIds: readonly string[]) => void,
): UseCanvasInteractionResult {
  const { addShape, shapeRefs } = useCanvasShapes(doc);
  const shapeIndex = useShapeIndex(doc);
  const { clearSelection, selectedShapeRef, selectShape } = useShapeSelection();
  const [currentTool, setCurrentTool] = useState<ToolMode>("select");
  const [currentColor, setCurrentColor] = useState<string>(getDefaultColor());

  const creationStateRef = useRef<{ startX: number; startY: number } | undefined>(undefined);

  const selectShapeWithBroadcast = useCallback(
    (ref: RecordRef<typeof NodeShapeModel> | undefined) => {
      selectShape(ref);
      broadcastSelection(ref != null ? [ref.id] : []);
    },
    [broadcastSelection, selectShape],
  );

  const shapeDragHandlers = useShapeDrag(
    doc,
    shapeIndex,
    selectedShapeRef,
    selectShapeWithBroadcast,
  );

  const deleteSelected = useCallback(() => {
    if (selectedShapeRef != null) {
      const nodeId = selectedShapeRef.id;
      doc.withTransaction(
        () => {
          selectedShapeRef.delete();
        },
        ActivityEvents.describeEdit(ActivityEventModel, {
          eventType: "shapeDelete",
          nodeId,
        }),
      );
      clearSelection();
      broadcastSelection([]);
    }
  }, [broadcastSelection, clearSelection, doc, selectedShapeRef]);

  const setColor = useCallback(
    async (color: string) => {
      setCurrentColor(color);
      if (selectedShapeRef != null) {
        const oldShape = await selectedShapeRef.getSnapshot();
        if (oldShape == null) return;

        await doc.withTransaction(
          () => {
            return selectedShapeRef.update({ color });
          },
          ActivityEvents.describeEdit(ActivityEventModel, {
            eventType: "shapeUpdate",
            newShape: { ...oldShape, color },
            nodeId: selectedShapeRef.id,
            oldShape,
          }),
        );
      }
    },
    [doc, selectedShapeRef],
  );

  const setTool = useCallback((tool: ToolMode) => {
    setCurrentTool(tool);
    creationStateRef.current = undefined;
  }, []);

  const onMouseDown = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (currentTool === "select") {
        shapeDragHandlers.onMouseDown(e);
      } else {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        creationStateRef.current = { startX: x, startY: y };
      }
    },
    [currentTool, shapeDragHandlers],
  );

  const onMouseMove = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (currentTool === "select") {
        shapeDragHandlers.onMouseMove(e);
      }
    },
    [currentTool, shapeDragHandlers],
  );

  const onMouseUp = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      if (currentTool === "select") {
        shapeDragHandlers.onMouseUp();
        return;
      }

      if (creationStateRef.current != null) {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const endX = e.clientX - rect.left;
        const endY = e.clientY - rect.top;

        const { startX, startY } = creationStateRef.current;

        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        const defaultSize = getDefaultShapeSize();
        const finalWidth = width > 5 ? width : defaultSize.width;
        const finalHeight = height > 5 ? height : defaultSize.height;

        const centerX = width > 5 ? (startX + endX) / 2 : startX;
        const centerY = height > 5 ? (startY + endY) / 2 : startY;

        const bounds = centerToBounds({
          centerX,
          centerY,
          height: finalHeight,
          width: finalWidth,
        });

        const shapeType = currentTool === "addBox" ? "box" : "circle";
        const newShape: NodeShape = {
          ...bounds,
          color: currentColor,
          shapeType,
        };

        addShape(newShape).then(recordRef => {
          selectShapeWithBroadcast(recordRef);
        });

        creationStateRef.current = undefined;
        setCurrentTool("select");
      }
    },
    [addShape, currentColor, currentTool, selectShapeWithBroadcast, shapeDragHandlers],
  );

  return {
    broadcastSelection,
    canvasProps: {
      onMouseDown,
      onMouseMove,
      onMouseUp,
    },
    currentColor,
    currentTool,
    deleteSelected,
    selectedShapeId: selectedShapeRef?.id,
    setColor,
    setTool,
    shapeRefs,
  };
}
