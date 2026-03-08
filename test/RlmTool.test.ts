import { describe, expect, test } from "bun:test"
import { Effect, Schema } from "effect"
import { make, RlmToolError } from "../src/RlmTool"

describe("RlmTool", () => {
  test("make() creates tool with correct metadata", () => {
    const tool = make("search", {
      description: "Search the web",
      parameters: {
        query: Schema.String,
        maxResults: Schema.Number
      },
      returns: Schema.Array(Schema.Struct({
        title: Schema.String,
        snippet: Schema.String
      })),
      handler: (_params) => Effect.succeed([{ title: "Result", snippet: "A snippet" }])
    })

    expect(tool.name).toBe("search")
    expect(tool.description).toBe("Search the web")
    expect(tool.parameterNames).toEqual(["query", "maxResults"])
    expect(tool.timeoutMs).toBe(30_000)
    expect(tool.parametersJsonSchema).toBeDefined()
    expect(tool.returnsJsonSchema).toBeDefined()
  })

  test("handle() decodes positional args and returns encoded result", async () => {
    const tool = make("add", {
      description: "Add two numbers",
      parameters: {
        a: Schema.Number,
        b: Schema.Number
      },
      returns: Schema.Number,
      handler: ({ a, b }) => Effect.succeed(a + b)
    })

    const result = await Effect.runPromise(tool.handle([3, 4]))
    expect(result).toBe(7)
  })

  test("handle() fails on invalid parameter types", async () => {
    const tool = make("greet", {
      description: "Greet someone",
      parameters: {
        name: Schema.String
      },
      returns: Schema.String,
      handler: ({ name }) => Effect.succeed(`Hello, ${name}!`)
    })

    const result = await Effect.runPromise(
      tool.handle([123]).pipe(Effect.either)
    )
    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(RlmToolError)
      expect(result.left.message).toContain("Parameter validation failed")
      expect(result.left.toolName).toBe("greet")
    }
  })

  test("handle() propagates handler errors", async () => {
    const tool = make("fail", {
      description: "Always fails",
      parameters: {
        input: Schema.String
      },
      returns: Schema.String,
      handler: (_params) => Effect.fail(new RlmToolError({
        message: "Something went wrong",
        toolName: "fail"
      }))
    })

    const result = await Effect.runPromise(
      tool.handle(["test"]).pipe(Effect.either)
    )
    expect(result._tag).toBe("Left")
    if (result._tag === "Left") {
      expect(result.left.message).toBe("Something went wrong")
    }
  })

  test("custom timeoutMs is preserved", () => {
    const tool = make("slow", {
      description: "Slow tool",
      parameters: {},
      returns: Schema.String,
      timeoutMs: 60_000,
      handler: () => Effect.succeed("done")
    })

    expect(tool.timeoutMs).toBe(60_000)
  })

  test("usageExamples are preserved when provided", () => {
    const tool = make("sampleTool", {
      description: "Example tool",
      parameters: {
        input: Schema.String
      },
      returns: Schema.String,
      usageExamples: [
        'const result = await sampleTool("hello")'
      ],
      handler: ({ input }) => Effect.succeed(input)
    })

    expect(tool.usageExamples).toEqual([
      'const result = await sampleTool("hello")'
    ])
  })

  test("handle() with no parameters", async () => {
    const tool = make("ping", {
      description: "Ping",
      parameters: {},
      returns: Schema.String,
      handler: () => Effect.succeed("pong")
    })

    const result = await Effect.runPromise(tool.handle([]))
    expect(result).toBe("pong")
  })
})
