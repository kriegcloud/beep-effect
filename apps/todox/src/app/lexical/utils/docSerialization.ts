/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { SerializedDocument } from "@lexical/file";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as O from "effect/Option";

import { CompressionError, InvalidDocumentHashError, ParseError } from "../schema/errors";

/**
 * Reads chunks from a ReadableStreamDefaultReader.
 * @internal
 */
const readChunks = <T>(reader: ReadableStreamDefaultReader<T>): Effect.Effect<readonly T[], CompressionError> =>
  Effect.gen(function* () {
    const chunks: T[] = [];
    let done = false;

    while (!done) {
      const result = yield* Effect.tryPromise({
        try: () => reader.read(),
        catch: (e) =>
          new CompressionError({
            message: "Failed to read stream chunk",
            cause: String(e),
          }),
      });

      if (result.value !== undefined) {
        chunks.push(result.value);
      }
      done = result.done;
    }

    return chunks;
  });

/**
 * Reads bytes from a stream and converts to string.
 * @internal
 */
const readBytesToString = (reader: ReadableStreamDefaultReader<Uint8Array>): Effect.Effect<string, CompressionError> =>
  Effect.gen(function* () {
    const chunks = yield* readChunks(reader);
    const output: string[] = [];
    const chunkSize = 0x8000;

    for (const value of chunks) {
      for (let i = 0; i < value.length; i += chunkSize) {
        output.push(String.fromCharCode(...value.subarray(i, i + chunkSize)));
      }
    }

    return A.join(output, "");
  });

/**
 * Compresses a SerializedDocument to a URL-safe hash string.
 *
 * @since 0.1.0
 */
export const docToHash = (doc: SerializedDocument): Effect.Effect<string, CompressionError> =>
  Effect.gen(function* () {
    const cs = new CompressionStream("gzip");
    const writer = cs.writable.getWriter();

    const writeAndClose = Effect.tryPromise({
      try: async () => {
        await writer.write(new TextEncoder().encode(JSON.stringify(doc)));
        await writer.close();
      },
      catch: (e) =>
        new CompressionError({
          message: "Failed to write to compression stream",
          cause: String(e),
        }),
    });

    const [, output] = yield* Effect.all([writeAndClose, readBytesToString(cs.readable.getReader())]);

    return `#doc=${btoa(output).replace(/\//g, "_").replace(/\+/g, "-").replace(/=+$/, "")}`;
  });

/**
 * Backward-compatible Promise wrapper for docToHash.
 *
 * @since 0.1.0
 */
export const docToHashPromise = (doc: SerializedDocument): Promise<string> => Effect.runPromise(docToHash(doc));

/**
 * Decompresses a hash string back to a SerializedDocument.
 *
 * @since 0.1.0
 */
export const docFromHash = (
  hash: string
): Effect.Effect<SerializedDocument, InvalidDocumentHashError | ParseError | CompressionError> =>
  Effect.gen(function* () {
    const m = /^#doc=(.*)$/.exec(hash);
    if (!m || m[1] === undefined) {
      return yield* Effect.fail(
        new InvalidDocumentHashError({
          message: "Hash does not match expected format #doc=...",
          hash,
        })
      );
    }

    const encodedData = m[1];
    const ds = new DecompressionStream("gzip");
    const writer = ds.writable.getWriter();

    const b64 = yield* Effect.try({
      try: () => atob(encodedData.replace(/_/g, "/").replace(/-/g, "+")),
      catch: (e) =>
        new InvalidDocumentHashError({
          message: `Invalid base64 encoding: ${String(e)}`,
          hash,
        }),
    });

    const array = new Uint8Array(b64.length);
    for (let i = 0; i < b64.length; i++) {
      array[i] = b64.charCodeAt(i);
    }

    const writeAndClose = Effect.tryPromise({
      try: async () => {
        await writer.write(array);
        await writer.close();
      },
      catch: (e) =>
        new CompressionError({
          message: "Failed to write to decompression stream",
          cause: String(e),
        }),
    });

    const output: string[] = [];
    const readOutput = Effect.gen(function* () {
      const textStream = ds.readable.pipeThrough(new TextDecoderStream());
      const chunks = yield* readChunks(textStream.getReader());
      for (const chunk of chunks) {
        output.push(chunk);
      }
    });

    yield* Effect.all([writeAndClose, readOutput]);

    const jsonString = A.join(output, "");
    return yield* Effect.try({
      try: () => JSON.parse(jsonString) as SerializedDocument,
      catch: (e) =>
        new ParseError({
          message: `Failed to parse document JSON: ${String(e)}`,
          input: jsonString,
        }),
    });
  });

/**
 * Backward-compatible Promise wrapper for docFromHash.
 * Returns null instead of throwing on error.
 *
 * @since 0.1.0
 */
export const docFromHashPromise = (hash: string): Promise<SerializedDocument | null> =>
  pipe(docFromHash(hash), Effect.option, Effect.map(O.getOrNull), Effect.runPromise);
