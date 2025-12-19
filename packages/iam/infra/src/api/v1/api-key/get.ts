import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.UrlParamsHandlerEffect<V1.ApiKey.Get.UrlParams>;

/**
 * Handler for getting an API key.
 *
 * Calls Better Auth `auth.api.getApiKey` to retrieve an API key.
 *
 * @since 1.0.0
 * @category handlers
 */
export const Handler: HandlerEffect = Effect.fn("ApiKeyGet")(
  function* ({ urlParams }) {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    const result = yield* Effect.tryPromise(() =>
      auth.api.getApiKey({
        query: { id: urlParams.id },
        headers: request.headers,
      })
    );

    const decoded = yield* S.decodeUnknown(V1.ApiKey.Get.Success)(result);
    return yield* F.pipe(decoded, HttpServerResponse.json);
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to get API key.",
        cause: e,
      })
  )
);
