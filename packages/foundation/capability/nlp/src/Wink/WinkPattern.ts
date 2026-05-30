/**
 * Wink custom-entity pattern models.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $NlpId } from "@beep/identity";
import { A } from "@beep/utils";
import { Chunk, Match, pipe, Result } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { MarkRange } from "../Core/Pattern.ts";
import type { Pattern, PatternElement } from "../Core/Pattern.ts";

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
 * Branded identifier for a learned wink custom-entity group.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { EntityGroupName } from "@beep/nlp/Wink/WinkPattern"
 *
 * const entityGroupName = S.decodeSync(EntityGroupName)("ProductName")
 * console.log(entityGroupName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const EntityGroupName = S.NonEmptyString.pipe(
  S.brand("EntityGroupName"),
  $I.annoteSchema("EntityGroupName", {
    description: "Stable identifier for a learned wink custom-entity group.",
  })
);

/**
 * Runtime TypeScript type produced by {@link EntityGroupName}.
 *
 * @example
 * ```ts
 * import { EntityGroupName } from "@beep/nlp/Wink/WinkPattern"
 * import type { EntityGroupName as EntityGroupNameType } from "@beep/nlp/Wink/WinkPattern"
 *
 * const groupName: EntityGroupNameType = EntityGroupName.make("ProductName")
 * console.log(groupName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type EntityGroupName = typeof EntityGroupName.Type;

/**
 * One wink custom-entity training example expressed as bracket-pattern elements.
 *
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import { CustomEntityExample } from "@beep/nlp/Wink/WinkPattern"
 *
 * const example = CustomEntityExample.make({
 *   mark: O.none(),
 *   name: "ProductName",
 *   patterns: ["[PROPN]", "[NOUN]"]
 * })
 *
 * console.log(example.toWinkExample().patterns)
 * ```
 *
 * @category models
 * @since 0.0.0
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
  /**
   * Convert the example into the object shape accepted by `wink-nlp.learnCustomEntities`.
   *
   * @returns The wink-compatible custom entity example payload.
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
 * Collection of custom-entity examples learned as one logical wink entity group.
 *
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import { CustomEntityExample, EntityGroupName, WinkEngineCustomEntities } from "@beep/nlp/Wink/WinkPattern"
 *
 * const customEntities = WinkEngineCustomEntities.make({
 *   name: EntityGroupName.make("ProductName"),
 *   patterns: [
 *     CustomEntityExample.make({
 *       mark: O.none(),
 *       name: "ProductName",
 *       patterns: ["[PROPN]", "[NOUN]"]
 *     })
 *   ]
 * })
 *
 * console.log(customEntities.toWinkFormat()[0]?.name)
 * ```
 *
 * @category models
 * @since 0.0.0
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
  /**
   * Build a wink custom-entity collection from existing core patterns.
   *
   * Patterns without any serialized elements are ignored instead of throwing so
   * callers can safely combine partially-built pattern sets before learning.
   *
   * @param name - The logical entity-group name.
   * @param patterns - Core patterns to convert into wink custom entity examples.
   * @returns The converted custom entity collection.
   */
  static readonly fromPatterns: {
    (name: EntityGroupName | string, patterns: ReadonlyArray<Pattern> | Chunk.Chunk<Pattern>): WinkEngineCustomEntities;
    (
      name: EntityGroupName | string
    ): (patterns: ReadonlyArray<Pattern> | Chunk.Chunk<Pattern>) => WinkEngineCustomEntities;
  } = dual(
    2,
    (
      name: EntityGroupName | string,
      patterns: ReadonlyArray<Pattern> | Chunk.Chunk<Pattern>
    ): WinkEngineCustomEntities => {
      const groupName = P.isString(name) ? EntityGroupName.make(name) : name;
      const entries = Chunk.isChunk(patterns) ? Chunk.toReadonlyArray(patterns) : patterns;

      return WinkEngineCustomEntities.make({
        name: groupName,
        patterns: pipe(
          entries,
          A.filterMap((pattern) => {
            const serialized = patternElementToBracketString(pattern);
            const [head, ...tail] = serialized;
            return head === undefined
              ? Result.failVoid
              : Result.succeed(
                  CustomEntityExample.make({
                    mark: pattern.mark,
                    name: groupName,
                    patterns: [head, ...tail],
                  })
                );
          })
        ),
      });
    }
  );

  /**
   * Number of custom entity examples in the group.
   *
   * @returns The number of examples in this group.
   */
  size(): number {
    return A.length(this.patterns);
  }

  /**
   * Whether the collection contains no examples.
   *
   * @returns `true` when the group has no examples.
   */
  isEmpty(): boolean {
    return A.isReadonlyArrayEmpty(this.patterns);
  }

  /**
   * Convert to a readonly array for iteration.
   *
   * @returns The examples in this group.
   */
  toArray(): ReadonlyArray<CustomEntityExample> {
    return this.patterns;
  }

  /**
   * Merge two custom-entity collections, preserving unique examples by content.
   *
   * @param other - The additional examples to merge in.
   * @param newName - The group name to use for the merged collection.
   * @returns A merged collection with duplicate examples removed.
   */
  merge(other: WinkEngineCustomEntities, newName: EntityGroupName | string = this.name): WinkEngineCustomEntities {
    return WinkEngineCustomEntities.make({
      name: P.isString(newName) ? EntityGroupName.make(newName) : newName,
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
   * @returns Wink-compatible custom entity payloads.
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
