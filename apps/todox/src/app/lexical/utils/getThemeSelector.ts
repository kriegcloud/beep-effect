import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import type { EditorThemeClasses } from "lexical";

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
    A.map((cls) => `.${cls}` as const),
    A.join("")
  );
}
