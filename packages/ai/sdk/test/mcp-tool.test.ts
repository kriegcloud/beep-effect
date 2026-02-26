import { test, expect } from "bun:test"
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import { Mcp } from "../src/index.js"
import { z } from "zod"

test("Mcp.tool builds a zod input schema and runs effect handler", async () => {
  const toolEffect = Mcp.tool({
    name: "echo",
    description: "Echo a message",
    parameters: Schema.Struct({
      message: Schema.String,
      count: Schema.optional(Schema.Number)
    }),
    handler: (params) =>
      Effect.succeed({
        content: [{ type: "text", text: `${params.message}:${params.count ?? 0}` }]
      })
  })

  const tool = (await Effect.runPromise(toolEffect)) as any
  const inputSchema = tool.inputSchema as Record<string, unknown> | undefined
  expect(inputSchema).toBeDefined()
  if (inputSchema) {
    expect((inputSchema as { safeParse?: unknown }).safeParse).toBeUndefined()
    expect(typeof (inputSchema as { message?: { safeParse?: unknown } }).message?.safeParse).toBe(
      "function"
    )
  }
  const parsed = z.object(tool.inputSchema).safeParse({ message: "hi" })
  expect(parsed.success).toBe(true)

  const result = await tool.handler({ message: "hi" }, {})
  expect(result.content?.[0]).toEqual({ type: "text", text: "hi:0" })
})

test("Mcp.tool rejects invalid parameters", async () => {
  const toolEffect = Mcp.tool({
    name: "strict-echo",
    description: "Echo a message",
    parameters: Schema.Struct({
      message: Schema.String
    }),
    handler: (params) =>
      Effect.succeed({
        content: [{ type: "text", text: params.message }]
      })
  })

  const tool = (await Effect.runPromise(toolEffect)) as any
  await expect(tool.handler({ message: 123 }, {})).rejects.toBeDefined()
})

test("Mcp.tool supports optional tuple elements in schemas", async () => {
  const toolEffect = Mcp.tool({
    name: "tuple-input",
    description: "Accepts tuple input",
    parameters: Schema.Struct({
      pair: Schema.Tuple(Schema.Number, Schema.optionalElement(Schema.Number))
    }),
    handler: (params) =>
      Effect.succeed({
        content: [{ type: "text", text: String(params.pair.length) }]
      })
  })

  const tool = (await Effect.runPromise(toolEffect)) as any
  const inputSchema = z.object(tool.inputSchema)
  expect(inputSchema.safeParse({ pair: [1] }).success).toBe(true)
  expect(inputSchema.safeParse({ pair: [1, 2] }).success).toBe(true)
})
