/**
 * Product-facing persisted entity base constructor.
 *
 * @module
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity/packages";
import { PosInt } from "@beep/schema/Int";
import * as Model from "@beep/schema/Model";
import { SemanticVersion } from "@beep/schema/SemanticVersion";
import * as VariantSchema from "@beep/schema/VariantSchema";
import * as Struct from "@beep/utils/Struct";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Shared from "../identity/Shared.js";
import type * as EntityId from "./EntityId.js";
import * as EntityMixin from "./EntityMixin.js";
import { Principal } from "./Principal.js";
import { SourceKind } from "./SourceKind.js";

const $I = $SharedDomainId.create("entity/BaseEntity");

type FieldInput = S.Top | VariantSchema.Field.Any | VariantSchema.Struct.Any;
type FieldOverrideInput = EntityMixin.FieldOverride<unknown>;
type FieldMapInput = {
  readonly [key: string]: FieldInput | FieldOverrideInput | undefined;
};
type StructInput = FieldMapInput | VariantSchema.Struct.Any;
type Simplify<T> = { readonly [K in keyof T]: T[K] } & {};
type ModelClassFor<Self, Fields extends VariantSchema.Struct.Fields> = Model.ClassShape<Self, Fields>;
type MergeFields<Left extends object, Right extends object> = Simplify<Omit<Left, keyof Right> & Right>;
type StructFieldsOf<Fields extends object> = {
  readonly [K in keyof Fields]: Extract<Fields[K], FieldInput>;
};
type DefinedField<Field> = Exclude<Field, undefined>;
type NormalizeField<Field> = Field extends EntityMixin.FieldOverride<infer Inner> ? Inner : Field;
type FieldsFromStructInput<Fields extends StructInput> =
  Fields extends VariantSchema.Struct<infer StructFields>
    ? StructFields
    : Fields extends FieldMapInput
      ? {
          readonly [K in keyof Fields as [DefinedField<Fields[K]>] extends [never] ? never : K]: NormalizeField<
            DefinedField<Fields[K]>
          >;
        }
      : never;
type EntityFields<Entity extends EntityId.Any> = {
  readonly entityType: Model.GeneratedByApp<S.Literal<Entity["entityType"]>>;
  readonly id: Model.Generated<Entity>;
};
type MergedModelFields<
  Entity extends EntityId.Any,
  Mixins extends EntityMixin.Pack,
  Fields extends StructInput,
> = StructFieldsOf<
  MergeFields<
    MergeFields<MergeFields<EntityFields<Entity>, typeof fields>, Mixins["fields"]>,
    FieldsFromStructInput<Fields>
  >
>;

/**
 * Descriptor map contributed by the entity id constructor itself.
 *
 * @since 0.0.0
 * @category fields
 */
export type EntityFieldMap<Entity extends EntityId.Any> = {
  readonly entityType: {
    readonly columnName: "entity_type";
    readonly description: `Persisted discriminator for ${Entity["entityType"]}.`;
    readonly indexHints: readonly [typeof EntityMixin.IndexHint.btree, typeof EntityMixin.IndexHint.lookup];
    readonly key: "entityType";
    readonly nullable: false;
    readonly storageKind: "literal";
    readonly valueStrategy: "derived";
  };
  readonly id: {
    readonly columnName: "id";
    readonly description: `Primary key for ${Entity["entityType"]}.`;
    readonly key: "id";
    readonly nullable: false;
    readonly storageKind: "entityId";
    readonly valueStrategy: "generatedOnInsert";
  };
};

/**
 * BaseEntity fields shared by every persisted product entity except the
 * entity-specific `id` and `entityType` fields.
 *
 * @since 0.0.0
 * @category fields
 */
export const fields = {
  createdAt: Model.DateTimeInsertFromNumber,
  createdByPrincipal: Model.GeneratedByApp(Principal),
  orgId: Model.GeneratedByApp(Shared.OrganizationId),
  rowVersion: Model.Generated(PosInt),
  schemaVersion: Model.GeneratedByApp(SemanticVersion),
  source: Model.GeneratedByApp(SourceKind),
  updatedAt: Model.DateTimeUpdateFromNumber,
  updatedByPrincipal: Model.GeneratedByApp(Principal),
} as const;

/**
 * Storage-neutral descriptors for the BaseEntity invariant fields.
 *
 * @since 0.0.0
 * @category fields
 */
