import * as regexes from "@beep/schema/regexes";
import type * as B from "effect/Brand";
import * as F from "effect/Function";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

/**
 * RFC-5322–ish pragmatic validator for "local@domain.tld".
 * We rely on lowercase + trim + non-empty checks around this pattern.
 */
export const EmailEncoded = S.Lowercase.pipe(
  S.compose(S.Trim),
  S.compose(S.NonEmptyTrimmedString),
  S.annotations({
    message: () => "Email is required!",
  }),
  S.pattern(regexes.email)
);
export const EmailBase = EmailEncoded.pipe(S.brand("Email")).annotations({
  jsonSchema: { format: "email", type: "string" },
  arbitrary: () => (fc) => fc.emailAddress().map((_) => _ as B.Branded<string, "Email">),
  title: "Email",
  message: () => "Email must be a valid email address!",
  description: "A valid email address",
  identifier: "Email",
});

export declare namespace EmailBase {
  export type Type = S.Schema.Type<typeof EmailBase>;
  export type Encoded = S.Schema.Encoded<typeof EmailBase>;
}
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

export declare namespace Email {
  /** Email value type (redacted, branded). */
  export type Type = typeof Email.Type;
  /** Email encoded type */
  export type Encoded = typeof Email.Encoded;
}
