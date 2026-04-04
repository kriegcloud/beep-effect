/**
 * Schema-first provider request transport models for `@beep/clawhole`.
 *
 * This module ports the upstream OpenClaw provider request transport types into
 * Effect schemas while preserving the upstream wire contract for request auth,
 * proxy routing, TLS overrides, and header injection.
 *
 * @example
 * ```typescript
 * import * as O from "effect/Option"
 * import * as S from "effect/Schema"
 * import { ConfiguredProviderRequest } from "@beep/clawhole/config/ProviderRequest"
 *
 * const request = S.decodeUnknownSync(ConfiguredProviderRequest)({
 *   headers: {
 *     "X-Tenant": { source: "env", provider: "default", id: "OPENAI_TENANT_HEADER" }
 *   },
 *   auth: {
 *     mode: "authorization-bearer",
 *     token: "provider-token"
 *   },
 *   proxy: {
 *     mode: "explicit-proxy",
 *     url: "http://proxy.internal:8080"
 *   }
 * })
 *
 * console.log(O.isSome(request.auth)) // true
 * console.log(O.isSome(request.tls)) // false
 * ```
 *
 * @module @beep/clawhole/config/ProviderRequest
 * @since 0.0.0
 */
import { $ClawholeId } from "@beep/identity";
import { LiteralKit, NonEmptyTrimmedStr } from "@beep/schema";
import { Tuple } from "effect";
import * as S from "effect/Schema";
import { SecretInput } from "./Secrets.ts";

const $I = $ClawholeId.create("config/ProviderRequest");

const ConfiguredProviderRequestAuthMode = LiteralKit(["provider-default", "authorization-bearer", "header"]).pipe(
  $I.annoteSchema("ConfiguredProviderRequestAuthMode", {
    description:
      "Supported request-auth override modes: provider-default passthrough, bearer token auth, or custom header auth.",
  })
);

const ConfiguredProviderRequestProxyMode = LiteralKit(["env-proxy", "explicit-proxy"]).pipe(
  $I.annoteSchema("ConfiguredProviderRequestProxyMode", {
    description: "Supported provider-request proxy modes: environment proxy routing or an explicit proxy URL.",
  })
);

const ConfiguredProviderRequestHeaderName = NonEmptyTrimmedStr.pipe(
  $I.annoteSchema("ConfiguredProviderRequestHeaderName", {
    description: "A non-empty trimmed HTTP header name used for custom provider-request auth headers.",
  })
);

const ConfiguredProviderRequestProxyUrl = NonEmptyTrimmedStr.pipe(
  $I.annoteSchema("ConfiguredProviderRequestProxyUrl", {
    description: "A non-empty trimmed explicit proxy URL string used for outbound provider requests.",
  })
);

const ConfiguredProviderRequestHeaders = S.Record(S.String, SecretInput).pipe(
  $I.annoteSchema("ConfiguredProviderRequestHeaders", {
    description: "Additional outbound HTTP headers merged into provider requests, keyed by header name.",
  })
);

