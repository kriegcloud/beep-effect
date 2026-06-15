import { fileURLToPath } from "node:url";
import { Document, P, Text } from "@beep/md";
import { makeDrizzle, makeDrizzleLayer, migrate } from "@beep/postgres";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import { makePgliteIntegrationGate, TestDatabaseInfo } from "@beep/test-utils";
import { makeDrizzleThreadStore } from "@beep/workspace-server/aggregates/Thread";
import { describe, expect, layer } from "@effect/vitest";
import { Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const migrationsFolder = fileURLToPath(new URL("../../../../_internal/db-admin/drizzle", import.meta.url));
const { shouldRunPgliteIntegration, pgliteIntegrationTimeoutMillis, makePgliteLayer } = makePgliteIntegrationGate();

const decodeWorkspaceId = S.decodeUnknownEffect(WorkspaceIdentity.WorkspaceId);
const docOf = (value: string) => Document.make({ children: [P.make({ children: [Text.make({ value })] })] });

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

          const thread = yield* store.createThread({ title: "New thread", workspaceId });
          expect(thread.title).toBe("New thread");

          yield* store.setTitleIfEmpty({
            threadId: thread.id,
            emptyTitle: "New thread",
            title: "Matter intake",
          });
          yield* store.setTitleIfEmpty({
            threadId: thread.id,
            emptyTitle: "New thread",
            title: "Ignored replacement",
          });

          const threads = yield* store.listThreads(workspaceId);
          expect(threads.map((t) => t.id)).toEqual([thread.id]);
          expect(A.map(threads, (thread) => thread.title)).toEqual(["Matter intake"]);

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
        pgliteIntegrationTimeoutMillis
      );
    });
  });
}
