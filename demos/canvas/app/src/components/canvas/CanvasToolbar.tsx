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

import type { DocumentRef } from "@palantir/pack.document-schema.model-types";
import { useDocMetadata } from "@palantir/pack.state.react";
import type { ChangeEvent } from "react";
import { memo } from "react";
import type { ToolMode } from "../../hooks/useCanvasInteraction.js";
import { AVAILABLE_COLORS } from "../../utils/getDefaultColor.js";
import { ActivityPanel } from "./ActivityPanel.js";
import styles from "./CanvasToolbar.module.css";

export interface CanvasToolbarProps {
  readonly canDelete: boolean;
  readonly currentColor: string;
  readonly currentTool: ToolMode;
  readonly docRef: DocumentRef;
  onColorChange: (color: string) => void;
  onDelete: () => void;
  onToolChange: (tool: ToolMode) => void;
}

export const CanvasToolbar = memo(function CanvasToolbar({
  canDelete,
  currentColor,
  currentTool,
  docRef,
  onColorChange,
  onDelete,
  onToolChange,
}: CanvasToolbarProps) {
  const { metadata } = useDocMetadata(docRef);

  const handleColorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onColorChange(e.target.value);
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.documentName}>{metadata?.name ?? "Untitled"}</div>

      <div className={styles.toolGroup}>
        <button
          className={currentTool === "select" ? styles.activeButton : styles.button}
          onClick={() => onToolChange("select")}
          type="button"
        >
          Select
        </button>
        <button
          className={currentTool === "addBox" ? styles.activeButton : styles.button}
          onClick={() => onToolChange("addBox")}
          type="button"
        >
          Add Box
        </button>
        <button
          className={currentTool === "addCircle" ? styles.activeButton : styles.button}
          onClick={() => onToolChange("addCircle")}
          type="button"
        >
          Add Circle
        </button>
      </div>

      <div className={styles.toolGroup}>
        <label className={styles.label}>
          Color:
          <select className={styles.select} onChange={handleColorChange} value={currentColor}>
            {AVAILABLE_COLORS.map(color => (
              <option key={color} value={color}>
                {getColorName(color)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.toolGroup}>
        <button
          className={styles.button}
          disabled={!canDelete}
          onClick={onDelete}
          type="button"
        >
          Delete
        </button>
      </div>

      <div className={styles.toolGroupRight}>
        <ActivityPanel docRef={docRef} />
      </div>
    </div>
  );
});

function getColorName(hex: string): string {
  const colorNames: Record<string, string> = {
    "#000000": "Black",
    "#0066cc": "Blue",
    "#28a745": "Green",
    "#dc3545": "Red",
    "#ffc107": "Yellow",
  };
  return colorNames[hex] ?? hex;
}
