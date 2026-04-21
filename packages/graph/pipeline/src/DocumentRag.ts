/**
 * Document RAG pipeline — document chunk retrieval-augmented generation.
 *
 * Four-step pipeline: embed query → find chunks → build context → synthesize.
 *
 * @module
 * @since 0.1.0
 */
import { $GraphPipelineId } from "@beep/identity";
import { Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";

import { DocEmbeddingsClient, EmbeddingsClient, LlmClient, PromptClient } from "./Clients.ts";
import { DocumentRagError } from "./Errors.ts";

const $I = $GraphPipelineId.create("DocumentRag");

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

/**
 * Options that tune document retrieval during a Document RAG query.
 *
 * @since 0.1.0
 * @category models
 */
export class DocumentRagOptions extends S.Class<DocumentRagOptions>($I`DocumentRagOptions`)({
  chunkLimit: S.optionalKey(S.Number).annotateKey({
    description: "Optional maximum number of document chunks to retrieve.",
  }),
  collection: S.optionalKey(S.String).annotateKey({
    description: "Optional collection identifier used to scope retrieval.",
  }),
}, $I.annote("DocumentRagOptions", {
  description: "Configuration for document retrieval-augmented generation queries.",
})) {}

const DEFAULT_CHUNK_LIMIT = 10;

// ---------------------------------------------------------------------------
// Pipeline steps
// ---------------------------------------------------------------------------

/**
 * Step 1: Embed the query into vector space.
 */
const embedQuery = Effect.fn("DocumentRag.embedQuery")(function* (query: string) {
  const embeddings = yield* EmbeddingsClient;
  const result = yield* embeddings.embed({ text: [query] });
  return result.vectors;
});

/**
 * Step 2: Find relevant document chunks via semantic search.
 */
const findChunks = Effect.fn("DocumentRag.findChunks")(function* (
  vectors: ReadonlyArray<ReadonlyArray<number>>,
  collection: string | undefined,
  limit: number
) {
  const docEmbeddings = yield* DocEmbeddingsClient;
  const result = yield* docEmbeddings.find({
    vectors: vectors as number[][],
    limit,
    user: "default",
    ...(collection !== undefined ? { collection } : {}),
  });
  return result.chunks;
});

/**
 * Step 3+4: Build context from chunks and synthesize an answer.
 */
const synthesize = Effect.fn("DocumentRag.synthesize")(function* (query: string, context: string) {
  const prompt = yield* PromptClient;
  const llm = yield* LlmClient;

  const template = yield* prompt.render({
    name: "document-rag-synthesize",
    variables: { query, context },
  });

  const completion = yield* llm.complete({ system: template.system, prompt: template.prompt });
  return completion.response;
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Execute a Document RAG query against the document store.
 *
 * @since 0.1.0
 * @category pipelines
 */
export const documentRagQuery = Effect.fn("DocumentRag.query")(function* (
  query: string,
  options: DocumentRagOptions = new DocumentRagOptions({})
) {
  const limit = options.chunkLimit ?? DEFAULT_CHUNK_LIMIT;

  const vectors = yield* embedQuery(query);
  const chunks = yield* findChunks(vectors, options.collection, limit);

  const contentChunks = pipe(
    chunks,
    A.map(({ content }) => content),
    A.getSomes
  );

  if (contentChunks.length === 0) {
    return yield* new DocumentRagError({
      phase: "findChunks",
      reason: "No document chunks found for query",
    });
  }

  const context = contentChunks.join("\n\n---\n\n");
  const answer = yield* synthesize(query, context);

  return answer;
});
