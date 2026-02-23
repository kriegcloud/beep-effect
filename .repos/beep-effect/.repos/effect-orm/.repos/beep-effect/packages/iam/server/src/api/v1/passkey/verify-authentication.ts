import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as BetterAuthBridge from "../../../adapters/better-auth/BetterAuthBridge";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.Passkey.VerifyAuthentication.Payload>;

export const Handler: HandlerEffect = Effect.fn("VerifyAuthentication")(
  function* ({ payload }) {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    // Parse JSON-stringified WebAuthn response from browser
    const webAuthnResponse: Record<string, unknown> = JSON.parse(payload.response);

    // Call Better Auth via bridge - handles opaque WebAuthn types
    // Cast headers to satisfy Better Auth's type expectations
    const authApi: Record<string, unknown> = auth.api;
    const result = yield* BetterAuthBridge.verifyPasskeyAuthentication(authApi, {
      body: { response: webAuthnResponse },
      headers: request.headers as Record<string, string>,
    });

    // Decode response and return
    const decoded = yield* S.decodeUnknown(V1.Passkey.VerifyAuthentication.Success)(result);
    return yield* F.pipe(decoded, HttpServerResponse.json);
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to verify passkey authentication.",
        cause: e,
      })
  )
);
