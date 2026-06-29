import * as Chat from "@app/domain/api/chat-rpc";
import * as NodeServices from "@effect/platform-node/NodeServices";
import * as PgMigrator from "@effect/sql-pg/PgMigrator";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Migrator from "effect/unstable/sql/Migrator";
import { ChatRepo } from "./chat-repo.js";
import { PgTest, withTransactionRollback } from "./pg-test.js";

const TestMigrationLayer = PgMigrator.layer({
  loader: Migrator.fromGlob(import.meta.glob("./migrations/*.ts")),
}).pipe(
  Layer.provide(NodeServices.layer),
  Layer.orDie,
);

const TestLive = Layer.mergeAll(
  Layer.effect(ChatRepo, ChatRepo.make),
).pipe(
  Layer.provideMerge(TestMigrationLayer),
  Layer.provideMerge(PgTest),
);

describe("ChatRepo", () => {
  it.layer(TestLive, { timeout: "30 seconds" })("integration", (it) => {
    it.effect("create inserts chat and returns it with generated id, createdAt, updatedAt", () =>
      withTransactionRollback(
        Effect.gen(function*() {
          const repo = yield* ChatRepo;
          const chat = yield* repo.create({
            userId: "user-1",
            title: "My Chat",
            model: "llama3.2",
          });
          expect(chat.title).toBe("My Chat");
          expect(chat.model).toBe("llama3.2");
          expect(chat.userId).toBe("user-1");
          expect(chat.id).toBeDefined();
          expect(chat.createdAt).toBeDefined();
          expect(chat.updatedAt).toBeDefined();
          expect(chat.messages).toEqual([]);
        }),
      ));

    it.effect("findById returns chat when id and userId match", () =>
      withTransactionRollback(
        Effect.gen(function*() {
          const repo = yield* ChatRepo;
          const created = yield* repo.create({
            userId: "user-1",
            title: "Find Me",
            model: "llama3.2",
          });
          const found = yield* repo.findById(created.id, "user-1");
          expect(found.id).toBe(created.id);
          expect(found.title).toBe("Find Me");
        }),
      ));

    it.effect("findById fails with ChatNotFoundError when userId does not match", () =>
      withTransactionRollback(
        Effect.gen(function*() {
          const repo = yield* ChatRepo;
          const created = yield* repo.create({
            userId: "user-1",
            title: "Secret",
            model: "llama3.2",
          });
          const exit = yield* repo.findById(created.id, "user-2").pipe(Effect.exit);
          expect(exit._tag).toBe("Failure");
        }),
      ));

    it.effect("findById fails with ChatNotFoundError for non-existent id", () =>
      withTransactionRollback(
        Effect.gen(function*() {
          const repo = yield* ChatRepo;
          const fakeId = Chat.ChatId.make("00000000-0000-4000-8000-000000000099");
          const exit = yield* repo.findById(fakeId, "user-1").pipe(Effect.exit);
          expect(exit._tag).toBe("Failure");
        }),
      ));

    it.effect("listByUser returns chats ordered by updatedAt desc", () =>
      withTransactionRollback(
        Effect.gen(function*() {
          const repo = yield* ChatRepo;
          yield* repo.create({ userId: "user-1", title: "Chat A", model: "llama3.2" });
          yield* repo.create({ userId: "user-1", title: "Chat B", model: "llama3.2" });
          yield* repo.create({ userId: "user-2", title: "Other User", model: "llama3.2" });

          const result = yield* repo.listByUser("user-1", Option.none());
          expect(result.items).toHaveLength(2);
          expect(result.hasMore).toBe(false);
          const titles = result.items.map((c) => c.title);
          expect(titles).toContain("Chat A");
          expect(titles).toContain("Chat B");
        }),
      ));

    it.effect("listByUser pagination: cursor excludes items at or after it", () =>
      withTransactionRollback(
        Effect.gen(function*() {
          const repo = yield* ChatRepo;
          yield* repo.create({ userId: "user-1", title: "Old", model: "llama3.2" });
          const newer = yield* repo.create({ userId: "user-1", title: "New", model: "llama3.2" });

          const result = yield* repo.listByUser("user-1", Option.some(newer.updatedAt));
          expect(result.items.every((c) => c.title !== "New")).toBe(true);
        }),
      ));

    it.effect("delete removes chat", () =>
      withTransactionRollback(
        Effect.gen(function*() {
          const repo = yield* ChatRepo;
          const chat = yield* repo.create({
            userId: "user-1",
            title: "Delete Me",
            model: "llama3.2",
          });
          yield* repo.delete(chat.id, "user-1");
          const exit = yield* repo.findById(chat.id, "user-1").pipe(Effect.exit);
          expect(exit._tag).toBe("Failure");
        }),
      ));

    it.effect("delete fails with ChatNotFoundError for wrong userId", () =>
      withTransactionRollback(
        Effect.gen(function*() {
          const repo = yield* ChatRepo;
          const chat = yield* repo.create({ userId: "user-1", title: "Mine", model: "llama3.2" });
          const exit = yield* repo.delete(chat.id, "user-2").pipe(Effect.exit);
          expect(exit._tag).toBe("Failure");
        }),
      ));
  });
});