export const fieldMap = {
  createdAt: {
    key: "createdAt",
    columnName: "created_at",
    description: "Epoch-millis timestamp when the row was inserted.",
    nullable: false,
    storageKind: "timestampMillis",
    valueStrategy: "defaultedOnInsert",
  },
  createdByPrincipal: {
    key: "createdByPrincipal",
    columnName: "created_by_principal",
    description: "Principal responsible for creating the row.",
    nullable: false,
    storageKind: "principal",
    valueStrategy: "providedByContext",
  },
  orgId: {
    key: "orgId",
    columnName: "org_id",
    description: "Tenant organization id. For Organization rows, orgId equals id.",
    indexHints: [EntityMixin.IndexHint.btree, EntityMixin.IndexHint.lookup],
    nullable: false,
    storageKind: "entityId",
    valueStrategy: "providedByContext",
  },
  rowVersion: {
    key: "rowVersion",
    columnName: "row_version",
    description: "Positive row version incremented on every write.",
    nullable: false,
    storageKind: "int",
    valueStrategy: "incrementedOnWrite",
  },
  schemaVersion: {
    key: "schemaVersion",
    columnName: "schema_version",
    description: "Semantic version of the schema that wrote the row.",
    nullable: false,
    storageKind: "semanticVersion",
    valueStrategy: "providedByContext",
  },
  source: {
    key: "source",
    columnName: "source",
    description: "Denormalized source-kind facet for filtering and audit dashboards.",
    indexHints: [EntityMixin.IndexHint.btree, EntityMixin.IndexHint.lookup],
    nullable: false,
    storageKind: "literal",
    valueStrategy: "derived",
  },
  updatedAt: {
    key: "updatedAt",
    columnName: "updated_at",
    description: "Epoch-millis timestamp updated on every row mutation.",
    nullable: false,
    storageKind: "timestampMillis",
    valueStrategy: "updatedOnWrite",
  },
  updatedByPrincipal: {
    key: "updatedByPrincipal",
    columnName: "updated_by_principal",
    description: "Principal responsible for the most recent row mutation.",
    nullable: false,
    storageKind: "principal",
    valueStrategy: "providedByContext",
  },
} as const satisfies EntityMixin.FieldDescriptorMap<typeof fields>;

/**
 * Complete literal-preserving descriptor map for an entity and its mixins.
 *
 * @since 0.0.0
 * @category fields
 */
export type FieldMapFor<
  Entity extends EntityId.Any,
  Mixins extends EntityMixin.Pack = EntityMixin.EmptyPack,
> = EntityFieldMap<Entity> & typeof fieldMap & Mixins["fieldMap"];

/**
 * Metadata attached to every class returned by {@link BaseEntity.extend}.
 *
 * @since 0.0.0
 * @category models
 */
export type Definition<
  Entity extends EntityId.Any = EntityId.Any,
  Mixins extends EntityMixin.Pack = EntityMixin.Pack,
> = {
  readonly entityId: Entity;
  readonly fieldMap: FieldMapFor<Entity, Mixins>;
  readonly mixins: Mixins;
};

/**
 * Inner overloaded builder returned by {@link BaseEntity.extend}.
 *
 * @since 0.0.0
 * @category constructors
 */
export interface ExtendBuilder<Self> {
  <const Entity extends EntityId.Any, const Fields extends StructInput>(
    entityId: Entity,
    fields: Fields,
    annotations?: unknown
  ): ModelClassFor<Self, MergedModelFields<Entity, EntityMixin.EmptyPack, Fields>> & {
    readonly definition: Definition<Entity, EntityMixin.EmptyPack>;
  };
  <const Entity extends EntityId.Any, const Mixins extends EntityMixin.Pack, const Fields extends StructInput>(
    entityId: Entity,
    mixins: Mixins,
    fields: Fields,
    annotations?: unknown
  ): ModelClassFor<Self, MergedModelFields<Entity, Mixins, Fields>> & {
    readonly definition: Definition<Entity, Mixins>;
  };
}

class BaseEntityBaseClass extends Model.Class<BaseEntityBaseClass>($I`BaseEntity`)(
  fields,
  $I.annote("BaseEntity", {
    description: "Base persisted entity shape shared by every product entity.",
  })
) {}

