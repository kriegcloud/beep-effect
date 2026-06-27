import { ModelFamily } from "@app/domain/ai-models";
import { ChatId, RunId } from "@app/domain/api/chat-rpc";
import type { ChatEvent, ChatWatchEvent, Message } from "@app/domain/api/chat-rpc";
import { addEqualityTesters, describe, expect, it } from "@effect/vitest";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import * as KeyValueStore from "effect/unstable/persistence/KeyValueStore";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as AtomRegistry from "effect/unstable/reactivity/AtomRegistry";
import { ChatApi } from "./chat-api.js";
import {
  chatRuntime,
  deleteChatFamily,
  generatingFamily,
  inputFamily,
  interruptFamily,
  messagesFamily,
  preferencesRuntime,
  selectedModelAtom,
  sendMessageFamily,
  watchChatFamily,
} from "./chat-atoms.js";

addEqualityTesters();

const TEST_CHAT_ID = ChatId.make("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
const OTHER_CHAT_ID = ChatId.make("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13");
const TEST_RUN_ID = RunId.make("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12");
const OTHER_RUN_ID = RunId.make("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14");
const SELECTED_MODEL_KEY = "@app/chat/selected-model";

class TestError extends Schema.TaggedErrorClass<TestError>()("TestError", {
  message: Schema.String,
}) {}

const makeChat = ({
  chatId = TEST_CHAT_ID,
  messages = [],
  activeRunId = null,
}: {
  readonly chatId?: ChatId;
  readonly messages?: ReadonlyArray<Message>;
  readonly activeRunId?: RunId | null;
}) => ({
  id: chatId,
  title: "Test Chat",
  model: "llama3.2" as const,
  createdAt: new Date() as never,
  updatedAt: new Date() as never,
  messages,
  activeRunId,
});

const makeApiLayer = (options?: {
  readonly chatAsk?: (
    args: { readonly chatId: ChatId; readonly message: string; },
  ) => Effect.Effect<{ readonly runId: RunId; }, unknown>;
  readonly chatEvents?: (runId: RunId) => Stream.Stream<ChatEvent, unknown>;
  readonly chatWatch?: (chatId: ChatId) => Stream.Stream<ChatWatchEvent, unknown>;
  readonly chatGet?: (chatId: ChatId) => Effect.Effect<ReturnType<typeof makeChat>, unknown>;
  readonly chatDelete?: (chatId: ChatId) => Effect.Effect<void, unknown>;
  readonly chatInterrupt?: (chatId: ChatId) => Effect.Effect<void, unknown>;
}) => {
  const calls = {
    chatAsk: [] as Array<{ chatId: ChatId; message: string; }>,
    chatEvents: [] as Array<RunId>,
    chatWatch: [] as Array<ChatId>,
    chatInterrupt: [] as Array<ChatId>,
    chatDelete: [] as Array<ChatId>,
  };

  const layer = Layer.mock(ChatApi)({
    chatAsk: (args) => {
      calls.chatAsk.push(args);
      return (options?.chatAsk?.(args) ?? Effect.succeed({ runId: TEST_RUN_ID })) as never;
    },
    chatEvents: (runId) => {
      calls.chatEvents.push(runId);
      return (options?.chatEvents?.(runId) ?? Stream.empty) as never;
    },
    chatWatch: (chatId) => {
      calls.chatWatch.push(chatId);
      return (options?.chatWatch?.(chatId) ?? Stream.never) as never;
    },
    chatList: () => Effect.succeed({ items: [], hasMore: false }),
    chatGet: (chatId) =>
      (options?.chatGet?.(chatId) ?? Effect.succeed(makeChat({ chatId }))) as never,
    chatCreate: () => Effect.die("not mocked") as never,
    chatDelete: (chatId) => {
      calls.chatDelete.push(chatId);
      return (options?.chatDelete?.(chatId) ?? Effect.void) as never;
    },
    chatInterrupt: (chatId) => {
      calls.chatInterrupt.push(chatId);
      return (options?.chatInterrupt?.(chatId) ?? Effect.void) as never;
    },
  });

  return { calls, layer };
};

const makePreferencesLayer = (options?: {
  readonly initialModel?: typeof ModelFamily.Type;
  readonly failGet?: boolean;
}) => {
  const storage = new Map<string, string>();
  if (options?.initialModel) {
    storage.set(SELECTED_MODEL_KEY, JSON.stringify(options.initialModel));
  }

  const layer = Layer.succeed(
    KeyValueStore.KeyValueStore,
    KeyValueStore.makeStringOnly({
      get: (key) =>
        options?.failGet
          ? Effect.fail(new TestError({ message: "get-failed" })) as never
          : Effect.succeed(storage.get(key)),
      set: (key, value) =>
        Effect.sync(() => {
          storage.set(key, value);
        }),
      remove: (key) =>
        Effect.sync(() => {
          storage.delete(key);
        }),
      clear: Effect.sync(() => {
        storage.clear();
      }),
      size: Effect.sync(() => storage.size),
    }),
  );

  return {
    getModel: () => storage.get(SELECTED_MODEL_KEY),
    layer,
  };
};

const makeRegistry = (
  options?: Parameters<typeof makeApiLayer>[0] & Parameters<typeof makePreferencesLayer>[0],
) => {
  const { calls, layer } = makeApiLayer(options);
  const preferences = makePreferencesLayer(options);
  const registry = AtomRegistry.make({
    initialValues: [
      Atom.initialValue(chatRuntime.layer, layer),
      Atom.initialValue(preferencesRuntime.layer, preferences.layer as never),
    ],
  });

  return { calls, preferences, registry };
};

const flush = async () => {
  for (let i = 0; i < 30; i++) {
    await Effect.runPromise(Effect.yieldNow);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
};

describe("chat atoms", () => {
  it("creates optimistic messages", async () => {
    const { registry } = makeRegistry({
      chatEvents: () => Stream.never,
    });

    const sendAtom = sendMessageFamily(TEST_CHAT_ID);
    registry.mount(sendAtom);
    registry.set(sendAtom, { message: "hello" });
    await flush();

    const messages = registry.get(messagesFamily(TEST_CHAT_ID));
    expect(messages).toHaveLength(2);
    expect(messages[0]!.role).toBe("user");
    expect(messages[0]!.content).toBe("hello");
    expect(messages[1]!.role).toBe("assistant");

    registry.set(sendAtom, Atom.Interrupt);
    await flush();
  });

  it("sets generating to true during streaming", async () => {
    const { registry } = makeRegistry({
      chatEvents: () => Stream.never,
    });

    const sendAtom = sendMessageFamily(TEST_CHAT_ID);
    registry.mount(sendAtom);
    registry.set(sendAtom, { message: "hello" });
    await flush();

    expect(registry.get(generatingFamily(TEST_CHAT_ID))).toBe(true);

    registry.set(sendAtom, Atom.Interrupt);
    await flush();
  });

  it("accumulates stream events on assistant message", async () => {
    const { registry } = makeRegistry({
      chatEvents: () =>
        Stream.make(
          { _tag: "Chunk", delta: "Hello" } as const,
          { _tag: "Chunk", delta: " world" } as const,
        ).pipe(Stream.concat(Stream.never)),
    });

    const sendAtom = sendMessageFamily(TEST_CHAT_ID);
    registry.mount(sendAtom);
    registry.set(sendAtom, { message: "hi" });
    await flush();

    const assistant = registry.get(messagesFamily(TEST_CHAT_ID)).find((message) =>
      message.role === "assistant"
    );
    expect(assistant?.content).toBe("Hello world");
    expect(assistant?.contentBlocks).toHaveLength(1);

    registry.set(sendAtom, Atom.Interrupt);
    await flush();
  });

  it("sets generating to false on completion", async () => {
    const { registry } = makeRegistry({
      chatEvents: () => Stream.make({ _tag: "Chunk", delta: "hi" } as const),
      chatGet: (chatId) =>
        Effect.succeed(makeChat({
          chatId,
          messages: [
            { role: "user", content: "test" },
            { role: "assistant", content: "hi" },
          ],
        })),
    });

    const sendAtom = sendMessageFamily(TEST_CHAT_ID);
    registry.mount(sendAtom);
    registry.set(sendAtom, { message: "test" });
    await flush();

    expect(registry.get(generatingFamily(TEST_CHAT_ID))).toBe(false);
    expect(registry.get(messagesFamily(TEST_CHAT_ID)).at(-1)?.content).toBe("hi");
  });

  it("loads persisted reasoning blocks", async () => {
    const { registry } = makeRegistry({
      chatGet: (chatId) =>
        Effect.succeed(makeChat({
          chatId,
          messages: [
            { role: "user", content: "test" },
            {
              role: "assistant",
              content: [
                { type: "reasoning", text: "Thinking" },
                { type: "reasoning", text: "..." },
                { type: "text", text: "answer" },
              ],
            },
          ],
        })),
    });

    registry.mount(messagesFamily(TEST_CHAT_ID));
    await flush();

    const assistant = registry.get(messagesFamily(TEST_CHAT_ID)).at(-1);
    expect(assistant?.content).toBe("answer");
    expect(assistant?.contentBlocks).toEqual([
      { _tag: "reasoning", content: "Thinking..." },
      { _tag: "text", content: "answer" },
    ]);
  });

  it("marks interrupted through interruptFamily", async () => {
    const { registry } = makeRegistry({
      chatEvents: () => Stream.never,
    });

    const sendAtom = sendMessageFamily(TEST_CHAT_ID);
    const interruptAtom = interruptFamily(TEST_CHAT_ID);
    registry.mount(sendAtom);
    registry.mount(interruptAtom);
    registry.set(sendAtom, { message: "test" });
    await flush();

    registry.set(interruptAtom, undefined);
    await flush();

    expect(registry.get(generatingFamily(TEST_CHAT_ID))).toBe(false);
    expect(registry.get(messagesFamily(TEST_CHAT_ID)).at(-1)?.content).toBe("(interrupted)");
  });

  it("stores error on stream failure", async () => {
    const { registry } = makeRegistry({
      chatEvents: () => Stream.fail(new TestError({ message: "stream-error" })),
    });

    const sendAtom = sendMessageFamily(TEST_CHAT_ID);
    registry.mount(sendAtom);
    registry.set(sendAtom, { message: "test" });
    await flush();

    expect(registry.get(generatingFamily(TEST_CHAT_ID))).toBe(false);
    expect(registry.get(messagesFamily(TEST_CHAT_ID)).at(-1)?.error).not.toBeNull();
  });

  it("calls chatAsk with correct payload", async () => {
    const { calls, registry } = makeRegistry({
      chatEvents: () => Stream.never,
    });

    const sendAtom = sendMessageFamily(TEST_CHAT_ID);
    registry.mount(sendAtom);
    registry.set(sendAtom, { message: "hello" });
    await flush();

    expect(calls.chatAsk).toEqual([{ chatId: TEST_CHAT_ID, message: "hello" }]);
    expect(calls.chatEvents).toEqual([TEST_RUN_ID]);

    registry.set(sendAtom, Atom.Interrupt);
    await flush();
  });

  it("clears optimistic messages when chatAsk fails", async () => {
    const { calls, registry } = makeRegistry({
      chatAsk: () => Effect.fail(new TestError({ message: "ask-failed" })),
    });

    const sendAtom = sendMessageFamily(TEST_CHAT_ID);
    registry.mount(sendAtom);
    registry.set(sendAtom, { message: "hello" });
    await flush();

    expect(calls.chatAsk).toEqual([{ chatId: TEST_CHAT_ID, message: "hello" }]);
    expect(registry.get(messagesFamily(TEST_CHAT_ID))).toEqual([]);
    expect(registry.get(generatingFamily(TEST_CHAT_ID))).toBe(false);
  });

  it("keeps chats independent", async () => {
    const { registry } = makeRegistry({
      chatEvents: (runId) => runId === TEST_RUN_ID ? Stream.never : Stream.empty,
      chatAsk: ({ chatId }) =>
        Effect.succeed({ runId: chatId === TEST_CHAT_ID ? TEST_RUN_ID : OTHER_RUN_ID }),
    });

    const chatASend = sendMessageFamily(TEST_CHAT_ID);
    registry.mount(chatASend);
    registry.set(chatASend, { message: "hello" });
    await flush();

    expect(registry.get(messagesFamily(TEST_CHAT_ID))).toHaveLength(2);
    expect(registry.get(messagesFamily(OTHER_CHAT_ID))).toHaveLength(0);
    expect(registry.get(generatingFamily(TEST_CHAT_ID))).toBe(true);
    expect(registry.get(generatingFamily(OTHER_CHAT_ID))).toBe(false);

    registry.set(chatASend, Atom.Interrupt);
    await flush();
  });

  it("makes the second submit a no op while send is pending", async () => {
    const gate = Effect.runSync(Deferred.make<{ readonly runId: RunId; }>());
    const { calls, registry } = makeRegistry({
      chatAsk: () => Deferred.await(gate),
      chatEvents: () => Stream.never,
    });

    const sendAtom = sendMessageFamily(TEST_CHAT_ID);
    registry.mount(sendAtom);
    registry.set(sendAtom, { message: "hello" });
    await flush();
    registry.set(sendAtom, { message: "hello again" });
    await flush();

    expect(calls.chatAsk).toHaveLength(1);
    const messages = registry.get(messagesFamily(TEST_CHAT_ID));
    expect(messages).toHaveLength(2);
    expect(messages[0]?.content).toBe("hello");
    expect(messages[1]?.content).toBe("");

    Effect.runSync(Deferred.succeed(gate, { runId: TEST_RUN_ID }));
    await flush();
    registry.set(sendAtom, Atom.Interrupt);
    await flush();
  });

  it("interruptFamily cancels a pending send before chatAsk resolves", async () => {
    const gate = Effect.runSync(Deferred.make<{ readonly runId: RunId; }>());
    const { calls, registry } = makeRegistry({
      chatAsk: () => Deferred.await(gate),
      chatEvents: () => Stream.never,
    });

    const sendAtom = sendMessageFamily(TEST_CHAT_ID);
    const interruptAtom = interruptFamily(TEST_CHAT_ID);
    registry.mount(sendAtom);
    registry.mount(interruptAtom);
    registry.set(sendAtom, { message: "hello" });
    await flush();

    registry.set(interruptAtom, undefined);
    await flush();

    expect(calls.chatInterrupt).toEqual([]);
    expect(registry.get(generatingFamily(TEST_CHAT_ID))).toBe(false);
    expect(registry.get(messagesFamily(TEST_CHAT_ID))).toHaveLength(0);

    Effect.runSync(Deferred.succeed(gate, { runId: TEST_RUN_ID }));
    await flush();

    expect(calls.chatInterrupt).toEqual([TEST_CHAT_ID]);
    expect(calls.chatEvents).toEqual([]);
  });

  it("uses persisted chat data for selectors when local state is none", async () => {
    const { registry } = makeRegistry({
      chatGet: (chatId) =>
        Effect.succeed(makeChat({
          chatId,
          activeRunId: TEST_RUN_ID,
          messages: [
            { role: "user", content: "hello" },
            { role: "assistant", content: "world" },
          ],
        })),
    });

    registry.mount(messagesFamily(TEST_CHAT_ID));
    await flush();

    expect(registry.get(messagesFamily(TEST_CHAT_ID)).map((message) => message.content)).toEqual([
      "hello",
      "world",
    ]);
    expect(registry.get(generatingFamily(TEST_CHAT_ID))).toBe(true);
  });

  it("keeps completion race overlay when refresh fails", async () => {
    let chatGetCalls = 0;
    const { registry } = makeRegistry({
      chatEvents: () => Stream.make({ _tag: "Chunk", delta: "hi" } as const),
      chatGet: (chatId) =>
        Effect.sync(() => {
          chatGetCalls++;
          if (chatGetCalls === 1) {
            return makeChat({ chatId });
          }
          throw new Error("refresh failed");
        }),
    });

    const sendAtom = sendMessageFamily(TEST_CHAT_ID);
    registry.mount(sendAtom);
    registry.set(sendAtom, { message: "hello" });
    await flush();

    expect(registry.get(messagesFamily(TEST_CHAT_ID)).at(-1)?.content).toBe("hi");
    expect(registry.get(generatingFamily(TEST_CHAT_ID))).toBe(false);
  });

  it("keeps completion race overlay when refresh reports same run", async () => {
    let chatGetCalls = 0;
    const { registry } = makeRegistry({
      chatEvents: () => Stream.make({ _tag: "Chunk", delta: "hi" } as const),
      chatGet: (chatId) =>
        Effect.sync(() => {
          chatGetCalls++;
          return makeChat({
            chatId,
            activeRunId: chatGetCalls === 1 ? null : TEST_RUN_ID,
          });
        }),
    });

    const sendAtom = sendMessageFamily(TEST_CHAT_ID);
    registry.mount(sendAtom);
    registry.set(sendAtom, { message: "hello" });
    await flush();

    expect(registry.get(messagesFamily(TEST_CHAT_ID)).at(-1)?.content).toBe("hi");
    expect(registry.get(generatingFamily(TEST_CHAT_ID))).toBe(false);
  });

  it("clears completion race overlay when watch reports run cleared", async () => {
    let chatGetCalls = 0;
    const { registry } = makeRegistry({
      chatEvents: () => Stream.make({ _tag: "Chunk", delta: "hi" } as const),
      chatGet: (chatId) =>
        Effect.sync(() => {
          chatGetCalls++;
          if (chatGetCalls === 1) {
            return makeChat({ chatId });
          }
          if (chatGetCalls === 2) {
            return makeChat({
              chatId,
              activeRunId: TEST_RUN_ID,
              messages: [
                { role: "user", content: "hello" },
                { role: "assistant", content: "hi" },
              ],
            });
          }
          return makeChat({
            chatId,
            messages: [
              { role: "user", content: "hello" },
              { role: "assistant", content: "hi" },
            ],
          });
        }),
      chatWatch: () => Stream.make({ _tag: "RunChanged", runId: null } as const),
    });

    const sendAtom = sendMessageFamily(TEST_CHAT_ID);
    const watchAtom = watchChatFamily(TEST_CHAT_ID);
    registry.mount(sendAtom);
    registry.mount(watchAtom);
    registry.set(sendAtom, { message: "hello" });
    await flush();
    registry.set(watchAtom, { activeRunId: null });
    await flush();

    expect(registry.get(messagesFamily(TEST_CHAT_ID)).map((message) => message.content)).toEqual([
      "hello",
      "hi",
    ]);
    expect(registry.get(generatingFamily(TEST_CHAT_ID))).toBe(false);
  });

  it("chains into the next run after completion", async () => {
    let chatGetCalls = 0;
    const { calls, registry } = makeRegistry({
      chatEvents: (runId) =>
        runId === TEST_RUN_ID
          ? Stream.make({ _tag: "Chunk", delta: "first" } as const)
          : Stream.never,
      chatGet: (chatId) =>
        Effect.sync(() => {
          chatGetCalls++;
          if (chatGetCalls === 1) {
            return makeChat({ chatId });
          }
          return makeChat({
            chatId,
            activeRunId: OTHER_RUN_ID,
            messages: [
              { role: "user", content: "hello" },
              { role: "assistant", content: "done" },
            ],
          });
        }),
    });

    const sendAtom = sendMessageFamily(TEST_CHAT_ID);
    registry.mount(sendAtom);
    registry.set(sendAtom, { message: "hello" });
    await flush();

    expect(calls.chatEvents).toEqual([TEST_RUN_ID, OTHER_RUN_ID]);
    expect(registry.get(generatingFamily(TEST_CHAT_ID))).toBe(true);
    expect(registry.get(messagesFamily(TEST_CHAT_ID)).map((message) => message.content)).toEqual([
      "hello",
      "done",
      "",
    ]);

    registry.set(sendAtom, Atom.Interrupt);
    await flush();
  });

  it("attaches an active run from the watcher", async () => {
    const { calls, registry } = makeRegistry({
      chatEvents: () => Stream.never,
      chatGet: (chatId) =>
        Effect.succeed(makeChat({
          chatId,
          activeRunId: TEST_RUN_ID,
          messages: [{ role: "user", content: "hello" }],
        })),
      chatWatch: () => Stream.never,
    });

    const watchAtom = watchChatFamily(TEST_CHAT_ID);
    registry.mount(watchAtom);
    registry.set(watchAtom, { activeRunId: TEST_RUN_ID });
    await flush();

    expect(calls.chatWatch).toEqual([TEST_CHAT_ID]);
    expect(calls.chatEvents).toEqual([TEST_RUN_ID]);
    expect(registry.get(generatingFamily(TEST_CHAT_ID))).toBe(true);
    expect(registry.get(messagesFamily(TEST_CHAT_ID)).map((message) => message.content)).toEqual([
      "hello",
      "",
    ]);

    registry.set(watchAtom, Atom.Interrupt);
    await flush();
  });

  it("resumes the same run from overlay without replacing local messages", async () => {
    let watchEvents = Stream.never as Stream.Stream<ChatWatchEvent, unknown>;
    const { registry } = makeRegistry({
      chatEvents: (runId) =>
        runId === TEST_RUN_ID
          ? Stream.make({ _tag: "Chunk", delta: "partial" } as const).pipe(
            Stream.concat(Stream.never),
          )
          : Stream.empty,
      chatGet: (chatId) => Effect.succeed(makeChat({ chatId, activeRunId: TEST_RUN_ID })),
      chatWatch: () => watchEvents,
    });

    const sendAtom = sendMessageFamily(TEST_CHAT_ID);
    const interruptAtom = interruptFamily(TEST_CHAT_ID);
    const watchAtom = watchChatFamily(TEST_CHAT_ID);
    registry.mount(sendAtom);
    registry.mount(interruptAtom);
    registry.mount(watchAtom);

    registry.set(sendAtom, { message: "hello" });
    await flush();
    registry.set(interruptAtom, undefined);
    await flush();

    expect(registry.get(messagesFamily(TEST_CHAT_ID)).at(-1)?.content).toBe("partial");

    watchEvents = Stream.make({ _tag: "RunChanged", runId: TEST_RUN_ID } as const);
    registry.set(watchAtom, Atom.Interrupt);
    await flush();
    registry.set(watchAtom, { activeRunId: TEST_RUN_ID });
    await flush();

    expect(registry.get(messagesFamily(TEST_CHAT_ID)).at(-1)?.content).toBe("partial");
    expect(registry.get(generatingFamily(TEST_CHAT_ID))).toBe(true);
  });

  it("selectedModelAtom falls back to qwen3.6-uncensored:35b on storage read failure", async () => {
    const { registry } = makeRegistry({ failGet: true });

    registry.mount(selectedModelAtom);
    await flush();

    expect(registry.get(selectedModelAtom)).toBe("qwen3.6-uncensored:35b");
  });

  it("selectedModelAtom persists model changes through KeyValueStore", async () => {
    const { preferences, registry } = makeRegistry({ initialModel: "llama3.2" });

    registry.mount(selectedModelAtom);
    await flush();

    expect(registry.get(selectedModelAtom)).toBe("llama3.2");
    registry.set(selectedModelAtom, "qwen3.6-uncensored:35b");
    await flush();
    expect(preferences.getModel()).toBe(JSON.stringify("qwen3.6-uncensored:35b"));
  });

  it("deleteChatFamily clears local state for only one chat", async () => {
    const { registry } = makeRegistry({
      chatAsk: ({ chatId }) =>
        Effect.succeed({ runId: chatId === TEST_CHAT_ID ? TEST_RUN_ID : OTHER_RUN_ID }),
      chatEvents: (runId) => runId === TEST_RUN_ID ? Stream.never : Stream.never,
    });

    const sendA = sendMessageFamily(TEST_CHAT_ID);
    const sendB = sendMessageFamily(OTHER_CHAT_ID);
    const deleteA = deleteChatFamily(TEST_CHAT_ID);
    registry.mount(sendA);
    registry.mount(sendB);
    registry.mount(deleteA);
    registry.set(sendA, { message: "chat-a" });
    registry.set(sendB, { message: "chat-b" });
    registry.set(inputFamily(TEST_CHAT_ID), "draft");
    await flush();

    registry.set(deleteA, undefined);
    await flush();

    expect(registry.get(messagesFamily(TEST_CHAT_ID))).toEqual([]);
    expect(registry.get(inputFamily(TEST_CHAT_ID))).toBe("");
    expect(registry.get(generatingFamily(TEST_CHAT_ID))).toBe(false);
    expect(registry.get(messagesFamily(OTHER_CHAT_ID)).at(0)?.content).toBe("chat-b");

    registry.set(sendB, Atom.Interrupt);
    await flush();
  });
});
