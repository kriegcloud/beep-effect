import { BS } from "@beep/schema";
import { paths } from "@beep/shared-domain";
import * as Equal from "effect/Equal";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";

export class ResetPasswordContract extends S.Struct({
  newPassword: BS.Password,
  passwordConfirm: BS.Password,
}).pipe(
  S.filter(
    ({ newPassword, passwordConfirm }) =>
      Equal.equals(Redacted.value(newPassword), Redacted.value(passwordConfirm)) || "Passwords do not match"
  )
) {}

export namespace ResetPasswordContract {
  export type Type = typeof ResetPasswordContract.Type;
  export type Encoded = typeof ResetPasswordContract.Encoded;
}

export class RequestResetPasswordContract extends BS.Class<ResetPasswordContract>("RequestResetPasswordContract")({
  email: BS.Email,
  redirectTo: BS.StringWithDefault(paths.auth.requestResetPassword),
}) {}

export namespace RequestResetPasswordContract {
  export type Type = typeof RequestResetPasswordContract.Type;
  export type Encoded = typeof RequestResetPasswordContract.Encoded;
}
