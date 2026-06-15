import { Document, P, Text } from "@beep/md";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import { makeInMemoryThreadStore } from "@beep/workspace-server/aggregates/Thread";
import { SetThreadTitleIfEmptyInput } from "@beep/workspace-use-cases/aggregates/Thread/server";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { FastCheck as fc } from "effect/testing";

const decodeWorkspaceId = S.decodeUnknownEffect(WorkspaceIdentity.WorkspaceId);
const SetThreadTitleIfEmptyInputArbitrary = S.toArbitrary(SetThreadTitleIfEmptyInput);
const docOf = (value: string) => Document.make({ children: [P.make({ children: [Text.make({ value })] })] });

describe("ThreadStore in-memory", () => {
  it.effect(
    "creates a thread, appends ordered turns, and projects a timeline",
    Effect.fnUntraced(function* () {
      const store = yield* makeInMemoryThreadStore();
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
      expect(first.message.role).toBe("user");

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
      expect(secondItem?.kind).toBe("message");
      if (secondItem?.kind === "message") {
        expect(secondItem.role).toBe("assistant");
      }
    })
  );

  it.effect(
    "fails with ThreadStoreNotFound when appending to an unknown thread",
    Effect.fnUntraced(function* () {
      const store = yield* makeInMemoryThreadStore();
      const missing = yield* S.decodeUnknownEffect(WorkspaceIdentity.ThreadId)(999);
      const error = yield* store
        .appendTurn({ threadId: missing, parentTurnId: O.none(), role: "user", content: docOf("x") })
        .pipe(Effect.flip);
      expect(error._tag).toBe("ThreadStoreNotFound");
    })
  );

  it.effect(
    "sets an empty thread title once",
    Effect.fnUntraced(function* () {
      const store = yield* makeInMemoryThreadStore();
      const workspaceId = yield* decodeWorkspaceId(2);

      const thread = yield* store.createThread({ title: "New thread", workspaceId });

      yield* store.setTitleIfEmpty({
        threadId: thread.id,
        emptyTitle: "New thread",
        title: "Draft fee memo",
      });
      yield* store.setTitleIfEmpty({
        threadId: thread.id,
        emptyTitle: "New thread",
        title: "Ignored replacement",
      });

      const threads = yield* store.listThreads(workspaceId);
      expect(A.map(threads, (thread) => thread.title)).toEqual(["Draft fee memo"]);
    })
  );

  it("generates valid set-title inputs from the production schema", () => {
    fc.assert(
      fc.property(SetThreadTitleIfEmptyInputArbitrary, (input) => {
        expect(input.emptyTitle.length).toBeGreaterThan(0);
        expect(input.title.length).toBeGreaterThan(0);
      })
    );
  });

  it.effect(
    "fails with ThreadStoreNotFound when setting the title for an unknown thread",
    Effect.fnUntraced(function* () {
      const store = yield* makeInMemoryThreadStore();
      const missing = yield* S.decodeUnknownEffect(WorkspaceIdentity.ThreadId)(999);
      const error = yield* store
        .setTitleIfEmpty({ threadId: missing, emptyTitle: "New thread", title: "Missing" })
        .pipe(Effect.flip);
      expect(error._tag).toBe("ThreadStoreNotFound");
    })
  );
});
