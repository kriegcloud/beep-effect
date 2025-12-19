import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as BetterAuthBridge from "../../../adapters/better-auth/BetterAuthBridge";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.Passkey.VerifyAuthentication.Payload>;

export const Handler: HandlerEffect = Effect.fn("VerifyAuthentication")(
  function* ({ payload }) {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    // Convert readonly record to mutable for BetterAuthBridge
    const webAuthnResponse = F.pipe(
      payload.response,
      R.map((v) => v)
    );

    // Call Better Auth via bridge - handles opaque WebAuthn types
    const result = yield* BetterAuthBridge.verifyPasskeyAuthentication(auth.api as Record<string, unknown>, {
      body: { response: webAuthnResponse },
      headers: request.headers,
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
