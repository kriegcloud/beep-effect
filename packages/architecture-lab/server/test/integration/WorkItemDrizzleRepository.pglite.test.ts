import { ArchitectureLabConfigTest } from "@beep/architecture-lab-config/test";
import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { makeDrizzleWorkItemRepository } from "@beep/architecture-lab-server/aggregates/WorkItem";
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

const createWorkItemTable = SqlClient.SqlClient.use((sqlClient) => {
  const sql = sqlClient.withoutTransforms();
  return sql`
    CREATE TABLE architecture_lab_work_item (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      assignee TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
});

const WorkItemDrizzleRepositoryLayer = Layer.mergeAll(ArchitectureLabConfigTest, makeDrizzleLayer()).pipe(
  Layer.provideMerge(makePgliteLayer({ migrate: createWorkItemTable }))
);

if (!shouldRunPgliteIntegration) {
  describe.skip("WorkItem Drizzle repository PgLite integration", () => {});
} else {
  describe.sequential("WorkItem Drizzle repository PgLite integration", () => {
    layer(WorkItemDrizzleRepositoryLayer, { timeout: "2 minutes" })((it) => {
      it.effect(
        "persists WorkItem lifecycle changes through Drizzle",
        Effect.fnUntraced(function* () {
          const repository = yield* makeDrizzleWorkItemRepository();
          const created = DomainWorkItem.create(
            new DomainWorkItem.CreateWorkItemInput({
              id: "drizzle-work-item-1" as DomainWorkItem.WorkItemId,
              title: "Prove Drizzle repository" as DomainWorkItem.WorkItemTitle,
            })
          );

          const inserted = yield* repository.create(created);
          const assigned = yield* DomainWorkItem.assign(inserted, "codex");
          const saved = yield* repository.save(assigned);
          const found = yield* repository.get(saved.id);
          const all = yield* repository.list();

          expect(found.status).toBe("assigned");
          expect(
            pipe(
              all,
              A.map((workItem) => workItem.id)
            )
          ).toEqual([saved.id]);
        }),
        120_000
      );
    });
  });
}
