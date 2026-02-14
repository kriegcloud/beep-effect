import { expect, test } from "bun:test"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"
import { SessionService } from "../src/SessionService.js"
import { SessionManager } from "../src/SessionManager.js"
import type { SessionHandle } from "../src/Session.js"
import type { SDKResultMessage } from "../src/Schema/Message.js"
import { runEffect } from "./effect-test.js"

test("SessionService.layer wires SessionManager and exposes handle methods", async () => {
  let capturedOptions: { model?: string } | undefined
  const handle: SessionHandle = {
    sessionId: Effect.succeed("session-1"),
    send: (_message) => Effect.void,
    stream: Stream.empty,
    close: Effect.void
  }

  const manager = SessionManager.of({
    create: (options) => {
      capturedOptions = options
      return Effect.succeed(handle)
    },
    resume: (_sessionId, _options) => Effect.succeed(handle),
    prompt: (_message, _options) => Effect.succeed({} as SDKResultMessage),
    withSession: (_options, use) =>
      use({
        handle,
        sessionId: handle.sessionId,
        send: handle.send,
        turn: (_message) => Stream.empty,
        stream: handle.stream,
        close: handle.close
      })
  })

  const layer = SessionService.layer({ model: "claude-test" }).pipe(
    Layer.provide(Layer.succeed(SessionManager, manager))
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const session = yield* SessionService
      return yield* session.sessionId
    }).pipe(Effect.provide(layer))
  )

  const sessionId = await runEffect(program)
  expect(sessionId).toBe("session-1")
  expect(capturedOptions?.model).toBe("claude-test")
})
