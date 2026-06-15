/**
 * App-level chat-orchestration contract test — the headline SPEC CI acceptance.
 *
 * Proven entirely with an in-memory stack: the deterministic FixtureTurnKernel
 * (no LLM), the in-memory ThreadStore (no PGlite/Tauri), and the in-memory
 * UsageRecordSink. The orchestration operations are exercised directly via
 * their use-case Effects/streams (no rpc transport).
 */
import { Turn } from "@beep/agents-domain";
import { FixtureTurnKernel, fixtureBlocksFor } from "@beep/agents-use-cases/proof";
import { AgentTurnKernel } from "@beep/agents-use-cases/public";
import * as Md from "@beep/md/Md.model";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import { provideScopedLayer } from "@beep/test-utils";
import { ThreadStoreInMemoryLayer } from "@beep/workspace-server/aggregates/Thread";
import { Thread } from "@beep/workspace-use-cases/server";
import { describe, expect, it } from "@effect/vitest";
import { Array as A, Deferred, Effect, Fiber, Layer, Ref, Stream } from "effect";
import * as S from "effect/Schema";
import { documentToPlainText, makeChatOperations } from "@/chat/ChatOrchestrator";
import { makeInMemoryUsageRecordSink } from "@/chat/UsageRecordSink";

const decodeWorkspaceId = S.decodeUnknownSync(WorkspaceIdentity.WorkspaceId);

const userDocument = (text: string): Md.Document.Type =>
  Md.Document.make({ children: [Md.P.make({ children: [Md.Text.make({ value: text })] })] });

// Build the chat operations + the usage Ref over the provided in-memory stack.
const makeStack = Effect.gen(function* () {
  const store = yield* Thread.ThreadStore;
  const kernel = yield* AgentTurnKernel;
  const { ref, sink } = yield* makeInMemoryUsageRecordSink;
  return { operations: makeChatOperations(store, kernel, sink), usageRef: ref };
});

const StackLayer = Layer.merge(ThreadStoreInMemoryLayer, FixtureTurnKernel);

type MessageItem = { readonly role: Thread.TimelineMessageItem["role"]; readonly content: Md.Document.Type };

const messageItems = (timeline: Thread.ThreadTimeline): ReadonlyArray<MessageItem> =>
  A.flatMap(timeline.turns, (turn) =>
    A.flatMap(
      turn.items,
      (item): ReadonlyArray<MessageItem> =>
        item.kind === "message" ? [{ role: item.role, content: item.content }] : []
    )
  );

describe("@beep/professional-desktop chat contract", () => {
  it.effect("happy path: send streams fixture blocks, persists user+assistant turns, appends one usage record", () =>
    Effect.gen(function* () {
      const { operations, usageRef } = yield* makeStack;
      const workspaceId = decodeWorkspaceId(1);

      const thread = yield* operations.createThread(workspaceId, "Contract");
      const content = userDocument("Hi");

      const expectedBlocks = fixtureBlocksFor([{ role: "user", text: "Hi" }]);
      const emitted = yield* Stream.runCollect(operations.sendMessage(thread.id, content));

      // 1) the stream emits the fixture's deterministic blocks
      expect(emitted).toHaveLength(expectedBlocks.length);
      expect(emitted[0]).toStrictEqual(expectedBlocks[0]);
      expect([...emitted]).toStrictEqual([...expectedBlocks]);

      // 2) the timeline shows a user turn then an assistant turn whose content
      // is the lifted Document
      const timeline = yield* operations.getTimeline(thread.id);
      const items = messageItems(timeline);
      expect(items.map((m) => m.role)).toEqual(["user", "assistant"]);
      expect(items[0]?.content).toStrictEqual(content);
      expect(items[1]?.content).toStrictEqual(Turn.assistantContentToDocument([...expectedBlocks]));

      // 3) exactly one usage record, provider "fixture"
      const usage = yield* Ref.get(usageRef);
      expect(usage).toHaveLength(1);
      expect(usage[0]?.provider).toBe("fixture");
    }).pipe(provideScopedLayer(StackLayer))
  );

  it.effect("cancel leaves no partial assistant row and appends no usage record", () =>
    Effect.gen(function* () {
      const { operations, usageRef } = yield* makeStack;
      const workspaceId = decodeWorkspaceId(1);
      const thread = yield* operations.createThread(workspaceId, "Cancel");

      const firstBlockSeen = yield* Deferred.make<void>();
      const release = yield* Deferred.make<void>();

      // Park the stream after the first block so it never reaches onEnd; the
      // test interrupts it before completion.
      const parked = operations.sendMessage(thread.id, userDocument("Hi")).pipe(
        Stream.tap(() =>
          Effect.gen(function* () {
            yield* Deferred.succeed(firstBlockSeen, void 0);
            yield* Deferred.await(release);
          })
        )
      );

      const fiber = yield* Effect.forkChild(Stream.runDrain(parked));
      yield* Deferred.await(firstBlockSeen);
      yield* Fiber.interrupt(fiber);

      // timeline shows the user turn but NO assistant turn
      const timeline = yield* operations.getTimeline(thread.id);
      const items = messageItems(timeline);
      expect(items.map((m) => m.role)).toEqual(["user"]);

      // no usage record appended on interrupt
      const usage = yield* Ref.get(usageRef);
      expect(usage).toHaveLength(0);
    }).pipe(provideScopedLayer(StackLayer))
  );

  it.effect("timeline ordering: a second send appends after the first assistant turn", () =>
    Effect.gen(function* () {
      const { operations } = yield* makeStack;
      const workspaceId = decodeWorkspaceId(1);
      const thread = yield* operations.createThread(workspaceId, "Ordering");

      yield* Stream.runDrain(operations.sendMessage(thread.id, userDocument("first")));
      yield* Stream.runDrain(operations.sendMessage(thread.id, userDocument("second")));

      const timeline = yield* operations.getTimeline(thread.id);
      // user, assistant, user, assistant — strictly increasing turn indices
      expect(timeline.turns.map((t) => t.turnIndex)).toEqual([0, 1, 2, 3]);
      const items = messageItems(timeline);
      expect(items.map((m) => m.role)).toEqual(["user", "assistant", "user", "assistant"]);
      expect(documentToPlainText(items[2]!.content)).toBe("second");
    }).pipe(provideScopedLayer(StackLayer))
  );
});
