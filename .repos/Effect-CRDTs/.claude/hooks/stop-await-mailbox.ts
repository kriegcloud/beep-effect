/**
 * Stop Hook - Await Mailbox Messages
 *
 * Waits for incoming mailbox messages if COLLABORATION mode is enabled.
 * Uses FileSystem.watch() with Stream patterns to efficiently wait for messages.
 * Supports interruption via Ctrl+C.
 *
 * @since 1.0.0
 * @category Hooks
 */

import {
  Effect,
  Console,
  Context,
  Layer,
  Data,
  pipe,
  Stream,
  Option,
  Config,
  Array,
  ParseResult,
} from "effect"
import { FileSystem, Path } from "@effect/platform"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { PlatformError } from "@effect/platform/Error"
import * as Schema from "effect/Schema"

// ============================================================================
// Tagged Errors
// ============================================================================



/**
 * Error when hook input fails validation
 * @category Errors
 */
export class InvalidHookInputError extends Data.TaggedError(
  "InvalidHookInputError"
)<{
  readonly cause: ParseResult.ParseError
}> { }

/**
 * Error when mailbox operations fail
 * @category Errors
 */
export class MailboxOperationError extends Data.TaggedError(
  "MailboxOperationError"
)<{
  readonly reason: string
  readonly cause?: unknown
}> { }

// ============================================================================
// Schemas
// ============================================================================

/**
 * Schema for Stop hook input from stdin
 * @category Schemas
 */
const StopHookInput = Schema.Struct({
  session_id: Schema.String,
  transcript_path: Schema.String,
  cwd: Schema.String,
  hook_event_name: Schema.String,
  source: Schema.String, // "natural" or other
})
type StopHookInput = Schema.Schema.Type<typeof StopHookInput>
/**
 * Schema for a single request in the mailbox
 * @category Schemas
 */
const Request = Schema.Struct({
  from: Schema.String,
  message: Schema.String,
  timestamp: Schema.String,
})

type Request = Schema.Schema.Type<typeof Request>

// ============================================================================
// Configuration Service
// ============================================================================

/**
 * Configuration service for mailbox awaiter
 * @category Services
 */
export class MailboxConfig extends Context.Tag("MailboxConfig")<
  MailboxConfig,
  {
    readonly mailboxDir: string
    readonly getMailboxPath: (agentName: string) => string
  }
>() { }

/**
 * Live implementation of MailboxConfig
 * Uses Path service to construct file paths
 * @category Layers
 */
export const MailboxConfigLive = Layer.effect(
  MailboxConfig,
  Effect.gen(function* () {
    const path = yield* Path.Path
    const mailboxDir = path.join(".claude", "coordination", "mailboxes")

    return MailboxConfig.of({
      mailboxDir,
      getMailboxPath: (agentName: string) => path.join(mailboxDir, `${agentName}.json`),
    })
  })
)

// ============================================================================
// Mailbox Repository Service
// ============================================================================

/**
 * Repository service for mailbox persistence
 * @category Services
 */
export class MailboxRepository extends Context.Tag("MailboxRepository")<
  MailboxRepository,
  {
    readonly readMessages: (
      agentName: string
    ) => Effect.Effect<ReadonlyArray<Request>, MailboxOperationError>
    readonly removeMessages: (
      agentName: string
    ) => Effect.Effect<void, MailboxOperationError | PlatformError>
  }
>() { }

/**
 * Live implementation of MailboxRepository using FileSystem
 * @category Layers
 */
export const MailboxRepositoryLive = Layer.effect(
  MailboxRepository,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const config = yield* MailboxConfig

    const readMessages = (agentName: string) =>
      pipe(
        config.getMailboxPath(agentName),
        fs.readFileString,
        Effect.flatMap(Schema.decode(Schema.parseJson(Schema.Array(Request)))),
        Effect.mapError(
          (error) =>
            new MailboxOperationError({
              reason: "Failed to read mailbox file",
              cause: error,
            })
        ),
      )

    const removeMessages = (agentName: string) =>
      Effect.gen(function* () {
        const mailboxPath = config.getMailboxPath(agentName)

        // Check if file exists
        const exists = yield* fs.exists(mailboxPath)
        if (!exists) return

        // Clear the mailbox by writing empty array
        yield* fs.writeFileString(mailboxPath, "[]").pipe(
          Effect.mapError(
            (error) =>
              new MailboxOperationError({
                reason: "Failed to clear mailbox file",
                cause: error,
              })
          )
        )
      })

    return MailboxRepository.of({
      readMessages,
      removeMessages,
    })
  })
)


