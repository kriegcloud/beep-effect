import { sid } from "@beep/schema/id";
import { annotate, makeMocker } from "@beep/schema/utils";
import { faker } from "@faker-js/faker";
import * as A from "effect/Array";
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
export namespace Slug {
  /**
   * Non-empty, trimmed, branded `"Slug"` string matching the canonical slug regex.
   */
  export const Base = S.NonEmptyTrimmedString.pipe(
    S.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: F.constant("Slug must be a valid slug"),
    }),
    S.brand("Slug"),
  );

  /**
   * Full slug schema with docs, examples, identity and generator.
   */
  export const Schema = annotate(Base, {
    title: "Slug",
    identifier: sid.common.schema("Slug.Schema"),
    description: "A URL-friendly string identifier",
    examples: A.map(
      A.make("hello-world", "hello-world-2", "hello-world-3"),
      (a) => Base.make(a),
    ),
    arbitrary: () => (fc) =>
      fc.constant(null).map(() => Base.make(faker.lorem.slug())),
  });

  /** Slug value type. */
  export type Type = typeof Schema.Type;

  /** Curried mock factory. */
  export const Mock = makeMocker(Schema);
}
