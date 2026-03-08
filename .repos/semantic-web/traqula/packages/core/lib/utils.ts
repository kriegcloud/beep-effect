import type { ITokenConfig, TokenType } from '@traqula/chevrotain';
import { createToken as chevcT } from '@traqula/chevrotain';

/**
 * Check whether the first two types overlap, if no, return the 3th argument, else the 4th.
 */
export type CheckOverlap<T, U, V, W = never> = T & U extends never ? V : W;

/**
 * Lowercase the first letter of a given string.
 * @param str
 */
export function unCapitalize<T extends string>(str: T): Uncapitalize<T> {
  return <Uncapitalize<T>> (str.charAt(0).toLowerCase() + str.slice(1));
}

export type NamedToken<Name extends string = string> = TokenType & { name: Name };

/**
 * Create a token in a typesafe way necessary by the traqula core builders.
 */
export function createToken<Name extends string>(config: ITokenConfig & { name: Name }): NamedToken<Name> {
  return <TokenType & { name: Name }> chevcT(config);
}

/**
 * Patch a given type by changing the value-type of a specific key in the given object type.
 */
export type Patch<T extends object, Patch extends {[Key in keyof T ]?: unknown }> =
  {[Key in keyof T]: Key extends keyof Patch ? Patch[Key] : T[Key] };

/**
 * Key that allows you to set the space based indentation of your query when generating newlines using the NEW_LINE.
 * A value of -1 disables the generation of newlines from the NEW_LINE function
 */
export const traqulaIndentation = <const>
  'When you use this string, you expect traqula to handle indentation after every newline';

/**
 * Key that allows you to configure the string that should be printed in case newline generation is disabled by
 * {@link traqulaIndentation} NEW_LINE is called on the generator.
 */
export const traqulaNewlineAlternative = <const>
  `When you use this string, you expect that the core generator of Traqula does prints a given string instead of a ewline when NEW_LINE printing is disabled through traqulaIndentation`;
