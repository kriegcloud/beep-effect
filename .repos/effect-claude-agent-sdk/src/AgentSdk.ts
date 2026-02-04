import {
  createSdkMcpServer as sdkCreateSdkMcpServer,
  query as sdkQuery
} from "@anthropic-ai/claude-agent-sdk"
import * as Context from "effect/Context"
import * as Deferred from "effect/Deferred"
import * as Effect from "effect/Effect"
import * as Fiber from "effect/Fiber"
import * as Layer from "effect/Layer"
import type * as Scope from "effect/Scope"
import { AgentSdkConfig } from "./AgentSdkConfig.js"
import { McpError, TransportError } from "./Errors.js"
import { mergeOptions } from "./internal/options.js"
import { makeQueryHandle } from "./internal/queryHandle.js"
import { createInputQueue, pumpInput } from "./internal/streaming.js"
import type { Options } from "./Schema/Options.js"
import type { SDKUserMessage } from "./Schema/Message.js"
import type { McpSdkServerConfigWithInstance } from "./Schema/Mcp.js"
import type { QueryHandle } from "./Query.js"
import type { AgentSdkError } from "./Errors.js"

export type CreateSdkMcpServerOptions = {
  readonly name: string
  readonly version?: string
  readonly tools?: ReadonlyArray<unknown>
}

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
export class AgentSdk extends Context.Tag("@effect/claude-agent-sdk/AgentSdk")<
  AgentSdk,
  {
    readonly query: (
      prompt: string | AsyncIterable<SDKUserMessage>,
      options?: Options
    ) => Effect.Effect<QueryHandle, AgentSdkError, Scope.Scope>
    readonly createSdkMcpServer: (
      options: CreateSdkMcpServerOptions
    ) => Effect.Effect<McpSdkServerConfigWithInstance, AgentSdkError>
    readonly createSdkMcpServerScoped: (
      options: CreateSdkMcpServerOptions
    ) => Effect.Effect<McpSdkServerConfigWithInstance, AgentSdkError, Scope.Scope>
  }
>() {
  /**
   * Build the AgentSdk service using the provided AgentSdkConfig service.
   */
  static readonly layer = Layer.effect(
    AgentSdk,
    Effect.gen(function*() {
      const config = yield* AgentSdkConfig

      const query = Effect.fn("AgentSdk.query")(function*(
        prompt: string | AsyncIterable<SDKUserMessage>,
        options?: Options
      ) {
        const mergedOptions = mergeOptions(config.options, options)
        const isStreamingInput = typeof prompt !== "string"
        const inputQueue = isStreamingInput ? yield* createInputQueue() : undefined
        const inputFailure = inputQueue
          ? yield* Deferred.make<never, AgentSdkError>()
          : undefined
        const sdkPrompt = inputQueue ? inputQueue.input : prompt
        const sdkParams = {
          prompt: sdkPrompt,
          options: mergedOptions
        } as unknown as Parameters<typeof sdkQuery>[0]
        const sdkQueryInstance = yield* Effect.try({
          try: () => sdkQuery(sdkParams),
          catch: (cause) =>
            TransportError.make({
              message: "Failed to start SDK query",
              cause
            })
        })
        const pumpFiber = inputQueue
          ? yield* Effect.fork(
              pumpInput(inputQueue.queue, prompt as AsyncIterable<SDKUserMessage>).pipe(
                Effect.catchAll((error) =>
                  Deferred.fail(inputFailure!, error).pipe(
                    Effect.zipRight(
                      Effect.tryPromise({
                        try: () => sdkQueryInstance.interrupt(),
                        catch: () => undefined
                      }).pipe(Effect.ignore)
                    ),
                    Effect.asVoid
                  )
                )
              )
            )
          : undefined
        const closeInput = inputQueue
          ? Effect.gen(function*() {
              yield* inputQueue.closeInput
              if (pumpFiber) {
                yield* Fiber.interrupt(pumpFiber)
              }
            })
          : Effect.void
        const failureSignal = inputFailure ? Deferred.await(inputFailure) : undefined
        const handle = makeQueryHandle(sdkQueryInstance, inputQueue, closeInput, failureSignal)
        yield* Effect.addFinalizer(() =>
          Effect.all([handle.closeInput, handle.interrupt], {
            concurrency: "unbounded",
            discard: true
          }).pipe(Effect.ignore)
        )
        return handle
      })

      const createSdkMcpServer = Effect.fn("AgentSdk.createSdkMcpServer")(function*(
        options: CreateSdkMcpServerOptions
      ) {
        const sdkOptions = options as unknown as Parameters<typeof sdkCreateSdkMcpServer>[0]
        return yield* Effect.try({
          try: () => sdkCreateSdkMcpServer(sdkOptions),
          catch: (cause) =>
            McpError.make({
              message: "Failed to create SDK MCP server",
              cause
            })
        })
      })

      const closeSdkMcpServer = (server: McpSdkServerConfigWithInstance) =>
        Effect.tryPromise({
          try: async () => {
            const instance = server.instance as { close?: () => Promise<void> }
            if (instance?.close) {
              await instance.close()
            }
          },
          catch: (cause) =>
            McpError.make({
              message: "Failed to close SDK MCP server",
              cause
            })
        }).pipe(Effect.ignore)

      const createSdkMcpServerScoped = Effect.fn("AgentSdk.createSdkMcpServerScoped")(function*(
        options: CreateSdkMcpServerOptions
      ) {
        return yield* Effect.acquireRelease(
          createSdkMcpServer(options),
          closeSdkMcpServer
        )
      })

      return AgentSdk.of({
        query,
        createSdkMcpServer,
        createSdkMcpServerScoped
      })
    })
  )

  /**
   * Convenience layer that wires AgentSdkConfig from defaults.
   */
  static readonly layerDefault = AgentSdk.layer.pipe(Layer.provide(AgentSdkConfig.layer))

  /**
   * Convenience layer that reads AgentSdkConfig from environment variables.
   */
  static readonly layerDefaultFromEnv = (prefix = "AGENTSDK") =>
    AgentSdk.layer.pipe(Layer.provide(AgentSdkConfig.layerFromEnv(prefix)))
}
