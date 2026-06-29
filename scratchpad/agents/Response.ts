/**
 * Defines a shared data model for AI model output.
 *
 * Responses are represented as typed parts so different providers can expose
 * text, reasoning, tool calls, files, sources, metadata, finish information, and
 * errors through one shape. The same model is used for complete responses and
 * streaming responses, where start, delta, and end parts describe content as it
 * arrives. This module also carries provider metadata and schemas used by tools
 * that need to validate response parts.
 *
 * @since 0.0.0
 */

import { $AgentsDomainId } from "@beep/identity/packages";
import { P } from "@beep/utils";
import type { DateTime } from "effect";
import { Effect, SchemaTransformation } from "effect";
import { identity } from "effect/Function";
import * as S from "effect/Schema";
import type * as Tool from "./Tool.ts";
import type * as Toolkit from "./Toolkit.ts";

const $I = $AgentsDomainId.create("Response");

const PartTypeId = "~effect/ai/Content/Part" as const;

// =============================================================================
// All Parts
// =============================================================================

/**
 * Type guard to check if a value is a Response Part.
 *
 * @category guards
 * @since 0.0.0
 */
export const isPart = (u: unknown): u is AnyPart => P.hasProperty(u, PartTypeId);

/**
 * Union type representing all possible response content parts.
 *
 * @category models
 * @since 0.0.0
 */
export type AnyPart =
  | TextPart
  | TextStartPart
  | TextDeltaPart
  | TextEndPart
  | ReasoningPart
  | ReasoningStartPart
  | ReasoningDeltaPart
  | ReasoningEndPart
  | ToolParamsStartPart
  | ToolParamsDeltaPart
  | ToolParamsEndPart
  | ToolCallPart<any, any>
  | ToolResultPart<any, any, any>
  | ToolApprovalRequestPart
  | FilePart
  | DocumentSourcePart
  | UrlSourcePart
  | ResponseMetadataPart
  | FinishPart
  | ErrorPart;

/**
 * Encoded representation of all possible response content parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export type AnyPartEncoded =
  | TextPartEncoded
  | TextStartPartEncoded
  | TextDeltaPartEncoded
  | TextEndPartEncoded
  | ReasoningPartEncoded
  | ReasoningStartPartEncoded
  | ReasoningDeltaPartEncoded
  | ReasoningEndPartEncoded
  | ToolParamsStartPartEncoded
  | ToolParamsDeltaPartEncoded
  | ToolParamsEndPartEncoded
  | ToolCallPartEncoded
  | ToolResultPartEncoded
  | ToolApprovalRequestPartEncoded
  | FilePartEncoded
  | DocumentSourcePartEncoded
  | UrlSourcePartEncoded
  | ResponseMetadataPartEncoded
  | FinishPartEncoded
  | ErrorPartEncoded;

/**
 * Union type for all response parts with tool-specific typing.
 *
 * @category models
 * @since 0.0.0
 */
export type AllParts<Tools extends Record<string, Tool.Any>> =
  | TextPart
  | TextStartPart
  | TextDeltaPart
  | TextEndPart
  | ReasoningPart
  | ReasoningStartPart
  | ReasoningDeltaPart
  | ReasoningEndPart
  | ToolParamsStartPart
  | ToolParamsDeltaPart
  | ToolParamsEndPart
  | ToolCallParts<Tools>
  | ToolResultParts<Tools>
  | ToolApprovalRequestPart
  | FilePart
  | DocumentSourcePart
  | UrlSourcePart
  | ResponseMetadataPart
  | FinishPart
  | ErrorPart;

/**
 * Encoded representation of all response parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export type AllPartsEncoded =
  | TextPartEncoded
  | TextStartPartEncoded
  | TextDeltaPartEncoded
  | TextEndPartEncoded
  | ReasoningPartEncoded
  | ReasoningStartPartEncoded
  | ReasoningDeltaPartEncoded
  | ReasoningEndPartEncoded
  | ToolParamsStartPartEncoded
  | ToolParamsDeltaPartEncoded
  | ToolParamsEndPartEncoded
  | ToolCallPartEncoded
  | ToolResultPartEncoded
  | ToolApprovalRequestPartEncoded
  | FilePartEncoded
  | DocumentSourcePartEncoded
  | UrlSourcePartEncoded
  | ResponseMetadataPartEncoded
  | FinishPartEncoded
  | ErrorPartEncoded;

/**
 * Creates a Schema for all response parts based on a toolkit.
 *
 * **Details**
 *
 * Generates a schema that includes all possible response parts, with tool call
 * and tool result parts dynamically created based on the provided toolkit.
 *
 * @example Building a response parts schema
 *
 * ```ts
 * import * as S from "effect/Schema"
 * import { Response, Tool, Toolkit } from "effect/unstable/ai"
 *
 * const myToolkit = Toolkit.make(
 *   Tool.make("GetWeather", {
 *     parameters: S.Struct({ city: S.String }),
 *     success: S.Struct({ temperature: S.Finite })
 *   })
 * )
 *
 * const allPartsSchema = Response.AllParts(myToolkit)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const AllParts = <T extends Toolkit.Any | Toolkit.WithHandler<any>>(
  toolkit: T
): S.Codec<
  AllParts<T extends Toolkit.Any ? Toolkit.Tools<T> : Toolkit.WithHandlerTools<T>>,
  AllPartsEncoded,
  Tool.ResultDecodingServices<Toolkit.Tools<T>[keyof Toolkit.Tools<T>]>,
  Tool.ResultEncodingServices<Toolkit.Tools<T>[keyof Toolkit.Tools<T>]>
> => {
  const toolCalls: Array<S.Top> = [];
  const toolResults: Array<S.Top> = [];
  for (const tool of Object.values(toolkit.tools as Record<string, Tool.Any>)) {
    const toolCall = ToolCallPart(tool.name, tool.parametersSchema);
    const toolResult = ToolResultPart(tool.name, tool.successSchema, tool.failureSchema);
    toolCalls.push(toolCall);
    toolResults.push(toolResult);
  }
  return S.Union([
    TextPart,
    TextStartPart,
    TextDeltaPart,
    TextEndPart,
    ReasoningPart,
    ReasoningStartPart,
    ReasoningDeltaPart,
    ReasoningEndPart,
    ToolParamsStartPart,
    ToolParamsDeltaPart,
    ToolParamsEndPart,
    ToolApprovalRequestPart,
    FilePart,
    DocumentSourcePart,
    UrlSourcePart,
    ResponseMetadataPart,
    FinishPart,
    ErrorPart,
    ...toolCalls,
    ...toolResults,
  ]) as any;
};

// =============================================================================
// Parts
// =============================================================================

/**
 * A type for representing non-streaming response parts with tool-specific
 * typing.
 *
 * @category models
 * @since 0.0.0
 */
export type Part<Tools extends Record<string, Tool.Any>> =
  | TextPart
  | ReasoningPart
  | ToolCallParts<Tools>
  | ToolResultParts<Tools>
  | ToolApprovalRequestPart
  | FilePart
  | DocumentSourcePart
  | UrlSourcePart
  | ResponseMetadataPart
  | FinishPart;

/**
 * Encoded representation of non-streaming response parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export type PartEncoded =
  | TextPartEncoded
  | ReasoningPartEncoded
  | ReasoningDeltaPartEncoded
  | ReasoningEndPartEncoded
  | ToolCallPartEncoded
  | ToolResultPartEncoded
  | ToolApprovalRequestPartEncoded
  | FilePartEncoded
  | DocumentSourcePartEncoded
  | UrlSourcePartEncoded
  | ResponseMetadataPartEncoded
  | FinishPartEncoded;

/**
 * Creates a Schema for non-streaming response parts based on a toolkit.
 *
 * @category schemas
 * @since 0.0.0
 */
