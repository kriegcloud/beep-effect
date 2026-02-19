import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthEndpoint } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.TwoFactor.GetTotpUri.Payload>;

/**
 * Handler for getting TOTP URI.
 *
 * Calls Better Auth `auth.api.getTOTPURI` to retrieve the TOTP URI.
 *
 * @since 1.0.0
 * @category handlers
 */
export const Handler: HandlerEffect = Effect.fn("TwoFactorGetTotpUri")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAuthEndpoint({
    payloadSchema: V1.TwoFactor.GetTotpUri.Payload,
    successSchema: V1.TwoFactor.GetTotpUri.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.getTOTPURI({
          body,
          headers,
          returnHeaders: true,
        })
      ),
  });
}, IamAuthError.flowMap("two-factor-get-totp-uri"));
