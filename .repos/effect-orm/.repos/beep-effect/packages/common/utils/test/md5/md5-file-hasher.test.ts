/**
 * Effect-based tests for MD5 file hashing
 *
 * Note: These tests use Blob.arrayBuffer() which is available in Bun runtime.
 * The FileReader API used by hashBlob is browser-only, so we test the core
 * MD5 functionality with direct buffer access instead.
 *
 * @module
 */

import { describe, expect, live } from "@beep/testkit";
import { appendByteArray, finalize, type Md5ComputationError, makeState } from "@beep/utils/md5/md5";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Stream from "effect/Stream";

describe("MD5 Blob Hashing (Bun runtime)", () => {
  const largeString =
    "5d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c5925d41402abc4b2a765d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c5925d41402abc4b2a76";

  /**
   * Convert a string to a Uint8Array using TextEncoder
   */
  const stringToUint8Array = (str: string): Uint8Array => {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  };

  /**
   * Hash a blob using Bun's Blob.arrayBuffer() method
   * This tests the core MD5 functionality without browser-specific FileReader
   */
  const hashBlobBun = (blob: Blob, chunkSize: number): Effect.Effect<string, Md5ComputationError> =>
    Effect.gen(function* () {
      const arrayBuffer = yield* Effect.promise(() => blob.arrayBuffer());
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

      return yield* F.pipe(
        finalState,
        finalize(false),
        Effect.flatMap((result) => {
          if (typeof result === "string") {
            return Effect.succeed(result);
          }
          return Effect.die(new Error("Expected string result"));
        })
      );
    });

  live("should hash a small blob", () =>
    Effect.gen(function* () {
      const str = "hello";
      const uint8Array = stringToUint8Array(str);
      const blob = new Blob([uint8Array.buffer as ArrayBuffer]);

      const hash = yield* hashBlobBun(blob, 1048576);

      expect(hash).toEqual("5d41402abc4b2a76b9719d911017c592");
    })
  );

  live("should hash a large blob with chunk size 16", () =>
    Effect.gen(function* () {
      const uint8Array = stringToUint8Array(largeString);
      const blob = new Blob([uint8Array.buffer as ArrayBuffer]);

      const hash = yield* hashBlobBun(blob, 16);

      expect(hash).toEqual("66a1e6b119bf30ade63378f770e52549");
    })
  );

  live("should hash a large blob with chunk size 17 (uneven division)", () =>
    Effect.gen(function* () {
      const uint8Array = stringToUint8Array(largeString);
      const blob = new Blob([uint8Array.buffer as ArrayBuffer]);

      const hash = yield* hashBlobBun(blob, 17);

      expect(hash).toEqual("66a1e6b119bf30ade63378f770e52549");
    })
  );

  live("should hash empty blob", () =>
    Effect.gen(function* () {
      const blob = new Blob([]);

      const hash = yield* hashBlobBun(blob, 1048576);

      // MD5 of empty string
      expect(hash).toEqual("d41d8cd98f00b204e9800998ecf8427e");
    })
  );

  live("should produce consistent results with default chunk size", () =>
    Effect.gen(function* () {
      const str = "The quick brown fox jumps over the lazy dog";
      const uint8Array = stringToUint8Array(str);
      const blob = new Blob([uint8Array.buffer as ArrayBuffer]);

      const hash1 = yield* hashBlobBun(blob, 1048576);
      const hash2 = yield* hashBlobBun(blob, 1048576);

      expect(hash1).toEqual(hash2);
      expect(hash1).toEqual("9e107d9d372bb6826bd81d3542a419d6");
    })
  );
});
