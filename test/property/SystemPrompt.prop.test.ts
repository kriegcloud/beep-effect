import { describe, test } from "bun:test"
import * as FC from "effect/FastCheck"
import {
  buildExtractSystemPrompt,
  buildReplSystemPrompt,
  type ToolDescriptor
} from "../../src/SystemPrompt"
import { assertProperty } from "./helpers/property"

const toolDescriptorArbitrary = FC.record<ToolDescriptor>({
  name: FC.stringMatching(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/),
  description: FC.string(),
  parameterNames: FC.array(FC.stringMatching(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/), { maxLength: 4 }),
  parametersJsonSchema: FC.record({ type: FC.constant("object") }),
  returnsJsonSchema: FC.record({ type: FC.constantFrom("string", "number", "array", "object") })
})

const jsonSchemaArbitrary = FC.dictionary(
  FC.stringMatching(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
  FC.constantFrom("string", "number", "boolean")
).map((properties) => ({
  type: "object",
  properties: Object.fromEntries(
    Object.entries(properties).map(([key, type]) => [key, { type }])
  )
}))

describe("SystemPrompt properties", () => {
  test("prop: REPL prompt always includes provided budget numbers", () => {
    assertProperty(
      FC.property(
        FC.integer({ min: 0, max: 1_000 }),
        FC.integer({ min: 0, max: 1_000 }),
        (iterationsRemaining, llmCallsRemaining) => {
          const prompt = buildReplSystemPrompt({
            depth: 0,
            iteration: 1,
            maxIterations: 10,
            maxDepth: 2,
            budget: {
              iterationsRemaining,
              llmCallsRemaining
            }
          })
          return prompt.includes(`Iterations remaining: ${iterationsRemaining}`) &&
            prompt.includes(`LLM calls remaining: ${llmCallsRemaining}`)
        }
      )
    )
  })

  test("prop: strict mode suppresses recursive/tool sections", () => {
    assertProperty(
      FC.property(
        FC.array(toolDescriptorArbitrary, { maxLength: 5 }),
        (tools) => {
          const prompt = buildReplSystemPrompt({
            depth: 0,
            iteration: 1,
            maxIterations: 10,
            maxDepth: 5,
            budget: { iterationsRemaining: 9, llmCallsRemaining: 19 },
            sandboxMode: "strict",
            tools
          })
          return !prompt.includes("## Recursive Sub-calls") &&
            !prompt.includes("## Available Tools") &&
            !prompt.includes("llm_query")
        }
      )
    )
  })

  test("prop: output schema section embeds JSON schema verbatim", () => {
    assertProperty(
      FC.property(
        jsonSchemaArbitrary,
        (schema) => {
          const prompt = buildReplSystemPrompt({
            depth: 0,
            iteration: 1,
            maxIterations: 10,
            maxDepth: 1,
            budget: { iterationsRemaining: 9, llmCallsRemaining: 19 },
            outputJsonSchema: schema
          })
          return prompt.includes(JSON.stringify(schema, null, 2)) &&
            prompt.includes("SUBMIT invocation schema for this run")
        }
      )
    )
  })

  test("prop: extract prompt requires SUBMIT value instruction when schema is present", () => {
    assertProperty(
      FC.property(
        jsonSchemaArbitrary,
        (schema) => {
          const prompt = buildExtractSystemPrompt(schema)
          return prompt.includes("SUBMIT({ value: ... })") &&
            !prompt.includes("FINAL(`{...}`)")
        }
      )
    )
  })

  test("prop: extract prompt requires SUBMIT answer instruction without schema", () => {
    assertProperty(
      FC.property(
        FC.constant(undefined),
        () => {
          const prompt = buildExtractSystemPrompt()
          return prompt.includes('SUBMIT({ answer: "your answer" })') &&
            !prompt.includes('FINAL("your answer")')
        }
      )
    )
  })
})
