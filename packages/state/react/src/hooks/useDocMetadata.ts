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
  DocumentMetadata,
  DocumentRef,
  DocumentSchema,
} from "@palantir/pack.document-schema.model-types";
import { isValidDocRef } from "@palantir/pack.state.core";
import { useEffect, useState } from "react";

interface ReturnType {
  isMetadataLoading: boolean;
  metadata: DocumentMetadata | undefined;
}

/**
 * Gets the metadata for the specified document reference.
 *
 * @param docRef The document reference to get metadata for.
 * @returns The document metadata, or undefined if the document is not found.
 * The object itself is unstable though the fields within it are stable.
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
 *   if (metadata == null) {
 *     return <div>Document not found</div>;
 *   }
 *   return (<div>
 *     <h1>{metadata?.name}</h1>
 *     <p>{metadata?.description}</p>
 *    </div>);
 * };
 * ```
 */
export function useDocMetadata<D extends DocumentSchema>(
  docRef: DocumentRef<D>,
): ReturnType {
  const [metadata, setMetadata] = useState<DocumentMetadata>();

  useEffect(() => {
    setMetadata(undefined);

    if (!isValidDocRef(docRef)) {
      return;
    }

    // TODO: much more sensible upstream loading state

    const unsubscribeToMetadataChanges = docRef.onMetadataChange((_docRef, metadata) => {
      setMetadata(metadata);
    });

    return () => {
      unsubscribeToMetadataChanges();
      setMetadata(undefined);
    };
  }, [docRef]);

  return { isMetadataLoading: metadata == null, metadata };
}
