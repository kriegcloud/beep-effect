import { $SchemaId } from "@beep/identity";
import * as EntitySchema from "@beep/schema/EntitySchema";
import * as Model from "@beep/schema/Model";
import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Model as UpstreamModel } from "effect/unstable/schema";

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

const BinaryUuid = Model.Uint8Array.pipe(S.brand("BinaryUuid"));

const explicitFields = {
  appCode: Model.GeneratedByApp(S.String),
  binaryUuid: Model.UuidV4Insert(BinaryUuid),
  createdAt: Model.DateTimeInsertFromNumber,
  generatedValue: Model.Generated(S.String),
  happenedAt: Model.DateTimeInsertFromDate,
  optionalName: Model.FieldOption(S.String),
  payloadText: Model.JsonFromString(
    S.Struct({
      enabled: S.Boolean,
    })
  ),
  secret: Model.Sensitive(S.String),
  updatedAt: Model.DateTimeUpdateFromNumber,
} as const;

const ExplicitFixture = EntitySchema.ClassFactory($I`ExplicitFixture`)({
  fields: explicitFields,
  persisted: {
    appCode: EntitySchema.persist.text({
      valueStrategy: "providedByContext",
    }),
    binaryUuid: EntitySchema.persist.blob({
      valueStrategy: "defaultedOnInsert",
    }),
    createdAt: EntitySchema.persist.timestampMillis({
      valueStrategy: "defaultedOnInsert",
    }),
    generatedValue: EntitySchema.persist.text({
      valueStrategy: "generatedOnInsert",
    }),
    happenedAt: EntitySchema.persist.timestampDate({
      valueStrategy: "defaultedOnInsert",
    }),
    optionalName: EntitySchema.persist.text(),
    payloadText: EntitySchema.persist.text(),
    secret: EntitySchema.persist.text(),
    updatedAt: EntitySchema.persist.timestampMillis({
      valueStrategy: "updatedOnWrite",
    }),
  },
  tableName: "explicit_fixture",
});

const UpstreamFixture = EntitySchema.ClassFactory($I`UpstreamFixture`)({
  fields: {
    createdAt: UpstreamModel.DateTimeInsertFromNumber,
    payloadText: UpstreamModel.JsonFromString(
      S.Struct({
        enabled: S.Boolean,
      })
    ),
  },
  persisted: {
    createdAt: EntitySchema.persist.timestampMillis({
      valueStrategy: "defaultedOnInsert",
    }),
    payloadText: EntitySchema.persist.text(),
  },
  tableName: "upstream_fixture",
});

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
    expect(EntitySchema.encodedFieldShape(S.String.pipe(S.NullOr)).absenceKind).toBe("nullable");
    expect(EntitySchema.encodedFieldShape(S.String.pipe(S.UndefinedOr)).absenceKind).toBe("undefined");
    expect(EntitySchema.encodedFieldShape(S.String.pipe(S.OptionFromNullOr)).absenceKind).toBe("nullable");
    expect(EntitySchema.encodedFieldShape(S.String.pipe(S.optionalKey)).absenceKind).toBe("optionalKey");
    expect(() => EntitySchema.selectedRowFieldShape("optionalKey", S.String.pipe(S.optionalKey))).toThrow(
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

  it("normalizes explicit Model helpers through selected fields while preserving variant fields", () => {
    const definition = EntitySchema.getDefinition(ExplicitFixture);

    expect(definition.inputFields.optionalName).toBe(explicitFields.optionalName);
    expect(definition.variantFields.optionalName).toBe(explicitFields.optionalName);
    expect(definition.fields.optionalName).toBe(explicitFields.optionalName.schemas.select);
    expect(EntitySchema.selectedRowFieldShape("optionalName", definition.fields.optionalName).allowsNull).toBe(true);
    expect(definition.fields.payloadText).toBe(explicitFields.payloadText.schemas.select);
    expect(EntitySchema.encodedFieldShape(definition.fields.payloadText).absenceKind).toBe("required");

    expect(Object.keys(ExplicitFixture.fields).sort()).toEqual([
      "appCode",
      "binaryUuid",
      "createdAt",
      "generatedValue",
      "happenedAt",
      "optionalName",
      "payloadText",
      "secret",
      "updatedAt",
    ]);
    expect(Object.keys(ExplicitFixture.insert.fields).sort()).toEqual([
      "appCode",
      "binaryUuid",
      "createdAt",
      "happenedAt",
      "optionalName",
      "payloadText",
      "secret",
      "updatedAt",
    ]);
    expect(Object.keys(ExplicitFixture.update.fields).sort()).toEqual([
      "appCode",
      "binaryUuid",
      "generatedValue",
      "optionalName",
      "payloadText",
      "secret",
      "updatedAt",
    ]);
    expect(Object.keys(ExplicitFixture.json.fields).sort()).toEqual([
      "appCode",
      "binaryUuid",
      "createdAt",
      "generatedValue",
      "happenedAt",
      "optionalName",
      "payloadText",
      "updatedAt",
    ]);
    expect(Object.keys(ExplicitFixture.jsonCreate.fields).sort()).toEqual(["optionalName", "payloadText"]);
    expect(Object.keys(ExplicitFixture.jsonUpdate.fields).sort()).toEqual(["optionalName", "payloadText"]);
  });

  it("accepts upstream effect unstable Model helpers directly", () => {
    const definition = EntitySchema.getDefinition(UpstreamFixture);

    expect(definition.inputFields.createdAt).toBe(UpstreamModel.DateTimeInsertFromNumber);
    expect(definition.variantFields.createdAt).toBe(UpstreamModel.DateTimeInsertFromNumber);
    expect(definition.fields.createdAt).toBe(UpstreamModel.DateTimeInsertFromNumber.schemas.select);
    expect(Object.keys(UpstreamFixture.jsonCreate.fields)).toEqual(["payloadText"]);
  });

  it("rejects persisted explicit fields without a select variant", () => {
    expect(() =>
      EntitySchema.ClassFactory($I`MissingSelect`)({
        fields: {
          value: Model.FieldOnly(["insert"])(S.String),
        },
        persisted: {
          value: EntitySchema.persist.text(),
        },
      } as never)
    ).toThrow("must define a select variant");
  });

  it("rejects helper and persistence strategy contradictions", () => {
    expect(() =>
      EntitySchema.ClassFactory($I`Contradiction`)({
        fields: {
          binaryUuid: Model.UuidV4Insert(BinaryUuid),
        },
        persisted: {
          binaryUuid: EntitySchema.persist.blob({
            valueStrategy: "generatedOnInsert",
          }),
        },
      } as never)
    ).toThrow("generatedOnInsert");
  });
});
