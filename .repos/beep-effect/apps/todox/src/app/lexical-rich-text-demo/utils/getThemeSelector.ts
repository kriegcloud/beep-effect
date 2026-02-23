import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import type { EditorThemeClasses } from "lexical";

/**
 * Builds a CSS selector from theme class names.
 * Escapes special characters (like Tailwind's `w-[75px]`) using CSS.escape.
 */
export function getThemeSelector(
  getTheme: () => EditorThemeClasses | null | undefined,
  name: keyof EditorThemeClasses
): string {
  const className = getTheme()?.[name];
  if (!P.isString(className)) {
    return "";
  }
  // Keep native .split() for regex - Str.split doesn't support regex
  const classes = Str.split(/\s+/g)(className);
  return pipe(
    classes,
    A.map((cls) => `.${CSS.escape(cls)}`),
    A.join("")
  );
}
