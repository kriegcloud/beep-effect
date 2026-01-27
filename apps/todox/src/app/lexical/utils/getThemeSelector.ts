/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as P from "effect/Predicate";
import type { EditorThemeClasses } from "lexical";

export function getThemeSelector(
  getTheme: () => EditorThemeClasses | null | undefined,
  name: keyof EditorThemeClasses
): string {
  const className = getTheme()?.[name];
  if (!P.isString(className)) {
    throw new Error(`getThemeClass: required theme property ${name} not defined`);
  }
  // Keep native .split() for regex - Str.split doesn't support regex
  const classes = className.split(/\s+/g);
  return pipe(
    A.map(classes, (cls) => `.${cls}`),
    A.join("")
  );
}
