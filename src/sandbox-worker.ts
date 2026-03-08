import { WorkerRunner } from "@effect/platform"
import { BunContext, BunWorkerRunner } from "@effect/platform-bun"
import { Command, FileSystem } from "@effect/platform"
import { Duration, Effect, Fiber, ManagedRuntime, Option, Schema, Stream } from "effect"
import * as nodePath from "node:path"
import * as nodeFs from "node:fs"
import { clampPath } from "./SandboxPathClamp"
import {
  RunnerBridgeFailedRequest,
  RunnerBridgeResultRequest,
  RunnerExecRequest,
  RunnerGetVarRequest,
  RunnerInitRequest,
  RunnerListVarsRequest,
  RunnerSetVarRequest,
  RunnerShutdownRequest,
  SandboxWorkerRunnerRequest,
  type RunnerWorkerFrame
} from "./SandboxWorkerRunnerProtocol"

/**
 * Sandbox worker entry point.
 *
 * Modes:
 * - Subprocess IPC mode (`Bun.spawn(..., { ipc })`) for strict isolation path.
 * - Effect WorkerRunner mode (`new Worker(...)`) for permissive transport path.
 *
 * Trust model: strict mode relies on process isolation; JavaScript hardening remains best effort.
 */

// --- State ---

const vars = new Map<string, unknown>()
let workerCallId = "unknown"
let workerDepth = 0
let sandboxMode: "permissive" | "strict" = "permissive"
let hasMediaAttachments = false
let toolNames: ReadonlyArray<string> = []
let sandboxWorkDir: string | null = null
let platformRuntime: ManagedRuntime.ManagedRuntime<BunContext.BunContext, never> | null = null

const getPlatformRuntime = () => {
  if (!platformRuntime) {
    platformRuntime = ManagedRuntime.make(BunContext.layer)
  }
  return platformRuntime
}

const hasProcessIpc =
  typeof process !== "undefined" &&
  typeof process.send === "function" &&
  typeof process.on === "function"

const sendToHost = (message: unknown): void => {
  if (hasProcessIpc) {
    process.send!(message)
    return
  }
  throw new Error("sendToHost is only available in subprocess IPC mode")
}

const closeWorker = (code: number): void => {
  if (hasProcessIpc) {
    process.exit(code)
    return
  }
  throw new Error("closeWorker is only available in subprocess IPC mode")
}

// Pending bridge calls: requestId → { resolve, reject }
const pendingBridge = new Map<
  string,
  { resolve: (value: unknown) => void; reject: (reason: unknown) => void }
>()

// Max frame size (configurable via Init, default 4MB)
let maxFrameBytes = 4 * 1024 * 1024

