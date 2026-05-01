import { $SchemaId } from "@beep/identity";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $SchemaId.create("EntitySchema.test");

const FixtureIdSchema = S.Int.pipe(S.brand("FixtureId"));

const FixtureId = Object.assign(FixtureIdSchema, {
  brand: "FixtureId",
  definition: {
    brand: "FixtureId",
    description: "Fixture id.",
    entityType: "Fixture",
    name: "fixture",
    resource: "fixture",
    slice: "schema",
    tableName: "fixture",
  },
  entityType: "Fixture",
  resource: "fixture",
  tableName: "fixture",
}) as typeof FixtureIdSchema & {
  readonly brand: "FixtureId";
  readonly definition: {
    readonly brand: "FixtureId";
    readonly description: "Fixture id.";
    readonly entityType: "Fixture";
    readonly name: "fixture";
    readonly resource: "fixture";
    readonly slice: "schema";
    readonly tableName: "fixture";
  };
  readonly entityType: "Fixture";
  readonly resource: "fixture";
  readonly tableName: "fixture";
};

const Fixture = EntitySchema.ClassFactory($I`Fixture`)(
  {
    entityId: FixtureId,
    fields: {
      id: EntitySchema.generatedId(FixtureId),
      name: S.String,
      optionalName: S.String.pipe(S.OptionFromNullOr),
      payload: S.Record(S.String, S.Unknown),
      rowVersion: EntitySchema.int,
    },
    persisted: {
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
    },
    tableName: "fixture",
  },
  $I.annote("Fixture", {
    description: "Fixture schema-first entity.",
  })
);

describe("EntitySchema", () => {
  it("attaches and retrieves schema-first entity definitions", () => {
    const definition = EntitySchema.getDefinition(Fixture);

    expect(definition).toBe(Fixture.definition);
    expect(definition.entityId).toBe(FixtureId);
    expect(definition.tableName).toBe("fixture");
    expect(definition.persisted.id.valueStrategy).toBe("generatedOnInsert");
    expect(definition.persisted.name.indexHints?.[0]?.kind).toBe("unique");
    expect(EntitySchema.columnNameFor("optionalName", definition.persisted.optionalName)).toBe("optional_name");
    expect(EntitySchema.columnNameFor("rowVersion", definition.persisted.rowVersion)).toBe("row_version");
  });

  it("derives encoded absence from Effect Schema AST", () => {
    expect(EntitySchema.encodedFieldShape(S.String).absenceKind).toBe("required");
    expect(EntitySchema.encodedFieldShape(S.NullOr(S.String)).absenceKind).toBe("nullable");
    expect(EntitySchema.encodedFieldShape(S.UndefinedOr(S.String)).absenceKind).toBe("undefined");
    expect(EntitySchema.encodedFieldShape(S.String.pipe(S.OptionFromNullOr)).absenceKind).toBe("nullable");
    expect(EntitySchema.encodedFieldShape(S.optionalKey(S.String)).absenceKind).toBe("optionalKey");
    expect(() => EntitySchema.selectedRowFieldShape("optionalKey", S.optionalKey(S.String))).toThrow(
      "must encode SQL absence as null"
    );
  });

  it("keeps decoded domain side separate from encoded persistence side", () => {
    const fixture = new Fixture({
      id: 1,
      name: "Acme",
      optionalName: O.none(),
      payload: {
        enabled: true,
      },
      rowVersion: 1,
    });

    const encoded = S.encodeSync(Fixture)(fixture);

    expect(O.isNone(fixture.optionalName)).toBe(true);
    expect(encoded.optionalName).toBeNull();
    expect(encoded.payload).toEqual({ enabled: true });
  });

  it("derives variants from persistence strategies", () => {
    expect(Object.keys(Fixture.fields).sort()).toEqual(["id", "name", "optionalName", "payload", "rowVersion"]);
    expect(Object.keys(Fixture.insert.fields).sort()).toEqual(["name", "optionalName", "payload"]);
    expect(Object.keys(Fixture.update.fields).sort()).toEqual(["id", "name", "optionalName", "payload", "rowVersion"]);
    expect(Object.keys(Fixture.jsonCreate.fields).sort()).toEqual(["name", "optionalName", "payload"]);
  });
});
