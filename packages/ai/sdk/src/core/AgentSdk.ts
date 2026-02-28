import {
  type Options as SdkOptions,
  type SDKUserMessage as SdkSDKUserMessage,
  createSdkMcpServer as sdkCreateSdkMcpServer,
  query as sdkQuery,
} from "@anthropic-ai/claude-agent-sdk";
import { $AiSdkId } from "@beep/identity/packages";
import { Deferred, Effect, Fiber, Layer, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import { AgentSdkConfig } from "./AgentSdkConfig.js";
import type { AgentSdkError } from "./Errors.js";
import { McpError, TransportError } from "./Errors.js";
import { mergeOptions } from "./internal/options.js";
import { makeQueryHandle } from "./internal/queryHandle.js";
import { createInputQueue, pumpInput } from "./internal/streaming.js";
import type { McpSdkServerConfigWithInstance } from "./Schema/Mcp.js";
import type { SDKUserMessage } from "./Schema/Message.js";
import type { Options } from "./Schema/Options.js";

const $I = $AiSdkId.create("core/AgentSdk");

/**
 * @since 0.0.0
 */
export type CreateSdkMcpServerOptions = {
  readonly name: string;
  readonly version?: string;
  readonly tools?: Parameters<typeof sdkCreateSdkMcpServer>[0]["tools"];
};

type SdkUuid = NonNullable<SdkSDKUserMessage["uuid"]>;
type SourceMcpServers = NonNullable<Options["mcpServers"]>;
type SdkMcpServers = NonNullable<SdkOptions["mcpServers"]>;
type SourceAgents = NonNullable<Options["agents"]>;
type SourceAgent = SourceAgents[string];
type SdkAgents = NonNullable<SdkOptions["agents"]>;
type SdkAgent = SdkAgents[string];
type SourceAgentMcpServerRecord = Exclude<NonNullable<SourceAgent["mcpServers"]>, ReadonlyArray<string>>;
type SourceAgentMcpServer = SourceAgentMcpServerRecord[string];
type SdkAgentMcpSpecs = NonNullable<SdkAgent["mcpServers"]>;
type SdkAgentMcpSpec = SdkAgentMcpSpecs[number];
type SdkAgentMcpServerRecord = Extract<SdkAgentMcpSpec, Record<string, unknown>>;
type SdkAgentMcpServer = SdkAgentMcpServerRecord[string];
type SourceSandbox = NonNullable<Options["sandbox"]>;
type SdkSandbox = NonNullable<SdkOptions["sandbox"]>;

const sdkUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isSdkUuid = (value: string): value is SdkUuid => sdkUuidPattern.test(value);
const toMutableArray = <Value>(input: ReadonlyArray<Value>): Array<Value> => A.fromIterable(input);
const toStringRecord = (input: Readonly<Record<string, string>>): Record<string, string> => {
  const output: Record<string, string> = {};
  for (const key in input) {
    output[key] = input[key];
  }
  return output;
};
const toStringOrUndefinedRecord = (
  input: Readonly<Record<string, string | undefined>>
): Record<string, string | undefined> => {
  const output: Record<string, string | undefined> = {};
  for (const key in input) {
    output[key] = input[key];
  }
  return output;
};
const toStringOrNullRecord = (input: Readonly<Record<string, string | null>>): Record<string, string | null> => {
  const output: Record<string, string | null> = {};
  for (const key in input) {
    output[key] = input[key];
  }
  return output;
};
const toUnknownRecord = (input: Readonly<Record<string, unknown>>): Record<string, unknown> => {
  const output: Record<string, unknown> = {};
  for (const key in input) {
    output[key] = input[key];
  }
  return output;
};

const toSdkMcpServer = (server: SourceMcpServers[string]): SdkMcpServers[string] | undefined => {
  if (P.hasProperty(server, "type") && server.type === "sse") {
    return {
      type: "sse",
      url: server.url,
      ...(server.headers !== undefined ? { headers: toStringRecord(server.headers) } : {}),
    };
  }
  if (P.hasProperty(server, "type") && server.type === "http") {
    return {
      type: "http",
      url: server.url,
      ...(server.headers !== undefined ? { headers: toStringRecord(server.headers) } : {}),
    };
  }
  if (P.hasProperty(server, "type") && server.type === "sdk") {
    return undefined;
  }
  return {
    ...(P.hasProperty(server, "type") && server.type !== undefined ? { type: server.type } : {}),
    command: server.command,
    ...(server.args !== undefined ? { args: toMutableArray(server.args) } : {}),
    ...(server.env !== undefined ? { env: toStringRecord(server.env) } : {}),
  };
};
const toSdkAgentMcpServer = (server: SourceAgentMcpServer): SdkAgentMcpServer => {
  if (P.hasProperty(server, "type") && server.type === "sse") {
    return {
      type: "sse",
      url: server.url,
      ...(server.headers !== undefined ? { headers: toStringRecord(server.headers) } : {}),
    };
  }
  if (P.hasProperty(server, "type") && server.type === "http") {
    return {
      type: "http",
      url: server.url,
      ...(server.headers !== undefined ? { headers: toStringRecord(server.headers) } : {}),
    };
  }
  if (P.hasProperty(server, "type") && server.type === "sdk") {
    return {
      type: "sdk",
      name: server.name,
    };
  }
  return {
    ...(P.hasProperty(server, "type") && server.type !== undefined ? { type: server.type } : {}),
    command: server.command,
    ...(server.args !== undefined ? { args: toMutableArray(server.args) } : {}),
    ...(server.env !== undefined ? { env: toStringRecord(server.env) } : {}),
  };
};

const toSdkSandbox = (sandbox: SourceSandbox): SdkSandbox => {
  const mapped: SdkSandbox = {};
  if (sandbox.enabled !== undefined) {
    mapped.enabled = sandbox.enabled;
  }
  if (sandbox.autoAllowBashIfSandboxed !== undefined) {
    mapped.autoAllowBashIfSandboxed = sandbox.autoAllowBashIfSandboxed;
  }
  if (sandbox.allowUnsandboxedCommands !== undefined) {
    mapped.allowUnsandboxedCommands = sandbox.allowUnsandboxedCommands;
  }
  if (sandbox.network !== undefined) {
    const network: NonNullable<SdkSandbox["network"]> = {};
    if (sandbox.network.allowedDomains !== undefined) {
      network.allowedDomains = toMutableArray(sandbox.network.allowedDomains);
    }
    if (sandbox.network.allowManagedDomainsOnly !== undefined) {
      network.allowManagedDomainsOnly = sandbox.network.allowManagedDomainsOnly;
    }
    if (sandbox.network.allowUnixSockets !== undefined) {
      network.allowUnixSockets = toMutableArray(sandbox.network.allowUnixSockets);
    }
    if (sandbox.network.allowAllUnixSockets !== undefined) {
      network.allowAllUnixSockets = sandbox.network.allowAllUnixSockets;
    }
    if (sandbox.network.allowLocalBinding !== undefined) {
      network.allowLocalBinding = sandbox.network.allowLocalBinding;
    }
    if (sandbox.network.httpProxyPort !== undefined) {
      network.httpProxyPort = sandbox.network.httpProxyPort;
    }
    if (sandbox.network.socksProxyPort !== undefined) {
      network.socksProxyPort = sandbox.network.socksProxyPort;
    }
    mapped.network = network;
  }
  if (sandbox.filesystem !== undefined) {
    const filesystem: NonNullable<SdkSandbox["filesystem"]> = {};
    if (sandbox.filesystem.allowWrite !== undefined) {
      filesystem.allowWrite = toMutableArray(sandbox.filesystem.allowWrite);
    }
    if (sandbox.filesystem.denyWrite !== undefined) {
      filesystem.denyWrite = toMutableArray(sandbox.filesystem.denyWrite);
    }
    if (sandbox.filesystem.denyRead !== undefined) {
      filesystem.denyRead = toMutableArray(sandbox.filesystem.denyRead);
    }
    mapped.filesystem = filesystem;
  }
  if (sandbox.ignoreViolations !== undefined) {
    const ignoreViolations: NonNullable<SdkSandbox["ignoreViolations"]> = {};
    for (const key in sandbox.ignoreViolations) {
      ignoreViolations[key] = toMutableArray(sandbox.ignoreViolations[key]);
    }
    mapped.ignoreViolations = ignoreViolations;
  }
  if (sandbox.enableWeakerNestedSandbox !== undefined) {
    mapped.enableWeakerNestedSandbox = sandbox.enableWeakerNestedSandbox;
  }
  if (sandbox.excludedCommands !== undefined) {
    mapped.excludedCommands = toMutableArray(sandbox.excludedCommands);
  }
  if (sandbox.ripgrep !== undefined) {
    mapped.ripgrep = {
      command: sandbox.ripgrep.command,
      ...(sandbox.ripgrep.args !== undefined ? { args: toMutableArray(sandbox.ripgrep.args) } : {}),
    };
  }
  return mapped;
};

const isAgentMcpServerRecord = (value: SourceAgent["mcpServers"] | undefined): value is SourceAgentMcpServerRecord =>
  value !== undefined && !A.isArray(value);

const toSdkOptions = (options: Options): SdkOptions => {
  const sdkOptions: SdkOptions = {};
  if (options.abortController instanceof globalThis.AbortController) {
    sdkOptions.abortController = options.abortController;
  }
  if (options.additionalDirectories !== undefined) {
    sdkOptions.additionalDirectories = toMutableArray(options.additionalDirectories);
  }
  if (options.agent !== undefined) {
    sdkOptions.agent = options.agent;
  }
  if (options.agents !== undefined) {
    const agents: SdkAgents = {};
    for (const name in options.agents) {
      const sourceAgent = options.agents[name];
      const agent: SdkAgent = {
        description: sourceAgent.description,
        prompt: sourceAgent.prompt,
      };
      if (sourceAgent.tools !== undefined) {
        agent.tools = toMutableArray(sourceAgent.tools);
      }
      if (sourceAgent.disallowedTools !== undefined) {
        agent.disallowedTools = toMutableArray(sourceAgent.disallowedTools);
      }
      if (sourceAgent.model !== undefined) {
        agent.model = sourceAgent.model;
      }
      if (isAgentMcpServerRecord(sourceAgent.mcpServers)) {
        const mcpServers: SdkAgentMcpServerRecord = {};
        for (const serverName in sourceAgent.mcpServers) {
          mcpServers[serverName] = toSdkAgentMcpServer(sourceAgent.mcpServers[serverName]);
        }
        agent.mcpServers = [mcpServers];
      } else if (sourceAgent.mcpServers !== undefined) {
        agent.mcpServers = toMutableArray(sourceAgent.mcpServers);
      }
      if (sourceAgent.criticalSystemReminder_EXPERIMENTAL !== undefined) {
        agent.criticalSystemReminder_EXPERIMENTAL = sourceAgent.criticalSystemReminder_EXPERIMENTAL;
      }
      if (sourceAgent.skills !== undefined) {
        agent.skills = toMutableArray(sourceAgent.skills);
      }
      if (sourceAgent.maxTurns !== undefined) {
        agent.maxTurns = sourceAgent.maxTurns;
      }
      agents[name] = agent;
    }
    sdkOptions.agents = agents;
  }
  if (options.allowDangerouslySkipPermissions !== undefined) {
    sdkOptions.allowDangerouslySkipPermissions = options.allowDangerouslySkipPermissions;
  }
  if (options.allowedTools !== undefined) {
    sdkOptions.allowedTools = toMutableArray(options.allowedTools);
  }
  if (options.betas !== undefined) {
    sdkOptions.betas = toMutableArray(options.betas);
  }
  if (options.continue !== undefined) {
    sdkOptions.continue = options.continue;
  }
  if (options.cwd !== undefined) {
    sdkOptions.cwd = options.cwd;
  }
  if (options.debug !== undefined) {
    sdkOptions.debug = options.debug;
  }
  if (options.debugFile !== undefined) {
    sdkOptions.debugFile = options.debugFile;
  }
  if (options.disallowedTools !== undefined) {
    sdkOptions.disallowedTools = toMutableArray(options.disallowedTools);
  }
  if (options.effort !== undefined) {
    sdkOptions.effort = options.effort;
  }
  if (options.enableFileCheckpointing !== undefined) {
    sdkOptions.enableFileCheckpointing = options.enableFileCheckpointing;
  }
  if (options.env !== undefined) {
    sdkOptions.env = toStringOrUndefinedRecord(options.env);
  }
  if (options.executable !== undefined) {
    sdkOptions.executable = options.executable;
  }
  if (options.executableArgs !== undefined) {
    sdkOptions.executableArgs = toMutableArray(options.executableArgs);
  }
  if (options.extraArgs !== undefined) {
    sdkOptions.extraArgs = toStringOrNullRecord(options.extraArgs);
  }
  if (options.fallbackModel !== undefined) {
    sdkOptions.fallbackModel = options.fallbackModel;
  }
  if (options.forkSession !== undefined) {
    sdkOptions.forkSession = options.forkSession;
  }
  if (options.includePartialMessages !== undefined) {
    sdkOptions.includePartialMessages = options.includePartialMessages;
  }
  if (options.maxBudgetUsd !== undefined) {
    sdkOptions.maxBudgetUsd = options.maxBudgetUsd;
  }
  if (options.maxTurns !== undefined) {
    sdkOptions.maxTurns = options.maxTurns;
  }
  if (options.mcpServers !== undefined) {
    const mcpServers: SdkMcpServers = {};
    for (const name in options.mcpServers) {
      const mappedServer = toSdkMcpServer(options.mcpServers[name]);
      if (mappedServer !== undefined) {
        mcpServers[name] = mappedServer;
      }
    }
    sdkOptions.mcpServers = mcpServers;
  }
  if (options.model !== undefined) {
    sdkOptions.model = options.model;
  }
  if (options.outputFormat !== undefined) {
    sdkOptions.outputFormat = {
      type: "json_schema",
      schema: toUnknownRecord(options.outputFormat.schema),
    };
  }
  if (options.pathToClaudeCodeExecutable !== undefined) {
    sdkOptions.pathToClaudeCodeExecutable = options.pathToClaudeCodeExecutable;
  }
  if (options.permissionMode !== undefined && options.permissionMode !== "delegate") {
    sdkOptions.permissionMode = options.permissionMode;
  }
  if (options.permissionPromptToolName !== undefined) {
    sdkOptions.permissionPromptToolName = options.permissionPromptToolName;
  }
  if (options.persistSession !== undefined) {
    sdkOptions.persistSession = options.persistSession;
  }
  if (options.plugins !== undefined) {
    sdkOptions.plugins = toMutableArray(options.plugins).map((plugin) => ({
      type: plugin.type,
      path: plugin.path,
    }));
  }
  if (options.resume !== undefined) {
    sdkOptions.resume = options.resume;
  }
  if (options.resumeSessionAt !== undefined) {
    sdkOptions.resumeSessionAt = options.resumeSessionAt;
  }
  if (options.sandbox !== undefined) {
    sdkOptions.sandbox = toSdkSandbox(options.sandbox);
  }
  if (options.sessionId !== undefined) {
    sdkOptions.sessionId = options.sessionId;
  }
  if (options.settingSources !== undefined) {
    sdkOptions.settingSources = toMutableArray(options.settingSources);
  }
  if (options.stderr !== undefined) {
    sdkOptions.stderr = options.stderr;
  }
  if (options.strictMcpConfig !== undefined) {
    sdkOptions.strictMcpConfig = options.strictMcpConfig;
  }
  if (options.systemPrompt !== undefined) {
    if (P.isString(options.systemPrompt)) {
      sdkOptions.systemPrompt = options.systemPrompt;
    } else {
      sdkOptions.systemPrompt = {
        type: "preset",
        preset: "claude_code",
        ...(options.systemPrompt.append !== undefined ? { append: options.systemPrompt.append } : {}),
      };
    }
  }
  if (options.thinking !== undefined) {
    if (options.thinking.type === "adaptive") {
      sdkOptions.thinking = { type: "adaptive" };
    } else if (options.thinking.type === "enabled") {
      sdkOptions.thinking = { type: "enabled", budgetTokens: options.thinking.budgetTokens };
    } else {
      sdkOptions.thinking = { type: "disabled" };
    }
  }
  if (options.tools !== undefined) {
    if (A.isArray(options.tools)) {
      sdkOptions.tools = A.filter(options.tools, P.isString);
    } else {
      sdkOptions.tools = { type: "preset", preset: "claude_code" };
    }
  }
  return sdkOptions;
};

const normalizeUserMessage = (message: SDKUserMessage): SdkSDKUserMessage => {
  const normalized: SdkSDKUserMessage = {
    type: "user",
    parent_tool_use_id: message.parent_tool_use_id,
    message: message.message,
    session_id: message.session_id,
  };
  if (message.isSynthetic !== undefined) {
    normalized.isSynthetic = message.isSynthetic;
  }
  if (message.tool_use_result !== undefined) {
    normalized.tool_use_result = message.tool_use_result;
  }
  if (message.uuid !== undefined && isSdkUuid(message.uuid)) {
    normalized.uuid = message.uuid;
  }
  return normalized;
};

const toSdkPrompt = (prompt: string | AsyncIterable<SDKUserMessage>): string | AsyncIterable<SdkSDKUserMessage> => {
  if (P.isString(prompt)) {
    return prompt;
  }
  return {
    async *[Symbol.asyncIterator]() {
      for await (const message of prompt) {
        yield normalizeUserMessage(message);
      }
    },
  };
};

const makeAgentSdk = Effect.gen(function* () {
  const config = yield* AgentSdkConfig;

  const query = Effect.fn("AgentSdk.query")(function* (
    prompt: string | AsyncIterable<SDKUserMessage>,
    options?: Options
  ) {
    const mergedOptions = mergeOptions(config.options, options);
    const promptStream = P.isString(prompt) ? undefined : prompt;
    const inputQueue = promptStream ? yield* createInputQueue() : undefined;
    const inputFailure = inputQueue ? yield* Deferred.make<never, AgentSdkError>() : undefined;
    const sdkPrompt = toSdkPrompt(inputQueue ? inputQueue.input : prompt);
    const sdkOptions = toSdkOptions(mergedOptions);
    const sdkParams: Parameters<typeof sdkQuery>[0] = {
      prompt: sdkPrompt,
      options: sdkOptions,
    };
    const sdkQueryInstance = yield* Effect.try({
      try: () => sdkQuery(sdkParams),
      catch: (cause) => TransportError.make("Failed to start SDK query", cause),
    });
    const pumpFiber =
      inputQueue && promptStream && inputFailure
        ? yield* Effect.forkDetach(
            pumpInput(inputQueue.queue, promptStream).pipe(
              Effect.catch((error) =>
                Deferred.fail(inputFailure, error).pipe(
                  Effect.andThen(
                    Effect.tryPromise({
                      try: () => sdkQueryInstance.interrupt(),
                      catch: () => undefined,
                    }).pipe(Effect.ignore)
                  ),
                  Effect.asVoid
                )
              )
            )
          )
        : undefined;
    const closeInput = inputQueue
      ? Effect.gen(function* () {
          yield* inputQueue.closeInput;
          if (pumpFiber) {
            yield* Fiber.interrupt(pumpFiber);
          }
        })
      : Effect.void;
    const failureSignal = inputFailure ? Deferred.await(inputFailure) : undefined;
    const handle = makeQueryHandle(sdkQueryInstance, inputQueue, closeInput, failureSignal);
    yield* Effect.addFinalizer(() =>
      Effect.all([handle.closeInput, handle.interrupt], {
        concurrency: "unbounded",
        discard: true,
      }).pipe(Effect.ignore)
    );
    return handle;
  });

  const createSdkMcpServer = Effect.fn("AgentSdk.createSdkMcpServer")(function* (options: CreateSdkMcpServerOptions) {
    const sdkOptions: Parameters<typeof sdkCreateSdkMcpServer>[0] = {
      name: options.name,
      ...(options.version !== undefined ? { version: options.version } : {}),
      ...(options.tools !== undefined ? { tools: options.tools } : {}),
    };
    return yield* Effect.try({
      try: () => sdkCreateSdkMcpServer(sdkOptions),
      catch: (cause) =>
        McpError.make({
          message: "Failed to create SDK MCP server",
          cause,
        }),
    });
  });

  const closeSdkMcpServer = (server: McpSdkServerConfigWithInstance) =>
    Effect.tryPromise({
      try: async () => {
        if (P.hasProperty(server.instance, "close") && P.isFunction(server.instance.close)) {
          await server.instance.close();
        }
      },
      catch: (cause) =>
        McpError.make({
          message: "Failed to close SDK MCP server",
          cause,
        }),
    }).pipe(Effect.ignore);

  const createSdkMcpServerScoped = Effect.fn("AgentSdk.createSdkMcpServerScoped")(function* (
    options: CreateSdkMcpServerOptions
  ) {
    return yield* Effect.acquireRelease(createSdkMcpServer(options), closeSdkMcpServer);
  });

  return {
    query,
    createSdkMcpServer,
    createSdkMcpServerScoped,
  };
});

/**
 * @since 0.0.0
 */
export interface AgentSdkShape extends Effect.Success<typeof makeAgentSdk> {}

/**
 * Effect service wrapper around `@anthropic-ai/claude-agent-sdk`.
 *
 * Access the service with `yield* AgentSdk` and call `query` or
 * `createSdkMcpServer` inside an Effect program.
 *
 * @example
 * const program = Effect.scoped(
 *   Effect.gen(function*() {
 *     const sdk = yield* AgentSdk
 *     const handle = yield* sdk.query("Hello")
 *     return yield* Stream.runCollect(handle.stream)
 *   }).pipe(Effect.provide(AgentSdk.layerDefault))
 * )
 */
/**
 * @since 0.0.0
 */
export class AgentSdk extends ServiceMap.Service<AgentSdk, AgentSdkShape>()($I`AgentSdk`) {
  /**
   * Build the AgentSdk service using the provided AgentSdkConfig service.
   */
  static readonly layer = Layer.effect(AgentSdk, makeAgentSdk);

  /**
   * Convenience layer that wires AgentSdkConfig from defaults.
   */
  static readonly layerDefault = AgentSdk.layer.pipe(Layer.provide(AgentSdkConfig.layer));

  /**
   * Convenience layer that reads AgentSdkConfig from environment variables.
   */
  static readonly layerDefaultFromEnv = (prefix = "AGENTSDK") =>
    AgentSdk.layer.pipe(Layer.provide(AgentSdkConfig.layerFromEnv(prefix)));
}
