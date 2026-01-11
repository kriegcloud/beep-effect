/**
 * Unit tests for MD5 worker schemas and handler logic
 *
 * These tests verify the worker protocol schemas and handler logic without
 * spawning actual browser workers. Since we're running in Bun runtime,
 * we test the schemas directly and simulate the handler logic using
 * the underlying MD5 functions.
 *
 * @module
 */

import { describe, expect, live, test } from "@beep/testkit";
import { appendByteArray, finalize, Md5ComputationError, makeState } from "@beep/utils/md5/md5";
import { HashRequest, WorkerRequestSchema } from "@beep/utils/md5/worker";
import { thunkZero } from "@beep/utils/thunk";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
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
    A.map((i) => F.pipe(str, Str.charCodeAt(i), O.getOrElse(thunkZero)))
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
 * Simulate the worker handler logic by directly computing MD5 hash
 * from a Uint8Array buffer. This mirrors what the worker does without
 * requiring browser APIs (FileReaderSync, Worker, etc.).
 */
const simulateWorkerHash = (buffer: Uint8Array): Effect.Effect<string, Md5ComputationError> =>
  Effect.gen(function* () {
    const state = makeState();
    const withBytes = F.pipe(state, appendByteArray(buffer));
    const result = yield* F.pipe(withBytes, finalize(false));

    if (typeof result === "string") {
      return result;
    }

    // This should not happen when raw=false
    return yield* new Md5ComputationError({
      message: "Expected string result from MD5 finalize",
      cause: result,
    });
  });

describe("Worker schemas", () => {
  describe("HashRequest schema", () => {
    test("encodes a valid HashRequest", () => {
      const buffer = stringToUint8Array("hello");
      const request = new HashRequest({
        buffer,
        size: buffer.length,
        chunkSize: 1048576,
      });

      expect(request._tag).toEqual("HashRequest");
      expect(request.buffer).toEqual(buffer);
      expect(request.size).toEqual(5);
      expect(request.chunkSize).toEqual(1048576);
    });

    test("handles optional chunkSize", () => {
      const buffer = stringToUint8Array("test");
      const request = new HashRequest({
        buffer,
        size: buffer.length,
      });

      expect(request._tag).toEqual("HashRequest");
      expect(request.chunkSize).toBeUndefined();
    });

    live("decodes HashRequest from encoded form", () =>
      Effect.gen(function* () {
        const buffer = stringToUint8Array("hello");
        const request = new HashRequest({
          buffer,
          size: buffer.length,
          chunkSize: 2097152,
        });

        // Encode and decode round-trip
        const encoded = yield* S.encode(HashRequest)(request);
        const decoded = yield* S.decode(HashRequest)(encoded);

        expect(decoded._tag).toEqual("HashRequest");
        expect(decoded.size).toEqual(5);
        expect(decoded.chunkSize).toEqual(2097152);
        // Buffer comparison
        expect(decoded.buffer.length).toEqual(buffer.length);
      })
    );
  });

  describe("WorkerRequestSchema union", () => {
    live("validates HashRequest as part of the union", () =>
      Effect.gen(function* () {
        const buffer = stringToUint8Array("test");
        const request = new HashRequest({
          buffer,
          size: buffer.length,
        });

        const decoded = yield* S.decode(WorkerRequestSchema)(request);

        expect(decoded._tag).toEqual("HashRequest");
      })
    );
  });
});

describe("Worker handler logic simulation", () => {
  live("produces correct hash for 'hello'", () =>
    Effect.gen(function* () {
      const buffer = stringToUint8Array("hello");
      const hash = yield* simulateWorkerHash(buffer);

      expect(hash).toEqual("5d41402abc4b2a76b9719d911017c592");
    })
  );

  live("produces correct hash for empty input", () =>
    Effect.gen(function* () {
      const buffer = new Uint8Array(0);
      const hash = yield* simulateWorkerHash(buffer);

      // MD5 of empty string
      expect(hash).toEqual("d41d8cd98f00b204e9800998ecf8427e");
    })
  );

  live("produces correct hash for 'The quick brown fox jumps over the lazy dog'", () =>
    Effect.gen(function* () {
      const buffer = stringToUint8Array("The quick brown fox jumps over the lazy dog");
      const hash = yield* simulateWorkerHash(buffer);

      expect(hash).toEqual("9e107d9d372bb6826bd81d3542a419d6");
    })
  );

  live("produces correct hash for 64-byte boundary input", () =>
    Effect.gen(function* () {
      // 64 bytes = exactly one MD5 block
      const str = "5d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c592";
      const buffer = stringToUint8Array(str);
      const hash = yield* simulateWorkerHash(buffer);

      expect(hash).toEqual("e0b153045b08d59d4e18a98ab823ac42");
    })
  );

  live("produces correct hash for 128-byte input (two blocks)", () =>
    Effect.gen(function* () {
      const str =
        "5d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c592";
      const buffer = stringToUint8Array(str);
      const hash = yield* simulateWorkerHash(buffer);

      expect(hash).toEqual("b12bc24f5507eba4ee27092f70148415");
    })
  );

  live("produces correct hash for large input (160 bytes)", () =>
    Effect.gen(function* () {
      const str =
        "5d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c5925d41402abc4b2a765d41402abc4b2a76b9719d911017c5925d41402abc4b2a76b9719d911017c5925d41402abc4b2a76";
      const buffer = stringToUint8Array(str);
      const hash = yield* simulateWorkerHash(buffer);

      expect(hash).toEqual("66a1e6b119bf30ade63378f770e52549");
    })
  );
});

describe("HashRequest round-trip with worker handler simulation", () => {
  live("creates request and simulates worker processing", () =>
    Effect.gen(function* () {
      const inputStr = "hello";
      const buffer = stringToUint8Array(inputStr);

      // Create a HashRequest as the main thread would
      const request = new HashRequest({
        buffer,
        size: buffer.length,
        chunkSize: 1048576,
      });

      // Simulate worker receiving and processing the request
      const hash = yield* simulateWorkerHash(request.buffer);

      expect(hash).toEqual("5d41402abc4b2a76b9719d911017c592");
    })
  );

  live("handles chunked processing simulation", () =>
    Effect.gen(function* () {
      // Simulate chunked processing - the worker receives the full buffer
      // but processes it in chunks (this is what hashBlobSync does internally)
      const inputStr = "The quick brown fox jumps over the lazy dog";
      const buffer = stringToUint8Array(inputStr);

      const request = new HashRequest({
        buffer,
        size: buffer.length,
        chunkSize: 16, // Small chunks for testing
      });

      // The chunkSize in the request would be used by hashBlobSync
      // but since we're simulating with appendByteArray directly,
      // we just verify the request is well-formed and the hash is correct
      const hash = yield* simulateWorkerHash(request.buffer);

      expect(request.chunkSize).toEqual(16);
      expect(hash).toEqual("9e107d9d372bb6826bd81d3542a419d6");
    })
  );
});