export const Part = <T extends Toolkit.Any | Toolkit.WithHandler<any>>(
  toolkit: T
): S.Codec<
  Part<T extends Toolkit.Any ? Toolkit.Tools<T> : Toolkit.WithHandlerTools<T>>,
  PartEncoded,
  Tool.ResultDecodingServices<Toolkit.Tools<T>[keyof Toolkit.Tools<T>]>,
  Tool.ResultEncodingServices<Toolkit.Tools<T>[keyof Toolkit.Tools<T>]>
> => {
  const toolCalls: Array<S.Top> = [];
  const toolResults: Array<S.Top> = [];
  for (const tool of Object.values(toolkit.tools as Record<string, Tool.Any>)) {
    const toolCall = ToolCallPart(tool.name, tool.parametersSchema);
    const toolResult = ToolResultPart(tool.name, tool.successSchema, tool.failureSchema);
    toolCalls.push(toolCall);
    toolResults.push(toolResult);
  }
  return S.Union([
    TextPart,
    ReasoningPart,
    ToolApprovalRequestPart,
    FilePart,
    DocumentSourcePart,
    UrlSourcePart,
    ResponseMetadataPart,
    FinishPart,
    ...toolCalls,
    ...toolResults,
  ]) as any;
};

// =============================================================================
// Stream Parts
// =============================================================================

/**
 * A type for representing streaming response parts with tool-specific typing.
 *
 * @category models
 * @since 0.0.0
 */
export type StreamPart<Tools extends Record<string, Tool.Any>> =
  | TextStartPart
  | TextDeltaPart
  | TextEndPart
  | ReasoningStartPart
  | ReasoningDeltaPart
  | ReasoningEndPart
  | ToolParamsStartPart
  | ToolParamsDeltaPart
  | ToolParamsEndPart
  | ToolCallParts<Tools>
  | ToolResultParts<Tools>
  | ToolApprovalRequestPart
  | FilePart
  | DocumentSourcePart
  | UrlSourcePart
  | ResponseMetadataPart
  | FinishPart
  | ErrorPart;

/**
 * Encoded representation of streaming response parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export type StreamPartEncoded =
  | TextStartPartEncoded
  | TextDeltaPartEncoded
  | TextEndPartEncoded
  | ReasoningStartPartEncoded
  | ReasoningDeltaPartEncoded
  | ReasoningEndPartEncoded
  | ToolParamsStartPartEncoded
  | ToolParamsDeltaPartEncoded
  | ToolParamsEndPartEncoded
  | ToolCallPartEncoded
  | ToolResultPartEncoded
  | ToolApprovalRequestPartEncoded
  | FilePartEncoded
  | DocumentSourcePartEncoded
  | UrlSourcePartEncoded
  | ResponseMetadataPartEncoded
  | FinishPartEncoded
  | ErrorPartEncoded;

/**
 * Creates a Schema for streaming response parts based on a toolkit.
 *
 * @category schemas
 * @since 0.0.0
 */
export const StreamPart = <T extends Toolkit.Any | Toolkit.WithHandler<any>>(
  toolkit: T
): S.Codec<
  StreamPart<T extends Toolkit.Any ? Toolkit.Tools<T> : Toolkit.WithHandlerTools<T>>,
  StreamPartEncoded,
  Tool.ResultDecodingServices<Toolkit.Tools<T>[keyof Toolkit.Tools<T>]>,
  Tool.ResultEncodingServices<Toolkit.Tools<T>[keyof Toolkit.Tools<T>]>
> => {
  const toolCalls: Array<S.Top> = [];
  const toolResults: Array<S.Top> = [];
  for (const tool of Object.values(toolkit.tools as Record<string, Tool.Any>)) {
    const toolCall = ToolCallPart(tool.name, tool.parametersSchema);
    const toolResult = ToolResultPart(tool.name, tool.successSchema, tool.failureSchema);
    toolCalls.push(toolCall);
    toolResults.push(toolResult);
  }
  return S.Union([
    TextStartPart,
    TextDeltaPart,
    TextEndPart,
    ReasoningStartPart,
    ReasoningDeltaPart,
    ReasoningEndPart,
    ToolParamsStartPart,
    ToolParamsDeltaPart,
    ToolParamsEndPart,
    ToolApprovalRequestPart,
    FilePart,
    DocumentSourcePart,
    UrlSourcePart,
    ResponseMetadataPart,
    FinishPart,
    ErrorPart,
    ...toolCalls,
    ...toolResults,
  ]) as any;
};

// =============================================================================
// utility types
// =============================================================================

/**
 * Utility type that extracts tool call parts from a set of tools.
 *
 * @category type-level
 * @since 0.0.0
 */
export type ToolCallParts<Tools extends Record<string, Tool.Any>> = {
  [Name in keyof Tools]: Name extends string ? ToolCallPart<Name, Tool.Parameters<Tools[Name]>> : never;
}[keyof Tools];

/**
 * Utility type that extracts tool result parts from a set of tools.
 *
 * @category type-level
 * @since 0.0.0
 */
export type ToolResultParts<Tools extends Record<string, Tool.Any>> = {
  [Name in keyof Tools]: Name extends string
    ? ToolResultPart<Name, Tool.Success<Tools[Name]>, Tool.FailureResult<Tools[Name]>>
    : never;
}[keyof Tools];

// =============================================================================
// Base Part
// =============================================================================

/**
 * Schema for provider-specific metadata attached to response parts,
 * represented as a record from provider-specific keys to JSON values or `null`.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ProviderMetadata: S.$Record<S.String, S.NullOr<S.Codec<S.Json>>> = S.Record(
  S.String,
  S.NullOr(S.Json)
).pipe(
  $I.annoteSchema("ProviderMetadata", {
    description: "Provider-specific metadata attached to response parts, mapping provider keys to JSON values or null.",
  })
);

/**
 * Type of provider-specific metadata attached to response parts, keyed by
 * provider-specific names with JSON or `null` values.
 *
 * @category models
 * @since 0.0.0
 */
export type ProviderMetadata = typeof ProviderMetadata.Type;

/**
 * Base interface for all response content parts, including the type identifier
 * and optional metadata.
 *
 * @category models
 * @since 0.0.0
 */
export interface BasePart<Type extends string, Metadata extends ProviderMetadata> {
  readonly [PartTypeId]: typeof PartTypeId;
  /**
   * The type of this response part.
   */
  readonly type: Type;
  /**
   * Optional provider-specific metadata for this part.
   */
  readonly metadata: Metadata;
}

/**
 * Base interface for encoded response content parts.
 *
 * @category models
 * @since 0.0.0
 */
export interface BasePartEncoded<Type extends string, Metadata extends ProviderMetadata> {
  /**
   * The type of this response part.
   */
  readonly type: Type;
  /**
   * Optional provider-specific metadata for this part.
   */
  readonly metadata?: Metadata | undefined;
}

const BasePart = S.Struct({
  [PartTypeId]: S.tag(PartTypeId).pipe(
    S.withDecodingDefaultKey(Effect.succeed(PartTypeId), { encodingStrategy: "omit" })
  ),
  metadata: ProviderMetadata.pipe(S.withDecodingDefault(Effect.succeed({}))),
});

/**
 * Creates a new response content part of the specified type.
 *
 * @example Creating response content parts
 *
 * ```ts
 * import { Response } from "effect/unstable/ai"
 *
 * const textPart = Response.makePart("text", {
 *   text: "Hello, world!"
 * })
 *
 * const toolCallPart = Response.makePart("tool-call", {
 *   id: "call_123",
 *   name: "get_weather",
 *   params: { city: "San Francisco" },
 *   providerExecuted: false
 * })
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makePart = <const Type extends AnyPart["type"]>(
  /**
   * The type of part to create.
   */
  type: Type,
  /**
   * Parameters specific to the part type being created.
   */
  params: Omit<Extract<AnyPart, { type: Type }>, typeof PartTypeId | "type" | "metadata"> & {
    /**
     * Optional provider-specific metadata for this part.
     */
    readonly metadata?: Extract<AnyPart, { type: Type }>["metadata"] | undefined;
  }
): Extract<AnyPart, { type: Type }> =>
  ({
    ...params,
    [PartTypeId]: PartTypeId,
    type,
    metadata: params.metadata ?? {},
  }) as any;

