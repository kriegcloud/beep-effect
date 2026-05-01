/**
 * Drizzle table projection for schema-first entities.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as EntitySchema from "@beep/schema/EntitySchema";
import * as Struct from "@beep/utils/Struct";
import { getColumns } from "drizzle-orm";
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
  type Set$Type,
  type SetIsPrimaryKey,
  type SetNotNull,
  serial,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { Match, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as R from "effect/Record";
import type * as S from "effect/Schema";

type EncodedAllowsNull<Encoded> = null extends Encoded ? true : false;

type TypedBuilder<Builder extends AnyPgColumnBuilder, Encoded> = Set$Type<Builder, Encoded>;

type ColumnMethods<Builder extends AnyPgColumnBuilder> = Builder & {
  readonly $type: <Type>() => Set$Type<Builder, Type>;
  readonly notNull: () => SetNotNull<Builder>;
  readonly primaryKey: () => SetIsPrimaryKey<Builder>;
};

type FieldDescriptor = EntitySchema.PersistDescriptorByValueStrategy<EntitySchema.PersistDescriptor>;
type EntityIdDescriptor = Extract<FieldDescriptor, { readonly storageKind: "entityId" }>;
type ExtraConfigColumnMap = Record<string, ExtraConfigColumn>;

type EntityIdColumnBuilderFor<Descriptor extends FieldDescriptor, Encoded> = Descriptor extends unknown
  ? Descriptor["valueStrategy"] extends "generatedOnInsert"
    ? TypedBuilder<PgSerialBuilder, Encoded>
    : TypedBuilder<PgIntegerBuilder, Encoded>
  : never;

type EntityIdColumnBuilderBaseFor<Descriptor extends FieldDescriptor> = Descriptor extends unknown
  ? Descriptor["valueStrategy"] extends "generatedOnInsert"
    ? PgSerialBuilder
    : PgIntegerBuilder
  : never;

type ColumnBuilderBaseFor<Descriptor extends FieldDescriptor, Encoded> = Descriptor extends unknown
  ? Descriptor["storageKind"] extends "blob"
    ? TypedBuilder<PgByteaBuilder, Encoded>
    : Descriptor["storageKind"] extends "bool"
      ? TypedBuilder<PgBooleanBuilder, Encoded>
      : Descriptor["storageKind"] extends "entityId"
        ? EntityIdColumnBuilderFor<Descriptor, Encoded>
        : Descriptor["storageKind"] extends "int"
          ? TypedBuilder<PgIntegerBuilder, Encoded>
          : Descriptor["storageKind"] extends "jsonb"
            ? TypedBuilder<PgJsonbBuilder, Encoded>
            : Descriptor["storageKind"] extends "timestampMillis"
              ? TypedBuilder<PgBigInt53Builder, Encoded>
              : TypedBuilder<PgTextBuilder, Encoded>
  : never;

type ColumnBuilderWithNullability<
  Descriptor extends FieldDescriptor,
  Encoded,
  Builder extends AnyPgColumnBuilder,
> = Descriptor["valueStrategy"] extends "generatedOnInsert"
  ? SetIsPrimaryKey<TypedBuilder<PgSerialBuilder, Encoded>>
  : EncodedAllowsNull<Encoded> extends true
    ? Builder
    : SetNotNull<Builder>;

/**
 * Drizzle column builder type derived from one persisted descriptor.
 *
 * @since 0.0.0
 * @category models
 */
export type ColumnBuilderFor<Descriptor extends FieldDescriptor, Encoded> = ColumnBuilderWithNullability<
  Descriptor,
  Encoded,
  ColumnBuilderBaseFor<Descriptor, Encoded>
>;

/**
 * Drizzle column-builder map derived from an entity definition.
 *
 * @since 0.0.0
 * @category models
 */
export type ColumnBuilderMapFor<Definition extends EntitySchema.Definition> = {
  readonly [K in keyof Definition["persisted"] & string]: K extends keyof Definition["fields"]
    ? ColumnBuilderFor<Definition["persisted"][K], S.Codec.Encoded<Definition["fields"][K]>>
    : never;
};

/**
 * Drizzle table type derived from a schema-first entity class.
 *
 * @since 0.0.0
 * @category models
 */
export type TableFor<Entity extends EntitySchema.EntityClass.Any> = PgTableWithColumns<{
  name: EntitySchema.EntityClass.DefinitionOf<Entity>["tableName"];
  schema: undefined;
  columns: PgBuildColumns<
    EntitySchema.EntityClass.DefinitionOf<Entity>["tableName"],
    ColumnBuilderMapFor<EntitySchema.EntityClass.DefinitionOf<Entity>>
  >;
  dialect: "pg";
}> & {
  readonly definition: EntitySchema.EntityClass.DefinitionOf<Entity>;
  readonly entitySchema: Entity;
};

