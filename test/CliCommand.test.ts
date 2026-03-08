import * as nodeFs from "node:fs"
import * as nodePath from "node:path"
import * as os from "node:os"
import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test"
import * as ValidationError from "@effect/cli/ValidationError"
import { BunContext } from "@effect/platform-bun"
import { Cause, Effect, Exit, Option } from "effect"
import type { CliArgs } from "../src/CliLayer"
import { runCliCommand } from "../src/cli/Command"
import { CliInputError } from "../src/cli/Normalize"

let tmpDir: string
let fixtureFile: string

beforeAll(() => {
  tmpDir = nodeFs.mkdtempSync(nodePath.join(os.tmpdir(), "rlm-cmd-test-"))
  fixtureFile = nodePath.join(tmpDir, "data.txt")
  nodeFs.writeFileSync(fixtureFile, "test data")
})

afterAll(() => {
  nodeFs.rmSync(tmpDir, { recursive: true, force: true })
})

const env = {
  ANTHROPIC_API_KEY: "anthropic-key",
  OPENAI_API_KEY: "openai-key",
  GOOGLE_API_KEY: "google-key",
  GOOGLE_API_URL: "https://vertex.googleapis.com"
}

const runWithCapture = async (argv: ReadonlyArray<string>) => {
  let captured: CliArgs | undefined

  await Effect.runPromise(
    runCliCommand(argv, {
      env,
      execute: (cliArgs) =>
        Effect.sync(() => {
          captured = cliArgs
        })
    }).pipe(Effect.provide(BunContext.layer))
  )

  return captured
}

const getFailure = (exit: Exit.Exit<unknown, unknown>) => {
  if (Exit.isSuccess(exit)) {
    throw new Error("Expected command to fail")
  }

  const failure = Cause.failureOption(exit.cause)
  if (Option.isNone(failure)) {
    throw new Error("Expected failure cause")
  }

  return failure.value
}

afterEach(() => {
  process.exitCode = 0
})

describe("Effect CLI command", () => {
  test("parses query and options into CliArgs", async () => {
    const captured = await runWithCapture([
      "bun",
      "src/cli.ts",
      "cluster these articles",
      "--provider",
      "google",
      "--model",
      "gemini-2.0-pro",
      "--max-iterations",
      "80",
      "--max-depth",
      "3",
      "--max-llm-calls",
      "120",
      "--quiet",
      "--no-color"
    ])

    expect(captured).toEqual({
      query: "cluster these articles",
      context: "",
      provider: "google",
      model: "gemini-2.0-pro",
      maxIterations: 80,
      maxDepth: 3,
      maxLlmCalls: 120,
      quiet: true,
      noColor: true,
      verbose: false,
      nlpTools: false,
      googleApiKey: "google-key",
      googleApiUrl: "https://vertex.googleapis.com"
    })
  })

  test("supports query-first invocation with options after query", async () => {
    const captured = await runWithCapture([
      "bun",
      "src/cli.ts",
      "summarize this",
      "--context",
      "extra context",
      "--provider",
      "openai"
    ])

    expect(captured).toEqual({
      query: "summarize this",
      context: "extra context",
      provider: "openai",
      model: "claude-sonnet-4-5-20250929",
      quiet: false,
      noColor: false,
      verbose: false,
      nlpTools: false,
      openaiApiKey: "openai-key"
    })
  })

  test("maps --no-prompt-caching to enablePromptCaching=false", async () => {
    const captured = await runWithCapture([
      "bun",
      "src/cli.ts",
      "summarize this",
      "--no-prompt-caching"
    ])

    expect(captured?.enablePromptCaching).toBe(false)
  })

  test("maps --no-cache to noCache=true", async () => {
    const captured = await runWithCapture([
      "bun",
      "src/cli.ts",
      "summarize this",
      "--no-cache"
    ])

    expect(captured?.noCache).toBe(true)
  })

  test("maps --no-trace to noTrace=true", async () => {
    const captured = await runWithCapture([
      "bun",
      "src/cli.ts",
      "trace this run",
      "--no-trace"
    ])

    expect(captured?.noTrace).toBe(true)
  })

  test("maps --trace-dir into CliArgs.traceDir", async () => {
    const captured = await runWithCapture([
      "bun",
      "src/cli.ts",
      "trace this run",
      "--trace-dir",
      "/tmp/rlm-traces"
    ])

    expect(captured?.traceDir).toBe("/tmp/rlm-traces")
  })

  test("uses last delegation flag when both are present", async () => {
    const captured = await runWithCapture([
      "bun",
      "src/cli.ts",
      "delegate this",
      "--sub-model",
      "claude-3-5-haiku",
      "--disable-sub-delegation",
      "--sub-delegation-enabled"
    ])

    expect(captured?.subDelegationEnabled).toBe(true)
  })

  test("fails with ValidationError for unknown options", async () => {
    const exit = await Effect.runPromiseExit(
      runCliCommand(
        ["bun", "src/cli.ts", "query", "--unknown-option"],
        { env, execute: () => Effect.void }
      ).pipe(Effect.provide(BunContext.layer))
    )

    const failure = getFailure(exit)
    expect(ValidationError.isValidationError(failure)).toBeTrue()
  })

  test("maps --input flags to CliArgs.inputs", async () => {
    const captured = await runWithCapture([
      "bun",
      "src/cli.ts",
      "analyze this",
      "--input",
      `doc=${fixtureFile}`
    ])

    expect(captured?.inputs).toEqual([
      { name: "doc", path: nodeFs.realpathSync(fixtureFile) }
    ])
  })

  test("fails with CliInputError when sub delegation is enabled without sub model", async () => {
    const exit = await Effect.runPromiseExit(
      runCliCommand(
        ["bun", "src/cli.ts", "query", "--sub-delegation-enabled"],
        { env, execute: () => Effect.void }
      ).pipe(Effect.provide(BunContext.layer))
    )

    const failure = getFailure(exit)
    expect(failure).toBeInstanceOf(CliInputError)
    expect((failure as CliInputError).message).toBe("Error: --sub-delegation-enabled requires --sub-model")
  })
})