/**
 * A utility type for specifying the parameters required to construct a
 * specific response part.
 *
 * @category type-level
 * @since 0.0.0
 */
export type ConstructorParams<Part extends AnyPart> = Omit<
  Part,
  typeof PartTypeId | "type" | "sourceType" | "metadata"
> & {
  /**
   * Optional provider-specific metadata for this part.
   */
  readonly metadata?: Part["metadata"] | undefined;
};

// =============================================================================
// Text Part
// =============================================================================

/**
 * Response part representing plain text content.
 *
 * @example Creating a text part
 *
 * ```ts
 * import { Response } from "effect/unstable/ai"
 *
 * const textPart: Response.TextPart = Response.makePart("text", {
 *   text: "The answer to your question is 42."
 * })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface TextPart extends BasePart<"text", TextPartMetadata> {
  /**
   * The text content.
   */
  readonly text: string;
}

/**
 * Encoded representation of text parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface TextPartEncoded extends BasePartEncoded<"text", TextPartMetadata> {
  /**
   * The text content.
   */
  readonly text: string;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `TextPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface TextPartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of text parts.
 *
 * @category schemas
 * @since 0.0.0
 */
export const TextPart: S.Struct<{
  readonly type: S.tag<"text">;
  readonly text: S.String;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("text"),
  text: S.String,
}).annotate(
  $I.annote("TextPart", {
    description: "Schema for validation and encoding of plain text response parts.",
  })
) satisfies S.Codec<TextPart, TextPartEncoded>;

// =============================================================================
// Text Start Part
// =============================================================================

/**
 * Response part indicating the start of streaming text content with a unique
 * text chunk identifier.
 *
 * @category models
 * @since 0.0.0
 */
export interface TextStartPart extends BasePart<"text-start", TextStartPartMetadata> {
  /**
   * Unique identifier for this text chunk.
   */
  readonly id: string;
}

/**
 * Encoded representation of text start parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface TextStartPartEncoded extends BasePartEncoded<"text-start", TextStartPartMetadata> {
  /**
   * Unique identifier for this text chunk.
   */
  readonly id: string;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `TextStartPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface TextStartPartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of text start parts.
 *
 * @category schemas
 * @since 0.0.0
 */
export const TextStartPart: S.Struct<{
  readonly type: S.tag<"text-start">;
  readonly id: S.String;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("text-start"),
  id: S.String,
}).annotate(
  $I.annote("TextStartPart", {
    description: "Schema for validation and encoding of streaming text start parts.",
  })
) satisfies S.Codec<TextStartPart, TextStartPartEncoded>;

// =============================================================================
// Text Delta Part
// =============================================================================

/**
 * Response part containing incremental text content to be added to the existing
 * text chunk with the same unique identifier.
 *
 * @category models
 * @since 0.0.0
 */
export interface TextDeltaPart extends BasePart<"text-delta", TextDeltaPartMetadata> {
  /**
   * Unique identifier matching the corresponding text chunk.
   */
  readonly id: string;
  /**
   * The incremental text content to add.
   */
  readonly delta: string;
}

/**
 * Encoded representation of text delta parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface TextDeltaPartEncoded extends BasePartEncoded<"text-delta", TextDeltaPartMetadata> {
  /**
   * Unique identifier matching the corresponding text chunk.
   */
  readonly id: string;
  /**
   * The incremental text content to add.
   */
  readonly delta: string;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `TextDeltaPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface TextDeltaPartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of text delta parts.
 *
 * @category schemas
 * @since 0.0.0
 */
export const TextDeltaPart: S.Struct<{
  readonly type: S.tag<"text-delta">;
  readonly id: S.String;
  readonly delta: S.String;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("text-delta"),
  id: S.String,
  delta: S.String,
}).annotate(
  $I.annote("TextDeltaPart", {
    description: "Schema for validation and encoding of incremental text delta parts.",
  })
) satisfies S.Codec<TextDeltaPart, TextDeltaPartEncoded>;

// =============================================================================
// Text End Part
// =============================================================================

/**
 * Response part indicating the completion of a streaming text chunk.
 *
 * @category models
 * @since 0.0.0
 */
export interface TextEndPart extends BasePart<"text-end", TextEndPartMetadata> {
  /**
   * Unique identifier matching the corresponding text chunk.
   */
  readonly id: string;
}

/**
 * Encoded representation of text end parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface TextEndPartEncoded extends BasePartEncoded<"text-end", TextEndPartMetadata> {
  /**
   * Unique identifier matching the corresponding text chunk.
   */
  readonly id: string;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `TextEndPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface TextEndPartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of text end parts.
 *
 * @category schemas
 * @since 0.0.0
 */
export const TextEndPart: S.Struct<{
  readonly type: S.tag<"text-end">;
  readonly id: S.String;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("text-end"),
  id: S.String,
}).annotate(
  $I.annote("TextEndPart", {
    description: "Schema for validation and encoding of streaming text end parts.",
  })
) satisfies S.Codec<TextEndPart, TextEndPartEncoded>;

// =============================================================================
// Reasoning Part
// =============================================================================

/**
 * Response part carrying provider-supplied reasoning text, such as an exposed
 * reasoning summary or explanation. Do not assume it contains hidden
 * chain-of-thought.
 *
 * @example Creating a reasoning part
 *
 * ```ts
 * import { Response } from "effect/unstable/ai"
 *
 * const reasoningPart: Response.ReasoningPart = Response.makePart("reasoning", {
 *   text:
 *     "Let me think step by step: First I need to analyze the user's question..."
 * })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface ReasoningPart extends BasePart<"reasoning", ReasoningPartMetadata> {
  /**
   * The reasoning or thought process text.
   */
  readonly text: string;
}

/**
 * Encoded representation of reasoning parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface ReasoningPartEncoded extends BasePartEncoded<"reasoning", ReasoningPartMetadata> {
  /**
   * The reasoning or thought process text.
   */
  readonly text: string;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `ReasoningPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface ReasoningPartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of reasoning parts.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ReasoningPart: S.Struct<{
  readonly type: S.tag<"reasoning">;
  readonly text: S.String;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("reasoning"),
  text: S.String,
}).annotate(
  $I.annote("ReasoningPart", {
    description: "Schema for validation and encoding of provider-supplied reasoning response parts.",
  })
) satisfies S.Codec<ReasoningPart, ReasoningPartEncoded>;

// =============================================================================
// Reasoning Start Part
// =============================================================================

/**
 * Response part indicating the start of streaming reasoning content with a
 * unique reasoning chunk identifier.
 *
 * @category models
 * @since 0.0.0
 */
export interface ReasoningStartPart extends BasePart<"reasoning-start", ReasoningStartPartMetadata> {
  /**
   * Unique identifier for this reasoning chunk.
   */
  readonly id: string;
}

/**
 * Encoded representation of reasoning start parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface ReasoningStartPartEncoded extends BasePartEncoded<"reasoning-start", ReasoningStartPartMetadata> {
  /**
   * Unique identifier for this reasoning stream.
   */
  readonly id: string;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `ReasoningStartPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface ReasoningStartPartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of reasoning start parts.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ReasoningStartPart: S.Struct<{
  readonly type: S.tag<"reasoning-start">;
  readonly id: S.String;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("reasoning-start"),
  id: S.String,
}).annotate(
  $I.annote("ReasoningStartPart", {
    description: "Schema for validation and encoding of streaming reasoning start parts.",
  })
) satisfies S.Codec<ReasoningStartPart, ReasoningStartPartEncoded>;

