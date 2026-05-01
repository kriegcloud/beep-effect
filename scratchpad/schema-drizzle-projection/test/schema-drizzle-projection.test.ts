import { describe, expect, it } from "@effect/vitest";
import * as Struct from "@beep/utils/Struct";
import { getTableColumns } from "drizzle-orm";
import {
  PgDialect,
  PgInsertBuilder,
  type PgQueryResultHKT,
  type PgSession,
  QueryBuilder,
} from "drizzle-orm/pg-core";
import { Cause, Effect, Exit, Option } from "effect";
import * as DateTime from "effect/DateTime";
import * as S from "effect/Schema";
import {
  CandidateDraft,
  CandidateDraftTable,
  CandidateProject,
  CandidateProjectTable,
  encodedCandidateDraft,
  encodedCandidateProject,
} from "../proof.ts";
import * as EntitySchema from "../entity-schema.ts";

const absenceMatrix = {
  String: [S.String, "required", false, false, false, false],
  Void: [S.Void, "undefined", false, true, false, false],
  Unknown: [S.Unknown, "nullish", true, true, false, false],
  Json: [S.Json, "nullable", true, false, false, false],
  NullOr: [S.NullOr(S.String), "nullable", true, false, false, false],
  UndefinedOr: [S.UndefinedOr(S.String), "undefined", false, true, false, false],
  NullishOr: [S.NullishOr(S.String), "nullish", true, true, false, false],
  OptionFromNullOr: [S.OptionFromNullOr(S.String), "nullable", true, false, false, false],
  OptionFromUndefinedOr: [S.OptionFromUndefinedOr(S.String), "undefined", false, true, false, false],
  OptionFromNullishOr: [S.OptionFromNullishOr(S.String), "nullish", true, true, false, false],
  optionalKey: [S.optionalKey(S.String), "optionalKey", false, false, false, true],
  optional: [S.optional(S.String), "optionalUndefined", false, true, false, true],
  OptionFromOptionalKey: [S.OptionFromOptionalKey(S.String), "optionalKey", false, false, false, true],
  OptionFromOptional: [S.OptionFromOptional(S.String), "optionalUndefined", false, true, false, true],
  OptionFromOptionalNullOr: [S.OptionFromOptionalNullOr(S.String), "optionalNullish", true, true, false, true],
  DecodingDefaultKey: [
    S.String.pipe(S.withDecodingDefaultKey(Effect.succeed("default"))),
    "optionalKey",
    false,
    false,
    false,
    true,
  ],
  ConstructorDefault: [
    S.String.pipe(S.withConstructorDefault(Effect.succeed("default"))),
    "required",
    false,
    false,
    false,
    false,
  ],
} as const satisfies Readonly<
  Record<
    string,
    readonly [
      field: S.Top,
      absenceKind: EntitySchema.EncodedAbsenceKind,
      allowsNull: boolean,
      allowsUndefined: boolean,
      isAmbiguous: boolean,
      isOptional: boolean,
    ]
  >
>;

const QueryOnlySession = undefined as unknown as PgSession;

const ExpectedDraftInsertSql =
  'insert into "workspace_candidate_draft" ("created_at", "row_version", "fixture_key", "lifecycle", "snapshot", "parent_id", "id", "entity_type") values ($1, $2, $3, $4, $5, $6, $7, $8) returning "created_at", "row_version", "fixture_key", "lifecycle", "snapshot", "parent_id", "id", "entity_type"';

const ExpectedDraftSelectSql =
  'select "created_at", "row_version", "fixture_key", "lifecycle", "snapshot", "parent_id", "id", "entity_type" from "workspace_candidate_draft"';

const makeDraftInsertQuery = () =>
  new PgInsertBuilder<typeof CandidateDraftTable, PgQueryResultHKT>(
    CandidateDraftTable,
    QueryOnlySession,
    new PgDialect()
  )
    .values(encodedCandidateDraft)
    .returning()
    .toSQL();

