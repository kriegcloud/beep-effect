import { Document, P, Text } from "@beep/md";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import { makeInMemoryThreadStore } from "@beep/workspace-server/aggregates/Thread";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const decodeWorkspaceId = S.decodeUnknownEffect(WorkspaceIdentity.WorkspaceId);
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
});
