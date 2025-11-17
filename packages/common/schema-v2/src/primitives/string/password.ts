/**
 * Password schemas with encoded/redacted variants for transport and storage.
 *
 * Enforces strong password requirements while exposing a redacted wrapper for runtime handling.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { Password } from "@beep/schema-v2/primitives/string/password";
 *
 * const secret = Password.make("Aa!23456");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
import * as Redacted from "effect/Redacted";
import { Id } from "@beep/schema-v2/primitives/string/_id";
import * as S from "effect/Schema";

/**
 * Schema that validates encoded password strings before redaction.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { EncodedPassword } from "@beep/schema-v2/primitives/string/password";
 *
 * S.decodeSync(EncodedPassword)("Passw0rd!");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class EncodedPassword extends S.NonEmptyString.pipe(
  S.minLength(8, {
    message: () => "Password must be at least 8 characters long!",
  }),
  S.maxLength(128, {
    message: () => "Password must be at most 128 characters long!",
  }),
  S.pattern(/[A-Z]/, {
    message: () => "Password must contain at least one uppercase letter!",
  }),
  S.pattern(/[a-z]/, {
    message: () => "Password must contain at least one lowercase letter!",
  }),
  S.pattern(/\d/, {
    message: () => "Password must contain at least one number!",
  }),
  S.pattern(/[!@#$%^&*(),.?":{}|<>\\[\]/`~;'_+=-]/, {
    message: () => "Password must contain at least one special character!",
  })
).annotations(
  Id.annotations("password/EncodedPassword", {
    description: "Encoded password schema",
  })
) {}

/**
 * Branded password schema used prior to redaction.
 *
 * @example
 * import { PasswordBase } from "@beep/schema-v2/primitives/string/password";
 *
 * const branded = PasswordBase.make("Aa!23456");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class PasswordBase extends EncodedPassword.pipe(S.brand("Password")) {}

/**
 * Redacted password wrapper that hides encoded values.
 *
 * @example
 * import { Password } from "@beep/schema-v2/primitives/string/password";
 *
 * const password = Password.make("Aa!23456");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export class Password extends S.Redacted(PasswordBase).annotations(
  Id.annotations("password/Password", {
    description: "Redacted Password Schema",
  })
) {
  static readonly make = (v: string): Password.Type => Redacted.make(PasswordBase.make(v));
}

/**
 * Namespace exposing helper types for the redacted `Password` schema.
 *
 * @example
 * import type { Password } from "@beep/schema-v2/primitives/string/password";
 *
 * type Secret = Password.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace Password {
  /**
   * Runtime type for the redacted password schema.
   *
   * @example
   * import type { Password } from "@beep/schema-v2/primitives/string/password";
   *
   * let password: Password.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = typeof Password.Type;
  /**
   * Encoded representation accepted by the password schema.
   *
   * @example
   * import type { Password } from "@beep/schema-v2/primitives/string/password";
   *
   * let encoded: Password.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = typeof Password.Encoded;
}
