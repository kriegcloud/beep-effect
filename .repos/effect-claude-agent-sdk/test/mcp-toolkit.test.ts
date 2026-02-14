import { test, expect } from "bun:test"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Mcp, Tools } from "../src/index.js"
import { z } from "zod"

class ExplosionError extends Error {
  readonly _tag = "ExplosionError"
}

test("Mcp.toolsFromToolkit builds tools and renders success results", async () => {
  const Echo = Tools.Tool.make("echo", {
    description: "Echo input",
    parameters: {
      message: Schema.String
    },
    success: Schema.Struct({ message: Schema.String })
  })

  const toolkit = Tools.Toolkit.make(Echo)
  const handlers = toolkit.of({
    echo: (params) => Effect.succeed({ message: params.message })
  })

  const tools = await Effect.runPromise(Mcp.toolsFromToolkit(toolkit, handlers))
  expect(tools).toHaveLength(1)

  const tool = tools[0] as any
  expect(z.object(tool.inputSchema).safeParse({ message: "hi" }).success).toBe(true)

  const result = await tool.handler({ message: "hi" }, {})
  expect(result.isError).toBe(false)
  expect(result.structuredContent).toEqual({ message: "hi" })
})

test("Mcp.toolsFromToolkit renders failure-mode results as errors", async () => {
  const Fails = Tools.Tool.make("fails", {
    description: "Fails",
    parameters: {
      reason: Schema.String
    },
    failure: Schema.Struct({ reason: Schema.String }),
    failureMode: "return"
  })

  const toolkit = Tools.Toolkit.make(Fails)
  const handlers = toolkit.of({
    fails: (params) => Effect.fail({ reason: params.reason })
  })

  const tools = await Effect.runPromise(Mcp.toolsFromToolkit(toolkit, handlers))
  const tool = tools[0] as any

  const result = await tool.handler({ reason: "nope" }, {})
  expect(result.isError).toBe(true)
  expect(result.structuredContent).toEqual({ reason: "nope" })
})

test("Mcp.toolsFromToolkit maps handler errors to CallToolResult", async () => {
  const Echo = Tools.Tool.make("strict", {
    description: "Strict input",
    parameters: {
      message: Schema.String
    },
    success: Schema.Struct({ message: Schema.String })
  })

  const toolkit = Tools.Toolkit.make(Echo)
  const handlers = toolkit.of({
    strict: (params) => Effect.succeed({ message: params.message })
  })

  const tools = await Effect.runPromise(Mcp.toolsFromToolkit(toolkit, handlers))
  const tool = tools[0] as any

  const result = await tool.handler({ message: 123 }, {})
  expect(result.isError).toBe(true)
  expect(result.structuredContent).toBeDefined()
  if (result.structuredContent) {
    expect(Object.getPrototypeOf(result.structuredContent)).toBe(Object.prototype)
  }
})

test("Mcp.toolsFromToolkit serializes error instances in structuredContent", async () => {
  const Explodes = Tools.Tool.make("explode", {
    description: "Explodes",
    parameters: {
      message: Schema.String
    },
    success: Schema.Struct({ message: Schema.String }),
    failure: Schema.Unknown,
    failureMode: "error"
  })

  const toolkit = Tools.Toolkit.make(Explodes)
  const handlers = toolkit.of({
    explode: () => Effect.fail(new ExplosionError("boom"))
  })

  const tools = await Effect.runPromise(Mcp.toolsFromToolkit(toolkit, handlers))
  const tool = tools[0] as any

  const result = await tool.handler({ message: "hi" }, {})
  expect(result.isError).toBe(true)
  expect(result.structuredContent).toBeDefined()
  if (result.structuredContent) {
    expect(Object.getPrototypeOf(result.structuredContent)).toBe(Object.prototype)
  }
})
