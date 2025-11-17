import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { CustomId } from "./_id";

const Id = CustomId.compose("password");
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
  Id.annotations("EncodedPassword", {
    description: "Encoded password schema",
  })
) {}

export class PasswordBase extends EncodedPassword.pipe(S.brand("Password")) {}

export class Password extends S.Redacted(PasswordBase).annotations(
  Id.annotations("Password", {
    description: "Redacted Password Schema",
  })
) {
  static readonly make = (v: string): Password.Type => Redacted.make(PasswordBase.make(v));
}

export declare namespace Password {
  export type Type = typeof Password.Type;
  export type Encoded = typeof Password.Encoded;
}
