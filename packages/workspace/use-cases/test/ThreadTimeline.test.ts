import { Document } from "@beep/md";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import { Thread } from "@beep/workspace-use-cases/public";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";

describe("ThreadTimeline", () => {
  it.effect(
    "decodes a thread timeline with resolved message and tool-call items",
    Effect.fnUntraced(function* () {
      const threadId = yield* S.decodeUnknownEffect(WorkspaceIdentity.ThreadId)(10);
      const turnId = yield* S.decodeUnknownEffect(WorkspaceIdentity.TurnId)(20);
      const content = yield* S.encodeEffect(Document)(Document.make({ children: [] }));

      const timeline = yield* S.decodeUnknownEffect(Thread.ThreadTimeline)({
        threadId: 10,
        turns: [
          {
            turnId: 20,
            turnIndex: 0,
            parentTurnId: null,
            costMicros: 0,
            items: [
              { kind: "message", role: "user", content },
              { kind: "tool_call", name: "search" },
            ],
          },
        ],
      });

      expect(timeline.threadId).toStrictEqual(threadId);
      expect(timeline.turns[0]?.turnId).toStrictEqual(turnId);
      expect(timeline.turns[0]?.costMicros).toBe(0);
      expect(timeline.turns[0]?.items.map((item) => item.kind)).toEqual(["message", "tool_call"]);
    })
  );
});
