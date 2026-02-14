import { test, expect } from "bun:test"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Mcp, Tools } from "../src/index.js"

test("Tool.define attaches handler and accepts schema parameters", async () => {
  const Params = Schema.Struct({
    message: Schema.String
  })

  const Echo = Tools.Tool.define("echo", {
    description: "Echo input",
    parameters: Params,
    success: Schema.Struct({ message: Schema.String }),
    handler: (params) => Effect.succeed({ message: params.message })
  })

  expect(Echo.parametersSchema).toBe(Params)

  const toolkit = Tools.Toolkit.make(Echo)
  const handlers = toolkit.of({
    echo: Echo.handler
  })

  const tools = await Effect.runPromise(Mcp.toolsFromToolkit(toolkit, handlers))
  const tool = tools[0] as any

  const result = await tool.handler({ message: "hi" }, {})
  expect(result.isError).toBe(false)
  expect(result.structuredContent).toEqual({ message: "hi" })
})

test("Tool.fn defines a tool with handler as last argument", async () => {
  const Echo = Tools.Tool.fn(
    "echo-fn",
    {
      description: "Echo input",
      parameters: {
        message: Schema.String
      },
      success: Schema.Struct({ message: Schema.String })
    },
    (params) => Effect.succeed({ message: params.message })
  )

  const toolkit = Tools.Toolkit.make(Echo)
  const handlers = toolkit.of({
    "echo-fn": Echo.handler
  })

  const tools = await Effect.runPromise(Mcp.toolsFromToolkit(toolkit, handlers))
  const tool = tools[0] as any

  const result = await tool.handler({ message: "hi" }, {})
  expect(result.isError).toBe(false)
  expect(result.structuredContent).toEqual({ message: "hi" })
})

test("Toolkit.fromHandlers builds toolkit and handler map", async () => {
  const toolkit = Tools.Toolkit.fromHandlers({
    echo: {
      description: "Echo input",
      parameters: {
        message: Schema.String
      },
      success: Schema.Struct({ message: Schema.String }),
      handler: (params: { message: string }) => Effect.succeed({ message: params.message })
    }
  })

  const tools = await Effect.runPromise(Mcp.toolsFromToolkit(toolkit, toolkit.handlers))
  const tool = tools[0] as any

  const result = await tool.handler({ message: "hi" }, {})
  expect(result.isError).toBe(false)
  expect(result.structuredContent).toEqual({ message: "hi" })
})
