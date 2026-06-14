import { fileURLToPath } from "node:url";
import { makeDrizzle, migrate } from "@beep/postgres";
import { makePgliteSqlTestLayer, TestDatabaseInfo } from "@beep/test-utils";
import { A, Str } from "@beep/utils";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer, pipe } from "effect";
import * as O from "effect/Option";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import type { SqlTestHooks } from "@beep/test-utils";

const sharedConnectionUri = pipe(Bun.env.BEEP_TEST_DATABASE_URL, O.fromUndefinedOr, O.filter(Str.isNonEmpty));
const migrationsFolder = fileURLToPath(new URL("../../drizzle", import.meta.url));
const shouldUseTestcontainers = Bun.env.BEEP_TEST_DATABASE_DRIVER === "pglite-testcontainers";
const shouldRunPgliteIntegration = O.isSome(sharedConnectionUri) || shouldUseTestcontainers;

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

if (!shouldRunPgliteIntegration) {
  describe.skip("db-admin architecture-lab migration PgLite integration", () => {});
} else {
  describe.concurrent("db-admin architecture-lab migration PgLite integration", () => {
    layer(makePgliteLayer(), { timeout: "2 minutes" })((it) => {
      it.effect(
        "runs the architecture-lab migration target SQL",
        Effect.fnUntraced(function* () {
          const info = yield* TestDatabaseInfo;
          const db = yield* makeDrizzle();
          const migrationsSchema = pipe(
            info.schema,
            O.getOrElse(() => "drizzle")
          );

          yield* migrate(db, { migrationsFolder, migrationsSchema });

          const sql = (yield* SqlClient.SqlClient).withoutTransforms();
          yield* sql`
            INSERT INTO architecture_lab_worker (
              created_at,
              created_by_principal,
              org_id,
              row_version,
              schema_version,
              source,
              updated_at,
              updated_by_principal,
              display_name,
              status,
              entity_type,
              id
            )
            VALUES (
              0,
              '{"kind":"System","component":"ArchitectureLab"}'::jsonb,
              1,
              1,
              '0.1.0',
              'Application',
              0,
              '{"kind":"System","component":"ArchitectureLab"}'::jsonb,
              'Ada Lovelace',
              'active',
              'ArchitectureLabWorker',
              1
            )
          `;
          yield* sql`
            INSERT INTO architecture_lab_work_item (id, title, status, assignee_id, priority)
            VALUES ('migration-proof-1', 'Prove db-admin migration', 'assigned', 1, 'high')
          `;
          const rows = yield* sql<{ readonly id: string }>`
            SELECT id FROM architecture_lab_work_item ORDER BY id ASC
          `;
          const workerRows = yield* sql<{ readonly display_name: string }>`
            SELECT display_name FROM architecture_lab_worker ORDER BY id ASC
          `;

          yield* sql`
            INSERT INTO workspace_thread (
              created_at,
              created_by_principal,
              org_id,
              row_version,
              schema_version,
              source,
              updated_at,
              updated_by_principal,
              title,
              workspace_id,
              entity_type,
              id
            )
            VALUES (
              0,
              '{"kind":"System","component":"WorkspaceThreadDomain"}'::jsonb,
              1,
              1,
              '0.1.0',
              'Application',
              0,
              '{"kind":"System","component":"WorkspaceThreadDomain"}'::jsonb,
              'Matter intake',
              1,
              'WorkspaceThread',
              10
            )
          `;
          yield* sql`
            INSERT INTO workspace_turn (
              created_at,
              created_by_principal,
              org_id,
              row_version,
              schema_version,
              source,
              updated_at,
              updated_by_principal,
              items,
              parent_turn_id,
              thread_id,
              turn_index,
              entity_type,
              id
            )
            VALUES (
              0,
              '{"kind":"System","component":"WorkspaceThreadDomain"}'::jsonb,
              1,
              1,
              '0.1.0',
              'Application',
              0,
              '{"kind":"System","component":"WorkspaceThreadDomain"}'::jsonb,
              '[{"itemType":"message","messageId":20}]'::jsonb,
              NULL,
              10,
              0,
              'WorkspaceTurn',
              11
            ),
            (
              1,
              '{"kind":"System","component":"WorkspaceThreadDomain"}'::jsonb,
              1,
              1,
              '0.1.0',
              'Application',
              1,
              '{"kind":"System","component":"WorkspaceThreadDomain"}'::jsonb,
              '[{"itemType":"message","messageId":21}]'::jsonb,
              11,
              10,
              1,
              'WorkspaceTurn',
              12
            )
          `;
          yield* sql`
            INSERT INTO workspace_message (
              created_at,
              created_by_principal,
              org_id,
              row_version,
              schema_version,
              source,
              updated_at,
              updated_by_principal,
              content,
              role,
              thread_id,
              turn_id,
              entity_type,
              id
            )
            VALUES (
              0,
              '{"kind":"System","component":"WorkspaceThreadDomain"}'::jsonb,
              1,
              1,
              '0.1.0',
              'Application',
              0,
              '{"kind":"System","component":"WorkspaceThreadDomain"}'::jsonb,
              '{"_tag":"document","children":[{"_tag":"p","children":[{"_tag":"text","value":"Hello"}]}]}'::jsonb,
              'user',
              10,
              11,
              'WorkspaceMessage',
              20
            ),
            (
              1,
              '{"kind":"System","component":"WorkspaceThreadDomain"}'::jsonb,
              1,
              1,
              '0.1.0',
              'Application',
              1,
              '{"kind":"System","component":"WorkspaceThreadDomain"}'::jsonb,
              '{"_tag":"document","children":[{"_tag":"p","children":[{"_tag":"text","value":"Branched"}]}]}'::jsonb,
              'assistant',
              10,
              12,
              'WorkspaceMessage',
              21
            )
          `;
          const turnRows = yield* sql<{ readonly id: number; readonly parent_turn_id: number | null }>`
            SELECT id, parent_turn_id FROM workspace_turn ORDER BY id ASC
          `;
          const messageRows = yield* sql<{ readonly role: string }>`
            SELECT role FROM workspace_message ORDER BY id ASC
          `;

          expect(
            pipe(
              rows,
              A.map((row) => row.id)
            )
          ).toEqual(["migration-proof-1"]);
          expect(
            pipe(
              workerRows,
              A.map((row) => row.display_name)
            )
          ).toEqual(["Ada Lovelace"]);
          expect(turnRows).toEqual([
            { id: 11, parent_turn_id: null },
            { id: 12, parent_turn_id: 11 },
          ]);
          expect(
            pipe(
              messageRows,
              A.map((row) => row.role)
            )
          ).toEqual(["user", "assistant"]);
        }),
        120_000
      );
    });
  });
}
