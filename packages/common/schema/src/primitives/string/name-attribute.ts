/**
 * Human-friendly name attribute schema that enforces trimming, max length, and ASCII control guards.
 *
 * Provides a reusable primitive for entities that capture person/resource names while keeping arbitrary generators handy for tests.
 *
 * @example
 * import { NameAttribute } from "@beep/schema/primitives/string/name-attribute";
 *
 * const decoded = NameAttribute.make("Operations");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
import * as regexes from "@beep/schema/internal/regex/regexes";
import { faker } from "@faker-js/faker";
import * as S from "effect/Schema";
import { Id } from "./_id";

/**
 * Name attribute schema limiting values to trimmed, printable text between 1 and 200 characters.
 *
 * @example
 * import { NameAttribute } from "@beep/schema/primitives/string/name-attribute";
 *
 * NameAttribute.make("Engineering");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class NameAttribute extends S.NonEmptyTrimmedString.pipe(
  S.minLength(1),
  S.maxLength(200),
  S.pattern(regexes.NO_ASCII_CTRL)
).annotations(
  Id.annotations("name-attribute/NameAttribute", {
    description: "A printable, non-empty name attribute limited to 200 characters.",
    arbitrary: () => (fc) => fc.constant(null).map(() => faker.lorem.word()),
  })
) {}

/**
 * Namespace exposing helper types for {@link NameAttribute}.
 *
 * @example
 * import type { NameAttribute } from "@beep/schema/primitives/string/name-attribute";
 *
 * type NameValue = NameAttribute.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace NameAttribute {
  /**
   * Runtime type for {@link NameAttribute}.
   *
   * @example
   * import type { NameAttribute } from "@beep/schema/primitives/string/name-attribute";
   *
   * let name: NameAttribute.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof NameAttribute>;
  /**
   * Encoded type for {@link NameAttribute}.
   *
   * @example
   * import type { NameAttribute } from "@beep/schema/primitives/string/name-attribute";
   *
   * let encoded: NameAttribute.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof NameAttribute>;
}
