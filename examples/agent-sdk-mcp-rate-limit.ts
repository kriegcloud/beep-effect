import * as Console from "effect/Console"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"
import { AgentSdk, Experimental, Mcp, Tools } from "../src/index.js"

const Echo = Tools.Tool.make("echo", {
  description: "Echo input text",
  parameters: {
    text: Schema.String
  },
  success: Schema.String
})

const handlers = {
  echo: ({ text }: { readonly text: string }) => Effect.succeed(text)
}

const limited = Experimental.RateLimiter.rateLimitHandlers(
  handlers,
  {
    limit: 10,
    window: "1 minute"
  },
  { keyPrefix: "tools" }
)

const program = Effect.scoped(
  Effect.gen(function*() {
    const sdk = yield* AgentSdk
    const toolkit = Tools.Toolkit.make(Echo)
    const tools = yield* Mcp.toolsFromToolkit(toolkit, limited)
    const server = yield* sdk.createSdkMcpServer({
      name: "local-tools",
      tools
    })
    const handle = yield* sdk.query("Use the echo tool with 'hello'.", {
      tools: ["echo"],
      mcpServers: {
        "local-tools": server
      }
    })
    yield* handle.stream.pipe(Stream.tap((message) => Console.log(message)), Stream.runDrain)
    yield* handle.interrupt
  }).pipe(
    Effect.provide([
      AgentSdk.layerDefaultFromEnv(),
      Experimental.RateLimiter.layerMemory
    ])
  )
)

Effect.runPromise(program)
