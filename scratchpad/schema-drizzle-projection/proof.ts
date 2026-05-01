import { $ScratchpadId } from "@beep/identity/packages";
import { Workspace } from "@beep/shared-domain/identity";
import * as Struct from "@beep/utils/Struct";
import { getTableColumns } from "drizzle-orm";
import { Effect, Option } from "effect";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as S from "effect/Schema";
import { BaseEntity } from "./base-entity.ts";
import * as EntitySchema from "./entity-schema.ts";
import { pgTableFrom } from "./drizzle-projection.ts";

const $I = $ScratchpadId.create("schema-drizzle-projection/proof");

export const CandidateLifecycle = S.Literals(["draft", "ready", "approved"]);

export const CandidateProjectStatus = S.Literals(["proposed", "active", "archived"]);

export class CandidateDraft extends BaseEntity.Class<CandidateDraft>($I`CandidateDraft`)(
  Workspace.CandidateDraftId,
  {
    fields: {
      fixtureKey: S.String,
      lifecycle: CandidateLifecycle,
      snapshot: S.Record(S.String, S.Json),
      parentId: Workspace.WorkspaceId.pipe(S.OptionFromNullOr),
    },
    persisted: {
      fixtureKey: EntitySchema.persist.text(),
      lifecycle: EntitySchema.persist.literal(),
      snapshot: EntitySchema.persist.jsonb(),
      parentId: EntitySchema.persist.entityId(),
    },
  },
  $I.annote("CandidateDraft", {
    description: "A really good description",
  })
) {}

export const CandidateDraftTable = pgTableFrom(CandidateDraft);

export class CandidateProject extends BaseEntity.Class<CandidateProject>($I`CandidateProject`)(
  Workspace.CandidateProjectId,
  {
    fields: {
      title: S.String,
      status: CandidateProjectStatus,
      sourceDraftId: Workspace.CandidateDraftId.pipe(S.OptionFromNullOr),
      snapshot: S.Record(S.String, S.Json),
    },
    persisted: {
      title: EntitySchema.persist.text(),
      status: EntitySchema.persist.literal(),
      sourceDraftId: EntitySchema.persist.entityId(),
      snapshot: EntitySchema.persist.jsonb(),
    },
  },
  $I.annote("CandidateProject", {
    description: "A candidate project promoted from one or more drafts.",
  })
) {}

export const CandidateProjectTable = pgTableFrom(CandidateProject);

export const encodedCandidateDraft = {
  id: 1,
  entityType: "WorkspaceCandidateDraft",
  createdAt: Date.UTC(2026, 0, 1),
  rowVersion: 1,
  fixtureKey: "fixture-1",
  lifecycle: "draft",
  snapshot: {
    displayName: "Ada Lovelace",
  },
  parentId: null,
} as const;

export const encodedCandidateProject = {
  id: 2,
  entityType: "WorkspaceCandidateProject",
  createdAt: Date.UTC(2026, 0, 2),
  rowVersion: 1,
  title: "Project Atlas",
  status: "active",
  sourceDraftId: 1,
  snapshot: {
    score: 0.97,
  },
} as const;

const encodedAbsenceShapeSamples = {
  String: S.String,
  Void: S.Void,
  Unknown: S.Unknown,
  Json: S.Json,
  NullOr: S.NullOr(S.String),
  UndefinedOr: S.UndefinedOr(S.String),
  NullishOr: S.NullishOr(S.String),
  OptionFromNullOr: S.OptionFromNullOr(S.String),
  OptionFromUndefinedOr: S.OptionFromUndefinedOr(S.String),
  OptionFromNullishOr: S.OptionFromNullishOr(S.String),
  optionalKey: S.optionalKey(S.String),
  optional: S.optional(S.String),
  OptionFromOptionalKey: S.OptionFromOptionalKey(S.String),
  OptionFromOptional: S.OptionFromOptional(S.String),
  OptionFromOptionalNullOr: S.OptionFromOptionalNullOr(S.String),
  DecodingDefaultKey: S.String.pipe(S.withDecodingDefaultKey(Effect.succeed("default"))),
  ConstructorDefault: S.String.pipe(S.withConstructorDefault(Effect.succeed("default"))),
} as const;