// =============================================================================
// Reasoning Delta Part
// =============================================================================

/**
 * Response part containing incremental reasoning content to be added to the
 * existing chunk of reasoning text with the same unique identifier.
 *
 * @category models
 * @since 0.0.0
 */
export interface ReasoningDeltaPart extends BasePart<"reasoning-delta", ReasoningDeltaPartMetadata> {
  /**
   * Unique identifier matching the corresponding reasoning chunk.
   */
  readonly id: string;
  /**
   * The incremental reasoning content to add.
   */
  readonly delta: string;
}

/**
 * Encoded representation of reasoning delta parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface ReasoningDeltaPartEncoded extends BasePartEncoded<"reasoning-delta", ReasoningDeltaPartMetadata> {
  /**
   * Unique identifier matching the corresponding reasoning chunk.
   */
  readonly id: string;
  /**
   * The incremental reasoning content to add.
   */
  readonly delta: string;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `ReasoningDeltaPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface ReasoningDeltaPartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of reasoning delta parts.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ReasoningDeltaPart: S.Struct<{
  readonly type: S.tag<"reasoning-delta">;
  readonly id: S.String;
  readonly delta: S.String;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("reasoning-delta"),
  id: S.String,
  delta: S.String,
}).annotate(
  $I.annote("ReasoningDeltaPart", {
    description: "Schema for validation and encoding of incremental reasoning delta parts.",
  })
) satisfies S.Codec<ReasoningDeltaPart, ReasoningDeltaPartEncoded>;

// =============================================================================
// Reasoning End Part
// =============================================================================

/**
 * Response part indicating the completion of a streaming reasoning chunk.
 *
 * @category models
 * @since 0.0.0
 */
export interface ReasoningEndPart extends BasePart<"reasoning-end", ReasoningEndPartMetadata> {
  /**
   * Unique identifier matching the corresponding reasoning chunk.
   */
  readonly id: string;
}

/**
 * Encoded representation of reasoning end parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface ReasoningEndPartEncoded extends BasePartEncoded<"reasoning-end", ReasoningEndPartMetadata> {
  /**
   * Unique identifier matching the corresponding reasoning chunk.
   */
  readonly id: string;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `ReasoningEndPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface ReasoningEndPartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of reasoning end parts.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ReasoningEndPart: S.Struct<{
  readonly type: S.tag<"reasoning-end">;
  readonly id: S.String;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("reasoning-end"),
  id: S.String,
}).annotate(
  $I.annote("ReasoningEndPart", {
    description: "Schema for validation and encoding of streaming reasoning end parts.",
  })
) satisfies S.Codec<ReasoningEndPart, ReasoningEndPartEncoded>;

// =============================================================================
// Tool Params Start Part
// =============================================================================

/**
 * Response part indicating the start of streaming tool parameters.
 *
 * **Details**
 *
 * Marks the beginning of tool parameter streaming with metadata about the tool
 * call.
 *
 * @category models
 * @since 0.0.0
 */
export interface ToolParamsStartPart extends BasePart<"tool-params-start", ToolParamsStartPartMetadata> {
  /**
   * Unique identifier for this tool parameter chunk.
   */
  readonly id: string;
  /**
   * Name of the tool being called, which corresponds to the name of the tool
   * in the `Toolkit` included with the request.
   */
  readonly name: string;
  /**
   * Whether the tool was executed by the provider (true) or framework (false).
   */
  readonly providerExecuted: boolean;
}

/**
 * Encoded representation of tool params start parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface ToolParamsStartPartEncoded extends BasePartEncoded<"tool-params-start", ToolParamsStartPartMetadata> {
  /**
   * Unique identifier for this tool parameter chunk.
   */
  readonly id: string;
  /**
   * Name of the tool being called, which corresponds to the name of the tool
   * in the `Toolkit` included with the request.
   */
  readonly name: string;
  /**
   * Whether the tool was executed by the provider (true) or framework (false).
   */
  readonly providerExecuted?: boolean;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `ToolParamsStartPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface ToolParamsStartPartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of tool params start parts.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ToolParamsStartPart: S.Struct<{
  readonly type: S.tag<"tool-params-start">;
  readonly id: S.String;
  readonly name: S.String;
  readonly providerExecuted: S.withDecodingDefaultKey<S.Boolean>;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("tool-params-start"),
  id: S.String,
  name: S.String,
  providerExecuted: S.Boolean.pipe(S.withDecodingDefaultKey(Effect.succeed(false))),
}).annotate(
  $I.annote("ToolParamsStartPart", {
    description: "Schema for validation and encoding of streaming tool parameters start parts.",
  })
) satisfies S.Codec<ToolParamsStartPart, ToolParamsStartPartEncoded>;

// =============================================================================
// Tool Params Delta Part
// =============================================================================

/**
 * Response part containing incremental tool parameter content.
 *
 * **Details**
 *
 * Represents a chunk of tool parameters being streamed, containing the
 * incremental JSON content that forms the tool parameters.
 *
 * @category models
 * @since 0.0.0
 */
export interface ToolParamsDeltaPart extends BasePart<"tool-params-delta", ToolParamsDeltaPartMetadata> {
  /**
   * Unique identifier matching the corresponding tool parameter chunk.
   */
  readonly id: string;
  /**
   * The incremental parameter content (typically JSON fragment) to add.
   */
  readonly delta: string;
}

/**
 * Encoded representation of tool params delta parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface ToolParamsDeltaPartEncoded extends BasePartEncoded<"tool-params-delta", ToolParamsDeltaPartMetadata> {
  /**
   * Unique identifier matching the corresponding tool parameter chunk.
   */
  readonly id: string;
  /**
   * The incremental parameter content (typically JSON fragment) to add.
   */
  readonly delta: string;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `ToolParamsDeltaPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface ToolParamsDeltaPartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of tool params delta parts.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ToolParamsDeltaPart: S.Struct<{
  readonly type: S.tag<"tool-params-delta">;
  readonly id: S.String;
  readonly delta: S.String;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("tool-params-delta"),
  id: S.String,
  delta: S.String,
}).annotate(
  $I.annote("ToolParamsDeltaPart", {
    description: "Schema for validation and encoding of incremental tool parameters delta parts.",
  })
) satisfies S.Codec<ToolParamsDeltaPart, ToolParamsDeltaPartEncoded>;

// =============================================================================
// Tool Params End Part
// =============================================================================

/**
 * Response part indicating the end of streaming tool parameters.
 *
 * **Details**
 *
 * Marks the completion of a tool parameter stream, indicating that all
 * parameter data has been sent and the tool call is ready to be executed.
 *
 * @category models
 * @since 0.0.0
 */
export interface ToolParamsEndPart extends BasePart<"tool-params-end", ToolParamsEndPartMetadata> {
  /**
   * Unique identifier matching the corresponding tool parameter chunk.
   */
  readonly id: string;
}

