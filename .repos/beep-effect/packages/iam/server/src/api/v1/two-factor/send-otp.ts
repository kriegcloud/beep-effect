import { IamAuthError } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthCommand } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<undefined>;

/**
 * Handler for sending OTP.
 *
 * Calls Better Auth `auth.api.sendTwoFactorOTP` to send a one-time password.
 *
 * @since 1.0.0
 * @category handlers
 */
export const Handler: HandlerEffect = Effect.fn("TwoFactorSendOtp")(
  function* () {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;
    return yield* runAuthCommand({
      successValue: { status: true },
      headers: request.headers,
      authHandler: ({ headers }) =>
        Effect.tryPromise(() =>
          auth.api.sendTwoFactorOTP({
            headers,
            returnHeaders: true,
          })
        ),
    });
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to send OTP.",
        cause: e,
      })
  )
);
