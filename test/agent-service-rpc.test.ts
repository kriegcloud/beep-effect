import { expect, test } from "bun:test"
import * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientError from "@effect/platform/HttpClientError"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import * as HttpServer from "@effect/platform/HttpServer"
import { RpcClient, RpcSerialization, RpcServer } from "@effect/rpc"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"
import { AgentRuntime } from "../src/AgentRuntime.js"
import type { QueryHandle } from "../src/Query.js"
import type { SDKMessage } from "../src/Schema/Message.js"
import { AgentRpcs } from "../src/service/AgentRpcs.js"
import { layer as AgentRpcHandlers } from "../src/service/AgentRpcHandlers.js"
import { runEffect } from "./effect-test.js"

const makeSuccessMessage = (result: string): SDKMessage => ({
  type: "result",
  subtype: "success",
  duration_ms: 1,
  duration_api_ms: 1,
  is_error: false,
  num_turns: 1,
  result,
  total_cost_usd: 0,
  usage: {},
  modelUsage: {},
  permission_denials: [],
  uuid: "00000000-0000-0000-0000-000000000000",
  session_id: "session-1"
})

const toRequestInit = (
  request: HttpClientRequest.HttpClientRequest,
  signal: AbortSignal
): RequestInit => {
  const init: RequestInit = {
    method: request.method,
    headers: request.headers,
    signal
  }

  const body = request.body
  if (typeof body === "object" && body !== null && "_tag" in body) {
    const tagged = body as {
      readonly _tag: string
      readonly body?: unknown
      readonly formData?: FormData
      readonly stream?: Stream.Stream<Uint8Array>
    }
    switch (tagged._tag) {
      case "Empty":
        return init
      case "Uint8Array":
        init.body = tagged.body as BodyInit
        return init
      case "Raw":
        init.body = tagged.body as BodyInit
        if (typeof ReadableStream !== "undefined" && tagged.body instanceof ReadableStream) {
          ;(init as { duplex?: "half" }).duplex = "half"
        }
        return init
      case "FormData":
        if (tagged.formData) {
          init.body = tagged.formData
        }
        return init
      case "Stream":
        if (tagged.stream) {
          init.body = Stream.toReadableStream(tagged.stream)
          ;(init as { duplex?: "half" }).duplex = "half"
        }
        return init
    }
  }

  if (body instanceof Uint8Array || typeof body === "string") {
    init.body = body as BodyInit
    return init
  }

  if (typeof FormData !== "undefined" && body instanceof FormData) {
    init.body = body
    return init
  }

  return init
}

const makeWebHandlerClient = (handler: (request: Request) => Promise<Response>) =>
  HttpClient.make((request, url, signal) =>
    Effect.tryPromise({
      try: async () => {
        const response = await handler(new Request(url.toString(), toRequestInit(request, signal)))
        return HttpClientResponse.fromWeb(request, response)
      },
      catch: (cause) =>
        new HttpClientError.RequestError({
          request,
          reason: "Transport",
          cause
        })
    })
  )

