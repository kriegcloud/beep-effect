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
 * @example
 * ```ts
 * import { Aggregates } from "@beep/shared-domain"
 *
 * console.log(Aggregates)
 * ```
 *
 * @since 0.0.0
 * @category aggregates
 */
export * as Aggregates from "./aggregates/index.ts";

/**
 * Shared-kernel entity concepts.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/shared-domain"
 *
 * console.log(Entities.Organization.ProfilePack.fieldKeys.length)
 * ```
 *
 * @since 0.0.0
 * @category entities
 */
export * as Entities from "./entities/index.ts";
/**
 * Product-facing persisted entity base constructor.
 *
 * @example
 * ```ts
 * import { BaseEntity } from "@beep/shared-domain"
 *
 * console.log(BaseEntity.BaseEntity.definition.fieldMap.createdAt.columnName)
 * ```
 *
 * @since 0.0.0
 * @category entity constructors
 */
export * as BaseEntity from "./entity/BaseEntity.ts";
/**
 * Entity identifier constructor namespace.
 *
 * @example
 * ```ts
 * import { EntityId } from "@beep/shared-domain"
 *
 * console.log(EntityId.EntityIdValue)
 * ```
 *
 * @since 0.0.0
 * @category entity constructors
 */
export * as EntityId from "./entity/EntityId.ts";
/**
 * Entity mixin constructor namespace.
 *
 * @example
 * ```ts
 * import { EntityMixin } from "@beep/shared-domain"
 *
 * console.log(EntityMixin.TypeId)
 * ```
 *
 * @since 0.0.0
 * @category entity constructors
 */
export * as EntityMixin from "./entity/EntityMixin.ts";
/**
 * Polymorphic entity reference namespace.
 *
 * @example
 * ```ts
 * import { EntityRef } from "@beep/shared-domain"
 *
 * console.log(EntityRef.EntityRef)
 * ```
 *
 * @since 0.0.0
 * @category entity references
 */
export * as EntityRef from "./entity/EntityRef.ts";
/**
 * Canonical actor principal namespace.
 *
 * @example
 * ```ts
 * import { Principal } from "@beep/shared-domain"
 *
 * console.log(Principal.Principal)
 * ```
 *
 * @since 0.0.0
 * @category actor references
 */
export * as Principal from "./entity/Principal.ts";
/**
 * Canonical source-kind namespace.
 *
 * @example
 * ```ts
 * import { SourceKind } from "@beep/shared-domain"
 *
 * console.log(SourceKind.SourceKind)
 * ```
 *
 * @since 0.0.0
 * @category entity fields
 */
export * as SourceKind from "./entity/SourceKind.ts";
/**
 * Entity-id registry namespace.
 *
 * @example
 * ```ts
 * import { Identity } from "@beep/shared-domain"
 *
 * console.log(Identity.Shared.OrganizationId.resource)
 * ```
 *
 * @since 0.0.0
 * @category entity ids
 */
export * as Identity from "./identity/index.ts";
/**
 * Shared-kernel value objects.
 *
 * @example
 * ```ts
 * import { Values } from "@beep/shared-domain"
 *
 * console.log(Values.LocalDate.today().toISOString())
 * ```
 *
 * @since 0.0.0
 * @category values
 */
export * as Values from "./values/index.ts";
