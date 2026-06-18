/**
 * Delegated Microsoft Graph token acquisition for the Microsoft 365 driver.
 *
 * Implements OAuth2 authorization-code + PKCE as a public client via
 * `@azure/msal-node` with silent refresh, persisting the MSAL token cache
 * encrypted via `@azure/msal-node-extensions` (DPAPI / Keychain / libsecret).
 * The MSAL packages are dynamically imported so the native cache binaries load
 * only when the live layer is actually built — unit tests use
 * {@link M365Auth.layerStatic} and never touch them.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $M365Id } from "@beep/identity";
import { O } from "@beep/utils";
import { Context, Effect, Layer, pipe, Redacted } from "effect";
import * as A from "effect/Array";
import { resolveM365Config } from "./M365.config.ts";
import { M365Error } from "./M365.errors.ts";
import type * as NodeHttp from "node:http";
import type { AuthenticationResult, Configuration, CryptoProvider, PublicClientApplication } from "@azure/msal-node";
import type { Scope } from "effect";
import type { M365ConfigInput, ResolvedM365Config } from "./M365.config.ts";

const $I = $M365Id.create("M365.auth");

type ICachePlugin = NonNullable<NonNullable<Configuration["cache"]>["cachePlugin"]>;

type M365AuthRuntime = {
  readonly pca: PublicClientApplication;
  readonly crypto: CryptoProvider;
  readonly nodeHttp: typeof NodeHttp;
  readonly resolved: ResolvedM365Config;
};

type LoopbackCapture = {
  readonly redirectUri: string;
  readonly awaitCode: Effect.Effect<string, M365Error>;
};

const SIGN_IN_OK = "Microsoft 365 sign-in complete. You may close this window and return to the application.";
const SIGN_IN_FAILED = "Microsoft 365 sign-in failed. You may close this window and return to the application.";
const WAITING = "Waiting for the Microsoft 365 authorization redirect...";

const importMsalNode = Effect.tryPromise({
  try: () => import("@azure/msal-node"),
  catch: (cause) => M365Error.fromReason("config", { cause }),
});

const importNodeHttp = Effect.tryPromise({
  try: () => import("node:http"),
  catch: (cause) => M365Error.fromReason("config", { cause }),
});

const buildCachePlugin = (resolved: ResolvedM365Config): Effect.Effect<O.Option<ICachePlugin>, M365Error> =>
  O.match(resolved.tokenCachePath, {
    onNone: () => Effect.succeed(O.none<ICachePlugin>()),
    onSome: (cachePath) =>
      Effect.tryPromise({
        try: async () => {
          const Ext = await import("@azure/msal-node-extensions");
          const persistence = await Ext.PersistenceCreator.createPersistence({
            accountName: "beep-m365-token-cache",
            cachePath,
            dataProtectionScope: Ext.DataProtectionScope.CurrentUser,
            serviceName: "beep-m365",
            usePlaintextFileOnLinux: false,
          });
          return O.some<ICachePlugin>(new Ext.PersistenceCachePlugin(persistence));
        },
        catch: (cause) => M365Error.fromReason("config", { cause }),
      }),
  });

const parseRedirect = (redirectUri: string): { readonly host: string; readonly port: number } => {
  const url = new URL(redirectUri);
  return { host: url.hostname, port: url.port.length > 0 ? Number(url.port) : 0 };
};

const acquireLoopback = (runtime: M365AuthRuntime): Effect.Effect<LoopbackCapture, M365Error, Scope.Scope> =>
  Effect.gen(function* () {
    const { host, port } = parseRedirect(runtime.resolved.redirectUri);

    let settle: ((effect: Effect.Effect<string, M365Error>) => void) | undefined;
    let pending: Effect.Effect<string, M365Error> | undefined;
    let delivered = false;
    const deliver = (effect: Effect.Effect<string, M365Error>): void => {
      if (delivered) return;
      delivered = true;
      if (settle !== undefined) settle(effect);
      else pending = effect;
    };

    const server = runtime.nodeHttp.createServer((request, response) => {
      const requestUrl = new URL(request.url ?? "/", `http://${host}`);
      const code = requestUrl.searchParams.get("code");
      const errorParam = requestUrl.searchParams.get("error");
      if (errorParam !== null) {
        response.statusCode = 400;
        response.end(SIGN_IN_FAILED);
        deliver(M365Error.failEffectFromReason("auth", { cause: errorParam }));
      } else if (code !== null) {
        response.statusCode = 200;
        response.end(SIGN_IN_OK);
        deliver(Effect.succeed(code));
      } else {
        response.statusCode = 200;
        response.end(WAITING);
      }
    });

    const boundPort = yield* Effect.acquireRelease(
      Effect.async<number, M365Error>((resume) => {
        server.once("error", (cause) => resume(M365Error.failEffectFromReason("auth", { cause })));
        server.listen(port, host, () => {
          const address = server.address();
          resume(Effect.succeed(typeof address === "object" && address !== null ? address.port : port));
        });
      }),
      () => Effect.sync(() => server.close())
    );

    const redirectUri = `http://${host}:${boundPort}`;
    const awaitCode = Effect.async<string, M365Error>((resume) => {
      if (pending !== undefined) resume(pending);
      else settle = resume;
    });

    return { redirectUri, awaitCode };
  });

const interactiveAcquire = (runtime: M365AuthRuntime): Effect.Effect<AuthenticationResult, M365Error> =>
  Effect.scoped(
    Effect.gen(function* () {
      const pkce = yield* Effect.tryPromise({
        try: () => runtime.crypto.generatePkceCodes(),
        catch: (cause) => M365Error.fromReason("auth", { cause }),
      });
      const loopback = yield* acquireLoopback(runtime);
      const authUrl = yield* Effect.tryPromise({
        try: () =>
          runtime.pca.getAuthCodeUrl({
            codeChallenge: pkce.challenge,
            codeChallengeMethod: "S256",
            redirectUri: loopback.redirectUri,
            scopes: [...runtime.resolved.scopes],
          }),
        catch: (cause) => M365Error.fromReason("auth", { cause }),
      });
      yield* Effect.logInfo(`Open the following URL to sign in to Microsoft 365:\n${authUrl}`);
      const code = yield* loopback.awaitCode;
      return yield* Effect.tryPromise({
        try: () =>
          runtime.pca.acquireTokenByCode({
            code,
            codeVerifier: pkce.verifier,
            redirectUri: loopback.redirectUri,
            scopes: [...runtime.resolved.scopes],
          }),
        catch: (cause) => M365Error.fromReason("auth", { cause }),
      });
    })
  );

const acquireTokenEffect = (runtime: M365AuthRuntime): Effect.Effect<Redacted.Redacted<string>, M365Error> =>
  Effect.gen(function* () {
    const accounts = yield* Effect.tryPromise({
      try: () => runtime.pca.getTokenCache().getAllAccounts(),
      catch: (cause) => M365Error.fromReason("auth", { cause }),
    });
    const result = yield* pipe(
      A.head(accounts),
      O.match({
        onNone: () => interactiveAcquire(runtime),
        onSome: (account) =>
          Effect.tryPromise({
            try: () => runtime.pca.acquireTokenSilent({ account, scopes: [...runtime.resolved.scopes] }),
            catch: (cause) => M365Error.fromReason("auth", { cause }),
          }).pipe(Effect.catchAll(() => interactiveAcquire(runtime))),
      })
    );
    return Redacted.make(result.accessToken);
  }).pipe(Effect.withSpan("M365Auth.acquireToken"));

/**
 * The token-provider contract consumed by the {@link M365} service: a
 * re-runnable Effect yielding a redacted Graph access token (silent when a
 * cached account exists, interactive otherwise).
 *
 * @example
 * ```ts
 * import type { M365AuthShape } from "@beep/m365"
 * import { Effect, Redacted } from "effect"
 *
 * const auth = { acquireToken: Effect.succeed(Redacted.make("token")) } satisfies M365AuthShape
 * console.log(auth)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export type M365AuthShape = {
  readonly acquireToken: Effect.Effect<Redacted.Redacted<string>, M365Error>;
};

/**
 * Delegated Microsoft Graph token provider service.
 *
 * @example
 * ```ts
 * import { M365Auth } from "@beep/m365"
 * import { Redacted } from "effect"
 *
 * const layer = M365Auth.layerStatic(Redacted.make("graph-access-token"))
 * console.log(layer)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class M365Auth extends Context.Service<M365Auth, M365AuthShape>()($I`M365Auth`) {
  /**
   * Build a token provider that returns a fixed token. Use for tests or when an
   * external component already minted a delegated Graph token.
   *
   * @example
   * ```ts
   * import { M365Auth } from "@beep/m365"
   * import { Redacted } from "effect"
   *
   * const layer = M365Auth.layerStatic(Redacted.make("graph-access-token"))
   * console.log(layer)
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly layerStatic = (token: Redacted.Redacted<string>): Layer.Layer<M365Auth> =>
    Layer.succeed(M365Auth, M365Auth.of({ acquireToken: Effect.succeed(token) }));

  /**
   * Build the live MSAL-backed token provider (auth-code + PKCE, silent refresh,
   * encrypted cache when `tokenCachePath` is configured).
   *
   * @example
   * ```ts
   * import { M365Auth, M365ConfigInput } from "@beep/m365"
   *
   * const layer = M365Auth.makeLayer(
   *   M365ConfigInput.make({ tenantId: "common", clientId: "client-id" })
   * )
   * console.log(layer)
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly makeLayer = (config: M365ConfigInput): Layer.Layer<M365Auth, M365Error> =>
    Layer.effect(
      M365Auth,
      Effect.gen(function* () {
        const resolved = resolveM365Config(config);
        const Msal = yield* importMsalNode;
        const nodeHttp = yield* importNodeHttp;
        const cachePlugin = yield* buildCachePlugin(resolved);
        const pca = new Msal.PublicClientApplication({
          auth: { authority: resolved.authority, clientId: resolved.clientId },
          cache: O.match(cachePlugin, {
            onNone: () => ({}),
            onSome: (plugin) => ({ cachePlugin: plugin }),
          }),
          system: {
            loggerOptions: {
              logLevel: Msal.LogLevel.Error,
              loggerCallback: () => {},
              piiLoggingEnabled: false,
            },
          },
        });
        const crypto = new Msal.CryptoProvider();
        return M365Auth.of({ acquireToken: acquireTokenEffect({ crypto, nodeHttp, pca, resolved }) });
      })
    );
}
