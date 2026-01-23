/**
 * Vector utilities for embedding operations
 *
 * @module knowledge-server/utils/vector
 * @since 0.1.0
 */
import * as A from "effect/Array";

/**
 * Compute cosine similarity between two vectors
 *
 * Returns a value between -1 and 1, where:
 * - 1 means identical direction
 * - 0 means orthogonal (perpendicular)
 * - -1 means opposite direction
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns Cosine similarity, or 0 if vectors have different lengths or are empty
 *
 * @since 0.1.0
 * @category vector
 */
export const cosineSimilarity = (a: readonly number[], b: readonly number[]): number => {
  if (a.length !== b.length || A.isEmptyReadonlyArray(a)) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const valA = a[i] ?? 0;
    const valB = b[i] ?? 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
};