/**
 * TLS transport overrides applied to proxy or upstream provider connections.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class ConfiguredProviderRequestTls extends S.Class<ConfiguredProviderRequestTls>(
  $I`ConfiguredProviderRequestTls`
)(
  {
    ca: S.OptionFromOptionalKey(SecretInput).annotateKey({
      description: "Optional custom CA bundle used to verify the remote TLS certificate chain.",
    }),
    cert: S.OptionFromOptionalKey(SecretInput).annotateKey({
      description: "Optional client TLS certificate presented during mutual-TLS handshakes.",
    }),
    key: S.OptionFromOptionalKey(SecretInput).annotateKey({
      description: "Optional private key paired with `cert` for mutual-TLS authentication.",
    }),
    passphrase: S.OptionFromOptionalKey(SecretInput).annotateKey({
      description: "Optional passphrase used to decrypt the configured TLS private key.",
    }),
    serverName: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional SNI or server-name override used for the TLS handshake.",
    }),
    insecureSkipVerify: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether remote TLS certificate verification should be skipped for this connection.",
    }),
  },
  $I.annote("ConfiguredProviderRequestTls", {
    description:
      "TLS transport overrides applied when connecting either to an outbound proxy or directly to the upstream provider endpoint.",
  })
) {}

class ProviderDefaultConfiguredProviderRequestAuth extends S.Class<ProviderDefaultConfiguredProviderRequestAuth>(
  $I`ProviderDefaultConfiguredProviderRequestAuth`
)(
  {
    mode: S.tag("provider-default").annotateKey({
      description: "Discriminator for auth overrides that keep the provider's default auth behavior.",
    }),
  },
  $I.annote("ProviderDefaultConfiguredProviderRequestAuth", {
    description: "Auth override variant that preserves the provider's default authentication behavior.",
  })
) {}

class AuthorizationBearerConfiguredProviderRequestAuth extends S.Class<AuthorizationBearerConfiguredProviderRequestAuth>(
  $I`AuthorizationBearerConfiguredProviderRequestAuth`
)(
  {
    mode: S.tag("authorization-bearer").annotateKey({
      description: "Discriminator for auth overrides that send a bearer token in the Authorization header.",
    }),
    token: SecretInput.annotateKey({
      description: "Bearer token used when the request auth mode is `authorization-bearer`.",
    }),
  },
  $I.annote("AuthorizationBearerConfiguredProviderRequestAuth", {
    description: "Auth override variant that injects a bearer token into the outbound provider request.",
  })
) {}

class HeaderConfiguredProviderRequestAuth extends S.Class<HeaderConfiguredProviderRequestAuth>(
  $I`HeaderConfiguredProviderRequestAuth`
)(
  {
    mode: S.tag("header").annotateKey({
      description: "Discriminator for auth overrides that send credentials in a custom header.",
    }),
    headerName: ConfiguredProviderRequestHeaderName.annotateKey({
      description: "Custom header name used when the request auth mode is `header`.",
    }),
    value: SecretInput.annotateKey({
      description: "Secret header value sent when the request auth mode is `header`.",
    }),
    prefix: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional string prepended to `value` before sending the custom auth header.",
    }),
  },
  $I.annote("HeaderConfiguredProviderRequestAuth", {
    description: "Auth override variant that sends provider credentials through a custom HTTP header.",
  })
) {}

/**
 * Outbound auth override for provider requests.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ConfiguredProviderRequestAuth = ConfiguredProviderRequestAuthMode.mapMembers(
  Tuple.evolve([
    () => ProviderDefaultConfiguredProviderRequestAuth,
    () => AuthorizationBearerConfiguredProviderRequestAuth,
    () => HeaderConfiguredProviderRequestAuth,
  ])
).pipe(
  S.toTaggedUnion("mode"),
  $I.annoteSchema("ConfiguredProviderRequestAuth", {
    description:
      "Tagged union describing how a provider request should authenticate: keep provider defaults, use a bearer token, or send a custom header.",
  })
);

/**
 * Type of {@link ConfiguredProviderRequestAuth}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type ConfiguredProviderRequestAuth = typeof ConfiguredProviderRequestAuth.Type;

class EnvProxyConfiguredProviderRequestProxy extends S.Class<EnvProxyConfiguredProviderRequestProxy>(
  $I`EnvProxyConfiguredProviderRequestProxy`
)(
  {
    mode: S.tag("env-proxy").annotateKey({
      description: "Discriminator for proxy overrides that honor environment proxy settings.",
    }),
    tls: S.OptionFromOptionalKey(ConfiguredProviderRequestTls).annotateKey({
      description: "Optional TLS settings used when connecting to the environment-selected proxy.",
    }),
  },
  $I.annote("EnvProxyConfiguredProviderRequestProxy", {
    description: "Proxy override variant that routes provider traffic through environment-derived proxy settings.",
  })
) {}

class ExplicitProxyConfiguredProviderRequestProxy extends S.Class<ExplicitProxyConfiguredProviderRequestProxy>(
  $I`ExplicitProxyConfiguredProviderRequestProxy`
)(
  {
    mode: S.tag("explicit-proxy").annotateKey({
      description: "Discriminator for proxy overrides that route through a specific proxy URL.",
    }),
    url: ConfiguredProviderRequestProxyUrl.annotateKey({
      description: "Explicit proxy URL used when the request proxy mode is `explicit-proxy`.",
    }),
    tls: S.OptionFromOptionalKey(ConfiguredProviderRequestTls).annotateKey({
      description: "Optional TLS settings used when connecting to the configured explicit proxy.",
    }),
  },
  $I.annote("ExplicitProxyConfiguredProviderRequestProxy", {
    description: "Proxy override variant that routes provider requests through an explicit proxy URL.",
  })
) {}

/**
 * Proxy routing override for provider requests.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ConfiguredProviderRequestProxy = ConfiguredProviderRequestProxyMode.mapMembers(
  Tuple.evolve([() => EnvProxyConfiguredProviderRequestProxy, () => ExplicitProxyConfiguredProviderRequestProxy])
).pipe(
  S.toTaggedUnion("mode"),
  $I.annoteSchema("ConfiguredProviderRequestProxy", {
    description:
      "Tagged union describing how provider requests should use proxy routing: environment proxy configuration or an explicit proxy URL.",
  })
);

/**
 * Type of {@link ConfiguredProviderRequestProxy}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type ConfiguredProviderRequestProxy = typeof ConfiguredProviderRequestProxy.Type;

/**
 * Transport-level request overrides for outbound model or tool provider calls.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class ConfiguredProviderRequest extends S.Class<ConfiguredProviderRequest>($I`ConfiguredProviderRequest`)(
  {
    headers: S.OptionFromOptionalKey(ConfiguredProviderRequestHeaders).annotateKey({
      description: "Optional extra HTTP headers merged into outbound provider requests.",
    }),
    auth: S.OptionFromOptionalKey(ConfiguredProviderRequestAuth).annotateKey({
      description: "Optional auth override applied to the outbound provider request.",
    }),
    proxy: S.OptionFromOptionalKey(ConfiguredProviderRequestProxy).annotateKey({
      description: "Optional proxy routing override applied to the outbound provider request.",
    }),
    tls: S.OptionFromOptionalKey(ConfiguredProviderRequestTls).annotateKey({
      description: "Optional direct TLS transport overrides for the upstream provider connection.",
    }),
  },
  $I.annote("ConfiguredProviderRequest", {
    description:
      "Transport-level request overrides for outbound provider calls, including headers, auth, proxy routing, and TLS options.",
  })
) {}

/**
 * Model-provider request transport overrides.
 *
 * Upstream OpenClaw aliases this schema directly to `ConfiguredProviderRequest`.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const ConfiguredModelProviderRequest = ConfiguredProviderRequest.pipe(
  $I.annoteSchema("ConfiguredModelProviderRequest", {
    description: "Alias of `ConfiguredProviderRequest` used by model-provider configuration entries.",
  })
);

/**
 * Type of {@link ConfiguredModelProviderRequest}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type ConfiguredModelProviderRequest = typeof ConfiguredModelProviderRequest.Type;

/**
 * Check whether a value decodes as a `ConfiguredProviderRequestAuth`.
 *
 * @param value {unknown} - The value to validate as a provider request auth override.
 * @returns {boolean} - `true` when the value matches the configured provider request auth union.
 * @category Validation
 * @since 0.0.0
 */
export const isConfiguredProviderRequestAuth = (value: unknown): value is ConfiguredProviderRequestAuth =>
  S.is(ConfiguredProviderRequestAuth)(value);

/**
 * Check whether a value decodes as a `ConfiguredProviderRequestProxy`.
 *
 * @param value {unknown} - The value to validate as a provider request proxy override.
 * @returns {boolean} - `true` when the value matches the configured provider request proxy union.
 * @category Validation
 * @since 0.0.0
 */
export const isConfiguredProviderRequestProxy = (value: unknown): value is ConfiguredProviderRequestProxy =>
  S.is(ConfiguredProviderRequestProxy)(value);

/**
 * Check whether a value decodes as a `ConfiguredProviderRequest`.
 *
 * @param value {unknown} - The value to validate as a provider request transport config.
 * @returns {boolean} - `true` when the value matches the configured provider request schema.
 * @category Validation
 * @since 0.0.0
 */
export const isConfiguredProviderRequest = (value: unknown): value is ConfiguredProviderRequest =>
  S.is(ConfiguredProviderRequest)(value);
