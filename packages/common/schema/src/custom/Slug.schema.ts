import * as regexes from "@beep/schema/regexes";
import { faker } from "@faker-js/faker";
import * as A from "effect/Array";
import type * as B from "effect/Brand";
import * as S from "effect/Schema";
export const SlugBase = S.String.pipe(
  S.nonEmptyString({
    message: () => "Slug must be a non-empty string",
  }),
  S.trimmed({
    message: () => "Slug must have no trailing or leading white spaces.",
  }),
  S.pattern(regexes.slug, {
    message: () => "Slug must be a valid slug",
  })
).annotations({
  title: "Slug",
  identifier: "Slug",
  description: "A URL-friendly string identifier",
  examples: A.map(A.make("hello-world", "hello-world-2", "hello-world-3"), (a) => a),
  arbitrary: () => (fc) => fc.constant(null).map(() => faker.lorem.slug()),
});

export declare namespace SlugBase {
  export type Type = S.Schema.Type<typeof SlugBase>;
  export type Encoded = S.Schema.Encoded<typeof SlugBase>;
}
/**
 * URL-friendly slug:
 * - Lowercase a–z and digits
 * - Hyphen-separated segments
 * - No leading/trailing hyphens
 *
 * Examples: `hello-world`, `hello-world-2`
 *
 * ## Example
 * ```ts
 * const decode = S.decodeUnknown(Slug.Schema);
 * const ok = decode("hello-world");
 * const bad = decode("Hello World!"); // fails pattern
 * ```
 *
 * @since 0.1.0
 * @category Strings
 */
export const Slug = SlugBase.pipe(S.brand("Slug")).annotations({
  title: "Slug",
  identifier: "Slug",
  description: "A URL-friendly string identifier",
  examples: A.map(A.make("hello-world", "hello-world-2", "hello-world-3"), (a) => a as B.Branded<string, "Slug">),
  arbitrary: () => (fc) => fc.constant(null).map(() => faker.lorem.slug() as B.Branded<string, "Slug">),
});
export declare namespace Slug {
  /** Slug value type. */
  export type Type = typeof Slug.Type;
  export type Encoded = typeof Slug.Encoded;
}
