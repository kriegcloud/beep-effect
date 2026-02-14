import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import * as Stream from "effect/Stream"
import { AgentSdk, Mcp, Tools } from "effect-claude-agent-sdk"

const Echo = Tools.Tool.make("echo", {
  description: "Echo back the provided text",
  parameters: {
    text: Schema.String
  },
  success: Schema.String
})

const handlers = {
  echo: ({ text }: { readonly text: string }) => Effect.succeed(text)
}

const program = Effect.scoped(
  Effect.gen(function*() {
    const sdk = yield* AgentSdk
    const toolkit = Tools.Toolkit.make(Echo)
    const tools = yield* Mcp.toolsFromToolkit(toolkit, handlers)
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
    yield* handle.stream.pipe(Stream.runDrain)
  }).pipe(Effect.provide(AgentSdk.layerDefaultFromEnv()))
)

Effect.runPromise(program)