const STRICT_BLOCKLIST: ReadonlyArray<{
  readonly pattern: RegExp
  readonly message: string
}> = [
  {
    pattern: /\bimport\s*\(/,
    message: "Strict sandbox blocks dynamic module loading"
  },
  {
    pattern: /\brequire\s*\(/,
    message: "Strict sandbox blocks dynamic module loading"
  },
  {
    pattern: /\bFunction\s*\(/,
    message: "Strict sandbox blocks Function constructor"
  },
  {
    pattern: /\.\s*constructor\s*\.\s*constructor\s*\(/,
    message: "Strict sandbox blocks constructor escape"
  },
  {
    pattern: /\.\s*constructor\s*\(/,
    message: "Strict sandbox blocks constructor escape"
  }
]

const makeStrictScope = (
  print: (...args: unknown[]) => void,
  __vars: unknown,
  llm_query: (query: string, context?: string, options?: { model?: string; responseFormat?: { type: string; schema: object } }) => Promise<unknown>,
  llm_query_batched: (queries: ReadonlyArray<string>, contexts?: ReadonlyArray<string>) => Promise<unknown>,
  llm_query_with_media: (query: string, ...mediaNames: ReadonlyArray<string>) => Promise<unknown>,
  budget: () => Promise<unknown>,
  init_corpus: (documents: unknown, options?: unknown) => Promise<unknown>,
  init_corpus_from_context: (options?: unknown) => Promise<unknown>,
  tools?: Record<string, (...args: unknown[]) => Promise<unknown>>
) => {
  const scope: Record<string, unknown> = {
    // Explicitly provided worker bindings
    print,
    __vars,
    llm_query,
    llm_query_batched,
    llm_query_with_media,
    budget,
    init_corpus,
    init_corpus_from_context,
    undefined,
    // Tool functions (includes FS/shell bindings from injectedHelpers)
    ...tools,

    // Common JS built-ins
    Array,
    ArrayBuffer,
    BigInt,
    BigInt64Array,
    BigUint64Array,
    Boolean,
    DataView,
    Date,
    Error,
    EvalError,
    Float32Array,
    Float64Array,
    Int8Array,
    Int16Array,
    Int32Array,
    Uint8Array,
    Uint8ClampedArray,
    Uint16Array,
    Uint32Array,
    Intl,
    JSON,
    Map,
    Math,
    Number,
    Object,
    Promise,
    RangeError,
    ReferenceError,
    RegExp,
    Set,
    String,
    Symbol,
    SyntaxError,
    TypeError,
    URIError,
    URL,
    URLSearchParams,
    WeakMap,
    WeakSet,
    atob,
    btoa,
    clearInterval,
    clearTimeout,
    decodeURI,
    decodeURIComponent,
    encodeURI,
    encodeURIComponent,
    isFinite,
    isNaN,
    parseFloat,
    parseInt,
    setInterval,
    setTimeout,
    crypto
  }

  return new Proxy(scope, {
    has() {
      // Prevent fallback resolution to ambient globals.
      return true
    },
    get(target, prop) {
      if (typeof prop !== "string") return undefined
      return Object.prototype.hasOwnProperty.call(target, prop)
        ? target[prop]
        : undefined
    },
    set() {
      return false
    }
  })
}

// --- Helpers ---

function checkFrameSize(message: unknown): boolean {
  try {
    return new TextEncoder().encode(JSON.stringify(message)).byteLength <= maxFrameBytes
  } catch {
    // Non-serializable (BigInt, circular ref, etc.) — frame cannot be sent
    return false
  }
}

function safeSend(
  message: unknown,
  emit: (message: unknown) => void = sendToHost
): boolean {
  const msg = message as Record<string, unknown>
  if (!checkFrameSize(message)) {
    if (msg._tag === "BridgeCall") {
      // Reject the pending bridge promise directly so executeCode can continue
      const bridgeRequestId = String(msg.requestId)
      const pending = pendingBridge.get(bridgeRequestId)
      if (pending) {
        pendingBridge.delete(bridgeRequestId)
        pending.reject(new Error("BridgeCall exceeds max frame size"))
      }
      return false
    }
    // For other message types: send truncated error to host
    const fallback = {
      _tag: "ExecError" as const,
      requestId: String(msg.requestId ?? "unknown"),
      message: "Response exceeds max frame size"
    }
    emit(fallback)
    return false
  }
  emit(message)
  return true
}

const makeToolFunctions = (emitFrame: (message: unknown) => boolean): Record<string, (...args: unknown[]) => Promise<unknown>> =>
  Object.fromEntries(
    toolNames.map((toolName) => [
      toolName,
      async (...args: unknown[]): Promise<unknown> => {
        if (sandboxMode === "strict") {
          throw new Error("Bridge disabled in strict sandbox mode")
        }
        const bridgeRequestId = crypto.randomUUID()
        return new Promise((resolve, reject) => {
          pendingBridge.set(bridgeRequestId, { resolve, reject })
          emitFrame({
            _tag: "BridgeCall",
            requestId: bridgeRequestId,
            method: toolName,
            args
          })
        })
      }
    ])
  )

// --- Code execution ---

async function executeCode(
  requestId: string,
  code: string,
  emitFrame: (message: unknown) => boolean = (message) => safeSend(message)
): Promise<void> {
  const output: string[] = []
  const activeToolFunctions = makeToolFunctions(emitFrame)

  // Injected bindings
  const print = (...args: unknown[]) => {
    output.push(args.map(String).join(" "))
  }

  const __vars = new Proxy(vars, {
    get(_target, prop: string) {
      return vars.get(prop)
    },
    set(_target, prop: string, value: unknown) {
      vars.set(prop, value)
      return true
    },
    has(_target, prop: string) {
      return vars.has(prop)
    }
  })

  const llm_query = async (
    query: string,
    contextOrOptions?: string | { model?: string; responseFormat?: { type: string; schema: object } },
    optionsArg?: { model?: string; responseFormat?: { type: string; schema: object } }
  ): Promise<unknown> => {
    if (sandboxMode === "strict") {
      throw new Error("Bridge disabled in strict sandbox mode")
    }

    let context: string | undefined
    let options: { model?: string; responseFormat?: { type: string; schema: object } } | undefined
    if (typeof contextOrOptions === "string") {
      context = contextOrOptions
      options = optionsArg
    } else if (contextOrOptions !== undefined) {
      options = contextOrOptions
    }

    const bridgeRequestId = crypto.randomUUID()

    return new Promise((resolve, reject) => {
      pendingBridge.set(bridgeRequestId, { resolve, reject })
      const args: Array<unknown> = [query]
      if (context !== undefined) args.push(context)
      if (options !== undefined) {
      if (context === undefined) args.push("")
        args.push(options)
      }
      emitFrame({
        _tag: "BridgeCall",
        requestId: bridgeRequestId,
        method: "llm_query",
        args
      })
    })
  }

  const llm_query_batched = async (
    queries: ReadonlyArray<string>,
    contexts?: ReadonlyArray<string>
  ): Promise<unknown> => {
    if (sandboxMode === "strict") {
      throw new Error("Bridge disabled in strict sandbox mode")
    }

    const bridgeRequestId = crypto.randomUUID()

    return new Promise((resolve, reject) => {
      pendingBridge.set(bridgeRequestId, { resolve, reject })
      emitFrame({
        _tag: "BridgeCall",
        requestId: bridgeRequestId,
        method: "llm_query_batched",
        args: contexts !== undefined ? [queries, contexts] : [queries]
      })
    })
  }

  const llm_query_with_media = async (
    query: string,
    ...mediaNames: ReadonlyArray<string>
  ): Promise<unknown> => {
    if (sandboxMode === "strict") {
      throw new Error("Bridge disabled in strict sandbox mode")
    }
    if (!hasMediaAttachments) {
      throw new Error("No media attachments available in this run")
    }

    const bridgeRequestId = crypto.randomUUID()
    return new Promise((resolve, reject) => {
      pendingBridge.set(bridgeRequestId, { resolve, reject })
      emitFrame({
        _tag: "BridgeCall",
        requestId: bridgeRequestId,
        method: "llm_query_with_media",
        args: [query, ...mediaNames]
      })
    })
  }

  const budget = async (): Promise<unknown> => {
    if (sandboxMode === "strict") {
      throw new Error("Bridge disabled in strict sandbox mode")
    }

    const bridgeRequestId = crypto.randomUUID()
    return new Promise((resolve, reject) => {
      pendingBridge.set(bridgeRequestId, { resolve, reject })
      emitFrame({
        _tag: "BridgeCall",
        requestId: bridgeRequestId,
        method: "budget",
        args: []
      })
    })
  }

  interface CorpusDocument {
    readonly id: string
    readonly text: string
  }

  interface InitCorpusOptions {
    readonly corpusId?: string
    readonly batchSize?: number
    readonly dedupeById?: boolean
    readonly maxDocuments?: number
    readonly textField?: string
  }

  const toObject = (value: unknown): Record<string, unknown> =>
    typeof value === "object" && value !== null
      ? value as Record<string, unknown>
      : {}

  const toNonEmptyString = (value: unknown): string | undefined =>
    typeof value === "string" && value.trim().length > 0
      ? value.trim()
      : undefined

  const toPositiveInteger = (value: unknown, fallback: number): number =>
    typeof value === "number" && Number.isFinite(value) && Number.isInteger(value) && value > 0
      ? value
      : fallback

  const toolOrThrow = (toolName: string): ((...args: unknown[]) => Promise<unknown>) => {
    const fn = activeToolFunctions[toolName]
    if (fn) return fn
    throw new Error(`Required NLP tool "${toolName}" is unavailable in this run`)
  }

  const pickTextFromRecord = (record: Record<string, unknown>, textField?: string): string => {
    if (textField !== undefined) {
      const explicit = record[textField]
      if (typeof explicit === "string") return explicit
    }

    const candidateFields = ["text", "content", "body", "body_markdown", "body_text", "body_html", "markdown", "message", "description", "summary", "title"]
    for (const field of candidateFields) {
      const value = record[field]
      if (typeof value === "string") return value
    }

    const firstString = Object.values(record).find((value) => typeof value === "string")
    if (typeof firstString === "string") return firstString

    try {
      return JSON.stringify(record)
    } catch {
      return String(record)
    }
  }

  const toCorpusDocument = (
    value: unknown,
    index: number,
    textField?: string
  ): CorpusDocument | undefined => {
    if (typeof value === "string") {
      const text = value.trim()
      if (text.length === 0) return undefined
      return { id: String(index), text }
    }

    const record = toObject(value)
    if (Object.keys(record).length === 0) return undefined

    const rawId = record.id ?? record._id
    const id =
      typeof rawId === "string" || typeof rawId === "number" || typeof rawId === "bigint"
        ? String(rawId)
        : String(index)

    const text = pickTextFromRecord(record, textField).trim()
    if (text.length === 0) return undefined

    return { id, text }
  }

  const parseDelimitedRecords = (context: string, delimiter: "," | "\t"): Array<Record<string, unknown>> => {
    const lines = context
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (lines.length < 2) return []

    const header = lines[0]!.split(delimiter).map((cell) => cell.trim())
    const rows = lines.slice(1)
    const records: Array<Record<string, unknown>> = []
    for (const row of rows) {
      const cells = row.split(delimiter)
      const record: Record<string, unknown> = {}
      for (let i = 0; i < header.length; i += 1) {
        const key = header[i]
        if (!key || key.length === 0) continue
        record[key] = (cells[i] ?? "").trim()
      }
      records.push(record)
    }
    return records
  }

  const inferCorpusId = (createResult: unknown, requestedCorpusId?: string): string => {
    if (requestedCorpusId !== undefined) return requestedCorpusId

    const fromResult = toObject(createResult).corpusId
    if (typeof fromResult === "string" && fromResult.length > 0) {
      return fromResult
    }

    throw new Error("CreateCorpus did not return a corpusId; provide options.corpusId explicitly")
  }

  const learnIntoCorpus = async (
    rawDocuments: ReadonlyArray<unknown>,
    options?: InitCorpusOptions
  ): Promise<{
    corpusId: string
    documentsLearned: number
    batches: number
    batchSize: number
    dedupeById: boolean
  }> => {
    const normalizedOptions = toObject(options)
    const requestedCorpusId = toNonEmptyString(normalizedOptions.corpusId)
    const textField = toNonEmptyString(normalizedOptions.textField)
    const batchSize = toPositiveInteger(normalizedOptions.batchSize, 500)
    const dedupeById = normalizedOptions.dedupeById !== false
    const maxDocuments = toPositiveInteger(normalizedOptions.maxDocuments, Number.MAX_SAFE_INTEGER)

    const normalizedDocuments = rawDocuments
      .map((value, index) => toCorpusDocument(value, index, textField))
      .filter((value): value is CorpusDocument => value !== undefined)
      .slice(0, maxDocuments)

    if (normalizedDocuments.length === 0) {
      throw new Error("No corpus documents were produced from input")
    }

    const createCorpus = toolOrThrow("CreateCorpus")
    const learnCorpus = toolOrThrow("LearnCorpus")

    const createResult = requestedCorpusId !== undefined
      ? await createCorpus(requestedCorpusId)
      : await createCorpus()

    const corpusId = inferCorpusId(createResult, requestedCorpusId)

    let batches = 0
    for (let index = 0; index < normalizedDocuments.length; index += batchSize) {
      const batch = normalizedDocuments.slice(index, index + batchSize)
      await learnCorpus(corpusId, batch, dedupeById)
      batches += 1
    }

    vars.set("contextCorpusId", corpusId)

    return {
      corpusId,
      documentsLearned: normalizedDocuments.length,
      batches,
      batchSize,
      dedupeById
    }
  }

  const init_corpus = async (
    documents: unknown,
    options?: unknown
  ): Promise<unknown> => {
    if (!Array.isArray(documents)) {
      throw new Error("init_corpus requires an array of documents")
    }

    return learnIntoCorpus(documents, options as InitCorpusOptions | undefined)
  }

  const init_corpus_from_context = async (options?: unknown): Promise<unknown> => {
    const context = vars.get("context")
    if (typeof context !== "string" || context.trim().length === 0) {
      throw new Error("__vars.context is empty; nothing to index")
    }

    const normalizedOptions = toObject(options)
    const contextMeta = toObject(vars.get("contextMeta"))
    const format = toNonEmptyString(contextMeta.format)

    // textField precedence: explicit option > API-level contextTextField > auto-detected primaryTextField
    if (normalizedOptions.textField === undefined) {
      const contextTextField = toNonEmptyString(contextMeta.contextTextField)
      const primaryTextField = toNonEmptyString(contextMeta.primaryTextField)
      if (contextTextField !== undefined) {
        normalizedOptions.textField = contextTextField
      } else if (primaryTextField !== undefined) {
        normalizedOptions.textField = primaryTextField
      }
    }

    let sourceDocuments: Array<unknown> = []

    if (format === "ndjson") {
      sourceDocuments = context
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
          try {
            return JSON.parse(line)
          } catch {
            return undefined
          }
        })
        .filter((value) => value !== undefined)
    } else if (format === "json-array") {
      const parsed = JSON.parse(context)
      if (!Array.isArray(parsed)) {
        throw new Error("__vars.contextMeta.format is json-array but parsed context is not an array")
      }
      sourceDocuments = parsed
    } else if (format === "csv") {
      sourceDocuments = parseDelimitedRecords(context, ",")
    } else if (format === "tsv") {
      sourceDocuments = parseDelimitedRecords(context, "\t")
    } else if (format === "json") {
      sourceDocuments = [JSON.parse(context)]
    } else {
      sourceDocuments = context
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    }

    if (sourceDocuments.length === 0) {
      throw new Error("No records found in __vars.context for corpus initialization")
    }

    return learnIntoCorpus(sourceDocuments, normalizedOptions as InitCorpusOptions)
  }

  // --- FS/shell scope bindings ---

  const fsStrictGuard = () => {
    if (sandboxMode === "strict" || sandboxWorkDir === null) {
      throw new Error("File system operations not available in strict sandbox mode")
    }
  }

  const mapPlatformError = (path: string) => (e: unknown) => {
    if (typeof e === "object" && e !== null && "_tag" in e) {
      const tagged = e as { _tag: string; reason?: string; message?: string }
      if (tagged._tag === "SystemError") {
        return new Error(`${tagged.reason ?? "SystemError"}: ${tagged.message ?? path}`)
      }
      if (tagged._tag === "BadArgument") {
        return new Error(tagged.message ?? "Bad argument")
      }
    }
    return e instanceof Error ? e : new Error(String(e))
  }

  /** Resolve realPath and verify it stays within sandboxWorkDir. */
  const assertContained = (resolvedPath: string, fs: FileSystem.FileSystem): Effect.Effect<void, Error> =>
    Effect.gen(function*() {
      const real = yield* fs.realPath(resolvedPath).pipe(
        Effect.catchTag("SystemError", () => Effect.succeed(resolvedPath))
      )
      if (real !== sandboxWorkDir! && !real.startsWith(sandboxWorkDir! + nodePath.sep)) {
        yield* Effect.fail(new Error(`Symlink escapes sandbox: ${resolvedPath}`))
      }
    })

  const readFile = async (path: string): Promise<string> => {
    fsStrictGuard()
    const clamped = clampPath(path, sandboxWorkDir!)
    try {
      return await getPlatformRuntime().runPromise(
        Effect.gen(function*() {
          const fs = yield* FileSystem.FileSystem
          yield* assertContained(clamped, fs)
          return yield* fs.readFileString(clamped)
        })
      )
    } catch (e) {
      throw mapPlatformError(path)(e)
    }
  }

  const writeFile = async (path: string, content: string): Promise<void> => {
    fsStrictGuard()
    const clamped = clampPath(path, sandboxWorkDir!)
    try {
      await getPlatformRuntime().runPromise(
        Effect.gen(function*() {
          const fs = yield* FileSystem.FileSystem
          const dir = nodePath.dirname(clamped)
          if (dir !== sandboxWorkDir) {
            yield* fs.makeDirectory(dir, { recursive: true })
          }
          yield* assertContained(dir, fs)
          yield* fs.writeFileString(clamped, content)
        })
      )
    } catch (e) {
      throw mapPlatformError(path)(e)
    }
  }

  const listDir = async (path?: string): Promise<string[]> => {
    fsStrictGuard()
    const clamped = path !== undefined ? clampPath(path, sandboxWorkDir!) : sandboxWorkDir!
    try {
      return await getPlatformRuntime().runPromise(
        Effect.gen(function*() {
          const fs = yield* FileSystem.FileSystem
          yield* assertContained(clamped, fs)
          return yield* fs.readDirectory(clamped)
        })
      )
    } catch (e) {
      throw mapPlatformError(path ?? ".")(e)
    }
  }

  const stat = async (path: string): Promise<{ type: string; size: number; mtime: string | null }> => {
    fsStrictGuard()
    const clamped = clampPath(path, sandboxWorkDir!)
    try {
      return await getPlatformRuntime().runPromise(
        Effect.gen(function*() {
          const fs = yield* FileSystem.FileSystem
          yield* assertContained(clamped, fs)
          const info = yield* fs.stat(clamped)
          return {
            type: info.type,
            size: Number(info.size),
            mtime: Option.isSome(info.mtime) ? info.mtime.value.toISOString() : null
          }
        })
      )
    } catch (e) {
      throw mapPlatformError(path)(e)
    }
  }

  const mkdir = async (path: string): Promise<void> => {
    fsStrictGuard()
    const clamped = clampPath(path, sandboxWorkDir!)
    try {
      await getPlatformRuntime().runPromise(
        Effect.gen(function*() {
          const fs = yield* FileSystem.FileSystem
          yield* fs.makeDirectory(clamped, { recursive: true })
          yield* assertContained(clamped, fs)
        })
      )
    } catch (e) {
      throw mapPlatformError(path)(e)
    }
  }

  const remove = async (path: string): Promise<void> => {
    fsStrictGuard()
    const clamped = clampPath(path, sandboxWorkDir!)
    try {
      await getPlatformRuntime().runPromise(
        Effect.gen(function*() {
          const fs = yield* FileSystem.FileSystem
          yield* assertContained(clamped, fs)
          yield* fs.remove(clamped, { recursive: true })
        })
      )
    } catch (e) {
      throw mapPlatformError(path)(e)
    }
  }

  const exists = async (path: string): Promise<boolean> => {
    fsStrictGuard()
    const clamped = clampPath(path, sandboxWorkDir!)
    try {
      return await getPlatformRuntime().runPromise(
        Effect.gen(function*() {
          const fs = yield* FileSystem.FileSystem
          const pathExists = yield* fs.exists(clamped)
          if (pathExists) {
            yield* assertContained(clamped, fs)
          }
          return pathExists
        })
      )
    } catch (e) {
      throw mapPlatformError(path)(e)
    }
  }

  const shell = async (
    command: string,
    options?: { timeout?: number; cwd?: string }
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> => {
    fsStrictGuard()
    const timeoutMs = options?.timeout ?? 30_000
    const maxOutputBytes = 1024 * 1024 // 1MB per stream
    const subcwd = options?.cwd ? clampPath(options.cwd, sandboxWorkDir!) : sandboxWorkDir!

    try {
      return await getPlatformRuntime().runPromise(
        Effect.scoped(
          Effect.gen(function*() {
            const cmd = Command.make("sh", "-c", command).pipe(
              Command.workingDirectory(subcwd),
              Command.env({
                PATH: "/usr/local/bin:/usr/bin:/bin",
                HOME: sandboxWorkDir!,
                TMPDIR: sandboxWorkDir!,
                LANG: "en_US.UTF-8"
              })
            )
            const proc = yield* Command.start(cmd)

            const stdoutFiber = yield* Stream.runFold(proc.stdout, "", (acc, chunk) =>
              acc.length >= maxOutputBytes ? acc : acc + new TextDecoder().decode(chunk)
            ).pipe(Effect.fork)

            const stderrFiber = yield* Stream.runFold(proc.stderr, "", (acc, chunk) =>
              acc.length >= maxOutputBytes ? acc : acc + new TextDecoder().decode(chunk)
            ).pipe(Effect.fork)

            const exitCode = yield* proc.exitCode
            const stdoutStr = yield* Fiber.join(stdoutFiber)
            const stderrStr = yield* Fiber.join(stderrFiber)

            return {
              stdout: stdoutStr.slice(0, maxOutputBytes),
              stderr: stderrStr.slice(0, maxOutputBytes),
              exitCode
            }
          })
        ).pipe(
          Effect.timeoutFail({
            duration: Duration.millis(timeoutMs),
            onTimeout: () => new Error(`Shell command timed out after ${timeoutMs}ms`)
          }),
          Effect.catchAll((e) => Effect.fail(e instanceof Error ? e : new Error(String(e))))
        )
      )
    } catch (e) {
      throw e instanceof Error ? e : new Error(String(e))
    }
  }

  const cwd = (): string => "."

  try {
    if (sandboxMode === "strict") {
      for (const blocked of STRICT_BLOCKLIST) {
        if (blocked.pattern.test(code)) {
          throw new Error(blocked.message)
        }
      }
    }

    // AsyncFunction constructor to allow top-level await in code
    const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor
    const injectedHelpers = {
      init_corpus,
      init_corpus_from_context,
      readFile,
      writeFile,
      listDir,
      stat,
      mkdir,
      remove,
      exists,
      shell,
      cwd
    }
    const injectedFunctions = {
      ...activeToolFunctions,
      ...injectedHelpers
    }
    const injectedToolNames = Object.keys(injectedFunctions)
    const toolValues = Object.values(injectedFunctions)

    if (sandboxMode === "strict") {
      const strictScope = makeStrictScope(
        print,
        __vars,
        llm_query,
        llm_query_batched,
        llm_query_with_media,
        budget,
        init_corpus,
        init_corpus_from_context,
        injectedFunctions
      )
      const fn = new AsyncFunction(
        "print",
        "__vars",
        "llm_query",
        "llm_query_batched",
        "llm_query_with_media",
        "budget",
        "init_corpus",
        "init_corpus_from_context",
        "__strictScope",
        ...injectedToolNames,
        `
        with (__strictScope) {
          ${code}
        }
      `
      )
      await fn(
        print,
        __vars,
        llm_query,
        llm_query_batched,
        llm_query_with_media,
        budget,
        init_corpus,
        init_corpus_from_context,
        strictScope,
        ...toolValues
      )
    } else {
      const fn = new AsyncFunction(
        "print",
        "__vars",
        "llm_query",
        "llm_query_batched",
        "llm_query_with_media",
        "budget",
        "init_corpus",
        "init_corpus_from_context",
        ...injectedToolNames,
        code
      )
      await fn(
        print,
        __vars,
        llm_query,
        llm_query_batched,
        llm_query_with_media,
        budget,
        init_corpus,
        init_corpus_from_context,
        ...toolValues
      )
    }

    emitFrame({
      _tag: "ExecResult",
      requestId,
      output: output.join("\n")
    })
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err))
    let message = error.message
    if (err instanceof ReferenceError) {
      const match = message.match(/^(\w+) is not defined$/)
      const varName = match?.[1]
      if (varName !== undefined && !vars.has(varName)) {
        message += `\nHint: Each iteration runs in a fresh scope. If \`${varName}\` came from a prior iteration, persist it as \`__vars.${varName}\` instead.`
      }
    }
    emitFrame({
      _tag: "ExecError",
      requestId,
      message,
      stack: error.stack
    })
  }
}

// --- Message dispatch ---

const JS_IDENTIFIER_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/
const RESERVED_BINDINGS = new Set([
  "print",
  "__vars",
  "llm_query",
  "llm_query_batched",
  "llm_query_with_media",
  "budget",
  "init_corpus",
  "init_corpus_from_context",
  "readFile",
  "writeFile",
  "listDir",
  "stat",
  "mkdir",
  "remove",
  "exists",
  "shell",
  "cwd",
  "__strictScope"
])

const InitPayloadSchema = Schema.Struct({
  callId: Schema.String,
  depth: Schema.Number,
  sandboxMode: Schema.optional(Schema.Literal("permissive", "strict")),
  hasMediaAttachments: Schema.optional(Schema.Boolean),
  maxFrameBytes: Schema.optional(Schema.Number.pipe(
    Schema.int(),
    Schema.positive(),
    Schema.lessThanOrEqualTo(64 * 1024 * 1024)
  )),
  tools: Schema.optional(Schema.Array(Schema.Struct({
    name: Schema.String,
    parameterNames: Schema.optional(Schema.Array(Schema.String)),
    description: Schema.optional(Schema.String)
  }))),
  sandboxWorkDir: Schema.optional(Schema.String)
})

type InitPayload = typeof InitPayloadSchema.Type
const decodeInitPayload = Schema.decodeUnknownSync(InitPayloadSchema)

const parseInitPayload = (input: unknown): InitPayload | undefined => {
  const payload = typeof input === "object" && input !== null && "_tag" in input
    ? Object.fromEntries(
        Object.entries(input as Record<string, unknown>).filter(([key]) => key !== "_tag")
      )
    : input

  try {
    return decodeInitPayload(payload)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[sandbox-worker] Invalid Init payload: ${message}`)
    return undefined
  }
}

const normalizeToolNames = (rawTools: unknown): ReadonlyArray<string> => {
  if (!Array.isArray(rawTools)) return []
  const names: Array<string> = []
  for (const tool of rawTools) {
    const toolName = String((tool as { readonly name?: unknown }).name ?? "")
    if (!JS_IDENTIFIER_RE.test(toolName) || RESERVED_BINDINGS.has(toolName)) {
      console.error(`[sandbox-worker] Skipping invalid tool name: ${toolName}`)
      continue
    }
    names.push(toolName)
  }
  return names
}

const applyInitMessage = (raw: unknown): void => {
  const msg = parseInitPayload(raw)
  if (msg === undefined) return

  workerCallId = String(msg.callId ?? "unknown")
  workerDepth = Number(msg.depth ?? 0)
  sandboxMode = msg.sandboxMode === "strict" ? "strict" : "permissive"
  hasMediaAttachments = msg.hasMediaAttachments === true
  if (typeof msg.maxFrameBytes === "number" && msg.maxFrameBytes > 0 &&
      Number.isInteger(msg.maxFrameBytes) && msg.maxFrameBytes <= 64 * 1024 * 1024) {
    maxFrameBytes = msg.maxFrameBytes
  }

  toolNames = normalizeToolNames(msg.tools)

  if (sandboxMode === "permissive") {
    if (typeof msg.sandboxWorkDir === "string" && msg.sandboxWorkDir.length > 0) {
      sandboxWorkDir = msg.sandboxWorkDir
    } else {
      sandboxWorkDir = nodeFs.mkdtempSync(
        nodePath.join(nodeFs.realpathSync(Bun.env.TMPDIR ?? "/tmp"), `rlm-sandbox-${workerCallId}-`)
      )
    }
  }

  console.error(
    `[sandbox-worker] Init: callId=${workerCallId} depth=${workerDepth} mode=${sandboxMode} maxFrameBytes=${maxFrameBytes} tools=${toolNames.join(",")}${sandboxWorkDir ? ` workDir=${sandboxWorkDir}` : ""}`
  )
}

const listVariableMetadata = (): ReadonlyArray<{
  readonly name: string
  readonly type: string
  readonly size?: number
  readonly preview: string
}> => {
  const buildPreview = (value: unknown): { type: string; size?: number; preview: string } => {
    if (value === null) return { type: "null", preview: "null" }
    if (value === undefined) return { type: "undefined", preview: "undefined" }

    if (typeof value === "string") {
      return {
        type: "string",
        size: value.length,
        preview: value.length > 200 ? value.slice(0, 200) + "..." : value
      }
    }

    if (Array.isArray(value)) {
      return {
        type: "array",
        size: value.length,
        preview: `Array(${value.length})`
      }
    }

    if (typeof value === "object") {
      const keys = Object.keys(value as object)
      return {
        type: "object",
        size: keys.length,
        preview: `{${keys.slice(0, 5).join(", ")}${keys.length > 5 ? ", ..." : ""}}`
      }
    }

    if (typeof value === "function") {
      const fn = value as Function
      return {
        type: "function",
        preview: `[Function ${fn.name || "anonymous"}]`
      }
    }

    return {
      type: typeof value,
      preview: String(value).slice(0, 200)
    }
  }

  return Array.from(vars.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => {
      const { type, size, preview } = buildPreview(value)
      return {
        name,
        type,
        ...(size !== undefined ? { size } : {}),
        preview
      }
    })
}

function handleMessage(message: unknown): void {
  if (typeof message !== "object" || message === null || !("_tag" in message)) {
    return
  }

  const msg = message as Record<string, unknown>

  switch (msg._tag) {
    case "Init": {
      applyInitMessage(msg)
      break
    }

    case "ExecRequest": {
      const requestId = String(msg.requestId)
      const code = String(msg.code)
      executeCode(requestId, code)
      break
    }

    case "SetVar": {
      const requestId = String(msg.requestId)
      try {
        vars.set(String(msg.name), msg.value)
        safeSend({ _tag: "SetVarAck", requestId })
      } catch (err: unknown) {
        safeSend({
          _tag: "SetVarError",
          requestId,
          message: err instanceof Error ? err.message : String(err)
        })
      }
      break
    }

    case "GetVarRequest": {
      const requestId = String(msg.requestId)
      const value = vars.get(String(msg.name))
      safeSend({ _tag: "GetVarResult", requestId, value })
      break
    }

    case "ListVarsRequest": {
      const requestId = String(msg.requestId)
      const variables = listVariableMetadata()

      safeSend({ _tag: "ListVarsResult", requestId, variables })
      break
    }

    case "BridgeResult": {
      const requestId = String(msg.requestId)
      const pending = pendingBridge.get(requestId)
      if (pending) {
        pendingBridge.delete(requestId)
        pending.resolve(msg.result)
      }
      break
    }

    case "BridgeFailed": {
      const requestId = String(msg.requestId)
      const pending = pendingBridge.get(requestId)
      if (pending) {
        pendingBridge.delete(requestId)
        pending.reject(new Error(String(msg.message)))
      }
      break
    }

    case "Shutdown": {
      // Reject all pending bridge calls
      for (const [id, pending] of pendingBridge) {
        pending.reject(new Error("Worker shutting down"))
        pendingBridge.delete(id)
      }
      toolNames = []
      if (sandboxWorkDir !== null) {
        try { nodeFs.rmSync(sandboxWorkDir, { recursive: true, force: true }) } catch {}
        sandboxWorkDir = null
      }
      if (platformRuntime !== null) {
        platformRuntime.dispose().catch(() => {})
        platformRuntime = null
      }
      closeWorker(0)
      break
    }

    default:
      console.error(`[sandbox-worker] Unknown message tag: ${String(msg._tag)}`)
      break
  }
}

// --- Host message listeners ---

if (hasProcessIpc) {
  process.on("message", handleMessage)
  process.on("disconnect", () => {
    for (const [id, pending] of pendingBridge) {
      pending.reject(new Error("Parent process disconnected"))
      pendingBridge.delete(id)
    }
    closeWorker(1)
  })
} else {
  Effect.runFork(
    BunWorkerRunner.launch(
      WorkerRunner.layerSerialized(SandboxWorkerRunnerRequest, {
        Init: (request: RunnerInitRequest) =>
          Effect.sync(() => {
            applyInitMessage(request)
          }),
        ExecRequest: (request: RunnerExecRequest) =>
          Stream.asyncPush<RunnerWorkerFrame>((emit) =>
            Effect.sync(() => {
              void executeCode(
                request.requestId,
                request.code,
                (message) => safeSend(message, (frame) => {
                  emit.single(frame as RunnerWorkerFrame)
                })
              ).finally(() => {
                emit.end()
              })
            })
          ),
        SetVar: (request: RunnerSetVarRequest) =>
          Effect.sync(() => {
            try {
              vars.set(request.name, request.value)
              return {
                _tag: "SetVarAck" as const,
                requestId: request.requestId
              }
            } catch (err: unknown) {
              return {
                _tag: "SetVarError" as const,
                requestId: request.requestId,
                message: err instanceof Error ? err.message : String(err)
              }
            }
          }),
        GetVarRequest: (request: RunnerGetVarRequest) =>
          Effect.sync(() => ({
            _tag: "GetVarResult" as const,
            requestId: request.requestId,
            value: vars.get(request.name)
          })),
        ListVarsRequest: (request: RunnerListVarsRequest) =>
          Effect.sync(() => ({
            _tag: "ListVarsResult" as const,
            requestId: request.requestId,
            variables: listVariableMetadata()
          })),
        BridgeResult: (request: RunnerBridgeResultRequest) =>
          Effect.sync(() => {
            const pending = pendingBridge.get(request.requestId)
            if (pending) {
              pendingBridge.delete(request.requestId)
              pending.resolve(request.result)
            }
          }),
        BridgeFailed: (request: RunnerBridgeFailedRequest) =>
          Effect.sync(() => {
            const pending = pendingBridge.get(request.requestId)
            if (pending) {
              pendingBridge.delete(request.requestId)
              pending.reject(new Error(request.message))
            }
          }),
        Shutdown: (_request: RunnerShutdownRequest) =>
          Effect.sync(() => {
            for (const [id, pending] of pendingBridge) {
              pending.reject(new Error("Worker shutting down"))
              pendingBridge.delete(id)
            }
            toolNames = []
            if (sandboxWorkDir !== null) {
              try { nodeFs.rmSync(sandboxWorkDir, { recursive: true, force: true }) } catch {}
              sandboxWorkDir = null
            }
            if (platformRuntime !== null) {
              platformRuntime.dispose().catch(() => {})
              platformRuntime = null
            }
          })
      })
    ).pipe(
      Effect.provide(BunWorkerRunner.layer),
      Effect.catchAll((error) =>
        Effect.sync(() => {
          console.error("[sandbox-worker] WorkerRunner launch failed", error)
        })
      )
    )
  )
}
