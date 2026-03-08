/**
 * Local JSON-LD streaming serialize adapter backing.
 *
 * @since 0.0.0
 * @module
 */

import { NonNegativeInt } from "@beep/schema";
import { Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { JsonLdDocument } from "../jsonld.ts";
import { type JsonLdDocumentError, JsonLdDocumentService, JsonLdFromRdfRequest } from "../services/jsonld-document.ts";
import {
  JsonLdStreamSerializeError,
  JsonLdStreamSerializeResult,
  JsonLdStreamSerializeService,
  type JsonLdStreamSerializeServiceShape,
} from "../services/jsonld-stream-serialize.ts";

const encodeJsonLdDocumentToJson = S.encodeSync(S.fromJsonString(JsonLdDocument));
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);

const chunkText = (value: string, maxChunkCharacters: O.Option<number>): ReadonlyArray<string> => {
  if (O.isNone(maxChunkCharacters)) {
    return [value];
  }

  if (maxChunkCharacters.value <= 0) {
    return [];
  }

  const chunks: Array<string> = [];
  let offset = 0;
  while (offset < value.length) {
    chunks.push(value.slice(offset, offset + maxChunkCharacters.value));
    offset += maxChunkCharacters.value;
  }

  return chunks;
};

const mapDocumentErrorToSerializeError = (error: JsonLdDocumentError): JsonLdStreamSerializeError =>
  new JsonLdStreamSerializeError({
    reason: "serializeFailure",
    message: error.message,
  });

/**
 * JSON-LD streaming serialize service live layer.
 *
 * @since 0.0.0
 * @category Layers
 */
export const JsonLdStreamSerializeServiceLive = Layer.effect(
  JsonLdStreamSerializeService,
  Effect.gen(function* () {
    const documentService = yield* JsonLdDocumentService;

    return JsonLdStreamSerializeService.of({
      serialize: Effect.fn(function* (request) {
        const maxChunkCharacters = request.maxChunkCharacters;
        if (O.isSome(maxChunkCharacters) && maxChunkCharacters.value <= 0) {
          return yield* new JsonLdStreamSerializeError({
            reason: "invalidChunkSize",
            message: "maxChunkCharacters must be greater than zero when provided.",
          });
        }

        const document = yield* pipe(
          documentService.fromRdf(
            JsonLdFromRdfRequest.makeUnsafe({
              dataset: request.dataset,
              context: request.context,
            })
          ),
          Effect.mapError(mapDocumentErrorToSerializeError)
        );

        const chunks = pipe(
          chunkText(encodeJsonLdDocumentToJson(document.document), maxChunkCharacters),
          A.fromIterable
        );
        const nonEmptyChunks = pipe(
          chunks,
          A.filter((chunk) => chunk.length > 0)
        );

        return yield* pipe(
          nonEmptyChunks,
          A.match({
            onEmpty: () =>
              Effect.fail(
                new JsonLdStreamSerializeError({
                  reason: "serializeFailure",
                  message: "Unable to produce JSON-LD output chunks from the bounded dataset.",
                })
              ),
            onNonEmpty: ([firstChunk, ...restChunks]) =>
              Effect.succeed(
                JsonLdStreamSerializeResult.makeUnsafe({
                  chunks: [firstChunk, ...restChunks],
                  mode: "buffered-fallback",
                  chunkCount: decodeNonNegativeInt(nonEmptyChunks.length),
                })
              ),
          })
        );
      }),
    } satisfies JsonLdStreamSerializeServiceShape);
  })
);
