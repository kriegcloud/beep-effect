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

import type { ActivityEvent as CustomActivityEvent } from "@demo/canvas.sdk";
import { ActivityEventModel } from "@demo/canvas.sdk";
import type { ActivityEvent, DocumentRef } from "@palantir/pack.document-schema.model-types";
import { ActivityEventDataType } from "@palantir/pack.document-schema.model-types";
import { useEffect, useState } from "react";

export interface ActivityHistoryItem {
  readonly createdInstant: number;
  readonly eventId: string;
  readonly message: string;
}

function getActivityMessage(event: ActivityEvent): string | undefined {
  switch (event.eventData.type) {
    case ActivityEventDataType.DOCUMENT_CREATE:
      return `Created document "${event.eventData.name}"`;
    case ActivityEventDataType.DOCUMENT_RENAME:
      return `Renamed document from "${event.eventData.previousName}" to "${event.eventData.newName}"`;
    case ActivityEventDataType.DOCUMENT_DESCRIPTION_UPDATE:
      return event.eventData.isInitial ? undefined : "Updated document description";
    case ActivityEventDataType.DOCUMENT_SECURITY_UPDATE:
      return "Updated document security settings";
    case ActivityEventDataType.CUSTOM_EVENT:
      if (event.eventData.model === ActivityEventModel) {
        const customEvent = event.eventData.eventData as CustomActivityEvent;
        switch (customEvent.eventType) {
          case "shapeAdd":
            return "User added a shape";
          case "shapeDelete":
            return "User deleted a shape";
          case "shapeUpdate":
            return "User updated a shape";
          default:
            return undefined;
        }
      }
      return undefined;
    case ActivityEventDataType.UNKNOWN:
      return undefined;
    default:
      return undefined;
  }
}

export function useActivityHistory(docRef: DocumentRef): ActivityHistoryItem[] {
  const [activities, setActivities] = useState<ActivityHistoryItem[]>([]);

  useEffect(() => {
    setActivities([]);

    const unsubscribe = docRef.onActivity((_docRef, event) => {
      const message = getActivityMessage(event);
      if (message == null) {
        return;
      }

      const historyItem: ActivityHistoryItem = {
        createdInstant: event.createdInstant,
        eventId: event.eventId,
        message,
      };

      setActivities(prev => {
        if (prev.some(item => item.eventId === historyItem.eventId)) {
          return prev;
        }
        return [...prev, historyItem].sort(
          (a, b) => b.createdInstant - a.createdInstant,
        );
      });
    });

    return () => {
      unsubscribe();
      setActivities([]);
    };
  }, [docRef]);

  return activities;
}
