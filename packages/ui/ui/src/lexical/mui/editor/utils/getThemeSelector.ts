import * as A from "effect/Array";
import * as F from "effect/Function";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import type { EditorThemeClasses } from "lexical";

export function getThemeSelector(
  getTheme: () => EditorThemeClasses | null | undefined,
  name: keyof EditorThemeClasses
): string {
  const className = getTheme()?.[name];
  if (!P.isString(className)) {
    throw new Error(`getThemeClass: required theme property ${name} not defined`);
  }
  return F.pipe(
    className,
    Str.split(/\s+/g),
    A.map((cls) => `.${cls}`),
    A.join(",")
  );
}
