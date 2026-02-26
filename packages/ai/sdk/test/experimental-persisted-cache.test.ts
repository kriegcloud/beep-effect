import { test, expect } from "bun:test"
import * as Effect from "effect/Effect"
import * as Ref from "effect/Ref"
import * as PersistedCache from "../src/experimental/PersistedCache.js"
import type { QueryHandle } from "../src/Query.js"

test("PersistedCache metadata wrapper reuses cached commands", async () => {
  const program = Effect.scoped(
    Effect.gen(function*() {
      const counter = yield* Ref.make(0)
      const handle = {
        supportedCommands: Ref.update(counter, (n) => n + 1).pipe(
          Effect.zipRight(
            Effect.succeed([
              {
                name: "help",
                description: "show help",
                argumentHint: ""
              }
            ])
          )
        ),
        supportedModels: Effect.succeed([]),
        accountInfo: Effect.succeed({})
      } as unknown as QueryHandle

      const cached = yield* PersistedCache.makeCachedQueryHandle(handle, {
        timeToLive: "1 minute"
      })

      yield* cached.supportedCommands
      yield* cached.supportedCommands

      return yield* Ref.get(counter)
    }).pipe(
      Effect.provide(PersistedCache.Persistence.layerResultMemory)
    )
  )

  const invocations = await Effect.runPromise(program)
  expect(invocations).toBe(1)
})
