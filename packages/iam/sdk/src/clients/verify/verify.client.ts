import { AuthHandler } from "@beep/iam-sdk/auth-wrapper";
import {
  SendEmailVerificationContract,
  SendVerifyPhoneContract,
  VerifyEmailContract,
} from "@beep/iam-sdk/clients/verify/verify.contracts";
import { client } from "../../adapters";

const sendVerificationEmail = AuthHandler.make<
  SendEmailVerificationContract.Type,
  SendEmailVerificationContract.Encoded
>({
  name: "sendVerificationEmail",
  plugin: "verification",
  method: "sendVerificationEmail",
  schema: SendEmailVerificationContract,
  run: AuthHandler.map(async ({ email }) => {
    let capturedError: unknown;
    return client
      .sendVerificationEmail({
        email,
        fetchOptions: {
          onError: (ctx) => {
            capturedError = ctx.error;
          },
        },
      })
      .catch((e) => {
        throw capturedError ?? e;
      });
  }),
  toast: {
    onWaiting: "Sending verification email...",
    onSuccess: "Email verification sent successfully",
    onFailure: {
      onNone: () => "Failed to send verification email",
      onSome: (e) => e.message,
    },
  },
  defaultErrorMessage: "Failed to send verification email",
  annotations: { action: "verification", method: "sendVerificationEmail" },
});

const verifyEmail = AuthHandler.make<VerifyEmailContract.Type, VerifyEmailContract.Encoded>({
  name: "verifyEmail",
  plugin: "verification",
  method: "verifyEmail",
  schema: VerifyEmailContract,
  run: AuthHandler.map(({ token, onSuccess, onFailure }) => {
    let capturedError: unknown;
    return client
      .verifyEmail(
        {
          query: {
            token,
          },
        },
        {
          onSuccess: () => void onSuccess(undefined),
          onError: (ctx) => {
            capturedError = ctx.error;
            void onFailure(undefined);
          },
        }
      )
      .catch((e) => {
        throw capturedError ?? e;
      });
  }),
  toast: {
    onWaiting: "verifying email...",
    onSuccess: "Email verified!",
    onFailure: {
      onNone: () => "Failed to verify email for an unknown reason",
      onSome: (e) => e.message,
    },
  },
  defaultErrorMessage: "Failed to verify email",
  annotations: { action: "verification", method: "verifyEmail" },
});

const sendVerifyPhone = AuthHandler.make<SendVerifyPhoneContract.Type, SendVerifyPhoneContract.Encoded>({
  name: "verifyPhone",
  plugin: "verification",
  method: "phone",
  schema: SendVerifyPhoneContract,
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
  phone: sendVerifyPhone,
  email: {
    sendVerificationEmail: sendVerificationEmail,
    verifyEmail: verifyEmail,
  },
} as const;