/**
 * Encoded representation of tool params end parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface ToolParamsEndPartEncoded extends BasePartEncoded<"tool-params-end", ToolParamsEndPartMetadata> {
  /**
   * Unique identifier matching the corresponding tool parameter stream.
   */
  readonly id: string;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `ToolParamsEndPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface ToolParamsEndPartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of tool params end parts.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ToolParamsEndPart: S.Struct<{
  readonly type: S.tag<"tool-params-end">;
  readonly id: S.String;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("tool-params-end"),
  id: S.String,
}).annotate(
  $I.annote("ToolParamsEndPart", {
    description: "Schema for validation and encoding of tool parameters end parts.",
  })
) satisfies S.Codec<ToolParamsEndPart, ToolParamsEndPartEncoded>;

// =============================================================================
// Tool Call Part
// =============================================================================

/**
 * Response part representing a tool call request.
 *
 * @example Creating a tool call part
 *
 * ```ts
 * import * as S from "effect/Schema"
 * import { Response } from "effect/unstable/ai"
 *
 * const weatherParams = S.Struct({
 *   city: S.String,
 *   units: S.optional(S.Literals(["celsius", "fahrenheit"]))
 * })
 *
 * const toolCallPart: Response.ToolCallPart<
 *   "get_weather",
 *   {
 *     readonly city: string
 *     readonly units?: "celsius" | "fahrenheit"
 *   }
 * > = Response.makePart("tool-call", {
 *   id: "call_123",
 *   name: "get_weather",
 *   params: { city: "San Francisco", units: "celsius" },
 *   providerExecuted: false
 * })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface ToolCallPart<Name extends string, Params> extends BasePart<"tool-call", ToolCallPartMetadata> {
  /**
   * Unique identifier for this tool call.
   */
  readonly id: string;
  /**
   * Name of the tool being called, which corresponds to the name of the tool
   * in the `Toolkit` included with the request.
   */
  readonly name: Name;
  /**
   * Parameters to pass to the tool.
   */
  readonly params: Params;
  /**
   * Whether the tool was executed by the provider (true) or framework (false).
   */
  readonly providerExecuted: boolean;
}

/**
 * Encoded representation of tool call parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface ToolCallPartEncoded extends BasePartEncoded<"tool-call", ToolCallPartMetadata> {
  /**
   * Unique identifier for this tool call.
   */
  readonly id: string;
  /**
   * Name of the tool being called, which corresponds to the name of the tool
   * in the `Toolkit` included with the request.
   */
  readonly name: string;
  /**
   * Parameters to pass to the tool.
   */
  readonly params: unknown;
  /**
   * Whether the tool was executed by the provider (true) or framework (false).
   */
  readonly providerExecuted?: boolean | undefined;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `ToolCallPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface ToolCallPartMetadata extends ProviderMetadata {}

/**
 * Creates a Schema for tool call parts with specific tool name and parameters.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ToolCallPart: <const Name extends string, Params extends S.Constraint>(
  name: Name,
  params: Params
) => S.Struct<{
  readonly type: S.Literal<"tool-call">;
  readonly id: S.String;
  readonly name: S.Literal<Name>;
  readonly params: Params;
  readonly providerExecuted: S.withDecodingDefaultKey<S.Boolean>;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = <const Name extends string, Params extends S.Constraint>(name: Name, params: Params) =>
  S.Struct({
    ...BasePart.fields,
    type: S.Literal("tool-call"),
    id: S.String,
    name: S.Literal(name),
    params,
    providerExecuted: S.Boolean.pipe(S.withDecodingDefaultKey(Effect.succeed(false))),
  }).annotate({ identifier: "ToolCallPart" }) as any;

/**
 * Constructs a new tool call part.
 *
 * @category constructors
 * @since 0.0.0
 */
export const toolCallPart = <const Name extends string, Params>(
  params: ConstructorParams<ToolCallPart<Name, Params>>
): ToolCallPart<Name, Params> => makePart("tool-call", params);

// =============================================================================
// Tool Call Result Part
// =============================================================================

/**
 * The base fields of a tool result part.
 *
 * @category models
 * @since 0.0.0
 */
export interface BaseToolResult<Name extends string> extends BasePart<"tool-result", ToolResultPartMetadata> {
  /**
   * Unique identifier matching the original tool call.
   */
  readonly id: string;
  /**
   * Name of the tool being called, which corresponds to the name of the tool
   * in the `Toolkit` included with the request.
   */
  readonly name: Name;
  /**
   * The encoded result for serialization purposes.
   */
  readonly encodedResult: unknown;
  /**
   * Whether the tool was executed by the provider (true) or framework (false).
   */
  readonly providerExecuted: boolean;
  /**
   * Whether this is a preliminary (intermediate) result.
   *
   * **Details**
   *
   * Preliminary results represent progress updates during streaming tool
   * execution. Only the final result (where `preliminary` is `false` or
   * `undefined`) should be used as the authoritative output.
   *
   * **Gotchas**
   *
   * Only applicable for framework-executed tools during streaming.
   */
  readonly preliminary: boolean;
}

/**
 * Represents a successful tool call result.
 *
 * @category models
 * @since 0.0.0
 */
export interface ToolResultSuccess<Name extends string, Success> extends BaseToolResult<Name> {
  /**
   * The decoded success returned by the tool execution.
   */
  readonly result: Success;
  /**
   * Whether or not the result of executing the tool call handler was an error.
   */
  readonly isFailure: false;
}

/**
 * Represents a failed tool call result.
 *
 * @category models
 * @since 0.0.0
 */
export interface ToolResultFailure<Name extends string, Failure> extends BaseToolResult<Name> {
  /**
   * The decoded failure returned by the tool execution.
   */
  readonly result: Failure;
  /**
   * Whether or not the result of executing the tool call handler was an error.
   */
  readonly isFailure: true;
}

/**
 * Response part representing the result of a tool call.
 *
 * @example Creating a tool result part
 *
 * ```ts
 * import { Response } from "effect/unstable/ai"
 *
 * interface WeatherData {
 *   temperature: number
 *   condition: string
 *   humidity: number
 * }
 *
 * const toolResultPart: Response.ToolResultPart<
 *   "get_weather",
 *   WeatherData,
 *   never
 * > = Response.toolResultPart({
 *   id: "call_123",
 *   name: "get_weather",
 *   isFailure: false,
 *   result: {
 *     temperature: 22,
 *     condition: "sunny",
 *     humidity: 65
 *   },
 *   encodedResult: {
 *     temperature: 22,
 *     condition: "sunny",
 *     humidity: 65
 *   },
 *   providerExecuted: false,
 *   preliminary: false
 * })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ToolResultPart<Name extends string, Success, Failure> =
  | ToolResultSuccess<Name, Success>
  | ToolResultFailure<Name, Failure>;

