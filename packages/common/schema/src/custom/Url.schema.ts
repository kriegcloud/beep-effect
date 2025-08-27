import { faker } from "@faker-js/faker";
import * as Either from "effect/Either";
import * as S from "effect/Schema";

/**
 * URL string schema (http/https).
 *
 * Validation strategy:
 * 1) String hygiene (`NonEmptyTrimmedString`)
 * 2) Shallow pattern check (`/^https?:\/\/.+/`)
 * 3) Host validation via `new URL(...)` (wrapped in `Either.try`)
 *
 * **Note:** This validates *parsability* as a URL, not HTTPS-only security,
 * not reachability, and not any content-type constraints.
 *
 * @since 0.1.0
 * @category Networking
 */
export const URLString = S.NonEmptyTrimmedString.pipe(
  S.pattern(/^https?:\/\/.+/),
  S.filter((a) => Either.try(() => new URL(a)).pipe(Either.isRight)),
  S.annotations({
    arbitrary: () => (fc) => fc.constant(null).map(() => faker.internet.url()),
  }),
  S.brand("URLString")
).annotations({
  identifier: "URLString",
  description: "A URL string",
  title: "URL String",
  jsonSchema: { type: "string", format: "url" },
});
export namespace URLString {
  /** URL string type (branded). */
  export type Type = typeof URLString.Type;
  export type Encoded = typeof URLString.Encoded;
}
