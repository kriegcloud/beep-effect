/**
 * Constrains a string literal to be non-empty.
 *
 * @example
 * import type { NonEmptyString } from "@beep/types/string.types";
 *
 * type NonEmptyId = NonEmptyString<"user">;
 * let example!: NonEmptyId;
 * void example;
 *
 * @category Types/Strings
 * @since 0.1.0
 */
export type NonEmptyString<T extends string = string> = T extends "" ? never : T;

/**CreateEnumType
 * Non-empty string literal that is entirely lowercase.
 *
 * @example
 * import type { LowercaseNonEmptyString } from "@beep/types/string.types";
 *
 * type Slug = LowercaseNonEmptyString<"user">;
 * let example!: Slug;
 * void example;
 *
 * @category Types/Strings
 * @since 0.1.0
 */
export type LowercaseNonEmptyString<T extends string = string> =
  T extends NonEmptyString<T> ? (T extends Lowercase<T> ? T : never) : never;
