import { makeDrizzleLayer, PostgresDrizzle } from "@beep/postgres";
import { makePgliteSqlTestLayer, type SqlTestHooks } from "@beep/test-utils";
import * as Struct from "@beep/utils/Struct";
import { describe, expect, layer } from "@effect/vitest";
import { getTableColumns } from "drizzle-orm";
import { Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import {
  CandidateDraft,
  CandidateDraftTable,
  CandidateProject,
  CandidateProjectTable,
  encodedCandidateDraft,
  encodedCandidateProject,
} from "../proof.ts";

const sharedConnectionUri = pipe(process.env.BEEP_TEST_DATABASE_URL, O.fromUndefinedOr, O.filter(Str.isNonEmpty));
const shouldUseTestcontainers = process.env.BEEP_TEST_DATABASE_DRIVER === "pglite-testcontainers";
const shouldRunPgliteIntegration = O.isSome(sharedConnectionUri) || shouldUseTestcontainers;

type ProjectedTable = typeof CandidateDraftTable | typeof CandidateProjectTable;
type ProjectedColumn = {
  readonly name: string;
  readonly notNull: boolean;
  readonly primary: boolean;
  readonly getSQLType: () => string;
};

const quoteIdentifier = (identifier: string): string => `"${pipe(identifier, Str.replaceAll('"', '""'))}"`;

const columnDefinitionFor = (column: ProjectedColumn): string =>
  pipe(
    [
      quoteIdentifier(column.name),
      column.getSQLType(),
      column.primary ? "PRIMARY KEY" : "",
      column.notNull && !column.primary ? "NOT NULL" : "",
    ],
    A.filter(Str.isNonEmpty),
    A.join(" ")
  );

const createTableStatementFor = <const Table extends ProjectedTable>(
  table: Table
): string => {
  const columns = getTableColumns(table) as Readonly<Record<string, ProjectedColumn>>;
  const columnDefinitions = pipe(
    Struct.entries(columns),
    A.map(([, column]) => columnDefinitionFor(column)),
    A.join(", ")
  );

  return `CREATE TABLE ${quoteIdentifier(table.definition.tableName)} (${columnDefinitions})`;
};

const createProjectedTables = Effect.gen(function* () {
  const sql = (yield* SqlClient.SqlClient).withoutTransforms();

  yield* sql.unsafe(createTableStatementFor(CandidateDraftTable));
  yield* sql.unsafe(createTableStatementFor(CandidateProjectTable));
});

const makePgliteLayer = <MigrateError = never, SeedError = never>(hooks?: SqlTestHooks<MigrateError, SeedError>) =>
  pipe(
    sharedConnectionUri,
    O.match({
      onNone: () =>
        hooks === undefined
          ? Layer.fresh(makePgliteSqlTestLayer({ mode: "testcontainers" }))
          : Layer.fresh(makePgliteSqlTestLayer({ hooks, mode: "testcontainers" })),
      onSome: (connectionUri) =>
        hooks === undefined
          ? Layer.fresh(
              makePgliteSqlTestLayer({
                external: { connectionUri },
                mode: "external",
              })
            )
          : Layer.fresh(
              makePgliteSqlTestLayer({
                external: { connectionUri },
                hooks,
                mode: "external",
              })
            ),
    })
  );

const DrizzleProjectionPgliteLayer = makeDrizzleLayer().pipe(
  Layer.provideMerge(makePgliteLayer({ migrate: createProjectedTables }))
);

const decodeFirst = <const Schema extends S.Top>(
  schema: Schema,
  rows: ReadonlyArray<S.Codec.Encoded<Schema>>,
  label: string
) =>
  pipe(
    A.head(rows),
    O.match({
      onNone: () => Effect.die(new Error(`Expected ${label} round-trip row.`)),
      onSome: S.decodeUnknownEffect(schema),
    })
  );

if (!shouldRunPgliteIntegration) {
  describe.skip("schema-to-drizzle PGlite round trip", () => {});
} else {
  describe.sequential("schema-to-drizzle PGlite round trip", () => {
    layer(DrizzleProjectionPgliteLayer, { timeout: "2 minutes" })((it) => {
      it.effect(
        "inserts encoded rows through projected tables and decodes selected rows into opaque domain classes",
        Effect.fnUntraced(function* () {
          const db = yield* PostgresDrizzle;

          const insertedDraftRows = yield* db.insert(CandidateDraftTable).values(encodedCandidateDraft).returning();
          const insertedProjectRows = yield* db
            .insert(CandidateProjectTable)
            .values(encodedCandidateProject)
            .returning();
          const selectedDraftRows = yield* db.select().from(CandidateDraftTable).orderBy(CandidateDraftTable.id);
          const selectedProjectRows = yield* db.select().from(CandidateProjectTable).orderBy(CandidateProjectTable.id);
          const insertedDraft = yield* decodeFirst(CandidateDraft, insertedDraftRows, "inserted draft");
          const insertedProject = yield* decodeFirst(CandidateProject, insertedProjectRows, "inserted project");
          const selectedDraft = yield* decodeFirst(CandidateDraft, selectedDraftRows, "selected draft");
          const selectedProject = yield* decodeFirst(CandidateProject, selectedProjectRows, "selected project");

          expect(insertedDraft).toBeInstanceOf(CandidateDraft);
          expect(selectedDraft).toBeInstanceOf(CandidateDraft);
          expect(DateTime.isUtc(selectedDraft.createdAt)).toBe(true);
          expect(O.isNone(selectedDraft.parentId)).toBe(true);
          expect(yield* S.encodeEffect(CandidateDraft)(selectedDraft)).toEqual(encodedCandidateDraft);

          expect(insertedProject).toBeInstanceOf(CandidateProject);
          expect(selectedProject).toBeInstanceOf(CandidateProject);
          expect(DateTime.isUtc(selectedProject.createdAt)).toBe(true);
          expect(O.isSome(selectedProject.sourceDraftId)).toBe(true);
          expect(yield* S.encodeEffect(CandidateProject)(selectedProject)).toEqual(encodedCandidateProject);
        }),
        120_000
      );
    });
  });
}
