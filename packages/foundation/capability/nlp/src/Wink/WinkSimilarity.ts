/**
 * Wink similarity services and domain models.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { createRequire } from "node:module";
import { $NlpId } from "@beep/identity";
import { LiteralKit, SchemaUtils, TaggedErrorClass } from "@beep/schema";
import { Context, Effect, Inspectable, Layer } from "effect";
import { dual } from "effect/Function";
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

const SimilarityMethodKit = LiteralKit(["vector.cosine", "set.tversky", "bow.cosine"]).annotate(
  $I.annote("SimilarityMethodKit", {
    description: "LiteralKit backing schema for wink similarity method identifiers.",
  })
);
const SimilarityMethod = SimilarityMethodKit.pipe(
  $I.annoteSchema("SimilarityMethod", {
    description: "Similarity methods exposed by wink-backed NLP services.",
  }),
  SchemaUtils.withLiteralKitStatics(SimilarityMethodKit)
);

const loadSimilarityRuntime = (): SimilarityRuntime => require("wink-nlp/utilities/similarity");

// effect-native-migration: WONTFIX (wink-nlp FFI requires native Set)
const toNativeTermSet = (terms: ReadonlyArray<string>): Set<string> => new Set(terms);

/**
 * Weights controlling the asymmetric Tversky set similarity index.
 *
 * @example
 * ```ts
 * import { TverskyParams } from "@beep/nlp/Wink/WinkSimilarity"
 *
 * const params = TverskyParams.make({ alpha: 0.7, beta: 0.3 })
 * console.log(params.alpha + params.beta)
 * ```
 *
 * @category models
 * @since 0.0.0
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
 * Normalized terms for one document in set-based similarity comparisons.
 *
 * @example
 * ```ts
 * import { DocumentId } from "@beep/nlp/Core/Document"
 * import { DocumentTermSet } from "@beep/nlp/Wink/WinkSimilarity"
 *
 * const terms = DocumentTermSet.make({
 *   documentId: DocumentId.make("doc-a"),
 *   terms: ["effect", "schema", "nlp"]
 * })
 *
 * console.log(terms.terms.length)
 * ```
 *
 * @category models
 * @since 0.0.0
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
 * Normalized similarity score returned from a wink-backed comparison.
 *
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import { DocumentId } from "@beep/nlp/Core/Document"
 * import { SimilarityScore } from "@beep/nlp/Wink/WinkSimilarity"
 *
 * const score = SimilarityScore.make({
 *   document1Id: DocumentId.make("doc-a"),
 *   document2Id: DocumentId.make("doc-b"),
 *   method: "set.tversky",
 *   parameters: O.some({ alpha: 0.7, beta: 0.3 }),
 *   score: 0.8
 * })
 *
 * console.log(score.method)
 * ```
 *
 * @category models
 * @since 0.0.0
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
 * Typed failure for wink-backed vector, set, or bag-of-words similarity.
 *
 * @example
 * ```ts
 * import { SimilarityError } from "@beep/nlp/Wink/WinkSimilarity"
 *
 * const error = SimilarityError.fromCause(new Error("bad vector"), "vectorCosine")
 * console.log(error.operation)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class SimilarityError extends TaggedErrorClass<SimilarityError>($I`SimilarityError`)(
  "SimilarityError",
  {
    cause: S.DefectWithStack,
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
   * @param cause - The underlying failure or defect.
   * @param operation - The similarity operation that failed.
   * @returns A typed similarity error value.
   */
  static readonly fromCause: {
    (cause: unknown, operation: string): SimilarityError;
    (operation: string): (cause: unknown) => SimilarityError;
  } = dual(
    2,
    (cause: unknown, operation: string): SimilarityError =>
      SimilarityError.make({
        cause,
        message: `Wink similarity ${operation} failed: ${Inspectable.toStringUnknown(cause)}`,
        operation,
      })
  );
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
    catch: SimilarityError.fromCause("initialize"),
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
        catch: SimilarityError.fromCause("bowCosine"),
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
        catch: SimilarityError.fromCause("setTversky"),
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
        catch: SimilarityError.fromCause("vectorCosine"),
      });
    }),
  });
}).pipe(Effect.withSpan("Nlp.Wink.WinkSimilarity.make"));

/**
 * Service for computing cosine and Tversky scores using wink similarity helpers.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { DocumentId } from "@beep/nlp/Core/Document"
 * import {
 *   DocumentTermSet,
 *   TverskyParams,
 *   WinkSimilarity,
 *   WinkSimilarityLive
 * } from "@beep/nlp/Wink/WinkSimilarity"
 *
 * const compare = Effect.gen(function* () {
 *   const similarity = yield* WinkSimilarity
 *   return yield* similarity.setTversky(
 *     DocumentTermSet.make({ documentId: DocumentId.make("doc-a"), terms: ["effect", "schema"] }),
 *     DocumentTermSet.make({ documentId: DocumentId.make("doc-b"), terms: ["effect", "docs"] }),
 *     TverskyParams.make({ alpha: 0.5, beta: 0.5 })
 *   )
 * })
 *
 * Effect.runPromise(compare.pipe(Effect.provide(WinkSimilarityLive))).then((score) =>
 *   console.log(score.score)
 * )
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class WinkSimilarity extends Context.Service<WinkSimilarity, WinkSimilarityShape>()($I`WinkSimilarity`) {}

/**
 * Live layer for wink similarity utilities.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { DocumentId } from "@beep/nlp/Core/Document"
 * import { DocumentTermSet, TverskyParams, WinkSimilarity, WinkSimilarityLive } from "@beep/nlp/Wink/WinkSimilarity"
 *
 * const program = Effect.gen(function* () {
 *   const similarity = yield* WinkSimilarity
 *   return yield* similarity.setTversky(
 *     DocumentTermSet.make({ documentId: DocumentId.make("left"), terms: ["nlp"] }),
 *     DocumentTermSet.make({ documentId: DocumentId.make("right"), terms: ["nlp", "search"] }),
 *     TverskyParams.make({ alpha: 0.5, beta: 0.5 })
 *   )
 * })
 *
 * Effect.runPromise(program.pipe(Effect.provide(WinkSimilarityLive))).then((score) =>
 *   console.log(score.method)
 * )
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkSimilarityLive = Layer.effect(WinkSimilarity, makeWinkSimilarity);
