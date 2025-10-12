import { BS } from "@beep/schema";
import * as S from "effect/Schema";

export class SendVerifyPhoneContract extends BS.Class<SendVerifyPhoneContract>("SendVerifyPhoneContract")({
  phoneNumber: BS.Phone,
  code: S.Redacted(S.NonEmptyTrimmedString),
  updatePhoneNumber: BS.BoolWithDefault(true),
}) {}

export namespace SendVerifyPhoneContract {
  export type Type = typeof SendVerifyPhoneContract.Type;
  export type Encoded = typeof SendVerifyPhoneContract.Encoded;
}

export class SendEmailVerificationContract extends S.Class<SendEmailVerificationContract>(
  "SendEmailVerificationContract"
)({
  email: BS.Email,
}) {}

export namespace SendEmailVerificationContract {
  export type Type = typeof SendEmailVerificationContract.Type;
  export type Encoded = typeof SendEmailVerificationContract.Encoded;
}

export class VerifyEmailContract extends S.Class<VerifyEmailContract>("VerifyEmailContract")({
  token: S.Redacted(S.String),
  onFailure: new BS.Fn({
    input: S.Undefined,
    output: S.Void,
  }).Schema,
  onSuccess: new BS.Fn({
    input: S.Undefined,
    output: S.Void,
  }).Schema,
}) {}

export declare namespace VerifyEmailContract {
  export type Type = typeof VerifyEmailContract.Type;
  export type Encoded = typeof VerifyEmailContract.Encoded;
}
