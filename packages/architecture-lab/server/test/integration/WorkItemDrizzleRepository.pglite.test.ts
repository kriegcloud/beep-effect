import { ArchitectureLabConfigTest } from "@beep/architecture-lab-config/test";
import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import * as WorkPriority from "@beep/architecture-lab-domain/values/WorkPriority";
import { makeDrizzleWorkItemRepository } from "@beep/architecture-lab-server/aggregates/WorkItem";
import { makeDrizzleWorkerRepository } from "@beep/architecture-lab-server/entities/Worker";
import { makeDrizzleLayer } from "@beep/postgres";
import { makePgliteSqlTestLayer, type SqlTestHooks } from "@beep/test-utils";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as SqlClient from "effect/unstable/sql/SqlClient";

const sharedConnectionUri = pipe(process.env.BEEP_TEST_DATABASE_URL, O.fromUndefinedOr, O.filter(Str.isNonEmpty));
const shouldUseTestcontainers = process.env.BEEP_TEST_DATABASE_DRIVER === "pglite-testcontainers";
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

const createWorkerTable = SqlClient.SqlClient.use((sqlClient) => {
  const sql = sqlClient.withoutTransforms();
  return sql`
    CREATE TABLE architecture_lab_worker (
      created_at BIGINT NOT NULL,
      created_by_principal JSONB NOT NULL,
      org_id INTEGER NOT NULL,
      row_version INTEGER NOT NULL,
      schema_version TEXT NOT NULL,
      source TEXT NOT NULL,
      updated_at BIGINT NOT NULL,
      updated_by_principal JSONB NOT NULL,
      display_name TEXT NOT NULL,
      status TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      id SERIAL PRIMARY KEY
    )
  `;
});

const createWorkItemTable = SqlClient.SqlClient.use((sqlClient) => {
  const sql = sqlClient.withoutTransforms();
  return sql`
    CREATE TABLE architecture_lab_work_item (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      assignee_id INTEGER,
      priority TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
});

const createArchitectureLabTables = Effect.gen(function* () {
  yield* createWorkerTable;
  yield* createWorkItemTable;
});

const WorkItemDrizzleRepositoryLayer = Layer.mergeAll(ArchitectureLabConfigTest, makeDrizzleLayer()).pipe(
  Layer.provideMerge(makePgliteLayer({ migrate: createArchitectureLabTables }))
);

if (!shouldRunPgliteIntegration) {
  describe.skip("ArchitectureLab Drizzle repository PgLite integration", () => {});
} else {
  describe.sequential("ArchitectureLab Drizzle repository PgLite integration", () => {
    layer(WorkItemDrizzleRepositoryLayer, { timeout: "2 minutes" })((it) => {
      it.effect(
        "persists WorkItem lifecycle changes through Drizzle",
        Effect.fnUntraced(function* () {
          const repository = yield* makeDrizzleWorkItemRepository();
          const workerId = 1 as DomainWorker.WorkerId;
          const created = DomainWorkItem.create(
            new DomainWorkItem.CreateWorkItemInput({
              id: "drizzle-work-item-1" as DomainWorkItem.WorkItemId,
              title: "Prove Drizzle repository" as DomainWorkItem.WorkItemTitle,
              priority: O.some(WorkPriority.WorkPriority.Enum.high),
            })
          );

          const inserted = yield* repository.create(created);
          const assigned = yield* DomainWorkItem.assign(inserted, workerId);
          const saved = yield* repository.save(assigned);
          const found = yield* repository.get(saved.id);
          const all = yield* repository.list();

          expect(found.status).toBe("assigned");
          expect(O.getOrThrow(found.assignee)).toBe(workerId);
          expect(O.getOrThrow(found.priority)).toBe("high");
          expect(
            pipe(
              all,
              A.map((workItem) => workItem.id)
            )
          ).toEqual([saved.id]);
        }),
        120_000
      );

      it.effect(
        "persists Worker entities through Drizzle",
        Effect.fnUntraced(function* () {
          const repository = yield* makeDrizzleWorkerRepository();
          const created = DomainWorker.create(
            new DomainWorker.CreateWorkerInput({
              id: 1 as DomainWorker.WorkerId,
              organizationId: 1 as DomainWorker.WorkerOrganizationId,
              displayName: "Ada Lovelace",
            })
          );

          const inserted = yield* repository.create(created);
          const found = yield* repository.get(inserted.id);
          const all = yield* repository.list();

          expect(found.displayName).toBe("Ada Lovelace");
          expect(
            pipe(
              all,
              A.map((worker) => worker.id)
            )
          ).toEqual([inserted.id]);
        }),
        120_000
      );
    });
  });
}
