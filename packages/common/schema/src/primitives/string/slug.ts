/**
 * Slug schemas for URL-safe identifiers.
 *
 * Includes the generic {@link SlugBase} schema and a branded {@link Slug} variant for ergonomic typing.
 *
 * @example
 * import { Slug } from "@beep/schema/primitives/string/slug";
 *
 * const slug = Slug.make("hello-world");
 *
 * @category Primitives/String
 * @since 0.1.0
 */

import { $StringId } from "@beep/schema/internal";
import * as regexes from "@beep/schema/internal/regex/regexes";
import { faker } from "@faker-js/faker";
import * as A from "effect/Array";
import type * as B from "effect/Brand";
import * as S from "effect/Schema";

const { $SlugId: Id } = $StringId.compose("slug");

const exampleSlugs = A.make("hello-world", "hello-world-2", "hello-world-3");

/**
 * Base schema for slug strings (lowercase, trimmed, hyphen-separated).
 *
 * @example
 * import { SlugBase } from "@beep/schema/primitives/string/slug";
 *
 * SlugBase.make("product-release");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export const SlugBase = S.String.pipe(
  S.nonEmptyString({
    message: () => "Slug must be a non-empty string",
  }),
  S.trimmed({
    message: () => "Slug must not include leading or trailing whitespace.",
  }),
  S.pattern(regexes.slug, {
    message: () => "Slug must match the URL-friendly slug pattern",
  })
).annotations(
  Id.annotations("slug/SlugBase", {
    description: "A URL-friendly string identifier consisting of lowercase words separated by hyphens.",
    examples: exampleSlugs,
    arbitrary: () => (fc) => fc.constant(null).map(() => faker.lorem.slug()),
  })
);

/**
 * Namespace exposing helper types for {@link SlugBase}.
 *
 * @example
 * import type { SlugBase } from "@beep/schema/primitives/string/slug";
 *
 * type BaseSlug = SlugBase.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace SlugBase {
  /**
   * Runtime type for {@link SlugBase}.
   *
   * @example
   * import type { SlugBase } from "@beep/schema/primitives/string/slug";
   *
   * let value: SlugBase.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof SlugBase>;
  /**
   * Encoded type for {@link SlugBase}.
   *
   * @example
   * import type { SlugBase } from "@beep/schema/primitives/string/slug";
   *
   * let encoded: SlugBase.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof SlugBase>;
}

/**
 * Branded slug schema for strongly typed identifiers.
 *
 * @example
 * import { Slug } from "@beep/schema/primitives/string/slug";
 *
 * const slug = Slug.make("release-notes");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export const Slug = SlugBase.pipe(S.brand("Slug")).annotations(
  Id.annotations("slug/Slug", {
    description: "A branded URL-friendly slug string.",
    examples: A.map(exampleSlugs, (value) => value as B.Branded<string, "Slug">),
    arbitrary: () => (fc) => fc.constant(null).map(() => faker.lorem.slug() as B.Branded<string, "Slug">),
  })
);

/**
 * Namespace exposing helper types for {@link Slug}.
 *
 * @example
 * import type { Slug } from "@beep/schema/primitives/string/slug";
 *
 * type SlugValue = Slug.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace Slug {
  /**
   * Runtime type for {@link Slug}.
   *
   * @example
   * import type { Slug } from "@beep/schema/primitives/string/slug";
   *
   * let value: Slug.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = typeof Slug.Type;
  /**
   * Encoded type for {@link Slug}.
   *
   * @example
   * import type { Slug } from "@beep/schema/primitives/string/slug";
   *
   * let encoded: Slug.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = typeof Slug.Encoded;
}
