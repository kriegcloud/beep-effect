import { AuthHandler } from "@beep/iam-sdk/auth-wrapper";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { client } from "../../adapters";
import { SignupContract } from "./sign-up.contracts";

const signUpEmail = AuthHandler.make<SignupContract.Encoded, SignupContract.Encoded & { readonly name: string }>({
  name: "signUpEmail",
  plugin: "sign-up",
  method: "email",
  prepare: (value) =>
    Effect.flatMap(S.decode(SignupContract)(value), (encoded) =>
      Effect.succeed({
        name: encoded.name,
        ...value,
      })
    ).pipe(Effect.catchTag("ParseError", (e) => Effect.dieMessage(e.message))),
  run: AuthHandler.map(client.signUp.email),
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
