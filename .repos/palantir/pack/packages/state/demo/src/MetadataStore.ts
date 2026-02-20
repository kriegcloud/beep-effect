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

import type { DocumentId, DocumentMetadata } from "@palantir/pack.document-schema.model-types";
import type { SearchDocumentsResult } from "@palantir/pack.state.core";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";

const METADATA_DB_NAME = "pack-demo-metadata";
const METADATA_MAP_KEY = "documents";

export class MetadataStore {
  private readonly yDoc: Y.Doc;
  private readonly persistence: IndexeddbPersistence;
  private readonly metadataMap: Y.Map<DocumentMetadata>;
  private isReady: boolean = false;
  private readyPromise: Promise<void>;

  constructor(dbPrefix: string = "pack-demo") {
    this.yDoc = new Y.Doc();
    this.metadataMap = this.yDoc.getMap<DocumentMetadata>(METADATA_MAP_KEY);
    this.persistence = new IndexeddbPersistence(`${dbPrefix}-${METADATA_DB_NAME}`, this.yDoc);

    this.readyPromise = this.persistence.whenSynced.then(() => {
      this.isReady = true;
    });
  }

  async whenReady(): Promise<void> {
    return this.readyPromise;
  }

  addDocument(id: DocumentId, metadata: DocumentMetadata): void {
    this.metadataMap.set(id, metadata);
  }

  getDocument(id: DocumentId): DocumentMetadata | undefined {
    return this.metadataMap.get(id);
  }

  searchDocuments(
    typeName: string,
    options?: { documentName?: string; pageSize?: number; pageToken?: string },
  ): SearchDocumentsResult {
    const allResults: Array<DocumentMetadata & { readonly id: DocumentId }> = [];

    for (const [id, metadata] of this.metadataMap.entries()) {
      if (metadata.documentTypeName !== typeName) {
        continue;
      }

      if (options?.documentName && metadata.name !== options.documentName) {
        continue;
      }

      allResults.push({ ...metadata, id: id as DocumentId });
    }

    const pageSize = options?.pageSize ?? allResults.length;
    const offset = options?.pageToken != null ? parseInt(options.pageToken, 10) : 0;
    const paginatedResults = allResults.slice(offset, offset + pageSize);
    const hasMore = offset + pageSize < allResults.length;
    const nextPageToken = hasMore ? String(offset + pageSize) : undefined;

    return { data: paginatedResults, nextPageToken };
  }

  observeDocument(
    id: DocumentId,
    callback: (metadata: DocumentMetadata | undefined) => void,
  ): () => void {
    const handler = () => {
      callback(this.metadataMap.get(id));
    };

    this.metadataMap.observe(handler);

    return () => {
      this.metadataMap.unobserve(handler);
    };
  }

  dispose(): void {
    void this.persistence.destroy();
    this.yDoc.destroy();
  }
}
