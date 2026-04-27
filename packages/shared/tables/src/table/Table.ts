/**
 * Shared-kernel Drizzle table constructor.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as BaseEntity from "@beep/shared-domain/entity/BaseEntity";
import type * as EntityId from "@beep/shared-domain/entity/EntityId";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import {
  type AnyPgColumnBuilder,
  bigint,
  boolean,
  bytea,
  type ExtraConfigColumn,
  index,
  integer,
  jsonb,
  type PgBigInt53Builder,
  type PgBooleanBuilder,
  type PgBuildColumns,
  type PgByteaBuilder,
  type PgIntegerBuilder,
  type PgJsonbBuilder,
  type PgSerialBuilder,
  type PgTableExtraConfigValue,
  type PgTableWithColumns,
  type PgTextBuilder,
  pgTable,
  type SetIsPrimaryKey,
  type SetNotNull,
  serial,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { Match, pipe, Struct } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";

type ExtraConfigColumnMap = Record<string, ExtraConfigColumn>;
type NotNullColumnBuilder<Builder extends AnyPgColumnBuilder> = Builder & {
  readonly notNull: () => SetNotNull<Builder>;
};
type FieldDescriptor = EntityMixin.FieldDescriptorByValueStrategy<EntityMixin.FieldDescriptor>;
type EntityIdDescriptor = Extract<FieldDescriptor, { readonly storageKind: "entityId" }>;

type EntityIdColumnBuilderFor<Descriptor extends FieldDescriptor> = Descriptor extends {
  readonly valueStrategy: "generatedOnInsert";
}
  ? SetIsPrimaryKey<PgSerialBuilder>
  : PgIntegerBuilder;

type ColumnBuilderBaseFor<Descriptor extends FieldDescriptor> = Descriptor extends unknown
  ? Descriptor["storageKind"] extends "blob"
    ? PgByteaBuilder
    : Descriptor["storageKind"] extends "bool"
      ? PgBooleanBuilder
      : Descriptor["storageKind"] extends "entityId"
        ? EntityIdColumnBuilderFor<Descriptor>
        : Descriptor["storageKind"] extends "entityRef" | "json" | "principal" | "vectorClock"
          ? PgJsonbBuilder
          : Descriptor["storageKind"] extends "int"
            ? PgIntegerBuilder
            : Descriptor["storageKind"] extends "timestampMillis"
              ? PgBigInt53Builder
              : PgTextBuilder
  : never;

type ColumnBuilderWithNullability<
  Descriptor extends FieldDescriptor,
  Builder extends AnyPgColumnBuilder,
> = Descriptor extends unknown
  ? Descriptor["key"] extends "id"
    ? Builder
    : Descriptor["nullable"] extends false
      ? SetNotNull<Builder>
      : Builder
  : never;

/**
 * Drizzle column builder type derived from one storage-neutral descriptor.
 *
 * @since 0.0.0
 * @category models
 */
export type ColumnBuilderFor<Descriptor extends FieldDescriptor> = Descriptor extends unknown
  ? ColumnBuilderWithNullability<Descriptor, ColumnBuilderBaseFor<Descriptor>>
  : never;

/**
 * Drizzle column builder map derived from a storage-neutral descriptor map.
 *
 * @since 0.0.0
 * @category models
 */
export type ColumnBuilderMapFor<FieldMap extends object> = {
  readonly [K in keyof FieldMap & string]: FieldMap[K] extends EntityMixin.FieldDescriptor
    ? ColumnBuilderFor<EntityMixin.FieldDescriptorByValueStrategy<FieldMap[K]>>
    : never;
};

/**
 * Drizzle table type derived from shared-kernel entity metadata.
 *
 * @since 0.0.0
 * @category models
 */
export type TableFor<
  Entity extends EntityId.Any,
  Mixins extends EntityMixin.Pack = EntityMixin.EmptyPack,
