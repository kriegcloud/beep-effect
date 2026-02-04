import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { TransportError } from "../Errors.js"
import type { AgentSdkError } from "../Errors.js"
import type { QueryHandle, StreamBroadcastConfig, StreamShareConfig } from "../Query.js"
import type {
  AccountInfo,
  ModelInfo,
  RewindFilesResult,
  SlashCommand
} from "../Schema/Common.js"
import type { McpServerConfig, McpServerStatus, McpSetServersResult } from "../Schema/Mcp.js"
import type { McpServerConfig as SdkMcpServerConfig } from "@anthropic-ai/claude-agent-sdk"
import type { SDKMessage, SDKUserMessage } from "../Schema/Message.js"
import type { PermissionMode } from "../Schema/Permission.js"
import type { InputQueue } from "./streaming.js"

export type SdkQueryLike = AsyncIterable<SDKMessage> & {
  interrupt: () => Promise<void>
  setPermissionMode: (mode: PermissionMode) => Promise<void>
  setModel: (model?: string) => Promise<void>
  setMaxThinkingTokens: (maxTokens: number | null) => Promise<void>
  rewindFiles: (userMessageUuid: string, options?: {
    readonly dryRun?: boolean
  }) => Promise<RewindFilesResult>
  supportedCommands: () => Promise<ReadonlyArray<SlashCommand>>
  supportedModels: () => Promise<ReadonlyArray<ModelInfo>>
  mcpServerStatus: () => Promise<ReadonlyArray<McpServerStatus>>
  setMcpServers: (servers: Record<string, SdkMcpServerConfig>) => Promise<McpSetServersResult>
  accountInfo: () => Promise<AccountInfo>
}

const toTransportError = (message: string, cause: unknown) =>
  TransportError.make({
    message,
    cause
  })

const sdkPromise = <A>(label: string, effect: () => Promise<A>) =>
  Effect.tryPromise({
    try: effect,
    catch: (cause) => toTransportError(label, cause)
  })

const inputUnavailable = <A>(label: string) =>
  Effect.fail(
    TransportError.make({
      message: label
    })
  )

export const makeQueryHandle = (
  sdkQueryInstance: SdkQueryLike,
  inputQueue?: InputQueue,
  closeInput: Effect.Effect<void, AgentSdkError> = Effect.void,
  failureSignal?: Effect.Effect<never, AgentSdkError>
): QueryHandle => {
  const baseStream = Stream.fromAsyncIterable(
    sdkQueryInstance,
    (cause) => toTransportError("SDK query stream failed", cause)
  )

  const streamWithFailure = failureSignal
    ? baseStream.pipe(Stream.interruptWhen(failureSignal))
    : baseStream

  const stream = streamWithFailure.pipe(Stream.ensuring(Effect.ignore(closeInput)))

  const send = inputQueue
    ? Effect.fn("QueryHandle.send")((message: SDKUserMessage) => inputQueue.send(message))
    : Effect.fn("QueryHandle.send")((_message: SDKUserMessage) =>
        inputUnavailable("Streaming input is not enabled for this query")
      )

  const sendAll = inputQueue
    ? Effect.fn("QueryHandle.sendAll")((messages: Iterable<SDKUserMessage>) =>
        inputQueue.sendAll(messages)
      )
    : Effect.fn("QueryHandle.sendAll")((_messages: Iterable<SDKUserMessage>) =>
        inputUnavailable("Streaming input is not enabled for this query")
      )

  const sendForked = inputQueue
    ? Effect.fn("QueryHandle.sendForked")((message: SDKUserMessage) =>
        Effect.forkScoped(inputQueue.send(message)).pipe(Effect.asVoid)
      )
    : Effect.fn("QueryHandle.sendForked")((_message: SDKUserMessage) =>
        inputUnavailable("Streaming input is not enabled for this query")
      )

  const closeInputEffect = inputQueue ? closeInput : Effect.void

  const defaultShareConfig: StreamShareConfig = {
    capacity: 16,
    strategy: "suspend"
  }
  const defaultBroadcastLag: StreamBroadcastConfig = 16

  const share = Effect.fn("QueryHandle.share")((config?: StreamShareConfig) =>
    Stream.share(stream, config ?? defaultShareConfig)
  )
  const broadcast = Effect.fn("QueryHandle.broadcast")(
    <N extends number>(n: N, maximumLag?: StreamBroadcastConfig) =>
      Stream.broadcast(stream, n, maximumLag ?? defaultBroadcastLag)
  )

  const interrupt = sdkPromise("Failed to interrupt SDK query", () =>
    sdkQueryInstance.interrupt()
  )
  const setPermissionMode = Effect.fn("QueryHandle.setPermissionMode")((mode: PermissionMode) =>
    sdkPromise("Failed to set permission mode", () => sdkQueryInstance.setPermissionMode(mode))
  )
  const setModel = Effect.fn("QueryHandle.setModel")((model?: string) =>
    sdkPromise("Failed to set model", () => sdkQueryInstance.setModel(model))
  )
  const setMaxThinkingTokens = Effect.fn("QueryHandle.setMaxThinkingTokens")(
    (maxTokens: number | null) =>
      sdkPromise("Failed to set max thinking tokens", () =>
        sdkQueryInstance.setMaxThinkingTokens(maxTokens)
      )
  )
  const rewindFiles = Effect.fn("QueryHandle.rewindFiles")(
    (userMessageUuid: string, options?: { dryRun?: boolean }) =>
      sdkPromise("Failed to rewind files", () =>
        sdkQueryInstance.rewindFiles(userMessageUuid, options)
      )
  )
  const supportedCommands = sdkPromise("Failed to load supported commands", () =>
    sdkQueryInstance.supportedCommands()
  )
  const supportedModels = sdkPromise("Failed to load supported models", () =>
    sdkQueryInstance.supportedModels()
  )
  const mcpServerStatus = sdkPromise("Failed to load MCP server status", () =>
    sdkQueryInstance.mcpServerStatus()
  )
  const setMcpServers = Effect.fn("QueryHandle.setMcpServers")(
    (servers: Record<string, McpServerConfig>) =>
      sdkPromise("Failed to set MCP servers", () =>
        sdkQueryInstance.setMcpServers(servers as Record<string, SdkMcpServerConfig>)
      )
  )
  const accountInfo = sdkPromise("Failed to load account info", () =>
    sdkQueryInstance.accountInfo()
  )

  return {
    stream,
    send,
    sendAll,
    sendForked,
    closeInput: closeInputEffect,
    share,
    broadcast,
    interrupt,
    setPermissionMode,
    setModel,
    setMaxThinkingTokens,
    rewindFiles,
    supportedCommands,
    supportedModels,
    mcpServerStatus,
    setMcpServers,
    accountInfo
  }
}
