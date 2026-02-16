import { EventStream } from "@/lib/event-stream-atoms";
import { Atom, Registry, Result } from "@effect-atom/atom-react";
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientError from "@effect/platform/HttpClientError";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";
import * as RpcTest from "@effect/rpc/RpcTest";
import { afterEach, beforeEach, describe, expect, it, vitest } from "@effect/vitest";
import { Folder, type FolderId } from "@example/domain/api/files/files-rpc";
import * as DateTime from "effect/DateTime";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import {
  activeUploadsAtom,
  Api,
  FilePicker,
  FileSync,
  ImageCompressionClient,
  runtime,
  uploadAtom,
} from "./files-atoms";
import { ImageCompressionRpc } from "./internal/image-compression-rpc";

// ================================
// Test Constants
// ================================

const TEST_FILE_KEY = "ut-test-file-key-123";

const createTestFile = (name: string, content: string, type: string, size?: number): File => {
  const file = new File([content], name, { type });
  if (size !== undefined) {
    Object.defineProperty(file, "size", { value: size });
  }
  return file;
};

// ================================
// Mock Factories
// ================================

const makeApiMock = (options?: {
  initiateUploadResponse?: {
    presignedUrl: string;
    fields: Record<string, string>;
    fileKey: string;
  };
  shouldFail?: boolean;
}) => {
  const calls: Array<{ method: string; args: unknown }> = [];

  const layer = Layer.mock(Api, {
    _tag: "@example/client/routes/files/-files/files-atoms/Api",
    list: () => {
      calls.push({ method: "list", args: {} });
      return Stream.empty;
    },
    initiateUpload: (payload) => {
      calls.push({ method: "initiateUpload", args: payload });
      if (options?.shouldFail) {
        return Effect.dieMessage("Upload failed");
      }
      return Effect.succeed(
        options?.initiateUploadResponse ?? {
          presignedUrl: "https://s3.example.com/upload",
          fields: { key: "test-key" },
          fileKey: TEST_FILE_KEY,
        },
      );
    },
    deleteFiles: (payload) => {
      calls.push({ method: "deleteFiles", args: payload });
      return Effect.void;
    },
    deleteFolders: (payload) => {
      calls.push({ method: "deleteFolders", args: payload });
      return Effect.void;
    },
    createFolder: (payload) => {
      calls.push({ method: "createFolder", args: payload });
      return Effect.succeed(
        new Folder({
          id: "00000000-0000-0000-0000-000000000001" as FolderId,
          name: payload.folderName,
          createdAt: DateTime.unsafeNow(),
          updatedAt: DateTime.unsafeNow(),
        }),
      );
    },
    moveFiles: (payload) => {
      calls.push({ method: "moveFiles", args: payload });
      return Effect.void;
    },
    getFilesByKeys: (payload) => {
      calls.push({ method: "getFilesByKeys", args: payload });
      return Effect.succeed([]);
    },
  });

  return { layer, calls };
};

const makeHttpClientMock = (options?: { shouldFail?: boolean }) => {
  const calls: Array<{ url: string }> = [];

  const mockClient = HttpClient.make((request) => {
    calls.push({ url: request.url });
    if (options?.shouldFail) {
      return Effect.fail(
        new HttpClientError.ResponseError({
          request,
          response: HttpClientResponse.fromWeb(request, new Response(null, { status: 500 })),
          reason: "StatusCode",
        }),
      );
    }
    return Effect.succeed(HttpClientResponse.fromWeb(request, new Response(null, { status: 200 })));
  });

  const layer = Layer.succeed(HttpClient.HttpClient, mockClient);

  return { layer, calls };
};

const makeFilePickerMock = (file: File | null) =>
  Layer.mock(FilePicker, {
    _tag: "@example/client/routes/files/-files/files-atoms/FilePicker",
    open: file ? Effect.succeed(Option.some(file)) : Effect.succeed(Option.none()),
  });

