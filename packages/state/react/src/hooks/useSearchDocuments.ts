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
  DocumentMetadata,
  DocumentSchema,
} from "@palantir/pack.document-schema.model-types";
import type { WithStateModule } from "@palantir/pack.state.core";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_PAGE_SIZE = 10;

interface UseSearchDocumentsResult {
  readonly isLoading: boolean;
  readonly error: Error | undefined;
  readonly results: ReadonlyArray<DocumentMetadata & { readonly id: DocumentId }> | undefined;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly goToNextPage: () => void;
  readonly goToPreviousPage: () => void;
  readonly goToFirstPage: () => void;
  readonly currentPage: number;
}

export function useSearchDocuments<T extends DocumentSchema>(
  app: WithStateModule<PackApp>,
  documentTypeName: string,
  schema: T,
  documentName?: string,
  pageSize: number = DEFAULT_PAGE_SIZE,
): UseSearchDocumentsResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [results, setResults] = useState<
    ReadonlyArray<DocumentMetadata & { readonly id: DocumentId }> | undefined
  >(undefined);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const pendingRequestRef = useRef<number>(0);

  const search = useCallback(
    async (
      searchDocumentName?: string,
      searchPageSize: number = DEFAULT_PAGE_SIZE,
      pageToken?: string,
    ) => {
      const requestRef = ++pendingRequestRef.current;

      setIsLoading(true);
      setError(undefined);

      try {
        const searchResult = await app.state.searchDocuments(
          documentTypeName,
          schema,
          { documentName: searchDocumentName, pageSize: searchPageSize, pageToken },
        );
        if (requestRef === pendingRequestRef.current) {
          setResults(searchResult.data);
          setNextPageToken(searchResult.nextPageToken);
        }
      } catch (e) {
        if (requestRef === pendingRequestRef.current) {
          const error = e instanceof Error ? e : new Error("Failed to search documents");
          setError(error);
        }
      } finally {
        if (requestRef === pendingRequestRef.current) {
          setIsLoading(false);
        }
      }
    },
    [app.state, documentTypeName, schema],
  );

  useEffect(() => {
    setCurrentPage(1);
    setNextPageToken(undefined);
  }, [documentName, pageSize]);

  useEffect(() => {
    if (currentPage === 1) {
      void search(documentName, pageSize, undefined);
    }
  }, [search, documentName, pageSize, currentPage]);

  useEffect(() => {
    return () => {
      // Invalidate any pending requests on unmount
      pendingRequestRef.current++;
    };
  }, []);

  const goToNextPage = useCallback(() => {
    if (nextPageToken != null) {
      setCurrentPage(p => p + 1);
      void search(documentName, pageSize, nextPageToken);
    }
  }, [search, documentName, pageSize, nextPageToken]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      const token = newPage > 1 ? String((newPage - 1) * pageSize) : undefined;
      setCurrentPage(newPage);
      void search(documentName, pageSize, token);
    }
  }, [search, documentName, pageSize, currentPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
    void search(documentName, pageSize, undefined);
  }, [search, documentName, pageSize]);

  const hasNextPage = nextPageToken != null;

  return {
    currentPage,
    error,
    goToFirstPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage: currentPage > 1,
    isLoading,
    results,
  };
}
