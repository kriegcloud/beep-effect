/**
 * PACER Authentication service over the lower-level `effect/unstable/http`
 * client.
 *
 * The Authentication API returns failures as HTTP 200 with a body-level
 * `loginResult` code, so this path does NOT use `httpapi` (whose error model is
 * status-driven). {@link PacerAuth} exposes raw `login`/`logout`; {@link
 * PacerSession} is a scoped layer that logs in on acquire, holds the token in a
 * {@link effect/Ref} (so the PCL client can read + refresh it), and logs out on
 * release.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $ScratchpadId } from "@beep/identity";
import { Context, Effect, Layer, Redacted, Ref } from "effect";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import { PacerAuthError } from "../Pacer.errors.ts";
import { NextGenCsoToken } from "../Pacer.tokens.ts";
import { CsoAuthRequest, CsoAuthResponse, CsoLogoutRequest, CsoLogoutResponse } from "./CsoAuth.models.ts";
import type { PacerConfig } from "../Pacer.config.ts";

const $I = $ScratchpadId.create("pacer/auth/PacerAuth.service");

/**
 * Runtime shape exposed by {@link PacerAuth}.
 *
 * @category services
 * @since 0.0.0
 */
export interface PacerAuthShape {
  /** Authenticate with the configured credentials, returning a fresh token. */
  readonly login: Effect.Effect<NextGenCsoToken, PacerAuthError>;
  /** Invalidate a token via cso-logout. */
  readonly logout: (token: NextGenCsoToken) => Effect.Effect<void, PacerAuthError>;
}

const transport = (cause: unknown): PacerAuthError =>
  PacerAuthError.fromReason("transport", { cause: String(cause) });
const decoding = (cause: unknown): PacerAuthError =>
  PacerAuthError.fromReason("response-decoding", { cause: String(cause) });

/** Per-request timeout so a hung PACER auth endpoint can never block forever. */
const REQUEST_TIMEOUT = "30 seconds";

const makeService = (client: HttpClient.HttpClient, cfg: PacerConfig): PacerAuthShape => {
  const login: Effect.Effect<NextGenCsoToken, PacerAuthError> = Effect.gen(function* () {
    const requestBody = CsoAuthRequest.make({
      loginId: Redacted.value(cfg.loginId),
      password: Redacted.value(cfg.password),
      ...R.getSomes({ clientCode: cfg.clientCode }),
      ...R.getSomes({ otpCode: O.map(cfg.otpCode, Redacted.value) }),
      // Filers (e-filing accounts) must attest redaction compliance; PACER returns
      // loginResult "1" if a filer omits it. Search-only accounts leave it off.
      ...R.getSomes({ redactFlag: cfg.isFiler === true ? O.some("1") : O.none<string>() }),
    });
    const baseRequest = HttpClientRequest.post(`${cfg.authBaseUrl}/services/cso-auth`).pipe(
      HttpClientRequest.accept("application/json")
    );
    const request = yield* HttpClientRequest.bodyJson(baseRequest, requestBody).pipe(Effect.mapError(transport));
    const response = yield* client.execute(request).pipe(Effect.timeout(REQUEST_TIMEOUT), Effect.mapError(transport));
    const body = yield* HttpClientResponse.schemaBodyJson(CsoAuthResponse)(response).pipe(Effect.mapError(decoding));

    if (body.loginResult !== "0" || body.nextGenCSO === "") {
      return yield* PacerAuthError.fromLoginResult(body.loginResult, body.errorDescription);
    }
    // loginResult "0" can still carry a non-fatal search-privilege warning.
    if (body.errorDescription !== undefined && body.errorDescription.length > 0) {
      yield* Effect.logWarning(`PACER login succeeded with a warning: ${body.errorDescription}`);
    }
    return NextGenCsoToken.make(body.nextGenCSO);
  });

  const logout = (token: NextGenCsoToken): Effect.Effect<void, PacerAuthError> =>
    Effect.gen(function* () {
      const baseRequest = HttpClientRequest.post(`${cfg.authBaseUrl}/services/cso-logout`).pipe(
        HttpClientRequest.accept("application/json")
      );
      const request = yield* HttpClientRequest.bodyJson(baseRequest, CsoLogoutRequest.make({ nextGenCSO: token })).pipe(
        Effect.mapError(transport)
      );
      const response = yield* client.execute(request).pipe(Effect.timeout(REQUEST_TIMEOUT), Effect.mapError(transport));
      yield* HttpClientResponse.schemaBodyJson(CsoLogoutResponse)(response).pipe(Effect.mapError(decoding));
    });

  return { login, logout };
};

/**
 * PACER Authentication service: raw `login` / `logout` over an HTTP client.
 *
 * @category services
 * @since 0.0.0
 */
export class PacerAuth extends Context.Service<PacerAuth, PacerAuthShape>()($I`PacerAuth`) {
  /**
   * Build a layer from explicit configuration; requires an `HttpClient`.
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly makeLayer = (cfg: PacerConfig): Layer.Layer<PacerAuth, never, HttpClient.HttpClient> =>
    Layer.effect(
      PacerAuth,
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        return PacerAuth.of(makeService(client, cfg));
      })
    );
}

/**
 * Runtime shape exposed by {@link PacerSession}.
 *
 * @category services
 * @since 0.0.0
 */
export interface PacerSessionShape {
  /** The current auth token, refreshable by the PCL client on token rotation. */
  readonly tokenRef: Ref.Ref<Redacted.Redacted<NextGenCsoToken>>;
}

/**
 * A scoped authenticated session: logs in on layer acquire, exposes the token
 * via a {@link effect/Ref}, and logs out on layer release.
 *
 * @category services
 * @since 0.0.0
 */
export class PacerSession extends Context.Service<PacerSession, PacerSessionShape>()($I`PacerSession`) {
  /**
   * Scoped layer that authenticates on acquire and logs out on release.
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly layer: Layer.Layer<PacerSession, PacerAuthError, PacerAuth> = Layer.effect(
    PacerSession,
    Effect.gen(function* () {
      const auth = yield* PacerAuth;
      const token = yield* auth.login;
      yield* Effect.logInfo("PacerSession: authenticated (nextGenCSO acquired)");
      const tokenRef = yield* Ref.make(Redacted.make(token));
      yield* Effect.addFinalizer(() =>
        auth.logout(token).pipe(
          Effect.tap(() => Effect.logInfo("PacerSession: logged out (cso-logout)")),
          Effect.ignore
        )
      );
      return PacerSession.of({ tokenRef });
    })
  );
}
