import * as S from "effect/Schema";

export const Password = S.Redacted(
  S.NonEmptyString.pipe(
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
  )
);

export namespace Password {
  export type Type = typeof Password.Type;
  export type EncodedType = typeof Password.Encoded;
}
