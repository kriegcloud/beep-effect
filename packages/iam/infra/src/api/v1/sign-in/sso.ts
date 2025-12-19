/**
 * @fileoverview SSO sign-in handler implementation.
 *
 * Handles authentication using SSO providers (SAML/OIDC).
 *
 * @category IAM API Handlers
 * @subcategory Sign In
 * @since 1.0.0
 *
 * @see {@link @beep/iam-domain/api/v1/sign-in/sso | Domain Contract}
 */
import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as Effect from "effect/Effect";
import type { Common } from "../../common";
import { runAuthEndpoint } from "../../common/schema-helpers";

type HandlerEffect = Common.HandlerEffect<V1.SignIn.SSO.Payload>;

/**
 * Handler for SSO sign-in.
 *
 * Initiates SSO authentication flow with an enterprise identity provider.
 * Returns the authorization URL for the client to redirect to.
 *
 * @since 1.0.0
 */
export const Handler: HandlerEffect = Effect.fn("SignInSSO")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  // NOTE: signInSSO exists in Better Auth when SSO plugin is enabled
  return yield* runAuthEndpoint({
    payloadSchema: V1.SignIn.SSO.Payload,
    successSchema: V1.SignIn.SSO.Success,
    payload,
    headers: request.headers,
    authHandler: ({ body, headers }) =>
      Effect.tryPromise(() =>
        auth.api.signInSSO({
          body,
          headers,
          returnHeaders: true,
        })
      ),
  });
}, IamAuthError.flowMap("sign-in"));
