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
  if (typeof cssValue !== "string" || !cssValue.trim()) {
    console.error("Invalid input: CSS value must be a non-empty string");
    return "";
  }

  const match = cssValue.match(/var\(\s*(--[\w-]+)(?:\s*,[^)]*)?\s*\)/);

  if (!match) {
    console.error(`Invalid CSS variable format: "${cssValue}". Expected format: var(--variable-name)`);
    return "";
  }

  return match[1]!;
}
