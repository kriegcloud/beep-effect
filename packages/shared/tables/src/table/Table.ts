/**
 * Shared-kernel PGLite-compatible Drizzle table constructor.
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
 * @example
 * ```ts
 * import { ProfilePack } from "@beep/shared-domain/entities/Organization/Organization.values"
 * import { OrganizationId } from "@beep/shared-domain/identity/Shared"
 * import type { ColumnBuilderFor } from "@beep/shared-tables/table/Table"
 * import * as Table from "@beep/shared-tables/table/Table"
 * import { text } from "drizzle-orm/pg-core"
 *
 * const fieldMap = Table.make(OrganizationId, ProfilePack).definition.fieldMap
 * const slugColumn = text("slug").notNull() satisfies ColumnBuilderFor<typeof fieldMap.slug>
 *
 * console.log(slugColumn)
 * ```
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
 * @example
 * ```ts
 * import { ProfilePack } from "@beep/shared-domain/entities/Organization/Organization.values"
 * import { OrganizationId } from "@beep/shared-domain/identity/Shared"
 * import type { ColumnBuilderMapFor } from "@beep/shared-tables/table/Table"
 * import * as Table from "@beep/shared-tables/table/Table"
 * import { text } from "drizzle-orm/pg-core"
 *
 * const fieldMap = Table.make(OrganizationId, ProfilePack).definition.fieldMap
 * type OrganizationColumnBuilders = ColumnBuilderMapFor<typeof fieldMap>
 *
 * const columns = {
 *   slug: text("slug").notNull(),
 * } satisfies Pick<OrganizationColumnBuilders, "slug">
 *
 * console.log(columns.slug)
 * ```
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
 * @example
 * ```ts
 * import { ProfilePack } from "@beep/shared-domain/entities/Organization/Organization.values"
 * import { OrganizationId } from "@beep/shared-domain/identity/Shared"
 * import type { TableFor } from "@beep/shared-tables/table/Table"
 * import * as Table from "@beep/shared-tables/table/Table"
 *
 * const OrganizationTable: TableFor<typeof OrganizationId, typeof ProfilePack> = Table.make(
 *   OrganizationId,
 *   ProfilePack,
 * )
 *
 * console.log(OrganizationTable.definition.tableName)
 * ```
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
 * import { ProfilePack } from "@beep/shared-domain/entities/Organization/Organization.values"
 * import { OrganizationId } from "@beep/shared-domain/identity/Shared"
 * import type { Definition } from "@beep/shared-tables/table/Table"
 * import * as Table from "@beep/shared-tables/table/Table"
 *
 * const OrganizationTable = Table.make(OrganizationId, ProfilePack)
 * const definition: Definition<typeof OrganizationId, typeof ProfilePack> = OrganizationTable.definition
 *
 * console.log(definition.tableName)
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
 * import { ProfilePack } from "@beep/shared-domain/entities/Organization/Organization.values"
 * import { OrganizationId } from "@beep/shared-domain/identity/Shared"
 * import type { WithDefinition } from "@beep/shared-tables/table/Table"
 * import * as Table from "@beep/shared-tables/table/Table"
 *
 * const OrganizationTable = Table.make(OrganizationId, ProfilePack)
 * const table: WithDefinition<typeof OrganizationId, typeof ProfilePack> = OrganizationTable
 *
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

const notNullColumn = <Builder extends AnyPgColumnBuilder>(column: Builder): SetNotNull<Builder> =>
  (column as NotNullColumnBuilder<Builder>).notNull();

const columnWithNullability = <const Descriptor extends FieldDescriptor, Builder extends AnyPgColumnBuilder>(
  descriptor: Descriptor,
  column: Builder
): ColumnBuilderWithNullability<Descriptor, Builder> =>
  (descriptor.key === "id" || descriptor.nullable ? column : notNullColumn(column)) as ColumnBuilderWithNullability<
    Descriptor,
    Builder
  >;

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
      blob: (self) => columnWithNullability(self, bytea(self.columnName)),
      bool: (self) => columnWithNullability(self, boolean(self.columnName)),
      encryptionKeyId: (self) => columnWithNullability(self, text(self.columnName)),
      entityId: (self) => columnWithNullability(self, entityIdColumn(self)),
      entityRef: (self) => columnWithNullability(self, jsonb(self.columnName)),
      hybridLogicalClock: (self) => columnWithNullability(self, text(self.columnName)),
      int: (self) => columnWithNullability(self, integer(self.columnName)),
      json: (self) => columnWithNullability(self, jsonb(self.columnName)),
      literal: (self) => columnWithNullability(self, text(self.columnName)),
      principal: (self) => columnWithNullability(self, jsonb(self.columnName)),
      semanticVersion: (self) => columnWithNullability(self, text(self.columnName)),
      sha256: (self) => columnWithNullability(self, text(self.columnName)),
      signature: (self) => columnWithNullability(self, text(self.columnName)),
      text: (self) => columnWithNullability(self, text(self.columnName)),
      timestampMillis: (self) => columnWithNullability(self, bigint(self.columnName, { mode: "number" })),
      vectorClock: (self) => columnWithNullability(self, jsonb(self.columnName)),
    })
  );
}

const descriptorRecord = <const FieldMap extends object>(
  fieldMap: FieldMap
): Record<string, EntityMixin.FieldDescriptor> => fieldMap as Record<string, EntityMixin.FieldDescriptor>;

const columnsFor = <const FieldMap extends object>(fieldMap: FieldMap): ColumnBuilderMapFor<FieldMap> =>
  R.map(descriptorRecord(fieldMap), columnFor) as ColumnBuilderMapFor<FieldMap>;

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

const isJsonbIndexableStorageKind = (storageKind: EntityMixin.StorageKind): boolean =>
  EntityMixin.StorageKind.is.entityRef(storageKind) ||
  EntityMixin.StorageKind.is.json(storageKind) ||
  EntityMixin.StorageKind.is.principal(storageKind) ||
  EntityMixin.StorageKind.is.vectorClock(storageKind);

const isScalarIndexableStorageKind = (storageKind: EntityMixin.StorageKind): boolean =>
  EntityMixin.StorageKind.is.bool(storageKind) ||
  EntityMixin.StorageKind.is.encryptionKeyId(storageKind) ||
  EntityMixin.StorageKind.is.entityId(storageKind) ||
  EntityMixin.StorageKind.is.hybridLogicalClock(storageKind) ||
  EntityMixin.StorageKind.is.int(storageKind) ||
  EntityMixin.StorageKind.is.literal(storageKind) ||
  EntityMixin.StorageKind.is.semanticVersion(storageKind) ||
  EntityMixin.StorageKind.is.sha256(storageKind) ||
  EntityMixin.StorageKind.is.signature(storageKind) ||
  EntityMixin.StorageKind.is.text(storageKind) ||
  EntityMixin.StorageKind.is.timestampMillis(storageKind);

const supportsIndexHint = (descriptor: EntityMixin.FieldDescriptor, hint: EntityMixin.IndexHint): boolean =>
  Match.value(hint).pipe(
    Match.withReturnType<boolean>(),
    Match.discriminatorsExhaustive("kind")({
      btree: () => isScalarIndexableStorageKind(descriptor.storageKind),
      gin: () => isJsonbIndexableStorageKind(descriptor.storageKind),
      hash: () => isScalarIndexableStorageKind(descriptor.storageKind),
      lookup: () => isScalarIndexableStorageKind(descriptor.storageKind),
      unique: () => isScalarIndexableStorageKind(descriptor.storageKind),
    })
  );

const hasHintKind = (hints: ReadonlyArray<EntityMixin.IndexHint>, kind: EntityMixin.IndexHintKind): boolean =>
  pipe(
    hints,
    A.some((hint) => hint.kind === kind)
  );

const indexHintsForDescriptor = (descriptor: EntityMixin.FieldDescriptor): ReadonlyArray<EntityMixin.IndexHint> =>
  pipe(
    O.fromNullishOr(descriptor.indexHints),
    O.map((hints) =>
      pipe(
        hints,
        A.filter((hint) => supportsIndexHint(descriptor, hint)),
        A.filter((hint) => hint.kind !== "lookup" || !hasHintKind(hints, "btree"))
      )
    ),
    O.getOrElse(A.empty<EntityMixin.IndexHint>)
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
        indexHintsForDescriptor(descriptor),
        A.map((hint) => indexFor(tableName, descriptor, column, hint))
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
 * Build a PGLite-compatible Postgres Drizzle table from canonical shared-kernel
 * entity metadata.
 *
 * @example
 * ```ts
 * import { ProfilePack } from "@beep/shared-domain/entities/Organization/Organization.values"
 * import { OrganizationId } from "@beep/shared-domain/identity/Shared"
 * import * as Table from "@beep/shared-tables/table/Table"
 *
 * const OrganizationTable = Table.make(OrganizationId, ProfilePack)
 * console.log(OrganizationTable.definition.tableName)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
const tableFromRuntime = <const Entity extends EntityId.Any, const Mixins extends EntityMixin.Pack>(
  table: object,
  definition: Definition<Entity, Mixins>
): TableFor<Entity, Mixins> =>
  Struct.assign(table, {
    definition,
  }) as TableFor<Entity, Mixins>;

const mixinsFromOptional = <const Mixins extends EntityMixin.Pack>(mixins: Mixins | undefined): Mixins =>
  (mixins ?? EntityMixin.pack()) as Mixins;

/**
 * Build a PGLite-compatible Postgres Drizzle table from canonical shared-kernel
 * entity metadata.
 *
 * @example
 * ```ts
 * import { ProfilePack } from "@beep/shared-domain/entities/Organization/Organization.values"
 * import { OrganizationId } from "@beep/shared-domain/identity/Shared"
 * import * as Table from "@beep/shared-tables/table/Table"
 *
 * const OrganizationTable = Table.make(OrganizationId, ProfilePack)
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
  const resolvedMixins = mixinsFromOptional(mixins);
  const fieldMap = BaseEntity.fieldMapFor(entityId, resolvedMixins);
  const table = pgTable(
    entityId.tableName,
    () => columnsFor(fieldMap),
    (columns) => indexesFor(entityId.tableName, fieldMap, columns)
  );
  return tableFromRuntime(table, {
    entityId,
    fieldMap,
    tableName: entityId.tableName,
  });
};
