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

export interface CenterSize {
  readonly centerX: number;
  readonly centerY: number;
  readonly height: number;
  readonly width: number;
}

export interface Bounds {
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
}

export function boundsToCenter(bounds: Bounds): CenterSize {
  return {
    centerX: (bounds.left + bounds.right) / 2,
    centerY: (bounds.top + bounds.bottom) / 2,
    height: bounds.bottom - bounds.top,
    width: bounds.right - bounds.left,
  };
}