const encodedAbsenceShapes = () =>
  Struct.fromEntries(
    A.map(Struct.entries(encodedAbsenceShapeSamples), ([key, schema]) => [
      key,
      EntitySchema.encodedFieldShape(schema),
    ])
  );

const assertAbsenceShape = (
  shapes: Record<string, EntitySchema.EncodedFieldShape>,
  key: string,
  expected: EntitySchema.EncodedFieldShape
) => {
  const actual = shapes[key];
  if (
    actual?.absenceKind !== expected.absenceKind ||
    actual?.allowsNull !== expected.allowsNull ||
    actual.allowsUndefined !== expected.allowsUndefined ||
    actual.isAmbiguous !== expected.isAmbiguous ||
    actual.isOptional !== expected.isOptional
  ) {
    throw new Error(`Unexpected encoded absence shape for ${key}`);
  }
};

const assertAbsenceShapes = Effect.sync(() => {
  const shapes = encodedAbsenceShapes();
  assertAbsenceShape(shapes, "String", {
    absenceKind: "required",
    allowsNull: false,
    allowsUndefined: false,
    isAmbiguous: false,
    isOptional: false,
  });
  assertAbsenceShape(shapes, "Void", {
    absenceKind: "undefined",
    allowsNull: false,
    allowsUndefined: true,
    isAmbiguous: false,
    isOptional: false,
  });
  assertAbsenceShape(shapes, "Unknown", {
    absenceKind: "nullish",
    allowsNull: true,
    allowsUndefined: true,
    isAmbiguous: false,
    isOptional: false,
  });
  assertAbsenceShape(shapes, "Json", {
    absenceKind: "nullable",
    allowsNull: true,
    allowsUndefined: false,
    isAmbiguous: false,
    isOptional: false,
  });
  assertAbsenceShape(shapes, "NullOr", {
    absenceKind: "nullable",
    allowsNull: true,
    allowsUndefined: false,
    isAmbiguous: false,
    isOptional: false,
  });
  assertAbsenceShape(shapes, "UndefinedOr", {
    absenceKind: "undefined",
    allowsNull: false,
    allowsUndefined: true,
    isAmbiguous: false,
    isOptional: false,
  });
  assertAbsenceShape(shapes, "NullishOr", {
    absenceKind: "nullish",
    allowsNull: true,
    allowsUndefined: true,
    isAmbiguous: false,
    isOptional: false,
  });
  assertAbsenceShape(shapes, "OptionFromNullOr", {
    absenceKind: "nullable",
    allowsNull: true,
    allowsUndefined: false,
    isAmbiguous: false,
    isOptional: false,
  });
  assertAbsenceShape(shapes, "OptionFromUndefinedOr", {
    absenceKind: "undefined",
    allowsNull: false,
    allowsUndefined: true,
    isAmbiguous: false,
    isOptional: false,
  });
  assertAbsenceShape(shapes, "OptionFromNullishOr", {
    absenceKind: "nullish",
    allowsNull: true,
    allowsUndefined: true,
    isAmbiguous: false,
    isOptional: false,
  });
  assertAbsenceShape(shapes, "optionalKey", {
    absenceKind: "optionalKey",
    allowsNull: false,
    allowsUndefined: false,
    isAmbiguous: false,
    isOptional: true,
  });
  assertAbsenceShape(shapes, "optional", {
    absenceKind: "optionalUndefined",
    allowsNull: false,
    allowsUndefined: true,
    isAmbiguous: false,
    isOptional: true,
  });
  assertAbsenceShape(shapes, "OptionFromOptionalKey", {
    absenceKind: "optionalKey",
    allowsNull: false,
    allowsUndefined: false,
    isAmbiguous: false,
    isOptional: true,
  });
  assertAbsenceShape(shapes, "OptionFromOptional", {
    absenceKind: "optionalUndefined",
    allowsNull: false,
    allowsUndefined: true,
    isAmbiguous: false,
    isOptional: true,
  });
  assertAbsenceShape(shapes, "OptionFromOptionalNullOr", {
    absenceKind: "optionalNullish",
    allowsNull: true,
    allowsUndefined: true,
    isAmbiguous: false,
    isOptional: true,
  });
  assertAbsenceShape(shapes, "DecodingDefaultKey", {
    absenceKind: "optionalKey",
    allowsNull: false,
    allowsUndefined: false,
    isAmbiguous: false,
    isOptional: true,
  });
  assertAbsenceShape(shapes, "ConstructorDefault", {
    absenceKind: "required",
    allowsNull: false,
    allowsUndefined: false,
    isAmbiguous: false,
    isOptional: false,
  });
  return shapes;
});

