/**
 * Generic string helpers such as snake-case tags and optional defaults.
 *
 * These utilities power BS surface APIs that frequently compose optional string properties or slug-style identifiers.
 *
 * @example
 * import { SnakeTag, StringWithDefault } from "@beep/schema/primitives/string/string";
 *
 * const tag = SnakeTag.make("team_alpha");
 * const title = StringWithDefault("Untitled");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
import { invariant } from "@beep/invariant";
import { toOptionalWithDefault } from "@beep/schema/core/utils/to-optional-with";
import { $StringId } from "@beep/schema/internal";
import * as regexes from "@beep/schema/internal/regex/regexes";
import type { TagTypes } from "@beep/types";
import * as A from "effect/Array";
import * as S from "effect/Schema";

const Id = $StringId;

/**
 * Snake-case tag schema used for identifiers like `team_alpha`.
 *
 * @example
 * import { SnakeTag } from "@beep/schema/primitives/string/string";
 *
 * const tag = SnakeTag.make("org_primary");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class SnakeTag extends S.NonEmptyString.pipe(
  S.lowercased({ message: () => "SnakeTag must be lowercase" }),
  S.trimmed({ message: () => "SnakeTag must have no leading or trailing whitespace" }),
  S.pattern(regexes.snakeCaseTagRegex, {
    message: () => "SnakeTag must be a valid snake_case tag",
  })
).annotations(
  Id.annotations("string/SnakeTag", {
    description:
      "A snake_case tag made of lowercase letters, numbers, and underscores with no consecutive underscores.",
    examples: A.make("team_alpha", "group_one", "marketing_ops"),
    documentation: `
## Requirements
- Must be lowercase
- Must use snake_case (underscores between words)
- No leading, trailing, or consecutive underscores
- Whitespace trimmed automatically
`,
  })
) {
  /**
   * Type-safe `make` override that narrows the literal type.
   */
  static override readonly make = <const Value extends string>(
    tag: SnakeTag.Literal<Value>
  ): SnakeTag.Literal<Value> => {
    invariant(S.is(SnakeTag)(tag), "Must be a valid SnakeTag", {
      file: "@beep/schema/primitives/string/string.ts",
      line: 41,
      args: [tag],
    });
    return tag;
  };

  /** Determines if a value is a snake tag. */
  static readonly is = S.is(SnakeTag);
}

/**
 * Namespace exposing helper types for {@link SnakeTag}.
 *
 * @example
 * import type { SnakeTag } from "@beep/schema/primitives/string/string";
 *
 * type Tag = SnakeTag.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace SnakeTag {
  /**
   * Literal helper that constrains the string to snake-case at the type level.
   *
   * @example
   * import type { SnakeTag } from "@beep/schema/primitives/string/string";
   *
   * type Name = SnakeTag.Literal<"team_alpha">;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Literal<Value extends string> = TagTypes.SnakeTag<Value>;
  /**
   * Runtime type for {@link SnakeTag}.
   *
   * @example
   * import type { SnakeTag } from "@beep/schema/primitives/string/string";
   *
   * let tag: SnakeTag.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof SnakeTag>;
  /**
   * Encoded representation accepted by {@link SnakeTag}.
   *
   * @example
   * import type { SnakeTag } from "@beep/schema/primitives/string/string";
   *
   * let encoded: SnakeTag.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof SnakeTag>;
}

/**
 * Property signature representing an optional string with defaults applied.
 *
 * Useful for runtime models that store optional text fields while still exposing deterministic defaults on decode.
 *
 * @example
 * import type { StringPropertyOmittable } from "@beep/schema/primitives/string/string";
 *
 * type Title = StringPropertyOmittable;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export type StringPropertyOmittable = S.PropertySignature<":", string, never, "?:", string | undefined, true, never>;

/**
 * Helper for optional strings with defaults applied during decode and constructor phases.
 *
 * @example
 * import { StringWithDefault } from "@beep/schema/primitives/string/string";
 *
 * const title = StringWithDefault("Untitled");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export const StringWithDefault = (defaultValue: string): StringPropertyOmittable =>
  toOptionalWithDefault(S.String)(defaultValue);

/**
 * Namespace exposing helper types for {@link StringWithDefault}.
 *
 * @example
 * import { StringWithDefault } from "@beep/schema/primitives/string/string";
 *
 * type Title = StringWithDefault.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace StringWithDefault {
  /**
   * Runtime type for {@link StringWithDefault}.
   *
   * @example
   * import { StringWithDefault } from "@beep/schema/primitives/string/string";
   *
   * type Title = StringWithDefault.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<ReturnType<typeof StringWithDefault>>;
  /**
   * Encoded representation for {@link StringWithDefault}.
   *
   * @example
   * import { StringWithDefault } from "@beep/schema/primitives/string/string";
   *
   * type TitleEncoded = StringWithDefault.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<ReturnType<typeof StringWithDefault>>;
}
