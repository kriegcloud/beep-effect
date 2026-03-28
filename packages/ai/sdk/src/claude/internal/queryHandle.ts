import type { McpServerConfig as SdkMcpServerConfig, Query as SdkQuery } from "@anthropic-ai/claude-agent-sdk";
import { Effect, Stream } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { AgentSdkError } from "../Errors.js";
import { TransportError } from "../Errors.js";
import type { QueryHandle, StreamBroadcastConfig, StreamShareConfig } from "../Query.js";
import type { PermissionMode } from "../Schema/index.js";
import type { McpServerConfig } from "../Schema/Mcp.js";
import { SDKMessage as SDKMessageSchema, type SDKUserMessage } from "../Schema/Message.js";
import {
  normalizeAccountInfo,
  normalizeModelInfoList,
  normalizeRewindFilesResult,
  normalizeSlashCommandList,
} from "./normalize.js";
import type { InputQueue } from "./streaming.js";

/**
 * @since 0.0.0
 */
export type SdkQueryLike = SdkQuery;

const toTransportError = (message: string, cause: unknown) => TransportError.make(message, cause);

const sdkPromise = <A>(label: string, effect: () => Promise<A>) =>
  Effect.tryPromise({
    try: effect,
    catch: (cause) => toTransportError(label, cause),
  });

const inputUnavailable = (label: string) => Effect.fail(TransportError.make(label));

/**
 * @since 0.0.0
 */
export const makeQueryHandle = (
  sdkQueryInstance: SdkQueryLike,
  inputQueue?: InputQueue,
  closeInput: Effect.Effect<void, AgentSdkError> = Effect.void,
  failureSignal?: Effect.Effect<never, AgentSdkError>
): QueryHandle => {
  const decodeSdkMessage = S.decodeUnknownEffect(SDKMessageSchema);
  const baseStream = Stream.fromAsyncIterable(sdkQueryInstance, (cause) =>
    toTransportError("SDK query stream failed", cause)
  ).pipe(
    Stream.mapEffect((message) =>
      decodeSdkMessage(message).pipe(
        Effect.mapError((cause) => toTransportError("Failed to decode SDK message", cause))
      )
    )
  );

  const streamWithFailure =
    failureSignal === undefined ? baseStream : baseStream.pipe(Stream.interruptWhen(failureSignal));

  const stream = streamWithFailure.pipe(Stream.ensuring(Effect.ignore(closeInput)));

  const send =
    inputQueue === undefined
      ? Effect.fn("QueryHandle.send")((_message: SDKUserMessage) =>
          inputUnavailable("Streaming input is not enabled for this query")
        )
      : Effect.fn("QueryHandle.send")((message: SDKUserMessage) => inputQueue.send(message));

  const sendAll =
    inputQueue === undefined
      ? Effect.fn("QueryHandle.sendAll")((_messages: Iterable<SDKUserMessage>) =>
          inputUnavailable("Streaming input is not enabled for this query")
        )
      : Effect.fn("QueryHandle.sendAll")((messages: Iterable<SDKUserMessage>) => inputQueue.sendAll(messages));

  const sendForked =
    inputQueue === undefined
      ? Effect.fn("QueryHandle.sendForked")((_message: SDKUserMessage) =>
          inputUnavailable("Streaming input is not enabled for this query")
        )
      : Effect.fn("QueryHandle.sendForked")((message: SDKUserMessage) =>
          Effect.forkScoped(inputQueue.send(message)).pipe(Effect.asVoid)
        );

  const closeInputEffect = inputQueue === undefined ? Effect.void : closeInput;

  const defaultShareConfig: StreamShareConfig = {
    capacity: 16,
    strategy: "suspend",
  };
  const defaultBroadcastConfig: StreamBroadcastConfig = 16;

  const share = Effect.fn("QueryHandle.share")((config?: StreamShareConfig) =>
    Stream.share(stream, config ?? defaultShareConfig)
  );
  const broadcast = (config?: StreamBroadcastConfig) => {
    const resolved = config ?? defaultBroadcastConfig;
    if (P.isNumber(resolved)) {
      return Stream.broadcast(stream, { capacity: resolved });
    }
    return Stream.broadcast(stream, resolved);
  };

  const interrupt = sdkPromise("Failed to interrupt SDK query", () => sdkQueryInstance.interrupt());
  const setPermissionMode = Effect.fn("QueryHandle.setPermissionMode")((mode: PermissionMode) =>
    mode === "delegate"
      ? Effect.fail(
          TransportError.make("Permission mode 'delegate' is not supported by the installed Claude Agent SDK")
        )
      : sdkPromise("Failed to set permission mode", () => sdkQueryInstance.setPermissionMode(mode))
  );
  const setModel = Effect.fn("QueryHandle.setModel")((model?: string) =>
    sdkPromise("Failed to set model", () => sdkQueryInstance.setModel(model))
  );
  const setMaxThinkingTokens = Effect.fn("QueryHandle.setMaxThinkingTokens")((maxTokens: number | null) =>
    sdkPromise("Failed to set max thinking tokens", () => sdkQueryInstance.setMaxThinkingTokens(maxTokens))
  );
  const rewindFiles = Effect.fn("QueryHandle.rewindFiles")(
    (userMessageUuid: string, options?: { readonly dryRun?: undefined | boolean }) => {
      const sdkOptions = options?.dryRun === undefined ? undefined : { dryRun: options.dryRun };
      return sdkPromise("Failed to rewind files", () => sdkQueryInstance.rewindFiles(userMessageUuid, sdkOptions)).pipe(
        Effect.flatMap(normalizeRewindFilesResult)
      );
    }
  );
  const supportedCommands = sdkPromise("Failed to load supported commands", () =>
    sdkQueryInstance.supportedCommands()
  ).pipe(Effect.flatMap(normalizeSlashCommandList));
  const supportedModels = sdkPromise("Failed to load supported models", () => sdkQueryInstance.supportedModels()).pipe(
    Effect.flatMap(normalizeModelInfoList)
  );
  const mcpServerStatus = sdkPromise("Failed to load MCP server status", () => sdkQueryInstance.mcpServerStatus());
  const setMcpServers = Effect.fn("QueryHandle.setMcpServers")((servers: Record<string, McpServerConfig>) =>
    sdkPromise("Failed to set MCP servers", () =>
      sdkQueryInstance.setMcpServers(servers as Record<string, SdkMcpServerConfig>)
    )
  );
  const accountInfo = sdkPromise("Failed to load account info", () => sdkQueryInstance.accountInfo()).pipe(
    Effect.flatMap(normalizeAccountInfo)
  );
  const initializationResult = sdkPromise("Failed to load initialization result", () =>
    sdkQueryInstance.initializationResult()
  );
  const stopTask = Effect.fn("QueryHandle.stopTask")((taskId: string) =>
    sdkPromise("Failed to stop task", () => sdkQueryInstance.stopTask(taskId))
  );

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
    accountInfo,
    initializationResult,
    stopTask,
  };
};
