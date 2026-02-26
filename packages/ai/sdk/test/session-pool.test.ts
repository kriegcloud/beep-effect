import { expect, test } from "bun:test"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"
import type { SessionHandle } from "../src/Session.js"
import { SessionManager } from "../src/SessionManager.js"
import { SessionPool } from "../src/SessionPool.js"
import type { SDKSessionOptions } from "../src/Schema/Session.js"
import { runEffect } from "./effect-test.js"

const makeHandle = (id: string): SessionHandle => ({
  sessionId: Effect.succeed(id),
  send: () => Effect.void,
  stream: Stream.empty,
  close: Effect.void
})

const makeManagerLayer = (resumeCalls: Array<string>) =>
  Layer.succeed(
    SessionManager,
    SessionManager.of({
      create: (_options: SDKSessionOptions) => Effect.succeed(makeHandle("created-session")),
      resume: (sessionId: string, _options: SDKSessionOptions) => {
        resumeCalls.push(sessionId)
        return Effect.succeed(makeHandle(sessionId))
      },
      prompt: () => Effect.succeed({ type: "result", subtype: "success" } as never),
      withSession: ((_: SDKSessionOptions, _use: unknown) =>
        Effect.dieMessage("SessionManager.withSession not used in SessionPool tests")) as never
    })
  )

test("SessionPool partitions resumed sessions by tenant", async () => {
  const resumeCalls: Array<string> = []
  const managerLayer = makeManagerLayer(resumeCalls)

  const result = await runEffect(
    Effect.scoped(
      Effect.gen(function*() {
        const pool = yield* SessionPool.make({ model: "claude-test" })
        yield* pool.get("shared-session", undefined, "tenant-a")
        yield* pool.get("shared-session", undefined, "tenant-b")
        yield* pool.get("shared-session", undefined, "tenant-a")
        const tenantA = yield* pool.listByTenant("tenant-a")
        const tenantB = yield* pool.listByTenant("tenant-b")
        const defaultTenant = yield* pool.list
        const infoA = yield* pool.info("shared-session", "tenant-a")
        const infoB = yield* pool.info("shared-session", "tenant-b")
        return { tenantA, tenantB, defaultTenant, infoA, infoB }
      }).pipe(Effect.provide(managerLayer))
    )
  )

  expect(resumeCalls).toEqual(["shared-session", "shared-session"])
  expect(result.tenantA.length).toBe(1)
  expect(result.tenantB.length).toBe(1)
  expect(result.defaultTenant.length).toBe(0)
  expect(result.tenantA[0]?.sessionId).toBe("shared-session")
  expect(result.tenantA[0]?.tenant).toBe("tenant-a")
  expect(result.tenantB[0]?.sessionId).toBe("shared-session")
  expect(result.tenantB[0]?.tenant).toBe("tenant-b")
  expect(result.infoA.tenant).toBe("tenant-a")
  expect(result.infoB.tenant).toBe("tenant-b")
})

test("SessionPool rejects invalid tenant format", async () => {
  const managerLayer = makeManagerLayer([])

  const result = await runEffect(
    Effect.scoped(
      Effect.gen(function*() {
        const pool = yield* SessionPool.make({ model: "claude-test" })
        return yield* Effect.either(pool.get("session-1", undefined, "bad/tenant"))
      }).pipe(Effect.provide(managerLayer))
    )
  )

  expect(Either.isLeft(result)).toBe(true)
  if (Either.isLeft(result)) {
    expect(result.left._tag).toBe("SessionPoolInvalidTenantError")
  }
})
