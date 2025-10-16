import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
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
) {}

export class PasswordBase extends EncodedPassword.pipe(S.brand("Password")) {}

export class Password extends S.Redacted(PasswordBase).annotations({
  schemaId: Symbol.for("@beep/schema/custom/Password"),
  identifier: "Password",
  description: "Redacted Password Schema",
  title: "Password",
}) {
  static readonly make = (v: string): Password.Type => Redacted.make(PasswordBase.make(v));
}

export declare namespace Password {
  export type Type = typeof Password.Type;
  export type Encoded = typeof Password.Encoded;
}
