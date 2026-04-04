/**
 * Gateway, discovery, canvas, and talk configuration models for `@beep/clawhole`.
 *
 * This module ports the OpenClaw gateway config surface to the repository's
 * schema-first conventions while preserving the original encoded payload shape.
 *
 * @module @beep/clawhole/config/Gateway
 * @since 0.0.0
 */
import { $ClawholeId } from "@beep/identity";
import { ArrayOfStrings, FilePath, LiteralKit, NonNegativeInt, PosInt, SchemaUtils } from "@beep/schema";
import { flow, pipe } from "effect";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { SecretInput } from "./Secrets.ts";

const $I = $ClawholeId.create("config/Gateway");

const normalizeTalkProvider = flow(Str.trim, Str.toLowerCase);

const TalkVoiceAliasMap = S.Record(S.String, S.String).pipe(
  $I.annoteSchema("TalkVoiceAliasMap", {
    description: "A mapping from user-facing Talk voice aliases to provider voice identifiers.",
  })
);

const TalkProviderConfigFields = {
  voiceId: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Default voice identifier for the provider's Talk implementation.",
  }),
  voiceAliases: S.OptionFromOptionalKey(TalkVoiceAliasMap).annotateKey({
    description: "Optional mapping of voice aliases to provider-specific voice identifiers.",
  }),
  modelId: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Default provider model identifier for Talk synthesis.",
  }),
  outputFormat: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Default provider output format for Talk synthesis.",
  }),
  apiKey: S.OptionFromOptionalKey(SecretInput).annotateKey({
    description: "Optional provider API key used for Talk requests.",
  }),
};

const TalkProviderConfigRecord = S.Record(
  S.String,
  S.suspend(() => TalkProviderConfig)
).pipe(
  $I.annoteSchema("TalkProviderConfigRecord", {
    description: "Talk provider configurations keyed by provider identifier.",
  })
);

const TalkConfigFields = {
  provider: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Active Talk TTS provider identifier.",
  }),
  providers: S.OptionFromOptionalKey(TalkProviderConfigRecord).annotateKey({
    description: "Provider-specific Talk configuration keyed by provider identifier.",
  }),
  interruptOnSpeech: S.OptionFromOptionalKey(S.Boolean).annotateKey({
    description: "Whether Talk mode stops speaking when the user starts talking.",
  }),
  silenceTimeoutMs: S.OptionFromOptionalKey(PosInt).annotateKey({
    description: "Milliseconds of user silence before Talk mode sends a transcript after a pause.",
  }),
  voiceId: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Legacy compatibility voice identifier kept during Talk config rollout.",
  }),
  voiceAliases: S.OptionFromOptionalKey(TalkVoiceAliasMap).annotateKey({
    description: "Legacy compatibility voice alias mapping kept during Talk config rollout.",
  }),
  modelId: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Legacy compatibility provider model identifier kept during Talk config rollout.",
  }),
  outputFormat: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Legacy compatibility provider output format kept during Talk config rollout.",
  }),
  apiKey: S.OptionFromOptionalKey(SecretInput).annotateKey({
    description: "Legacy compatibility provider API key kept during Talk config rollout.",
  }),
};

const StrictTransportSecurityValue = S.Union([S.String, S.Literal(false)]).pipe(
  $I.annoteSchema("StrictTransportSecurityValue", {
    description: "A Strict-Transport-Security header value string, or `false` to disable the header explicitly.",
  })
);

const RequiredTrustedProxyUserHeader = S.NonEmptyString.pipe(
  $I.annoteSchema("RequiredTrustedProxyUserHeader", {
    description: "A non-empty trusted-proxy header name used to carry the authenticated user identity.",
  })
);

const talkProviderReferenceIsValid = (value: {
  readonly provider: O.Option<string>;
  readonly providers: O.Option<Readonly<Record<string, TalkProviderConfig>>>;
}): boolean => {
  const provider = pipe(value.provider, O.map(normalizeTalkProvider), O.filter(Str.isNonEmpty));

  return pipe(
    value.providers,
    O.match({
      onNone: () => true,
      onSome: (providers) =>
        pipe(
          provider,
          O.match({
            onNone: () => R.size(providers) <= 1,
            onSome: (providerId) => R.has(providers, providerId),
          })
        ),
    })
  );
};

