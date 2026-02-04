/**
 * BloomFilter - Probabilistic set membership for candidate pruning
 *
 * Provides a bloom filter service for quick negative testing of entity candidates
 * during entity resolution. This enables efficient pruning of non-matching
 * candidates before expensive similarity computations.
 *
 * @module knowledge-server/EntityResolution/BloomFilter
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Str from "effect/String";

const $I = $KnowledgeServerId.create("EntityResolution/BloomFilter");

// =============================================================================
// Configuration Constants
// =============================================================================

/**
 * Default bit array size (1,000,000 bits = ~122KB)
 *
 * At 100K entries with 3 hash functions, this yields ~1% false positive rate.
 */
const DEFAULT_BIT_ARRAY_SIZE = 1_000_000;

/**
 * Number of hash functions to use
 *
 * Using 3 hash functions provides a good balance between:
 * - False positive rate (~1% at 100K entries with 1M bits)
 * - Computation cost
 */
const NUM_HASH_FUNCTIONS = 3;

// =============================================================================
// Hash Functions (djb2 variants)
// =============================================================================

/**
 * djb2 hash function
 *
 * Classic string hash function by Daniel J. Bernstein.
 * Fast and produces good distribution.
 */
const djb2Hash = (text: string, seed: number): number => {
  let hash = 5381 + seed;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
    hash = hash >>> 0; // Convert to unsigned 32-bit
  }
  return hash;
};

/**
 * sdbm hash function
 *
 * Alternative hash function for diversity in bloom filter.
 */
const sdbmHash = (text: string, seed: number): number => {
  let hash = seed;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
    hash = hash >>> 0; // Convert to unsigned 32-bit
  }
  return hash;
};

/**
 * FNV-1a hash function
 *
 * Fowler-Noll-Vo hash, good distribution characteristics.
 */
const fnv1aHash = (text: string, seed: number): number => {
  let hash = 2166136261 ^ seed;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
    hash = hash >>> 0; // Convert to unsigned 32-bit
  }
  return hash;
};

/**
 * Compute all hash positions for a given text
 */
const computeHashPositions = (text: string, bitArraySize: number): readonly number[] => {
  const normalizedText = Str.toLowerCase(Str.trim(text));
  return [
    djb2Hash(normalizedText, 0) % bitArraySize,
    sdbmHash(normalizedText, 1) % bitArraySize,
    fnv1aHash(normalizedText, 2) % bitArraySize,
  ];
};

// =============================================================================
// Bit Array Implementation
// =============================================================================

/**
 * Create a typed bit array using Uint32Array for efficient storage
 *
 * Each Uint32 stores 32 bits, so we need (size / 32) elements.
 */
const createBitArray = (size: number): Uint32Array => {
  const arrayLength = Math.ceil(size / 32);
  return new Uint32Array(arrayLength);
};

/**
 * Set a bit at the given position
 */
const setBit = (bitArray: Uint32Array, position: number): void => {
  const arrayIndex = Math.floor(position / 32);
  const bitIndex = position % 32;
  const element = bitArray[arrayIndex];
  if (element !== undefined) {
    bitArray[arrayIndex] = element | (1 << bitIndex);
  }
};

/**
 * Check if a bit is set at the given position
 */
const getBit = (bitArray: Uint32Array, position: number): boolean => {
  const arrayIndex = Math.floor(position / 32);
  const bitIndex = position % 32;
  const element = bitArray[arrayIndex];
  if (element === undefined) return false;
  return (element & (1 << bitIndex)) !== 0;
};

/**
 * Count number of set bits in a 32-bit integer (population count)
 *
 * Uses Brian Kernighan's algorithm - O(number of set bits)
 */
const popcount = (n: number): number => {
  let count = 0;
  let value = n;
  while (value !== 0) {
    value = value & (value - 1);
    count++;
  }
  return count;
};

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * BloomFilter Service
 *
 * Provides probabilistic set membership testing for efficient candidate pruning
 * during entity resolution. The bloom filter never produces false negatives,
 * meaning if `contains` returns false, the text is definitely not in the set.
 *
 * False positive rate is approximately 1% at 100K entries.
 *
 * @example
 * ```ts
 * import { BloomFilter } from "@beep/knowledge-server/EntityResolution";
 * import * as Effect from "effect/Effect";
 *
 * const program = Effect.gen(function* () {
 *   // Add known entity labels
 *   yield* BloomFilter.bulkAdd(["Apple Inc.", "Microsoft Corporation", "Google LLC"]);
 *
 *   // Quick negative test - if false, definitely not a match
 *   const mayExist = yield* BloomFilter.contains("Apple Inc.");
 *   // mayExist === true (may be a match, needs verification)
 *
 *   const definitelyNot = yield* BloomFilter.contains("RandomXYZ123");
 *   // definitelyNot === false (definitely not in set, prune this candidate)
 * });
 * ```
 *
 * @since 0.1.0
 * @category services
 */
