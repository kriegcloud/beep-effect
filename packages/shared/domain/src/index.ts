/**
 * Shared domain role package.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * @since 0.0.0
 * @category Configuration
 */
export const VERSION = "0.0.0" as const;

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
