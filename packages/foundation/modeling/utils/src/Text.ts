/**
 * Text formatting helpers for command and document output.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { flow, pipe } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

const descriptionFromOptions = (options: { readonly description: string }): string =>
  P.isString(options) ? options : options.description;

/**
 * Splits comma-separated text, trims each entry, and drops empty values.
 *
 * @example
 * ```ts
 * import { Text } from "@beep/utils"
 *
 * const tags = Text.splitCommaSeparatedTrimmed(" foo , bar , , baz ")
 * // ["foo", "bar", "baz"]
 *
 * void tags
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const splitCommaSeparatedTrimmed = flow(Str.split(","), A.map(Str.trim), A.filter(Str.isNonEmpty));

/**
 * Renders a named list row with optional aliases.
 *
 * Produces `"name (alias1, alias2): description"` when aliases are present,
 * or `"name: description"` when there are none.
 *
 * @example
 * ```ts
 * import { Text } from "@beep/utils"
 *
 * const row = Text.formatNameWithAliases("ls", ["list", "dir"], { description: "List files" })
 * // "ls (list, dir): List files"
 *
 * const noAlias = Text.formatNameWithAliases("rm", [], { description: "Remove files" })
 * // "rm: Remove files"
 *
 * void row
 * void noAlias
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const formatNameWithAliases: {
  (aliases: ReadonlyArray<string>, options: { readonly description: string }): (name: string) => string;
  (name: string, aliases: ReadonlyArray<string>, options: { readonly description: string }): string;
} = dual(3, (name: string, aliases: ReadonlyArray<string>, options: { readonly description: string }): string => {
  const description = descriptionFromOptions(options);

  return pipe(
    aliases,
    A.match({
      onEmpty: () => `${name}: ${description}`,
      onNonEmpty: (nonEmptyAliases) => `${name} (${A.join(nonEmptyAliases, ", ")}): ${description}`,
    })
  );
});

/**
 * Joins text lines with a newline separator.
 *
 * @example
 * ```ts
 * import { Text } from "@beep/utils"
 *
 * const block = Text.joinLines(["hello", "world"])
 * // "hello\nworld"
 *
 * void block
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const joinLines = (lines: ReadonlyArray<string>): string => A.join(lines, "\n");
