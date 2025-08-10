import { faker } from "@faker-js/faker";
import * as Either from "effect/Either";
import * as S from "effect/Schema";
import { sid } from "./id";
import { annotate, makeMocker } from "./utils";

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
export namespace URLString {
  export const Schema = annotate(
    S.NonEmptyTrimmedString.pipe(
      S.pattern(/^https?:\/\/.+/),
      S.filter((a) => Either.try(() => new URL(a)).pipe(Either.isRight)),
      S.annotations({
        arbitrary: () => (fc) => fc.constant(null).map(() => faker.internet.url()),
      }),
      S.brand("URLString"),
    ),
    {
      identifier: sid.shared.schema("URLString.Schema"),
      description: "A URL string",
      title: "URL String",
      jsonSchema: { type: "string", format: "url" },
    },
  );

  /** URL string type (branded). */
  export type Type = typeof Schema.Type;

  /** Curried mock factory. */
  export const Mock = makeMocker(Schema);
}
