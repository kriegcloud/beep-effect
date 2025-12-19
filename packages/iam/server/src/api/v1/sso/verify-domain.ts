/**
 * @module verify-domain
 *
 * Handler implementation for the SSO domain verification endpoint.
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

type HandlerEffect = Common.HandlerEffect<V1.SSO.VerifyDomain.Payload>;

/**
 * Handler for the SSO domain verification endpoint.
 *
 * Verifies domain ownership for an SSO provider by checking DNS records.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("VerifyDomain")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAuthEndpoint({
    payloadSchema: V1.SSO.VerifyDomain.Payload,
    successSchema: V1.SSO.VerifyDomain.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.verifyDomain({
          body,
          headers,
          returnHeaders: true,
        })
      ),
  });
}, IamAuthError.flowMap("sso"));