describe("schema-to-drizzle projection scratchpad", () => {
  it.effect("decodes domain values and encodes the same persistence shape", () =>
    Effect.gen(function* () {
      const decodedDraft = yield* S.decodeUnknownEffect(CandidateDraft)(encodedCandidateDraft);
      const encodedDraft = yield* S.encodeEffect(CandidateDraft)(decodedDraft);
      const decodedProject = yield* S.decodeUnknownEffect(CandidateProject)(encodedCandidateProject);
      const encodedProject = yield* S.encodeEffect(CandidateProject)(decodedProject);

      expect(decodedDraft).toBeInstanceOf(CandidateDraft);
      expect(DateTime.isUtc(decodedDraft.createdAt)).toBe(true);
      expect(Option.isOption(decodedDraft.parentId)).toBe(true);
      expect(Option.isNone(decodedDraft.parentId)).toBe(true);
      expect(encodedDraft).toEqual(encodedCandidateDraft);

      expect(decodedProject).toBeInstanceOf(CandidateProject);
      expect(DateTime.isUtc(decodedProject.createdAt)).toBe(true);
      expect(Option.isOption(decodedProject.sourceDraftId)).toBe(true);
      expect(Option.isSome(decodedProject.sourceDraftId)).toBe(true);
      expect(encodedProject).toEqual(encodedCandidateProject);
    })
  );

  it("keeps identity-composer annotations and attached definitions retrievable", () => {
    const draftAnnotations = S.resolveAnnotations(CandidateDraft);
    const projectAnnotations = S.resolveAnnotations(CandidateProject);

    expect(draftAnnotations?.title).toBe("CandidateDraft");
    expect(draftAnnotations?.description).toBe("A really good description");
    expect(projectAnnotations?.title).toBe("CandidateProject");
    expect(projectAnnotations?.description).toBe("A candidate project promoted from one or more drafts.");
    expect(EntitySchema.getDefinition(CandidateDraft).tableName).toBe("workspace_candidate_draft");
    expect(EntitySchema.getDefinition(CandidateProject).tableName).toBe("workspace_candidate_project");
  });

  it.effect("decodes and narrows schema-backed persistence descriptors", () =>
    Effect.gen(function* () {
      const descriptor = yield* S.decodeUnknownEffect(EntitySchema.PersistDescriptor)({
        storageKind: "entityId",
        valueStrategy: "generatedOnInsert",
      });

      expect(EntitySchema.PersistDescriptor.guards.entityId(descriptor)).toBe(true);
      expect(EntitySchema.PersistDescriptor.isAnyOf(["entityId"])(descriptor)).toBe(true);
      expect(
        EntitySchema.PersistDescriptor.match(descriptor, {
          entityId: (self) => self.valueStrategy,
          int: () => "unexpected",
          jsonb: () => "unexpected",
          literal: () => "unexpected",
          text: () => "unexpected",
          timestampMillis: () => "unexpected",
        })
      ).toBe("generatedOnInsert");
    })
  );

  it("derives encoded nullability from native Effect optional and nullish schemas", () => {
    for (const [key, [field, absenceKind, allowsNull, allowsUndefined, isAmbiguous, isOptional]] of Struct.entries(
      absenceMatrix
    )) {
      expect(EntitySchema.encodedFieldShape(field), key).toEqual({
        absenceKind,
        allowsNull,
        allowsUndefined,
        isAmbiguous,
        isOptional,
      });
    }
  });

  it("rejects selected-row schemas that encode SQL absence as undefined or a missing key", () => {
    const undefinedExit = Effect.runSyncExit(
      Effect.sync(() => EntitySchema.selectedRowFieldShape("maybeName", S.OptionFromUndefinedOr(S.String)))
    );
    const optionalExit = Effect.runSyncExit(
      Effect.sync(() => EntitySchema.selectedRowFieldShape("maybeName", S.OptionFromOptionalKey(S.String)))
    );

    expect(Exit.isFailure(undefinedExit)).toBe(true);
    expect(Exit.isFailure(optionalExit)).toBe(true);
    if (Exit.isFailure(undefinedExit)) {
      expect(Cause.pretty(undefinedExit.cause)).toContain("must encode SQL absence as null");
    }
    if (Exit.isFailure(optionalExit)) {
      expect(Cause.pretty(optionalExit.cause)).toContain("must encode SQL absence as null");
    }
  });

  it("projects typed Drizzle columns from schema definitions", () => {
    const draftColumns = getTableColumns(CandidateDraftTable);
    const projectColumns = getTableColumns(CandidateProjectTable);

    expect(draftColumns.id.primary).toBe(true);
    expect(draftColumns.id.notNull).toBe(true);
    expect(draftColumns.entityType.name).toBe("entity_type");
    expect(draftColumns.createdAt.name).toBe("created_at");
    expect(draftColumns.parentId.name).toBe("parent_id");
    expect(draftColumns.parentId.notNull).toBe(false);

    expect(projectColumns.id.primary).toBe(true);
    expect(projectColumns.sourceDraftId.name).toBe("source_draft_id");
    expect(projectColumns.sourceDraftId.notNull).toBe(false);
    expect(projectColumns.rowVersion.name).toBe("row_version");
    expect(CandidateDraftTable.definition.tableName).toBe("workspace_candidate_draft");
    expect(CandidateProjectTable.definition.tableName).toBe("workspace_candidate_project");
  });

  it("lets Drizzle build SQL from the encoded persistence row shape", () => {
    const insert = makeDraftInsertQuery();
    const select = new QueryBuilder(new PgDialect()).select().from(CandidateDraftTable).toSQL();

    expect(insert.sql).toBe(ExpectedDraftInsertSql);
    expect(insert.params).toEqual([
      encodedCandidateDraft.createdAt,
      encodedCandidateDraft.rowVersion,
      encodedCandidateDraft.fixtureKey,
      encodedCandidateDraft.lifecycle,
      encodedCandidateDraft.snapshot,
      encodedCandidateDraft.parentId,
      encodedCandidateDraft.id,
      encodedCandidateDraft.entityType,
    ]);
    expect(select.sql).toBe(ExpectedDraftSelectSql);
    expect(select.params).toEqual([]);
  });
});
