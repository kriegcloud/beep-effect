import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import type * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { SerializedDocument } from "../schema";
import { CompressionError, InvalidDocumentHashError } from "../schema/errors";

/**
 * Reads chunks from a ReadableStreamDefaultReader.
 * @internal
 */
const readChunks = <T>(reader: ReadableStreamDefaultReader<T>): Effect.Effect<readonly T[], CompressionError> =>
  Effect.gen(function* () {
    const chunks = A.empty<T>();
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

      if (P.isNotUndefined(result.value)) {
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
    const output = A.empty<string>();
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
export const docToHash = (doc: SerializedDocument): Effect.Effect<string, CompressionError | ParseResult.ParseError> =>
  Effect.gen(function* () {
    const cs = new CompressionStream("gzip");
    const writer = cs.writable.getWriter();

    const encoder = new TextEncoder();
    const writeAndClose = F.pipe(
      doc,
      S.encode(S.parseJson(SerializedDocument)),
      Effect.andThen((serialized) =>
        Effect.tryPromise({
          try: () => writer.write(encoder.encode(serialized)),
          catch: (e) =>
            new CompressionError({
              message: "Failed to write to compression stream",
              cause: String(e),
            }),
        })
      ),
      Effect.andThen(() =>
        Effect.tryPromise({
          try: () => writer.close(),
          catch: (e) =>
            new CompressionError({
              message: "Failed to close compression stream",
              cause: String(e),
            }),
        })
      )
    );

    const [, output] = yield* Effect.all([writeAndClose, readBytesToString(cs.readable.getReader())], {
      concurrency: 2,
    });

    const docVal = F.pipe(output, btoa, Str.replace(/\//g, "_"), Str.replace(/\+/g, "-"), Str.replace(/=+$/, ""));

    return `#doc=${docVal}`;
  });

/**
 * Backward-compatible Promise wrapper for docToHash.
 *
 * @since 0.1.0
 */

/**
 * Decompresses a hash string back to a SerializedDocument.
 *
 * @since 0.1.0
 */
export const docFromHash = Effect.fn(
  function* (hash: string) {
    const encodedData = F.pipe(
      hash,
      Str.match(/^#doc=(.*)$/),
      O.flatMap((m) => O.fromNullable(m[1]))
    );

    if (O.isNone(encodedData)) {
      return yield* Effect.fail(
        new InvalidDocumentHashError({
          message: "Hash does not match expected format #doc=...",
          hash,
        })
      );
    }

    const encodedDataValue = encodedData.value;
    const ds = new DecompressionStream("gzip");
    const writer = ds.writable.getWriter();

    const b64 = yield* Effect.try({
      try: () => F.pipe(encodedDataValue, Str.replace(/_/g, "/"), Str.replace(/-/g, "+"), atob),
      catch: (e) =>
        new InvalidDocumentHashError({
          message: `Invalid base64 encoding: ${String(e)}`,
          hash,
        }),
    });

    const array = new Uint8Array(b64.length);
    for (let i = 0; i < b64.length; i++) {
      array[i] = O.getOrElse(Str.charCodeAt(b64, i), () => 0);
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

    const output = A.empty<string>();
    const readOutput = Effect.gen(function* () {
      const textStream = ds.readable.pipeThrough(new TextDecoderStream());
      const chunks = yield* readChunks(textStream.getReader());
      for (const chunk of chunks) {
        output.push(chunk);
      }
    });

    yield* Effect.all([writeAndClose, readOutput], {
      concurrency: 2,
    });

    const jsonString = A.join(output, "");
    return yield* S.decode(S.parseJson(SerializedDocument))(jsonString);
  },
  Effect.option,
  Effect.map(O.getOrNull)
);
