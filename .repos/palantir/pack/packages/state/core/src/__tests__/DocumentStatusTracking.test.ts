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

import type { DocumentId, DocumentSchema } from "@palantir/pack.document-schema.model-types";
import { Metadata } from "@palantir/pack.document-schema.model-types";
import { describe, expect, it } from "vitest";
import { internalCreateInMemoryDocumentService } from "../service/InMemoryDocumentService.js";
import { createDocRef } from "../types/DocumentRefImpl.js";
import type { DocumentStatus } from "../types/DocumentService.js";
import { DocumentLiveStatus, DocumentLoadStatus } from "../types/DocumentService.js";
import { createTestApp } from "./testUtils.js";

const DOCUMENT_ID = "test-doc" as DocumentId;

const testSchema = {
  [Metadata]: {
    version: 1,
  },
} as const satisfies DocumentSchema;

describe("Document Status Tracking", () => {
  it("should initialize with correct default status", () => {
    const mockApp = createTestApp();
    const service = internalCreateInMemoryDocumentService(mockApp, { autoCreateDocuments: true });
    const docRef = createDocRef(mockApp, DOCUMENT_ID, testSchema);

    const status = service.getDocumentStatus(docRef);

    expect(status.metadata.load).toBe(DocumentLoadStatus.UNLOADED);
    expect(status.metadata.live).toBe(DocumentLiveStatus.DISCONNECTED);
    expect(status.data.load).toBe(DocumentLoadStatus.UNLOADED);
    expect(status.data.live).toBe(DocumentLiveStatus.DISCONNECTED);
    expect(status.metadataError).toBeUndefined();
    expect(status.dataError).toBeUndefined();
  });

  it("should trigger metadata loading on first metadata subscription", async () => {
    const mockApp = createTestApp();
    const service = internalCreateInMemoryDocumentService(mockApp, { autoCreateDocuments: true });
    const docRef = createDocRef(mockApp, DOCUMENT_ID, testSchema);

    const statusUpdates: DocumentStatus[] = [];

    // Subscribe to metadata changes first (triggers loading)
    const unsubscribeMetadata = service.onMetadataChange(docRef, () => {});

    // Then subscribe to status changes (might already be loaded)
    const unsubscribeStatus = service.onStatusChange(docRef, (_, status) => {
      statusUpdates.push(status);
    });

    // Wait for async loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    // The first status we receive should be loaded (since InMemory + autoCreate loads immediately)
    expect(statusUpdates.length).toBeGreaterThanOrEqual(1);
    const finalStatus = statusUpdates.at(-1);
    expect(finalStatus?.metadata.load).toBe(DocumentLoadStatus.LOADED);

    unsubscribeStatus();
    unsubscribeMetadata();
  });

  it("should trigger data loading on first data subscription", async () => {
    const mockApp = createTestApp();
    const service = internalCreateInMemoryDocumentService(mockApp, { autoCreateDocuments: true });
    const docRef = createDocRef(mockApp, DOCUMENT_ID, testSchema);

    const statusUpdates: DocumentStatus[] = [];

    // Subscribe to state changes first (triggers data loading)
    const unsubscribeState = service.onStateChange(docRef, () => {});

    // Then subscribe to status changes (might already be loaded)
    const unsubscribeStatus = service.onStatusChange(docRef, (_, status) => {
      statusUpdates.push(status);
    });

    // Wait for async loading to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    // The first status we receive should be loaded (since InMemory + autoCreate loads immediately)
    expect(statusUpdates.length).toBeGreaterThanOrEqual(1);
    const finalStatus = statusUpdates.at(-1);
    expect(finalStatus?.data.load).toBe(DocumentLoadStatus.LOADED);

    unsubscribeStatus();
    unsubscribeState();
  });

  it("should not reload if already loaded", async () => {
    const mockApp = createTestApp();
    const service = internalCreateInMemoryDocumentService(mockApp, { autoCreateDocuments: true });
    const docRef = createDocRef(mockApp, DOCUMENT_ID, testSchema);

    // First subscription
    const unsubscribe1 = service.onMetadataChange(docRef, () => {});
    await new Promise(resolve => setTimeout(resolve, 0));

    const statusUpdates: DocumentStatus[] = [];

    // Subscribe to status changes after first load
    const unsubscribeStatus = service.onStatusChange(docRef, (_, status) => {
      statusUpdates.push(status);
    });

    // Second subscription should not trigger another load
    const unsubscribe2 = service.onMetadataChange(docRef, () => {});
    await new Promise(resolve => setTimeout(resolve, 0));

    // Should only get the initial status (already loaded)
    expect(statusUpdates).toHaveLength(1);
    expect(statusUpdates[0]?.metadata.load).toBe(DocumentLoadStatus.LOADED);

    unsubscribe1();
    unsubscribe2();
    unsubscribeStatus();
  });

  it("should handle subscription lifecycle correctly", async () => {
    const mockApp = createTestApp();
    const service = internalCreateInMemoryDocumentService(mockApp, { autoCreateDocuments: true });
    const docRef = createDocRef(mockApp, DOCUMENT_ID, testSchema);

    // First subscription
    const unsubscribe1 = service.onMetadataChange(docRef, () => {});
    await new Promise(resolve => setTimeout(resolve, 0));

    // Second subscription
    const unsubscribe2 = service.onMetadataChange(docRef, () => {});

    // Unsubscribe first (should not close subscription)
    unsubscribe1();

    const status1 = service.getDocumentStatus(docRef);
    expect(status1.metadata.load).toBe(DocumentLoadStatus.LOADED);

    // Unsubscribe last (should close subscription but keep loaded state)
    unsubscribe2();

    const status2 = service.getDocumentStatus(docRef);
    expect(status2.metadata.load).toBe(DocumentLoadStatus.LOADED);
  });

  it("should wait for metadata load", async () => {
    const mockApp = createTestApp();
    const service = internalCreateInMemoryDocumentService(mockApp, { autoCreateDocuments: true });
    const docRef = createDocRef(mockApp, DOCUMENT_ID, testSchema);

    // Start metadata subscription in background
    const unsubscribe = service.onMetadataChange(docRef, () => {});

    // Wait for load should resolve
    await expect(service.waitForMetadataLoad(docRef)).resolves.toBeUndefined();

    unsubscribe();
  });

  it("should wait for data load", async () => {
    const mockApp = createTestApp();
    const service = internalCreateInMemoryDocumentService(mockApp, { autoCreateDocuments: true });
    const docRef = createDocRef(mockApp, DOCUMENT_ID, testSchema);

    // Start data subscription in background
    const unsubscribe = service.onStateChange(docRef, () => {});

    // Wait for load should resolve
    await expect(service.waitForDataLoad(docRef)).resolves.toBeUndefined();

    unsubscribe();
  });

  it("should handle multiple subscription types for data loading", async () => {
    const mockApp = createTestApp();
    const service = internalCreateInMemoryDocumentService(mockApp, { autoCreateDocuments: true });
    const docRef = createDocRef(mockApp, DOCUMENT_ID, testSchema);

    // First state subscription
    const unsubscribeState1 = service.onStateChange(docRef, () => {});
    await new Promise(resolve => setTimeout(resolve, 0));

    const statusUpdates: DocumentStatus[] = [];
    const unsubscribeStatus = service.onStatusChange(docRef, (_, status) => {
      statusUpdates.push(status);
    });

    // Second state subscription should not trigger another load
    const unsubscribeState2 = service.onStateChange(docRef, () => {});
    await new Promise(resolve => setTimeout(resolve, 0));

    // Since the document was already loaded before status subscription, we should only see loaded state
    expect(statusUpdates.length).toBeGreaterThanOrEqual(1);
    const allLoadedStatuses = statusUpdates.every(s => s.data.load === DocumentLoadStatus.LOADED);
    expect(allLoadedStatuses).toBe(true);

    unsubscribeState1();
    unsubscribeState2();
    unsubscribeStatus();
  });

  it("should provide immediate status to new subscribers", () => {
    const mockApp = createTestApp();
    const service = internalCreateInMemoryDocumentService(mockApp, { autoCreateDocuments: true });
    const docRef = createDocRef(mockApp, DOCUMENT_ID, testSchema);

    let immediateStatus: DocumentStatus | null = null;

    service.onStatusChange(docRef, (_, status) => {
      immediateStatus = status;
    });

    expect(immediateStatus).toBeTruthy();
    expect(immediateStatus!.metadata.load).toBe(DocumentLoadStatus.UNLOADED);
    expect(immediateStatus!.data.load).toBe(DocumentLoadStatus.UNLOADED);
  });
});
