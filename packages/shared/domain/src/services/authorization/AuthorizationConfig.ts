/**
 * AuthorizationConfig - Configuration for authorization behavior
 *
 * Controls authorization enforcement mode and grace period settings
 * during migration to the new membership-based authorization system.
 *
 * Configuration is loaded from environment variables:
 * - AUTHORIZATION_ENFORCEMENT: "true" to enforce, "false" for grace period (default: true)
 *
 * @packageDocumentation
 * @since 0.0.0
 */

// =============================================================================
// Configuration Data Interface
// =============================================================================

import { $SharedDomainId } from "@beep/identity";
import { Config, Context, Effect, Layer } from "effect";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("services/authorization/AuthorizationConfig");

/**
 * AuthorizationConfigData - Authorization configuration settings
 *
 * @example
 * ```ts
 * import { AuthorizationConfigData } from "@beep/shared-domain/services/authorization/AuthorizationConfig"
 *
 * const config = AuthorizationConfigData.new({
 *   enforcementEnabled: false
 * })
 *
 * void config
 * ```
 *
 * @category domain model
 * @since 0.0.0
 */
export class AuthorizationConfigData extends S.Class<AuthorizationConfigData>($I`AuthorizationConfigData`)(
  {
    /**
     * Whether to strictly enforce membership checks.
     *
     * - When `true`: Users must be active members of an organization to access it
     * - When `false`: Skip membership checks during grace period (all authenticated users can access)
     *
     * Use `false` during migration to allow existing users continued access
     * while membership records are being populated.
     */
    enforcementEnabled: S.Boolean.pipe(
      S.withDecodingDefaultKey(Effect.succeed(true)),
      S.withConstructorDefault(Effect.succeed(true))
    ).annotateKey({
      description: "Whether to strictly enforce membership checks.",
      documentation:
        "- When `true`: Users must be active members of an organization to access it\n- When `false`: Skip membership checks during grace period (all authenticated users can access)\n\nUse `false` during migration to allow existing users continued access\nwhile membership records are being populated.",
    }),
  },
  $I.annote("AuthorizationConfigData", {
    description: "AuthorizationConfigData - Authorization configuration settings",
  })
) {
  static readonly new = (input?: undefined | typeof AuthorizationConfigData.Encoded) =>
    new AuthorizationConfigData(input);
  static readonly thunkNew = (input?: undefined | typeof AuthorizationConfigData.Encoded) => () => this.new(input);
}

// =============================================================================
//  Context Service
// =============================================================================
/**
 * AuthorizationConfig - Context.Tag for dependency injection
 *
 * @example
 * ```ts
 * import { AuthorizationConfig } from "@beep/shared-domain/services/authorization/AuthorizationConfig"
 * import { Effect } from "effect"
 *
 * const program = Effect.gen(function* () {
 *   const config = yield* AuthorizationConfig
 *   return config.enforcementEnabled
 * })
 *
 * void program
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class AuthorizationConfig extends Context.Service<AuthorizationConfig, AuthorizationConfigData>()(
  $I`AuthorizationConfig`
) {}

// =============================================================================
// Configuration Loading from Environment
// =============================================================================

/**
 * Full AuthorizationConfig from environment variables.
 *
 * @example
 * ```ts
 * import { authorizationConfig } from "@beep/shared-domain/services/authorization/AuthorizationConfig"
 *
 * const config = authorizationConfig
 *
 * void config
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const authorizationConfig = Config.all({
  enforcementEnabled: Config.boolean("AUTHORIZATION_ENFORCEMENT").pipe(Config.withDefault(true)),
});

/**
 * Alias for {@link authorizationConfig}.
 *
 * @example
 * ```ts
 * import { authorizationConfigFromEnv } from "@beep/shared-domain/services/authorization/AuthorizationConfig"
 *
 * const config = authorizationConfigFromEnv
 *
 * void config
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const authorizationConfigFromEnv = authorizationConfig;

// =============================================================================
// Layer
// =============================================================================

/**
 * AuthorizationConfigLive - Layer providing AuthorizationConfig from environment variables
 *
 * Reads configuration from:
 * - AUTHORIZATION_ENFORCEMENT: "true" or "false" (default: "true")
 *
 * Set AUTHORIZATION_ENFORCEMENT=false during migration grace period to allow
 * all authenticated users access while membership records are populated.
 *
 * Note: This layer uses defaults when env var is not set, so it never fails
 * in practice. ConfigError is typed out for callers' convenience.
 *
 * @example
 * ```ts
 * import { AuthorizationConfigLive } from "@beep/shared-domain/services/authorization/AuthorizationConfig"
 *
 * const layer = AuthorizationConfigLive
 *
 * void layer
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const AuthorizationConfigLive: Layer.Layer<AuthorizationConfig, Config.ConfigError> = Layer.effect(
  AuthorizationConfig,
  Effect.gen(function* () {
    const config = yield* authorizationConfig;

    return AuthorizationConfig.of(AuthorizationConfigData.new(config));
  })
);

// =============================================================================
// Helper Layers
// =============================================================================

/**
 * Create an AuthorizationConfig layer with specific settings
 *
 * Useful for tests or specific configurations.
 *
 * @example
 * ```ts
 * import {
 *   AuthorizationConfigData,
 *   makeAuthorizationConfigLayer
 * } from "@beep/shared-domain/services/authorization/AuthorizationConfig"
 *
 * const layer = makeAuthorizationConfigLayer(
 *   AuthorizationConfigData.new({ enforcementEnabled: true })
 * )
 *
 * void layer
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const makeAuthorizationConfigLayer = (config: AuthorizationConfigData): Layer.Layer<AuthorizationConfig> =>
  Layer.succeed(AuthorizationConfig, config);

/**
 * AuthorizationConfigEnforced - Layer with enforcement enabled
 *
 * Use this in production after the migration grace period.
 *
 * @example
 * ```ts
 * import { AuthorizationConfigEnforced } from "@beep/shared-domain/services/authorization/AuthorizationConfig"
 *
 * const layer = AuthorizationConfigEnforced
 *
 * void layer
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const AuthorizationConfigEnforced: Layer.Layer<AuthorizationConfig> = makeAuthorizationConfigLayer(
  AuthorizationConfigData.new({
    enforcementEnabled: true,
  })
);

/**
 * AuthorizationConfigGracePeriod - Layer with enforcement disabled
 *
 * Use this during migration while membership records are being populated.
 *
 * @example
 * ```ts
 * import { AuthorizationConfigGracePeriod } from "@beep/shared-domain/services/authorization/AuthorizationConfig"
 *
 * const layer = AuthorizationConfigGracePeriod
 *
 * void layer
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const AuthorizationConfigGracePeriod: Layer.Layer<AuthorizationConfig> = makeAuthorizationConfigLayer(
  AuthorizationConfigData.new({
    enforcementEnabled: false,
  })
);
