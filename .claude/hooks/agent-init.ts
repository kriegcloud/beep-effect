/**
 * SessionStart Hook - Agent Initialization
 *
 * This hook runs when a new Claude session starts.
 * It generates a stable agent ID, exports it to the environment,
 * captures the project structure, and injects context.
 *
 * @module AgentInit
 * @since 1.0.0
 */

import { Effect, Console, Context, Layer, Data, Schema, pipe, Config } from "effect"
import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Command, CommandExecutor } from "@effect/platform"

// ============================================================================
// Schemas
// ============================================================================

/**
 * Configuration schema with validation
 *
 * @category Schema
 * @since 1.0.0
 */
const AgentConfigSchema = Schema.Struct({
  projectDir: Schema.String.pipe(Schema.nonEmptyString()),
})

type AgentConfigData = Schema.Schema.Type<typeof AgentConfigSchema>


/**
 * Context injection output structure
 *
 * @category Schema
 * @since 1.0.0
 */
const ContextOutputSchema = Schema.Struct({
  context: Schema.String
})

type ContextOutput = Schema.Schema.Type<typeof ContextOutputSchema>

// ============================================================================
// Error Types
// ============================================================================

/**
 * Configuration validation error
 *
 * @category Error
 * @since 1.0.0
 */
export class AgentConfigError extends Data.TaggedError("AgentConfigError")<{
  readonly reason: string
  readonly cause?: unknown
}> { }

/**
 * File operation error
 *
 * @category Error
 * @since 1.0.0
 */
export class FileOperationError extends Data.TaggedError("FileOperationError")<{
  readonly operation: string
  readonly path: string
  readonly cause?: unknown
}> { }

/**
 * Command execution error
 *
 * @category Error
 * @since 1.0.0
 */
export class CommandError extends Data.TaggedError("CommandError")<{
  readonly command: string
  readonly reason: string
  readonly cause?: unknown
}> { }

// ============================================================================
// Services
// ============================================================================

/**
 * Configuration service - provides validated agent configuration
 *
 * @category Service
 * @since 1.0.0
 */
export class AgentConfig extends Context.Tag("AgentConfig")<
  AgentConfig,
  {
    readonly projectDir: string
  }
>() { }

/**
 * Project structure capture service
 *
 * @category Service
 * @since 1.0.0
 */
export class ProjectStructureCapture extends Context.Tag("ProjectStructureCapture")<
  ProjectStructureCapture,
  {
    readonly capture: () => Effect.Effect<string>
  }
>() { }

/**
 * Context output service
 *
 * @category Service
 * @since 1.0.0
 */
export class ContextOutputter extends Context.Tag("ContextOutputter")<
  ContextOutputter,
  {
    readonly output: (treeOutput: string) => Effect.Effect<void, AgentConfigError>
  }
>() { }

// ============================================================================
// Service Implementations
// ============================================================================

/**
 * Configuration Configs using Effect Config module
 *
 * @category Config
 * @since 1.0.0
 */
const ProjectDirConfig = pipe(
  Config.string("CLAUDE_PROJECT_DIR"),
  Config.withDefault(".")
)

/**
 * Load and validate configuration from environment
 *
 * @category Layer
 * @since 1.0.0
 */
export const AgentConfigLive = Layer.effect(
  AgentConfig,
  Effect.gen(function* () {
    const projectDir = yield* ProjectDirConfig

    // Validate configuration
    const config: AgentConfigData = yield* Schema.decode(AgentConfigSchema)({
      projectDir,
    }).pipe(
      Effect.mapError((error) =>
        new AgentConfigError({
          reason: "Invalid configuration",
          cause: error
        })
      )
    )

    return AgentConfig.of({
      projectDir: config.projectDir,
    })
  })
)
/**
 * Project structure capture implementation
 *
 * @category Layer
 * @since 1.0.0
 */
export const ProjectStructureCaptureLive = Layer.effect(
  ProjectStructureCapture,
  Effect.gen(function* () {
    const config = yield* AgentConfig
    const commandExecutor = yield* CommandExecutor.CommandExecutor

    return ProjectStructureCapture.of({
      capture: () =>
        pipe(
          Command.make("tree", "-L", "2", "-a"),
          Command.workingDirectory(config.projectDir),
          Command.string,
          Effect.catchAll((error) =>
            // Fallback if tree command is not available
            Effect.succeed(
              "(tree command may not available)" + error.message
            )
          ),
          Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
        )
    })
  })
)