const notNullColumn = <Builder extends AnyPgColumnBuilder>(column: Builder): SetNotNull<Builder> =>
  (column as ColumnMethods<Builder>).notNull();

const columnWithNullability = <
  const Field extends S.Top,
  const Descriptor extends FieldDescriptor,
  Builder extends AnyPgColumnBuilder,
>(
  key: string,
  field: Field,
  descriptor: Descriptor,
  column: Builder
): ColumnBuilderWithNullability<Descriptor, S.Codec.Encoded<Field>, Builder> => {
  if (descriptor.valueStrategy === "generatedOnInsert") {
    return (column as ColumnMethods<Builder>).primaryKey() as ColumnBuilderWithNullability<
      Descriptor,
      S.Codec.Encoded<Field>,
      Builder
    >;
  }
  return (
    EntitySchema.selectedRowFieldShape(key, field).allowsNull ? column : notNullColumn(column)
  ) as ColumnBuilderWithNullability<Descriptor, S.Codec.Encoded<Field>, Builder>;
};

function entityIdColumn<const Descriptor extends EntityIdDescriptor>(
  key: string,
  descriptor: Descriptor
): EntityIdColumnBuilderBaseFor<Descriptor>;
function entityIdColumn(key: string, descriptor: EntityIdDescriptor): EntityIdColumnBuilderBaseFor<EntityIdDescriptor> {
  const columnName = EntitySchema.columnNameFor(key, descriptor);
  return Match.value(descriptor).pipe(
    Match.withReturnType<EntityIdColumnBuilderBaseFor<EntityIdDescriptor>>(),
    Match.discriminatorsExhaustive("valueStrategy")({
      computedByService: () => integer(columnName),
      defaultedOnInsert: () => integer(columnName),
      derived: () => integer(columnName),
      generatedOnInsert: () => serial(columnName),
      incrementedOnWrite: () => integer(columnName),
      provided: () => integer(columnName),
      providedByContext: () => integer(columnName),
      updatedOnWrite: () => integer(columnName),
    })
  );
}

const baseColumnFor = (key: string, descriptor: FieldDescriptor): AnyPgColumnBuilder => {
  const columnName = EntitySchema.columnNameFor(key, descriptor);
  return Match.value(descriptor).pipe(
    Match.withReturnType<AnyPgColumnBuilder>(),
    Match.discriminatorsExhaustive("storageKind")({
      blob: () => bytea(columnName),
      bool: () => boolean(columnName),
      entityId: (self) => entityIdColumn(key, self),
      int: () => integer(columnName),
      jsonb: () => jsonb(columnName),
      literal: () => text(columnName),
      text: () => text(columnName),
      timestampMillis: () => bigint(columnName, { mode: "number" }),
    })
  );
};

const typedColumnFor = <const Field extends S.Top, const Descriptor extends FieldDescriptor>(
  key: string,
  field: Field,
  descriptor: Descriptor
): ColumnBuilderFor<Descriptor, S.Codec.Encoded<Field>> => {
  const column = (baseColumnFor(key, descriptor) as ColumnMethods<AnyPgColumnBuilder>).$type<S.Codec.Encoded<Field>>();
  return columnWithNullability(key, field, descriptor, column) as ColumnBuilderFor<Descriptor, S.Codec.Encoded<Field>>;
};

const columnsFor = <const Definition extends EntitySchema.Definition>(
  definition: Definition
): ColumnBuilderMapFor<Definition> => {
  const columns: Record<string, AnyPgColumnBuilder> = {};
  for (const key of Struct.keys(definition.persisted)) {
    columns[key] = typedColumnFor(key, definition.fields[key], definition.persisted[key]);
  }
  return columns as ColumnBuilderMapFor<Definition>;
};

const columnNameForAny = (key: string, descriptor: EntitySchema.PersistDescriptor.Any): string =>
  descriptor.columnName ?? EntitySchema.columnNameFor(key, descriptor as EntitySchema.PersistDescriptor);

const indexName = (
  tableName: string,
  key: string,
  descriptor: EntitySchema.PersistDescriptor.Any,
  hint: EntitySchema.IndexHint
): string => `${tableName}_${columnNameForAny(key, descriptor)}_${hint.kind}_idx`;

