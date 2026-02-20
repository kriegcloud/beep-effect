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

export function isPointInShape(
  x: number,
  y: number,
  shape: NodeShape | (NodeShape & { readonly id: string }),
): boolean {
  if (shape.shapeType === "box") {
    return x >= shape.left && x <= shape.right && y >= shape.top && y <= shape.bottom;
  }

  const { centerX, centerY, height, width } = boundsToCenter(shape);
  const radiusX = width / 2;
  const radiusY = height / 2;

  const dx = (x - centerX) / radiusX;
  const dy = (y - centerY) / radiusY;

  return dx * dx + dy * dy <= 1;
}
