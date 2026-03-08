import { describe, expect, test } from "bun:test"
import { Duration, Effect, Exit, Fiber, Layer, Scope } from "effect"
import { BridgeHandler } from "../src/BridgeHandler"
import { SandboxError } from "../src/RlmError"
import { SandboxConfig, SandboxFactory } from "../src/Sandbox"
import { SandboxBunLive } from "../src/SandboxBun"
import type { CallId } from "../src/RlmTypes"

// Mock BridgeHandler that resolves with a fixed response
const makeBridgeHandlerLayer = (
  handler?: (options: { method: string; args: ReadonlyArray<unknown>; callerCallId: CallId }) => Effect.Effect<unknown, SandboxError>
) =>
  Layer.succeed(
    BridgeHandler,
    BridgeHandler.of({
      handle: handler ?? (() => Effect.succeed("bridge-response"))
    })
  )

const testConfig: SandboxConfig["Type"] = {
  sandboxMode: "permissive",
  sandboxTransport: "auto",
  executeTimeoutMs: 10_000,
  setVarTimeoutMs: 5_000,
  getVarTimeoutMs: 5_000,
  listVarTimeoutMs: 5_000,
  shutdownGraceMs: 2_000,
  maxFrameBytes: 4 * 1024 * 1024,
  maxBridgeConcurrency: 4,
  incomingFrameQueueCapacity: 2_048,
  workerPath: new URL("../src/sandbox-worker.ts", import.meta.url).pathname
}
const stubbornWorkerPath = new URL("./helpers/sandbox-worker-stubborn.ts", import.meta.url).pathname
const inspectWorkerPath = new URL("./helpers/sandbox-worker-inspect-process.ts", import.meta.url).pathname

const makeTestLayer = (
  bridgeHandler?: (options: { method: string; args: ReadonlyArray<unknown>; callerCallId: CallId }) => Effect.Effect<unknown, SandboxError>,
  configOverrides?: Partial<SandboxConfig["Type"]>
) => {
  const sandboxLayer = Layer.provide(SandboxBunLive, makeBridgeHandlerLayer(bridgeHandler))
  if (configOverrides) {
    return Layer.provide(sandboxLayer, Layer.succeed(SandboxConfig, { ...testConfig, ...configOverrides }))
  }
  return Layer.provide(sandboxLayer, Layer.succeed(SandboxConfig, testConfig))
}

const runTimeoutCloseCanary = (transport: "auto" | "worker", iterations = 8) =>
  Effect.gen(function*() {
    const startedAt = Date.now()
    const factory = yield* SandboxFactory

    for (let index = 0; index < iterations; index += 1) {
      const scope = yield* Scope.make()
      const sandbox = yield* factory.create({ callId: `canary-${transport}-${index}` as CallId, depth: 0 }).pipe(
        Effect.provideService(Scope.Scope, scope)
      )

      const pending = yield* Effect.fork(
        sandbox.execute("await new Promise(() => {})").pipe(Effect.either)
      )

      yield* Effect.sleep(Duration.millis(5))
      yield* Scope.close(scope, Exit.void)

      const result = yield* Fiber.join(pending)
      expect(result._tag).toBe("Left")
    }

    return Date.now() - startedAt
  })

