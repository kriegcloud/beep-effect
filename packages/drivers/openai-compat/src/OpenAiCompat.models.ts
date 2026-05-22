/**
 * Schema-first OpenAI-compatible chat completion request and response models.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $OpenaiCompatId } from "@beep/identity";
import { LiteralKit, OptionFromOptionalNullishKey } from "@beep/schema";
import { Effect, Tuple } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $OpenaiCompatId.create("OpenAiCompat.models");

const OptionalNullableString = OptionFromOptionalNullishKey(S.String).pipe(
  S.withConstructorDefault(Effect.succeed(O.none<string>()))
);
const OptionalNumber = S.OptionFromOptionalKey(S.Number).pipe(
  S.withConstructorDefault(Effect.succeed(O.none<number>()))
);
const OptionalUnknownRecord = S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)).pipe(
  S.withConstructorDefault(Effect.succeed(O.none<Readonly<Record<string, unknown>>>()))
);

/**
 * Chat roles accepted by OpenAI-compatible chat completion endpoints.
 *
 * @example
 * ```ts
 * import { OpenAiCompatChatRole } from "@beep/openai-compat"
 *
 * const isUserRole = OpenAiCompatChatRole.is.user("user")
 *
 * void isUserRole
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OpenAiCompatChatRole = LiteralKit(["system", "user", "assistant", "tool"] as const).pipe(
  $I.annoteSchema("OpenAiCompatChatRole", {
    description: "Chat roles accepted by OpenAI-compatible chat completion endpoints.",
  })
);

/**
 * Chat roles accepted by OpenAI-compatible chat completion endpoints.
 *
 * @example
 * ```ts
 * import type { OpenAiCompatChatRole } from "@beep/openai-compat"
 *
 * const role: OpenAiCompatChatRole = "assistant"
 *
 * void role
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OpenAiCompatChatRole = typeof OpenAiCompatChatRole.Type;

/**
 * Finish reasons emitted by OpenAI-compatible chat completion endpoints.
 *
 * @example
 * ```ts
 * import { OpenAiCompatFinishReason } from "@beep/openai-compat"
 *
 * const stopped = OpenAiCompatFinishReason.is.stop("stop")
 *
 * void stopped
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OpenAiCompatFinishReason = LiteralKit([
  "stop",
  "length",
  "tool_calls",
  "content_filter",
  "function_call",
] as const).pipe(
  $I.annoteSchema("OpenAiCompatFinishReason", {
    description: "Finish reasons emitted by OpenAI-compatible chat completion endpoints.",
  })
);

/**
 * Finish reasons emitted by OpenAI-compatible chat completion endpoints.
 *
 * @example
 * ```ts
 * import type { OpenAiCompatFinishReason } from "@beep/openai-compat"
 *
 * const reason: OpenAiCompatFinishReason = "tool_calls"
 *
 * void reason
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OpenAiCompatFinishReason = typeof OpenAiCompatFinishReason.Type;

/**
 * Function payload inside an OpenAI-compatible tool call.
 *
 * @example
 * ```ts
 * import { OpenAiCompatToolCallFunction } from "@beep/openai-compat"
 *
 * const call = OpenAiCompatToolCallFunction.make({
 *   arguments: "{\"city\":\"Austin\"}",
 *   name: "weather"
 * })
 *
 * void call
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatToolCallFunction extends S.Class<OpenAiCompatToolCallFunction>(
  $I`OpenAiCompatToolCallFunction`
)(
  {
    arguments: S.String,
    name: S.String,
  },
  $I.annote("OpenAiCompatToolCallFunction", {
    description: "Function payload inside an OpenAI-compatible tool call.",
  })
) {}

/**
 * Tool call payload emitted by OpenAI-compatible chat completion endpoints.
 *
 * @example
 * ```ts
 * import { OpenAiCompatToolCall } from "@beep/openai-compat"
 *
 * const call = OpenAiCompatToolCall.make({
 *   function: { arguments: "{}", name: "noop" },
 *   id: "call_1",
 *   type: "function"
 * })
 *
 * void call
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatToolCall extends S.Class<OpenAiCompatToolCall>($I`OpenAiCompatToolCall`)(
  {
    function: OpenAiCompatToolCallFunction,
    id: S.String,
    index: S.optionalKey(S.Number),
    type: S.tag("function"),
  },
  $I.annote("OpenAiCompatToolCall", {
    description: "Tool call payload emitted by OpenAI-compatible chat completion endpoints.",
  })
) {}

/**
 * Incremental function payload inside an OpenAI-compatible streaming tool-call delta.
 *
 * @example
 * ```ts
 * import { OpenAiCompatToolCallFunctionDelta } from "@beep/openai-compat"
 *
 * const delta = OpenAiCompatToolCallFunctionDelta.make({
 *   arguments: "{\"city\""
 * })
 *
 * void delta
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatToolCallFunctionDelta extends S.Class<OpenAiCompatToolCallFunctionDelta>(
  $I`OpenAiCompatToolCallFunctionDelta`
)(
  {
    arguments: S.optionalKey(S.String),
    name: S.optionalKey(S.String),
  },
  $I.annote("OpenAiCompatToolCallFunctionDelta", {
    description: "Incremental function payload inside an OpenAI-compatible streaming tool-call delta.",
  })
) {}

/**
 * Incremental tool-call payload emitted by OpenAI-compatible chat completion streams.
 *
 * @example
 * ```ts
 * import { OpenAiCompatToolCallDelta } from "@beep/openai-compat"
 *
 * const delta = OpenAiCompatToolCallDelta.make({
 *   function: { arguments: "{\"city\"" },
 *   index: 0
 * })
 *
 * void delta
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatToolCallDelta extends S.Class<OpenAiCompatToolCallDelta>($I`OpenAiCompatToolCallDelta`)(
  {
    function: S.optionalKey(OpenAiCompatToolCallFunctionDelta),
    id: S.optionalKey(S.String),
    index: S.optionalKey(S.Number),
    type: S.optionalKey(S.Literal("function")),
  },
  $I.annote("OpenAiCompatToolCallDelta", {
    description: "Incremental tool-call payload emitted by OpenAI-compatible chat completion streams.",
  })
) {}

/**
 * Function details sent to OpenAI-compatible chat completion endpoints.
 *
 * @example
 * ```ts
 * import { OpenAiCompatFunctionToolDefinition } from "@beep/openai-compat"
 *
 * const definition = OpenAiCompatFunctionToolDefinition.make({
 *   name: "noop",
 *   parameters: { type: "object" }
 * })
 *
 * void definition
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatFunctionToolDefinition extends S.Class<OpenAiCompatFunctionToolDefinition>(
  $I`OpenAiCompatFunctionToolDefinition`
)(
  {
    description: S.String.pipe(S.NullOr, S.optionalKey),
    name: S.String,
    parameters: S.Record(S.String, S.Unknown),
    strict: S.optionalKey(S.Boolean),
  },
  $I.annote("OpenAiCompatFunctionToolDefinition", {
    description: "Function details sent to OpenAI-compatible chat completion endpoints.",
  })
) {}

/**
 * Function declaration sent to OpenAI-compatible chat completion endpoints.
 *
 * @example
 * ```ts
 * import { OpenAiCompatFunctionTool } from "@beep/openai-compat"
 *
 * const tool = OpenAiCompatFunctionTool.make({
 *   function: { name: "noop", parameters: { type: "object" } },
 *   type: "function"
 * })
 *
 * void tool
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatFunctionTool extends S.Class<OpenAiCompatFunctionTool>($I`OpenAiCompatFunctionTool`)(
  {
    function: OpenAiCompatFunctionToolDefinition,
    type: S.tag("function"),
  },
  $I.annote("OpenAiCompatFunctionTool", {
    description: "Function declaration sent to OpenAI-compatible chat completion endpoints.",
  })
) {}

const OpenAiCompatChatContent = S.Union([S.String, S.Array(S.Record(S.String, S.Unknown))]).pipe(
  $I.annoteSchema("OpenAiCompatChatContent", {
    description: "Text or multimodal chat message content accepted by OpenAI-compatible endpoints.",
  })
);

/**
 * System chat message accepted by OpenAI-compatible chat completion endpoints.
 *
 * @example
 * ```ts
 * import { OpenAiCompatSystemChatMessage } from "@beep/openai-compat"
 *
 * const message = OpenAiCompatSystemChatMessage.make({
 *   content: "You are concise.",
 *   role: "system"
 * })
 *
 * void message
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatSystemChatMessage extends S.Class<OpenAiCompatSystemChatMessage>(
  $I`OpenAiCompatSystemChatMessage`
)(
  {
    content: OpenAiCompatChatContent.pipe(S.NullOr, S.optionalKey),
    name: S.optionalKey(S.String),
    role: S.tag("system"),
  },
  $I.annote("OpenAiCompatSystemChatMessage", {
    description: "System chat message accepted by OpenAI-compatible chat completion endpoints.",
  })
) {}

/**
 * User chat message accepted by OpenAI-compatible chat completion endpoints.
 *
 * @example
 * ```ts
 * import { OpenAiCompatUserChatMessage } from "@beep/openai-compat"
 *
 * const message = OpenAiCompatUserChatMessage.make({
 *   content: "Hello",
 *   role: "user"
 * })
 *
 * void message
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatUserChatMessage extends S.Class<OpenAiCompatUserChatMessage>($I`OpenAiCompatUserChatMessage`)(
  {
    content: OpenAiCompatChatContent.pipe(S.NullOr, S.optionalKey),
    name: S.optionalKey(S.String),
    role: S.tag("user"),
  },
  $I.annote("OpenAiCompatUserChatMessage", {
    description: "User chat message accepted by OpenAI-compatible chat completion endpoints.",
  })
) {}

/**
 * Assistant chat message accepted by OpenAI-compatible chat completion endpoints.
 *
 * @example
 * ```ts
 * import { OpenAiCompatAssistantChatMessage } from "@beep/openai-compat"
 *
 * const message = OpenAiCompatAssistantChatMessage.make({
 *   content: "Hi there",
 *   role: "assistant"
 * })
 *
 * void message
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatAssistantChatMessage extends S.Class<OpenAiCompatAssistantChatMessage>(
  $I`OpenAiCompatAssistantChatMessage`
)(
  {
    content: OpenAiCompatChatContent.pipe(S.NullOr, S.optionalKey),
    name: S.optionalKey(S.String),
    role: S.tag("assistant"),
    tool_calls: OpenAiCompatToolCall.pipe(S.Array, S.optionalKey),
  },
  $I.annote("OpenAiCompatAssistantChatMessage", {
    description: "Assistant chat message accepted by OpenAI-compatible chat completion endpoints.",
  })
) {}

/**
 * Tool chat message accepted by OpenAI-compatible chat completion endpoints.
 *
 * @example
 * ```ts
 * import { OpenAiCompatToolChatMessage } from "@beep/openai-compat"
 *
 * const message = OpenAiCompatToolChatMessage.make({
 *   content: "{}",
 *   role: "tool",
 *   tool_call_id: "call_1"
 * })
 *
 * void message
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatToolChatMessage extends S.Class<OpenAiCompatToolChatMessage>($I`OpenAiCompatToolChatMessage`)(
  {
    content: OpenAiCompatChatContent.pipe(S.NullOr, S.optionalKey),
    name: S.optionalKey(S.String),
    role: S.tag("tool"),
    tool_call_id: S.optionalKey(S.String),
  },
  $I.annote("OpenAiCompatToolChatMessage", {
    description: "Tool chat message accepted by OpenAI-compatible chat completion endpoints.",
  })
) {}

/**
 * Chat message accepted by OpenAI-compatible chat completion endpoints.
 *
 * @example
 * ```ts
 * import type { OpenAiCompatChatMessage } from "@beep/openai-compat"
 *
 * const message: OpenAiCompatChatMessage = {
 *   content: "Hello",
 *   role: "user"
 * }
 *
 * void message
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OpenAiCompatChatMessage = OpenAiCompatChatRole.mapMembers(
  Tuple.evolve([
    () => OpenAiCompatSystemChatMessage,
    () => OpenAiCompatUserChatMessage,
    () => OpenAiCompatAssistantChatMessage,
    () => OpenAiCompatToolChatMessage,
  ])
).pipe(
  $I.annoteSchema("OpenAiCompatChatMessage", {
    description: "Role-discriminated chat message accepted by OpenAI-compatible chat completion endpoints.",
  }),
  S.toTaggedUnion("role")
);

/**
 * Chat message accepted by OpenAI-compatible chat completion endpoints.
 *
 * @example
 * ```ts
 * import type { OpenAiCompatChatMessage } from "@beep/openai-compat"
 *
 * const message: OpenAiCompatChatMessage = {
 *   content: "Hello",
 *   role: "user"
 * }
 *
 * void message
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OpenAiCompatChatMessage = typeof OpenAiCompatChatMessage.Type;

/**
 * JSON schema response-format details for chat completion requests.
 *
 * @example
 * ```ts
 * import { OpenAiCompatJsonSchemaDefinition } from "@beep/openai-compat"
 *
 * const definition = OpenAiCompatJsonSchemaDefinition.make({
 *   name: "Answer",
 *   schema: { type: "object" },
 *   strict: true
 * })
 *
 * void definition
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatJsonSchemaDefinition extends S.Class<OpenAiCompatJsonSchemaDefinition>(
  $I`OpenAiCompatJsonSchemaDefinition`
)(
  {
    description: S.optionalKey(S.String),
    name: S.String,
    schema: S.Record(S.String, S.Unknown),
    strict: S.optionalKey(S.Boolean),
  },
  $I.annote("OpenAiCompatJsonSchemaDefinition", {
    description: "JSON schema response-format details for chat completion requests.",
  })
) {}

/**
 * Structured response format configuration for chat completion requests.
 *
 * @example
 * ```ts
 * import { OpenAiCompatJsonSchemaResponseFormat } from "@beep/openai-compat"
 *
 * const format = OpenAiCompatJsonSchemaResponseFormat.make({
 *   json_schema: { name: "Answer", schema: { type: "object" }, strict: true },
 *   type: "json_schema"
 * })
 *
 * void format
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatJsonSchemaResponseFormat extends S.Class<OpenAiCompatJsonSchemaResponseFormat>(
  $I`OpenAiCompatJsonSchemaResponseFormat`
)(
  {
    json_schema: OpenAiCompatJsonSchemaDefinition,
    type: S.tag("json_schema"),
  },
  $I.annote("OpenAiCompatJsonSchemaResponseFormat", {
    description: "Structured response format configuration for chat completion requests.",
  })
) {}

/**
 * Response format discriminator accepted by OpenAI-compatible chat completion requests.
 *
 * @example
 * ```ts
 * import { OpenAiCompatResponseFormatKind } from "@beep/openai-compat"
 *
 * const isJsonSchema = OpenAiCompatResponseFormatKind.is.json_schema("json_schema")
 *
 * void isJsonSchema
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OpenAiCompatResponseFormatKind = LiteralKit(["text", "json_object", "json_schema"] as const).pipe(
  $I.annoteSchema("OpenAiCompatResponseFormatKind", {
    description: "Response format discriminator accepted by OpenAI-compatible chat completion requests.",
  })
);

/**
 * Type for {@link OpenAiCompatResponseFormatKind}.
 *
 * @example
 * ```ts
 * import type { OpenAiCompatResponseFormatKind } from "@beep/openai-compat"
 *
 * const kind: OpenAiCompatResponseFormatKind = "json_object"
 *
 * void kind
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OpenAiCompatResponseFormatKind = typeof OpenAiCompatResponseFormatKind.Type;

/**
 * Text response format configuration.
 *
 * @example
 * ```ts
 * import { OpenAiCompatTextResponseFormat } from "@beep/openai-compat"
 *
 * const format = OpenAiCompatTextResponseFormat.make({ type: "text" })
 *
 * void format
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatTextResponseFormat extends S.Class<OpenAiCompatTextResponseFormat>(
  $I`OpenAiCompatTextResponseFormat`
)(
  {
    type: S.tag("text"),
  },
  $I.annote("OpenAiCompatTextResponseFormat", {
    description: "Text response format configuration.",
  })
) {}

/**
 * JSON object response format configuration.
 *
 * @example
 * ```ts
 * import { OpenAiCompatJsonObjectResponseFormat } from "@beep/openai-compat"
 *
 * const format = OpenAiCompatJsonObjectResponseFormat.make({ type: "json_object" })
 *
 * void format
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatJsonObjectResponseFormat extends S.Class<OpenAiCompatJsonObjectResponseFormat>(
  $I`OpenAiCompatJsonObjectResponseFormat`
)(
  {
    type: S.tag("json_object"),
  },
  $I.annote("OpenAiCompatJsonObjectResponseFormat", {
    description: "JSON object response format configuration.",
  })
) {}

/**
 * Response format configuration accepted by OpenAI-compatible chat completion requests.
 *
 * @example
 * ```ts
 * import type { OpenAiCompatResponseFormat } from "@beep/openai-compat"
 *
 * const format: OpenAiCompatResponseFormat = { type: "json_object" }
 *
 * void format
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const OpenAiCompatResponseFormat = OpenAiCompatResponseFormatKind.mapMembers(
  Tuple.evolve([
    () => OpenAiCompatTextResponseFormat,
    () => OpenAiCompatJsonObjectResponseFormat,
    () => OpenAiCompatJsonSchemaResponseFormat,
  ])
).pipe(
  $I.annoteSchema("OpenAiCompatResponseFormat", {
    description: "Response format configuration accepted by OpenAI-compatible chat completion requests.",
  }),
  S.toTaggedUnion("type")
);

/**
 * Response format configuration accepted by OpenAI-compatible chat completion requests.
 *
 * @example
 * ```ts
 * import type { OpenAiCompatResponseFormat } from "@beep/openai-compat"
 *
 * const format: OpenAiCompatResponseFormat = { type: "text" }
 *
 * void format
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OpenAiCompatResponseFormat = typeof OpenAiCompatResponseFormat.Type;

/**
 * Chat completion request sent to OpenAI-compatible providers.
 *
 * @example
 * ```ts
 * import { OpenAiCompatChatCompletionRequest } from "@beep/openai-compat"
 *
 * const request = OpenAiCompatChatCompletionRequest.make({
 *   messages: [{ content: "Hello", role: "user" }],
 *   model: "gpt-compatible"
 * })
 *
 * void request
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatChatCompletionRequest extends S.Class<OpenAiCompatChatCompletionRequest>(
  $I`OpenAiCompatChatCompletionRequest`
)(
  {
    frequency_penalty: S.Number.pipe(S.optionalKey),
    max_completion_tokens: S.Number.pipe(S.optionalKey),
    max_tokens: S.Number.pipe(S.optionalKey),
    messages: S.Array(OpenAiCompatChatMessage),
    model: S.String,
    parallel_tool_calls: S.Boolean.pipe(S.optionalKey),
    presence_penalty: S.Number.pipe(S.optionalKey),
    response_format: S.optionalKey(OpenAiCompatResponseFormat),
    seed: S.Number.pipe(S.optionalKey),
    stream: S.Boolean.pipe(S.optionalKey),
    stream_options: S.optionalKey(S.Record(S.String, S.Unknown)),
    temperature: S.Number.pipe(S.NullOr, S.optionalKey),
    tool_choice: S.optionalKey(S.Unknown),
    tools: OpenAiCompatFunctionTool.pipe(S.Array, S.optionalKey),
    top_p: S.Number.pipe(S.NullOr, S.optionalKey),
    user: S.optionalKey(S.String),
  },
  $I.annote("OpenAiCompatChatCompletionRequest", {
    description: "Chat completion request sent to OpenAI-compatible providers.",
  })
) {}

/**
 * Assistant message returned by OpenAI-compatible chat completion endpoints.
 *
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import { OpenAiCompatAssistantMessage } from "@beep/openai-compat"
 *
 * const message = OpenAiCompatAssistantMessage.make({
 *   content: O.some("Done"),
 *   role: "assistant"
 * })
 *
 * void message
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatAssistantMessage extends S.Class<OpenAiCompatAssistantMessage>(
  $I`OpenAiCompatAssistantMessage`
)(
  {
    content: OptionalNullableString,
    role: S.optionalKey(S.Literal("assistant")),
    tool_calls: OpenAiCompatToolCall.pipe(
      S.Array,
      S.OptionFromOptionalKey,
      S.withConstructorDefault(Effect.succeed(O.none<ReadonlyArray<OpenAiCompatToolCall>>()))
    ),
  },
  $I.annote("OpenAiCompatAssistantMessage", {
    description: "Assistant message returned by OpenAI-compatible chat completion endpoints.",
  })
) {}

/**
 * Delta message returned by OpenAI-compatible chat completion streams.
 *
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import { OpenAiCompatAssistantDelta } from "@beep/openai-compat"
 *
 * const delta = OpenAiCompatAssistantDelta.make({
 *   content: O.some("Hi "),
 *   role: "assistant"
 * })
 *
 * void delta
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatAssistantDelta extends S.Class<OpenAiCompatAssistantDelta>($I`OpenAiCompatAssistantDelta`)(
  {
    content: OptionalNullableString,
    role: S.optionalKey(S.Literal("assistant")),
    tool_calls: OpenAiCompatToolCallDelta.pipe(
      S.Array,
      S.OptionFromOptionalKey,
      S.withConstructorDefault(Effect.succeed(O.none<ReadonlyArray<OpenAiCompatToolCallDelta>>()))
    ),
  },
  $I.annote("OpenAiCompatAssistantDelta", {
    description: "Delta message returned by OpenAI-compatible chat completion streams.",
  })
) {}

/**
 * Token usage returned by OpenAI-compatible chat completion endpoints.
 *
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import { OpenAiCompatUsage } from "@beep/openai-compat"
 *
 * const usage = OpenAiCompatUsage.make({
 *   completion_tokens: O.some(2),
 *   prompt_tokens: O.some(1),
 *   total_tokens: O.some(3)
 * })
 *
 * void usage
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatUsage extends S.Class<OpenAiCompatUsage>($I`OpenAiCompatUsage`)(
  {
    completion_tokens: OptionalNumber,
    prompt_tokens: OptionalNumber,
    prompt_tokens_details: OptionalUnknownRecord,
    total_tokens: OptionalNumber,
  },
  $I.annote("OpenAiCompatUsage", {
    description: "Token usage returned by OpenAI-compatible chat completion endpoints.",
  })
) {}

/**
 * Chat completion choice returned by OpenAI-compatible endpoints.
 *
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import { OpenAiCompatAssistantMessage, OpenAiCompatChatCompletionChoice } from "@beep/openai-compat"
 *
 * const choice = OpenAiCompatChatCompletionChoice.make({
 *   finish_reason: O.some("stop"),
 *   index: 0,
 *   message: O.some(OpenAiCompatAssistantMessage.make({ content: O.some("Hello"), role: "assistant" }))
 * })
 *
 * void choice
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatChatCompletionChoice extends S.Class<OpenAiCompatChatCompletionChoice>(
  $I`OpenAiCompatChatCompletionChoice`
)(
  {
    finish_reason: OptionalNullableString,
    index: S.optionalKey(S.Number),
    message: S.OptionFromOptionalKey(OpenAiCompatAssistantMessage).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<OpenAiCompatAssistantMessage>()))
    ),
  },
  $I.annote("OpenAiCompatChatCompletionChoice", {
    description: "Chat completion choice returned by OpenAI-compatible endpoints.",
  })
) {}

/**
 * Chat completion response returned by OpenAI-compatible endpoints.
 *
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import {
 *   OpenAiCompatAssistantMessage,
 *   OpenAiCompatChatCompletionChoice,
 *   OpenAiCompatChatCompletionResponse
 * } from "@beep/openai-compat"
 *
 * const response = OpenAiCompatChatCompletionResponse.make({
 *   choices: [
 *     OpenAiCompatChatCompletionChoice.make({
 *       finish_reason: O.some("stop"),
 *       index: 0,
 *       message: O.some(OpenAiCompatAssistantMessage.make({ content: O.some("Hello") }))
 *     })
 *   ]
 * })
 *
 * void response
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatChatCompletionResponse extends S.Class<OpenAiCompatChatCompletionResponse>(
  $I`OpenAiCompatChatCompletionResponse`
)(
  {
    choices: S.Array(OpenAiCompatChatCompletionChoice),
    id: S.optionalKey(S.String),
    model: S.optionalKey(S.String),
    usage: S.OptionFromOptionalKey(OpenAiCompatUsage).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<OpenAiCompatUsage>()))
    ),
  },
  $I.annote("OpenAiCompatChatCompletionResponse", {
    description: "Chat completion response returned by OpenAI-compatible endpoints.",
  })
) {}

/**
 * Stream chunk choice returned by OpenAI-compatible endpoints.
 *
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import { OpenAiCompatAssistantDelta, OpenAiCompatChatCompletionChunkChoice } from "@beep/openai-compat"
 *
 * const choice = OpenAiCompatChatCompletionChunkChoice.make({
 *   delta: O.some(OpenAiCompatAssistantDelta.make({ content: O.some("Hi ") })),
 *   index: 0
 * })
 *
 * void choice
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatChatCompletionChunkChoice extends S.Class<OpenAiCompatChatCompletionChunkChoice>(
  $I`OpenAiCompatChatCompletionChunkChoice`
)(
  {
    delta: S.OptionFromOptionalKey(OpenAiCompatAssistantDelta).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<OpenAiCompatAssistantDelta>()))
    ),
    finish_reason: OptionalNullableString,
    index: S.optionalKey(S.Number),
  },
  $I.annote("OpenAiCompatChatCompletionChunkChoice", {
    description: "Stream chunk choice returned by OpenAI-compatible endpoints.",
  })
) {}

/**
 * Stream chunk returned by OpenAI-compatible chat completion endpoints.
 *
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import {
 *   OpenAiCompatAssistantDelta,
 *   OpenAiCompatChatCompletionChunk,
 *   OpenAiCompatChatCompletionChunkChoice
 * } from "@beep/openai-compat"
 *
 * const chunk = OpenAiCompatChatCompletionChunk.make({
 *   choices: [
 *     OpenAiCompatChatCompletionChunkChoice.make({
 *       delta: O.some(OpenAiCompatAssistantDelta.make({ content: O.some("Hi ") })),
 *       index: 0
 *     })
 *   ]
 * })
 *
 * void chunk
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatChatCompletionChunk extends S.Class<OpenAiCompatChatCompletionChunk>(
  $I`OpenAiCompatChatCompletionChunk`
)(
  {
    choices: S.Array(OpenAiCompatChatCompletionChunkChoice),
    id: S.optionalKey(S.String),
    model: S.optionalKey(S.String),
    usage: S.OptionFromOptionalKey(OpenAiCompatUsage).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<OpenAiCompatUsage>()))
    ),
  },
  $I.annote("OpenAiCompatChatCompletionChunk", {
    description: "Stream chunk returned by OpenAI-compatible chat completion endpoints.",
  })
) {}

/**
 * Decodes an unknown value into an OpenAI-compatible chat completion response.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { decodeChatCompletionResponse } from "@beep/openai-compat"
 *
 * const decoded = Effect.runSync(decodeChatCompletionResponse({ choices: [] }))
 *
 * void decoded
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export const decodeChatCompletionResponse = S.decodeUnknownEffect(OpenAiCompatChatCompletionResponse);

/**
 * Decodes an unknown value into an OpenAI-compatible chat completion stream chunk.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { decodeChatCompletionChunk } from "@beep/openai-compat"
 *
 * const decoded = Effect.runSync(decodeChatCompletionChunk({ choices: [] }))
 *
 * void decoded
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export const decodeChatCompletionChunk = S.decodeUnknownEffect(OpenAiCompatChatCompletionChunk);