/**
 * Public BaseEntity constructor surface.
 *
 * @example
 * ```ts
 * import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity"
 *
 * const extendBaseEntity = BaseEntity.extend
 * void extendBaseEntity
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export type Constructor = Omit<typeof BaseEntityBaseClass, "extend"> & {
  readonly definition: {
    readonly fieldMap: typeof fieldMap;
  };
  extend<Self = never>(identifier: string): ExtendBuilder<Self>;
};

const entityFields = (entityId: EntityId.Any): Record<string, FieldInput> => ({
  entityType: Model.GeneratedByApp(
    S.Literal(entityId.entityType).pipe(
      $I.annoteSchema(`${entityId.entityType}EntityType`, {
        description: `Persisted entity type for ${entityId.entityType}.`,
      })
    )
  ),
  id: Model.Generated(entityId),
});

const entityFieldMap = <const Entity extends EntityId.Any>(entityId: Entity): EntityFieldMap<Entity> =>
  ({
    entityType: {
      key: "entityType",
      columnName: "entity_type",
      description: `Persisted discriminator for ${entityId.entityType}.`,
      indexHints: [EntityMixin.IndexHint.btree, EntityMixin.IndexHint.lookup],
      nullable: false,
      storageKind: "literal",
      valueStrategy: "derived",
    },
    id: {
      key: "id",
      columnName: "id",
      description: `Primary key for ${entityId.entityType}.`,
      nullable: false,
      storageKind: "entityId",
      valueStrategy: "generatedOnInsert",
    },
  }) satisfies EntityFieldMap<Entity>;

const fieldMapInputFromRuntime = (input: unknown): Record<string, FieldInput | FieldOverrideInput | undefined> =>
  input as Record<string, FieldInput | FieldOverrideInput | undefined>;

const normalizeFields = (input: StructInput): Record<string, FieldInput | FieldOverrideInput> =>
  R.filter(
    fieldMapInputFromRuntime(VariantSchema.isStruct(input) ? VariantSchema.fields(input) : input),
    P.isNotUndefined
  );

const fieldInputFromRuntime = (field: unknown): FieldInput => field as FieldInput;

/**
 * Error thrown when two entity field contributors define the same field
 * without an explicit override.
 *
 * @example
 * ```ts
 * import { FieldCollisionError } from "@beep/shared-domain/entity/BaseEntity"
 *
 * const error = new FieldCollisionError({
 *   fieldKey: "name",
 *   sourceName: "EntityMixin fields",
 * })
 *
 * console.log(error.message)
 * ```
 *
 * @since 0.0.0
 * @category errors
 */
export class FieldCollisionError extends S.TaggedErrorClass<FieldCollisionError>($I`FieldCollisionError`)(
  "FieldCollisionError",
  {
    fieldKey: S.String,
    sourceName: S.String,
  },
  $I.annote("FieldCollisionError", {
    description: "Raised when BaseEntity cannot merge fields because a field key collides without an override.",
  })
) {
  override get message() {
    return `BaseEntity field collision for "${this.fieldKey}" while merging ${this.sourceName}. Use EntityMixin.Override to make it explicit.`;
  }
}

const setField = (
  target: Record<string, FieldInput>,
  key: string,
  field: FieldInput | FieldOverrideInput,
  sourceName: string
): void => {
  if (key in target && !EntityMixin.isOverride(field)) {
    throw new FieldCollisionError({ fieldKey: key, sourceName });
  }
  target[key] = fieldInputFromRuntime(EntityMixin.isOverride(field) ? field.field : field);
};

const mergeFields = (
  entityId: EntityId.Any,
  mixins: EntityMixin.Pack,
  entitySpecificFields: StructInput
): Record<string, FieldInput> => {
  const merged: Record<string, FieldInput> = {};
  const idFields = entityFields(entityId);
  for (const [key, field] of Struct.entries(idFields)) {
    setField(merged, key, field, "entity id fields");
  }
  for (const [key, field] of Struct.entries(fields)) {
    setField(merged, key, field, "BaseEntity fields");
  }
  for (const [key, field] of Struct.entries(normalizeFields(mixins.fields))) {
    setField(merged, key, field, "EntityMixin fields");
  }
  for (const [key, field] of Struct.entries(normalizeFields(entitySpecificFields))) {
    setField(merged, key, field, "entity-specific fields");
  }
  return merged;
};

const structInputFromOverload = (input: unknown): StructInput => input as StructInput;

