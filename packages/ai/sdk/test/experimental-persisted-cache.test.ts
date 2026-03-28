import * as PersistedCache from "@beep/ai-sdk/experimental/PersistedCache";
import type { QueryHandle } from "@beep/ai-sdk/Query";
import type { SDKMessage } from "@beep/ai-sdk/Schema/Message";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Ref from "effect/Ref";
import * as Stream from "effect/Stream";
import { runEffect } from "./effect-test.js";

const makeQueryHandle = (supportedCommands: QueryHandle["supportedCommands"]): QueryHandle => {
  const stream: Stream.Stream<SDKMessage> = Stream.empty;
  return {
    stream,
    send: () => Effect.void,
    sendAll: () => Effect.void,
    sendForked: () => Effect.void,
    closeInput: Effect.void,
    share: (config) => Stream.share(stream, config ?? { capacity: 16, strategy: "suspend" }),
    broadcast: (config) => {
      const resolved = config ?? 16;
      if (typeof resolved === "number") {
        return Stream.broadcast(stream, { capacity: resolved });
      }
      return Stream.broadcast(stream, resolved);
    },
    interrupt: Effect.void,
    setPermissionMode: () => Effect.void,
    setModel: () => Effect.void,
    setMaxThinkingTokens: () => Effect.void,
    rewindFiles: () => Effect.succeed({ canRewind: false }),
    supportedCommands,
    supportedModels: Effect.succeed([]),
    mcpServerStatus: Effect.succeed([]),
    setMcpServers: () => Effect.succeed({ added: [], removed: [], errors: {} }),
    accountInfo: Effect.succeed({}),
    initializationResult: Effect.succeed({
      commands: [],
      output_style: "default",
      available_output_styles: [],
      models: [],
      account: {},
    }),
    stopTask: () => Effect.void,
  };
};

test("PersistedCache metadata wrapper reuses cached commands", async () => {
  const program = Effect.scoped(
    Effect.gen(function* () {
      const counter = yield* Ref.make(0);
      const handle = makeQueryHandle(
        Ref.update(counter, (n) => n + 1).pipe(
          Effect.andThen(() =>
            Effect.succeed([
              {
                name: "help",
                description: "show help",
                argumentHint: "",
              },
            ])
          )
        )
      );

      const cached = yield* PersistedCache.makeCachedQueryHandle(
        handle,
        new PersistedCache.QueryMetadataCacheOptions({
          timeToLive: "1 minute",
        })
      );

      yield* cached.supportedCommands;
      yield* cached.supportedCommands;

      return yield* Ref.get(counter);
    }).pipe(Effect.provide(PersistedCache.Persistence.layerMemory))
  );

  const invocations = await runEffect(program);
  expect(invocations).toBe(1);
});
