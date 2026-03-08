import type * as LanguageModel from "@effect/ai/LanguageModel"
import * as Tool from "@effect/ai/Tool"
import * as Toolkit from "@effect/ai/Toolkit"
import { Effect, Either, ParseResult, Schema } from "effect"
import type { FinalAnswerPayload } from "./RlmTypes"

export const SUBMIT_TOOL_NAME = "SUBMIT" as const
export const SUBMIT_TOOL_DESCRIPTION = "Finalize the run with your verified answer."

const SubmitAnswerField = Schema.String.annotations({
  description: "Plain-text final answer. Use when no structured output schema is requested.",
  examples: ["42", "Paris"]
})

const SubmitValueField = Schema.Unknown.annotations({
  description:
    "Structured final value. Use when a structured output schema is requested. Must be JSON-serializable and schema-compliant.",
  examples: [{ result: 42 }, ["item-1", "item-2"]]
})

const SubmitVariableField = Schema.String.pipe(Schema.minLength(1)).annotations({
  description: "Variable name in __vars containing the final answer/value.",
  examples: ["finalAnswer", "finalValue"]
})

export const buildSubmitInvocationSchema = (outputJsonSchema?: object): object =>
  outputJsonSchema !== undefined
    ? {
        oneOf: [{
          type: "object",
          additionalProperties: false,
          required: ["value"],
          properties: {
            value: outputJsonSchema
          }
        }, {
          type: "object",
          additionalProperties: false,
          required: ["variable"],
          properties: {
            variable: {
              type: "string",
              minLength: 1,
              description: "Name of a __vars key containing the final structured value."
            }
          }
        }]
      }
    : {
        oneOf: [{
          type: "object",
          additionalProperties: false,
          required: ["answer"],
          properties: {
            answer: {
              type: "string",
              description: "Plain-text final answer."
            }
          }
        }, {
          type: "object",
          additionalProperties: false,
          required: ["variable"],
          properties: {
            variable: {
              type: "string",
              minLength: 1,
              description: "Name of a __vars key containing the final plain-text answer."
            }
          }
        }]
      }

// --- Mode-specific SUBMIT toolkits ---
// Only expose fields relevant to the output mode so providers can't use wrong fields.

const makeSubmitToolkit = (parameters: Schema.Struct.Fields) => {
  const tool = Tool.make(SUBMIT_TOOL_NAME, {
    description: SUBMIT_TOOL_DESCRIPTION,
    parameters,
    success: Schema.Void
  })
  const tk = Toolkit.make(tool)
  const handlers = tk.of({ SUBMIT: () => Effect.void })
  return tk.pipe(Effect.provide(tk.toLayer(handlers)))
}

const submitToolkitPlain = makeSubmitToolkit({
  answer: Schema.optional(SubmitAnswerField),
  variable: Schema.optional(SubmitVariableField)
})

const submitToolkitStructured = makeSubmitToolkit({
  value: Schema.optional(SubmitValueField),
  variable: Schema.optional(SubmitVariableField)
})

export const buildSubmitToolkit = (outputMode: "plain" | "structured") =>
  outputMode === "structured" ? submitToolkitStructured : submitToolkitPlain

const SubmitPlainPayload = Schema.Struct({
  answer: SubmitAnswerField
})

const SubmitStructuredPayload = Schema.Struct({
  value: SubmitValueField
})

const SubmitVariablePayload = Schema.Struct({
  variable: SubmitVariableField
})

export type SubmitAnswer = FinalAnswerPayload
export type SubmitPayload = SubmitAnswer | { readonly source: "variable"; readonly variable: string }

export const renderSubmitAnswer = (answer: SubmitAnswer): string => {
  if (answer.source === "answer") {
    return answer.answer
  }
  try {
    const encoded = JSON.stringify(answer.value)
    return typeof encoded === "string" ? encoded : String(answer.value)
  } catch {
    return String(answer.value)
  }
}

export type SubmitAnswerExtraction =
  | {
      readonly _tag: "Found"
      readonly value: SubmitPayload
    }
  | {
      readonly _tag: "Missing"
    }
  | {
      readonly _tag: "Invalid"
      readonly message: string
    }

const formatParseError = (error: ParseResult.ParseError): string =>
  ParseResult.TreeFormatter.formatErrorSync(error)

const SubmitParseOptions = {
  exact: true as const,
  onExcessProperty: "error" as const
}

const decodeSubmitPayload = (
  params: unknown,
  outputMode: "plain" | "structured"
): Either.Either<SubmitPayload, string> => {
  if (typeof params === "object" && params !== null && "variable" in params) {
    const variableDecoded = Schema.decodeUnknownEither(SubmitVariablePayload)(params, SubmitParseOptions)
    if (Either.isLeft(variableDecoded)) {
      return Either.left(
        `Variable output requires \`SUBMIT({ variable: "name" })\` with a non-empty variable name and no extra fields. ${formatParseError(variableDecoded.left)}`
      )
    }

    return Either.right({
      source: "variable",
      variable: variableDecoded.right.variable
    })
  }

  if (outputMode === "structured") {
    const decoded = Schema.decodeUnknownEither(SubmitStructuredPayload)(params, SubmitParseOptions)
    if (Either.isLeft(decoded)) {
      return Either.left(
        `Structured output requires \`SUBMIT({ value: ... })\` OR \`SUBMIT({ variable: "name" })\` with no extra fields. ${formatParseError(decoded.left)}`
      )
    }
    return Either.right({
      source: "value",
      value: decoded.right.value
    })
  }

  const decoded = Schema.decodeUnknownEither(SubmitPlainPayload)(params, SubmitParseOptions)
  if (Either.isLeft(decoded)) {
    return Either.left(
      `Plain-text output requires \`SUBMIT({ answer: \"...\" })\` OR \`SUBMIT({ variable: "name" })\` with no extra fields. ${formatParseError(decoded.left)}`
    )
  }

  return Either.right({
    source: "answer",
    answer: decoded.right.answer
  })
}

const readSubmitAnswerFromParams = (
  params: unknown,
  outputMode: "plain" | "structured"
): SubmitAnswerExtraction => {
  const decoded = decodeSubmitPayload(params, outputMode)
  if (Either.isLeft(decoded)) {
    return {
      _tag: "Invalid",
      message: decoded.left
    }
  }

  return {
    _tag: "Found",
    value: decoded.right
  }
}

export const extractSubmitAnswer = (
  response: LanguageModel.GenerateTextResponse<any>,
  options: {
    readonly outputMode: "plain" | "structured"
  }
): SubmitAnswerExtraction => {
  const submitCalls = response.toolCalls.filter((toolCall) => {
    const normalized = toolCall.name.startsWith("$") ? toolCall.name.slice(1) : toolCall.name
    return normalized === SUBMIT_TOOL_NAME
  })

  if (submitCalls.length === 0) {
    return { _tag: "Missing" }
  }
  if (submitCalls.length > 1) {
    return {
      _tag: "Invalid",
      message: "Multiple SUBMIT tool calls were returned; exactly one is allowed."
    }
  }

  const submitCall = submitCalls[0]!
  const parsed = readSubmitAnswerFromParams(submitCall.params, options.outputMode)
  if (parsed._tag === "Found") {
    return parsed
  }

  if (parsed._tag === "Invalid") {
    return parsed
  }

  return {
    _tag: "Invalid",
    message: "SUBMIT tool call did not contain a final payload."
  }
}
