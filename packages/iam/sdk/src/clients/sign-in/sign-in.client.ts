import { AuthHandler } from "@beep/iam-sdk/auth-wrapper";
import { SignInEmailContract, type SignInSocialContract } from "@beep/iam-sdk/clients";
import * as Effect from "effect/Effect";
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
const signInSocial = AuthHandler.make<SignInSocialContract.Type, SignInSocialContract.Encoded>({
  name: "signInSocial",
  plugin: "sign-in",
  method: "social",
  prepare: ({ provider }) => Effect.succeed({ provider }),
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

export interface SignInPasskeyInput {
  readonly onSuccess: () => void;
}

const signInPasskey = AuthHandler.make<SignInPasskeyInput>({
  name: "signInPasskey",
  plugin: "sign-in",
  method: "passkey",
  run: AuthHandler.map((input, { signal } = {}) => {
    let capturedError: unknown;

    return client.signIn
      .passkey({
        fetchOptions: {
          signal,
          onSuccess: input.onSuccess,
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
    try {
      await client.oneTap();
      return { data: null, error: null } as const;
    } catch (error) {
      throw error;
    }
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
