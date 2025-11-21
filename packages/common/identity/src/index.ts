/**
 * Concrete implementation for namespace-safe identity string and symbol creation.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const runtimeLayerId = Identity.BeepId.module("runtime-server").compose("layers").make("Managed");
 *
 * @category Identity/Builder
 * @since 0.1.0
 */
export * as BeepId from "./BeepId.js";

/**
 * Canonical identity composers for every `@beep/*` workspace namespace.
 *
 * @example
 * import * as Identity from "@beep/identity";
 *
 * const schemaTenantId = Identity.SchemaId.compose("entities").make("Tenant");
 *
 * @category Identity/Modules
 * @since 0.1.0
 */
export * as modules from "./modules.js";

/**
 * Type helpers for the `@beep/identity` builders and schema annotations.
 *
 * @example
 * import type * as Identity from "@beep/identity";
 *
 * type SchemaSymbol = Identity.IdentitySymbol<"@beep/schema/entities/Tenant">;
 *
 * @category Identity/Types
 * @since 0.1.0
 */
export * as types from "./types.js";