const modelClassFromRuntime = <Self>(
  identifier: string,
  fields: Record<string, FieldInput>,
  annotations: unknown
): object => Model.Class<Self>(identifier)(fields, annotations as never) as object;

const assignStatics = <Target extends object, Statics extends object>(
  target: Target,
  statics: Statics
): Target & Statics => globalThis.Object.assign(target, statics);

const extendBuilderFromRuntime = <Self>(
  builder: (
    entityId: EntityId.Any,
    mixinsOrFields: EntityMixin.Pack | StructInput,
    fieldsOrAnnotations?: StructInput | unknown,
    annotations?: unknown
  ) => object
): ExtendBuilder<Self> => builder as ExtendBuilder<Self>;

/**
 * Build the complete storage-neutral field descriptor map for an entity.
 *
 * @example
 * ```ts
 * import * as BaseEntity from "@beep/shared-domain/entity/BaseEntity"
 * import { OrganizationId } from "@beep/shared-domain/identity/Shared"
 *
 * const map = BaseEntity.fieldMapFor(OrganizationId)
 * console.log(map.id.columnName)
 * ```
 *
 * @since 0.0.0
 * @category fields
 */
export function fieldMapFor<const Entity extends EntityId.Any>(
  entityId: Entity
): FieldMapFor<Entity, EntityMixin.EmptyPack>;
export function fieldMapFor<const Entity extends EntityId.Any, const Mixins extends EntityMixin.Pack>(
  entityId: Entity,
  mixins: Mixins
): FieldMapFor<Entity, Mixins>;
export function fieldMapFor(entityId: EntityId.Any, mixins: EntityMixin.Pack = EntityMixin.pack()) {
  return {
    ...entityFieldMap(entityId),
    ...fieldMap,
    ...mixins.fieldMap,
  };
}

const extend = <Self = never>(identifier: string): ExtendBuilder<Self> =>
  extendBuilderFromRuntime<Self>(
    (
      entityId: EntityId.Any,
      mixinsOrFields: EntityMixin.Pack | StructInput,
      fieldsOrAnnotations?: StructInput | unknown,
      annotations?: unknown
    ) => {
      const hasMixins = EntityMixin.isPack(mixinsOrFields);
      const mixins = hasMixins ? mixinsOrFields : EntityMixin.pack();
      const entitySpecificFields = hasMixins ? structInputFromOverload(fieldsOrAnnotations) : mixinsOrFields;
      const entityAnnotations = hasMixins ? annotations : fieldsOrAnnotations;
      const mergedFields = mergeFields(entityId, mixins, entitySpecificFields);
      const modelClass = modelClassFromRuntime<Self>(identifier, mergedFields, entityAnnotations);

      return assignStatics(modelClass, {
        definition: {
          entityId,
          fieldMap: fieldMapFor(entityId, mixins),
          mixins,
        },
      });
    }
  );

/**
 * Product-facing persisted entity base.
 *
 * @example
 * ```ts
 * import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity"
 * import { OrganizationId } from "@beep/shared-domain/identity/Shared"
 * import * as S from "effect/Schema"
 *
 * class Organization extends BaseEntity.extend<Organization>("Organization")(
 *   OrganizationId,
 *   { name: S.String }
 * ) {}
 *
 * console.log(Organization.definition.entityId.tableName)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
const BaseEntityWithDefinition = assignStatics(BaseEntityBaseClass, {
  definition: {
    fieldMap,
  },
});

globalThis.Object.defineProperty(BaseEntityWithDefinition, "extend", {
  value: extend,
  configurable: true,
});

const constructorFromRuntime = (constructor: typeof BaseEntityWithDefinition): Constructor =>
  constructor as unknown as Constructor;

/**
 * Product-facing persisted entity base.
 *
 * @example
 * ```ts
 * import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity"
 * import { OrganizationId } from "@beep/shared-domain/identity/Shared"
 * import * as S from "effect/Schema"
 *
 * class Organization extends BaseEntity.extend<Organization>("Organization")(
 *   OrganizationId,
 *   { name: S.String }
 * ) {}
 *
 * console.log(Organization.definition.entityId.tableName)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const BaseEntity = constructorFromRuntime(BaseEntityWithDefinition);

/**
 * Runtime type for {@link BaseEntity}.
 *
 * @since 0.0.0
 * @category models
 */
export type BaseEntity = typeof BaseEntity.Type;
