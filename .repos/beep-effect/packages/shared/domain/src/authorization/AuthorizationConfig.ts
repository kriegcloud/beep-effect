/**
 * AuthorizationConfig - Configuration for authorization behavior
 *
 * Controls authorization enforcement mode and grace period settings
 * during migration to the new membership-based authorization system.
 *
 * Configuration is loaded from environment variables:
 * - AUTHORIZATION_ENFORCEMENT: "true" to enforce, "false" for grace period (default: true)
 *
 * @module authorization/AuthorizationConfig
 */

import { $SharedDomainId } from "@beep/identity/packages";
import { thunkTrue } from "@beep/utils";
import * as Config from "effect/Config";
import type { ConfigError } from "effect/ConfigError";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("authorization/AuthorizationConfig");

// =============================================================================
// Configuration Data Schema
// =============================================================================

/**
 * AuthorizationConfigData - Authorization configuration settings
 */
export class AuthorizationConfigData extends S.Class<AuthorizationConfigData>($I`AuthorizationConfigData`)(
  {
    enforcementEnabled: S.optionalWith(S.Boolean, { default: thunkTrue }).annotations({
      description: "Whether to strictly enforce membership checks.",
      documentation:
        "- When `true`: Users must be active members of an organization to access it\n- When `false`: Skip membership checks during grace period (all authenticated users can access)\n\nUse `false` during migration to allow existing users continued access\nwhile membership records are being populated.",
    }),
  },
  $I.annotations("AuthorizationConfig", {
    description: "AuthorizationConfigData - Authorization configuration settings",
  })
) {}

/**
 * AuthorizationConfig - Context.Tag for dependency injection
 *
 * Usage:
 * ```typescript
 * import { AuthorizationConfig } from "@accountability/core/authorization/AuthorizationConfig"
 *
 * const program = Effect.gen(function* () {
 *   const config = yield* AuthorizationConfig
 *   if (config.enforcementEnabled) {
 *     // Check membership strictly
 *   } else {
 *     // Grace period: allow access
 *   }
 * })
 * ```
 */
export class AuthorizationConfig extends Context.Tag($I`AuthorizationConfig`)<
  AuthorizationConfig,
  AuthorizationConfigData
>() {}

/**
 * Full AuthorizationConfig from environment variables
 */
export const authorizationConfig: Config.Config<S.Schema.Type<typeof AuthorizationConfigData>> = Config.all({
  enforcementEnabled: Config.boolean("AUTHORIZATION_ENFORCEMENT").pipe(
    Config.withDefault(new AuthorizationConfigData().enforcementEnabled)
  ),
});

export const authorizationConfigFromEnv: Effect.Effect<AuthorizationConfigData, ConfigError> = authorizationConfig;

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
 */
export const AuthorizationConfigLive: Layer.Layer<AuthorizationConfig> = Layer.effect(
  AuthorizationConfig,
  Effect.catchAll(authorizationConfigFromEnv, () => Effect.succeed(new AuthorizationConfigData()))
);

// =============================================================================
// Helper Layers
// =============================================================================

/**
 * Create an AuthorizationConfig layer with specific settings
 *
 * Useful for tests or specific configurations.
 */
export const makeAuthorizationConfigLayer = (config: AuthorizationConfigData): Layer.Layer<AuthorizationConfig> =>
  Layer.succeed(AuthorizationConfig, config);

/**
 * AuthorizationConfigEnforced - Layer with enforcement enabled
 *
 * Use this in production after the migration grace period.
 */
export const AuthorizationConfigEnforced: Layer.Layer<AuthorizationConfig> = makeAuthorizationConfigLayer({
  enforcementEnabled: true,
});

/**
 * AuthorizationConfigGracePeriod - Layer with enforcement disabled
 *
 * Use this during migration while membership records are being populated.
 */
export const AuthorizationConfigGracePeriod: Layer.Layer<AuthorizationConfig> = makeAuthorizationConfigLayer({
  enforcementEnabled: false,
});
