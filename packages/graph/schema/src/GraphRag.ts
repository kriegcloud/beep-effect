/**
 * Graph RAG request/response schemas.
 *
 * @module
 * @since 0.1.0
 */
import {$GraphSchemaId} from "@beep/identity";
import {LiteralKit} from "@beep/schema";
import * as S from "effect/Schema";

import {TgError, Triple} from "./Primitives.ts";

const $I = $GraphSchemaId.create("GraphRag");

const GraphRagMessageType = LiteralKit([
  "chunk",
  "explain",
] as const).pipe($I.annoteSchema("GraphRagMessageType", {
  description: "Kinds of Graph RAG streamed response messages.",
}));

/**
 * Request payload for graph retrieval-augmented generation.
 *
 * @since 0.1.0
 * @category models
 */
export class GraphRagRequest extends S.Class<GraphRagRequest>($I`GraphRagRequest`)(
  {
    query: S.String.annotateKey({
      description: "Natural-language query to answer from the knowledge graph.",
    }),
    collection: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Optional collection identifier used to scope retrieval.",
    }),
    entityLimit: S.OptionFromOptionalKey(S.Number).annotateKey({
      description: "Optional cap on seed entities retrieved from graph embeddings.",
    }),
    tripleLimit: S.OptionFromOptionalKey(S.Number).annotateKey({
      description: "Optional cap on triples fetched per entity expansion.",
    }),
    maxSubgraphSize: S.OptionFromOptionalKey(S.Number).annotateKey({
      description: "Optional cap on total triples retained in the subgraph.",
    }),
    maxPathLength: S.OptionFromOptionalKey(S.Number).annotateKey({
      description: "Optional breadth-first traversal depth limit.",
    }),
    streaming: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Whether the caller wants streamed explanation chunks.",
    }),
  },
  $I.annote("GraphRagRequest", {
    description: "Request payload for graph retrieval-augmented generation.",
  }),
) {
}

/**
 * Response payload for graph retrieval-augmented generation.
 *
 * @since 0.1.0
 * @category models
 */
export class GraphRagResponse extends S.Class<GraphRagResponse>($I`GraphRagResponse`)(
  {
    response: S.String.annotateKey({
      description: "Synthesized answer returned by the graph RAG pipeline.",
    }),
    error: S.OptionFromOptionalKey(TgError).annotateKey({
      description: "Embedded error payload when generation fails.",
    }),
    endOfStream: S.OptionFromOptionalKey(S.Boolean).annotateKey({
      description: "Streaming sentinel indicating the final response chunk.",
    }),
    message_type: S.OptionFromOptionalKey(GraphRagMessageType).annotateKey({
      description: "Optional message kind for streamed answer or explanation chunks.",
    }),
    explain_id: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Identifier for an explanation bundle associated with the answer.",
    }),
    explain_triples: Triple.pipe(S.Array, S.OptionFromOptionalKey).annotateKey({
      description: "Optional explanation triples included with explain responses.",
    }),
  },
  $I.annote("GraphRagResponse", {
    description: "Response payload for graph retrieval-augmented generation.",
  }),
) {
}
