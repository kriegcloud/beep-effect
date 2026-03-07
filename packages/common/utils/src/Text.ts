import { flow, String as Str } from "effect";
import * as A from "effect/Array";

/**
 * Split comma-separated text, trim each entry, and drop empty values.
 *
 * @since 0.0.0
 */
export const splitCommaSeparatedTrimmed = flow(Str.split(","), A.map(Str.trim), A.filter(Str.isNonEmpty));

/**
 * Render a named list row with optional aliases.
 *
 * @since 0.0.0
 */
export const formatNameWithAliases = (name: string, aliases: ReadonlyArray<string>, description: string): string =>
  `${name}${A.isReadonlyArrayNonEmpty(aliases) ? ` (${A.join(aliases, ", ")})` : ""}: ${description}`;

/**
 * Join text lines with a newline separator.
 *
 * @since 0.0.0
 */
export const joinLines = (lines: ReadonlyArray<string>): string => A.join(lines, "\n");
