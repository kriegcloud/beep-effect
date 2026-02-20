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

import type { NodeShape } from "@demo/canvas.sdk";
import { boundsToCenter } from "./boundsToCenter.js";

export type ResizeHandle = "nw" | "ne" | "sw" | "se" | "center";

export interface HandlePosition {
  readonly handle: ResizeHandle;
  readonly x: number;
  readonly y: number;
}

export function getResizeHandles(shape: NodeShape): readonly HandlePosition[] {
  const { centerX, centerY } = boundsToCenter(shape);

  return [
    { handle: "nw", x: shape.left, y: shape.top },
    { handle: "ne", x: shape.right, y: shape.top },
    { handle: "sw", x: shape.left, y: shape.bottom },
    { handle: "se", x: shape.right, y: shape.bottom },
    { handle: "center", x: centerX, y: centerY },
  ];
}
