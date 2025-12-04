/**
 * Concrete implementation for namespace-safe identity string and symbol creation.
 *
 * @example
 * import * as Identity from "@beep/identity/BeepId";
 *
 * const runtimeLayerId = Identity.BeepId.package("runtime-server").compose("layers").make("Managed");
 *
 * @category Identity/Builder
 * @since 0.1.0
 */

export * as Identifier from "./Identifier";
export { $I } from "./packages";
/**
 * Canonical identity composers for every `@beep/*` workspace namespace.
 *
 * @example
 * import * as Identity from "@beep/identity/BeepId";
 *
 * const schemaTenantId = Identity.SchemaId.compose("entities").make("Tenant");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export * as modules from "./packages";

/**
 * Type helpers for the `@beep/identity` builders and schema annotations.
 *
 * @example
 * import type * as Identity from "@beep/identity/types";
 *
 * type SchemaSymbol = Identity.IdentitySymbol<"@beep/schema/entities/Tenant">;
 *
 * @category Identity/Types
 * @since 0.1.0
 */
export * as types from "./types";
