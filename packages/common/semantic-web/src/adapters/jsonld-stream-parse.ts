/**
 * Local JSON-LD streaming parse adapter backing.
 *
 * @since 0.0.0
 * @module
 */

import { NonNegativeInt } from "@beep/schema";
import { Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { JsonLdContext, JsonLdDocument } from "../jsonld.ts";
import {
  type JsonLdDocumentError,
  type JsonLdDocumentLoaderPolicy,
  JsonLdDocumentService,
  JsonLdToRdfRequest,
} from "../services/jsonld-document.ts";
import {
  JsonLdStreamParseError,
  JsonLdStreamParseResult,
  JsonLdStreamParseService,
  type JsonLdStreamParseServiceShape,
} from "../services/jsonld-stream-parse.ts";

const decodeJsonLdDocumentFromJson = S.decodeUnknownEffect(S.fromJsonString(JsonLdDocument));
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);

const decodeUtf8Chunks = (chunks: ReadonlyArray<Uint8Array>): string => {
  const decoder = new TextDecoder("utf-8");
  const streamed = pipe(
    chunks,
    A.map((chunk) => decoder.decode(chunk, { stream: true })),
    A.join("")
  );
  return `${streamed}${decoder.decode()}`;
};

const mapDocumentErrorToParseError = (error: JsonLdDocumentError): JsonLdStreamParseError =>
  new JsonLdStreamParseError({
    reason: error.reason === "loaderPolicyViolation" ? "loaderPolicyViolation" : "parseFailure",
    message: error.message,
  });

const applyLoaderBaseIri = (
  document: JsonLdDocument,
  loaderPolicy: O.Option<typeof JsonLdDocumentLoaderPolicy.Type>
): JsonLdDocument =>
  pipe(
    loaderPolicy,
    O.flatMap((policy) => policy.baseIri),
    O.map((baseIri) =>
      JsonLdDocument.make({
        "@context": O.some(
          pipe(
            document["@context"],
            O.map((context) =>
              JsonLdContext.make({
                "@base": O.some(baseIri),
                "@vocab": context["@vocab"],
                terms: context.terms,
              })
            ),
            O.getOrElse(() =>
              JsonLdContext.make({
                "@base": O.some(baseIri),
                "@vocab": O.none(),
                terms: {},
              })
            )
          )
        ),
        "@graph": document["@graph"],
      })
    ),
    O.getOrElse(() => document)
  );

/**
 * JSON-LD streaming parse service live layer.
 *
 * @since 0.0.0
 * @category Layers
 */
export const JsonLdStreamParseServiceLive = Layer.effect(
  JsonLdStreamParseService,
  Effect.gen(function* () {
    const documentService = yield* JsonLdDocumentService;

    return JsonLdStreamParseService.of({
      parse: Effect.fn(function* (request) {
        if (
          pipe(
            request.loaderPolicy,
            O.exists((policy) => policy.allowRemoteDocuments)
          )
        ) {
          return yield* new JsonLdStreamParseError({
            reason: "loaderPolicyViolation",
            message: "Remote JSON-LD document loading is outside the bounded v1 stream-parse adapter surface.",
          });
        }

        const sourceText =
          request.input.kind === "text"
            ? pipe(request.input.chunks, A.join(""))
            : decodeUtf8Chunks(request.input.chunks);

        const document = yield* pipe(
          decodeJsonLdDocumentFromJson(sourceText),
          Effect.mapError(
            () =>
              new JsonLdStreamParseError({
                reason: "parseFailure",
                message: "Unable to decode bounded JSON-LD stream input.",
              })
          )
        );

        const dataset = yield* pipe(
          documentService.toRdf(
            JsonLdToRdfRequest.make({
              document: applyLoaderBaseIri(document, request.loaderPolicy),
            })
          ),
          Effect.mapError(mapDocumentErrorToParseError)
        );

        return JsonLdStreamParseResult.make({
          dataset: dataset.dataset,
          mode: "buffered-fallback",
          chunkCount: decodeNonNegativeInt(request.input.chunks.length),
        });
      }),
    } satisfies JsonLdStreamParseServiceShape);
  })
);
