/**
 * Branded schema for canonical lowercase slugs safe for a single URL path
 * segment.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { Slug } from "@beep/schema/Slug";
 *
 * const slug = S.decodeUnknownSync(Slug)("my-post-2");
 * console.log(slug);
 * ```
 *
 * @since 0.0.0
 * @module @beep/schema/Slug
 */

import { $SchemaId } from "@beep/identity/packages";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SchemaId.create("Slug");
const slugAllowedCharactersPattern = /^[a-z0-9-]+$/;

const SlugChecks = S.makeFilterGroup(
  [
    S.isPattern(slugAllowedCharactersPattern, {
      identifier: $I`SlugAllowedCharactersCheck`,
      title: "Slug Allowed Characters",
      description: "A slug that uses only lowercase ASCII letters, digits, and hyphens.",
      message: "Slug must use lowercase ASCII letters, digits, and hyphens only",
    }),
    S.makeFilter(P.not(Str.startsWith("-")), {
      identifier: $I`SlugNoLeadingHyphenCheck`,
      title: "Slug No Leading Hyphen",
      description: "A slug that does not start with a hyphen.",
      message: "Slug must not start with a hyphen",
    }),
    S.makeFilter(P.not(Str.endsWith("-")), {
      identifier: $I`SlugNoTrailingHyphenCheck`,
      title: "Slug No Trailing Hyphen",
      description: "A slug that does not end with a hyphen.",
      message: "Slug must not end with a hyphen",
    }),
    S.makeFilter(P.not(Str.includes("--")), {
      identifier: $I`SlugNoRepeatedHyphenCheck`,
      title: "Slug No Repeated Hyphen",
      description: "A slug that does not contain repeated hyphen separators.",
      message: "Slug must not contain repeated hyphens",
    }),
  ],
  {
    identifier: $I`SlugChecks`,
    title: "Slug",
    description: "Checks for canonical lowercase kebab-case slug text safe for a single URL path segment.",
  }
);

/**
 * Branded schema for canonical lowercase kebab-case slugs.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Slug = S.NonEmptyString.check(SlugChecks).pipe(
  S.brand("Slug"),
  S.annotate(
    $I.annote("Slug", {
      description: "Canonical lowercase kebab-case slug safe for a single URL path segment.",
    })
  )
);

/**
 * Type for {@link Slug}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Slug = typeof Slug.Type;
