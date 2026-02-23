/**
 * Tests for ParallelHasher service interface
 *
 * Since we're running in Bun runtime (not browser), we cannot use
 * BrowserWorker or FileReader. Instead, we create a mock layer that
 * implements ParallelHasherService using synchronous MD5 computation.
 *
 * This tests the service interface, context usage, and Effect patterns
 * without requiring browser-specific APIs.
 *
 * @module
 */

import { describe, expect, live } from "@beep/testkit";
import { WorkerHashError } from "@beep/utils/md5/errors";
import { appendByteArray, finalize, makeState } from "@beep/utils/md5/md5";
import { DEFAULT_CHUNK_SIZE, DEFAULT_POOL_SIZE, hashBlob, ParallelHasher } from "@beep/utils/md5/parallel-hasher";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";

/**
 * Convert a string to a Uint8Array using Effect utilities.
 */
const stringToUint8Array = (str: string): Uint8Array => {
  const length = F.pipe(str, Str.length);
  const buff = new ArrayBuffer(length);
  const arr = new Uint8Array(buff);

  const charCodes = F.pipe(
    A.range(0, length - 1),
    A.map((i) =>
      F.pipe(
        str,
        Str.charCodeAt(i),
        O.getOrElse(() => 0)
      )
    )
  );

  F.pipe(
    charCodes,
    A.forEach((code, i) => {
      arr[i] = code;
    })
  );

  return arr;
};

/**
 * Hash a blob synchronously using Effect patterns.
 * This is a Bun-compatible implementation that doesn't use FileReader.
 */
const hashBlobBun = (blob: Blob, chunkSize: number): Effect.Effect<string, WorkerHashError> =>
  Effect.gen(function* () {
    const arrayBuffer = yield* Effect.tryPromise({
      try: () => blob.arrayBuffer(),
      catch: (cause) =>
        new WorkerHashError({
          message: "Failed to read blob as array buffer",
          cause,
        }),
    });

    const fullArray = new Uint8Array(arrayBuffer);
    const totalChunks = Math.ceil(fullArray.length / chunkSize);

    const chunkStream = Stream.range(0, totalChunks - 1).pipe(
      Stream.map((chunkIndex) => {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, fullArray.length);
        return fullArray.slice(start, end);
      })
    );

    const initialState = makeState();

    const finalState = yield* chunkStream.pipe(
      Stream.runFold(initialState, (state, chunk) => F.pipe(state, appendByteArray(chunk)))
    );

    const result = yield* F.pipe(finalState, finalize(false)).pipe(
      Effect.catchAll((error) =>
        Effect.fail(
          new WorkerHashError({
            message: "MD5 computation failed",
            cause: error,
          })
        )
      )
    );

    if (typeof result === "string") {
      return result;
    }

    return yield* Effect.fail(
      new WorkerHashError({
        message: "Expected string result from MD5 finalize",
        cause: result,
      })
    );
  });

/**
 * Test layer that implements ParallelHasherService without workers.
 * This bypasses browser Worker APIs and uses synchronous MD5 computation.
 */
const TestParallelHasher: Layer.Layer<ParallelHasher, never, never> = Layer.succeed(
  ParallelHasher,
  ParallelHasher.of({
    hashBlob: (blob, chunkSize) => hashBlobBun(blob, chunkSize ?? DEFAULT_CHUNK_SIZE),
  })
);

describe("ParallelHasher constants", () => {
  live("DEFAULT_POOL_SIZE is 4", () =>
    Effect.sync(() => {
      expect(DEFAULT_POOL_SIZE).toEqual(4);
    })
  );

  live("DEFAULT_CHUNK_SIZE is 1MB", () =>
    Effect.sync(() => {
      expect(DEFAULT_CHUNK_SIZE).toEqual(1048576);
    })
  );
});

