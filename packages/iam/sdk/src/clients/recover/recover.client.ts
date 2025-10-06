import { AuthHandler } from "@beep/iam-sdk/auth-wrapper";
import { RequestResetPasswordContract, ResetPasswordContract } from "@beep/iam-sdk/clients";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { client } from "../../adapters";
import { IamError } from "../../errors";

const resetPassword = AuthHandler.make<ResetPasswordContract.Type, ResetPasswordContract.Encoded>({
  name: "resetPassword",
  plugin: "reset-password",
  method: "submit",
  tracing: "untraced",
  prepare: (input) =>
    Effect.gen(function* () {
      const rawToken = new URLSearchParams(window.location.search).get("token");
      const tokenOption = O.fromNullable(rawToken);

      if (O.isNone(tokenOption)) {
        return yield* Effect.fail(
          new IamError(
            {
              id: "reset-password-token",
              resource: "reset-password-token",
            },
            "No token found",
            {
              plugin: "reset-password",
              method: "submit",
            }
          )
        );
      }

      const encoded = yield* S.encode(ResetPasswordContract)(input);

      return {
        newPassword: encoded.newPassword,
        token: tokenOption.value,
        passwordConfirm: encoded.passwordConfirm,
      } as const;
    }).pipe(Effect.catchTag("ParseError", (e) => Effect.dieMessage(e.message))),
  run: AuthHandler.map(client.resetPassword),
  toast: {
    onWaiting: "Resetting password...",
    onSuccess: "Password reset successfully",
    onFailure: {
      onNone: () => "Failed reset password",
      onSome: (e) => e.message,
    },
  },
  defaultErrorMessage: "Failed reset password",
  annotations: { action: "reset-password", method: "submit" },
});

const requestPasswordReset = AuthHandler.make<RequestResetPasswordContract.Type, RequestResetPasswordContract.Encoded>({
  name: "requestPasswordReset",
  plugin: "reset-password",
  method: "request",
  schema: RequestResetPasswordContract,
  run: AuthHandler.map(client.requestPasswordReset),
  toast: {
    onWaiting: "Requesting password reset...",
    onSuccess: "Password reset requested successfully",
    onFailure: {
      onNone: () => "Failed to request password reset",
      onSome: (e) => e.message,
    },
  },
  defaultErrorMessage: "Failed to request password reset",
  annotations: { action: "reset-password", method: "request" },
});

export const recoverClient = {
  resetPassword,
  requestPasswordReset,
} as const;
