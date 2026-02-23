/**
 * @fileoverview OAuth2 sign-in handler implementation.
 *
 * Handles authentication using generic OAuth2 providers.
 *
 * @category IAM API Handlers
 * @subcategory Sign In
 * @since 1.0.0
 *
 * @see {@link @beep/iam-domain/api/v1/sign-in/oauth2 | Domain Contract}
 */
import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-server";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.SignIn.OAuth2.Payload>;

/**
 * Handler for OAuth2 sign-in.
 *
 * Initiates OAuth2 authentication flow with a custom provider.
 * Returns the authorization URL for the client to redirect to.
 *
 * Note: OAuth2 redirect flows don't set cookies on the initial request.
 * Cookies are set during the callback after provider authentication.
 *
 * @since 1.0.0
 */
export const Handler: HandlerEffect = Effect.fn("SignInOAuth2")(function* ({ payload }) {
  const auth = yield* Auth.Service;
  const request = yield* HttpServerRequest.HttpServerRequest;

  // Encode payload for Better Auth
  const body = yield* S.encode(V1.SignIn.OAuth2.Payload)(payload);

  // Call Better Auth - OAuth2 flows return redirect URL directly (no headers)
  const response = yield* Effect.tryPromise(() =>
    auth.api.signInWithOAuth2({
      body,
      headers: request.headers,
    })
  );

  // Decode and return response
  const decoded = yield* S.decodeUnknown(V1.SignIn.OAuth2.Success)(response);
  return yield* F.pipe(decoded, HttpServerResponse.json);
}, IamAuthError.flowMap("sign-in"));