const isJsonbIndexableStorageKind = (storageKind: EntitySchema.StorageKind): boolean =>
  EntitySchema.StorageKind.is.jsonb(storageKind);

const isScalarIndexableStorageKind = (storageKind: EntitySchema.StorageKind): boolean =>
  EntitySchema.StorageKind.is.bool(storageKind) ||
  EntitySchema.StorageKind.is.entityId(storageKind) ||
  EntitySchema.StorageKind.is.int(storageKind) ||
  EntitySchema.StorageKind.is.literal(storageKind) ||
  EntitySchema.StorageKind.is.text(storageKind) ||
  EntitySchema.StorageKind.is.timestampMillis(storageKind);

const supportsIndexHint = (descriptor: EntitySchema.PersistDescriptor.Any, hint: EntitySchema.IndexHint): boolean =>
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

const hasHintKind = (hints: ReadonlyArray<EntitySchema.IndexHint>, kind: EntitySchema.IndexHintKind): boolean =>
  pipe(
    hints,
    A.some((hint) => hint.kind === kind)
  );

const indexHintsForDescriptor = (
  descriptor: EntitySchema.PersistDescriptor.Any
): ReadonlyArray<EntitySchema.IndexHint> =>
  pipe(
    O.fromNullishOr(descriptor.indexHints),
    O.map((hints) =>
      pipe(
        hints,
        A.filter((hint) => supportsIndexHint(descriptor, hint)),
        A.filter((hint) => hint.kind !== "lookup" || !hasHintKind(hints, "btree"))
      )
    ),
    O.getOrElse(A.empty<EntitySchema.IndexHint>)
  );

const indexFor = (
  tableName: string,
  key: string,
  descriptor: EntitySchema.PersistDescriptor.Any,
  column: ExtraConfigColumn,
  hint: EntitySchema.IndexHint
): PgTableExtraConfigValue =>
  Match.value(hint).pipe(
    Match.withReturnType<PgTableExtraConfigValue>(),
    Match.discriminatorsExhaustive("kind")({
      btree: (self) => index(indexName(tableName, key, descriptor, self)).on(column),
      gin: (self) => index(indexName(tableName, key, descriptor, self)).using("gin", column),
      hash: (self) => index(indexName(tableName, key, descriptor, self)).using("hash", column),
      lookup: (self) => index(indexName(tableName, key, descriptor, self)).on(column),
      unique: (self) => uniqueIndex(indexName(tableName, key, descriptor, self)).on(column),
    })
  );

const indexesForDescriptor = (
  tableName: string,
  columns: ExtraConfigColumnMap,
  key: string,
  descriptor: EntitySchema.PersistDescriptor.Any
): Array<PgTableExtraConfigValue> =>
  pipe(
    R.get(columns, key),
    O.map((column) =>
      pipe(
        indexHintsForDescriptor(descriptor),
        A.map((hint) => indexFor(tableName, key, descriptor, column, hint))
      )
    ),
    O.getOrElse(A.empty<PgTableExtraConfigValue>)
  );

const indexesFor = (
  tableName: string,
  definition: EntitySchema.Definition,
  columns: ExtraConfigColumnMap
): Array<PgTableExtraConfigValue> =>
  pipe(
    Struct.entries(definition.persisted),
    A.flatMap(([key, descriptor]) => indexesForDescriptor(tableName, columns, key, descriptor))
  );

const attachTableMetadata = <const Entity extends EntitySchema.EntityClass.Any>(
  table: object,
  definition: EntitySchema.EntityClass.DefinitionOf<Entity>,
  entitySchema: Entity
): TableFor<Entity> => {
  Reflect.defineProperty(table, "definition", {
    configurable: false,
    enumerable: true,
    value: definition,
  });
  Reflect.defineProperty(table, "entitySchema", {
    configurable: false,
    enumerable: true,
    value: entitySchema,
  });
  return table as TableFor<Entity>;
};

/**
 * Project a schema-first entity class into a typed Postgres Drizzle table.
 *
 * @since 0.0.0
 * @category constructors
 */
export const pgTableFrom = <const Entity extends EntitySchema.EntityClass.Any>(entity: Entity): TableFor<Entity> => {
  const definition = EntitySchema.getDefinition(entity);
  const table = pgTable(
    definition.tableName,
    () => columnsFor(definition),
    (columns) => indexesFor(definition.tableName, definition, columns)
  );
  return attachTableMetadata(table, definition, entity);
};

/**
 * Get projected table columns using Drizzle metadata.
 *
 * @since 0.0.0
 * @category accessors
 */
export const columns = getColumns;
