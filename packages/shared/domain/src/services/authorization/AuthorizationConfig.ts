/**
 * AuthorizationConfig - Configuration for authorization behavior
 *
 * Controls authorization enforcement mode and grace period settings
 * during migration to the new membership-based authorization system.
 *
 * Configuration is loaded from environment variables:
 * - AUTHORIZATION_ENFORCEMENT: "true" to enforce, "false" for grace period (default: true)
 *
 * @module @beep/shared-domain/services/authorization/AuthorizationConfig
 */


// =============================================================================
// Configuration Data Interface
// =============================================================================

import * as S from "effect/Schema";
import {ServiceMap, Effect, Layer,Match, pipe, Config} from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import {$SharedDomainId} from "@beep/identity";

const $I = $SharedDomainId.create("services/authorization/AuthorizationConfig");

/**
 * AuthorizationConfigData - Authorization configuration settings
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
			S.withDecodingDefaultKey(() => true),
			S.withConstructorDefault(() => O.some(true))
		)
		.annotateKey({
			description: "Whether to strictly enforce membership checks.",
			documentation: "- When `true`: Users must be active members of an organization to access it\n- When `false`: Skip membership checks during grace period (all authenticated users can access)\n\nUse `false` during migration to allow existing users continued access\nwhile membership records are being populated."
		})
	},
	$I.annote(
		"AuthorizationConfigData",
		{
			description: "AuthorizationConfigData - Authorization configuration settings"
		}
	)
) {
	static readonly new = (input?: undefined | typeof AuthorizationConfigData.Encoded) => new AuthorizationConfigData(input);
	static readonly thunkNew = (input?: undefined | typeof AuthorizationConfigData.Encoded) => () => this.new(input);
}

// =============================================================================
//  ServiceMap Service
// =============================================================================
/**
 * AuthorizationConfig - Context.Tag for dependency injection
 *
 * @example
 * import { AuthorizationConfig } from "@beep/shared-domain/services/authorization/AuthorizationConfig"
 * import { Effect } from "effect";
 * const program = Effect.gen(function* () {
 *   const config = yield* AuthorizationConfig
 *   if (config.enforcementEnabled) {
 *     // Check membership strictly
 *   } else {
 *     // Grace period: allow access
 *   }
 * })
 *
 **/
export class AuthorizationConfig extends ServiceMap.Service<AuthorizationConfig, AuthorizationConfigData>()($I`AuthorizationConfig`) {
}

// =============================================================================
// Configuration Loading from Environment
// =============================================================================


/**
 * Full AuthorizationConfig from environment variables
 * @type {Config<[{readonly enforcementEnabled: Config<(() => AuthorizationConfigData) | boolean>}] extends [ReadonlyArray<Config<any>>] ? {-readonly [K in keyof {readonly enforcementEnabled: Config<(() => AuthorizationConfigData) | boolean>}]: [{readonly enforcementEnabled: Config<(() => AuthorizationConfigData) | boolean>}[K]] extends [Config<infer A>] ? A : never} : ([{readonly enforcementEnabled: Config<(() => AuthorizationConfigData) | boolean>}] extends [Iterable<Config<infer A>>] ? Array<A> : ([{readonly enforcementEnabled: Config<(() => AuthorizationConfigData) | boolean>}] extends [Record<string, Config<any>>] ? {-readonly [K in keyof {readonly enforcementEnabled: Config<(() => AuthorizationConfigData) | boolean>}]: [{readonly enforcementEnabled: Config<(() => AuthorizationConfigData) | boolean>}[K]] extends [Config<infer A>] ? A : never} : never))>}
 */
export const authorizationConfig: Config.Config<{
	readonly enforcementEnabled: boolean | (() => AuthorizationConfigData);
}> = Config.all({
	enforcementEnabled: Config.boolean("AUTHORIZATION_ENFORCEMENT")
	.pipe(Config.withDefault(AuthorizationConfigData.thunkNew({})))
});

export const authorizationConfigFromEnv = authorizationConfig

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
  Effect.gen(function* () {
	  const l = yield* authorizationConfig;

	  return Match.value(l)
	  .pipe(
			Match.when(
		  P.Struct({
			  enforcementEnabled: P.isBoolean
		  }),
		  (l) => AuthorizationConfig.of(l)
	  ),
		  Match.when(
				P.Struct({
					enforcementEnabled: (u: unknown): u is (() => AuthorizationConfigData) => P.isFunction(u)
				}),
			  (l) => AuthorizationConfig.of(AuthorizationConfigData.new(l))
		  ),
		  Match.exhaustive
	  )
  })
)