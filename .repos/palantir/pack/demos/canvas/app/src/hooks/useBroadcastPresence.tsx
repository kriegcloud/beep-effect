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

import type { DocumentModel } from "@demo/canvas.sdk";
import { PresenceCursorEventModel, PresenceSelectionEventModel } from "@demo/canvas.sdk";
import type { DocumentRef } from "@palantir/pack.document-schema.model-types";
import { useCallback, useRef } from "react";

interface UseBroadcastPresenceResult {
  broadcastCursor: (x: number, y: number) => void;
  broadcastSelection: (nodeIds: readonly string[]) => void;
}

const CURSOR_THROTTLE_MS = 16;

export function useBroadcastPresence(
  docRef: DocumentRef<DocumentModel>,
): UseBroadcastPresenceResult {
  const lastCursorBroadcastRef = useRef<number>(0);
  const pendingCursorRef = useRef<{ x: number; y: number } | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const broadcastCursor = useCallback(
    (x: number, y: number) => {
      pendingCursorRef.current = { x, y };

      if (rafIdRef.current != null) {
        return;
      }

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const now = Date.now();

        if (now - lastCursorBroadcastRef.current < CURSOR_THROTTLE_MS) {
          rafIdRef.current = requestAnimationFrame(() => {
            rafIdRef.current = null;
            if (pendingCursorRef.current != null) {
              const { x, y } = pendingCursorRef.current;
              docRef.updateCustomPresence(PresenceCursorEventModel, { x, y });
              lastCursorBroadcastRef.current = Date.now();
              pendingCursorRef.current = null;
            }
          });
          return;
        }

        if (pendingCursorRef.current != null) {
          const { x, y } = pendingCursorRef.current;
          docRef.updateCustomPresence(PresenceCursorEventModel, { x, y });
          lastCursorBroadcastRef.current = now;
          pendingCursorRef.current = null;
        }
      });
    },
    [docRef],
  );

  const broadcastSelection = useCallback(
    (nodeIds: readonly string[]) => {
      docRef.updateCustomPresence(PresenceSelectionEventModel, {
        selectedNodeIds: [...nodeIds],
      });
    },
    [docRef],
  );

  return {
    broadcastCursor,
    broadcastSelection,
  };
}
