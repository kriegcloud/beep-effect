/**
 * Matches any non-empty string.
 *
 * This is useful when you need a string that is not empty, for example, as a function parameter.
 *
 * NOTE:
 * - This returns `never` not just when instantiated with an empty string, but also when an empty string is a subtype of the instantiated type, like `string` or `Uppercase<string>`.
 *
 * @example
 * ```
 * import type {NonEmptyString} from 'type-fest';
 *
 * declare function foo<T extends string>(string: NonEmptyString<T>): void;
 *
 * foo('a');
 * //=> OK
 *
 * // @ts-expect-error
 * foo('');
 * //=> Error: Argument of type '""' is not assignable to parameter of type 'never'.
 *
 * declare const someString: string;
 * // @ts-expect-error
 * foo(someString);
 * //=> Error: Argument of type 'string' is not assignable to parameter of type 'never'.
 * ```
 *
 * @category String
 * @since 0.0.0
 * @module @beep/types/String.types
 */
export type NonEmpty<T extends string = string> = T extends "" ? never : T;

/**
 * Splits a string literal type into a union of its individual characters.
 *
 * @example
 * ```
 * import type { TString } from "@beep/types"
 *
 * type ABC = TString.Chars<"abc">
 * //=> "a" | "b" | "c"
 *
 * type Digits = TString.Chars<"0123456789">
 * //=> "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
 * ```
 *
 * @category String
 * @since 0.0.0
 */
export type Chars<S extends string> = S extends `${infer C}${infer Rest}` ? C | Chars<Rest> : never;
