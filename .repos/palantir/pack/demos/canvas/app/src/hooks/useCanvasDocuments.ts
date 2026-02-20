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

import { DocumentModel } from "@demo/canvas.sdk";
import { useSearchDocuments } from "@palantir/pack.state.react";
import { DOCUMENT_TYPE_NAME } from "../app.js";
import { usePackApp } from "./usePackApp.js";

export interface CanvasDocument {
  readonly createdTime?: string;
  readonly id: string;
  readonly name: string;
}

export interface UseCanvasDocumentsResult {
  readonly documents: readonly CanvasDocument[];
  readonly error: Error | undefined;
  readonly isLoading: boolean;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly goToNextPage: () => void;
  readonly goToPreviousPage: () => void;
  readonly goToFirstPage: () => void;
  readonly currentPage: number;
}

const PAGE_SIZE = 10;

export function useCanvasDocuments(): UseCanvasDocumentsResult {
  const app = usePackApp();
  const {
    results,
    isLoading,
    error,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    currentPage,
  } = useSearchDocuments(app, DOCUMENT_TYPE_NAME, DocumentModel, undefined, PAGE_SIZE);

  const documents = results?.map(r => ({ createdTime: r.createdTime, id: r.id, name: r.name }))
    ?? [];

  return {
    currentPage,
    documents,
    error,
    goToFirstPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
  };
}
