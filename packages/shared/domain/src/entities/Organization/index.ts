/**
 * Organization pure behavior helpers.
 *
 * @example
 * ```ts
 * import { hasParentOrganization } from "@beep/shared-domain/entities/Organization/index"
 * import * as O from "effect/Option"
 *
 * console.log(hasParentOrganization({ parentOrgId: O.none() }))
 * ```
 *
 * @since 0.0.0
 * @category predicates
 */
export * from "./Organization.behavior.js";

/**
 * Organization model schema namespace.
 *
 * @example
 * ```ts
 * import { Model } from "@beep/shared-domain/entities/Organization/index"
 *
 * console.log(Model.definition.entityId.tableName)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * from "./Organization.model.js";

/**
 * Organization value schemas and mixin pack.
 *
 * @example
 * ```ts
 * import { ProfilePack } from "@beep/shared-domain/entities/Organization/index"
 *
 * console.log(ProfilePack.fieldMap.slug.columnName)
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export * from "./Organization.values.js";