const TalkConfigConsistencyCheck = S.makeFilter(talkProviderReferenceIsValid, {
  identifier: $I`TalkConfigConsistencyCheck`,
  title: "Talk Config Consistency",
  description: "Checks that the active Talk provider reference matches the configured provider entries.",
  message:
    "Talk config provider selection must reference a configured provider, or a single provider must be configured.",
});

const gatewayChannelHealthThresholdIsValid = (value: {
  readonly channelHealthCheckMinutes: O.Option<number>;
  readonly channelStaleEventThresholdMinutes: O.Option<number>;
}): boolean =>
  pipe(
    value.channelStaleEventThresholdMinutes,
    O.match({
      onNone: () => true,
      onSome: (staleThreshold) => {
        const effectiveHealthCheckMinutes = pipe(
          value.channelHealthCheckMinutes,
          O.getOrElse(() => 5)
        );
        return effectiveHealthCheckMinutes === 0 || staleThreshold >= effectiveHealthCheckMinutes;
      },
    })
  );

const GatewayChannelHealthThresholdCheck = S.makeFilter(gatewayChannelHealthThresholdIsValid, {
  identifier: $I`GatewayChannelHealthThresholdCheck`,
  title: "Gateway Channel Health Threshold",
  description:
    "Checks that the stale-event threshold is not lower than the active health-check interval when health checks are enabled.",
  message:
    "Gateway channel stale-event threshold must be greater than or equal to the health-check interval when health checks are enabled.",
});

const gatewayUrlFetchFields = (allowUrlDescription: string) => ({
  allowUrl: S.OptionFromOptionalKey(S.Boolean).annotateKey({
    description: allowUrlDescription,
  }),
  urlAllowlist: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
    description: "Optional hostname allowlist used for URL fetches.",
  }),
  allowedMimes: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
    description: "Allowed MIME types for fetched content.",
  }),
  maxBytes: S.OptionFromOptionalKey(PosInt).annotateKey({
    description: "Maximum decoded bytes accepted per fetched asset.",
  }),
  maxRedirects: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
    description: "Maximum redirects permitted when fetching a remote asset.",
  }),
  timeoutMs: S.OptionFromOptionalKey(PosInt).annotateKey({
    description: "Timeout in milliseconds for remote asset fetches.",
  }),
});

