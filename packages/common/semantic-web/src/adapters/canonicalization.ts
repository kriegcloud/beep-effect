/**
 * Local canonicalization adapter backing.
 *
 * @since 0.0.0
 * @module
 */

import { Sha256Hex } from "@beep/schema";
import { Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { makeDataset, type Quad, serializeQuad, sortDatasetQuads } from "../rdf.ts";
import {
  CanonicalDatasetResult,
  CanonicalizationError,
  CanonicalizationService,
  type CanonicalizationServiceShape,
  DatasetFingerprint,
} from "../services/canonicalization.ts";

const decodeSha256Hex = S.decodeUnknownSync(Sha256Hex);

const hashCanonicalText = (canonicalText: string): Effect.Effect<typeof Sha256Hex.Type, CanonicalizationError> =>
  Effect.tryPromise({
    try: async () => {
      const bytes = new TextEncoder().encode(canonicalText);
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const hex = Array.from(new Uint8Array(digest))
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("");

      return decodeSha256Hex(hex);
    },
    catch: () =>
      new CanonicalizationError({
        reason: "fingerprintFailure",
        message: "Failed to hash canonical dataset text.",
      }),
  });

const enforceWorkLimit = (
  quads: ReadonlyArray<Quad>,
  workLimit: O.Option<number>
): Effect.Effect<void, CanonicalizationError> =>
  O.isSome(workLimit) && quads.length > workLimit.value
    ? Effect.fail(
        new CanonicalizationError({
          reason: "workLimitExceeded",
          message: `Dataset contains ${quads.length} quads, exceeding the work limit of ${workLimit.value}.`,
        })
      )
    : Effect.void;

const canonicalTextFromQuads = (quads: ReadonlyArray<Quad>): string => pipe(quads, A.map(serializeQuad), A.join("\n"));

/**
 * Canonicalization service live layer.
 *
 * @since 0.0.0
 * @category Layers
 */
export const CanonicalizationServiceLive = Layer.succeed(
  CanonicalizationService,
  CanonicalizationService.of({
    canonicalize: Effect.fn(function* (request) {
      yield* enforceWorkLimit(request.dataset.quads, request.workLimit);
      const sorted = sortDatasetQuads(request.dataset);
      const canonicalText = canonicalTextFromQuads(sorted);
      return CanonicalDatasetResult.makeUnsafe({
        canonicalText,
        dataset: makeDataset(sorted),
      });
    }),
    fingerprint: Effect.fn(function* (request) {
      yield* enforceWorkLimit(request.dataset.quads, request.workLimit);
      const sorted = sortDatasetQuads(request.dataset);
      const canonicalText = canonicalTextFromQuads(sorted);
      const fingerprint = yield* hashCanonicalText(canonicalText);
      return DatasetFingerprint.makeUnsafe({
        canonicalText,
        fingerprint,
      });
    }),
  } satisfies CanonicalizationServiceShape)
);
