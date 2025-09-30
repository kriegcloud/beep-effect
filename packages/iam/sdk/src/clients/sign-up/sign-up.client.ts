import { AuthHandler } from "@beep/iam-sdk/auth-wrapper";
import { paths } from "@beep/shared-domain";
import { client } from "../../adapters";
import { IamError } from "../../errors";
import { SignupContract } from "./sign-up.contracts";

const signUpEmail = AuthHandler.make({
  name: "signUpEmail",
  plugin: "sign-up",
  method: "email",
  schema: SignupContract,
  run: AuthHandler.map(({ value, onSuccess }) => {
    let capturedError: IamError | undefined = undefined;
    return client.signUp
      .email({
        ...value,
        fetchOptions: {
          onError: (ctx) => {
            capturedError = new IamError(ctx.error, ctx.error.message ?? "FailedToSignUp");
          },
          onSuccess: () => onSuccess(paths.root),
        },
      })
      .catch((error) => {
        throw capturedError ?? error;
      });
  }),
  toast: {
    onWaiting: "Signing up...",
    onSuccess: "Welcome traveler.",
    onFailure: {
      onNone: () => "Failed to signup for unknown reason",
      onSome: (e) => e.message,
    },
  },
  defaultErrorMessage: "Failed to signup",
  annotations: { action: "sign-up", method: "email" },
});

export const signUpClient = {
  email: signUpEmail,
} as const;
