import { faker } from "@faker-js/faker";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { sid } from "./id";
import { annotate, makeMocker } from "./utils";

/**
 * Email address schema and helpers.
 *
 * ## Why Redacted?
 * Email values are wrapped with `Redacted` to avoid accidental logging / printing
 * of PII at runtime. Use `Redacted.value(email)` if you must access the inner string.
 *
 * ## Example (decoding)
 * ```ts
 * import * as Effect from "effect/Effect";
 *
 * const decode = S.decodeUnknown(Email.Schema);
 * const program = decode("USER@Example.com");
 * // -> Effect<never, ParseIssue, Redacted.Redacted<"email@..." lowercased>>
 * ```
 *
 * ## Example (mocking)
 * ```ts
 * // Default single value (type-level sample)
 * const one = Email.Mock("type", 1, true);
 * // Multiple samples
 * const many = Email.Mock("type", 3);
 * ```
 *
 * @since 0.1.0
 * @category Email
 */
export namespace Email {
  /**
   * RFC-5322–ish pragmatic validator for "local@domain.tld".
   * We rely on lowercase + trim + non-empty checks around this pattern.
   */
  export const REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  /**
   * Canonical email string:
   * - lowercased
   * - trimmed and non-empty
   * - matches `REGEX`
   * - branded as `"Email"`
   *
   * Prefer `Email.Schema` for redacted + annotations.
   */
  export const Base = S.Lowercase.pipe(
    S.compose(S.Trim),
    S.compose(S.NonEmptyTrimmedString),
    S.annotations({
      message: () => "Email is required!",
    }),
    S.pattern(REGEX),
    S.brand("Email"),
  );

  /**
   * Full email schema:
   * - `Base` wrapped in `Redacted` for safe logs
   * - JSON Schema metadata
   * - FastCheck arbitrary
   * - Identifier + docs
   */
  export const Schema = annotate(S.Redacted(Base), {
    jsonSchema: { format: "email", type: "string" },
    arbitrary: () => (fc) =>
      fc.constant(null).map(() =>
        Redacted.make(Base.make(faker.internet.email())),
      ),
    title: "Email",
    message: () => "Email must be a valid email address!",
    description: "A valid email address",
    identifier: sid.common.schema("Email.Schema"),
  });

  /** Email value type (redacted, branded). */
  export type Email = typeof Schema.Type;

  /**
   * Wrap a string as a redacted email.
   * **Note:** This does not validate—prefer decoding for user inputs.
   */
  export const make = (email: string) => Redacted.make(email);

  /** Curried mock factory (FastCheck + Effect Arbitrary). */
  export const Mock = makeMocker(Schema);
}