/**
 * Gateway bind mode values.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const GatewayBindMode = LiteralKit(["auto", "lan", "loopback", "custom", "tailnet"]).pipe(
  $I.annoteSchema("GatewayBindMode", {
    description: "Gateway bind-address policy values used to control listener interface exposure.",
  })
);

/**
 * Type of {@link GatewayBindMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type GatewayBindMode = typeof GatewayBindMode.Type;

/**
 * Discovery broadcast mode values for mDNS / Bonjour.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const MdnsDiscoveryMode = LiteralKit(["off", "minimal", "full"]).pipe(
  $I.annoteSchema("MdnsDiscoveryMode", {
    description: "mDNS / Bonjour discovery broadcast modes for the discovery subsystem.",
  })
);

/**
 * Type of {@link MdnsDiscoveryMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type MdnsDiscoveryMode = typeof MdnsDiscoveryMode.Type;

/**
 * Active Talk provider configuration with provider-specific extension fields.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const TalkProviderConfig = S.StructWithRest(S.Struct(TalkProviderConfigFields), [
  S.Record(S.String, S.Unknown),
]).pipe(
  $I.annoteSchema("TalkProviderConfig", {
    description:
      "Talk provider configuration with canonical Talk fields plus arbitrary provider-specific extension values.",
  })
);

/**
 * Type of {@link TalkProviderConfig}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type TalkProviderConfig = typeof TalkProviderConfig.Type;

/**
 * Active Talk provider details resolved from the current Talk config payload.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class ResolvedTalkConfig extends S.Class<ResolvedTalkConfig>($I`ResolvedTalkConfig`)(
  {
    provider: S.String.annotateKey({
      description: "Active Talk provider identifier resolved from the current Talk config payload.",
    }),
    config: TalkProviderConfig.annotateKey({
      description: "Provider config for the active Talk provider.",
    }),
  },
  $I.annote("ResolvedTalkConfig", {
    description: "Canonical resolved Talk provider payload.",
  })
) {}

/**
 * Top-level Talk configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const TalkConfig = S.Struct(TalkConfigFields)
  .check(TalkConfigConsistencyCheck)
  .pipe(
    $I.annoteSchema("TalkConfig", {
      description:
        "Top-level Talk configuration including provider selection, provider map, and legacy compatibility fields.",
    })
  );

/**
 * Type of {@link TalkConfig}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type TalkConfig = typeof TalkConfig.Type;

/**
 * Talk configuration response payload returned to clients.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const TalkConfigResponse = S.Struct({
  ...TalkConfigFields,
  resolved: S.OptionFromOptionalKey(ResolvedTalkConfig).annotateKey({
    description: "Canonical active Talk payload for clients.",
  }),
})
  .check(TalkConfigConsistencyCheck)
  .pipe(
    $I.annoteSchema("TalkConfigResponse", {
      description: "Talk config payload extended with the canonical resolved Talk provider payload for clients.",
    })
  );

/**
 * Type of {@link TalkConfigResponse}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type TalkConfigResponse = typeof TalkConfigResponse.Type;

/**
 * Gateway auth mode values.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const GatewayAuthMode = LiteralKit(["none", "token", "password", "trusted-proxy"]).pipe(
  $I.annoteSchema("GatewayAuthMode", {
    description: "Authentication modes supported by the Gateway HTTP and WebSocket surfaces.",
  })
);

/**
 * Type of {@link GatewayAuthMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type GatewayAuthMode = typeof GatewayAuthMode.Type;

/**
 * Gateway Tailscale exposure mode values.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const GatewayTailscaleMode = LiteralKit(["off", "serve", "funnel"]).pipe(
  $I.annoteSchema("GatewayTailscaleMode", {
    description: "Tailscale publish modes used to expose the Gateway control UI.",
  })
);

/**
 * Type of {@link GatewayTailscaleMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type GatewayTailscaleMode = typeof GatewayTailscaleMode.Type;

/**
 * Gateway reload strategy values.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const GatewayReloadMode = LiteralKit(["off", "restart", "hot", "hybrid"]).pipe(
  $I.annoteSchema("GatewayReloadMode", {
    description: "Config reload strategies supported by the Gateway runtime.",
  })
);

/**
 * Type of {@link GatewayReloadMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type GatewayReloadMode = typeof GatewayReloadMode.Type;

/**
 * Gateway runtime mode values.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const GatewayMode = LiteralKit(["local", "remote"]).pipe(
  $I.annoteSchema("GatewayMode", {
    description: "Gateway runtime modes controlling whether the local runtime starts or proxies to a remote gateway.",
  })
);

/**
 * Type of {@link GatewayMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type GatewayMode = typeof GatewayMode.Type;

/**
 * Transport values for remote Gateway connections.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const GatewayRemoteTransport = LiteralKit(["ssh", "direct"]).pipe(
  $I.annoteSchema("GatewayRemoteTransport", {
    description: "Transport modes supported for remote Gateway connections.",
  })
);

/**
 * Type of {@link GatewayRemoteTransport}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type GatewayRemoteTransport = typeof GatewayRemoteTransport.Type;

/**
 * Browser routing mode values for Gateway node-hosted browser proxies.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const GatewayNodeBrowserMode = LiteralKit(["auto", "manual", "off"]).pipe(
  $I.annoteSchema("GatewayNodeBrowserMode", {
    description: "Browser routing modes for node-hosted browser proxies exposed through the Gateway.",
  })
);

/**
 * Type of {@link GatewayNodeBrowserMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type GatewayNodeBrowserMode = typeof GatewayNodeBrowserMode.Type;

/**
 * Wide-area discovery configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class WideAreaDiscoveryConfig extends S.Class<WideAreaDiscoveryConfig>($I`WideAreaDiscoveryConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether wide-area DNS-SD discovery is enabled.",
    }),
    domain: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional unicast DNS-SD domain.",
    }),
  },
  $I.annote("WideAreaDiscoveryConfig", {
    description: "Wide-area service discovery configuration for unicast DNS-SD.",
  })
) {}

/**
 * mDNS discovery configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class MdnsDiscoveryConfig extends S.Class<MdnsDiscoveryConfig>($I`MdnsDiscoveryConfig`)(
  {
    mode: S.OptionFromOptionalKey(MdnsDiscoveryMode).annotateKey({
      description: "mDNS / Bonjour discovery broadcast mode.",
    }),
  },
  $I.annote("MdnsDiscoveryConfig", {
    description: "mDNS / Bonjour discovery configuration for local service advertisements.",
  })
) {}

/**
 * Top-level discovery configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class DiscoveryConfig extends S.Class<DiscoveryConfig>($I`DiscoveryConfig`)(
  {
    wideArea: S.OptionFromOptionalKey(WideAreaDiscoveryConfig).annotateKey({
      description: "Wide-area DNS-SD discovery configuration.",
    }),
    mdns: S.OptionFromOptionalKey(MdnsDiscoveryConfig).annotateKey({
      description: "mDNS / Bonjour discovery configuration.",
    }),
  },
  $I.annote("DiscoveryConfig", {
    description: "Top-level discovery configuration covering wide-area and mDNS service discovery.",
  })
) {}

/**
 * Static canvas host configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class CanvasHostConfig extends S.Class<CanvasHostConfig>($I`CanvasHostConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the canvas host is enabled.",
    }),
    root: S.OptionFromOptionalKey(FilePath).annotateKey({
      description: "Directory served by the canvas host.",
    }),
    port: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "HTTP port used by the canvas host listener.",
    }),
    liveReload: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether live-reload file watching and websocket reloads are enabled.",
    }),
  },
  $I.annote("CanvasHostConfig", {
    description: "Static canvas host configuration for serving workspace canvas content.",
  })
) {}

/**
 * Gateway Control UI hosting configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayControlUiConfig extends S.Class<GatewayControlUiConfig>($I`GatewayControlUiConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the Gateway serves the Control UI.",
    }),
    basePath: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional base path prefix for the Control UI.",
    }),
    root: S.OptionFromOptionalKey(FilePath).annotateKey({
      description: "Optional filesystem root for Control UI assets.",
    }),
    allowedOrigins: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
      description: "Allowed browser origins for Control UI and WebChat websocket connections.",
    }),
    dangerouslyAllowHostHeaderOriginFallback: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether Host-header origin fallback remains enabled for Control UI origin checks.",
    }),
    allowInsecureAuth: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether Control UI auth checks may run in the insecure compatibility mode.",
    }),
    dangerouslyDisableDeviceAuth: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether Control UI device identity checks are disabled.",
    }),
  },
  $I.annote("GatewayControlUiConfig", {
    description: "Gateway Control UI hosting and browser-origin hardening configuration.",
  })
) {}

/**
 * Trusted reverse proxy authentication configuration for the Gateway.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayTrustedProxyConfig extends S.Class<GatewayTrustedProxyConfig>($I`GatewayTrustedProxyConfig`)(
  {
    userHeader: RequiredTrustedProxyUserHeader.annotateKey({
      description: "Header name containing the authenticated user identity.",
    }),
    requiredHeaders: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
      description: "Additional headers that must be present for the request to be trusted.",
    }),
    allowUsers: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
      description: "Optional allowlist of proxy-authenticated user identities permitted to access the Gateway.",
    }),
  },
  $I.annote("GatewayTrustedProxyConfig", {
    description: "Trusted reverse proxy authentication settings for identity-aware proxy deployments.",
  })
) {}

/**
 * Authentication rate-limit configuration for Gateway auth failures.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayAuthRateLimitConfig extends S.Class<GatewayAuthRateLimitConfig>($I`GatewayAuthRateLimitConfig`)(
  {
    maxAttempts: S.OptionFromOptionalKey(S.Number).annotateKey({
      description: "Maximum failed authentication attempts per client IP before blocking.",
    }),
    windowMs: S.OptionFromOptionalKey(S.Number).annotateKey({
      description: "Sliding-window duration in milliseconds for failed authentication attempts.",
    }),
    lockoutMs: S.OptionFromOptionalKey(S.Number).annotateKey({
      description: "Lockout duration in milliseconds after the auth failure limit is exceeded.",
    }),
    exemptLoopback: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether loopback addresses are exempt from auth rate limiting.",
    }),
  },
  $I.annote("GatewayAuthRateLimitConfig", {
    description: "Rate-limit settings for failed Gateway authentication attempts.",
  })
) {}

/**
 * Gateway authentication configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayAuthConfig extends S.Class<GatewayAuthConfig>($I`GatewayAuthConfig`)(
  {
    mode: S.OptionFromOptionalKey(GatewayAuthMode).annotateKey({
      description: "Authentication mode used for Gateway connections.",
    }),
    token: S.OptionFromOptionalKey(SecretInput).annotateKey({
      description: "Shared token used for token auth mode.",
    }),
    password: S.OptionFromOptionalKey(SecretInput).annotateKey({
      description: "Shared password used for password auth mode.",
    }),
    allowTailscale: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether trusted Tailscale identity headers may satisfy Gateway auth checks.",
    }),
    rateLimit: S.OptionFromOptionalKey(GatewayAuthRateLimitConfig).annotateKey({
      description: "Rate-limit configuration for failed authentication attempts.",
    }),
    trustedProxy: S.OptionFromOptionalKey(GatewayTrustedProxyConfig).annotateKey({
      description: "Trusted reverse proxy authentication settings for trusted-proxy mode.",
    }),
  },
  $I.annote("GatewayAuthConfig", {
    description: "Gateway authentication policy including shared credentials, trusted proxy settings, and throttling.",
  })
) {}

/**
 * Gateway Tailscale integration configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayTailscaleConfig extends S.Class<GatewayTailscaleConfig>($I`GatewayTailscaleConfig`)(
  {
    mode: S.OptionFromOptionalKey(GatewayTailscaleMode).annotateKey({
      description: "Tailscale exposure mode for the Gateway control UI.",
    }),
    resetOnExit: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether Tailscale serve or funnel configuration resets on shutdown.",
    }),
  },
  $I.annote("GatewayTailscaleConfig", {
    description: "Gateway Tailscale exposure and lifecycle configuration.",
  })
) {}

/**
 * Remote Gateway connection configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayRemoteConfig extends S.Class<GatewayRemoteConfig>($I`GatewayRemoteConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether remote Gateway surfaces are enabled.",
    }),
    url: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Remote Gateway WebSocket URL.",
    }),
    transport: S.OptionFromOptionalKey(GatewayRemoteTransport).annotateKey({
      description: "Transport used for remote Gateway connections.",
    }),
    token: S.OptionFromOptionalKey(SecretInput).annotateKey({
      description: "Token used for remote Gateway auth when token auth is required.",
    }),
    password: S.OptionFromOptionalKey(SecretInput).annotateKey({
      description: "Password used for remote Gateway auth when password auth is required.",
    }),
    tlsFingerprint: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Expected TLS certificate fingerprint for the remote Gateway.",
    }),
    sshTarget: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "SSH target used when tunneling the remote Gateway.",
    }),
    sshIdentity: S.OptionFromOptionalKey(FilePath).annotateKey({
      description: "SSH identity file path used when tunneling the remote Gateway.",
    }),
  },
  $I.annote("GatewayRemoteConfig", {
    description: "Remote Gateway connection settings for direct websocket and SSH-tunneled operation.",
  })
) {}

/**
 * Gateway config reload behavior.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayReloadConfig extends S.Class<GatewayReloadConfig>($I`GatewayReloadConfig`)(
  {
    mode: S.OptionFromOptionalKey(GatewayReloadMode).annotateKey({
      description: "Reload strategy used when Gateway config changes are detected.",
    }),
    debounceMs: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Debounce window in milliseconds for Gateway config reloads.",
    }),
    deferralTimeoutMs: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Maximum deferral time in milliseconds before forcing a restart for pending operations.",
    }),
  },
  $I.annote("GatewayReloadConfig", {
    description: "Gateway config reload strategy and timing controls.",
  })
) {}

/**
 * TLS configuration for the Gateway server.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayTlsConfig extends S.Class<GatewayTlsConfig>($I`GatewayTlsConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether TLS termination is enabled for the Gateway listener.",
    }),
    autoGenerate: SchemaUtils.withKeyDefaults(S.Boolean, true).annotateKey({
      description: "Whether a self-signed certificate is auto-generated when explicit cert and key files are missing.",
      default: true,
    }),
    certPath: S.OptionFromOptionalKey(FilePath).annotateKey({
      description: "PEM certificate path for the Gateway server.",
    }),
    keyPath: S.OptionFromOptionalKey(FilePath).annotateKey({
      description: "PEM private key path for the Gateway server.",
    }),
    caPath: S.OptionFromOptionalKey(FilePath).annotateKey({
      description: "Optional PEM CA bundle path for TLS clients.",
    }),
  },
  $I.annote("GatewayTlsConfig", {
    description: "TLS certificate, key, and auto-generation settings for the Gateway server.",
  })
) {}

/**
 * Image URL fetch controls for `/v1/chat/completions`.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayHttpChatCompletionsImagesConfig extends S.Class<GatewayHttpChatCompletionsImagesConfig>(
  $I`GatewayHttpChatCompletionsImagesConfig`
)(
  gatewayUrlFetchFields("Whether URL fetches are allowed for `image_url` parts."),
  $I.annote("GatewayHttpChatCompletionsImagesConfig", {
    description: "Image URL fetch controls for the Gateway `/v1/chat/completions` endpoint.",
  })
) {}

/**
 * `/v1/chat/completions` endpoint configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayHttpChatCompletionsConfig extends S.Class<GatewayHttpChatCompletionsConfig>(
  $I`GatewayHttpChatCompletionsConfig`
)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the Gateway serves `POST /v1/chat/completions`.",
    }),
    maxBodyBytes: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Maximum request body size in bytes for `/v1/chat/completions`.",
    }),
    maxImageParts: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Maximum number of `image_url` parts processed from the latest user message.",
    }),
    maxTotalImageBytes: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Maximum cumulative decoded image bytes across all `image_url` parts in one request.",
    }),
    images: S.OptionFromOptionalKey(GatewayHttpChatCompletionsImagesConfig).annotateKey({
      description: "Image input controls for `image_url` parts.",
    }),
  },
  $I.annote("GatewayHttpChatCompletionsConfig", {
    description: "OpenAI-compatible `/v1/chat/completions` endpoint settings for the Gateway HTTP surface.",
  })
) {}

/**
 * PDF handling configuration for `/v1/responses` file inputs.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayHttpResponsesPdfConfig extends S.Class<GatewayHttpResponsesPdfConfig>(
  $I`GatewayHttpResponsesPdfConfig`
)(
  {
    maxPages: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Maximum pages parsed or rendered from a PDF input.",
    }),
    maxPixels: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Maximum pixels rendered per PDF page.",
    }),
    minTextChars: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Minimum extracted text length required to skip PDF rasterization.",
    }),
  },
  $I.annote("GatewayHttpResponsesPdfConfig", {
    description: "PDF parsing and rendering limits for Gateway `/v1/responses` file inputs.",
  })
) {}

/**
 * File input controls for `/v1/responses`.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayHttpResponsesFilesConfig extends S.Class<GatewayHttpResponsesFilesConfig>(
  $I`GatewayHttpResponsesFilesConfig`
)(
  {
    ...gatewayUrlFetchFields("Whether URL fetches are allowed for `input_file` parts."),
    maxChars: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Maximum decoded characters accepted per fetched file.",
    }),
    pdf: S.OptionFromOptionalKey(GatewayHttpResponsesPdfConfig).annotateKey({
      description: "PDF handling configuration for `application/pdf` inputs.",
    }),
  },
  $I.annote("GatewayHttpResponsesFilesConfig", {
    description: "File input controls for the Gateway `/v1/responses` endpoint.",
  })
) {}

/**
 * Image input controls for `/v1/responses`.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayHttpResponsesImagesConfig extends S.Class<GatewayHttpResponsesImagesConfig>(
  $I`GatewayHttpResponsesImagesConfig`
)(
  gatewayUrlFetchFields("Whether URL fetches are allowed for `input_image` parts."),
  $I.annote("GatewayHttpResponsesImagesConfig", {
    description: "Image input controls for the Gateway `/v1/responses` endpoint.",
  })
) {}

/**
 * `/v1/responses` endpoint configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayHttpResponsesConfig extends S.Class<GatewayHttpResponsesConfig>($I`GatewayHttpResponsesConfig`)(
  {
    enabled: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the Gateway serves `POST /v1/responses`.",
    }),
    maxBodyBytes: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Maximum request body size in bytes for `/v1/responses`.",
    }),
    maxUrlParts: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
      description: "Maximum number of URL-based input parts accepted per request.",
    }),
    files: S.OptionFromOptionalKey(GatewayHttpResponsesFilesConfig).annotateKey({
      description: "File input controls for `input_file` parts.",
    }),
    images: S.OptionFromOptionalKey(GatewayHttpResponsesImagesConfig).annotateKey({
      description: "Image input controls for `input_image` parts.",
    }),
  },
  $I.annote("GatewayHttpResponsesConfig", {
    description: "OpenResponses `/v1/responses` endpoint settings for the Gateway HTTP surface.",
  })
) {}

/**
 * Gateway HTTP endpoint configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayHttpEndpointsConfig extends S.Class<GatewayHttpEndpointsConfig>($I`GatewayHttpEndpointsConfig`)(
  {
    chatCompletions: S.OptionFromOptionalKey(GatewayHttpChatCompletionsConfig).annotateKey({
      description: "Configuration for the OpenAI-compatible `/v1/chat/completions` endpoint.",
    }),
    responses: S.OptionFromOptionalKey(GatewayHttpResponsesConfig).annotateKey({
      description: "Configuration for the OpenResponses `/v1/responses` endpoint.",
    }),
  },
  $I.annote("GatewayHttpEndpointsConfig", {
    description: "Grouped Gateway HTTP endpoint toggles and request-shape limits.",
  })
) {}

/**
 * Gateway HTTP security header configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayHttpSecurityHeadersConfig extends S.Class<GatewayHttpSecurityHeadersConfig>(
  $I`GatewayHttpSecurityHeadersConfig`
)(
  {
    strictTransportSecurity: S.OptionFromOptionalKey(StrictTransportSecurityValue).annotateKey({
      description: "Strict-Transport-Security response header value, or `false` to disable it explicitly.",
    }),
  },
  $I.annote("GatewayHttpSecurityHeadersConfig", {
    description: "Gateway-managed HTTP security headers applied to Gateway HTTP responses.",
  })
) {}

/**
 * Gateway HTTP API configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayHttpConfig extends S.Class<GatewayHttpConfig>($I`GatewayHttpConfig`)(
  {
    endpoints: S.OptionFromOptionalKey(GatewayHttpEndpointsConfig).annotateKey({
      description: "Gateway HTTP endpoint configuration.",
    }),
    securityHeaders: S.OptionFromOptionalKey(GatewayHttpSecurityHeadersConfig).annotateKey({
      description: "Gateway-managed HTTP security header configuration.",
    }),
  },
  $I.annote("GatewayHttpConfig", {
    description: "Gateway HTTP API configuration covering endpoint exposure and response security headers.",
  })
) {}

/**
 * APNs relay configuration for Gateway push delivery.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayPushApnsRelayConfig extends S.Class<GatewayPushApnsRelayConfig>($I`GatewayPushApnsRelayConfig`)(
  {
    baseUrl: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Base HTTPS URL for the external APNs relay service.",
    }),
    timeoutMs: S.OptionFromOptionalKey(PosInt).annotateKey({
      description: "Timeout in milliseconds for APNs relay send requests.",
    }),
  },
  $I.annote("GatewayPushApnsRelayConfig", {
    description: "External APNs relay settings used by Gateway push delivery.",
  })
) {}

/**
 * APNs push configuration for the Gateway.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayPushApnsConfig extends S.Class<GatewayPushApnsConfig>($I`GatewayPushApnsConfig`)(
  {
    relay: S.OptionFromOptionalKey(GatewayPushApnsRelayConfig).annotateKey({
      description: "External APNs relay configuration.",
    }),
  },
  $I.annote("GatewayPushApnsConfig", {
    description: "Gateway APNs push delivery configuration.",
  })
) {}

/**
 * Top-level Gateway push delivery configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayPushConfig extends S.Class<GatewayPushConfig>($I`GatewayPushConfig`)(
  {
    apns: S.OptionFromOptionalKey(GatewayPushApnsConfig).annotateKey({
      description: "APNs push delivery configuration.",
    }),
  },
  $I.annote("GatewayPushConfig", {
    description: "Top-level Gateway push delivery settings.",
  })
) {}

/**
 * Browser routing policy for node-hosted browser proxies exposed by the Gateway.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayNodesBrowserConfig extends S.Class<GatewayNodesBrowserConfig>($I`GatewayNodesBrowserConfig`)(
  {
    mode: S.OptionFromOptionalKey(GatewayNodeBrowserMode).annotateKey({
      description: "Browser routing mode for node-hosted browser proxies.",
    }),
    node: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Specific node identifier or name pinned for browser routing.",
    }),
  },
  $I.annote("GatewayNodesBrowserConfig", {
    description: "Browser routing policy for node-hosted browser proxies behind the Gateway.",
  })
) {}

/**
 * Gateway node access configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayNodesConfig extends S.Class<GatewayNodesConfig>($I`GatewayNodesConfig`)(
  {
    browser: S.OptionFromOptionalKey(GatewayNodesBrowserConfig).annotateKey({
      description: "Browser routing policy for node-hosted browser proxies.",
    }),
    allowCommands: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
      description: "Additional `node.invoke` commands explicitly allowed on the Gateway.",
    }),
    denyCommands: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
      description: "Commands denied even if they appear in defaults or node claims.",
    }),
  },
  $I.annote("GatewayNodesConfig", {
    description: "Gateway node-routing and node command exposure configuration.",
  })
) {}

/**
 * Gateway tool exposure configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class GatewayToolsConfig extends S.Class<GatewayToolsConfig>($I`GatewayToolsConfig`)(
  {
    deny: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
      description: "Tools denied via the Gateway HTTP `/tools/invoke` endpoint.",
    }),
    allow: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
      description: "Tools explicitly allowed via the Gateway HTTP `/tools/invoke` endpoint.",
    }),
  },
  $I.annote("GatewayToolsConfig", {
    description: "Gateway-level allow and deny lists for HTTP tool exposure.",
  })
) {}

const GatewayConfigFields = {
  port: S.OptionFromOptionalKey(PosInt).annotateKey({
    description: "Single multiplexed port for the Gateway WebSocket and HTTP surfaces.",
  }),
  mode: S.OptionFromOptionalKey(GatewayMode).annotateKey({
    description: "Explicit Gateway runtime mode.",
  }),
  bind: S.OptionFromOptionalKey(GatewayBindMode).annotateKey({
    description: "Bind address policy for the Gateway WebSocket and Control UI HTTP listener.",
  }),
  customBindHost: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Explicit bind host or IP used when `bind` is set to `custom`.",
  }),
  controlUi: S.OptionFromOptionalKey(GatewayControlUiConfig).annotateKey({
    description: "Gateway Control UI hosting configuration.",
  }),
  auth: S.OptionFromOptionalKey(GatewayAuthConfig).annotateKey({
    description: "Gateway authentication configuration.",
  }),
  tailscale: S.OptionFromOptionalKey(GatewayTailscaleConfig).annotateKey({
    description: "Gateway Tailscale exposure configuration.",
  }),
  remote: S.OptionFromOptionalKey(GatewayRemoteConfig).annotateKey({
    description: "Remote Gateway connection configuration.",
  }),
  reload: S.OptionFromOptionalKey(GatewayReloadConfig).annotateKey({
    description: "Gateway config reload behavior.",
  }),
  tls: S.OptionFromOptionalKey(GatewayTlsConfig).annotateKey({
    description: "Gateway TLS configuration.",
  }),
  http: S.OptionFromOptionalKey(GatewayHttpConfig).annotateKey({
    description: "Gateway HTTP API configuration.",
  }),
  push: S.OptionFromOptionalKey(GatewayPushConfig).annotateKey({
    description: "Gateway push delivery configuration.",
  }),
  nodes: S.OptionFromOptionalKey(GatewayNodesConfig).annotateKey({
    description: "Gateway node routing and command exposure configuration.",
  }),
  trustedProxies: S.OptionFromOptionalKey(ArrayOfStrings).annotateKey({
    description: "Trusted reverse proxy IPs used to resolve forwarded client identities.",
  }),
  allowRealIpFallback: S.OptionFromOptionalKey(S.Boolean).annotateKey({
    description: "Whether `x-real-ip` may be used when `x-forwarded-for` is missing.",
  }),
  tools: S.OptionFromOptionalKey(GatewayToolsConfig).annotateKey({
    description: "Gateway tool exposure configuration.",
  }),
  channelHealthCheckMinutes: S.OptionFromOptionalKey(NonNegativeInt).annotateKey({
    description: "Channel health monitor interval in minutes.",
  }),
  channelStaleEventThresholdMinutes: S.OptionFromOptionalKey(PosInt).annotateKey({
    description: "Stale-event threshold in minutes used by the channel health monitor.",
  }),
  channelMaxRestartsPerHour: S.OptionFromOptionalKey(PosInt).annotateKey({
    description: "Maximum health-monitor-initiated channel restarts permitted per hour.",
  }),
};

/**
 * Top-level Gateway configuration.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const GatewayConfig = S.Struct(GatewayConfigFields)
  .check(GatewayChannelHealthThresholdCheck)
  .pipe(
    $I.annoteSchema("GatewayConfig", {
      description:
        "Top-level Gateway configuration spanning bind policy, auth, HTTP exposure, TLS, push, node routing, and health monitoring.",
    })
  );

/**
 * Type of {@link GatewayConfig}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type GatewayConfig = typeof GatewayConfig.Type;
