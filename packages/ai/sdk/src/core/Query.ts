import type * as Duration from "effect/Duration"
import type * as Effect from "effect/Effect"
import type * as Fiber from "effect/Fiber"
import type * as Scope from "effect/Scope"
import type * as Stream from "effect/Stream"
import type * as Types from "effect/Types"
import type { AgentSdkError } from "./Errors.js"
import type {
  AccountInfo,
  ModelInfo,
  RewindFilesResult,
  SlashCommand
} from "./Schema/Common.js"
import type {
  McpServerConfig,
  McpServerStatus,
  McpSetServersResult
} from "./Schema/Mcp.js"
import type { SDKMessage, SDKUserMessage } from "./Schema/Message.js"
import type { PermissionMode } from "./Schema/Permission.js"

/**
 * Configuration for sharing a single query stream across multiple consumers.
 */
export type StreamShareConfig =
  | {
      readonly capacity: "unbounded"
      readonly replay?: number
      readonly idleTimeToLive?: Duration.DurationInput
    }
  | {
      readonly capacity: number
      readonly strategy?: "sliding" | "dropping" | "suspend"
      readonly replay?: number
      readonly idleTimeToLive?: Duration.DurationInput
    }

/**
 * Configuration for broadcasting a query stream to multiple consumers.
 */
export type StreamBroadcastConfig =
  | number
  | {
      readonly capacity: "unbounded"
      readonly replay?: number
    }
  | {
      readonly capacity: number
      readonly strategy?: "sliding" | "dropping" | "suspend"
      readonly replay?: number
    }

/**
 * Handle returned by AgentSdk.query. Provides the output stream and input controls.
 */
export interface QueryHandle {
  /**
   * Stream of SDK messages produced by the query.
   * This stream is single-use unless you `share` or `broadcast` it.
   */
  readonly stream: Stream.Stream<SDKMessage, AgentSdkError>
  /**
   * Send a single user message into the streaming prompt (if enabled).
   */
  readonly send: (message: SDKUserMessage) => Effect.Effect<void, AgentSdkError>
  /**
   * Send multiple user messages into the streaming prompt (if enabled).
   */
  readonly sendAll: (messages: Iterable<SDKUserMessage>) => Effect.Effect<void, AgentSdkError>
  /**
   * Fire-and-forget send scoped to the current fiber.
   */
  readonly sendForked: (message: SDKUserMessage) => Effect.Effect<
    void,
    AgentSdkError,
    Scope.Scope
  >
  /**
   * Close the streaming input and stop accepting new messages.
   */
  readonly closeInput: Effect.Effect<void, AgentSdkError>
  /**
   * Share the output stream across multiple consumers in a scope.
   */
  readonly share: (
    config?: StreamShareConfig
  ) => Effect.Effect<Stream.Stream<SDKMessage, AgentSdkError>, never, Scope.Scope>
  /**
   * Broadcast the output stream to N consumers in a scope.
   */
  readonly broadcast: <N extends number>(
    n: N,
    maximumLag?: StreamBroadcastConfig
  ) => Effect.Effect<Types.TupleOf<N, Stream.Stream<SDKMessage, AgentSdkError>>, never, Scope.Scope>
  /**
   * Interrupt the underlying SDK query process.
   */
  readonly interrupt: Effect.Effect<void, AgentSdkError>
  /**
   * Update the permission mode for the running query.
   */
  readonly setPermissionMode: (mode: PermissionMode) => Effect.Effect<void, AgentSdkError>
  /**
   * Override the model for the running query.
   */
  readonly setModel: (model?: string) => Effect.Effect<void, AgentSdkError>
  /**
   * Adjust max thinking tokens for the running query.
   */
  readonly setMaxThinkingTokens: (maxTokens: number | null) => Effect.Effect<void, AgentSdkError>
  /**
   * Rewind the workspace to a prior user message.
   */
  readonly rewindFiles: (userMessageUuid: string, options?: {
    readonly dryRun?: boolean
  }) => Effect.Effect<RewindFilesResult, AgentSdkError>
  /**
   * Fetch supported slash commands.
   */
  readonly supportedCommands: Effect.Effect<ReadonlyArray<SlashCommand>, AgentSdkError>
  /**
   * Fetch supported models.
   */
  readonly supportedModels: Effect.Effect<ReadonlyArray<ModelInfo>, AgentSdkError>
  /**
   * Fetch MCP server status for the running query.
   */
  readonly mcpServerStatus: Effect.Effect<ReadonlyArray<McpServerStatus>, AgentSdkError>
  /**
   * Update MCP server configuration for the running query.
   */
  readonly setMcpServers: (servers: Record<string, McpServerConfig>) => Effect.Effect<
    McpSetServersResult,
    AgentSdkError
  >
  /**
   * Fetch account info for the running query.
   */
  readonly accountInfo: Effect.Effect<AccountInfo, AgentSdkError>
  /**
   * Get the full initialization result including commands, models, account info,
   * and output style configuration.
   */
  readonly initializationResult: Effect.Effect<{
    readonly commands: ReadonlyArray<SlashCommand>
    readonly output_style: string
    readonly available_output_styles: ReadonlyArray<string>
    readonly models: ReadonlyArray<ModelInfo>
    readonly account: AccountInfo
  }, AgentSdkError>
  /**
   * Stop a running task by its ID.
   */
  readonly stopTask: (taskId: string) => Effect.Effect<void, AgentSdkError>
}
