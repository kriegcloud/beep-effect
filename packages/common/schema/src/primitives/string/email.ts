/**
 * Email string schemas that enforce lowercase, trimmed, non-empty inputs plus regex validation.
 *
 * Includes both the encoded string schema and the redacted/branded runtime variant to avoid leaking PII.
 *
 * @example
 * import { Email } from "@beep/schema/primitives/string/email";
 *
 * const email = Email.make("ops@example.com");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
import * as regexes from "@beep/schema/internal/regex/regexes";
import type * as B from "effect/Brand";
import * as F from "effect/Function";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { Id } from "./_id";

/**
 * Lowercased, trimmed, non-empty email string schema used on the encoded side.
 *
 * @example
 * import { EmailEncoded } from "@beep/schema/primitives/string/email";
 *
 * EmailEncoded.make("ops@example.com");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export const EmailEncoded = S.Lowercase.pipe(
  S.compose(S.Trim),
  S.compose(S.NonEmptyTrimmedString),
  S.annotations({
    message: () => "Email is required.",
  }),
  S.pattern(regexes.email)
).annotations(
  Id.annotations("email/EmailEncoded", {
    description: 'Lowercased, trimmed email string that matches an RFC-leaning pattern for "local@domain" addresses.',
  })
);

/**
 * Namespace describing runtime and encoded types for {@link EmailEncoded}.
 *
 * @example
 * import type { EmailEncoded } from "@beep/schema/primitives/string/email";
 *
 * type RawEmail = EmailEncoded.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace EmailEncoded {
  /**
   * Runtime type alias for {@link EmailEncoded}.
   *
   * @example
   * import type { EmailEncoded } from "@beep/schema/primitives/string/email";
   *
   * let value: EmailEncoded.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof EmailEncoded>;
  /**
   * Encoded type alias for {@link EmailEncoded}.
   *
   * @example
   * import type { EmailEncoded } from "@beep/schema/primitives/string/email";
   *
   * let encoded: EmailEncoded.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof EmailEncoded>;
}

/**
 * Branded email schema used prior to redaction.
 *
 * @example
 * import { EmailBase } from "@beep/schema/primitives/string/email";
 *
 * const branded = EmailBase.make("ops@example.com");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export const EmailBase = EmailEncoded.pipe(S.brand("Email")).annotations(
  Id.annotations("email/EmailBase", {
    jsonSchema: { format: "email", type: "string" },
    arbitrary: () => (fc) => fc.emailAddress().map((value) => value as B.Branded<string, "Email">),
    message: () => "Email must be a valid email address.",
    description: "A valid branded email string.",
  })
);

/**
 * Namespace describing runtime and encoded types for {@link EmailBase}.
 *
 * @example
 * import type { EmailBase } from "@beep/schema/primitives/string/email";
 *
 * type BrandedEmail = EmailBase.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace EmailBase {
  /**
   * Runtime type alias for {@link EmailBase}.
   *
   * @example
   * import type { EmailBase } from "@beep/schema/primitives/string/email";
   *
   * let branded: EmailBase.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof EmailBase>;
  /**
   * Encoded type alias for {@link EmailBase}.
   *
   * @example
   * import type { EmailBase } from "@beep/schema/primitives/string/email";
   *
   * let encoded: EmailBase.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof EmailBase>;
}

/**
 * Redacted email schema that prevents accidental logging of PII.
 *
 * @example
 * import { Email } from "@beep/schema/primitives/string/email";
 *
 * const email = Email.make("ops@example.com");
 * const value = Email.value(email);
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class Email extends S.Redacted(EmailBase).annotations(
  Id.annotations("email/Email", {
    description:
      "Email schema that enforces lowercase/trimmed inputs, regex validation, and wraps the value in `Redacted` to avoid PII leaks.",
  })
) {
  /** Creates a redacted email value. */
  static readonly make = F.flow((value: string) => EmailBase.make(value), Redacted.make);

  /** Extracts the underlying branded string from a redacted email. */
  static readonly value = (email: Redacted.Redacted<B.Branded<string, "Email">>) => Redacted.value(email);
}

/**
 * Namespace describing runtime and encoded types for {@link Email}.
 *
 * @example
 * import type { Email } from "@beep/schema/primitives/string/email";
 *
 * type RedactedEmail = Email.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace Email {
  /**
   * Runtime type alias for {@link Email}.
   *
   * @example
   * import type { Email } from "@beep/schema/primitives/string/email";
   *
   * let email: Email.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = typeof Email.Type;
  /**
   * Encoded type alias for {@link Email}.
   *
   * @example
   * import type { Email } from "@beep/schema/primitives/string/email";
   *
   * let encoded: Email.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = typeof Email.Encoded;
}
