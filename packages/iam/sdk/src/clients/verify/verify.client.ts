import { AuthHandler } from "@beep/iam-sdk/auth-wrapper";
import { VerifyEmailContract, VerifyPhoneContract } from "@beep/iam-sdk/clients";
import { client } from "../../adapters";

const verifyEmail = AuthHandler.make<VerifyEmailContract.Type, VerifyEmailContract.Encoded>({
  name: "verifyEmail",
  plugin: "verification",
  method: "email",
  schema: VerifyEmailContract,
  run: AuthHandler.map(client.sendVerificationEmail),
  toast: {
    onWaiting: "Sending verification email...",
    onSuccess: "Email verification sent successfully",
    onFailure: {
      onNone: () => "Failed to send verification email",
      onSome: (e) => e.message,
    },
  },
  defaultErrorMessage: "Failed to send verification email",
  annotations: { action: "verification", method: "email" },
});

const verifyPhone = AuthHandler.make<VerifyPhoneContract.Type, VerifyPhoneContract.Encoded>({
  name: "verifyPhone",
  plugin: "verification",
  method: "phone",
  schema: VerifyPhoneContract,
  run: AuthHandler.map(client.phoneNumber.verify),
  toast: {
    onWaiting: "Sending phone number verification...",
    onSuccess: "Phone number verification sent successfully",
    onFailure: {
      onNone: () => "Failed to send phone number verification for an unknown reason",
      onSome: (e) => e.message,
    },
  },
  defaultErrorMessage: "Failed to send phone number verification",
  annotations: { action: "verification", method: "phone" },
});

export const verifyClient = {
  phone: verifyPhone,
  email: verifyEmail,
} as const;
