import type * as B from "effect/Brand";
import * as F from "effect/Function";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

/**
 * RFC-5322–ish pragmatic validator for "local@domain.tld".
 * We rely on lowercase + trim + non-empty checks around this pattern.
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const EmailBase = S.Lowercase.pipe(
  S.compose(S.Trim),
  S.compose(S.NonEmptyTrimmedString),
  S.annotations({
    message: () => "Email is required!",
  }),
  S.pattern(EMAIL_REGEX),
  S.brand("Email")
).annotations({
  jsonSchema: { format: "email", type: "string" },
  arbitrary: () => (fc) => fc.emailAddress().map((_) => _ as B.Branded<string, "Email">),
  title: "Email",
  message: () => "Email must be a valid email address!",
  description: "A valid email address",
  identifier: "Email",
});

/**
 * Email address schema and helpers.
 * - lowercased
 * - trimmed and non-empty
 * - matches `REGEX`
 * - branded as `"Email"`
 * ## Why Redacted?
 * Email values are wrapped with `Redacted` to avoid accidental logging / printing
 * of PII at runtime. Use `Redacted.value(email)` if you must access the inner string.
 * @since 0.1.0
 * @category Email
 */
export class Email extends S.Redacted(EmailBase) {
  /* create a redacted email value */
  static readonly make = F.flow((i: string) => EmailBase.make(i), Redacted.make);

  /* retrieve the redacted email value */
  static readonly value = (email: Redacted.Redacted<B.Branded<string, "Email">>) => Redacted.value(email);
}

export namespace Email {
  /** Email value type (redacted, branded). */
  export type Type = typeof Email.Type;
  /** Email encoded type */
  export type Encoded = typeof Email.Encoded;
}
