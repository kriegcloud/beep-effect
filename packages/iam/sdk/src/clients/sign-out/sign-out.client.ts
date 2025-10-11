import { AuthHandler } from "@beep/iam-sdk/auth-wrapper";
import { SignOutContract } from "@beep/iam-sdk/clients/sign-out/sign-out.contract";
import { client } from "../../adapters";

export const signOutClient = AuthHandler.make<SignOutContract.Type, SignOutContract.Encoded>({
  name: "signOut",
  method: "signOut",
  plugin: "core",
  schema: SignOutContract,
  run: AuthHandler.map(async ({ onSuccess }) => {
    let capturedError: unknown;

    await client.signOut({
      fetchOptions: {
        onSuccess: () => void onSuccess(undefined),
        onError: (ctx) => {
          capturedError = ctx.error;
        },
      },
    });
    if (capturedError) {
      return { data: null, error: capturedError } as const;
    }
    return { data: null, error: null } as const;
  }),
  toast: {
    onWaiting: "Signing out...",
    onSuccess: "Signed out successfully",
    onFailure: {
      onNone: () => "Failed to sign out",
      onSome: (e) => e.message,
    },
  },
  defaultErrorMessage: "Failed to signOut",
  annotations: { action: "sign-out", method: "signOut" },
});
