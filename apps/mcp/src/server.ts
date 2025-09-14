import { createServer } from "node:http";
import * as McpServer from "@effect/ai/McpServer";
import * as HttpRouter from "@effect/platform/HttpRouter";
import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import * as AiTool from "@effect/ai/AiTool";
import * as AiToolkit from "@effect/ai/AiToolkit";
import * as S from "effect/Schema";

export class TestToolKit extends AiToolkit.make(
  AiTool.make("TestQuery", {
    description: "Tests a Query",
    success: S.Array(S.Number),
    failure: S.Never,
    parameters: {
      numItems: S.Int.pipe(S.greaterThanOrEqualTo(1)).annotations({
        description: "The number of items to return."
      })
    }
  })
) {}

export const testToolKitLayer = TestToolKit.toLayer(Effect.gen(function* () {
  return {
    TestQuery: ({numItems}) => Effect.succeed(Array.from({length: numItems}, () => Math.random()))
  }
}))

const McpTools = McpServer.toolkit(TestToolKit);

const ServerLayer = Layer.mergeAll(McpTools, HttpRouter.Default.serve()).pipe(
  Layer.provide(
    McpServer.layerHttp({
      name: "Beep MCP",
      version: "1.0.0",
      path: "/mcp"
    })
  ),
  Layer.provide(testToolKitLayer),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 8081 }))
)

Layer.launch(ServerLayer).pipe(NodeRuntime.runMain)