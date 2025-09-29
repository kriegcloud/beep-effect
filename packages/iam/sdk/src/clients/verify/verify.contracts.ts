import { BS } from "@beep/schema";
import * as S from "effect/Schema";

export class VerifyPhoneContract extends BS.Class<VerifyPhoneContract>("VerifyPhoneContract")({
  phoneNumber: BS.Phone,
  code: S.Redacted(S.NonEmptyTrimmedString),
  updatePhoneNumber: BS.BoolWithDefault(true),
}) {}

export namespace VerifyPhoneContract {
  export type Type = typeof VerifyPhoneContract.Type;
  export type Encoded = typeof VerifyPhoneContract.Encoded;
}

export class VerifyEmailContract extends BS.Class<VerifyEmailContract>("VerifyEmailContract")({
  email: BS.Email,
}) {}

export namespace VerifyEmailContract {
  export type Type = typeof VerifyEmailContract.Type;
  export type Encoded = typeof VerifyEmailContract.Encoded;
}
