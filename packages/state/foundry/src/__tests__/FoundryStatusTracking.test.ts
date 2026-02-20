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

import type { Document } from "@osdk/foundry.pack";
import { Documents } from "@osdk/foundry.pack";
import type { PackAppInternal } from "@palantir/pack.core";
import type { DocumentId, DocumentSchema } from "@palantir/pack.document-schema.model-types";
import { Metadata } from "@palantir/pack.document-schema.model-types";
import { createDocRef, DocumentLoadStatus, type DocumentStatus } from "@palantir/pack.state.core";
import type { FoundryEventService, SyncSession } from "@palantir/pack.state.foundry-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockProxy } from "vitest-mock-extended";
import { mock } from "vitest-mock-extended";
import type { FoundryDocumentService } from "../FoundryDocumentService.js";
import { internalCreateFoundryDocumentService } from "../FoundryDocumentService.js";

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock("@osdk/foundry.pack", () => ({
  Documents: {
    get: vi.fn(),
  },
}));

const mockAuthModule = {
  onTokenChange: vi.fn(),
  getToken: vi.fn().mockReturnValue("mock-token"),
};

const mockLogger = {
  child: vi.fn(),
  debug: vi.fn((...args: unknown[]) => {
    console.log("[DEBUG]", ...args);
  }),
  error: vi.fn((...args: unknown[]) => {
    console.error("[ERROR]", ...args);
  }),
  info: vi.fn((...args: unknown[]) => {
    console.log("[INFO]", ...args);
  }),
  warn: vi.fn((...args: unknown[]) => {
    console.warn("[WARN]", ...args);
  }),
};

mockLogger.child.mockReturnValue(mockLogger);

const mockOsdkClient = {};

const mockApp = {
  getModule: vi.fn().mockReturnValue(mockAuthModule),
  config: {
    logger: mockLogger,
    osdkClient: mockOsdkClient,
    remote: {
      packWsPath: "/ws",
      baseUrl: "https://test.example.com",
    },
  },
} as unknown as PackAppInternal;

const testSchema = {
  [Metadata]: {
    version: 1,
  },
} as const satisfies DocumentSchema;

const mockDocument: Document = {
  id: "test-doc",
  name: "Test Document",
  documentTypeName: "TestType",
} as Document;

