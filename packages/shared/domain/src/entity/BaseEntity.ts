/**
 * Product-facing persisted entity base constructor.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { PosInt } from "@beep/schema/Int";
import { SemanticVersion } from "@beep/schema/SemanticVersion";
import * as Struct from "@beep/utils/Struct";
import type * as S from "effect/Schema";
import * as Shared from "../identity/Shared.js";
import { Principal } from "./Principal.js";
import { SourceKind } from "./SourceKind.js";

const $I = $SharedDomainId.create("entity/BaseEntity");

type EntityInput<FieldMap extends EntitySchema.Fields, Persisted extends EntitySchema.PersistedFor<FieldMap>> = Omit<
  EntitySchema.ClassInput<FieldMap, Persisted>,
  "entityId" | "tableName"
>;

type EntityIdentityFields<Entity extends EntitySchema.EntityIdLike> = {
  readonly entityType: S.Literal<Entity["entityType"]>;
  readonly id: EntitySchema.EntityIdSchema<Entity>;
};

type EntityIdentityPersisted = {
  readonly entityType: EntitySchema.PersistDescriptor<"literal", "derived", "entity_type">;
  readonly id: EntitySchema.PersistDescriptor<"entityId", "generatedOnInsert">;
};

type EntityFieldsFor<
  Entity extends EntitySchema.EntityIdLike,
  ChildFields extends EntitySchema.Fields,
> = EntitySchema.Assign<ChildFields, EntityIdentityFields<Entity>>;

type EntityPersistedFor<
  Entity extends EntitySchema.EntityIdLike,
  ChildFields extends EntitySchema.Fields,
  ChildPersisted extends EntitySchema.PersistedFor<ChildFields>,
> = EntitySchema.CheckedPersistedFor<
  EntityFieldsFor<Entity, ChildFields>,
  EntitySchema.AssignPersisted<ChildPersisted, EntityIdentityPersisted> &
    EntitySchema.PersistedFor<EntityFieldsFor<Entity, ChildFields>>
>;

/**
 * BaseEntity fields shared by every persisted product entity except the
 * entity-specific `id` and `entityType` fields.
 *
 * @example
 * ```ts
 * import { fields } from "@beep/shared-domain/entity/BaseEntity"
 *
 * console.log(fields.createdAt)
 * ```
 *
 * @since 0.0.0
 * @category fields
 */
export const fields = {
  createdAt: EntitySchema.DateTimeFromMillis,
  createdByPrincipal: Principal,
  orgId: EntitySchema.entityId(Shared.OrganizationId),
  rowVersion: PosInt,
  schemaVersion: SemanticVersion,
  source: SourceKind,
  updatedAt: EntitySchema.DateTimeFromMillis,
  updatedByPrincipal: Principal,
} as const;

/**
 * Physical persistence metadata for BaseEntity invariant fields.
 *
 * @example
 * ```ts
 * import { persisted } from "@beep/shared-domain/entity/BaseEntity"
 *
 * console.log(persisted.orgId.storageKind)
 * ```
 *
 * @since 0.0.0
 * @category fields
 */
export const persisted = {
  createdAt: EntitySchema.persist.timestampMillis({
    valueStrategy: "defaultedOnInsert",
  }),
  createdByPrincipal: EntitySchema.persist.jsonb({
    valueStrategy: "providedByContext",
  }),
  orgId: EntitySchema.persist.entityId({
    indexHints: [EntitySchema.IndexHint.btree, EntitySchema.IndexHint.lookup],
    valueStrategy: "providedByContext",
  }),
  rowVersion: EntitySchema.persist.int({
    valueStrategy: "incrementedOnWrite",
  }),
  schemaVersion: EntitySchema.persist.text({
    valueStrategy: "providedByContext",
  }),
  source: EntitySchema.persist.literal({
    indexHints: [EntitySchema.IndexHint.btree, EntitySchema.IndexHint.lookup],
    valueStrategy: "derived",
  }),
  updatedAt: EntitySchema.persist.timestampMillis({
    valueStrategy: "updatedOnWrite",
  }),
  updatedByPrincipal: EntitySchema.persist.jsonb({
    valueStrategy: "providedByContext",
  }),
} as const satisfies EntitySchema.PersistedFor<typeof fields>;

