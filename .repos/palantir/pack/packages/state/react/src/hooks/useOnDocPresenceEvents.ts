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

import type {
  DocumentRef,
  PresenceEvent,
  PresenceSubscriptionOptions,
} from "@palantir/pack.document-schema.model-types";
import { isValidDocRef } from "@palantir/pack.state.core";
import { useEffect, useRef } from "react";

/**
 * Registers a callback to be invoked on document presence events.
 *
 * @experimental
 *
 * Presence events include user arrive/depart notifications and custom
 * (application-specific) collaborative updates.
 *
 * You can broadcast presence events using the {@link DocumentRef.updateCustomPresence}.
 *
 * @param docRef The document to subscribe to.
 * @param onPresence The callback to invoke when a presence event occurs.
 * @param options Optional presence subscription options.
 *
 * @example
 * ```tsx
 * import { useOnDocPresenceEvents, useDocRef } from "@palantir/pack.state.react";
 * import { CursorUpdateEventModel, DocumentSchema } from "@myapp/schema";
 * import { app } from "./appInstance";
 *
 * const MyComponent: React.FC<{ documentId: string | undefined }> = ({ documentId }) => {
 *   const docRef = useDocRef(app, DocumentSchema, documentId);
 *   const [cursors, setCursors] = useState<Record<string, { x: number; y: number }>>({});
 *   useOnDocPresenceEvents(docRef, ({ userId, eventData }) => {
 *     if (eventData.type === PresenceEventDataType.DEPARTED) {
 *       setCursors(prev => {
 *         const newCursors = { ...prev };
 *         delete newCursors[userId];
 *         return newCursors;
 *       });
 *       return;
 *     }
 *
 *     if (eventData.type !== PresenceEventDataType.CUSTOM_EVENT) {
 *       return;
 *     }
 *     const { model, eventData: data } = eventData;
 *     if (model === CursorUpdateEventModel) {
 *       setCursors(prev => ({
 *         ...prev,
 *         [userId]: data as ModelData<typeof CursorUpdateEventModel>,
 *       }));
 *     }
 *   }, { ignoreSelfUpdates: false });
 *
 *   // NOTE: ideally throttle this in a real app to avoid flooding presence updates
 *   const handleMouseMove = useCallback(
 *     (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
 *       // Broadcast cursor position as a custom presence event
 *       docRef.updateCustomPresence(CursorUpdateEventModel, {
 *         x: e.nativeEvent.offsetX,
 *         y: e.nativeEvent.offsetY,
 *       });
 *     },
 *     [docRef]
 *   );
 *   return (<div onMouseMove={handleMouseMove}>
 *     {Object.entries(cursors).map(([userId, pos]) => (
 *       <Cursor key={userId} x={pos.x} y={pos.y} />
 *     ))}
 *   </div>);
 * };
 * ```
 */
export function useOnDocPresenceEvents(
  docRef: DocumentRef,
  onPresence: (data: PresenceEvent) => void,
  options: PresenceSubscriptionOptions = {},
): void {
  const callback = useRef<(typeof onPresence)>(onPresence);
  callback.current = onPresence;
  const subOptions = useRef<PresenceSubscriptionOptions>(options);
  subOptions.current = options;

  useEffect(() => {
    if (!isValidDocRef(docRef)) {
      return;
    }

    const unsubscribe = docRef.onPresence((_inDocRef, event) => {
      callback.current(event);
    }, subOptions.current);

    return () => {
      unsubscribe();
    };
  }, [docRef]);
}
