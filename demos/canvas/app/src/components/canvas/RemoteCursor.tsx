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

interface RemoteCursorProps {
  readonly color: string;
  readonly label?: string;
  readonly x: number;
  readonly y: number;
}

export const RemoteCursor = ({ color, label, x, y }: RemoteCursorProps) => {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <path
        d="M 0 0 L 0 16 L 4 12 L 7 18 L 9 17 L 6 11 L 11 11 Z"
        fill={color}
        stroke="white"
        strokeWidth="1"
      />
      {label != null && (
        <text
          x={12}
          y={12}
          fill={color}
          fontSize="12"
          fontWeight="bold"
          stroke="white"
          strokeWidth="0.5"
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {label}
        </text>
      )}
    </g>
  );
};
