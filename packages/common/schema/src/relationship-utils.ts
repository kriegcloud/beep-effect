import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as R from "effect/Record";

export type RelationshipInput = {
  readonly sourceEntityTypeTag: string;
  readonly targetEntityTypeTags: ReadonlyArray<string>;
};

export type RelationshipPair = readonly [source: string, target: string];

export type GroupedRelationships = ReadonlyArray<{
  readonly sourceEntityType: string;
  readonly targetEntityTypes: ReadonlyArray<string>;
}>;

/**
 * Expands relationship inputs into bidirectional pairs with automatic compression.
 * - Self-relationships (e.g., person -> person) produce only one pair
 * - Different relationships produce bidirectional pairs
 * - Automatically deduplicates identical pairs
 */
export const expandBidirectionalPairs = Effect.fn("expandBidirectionalPairs")(function* (
  relationships: ReadonlyArray<RelationshipInput>
) {
  // Use HashSet to automatically deduplicate pairs
  const pairSet = F.pipe(
    relationships,
    A.flatMap((rel) =>
      F.pipe(
        rel.targetEntityTypeTags,
        A.flatMap((target) => {
          // For self-relationships, only create one pair
          if (rel.sourceEntityTypeTag === target) {
            return [[rel.sourceEntityTypeTag, target] as RelationshipPair];
          }
          // For different entities, create bidirectional pairs
          return [
            [rel.sourceEntityTypeTag, target] as RelationshipPair,
            [target, rel.sourceEntityTypeTag] as RelationshipPair,
          ];
        })
      )
    ),
    // Convert to HashSet to deduplicate based on pair equality
    (pairs) =>
      HashSet.fromIterable(
        F.pipe(
          pairs,
          A.map((pair) => `${pair[0]}|${pair[1]}`)
        )
      ),
    // Convert back to pairs
    HashSet.toValues,
    A.map((key) => {
      const parts = key.split("|");
      return [parts[0]!, parts[1]!] as RelationshipPair;
    })
  );

  return pairSet;
});

/**
 * Groups pairs by source entity and deduplicates target entities.
 * Produces a compressed output where each source appears once with all its unique targets.
 */
export const groupPairsBySource = Effect.fn("groupPairsBySource")(function* (pairs: ReadonlyArray<RelationshipPair>) {
  return F.pipe(
    pairs,
    A.groupBy(([source]) => source),
    R.mapEntries((edges, sourceEntityType) => [
      sourceEntityType,
      {
        sourceEntityType,
        targetEntityTypes: F.pipe(
          edges,
          A.map(([, target]) => target),
          A.dedupe
        ),
      },
    ]),
    R.values
  ) satisfies GroupedRelationships;
});

/**
 * Compresses duplicate pairs while preserving first-seen order.
 * Uses HashSet internally for efficient deduplication.
 */
export const compressPairs = Effect.fn("compressPairs")(function* (pairs: ReadonlyArray<RelationshipPair>) {
  type State = {
    readonly seen: HashSet.HashSet<string>;
    readonly result: ReadonlyArray<RelationshipPair>;
  };

  return F.pipe(
    pairs,
    A.reduce({ result: [], seen: HashSet.empty<string>() } as State, (state, [source, target]) => {
      const key = `${source}|${target}`;
      if (F.pipe(state.seen, HashSet.has(key))) {
        return state;
      }
      return {
        result: [...state.result, [source, target] as RelationshipPair],
        seen: F.pipe(state.seen, HashSet.add(key)),
      };
    }),
    (state) => state.result
  );
});

/**
 * Compresses relationship inputs by combining duplicates.
 * Multiple inputs with the same source are merged into one with combined targets.
 */
export const compressRelationshipInputs = Effect.fn("compressRelationshipInputs")(function* (
  inputs: ReadonlyArray<RelationshipInput>
) {
  return F.pipe(
    inputs,
    // Group by source entity type
    A.groupBy((input) => input.sourceEntityTypeTag),
    // Merge all targets for each source
    R.mapEntries((inputsForSource, sourceEntityTypeTag) => [
      sourceEntityTypeTag,
      {
        sourceEntityTypeTag,
        targetEntityTypeTags: F.pipe(
          inputsForSource,
          A.flatMap((input) => input.targetEntityTypeTags),
          // Deduplicate targets
          A.dedupe
        ),
      },
    ]),
    R.values
  );
});
