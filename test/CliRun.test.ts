import { afterEach, describe, expect, test } from "bun:test"
import { Effect, Layer, Stream } from "effect"
import type { CliArgs } from "../src/CliLayer"
import { UnknownRlmError } from "../src/RlmError"
import { Rlm, type RlmService } from "../src/Rlm"
import { runCliProgram } from "../src/cli/Run"
import { CallId, RlmEvent } from "../src/RlmTypes"

const baseCliArgs: CliArgs = {
  query: "query",
  context: "inline context",
  provider: "anthropic",
  model: "claude-sonnet-4-5-20250929",
  quiet: false,
  noColor: true,
  nlpTools: false
}

const callId = CallId("test-call")

const captureOutput = async (
  run: () => Promise<void>
): Promise<{ stdout: string; stderr: string; exitCode: number | undefined }> => {
  const stdoutChunks: Array<string> = []
  const stderrChunks: Array<string> = []
  const stdoutWrite = process.stdout.write.bind(process.stdout)
  const stderrWrite = process.stderr.write.bind(process.stderr)
  const previousExitCode = process.exitCode

  process.stdout.write = ((chunk: string | Uint8Array) => {
    stdoutChunks.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8"))
    return true
  }) as typeof process.stdout.write

  process.stderr.write = ((chunk: string | Uint8Array) => {
    stderrChunks.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8"))
    return true
  }) as typeof process.stderr.write

  process.exitCode = 0

  try {
    await run()
    return {
      stdout: stdoutChunks.join(""),
      stderr: stderrChunks.join(""),
      exitCode: process.exitCode === 0 ? undefined : process.exitCode
    }
  } finally {
    process.stdout.write = stdoutWrite
    process.stderr.write = stderrWrite
    process.exitCode = previousExitCode ?? 0
  }
}

const makeRlmLayer = (
  events: ReadonlyArray<RlmEvent>,
  onStream?: (options: { readonly query: string; readonly context: string }) => void
) => {
  const service: RlmService = {
    stream: (options) => {
      onStream?.(options)
      return Stream.fromIterable(events)
    },
    completeWithOutcome: ((_options: unknown) =>
      Effect.succeed({
        _tag: "Final" as const,
        payload: {
          source: "answer" as const,
          answer: ""
        }
      })) as RlmService["completeWithOutcome"],
    complete: ((_options: unknown) => Effect.succeed("")) as RlmService["complete"]
  }

  return Layer.succeed(Rlm, service)
}

afterEach(() => {
  process.exitCode = 0
})

describe("CLI runtime execution", () => {
  test("writes final answer to stdout and stream events to stderr", async () => {
    const events = [
      RlmEvent.CallStarted({
        completionId: "completion-1",
        callId,
        depth: 0
      }),
      RlmEvent.CallFinalized({
        completionId: "completion-1",
        callId,
        depth: 0,
        answer: "final answer"
      })
    ]

    const output = await captureOutput(() =>
      Effect.runPromise(
        runCliProgram(baseCliArgs).pipe(
          Effect.provide(makeRlmLayer(events))
        )
      )
    )

    expect(output.stdout).toBe("final answer\n")
    expect(output.stderr).toContain("FINAL: final answer")
    expect(output.exitCode).toBeUndefined()
  })

  test("sets exit code to 1 when root call fails", async () => {
    const events = [
      RlmEvent.CallFailed({
        completionId: "completion-2",
        callId,
        depth: 0,
        error: new UnknownRlmError({ message: "boom" })
      })
    ]

    const output = await captureOutput(() =>
      Effect.runPromise(
        runCliProgram(baseCliArgs).pipe(
          Effect.provide(makeRlmLayer(events))
        )
      )
    )

    expect(output.stdout).toBe("\n")
    expect(output.stderr).toContain("FAILED: UnknownRlmError")
    expect(output.exitCode ?? 0).toBe(1)
  })

  test("quiet mode suppresses non-final events and no-color omits ANSI codes", async () => {
    const events = [
      RlmEvent.CallStarted({
        completionId: "completion-3",
        callId,
        depth: 0
      }),
      RlmEvent.ModelResponse({
        completionId: "completion-3",
        callId,
        depth: 0,
        text: "thinking..."
      }),
      RlmEvent.CallFinalized({
        completionId: "completion-3",
        callId,
        depth: 0,
        answer: "quiet answer"
      })
    ]

    const output = await captureOutput(() =>
      Effect.runPromise(
        runCliProgram({
          ...baseCliArgs,
          quiet: true,
          noColor: true,
          nlpTools: false
        }).pipe(
          Effect.provide(makeRlmLayer(events))
        )
      )
    )

    expect(output.stderr).not.toContain("Call [depth=0]")
    expect(output.stderr).not.toContain("thinking...")
    expect(output.stderr).toContain("FINAL: quiet answer")
    expect(output.stderr).not.toContain("\x1b[")
  })

  test("passes context string directly to stream (contextFile removed)", async () => {
    let capturedContext = ""

    await captureOutput(() =>
      Effect.runPromise(
        runCliProgram({
          ...baseCliArgs,
          context: "inline context"
        }).pipe(
          Effect.provide(
            makeRlmLayer(
              [
                RlmEvent.CallFinalized({
                  completionId: "completion-4",
                  callId,
                  depth: 0,
                  answer: "ok"
                })
              ],
              (options) => {
                capturedContext = options.context ?? ""
              }
            )
          )
        )
      )
    )

    expect(capturedContext).toBe("inline context")
  })

  test("passes inputs through to rlm.stream", async () => {
    let capturedInputs: ReadonlyArray<{ name: string; path: string }> | undefined

    const onStream = (options: any) => {
      capturedInputs = options.inputs
    }

    await captureOutput(() =>
      Effect.runPromise(
        runCliProgram({
          ...baseCliArgs,
          inputs: [
            { name: "data", path: "/tmp/data.csv" }
          ]
        }).pipe(
          Effect.provide(
            makeRlmLayer(
              [
                RlmEvent.CallFinalized({
                  completionId: "completion-5",
                  callId,
                  depth: 0,
                  answer: "ok"
                })
              ],
              onStream
            )
          )
        )
      )
    )

    expect(capturedInputs).toBeDefined()
    expect(capturedInputs!.length).toBe(1)
    expect(capturedInputs![0].name).toBe("data")
    expect(capturedInputs![0].path).toBe("/tmp/data.csv")
    // metadata is enriched by analyzeFilePrefix in runCliProgram
    expect(capturedInputs![0].metadata).toBeDefined()
  })
})
