import { Contract, ContractKit } from "@beep/iam-sdk/contract-kit";
import { BS } from "@beep/schema";
import { paths } from "@beep/shared-domain";
import * as Equal from "effect/Equal";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

// =====================================================================================================================
// Reset Password Contract
// =====================================================================================================================
const ResetPasswordPayloadFields = {
  newPassword: BS.Password,
  passwordConfirm: BS.Password,
};
export const ResetPasswordPayload = S.Struct(ResetPasswordPayloadFields).pipe(
  S.filter(
    ({ newPassword, passwordConfirm }) =>
      Equal.equals(Redacted.value(newPassword), Redacted.value(passwordConfirm)) || "Passwords do not match"
  ),
  S.annotations({
    identifier: "ResetPasswordPayload",
    description: "Payload containing the data required to reset a password.",
    schemaId: Symbol.for("@beep/iam-sdk/clients/ResetPasswordPayload"),
  })
);

export declare namespace ResetPasswordPayload {
  export type Type = S.Schema.Type<typeof ResetPasswordPayload>;
  export type Encoded = S.Schema.Encoded<typeof ResetPasswordPayload>;
}

export const ResetPasswordContract = Contract.make("ResetPassword", {
  description: "Resets a user's password using the provided token.",
  parameters: ResetPasswordPayloadFields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

// =====================================================================================================================
// Request Reset Password Contract
// =====================================================================================================================

export class RequestResetPasswordPayload extends BS.Class<RequestResetPasswordPayload>("RequestResetPasswordPayload")(
  {
    email: BS.Email,
    redirectTo: BS.StringWithDefault(paths.auth.requestResetPassword),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/RequestResetPasswordPayload"),
    identifier: "RequestResetPasswordPayload",
    description: "Payload for requesting a password reset email.",
  }
) {}

export declare namespace RequestResetPasswordPayload {
  export type Type = S.Schema.Type<typeof RequestResetPasswordPayload>;
  export type Encoded = S.Schema.Encoded<typeof RequestResetPasswordPayload>;
}

export const RequestResetPasswordContract = Contract.make("RequestResetPassword", {
  description: "Requests a password reset email for a user.",
  parameters: RequestResetPasswordPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});
// =====================================================================================================================
// Recover Contract Set
// =====================================================================================================================
export const RecoverContractKit = ContractKit.make(ResetPasswordContract, RequestResetPasswordContract);
