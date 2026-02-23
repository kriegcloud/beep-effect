import * as A from "effect/Array";

export const cosineSimilarity = (a: readonly number[], b: readonly number[]): number => {
  const lenA = A.length(a);
  const lenB = A.length(b);

  if (lenA !== lenB || A.isEmptyReadonlyArray(a)) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < lenA; i++) {
    const valA = a[i] ?? 0;
    const valB = b[i] ?? 0;
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
};
