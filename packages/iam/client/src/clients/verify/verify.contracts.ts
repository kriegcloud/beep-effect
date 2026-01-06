import { Contract, ContractKit } from "@beep/contract";
import { $VerifyId } from "@beep/iam-client/clients/_internal";
import { BS } from "@beep/schema";
import { paths } from "@beep/shared-domain";
import * as SharedEntities from "@beep/shared-domain/entities";
import { clientEnv } from "@beep/shared-env/ClientEnv";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

// =====================================================================================================================
// Send Verify Phone Contract
// =====================================================================================================================
const $I = $VerifyId.create("verify-contracts");
export const VerifyPhonePayload = S.Struct({
  phoneNumber: BS.Phone,
  code: S.Redacted(S.NonEmptyTrimmedString),
  updatePhoneNumber: BS.BoolWithDefault(true),
}).annotations(
  $I.annotations("VerifyPhonePayload", {
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
  $I`SendEmailVerificationPayload`
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
  $I.annotations("SendEmailVerificationPayload", {
    description: "Payload for sending an email verification link.",
  })
) {}

export declare namespace SendEmailVerificationPayload {
  export type Type = S.Schema.Type<typeof SendEmailVerificationPayload>;
  export type Encoded = S.Schema.Encoded<typeof SendEmailVerificationPayload>;
}

export class SendEmailVerificationSuccess extends S.Class<SendEmailVerificationSuccess>(
  $I`SendEmailVerificationSuccess`
)(
  {
    status: S.Boolean,
  },
  $I.annotations("SendEmailVerificationSuccess", {
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

export const SendEmailVerificationContract = Contract.make("SendEmailVerification", {
  description: "Sends an email verification link to the user.",
  payload: SendEmailVerificationPayload.fields,
  failure: IamError,
  success: SendEmailVerificationSuccess,
});

// =====================================================================================================================
// Verify Email Contract
// =====================================================================================================================
export class VerifyEmailPayload extends S.Class<VerifyEmailPayload>($I`VerifyEmailPayload`)(
  {
    token: S.Redacted(S.String),
    callbackURL: S.optional(BS.URLString),
    onFailure: BS.Fn({
      input: S.Undefined,
      output: S.Void,
    }),
    onSuccess: BS.Fn({
      input: S.Undefined,
      output: S.Void,
    }),
  },
  $I.annotations("VerifyEmailPayload", {
    description: "Payload for verifying an email address via a token.",
  })
) {}

export declare namespace VerifyEmailPayload {
  export type Type = S.Schema.Type<typeof VerifyEmailPayload>;
  export type Encoded = S.Schema.Encoded<typeof VerifyEmailPayload>;
}

export const VerifyEmailUser = S.Struct({
  id: SharedEntities.User.Model.select.fields.id,
  email: SharedEntities.User.Model.select.fields.email,
  name: SharedEntities.User.Model.select.fields.name,
  image: S.NullOr(BS.URLString),
  emailVerified: SharedEntities.User.Model.select.fields.emailVerified,
  createdAt: BS.DateTimeUtcFromAllAcceptable,
  updatedAt: BS.DateTimeUtcFromAllAcceptable,
});

export class VerifyEmailSuccess extends S.Class<VerifyEmailSuccess>($I`VerifyEmailSuccess`)(
  {
    status: S.Boolean,
    user: S.NullOr(VerifyEmailUser),
  },
  $I.annotations("VerifyEmailSuccess", {
    description: "Result payload returned after attempting email verification.",
  })
) {}

export declare namespace VerifyEmailSuccess {
  export type Type = S.Schema.Type<typeof VerifyEmailSuccess>;
  export type Encoded = S.Schema.Encoded<typeof VerifyEmailSuccess>;
}

export const VerifyEmailErrorCode = S.Literal("INVALID_TOKEN", "TOKEN_EXPIRED", "EMAIL_ALREADY_VERIFIED");

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
