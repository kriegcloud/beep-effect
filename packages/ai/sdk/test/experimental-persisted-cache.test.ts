import * as PersistedCache from "@beep/ai-sdk/experimental/PersistedCache";
import type { QueryHandle } from "@beep/ai-sdk/Query";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Ref from "effect/Ref";
import { runEffect } from "./effect-test.js";

test("PersistedCache metadata wrapper reuses cached commands", async () => {
  const program = Effect.scoped(
    Effect.gen(function* () {
      const counter = yield* Ref.make(0);
      const handle = {
        supportedCommands: Ref.update(counter, (n) => n + 1).pipe(
          Effect.andThen(() =>
            Effect.succeed([
              {
                name: "help",
                description: "show help",
                argumentHint: "",
              },
            ])
          )
        ),
        supportedModels: Effect.succeed([]),
        accountInfo: Effect.succeed({}),
      } as unknown as QueryHandle;

      const cached = yield* PersistedCache.makeCachedQueryHandle(handle, {
        timeToLive: "1 minute",
      });

      yield* cached.supportedCommands;
      yield* cached.supportedCommands;

      return yield* Ref.get(counter);
    }).pipe(Effect.provide(PersistedCache.Persistence.layerMemory))
  );

  const invocations = await runEffect(program);
  expect(invocations).toBe(1);
});
