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

import type { PackApp } from "@palantir/pack.core";
import type {
  DocumentId,
  DocumentRef,
  DocumentSchema,
} from "@palantir/pack.document-schema.model-types";
import { invalidDocRef, type WithStateModule } from "@palantir/pack.state.core";
import { useMemo } from "react";

/**
 * Gets or creates a stable {@link DocumentRef} for the specified document ID and
 * schema.
 *
 * @param app The app instance initialized by your application.
 * @param docSchema The schema of the document from your application's generated
 * model definitions.
 * @param documentId The ID of the document.
 * @returns A stable document reference for the specified document ID and
 * schema, suitable for use in hooks, react deps, and for other state / caching
 * scenarios. This docRef is weakly held within the app instance so any other
 * calls returning a docRef will return the same instance as long as a reference
 * is held somewhere. If `documentId` is `undefined`, returns an invalid docRef.
 *
 * @example
 * ```tsx
 * import { useDocMetadata, useDocRef } from "@palantir/pack.state.react";
 * import { DocumentSchema } from "@myapp/schema";
 * import { app } from "./appInstance";
 *
 * const MyComponent: React.FC<{ documentId: string | undefined }> = ({ documentId }) => {
 *   const docRef = useDocRef(app, DocumentSchema, documentId);
 *   const { isMetadataLoading, metadata } = useDocMetadata(docRef);
 *   if (isMetadataLoading) {
 *     return <Spinner />;
 *   }
 *   return <DocumentViewer document={metadata} />;
 * };
 * ```
 */
export function useDocRef<D extends DocumentSchema>(
  app: WithStateModule<PackApp>,
  docSchema: D,
  documentId: DocumentId | undefined,
): DocumentRef<D> {
  return useMemo(
    () => documentId != null ? app.state.createDocRef(documentId, docSchema) : invalidDocRef(),
    [app, documentId, docSchema],
  );
}
