import { NodeServices } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import type { AgentId } from "@template/domain/ids"
import { DateTime, Effect, Layer } from "effect"
import { symlinkSync } from "node:fs"
import { CommandBackend, type CommandBackendService } from "../src/tools/command/CommandBackend.js"
import { CommandHookError } from "../src/tools/command/CommandErrors.js"
import { CommandHooks, type CommandHook } from "../src/tools/command/CommandHooks.js"
import { SandboxRuntime } from "../src/safety/SandboxRuntime.js"
import { CommandRuntime } from "../src/tools/command/CommandRuntime.js"
import {
  DEFAULT_COMMAND_TIMEOUT_MS,
  type CommandInvocationContext,
  type CommandResult
} from "../src/tools/command/CommandTypes.js"
import { cleanupTextFixture, makeTextFixture } from "./TestTextFixtures.js"

const defaultContext: CommandInvocationContext = {
  source: "cli"
}

const sensitiveSources: ReadonlyArray<CommandInvocationContext["source"]> = [
  "tool",
  "checkpoint_replay",
  "schedule",
  "integration"
]

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

const makeRuntimeLayer = (params: {
  readonly hooks?: ReadonlyArray<CommandHook>
  readonly executePlan?: CommandBackendService["executePlan"]
}) =>
  CommandRuntime.layer.pipe(
    Layer.provide(
      params.hooks === undefined
        ? CommandHooks.layer
        : CommandHooks.fromHooks(params.hooks)
    ),
    Layer.provide(
      CommandBackend.fromExecution(
        params.executePlan ?? (() => Effect.succeed(makeResult()))
      )
    ),
    Layer.provide(SandboxRuntime.layer),
    Layer.provide(NodeServices.layer)
  )

