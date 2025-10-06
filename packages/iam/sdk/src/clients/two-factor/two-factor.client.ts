import { AuthHandler } from "@beep/iam-sdk/auth-wrapper";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import { client } from "../../adapters";

const sendOtp = AuthHandler.make<void>({
  name: "sendOtp",
  plugin: "two-factor",
  method: "sendOtp",
  run: AuthHandler.map(() => client.twoFactor.sendOtp()),
  toast: {
    onWaiting: "sending Otp...",
    onSuccess: "Otp sent successfully",
    onFailure: {
      onNone: () => "Failed to send one time password",
      onSome: (e) => e.message,
    },
  },
  defaultErrorMessage: "Failed to send one time password",
  annotations: { action: "two-factor", method: "sendOtp" },
});

const verifyOtp = AuthHandler.make<Redacted.Redacted<string>>({
  name: "verifyOtp",
  plugin: "two-factor",
  method: "verifyOtp",
  run: AuthHandler.map((code) =>
    client.twoFactor.verifyOtp({
      code: Redacted.value(code),
    })
  ),
  toast: {
    onWaiting: "verifying one time password...",
    onSuccess: "OTP verified successfully",
    onFailure: (error) =>
      O.match(error, {
        onNone: () => "Failed to verify one time password",
        onSome: (e) => e.message,
      }),
  },
  defaultErrorMessage: "Failed to verify one time password",
  annotations: { action: "two-factor", method: "verifyOtp" },
});

const verifyTotp = AuthHandler.make<Redacted.Redacted<string>>({
  name: "verifyTotp",
  plugin: "two-factor",
  method: "verifyTotp",
  run: AuthHandler.map((code) =>
    client.twoFactor.verifyTotp({
      code: Redacted.value(code),
    })
  ),
  toast: {
    onWaiting: "Verifying Totp",
    onSuccess: "Totp verified successfully",
    onFailure: {
      onNone: () => "Failed to verify Totp",
      onSome: (e) => e.message,
    },
  },
  defaultErrorMessage: "Failed to verify Totp",
  annotations: { action: "two-factor", method: "verifyTotp" },
});

export const twoFactorClient = {
  sendOtp,
  verifyOtp,
  verifyTotp,
} as const;
