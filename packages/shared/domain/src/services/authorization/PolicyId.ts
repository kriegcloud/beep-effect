/**
 * PolicyId - Branded type for authorization policy identifiers
 *
 * A branded UUID string type for uniquely identifying authorization policies.
 * Uses Effect's built-in UUID schema with additional branding for type safety.
 *
 * @module @beep/shared-domain/services/authorization/PolicyId
 */
import {Effect, Layer, Config, ServiceMap} from "effect";
import {$SharedDomainId} from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("services/authorization/PolicyId");


// =============================================================================
// Configuration Data Interface
// =============================================================================

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
		enforcementEnabled: S.Boolean.annotateKey({
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
export class AuthorizationConfig extends ServiceMap.Service<AuthorizationConfig, AuthorizationConfigData>()($I`AuthorizationConfig`) {}