import { $SchemaId } from "@beep/identity";
import { EntityTable } from "@beep/drizzle";
import * as EntitySchema from "@beep/schema/EntitySchema";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

const $I = $SchemaId.create("EntityTable.dtslint");

const FixtureIdSchema = S.Int.pipe(S.brand("FixtureId"));

const FixtureId = Object.assign(FixtureIdSchema, {
  brand: "FixtureId",
  entityType: "Fixture",
  resource: "fixture",
  tableName: "fixture",
}) as typeof FixtureIdSchema & {
  readonly brand: "FixtureId";
  readonly entityType: "Fixture";
  readonly resource: "fixture";
  readonly tableName: "fixture";
};

const Fixture = EntitySchema.ClassFactory($I`Fixture`)(
  {
    entityId: FixtureId,
    fields: {
      id: EntitySchema.generatedId(FixtureId),
      isActive: S.Boolean,
      name: S.String,
      optionalName: S.String.pipe(S.OptionFromNullOr),
      payload: S.Record(S.String, S.Unknown),
      rowVersion: EntitySchema.int,
    },
    persisted: {
      id: EntitySchema.persist.entityId({
        valueStrategy: "generatedOnInsert",
      }),
      isActive: EntitySchema.persist.bool({
        columnName: "is_active",
      }),
      name: EntitySchema.persist.text(),
      optionalName: EntitySchema.persist.text({
        columnName: "optional_name",
      }),
      payload: EntitySchema.persist.jsonb(),
      rowVersion: EntitySchema.persist.int({
        columnName: "row_version",
        valueStrategy: "incrementedOnWrite",
      }),
    },
    tableName: "fixture",
  },
  $I.annote("Fixture", {
    description: "Fixture schema-first table projection entity.",
  })
);

const Table = EntityTable.pgTableFrom(Fixture);
const Columns = EntityTable.columns(Table);

describe("EntityTable types", () => {
  it("preserves table definition metadata", () => {
    expect<typeof Table.definition.tableName>().type.toBe<"fixture">();
    expect<typeof Table.definition.entityId.entityType>().type.toBe<"Fixture">();
    expect<typeof Table.definition.persisted.id.storageKind>().type.toBe<"entityId">();
    expect<typeof Table.definition.persisted.id.valueStrategy>().type.toBe<"generatedOnInsert">();
    expect<typeof Table.definition.persisted.payload.storageKind>().type.toBe<"jsonb">();
    expect<typeof Table.entitySchema>().type.toBe<typeof Fixture>();
  });

  it("derives table column metadata types", () => {
    expect<typeof Columns.id.name>().type.toBe<string>();
    expect<typeof Columns.isActive.name>().type.toBe<string>();
    expect<typeof Columns.optionalName.name>().type.toBe<string>();
    expect<typeof Columns.payload.name>().type.toBe<string>();
  });
});
