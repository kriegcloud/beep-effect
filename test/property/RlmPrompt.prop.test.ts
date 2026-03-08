import { describe, test } from "bun:test"
import * as FC from "effect/FastCheck"
import {
  buildOneShotPrompt,
  buildReplPrompt,
  MAX_ONESHOT_CONTEXT_CHARS,
  truncateOutput
} from "../../src/RlmPrompt"
import { TranscriptEntry } from "../../src/RlmTypes"
import { assertProperty } from "./helpers/property"

const messageText = (message: unknown): string => {
  if (typeof message !== "object" || message === null || !("content" in message)) {
    return ""
  }
  const content = (message as { readonly content: unknown }).content
  if (typeof content === "string") return content
  if (!Array.isArray(content)) return ""
  return content
    .map((part) => {
      if (typeof part === "string") return part
      if (typeof part === "object" && part !== null && "text" in part && typeof (part as { text: unknown }).text === "string") {
        return (part as { text: string }).text
      }
      return ""
    })
    .join("")
}

describe("RlmPrompt properties", () => {
  test("prop: truncateOutput passes through when output length <= max", () => {
    assertProperty(
      FC.property(
        FC.string(),
        FC.integer({ min: 0, max: 400 }),
        (output, maxChars) => {
          const bounded = output.length > maxChars
            ? output.slice(0, maxChars)
            : output
          return truncateOutput(bounded, maxChars) === bounded
        }
      )
    )
  })

  test("prop: truncateOutput preserves prefix and adds marker when truncated", () => {
    assertProperty(
      FC.property(
        FC.string({ minLength: 1 }),
        FC.integer({ min: 0, max: 300 }),
        (output, maxChars) => {
          const ensured = output.length <= maxChars
            ? output + "x".repeat(maxChars - output.length + 1)
            : output
          const truncated = truncateOutput(ensured, maxChars)
          return truncated.startsWith(ensured.slice(0, maxChars)) &&
            truncated.includes(`[truncated at ${ensured.length} chars]`)
        }
      )
    )
  })

  test("prop: buildReplPrompt message count matches transcript shape", () => {
    assertProperty(
      FC.property(
        FC.array(
          FC.record({
            assistantResponse: FC.string(),
            executionOutput: FC.option(FC.string(), { nil: undefined })
          }),
          { maxLength: 25 }
        ),
        FC.integer({ min: 0, max: 100_000 }),
        FC.string({ maxLength: 200 }),
        (entries, contextLength, contextPreview) => {
          const transcript = entries.map((entry) =>
            new TranscriptEntry({
              assistantResponse: entry.assistantResponse,
              ...(entry.executionOutput !== undefined
                ? { executionOutput: entry.executionOutput }
                : {})
            })
          )
          const prompt = buildReplPrompt({
            systemPrompt: "system",
            query: "query",
            contextLength,
            contextPreview,
            transcript
          })
          const nonEmpty = entries.filter((entry) => entry.assistantResponse.trim() !== "")
          const executionOutputs = nonEmpty.filter((entry) => entry.executionOutput !== undefined).length
          return prompt.content.length === 2 + nonEmpty.length + executionOutputs
        }
      )
    )
  })

  test("prop: buildOneShotPrompt includes full context when context is within limit", () => {
    assertProperty(
      FC.property(
        FC.string({ maxLength: 200 }),
        FC.string({ maxLength: 400 }),
        (query, context) => {
          const prompt = buildOneShotPrompt({
            systemPrompt: "system",
            query,
            context
          })
          const text = messageText(prompt.content[1])
          return context === ""
            ? text === query
            : text.includes(context)
        }
      )
    )
  })

  test("prop: buildOneShotPrompt adds truncation marker when context exceeds limit", () => {
    assertProperty(
      FC.property(
        FC.string({ maxLength: 120 }),
        FC.string({ minLength: MAX_ONESHOT_CONTEXT_CHARS + 1, maxLength: MAX_ONESHOT_CONTEXT_CHARS + 300 }),
        (query, context) => {
          const prompt = buildOneShotPrompt({
            systemPrompt: "system",
            query,
            context
          })
          const text = messageText(prompt.content[1])
          return text.includes("[truncated at") &&
            text.includes(query)
        }
      )
    )
  })
})
