/**
 * Branded schema for portable glob pattern strings accepted by Bun's current
 * glob parser.
 *
 * This schema keeps Bun's parser acceptance rules while enforcing the repo's
 * forward-slash convention for portable patterns.
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
import { thunkFalse } from "@beep/utils";
import { Result } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SchemaId.create("Glob");
const MAX_GLOB_PATTERN_LENGTH = 1024 * 64;

const getBunGlobConstructor = (): typeof Bun.Glob => {
  const BunGlob = globalThis.Bun?.Glob;

  if (BunGlob === undefined) {
    throw new Error("Bun.Glob is unavailable in the current runtime");
  }

  return BunGlob;
};

const canConstructMatcher = (value: string): boolean =>
  Result.isSuccess(
    Result.try({
      try: () => {
        const BunGlob = getBunGlobConstructor();
        return new BunGlob(value);
      },
      catch: thunkFalse,
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
      description: "A glob pattern string that does not exceed the repo's current portability limit.",
      message: `Glob pattern must not exceed ${MAX_GLOB_PATTERN_LENGTH} characters`,
    }),
    S.makeFilter(canConstructMatcher, {
      identifier: $I`GlobMatcherCompatibilityCheck`,
      title: "Glob Matcher Compatibility",
      description: "A glob pattern string accepted by the current Bun glob constructor.",
      message: "Glob pattern must be accepted by the current Bun glob parser",
    }),
  ],
  {
    identifier: $I`GlobChecks`,
    title: "Glob",
    description: "Checks for portable glob pattern strings accepted by the current Bun glob parser.",
  }
);

/**
 * Branded schema for portable non-empty glob pattern strings.
 *
 * The runtime validation mirrors the current Bun parser acceptance rules while
 * rejecting backslash separators so patterns remain portable across
 * environments and keeping the repo's defensive max-length limit.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Glob = S.String.check(GlobChecks).pipe(
  S.brand("Glob"),
  S.annotate(
    $I.annote("Glob", {
      description: "A portable non-empty glob pattern string accepted by the current Bun glob parser.",
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
