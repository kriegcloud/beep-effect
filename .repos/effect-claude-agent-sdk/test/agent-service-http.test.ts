import { expect, test } from "bun:test"
import { HttpApiBuilder } from "@effect/platform"
import * as HttpServer from "@effect/platform/HttpServer"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"
import { AgentRuntime } from "../src/AgentRuntime.js"
import type { QueryHandle } from "../src/Query.js"
import { AgentHttpApi } from "../src/service/AgentHttpApi.js"
import { layer as AgentHttpHandlers } from "../src/service/AgentHttpHandlers.js"
import type { SDKMessage } from "../src/Schema/Message.js"

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

test("agent HTTP API serves query and stats", async () => {
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
  const handlersLayer = AgentHttpHandlers.pipe(Layer.provide(runtimeLayer))
  const apiLayer = HttpApiBuilder.api(AgentHttpApi).pipe(Layer.provide(handlersLayer))
  const { handler, dispose } = HttpApiBuilder.toWebHandler(
    Layer.mergeAll(apiLayer, HttpServer.layerContext)
  )

  try {
    const queryResponse = await handler(
      new Request("http://localhost/query", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: "Hello" })
      })
    )
    expect(queryResponse.status).toBe(200)
    const queryBody = await queryResponse.json()
    expect(queryBody.result).toBe("ok")

    const statsResponse = await handler(new Request("http://localhost/stats"))
    expect(statsResponse.status).toBe(200)
    const statsBody = await statsResponse.json()
    expect(statsBody.active).toBe(1)

    const interruptResponse = await handler(
      new Request("http://localhost/interrupt-all", { method: "POST" })
    )
    expect(interruptResponse.status).toBe(204)

    const modelsResponse = await handler(new Request("http://localhost/models"))
    expect(modelsResponse.status).toBe(200)
    const modelsBody = await modelsResponse.json()
    expect(modelsBody[0]?.value).toBe("claude-3-5")

    const commandsResponse = await handler(new Request("http://localhost/commands"))
    expect(commandsResponse.status).toBe(200)
    const commandsBody = await commandsResponse.json()
    expect(commandsBody[0]?.name).toBe("help")

    const accountResponse = await handler(new Request("http://localhost/account"))
    expect(accountResponse.status).toBe(200)
    const accountBody = await accountResponse.json()
    expect(accountBody.email).toBe("dev@example.com")
  } finally {
    await dispose()
  }
})

test("agent HTTP API metadata uses queryRaw", async () => {
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
  const handlersLayer = AgentHttpHandlers.pipe(Layer.provide(runtimeLayer))
  const apiLayer = HttpApiBuilder.api(AgentHttpApi).pipe(Layer.provide(handlersLayer))
  const { handler, dispose } = HttpApiBuilder.toWebHandler(
    Layer.mergeAll(apiLayer, HttpServer.layerContext)
  )

  try {
    const modelsResponse = await handler(new Request("http://localhost/models"))
    expect(modelsResponse.status).toBe(200)
    const modelsBody = await modelsResponse.json()
    expect(modelsBody[0]?.value).toBe("claude-3-5")

    const commandsResponse = await handler(new Request("http://localhost/commands"))
    expect(commandsResponse.status).toBe(200)
    const commandsBody = await commandsResponse.json()
    expect(commandsBody[0]?.name).toBe("help")

    const accountResponse = await handler(new Request("http://localhost/account"))
    expect(accountResponse.status).toBe(200)
    const accountBody = await accountResponse.json()
    expect(accountBody.email).toBe("dev@example.com")
  } finally {
    await dispose()
  }
})
