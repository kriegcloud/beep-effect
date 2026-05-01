import { $ScratchpadId } from "@beep/identity/packages";
import * as Struct from "@beep/utils/Struct";
import * as S from "effect/Schema";
import * as EntitySchema from "./entity-schema.ts";

const $I = $ScratchpadId.create("schema-drizzle-projection/base-entity");

type EntityInput<FieldMap extends EntitySchema.Fields, Persisted extends EntitySchema.PersistedMap> = Omit<
  EntitySchema.ClassInput<FieldMap, Persisted>,
  "tableName"
>;

type EntityIdentityFields<Entity extends EntitySchema.EntityIdLike> = {
  readonly id: EntitySchema.EntityIdSchema<Entity>;
  readonly entityType: S.Literal<Entity["entityType"]>;
};

type EntityIdentityPersisted = {
  readonly id: EntitySchema.PersistDescriptor<"entityId", "generatedOnInsert">;
  readonly entityType: EntitySchema.PersistDescriptor<"literal", "derived", "entity_type">;
};

type EntityFieldsFor<Entity extends EntitySchema.EntityIdLike, ChildFields extends EntitySchema.Fields> =
  EntitySchema.Assign<ChildFields, EntityIdentityFields<Entity>>;

type EntityPersistedFor<
  Entity extends EntitySchema.EntityIdLike,
  ChildFields extends EntitySchema.Fields,
  ChildPersisted extends EntitySchema.PersistedFor<ChildFields>,
> = EntitySchema.AssignPersisted<ChildPersisted, EntityIdentityPersisted> &
  EntitySchema.PersistedFor<EntityFieldsFor<Entity, ChildFields>>;

const baseFields = {
  createdAt: EntitySchema.DateTimeFromMillis,
  rowVersion: EntitySchema.int,
} as const;

const basePersisted = {
  createdAt: EntitySchema.persist.timestampMillis(),
  rowVersion: EntitySchema.persist.int(),
} as const satisfies EntitySchema.PersistedFor<typeof baseFields>;

const BaseEntityCore = EntitySchema.ClassFactory($I`BaseEntity`)(
  {
    fields: baseFields,
    persisted: basePersisted,
  },
  $I.annote("BaseEntity", {
    description: "Scratchpad base entity class factory for schema-to-Drizzle projection experiments.",
  })
);
const BaseEntityCoreClass = BaseEntityCore.Class;

const identityFields = <const Entity extends EntitySchema.EntityIdLike>(entityId: Entity): EntityIdentityFields<Entity> => ({
  id: EntitySchema.generatedId(entityId),
  entityType: EntitySchema.literal(entityId.entityType),
});

const identityPersisted = {
  id: EntitySchema.persist.entityId({ valueStrategy: "generatedOnInsert" }),
  entityType: EntitySchema.persist.literal({
    columnName: "entity_type",
    valueStrategy: "derived",
  }),
} as const satisfies EntityIdentityPersisted;

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
    const classInput = {
      fields: Struct.assign(input.fields, identityFields(entityId)) as EntityFieldsFor<Entity, ChildFields>,
      persisted: Struct.assign(input.persisted, identityPersisted) as unknown as EntityPersistedFor<
        Entity,
        ChildFields,
        ChildPersisted
      >,
      tableName: entityId.tableName as Entity["tableName"],
    } as unknown as EntitySchema.ClassInput<
      EntityFieldsFor<Entity, ChildFields>,
      EntityPersistedFor<Entity, ChildFields, ChildPersisted>,
      Entity["tableName"]
    >;

    return BaseEntityCoreClass<Child>(identifier)<
      EntityFieldsFor<Entity, ChildFields>,
      EntityPersistedFor<Entity, ChildFields, ChildPersisted>,
      Entity["tableName"]
    >(classInput, annotations);
  };

const BaseEntityWithIdentityClass = BaseEntityCore as Omit<typeof BaseEntityCore, "Class"> & {
  readonly Class: typeof Class;
};

Reflect.defineProperty(BaseEntityWithIdentityClass, "Class", {
  configurable: true,
  value: Class,
});

export const BaseEntity = BaseEntityWithIdentityClass;
