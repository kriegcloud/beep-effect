import { Effect, FileSystem, Layer, Option, Path, ServiceMap } from "effect"
import * as SqlClient from "effect/unstable/sql/SqlClient"
import { CommandRuntime } from "./command/CommandRuntime.js"
import type { CommandInvocationContext } from "./command/CommandTypes.js"
import {
  isFileExecutionError,
  mapFileErrorToToolFailureCode
} from "./file/FileErrors.js"
import { FilePathPolicy } from "./file/FilePathPolicy.js"
import { FileRuntime } from "./file/FileRuntime.js"
import { DEFAULT_FILE_MAX_BYTES, type ResolvedFilePath } from "./file/FileTypes.js"

export interface ToolExecutionFailure {
  readonly errorCode: string
  readonly message: string
}

export interface ToolExecutionService {
  readonly executeShell: (params: {
    readonly command: string
    readonly cwd?: string
    readonly timeoutMs?: number
    readonly outputLimitBytes?: number
    readonly context?: CommandInvocationContext
  }) => Effect.Effect<{
    readonly exitCode: number
    readonly stdout: string
    readonly stderr: string
  }, ToolExecutionFailure>
  readonly readFile: (params: {
    readonly path: string
    readonly offset?: number
    readonly limit?: number
    readonly context?: CommandInvocationContext
  }) => Effect.Effect<{
    readonly path: string
    readonly content: string
    readonly bytesRead: number
  }, ToolExecutionFailure>
  readonly writeFile: (params: {
    readonly path: string
    readonly content: string
    readonly maxBytes?: number
    readonly context?: CommandInvocationContext
  }) => Effect.Effect<{
    readonly path: string
    readonly bytesWritten: number
  }, ToolExecutionFailure>
  readonly editFile: (params: {
    readonly path: string
    readonly oldString: string
    readonly newString: string
    readonly maxBytes?: number
    readonly context?: CommandInvocationContext
  }) => Effect.Effect<{
    readonly path: string
    readonly bytesWritten: number
    readonly diff: string
  }, ToolExecutionFailure>
  readonly listFiles: (params: {
    readonly path?: string
    readonly recursive?: boolean
    readonly includeHidden?: boolean
    readonly ignore?: ReadonlyArray<string>
    readonly limit?: number
    readonly context?: CommandInvocationContext
  }) => Effect.Effect<{
    readonly path: string
    readonly entries: ReadonlyArray<string>
    readonly truncated: boolean
  }, ToolExecutionFailure>
  readonly findFiles: (params: {
    readonly pattern: string
    readonly path?: string
    readonly includeHidden?: boolean
    readonly limit?: number
    readonly context?: CommandInvocationContext
  }) => Effect.Effect<{
    readonly path: string
    readonly matches: ReadonlyArray<string>
    readonly truncated: boolean
  }, ToolExecutionFailure>
  readonly grepFiles: (params: {
    readonly pattern: string
    readonly path?: string
    readonly includeHidden?: boolean
    readonly include?: string
    readonly literalText?: boolean
    readonly caseSensitive?: boolean
    readonly limit?: number
    readonly context?: CommandInvocationContext
  }) => Effect.Effect<{
    readonly path: string
    readonly matches: ReadonlyArray<{
      readonly path: string
      readonly line: number
      readonly text: string
    }>
    readonly truncated: boolean
  }, ToolExecutionFailure>
  readonly sendNotification: (params: {
    readonly recipient: string
    readonly message: string
  }) => Effect.Effect<{
    readonly notificationId: string
    readonly delivered: boolean
  }, ToolExecutionFailure>
}

const DEFAULT_TIMEOUT_MS = 15_000
const DEFAULT_OUTPUT_LIMIT_BYTES = 16 * 1024
const DEFAULT_FILE_LIST_LIMIT = 200
const DEFAULT_FILE_FIND_LIMIT = 200
const DEFAULT_FILE_GREP_LIMIT = 200
const MAX_FILE_TOOL_LIMIT = 2_000
const textEncoder = new TextEncoder()

