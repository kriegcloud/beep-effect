/**
 * Storage-neutral polymorphic entity reference.
 *
 * @module
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity/packages";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import * as EntityId from "./EntityId.js";

const $I = $SharedDomainId.create("entity/EntityRef");

/**
 * Entity type grammar used by polymorphic references.
 *
 * @since 0.0.0
 * @category schemas
 */
export const EntityType = S.NonEmptyString.pipe(
  S.brand("EntityType"),
  $I.annoteSchema("EntityType", {
    description: "PascalCase entity type token used by polymorphic entity references.",
  })
);

/**
 * Runtime type for {@link EntityType}.
 *
 * @since 0.0.0
 * @category models
 */
export type EntityType = typeof EntityType.Type;

/**
 * Persisted polymorphic reference encoded as entity type plus numeric id.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { EntityIdValue } from "@beep/shared-domain/entity/EntityId"
 * import { EntityRef, EntityType } from "@beep/shared-domain/entity/EntityRef"
 *
 * const ref = new EntityRef({
 *   entityType: S.decodeUnknownSync(EntityType)("SharedOrganization"),
 *   id: S.decodeUnknownSync(EntityIdValue)(1),
 * })
 * console.log(ref.entityType)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class EntityRef extends S.Class<EntityRef>($I`EntityRef`)(
  {
    entityType: EntityType,
    id: EntityId.EntityIdValue,
  },
  $I.annote("EntityRef", {
    description: "Storage-neutral polymorphic entity reference.",
  })
) {}

/**
 * Build a polymorphic reference for a known entity id schema.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { EntityIdValue } from "@beep/shared-domain/entity/EntityId"
 * import { make } from "@beep/shared-domain/entity/EntityRef"
 * import { OrganizationId } from "@beep/shared-domain/identity/Shared"
 *
 * const ref = make(OrganizationId, S.decodeUnknownSync(EntityIdValue)(1))
 * console.log(ref.entityType)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const make: {
  (entityId: EntityId.Any, id: EntityId.EntityIdValue): EntityRef;
  (id: EntityId.EntityIdValue): (entityId: EntityId.Any) => EntityRef;
} = dual(
  2,
  (entityId: EntityId.Any, id: EntityId.EntityIdValue): EntityRef =>
    new EntityRef({
      entityType: entityId.entityType as EntityType,
      id,
    })
);
