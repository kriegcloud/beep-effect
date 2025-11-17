/**
 * Lowercase ASCII alphabet for template literal helpers.
 *
 * Useful for constraining tag pieces or validating slug inputs at the type
 * level.
 *
 * @example
 * import type * as LiteralTypes from "@beep/types/literal.types";
 *
 * type Resource = `${LiteralTypes.LowerChar}${"_" | "-"}${LiteralTypes.LowerChar}`;
 * let example!: Resource;
 * void example;
 *
 * @category Types/Literals
 * @since 0.1.0
 */
export type LowerChar =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";

/**
 * Uppercase ASCII alphabet for template literal helpers.
 *
 * Combine with {@link LowerChar} to express case-specific naming transforms.
 *
 * @example
 * import type * as LiteralTypes from "@beep/types/literal.types";
 *
 * type Alias = `${LiteralTypes.UpperChar}${LiteralTypes.LowerChar}${LiteralTypes.LowerChar}`;
 * let example!: Alias;
 * void example;
 *
 * @category Types/Literals
 * @since 0.1.0
 */
export type UpperChar =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

/**
 * String literal helpers mirroring the schema documentation playbook
 * (snake ↔ pascal plus pluralization).
 *
 * @example
 * import type { CaseTransform } from "@beep/types/literal.types";
 *
 * type ResourceName = CaseTransform.SnakeToPascal<"file_object">;
 * let example!: ResourceName;
 * void example;
 *
 * @category Types/Strings
 * @since 0.1.0
 */
export declare namespace CaseTransform {
  /**
   * Converts `snake_case` strings to `PascalCase`.
   *
   * @example
   * import type { CaseTransform } from "@beep/types/literal.types";
   *
   * type Entity = CaseTransform.SnakeToPascal<"user_session">;
   * let example!: Entity;
   * void example;
   *
   * @category Types/Strings
   * @since 0.1.0
   */
  export type SnakeToPascal<S extends string> = S extends `${infer Head}_${infer Tail}`
    ? `${Capitalize<Head>}${SnakeToPascal<Capitalize<Tail>>}`
    : Capitalize<S>;

  /**
   * Converts `PascalCase` strings to `snake_case`, preserving ordering.
   *
   * @example
   * import type { CaseTransform } from "@beep/types/literal.types";
   *
   * type Table = CaseTransform.PascalToSnake<"UserSession">;
   * let example!: Table;
   * void example;
   *
   * @category Types/Strings
   * @since 0.1.0
   */
  export type PascalToSnake<S extends string> = S extends `${infer Head}${infer Tail}`
    ? Head extends Lowercase<Head>
      ? `${Head}${PascalToSnake<Tail>}`
      : `_${Lowercase<Head>}${PascalToSnake<Tail>}`
    : S;

  type CleanLeadingUnderscore<S extends string> = S extends `_${infer Rest}` ? Rest : S;

  /**
   * Converts `PascalCase` strings to `snake_case` and drops the leading `_`
   * that {@link PascalToSnake} uses to mark the first capital.
   *
   * @example
   * import type { CaseTransform } from "@beep/types/literal.types";
   *
   * type Slug = CaseTransform.PascalToSnakeClean<"UserSession">;
   * let example!: Slug;
   * void example;
   *
   * @category Types/Strings
   * @since 0.1.0
   */
  export type PascalToSnakeClean<S extends string> = CleanLeadingUnderscore<PascalToSnake<S>>;

  type Pluralize<S extends string> =
    // Irregular plurals
    S extends "child"
      ? "children"
      : S extends "person"
        ? "people"
        : S extends "campus"
          ? "campuses"
          : S extends "address"
            ? "addresses"
            : // Words ending in 'y' preceded by consonant
              S extends `${infer Base}${infer Consonant}y`
              ? Consonant extends "a" | "e" | "i" | "o" | "u"
                ? `${S}s`
                : `${Base}${Consonant}ies`
              : // Words ending in s, x, z, ch, sh
                S extends `${string}s` | `${string}x` | `${string}z` | `${string}ch` | `${string}sh`
                ? `${S}es`
                : // Words ending in 'f' or 'fe'
                  S extends `${infer Base}f`
                  ? `${Base}ves`
                  : S extends `${infer Base}fe`
                    ? `${Base}ves`
                    : // Default: add 's'
                      `${S}s`;

