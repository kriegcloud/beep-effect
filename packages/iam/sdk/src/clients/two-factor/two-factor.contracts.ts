import { Contract, ContractKit } from "@beep/contract";
import * as S from "effect/Schema";
import { IamError } from "../../errors";
// =====================================================================================================================
// Send OTP Contract
// =====================================================================================================================
export const SendOtpPayload = S.Struct({}).annotations({
  schemaId: Symbol.for("@beep/iam-sdk/clients/SendOtpPayload"),
  identifier: "SendOtpPayload",
  description: "Payload for sending a one-time password via the two-factor adapter.",
});

export declare namespace SendOtpPayload {
  export type Type = S.Schema.Type<typeof SendOtpPayload>;
  export type Encoded = S.Schema.Encoded<typeof SendOtpPayload>;
}

export const SendOtpContract = Contract.make("SendOtp", {
  description: "Sends a one-time password to the user.",
  payload: SendOtpPayload.fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Send OTP")
  .annotate(Contract.Domain, "two-factor")
  .annotate(Contract.Method, "sendOtp");
// =====================================================================================================================
// Verify OTP Contract
// =====================================================================================================================
export class VerifyOtpPayload extends S.Class<VerifyOtpPayload>("VerifyOtpPayload")(
  {
    code: S.Redacted(S.String),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/VerifyOtpPayload"),
    identifier: "VerifyOtpPayload",
    description: "Payload containing the OTP verification code.",
  }
) {}

export declare namespace VerifyOtpPayload {
  export type Type = S.Schema.Type<typeof VerifyOtpPayload>;
  export type Encoded = S.Schema.Encoded<typeof VerifyOtpPayload>;
}

export const VerifyOtpContract = Contract.make("VerifyOtp", {
  description: "Verifies an OTP provided by the user.",
  payload: VerifyOtpPayload.fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Verify OTP")
  .annotate(Contract.Domain, "two-factor")
  .annotate(Contract.Method, "verifyOtp");

// =====================================================================================================================
// Verify TOTP Contract
// =====================================================================================================================

export class VerifyTotpPayload extends S.Class<VerifyTotpPayload>("VerifyTotpPayload")(
  {
    code: S.Redacted(S.String),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/VerifyTotpPayload"),
    identifier: "VerifyTotpPayload",
    description: "Payload containing the TOTP verification code.",
  }
) {}

export declare namespace VerifyTotpPayload {
  export type Type = S.Schema.Type<typeof VerifyTotpPayload>;
  export type Encoded = S.Schema.Encoded<typeof VerifyTotpPayload>;
}

export const VerifyTotpContract = Contract.make("VerifyTotp", {
  description: "Verifies a TOTP provided by the user.",
  payload: VerifyTotpPayload.fields,
  failure: IamError,
  success: S.Void,
})
  .annotate(Contract.Title, "Verify TOTP")
  .annotate(Contract.Domain, "two-factor")
  .annotate(Contract.Method, "verifyTotp");

// =====================================================================================================================
// Two Factor Contract Set
// =====================================================================================================================

export const TwoFactorContractKit = ContractKit.make(SendOtpContract, VerifyOtpContract, VerifyTotpContract);