const makeFileSyncMock = () => {
  const completionSignals = new Map<string, Deferred.Deferred<void>>();

  const triggerFileArrival = (uploadthingKey: string) =>
    Effect.gen(function* () {
      const deferred = completionSignals.get(uploadthingKey);
      if (deferred) {
        yield* Deferred.succeed(deferred, undefined);
        completionSignals.delete(uploadthingKey);
      }
    });

  const layer = Layer.mock(FileSync, {
    _tag: "@example/client/routes/files/-files/files-atoms/FileSync",
    completionSignals: new Map(),
    signalFileArrived: (uploadthingKey: string) => {
      const deferred = completionSignals.get(uploadthingKey);
      if (deferred) {
        Deferred.unsafeDone(deferred, Effect.void);
        completionSignals.delete(uploadthingKey);
      }
    },
    waitForFile: (uploadthingKey: string, _uploadId: string) =>
      Effect.gen(function* () {
        const deferred = yield* Deferred.make<void>();
        completionSignals.set(uploadthingKey, deferred);
        yield* Deferred.await(deferred);
      }),
  });

  return { layer, triggerFileArrival, completionSignals };
};

const makeEventStreamMock = () => {
  const events: Array<unknown> = [];

  const layer = Layer.mock(EventStream, {
    _tag: "@example/client/services/atoms/event-stream-atoms/EventStream",
    changes: Stream.empty,
    publish: (event) =>
      Effect.sync(() => {
        events.push(event);
        return true;
      }),
  });

  return { layer, events };
};

const makeImageCompressionMock = () => {
  const handlers = ImageCompressionRpc.toLayer(
    ImageCompressionRpc.of({
      compress: (payload) =>
        Effect.succeed({
          data: payload.data,
          mimeType: payload.mimeType,
        }),
    }),
  );

  return Layer.scoped(
    ImageCompressionClient,
    Effect.gen(function* () {
      const client = yield* RpcTest.makeClient(ImageCompressionRpc);
      return ImageCompressionClient.make({ client });
    }),
  ).pipe(Layer.provide(handlers));
};

// ================================
// Test Layer Composition
// ================================

const makeTestLayer = (options?: {
  apiOptions?: Parameters<typeof makeApiMock>[0];
  httpOptions?: Parameters<typeof makeHttpClientMock>[0];
  file?: File | null;
}) => {
  const { layer: apiLayer, calls: apiCalls } = makeApiMock(options?.apiOptions);
  const { layer: httpLayer, calls: httpCalls } = makeHttpClientMock(options?.httpOptions);
  const filePickerLayer = makeFilePickerMock(options?.file ?? null);
  const { layer: fileSyncLayer, triggerFileArrival, completionSignals } = makeFileSyncMock();
  const { layer: eventStreamLayer, events } = makeEventStreamMock();
  const imageCompressionLayer = makeImageCompressionMock();

  const testLayer = Layer.mergeAll(
    apiLayer,
    httpLayer,
    filePickerLayer,
    fileSyncLayer,
    eventStreamLayer,
    imageCompressionLayer,
  );

  return {
    testLayer,
    apiCalls,
    httpCalls,
    triggerFileArrival,
    completionSignals,
    events,
  };
};

// ================================
// Tests
// ================================

