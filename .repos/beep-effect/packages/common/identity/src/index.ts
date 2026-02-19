/**
 * Concrete implementation for namespace-safe identity string and symbol creation.
 *
 * @example
 * ```typescript
 * import { Identifier } from "@beep/identity"
 *
 * const { $BeepId } = Identifier.make("beep")
 * const runtimeLayerId = $BeepId.create("runtime-server").make("ManagedRuntime")
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * as Identifier from "./Identifier";

/**
 * Canonical identity composers for every `@beep/*` workspace namespace.
 *
 * @example
 * ```typescript
 * import { modules } from "@beep/identity"
 *
 * const schemaTenantId = modules.$SchemaId.create("entities").make("Tenant")
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * as modules from "./packages";

/**
 * Type helpers for the `@beep/identity` builders and schema annotations.
 *
 * @example
 * ```typescript
 * import type { types } from "@beep/identity"
 *
 * type SchemaSymbol = types.IdentitySymbol<"@beep/schema/entities/Tenant">
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * as types from "./types";
