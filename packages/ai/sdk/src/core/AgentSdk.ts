import { createSdkMcpServer as sdkCreateSdkMcpServer, query as sdkQuery } from "@anthropic-ai/claude-agent-sdk";
import { $AiSdkId } from "@beep/identity/packages";
import { Deferred, Effect, Fiber, Layer, ServiceMap } from "effect";
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
  readonly tools?: ReadonlyArray<unknown>;
};

const makeAgentSdk = Effect.gen(function* () {
  const config = yield* AgentSdkConfig;

  const query = Effect.fn("AgentSdk.query")(function* (
    prompt: string | AsyncIterable<SDKUserMessage>,
    options?: Options
  ) {
    const mergedOptions = mergeOptions(config.options, options);
    const isStreamingInput = !P.isString(prompt);
    const inputQueue = isStreamingInput ? yield* createInputQueue() : undefined;
    const inputFailure = inputQueue ? yield* Deferred.make<never, AgentSdkError>() : undefined;
    const sdkPrompt = inputQueue ? inputQueue.input : prompt;
    const sdkParams: Parameters<typeof sdkQuery>[0] = {
      prompt: sdkPrompt,
      options: mergedOptions,
    };
    const sdkQueryInstance = yield* Effect.try({
      try: () => sdkQuery(sdkParams),
      catch: (cause) => TransportError.make("Failed to start SDK query", cause),
    });
    const pumpFiber = inputQueue
      ? yield* Effect.forkDetach(
          pumpInput(inputQueue.queue, prompt as AsyncIterable<SDKUserMessage>).pipe(
            Effect.catch((error) =>
              Deferred.fail(inputFailure!, error).pipe(
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
        const instance = server.instance as { close?: () => Promise<void> };
        if (instance?.close) {
          await instance.close();
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