const fail = (errorCode: string, message: string): ToolExecutionFailure => ({
  errorCode,
  message
})

const toErrorMessage = (error: unknown): string =>
  typeof error === "object" && error !== null && "message" in error
    ? String((error as { readonly message?: unknown }).message)
    : String(error)

const paginateContent = (params: {
  readonly content: string
  readonly path: string
  readonly offset?: number
  readonly limit?: number
}): Effect.Effect<string, ToolExecutionFailure> =>
  Effect.gen(function*() {
    const { content, path, offset, limit } = params

    if (offset !== undefined && (!Number.isInteger(offset) || offset <= 0)) {
      return yield* Effect.fail(
        fail("InvalidReadRequest", "offset must be a positive integer")
      )
    }

    if (limit !== undefined && (!Number.isInteger(limit) || limit <= 0)) {
      return yield* Effect.fail(
        fail("InvalidReadRequest", "limit must be a positive integer")
      )
    }

    const lines = content.split("\n")
    const start = offset === undefined ? 0 : offset - 1
    if (start > lines.length) {
      return yield* Effect.fail(
        fail(
          "InvalidReadRequest",
          `offset ${offset} is beyond end of file (${lines.length} lines): ${path}`
        )
      )
    }

    if (limit === undefined) {
      return lines.slice(start).join("\n")
    }

    const end = Math.min(start + limit, lines.length)
    const page = lines.slice(start, end).join("\n")
    if (end >= lines.length) {
      return page
    }

    return `${page}\n\n[${lines.length - end} more lines. Use offset=${end + 1} to continue.]`
  })

const mapCommandErrorToToolFailure = (error: unknown): ToolExecutionFailure => {
  if (typeof error !== "object" || error === null || !("_tag" in error)) {
    return fail("ShellExecutionFailed", toErrorMessage(error))
  }

  const tagged = error as { readonly _tag: string; readonly reason?: string; readonly timeoutMs?: number }
  switch (tagged._tag) {
    case "CommandValidationError":
      if (tagged.reason?.includes("timeoutMs")) {
        return fail("InvalidTimeout", tagged.reason)
      }
      if (tagged.reason?.includes("outputLimitBytes")) {
        return fail("InvalidOutputLimit", tagged.reason)
      }
      return fail("InvalidCommand", tagged.reason ?? "invalid command")
    case "CommandWorkspaceViolation":
      return fail("PathOutsideWorkspace", tagged.reason ?? "path is outside workspace")
    case "CommandHookRejected":
      return fail("CommandHookRejected", tagged.reason ?? "command rejected by hook")
    case "CommandBackendUnavailable":
      return fail("ShellBackendUnavailable", tagged.reason ?? "command backend unavailable")
    case "CommandSpawnFailed":
      return fail("ShellSpawnFailed", tagged.reason ?? "failed to spawn shell")
    case "CommandTimeout":
      return fail(
        "ToolTimeout",
        `command timed out after ${tagged.timeoutMs ?? DEFAULT_TIMEOUT_MS}ms`
      )
    case "CommandExecutionFailed":
      return fail("ShellExecutionFailed", tagged.reason ?? "shell execution failed")
    case "SandboxViolation":
      return fail("SandboxViolation", tagged.reason ?? "sandbox violation")
    default:
      return fail("ShellExecutionFailed", toErrorMessage(error))
  }
}

const mapFileErrorToToolFailure = (error: unknown): ToolExecutionFailure => {
  const errorCode = mapFileErrorToToolFailureCode(error)
  if (!isFileExecutionError(error)) {
    return fail(errorCode, toErrorMessage(error))
  }

  switch (error._tag) {
    case "FileValidationError":
      return fail(errorCode, error.reason)
    case "FileWorkspaceViolation":
      return fail(errorCode, error.reason)
    case "FileNotFound":
      return fail(errorCode, `file not found: ${error.path}`)
    case "FileStaleRead":
      return fail(errorCode, `file changed since last read: ${error.path}`)
    case "FileEditNotFound":
      return fail(errorCode, `could not find edit target in ${error.path}`)
    case "FileEditAmbiguous":
      return fail(
        errorCode,
        `edit target is ambiguous (${error.matchCount} matches at lines ${error.lineNumbers.join(", ")})`
      )
    case "FileTooLarge":
      return fail(
        errorCode,
        `file content exceeds ${error.limitBytes} bytes (got ${error.sizeBytes})`
      )
    case "FileHookRejected":
      return fail(errorCode, error.reason)
    case "FileWriteFailed":
      return fail(errorCode, error.reason)
    case "SandboxViolation":
      return fail(errorCode, error.reason)
  }
}

