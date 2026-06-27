import { ChatModel } from "@/db/chat-model.js";
import { ChatRepo } from "@/db/chat-repo.js";
import { AiModels } from "@/lib/ai-models.js";
import { WorkflowRunCoordinator } from "@/lib/workflow-run-coordinator.js";
import * as Chat from "@app/domain/api/chat-rpc";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import * as Workflow from "effect/unstable/workflow/Workflow";
import * as WorkflowEngine from "effect/unstable/workflow/WorkflowEngine";
import { ChatProcessor } from "./chat-processor.js";
import { ChatToolkitLive } from "./chat-toolkit-live.js";
import { ChatMailbox } from "./chat-toolkit.js";

const ChatGenerationWorkflow = Workflow.make("chat/GenerationWorkflow", {
  payload: {
    runId: Chat.RunId,
    chat: ChatModel,
    message: Schema.String,
  },
  success: Schema.Void,
  idempotencyKey: ({ runId }) => runId,
});

const makeChatRunManager = Effect.gen(function*() {
  const aiModels = yield* AiModels;
  const processor = yield* ChatProcessor;
  const chatRepo = yield* ChatRepo;

  const runs = yield* WorkflowRunCoordinator.make<
    Chat.ChatId,
    Chat.RunId,
    Chat.ChatEvent,
    "chat/GenerationWorkflow",
    typeof ChatGenerationWorkflow.payloadSchema,
    typeof ChatGenerationWorkflow.successSchema,
    typeof ChatGenerationWorkflow.errorSchema,
    { readonly userId: string; },
    Chat.ChatRunNotFoundError,
    Chat.GenerationInProgressError
  >({
    workflow: ChatGenerationWorkflow,

    ownerId: (payload) => payload.chat.id,

    runId: (payload) => payload.runId,

    missingRun: (runId) => new Chat.ChatRunNotFoundError({ runId }),

    busy: (chatId) => new Chat.GenerationInProgressError({ chatId }),

    prepare: Effect.fnUntraced(function*(payload) {
      const userMessage: typeof Chat.Message.Type = { role: "user", content: payload.message };
      const started = yield* chatRepo.startRun({
        chatId: payload.chat.id,
        userId: payload.chat.userId,
        runId: payload.runId,
        messages: [...payload.chat.messages, userMessage],
      });
      if (!started) {
        return yield* new Chat.GenerationInProgressError({ chatId: payload.chat.id });
      }
      return { userId: payload.chat.userId } as const;
    }),

    run: Effect.fnUntraced(function*({ payload, mailbox }) {
      const userMessage: typeof Chat.Message.Type = { role: "user", content: payload.message };

      const aiMessages = yield* processor.run(payload.chat, payload.message).pipe(
        aiModels.use(payload.chat.model),
        Effect.provide(ChatToolkitLive),
        Effect.provideService(ChatMailbox, mailbox),
        Effect.orDie,
      );

      yield* chatRepo.finishRun({
        chatId: payload.chat.id,
        userId: payload.chat.userId,
        runId: payload.runId,
        messages: [...payload.chat.messages, userMessage, ...aiMessages],
      });
    }),

    finalize: ({ payload }) =>
      chatRepo.clearActiveRun({
        chatId: payload.chat.id,
        userId: payload.chat.userId,
        runId: payload.runId,
      }),

    completedRunTtl: "30 seconds",
  });

  return {
    watch: (chatId: Chat.ChatId) =>
      runs.changes(chatId).pipe(
        Stream.map((runId) => ({ _tag: "RunChanged" as const, runId })),
      ),

    subscribe: (runId: Chat.RunId, userId: string) =>
      Stream.unwrap(
        runs.resolve(runId).pipe(
          Effect.filterOrFail(
            (run) => run.metadata.userId === userId,
            () => new Chat.ChatRunNotFoundError({ runId }),
          ),
          Effect.map((run) => run.events),
        ),
      ),

    startGeneration: Effect.fnUntraced(function*(args) {
      return yield* runs.start({
        runId: Chat.RunId.make(crypto.randomUUID()),
        chat: args.chat,
        message: args.message,
      });
    }),

    interrupt: (chatId: Chat.ChatId) => runs.interrupt(chatId),
  };
});

export class ChatRunManager extends Context.Service<
  ChatRunManager,
  {
    readonly watch: (chatId: Chat.ChatId) => Stream.Stream<Chat.ChatWatchEvent>;
    readonly subscribe: (
      runId: Chat.RunId,
      userId: string,
    ) => Stream.Stream<Chat.ChatEvent, Chat.ChatRunNotFoundError>;
    readonly startGeneration: (args: {
      readonly chat: typeof ChatModel.Type;
      readonly message: string;
    }) => Effect.Effect<{ readonly runId: Chat.RunId; }, Chat.GenerationInProgressError>;
    readonly interrupt: (chatId: Chat.ChatId) => Effect.Effect<void>;
  }
>()("ChatRunManager", {
  make: makeChatRunManager,
}) {
  static make = makeChatRunManager;

  static layer: Layer.Layer<ChatRunManager> = Layer.effect(
    this,
    makeChatRunManager,
  ).pipe(
    Layer.provide(AiModels.layer),
    Layer.provide(ChatRepo.layer),
    Layer.provide(ChatProcessor.layer),
    Layer.provide(WorkflowEngine.layerMemory),
  );
}
