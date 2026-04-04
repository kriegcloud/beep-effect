/**
 * Pure Wink Similarity Service
 * Clean wrapper around wink-nlp's similarity utilities with Effect patterns
 * Only wraps existing wink-nlp functionality without domain assumptions
 * @since 3.0.0
 */

import { Effect, Data, Context, Layer, Chunk, Option } from "effect";
import type { DocumentVector, BagOfWords } from "./WinkVectorizer.js";
import type { DocumentId } from "../Core/Document.js";
import { createRequire } from "module";

// Import similarity utilities using createRequire for ES modules
const require = createRequire(import.meta.url);
const similarity = require("wink-nlp/utilities/similarity");

/**
 * Tversky similarity parameters
 */
export const TverskyParams = Data.case<{
  readonly alpha: number; // Weight for features in first set
  readonly beta: number; // Weight for features in second set
}>();
export type TverskyParams = ReturnType<typeof TverskyParams>;

/**
 * Cosine similarity computation request
 */
export const CosineSimilarityRequest = Data.case<{
  readonly vector1: DocumentVector;
  readonly vector2: DocumentVector;
}>();
export type CosineSimilarityRequest = ReturnType<
  typeof CosineSimilarityRequest
>;

/**
 * Document term set for Tversky similarity
 */
export const DocumentTermSet = Data.case<{
  readonly documentId: DocumentId;
  readonly terms: Chunk.Chunk<string>;
}>();
export type DocumentTermSet = ReturnType<typeof DocumentTermSet>;

/**
 * Tversky similarity computation request (requires sets of terms)
 */
export const TverskySimilarityRequest = Data.case<{
  readonly set1: DocumentTermSet;
  readonly set2: DocumentTermSet;
  readonly params: TverskyParams;
}>();
export type TverskySimilarityRequest = ReturnType<
  typeof TverskySimilarityRequest
>;

/**
 * BOW cosine similarity computation request
 */
export const BOWCosineSimilarityRequest = Data.case<{
  readonly bow1: BagOfWords;
  readonly bow2: BagOfWords;
}>();
export type BOWCosineSimilarityRequest = ReturnType<
  typeof BOWCosineSimilarityRequest
>;

/**
 * Similarity score result
 */
export const SimilarityScore = Data.case<{
  readonly document1Id: DocumentId;
  readonly document2Id: DocumentId;
  readonly score: number;
  readonly method: "vector.cosine" | "set.tversky" | "bow.cosine";
  readonly parameters: Option.Option<Record<string, unknown>>;
}>();
export type SimilarityScore = ReturnType<typeof SimilarityScore>;

/**
 * Similarity computation error
 */
export class SimilarityError extends Data.TaggedError("SimilarityError")<{
  message: string;
  cause?: unknown;
}> {}

/**
 * Wink Similarity Service - Pure wrappers around wink-nlp similarity functions
 */
export class WinkSimilarity extends Context.Tag("effect-nlp/WinkSimilarity")<
  WinkSimilarity,
  {
    /**
     * Compute vector cosine similarity (wraps similarity.vector.cosine)
     */
    readonly vectorCosine: (
      request: CosineSimilarityRequest
    ) => Effect.Effect<SimilarityScore, SimilarityError>;

    /**
     * Compute set Tversky similarity (wraps similarity.set.tversky)
     */
    readonly setTversky: (
      request: TverskySimilarityRequest
    ) => Effect.Effect<SimilarityScore, SimilarityError>;

    /**
     * Compute BOW cosine similarity (wraps similarity.bow.cosine)
     */
    readonly bowCosine: (
      request: BOWCosineSimilarityRequest
    ) => Effect.Effect<SimilarityScore, SimilarityError>;
  }
>() {}

/**
 * Create WinkSimilarity implementation
 */
const createWinkSimilarityImpl = () => {
  return WinkSimilarity.of({
    vectorCosine: (request: CosineSimilarityRequest) =>
      Effect.try({
        try: () => {
          const v1Array = Chunk.toReadonlyArray(request.vector1.vector);
          const v2Array = Chunk.toReadonlyArray(request.vector2.vector);

          const score = similarity.vector.cosine(
            v1Array as Array<number>,
            v2Array as Array<number>
          );

          return SimilarityScore({
            document1Id: request.vector1.documentId,
            document2Id: request.vector2.documentId,
            score: isNaN(score) || !isFinite(score) ? 0 : score,
            method: "vector.cosine",
            parameters: Option.none(),
          });
        },
        catch: (error) =>
          new SimilarityError({
            message: `Failed to compute vector cosine similarity between ${request.vector1.documentId} and ${request.vector2.documentId}`,
            cause: error,
          }),
      }),

    setTversky: (request: TverskySimilarityRequest) =>
      Effect.try({
        try: () => {
          // Convert Chunks to JavaScript Sets for wink-nlp
          const set1 = new Set(Chunk.toReadonlyArray(request.set1.terms));
          const set2 = new Set(Chunk.toReadonlyArray(request.set2.terms));

          const score = similarity.set.tversky(
            set1,
            set2,
            request.params.alpha,
            request.params.beta
          );

          return SimilarityScore({
            document1Id: request.set1.documentId,
            document2Id: request.set2.documentId,
            score: isNaN(score) || !isFinite(score) ? 0 : score,
            method: "set.tversky",
            parameters: Option.some({
              alpha: request.params.alpha,
              beta: request.params.beta,
            }),
          });
        },
        catch: (error) =>
          new SimilarityError({
            message: `Failed to compute set Tversky similarity between ${request.set1.documentId} and ${request.set2.documentId}`,
            cause: error,
          }),
      }),

    bowCosine: (request: BOWCosineSimilarityRequest) =>
      Effect.try({
        try: () => {
          const score = similarity.bow.cosine(
            request.bow1.bow,
            request.bow2.bow
          );

          return SimilarityScore({
            document1Id: request.bow1.documentId,
            document2Id: request.bow2.documentId,
            score: isNaN(score) || !isFinite(score) ? 0 : score,
            method: "bow.cosine",
            parameters: Option.none(),
          });
        },
        catch: (error) =>
          new SimilarityError({
            message: `Failed to compute BOW cosine similarity between ${request.bow1.documentId} and ${request.bow2.documentId}`,
            cause: error,
          }),
      }),
  });
};

/**
 * Live implementation of WinkSimilarity
 */
export const WinkSimilarityLive = Layer.succeed(
  WinkSimilarity,
  createWinkSimilarityImpl()
);

/**
 * Data-first convenience functions
 */

export const vectorCosine = (request: CosineSimilarityRequest) =>
  Effect.flatMap(WinkSimilarity, (service) => service.vectorCosine(request));

export const setTversky = (request: TverskySimilarityRequest) =>
  Effect.flatMap(WinkSimilarity, (service) => service.setTversky(request));

export const bowCosine = (request: BOWCosineSimilarityRequest) =>
  Effect.flatMap(WinkSimilarity, (service) => service.bowCosine(request));
