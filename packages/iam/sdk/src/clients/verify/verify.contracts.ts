import { Contract, ContractSet } from "@beep/iam-sdk/contract-kit";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { IamError } from "../../errors";
// =====================================================================================================================
// Send Verify Phone Contract
// =====================================================================================================================
export class SendVerifyPhonePayload extends BS.Class<SendVerifyPhonePayload>("SendVerifyPhonePayload")(
  {
    phoneNumber: BS.Phone,
    code: S.Redacted(S.NonEmptyTrimmedString),
    updatePhoneNumber: BS.BoolWithDefault(true),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/SendVerifyPhonePayload"),
    identifier: "SendVerifyPhonePayload",
    description: "Payload for verifying a user's phone number.",
  }
) {}

export declare namespace SendVerifyPhonePayload {
  export type Type = S.Schema.Type<typeof SendVerifyPhonePayload>;
  export type Encoded = S.Schema.Encoded<typeof SendVerifyPhonePayload.Encoded>;
}

export const SendVerifyPhoneContract = Contract.make("SendVerifyPhone", {
  description: "Sends a phone verification request.",
  parameters: SendVerifyPhonePayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

// =====================================================================================================================
// Send Email Verification Contract
// =====================================================================================================================

export class SendEmailVerificationPayload extends S.Class<SendEmailVerificationPayload>("SendEmailVerificationPayload")(
  {
    email: BS.Email,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/SendEmailVerificationPayload"),
    identifier: "SendEmailVerificationPayload",
    description: "Payload for sending an email verification link.",
  }
) {}

export declare namespace SendEmailVerificationPayload {
  export type Type = S.Schema.Type<typeof SendEmailVerificationPayload>;
  export type Encoded = S.Schema.Encoded<typeof SendEmailVerificationPayload>;
}

export const SendEmailVerificationContract = Contract.make("SendEmailVerification", {
  description: "Sends an email verification link to the user.",
  parameters: SendEmailVerificationPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

// =====================================================================================================================
// Verify Email Contract
// =====================================================================================================================
export class VerifyEmailPayload extends S.Class<VerifyEmailPayload>("VerifyEmailPayload")(
  {
    token: S.Redacted(S.String),
    onFailure: new BS.Fn({
      input: S.Undefined,
      output: S.Void,
    }).Schema,
    onSuccess: new BS.Fn({
      input: S.Undefined,
      output: S.Void,
    }).Schema,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/VerifyEmailPayload"),
    identifier: "VerifyEmailPayload",
    description: "Payload for verifying an email address via a token.",
  }
) {}

export declare namespace VerifyEmailPayload {
  export type Type = S.Schema.Type<typeof VerifyEmailPayload>;
  export type Encoded = S.Schema.Encoded<typeof VerifyEmailPayload>;
}

export const VerifyEmailContract = Contract.make("VerifyEmail", {
  description: "Verifies a user's email via a token.",
  parameters: VerifyEmailPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

// =====================================================================================================================
// Verify Contract Set
// =====================================================================================================================

export const VerifyContractSet = ContractSet.make(
  SendVerifyPhoneContract,
  SendEmailVerificationContract,
  VerifyEmailContract
);
