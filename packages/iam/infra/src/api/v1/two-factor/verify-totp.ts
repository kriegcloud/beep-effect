import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthEndpoint } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.TwoFactor.VerifyTotp.Payload>;

/**
 * Handler for verifying a TOTP code.
 *
 * Calls Better Auth `auth.api.verifyTOTP` to verify the TOTP code.
 *
 * @since 1.0.0
 * @category handlers
 */
export const Handler: HandlerEffect = Effect.fn("TwoFactorVerifyTotp")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAuthEndpoint({
    payloadSchema: V1.TwoFactor.VerifyTotp.Payload,
    successSchema: V1.TwoFactor.VerifyTotp.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.verifyTOTP({
          body,
          headers,
          returnHeaders: true,
        })
      ),
  });
}, IamAuthError.flowMap("two-factor-verify-totp"));