const printSection = (title: string, value: unknown) =>
  Effect.sync(() => {
    console.log(`\n=== ${title} ===`);
    console.dir(value, { depth: 8 });
  });

export const main = Effect.gen(function* () {
  const absenceShapes = yield* assertAbsenceShapes;

  const decodedDraft = yield* S.decodeUnknownEffect(CandidateDraft)(encodedCandidateDraft);
  const encodedDraft = yield* S.encodeEffect(CandidateDraft)(decodedDraft);
  const draftColumns = getTableColumns(CandidateDraftTable);
  const draftDefinition = EntitySchema.getDefinition(CandidateDraft);

  const decodedProject = yield* S.decodeUnknownEffect(CandidateProject)(encodedCandidateProject);
  const encodedProject = yield* S.encodeEffect(CandidateProject)(decodedProject);
  const projectColumns = getTableColumns(CandidateProjectTable);
  const projectDefinition = EntitySchema.getDefinition(CandidateProject);

  yield* printSection("Identity Split", {
    draft: {
      entityType: encodedDraft.entityType,
      tableName: draftDefinition.tableName,
    },
    project: {
      entityType: encodedProject.entityType,
      tableName: projectDefinition.tableName,
    },
  });

  yield* printSection("Encoded Absence Shapes", absenceShapes);

  yield* printSection("CandidateDraft Domain Decode", {
    decodedIsClassInstance: S.is(CandidateDraft)(decodedDraft),
    createdAtIsDateTime: DateTime.isUtc(decodedDraft.createdAt),
    parentIdIsOption: Option.isOption(decodedDraft.parentId),
    parentIdIsNone: Option.isNone(decodedDraft.parentId),
  });

  yield* printSection("CandidateProject Domain Decode", {
    decodedIsClassInstance: S.is(CandidateProject)(decodedProject),
    createdAtIsDateTime: DateTime.isUtc(decodedProject.createdAt),
    sourceDraftIdIsOption: Option.isOption(decodedProject.sourceDraftId),
    sourceDraftIdIsSome: Option.isSome(decodedProject.sourceDraftId),
  });

  yield* printSection("CandidateDraft Persistence Encode", encodedDraft);

  yield* printSection("CandidateProject Persistence Encode", encodedProject);

  yield* printSection("Schema Annotations", {
    title: CandidateDraft.ast.annotations?.title,
    description: CandidateDraft.ast.annotations?.description,
    definitionTableName: draftDefinition.tableName,
    definitionKeys: Struct.keys(draftDefinition.persisted),
    projectTitle: CandidateProject.ast.annotations?.title,
    projectDescription: CandidateProject.ast.annotations?.description,
    projectDefinitionTableName: projectDefinition.tableName,
    projectDefinitionKeys: Struct.keys(projectDefinition.persisted),
  });

  yield* printSection(
    "CandidateDraft Drizzle Columns",
    Struct.fromEntries(
      A.map(Struct.entries(draftColumns), ([key, column]) => [
        key,
        {
          name: column.name,
          notNull: column.notNull,
          primary: column.primary,
        },
      ])
    )
  );

  yield* printSection(
    "CandidateProject Drizzle Columns",
    Struct.fromEntries(
      A.map(Struct.entries(projectColumns), ([key, column]) => [
        key,
        {
          name: column.name,
          notNull: column.notNull,
          primary: column.primary,
        },
      ])
    )
  );
});

if (import.meta.main) {
  void import("@effect/platform-bun").then(({ BunRuntime }) => {
    BunRuntime.runMain(main);
  });
}
