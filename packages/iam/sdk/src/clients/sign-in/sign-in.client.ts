import { AuthHandler } from "@beep/iam-sdk/auth-wrapper";
import {
  SignInEmailContract,
  SignInPasskeyContract,
  SignInSocialContract,
} from "@beep/iam-sdk/clients/sign-in/sign-in.contracts";
import { client } from "../../adapters";

const signInEmail = AuthHandler.make<SignInEmailContract.Type, SignInEmailContract.Encoded>({
  name: "signInEmail",
  plugin: "sign-in",
  method: "email",
  schema: SignInEmailContract,
  run: AuthHandler.map(client.signIn.email),
  toast: {
    onWaiting: "Signing in...",
    onSuccess: "Signed in successfully",
    onFailure: {
      onNone: () => "Failed to signin",
      onSome: (e) => e.message,
    },
  },
  defaultErrorMessage: "Failed to signin",
  annotations: { action: "sign-in", method: "email" },
});
const signInSocial = AuthHandler.make({
  name: "signInSocial",
  plugin: "sign-in",
  method: "social",
  schema: SignInSocialContract,
  run: AuthHandler.map(client.signIn.social),
  toast: {
    onWaiting: "Signing in...",
    onSuccess: "Signed in successfully",
    onFailure: {
      onNone: () => "Failed to signin",
      onSome: (e) => e.message,
    },
  },
  defaultErrorMessage: "Failed to signin",
  annotations: { action: "sign-in", method: "social" },
});

const signInPasskey = AuthHandler.make({
  name: "signInPasskey",
  plugin: "sign-in",
  method: "passkey",
  schema: SignInPasskeyContract,
  run: AuthHandler.map(async ({ onSuccess }) => {
    let capturedError: unknown;
    return await client.signIn
      .passkey({
        fetchOptions: {
          onSuccess: () => onSuccess(undefined),
          onError(context) {
            capturedError = context.error;
            throw context.error;
          },
        },
      })
      .catch((error) => {
        throw capturedError ?? error;
      });
  }),
  toast: {
    onWaiting: "Signing in...",
    onSuccess: "Signed in successfully",
    onFailure: {
      onNone: () => "Failed to sign in with passkey.",
      onSome: (e) => e.customMessage,
    },
  },
  defaultErrorMessage: "Failed to sign in with passkey.",
  annotations: { action: "sign-in", method: "passkey" },
});

const signInOneTap = AuthHandler.make<void>({
  name: "signInOneTap",
  plugin: "sign-in",
  method: "oneTap",
  run: AuthHandler.map(async () => {
    await client.oneTap();
    return { data: null, error: null } as const;
  }),
  toast: {
    onWaiting: "Signing in...",
    onSuccess: "Signed in successfully",
    onFailure: {
      onNone: () => "Failed to signin",
      onSome: (e) => e.message,
    },
  },
  defaultErrorMessage: "Failed to signin",
  annotations: { action: "sign-in", method: "oneTap" },
});

export const signInClient = {
  email: signInEmail,
  social: signInSocial,
  passkey: signInPasskey,
  oneTap: signInOneTap,
} as const;
