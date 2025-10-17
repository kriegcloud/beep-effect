import { Contract, ContractSet } from "@beep/iam-sdk/contractkit";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

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

export const SendVerifyPhoneContract = Contract.make("SendVerifyPhoneContract", {
  description: "Sends a phone verification request.",
  parameters: SendVerifyPhonePayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

export const SendEmailVerificationContract = Contract.make("SendEmailVerificationContract", {
  description: "Sends an email verification link to the user.",
  parameters: SendEmailVerificationPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

export const VerifyEmailContract = Contract.make("VerifyEmailContract", {
  description: "Verifies a user's email via a token.",
  parameters: VerifyEmailPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

export const VerifyContractSet = ContractSet.make(
  SendVerifyPhoneContract,
  SendEmailVerificationContract,
  VerifyEmailContract
);
