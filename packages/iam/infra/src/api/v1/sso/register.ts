/**
 * @module register
 *
 * Handler implementation for the SSO provider registration endpoint.
 *
 * @category exports
 * @since 0.1.0
 */

import { IamAuthError, V1 } from "@beep/iam-domain/api";
import { Auth } from "@beep/iam-infra/adapters";
import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import type { Common } from "../../common";

type HandlerEffect = Common.HandlerEffect<V1.SSO.Register.Payload>;

/**
 * Handler for the SSO provider registration endpoint.
 *
 * Registers a new OIDC or SAML SSO provider for enterprise authentication.
 *
 * @since 0.1.0
 * @category constructors
 */
export const Handler: HandlerEffect = Effect.fn("RegisterSSOProvider")(
  function* ({ payload }) {
    const auth = yield* Auth.Service;
    const request = yield* HttpServerRequest.HttpServerRequest;

    // Encode payload for Better Auth
    const encodedPayload = yield* S.encode(V1.SSO.Register.Payload)(payload);

    // Better Auth's registerSSOProvider returns BaseSSOProvider directly (no headers)
    // Cast headers for type compatibility and build body with proper types
    const result = yield* Effect.tryPromise(() =>
      auth.api.registerSSOProvider({
        body: {
          providerId: encodedPayload.providerId,
          issuer: encodedPayload.issuer as string,
          domain: encodedPayload.domain,
          oidcConfig: encodedPayload.oidcConfig as
            | {
                clientId: string;
                clientSecret: string;
                authorizationEndpoint?: string;
                tokenEndpoint?: string;
                userInfoEndpoint?: string;
                scopes?: string[];
              }
            | undefined,
          samlConfig: encodedPayload.samlConfig as
            | {
                entryPoint: string;
                cert: string;
                callbackUrl: string;
                spMetadata: Record<string, unknown>;
              }
            | undefined,
          organizationId: encodedPayload.organizationId ?? undefined,
          overrideUserInfo: encodedPayload.overrideUserInfo as boolean | undefined,
        },
        headers: request.headers as Record<string, string>,
      })
    );

    // Decode response and return JSON
    const decoded = yield* S.decodeUnknown(V1.SSO.Register.Success)(result);
    return yield* F.pipe(decoded, HttpServerResponse.json);
  },
  Effect.mapError(
    (e) =>
      new IamAuthError({
        message: "Failed to register SSO provider.",
        cause: e,
      })
  )
);
