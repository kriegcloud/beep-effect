import { NodeServices } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import type { Instant } from "@template/domain/ports"
import { DateTime, Effect, Layer } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { mkdirSync, rmSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import type { CommandExecutionError } from "../src/tools/command/CommandErrors.js"
import { CommandSpawnFailed } from "../src/tools/command/CommandErrors.js"
import { CommandRuntime } from "../src/tools/command/CommandRuntime.js"
import type {
  CommandRequest,
  CommandResult
} from "../src/tools/command/CommandTypes.js"
import { FilePathPolicy, type FilePathPolicyService } from "../src/tools/file/FilePathPolicy.js"
import { FileRuntime } from "../src/tools/file/FileRuntime.js"
import { ToolExecution } from "../src/tools/ToolExecution.js"

interface CommandCall {
  readonly mode: CommandRequest["mode"]
  readonly executableOrCommand: string
  readonly args: ReadonlyArray<string>
}

const instant = (input: string): Instant => DateTime.fromDateUnsafe(new Date(input))

const makeCommandResult = (params: {
  readonly exitCode?: number
  readonly stdout?: string
  readonly stderr?: string
} = {}): CommandResult => ({
  exitCode: params.exitCode ?? 0,
  stdout: params.stdout ?? "",
  stderr: params.stderr ?? "",
  truncatedStdout: false,
  truncatedStderr: false,
  startedAt: instant("2026-02-28T00:00:00.000Z"),
  completedAt: instant("2026-02-28T00:00:00.000Z")
})

const makeFilePathPolicyLayer = (): Layer.Layer<FilePathPolicy> => {
  const workspaceRoot = process.cwd()

  const service: FilePathPolicyService = {
    resolveForRead: (inputPath) =>
      Effect.succeed({
        requestedPath: inputPath,
        lexicalPath: resolve(workspaceRoot, inputPath),
        canonicalPath: resolve(workspaceRoot, inputPath),
        workspaceRoot
      }),
    resolveForWrite: (inputPath) =>
      Effect.succeed({
        requestedPath: inputPath,
        lexicalPath: resolve(workspaceRoot, inputPath),
        canonicalPath: resolve(workspaceRoot, inputPath),
        workspaceRoot
      }),
    resolveForEdit: (inputPath) =>
      Effect.succeed({
        requestedPath: inputPath,
        lexicalPath: resolve(workspaceRoot, inputPath),
        canonicalPath: resolve(workspaceRoot, inputPath),
        workspaceRoot
      })
  }

  return Layer.succeed(FilePathPolicy, service)
}

const makeLayer = (
  executeCommand: (request: CommandRequest) => Effect.Effect<CommandResult, CommandExecutionError>
) => {
  const commandRuntimeLayer = Layer.succeed(CommandRuntime, {
    execute: ({ request }) => executeCommand(request)
  })

  const fileRuntimeLayer = Layer.succeed(FileRuntime, {
    read: () =>
      Effect.die("FileRuntime.read should not be called in ToolExecution file query tests"),
    write: () =>
      Effect.die("FileRuntime.write should not be called in ToolExecution file query tests"),
    edit: () =>
      Effect.die("FileRuntime.edit should not be called in ToolExecution file query tests")
  })

  const sqlLayer = Layer.succeed(SqlClient.SqlClient, {} as SqlClient.SqlClient)

  return ToolExecution.layer.pipe(
    Layer.provide(commandRuntimeLayer),
    Layer.provide(fileRuntimeLayer),
    Layer.provide(makeFilePathPolicyLayer()),
    Layer.provide(sqlLayer),
    Layer.provide(NodeServices.layer)
  )
}

describe("ToolExecution", () => {
  it.effect("findFiles falls back to find when fd spawn fails", () => {
    const relativeDir = `tmp/tool-execution-find-${crypto.randomUUID()}`
    const absoluteDir = join(process.cwd(), relativeDir)
    mkdirSync(join(absoluteDir, "nested"), { recursive: true })
    writeFileSync(join(absoluteDir, "nested", "find-me.txt"), "match", "utf8")

    const calls: Array<CommandCall> = []
    const layer = makeLayer((request) => {
      if (request.mode !== "Argv") {
        return Effect.die("expected argv command request")
      }

      calls.push({
        mode: request.mode,
        executableOrCommand: request.executable,
        args: request.args ?? []
      })

      if (request.executable === "fd") {
        return Effect.fail(new CommandSpawnFailed({ reason: "fd missing" }))
      }
      if (request.executable === "find") {
        return Effect.succeed(
          makeCommandResult({
            stdout: `${join(absoluteDir, "nested", "find-me.txt")}\n`
          })
        )
      }

      return Effect.fail(new CommandSpawnFailed({ reason: `unexpected command ${request.executable}` }))
    })

    return Effect.gen(function*() {
      const toolExecution = yield* ToolExecution
      const result = yield* toolExecution.findFiles({
        path: relativeDir,
        pattern: "find-me",
        context: { source: "cli" }
      })

      expect(result.matches).toEqual(["nested/find-me.txt"])
      expect(calls.map((call) => call.executableOrCommand)).toEqual(["fd", "find"])
      expect(calls[0]?.args).toContain("--glob")
      expect(calls[0]?.args).toContain("*find-me*")
      expect(calls[1]?.args).toContain("-name")
      expect(calls[1]?.args).toContain("*find-me*")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(
        Effect.sync(() => rmSync(absoluteDir, { recursive: true, force: true }))
      )
    )
  })

  it.effect("grepFiles falls back to grep when rg spawn fails and passes include/literal flags", () => {
    const relativeDir = `tmp/tool-execution-grep-${crypto.randomUUID()}`
    const absoluteDir = join(process.cwd(), relativeDir)
    mkdirSync(absoluteDir, { recursive: true })
    writeFileSync(join(absoluteDir, "match.txt"), "literal a+b(c)\n", "utf8")

    const calls: Array<CommandCall> = []
    const layer = makeLayer((request) => {
      if (request.mode !== "Argv") {
        return Effect.die("expected argv command request")
      }

      calls.push({
        mode: request.mode,
        executableOrCommand: request.executable,
        args: request.args ?? []
      })

      if (request.executable === "rg") {
        return Effect.fail(new CommandSpawnFailed({ reason: "rg missing" }))
      }
      if (request.executable === "grep") {
        return Effect.succeed(
          makeCommandResult({
            stdout: `${join(absoluteDir, "match.txt")}:1:literal a+b(c)\n`
          })
        )
      }

      return Effect.fail(new CommandSpawnFailed({ reason: `unexpected command ${request.executable}` }))
    })

    return Effect.gen(function*() {
      const toolExecution = yield* ToolExecution
      const result = yield* toolExecution.grepFiles({
        path: relativeDir,
        pattern: "a+b(c)",
        include: "*.txt",
        literalText: true,
        context: { source: "cli" }
      })

      expect(result.matches).toHaveLength(1)
      expect(result.matches[0]?.path).toBe("match.txt")
      expect(result.matches[0]?.line).toBe(1)
      expect(calls.map((call) => call.executableOrCommand)).toEqual(["rg", "grep"])
      expect(calls[0]?.args).toContain("-F")
      expect(calls[0]?.args).toContain("--glob")
      expect(calls[0]?.args).toContain("*.txt")
      expect(calls[1]?.args).toContain("-F")
      expect(calls[1]?.args).toContain("--include")
      expect(calls[1]?.args).toContain("*.txt")
    }).pipe(
      Effect.provide(layer),
      Effect.ensuring(
        Effect.sync(() => rmSync(absoluteDir, { recursive: true, force: true }))
      )
    )
  })

  it.effect("grepFiles rejects empty include before invoking command runtime", () => {
    const calls: Array<CommandCall> = []
    const layer = makeLayer((request) => {
      if (request.mode !== "Argv") {
        return Effect.die("expected argv command request")
      }

      calls.push({
        mode: request.mode,
        executableOrCommand: request.executable,
        args: request.args ?? []
      })

      return Effect.fail(new CommandSpawnFailed({ reason: "should not be called" }))
    })

    return Effect.gen(function*() {
      const toolExecution = yield* ToolExecution
      const failure = yield* toolExecution.grepFiles({
        pattern: "needle",
        include: "  ",
        context: { source: "cli" }
      }).pipe(
        Effect.flip
      )

      expect(failure.errorCode).toBe("InvalidFileRequest")
      expect(calls).toHaveLength(0)
    }).pipe(Effect.provide(layer))
  })
})
