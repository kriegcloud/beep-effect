import { AuthHandler } from "@beep/iam-sdk/auth-wrapper";
import type { SignOutContract } from "@beep/iam-sdk/clients/sign-out/sign-out.contract";
import { client } from "../../adapters";

export const signOutClient = AuthHandler.make<SignOutContract.Type, SignOutContract.Encoded>({
  name: "signOut",
  method: "signOut",
  plugin: "core",
  run: AuthHandler.map(async ({ onSuccess }) => {
    let capturedError: unknown;
    const result = await client
      .signOut({
        fetchOptions: {
          onSuccess: () => void onSuccess(undefined),
          onError: (ctx) => {
            capturedError = ctx.error;
          },
        },
      })
      .catch((e) => {
        throw capturedError ?? e;
      });

    if (result.error == null) {
      client.$store.notify("$sessionSignal");
    }

    return result;
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