describe("SandboxBun", () => {
  test("execute returns code output", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "test" as CallId, depth: 0 })
          return yield* sandbox.execute("print('hello from sandbox')")
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )

    expect(result).toBe("hello from sandbox")
  })

  test("setVariable and getVariable round-trip", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "test" as CallId, depth: 0 })
          yield* sandbox.setVariable("myKey", { nested: [1, 2, 3] })
          return yield* sandbox.getVariable("myKey")
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )

    expect(result).toEqual({ nested: [1, 2, 3] })
  })

  test("variables persist across executions", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "test" as CallId, depth: 0 })

          yield* sandbox.setVariable("counter", 10)
          yield* sandbox.execute("__vars.counter = __vars.counter + 5")
          return yield* sandbox.getVariable("counter")
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )

    expect(result).toBe(15)
  })

  test("listVariables returns metadata for current variable space", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "test" as CallId, depth: 0 })

          yield* sandbox.setVariable("zeta", [1, 2, 3])
          yield* sandbox.setVariable("alpha", "hello")

          return yield* sandbox.listVariables()
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )

    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result[0]!.name).toBe("alpha")
    expect(result[0]!.type).toBe("string")
    expect(result[0]!.size).toBe(5)
    expect(result[1]!.name).toBe("zeta")
    expect(result[1]!.type).toBe("array")
    expect(result[1]!.size).toBe(3)
  })

  test("code error returns SandboxError", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "test" as CallId, depth: 0 })
          return yield* sandbox.execute("throw new Error('intentional')").pipe(Effect.either)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(SandboxError)
      expect(result.left.message).toBe("intentional")
    }
  })

  test("scope close kills subprocess", async () => {
    await Effect.runPromise(
      Effect.gen(function*() {
        const scope = yield* Scope.make()
        const factory = yield* SandboxFactory
        const sandbox = yield* factory.create({ callId: "test" as CallId, depth: 0 }).pipe(
          Effect.provideService(Scope.Scope, scope)
        )

        // Verify it's alive
        const output = yield* sandbox.execute("print('alive')")
        expect(output).toBe("alive")

        // Close scope
        yield* Scope.close(scope, Exit.void)

        // Subsequent calls should fail
        const result = yield* sandbox.execute("print('dead')").pipe(Effect.either)
        expect(result._tag).toBe("Left")
      }).pipe(Effect.provide(makeTestLayer()))
    )
  })

  test("bridge call flows through BridgeHandler", async () => {
    const bridgeCalls: Array<{ method: string; args: ReadonlyArray<unknown> }> = []

    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "test" as CallId, depth: 0 })
          return yield* sandbox.execute("const r = await llm_query('hello', 'ctx'); print(r)")
        })
      ).pipe(
        Effect.provide(
          makeTestLayer(({ method, args }) => {
            bridgeCalls.push({ method, args: [...args] })
            return Effect.succeed("bridge-42")
          })
        )
      )
    )

    expect(result).toBe("bridge-42")
    expect(bridgeCalls).toHaveLength(1)
    expect(bridgeCalls[0]!.method).toBe("llm_query")
    expect(bridgeCalls[0]!.args).toEqual(["hello", "ctx"])
  })

  test("strict mode does not invoke BridgeHandler", async () => {
    let bridgeCallCount = 0

    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "test" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            try {
              await llm_query("hello")
            } catch (e) {
              print("caught: " + e.message)
            }
          `)
        })
      ).pipe(
        Effect.provide(
          makeTestLayer(
            () => {
              bridgeCallCount += 1
              return Effect.succeed("unexpected-bridge-result")
            },
            { sandboxMode: "strict" }
          )
        )
      )
    )

    expect(result).toContain("Bridge disabled in strict sandbox mode")
    expect(bridgeCallCount).toBe(0)
  })

  test("strict mode spawns worker with isolated cwd/env settings", async () => {
    const raw = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "test" as CallId, depth: 0 })
          return yield* sandbox.execute("report")
        })
      ).pipe(
        Effect.provide(
          makeTestLayer(undefined, {
            sandboxMode: "strict",
            workerPath: inspectWorkerPath
          })
        )
      )
    )

    const report = JSON.parse(raw) as {
      readonly sandboxMode: "permissive" | "strict"
      readonly cwd: string
      readonly envKeys: ReadonlyArray<string>
    }
    const normalizePath = (path: string) =>
      path
        .replace(/\/+$/, "")
        .replace(/^\/private\//, "/")

    const expectedStrictCwd = normalizePath(Bun.env.TMPDIR ?? process.env.TMPDIR ?? "/tmp")
    const reportedCwd = normalizePath(report.cwd)

    expect(report.sandboxMode).toBe("strict")
    expect(reportedCwd.startsWith(expectedStrictCwd)).toBe(true)
    expect(report.cwd).not.toBe(process.cwd())
    expect(report.envKeys).toEqual([])
  })

  test("transport canary: auto mode closes timed-out executions promptly", async () => {
    const elapsed = await Effect.runPromise(
      runTimeoutCloseCanary("auto").pipe(
        Effect.provide(
          makeTestLayer(undefined, {
            sandboxTransport: "auto",
            executeTimeoutMs: 30_000,
            shutdownGraceMs: 150
          })
        )
      )
    )

    expect(elapsed).toBeLessThan(12_000)
  }, 20_000)

  test("transport canary: worker mode closes timed-out executions promptly", async () => {
    const elapsed = await Effect.runPromise(
      runTimeoutCloseCanary("worker").pipe(
        Effect.provide(
          makeTestLayer(undefined, {
            sandboxTransport: "worker",
            executeTimeoutMs: 30_000,
            shutdownGraceMs: 150
          })
        )
      )
    )

    expect(elapsed).toBeLessThan(12_000)
  }, 20_000)

  test("execute timeout returns SandboxError", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "test" as CallId, depth: 0 })
          // Code that never completes — worker stays alive but never responds
          return yield* sandbox.execute("await new Promise(() => {})").pipe(Effect.either)
        })
      ).pipe(
        Effect.provide(
          makeTestLayer(undefined, { executeTimeoutMs: 500 })
        ),
        // Use Effect.timeout as belt-and-suspenders
        Effect.timeout("10 seconds")
      )
    )

    // Effect.timeout wraps in Option, but either should resolve first
    expect(result).not.toBeUndefined()
    if (result && "_tag" in result) {
      expect(result._tag).toBe("Left")
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(SandboxError)
        expect(result.left.message).toContain("timed out")
      }
    }
  }, 30_000)

  test("send after kill returns typed SandboxError (not defect)", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function*() {
        const scope = yield* Scope.make()
        const factory = yield* SandboxFactory
        const sandbox = yield* factory.create({ callId: "test" as CallId, depth: 0 }).pipe(
          Effect.provideService(Scope.Scope, scope)
        )

        // Verify sandbox is alive
        const output = yield* sandbox.execute("print('alive')")
        expect(output).toBe("alive")

        // Close scope (kills the subprocess)
        yield* Scope.close(scope, Exit.void)

        // Subsequent call should return SandboxError, not a defect
        return yield* sandbox.execute("print('dead')").pipe(Effect.either)
      }).pipe(Effect.provide(makeTestLayer()))
    )

    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(SandboxError)
    }
  })

  test("scope close fails pending execute immediately (not after timeout)", async () => {
    const start = Date.now()

    await Effect.runPromise(
      Effect.gen(function*() {
        const scope = yield* Scope.make()
        const factory = yield* SandboxFactory
        const sandbox = yield* factory.create({ callId: "test" as CallId, depth: 0 }).pipe(
          Effect.provideService(Scope.Scope, scope)
        )

        // Verify sandbox is alive
        const alive = yield* sandbox.execute("print('alive')")
        expect(alive).toBe("alive")

        // Close scope — triggers shutdown, which kills process and fails pending requests
        yield* Scope.close(scope, Exit.void)

        // Subsequent execute should fail immediately with SandboxError (not hang until timeout)
        const result = yield* sandbox.execute("print('dead')").pipe(Effect.either)
        expect(result._tag).toBe("Left")
        if (result._tag === "Left") {
          expect(result.left).toBeInstanceOf(SandboxError)
        }
      }).pipe(
        Effect.provide(makeTestLayer(undefined, { executeTimeoutMs: 30_000 }))
      )
    )

    const elapsed = Date.now() - start
    // Should complete well before the 30s execute timeout
    expect(elapsed).toBeLessThan(5_000)
  }, 10_000)

  test("shutdown escalates to SIGKILL for non-cooperative worker", async () => {
    const startedAt = Date.now()

    await Effect.runPromise(
      Effect.gen(function*() {
        const scope = yield* Scope.make()
        const factory = yield* SandboxFactory

        yield* factory.create({ callId: "test" as CallId, depth: 0 }).pipe(
          Effect.provideService(Scope.Scope, scope)
        )

        yield* Scope.close(scope, Exit.void)
      }).pipe(
        Effect.provide(
          makeTestLayer(undefined, {
            workerPath: stubbornWorkerPath,
            shutdownGraceMs: 150,
            sandboxTransport: "spawn"
          })
        )
      )
    )

    const elapsed = Date.now() - startedAt
    expect(elapsed).toBeLessThan(3_000)
  }, 10_000)

  test("teardown race stress: pending executes fail promptly across many scopes", async () => {
    const runs = Array.from({ length: 20 }, (_, i) => i)
    const startedAt = Date.now()

    await Effect.runPromise(
      Effect.gen(function*() {
        const factory = yield* SandboxFactory

        yield* Effect.forEach(runs, (index) =>
          Effect.gen(function*() {
            const scope = yield* Scope.make()
            const sandbox = yield* factory.create({ callId: `race-${index}` as CallId, depth: 0 }).pipe(
              Effect.provideService(Scope.Scope, scope)
            )

            const pending = yield* Effect.fork(
              sandbox.execute("await new Promise(() => {})").pipe(Effect.either)
            )

            yield* Effect.sleep("5 millis")
            yield* Scope.close(scope, Exit.void)

            const result = yield* Fiber.join(pending)
            expect(result._tag).toBe("Left")
          }),
          { concurrency: 4, discard: true }
        )
      }).pipe(
        Effect.provide(
          makeTestLayer(undefined, {
            executeTimeoutMs: 30_000,
            shutdownGraceMs: 150
          })
        )
      )
    )

    const elapsed = Date.now() - startedAt
    expect(elapsed).toBeLessThan(20_000)
  }, 30_000)

  test("lifecycle soak: repeated create-execute-close cycles stay stable", async () => {
    const runs = Array.from({ length: 30 }, (_, i) => i)

    await Effect.runPromise(
      Effect.gen(function*() {
        const factory = yield* SandboxFactory

        yield* Effect.forEach(runs, (index) =>
          Effect.gen(function*() {
            const scope = yield* Scope.make()
            const sandbox = yield* factory.create({ callId: `soak-${index}` as CallId, depth: 0 }).pipe(
              Effect.provideService(Scope.Scope, scope)
            )

            const output = yield* sandbox.execute(`print(${index})`)
            expect(output).toBe(String(index))

            yield* Scope.close(scope, Exit.void)
          }),
          { discard: true }
        )
      }).pipe(Effect.provide(makeTestLayer()))
    )
  }, 30_000)

  test("tool bridge call flows through BridgeHandler with correct method name", async () => {
    const bridgeCalls: Array<{ method: string; args: ReadonlyArray<unknown> }> = []

    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({
            callId: "test" as CallId,
            depth: 0,
            tools: [
              { name: "search", parameterNames: ["query", "maxResults"], description: "Search the web" }
            ]
          })
          return yield* sandbox.execute("const r = await search('effect typescript', 5); print(JSON.stringify(r))")
        })
      ).pipe(
        Effect.provide(
          makeTestLayer(({ method, args }) => {
            bridgeCalls.push({ method, args: [...args] })
            return Effect.succeed([{ title: "Effect Docs", snippet: "..." }])
          })
        )
      )
    )

    expect(result).toBe(JSON.stringify([{ title: "Effect Docs", snippet: "..." }]))
    expect(bridgeCalls).toHaveLength(1)
    expect(bridgeCalls[0]!.method).toBe("search")
    expect(bridgeCalls[0]!.args).toEqual(["effect typescript", 5])
  })

  test("multiple tool calls in single execution", async () => {
    const bridgeCalls: Array<{ method: string; args: ReadonlyArray<unknown> }> = []

    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({
            callId: "test" as CallId,
            depth: 0,
            tools: [
              { name: "add", parameterNames: ["a", "b"], description: "Add two numbers" },
              { name: "multiply", parameterNames: ["a", "b"], description: "Multiply two numbers" }
            ]
          })
          return yield* sandbox.execute(`
            const sum = await add(2, 3)
            const product = await multiply(4, 5)
            print(sum + "," + product)
          `)
        })
      ).pipe(
        Effect.provide(
          makeTestLayer(({ method, args }) => {
            bridgeCalls.push({ method, args: [...args] })
            if (method === "add") return Effect.succeed((args[0] as number) + (args[1] as number))
            if (method === "multiply") return Effect.succeed((args[0] as number) * (args[1] as number))
            return Effect.succeed(null)
          })
        )
      )
    )

    expect(result).toBe("5,20")
    expect(bridgeCalls).toHaveLength(2)
    expect(bridgeCalls[0]!.method).toBe("add")
    expect(bridgeCalls[1]!.method).toBe("multiply")
  })

  test("activity-aware timeout extends deadline on bridge calls", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "test" as CallId, depth: 0 })
          // 3 sequential llm_query calls, each takes ~200ms via bridge handler delay.
          // Total exec time ~600ms, well past the 300ms executeTimeoutMs.
          // Activity-aware timeout should extend deadline on each bridge call.
          return yield* sandbox.execute(`
            const r1 = await llm_query("q1", "ctx")
            const r2 = await llm_query("q2", "ctx")
            const r3 = await llm_query("q3", "ctx")
            print(r1 + "," + r2 + "," + r3)
          `)
        })
      ).pipe(
        Effect.provide(
          makeTestLayer(
            ({ args }) =>
              Effect.succeed(`answer-${args[0]}`).pipe(
                Effect.delay(Duration.millis(200))
              ),
            { executeTimeoutMs: 300 }
          )
        ),
        Effect.timeout("15 seconds")
      )
    )

    expect(result).toBe("answer-q1,answer-q2,answer-q3")
  }, 20_000)

  test("timeout fires after bridge activity stops and sandbox hangs", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "test" as CallId, depth: 0 })
          // One bridge call (extends deadline), then infinite hang.
          // Timeout should fire 300ms after bridge activity ends.
          return yield* sandbox.execute(`
            const r = await llm_query("q1", "ctx")
            await new Promise(() => {})
          `).pipe(Effect.either)
        })
      ).pipe(
        Effect.provide(
          makeTestLayer(
            ({ args }) =>
              Effect.succeed(`answer-${args[0]}`).pipe(
                Effect.delay(Duration.millis(50))
              ),
            { executeTimeoutMs: 300 }
          )
        ),
        Effect.timeout("10 seconds")
      )
    )

    expect(result).not.toBeUndefined()
    if (result && "_tag" in result) {
      expect(result._tag).toBe("Left")
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(SandboxError)
        expect(result.left.message).toContain("timed out")
      }
    }
  }, 15_000)

  // --- FS/Shell integration tests ---

  test("writeFile then readFile round-trip", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "fs-rw" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            await writeFile("test.txt", "hello world")
            const content = await readFile("test.txt")
            print(content)
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("hello world")
  })

  test("listDir returns written files", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "fs-list" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            await writeFile("a.txt", "aaa")
            await writeFile("b.txt", "bbb")
            const files = await listDir()
            print(JSON.stringify(files.sort()))
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(JSON.parse(result)).toEqual(["a.txt", "b.txt"])
  })

  test("stat returns correct type and size", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "fs-stat" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            await writeFile("data.json", '{"key":"value"}')
            const info = await stat("data.json")
            print(info.type + "," + info.size)
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("File,15")
  })

  test("mkdir + exists round-trip", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "fs-mkdir" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            await mkdir("sub/nested")
            const e = await exists("sub/nested")
            print(String(e))
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("true")
  })

  test("remove deletes file", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "fs-rm" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            await writeFile("temp.txt", "data")
            await remove("temp.txt")
            const e = await exists("temp.txt")
            print(String(e))
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("false")
  })

  test("shell echo returns stdout", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "sh-echo" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            const r = await shell("echo hello")
            print(r.stdout.trim() + "," + r.exitCode)
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("hello,0")
  })

  test("shell exit 1 returns non-zero exitCode", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "sh-exit" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            const r = await shell("exit 1")
            print(String(r.exitCode))
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("1")
  })

  test("shell timeout fires on long-running command", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "sh-timeout" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            try {
              await shell("sleep 60", { timeout: 500 })
              print("no-timeout")
            } catch (e) {
              print("timeout:" + e.message)
            }
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toContain("timeout:")
    expect(result).toContain("timed out")
  }, 15_000)

  test("readFile path escape attempt throws", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "fs-escape" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            try {
              await readFile("../../etc/passwd")
              print("escaped!")
            } catch (e) {
              print("blocked:" + e.message)
            }
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toContain("blocked:")
    expect(result).toContain("Path escapes sandbox")
  })

  test("strict mode: FS bindings throw appropriate error", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "fs-strict" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            try {
              await readFile("test.txt")
              print("allowed!")
            } catch (e) {
              print("caught:" + e.message)
            }
          `)
        })
      ).pipe(Effect.provide(makeTestLayer(undefined, { sandboxMode: "strict" })))
    )
    expect(result).toContain("caught:")
    expect(result).toContain("not available in strict sandbox mode")
  })

  test("cwd returns dot", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "fs-cwd" as CallId, depth: 0 })
          return yield* sandbox.execute("print(cwd())")
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe(".")
  })

  test("writeFile auto-creates parent directories", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "fs-nested" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            await writeFile("deep/nested/dir/file.txt", "nested content")
            const content = await readFile("deep/nested/dir/file.txt")
            print(content)
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("nested content")
  })

  test("files persist across executions within same sandbox", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "fs-persist" as CallId, depth: 0 })
          yield* sandbox.execute('await writeFile("persist.txt", "iter1")')
          return yield* sandbox.execute(`
            const content = await readFile("persist.txt")
            print(content)
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("iter1")
  })

  test("shell writes file readable by FS bindings", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "sh-fs" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            await shell("echo 'shell wrote this' > output.txt")
            const content = await readFile("output.txt")
            print(content.trim())
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("shell wrote this")
  })

  test("symlink escape blocked by readFile", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "symlink-read" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            await shell("ln -s /tmp escape-link")
            try {
              await readFile("escape-link")
              print("escaped!")
            } catch (e) {
              print("blocked:" + e.message)
            }
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toContain("blocked:")
    expect(result).toContain("Symlink escapes sandbox")
  })

  test("symlink escape blocked by writeFile", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "symlink-write" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            await shell("mkdir -p legit && ln -s /tmp legit/escape")
            try {
              await writeFile("legit/escape/pwned.txt", "gotcha")
              print("escaped!")
            } catch (e) {
              print("blocked:" + e.message)
            }
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toContain("blocked:")
    expect(result).toContain("Symlink escapes sandbox")
  })

  test("symlink escape blocked by listDir", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "symlink-list" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            await shell("ln -s /tmp escape-dir")
            try {
              await listDir("escape-dir")
              print("escaped!")
            } catch (e) {
              print("blocked:" + e.message)
            }
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toContain("blocked:")
    expect(result).toContain("Symlink escapes sandbox")
  })

  test("symlink escape blocked by stat", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "symlink-stat" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            await shell("ln -s /etc/hosts escape-stat")
            try {
              await stat("escape-stat")
              print("escaped!")
            } catch (e) {
              print("blocked:" + e.message)
            }
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toContain("blocked:")
    expect(result).toContain("Symlink escapes sandbox")
  })

  test("symlink escape blocked by exists", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "symlink-exists" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            await shell("ln -s /etc/hosts escape-exists")
            try {
              await exists("escape-exists")
              print("escaped!")
            } catch (e) {
              print("blocked:" + e.message)
            }
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toContain("blocked:")
    expect(result).toContain("Symlink escapes sandbox")
  })

  test("symlink escape blocked by remove", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "symlink-remove" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            await shell("ln -s /tmp escape-rm")
            try {
              await remove("escape-rm")
              print("escaped!")
            } catch (e) {
              print("blocked:" + e.message)
            }
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toContain("blocked:")
    expect(result).toContain("Symlink escapes sandbox")
  })

  // --- Real-world workflow tests ---

  test("grep through files: write multiple files then grep for pattern", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "grep-flow" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            await writeFile("log1.txt", "2025-01-01 ERROR connection timeout\\n2025-01-01 INFO started")
            await writeFile("log2.txt", "2025-01-02 WARN disk 80%\\n2025-01-02 ERROR out of memory")
            await writeFile("log3.txt", "2025-01-03 INFO healthy\\n2025-01-03 INFO request ok")
            const { stdout } = await shell("grep -rn ERROR .")
            const lines = stdout.trim().split("\\n").sort()
            print(JSON.stringify(lines))
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    const lines = JSON.parse(result)
    expect(lines).toHaveLength(2)
    expect(lines.some((l: string) => l.includes("connection timeout"))).toBe(true)
    expect(lines.some((l: string) => l.includes("out of memory"))).toBe(true)
  })

  test("grep with regex and count: filter structured log data", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "grep-regex" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            const logLines = Array.from({ length: 20 }, (_, i) => {
              const level = i % 5 === 0 ? "ERROR" : i % 3 === 0 ? "WARN" : "INFO"
              return "2025-01-" + String(i + 1).padStart(2, "0") + " " + level + " event " + i
            })
            await writeFile("app.log", logLines.join("\\n"))
            const { stdout: errorCount } = await shell("grep -c ERROR app.log")
            const { stdout: warnCount } = await shell("grep -c WARN app.log")
            print(errorCount.trim() + "," + warnCount.trim())
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("4,5")
  })

  test("shell pipe: write JSON, filter with grep, process with shell pipeline", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "shell-pipe" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            const records = [
              { id: 1, name: "Alice", role: "admin" },
              { id: 2, name: "Bob", role: "user" },
              { id: 3, name: "Carol", role: "admin" },
              { id: 4, name: "Dave", role: "user" }
            ]
            await writeFile("users.jsonl", records.map(r => JSON.stringify(r)).join("\\n"))
            const { stdout } = await shell("grep admin users.jsonl | wc -l")
            print(stdout.trim())
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("2")
  })

  test("CSV processing: write CSV, use shell awk/sort to extract data", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "csv-process" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            const csv = [
              "name,score,grade",
              "Alice,95,A",
              "Bob,78,B",
              "Carol,92,A",
              "Dave,65,D",
              "Eve,88,B"
            ].join("\\n")
            await writeFile("scores.csv", csv)
            // Extract names with grade A, sorted
            const { stdout } = await shell("grep ',A$' scores.csv | cut -d, -f1 | sort")
            print(stdout.trim())
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("Alice\nCarol")
  })

  test("multi-step data pipeline: write, transform, read back", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "pipeline" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            // Step 1: Create structured data
            const data = {
              articles: [
                { id: 1, title: "Effect TS Guide", tags: ["typescript", "fp"] },
                { id: 2, title: "React Hooks", tags: ["react", "frontend"] },
                { id: 3, title: "Bun Runtime", tags: ["typescript", "runtime"] }
              ]
            }
            await writeFile("data.json", JSON.stringify(data, null, 2))

            // Step 2: Use shell to verify file written correctly
            const { stdout: wcOut } = await shell("wc -l < data.json")
            const lineCount = parseInt(wcOut.trim())

            // Step 3: Read back and filter in JS
            const raw = await readFile("data.json")
            const parsed = JSON.parse(raw)
            const tsArticles = parsed.articles.filter(a => a.tags.includes("typescript"))

            // Step 4: Write filtered results
            await writeFile("filtered.json", JSON.stringify(tsArticles))

            // Step 5: Verify with stat
            const info = await stat("filtered.json")
            print(tsArticles.length + "," + info.type + "," + (lineCount > 5))
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("2,File,true")
  })

  test("find + grep workflow: nested directory search", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "find-grep" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            await mkdir("src")
            await mkdir("test")
            await mkdir("docs")
            await writeFile("src/main.ts", "export function hello() { return 'world' }")
            await writeFile("src/util.ts", "export function add(a: number, b: number) { return a + b }")
            await writeFile("test/main.test.ts", "import { hello } from '../src/main'\\ntest('hello', () => {})")
            await writeFile("docs/readme.txt", "No code here, just docs about hello")

            // Find all .ts files containing "hello"
            const { stdout } = await shell("find . -name '*.ts' -exec grep -l hello {} \\\\;")
            const files = stdout.trim().split("\\n").sort()
            print(JSON.stringify(files))
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    const files = JSON.parse(result)
    expect(files).toHaveLength(2)
    expect(files).toContain("./src/main.ts")
    expect(files).toContain("./test/main.test.ts")
  })

  test("iterative refinement: write intermediate results across executions", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "iterative" as CallId, depth: 0 })

          // Iteration 1: Explore data
          yield* sandbox.execute(`
            const rawData = [
              "apple 5", "banana 3", "cherry 8", "date 2",
              "elderberry 6", "fig 1", "grape 4", "honeydew 7"
            ]
            await writeFile("raw.txt", rawData.join("\\n") + "\\n")
            // Exploration: count items
            const { stdout } = await shell("wc -l < raw.txt")
            await writeFile("meta.json", JSON.stringify({ totalItems: parseInt(stdout.trim()) }))
          `)

          // Iteration 2: Filter based on exploration
          yield* sandbox.execute(`
            const meta = JSON.parse(await readFile("meta.json"))
            const { stdout } = await shell("awk '$2 >= 5' raw.txt | sort -k2 -rn")
            await writeFile("filtered.txt", stdout.trim())
          `)

          // Iteration 3: Read final results
          return yield* sandbox.execute(`
            const filtered = await readFile("filtered.txt")
            const meta = JSON.parse(await readFile("meta.json"))
            const resultLines = filtered.split("\\n")
            print(meta.totalItems + ":" + resultLines.length)
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("8:4")
  })

  test("shell stderr capture: command that produces both stdout and stderr", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "stderr" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            const r = await shell("echo out-msg; echo err-msg >&2")
            print(r.stdout.trim() + "|" + r.stderr.trim() + "|" + r.exitCode)
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("out-msg|err-msg|0")
  })

  test("shell cwd option: run command in subdirectory", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "shell-cwd" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            await mkdir("subproject")
            await writeFile("subproject/data.txt", "sub-content")
            const { stdout } = await shell("cat data.txt", { cwd: "subproject" })
            print(stdout.trim())
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("sub-content")
  })

  test("large file handling: write and grep through substantial content", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "large-file" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            // Generate 1000 log lines, seed a few needles
            const lines = []
            for (let i = 0; i < 1000; i++) {
              if (i === 137 || i === 555 || i === 899) {
                lines.push("line-" + i + " CRITICAL system failure detected")
              } else {
                lines.push("line-" + i + " INFO normal operation")
              }
            }
            await writeFile("big.log", lines.join("\\n"))

            // Use grep to find the needles
            const { stdout } = await shell("grep -n CRITICAL big.log")
            const hits = stdout.trim().split("\\n")
            print(hits.length + ":" + hits.map(h => h.split(":")[0]).join(","))
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    // 3 CRITICAL lines at line numbers 138, 556, 900 (1-indexed)
    expect(result).toBe("3:138,556,900")
  })

  test("FS error handling: readFile on missing file produces catchable error", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "fs-error" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            try {
              await readFile("nonexistent.txt")
              print("no-error")
            } catch (e) {
              // LLM should be able to handle missing files gracefully
              const fallback = "default data"
              await writeFile("nonexistent.txt", fallback)
              const content = await readFile("nonexistent.txt")
              print("recovered:" + content)
            }
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("recovered:default data")
  })

  test("shell + FS interop: use shell to generate data, process with JS, write results", async () => {
    const result = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const factory = yield* SandboxFactory
          const sandbox = yield* factory.create({ callId: "interop-full" as CallId, depth: 0 })
          return yield* sandbox.execute(`
            // Use shell to generate a sequence
            const { stdout } = await shell("seq 1 20")
            const numbers = stdout.trim().split("\\n").map(Number)

            // Process in JS
            const evens = numbers.filter(n => n % 2 === 0)
            const sum = evens.reduce((a, b) => a + b, 0)
            await writeFile("evens.json", JSON.stringify({ evens, sum }))

            // Verify with shell
            const { stdout: catOut } = await shell("cat evens.json")
            const verified = JSON.parse(catOut)
            print(verified.sum + "," + verified.evens.length)
          `)
        })
      ).pipe(Effect.provide(makeTestLayer()))
    )
    expect(result).toBe("110,10")
  })
})
