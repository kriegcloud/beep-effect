/**
 * Agent request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import { Schema } from "effect";

import { TgError } from "./Primitives.ts";

export const AgentRequest = Schema.Struct({
  question: Schema.String,
  collection: Schema.optionalKey(Schema.String),
  streaming: Schema.optionalKey(Schema.Boolean),
  group: Schema.optionalKey(Schema.Array(Schema.String)),
  state: Schema.optionalKey(Schema.String),
});

export type AgentRequest = typeof AgentRequest.Type;

export const ChunkType = Schema.Literals(["thought", "observation", "answer", "error", "explain"]);

export type ChunkType = typeof ChunkType.Type;

export const AgentResponse = Schema.Struct({
  chunk_type: Schema.optionalKey(ChunkType),
  content: Schema.optionalKey(Schema.String),
  end_of_message: Schema.optionalKey(Schema.Boolean),
  end_of_dialog: Schema.optionalKey(Schema.Boolean),
  answer: Schema.optionalKey(Schema.String),
  error: Schema.optionalKey(TgError),
  endOfStream: Schema.optionalKey(Schema.Boolean),
  endOfSession: Schema.optionalKey(Schema.Boolean),
  explain_id: Schema.optionalKey(Schema.String),
  explain_graph: Schema.optionalKey(Schema.String),
  explain_triples: Schema.optionalKey(Schema.Array(Schema.Unknown)),
  message_type: Schema.optionalKey(Schema.String),
});

export type AgentResponse = typeof AgentResponse.Type;
