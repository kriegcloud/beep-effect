/**
 * @module get-access-token
 *
 * Handler implementation for the get-access-token endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthEndpoint } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.Core.GetAccessToken.Payload>;

/**
 * Handler for the get-access-token endpoint.
 *
 * Calls Better Auth `auth.api.getAccessToken` to retrieve the OAuth access token
 * for a linked account. If the token is expired, it will be refreshed automatically.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("GetAccessToken")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAuthEndpoint({
    payloadSchema: V1.Core.GetAccessToken.Payload,
    successSchema: V1.Core.GetAccessToken.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.getAccessToken({
          body,
          headers,
          returnHeaders: true,
        })
      ),
  });
}, IamAuthError.flowMap("get-access-token"));
