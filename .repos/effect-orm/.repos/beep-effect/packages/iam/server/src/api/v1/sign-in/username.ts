/**
 * @fileoverview Username sign-in handler implementation.
 *
 * Handles authentication using username and password.
 *
 * @category IAM API Handlers
 * @subcategory Sign In
 * @since 1.0.0
 *
 * @see {@link @beep/iam-domain/api/v1/sign-in/username | Domain Contract}
 */
import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthEndpoint } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.SignIn.Username.Payload>;

/**
 * Handler for username sign-in.
 *
 * Authenticates a user using their username and password.
 *
 * @since 1.0.0
 */
export const Handler: HandlerEffect = Effect.fn("SignInUsername")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  // NOTE: signInUsername exists in Better Auth when username plugin is enabled
  return yield* runAuthEndpoint({
    payloadSchema: V1.SignIn.Username.Payload,
    successSchema: V1.SignIn.Username.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.signInUsername({
          body,
          headers,
          returnHeaders: true,
        })
      ),
  });
}, IamAuthError.flowMap("sign-in"));
