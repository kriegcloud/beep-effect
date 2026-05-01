import * as EntitySchema from "./entity-schema.ts";
import * as Struct from "@beep/utils/Struct";
import {
  type AnyPgColumnBuilder,
  bigint,
  integer,
  jsonb,
  type PgBigInt53Builder,
  type PgBuildColumns,
  type PgIntegerBuilder,
  type PgJsonbBuilder,
  type PgSerialBuilder,
  type PgTableWithColumns,
  type PgTextBuilder,
  pgTable,
  type Set$Type,
  type SetIsPrimaryKey,
  type SetNotNull,
  serial,
  text,
} from "drizzle-orm/pg-core";
import { Match } from "effect";
import * as S from "effect/Schema";

type EncodedAllowsNull<Encoded> = null extends Encoded ? true : false;

type TypedBuilder<Builder extends AnyPgColumnBuilder, Encoded> = Set$Type<Builder, Encoded>;

type ColumnMethods<Builder extends AnyPgColumnBuilder> = Builder & {
  readonly $type: <Type>() => Set$Type<Builder, Type>;
  readonly notNull: () => SetNotNull<Builder>;
  readonly primaryKey: () => SetIsPrimaryKey<Builder>;
};

type FieldDescriptor = EntitySchema.PersistDescriptorByValueStrategy<EntitySchema.PersistDescriptor>;
type EntityIdDescriptor = Extract<FieldDescriptor, { readonly storageKind: "entityId" }>;

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
  ? Descriptor["storageKind"] extends "entityId"
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

export type ColumnBuilderFor<
  Descriptor extends FieldDescriptor,
  Encoded,
> = ColumnBuilderWithNullability<Descriptor, Encoded, ColumnBuilderBaseFor<Descriptor, Encoded>>;

export type ColumnBuilderMapFor<Definition extends EntitySchema.Definition> = {
  readonly [K in keyof Definition["persisted"] & string]: K extends keyof Definition["fields"]
    ? ColumnBuilderFor<Definition["persisted"][K], S.Codec.Encoded<Definition["fields"][K]>>
    : never;
};

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
      derived: () => integer(columnName),
      generatedOnInsert: () => serial(columnName),
      provided: () => integer(columnName),
    })
  );
}

const baseColumnFor = (key: string, descriptor: FieldDescriptor): AnyPgColumnBuilder => {
  const columnName = EntitySchema.columnNameFor(key, descriptor);
  return Match.value(descriptor).pipe(
    Match.withReturnType<AnyPgColumnBuilder>(),
    Match.discriminatorsExhaustive("storageKind")({
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

export const pgTableFrom = <const Entity extends EntitySchema.EntityClass.Any>(entity: Entity): TableFor<Entity> => {
  const definition = EntitySchema.getDefinition(entity);
  const table = pgTable(definition.tableName, () => columnsFor(definition));
  return attachTableMetadata(table, definition, entity);
};