/**
 * Context outputter implementation
 *
 * @category Layer
 * @since 1.0.0
 */
export const ContextOutputterLive = Layer.effect(
  ContextOutputter,
  Effect.gen(function* () {
    const config = yield* AgentConfig

    return ContextOutputter.of({
      output: (treeOutput) =>
        Effect.gen(function* () {
          const contextMessage = [
            `Operating in: ${config.projectDir}`,
            `File structure:`,
            treeOutput
          ].join("\n")

          const output: ContextOutput = {
            context: contextMessage
          }

          // Validate output structure
          yield* Schema.decode(ContextOutputSchema)(output).pipe(
            Effect.mapError((error) =>
              new AgentConfigError({
                reason: "Invalid context output structure",
                cause: error
              })
            )
          )

          // Output JSON to stdout for Claude to capture
          yield* Console.log("\n=== CONTEXT INJECTION ===")
          yield* Console.log(JSON.stringify(output, null, 2))
          yield* Console.log("=== END CONTEXT INJECTION ===\n")
        })
    })
  })
)

// ============================================================================
// Layer Composition
// ============================================================================

/**
 * Complete application layer with all dependencies
 *
 * @category Layer
 * @since 1.0.0
 *
 * Composition strategy:
 * - BunContext.layer provides FileSystem + CommandExecutor (+ Path, Terminal, Worker)
 * - AgentConfigLive needs no dependencies -> provides AgentConfig
 * - ProjectStructureCaptureLive needs AgentConfig + CommandExecutor -> provides ProjectStructureCapture
 */
export const AppLive = ProjectStructureCaptureLive.pipe(
  Layer.provideMerge(AgentConfigLive),
  Layer.provideMerge(BunContext.layer)
)

// ============================================================================
// Main Program
// ============================================================================

/**
 * Main program - orchestrates all initialization steps
 *
 * @category Program
 * @since 1.0.0
 */
const program = Effect.gen(function* () {

  const config = yield* AgentConfig
  const commandExecutor = yield* CommandExecutor.CommandExecutor

  // Capture project structure
  const structureCapture = yield* ProjectStructureCapture
  const treeOutput = yield* structureCapture.capture()

  // Get git status
  const gitStatus = yield* pipe(
    Command.make("git", "status", "--short"),
    Command.workingDirectory(config.projectDir),
    Command.string,
    Effect.catchAll(() => Effect.succeed("(not a git repository)")),
    Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
  )

  // Get recent commits (short form)
  const gitLog = yield* pipe(
    Command.make("git", "log", "--oneline", "-5"),
    Command.workingDirectory(config.projectDir),
    Command.string,
    Effect.catchAll(() => Effect.succeed("(no git history)")),
    Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
  )

  // Get recent commits with files changed
  const gitLogWithFiles = yield* pipe(
    Command.make("git", "log", "--name-status", "--pretty=format:%h %s", "-3"),
    Command.workingDirectory(config.projectDir),
    Command.string,
    Effect.catchAll(() => Effect.succeed("")),
    Effect.provideService(CommandExecutor.CommandExecutor, commandExecutor)
  )

  // Build context message
  const contextMessage = [
    `Operating in: ${config.projectDir}`,
    ``,
    `File structure:`,
    treeOutput,
    ``,
    ``,
    `Git status:`,
    gitStatus || "(clean)",
    ``,
    `Recent commits:`,
    gitLog || "(none)",
    ...(gitLogWithFiles ? [
      ``,
      `Recent changes (files):`,
      gitLogWithFiles
    ] : [])
  ].join("\n")

  // Output context
  yield* Console.log("\n=== CONTEXT INJECTION ===")
  yield* Console.log(contextMessage)
  yield* Console.log("=== END CONTEXT INJECTION ===\n")

})

/**
 * Runnable program with complete error handling and dependencies
 *
 * @category Runtime
 * @since 1.0.0
 */
const runnable = pipe(
  program,
  Effect.provide(AppLive),
  Effect.catchTags({
    AgentConfigError: (error) =>
      Console.error(`Configuration error: ${error.reason}`),
  }))

// ============================================================================
// Execution
// ============================================================================

// Execute the Effect program using BunRuntime
BunRuntime.runMain(runnable)