export class BloomFilter extends Effect.Service<BloomFilter>()($I`BloomFilter`, {
  accessors: true,
  effect: Effect.gen(function* () {
    // Initialize bit array
    const bitArray = createBitArray(DEFAULT_BIT_ARRAY_SIZE);
    let itemCount = 0;

    yield* Effect.logDebug("BloomFilter: initialized", {
      bitArraySize: DEFAULT_BIT_ARRAY_SIZE,
      numHashFunctions: NUM_HASH_FUNCTIONS,
      memoryBytes: bitArray.byteLength,
    });

    return {
      /**
       * Check if a text may exist in the filter
       *
       * Returns true if the text MAY be in the set (could be false positive).
       * Returns false if the text is DEFINITELY NOT in the set.
       *
       * @param text - Text to check for membership
       * @returns Effect that resolves to boolean membership result
       */
      contains: Effect.fn("BloomFilter.contains")(function* (text: string) {
        if (Str.isEmpty(Str.trim(text))) {
          return false;
        }

        const positions = computeHashPositions(text, DEFAULT_BIT_ARRAY_SIZE);

        // All bits must be set for a potential match
        const result = A.every(positions, (pos) => getBit(bitArray, pos));

        yield* Effect.logTrace("BloomFilter.contains", {
          textLength: text.length,
          result,
        });

        return result;
      }),

      /**
       * Add a text to the filter
       *
       * @param text - Text to add to the filter
       * @returns Effect that completes when text is added
       */
      add: Effect.fn("BloomFilter.add")(function* (text: string) {
        if (Str.isEmpty(Str.trim(text))) {
          return;
        }

        const positions = computeHashPositions(text, DEFAULT_BIT_ARRAY_SIZE);

        // Set all hash positions
        A.forEach(positions, (pos) => setBit(bitArray, pos));

        itemCount++;

        yield* Effect.logTrace("BloomFilter.add", {
          textLength: text.length,
          itemCount,
        });
      }),

      /**
       * Add multiple texts to the filter
       *
       * More efficient than calling add() repeatedly as it batches logging.
       *
       * @param texts - Array of texts to add to the filter
       * @returns Effect that completes when all texts are added
       */
      bulkAdd: Effect.fn("BloomFilter.bulkAdd")(function* (texts: ReadonlyArray<string>) {
        if (A.isEmptyReadonlyArray(texts)) {
          return;
        }

        // Filter non-empty texts and process them
        const validTexts = A.filter(texts, (text) => !Str.isEmpty(Str.trim(text)));

        A.forEach(validTexts, (text) => {
          const positions = computeHashPositions(text, DEFAULT_BIT_ARRAY_SIZE);
          A.forEach(positions, (pos) => setBit(bitArray, pos));
          itemCount++;
        });

        yield* Effect.logDebug("BloomFilter.bulkAdd", {
          requestedCount: texts.length,
          addedCount: validTexts.length,
          totalItemCount: itemCount,
        });
      }),

      /**
       * Get current filter statistics
       *
       * Useful for monitoring filter saturation and effectiveness.
       *
       * @returns Effect resolving to filter statistics
       */
      getStats: Effect.fn("BloomFilter.getStats")(function* () {
        // Count set bits using popcount on each element
        const setBitCount = A.reduce(A.fromIterable(bitArray), 0, (acc, element) => acc + popcount(element));

        const fillRatio = setBitCount / DEFAULT_BIT_ARRAY_SIZE;

        // Approximate false positive rate: (fillRatio)^numHashFunctions
        const estimatedFalsePositiveRate = Math.pow(fillRatio, NUM_HASH_FUNCTIONS);

        const stats = {
          itemCount,
          bitArraySize: DEFAULT_BIT_ARRAY_SIZE,
          setBitCount,
          fillRatio,
          estimatedFalsePositiveRate,
          numHashFunctions: NUM_HASH_FUNCTIONS,
          memoryBytes: bitArray.byteLength,
        };

        yield* Effect.logDebug("BloomFilter.getStats", stats);

        return stats;
      }),

      /**
       * Clear the filter and reset to initial state
       *
       * @returns Effect that completes when filter is cleared
       */
      clear: Effect.fn("BloomFilter.clear")(function* () {
        bitArray.fill(0);
        itemCount = 0;

        yield* Effect.logDebug("BloomFilter.clear: filter reset");
      }),
    };
  }),
}) {}
