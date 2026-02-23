export declare namespace StringTypes {
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
  export type NonEmptyString<T extends string = string> = T extends ""
    ? never
    : T
}
