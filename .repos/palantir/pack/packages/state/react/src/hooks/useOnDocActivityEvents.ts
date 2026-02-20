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

import type { ActivityEvent, DocumentRef } from "@palantir/pack.document-schema.model-types";
import { isValidDocRef } from "@palantir/pack.state.core";
import { useEffect, useRef } from "react";

/**
 * Registers a callback to be invoked on document activity events.
 *
 * @experimental
 *
 * @param docRef The document reference to listen for activity events on.
 * @param onActivity The callback to invoke when an activity event occurs.
 *
 * @example
 * ```tsx
 * import { useOnDocActivityEvents, useDocRef } from "@palantir/pack.state.react";
 * import { DocumentSchema } from "@myapp/schema";
 * import { app } from "./appInstance";
 *
 * const MyComponent: React.FC<{ documentId: string | undefined }> = ({ documentId }) => {
 *   const docRef = useDocRef(app, DocumentSchema, documentId);
 *   useOnDocActivityEvents(docRef, (event) => {
 *     // Handle the activity event, eg display a notification or populate a panel.
 *   });
 * };
 */
export function useOnDocActivityEvents(
  docRef: DocumentRef,
  onActivity: (data: ActivityEvent) => void,
): void {
  const callback = useRef<(typeof onActivity) | null>(onActivity);
  callback.current = onActivity; // always use latest

  useEffect(() => {
    if (!isValidDocRef(docRef)) {
      return;
    }

    const unsubscribe = docRef.onActivity((_inDocRef, event) => {
      callback.current?.(event);
    });

    return () => {
      unsubscribe();
    };
  }, [docRef]);
}
