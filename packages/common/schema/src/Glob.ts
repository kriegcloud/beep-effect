/**
 * Branded schema for portable glob pattern strings accepted by the current
 * `glob` matcher stack.
 *
 * This schema keeps the `glob`/`minimatch` parser's current acceptance rules
 * while enforcing the library's forward-slash convention for portable patterns.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { Glob } from "@beep/schema/Glob";
 *
 * const pattern = S.decodeUnknownSync(Glob)("src/*.ts");
 * console.log(pattern);
 * ```
 *
 * @since 0.0.0
 * @module @beep/schema/Glob
 */

import { $SchemaId } from "@beep/identity/packages";
import { Result } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Minimatch } from "minimatch";

const $I = $SchemaId.create("Glob");
const MAX_GLOB_PATTERN_LENGTH = 1024 * 64;

const canConstructMatcher = (value: string): boolean =>
  Result.isSuccess(
    Result.try({
      try: () => new Minimatch(value),
      catch: () => false,
    })
  );

const GlobChecks = S.makeFilterGroup(
  [
    S.isNonEmpty({
      identifier: $I`GlobNonEmptyCheck`,
      title: "Glob Non Empty",
      description: "A glob pattern string that is not empty.",
      message: "Glob pattern must not be empty",
    }),
    S.makeFilter(P.not(Str.includes("\\")), {
      identifier: $I`GlobPortableSeparatorCheck`,
      title: "Glob Portable Separator",
      description: "A glob pattern string that uses forward slashes instead of backslashes.",
      message: "Glob pattern must use forward slashes instead of backslashes",
    }),
    S.isMaxLength(MAX_GLOB_PATTERN_LENGTH, {
      identifier: $I`GlobMaxLengthCheck`,
      title: "Glob Max Length",
      description: "A glob pattern string that does not exceed the current minimatch length limit.",
      message: `Glob pattern must not exceed ${MAX_GLOB_PATTERN_LENGTH} characters`,
    }),
    S.makeFilter(canConstructMatcher, {
      identifier: $I`GlobMatcherCompatibilityCheck`,
      title: "Glob Matcher Compatibility",
      description: "A glob pattern string accepted by the current minimatch constructor.",
      message: "Glob pattern must be accepted by the current minimatch parser",
    }),
  ],
  {
    identifier: $I`GlobChecks`,
    title: "Glob",
    description: "Checks for portable glob pattern strings accepted by the current glob matcher stack.",
  }
);

/**
 * Branded schema for portable non-empty glob pattern strings.
 *
 * The runtime validation mirrors the current matcher stack's hard parser limits
 * while rejecting backslash separators so patterns remain portable across
 * environments.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Glob = S.String.check(GlobChecks).pipe(
  S.brand("Glob"),
  S.annotate(
    $I.annote("Glob", {
      description: "A portable non-empty glob pattern string accepted by the current glob matcher stack.",
    })
  )
);

/**
 * Type for {@link Glob}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Glob = typeof Glob.Type;
