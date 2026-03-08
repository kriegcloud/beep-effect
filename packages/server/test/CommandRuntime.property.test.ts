import { NodeServices } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { DateTime, Effect, Layer } from "effect"
import fc from "fast-check"
import { layer as CliRuntimeLocalLayer } from "../src/tools/cli/CliRuntimeLocal.js"
import { layer as CommandBackendLocalLayer } from "../src/tools/command/CommandBackendLocal.js"
import { CommandBackend, type CommandBackendService } from "../src/tools/command/CommandBackend.js"
import { CommandHooks } from "../src/tools/command/CommandHooks.js"
import { CommandRuntime } from "../src/tools/command/CommandRuntime.js"
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"
import {
  TRUNCATED_OUTPUT_MARKER,
  type CommandInvocationContext,
  type CommandResult
} from "../src/tools/command/CommandTypes.js"

const defaultContext: CommandInvocationContext = {
  source: "cli"
}

const blockedEnvKeys = new Set([
  "PATH",
  "SHELL",
  "LD_PRELOAD",
  "LD_LIBRARY_PATH",
  "DYLD_INSERT_LIBRARIES",
  "DYLD_LIBRARY_PATH",
  "NODE_OPTIONS",
  "BUN_OPTIONS"
])

const makeResult = (exitCode = 0): CommandResult => {
  const now = DateTime.fromDateUnsafe(new Date("2026-02-28T00:00:00.000Z"))
  return {
    exitCode,
    stdout: "",
    stderr: "",
    truncatedStdout: false,
    truncatedStderr: false,
    startedAt: now,
    completedAt: now
  }
}

const makeRuntimeLayer = (executePlan?: CommandBackendService["executePlan"]) =>
  CommandRuntime.layer.pipe(
    Layer.provide(CommandHooks.layer),
    Layer.provide(
      CommandBackend.fromExecution(
        executePlan ?? (() => Effect.succeed(makeResult()))
      )
    ),
    Layer.provide(SandboxRuntime.layer),
    Layer.provide(NodeServices.layer)
  )

describe("CommandRuntime property tests", () => {
  it("rejects traversal cwd values outside workspace for arbitrary depth", async () => {
    const layer = makeRuntimeLayer()

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 6 }),
        fc.stringMatching(/^[a-zA-Z0-9_-]{1,12}$/),
        async (depth, segment) => {
          const cwd = `${"../".repeat(depth)}${segment}`

          const error = await Effect.runPromise(
            Effect.gen(function*() {
              const runtime = yield* CommandRuntime
              return yield* runtime.execute({
                context: defaultContext,
                request: {
                  mode: "Shell",
                  command: "echo traversal",
                  cwd
                }
              }).pipe(Effect.flip)
            }).pipe(
              Effect.provide(layer)
            )
          )

          expect(error._tag).toBe("CommandWorkspaceViolation")
        }
      ),
      { numRuns: 75 }
    )
  })

  it("fingerprint is deterministic for equivalent env override records", async () => {
    const keyArbitrary = fc
      .stringMatching(/^[A-Z_][A-Z0-9_]{0,6}$/)
      .filter((key) => !blockedEnvKeys.has(key) && !key.startsWith("BASH_FUNC_"))
    const valueArbitrary = fc
      .string({ maxLength: 12 })
      .filter((value) => !value.includes("\u0000"))

    await fc.assert(
      fc.asyncProperty(
        fc.dictionary(keyArbitrary, valueArbitrary, { maxKeys: 6 }),
        async (record) => {
          const entries = Object.entries(record)
          const reversed = Object.fromEntries([...entries].reverse())
          const command = "echo fingerprint"

          let leftFingerprint: string | null = null
          let rightFingerprint: string | null = null

          const leftLayer = makeRuntimeLayer((plan) =>
            Effect.sync(() => {
              leftFingerprint = plan.fingerprint
              return makeResult()
            })
          )

          const rightLayer = makeRuntimeLayer((plan) =>
            Effect.sync(() => {
              rightFingerprint = plan.fingerprint
              return makeResult()
            })
          )

          await Effect.runPromise(
            Effect.gen(function*() {
              const runtime = yield* CommandRuntime
              yield* runtime.execute({
                context: defaultContext,
                request: {
                  mode: "Shell",
                  command,
                  envOverrides: record
                }
              })
            }).pipe(
              Effect.provide(leftLayer)
            )
          )

          await Effect.runPromise(
            Effect.gen(function*() {
              const runtime = yield* CommandRuntime
              yield* runtime.execute({
                context: defaultContext,
                request: {
                  mode: "Shell",
                  command,
                  envOverrides: reversed
                }
              })
            }).pipe(
              Effect.provide(rightLayer)
            )
          )

          expect(leftFingerprint).not.toBeNull()
          expect(rightFingerprint).not.toBeNull()
          expect(leftFingerprint).toBe(rightFingerprint)
        }
      ),
      { numRuns: 60 }
    )
  })

  it("stdout length never exceeds output cap plus truncation marker", async () => {
    const cliRuntimeLayer = CliRuntimeLocalLayer.pipe(
      Layer.provide(NodeServices.layer)
    )
    const backendLayer = CommandBackendLocalLayer.pipe(
      Layer.provide(cliRuntimeLayer)
    )

    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 128 }),
        fc.integer({ min: 0, max: 512 }),
        async (outputLimitBytes, emittedBytes) => {
          const command = `head -c ${emittedBytes} /dev/zero | tr '\\\\0' 'a'`

          const result = await Effect.runPromise(
            Effect.gen(function*() {
              const backend = yield* CommandBackend
              return yield* backend.executePlan({
                mode: "Shell",
                command,
                cwd: process.cwd(),
                timeoutMs: 5_000,
                outputLimitBytes,
                env: process.env as Record<string, string | undefined>,
                fingerprint: "property-test"
              })
            }).pipe(
              Effect.provide(backendLayer)
            )
          )

          expect(result.stdout.length).toBeLessThanOrEqual(
            outputLimitBytes + TRUNCATED_OUTPUT_MARKER.length
          )

          if (emittedBytes > outputLimitBytes) {
            expect(result.truncatedStdout).toBe(true)
            expect(result.stdout.endsWith(TRUNCATED_OUTPUT_MARKER)).toBe(true)
          } else {
            expect(result.truncatedStdout).toBe(false)
          }
        }
      ),
      { numRuns: 30 }
    )
  })
})
