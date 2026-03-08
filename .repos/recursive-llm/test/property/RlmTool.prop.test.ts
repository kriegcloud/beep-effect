import { describe, test } from "bun:test"
import { Effect, Schema } from "effect"
import * as FC from "effect/FastCheck"
import { RlmToolError, isValidToolName, make } from "../../src/RlmTool"
import { assertProperty } from "./helpers/property"

const RESERVED_TOOL_NAMES = new Set([
  "print", "__vars", "llm_query", "llm_query_batched", "__strictScope",
  "break", "case", "catch", "continue", "debugger", "default", "delete",
  "do", "else", "finally", "for", "function", "if", "in", "instanceof",
  "new", "return", "switch", "this", "throw", "try", "typeof", "var",
  "void", "while", "with", "class", "const", "enum", "export", "extends",
  "import", "super", "implements", "interface", "let", "package", "private",
  "protected", "public", "static", "yield", "await", "async"
])

const IDENTIFIER_RE = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/

const runEither = <A, E>(effect: Effect.Effect<A, E>): Promise<Either<A, E>> =>
  Effect.runPromise(Effect.either(effect))

type Either<A, E> =
  | { readonly _tag: "Left"; readonly left: E }
  | { readonly _tag: "Right"; readonly right: A }

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null ? value as Record<string, unknown> : null

describe("RlmTool properties", () => {
  test("prop: isValidToolName matches identifier + reserved rules", () => {
    assertProperty(
      FC.property(
        FC.string(),
        (name) => isValidToolName(name) === (IDENTIFIER_RE.test(name) && !RESERVED_TOOL_NAMES.has(name))
      )
    )
  })

  test("prop: positional args map to declared parameter names", async () => {
    const tool = make("echo_pair", {
      description: "Echo two positional parameters",
      parameters: {
        alpha: Schema.String,
        beta: Schema.Number
      },
      returns: Schema.Struct({
        alpha: Schema.String,
        beta: Schema.Number
      }),
      handler: ({ alpha, beta }) => Effect.succeed({ alpha, beta })
    })

    await assertProperty(
      FC.asyncProperty(
        FC.string(),
        FC.integer(),
        async (alpha, beta) => {
          const result = await runEither(tool.handle([alpha, beta]))
          if (result._tag !== "Right") return false
          const mapped = asRecord(result.right)
          return mapped !== null &&
            mapped.alpha === alpha &&
            mapped.beta === beta
        }
      )
    )
  })

  test("prop: invalid positional args fail with RlmToolError", async () => {
    const tool = make("expect_num", {
      description: "Expect numeric argument",
      parameters: { value: Schema.Number },
      returns: Schema.Number,
      handler: ({ value }) => Effect.succeed(value)
    })

    await assertProperty(
      FC.asyncProperty(
        FC.string(),
        async (notNumber) => {
          const result = await runEither(tool.handle([notNumber]))
          return result._tag === "Left" &&
            result.left instanceof RlmToolError &&
            result.left.toolName === "expect_num"
        }
      )
    )
  })
})
