/**
 * Deterministic token-sequence similarity primitives (k-shingling, MinHash,
 * LSH banding, exact Jaccard) for near-miss (Type-3) clone detection over the
 * normalized declaration token sequences produced by
 * `normalizedDeclarationSignature`.
 *
 * The pipeline is: shingle a token sequence into a k-gram set, summarize each set
 * as a fixed-length MinHash signature, bucket signatures into LSH bands to cheaply
 * generate candidate pairs, then confirm each candidate with an *exact* Jaccard
 * score. LSH only prunes the candidate space; the final decision is always exact,
 * so results are reproducible across runs (no randomness, fixed FNV-1a seeds).
 *
 * @packageDocumentation
 * @since 0.0.0
 */

const FNV32_OFFSET_BASIS = 0x811c9dc5;
const FNV32_PRIME = 0x01000193;
// SHINGLE_DELIMITER is empty: every token is prefixed I/K/L (never digit-leading),
// so concatenated k-grams remain unambiguously parseable.
const SHINGLE_DELIMITER = "";

/**
 * 32-bit FNV-1a hash of a string (unsigned). The narrow-width sibling of the
 * 64-bit digest used for candidate ids; 32 bits keep MinHash permutations in fast
 * integer arithmetic, and final clustering is confirmed with exact Jaccard so the
 * occasional 32-bit collision cannot create a false near-miss.
 *
 * @param input - The string to hash.
 * @returns An unsigned 32-bit hash.
 * @example
 * ```ts
 * import { fnv1a32 } from "@beep/repo-utils"
 * const digest = fnv1a32("I0,K1,L")
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const fnv1a32 = (input: string): number => {
  let hash = FNV32_OFFSET_BASIS;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, FNV32_PRIME);
  }
  return hash >>> 0;
};

/**
 * Split a normalized token sequence into the set of contiguous k-grams
 * ("shingles"). Sequences shorter than `k` collapse to a single shingle of the
 * whole sequence. Duplicate k-grams collapse (set semantics), which is what
 * Jaccard / MinHash operate over.
 *
 * @param input - The token array and shingle width `k`.
 * @returns The set of distinct k-gram shingles.
 * @example
 * ```ts
 * import { tokenShingles } from "@beep/repo-utils"
 * const set = tokenShingles({ tokens: ["I0", "K1", "L", "I1", "K2"], k: 3 })
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const tokenShingles = (input: {
  readonly tokens: ReadonlyArray<string>;
  readonly k: number;
}): ReadonlySet<string> => {
  const { tokens, k } = input;
  const width = k < 1 ? 1 : k;
  const shingles = new Set<string>();
  if (tokens.length <= width) {
    shingles.add(tokens.join(SHINGLE_DELIMITER));
    return shingles;
  }
  for (let start = 0; start + width <= tokens.length; start += 1) {
    shingles.add(tokens.slice(start, start + width).join(SHINGLE_DELIMITER));
  }
  return shingles;
};

const mix32 = (value: number): number => {
  let hash = value >>> 0;
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  hash ^= hash >>> 16;
  return hash >>> 0;
};

// Deterministic per-permutation (multiplier, addend) pairs derived from a fixed
// FNV-1a seed, so the i-th permutation is identical on every run and machine.
const permutationSeeds = (count: number): ReadonlyArray<{ readonly mul: number; readonly add: number }> => {
  const seeds = new Array<{ readonly mul: number; readonly add: number }>(count);
  for (let index = 0; index < count; index += 1) {
    seeds[index] = {
      // `| 1` forces an odd multiplier (a unit mod 2^32) so the permutation is a bijection.
      mul: fnv1a32(`minhash:mul:${index}`) | 1,
      add: fnv1a32(`minhash:add:${index}`),
    };
  }
  return seeds;
};

/**
 * Compute an `permutations`-length MinHash signature of a shingle set. Each slot
 * is the minimum, over all shingles, of a distinct deterministic permutation of
 * the shingle's 32-bit hash. The fraction of equal slots between two signatures
 * is an unbiased estimate of their Jaccard similarity.
 *
 * @param input - The shingle set and the number of permutations (signature length).
 * @returns The MinHash signature as an array of unsigned 32-bit values.
 * @example
 * ```ts
 * import { minhashSignature, tokenShingles } from "@beep/repo-utils"
 * const shingles = tokenShingles({ tokens: ["I0", "K1", "L", "I1", "K2", "I0"], k: 3 })
 * const signature = minhashSignature({ shingles, permutations: 128 })
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const minhashSignature = (input: {
  readonly shingles: ReadonlySet<string>;
  readonly permutations: number;
}): ReadonlyArray<number> => {
  const { shingles, permutations } = input;
  const length = permutations < 1 ? 1 : permutations;
  const seeds = permutationSeeds(length);
  const signature = new Array<number>(length).fill(0xffffffff);
  for (const shingle of shingles) {
    const base = fnv1a32(shingle);
    for (let index = 0; index < length; index += 1) {
      const seed = seeds[index] ?? { mul: 1, add: 0 };
      const permuted = mix32((Math.imul(base, seed.mul) + seed.add) >>> 0);
      if (permuted < (signature[index] ?? 0xffffffff)) {
        signature[index] = permuted;
      }
    }
  }
  return signature;
};

/**
 * Project a MinHash signature into `bands` LSH band keys. The signature is split
 * into `bands` contiguous bands of equal width; two declarations are candidate
 * near-misses when they share at least one band key. Fewer bands (wider rows)
 * means a higher similarity threshold for becoming a candidate.
 *
 * @param input - The MinHash signature and the number of bands.
 * @returns One band key per band (band-index-prefixed so keys never collide across bands).
 * @example
 * ```ts
 * import { lshBandKeys, minhashSignature, tokenShingles } from "@beep/repo-utils"
 * const shingles = tokenShingles({ tokens: ["I0", "K1", "L", "I1", "K2"], k: 3 })
 * const keys = lshBandKeys({ signature: minhashSignature({ shingles, permutations: 128 }), bands: 16 })
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const lshBandKeys = (input: {
  readonly signature: ReadonlyArray<number>;
  readonly bands: number;
}): ReadonlyArray<string> => {
  const { signature, bands } = input;
  const bandCount = bands < 1 ? 1 : bands;
  const rows = Math.max(1, Math.floor(signature.length / bandCount));
  const keys: string[] = [];
  for (let band = 0; band < bandCount; band += 1) {
    const start = band * rows;
    if (start >= signature.length) {
      break;
    }
    const slice = signature.slice(start, start + rows);
    keys.push(`${band}:${slice.join(",")}`);
  }
  return keys;
};

/**
 * Exact Jaccard similarity between two shingle sets: `|A ∩ B| / |A ∪ B|`. Two
 * empty sets score `0` (no evidence of similarity).
 *
 * @param input - The two shingle sets (`self`, `that`).
 * @returns The Jaccard similarity in the closed interval [0, 1].
 * @example
 * ```ts
 * import { jaccardSimilarity } from "@beep/repo-utils"
 * const score = jaccardSimilarity({ self: new Set(["a", "b", "c"]), that: new Set(["a", "b", "d"]) })
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const jaccardSimilarity = (input: {
  readonly self: ReadonlySet<string>;
  readonly that: ReadonlySet<string>;
}): number => {
  const { self, that } = input;
  if (self.size === 0 && that.size === 0) {
    return 0;
  }
  const [small, large] = self.size <= that.size ? [self, that] : [that, self];
  let intersection = 0;
  for (const shingle of small) {
    if (large.has(shingle)) {
      intersection += 1;
    }
  }
  const union = self.size + that.size - intersection;
  return union === 0 ? 0 : intersection / union;
};