/**
 * Encoded representation of tool result parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface ToolResultPartEncoded extends BasePartEncoded<"tool-result", ToolResultPartMetadata> {
  /**
   * Unique identifier matching the original tool call.
   */
  readonly id: string;
  /**
   * Name of the tool being called, which corresponds to the name of the tool
   * in the `Toolkit` included with the request.
   */
  readonly name: string;
  /**
   * The result returned by the tool execution.
   */
  readonly result: unknown;
  /**
   * Whether or not the result of executing the tool call handler was an error.
   */
  readonly isFailure: boolean;
  /**
   * Whether the tool was executed by the provider (true) or framework (false).
   */
  readonly providerExecuted?: boolean | undefined;
  /**
   * Whether this is a preliminary (intermediate) result.
   *
   * **Gotchas**
   *
   * Only applicable for framework-executed tools during streaming.
   */
  readonly preliminary?: boolean | undefined;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `ToolResultPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface ToolResultPartMetadata extends ProviderMetadata {}

/**
 * Creates a Schema for tool result parts with specific tool name and result type.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ToolResultPart: <const Name extends string, Success extends S.Constraint, Failure extends S.Constraint>(
  name: Name,
  success: Success,
  failure: Failure
) => S.decodeTo<
  S.Struct<{
    readonly "~effect/ai/Content/Part": S.Literal<"~effect/ai/Content/Part">;
    readonly result: S.Union<readonly [Success, Failure]>;
    readonly providerExecuted: S.Boolean;
    readonly metadata: S.$Record<S.String, S.NullOr<S.Codec<S.Json>>>;
    readonly encodedResult: S.toEncoded<S.Union<readonly [Success, Failure]>>;
    readonly preliminary: S.Boolean;
    readonly id: S.String;
    readonly type: S.Literal<"tool-result">;
    readonly isFailure: S.Boolean;
    readonly name: S.Literal<Name>;
  }>,
  S.Struct<{
    readonly result: S.toEncoded<S.Union<readonly [Success, Failure]>>;
    readonly providerExecuted: S.optional<S.Boolean>;
    readonly metadata: S.optional<S.$Record<S.String, S.NullOr<S.Codec<S.Json>>>>;
    readonly preliminary: S.optional<S.Boolean>;
    readonly id: S.String;
    readonly type: S.Literal<"tool-result">;
    readonly isFailure: S.Boolean;
    readonly name: S.Literal<Name>;
  }>
> = <const Name extends string, Success extends S.Constraint, Failure extends S.Constraint>(
  name: Name,
  success: Success,
  failure: Failure
) => {
  const ResultSchema = S.Union([success, failure]);
  const Common = {
    id: S.String,
    type: S.Literal("tool-result"),
    isFailure: S.Boolean,
    name: S.Literal(name),
  };
  const Decoded = S.Struct({
    ...Common,
    [PartTypeId]: S.Literal(PartTypeId),
    result: ResultSchema,
    providerExecuted: S.Boolean,
    metadata: ProviderMetadata,
    encodedResult: S.toEncoded(ResultSchema),
    preliminary: S.Boolean,
  });
  const Encoded = S.Struct({
    ...Common,
    result: S.toEncoded(ResultSchema),
    providerExecuted: S.optional(S.Boolean),
    metadata: S.optional(ProviderMetadata),
    preliminary: S.optional(S.Boolean),
  });
  return Decoded.pipe(
    S.encodeTo(
      Encoded,
      SchemaTransformation.transform({
        decode: (encoded) => ({
          ...encoded,
          [PartTypeId]: PartTypeId,
          providerExecuted: encoded.providerExecuted ?? false,
          metadata: encoded.metadata ?? {},
          encodedResult: encoded.result,
          preliminary: encoded.preliminary ?? false,
        }),
        encode: identity,
      })
    )
  ).annotate({ identifier: `ToolResultPart(${name})` }) satisfies S.Codec<
    ToolResultPart<Name, Success["Type"], Failure["Type"]>,
    ToolResultPartEncoded,
    Success["EncodingServices"] | Failure["EncodingServices"],
    Success["DecodingServices"] | Failure["DecodingServices"]
  >;
};

/**
 * Constructs a new tool result part.
 *
 * @category constructors
 * @since 0.0.0
 */
export const toolResultPart = <const Params extends ConstructorParams<ToolResultPart<string, unknown, unknown>>>(
  params: Params
): Params extends {
  readonly name: infer Name extends string;
  readonly isFailure: false;
  readonly result: infer Success;
}
  ? ToolResultPart<Name, Success, never>
  : Params extends {
        readonly name: infer Name extends string;
        readonly isFailure: true;
        readonly result: infer Failure;
      }
    ? ToolResultPart<Name, never, Failure>
    : never => makePart("tool-result", params) as any;

// =============================================================================
// Tool Approval Request Part
// =============================================================================

/**
 * Response part representing a tool approval request.
 *
 * **Details**
 *
 * Emitted when a tool requires user approval before execution. The framework
 * checks the tool's `needsApproval` property and emits this part instead of
 * executing the tool when approval is required.
 *
 * @example Creating an approval request part
 *
 * ```ts
 * import { Response } from "effect/unstable/ai"
 *
 * const approvalRequest: Response.ToolApprovalRequestPart = Response.makePart(
 *   "tool-approval-request",
 *   {
 *     approvalId: "approval_123",
 *     toolCallId: "call_456"
 *   }
 * )
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface ToolApprovalRequestPart extends BasePart<"tool-approval-request", ToolApprovalRequestPartMetadata> {
  /**
   * Unique identifier for this approval flow.
   */
  readonly approvalId: string;
  /**
   * The tool call ID requiring approval.
   */
  readonly toolCallId: string;
}

/**
 * Encoded representation of tool approval request parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface ToolApprovalRequestPartEncoded
  extends BasePartEncoded<"tool-approval-request", ToolApprovalRequestPartMetadata> {
  /**
   * Unique identifier for this approval flow.
   */
  readonly approvalId: string;
  /**
   * The tool call ID requiring approval.
   */
  readonly toolCallId: string;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `ToolApprovalRequestPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface ToolApprovalRequestPartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of tool approval request parts.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ToolApprovalRequestPart: S.Struct<{
  readonly type: S.tag<"tool-approval-request">;
  readonly approvalId: S.String;
  readonly toolCallId: S.String;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("tool-approval-request"),
  approvalId: S.String,
  toolCallId: S.String,
}).annotate(
  $I.annote("ToolApprovalRequestPart", {
    description: "Schema for validation and encoding of tool approval request parts.",
  })
) satisfies S.Codec<ToolApprovalRequestPart, ToolApprovalRequestPartEncoded>;

/**
 * Constructs a new tool approval request part.
 *
 * @category constructors
 * @since 0.0.0
 */
export const toolApprovalRequestPart = (params: ConstructorParams<ToolApprovalRequestPart>): ToolApprovalRequestPart =>
  makePart("tool-approval-request", params as any);

// =============================================================================
// File Part
// =============================================================================

/**
 * Response part representing a file attachment.
 *
 * **Details**
 *
 * Supports various file types including images, documents, and binary data.
 *
 * @example Creating a file part
 *
 * ```ts
 * import { Response } from "effect/unstable/ai"
 *
 * const imagePart: Response.FilePart = Response.makePart("file", {
 *   mediaType: "image/jpeg",
 *   data: new Uint8Array([1, 2, 3])
 * })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface FilePart extends BasePart<"file", FilePartMetadata> {
  /**
   * MIME type of the file (e.g., "image/jpeg", "application/pdf").
   */
  readonly mediaType: string;
  /**
   * File data as a byte array.
   */
  readonly data: Uint8Array;
}

/**
 * Encoded representation of file parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface FilePartEncoded extends BasePartEncoded<"file", FilePartMetadata> {
  /**
   * MIME type of the file (e.g., "image/jpeg", "application/pdf").
   */
  readonly mediaType: string;
  /**
   * File data as a base64 string.
   */
  readonly data: string;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `FilePart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface FilePartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of file parts.
 *
 * **Details**
 *
 * Decoded `data` is a `Uint8Array`; encoded `data` is a base64 string through
 * `S.Uint8ArrayFromBase64`.
 *
 * @category schemas
 * @since 0.0.0
 */
export const FilePart: S.Struct<{
  readonly type: S.tag<"file">;
  readonly mediaType: S.String;
  readonly data: S.Uint8ArrayFromBase64;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("file"),
  mediaType: S.String,
  data: S.Uint8ArrayFromBase64,
}).annotate(
  $I.annote("FilePart", {
    description: "Schema for validation and encoding of file response parts, decoding base64 data to a Uint8Array.",
  })
) satisfies S.Codec<FilePart, FilePartEncoded>;

// =============================================================================
// Document Source Part
// =============================================================================

/**
 * Response part representing a document source reference used in generating the
 * response.
 *
 * @category models
 * @since 0.0.0
 */
export interface DocumentSourcePart extends BasePart<"source", DocumentSourcePartMetadata> {
  /**
   * Type discriminator for document sources.
   */
  readonly sourceType: "document";
  /**
   * Unique identifier for the document.
   */
  readonly id: string;
  /**
   * MIME type of the document.
   */
  readonly mediaType: string;
  /**
   * Display title of the document.
   */
  readonly title: string;
  /**
   * Optional filename of the document.
   */
  readonly fileName?: string;
}

/**
 * Encoded representation of document source parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface DocumentSourcePartEncoded extends BasePartEncoded<"source", DocumentSourcePartMetadata> {
  /**
   * Type discriminator for document sources.
   */
  readonly sourceType: "document";
  /**
   * Unique identifier for the document.
   */
  readonly id: string;
  /**
   * MIME type of the document.
   */
  readonly mediaType: string;
  /**
   * Display title of the document.
   */
  readonly title: string;
  /**
   * Optional filename of the document.
   */
  readonly fileName?: string;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `DocumentSourcePart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface DocumentSourcePartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of document source parts.
 *
 * **When to use**
 *
 * Use to validate or encode document source references returned as response
 * content parts.
 *
 * **Details**
 *
 * Validates `type: "source"`, `sourceType: "document"`, required `id`,
 * `mediaType`, and `title`, optional `fileName`, and the metadata fields
 * inherited from response parts.
 *
 * @see {@link UrlSourcePart} for URL source references
 * @see {@link DocumentSourcePartEncoded} for the encoded document source representation
 *
 * @category schemas
 * @since 0.0.0
 */
