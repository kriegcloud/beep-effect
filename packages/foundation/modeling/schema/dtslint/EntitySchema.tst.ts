import { $SchemaId } from "@beep/identity";
import * as EntitySchema from "@beep/schema/EntitySchema";
import type * as O from "effect/Option";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

const $I = $SchemaId.create("EntitySchema.dtslint");

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

const fields = {
  id: EntitySchema.generatedId(FixtureId),
  name: S.String,
  optionalName: S.String.pipe(S.OptionFromNullOr),
  payload: S.Record(S.String, S.Unknown),
  rowVersion: EntitySchema.int,
} as const;

const persisted = {
  id: EntitySchema.persist.entityId({
    valueStrategy: "generatedOnInsert",
  }),
  name: EntitySchema.persist.text({
    indexHints: [EntitySchema.IndexHint.unique],
  }),
  optionalName: EntitySchema.persist.text({
    columnName: "optional_name",
  }),
  payload: EntitySchema.persist.jsonb(),
  rowVersion: EntitySchema.persist.int({
    columnName: "row_version",
    valueStrategy: "incrementedOnWrite",
  }),
} as const;

const optionalKeyFields = {
  maybe: S.optionalKey(S.String),
} as const;

const optionalKeyPersisted: EntitySchema.PersistedFor<typeof optionalKeyFields> = {
  // @ts-expect-error!
  maybe: EntitySchema.persist.text(),
};

declare const servicefulField: S.Codec<string, string, "Service", never>;

const servicefulFields = {
  value: servicefulField,
} as const;

const servicefulPersisted: EntitySchema.PersistedFor<typeof servicefulFields> = {
  // @ts-expect-error!
  value: EntitySchema.persist.text(),
};

EntitySchema.defineClassInput({
  fields: {
    name: S.String,
  },
  persisted: {
    name: EntitySchema.persist.text(),
    // @ts-expect-error!
    extra: EntitySchema.persist.text(),
  },
});

const Fixture = EntitySchema.ClassFactory($I`Fixture`)(
  {
    entityId: FixtureId,
    fields,
    persisted,
    tableName: "fixture",
  },
  $I.annote("Fixture", {
    description: "Fixture schema-first entity.",
  })
);

describe("EntitySchema types", () => {
  it("preserves definition and descriptor literals", () => {
    expect<typeof Fixture.definition.tableName>().type.toBe<"fixture">();
    expect<typeof Fixture.definition.entityId.entityType>().type.toBe<"Fixture">();
    expect<typeof Fixture.definition.persisted.id.storageKind>().type.toBe<"entityId">();
    expect<typeof Fixture.definition.persisted.id.valueStrategy>().type.toBe<"generatedOnInsert">();
    expect<typeof Fixture.definition.persisted.name.storageKind>().type.toBe<"text">();
    expect<(typeof Fixture.definition.persisted.name.indexHints)[0]["kind"]>().type.toBe<"unique">();
    expect<typeof Fixture.definition.persisted.optionalName.columnName>().type.toBe<"optional_name">();
    expect<typeof Fixture.definition.persisted.payload.storageKind>().type.toBe<"jsonb">();
    expect<typeof Fixture.definition.persisted.rowVersion.valueStrategy>().type.toBe<"incrementedOnWrite">();
  });

  it("preserves decoded and encoded shapes", () => {
    expect<EntitySchema.TypeShape<typeof fields>["optionalName"]>().type.toBe<O.Option<string>>();
    expect<EntitySchema.EncodedShape<typeof fields>["optionalName"]>().type.toBe<string | null>();
    expect<EntitySchema.ColumnNameFor<"rowVersion", typeof persisted.rowVersion>>().type.toBe<"row_version">();
    expect<
      EntitySchema.ColumnNameFor<"defaultName", EntitySchema.PersistDescriptor<"text", "provided", undefined>>
    >().type.toBe<"default_name">();
  });

  it("derives generated model variants", () => {
    expect<"id">().type.not.toBeAssignableTo<keyof S.Schema.Type<typeof Fixture.insert>>();
    expect<"rowVersion">().type.not.toBeAssignableTo<keyof S.Schema.Type<typeof Fixture.insert>>();
    expect<"name">().type.toBeAssignableTo<keyof S.Schema.Type<typeof Fixture.insert>>();
    expect<S.Schema.Type<typeof Fixture>["optionalName"]>().type.toBe<O.Option<string>>();
  });
});

void optionalKeyPersisted;
void servicefulPersisted;
