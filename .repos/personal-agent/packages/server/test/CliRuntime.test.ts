import { NodeServices } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { Duration, Effect, Fiber, Layer, Option } from "effect"
import { CliRuntime } from "../src/tools/cli/CliRuntime.js"
import { layer as CliRuntimeLocalLayer } from "../src/tools/cli/CliRuntimeLocal.js"
import { CLI_TRUNCATED_OUTPUT_MARKER } from "../src/tools/cli/CliTypes.js"

const runtimeLayer = CliRuntimeLocalLayer.pipe(
  Layer.provide(NodeServices.layer)
)

describe("CliRuntime", () => {
  it.effect("runs argv commands and returns output metadata", () =>
    Effect.gen(function*() {
      const runtime = yield* CliRuntime

      const result = yield* runtime.run({
        mode: "Argv",
        command: "echo",
        args: ["effect-cli-runtime"],
        cwd: process.cwd(),
        env: process.env as Record<string, string | undefined>,
        timeoutMs: 5_000,
        outputLimitBytes: 1_024
      })

      expect(result.exitCode).toBe(0)
      expect(result.pid).not.toBeNull()
      expect(result.stdout).toContain("effect-cli-runtime")
      expect(result.stderr).toBe("")
      expect(result.truncatedStdout).toBe(false)
      expect(result.truncatedStderr).toBe(false)
    }).pipe(Effect.provide(runtimeLayer)))

  it.effect("caps stdout output and appends truncation marker", () =>
    Effect.gen(function*() {
      const runtime = yield* CliRuntime

      const result = yield* runtime.run({
        mode: "Shell",
        command: "head -c 256 /dev/zero | tr '\\\\0' 'a'",
        cwd: process.cwd(),
        env: process.env as Record<string, string | undefined>,
        timeoutMs: 5_000,
        outputLimitBytes: 32
      })

      expect(result.truncatedStdout).toBe(true)
      expect(result.stdout.endsWith(CLI_TRUNCATED_OUTPUT_MARKER)).toBe(true)
      expect(result.stdout.length).toBeLessThanOrEqual(
        32 + CLI_TRUNCATED_OUTPUT_MARKER.length
      )
    }).pipe(Effect.provide(runtimeLayer)))

  it.live("returns CliTimeout for long-running processes", () =>
    Effect.gen(function*() {
      const runtime = yield* CliRuntime

      const error = yield* runtime.run({
        mode: "Shell",
        command: "sleep 2",
        cwd: process.cwd(),
        env: process.env as Record<string, string | undefined>,
        timeoutMs: 50,
        outputLimitBytes: 1_024
      }).pipe(Effect.flip)

      expect(error._tag).toBe("CliTimeout")
      if (error._tag === "CliTimeout") {
        expect(error.timeoutMs).toBe(50)
      }
    }).pipe(Effect.provide(runtimeLayer)))

  it.live("returns CliIdleTimeout when process goes silent past idle limit", () =>
    Effect.gen(function*() {
      const runtime = yield* CliRuntime

      const error = yield* runtime.run({
        mode: "Shell",
        command: "printf 'warmup\\n'; sleep 1",
        cwd: process.cwd(),
        env: process.env as Record<string, string | undefined>,
        timeoutMs: 2_000,
        idleTimeoutMs: 100,
        outputLimitBytes: 1_024
      }).pipe(Effect.flip)

      expect(error._tag).toBe("CliIdleTimeout")
      if (error._tag === "CliIdleTimeout") {
        expect(error.idleTimeoutMs).toBe(100)
      }
    }).pipe(Effect.provide(runtimeLayer)))

  it.effect("maps spawn failures to CliSpawnFailed", () =>
    Effect.gen(function*() {
      const runtime = yield* CliRuntime

      const error = yield* runtime.run({
        mode: "Argv",
        command: "definitely-not-a-real-command-for-cli-runtime-tests",
        args: [],
        cwd: process.cwd(),
        env: process.env as Record<string, string | undefined>,
        timeoutMs: 500,
        outputLimitBytes: 1_024
      }).pipe(Effect.flip)

      expect(error._tag).toBe("CliSpawnFailed")
    }).pipe(Effect.provide(runtimeLayer)))

  it.live("interruption returns promptly for long-running processes", () =>
    Effect.gen(function*() {
      const runtime = yield* CliRuntime

      const interrupted = yield* Effect.gen(function*() {
        const fiber = yield* runtime.run({
          mode: "Shell",
          command: "sleep 5",
          cwd: process.cwd(),
          env: process.env as Record<string, string | undefined>,
          timeoutMs: 10_000,
          outputLimitBytes: 1_024
        }).pipe(Effect.forkChild)

        yield* Effect.sleep(Duration.millis(50))
        yield* Fiber.interrupt(fiber)

        return true
      }).pipe(
        Effect.timeoutOption(Duration.seconds(1))
      )

      expect(Option.isSome(interrupted)).toBe(true)
    }).pipe(Effect.provide(runtimeLayer)))
})
