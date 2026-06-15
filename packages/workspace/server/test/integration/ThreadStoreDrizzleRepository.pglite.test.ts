import { fileURLToPath } from "node:url";
import { Document, P, Text } from "@beep/md";
import { makeDrizzle, makeDrizzleLayer, migrate } from "@beep/postgres";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import { makePgliteSqlTestLayer, TestDatabaseInfo } from "@beep/test-utils";
import { Str } from "@beep/utils";
import { makeDrizzleThreadStore } from "@beep/workspace-server/aggregates/Thread";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { SqlTestHooks } from "@beep/test-utils";

const sharedConnectionUri = pipe(Bun.env.BEEP_TEST_DATABASE_URL, O.fromUndefinedOr, O.filter(Str.isNonEmpty));
const migrationsFolder = fileURLToPath(new URL("../../../../_internal/db-admin/drizzle", import.meta.url));
const shouldUseTestcontainers = Bun.env.BEEP_TEST_DATABASE_DRIVER === "pglite-testcontainers";
const shouldRunPgliteIntegration = O.isSome(sharedConnectionUri) || shouldUseTestcontainers;
const PgliteIntegrationTimeout = 300_000;

const decodeWorkspaceId = S.decodeUnknownEffect(WorkspaceIdentity.WorkspaceId);
const docOf = (value: string) => Document.make({ children: [P.make({ children: [Text.make({ value })] })] });

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

const migrateWorkspaceThread = Effect.fnUntraced(function* () {
  const info = yield* TestDatabaseInfo;
  const db = yield* makeDrizzle();
  const migrationsSchema = pipe(
    info.schema,
    O.getOrElse(() => "drizzle")
  );

  yield* migrate(db, { migrationsFolder, migrationsSchema });
});

const ThreadStoreDrizzleRepositoryLayer = makeDrizzleLayer().pipe(Layer.provideMerge(makePgliteLayer()));

if (!shouldRunPgliteIntegration) {
  describe.skip("Workspace ThreadStore Drizzle repository PgLite integration", () => {});
} else {
  describe("Workspace ThreadStore Drizzle repository PgLite integration", { concurrent: false }, () => {
    layer(ThreadStoreDrizzleRepositoryLayer, { timeout: "5 minutes" })((it) => {
      it.effect(
        "persists a thread, ordered turns, and projects a timeline through Drizzle",
        Effect.fnUntraced(function* () {
          yield* migrateWorkspaceThread();
          const store = yield* makeDrizzleThreadStore();
          const workspaceId = yield* decodeWorkspaceId(2);

          const thread = yield* store.createThread({ title: "Matter intake", workspaceId });
          expect(thread.title).toBe("Matter intake");

          const threads = yield* store.listThreads(workspaceId);
          expect(threads.map((t) => t.id)).toEqual([thread.id]);

          const first = yield* store.appendTurn({
            threadId: thread.id,
            parentTurnId: O.none(),
            role: "user",
            content: docOf("Hello"),
          });
          expect(first.turn.turnIndex).toBe(0);

          const second = yield* store.appendTurn({
            threadId: thread.id,
            parentTurnId: O.some(first.turn.id),
            role: "assistant",
            content: docOf("Hi there"),
          });
          expect(second.turn.turnIndex).toBe(1);
          expect(O.getOrNull(second.turn.parentTurnId)).toStrictEqual(first.turn.id);

          const timeline = yield* store.timeline(thread.id);
          expect(timeline.threadId).toStrictEqual(thread.id);
          expect(timeline.turns.map((turn) => turn.turnIndex)).toEqual([0, 1]);
          expect(timeline.turns.every((turn) => turn.costMicros === 0)).toBe(true);

          const firstItem = timeline.turns[0]?.items[0];
          expect(firstItem?.kind).toBe("message");
          if (firstItem?.kind === "message") {
            expect(firstItem.role).toBe("user");
          }
          const secondItem = timeline.turns[1]?.items[0];
          if (secondItem?.kind === "message") {
            expect(secondItem.role).toBe("assistant");
          }
        }),
        PgliteIntegrationTimeout
      );
    });
  });
}