> = PgTableWithColumns<{
  name: Entity["tableName"];
  schema: undefined;
  columns: PgBuildColumns<Entity["tableName"], ColumnBuilderMapFor<BaseEntity.FieldMapFor<Entity, Mixins>>>;
  dialect: "pg";
}> &
  WithDefinition<Entity, Mixins>;

/**
 * Metadata attached to tables created by {@link make}.
 *
 * @example
 * ```ts
 * import type { Definition } from "@beep/shared-tables/table/Table"
 *
 * const tableName: Definition["tableName"] = "shared_organization"
 * console.log(tableName)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type Definition<
  Entity extends EntityId.Any = EntityId.Any,
  Mixins extends EntityMixin.Pack = EntityMixin.Pack,
> = {
  readonly entityId: Entity;
  readonly fieldMap: BaseEntity.FieldMapFor<Entity, Mixins>;
  readonly tableName: Entity["tableName"];
};

/**
 * Drizzle table with shared-kernel metadata attached.
 *
 * @example
 * ```ts
 * import type { WithDefinition } from "@beep/shared-tables/table/Table"
 *
 * declare const table: WithDefinition
 * console.log(table.definition.tableName)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type WithDefinition<
  Entity extends EntityId.Any = EntityId.Any,
  Mixins extends EntityMixin.Pack = EntityMixin.Pack,
> = {
  readonly definition: Definition<Entity, Mixins>;
};

const nullable = <const Descriptor extends FieldDescriptor, Builder extends AnyPgColumnBuilder>(
  descriptor: Descriptor,
  column: Builder
): ColumnBuilderWithNullability<Descriptor, Builder> =>
  (descriptor.key === "id" || descriptor.nullable
    ? column
    : (column as NotNullColumnBuilder<Builder>).notNull()) as ColumnBuilderWithNullability<Descriptor, Builder>;

function entityIdColumn<const Descriptor extends EntityIdDescriptor>(
  descriptor: Descriptor
): EntityIdColumnBuilderFor<Descriptor>;
function entityIdColumn(descriptor: EntityIdDescriptor): EntityIdColumnBuilderFor<EntityIdDescriptor> {
  return Match.value(descriptor).pipe(
    Match.withReturnType<EntityIdColumnBuilderFor<EntityIdDescriptor>>(),
    Match.discriminatorsExhaustive("valueStrategy")({
      computedByService: (self) => integer(self.columnName),
      defaultedOnInsert: (self) => integer(self.columnName),
      derived: (self) => integer(self.columnName),
      generatedOnInsert: (self) => serial(self.columnName).primaryKey(),
      incrementedOnWrite: (self) => integer(self.columnName),
      provided: (self) => integer(self.columnName),
      providedByContext: (self) => integer(self.columnName),
      updatedOnWrite: (self) => integer(self.columnName),
    })
  );
}

function columnFor<const Descriptor extends FieldDescriptor>(descriptor: Descriptor): ColumnBuilderFor<Descriptor>;
function columnFor(descriptor: FieldDescriptor): ColumnBuilderFor<FieldDescriptor> {
  return Match.value(descriptor).pipe(
    Match.withReturnType<ColumnBuilderFor<FieldDescriptor>>(),
    Match.discriminatorsExhaustive("storageKind")({
      blob: (self) => nullable(self, bytea(self.columnName)),
      bool: (self) => nullable(self, boolean(self.columnName)),
      encryptionKeyId: (self) => nullable(self, text(self.columnName)),
      entityId: (self) => nullable(self, entityIdColumn(self)),
      entityRef: (self) => nullable(self, jsonb(self.columnName)),
      hybridLogicalClock: (self) => nullable(self, text(self.columnName)),
      int: (self) => nullable(self, integer(self.columnName)),
      json: (self) => nullable(self, jsonb(self.columnName)),
      literal: (self) => nullable(self, text(self.columnName)),
      principal: (self) => nullable(self, jsonb(self.columnName)),
      semanticVersion: (self) => nullable(self, text(self.columnName)),
      sha256: (self) => nullable(self, text(self.columnName)),
      signature: (self) => nullable(self, text(self.columnName)),
      text: (self) => nullable(self, text(self.columnName)),
      timestampMillis: (self) => nullable(self, bigint(self.columnName, { mode: "number" })),
      vectorClock: (self) => nullable(self, jsonb(self.columnName)),
    })
  );
}

const columnsFor = <const FieldMap extends object>(fieldMap: FieldMap): ColumnBuilderMapFor<FieldMap> =>
  R.map(fieldMap as Record<string, EntityMixin.FieldDescriptor>, columnFor) as ColumnBuilderMapFor<FieldMap>;

const indexName = (tableName: string, descriptor: EntityMixin.FieldDescriptor, hint: EntityMixin.IndexHint): string =>
  `${tableName}_${descriptor.columnName}_${hint.kind}_idx`;

const indexFor = (
  tableName: string,
  descriptor: EntityMixin.FieldDescriptor,
  column: ExtraConfigColumn,
  hint: EntityMixin.IndexHint
): PgTableExtraConfigValue =>
  Match.value(hint).pipe(
    Match.withReturnType<PgTableExtraConfigValue>(),
    Match.discriminatorsExhaustive("kind")({
      btree: (self) => index(indexName(tableName, descriptor, self)).on(column),
      gin: (self) => index(indexName(tableName, descriptor, self)).using("gin", column),
      hash: (self) => index(indexName(tableName, descriptor, self)).using("hash", column),
      lookup: (self) => index(indexName(tableName, descriptor, self)).on(column),
      unique: (self) => uniqueIndex(indexName(tableName, descriptor, self)).on(column),
    })
  );

const indexesForDescriptor = (
  tableName: string,
  columns: ExtraConfigColumnMap,
  descriptor: EntityMixin.FieldDescriptor
): Array<PgTableExtraConfigValue> =>
  pipe(
    R.get(columns, descriptor.key),
    O.map((column) =>
      pipe(
        O.fromNullishOr(descriptor.indexHints),
        O.map(A.map((hint) => indexFor(tableName, descriptor, column, hint))),
        O.getOrElse(A.empty<PgTableExtraConfigValue>)
      )
    ),
    O.getOrElse(A.empty<PgTableExtraConfigValue>)
  );

const indexesFor = (
  tableName: string,
  fieldMap: Record<string, EntityMixin.FieldDescriptor>,
  columns: ExtraConfigColumnMap
): Array<PgTableExtraConfigValue> =>
  pipe(
    R.values(fieldMap),
    A.flatMap((descriptor) => indexesForDescriptor(tableName, columns, descriptor))
  );

/**
 * Build a Postgres Drizzle table from canonical shared-kernel entity metadata.
 *
 * @example
 * ```ts
 * import { OrganizationId } from "@beep/shared-domain/identity/Shared"
 * import * as Table from "@beep/shared-tables/table/Table"
 *
 * const OrganizationTable = Table.make(OrganizationId)
 * console.log(OrganizationTable.definition.tableName)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const make = <const Entity extends EntityId.Any, const Mixins extends EntityMixin.Pack = EntityMixin.EmptyPack>(
  entityId: Entity,
  mixins?: Mixins
): TableFor<Entity, Mixins> => {
  const resolvedMixins = (mixins ?? EntityMixin.pack()) as Mixins;
  const fieldMap = BaseEntity.fieldMapFor(entityId, resolvedMixins);
  const table = pgTable(
    entityId.tableName,
    () => columnsFor(fieldMap),
    (columns) => indexesFor(entityId.tableName, fieldMap, columns)
  );
  return Struct.assign(table, {
    definition: {
      entityId,
      fieldMap,
      tableName: entityId.tableName,
    },
  }) as TableFor<Entity, Mixins>;
};