export const DocumentSourcePart: S.Struct<{
  readonly type: S.tag<"source">;
  readonly sourceType: S.tag<"document">;
  readonly id: S.String;
  readonly mediaType: S.String;
  readonly title: S.String;
  readonly fileName: S.optionalKey<S.String>;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("source"),
  sourceType: S.tag("document"),
  id: S.String,
  mediaType: S.String,
  title: S.String,
  fileName: S.optionalKey(S.String),
}).annotate(
  $I.annote("DocumentSourcePart", {
    description: "Schema for validation and encoding of document source reference parts.",
  })
) satisfies S.Codec<DocumentSourcePart, DocumentSourcePartEncoded>;

// =============================================================================
// Url Source Part
// =============================================================================

/**
 * Response part representing a URL source reference used in generating the
 * response.
 *
 * @category models
 * @since 0.0.0
 */
export interface UrlSourcePart extends BasePart<"source", UrlSourcePartMetadata> {
  /**
   * Type discriminator for URL sources.
   */
  readonly sourceType: "url";
  /**
   * Unique identifier for the URL.
   */
  readonly id: string;
  /**
   * The URL that was referenced.
   */
  readonly url: URL;
  /**
   * Display title of the URL content.
   */
  readonly title: string;
}

/**
 * Encoded representation of URL source parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface UrlSourcePartEncoded extends BasePartEncoded<"source", UrlSourcePartMetadata> {
  /**
   * Type discriminator for URL sources.
   */
  readonly sourceType: "url";
  /**
   * Unique identifier for the URL.
   */
  readonly id: string;
  /**
   * The URL that was referenced as a string.
   */
  readonly url: string;
  /**
   * Display title of the URL content.
   */
  readonly title: string;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `UrlSourcePart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface UrlSourcePartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of url source parts.
 *
 * @category schemas
 * @since 0.0.0
 */
export const UrlSourcePart: S.Struct<{
  readonly type: S.tag<"source">;
  readonly sourceType: S.tag<"url">;
  readonly id: S.String;
  readonly url: S.URLFromString;
  readonly title: S.String;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("source"),
  sourceType: S.tag("url"),
  id: S.String,
  url: S.URLFromString,
  title: S.String,
}).annotate(
  $I.annote("UrlSourcePart", {
    description: "Schema for validation and encoding of URL source reference parts.",
  })
) satisfies S.Codec<UrlSourcePart, UrlSourcePartEncoded>;

// =============================================================================
// HTTP Details
// =============================================================================

/**
 * Schema for HTTP request details associated with an AI response.
 *
 * **Details**
 *
 * Captures comprehensive information about the HTTP request made to the
 * AI provider, enabling inspection of request metadata for debugging and
 * observability purposes.
 *
 * @example Describing an HTTP request
 *
 * ```ts
 * import type { Response } from "effect/unstable/ai"
 *
 * const requestDetails: typeof Response.HttpRequestDetails.Type = {
 *   method: "POST",
 *   url: "https://api.openai.com/v1/responses",
 *   urlParams: [],
 *   hash: undefined,
 *   headers: { "Content-Type": "application/json" }
 * }
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const HttpRequestDetails = S.Struct({
  method: S.Literals(["GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS", "TRACE"]),
  url: S.String,
  urlParams: S.Array(S.Tuple([S.String, S.String])),
  hash: S.UndefinedOr(S.String),
  headers: S.Record(S.String, S.Union([S.String, S.Redacted(S.String)])),
}).annotate(
  $I.annote("HttpRequestDetails", {
    description: "Schema for HTTP request details associated with an AI response.",
  })
);

/**
 * Type of the HTTP request details associated with an AI response.
 *
 * @category models
 * @since 0.0.0
 */
export type HttpRequestDetails = typeof HttpRequestDetails.Type;

/**
 * Schema for HTTP response details associated with an AI response.
 *
 * **Details**
 *
 * Captures essential information about the HTTP response received from
 * the AI provider, including status codes and headers for debugging and
 * observability purposes.
 *
 * @example Describing an HTTP response
 *
 * ```ts
 * import type { Response } from "effect/unstable/ai"
 *
 * const responseDetails: typeof Response.HttpResponseDetails.Type = {
 *   status: 200,
 *   headers: {
 *     "Content-Type": "application/json",
 *     "X-Request-Id": "req_abc123"
 *   }
 * }
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const HttpResponseDetails = S.Struct({
  status: S.Finite,
  headers: S.Record(S.String, S.Union([S.String, S.Redacted(S.String)])),
}).annotate(
  $I.annote("HttpResponseDetails", {
    description: "Schema for HTTP response details associated with an AI response.",
  })
);

/**
 * Type of the HTTP response details associated with an AI response.
 *
 * @category models
 * @since 0.0.0
 */
export type HttpResponseDetails = typeof HttpResponseDetails.Type;

// =============================================================================
// Response Metadata Part
// =============================================================================

/**
 * Response part containing metadata about the large language model response.
 *
 * @example Creating a metadata part
 *
 * ```ts
 * import { DateTime } from "effect"
 * import { Response } from "effect/unstable/ai"
 *
 * const metadataPart: Response.ResponseMetadataPart = Response.makePart(
 *   "response-metadata",
 *   {
 *     id: "resp_123",
 *     modelId: "gpt-4",
 *     timestamp: DateTime.nowUnsafe(),
 *     request: undefined
 *   }
 * )
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface ResponseMetadataPart extends BasePart<"response-metadata", ResponseMetadataPartMetadata> {
  /**
   * Optional unique identifier for this specific response.
   */
  readonly id: string | undefined;
  /**
   * Optional identifier of the AI model that generated the response.
   */
  readonly modelId: string | undefined;
  /**
   * Optional timestamp when the response was generated.
   */
  readonly timestamp: DateTime.Utc | undefined;
  /**
   * Optional HTTP request details for the request made to the AI provider.
   */
  readonly request: HttpRequestDetails | undefined;
}

