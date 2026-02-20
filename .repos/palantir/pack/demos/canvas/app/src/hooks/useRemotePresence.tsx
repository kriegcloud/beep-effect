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
import type { DocumentRef, UserId } from "@palantir/pack.document-schema.model-types";
import { PresenceEvents } from "@palantir/pack.document-schema.model-types";
import { useOnDocPresenceEvents } from "@palantir/pack.state.react";
import { useState } from "react";

interface UserPresence {
  readonly cursor?: { readonly x: number; readonly y: number };
  readonly selectedNodeIds: readonly string[];
}

interface UseRemotePresenceResult {
  readonly remoteUsersByUserId: ReadonlyMap<UserId, UserPresence>;
  readonly userIdsBySelectedNodeId: ReadonlyMap<string, ReadonlySet<UserId>>;
}

function hashUserId(userId: UserId): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getUserColor(userId: UserId): string {
  const hue = hashUserId(userId) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

function buildShapeSelectionsIndex(
  remoteUsers: Map<UserId, UserPresence>,
): Map<string, Set<UserId>> {
  const index = new Map<string, Set<UserId>>();
  for (const [userId, presence] of remoteUsers.entries()) {
    for (const nodeId of presence.selectedNodeIds) {
      let userSet = index.get(nodeId);
      if (userSet == null) {
        userSet = new Set();
        index.set(nodeId, userSet);
      }
      userSet.add(userId);
    }
  }
  return index;
}

export function useRemotePresence(docRef: DocumentRef<DocumentModel>): UseRemotePresenceResult {
  const [remoteUsersByUserId, setRemoteUsersByUserId] = useState<ReadonlyMap<UserId, UserPresence>>(
    () => new Map(),
  );
  const [userIdsBySelectedNodeId, setUserIdsBySelectedNodeId] = useState<
    ReadonlyMap<string, ReadonlySet<UserId>>
  >(() => new Map());

  useOnDocPresenceEvents(
    docRef,
    ({ eventData, userId }) => {
      if (PresenceEvents.isArrived(eventData)) {
        setRemoteUsersByUserId(prev => {
          const next = new Map(prev);
          next.set(userId, { selectedNodeIds: [] });
          return next;
        });
        return;
      }

      if (PresenceEvents.isDeparted(eventData)) {
        setRemoteUsersByUserId(prev => {
          const next = new Map(prev);
          next.delete(userId);
          setUserIdsBySelectedNodeId(buildShapeSelectionsIndex(next));
          return next;
        });
        return;
      }

      if (PresenceEvents.isCustom(eventData, PresenceCursorEventModel)) {
        setRemoteUsersByUserId(prev => {
          const next = new Map(prev);
          const existing = next.get(userId) ?? { selectedNodeIds: [] };
          next.set(userId, {
            ...existing,
            cursor: { x: eventData.eventData.x, y: eventData.eventData.y },
          });
          return next;
        });
        return;
      }

      if (PresenceEvents.isCustom(eventData, PresenceSelectionEventModel)) {
        setRemoteUsersByUserId(prev => {
          const next = new Map(prev);
          const existing = next.get(userId) ?? { selectedNodeIds: [] };
          next.set(userId, {
            ...existing,
            selectedNodeIds: eventData.eventData.selectedNodeIds,
          });
          setUserIdsBySelectedNodeId(buildShapeSelectionsIndex(next));
          return next;
        });
      }
    },
    { ignoreSelfUpdates: true },
  );

  return {
    remoteUsersByUserId,
    userIdsBySelectedNodeId,
  };
}