test("agent RPC API serves query and metadata", async () => {
  const makeHandle = () =>
    ({
      supportedCommands: Effect.succeed([
        {
          name: "help",
          description: "show help",
          argumentHint: ""
        }
      ]),
      supportedModels: Effect.succeed([
        {
          value: "claude-3-5",
          displayName: "Claude 3.5",
          description: "Test model"
        }
      ]),
      accountInfo: Effect.succeed({ email: "dev@example.com" }),
      closeInput: Effect.void,
      interrupt: Effect.void
    }) as unknown as QueryHandle

  const runtime = AgentRuntime.of({
    query: () => Effect.succeed(makeHandle()),
    queryRaw: () => Effect.succeed(makeHandle()),
    stream: () => Stream.fromIterable([makeSuccessMessage("ok")]),
    stats: Effect.succeed({
      active: 1,
      pending: 0,
      concurrencyLimit: 4,
      pendingQueueCapacity: 0,
      pendingQueueStrategy: "disabled"
    }),
    interruptAll: Effect.void,
    events: Stream.empty
  })

  const runtimeLayer = Layer.succeed(AgentRuntime, runtime)
  const handlersLayer = AgentRpcHandlers.pipe(Layer.provide(runtimeLayer))
  const serverLayer = Layer.mergeAll(
    handlersLayer,
    RpcSerialization.layerNdjson,
    HttpServer.layerContext
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const { handler } = yield* Effect.acquireRelease(
        Effect.sync(() =>
          RpcServer.toWebHandler(AgentRpcs, { layer: serverLayer })
        ),
        ({ dispose }) => Effect.promise(dispose)
      )

      const clientLayer = RpcClient.layerProtocolHttp({
        url: "http://localhost/rpc"
      }).pipe(
        Layer.provide(Layer.succeed(HttpClient.HttpClient, makeWebHandlerClient(handler))),
        Layer.provide(RpcSerialization.layerNdjson)
      )

      const client = yield* RpcClient.make(AgentRpcs).pipe(
        Effect.provide(clientLayer)
      )

      const result = yield* client.QueryResult({ prompt: "Hello" })
      expect(result.result).toBe("ok")

      const stream = client.QueryStream({ prompt: "Hello" })
      const messages = yield* Stream.runCollect(stream)
      const messageList = Array.from(messages)
      expect(messageList.length).toBe(1)
      expect(messageList[0]?.type).toBe("result")

      const stats = yield* client.Stats()
      expect(stats.active).toBe(1)

      yield* client.InterruptAll()

      const models = yield* client.SupportedModels()
      expect(models[0]?.value).toBe("claude-3-5")

      const commands = yield* client.SupportedCommands()
      expect(commands[0]?.name).toBe("help")

      const account = yield* client.AccountInfo()
      expect(account.email).toBe("dev@example.com")
    })
  )

  await runEffect(program)
})

test("agent RPC metadata uses queryRaw", async () => {
  const makeHandle = () =>
    ({
      supportedCommands: Effect.succeed([
        {
          name: "help",
          description: "show help",
          argumentHint: ""
        }
      ]),
      supportedModels: Effect.succeed([
        {
          value: "claude-3-5",
          displayName: "Claude 3.5",
          description: "Test model"
        }
      ]),
      accountInfo: Effect.succeed({ email: "dev@example.com" }),
      closeInput: Effect.void,
      interrupt: Effect.void
    }) as unknown as QueryHandle

  const runtime = AgentRuntime.of({
    query: () => Effect.dieMessage("query should not be used for metadata"),
    queryRaw: () => Effect.sync(makeHandle),
    stream: () => Stream.empty,
    stats: Effect.succeed({
      active: 0,
      pending: 0,
      concurrencyLimit: 1,
      pendingQueueCapacity: 0,
      pendingQueueStrategy: "disabled"
    }),
    interruptAll: Effect.void,
    events: Stream.empty
  })

  const runtimeLayer = Layer.succeed(AgentRuntime, runtime)
  const handlersLayer = AgentRpcHandlers.pipe(Layer.provide(runtimeLayer))
  const serverLayer = Layer.mergeAll(
    handlersLayer,
    RpcSerialization.layerNdjson,
    HttpServer.layerContext
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const { handler } = yield* Effect.acquireRelease(
        Effect.sync(() =>
          RpcServer.toWebHandler(AgentRpcs, { layer: serverLayer })
        ),
        ({ dispose }) => Effect.promise(dispose)
      )

      const clientLayer = RpcClient.layerProtocolHttp({
        url: "http://localhost/rpc"
      }).pipe(
        Layer.provide(Layer.succeed(HttpClient.HttpClient, makeWebHandlerClient(handler))),
        Layer.provide(RpcSerialization.layerNdjson)
      )

      const client = yield* RpcClient.make(AgentRpcs).pipe(
        Effect.provide(clientLayer)
      )

      const models = yield* client.SupportedModels()
      expect(models[0]?.value).toBe("claude-3-5")

      const commands = yield* client.SupportedCommands()
      expect(commands[0]?.name).toBe("help")

      const account = yield* client.AccountInfo()
      expect(account.email).toBe("dev@example.com")
    })
  )

  await runEffect(program)
})
