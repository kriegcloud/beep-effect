import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";

/**
 * Extract the CSS variable name from a `var(--...)` expression.
 *
 * @param cssValue - A string like `var(--variable-name)` or `var(--variable-name, fallback)`.
 * @returns The extracted CSS variable name (e.g., '--palette-Tooltip-bg').
 *
 * @example
 * parseCssVar('var(--palette-Tooltip-bg)'); // → '--palette-Tooltip-bg'
 * parseCssVar('var(--palette-Tooltip-bg, rgba(69, 79, 91, 0.92))'); // → '--palette-Tooltip-bg'
 * parseCssVar(theme.vars.palette.Tooltip.bg); // → '--palette-Tooltip-bg'
 */
export function parseCssVar(cssValue: unknown): string {
  if (!P.isString(cssValue) || !Str.trim(cssValue)) {
    console.error("Invalid input: CSS value must be a non-empty string");
    return "";
  }

  return F.pipe(
    cssValue,
    Str.match(/var\(\s*(--[\w-]+)(?:\s*,[^)]*)?\s*\)/),
    O.flatMap((match) => O.fromNullable(match[1])),
    O.getOrElse(() => {
      console.error(`Invalid CSS variable format: "${cssValue}". Expected format: var(--variable-name)`);
      return "";
    })
  );
}
