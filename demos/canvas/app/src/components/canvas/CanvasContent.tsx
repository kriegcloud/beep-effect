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

import type { NodeShape, NodeShapeModel } from "@demo/canvas.sdk";
import type { RecordRef, UserId } from "@palantir/pack.document-schema.model-types";
import { useRecord } from "@palantir/pack.state.react";
import type { MouseEvent } from "react";
import { memo, useMemo } from "react";
import { getUserColor } from "../../hooks/useRemotePresence.js";
import { boundsToCenter } from "../../utils/boundsToCenter.js";
import { getResizeHandles } from "../../utils/getResizeHandles.js";
import styles from "./CanvasContent.module.css";
import { RemoteCursor } from "./RemoteCursor.js";

const PRIMARY_COLOR = "#0066cc";
const DEFAULT_SHAPE_COLOR = "#000000";

interface UserPresence {
  readonly cursor?: { readonly x: number; readonly y: number };
}

export interface CanvasContentProps {
  readonly canvasProps: {
    onMouseDown: (e: MouseEvent<SVGSVGElement>) => void;
    onMouseMove: (e: MouseEvent<SVGSVGElement>) => void;
    onMouseUp: (e: MouseEvent<SVGSVGElement>) => void;
  };
  readonly remoteUsersByUserId: ReadonlyMap<UserId, UserPresence>;
  readonly selectedShapeId: string | undefined;
  readonly shapeRefs: readonly RecordRef<typeof NodeShapeModel>[];
  readonly userIdsBySelectedNodeId: ReadonlyMap<string, ReadonlySet<UserId>>;
}

const ShapeRenderer = memo(function ShapeRenderer({
  selectedShapeId,
  shapeRef,
  userIdsBySelectedNodeId,
}: {
  selectedShapeId: string | undefined;
  shapeRef: RecordRef<typeof NodeShapeModel>;
  userIdsBySelectedNodeId: ReadonlyMap<string, ReadonlySet<UserId>>;
}) {
  const record = useRecord(shapeRef);

  if (record.status !== "loaded") return null;

  const shape = record.data;

  return (
    <ConnectedShapeRenderer
      selectedShapeId={selectedShapeId}
      shapeRef={shapeRef}
      userIdsBySelectedNodeId={userIdsBySelectedNodeId}
      shape={shape}
    />
  );
});

const ConnectedShapeRenderer = memo(function ShapeRenderer({
  selectedShapeId,
  shapeRef,
  userIdsBySelectedNodeId,
  shape,
}: {
  selectedShapeId: string | undefined;
  shapeRef: RecordRef<typeof NodeShapeModel>;
  userIdsBySelectedNodeId: ReadonlyMap<string, ReadonlySet<UserId>>;
  shape: NodeShape;
}) {
  const isSelected = shapeRef.id === selectedShapeId;
  const color = shape.color ?? DEFAULT_SHAPE_COLOR;
  const fillColor = `${color}4D`;

  const remoteSelectingUserIds = useMemo(
    () => userIdsBySelectedNodeId.get(shapeRef.id) ?? new Set<UserId>(),
    [shapeRef.id, userIdsBySelectedNodeId],
  );

  const remoteSelectingUserIdsArray = useMemo(
    () => Array.from(remoteSelectingUserIds),
    [remoteSelectingUserIds],
  );

  if (shape.shapeType === "box") {
    return (
      <g key={shapeRef.id}>
        <rect
          fill={fillColor}
          height={shape.bottom - shape.top}
          stroke={color}
          strokeWidth={2}
          width={shape.right - shape.left}
          x={shape.left}
          y={shape.top}
        />
        {isSelected && (
          <>
            <rect
              fill="none"
              height={shape.bottom - shape.top}
              stroke={PRIMARY_COLOR}
              strokeWidth={2}
              width={shape.right - shape.left}
              x={shape.left}
              y={shape.top}
            />
            {getResizeHandles(shape).map(({ handle, x, y }) => (
              <circle
                key={handle}
                cx={x}
                cy={y}
                fill={handle === "center" ? PRIMARY_COLOR : "white"}
                r={5}
                stroke={PRIMARY_COLOR}
                strokeWidth={2}
              />
            ))}
          </>
        )}
        {remoteSelectingUserIdsArray.map((userId, index) => (
          <circle
            key={userId}
            cx={shape.right - 6}
            cy={shape.bottom - 6 - index * 10}
            fill={getUserColor(userId)}
            r={4}
            stroke="white"
            strokeWidth={1}
          />
        ))}
      </g>
    );
  }

  const { centerX, centerY, height, width } = boundsToCenter(shape);
  const rx = width / 2;
  const ry = height / 2;

  return (
    <g key={shapeRef.id}>
      <ellipse
        cx={centerX}
        cy={centerY}
        fill={fillColor}
        rx={rx}
        ry={ry}
        stroke={color}
        strokeWidth={2}
      />
      {isSelected && (
        <>
          <ellipse
            cx={centerX}
            cy={centerY}
            fill="none"
            rx={rx}
            ry={ry}
            stroke={PRIMARY_COLOR}
            strokeWidth={2}
          />
          {getResizeHandles(shape).map(({ handle, x, y }) => (
            <circle
              key={handle}
              cx={x}
              cy={y}
              fill={handle === "center" ? PRIMARY_COLOR : "white"}
              r={5}
              stroke={PRIMARY_COLOR}
              strokeWidth={2}
            />
          ))}
        </>
      )}
      {remoteSelectingUserIdsArray.map((userId, index) => (
        <circle
          key={userId}
          cx={shape.right - 6}
          cy={shape.bottom - 6 - index * 10}
          fill={getUserColor(userId)}
          r={4}
          stroke="white"
          strokeWidth={1}
        />
      ))}
    </g>
  );
});

export const CanvasContent = memo(function CanvasContent({
  canvasProps,
  remoteUsersByUserId,
  selectedShapeId,
  shapeRefs,
  userIdsBySelectedNodeId,
}: CanvasContentProps) {
  return (
    <svg className={styles.canvas} {...canvasProps}>
      {shapeRefs.map(shapeRef => (
        <ShapeRenderer
          key={shapeRef.id}
          selectedShapeId={selectedShapeId}
          shapeRef={shapeRef}
          userIdsBySelectedNodeId={userIdsBySelectedNodeId}
        />
      ))}
      {Array.from(remoteUsersByUserId.entries()).map(([userId, presence]) => {
        if (presence.cursor == null) return null;
        return (
          <RemoteCursor
            key={userId}
            color={getUserColor(userId)}
            label={userId.substring(0, 2)}
            x={presence.cursor.x}
            y={presence.cursor.y}
          />
        );
      })}
    </svg>
  );
});
