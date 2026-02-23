import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthEndpoint } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.TwoFactor.VerifyBackupCode.Payload>;

/**
 * Handler for verifying a backup code.
 *
 * Calls Better Auth `auth.api.verifyBackupCode` to verify and create a session.
 *
 * @since 1.0.0
 * @category handlers
 */
export const Handler: HandlerEffect = Effect.fn("TwoFactorVerifyBackupCode")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  return yield* runAuthEndpoint({
    payloadSchema: V1.TwoFactor.VerifyBackupCode.Payload,
    successSchema: V1.TwoFactor.VerifyBackupCode.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.verifyBackupCode({
          body,
          headers,
          returnHeaders: true,
        })
      ),
  });
}, IamAuthError.flowMap("two-factor-verify-backup-code"));
