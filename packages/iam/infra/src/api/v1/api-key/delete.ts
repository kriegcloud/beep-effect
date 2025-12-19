import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.ApiKey.Delete.Payload>;

/**
 * Handler for deleting an API key.
 *
 * Calls Better Auth `auth.api.deleteApiKey` to delete an API key.
 *
 * @since 1.0.0
 * @category handlers
 */
export const Handler: HandlerEffect = Effect.fn("ApiKeyDelete")(
  function* ({ payload }) {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    // Encode payload to get the raw body
    const encodedPayload = yield* S.encode(V1.ApiKey.Delete.Payload)(payload);

    // Call Better Auth
    const result = yield* Effect.tryPromise(() =>
      auth.api.deleteApiKey({
        body: encodedPayload,
        headers: request.headers,
      })
    );

    // Decode response and return
    const decoded = yield* S.decodeUnknown(V1.ApiKey.Delete.Success)(result);
    return yield* F.pipe(decoded, HttpServerResponse.json);
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to delete API key.",
        cause: e,
      })
  )
);