// ============================================================================
// Hook Input Parser Service
// ============================================================================

/**
 * Service for parsing hook input
 * @category Services
 */
export class HookInputParser extends Context.Tag("HookInputParser")<
  HookInputParser,
  {
    readonly parse: (
      input: string
    ) => Effect.Effect<StopHookInput, InvalidHookInputError>
  }
>() { }

/**
 * Live implementation of HookInputParser using Schema
 * @category Layers
 */
export const HookInputParserLive = Layer.succeed(
  HookInputParser,
  HookInputParser.of({
    parse: (input: string) =>
      Schema.decode(Schema.parseJson(StopHookInput))(input).pipe(
        Effect.mapError((cause) => new InvalidHookInputError({ cause }))
      ),
  })
)

// ============================================================================
// Mailbox Awaiter Service
// ============================================================================

/**
 * Service for awaiting mailbox messages
 * @category Services
 */
export class MailboxAwaiter extends Context.Tag("MailboxAwaiter")<
  MailboxAwaiter,
  {
    readonly awaitMessages: (
      agentName: string
    ) => Effect.Effect<ReadonlyArray<Request>, MailboxOperationError>
  }
>() { }

/**
 * Format messages for display
 * @category Operations
 */
const formatMessages = (messages: ReadonlyArray<Request>): string => {
  if (Array.isEmptyReadonlyArray(messages)) return ""

  const header = "\n🔔 Messages Received:\n"
  const formattedMessages = Array.map(
    messages,
    (req) => `  - From ${req.from}: "${req.message}"`
  ).join("\n")

  return header + formattedMessages + "\n"
}

/**
 * Live implementation of MailboxAwaiter
 * Uses FileSystem.watch with Stream + takeUntil pattern
 * @category Layers
 */
export const MailboxAwaiterLive = Layer.effect(
  MailboxAwaiter,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem
    const config = yield* MailboxConfig
    const repo = yield* MailboxRepository

    const awaitMessages = (agentName: string): Effect.Effect<ReadonlyArray<Request>, MailboxOperationError> =>
      Effect.gen(function* () {
        const mailboxPath = config.getMailboxPath(agentName)

        const initialCheck = Stream.fromEffect(repo.readMessages(agentName))

        const watchStream =
          fs.watch(mailboxPath).pipe(
            Stream.mapEffect(() => repo.readMessages(agentName)),
            Stream.mapError((error) =>
              new MailboxOperationError({
                reason: "Failed to watch mailbox file", cause: error
              })
            ),
          )

        return yield* pipe(
          Stream.concat(initialCheck, watchStream),
          Stream.filter(Array.isNonEmptyReadonlyArray),
          Stream.runHead,
          Effect.flatMap(
            Option.match({
              onNone: () => Effect.never,
              onSome: (messages) => Effect.succeed(messages)
            })
          )
        )
      })

    return MailboxAwaiter.of({ awaitMessages })
  })
)

// ============================================================================
// Main Program Logic
// ============================================================================

/**
 * Main program that checks COLLABORATION mode and awaits messages
 * @category Program
 */
const program = Effect.gen(function* () {
  const awaiter = yield* MailboxAwaiter
  const repo = yield* MailboxRepository

  // Read agent name from environment (set by bash script)
  const agentName = yield* Config.string("AGENT_NAME")

  // Await messages (checks existing first, then watches for new ones)
  const messages = yield* awaiter.awaitMessages(agentName)
  const output = formatMessages(messages)
  yield* Console.log(output)

  // Remove messages after displaying
  yield* repo.removeMessages(agentName)
})

// ============================================================================
// Application Layer
// ============================================================================

/**
 * Complete application layer with all dependencies
 * @category Layers
 */
const AppLive =
  MailboxAwaiterLive.pipe(
    Layer.provideMerge(MailboxRepositoryLive),
    Layer.provideMerge(MailboxConfigLive),
    Layer.provideMerge(BunContext.layer)
  )

// ============================================================================
// Entry Point
// ============================================================================

const runnable = pipe(
  program,
  Effect.provide(AppLive),
  Effect.onInterrupt(() =>
    Console.log("\n\n⚠️  Mailbox watch cancelled by user\n")
  ),
  Effect.catchAll(Effect.logError)
)

BunRuntime.runMain(runnable)
