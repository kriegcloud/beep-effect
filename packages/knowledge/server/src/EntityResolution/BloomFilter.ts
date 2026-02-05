import { $KnowledgeServerId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Str from "effect/String";

const $I = $KnowledgeServerId.create("EntityResolution/BloomFilter");

const DEFAULT_BIT_ARRAY_SIZE = 1_000_000;

const NUM_HASH_FUNCTIONS = 3;

const djb2Hash = (text: string, seed: number): number => {
  let hash = 5381 + seed;
  for (let i = 0; i < Str.length(text); i++) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
};

const sdbmHash = (text: string, seed: number): number => {
  let hash = seed;
  for (let i = 0; i < Str.length(text); i++) {
    hash = text.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
    hash = hash >>> 0;
  }
  return hash;
};

const fnv1aHash = (text: string, seed: number): number => {
  let hash = 2166136261 ^ seed;
  for (let i = 0; i < Str.length(text); i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
    hash = hash >>> 0;
  }
  return hash;
};

const computeHashPositions = (text: string, bitArraySize: number): readonly number[] => {
  const normalizedText = Str.toLowerCase(Str.trim(text));
  return [
    djb2Hash(normalizedText, 0) % bitArraySize,
    sdbmHash(normalizedText, 1) % bitArraySize,
    fnv1aHash(normalizedText, 2) % bitArraySize,
  ];
};

const createBitArray = (size: number): Uint32Array => {
  const arrayLength = Math.ceil(size / 32);
  return new Uint32Array(arrayLength);
};

const setBit = (bitArray: Uint32Array, position: number): void => {
  const arrayIndex = Math.floor(position / 32);
  const bitIndex = position % 32;
  const element = bitArray[arrayIndex];
  if (element !== undefined) {
    bitArray[arrayIndex] = element | (1 << bitIndex);
  }
};

const getBit = (bitArray: Uint32Array, position: number): boolean => {
  const arrayIndex = Math.floor(position / 32);
  const bitIndex = position % 32;
  const element = bitArray[arrayIndex];
  if (element === undefined) return false;
  return (element & (1 << bitIndex)) !== 0;
};

const popcount = (n: number): number => {
  let count = 0;
  let value = n;
  while (value !== 0) {
    value = value & (value - 1);
    count++;
  }
  return count;
};

export interface BloomFilterShape {
  readonly contains: (text: string) => Effect.Effect<boolean>;
  readonly add: (text: string) => Effect.Effect<void>;
  readonly bulkAdd: (texts: ReadonlyArray<string>) => Effect.Effect<void>;
  readonly getStats: () => Effect.Effect<{
    readonly itemCount: number;
    readonly bitArraySize: number;
    readonly setBitCount: number;
    readonly fillRatio: number;
    readonly estimatedFalsePositiveRate: number;
    readonly numHashFunctions: number;
    readonly memoryBytes: number;
  }>;
  readonly clear: () => Effect.Effect<void>;
}

export class BloomFilter extends Context.Tag($I`BloomFilter`)<BloomFilter, BloomFilterShape>() {}

const serviceEffect: Effect.Effect<BloomFilterShape> = Effect.gen(function* () {
  const bitArray = createBitArray(DEFAULT_BIT_ARRAY_SIZE);
  let itemCount = 0;

  yield* Effect.logDebug("BloomFilter: initialized").pipe(
    Effect.annotateLogs({
      bitArraySize: DEFAULT_BIT_ARRAY_SIZE,
      numHashFunctions: NUM_HASH_FUNCTIONS,
      memoryBytes: bitArray.byteLength,
    })
  );

  const contains = Effect.fn("BloomFilter.contains")(function* (text: string) {
    if (Str.isEmpty(Str.trim(text))) {
      return false;
    }

    const positions = computeHashPositions(text, DEFAULT_BIT_ARRAY_SIZE);

    const result = A.every(positions, (pos) => getBit(bitArray, pos));

    yield* Effect.logTrace("BloomFilter.contains").pipe(
      Effect.annotateLogs({
        textLength: Str.length(text),
        result,
      })
    );

    return result;
  });

  const add = Effect.fn("BloomFilter.add")(function* (text: string) {
    if (Str.isEmpty(Str.trim(text))) {
      return;
    }

    const positions = computeHashPositions(text, DEFAULT_BIT_ARRAY_SIZE);

    A.forEach(positions, (pos) => setBit(bitArray, pos));

    itemCount++;

    yield* Effect.logTrace("BloomFilter.add").pipe(
      Effect.annotateLogs({
        textLength: Str.length(text),
        itemCount,
      })
    );
  });

  const bulkAdd = Effect.fn("BloomFilter.bulkAdd")(function* (texts: ReadonlyArray<string>) {
    if (A.isEmptyReadonlyArray(texts)) {
      return;
    }

    const validTexts = A.filter(texts, (text) => !Str.isEmpty(Str.trim(text)));

    A.forEach(validTexts, (text) => {
      const positions = computeHashPositions(text, DEFAULT_BIT_ARRAY_SIZE);
      A.forEach(positions, (pos) => setBit(bitArray, pos));
      itemCount++;
    });

    yield* Effect.logDebug("BloomFilter.bulkAdd").pipe(
      Effect.annotateLogs({
        requestedCount: A.length(texts),
        addedCount: A.length(validTexts),
        totalItemCount: itemCount,
      })
    );
  });

  const getStats = Effect.fn("BloomFilter.getStats")(function* () {
    const setBitCount = A.reduce(A.fromIterable(bitArray), 0, (acc, element) => acc + popcount(element));

    const fillRatio = setBitCount / DEFAULT_BIT_ARRAY_SIZE;

    const estimatedFalsePositiveRate = fillRatio ** NUM_HASH_FUNCTIONS;

    const stats = {
      itemCount,
      bitArraySize: DEFAULT_BIT_ARRAY_SIZE,
      setBitCount,
      fillRatio,
      estimatedFalsePositiveRate,
      numHashFunctions: NUM_HASH_FUNCTIONS,
      memoryBytes: bitArray.byteLength,
    };

    yield* Effect.logDebug("BloomFilter.getStats").pipe(Effect.annotateLogs(stats));

    return stats;
  });

  const clear = Effect.fn("BloomFilter.clear")(function* () {
    bitArray.fill(0);
    itemCount = 0;

    yield* Effect.logDebug("BloomFilter.clear: filter reset");
  });

  return BloomFilter.of({
    contains,
    add,
    bulkAdd,
    getStats,
    clear,
  });
});

export const BloomFilterLive = Layer.effect(BloomFilter, serviceEffect);