/**
 * Encoded representation of response metadata parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface ResponseMetadataPartEncoded
  extends BasePartEncoded<"response-metadata", ResponseMetadataPartMetadata> {
  /**
   * Optional unique identifier for this specific response.
   */
  readonly id?: string | undefined;
  /**
   * Optional identifier of the AI model that generated the response.
   */
  readonly modelId?: string | undefined;
  /**
   * Optional timestamp when the response was generated.
   */
  readonly timestamp?: string | undefined;
  /**
   * Optional HTTP request details for the request made to the AI provider.
   */
  readonly request?: typeof HttpRequestDetails.Encoded | undefined;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `ResponseMetadataPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface ResponseMetadataPartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of response metadata parts.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ResponseMetadataPart: S.Struct<{
  readonly type: S.tag<"response-metadata">;
  readonly id: S.UndefinedOr<S.String>;
  readonly modelId: S.UndefinedOr<S.String>;
  readonly timestamp: S.UndefinedOr<S.DateTimeUtcFromString>;
  readonly request: S.UndefinedOr<typeof HttpRequestDetails>;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("response-metadata"),
  id: S.UndefinedOr(S.String),
  modelId: S.UndefinedOr(S.String),
  timestamp: S.UndefinedOr(S.DateTimeUtcFromString),
  request: S.UndefinedOr(HttpRequestDetails),
}).annotate(
  $I.annote("ResponseMetadataPart", {
    description: "Schema for validation and encoding of response metadata parts describing the model response.",
  })
) satisfies S.Codec<ResponseMetadataPart, ResponseMetadataPartEncoded>;

// =============================================================================
// Finish Part
// =============================================================================

/**
 * Represents the reason why a model finished generation of a response.
 *
 * **Details**
 *
 * Possible finish reasons:
 * - `"stop"`: The model generated a stop sequence.
 * - `"length"`: The model exceeded its token budget.
 * - `"content-filter"`: The model generated content which violated a content filter.
 * - `"tool-calls"`: The model triggered a tool call.
 * - `"error"`: The model encountered an error.
 * - `"pause"`: The model requested to pause execution.
 * - `"other"`: The model stopped for a reason not supported by this protocol.
 * - `"unknown"`: The model did not specify a finish reason.
 *
 * @category models
 * @since 0.0.0
 */
export const FinishReason = S.Literals([
  "stop",
  "length",
  "content-filter",
  "tool-calls",
  "error",
  "pause",
  "other",
  "unknown",
]).pipe(
  $I.annoteSchema("FinishReason", {
    description: "Literal schema of the reasons a model finished generating a response.",
  })
);

/**
 * Type of the reason why a model stopped generating a response.
 *
 * **Details**
 *
 * Values include normal stops, token-limit stops, content filtering,
 * tool-call pauses, provider errors, and unknown provider-specific finish
 * reasons.
 *
 * @category models
 * @since 0.0.0
 */
export type FinishReason = typeof FinishReason.Type;

/**
 * Represents usage information for a request to a large language model provider.
 *
 * **Details**
 *
 * If the model provider returns additional usage information than what is
 * specified here, you can generally find that information under the provider
 * metadata of the finish part of the response.
 *
 * @category models
 * @since 0.0.0
 */
export class Usage extends S.Class<Usage>($I`Usage`)(
  {
    /**
     * Information about input (i.e. prompt) token utilization.
     */
    inputTokens: S.Struct({
      /**
       * The number of non-cached input (i.e. prompt) tokens used.
       */
      uncached: S.UndefinedOr(S.Finite),
      /**
       * The total of number of input (i.e. prompt) tokens used.
       */
      total: S.UndefinedOr(S.Finite),
      /**
       * The number of cached input (i.e. prompt) tokens read.
       */
      cacheRead: S.UndefinedOr(S.Finite),
      /**
       * The number of cached input (i.e. prompt) tokens written.
       */
      cacheWrite: S.UndefinedOr(S.Finite),
    }),
    /**
     * Information about the output (i.e. response) tokens used.
     */
    outputTokens: S.Struct({
      /**
       * The total of number of output (i.e. response) tokens used.
       */
      total: S.UndefinedOr(S.Finite),
      /**
       * The number of text tokens used.
       */
      text: S.UndefinedOr(S.Finite),
      /**
       * The number of reasoning tokens used.
       */
      reasoning: S.UndefinedOr(S.Finite),
    }),
  },
  $I.annote("Usage", {
    description: "Represents token usage information for a request to a large language model provider.",
  })
) {}

/**
 * Response part indicating the completion of a response generation.
 *
 * @example Creating a finish part
 *
 * ```ts
 * import { Response } from "effect/unstable/ai"
 *
 * const finishPart: Response.FinishPart = Response.makePart("finish", {
 *   reason: "stop",
 *   usage: new Response.Usage({
 *     inputTokens: {
 *       uncached: undefined,
 *       total: 50,
 *       cacheRead: undefined,
 *       cacheWrite: undefined
 *     },
 *     outputTokens: {
 *       total: 25,
 *       text: undefined,
 *       reasoning: undefined
 *     }
 *   }),
 *   response: undefined
 * })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface FinishPart extends BasePart<"finish", FinishPartMetadata> {
  /**
   * The reason why the model finished generating the response.
   */
  readonly reason: FinishReason;
  /**
   * Token usage statistics for the request.
   */
  readonly usage: Usage;
  /**
   * Optional HTTP response details from the AI provider.
   */
  readonly response: HttpResponseDetails | undefined;
}

/**
 * Encoded representation of finish parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface FinishPartEncoded extends BasePartEncoded<"finish", FinishPartMetadata> {
  /**
   * The reason why the model finished generating the response.
   */
  readonly reason: typeof FinishReason.Encoded;
  /**
   * Token usage statistics for the request.
   */
  readonly usage: typeof Usage.Encoded;
  /**
   * Optional HTTP response details from the AI provider.
   */
  readonly response?: typeof HttpResponseDetails.Encoded | undefined;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `FinishPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface FinishPartMetadata extends ProviderMetadata {}

/**
 * Schema for finish response parts.
 *
 * **Details**
 *
 * Validates `type: "finish"`, `reason` through `FinishReason`, `usage`
 * through `Usage`, and optional provider HTTP response details.
 *
 * @category schemas
 * @since 0.0.0
 */
export const FinishPart = S.Struct({
  ...BasePart.fields,
  type: S.tag("finish"),
  reason: FinishReason,
  usage: Usage,
  response: S.UndefinedOr(HttpResponseDetails),
}).annotate(
  $I.annote("FinishPart", {
    description:
      "Schema for finish response parts carrying the finish reason, token usage, and optional HTTP response details.",
  })
) satisfies S.Codec<FinishPart, FinishPartEncoded>;

// =============================================================================
// Error Part
// =============================================================================

/**
 * Response part indicating that an error occurred generating the response.
 *
 * @example Creating an error part
 *
 * ```ts
 * import { Response } from "effect/unstable/ai"
 *
 * const errorPart: Response.ErrorPart = Response.makePart("error", {
 *   error: new Error("boom")
 * })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface ErrorPart extends BasePart<"error", ErrorPartMetadata> {
  readonly error: unknown;
}

/**
 * Encoded representation of error parts for serialization.
 *
 * @category models
 * @since 0.0.0
 */
export interface ErrorPartEncoded extends BasePartEncoded<"error", ErrorPartMetadata> {
  readonly error: unknown;
}

/**
 * Represents provider-specific metadata that can be associated with a
 * `ErrorPart` through module augmentation.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface ErrorPartMetadata extends ProviderMetadata {}

/**
 * Schema for validation and encoding of error parts.
 *
 * **Details**
 *
 * Validates and encodes error parts with `type: "error"` and an `error` payload
 * kept as `unknown`.
 *
 * **Gotchas**
 *
 * The decoded `error` value is not guaranteed to be an `Error`; narrow it before
 * reading `Error`-specific fields.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ErrorPart: S.Struct<{
  readonly type: S.tag<"error">;
  readonly error: S.Unknown;
  readonly "~effect/ai/Content/Part": S.withDecodingDefaultKey<S.tag<"~effect/ai/Content/Part">>;
  readonly metadata: S.withDecodingDefault<S.$Record<S.String, S.Codec<S.Json>>>;
}> = S.Struct({
  ...BasePart.fields,
  type: S.tag("error"),
  error: S.Unknown,
}).annotate(
  $I.annote("ErrorPart", {
    description: "Schema for validation and encoding of error response parts with an unknown error payload.",
  })
) satisfies S.Codec<ErrorPart, ErrorPartEncoded>;