describe("ParallelHasher service interface", () => {
  describe("hashBlob via context", () => {
    live("hashes 'hello' correctly", () =>
      Effect.gen(function* () {
        const hasher = yield* ParallelHasher;
        const blob = new Blob([stringToUint8Array("hello") as BlobPart]);
        const hash = yield* hasher.hashBlob(blob);

        expect(hash).toEqual("5d41402abc4b2a76b9719d911017c592");
      }).pipe(Effect.provide(TestParallelHasher))
    );

    live("hashes empty blob correctly", () =>
      Effect.gen(function* () {
        const hasher = yield* ParallelHasher;
        const blob = new Blob([]);
        const hash = yield* hasher.hashBlob(blob);

        // MD5 of empty string
        expect(hash).toEqual("d41d8cd98f00b204e9800998ecf8427e");
      }).pipe(Effect.provide(TestParallelHasher))
    );

    live("hashes 'The quick brown fox jumps over the lazy dog' correctly", () =>
      Effect.gen(function* () {
        const hasher = yield* ParallelHasher;
        const blob = new Blob([stringToUint8Array("The quick brown fox jumps over the lazy dog") as BlobPart]);
        const hash = yield* hasher.hashBlob(blob);

        expect(hash).toEqual("9e107d9d372bb6826bd81d3542a419d6");
      }).pipe(Effect.provide(TestParallelHasher))
    );
  });

  describe("hashBlob function", () => {
    live("uses ParallelHasher from context", () =>
      hashBlob(new Blob([stringToUint8Array("hello") as BlobPart])).pipe(
        Effect.map((hash) => {
          expect(hash).toEqual("5d41402abc4b2a76b9719d911017c592");
        }),
        Effect.provide(TestParallelHasher)
      )
    );

    live("accepts custom chunk size", () =>
      hashBlob(new Blob([stringToUint8Array("hello") as BlobPart]), 16).pipe(
        Effect.map((hash) => {
          // Same hash regardless of chunk size
          expect(hash).toEqual("5d41402abc4b2a76b9719d911017c592");
        }),
        Effect.provide(TestParallelHasher)
      )
    );
  });

  describe("chunk size variations", () => {
    const largeString =
      "5d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c5925d41402abc4b2a765d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c5925d41402abc4b2a76";

    live("produces consistent hash with default chunk size", () =>
      Effect.gen(function* () {
        const hasher = yield* ParallelHasher;
        const blob = new Blob([stringToUint8Array(largeString) as BlobPart]);
        const hash = yield* hasher.hashBlob(blob);

        expect(hash).toEqual("66a1e6b119bf30ade63378f770e52549");
      }).pipe(Effect.provide(TestParallelHasher))
    );

    live("produces consistent hash with chunk size 16", () =>
      Effect.gen(function* () {
        const hasher = yield* ParallelHasher;
        const blob = new Blob([stringToUint8Array(largeString) as BlobPart]);
        const hash = yield* hasher.hashBlob(blob, 16);

        expect(hash).toEqual("66a1e6b119bf30ade63378f770e52549");
      }).pipe(Effect.provide(TestParallelHasher))
    );

    live("produces consistent hash with chunk size 17 (uneven division)", () =>
      Effect.gen(function* () {
        const hasher = yield* ParallelHasher;
        const blob = new Blob([stringToUint8Array(largeString) as BlobPart]);
        const hash = yield* hasher.hashBlob(blob, 17);

        expect(hash).toEqual("66a1e6b119bf30ade63378f770e52549");
      }).pipe(Effect.provide(TestParallelHasher))
    );

    live("produces consistent hash with chunk size 64 (MD5 block size)", () =>
      Effect.gen(function* () {
        const hasher = yield* ParallelHasher;
        const blob = new Blob([stringToUint8Array(largeString) as BlobPart]);
        const hash = yield* hasher.hashBlob(blob, 64);

        expect(hash).toEqual("66a1e6b119bf30ade63378f770e52549");
      }).pipe(Effect.provide(TestParallelHasher))
    );

    live("produces consistent hash with very large chunk size", () =>
      Effect.gen(function* () {
        const hasher = yield* ParallelHasher;
        const blob = new Blob([stringToUint8Array(largeString) as BlobPart]);
        const hash = yield* hasher.hashBlob(blob, 10485760); // 10MB

        expect(hash).toEqual("66a1e6b119bf30ade63378f770e52549");
      }).pipe(Effect.provide(TestParallelHasher))
    );
  });

  describe("large blob handling", () => {
    live("hashes large blob (10KB) correctly", () =>
      Effect.gen(function* () {
        const hasher = yield* ParallelHasher;
        // Create a 10KB blob of repeated 'a' characters
        const largeArray = new Uint8Array(10240);
        F.pipe(
          A.range(0, 10239),
          A.forEach((i) => {
            largeArray[i] = 97; // 'a'
          })
        );
        const blob = new Blob([largeArray]);
        const hash = yield* hasher.hashBlob(blob);

        // Pre-computed MD5 of 10240 'a' characters
        expect(hash).toEqual("416671d9da6b155c340c93ca08845194");
      }).pipe(Effect.provide(TestParallelHasher))
    );

    live("hashes exact 64-byte boundary correctly", () =>
      Effect.gen(function* () {
        const hasher = yield* ParallelHasher;
        const str = "5d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c592";
        const blob = new Blob([stringToUint8Array(str) as BlobPart]);
        const hash = yield* hasher.hashBlob(blob);

        expect(hash).toEqual("e0b153045b08d59d4e18a98ab823ac42");
      }).pipe(Effect.provide(TestParallelHasher))
    );

    live("hashes exact 128-byte boundary correctly", () =>
      Effect.gen(function* () {
        const hasher = yield* ParallelHasher;
        const str =
          "5d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c592";
        const blob = new Blob([stringToUint8Array(str) as BlobPart]);
        const hash = yield* hasher.hashBlob(blob);

        expect(hash).toEqual("b12bc24f5507eba4ee27092f70148415");
      }).pipe(Effect.provide(TestParallelHasher))
    );
  });

  describe("consistency between calls", () => {
    live("produces identical hashes for same input", () =>
      Effect.gen(function* () {
        const hasher = yield* ParallelHasher;
        const blob = new Blob([stringToUint8Array("consistency test") as BlobPart]);

        const hash1 = yield* hasher.hashBlob(blob);
        const hash2 = yield* hasher.hashBlob(blob);
        const hash3 = yield* hasher.hashBlob(blob);

        expect(hash1).toEqual(hash2);
        expect(hash2).toEqual(hash3);
      }).pipe(Effect.provide(TestParallelHasher))
    );
  });
});

