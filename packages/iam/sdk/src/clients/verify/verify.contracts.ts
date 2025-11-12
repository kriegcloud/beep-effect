import { Contract, ContractKit } from "@beep/contract";
import { BS } from "@beep/schema";
import * as SharedEntities from "@beep/shared-domain/entities";
import * as S from "effect/Schema";
import { IamError } from "../../errors";
// =====================================================================================================================
// Send Verify Phone Contract
// =====================================================================================================================
export class VerifyPhonePayload extends S.Class<VerifyPhonePayload>("VerifyPhonePayload")(
  {
    phoneNumber: BS.Phone,
    code: S.Redacted(S.NonEmptyTrimmedString),
    updatePhoneNumber: BS.BoolWithDefault(true),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/VerifyPhonePayload"),
    identifier: "VerifyPhonePayload",
    description: "Payload for verifying a user's phone number.",
  }
) {}

export declare namespace VerifyPhonePayload {
  export type Type = S.Schema.Type<typeof VerifyPhonePayload>;
  export type Encoded = S.Schema.Encoded<typeof VerifyPhonePayload.Encoded>;
}

export const VerifyPhoneContract = Contract.make("VerifyPhone", {
  description: "Sends a phone verification request.",
  payload: VerifyPhonePayload.fields,
  failure: IamError,
  success: S.Void,
});

// =====================================================================================================================
// Send Email Verification Contract
// =====================================================================================================================

export class SendEmailVerificationPayload extends S.Class<SendEmailVerificationPayload>("SendEmailVerificationPayload")(
  {
    email: BS.Email,
    callbackURL: S.optional(BS.URLString),
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

export class SendEmailVerificationSuccess extends S.Class<SendEmailVerificationSuccess>("SendEmailVerificationSuccess")(
  {
    status: S.Boolean,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/SendEmailVerificationSuccess"),
    identifier: "SendEmailVerificationSuccess",
    description: "Success response indicating whether the verification email was dispatched.",
  }
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
// Verify Email Contract
// =====================================================================================================================
export class VerifyEmailPayload extends S.Class<VerifyEmailPayload>("VerifyEmailPayload")(
  {
    token: S.Redacted(S.String),
    callbackURL: S.optional(BS.URLString),
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

const VerifyEmailUser = S.Struct({
  id: SharedEntities.User.Model.select.fields.id,
  email: SharedEntities.User.Model.select.fields.email,
  name: SharedEntities.User.Model.select.fields.name,
  image: S.NullOr(BS.URLString),
  emailVerified: SharedEntities.User.Model.select.fields.emailVerified,
  createdAt: BS.DateTimeFromDate(),
  updatedAt: BS.DateTimeFromDate(),
});

export class VerifyEmailSuccess extends S.Class<VerifyEmailSuccess>("VerifyEmailSuccess")(
  {
    status: S.Boolean,
    user: S.NullOr(VerifyEmailUser),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/VerifyEmailSuccess"),
    identifier: "VerifyEmailSuccess",
    description: "Result payload returned after attempting email verification.",
  }
) {}

export declare namespace VerifyEmailSuccess {
  export type Type = S.Schema.Type<typeof VerifyEmailSuccess>;
  export type Encoded = S.Schema.Encoded<typeof VerifyEmailSuccess>;
}

export const VerifyEmailErrorCode = S.Literal("INVALID_TOKEN", "TOKEN_EXPIRED", "EMAIL_ALREADY_VERIFIED");

export type VerifyEmailErrorCode = S.Schema.Type<typeof VerifyEmailErrorCode>;

export const VerifyEmailContract = Contract.make("VerifyEmail", {
  description: "Verifies a user's email via a token.",
  payload: VerifyEmailPayload.fields,
  failure: IamError,
  success: VerifyEmailSuccess,
});

// =====================================================================================================================
// Verify Contract Set
// =====================================================================================================================

export const VerifyContractKit = ContractKit.make(
  VerifyPhoneContract,
  SendEmailVerificationContract,
  VerifyEmailContract
);