  type Singularize<S extends string> =
    // Irregular singulars
    S extends "children"
      ? "child"
      : S extends "people"
        ? "person"
        : S extends "campuses"
          ? "campus"
          : S extends "addresses"
            ? "address"
            : // Regular patterns
              S extends `${infer Base}ies`
              ? `${Base}y`
              : S extends `${infer Base}ves`
                ? `${Base}f`
                : S extends `${infer Base}es`
                  ? Base extends `${string}s` | `${string}x` | `${string}z` | `${string}ch` | `${string}sh`
                    ? `${Base}`
                    : `${Base}e`
                  : S extends `${infer Base}s`
                    ? Base
                    : S;

  /**
   * Converts `snake_case` strings to plural `PascalCase`.
   *
   * @example
   * import type { CaseTransform } from "@beep/types/literal.types";
   *
   * type EntityPlural = CaseTransform.SnakeToPascalPlural<"user_session">;
   * let example!: EntityPlural;
   * void example;
   *
   * @category Types/Strings
   * @since 0.1.0
   */
  export type SnakeToPascalPlural<S extends string> = Pluralize<SnakeToPascal<S>>;

  /**
   * Converts `snake_case` plurals to singular `PascalCase`.
   *
   * @example
   * import type { CaseTransform } from "@beep/types/literal.types";
   *
   * type EntitySingular = CaseTransform.SnakeToPascalSingular<"user_sessions">;
   * let example!: EntitySingular;
   * void example;
   *
   * @category Types/Strings
   * @since 0.1.0
   */
  export type SnakeToPascalSingular<S extends string> = Singularize<SnakeToPascal<S>>;

  /**
   * Converts `PascalCase` strings to pluralized `snake_case`.
   *
   * @example
   * import type { CaseTransform } from "@beep/types/literal.types";
   *
   * type TablePlural = CaseTransform.PascalToSnakePlural<"UserSession">;
   * let example!: TablePlural;
   * void example;
   *
   * @category Types/Strings
   * @since 0.1.0
   */
  export type PascalToSnakePlural<S extends string> = Pluralize<PascalToSnakeClean<S>>;

  /**
   * Converts `PascalCase` strings to singular `snake_case`.
   *
   * @example
   * import type { CaseTransform } from "@beep/types/literal.types";
   *
   * type TableSingular = CaseTransform.PascalToSnakeSingular<"UserSessions">;
   * let example!: TableSingular;
   * void example;
   *
   * @category Types/Strings
   * @since 0.1.0
   */
  export type PascalToSnakeSingular<S extends string> = Singularize<PascalToSnakeClean<S>>;

  /**
   * Converts plural `snake_case` strings to singular `PascalCase`.
   *
   * @example
   * import type { CaseTransform } from "@beep/types/literal.types";
   *
   * type EntityName = CaseTransform.SnakePluralToPascalSingular<"user_sessions">;
   * let example!: EntityName;
   * void example;
   *
   * @category Types/Strings
   * @since 0.1.0
   */
  export type SnakePluralToPascalSingular<S extends string> = SnakeToPascal<Singularize<S>>;

  /**
   * Converts singular `PascalCase` strings to plural `snake_case`.
   *
   * @example
   * import type { CaseTransform } from "@beep/types/literal.types";
   *
   * type TablePluralSlug = CaseTransform.PascalSingularToSnakePlural<"UserSession">;
   * let example!: TablePluralSlug;
   * void example;
   *
   * @category Types/Strings
   * @since 0.1.0
   */
  export type PascalSingularToSnakePlural<S extends string> = Pluralize<PascalToSnakeClean<S>>;
}