describe("CommandRuntime", () => {
  it.effect("runs hooks in deterministic before -> backend -> after order", () => {
    const order: Array<string> = []
    let observedTimeout: number | null = null

    const layer = makeRuntimeLayer({
      hooks: [
        {
          id: "before",
          beforeExecute: ({ plan }) =>
            Effect.sync(() => {
              order.push("before")
              return {
                timeoutMs: plan.timeoutMs - 1
              } as const
            })
        },
        {
          id: "after",
          afterExecute: () =>
            Effect.sync(() => {
              order.push("after")
            })
        }
      ],
      executePlan: (plan) =>
        Effect.sync(() => {
          order.push("backend")
          observedTimeout = plan.timeoutMs
          return makeResult()
        })
    })

    return Effect.gen(function*() {
      const runtime = yield* CommandRuntime
      const result = yield* runtime.execute({
        context: defaultContext,
        request: {
          mode: "Shell",
          command: "echo runtime-order"
        }
      })

      expect(result.exitCode).toBe(0)
      expect(order).toEqual(["before", "backend", "after"])
      expect(observedTimeout).toBe(DEFAULT_COMMAND_TIMEOUT_MS - 1)
    }).pipe(
      Effect.provide(layer)
    )
  })

  it.effect("maps hook failures to CommandHookRejected and executes onError once", () => {
    let onErrorCount = 0
    let backendCallCount = 0

    const layer = makeRuntimeLayer({
      hooks: [
        {
          id: "reject-all",
          beforeExecute: () =>
            Effect.fail(
              new CommandHookError({
                reason: "blocked by test"
              })
            ),
          onError: () =>
            Effect.sync(() => {
              onErrorCount += 1
            })
        }
      ],
      executePlan: () =>
        Effect.sync(() => {
          backendCallCount += 1
          return makeResult()
        })
    })

    return Effect.gen(function*() {
      const runtime = yield* CommandRuntime
      const error = yield* runtime.execute({
        context: defaultContext,
        request: {
          mode: "Shell",
          command: "echo blocked"
        }
      }).pipe(Effect.flip)

      expect(error._tag).toBe("CommandHookRejected")
      if (error._tag === "CommandHookRejected") {
        expect(error.hookId).toBe("reject-all")
      }

      expect(onErrorCount).toBe(1)
      expect(backendCallCount).toBe(0)
    }).pipe(
      Effect.provide(layer)
    )
  })

  it.effect("rejects hook patches that widen timeoutMs", () => {
    const layer = makeRuntimeLayer({
      hooks: [
        {
          id: "widen-timeout",
          beforeExecute: ({ plan }) =>
            Effect.succeed({
              timeoutMs: plan.timeoutMs + 1
            })
        }
      ]
    })

    return Effect.gen(function*() {
      const runtime = yield* CommandRuntime
      const error = yield* runtime.execute({
        context: defaultContext,
        request: {
          mode: "Shell",
          command: "echo widen-timeout"
        }
      }).pipe(Effect.flip)

      expect(error._tag).toBe("CommandHookRejected")
      if (error._tag === "CommandHookRejected") {
        expect(error.reason).toContain("cannot increase timeoutMs")
      }
    }).pipe(
      Effect.provide(layer)
    )
  })

  it.effect("rejects hook patches that widen outputLimitBytes", () => {
    const layer = makeRuntimeLayer({
      hooks: [
        {
          id: "widen-output",
          beforeExecute: ({ plan }) =>
            Effect.succeed({
              outputLimitBytes: plan.outputLimitBytes + 1
            })
        }
      ]
    })

    return Effect.gen(function*() {
      const runtime = yield* CommandRuntime
      const error = yield* runtime.execute({
        context: defaultContext,
        request: {
          mode: "Shell",
          command: "echo widen-output"
        }
      }).pipe(Effect.flip)

      expect(error._tag).toBe("CommandHookRejected")
      if (error._tag === "CommandHookRejected") {
        expect(error.reason).toContain("cannot increase outputLimitBytes")
      }
    }).pipe(
      Effect.provide(layer)
    )
  })

  it.effect("rejects blocked environment overrides in requests", () => {
    const layer = makeRuntimeLayer({})

    return Effect.gen(function*() {
      const runtime = yield* CommandRuntime
      const error = yield* runtime.execute({
        context: defaultContext,
        request: {
          mode: "Shell",
          command: "echo bad-env-request",
          envOverrides: {
            PATH: "/tmp"
          }
        }
      }).pipe(Effect.flip)

      expect(error._tag).toBe("CommandValidationError")
    }).pipe(
      Effect.provide(layer)
    )
  })

  it.effect("rejects blocked environment additions in hooks", () => {
    const layer = makeRuntimeLayer({
      hooks: [
        {
          id: "bad-env-hook",
          beforeExecute: () =>
            Effect.succeed({
              envAdditions: {
                PATH: "/tmp"
              }
            })
        }
      ]
    })

    return Effect.gen(function*() {
      const runtime = yield* CommandRuntime
      const error = yield* runtime.execute({
        context: defaultContext,
        request: {
          mode: "Shell",
          command: "echo bad-env-hook"
        }
      }).pipe(Effect.flip)

      expect(error._tag).toBe("CommandHookRejected")
    }).pipe(
      Effect.provide(layer)
    )
  })

  it.effect("denies cwd symlink escapes that resolve outside the workspace", () => {
    const fixture = makeTextFixture("command-runtime-symlink")
    const escapeLink = fixture.absolute("escape")
    const relativeCwd = fixture.relative("escape")

    return Effect.gen(function*() {
      symlinkSync("/tmp", escapeLink, "dir")

      const runtime = yield* CommandRuntime
      const error = yield* runtime.execute({
        context: defaultContext,
        request: {
          mode: "Shell",
          command: "pwd",
          cwd: relativeCwd
        }
      }).pipe(Effect.flip)

      expect(error._tag).toBe("CommandWorkspaceViolation")
    }).pipe(
      Effect.provide(makeRuntimeLayer({})),
      Effect.ensuring(
        Effect.sync(() => {
          cleanupTextFixture(fixture)
        })
      )
    )
  })

  for (const source of sensitiveSources) {
    it.effect(`requires sandbox context for sensitive source=${source}`, () =>
      Effect.gen(function*() {
        const runtime = yield* CommandRuntime
        const error = yield* runtime.execute({
          context: {
            source,
            agentId: "agent:runtime-test" as AgentId
          },
          request: {
            mode: "Shell",
            command: "echo blocked"
          }
        }).pipe(Effect.flip)

        expect(error._tag).toBe("SandboxViolation")
      }).pipe(
        Effect.provide(makeRuntimeLayer({}))
      ))
  }

  for (const source of sensitiveSources) {
    it.effect(`allows sensitive source=${source} when entered in sandbox context`, () =>
      Effect.gen(function*() {
        const runtime = yield* CommandRuntime
        const sandboxRuntime = yield* SandboxRuntime
        const result = yield* sandboxRuntime.enter(
          "agent:runtime-test" as AgentId,
          runtime.execute({
            context: {
              source,
              agentId: "agent:runtime-test" as AgentId
            },
            request: {
              mode: "Shell",
              command: "echo allowed"
            }
          })
        )

        expect(result.exitCode).toBe(0)
      }).pipe(
        Effect.provide(
          Layer.mergeAll(
            makeRuntimeLayer({}),
            SandboxRuntime.layer
          )
        )
      ))
  }
})
