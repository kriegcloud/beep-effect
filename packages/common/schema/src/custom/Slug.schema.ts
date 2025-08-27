import { faker } from "@faker-js/faker";
import * as A from "effect/Array";
import type * as B from "effect/Brand";
import * as F from "effect/Function";
import * as S from "effect/Schema";

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
export const Slug = S.NonEmptyTrimmedString.pipe(
  S.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: F.constant("Slug must be a valid slug"),
  }),
  S.brand("Slug")
).annotations({
  title: "Slug",
  identifier: "Slug",
  description: "A URL-friendly string identifier",
  examples: A.map(A.make("hello-world", "hello-world-2", "hello-world-3"), (a) => a as B.Branded<string, "Slug">),
  arbitrary: () => (fc) => fc.constant(null).map(() => faker.lorem.slug() as B.Branded<string, "Slug">),
});
export namespace Slug {
  /** Slug value type. */
  export type Type = typeof Slug.Type;
  export type Encoded = typeof Slug.Encoded;
}