describe("Foundry Document Status Tracking", () => {
  let mockEventService: MockProxy<FoundryEventService>;
  let service: FoundryDocumentService;
  let sessionCounter: number;

  beforeEach(() => {
    vi.useFakeTimers();
    mockEventService = mock();
    sessionCounter = 0;

    vi.mocked(Documents.get).mockResolvedValue(mockDocument);

    mockEventService.startDocumentSync.mockImplementation((documentId, _yDoc, onStatusChange) => {
      const session: SyncSession = {
        clientId: `test-client-${++sessionCounter}`,
        documentId,
      };

      void Promise.resolve().then(() => {
        onStatusChange({
          load: DocumentLoadStatus.LOADED,
        });
      });

      return session;
    });

    mockEventService.stopDocumentSync.mockImplementation(() => {});

    service = internalCreateFoundryDocumentService(mockApp, {}, mockEventService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(Documents.get).mockClear();
  });

  describe("metadata loading", () => {
    const unsubscribes: Array<() => void> = [];

    afterEach(() => {
      unsubscribes.forEach(fn => {
        fn();
      });
      unsubscribes.length = 0;
    });

    it("should load metadata from backend on metadata subscription", async () => {
      const docRef = createDocRef(mockApp, "test-doc-1" as DocumentId, testSchema);

      const statusUpdates: DocumentStatus[] = [];

      unsubscribes.push(service.onStatusChange(docRef, (_, status) => {
        statusUpdates.push(status);
      }));

      unsubscribes.push(service.onMetadataChange(docRef, () => {}));

      await vi.runAllTimersAsync();

      expect(Documents.get).toHaveBeenCalledWith(mockOsdkClient, "test-doc-1", {
        preview: true,
      });

      const finalStatus = statusUpdates.at(-1);
      expect(finalStatus).toBeDefined();
      expect(finalStatus?.metadata.load).toBe(DocumentLoadStatus.LOADED);
      expect(finalStatus?.metadataError).toBeUndefined();
    });

    it("should handle backend loading errors", async () => {
      const error = new Error("Backend failed");
      vi.mocked(Documents.get).mockRejectedValueOnce(error);

      const docRef = createDocRef(mockApp, "test-doc-2" as DocumentId, testSchema);

      const statusUpdates: DocumentStatus[] = [];

      unsubscribes.push(service.onStatusChange(docRef, (_, status) => {
        statusUpdates.push(status);
      }));

      unsubscribes.push(service.onMetadataChange(docRef, () => {}));

      await vi.runAllTimersAsync();

      const finalStatus = statusUpdates.at(-1);
      expect(finalStatus).toBeDefined();
      expect(finalStatus?.metadata.load).toBe(DocumentLoadStatus.ERROR);
      expect(finalStatus?.metadataError).toMatchObject({
        cause: error,
        message: "Failed to load document metadata",
      });
    });

    it("should not reload from backend if already loaded", async () => {
      const docRef = createDocRef(mockApp, "test-doc-3" as DocumentId, testSchema);

      unsubscribes.push(service.onMetadataChange(docRef, () => {}));
      await vi.runAllTimersAsync();

      vi.mocked(Documents.get).mockClear();

      unsubscribes.push(service.onMetadataChange(docRef, () => {}));
      await vi.runAllTimersAsync();

      expect(Documents.get).not.toHaveBeenCalled();
    });

    it("should handle concurrent subscriptions efficiently", async () => {
      const docRef = createDocRef(mockApp, "test-doc-4" as DocumentId, testSchema);

      unsubscribes.push(
        service.onMetadataChange(docRef, () => {}),
        service.onMetadataChange(docRef, () => {}),
        service.onMetadataChange(docRef, () => {}),
      );

      await vi.runAllTimersAsync();

      expect(Documents.get).toHaveBeenCalledTimes(1);
    });

    it("should reject waitForLoad promises on error", async () => {
      const error = new Error("Test failure!");
      vi.mocked(Documents.get).mockRejectedValueOnce(error);

      const docRef = createDocRef(mockApp, "test-doc-5" as DocumentId, testSchema);

      unsubscribes.push(service.onMetadataChange(docRef, () => {}));

      await expect(service.waitForMetadataLoad(docRef)).rejects.toThrow("Metadata load error");
    });

    it("should resolve waitForLoad promises when already loaded", async () => {
      const docRef = createDocRef(mockApp, "test-doc-6" as DocumentId, testSchema);

      unsubscribes.push(service.onMetadataChange(docRef, () => {}));
      await vi.runAllTimersAsync();

      await expect(service.waitForMetadataLoad(docRef)).resolves.toBeUndefined();
    });
  });

  describe("websocket data loading", () => {
    const unsubscribes: Array<() => void> = [];

    afterEach(() => {
      unsubscribes.forEach(fn => {
        fn();
      });
      unsubscribes.length = 0;
    });

    it("should load data via websocket on data subscription", async () => {
      const docRef = createDocRef(mockApp, "test-doc-7" as DocumentId, testSchema);

      const statusUpdates: DocumentStatus[] = [];

      unsubscribes.push(service.onStatusChange(docRef, (_, status) => {
        statusUpdates.push(status);
      }));

      unsubscribes.push(service.onStateChange(docRef, () => {}));

      await vi.runAllTimersAsync();

      expect(Documents.get).not.toHaveBeenCalled();
      expect(mockEventService.startDocumentSync).toHaveBeenCalled();

      const finalStatus = statusUpdates.at(-1);
      expect(finalStatus).toBeDefined();
      expect(finalStatus?.data.load).toBe(DocumentLoadStatus.LOADED);
      expect(finalStatus?.dataError).toBeUndefined();
    });

    it("should handle fast unsubscribe before websocket subscription completes", async () => {
      const docRef = createDocRef(mockApp, "test-doc-8" as DocumentId, testSchema);

      const statusUpdates: DocumentStatus[] = [];
      unsubscribes.push(service.onStatusChange(docRef, (_, status) => {
        statusUpdates.push(status);
      }));

      const unsubscribeState = service.onStateChange(docRef, () => {});

      unsubscribeState();

      await vi.runAllTimersAsync();

      expect(mockEventService.stopDocumentSync).toHaveBeenCalled();
    });

    it("should handle websocket subscription errors and update data status to ERROR", async () => {
      mockEventService.startDocumentSync.mockImplementationOnce(
        (documentId, _yDoc, onStatusChange) => {
          const session: SyncSession = {
            clientId: `test-client-${++sessionCounter}`,
            documentId,
          };

          void Promise.resolve().then(() => {
            onStatusChange({
              error: new Error("WebSocket subscription failed"),
              load: DocumentLoadStatus.ERROR,
            });
          });

          return session;
        },
      );

      const docRef = createDocRef(mockApp, "test-doc-9" as DocumentId, testSchema);

      const statusUpdates: DocumentStatus[] = [];
      unsubscribes.push(service.onStatusChange(docRef, (_, status) => {
        statusUpdates.push(status);
      }));

      unsubscribes.push(service.onStateChange(docRef, () => {}));

      await vi.runAllTimersAsync();

      const finalStatus = statusUpdates.at(-1);
      expect(finalStatus).toBeDefined();
      expect(finalStatus?.data.load).toBe(DocumentLoadStatus.ERROR);
      expect(finalStatus?.dataError).toBeDefined();
    });

    it("should handle error messages from websocket and update data status", async () => {
      mockEventService.startDocumentSync.mockImplementationOnce(
        (documentId, _yDoc, onStatusChange) => {
          const session: SyncSession = {
            clientId: `test-client-${++sessionCounter}`,
            documentId,
          };

          void Promise.resolve().then(() => {
            onStatusChange({
              load: DocumentLoadStatus.LOADED,
            });
          }).then(() => {
            onStatusChange({
              error: new Error("Sync failed"),
              load: DocumentLoadStatus.ERROR,
            });
          });

          return session;
        },
      );

      const docRef = createDocRef(mockApp, "test-doc-10" as DocumentId, testSchema);

      const statusUpdates: DocumentStatus[] = [];
      unsubscribes.push(service.onStatusChange(docRef, (_, status) => {
        statusUpdates.push(status);
      }));

      unsubscribes.push(service.onStateChange(docRef, () => {}));

      await vi.runAllTimersAsync();

      const finalStatus = statusUpdates.at(-1);
      expect(finalStatus).toBeDefined();
      expect(finalStatus?.data.load).toBe(DocumentLoadStatus.ERROR);
      expect(finalStatus?.dataError).toBeDefined();
    });

    it("should update data status to LOADED after successful websocket subscription", async () => {
      const docRef = createDocRef(mockApp, "test-doc-11" as DocumentId, testSchema);

      const statusUpdates: DocumentStatus[] = [];
      unsubscribes.push(service.onStatusChange(docRef, (_, status) => {
        statusUpdates.push(status);
      }));

      unsubscribes.push(service.onStateChange(docRef, () => {}));

      await vi.runAllTimersAsync();

      const statusAfterSubscribe = statusUpdates.at(-1);
      expect(statusAfterSubscribe).toBeDefined();
      expect(statusAfterSubscribe?.data.load).toBe(DocumentLoadStatus.LOADED);
      expect(statusAfterSubscribe?.dataError).toBeUndefined();
    });
  });

  describe("combined metadata and data loading", () => {
    const unsubscribes: Array<() => void> = [];

    afterEach(() => {
      unsubscribes.forEach(fn => {
        fn();
      });
      unsubscribes.length = 0;
    });

    it("should separate metadata and data loading", async () => {
      const docRef = createDocRef(mockApp, "test-doc-12" as DocumentId, testSchema);

      const statusUpdatesBeforeData: DocumentStatus[] = [];
      const statusUpdatesAfterData: DocumentStatus[] = [];

      unsubscribes.push(service.onStatusChange(docRef, (_, status) => {
        statusUpdatesAfterData.push(status);
      }));

      unsubscribes.push(service.onMetadataChange(docRef, () => {}));
      await vi.runAllTimersAsync();

      unsubscribes.push(service.onStatusChange(docRef, (_, status) => {
        statusUpdatesBeforeData.push(status);
      }));

      unsubscribes.push(service.onStateChange(docRef, () => {}));

      await vi.runAllTimersAsync();

      expect(Documents.get).toHaveBeenCalledTimes(1);
      expect(mockEventService.startDocumentSync).toHaveBeenCalled();

      const finalStatus = statusUpdatesAfterData.at(-1);
      expect(finalStatus).toBeDefined();
      expect(finalStatus?.metadata.load).toBe(DocumentLoadStatus.LOADED);
      expect(finalStatus?.data.load).toBe(DocumentLoadStatus.LOADED);
    });
  });
});