export class ToolExecution extends ServiceMap.Service<ToolExecution>()(
  "server/tools/ToolExecution",
  {
    make: Effect.gen(function*() {
      const sql = yield* SqlClient.SqlClient
      const commandRuntime = yield* CommandRuntime
      const fileRuntime = yield* FileRuntime
      const filePathPolicy = yield* FilePathPolicy
      const fs = yield* FileSystem.FileSystem
      const pathService = yield* Path.Path
      const workspaceRoot = pathService.resolve(process.cwd())

      const splitTrimmedLines = (output: string): Array<string> =>
        output
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0)

      const splitNonEmptyLines = (output: string): Array<string> =>
        output
          .split(/\r?\n/)
          .filter((line) => line.trim().length > 0)

      const normalizeForPattern = (value: string): string => value.replace(/\\/g, "/")

      const escapeRegexLiteral = (value: string): string =>
        value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

      const globToRegexSource = (pattern: string): string => {
        let source = ""
        for (let index = 0; index < pattern.length; index += 1) {
          const char = pattern[index]!
          if (char === "*") {
            if (pattern[index + 1] === "*") {
              source += ".*"
              index += 1
              continue
            }
            source += "[^/]*"
            continue
          }

          if (char === "?") {
            source += "[^/]"
            continue
          }

          if (char === "{") {
            const end = pattern.indexOf("}", index + 1)
            if (end > index + 1) {
              const inner = pattern.slice(index + 1, end)
              const alternatives = inner
                .split(",")
                .map((part) => globToRegexSource(part))
              source += `(?:${alternatives.join("|")})`
              index = end
              continue
            }
          }

          source += escapeRegexLiteral(char)
        }
        return source
      }

      const matchesGlobPattern = (value: string, pattern: string): boolean => {
        const normalizedPattern = normalizeForPattern(pattern.trim())
        if (normalizedPattern.length === 0) {
          return false
        }

        const regexSource = globToRegexSource(normalizedPattern)
        let regex: RegExp
        try {
          regex = new RegExp(`^${regexSource}$`)
        } catch {
          return false
        }

        const normalizedValue = normalizeForPattern(value)
        if (normalizedPattern.includes("/")) {
          return regex.test(normalizedValue)
        }

        const lastSegment = normalizedValue.split("/").at(-1) ?? normalizedValue
        return regex.test(lastSegment)
      }

      const normalizeLimit = (
        limit: number | undefined,
        defaultValue: number
      ): Effect.Effect<number, ToolExecutionFailure> => {
        if (limit === undefined) {
          return Effect.succeed(defaultValue)
        }

        if (!Number.isInteger(limit) || limit <= 0) {
          return Effect.fail(
            fail("InvalidFileRequest", "limit must be a positive integer")
          )
        }

        return Effect.succeed(Math.min(limit, MAX_FILE_TOOL_LIMIT))
      }

      const toRelativeFromRoot = (root: string, value: string): string => {
        if (!pathService.isAbsolute(value)) {
          return value
        }

        const relative = pathService.relative(root, value)
        if (relative.startsWith("..") || pathService.isAbsolute(relative)) {
          return value
        }
        return relative.length === 0 ? "." : relative
      }

      const isHiddenPath = (value: string): boolean =>
        value
          .replace(/\\/g, "/")
          .split("/")
          .some((segment) => segment.startsWith(".") && segment.length > 1)

      const isInsideWorkspaceRoot = (target: string): boolean => {
        const relative = pathService.relative(workspaceRoot, target)
        return relative === "" || (!relative.startsWith("..") && !pathService.isAbsolute(relative))
      }

      const resolveFileToolRoot = (
        targetPath: string
      ): Effect.Effect<ResolvedFilePath, ToolExecutionFailure> =>
        filePathPolicy.resolveForRead(targetPath).pipe(
          Effect.catchTag("FileWorkspaceViolation", (error) =>
            Effect.gen(function*() {
              if (!isInsideWorkspaceRoot(error.lexicalPath) || !isInsideWorkspaceRoot(error.canonicalPath)) {
                return yield* error
              }

              const isDirectory = yield* fs.stat(error.canonicalPath).pipe(
                Effect.map((stats) => stats.type === "Directory"),
                Effect.catch(() => Effect.succeed(false))
              )
              if (!isDirectory) {
                return yield* error
              }

              return {
                requestedPath: targetPath,
                lexicalPath: error.lexicalPath,
                canonicalPath: error.canonicalPath,
                workspaceRoot
              } as const
            })
          ),
          Effect.mapError(mapFileErrorToToolFailure)
        )

      const mapCommandRuntimeErrorForFileTool = (params: {
        readonly operation: "FileList" | "FileFind" | "FileGrep"
        readonly binary: string
        readonly error: unknown
      }): ToolExecutionFailure => {
        if (
          typeof params.error !== "object"
          || params.error === null
          || !("_tag" in params.error)
        ) {
          return fail(`${params.operation}ExecutionFailed`, toErrorMessage(params.error))
        }

        const tagged = params.error as {
          readonly _tag: string
          readonly reason?: string
          readonly timeoutMs?: number
        }

        switch (tagged._tag) {
          case "CommandValidationError":
            return fail(`${params.operation}InvalidRequest`, tagged.reason ?? "invalid request")
          case "CommandBackendUnavailable":
            return fail(`${params.operation}BackendUnavailable`, tagged.reason ?? "command backend unavailable")
          case "CommandSpawnFailed":
            return fail(
              `${params.operation}BinaryUnavailable`,
              `${params.binary} unavailable: ${tagged.reason ?? "spawn failed"}`
            )
          case "CommandTimeout":
            return fail(
              "ToolTimeout",
              `${params.operation} timed out after ${tagged.timeoutMs ?? DEFAULT_TIMEOUT_MS}ms`
            )
          case "CommandWorkspaceViolation":
            return fail("PathOutsideWorkspace", tagged.reason ?? "path is outside workspace")
          case "CommandHookRejected":
            return fail("CommandHookRejected", tagged.reason ?? "command rejected by hook")
          case "SandboxViolation":
            return fail("SandboxViolation", tagged.reason ?? "sandbox violation")
          case "CommandExecutionFailed":
            return fail(`${params.operation}ExecutionFailed`, tagged.reason ?? "command execution failed")
          default:
            return fail(`${params.operation}ExecutionFailed`, toErrorMessage(params.error))
        }
      }

      const runArgvRaw = (params: {
        readonly operation: "FileList" | "FileFind" | "FileGrep"
        readonly binary: string
        readonly args: ReadonlyArray<string>
        readonly cwd: string
        readonly context: CommandInvocationContext
      }) =>
        commandRuntime.execute({
          context: params.context,
          request: {
            mode: "Argv",
            executable: params.binary,
            args: params.args,
            cwd: params.cwd,
            timeoutMs: DEFAULT_TIMEOUT_MS,
            outputLimitBytes: DEFAULT_OUTPUT_LIMIT_BYTES
          }
        })

      const runArgv = (params: {
        readonly operation: "FileList" | "FileFind" | "FileGrep"
        readonly binary: string
        readonly args: ReadonlyArray<string>
        readonly cwd: string
        readonly context: CommandInvocationContext
      }) =>
        runArgvRaw(params).pipe(
          Effect.mapError((error) =>
            mapCommandRuntimeErrorForFileTool({
              operation: params.operation,
              binary: params.binary,
              error
            })
          )
        )

      const executeShell: ToolExecutionService["executeShell"] = ({
        command,
        cwd,
        timeoutMs = DEFAULT_TIMEOUT_MS,
        outputLimitBytes = DEFAULT_OUTPUT_LIMIT_BYTES,
        context
      }) =>
        commandRuntime.execute({
          context: context ?? { source: "tool" },
          request: {
            mode: "Shell",
            command,
            ...(cwd !== undefined ? { cwd } : {}),
            timeoutMs,
            outputLimitBytes
          }
        }).pipe(
          Effect.map((result) => ({
            exitCode: result.exitCode,
            stdout: result.stdout,
            stderr: result.stderr
          })),
          Effect.mapError(mapCommandErrorToToolFailure)
        )

      const readFile: ToolExecutionService["readFile"] = ({
        path: filePath,
        offset,
        limit,
        context
      }) =>
        fileRuntime.read({
          context: context ?? { source: "tool" },
          path: filePath
        }).pipe(
          Effect.mapError(mapFileErrorToToolFailure),
          Effect.flatMap((result) =>
            paginateContent({
              content: result.content ?? "",
              path: result.path,
              ...(offset !== undefined ? { offset } : {}),
              ...(limit !== undefined ? { limit } : {})
            }).pipe(
              Effect.map((content) => ({
                path: result.path,
                content,
                bytesRead: textEncoder.encode(content).length
              }))
            )
          )
        )

      const writeFile: ToolExecutionService["writeFile"] = ({
        path: filePath,
        content,
        maxBytes = DEFAULT_FILE_MAX_BYTES,
        context
      }) =>
        fileRuntime.write({
          context: context ?? { source: "tool" },
          request: {
            path: filePath,
            content,
            maxBytes
          }
        }).pipe(
          Effect.map((result) => ({
            path: result.path,
            bytesWritten: result.bytesWritten ?? textEncoder.encode(content).length
          })),
          Effect.mapError(mapFileErrorToToolFailure)
        )

      const editFile: ToolExecutionService["editFile"] = ({
        path: filePath,
        oldString,
        newString,
        maxBytes = DEFAULT_FILE_MAX_BYTES,
        context
      }) =>
        fileRuntime.edit({
          context: context ?? { source: "tool" },
          request: {
            path: filePath,
            oldString,
            newString,
            maxBytes
          }
        }).pipe(
          Effect.map((result) => ({
            path: result.path,
            bytesWritten: result.bytesWritten ?? textEncoder.encode(newString).length,
            diff: result.diff ?? ""
          })),
          Effect.mapError(mapFileErrorToToolFailure)
        )

      const listFiles: ToolExecutionService["listFiles"] = ({
        path: targetPath = ".",
        recursive = false,
        includeHidden = false,
        ignore,
        limit,
        context: invocationContext
      }) =>
        Effect.gen(function*() {
          const context = invocationContext ?? { source: "tool" as const }
          const maxEntries = yield* normalizeLimit(limit, DEFAULT_FILE_LIST_LIMIT)
          const resolved = yield* resolveFileToolRoot(targetPath)

          const runRecursive = () =>
            runArgv({
              operation: "FileList",
              binary: "find",
              args: [resolved.canonicalPath],
              cwd: resolved.workspaceRoot,
              context
            })

          const runShallow = () =>
            runArgv({
              operation: "FileList",
              binary: "ls",
              args: [includeHidden ? "-1A" : "-1", resolved.canonicalPath],
              cwd: resolved.workspaceRoot,
              context
            })

          const commandResult = yield* (recursive ? runRecursive() : runShallow())

          if (commandResult.exitCode !== 0) {
            return yield* Effect.fail(
              fail(
                "FileListExecutionFailed",
                commandResult.stderr.trim().length > 0
                  ? commandResult.stderr.trim()
                  : `listing command failed with exit code ${commandResult.exitCode}`
              )
            )
          }

          const rawEntries = splitTrimmedLines(commandResult.stdout)
          const normalizedEntries = recursive
            ? rawEntries
                .map((entry) => toRelativeFromRoot(resolved.canonicalPath, entry))
                .filter((entry) => entry !== ".")
            : rawEntries

          const visibleEntries = includeHidden
            ? normalizedEntries
            : normalizedEntries.filter((entry) => !isHiddenPath(entry))
          const ignorePatterns = (ignore ?? []).map((pattern) => pattern.trim())
          const filteredEntries = visibleEntries.filter((entry) =>
            !ignorePatterns.some((pattern) => matchesGlobPattern(entry, pattern))
          )

          const truncated = filteredEntries.length > maxEntries

          return {
            path: targetPath,
            entries: truncated ? filteredEntries.slice(0, maxEntries) : filteredEntries,
            truncated
          } as const
        })

      const findFiles: ToolExecutionService["findFiles"] = ({
        pattern,
        path: targetPath = ".",
        includeHidden = false,
        limit,
        context: invocationContext
      }) =>
        Effect.gen(function*() {
          const context = invocationContext ?? { source: "tool" as const }
          if (pattern.trim().length === 0) {
            return yield* Effect.fail(
              fail("InvalidFileRequest", "pattern must be a non-empty string")
            )
          }

          const maxEntries = yield* normalizeLimit(limit, DEFAULT_FILE_FIND_LIMIT)
          const resolved = yield* resolveFileToolRoot(targetPath)

          const findPattern = /[*?\[]/.test(pattern) ? pattern : `*${pattern}*`

          const fdResultOption = yield* runArgvRaw({
            operation: "FileFind",
            binary: "fd",
            args: [
              ...(includeHidden ? ["--hidden"] : []),
              "--glob",
              findPattern,
              resolved.canonicalPath
            ],
            cwd: resolved.workspaceRoot,
            context
          }).pipe(
            Effect.map((result) => Option.some(result)),
            Effect.catchTag("CommandSpawnFailed", () => Effect.succeed(Option.none())),
            Effect.mapError((error) =>
              mapCommandRuntimeErrorForFileTool({
                operation: "FileFind",
                binary: "fd",
                error
              })
            )
          )

          const commandResult = yield* (
            Option.isNone(fdResultOption)
              ? runArgv({
                  operation: "FileFind",
                  binary: "find",
                  args: [resolved.canonicalPath, "-name", findPattern],
                  cwd: resolved.workspaceRoot,
                  context
                })
              : Effect.succeed(fdResultOption.value)
          )

          if (commandResult.exitCode !== 0 && commandResult.exitCode !== 1) {
            return yield* Effect.fail(
              fail(
                "FileFindExecutionFailed",
                commandResult.stderr.trim().length > 0
                  ? commandResult.stderr.trim()
                  : `find command failed with exit code ${commandResult.exitCode}`
              )
            )
          }

          const rawMatches = splitTrimmedLines(commandResult.stdout)
          const normalizedMatches = rawMatches
            .map((value) => toRelativeFromRoot(resolved.canonicalPath, value))
            .filter((entry) => entry !== ".")
          const visibleMatches = includeHidden
            ? normalizedMatches
            : normalizedMatches.filter((entry) => !isHiddenPath(entry))
          const truncated = visibleMatches.length > maxEntries

          return {
            path: targetPath,
            matches: truncated ? visibleMatches.slice(0, maxEntries) : visibleMatches,
            truncated
          } as const
        })

      const grepFiles: ToolExecutionService["grepFiles"] = ({
        pattern,
        path: targetPath = ".",
        includeHidden = false,
        include,
        literalText = false,
        caseSensitive = false,
        limit,
        context: invocationContext
      }) =>
        Effect.gen(function*() {
          const context = invocationContext ?? { source: "tool" as const }
          if (pattern.trim().length === 0) {
            return yield* Effect.fail(
              fail("InvalidFileRequest", "pattern must be a non-empty string")
            )
          }

          const maxEntries = yield* normalizeLimit(limit, DEFAULT_FILE_GREP_LIMIT)
          if (include !== undefined && include.trim().length === 0) {
            return yield* Effect.fail(
              fail("InvalidFileRequest", "include must be a non-empty string when provided")
            )
          }

          const resolved = yield* resolveFileToolRoot(targetPath)

          const rgResultOption = yield* runArgvRaw({
            operation: "FileGrep",
            binary: "rg",
            args: [
              "--line-number",
              "--with-filename",
              "--no-heading",
              "--color",
              "never",
              ...(includeHidden ? ["--hidden"] : []),
              ...(caseSensitive ? [] : ["-i"]),
              ...(literalText ? ["-F"] : []),
              ...(include !== undefined ? ["--glob", include] : []),
              "--",
              pattern,
              resolved.canonicalPath
            ],
            cwd: resolved.workspaceRoot,
            context
          }).pipe(
            Effect.map((result) => Option.some(result)),
            Effect.catchTag("CommandSpawnFailed", () => Effect.succeed(Option.none())),
            Effect.mapError((error) =>
              mapCommandRuntimeErrorForFileTool({
                operation: "FileGrep",
                binary: "rg",
                error
              })
            )
          )

          const commandResult = yield* (
            Option.isNone(rgResultOption)
              ? runArgv({
                  operation: "FileGrep",
                  binary: "grep",
                  args: [
                    "-R",
                    "-n",
                    "-H",
                    ...(caseSensitive ? [] : ["-i"]),
                    ...(literalText ? ["-F"] : []),
                    ...(include !== undefined ? ["--include", include] : []),
                    "--",
                    pattern,
                    resolved.canonicalPath
                  ],
                  cwd: resolved.workspaceRoot,
                  context
                })
              : Effect.succeed(rgResultOption.value)
          )

          if (commandResult.exitCode !== 0 && commandResult.exitCode !== 1) {
            return yield* Effect.fail(
              fail(
                "FileGrepExecutionFailed",
                commandResult.stderr.trim().length > 0
                  ? commandResult.stderr.trim()
                  : `grep command failed with exit code ${commandResult.exitCode}`
              )
            )
          }

          const parsedMatches = splitNonEmptyLines(commandResult.stdout)
            .map((line) => {
              const match = line.match(/^(.*?):(\d+):(.*)$/)
              if (match === null) {
                return null
              }

              const [, rawPath, rawLine, text] = match
              return {
                path: toRelativeFromRoot(resolved.canonicalPath, rawPath),
                line: Number(rawLine),
                text
              } as const
            })
            .filter((value): value is { readonly path: string; readonly line: number; readonly text: string } => value !== null)
            .filter((value) => includeHidden || !isHiddenPath(value.path))

          const truncated = parsedMatches.length > maxEntries

          return {
            path: targetPath,
            matches: truncated ? parsedMatches.slice(0, maxEntries) : parsedMatches,
            truncated
          } as const
        })

      const sendNotification: ToolExecutionService["sendNotification"] = ({
        recipient,
        message
      }) =>
        Effect.gen(function*() {
          if (recipient.trim().length === 0) {
            return yield* Effect.fail(
              fail("InvalidRecipient", "recipient must be a non-empty string")
            )
          }
          if (message.trim().length === 0) {
            return yield* Effect.fail(
              fail("InvalidMessage", "message must be a non-empty string")
            )
          }

          const notificationId = `notif:${crypto.randomUUID()}`

          yield* sql`
            INSERT INTO notifications (
              notification_id,
              recipient,
              message,
              delivery_status,
              created_at
            ) VALUES (
              ${notificationId},
              ${recipient},
              ${message},
              ${"Delivered"},
              ${new Date().toISOString()}
            )
          `.unprepared.pipe(
            Effect.mapError((error) =>
              fail("NotificationPersistenceFailed", toErrorMessage(error))
            )
          )

          return {
            notificationId,
            delivered: true
          } as const
        })

      return {
        executeShell,
        readFile,
        writeFile,
        editFile,
        listFiles,
        findFiles,
        grepFiles,
        sendNotification
      } satisfies ToolExecutionService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
