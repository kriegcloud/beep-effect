import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.Passkey.UpdatePasskey.Payload>;

export const Handler: HandlerEffect = Effect.fn("UpdatePasskey")(
  function* ({ payload }) {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    // Encode payload to get the raw body
    const encodedPayload = yield* S.encode(V1.Passkey.UpdatePasskey.Payload)(payload);

    // Call Better Auth - passkey endpoints don't support returnHeaders
    const result = yield* Effect.tryPromise(() =>
      auth.api.updatePasskey({
        body: encodedPayload,
        headers: request.headers,
      })
    );

    // Decode response and return
    const decoded = yield* S.decodeUnknown(V1.Passkey.UpdatePasskey.Success)(result);
    return yield* F.pipe(decoded, HttpServerResponse.json);
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to update passkey.",
        cause: e,
      })
  )
);
