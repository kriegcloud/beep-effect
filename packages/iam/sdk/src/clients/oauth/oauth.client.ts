import { AuthHandler } from "@beep/iam-sdk/auth-wrapper";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { client } from "../../adapters";
import { OAuthRegisterContract } from "./oauth.contracts";

const oauth2Register = AuthHandler.make<OAuthRegisterContract.Encoded>({
  name: "oauth2Register",
  plugin: "oauth2",
  method: "register",
  prepare: (value) =>
    Effect.flatMap(S.decode(OAuthRegisterContract)(value), (encoded) => Effect.succeed(encoded)).pipe(
      Effect.catchTag("ParseError", (e) => Effect.dieMessage(e.message))
    ),
  run: AuthHandler.map(client.oauth2.register),
  toast: {
    onWaiting: "Registering OAuth2 Application...",
    onSuccess: "Successfully registered OAuth2 Application",
    onFailure: {
      onNone: () => "Failed register OAuth2  Application",
      onSome: (e) => e.message,
    },
  },
  defaultErrorMessage: "Failed register OAuth2  Application",
  annotations: { action: "oauth2", method: "register" },
});

export const oauth2Client = {
  oauth2Register,
} as const;