describe("ParallelHasher Context.Tag", () => {
  live("has correct service identifier", () =>
    Effect.sync(() => {
      expect(Context.isTag(ParallelHasher)).toEqual(true);
    })
  );

  live("can be accessed from Effect context", () =>
    Effect.gen(function* () {
      const service = yield* ParallelHasher;

      expect(typeof service.hashBlob).toEqual("function");
    }).pipe(Effect.provide(TestParallelHasher))
  );
});

describe("Error handling simulation", () => {
  /**
   * Test layer that simulates worker errors
   */
  const FailingParallelHasher: Layer.Layer<ParallelHasher, never, never> = Layer.succeed(
    ParallelHasher,
    ParallelHasher.of({
      hashBlob: () =>
        Effect.fail(
          new WorkerHashError({
            message: "Simulated worker failure",
            cause: new Error("Test error"),
          })
        ),
    })
  );

  live("handles WorkerHashError correctly", () =>
    Effect.gen(function* () {
      const hasher = yield* ParallelHasher;
      const blob = new Blob([stringToUint8Array("test") as BlobPart]);

      const result = yield* hasher
        .hashBlob(blob)
        .pipe(Effect.catchTag("WorkerHashError", (error) => Effect.succeed(`Caught error: ${error.message}`)));

      expect(result).toEqual("Caught error: Simulated worker failure");
    }).pipe(Effect.provide(FailingParallelHasher))
  );

  live("WorkerHashError has correct _tag", () =>
    Effect.gen(function* () {
      const error = new WorkerHashError({
        message: "Test message",
        cause: null,
      });

      expect(error._tag).toEqual("WorkerHashError");
      expect(error.message).toEqual("Test message");
    })
  );
});
