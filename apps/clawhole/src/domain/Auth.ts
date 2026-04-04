/**
 * Schema-first auth configuration models for `@beep/clawhole`.
 *
 * This module ports the upstream OpenClaw auth config surface into repo-native
 * Effect schemas while preserving the upstream wire shape and optional-field
 * semantics.
 *
 * Runtime backoff defaults remain documented here but are not injected during
 * schema decoding because upstream OpenClaw applies those fallbacks in auth
 * profile runtime logic rather than in config parsing.
 *
 * @module @beep/clawhole/config/Auth
 * @since 0.0.0
 */
import { $ClawholeId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ClawholeId.create("config/Auth");

/**
 * Supported credential modes for configured auth profiles.
 *
 * @example
 * ```typescript
 * import { AuthProfileMode } from "@beep/clawhole/config/Auth"
 *
 * const mode = AuthProfileMode.Enum.oauth
 *
 * console.log(mode) // "oauth"
 * ```
 *
 * @category Configuration
 * @since 0.0.0
 */
export const AuthProfileMode = LiteralKit(["api_key", "oauth", "token"] as const).pipe(
  $I.annoteSchema("AuthProfileMode", {
    description:
      "Supported credential modes for auth profiles: static API keys, refreshable OAuth credentials, or static bearer-style tokens.",
  })
);

/**
 * Type of {@link AuthProfileMode}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type AuthProfileMode = typeof AuthProfileMode.Type;

/**
 * Positive cooldown duration in hours used by auth backoff settings.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const AuthCooldownHours = S.Number.check(
  S.isGreaterThan(0, {
    identifier: $I`AuthCooldownHoursGreaterThanZeroCheck`,
    title: "Positive Auth Cooldown Hours",
    description: "A positive hour value used for auth cooldown configuration.",
    message: "Auth cooldown hours must be greater than 0",
  })
).pipe(
  $I.annoteSchema("AuthCooldownHours", {
    description: "Positive cooldown duration in hours used by auth backoff settings.",
  })
);

/**
 * Type of {@link AuthCooldownHours}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type AuthCooldownHours = typeof AuthCooldownHours.Type;

/**
 * Per-provider cooldown overrides keyed by provider id.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const AuthCooldownHoursByProvider = S.Record(S.String, AuthCooldownHours).pipe(
  $I.annoteSchema("AuthCooldownHoursByProvider", {
    description: "Per-provider cooldown overrides keyed by provider id.",
  })
);

/**
 * Type of {@link AuthCooldownHoursByProvider}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type AuthCooldownHoursByProvider = typeof AuthCooldownHoursByProvider.Type;

/**
 * Named auth profiles keyed by profile id.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class AuthProfileConfig extends S.Class<AuthProfileConfig>($I`AuthProfileConfig`)(
  {
    provider: S.String.annotateKey({
      description: "Provider identifier that owns this auth profile.",
    }),
    mode: AuthProfileMode.annotateKey({
      description: "Credential mode expected for this auth profile: `api_key`, `oauth`, or `token`.",
    }),
    email: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional email address associated with the auth profile.",
    }),
    displayName: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional human-readable label for the auth profile.",
    }),
  },
  $I.annote("AuthProfileConfig", {
    description: "Named auth profile entry containing a provider id, credential mode, and optional profile metadata.",
  })
) {}

/**
 * Named auth profiles keyed by profile id.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const AuthProfilesRecord = S.Record(S.String, AuthProfileConfig).pipe(
  $I.annoteSchema("AuthProfilesRecord", {
    description: "Named auth profiles keyed by profile id.",
  })
);

/**
 * Type of {@link AuthProfilesRecord}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type AuthProfilesRecord = typeof AuthProfilesRecord.Type;

/**
 * Ordered auth profile ids keyed by provider id.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const AuthOrderRecord = S.Record(S.String, S.Array(S.String)).pipe(
  $I.annoteSchema("AuthOrderRecord", {
    description: "Ordered auth profile ids keyed by provider id for automatic failover.",
  })
);

/**
 * Type of {@link AuthOrderRecord}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type AuthOrderRecord = typeof AuthOrderRecord.Type;

/**
 * Cooldown and backoff controls for temporary auth profile suppression.
 *
 * Values remain optional at decode time. Upstream OpenClaw applies these
 * runtime defaults when values are absent:
 * - `billingBackoffHours`: 5
 * - `billingMaxHours`: 24
 * - `failureWindowHours`: 24
 *
 * @category Configuration
 * @since 0.0.0
 */
export class AuthCooldownsConfig extends S.Class<AuthCooldownsConfig>($I`AuthCooldownsConfig`)(
  {
    billingBackoffHours: S.OptionFromOptionalKey(AuthCooldownHours).annotateKey({
      description: "Base billing backoff in hours after insufficient-credit failures. Runtime default: 5.",
    }),
    billingBackoffHoursByProvider: S.OptionFromOptionalKey(AuthCooldownHoursByProvider).annotateKey({
      description: "Optional per-provider billing backoff overrides in hours.",
    }),
    billingMaxHours: S.OptionFromOptionalKey(AuthCooldownHours).annotateKey({
      description: "Maximum billing backoff cap in hours. Runtime default: 24.",
    }),
    failureWindowHours: S.OptionFromOptionalKey(AuthCooldownHours).annotateKey({
      description: "Failure counter reset window in hours. Runtime default: 24.",
    }),
  },
  $I.annote("AuthCooldownsConfig", {
    description: "Cooldown and backoff controls for temporary auth profile suppression after billing-related failures.",
  })
) {}

/**
 * Top-level auth configuration for provider profiles, ordering, and cooldowns.
 *
 * @example
 * ```typescript
 * import * as O from "effect/Option"
 * import * as S from "effect/Schema"
 * import { AuthConfig } from "@beep/clawhole/config/Auth"
 *
 * const config = S.decodeUnknownSync(AuthConfig)({
 *   profiles: {
 *     primary: {
 *       provider: "Anthropic",
 *       mode: "oauth"
 *     }
 *   },
 *   order: {
 *     Anthropic: ["primary"]
 *   }
 * })
 *
 * console.log(O.isSome(config.profiles)) // true
 * console.log(O.isSome(config.cooldowns)) // false
 * ```
 *
 * @category Configuration
 * @since 0.0.0
 */
export class AuthConfig extends S.Class<AuthConfig>($I`AuthConfig`)(
  {
    profiles: S.OptionFromOptionalKey(AuthProfilesRecord).annotateKey({
      description: "Named auth profiles keyed by profile id.",
    }),
    order: S.OptionFromOptionalKey(AuthOrderRecord).annotateKey({
      description: "Ordered auth profile ids per provider used for automatic failover.",
    }),
    cooldowns: S.OptionFromOptionalKey(AuthCooldownsConfig).annotateKey({
      description: "Cooldown and backoff controls for temporary profile suppression after billing-related failures.",
    }),
  },
  $I.annote("AuthConfig", {
    description: "Top-level auth configuration for provider profiles, ordering, and cooldowns.",
  })
) {}
