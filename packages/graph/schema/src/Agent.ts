/**
 * Agent request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphSchemaId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

import { TgError } from "./Primitives.ts";

const $I = $GraphSchemaId.create("Agent");

/**
 * Agent request payload.
 *
 * @since 0.1.0
 * @category models
 */
export class AgentRequest extends S.Class<AgentRequest>($I`AgentRequest`)({
  question: S.String.annotateKey({
    description: "Natural-language question to answer.",
  }),
  collection: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional collection to scope the retrieval context.",
  }),
  streaming: S.OptionFromOptionalKey(S.Boolean).annotateKey({
    description: "Whether the caller wants the response streamed in chunks.",
  }),
  group: S.OptionFromOptionalKey(S.Array(S.String)).annotateKey({
    description: "Optional list of group identifiers used to scope the query.",
  }),
  state: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Opaque conversation state passed from a previous turn.",
  }),
}, $I.annote("AgentRequest", {
  description: "Request payload for the graph agent service.",
})) {}

/**
 * Agent stream chunk type discriminator.
 *
 * @since 0.1.0
 * @category models
 */
export const ChunkType = LiteralKit(["thought", "observation", "answer", "error", "explain"] as const).pipe(
  $I.annoteSchema("ChunkType", {
    description: "Kinds of streamed agent chunks emitted during a response.",
  }),
);

/**
 * Type for {@link ChunkType}. {@inheritDoc ChunkType}
 *
 * @category models
 * @since 0.1.0
 */
export type ChunkType = typeof ChunkType.Type;

/**
 * Agent response payload.
 *
 * @since 0.1.0
 * @category models
 */
export class AgentResponse extends S.Class<AgentResponse>($I`AgentResponse`)({
  chunk_type: S.OptionFromOptionalKey(ChunkType).annotateKey({
    description: "Optional streamed chunk kind for incremental responses.",
  }),
  content: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional streamed content fragment.",
  }),
  end_of_message: S.OptionFromOptionalKey(S.Boolean).annotateKey({
    description: "Whether the current streamed message is complete.",
  }),
  end_of_dialog: S.OptionFromOptionalKey(S.Boolean).annotateKey({
    description: "Whether the dialog session has ended.",
  }),
  answer: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Final synthesized answer when available.",
  }),
  error: S.OptionFromOptionalKey(TgError).annotateKey({
    description: "Embedded service error when the request fails.",
  }),
  endOfStream: S.OptionFromOptionalKey(S.Boolean).annotateKey({
    description: "Camel-case streaming sentinel used by some clients.",
  }),
  endOfSession: S.OptionFromOptionalKey(S.Boolean).annotateKey({
    description: "Camel-case session sentinel used by some clients.",
  }),
  explain_id: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Identifier for an explanation bundle associated with the answer.",
  }),
  explain_graph: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional explanation graph rendered for the response.",
  }),
  explain_triples: S.OptionFromOptionalKey(S.Array(S.Unknown)).annotateKey({
    description: "Optional raw triple payloads included in explanation mode.",
  }),
  message_type: S.OptionFromOptionalKey(S.String).annotateKey({
    description: "Optional wire-level message type for mixed response streams.",
  }),
}, $I.annote("AgentResponse", {
  description: "Response payload emitted by the graph agent service.",
})) {}
