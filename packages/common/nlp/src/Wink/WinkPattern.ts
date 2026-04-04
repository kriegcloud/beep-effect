/**
 * Wink custom-entity pattern models.
 *
 * @since 0.0.0
 * @module @beep/nlp/Wink/WinkPattern
 */

import { $NlpId } from "@beep/identity";
import { Chunk, Match, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import { MarkRange, type Pattern, type PatternElement } from "../Core/Pattern.ts";

const $I = $NlpId.create("Wink/WinkPattern");

const customEntityKey = (example: CustomEntityExample): string =>
  pipe(
    [
      example.name,
      pipe(
        example.mark,
        O.match({
          onNone: () => "none",
          onSome: ([start, end]) => `${start}:${end}`,
        })
      ),
      A.join(example.patterns, "|"),
    ],
    A.join("#")
  );

const renderPatternElement = Match.type<PatternElement>().pipe(
  Match.tagsExhaustive({
    EntityPatternElement: ({ value }) => A.join(value, "|"),
    LiteralPatternElement: ({ value }) => A.join(value, "|"),
    POSPatternElement: ({ value }) => A.join(value, "|"),
  })
);

const patternElementToBracketString = (pattern: Pattern): ReadonlyArray<string> =>
  pipe(
    Chunk.toReadonlyArray(pattern.elements),
    A.map(renderPatternElement),
    A.map((content) => `[${content}]`)
  );

/**
 * Branded identifier for a wink custom-entity group.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const EntityGroupName = S.NonEmptyString.pipe(
  S.brand("EntityGroupName"),
  S.annotate(
    $I.annote("EntityGroupName", {
      description: "Stable identifier for a learned wink custom-entity group.",
    })
  )
);

/**
 * Runtime type for {@link EntityGroupName}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type EntityGroupName = typeof EntityGroupName.Type;

/**
 * One custom-entity example expressed as ordered bracket-pattern elements.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CustomEntityExample extends S.Class<CustomEntityExample>($I`CustomEntityExample`)(
  {
    mark: S.OptionFromOptionalKey(MarkRange),
    name: S.NonEmptyString,
    patterns: S.NonEmptyArray(S.NonEmptyString),
  },
  $I.annote("CustomEntityExample", {
    description: "Bracket-pattern example used to teach wink a custom entity type.",
  })
) {
  /**
   * Backwards-compatible unsafe constructor alias.
   */
  static readonly make = CustomEntityExample.makeUnsafe;

  /**
   * Convert the example into the object shape accepted by `wink-nlp.learnCustomEntities`.
   *
   * @returns {{ readonly mark?: readonly [number, number] | undefined; readonly name: string; readonly patterns: ReadonlyArray<string> }} - The wink-compatible custom entity example payload.
   */
  toWinkExample(): {
    readonly mark?: readonly [number, number] | undefined;
    readonly name: string;
    readonly patterns: ReadonlyArray<string>;
  } {
    return {
      ...(O.isSome(this.mark) ? { mark: this.mark.value } : {}),
      name: this.name,
      patterns: [A.join(this.patterns, " ")],
    };
  }
}

/**
 * Collection of learned custom-entity examples tracked as one logical group.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class WinkEngineCustomEntities extends S.Class<WinkEngineCustomEntities>($I`WinkEngineCustomEntities`)(
  {
    name: EntityGroupName,
    patterns: S.Array(CustomEntityExample),
  },
  $I.annote("WinkEngineCustomEntities", {
    description: "Collection of custom entity examples that can be learned by the wink engine.",
  })
) {
  /**
   * Backwards-compatible unsafe constructor alias.
   */
  static readonly make = WinkEngineCustomEntities.makeUnsafe;

  /**
   * Build a wink custom-entity collection from existing core patterns.
   *
   * Patterns without any serialized elements are ignored instead of throwing so
   * callers can safely combine partially-built pattern sets before learning.
   *
   * @param name {EntityGroupName | string} - The logical entity-group name.
   * @param patterns {ReadonlyArray<Pattern> | Chunk.Chunk<Pattern>} - Core patterns to convert into wink custom entity examples.
   * @returns {WinkEngineCustomEntities} - The converted custom entity collection.
   */
  static fromPatterns(
    name: EntityGroupName | string,
    patterns: ReadonlyArray<Pattern> | Chunk.Chunk<Pattern>
  ): WinkEngineCustomEntities {
    const groupName = P.isString(name) ? EntityGroupName.makeUnsafe(name) : name;
    const entries = Chunk.isChunk(patterns) ? Chunk.toReadonlyArray(patterns) : patterns;

    return new WinkEngineCustomEntities({
      name: groupName,
      patterns: pipe(
        entries,
        A.filterMap((pattern) => {
          const serialized = patternElementToBracketString(pattern);
          const [head, ...tail] = serialized;
          return head === undefined
            ? Result.failVoid
            : Result.succeed(
                new CustomEntityExample({
                  mark: pattern.mark,
                  name: groupName,
                  patterns: [head, ...tail],
                })
              );
        })
      ),
    });
  }

  /**
   * Number of custom entity examples in the group.
   *
   * @returns {number} - The number of examples in this group.
   */
  size(): number {
    return A.length(this.patterns);
  }

  /**
   * Whether the collection contains no examples.
   *
   * @returns {boolean} - `true` when the group has no examples.
   */
  isEmpty(): boolean {
    return A.isReadonlyArrayEmpty(this.patterns);
  }

  /**
   * Convert to a readonly array for iteration.
   *
   * @returns {ReadonlyArray<CustomEntityExample>} - The examples in this group.
   */
  toArray(): ReadonlyArray<CustomEntityExample> {
    return this.patterns;
  }

  /**
   * Merge two custom-entity collections, preserving unique examples by content.
   *
   * @param other {WinkEngineCustomEntities} - The additional examples to merge in.
   * @param newName {EntityGroupName | string} - The group name to use for the merged collection.
   * @returns {WinkEngineCustomEntities} - A merged collection with duplicate examples removed.
   */
  merge(other: WinkEngineCustomEntities, newName: EntityGroupName | string = this.name): WinkEngineCustomEntities {
    return new WinkEngineCustomEntities({
      name: P.isString(newName) ? EntityGroupName.makeUnsafe(newName) : newName,
      patterns: pipe(
        this.patterns,
        A.appendAll(other.patterns),
        A.map((example) => [customEntityKey(example), example] as const),
        A.dedupeWith(([left], [right]) => left === right),
        A.map(([, example]) => example)
      ),
    });
  }

  /**
   * Convert to the array-of-example format accepted by `wink-nlp.learnCustomEntities`.
   *
   * @returns {ReadonlyArray<{ readonly mark?: readonly [number, number] | undefined; readonly name: string; readonly patterns: ReadonlyArray<string> }>} - Wink-compatible custom entity payloads.
   */
  toWinkFormat(): ReadonlyArray<{
    readonly mark?: readonly [number, number] | undefined;
    readonly name: string;
    readonly patterns: ReadonlyArray<string>;
  }> {
    return pipe(
      this.patterns,
      A.map((pattern) => pattern.toWinkExample())
    );
  }
}