const BaseEntityCore = EntitySchema.ClassFactory($I`BaseEntity`)(
  {
    fields,
    persisted,
  },
  $I.annote("BaseEntity", {
    description: "Base persisted entity shape shared by every product entity.",
  })
);

const BaseEntityCoreClass = BaseEntityCore.Class;

const identityFields = <const Entity extends EntitySchema.EntityIdLike>(
  entityId: Entity
): EntityIdentityFields<Entity> => ({
  entityType: EntitySchema.literal(entityId.entityType),
  id: EntitySchema.generatedId(entityId),
});

const identityPersisted = {
  entityType: EntitySchema.persist.literal({
    columnName: "entity_type",
    valueStrategy: "derived",
  }),
  id: EntitySchema.persist.entityId({
    valueStrategy: "generatedOnInsert",
  }),
} as const satisfies EntityIdentityPersisted;

const entityPartsFor = <
  const Entity extends EntitySchema.EntityIdLike,
  const ChildFields extends EntitySchema.Fields,
  const ChildPersisted extends EntitySchema.PersistedFor<ChildFields>,
>(
  entityId: Entity,
  input: EntityInput<ChildFields, ChildPersisted>
): {
  readonly fields: EntityFieldsFor<Entity, ChildFields>;
  readonly persisted: EntityPersistedFor<Entity, ChildFields, ChildPersisted>;
} =>
  ({
    fields: Struct.assign(input.fields, identityFields(entityId)),
    persisted: Struct.assign(input.persisted, identityPersisted),
  }) as {
    readonly fields: EntityFieldsFor<Entity, ChildFields>;
    readonly persisted: EntityPersistedFor<Entity, ChildFields, ChildPersisted>;
  };

const Class =
  <Child = never>(identifier: string) =>
  <
    const Entity extends EntitySchema.EntityIdLike,
    const ChildFields extends EntitySchema.Fields,
    const ChildPersisted extends EntitySchema.PersistedFor<ChildFields>,
  >(
    entityId: Entity,
    input: EntityInput<ChildFields, ChildPersisted>,
    annotations?: EntitySchema.SchemaAnnotations
  ) => {
    const entityParts = entityPartsFor(entityId, input);
    const classInput = EntitySchema.defineClassInput<
      EntityFieldsFor<Entity, ChildFields>,
      EntityPersistedFor<Entity, ChildFields, ChildPersisted>,
      Entity["tableName"],
      Entity
    >({
      entityId,
      fields: entityParts.fields,
      persisted: entityParts.persisted,
      tableName: entityId.tableName,
    });

    return BaseEntityCoreClass<Child>(identifier)<
      EntityFieldsFor<Entity, ChildFields>,
      EntityPersistedFor<Entity, ChildFields, ChildPersisted>,
      Entity["tableName"],
      Entity
    >(classInput, annotations);
  };

const replaceClass = <Base extends object>(base: Base): Omit<Base, "Class"> & { readonly Class: typeof Class } => {
  Reflect.defineProperty(base, "Class", {
    configurable: true,
    value: Class,
  });
  return base as Omit<Base, "Class"> & { readonly Class: typeof Class };
};

/**
 * Product-facing persisted entity base.
 *
 * @example
 * ```ts
 * import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity"
 *
 * console.log(BaseEntity.definition.tableName)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const BaseEntity = replaceClass(BaseEntityCore);

/**
 * Runtime type for {@link BaseEntity}.
 *
 * @example
 * ```ts
 * import type { BaseEntity } from "@beep/shared-domain/entity/BaseEntity"
 *
 * declare const entity: BaseEntity
 * console.log(entity.rowVersion)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type BaseEntity = typeof BaseEntity.Type;
