import { invariant } from "@beep/invariant";
import { sid } from "@beep/schema/id";
import { annotate, makeMocker } from "@beep/schema/utils";
import { faker } from "@faker-js/faker";
import * as S from "effect/Schema";
import * as Str from "effect/String";
/**
 * Hex color string schema.
 *
 * Accepts the common CSS forms (case-insensitive):
 * - `#RGB`
 * - `#RGBA`
 * - `#RRGGBB`
 * - `#RRGGBBAA`
 *
 * Validation only — no normalization (we don’t expand `#RGB` → `#RRGGBB`, etc.).
 *
 * ## Examples
 * ```ts
 * const decode = S.decodeUnknown(Hex.Schema);
 * await decode("#fff");        // ok
 * await decode("#ff00cc");     // ok
 * await decode("#abcd");       // ok (RGBA)
 * await decode("ff00cc");      // ParseIssue (missing '#')
 * ```
 *
 * ## Mocks
 * ```ts
 * const one = Hex.Mock("type", 1, true); // -> "#a1b2c3"
 * const many = Hex.Mock("type", 5);      // -> readonly string[]
 * ```
 *
 * @since 0.1.0
 * @category Color
 */
export namespace Hex {
  export const REGEX =
    /^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6}|[a-fA-F0-9]{4}|[a-fA-F0-9]{8})$/;
  /**
   * Non-empty, branded `"Hex"` string:
   * - starts with `#` (via `TemplateLiteral`)
   * - matches 3/4/6/8 hex digits (via `pattern`)
   */
  export const Base = S.TemplateLiteral("#", S.String).pipe(
    S.pattern(REGEX),
    S.brand("Hex"),
  );

  /** Trusted constructor (no validation). Prefer decoding for user input. */
  export const make = (i: string) => {
    invariant(S.is(Base)(i), `Invalid Hex: ${i}`, {
      file: "packages/common/src/schema/hex.schema.ts",
      line: 42,
      args: [i],
    });

    return Base.make(i);
  };
  /**
   * Full schema with identity, docs, JSON Schema, and an arbitrary that
   * samples valid lengths uniformly and guarantees exactly one leading `#`.
   */

  export const Schema = annotate(Base, {
    identifier: sid.common.schema("Hex.Schema"),
    title: "Hex",
    description: "A valid hex color",
    jsonSchema: {
      type: "string",
      format: "hex",
      pattern: String(REGEX),
    },
    examples: [make("#fff"), make("#ff00cc"), make("#abcd"), make("#a1b2c3")],
    arbitrary: () => (fc) =>
      fc
        .constant(null)
        .map(() =>
          Base.make(
            Str.concat(
              "#",
              Str.replace(/^#/, "#")(faker.color.rgb({ format: "hex" })),
            ),
          ),
        ),
  });

  /** Hex color string type (branded). */
  export type Type = typeof Schema.Type;

  /** Curried mock factory (FastCheck + Effect Arbitrary). */
  export const Mock = makeMocker(Schema);
}
