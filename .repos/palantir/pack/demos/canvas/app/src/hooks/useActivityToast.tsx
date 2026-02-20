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

import type { Toaster } from "@blueprintjs/core";
import type { ActivityEvent } from "@demo/canvas.sdk";
import { ActivityEventModel } from "@demo/canvas.sdk";
import type { DocumentRef } from "@palantir/pack.document-schema.model-types";
import { ActivityEventDataType } from "@palantir/pack.document-schema.model-types";
import { useEffect, useRef } from "react";
import { ShapeUpdateToast } from "../components/toast/ShapeUpdateToast.js";

export function useActivityToast(
  docRef: DocumentRef,
  toaster: Toaster | null,
): void {
  const updateCountsRef = useRef<Map<string, { count: number; key: string }>>(
    new Map(),
  );

  useEffect(() => {
    if (toaster == null) {
      return;
    }

    const subscribedAt = Date.now();

    const unsubscribe = docRef.onActivity((_docRef, event) => {
      if (event.createdInstant < subscribedAt - 5000) {
        return;
      }
      if (event.eventData.type === ActivityEventDataType.DOCUMENT_CREATE) {
        toaster.show({
          icon: "document",
          intent: "success",
          message: `Document "${event.eventData.name}" created`,
          timeout: 3000,
        });
        return;
      }

      if (event.eventData.type !== ActivityEventDataType.CUSTOM_EVENT) {
        return;
      }

      // TODO: Filter out events from current client once docRef.getClientId() is available
      // if (event.createdBy === docRef.getClientId()) { return; }

      if (event.eventData.model !== ActivityEventModel) {
        return;
      }

      const eventData = event.eventData.eventData as ActivityEvent;
      switch (eventData.eventType) {
        case "shapeAdd":
          toaster.show({
            intent: "primary",
            message: "User added a shape",
            timeout: 3000,
          });
          break;
        case "shapeDelete":
          toaster.show({
            intent: "primary",
            message: "User deleted a shape",
            timeout: 3000,
          });
          break;
        case "shapeUpdate": {
          const nodeId = eventData.nodeId;
          const existing = updateCountsRef.current.get(nodeId);

          if (existing != null) {
            existing.count++;
            toaster.show(
              {
                intent: "primary",
                message: <ShapeUpdateToast count={existing.count} />,
                onDismiss: () => {
                  updateCountsRef.current.delete(nodeId);
                },
                timeout: 3000,
              },
              existing.key,
            );
          } else {
            const key = toaster.show({
              intent: "primary",
              message: <ShapeUpdateToast count={1} />,
              onDismiss: () => {
                updateCountsRef.current.delete(nodeId);
              },
              timeout: 3000,
            });

            if (key != null) {
              updateCountsRef.current.set(nodeId, { count: 1, key });
            }
          }
          break;
        }
        default:
          return;
      }
    });

    return () => {
      unsubscribe();
      updateCountsRef.current.clear();
    };
  }, [docRef, toaster]);
}
