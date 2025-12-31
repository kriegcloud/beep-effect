import { Contract, ContractKit } from "@beep/contract";
import { $VerifyId } from "@beep/iam-client/clients/_internal";
import { BS } from "@beep/schema";
import { paths } from "@beep/shared-domain";
import { clientEnv } from "@beep/shared-env/ClientEnv";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

// =====================================================================================================================
// Send Verify Phone Contract
// =====================================================================================================================
const { $VerifyContractsId: Id } = $VerifyId.compose("verify-contracts");
export const VerifyPhonePayload = S.Struct({
  phoneNumber: BS.Phone,
  code: S.Redacted(S.NonEmptyTrimmedString),
  updatePhoneNumber: BS.BoolWithDefault(true),
}).annotations(
  Id.annotations("VerifyPhonePayload", {
    description: "Payload for verifying a user's phone number.",
  })
);

export declare namespace VerifyPhonePayload {
  export type Type = S.Schema.Type<typeof VerifyPhonePayload>;
  export type Encoded = S.Schema.Encoded<typeof VerifyPhonePayload.Encoded>;
}

export const VerifyPhoneContract = Contract.make("VerifyPhone", {
  description: "Sends a phone verification request.",
  failure: IamError,
  success: S.Void,
}).setPayload(VerifyPhonePayload);

// =====================================================================================================================
// Send Email Verification Contract
// =====================================================================================================================

export class SendEmailVerificationPayload extends S.Class<SendEmailVerificationPayload>(
  Id`SendEmailVerificationPayload`
)(
  {
    email: BS.EmailBase,
    callbackURL: S.optional(S.UndefinedOr(BS.URLString)).pipe(
      S.withDefaults({
        decoding: () => BS.URLString.make(`${clientEnv.appUrl}${paths.dashboard.root}?refreshSession=true`),
        constructor: () => BS.URLString.make(`${clientEnv.appUrl}${paths.dashboard.root}?refreshSession=true`),
      })
    ),
  },
  Id.annotations("SendEmailVerificationPayload", {
    description: "Payload for sending an email verification link.",
  })
) {}

export declare namespace SendEmailVerificationPayload {
  export type Type = S.Schema.Type<typeof SendEmailVerificationPayload>;
  export type Encoded = S.Schema.Encoded<typeof SendEmailVerificationPayload>;
}

export class SendEmailVerificationSuccess extends S.Class<SendEmailVerificationSuccess>(
  Id`SendEmailVerificationSuccess`
)(
  {
    status: S.Boolean,
  },
  Id.annotations("SendEmailVerificationSuccess", {
    description: "Success response indicating whether the verification email was dispatched.",
  })
) {}

export declare namespace SendEmailVerificationSuccess {
  export type Type = S.Schema.Type<typeof SendEmailVerificationSuccess>;
  export type Encoded = S.Schema.Encoded<typeof SendEmailVerificationSuccess>;
}

export const SendEmailVerificationErrorCode = S.Literal(
  "EMAIL_ALREADY_VERIFIED",
  "EMAIL_VERIFICATION_DISABLED",
  "EMAIL_VERIFICATION_NOT_ENABLED"
);

export type SendEmailVerificationErrorCode = S.Schema.Type<typeof SendEmailVerificationErrorCode>;

export const SendEmailVerificationContract = Contract.make("SendEmailVerification", {
  description: "Sends an email verification link to the user.",
  payload: SendEmailVerificationPayload.fields,
  failure: IamError,
  success: SendEmailVerificationSuccess,
});

// =====================================================================================================================
// Verify Contract Set
// =====================================================================================================================

export const VerifyContractKit = ContractKit.make(VerifyPhoneContract, SendEmailVerificationContract);
