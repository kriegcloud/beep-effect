import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as BetterAuthBridge from "../../../adapters/better-auth/BetterAuthBridge";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.Passkey.VerifyRegistration.Payload>;

export const Handler: HandlerEffect = Effect.fn("VerifyRegistration")(
  function* ({ payload }) {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    // Convert readonly record to mutable for BetterAuthBridge
    const webAuthnResponse = F.pipe(
      payload.response,
      R.map((v) => v)
    );
    const name = O.getOrUndefined(payload.name);

    // Call Better Auth via bridge - handles opaque WebAuthn types
    const result = yield* BetterAuthBridge.verifyPasskeyRegistration(auth.api as Record<string, unknown>, {
      body: { response: webAuthnResponse, name },
      headers: request.headers,
    });

    // Decode response and return
    const decoded = yield* S.decodeUnknown(V1.Passkey.VerifyRegistration.Success)(result);
    return yield* F.pipe(decoded, HttpServerResponse.json);
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to verify passkey registration.",
        cause: e,
      })
  )
);
