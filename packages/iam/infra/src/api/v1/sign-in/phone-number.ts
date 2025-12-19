/**
 * @fileoverview Phone number sign-in handler implementation.
 *
 * Handles authentication using phone number and password.
 *
 * @category IAM API Handlers
 * @subcategory Sign In
 * @since 1.0.0
 *
 * @see {@link @beep/iam-domain/api/v1/sign-in/phone-number | Domain Contract}
 */
import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthEndpoint } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.SignIn.PhoneNumber.Payload>;

/**
 * Handler for phone number sign-in.
 *
 * Authenticates a user using their phone number and password.
 *
 * @since 1.0.0
 */
export const Handler: HandlerEffect = Effect.fn("SignInPhoneNumber")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  // TODO: Replace with actual Better Auth call once phone number plugin is verified
  // Expected: auth.api.signInPhoneNumber({ body, headers, returnHeaders: true })
  return yield* runAuthEndpoint({
    payloadSchema: V1.SignIn.PhoneNumber.Payload,
    successSchema: V1.SignIn.PhoneNumber.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.signInPhoneNumber({
          body,
          headers,
          returnHeaders: true,
        })
      ),
  });
}, IamAuthError.flowMap("sign-in"));
