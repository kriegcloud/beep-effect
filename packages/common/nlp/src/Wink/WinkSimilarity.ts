/**
 * Wink similarity services and domain models.
 *
 * @since 0.0.0
 * @module @beep/nlp/Wink/WinkSimilarity
 */

import { createRequire } from "node:module";
import { $NlpId } from "@beep/identity";
import { LiteralKit, SchemaUtils, TaggedErrorClass } from "@beep/schema";
import { Context, Effect, Inspectable, Layer } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { DocumentId } from "../Core/Document.ts";
import { UnitInterval } from "../internal/numbers.ts";
import type { BagOfWords, DocumentVector } from "./WinkVectorizer.ts";

const $I = $NlpId.create("Wink/WinkSimilarity");
const require = createRequire(import.meta.url);

type SimilarityRuntime = {
  readonly bow: {
    readonly cosine: (left: Record<string, number>, right: Record<string, number>) => number;
  };
  readonly set: {
    readonly tversky: (left: Set<string>, right: Set<string>, alpha: number, beta: number) => number;
  };
  readonly vector: {
    readonly cosine: (left: ReadonlyArray<number>, right: ReadonlyArray<number>) => number;
  };
};

type WinkSimilarityShape = {
  readonly bowCosine: (left: BagOfWords, right: BagOfWords) => Effect.Effect<SimilarityScore, SimilarityError>;
  readonly setTversky: (
    left: DocumentTermSet,
    right: DocumentTermSet,
    params: TverskyParams
  ) => Effect.Effect<SimilarityScore, SimilarityError>;
  readonly vectorCosine: (
    left: DocumentVector,
    right: DocumentVector
  ) => Effect.Effect<SimilarityScore, SimilarityError>;
};

const SimilarityMethodKit = LiteralKit(["vector.cosine", "set.tversky", "bow.cosine"] as const);
const SimilarityMethod = SimilarityMethodKit.pipe(
  $I.annoteSchema("SimilarityMethod", {
    description: "Similarity methods exposed by wink-backed NLP services.",
  }),
  SchemaUtils.withLiteralKitStatics(SimilarityMethodKit)
);

const loadSimilarityRuntime = (): SimilarityRuntime => require("wink-nlp/utilities/similarity");

const toNativeTermSet = (terms: ReadonlyArray<string>): Set<string> => {
  // eslint-disable-next-line beep-laws/no-native-runtime -- wink similarity expects native Set instances at this adapter boundary.
  return new Set(terms);
};

/**
 * Parameters controlling the asymmetric Tversky index.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TverskyParams extends S.Class<TverskyParams>($I`TverskyParams`)(
  {
    alpha: UnitInterval,
    beta: UnitInterval,
  },
  $I.annote("TverskyParams", {
    description: "Weights used when computing the asymmetric Tversky set similarity.",
  })
) {
  /**
   * Backwards-compatible unsafe constructor alias.
   */
}

/**
 * Set of normalized document terms used for set-based similarity.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class DocumentTermSet extends S.Class<DocumentTermSet>($I`DocumentTermSet`)(
  {
    documentId: DocumentId,
    terms: S.Array(S.String),
  },
  $I.annote("DocumentTermSet", {
    description: "Normalized term set extracted from a document for set-based similarity.",
  })
) {
  /**
   * Backwards-compatible unsafe constructor alias.
   */
}

/**
 * Similarity score returned from a wink-backed comparison.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SimilarityScore extends S.Class<SimilarityScore>($I`SimilarityScore`)(
  {
    document1Id: DocumentId,
    document2Id: DocumentId,
    method: SimilarityMethod,
    parameters: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)),
    score: UnitInterval,
  },
  $I.annote("SimilarityScore", {
    description: "Similarity score comparing two document-like inputs.",
  })
) {
  /**
   * Backwards-compatible unsafe constructor alias.
   */
}

/**
 * Error raised while computing wink-backed similarity.
 *
 * @since 0.0.0
 * @category Errors
 */
export class SimilarityError extends TaggedErrorClass<SimilarityError>($I`SimilarityError`)(
  "SimilarityError",
  {
    cause: S.Unknown,
    message: S.String,
    operation: S.String,
  },
  $I.annote("SimilarityError", {
    description: "Failure raised while computing wink-backed similarity scores.",
  })
) {
  /**
   * Convert an unknown cause into a typed similarity error.
   *
   * @param cause {unknown} - The underlying failure or defect.
   * @param operation {string} - The similarity operation that failed.
   * @returns {SimilarityError} - A typed similarity error value.
   */
  static fromCause(cause: unknown, operation: string): SimilarityError {
    return new SimilarityError({
      cause,
      message: `Wink similarity ${operation} failed: ${Inspectable.toStringUnknown(cause)}`,
      operation,
    });
  }
}

const sanitizeScore = (score: number): number => {
  if (!Number.isFinite(score)) {
    return 0;
  }

  if (score < 0) {
    return 0;
  }

  if (score > 1) {
    return 1;
  }

  return score;
};

const makeWinkSimilarity = Effect.gen(function* () {
  const similarity = yield* Effect.try({
    try: loadSimilarityRuntime,
    catch: (cause) => SimilarityError.fromCause(cause, "initialize"),
  });

  return WinkSimilarity.of({
    bowCosine: Effect.fn("Nlp.Wink.WinkSimilarity.bowCosine")(function* (left: BagOfWords, right: BagOfWords) {
      return yield* Effect.try({
        try: () =>
          SimilarityScore.make({
            document1Id: left.documentId,
            document2Id: right.documentId,
            method: "bow.cosine",
            parameters: O.none(),
            score: sanitizeScore(similarity.bow.cosine(left.bow, right.bow)),
          }),
        catch: (cause) => SimilarityError.fromCause(cause, "bowCosine"),
      });
    }),
    setTversky: Effect.fn("Nlp.Wink.WinkSimilarity.setTversky")(function* (
      left: DocumentTermSet,
      right: DocumentTermSet,
      params: TverskyParams
    ) {
      return yield* Effect.try({
        try: () =>
          SimilarityScore.make({
            document1Id: left.documentId,
            document2Id: right.documentId,
            method: "set.tversky",
            parameters: O.some({
              alpha: params.alpha,
              beta: params.beta,
            }),
            score: sanitizeScore(
              similarity.set.tversky(
                toNativeTermSet(left.terms),
                toNativeTermSet(right.terms),
                params.alpha,
                params.beta
              )
            ),
          }),
        catch: (cause) => SimilarityError.fromCause(cause, "setTversky"),
      });
    }),
    vectorCosine: Effect.fn("Nlp.Wink.WinkSimilarity.vectorCosine")(function* (
      left: DocumentVector,
      right: DocumentVector
    ) {
      return yield* Effect.try({
        try: () =>
          SimilarityScore.make({
            document1Id: left.documentId,
            document2Id: right.documentId,
            method: "vector.cosine",
            parameters: O.none(),
            score: sanitizeScore(similarity.vector.cosine(left.vector, right.vector)),
          }),
        catch: (cause) => SimilarityError.fromCause(cause, "vectorCosine"),
      });
    }),
  });
}).pipe(Effect.withSpan("Nlp.Wink.WinkSimilarity.make"));

/**
 * Wink similarity service.
 *
 * @since 0.0.0
 * @category Services
 */
export class WinkSimilarity extends Context.Service<WinkSimilarity, WinkSimilarityShape>()($I`WinkSimilarity`) {}

/**
 * Live wink similarity layer.
 *
 * @since 0.0.0
 * @category Layers
 */
export const WinkSimilarityLive = Layer.effect(WinkSimilarity, makeWinkSimilarity);