describe("files-atoms", () => {
  beforeEach(() => {
    vitest.useFakeTimers();
  });

  afterEach(() => {
    vitest.useRealTimers();
  });

  describe("uploadAtom", () => {
    it("completes upload flow for small text files", async () => {
      const file = createTestFile("test.txt", "test content", "text/plain");
      const { testLayer, apiCalls, httpCalls, triggerFileArrival } = makeTestLayer({ file });

      const r = Registry.make({
        initialValues: [Atom.initialValue(runtime.layer, testLayer)],
      });

      const uploadId = "test-upload-1";
      const upload = uploadAtom(uploadId);
      const unmount = r.mount(upload);

      r.set(upload, { file, folderId: null });

      await vitest.advanceTimersByTimeAsync(0);
      let result = r.get(upload);
      expect(Result.isSuccess(result)).toBe(true);

      if (Result.isSuccess(result)) {
        expect(["Uploading", "Syncing"]).toContain(result.value._tag);
      }

      await Effect.runPromise(triggerFileArrival(TEST_FILE_KEY));
      await vitest.advanceTimersByTimeAsync(0);

      result = r.get(upload);
      if (Result.isSuccess(result)) {
        expect(result.value._tag).toBe("Done");
      }

      expect(apiCalls.some((c) => c.method === "initiateUpload")).toBe(true);
      expect(httpCalls).toHaveLength(1);

      unmount();
    });

    it("cancels upload when Atom.Interrupt is set", async () => {
      const file = createTestFile("test.txt", "test content", "text/plain");
      const { testLayer } = makeTestLayer({ file });

      const r = Registry.make({
        initialValues: [Atom.initialValue(runtime.layer, testLayer)],
      });

      const uploadId = "test-upload-cancel";
      const upload = uploadAtom(uploadId);
      const unmount = r.mount(upload);

      r.set(upload, { file, folderId: null });

      await vitest.advanceTimersByTimeAsync(0);
      let result = r.get(upload);
      expect(Result.isSuccess(result)).toBe(true);

      r.set(upload, Atom.Interrupt);
      await Effect.runPromise(Effect.yieldNow());

      result = r.get(upload);
      expect(Result.isInterrupted(result)).toBe(true);

      unmount();
    });

    it("handles multiple concurrent uploads independently", async () => {
      const file1 = createTestFile("file1.txt", "content 1", "text/plain");
      const file2 = createTestFile("file2.txt", "content 2", "text/plain");
      const { testLayer } = makeTestLayer({ file: file1 });

      const r = Registry.make({
        initialValues: [Atom.initialValue(runtime.layer, testLayer)],
      });

      const upload1 = uploadAtom("upload-1");
      const upload2 = uploadAtom("upload-2");

      const unmount1 = r.mount(upload1);
      const unmount2 = r.mount(upload2);

      r.set(upload1, { file: file1, folderId: null });
      r.set(upload2, { file: file2, folderId: null });

      await vitest.advanceTimersByTimeAsync(0);

      const result1 = r.get(upload1);
      const result2 = r.get(upload2);

      expect(Result.isSuccess(result1)).toBe(true);
      expect(Result.isSuccess(result2)).toBe(true);

      if (Result.isSuccess(result1)) {
        expect(["Uploading", "Syncing"]).toContain(result1.value._tag);
      }
      if (Result.isSuccess(result2)) {
        expect(["Uploading", "Syncing"]).toContain(result2.value._tag);
      }

      r.set(upload1, Atom.Interrupt);
      await Effect.runPromise(Effect.yieldNow());

      expect(Result.isInterrupted(r.get(upload1))).toBe(true);

      const result2AfterCancel = r.get(upload2);
      expect(Result.isSuccess(result2AfterCancel)).toBe(true);

      unmount1();
      unmount2();
    });
  });

  describe("activeUploadsAtom", () => {
    it("starts empty", () => {
      const r = Registry.make();
      const active = r.get(activeUploadsAtom);
      expect(active).toHaveLength(0);
    });
  });

  describe("cancelUploadAtom", () => {
    it("Atom.Interrupt interrupts the upload", async () => {
      const file = createTestFile("test.txt", "test content", "text/plain");
      const { testLayer } = makeTestLayer({ file });

      const r = Registry.make({
        initialValues: [Atom.initialValue(runtime.layer, testLayer)],
      });

      const uploadId = "test-cancel-upload";
      const upload = uploadAtom(uploadId);
      const unmount = r.mount(upload);

      r.set(upload, { file, folderId: null });

      await vitest.advanceTimersByTimeAsync(0);

      r.set(upload, Atom.Interrupt);
      await Effect.runPromise(Effect.yieldNow());

      expect(Result.isInterrupted(r.get(upload))).toBe(true);

      unmount();
    });
  });

  describe("error handling", () => {
    it("sets failure state when API initiate upload fails", async () => {
      const file = createTestFile("test.txt", "test content", "text/plain");
      const { testLayer } = makeTestLayer({
        file,
        apiOptions: { shouldFail: true },
      });

      const r = Registry.make({
        initialValues: [Atom.initialValue(runtime.layer, testLayer)],
      });

      const uploadId = "test-upload-fail-api";
      const upload = uploadAtom(uploadId);
      const unmount = r.mount(upload);

      r.set(upload, { file, folderId: null });

      await vitest.advanceTimersByTimeAsync(0);

      const result = r.get(upload);
      expect(Result.isFailure(result)).toBe(true);

      unmount();
    });
  });
});
