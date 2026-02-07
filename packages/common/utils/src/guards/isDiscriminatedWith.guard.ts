import * as F from "effect/Function";
import * as P from "effect/Predicate";

/**
 * Returns a dual refinement scoped to a given discriminator property.
 * The returned function checks if a value has that property matching
 * a given discriminator value.
 *
 * @example
 * ```ts
 * import * as assert from "node:assert"
 * import { isDiscriminatedWith } from "@beep/utils"
 *
 * type Event = { kind: "click"; x: number } | { kind: "scroll"; delta: number }
 *
 * const byKind = isDiscriminatedWith("kind")
 *
 * // Data-last — returns a predicate
 * const isClick = byKind("click")
 * assert.strictEqual(isClick({ kind: "click", x: 10 }), true)
 * assert.strictEqual(isClick({ kind: "scroll", delta: 5 }), false)
 *
 * // Data-first — returns boolean directly
 * assert.strictEqual(byKind({ kind: "click", x: 10 }, "click"), true)
 * ```
 *
 * @category guards
 * @since 0.1.0
 */
export const isDiscriminatedWith = <D extends string>(
  discriminator: D
): {
  <K extends string>(discriminatorValue: K): (self: unknown) => self is { [Discriminator in D]: K };
  <K extends string>(self: unknown, discriminatorValue: K): self is { [Discriminator in D]: K };
} =>
  F.dual(
    2,
    <K extends string>(self: unknown, discriminatorValue: K): self is { [Discriminator in D]: K } =>
      P.hasProperty(self, discriminator) && self[discriminator] === discriminatorValue
  );
