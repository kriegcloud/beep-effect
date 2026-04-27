/**
 * Shared domain role package.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Shared domain package version.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/shared-domain"
 *
 * console.log(VERSION)
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const VERSION = "0.0.0" as const;

/**
 * Shared-kernel aggregate concepts.
 *
 * @since 0.0.0
 * @category aggregates
 */
export * as Aggregates from "./aggregates/index.ts";

/**
 * Shared-kernel entity concepts.
 *
 * @since 0.0.0
 * @category entities
 */
export * as Entities from "./entities/index.ts";
/**
 * Product-facing persisted entity base constructor.
 *
 * @since 0.0.0
 * @category entity constructors
 */
export * as BaseEntity from "./entity/BaseEntity.ts";
/**
 * Entity identifier constructor namespace.
 *
 * @since 0.0.0
 * @category entity constructors
 */
export * as EntityId from "./entity/EntityId.ts";
/**
 * Entity mixin constructor namespace.
 *
 * @since 0.0.0
 * @category entity constructors
 */
export * as EntityMixin from "./entity/EntityMixin.ts";
/**
 * Polymorphic entity reference namespace.
 *
 * @since 0.0.0
 * @category entity references
 */
export * as EntityRef from "./entity/EntityRef.ts";
/**
 * Canonical actor principal namespace.
 *
 * @since 0.0.0
 * @category actor references
 */
export * as Principal from "./entity/Principal.ts";
/**
 * Canonical source-kind namespace.
 *
 * @since 0.0.0
 * @category entity fields
 */
export * as SourceKind from "./entity/SourceKind.ts";
/**
 * Entity-id registry namespace.
 *
 * @since 0.0.0
 * @category entity ids
 */
export * as Identity from "./identity/index.ts";
/**
 * Shared-kernel value objects.
 *
 * @since 0.0.0
 * @category values
 */
export * as Values from "./values/index.ts";
