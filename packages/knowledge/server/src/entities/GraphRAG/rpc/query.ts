import { Errors } from "@beep/knowledge-domain";
import type { GraphRag } from "@beep/knowledge-domain/rpc/GraphRag";
import * as GraphRAG from "@beep/knowledge-server/GraphRAG";
import { Policy } from "@beep/shared-domain";
import * as Effect from "effect/Effect";

export const Handler = Effect.fn("graphrag_query")(
  function* (payload: GraphRag.Query.Payload) {
    const { session } = yield* Policy.AuthContext;
    const service = yield* GraphRAG.GraphRAGService;

    if (session.activeOrganizationId !== payload.organizationId) {
      return yield* new Errors.GraphTraversalError({
        message: "Access denied to this organization",
      });
    }

    const ontologyId = payload.ontologyId ?? "";

    const result = yield* service.query(
      new GraphRAG.GraphRAGQuery({
        query: payload.query,
        topK: payload.maxEntities ?? 10,
        hops: payload.maxDepth ?? 1,
        maxTokens: payload.maxTokens ?? 4000,
      }),
      payload.organizationId,
      ontologyId
    );

    return {
      entities: result.entities,
      relations: result.relations,
      context: result.context,
      tokenCount: result.stats.estimatedTokens,
    };
  },
  Effect.catchTag("EmbeddingError", (e) =>
    Effect.fail(
      new Errors.EmbeddingGenerationError({
        input: "",
        message: e.message,
      })
    )
  ),
  Effect.catchTag("DatabaseError", (e) =>
    Effect.fail(
      new Errors.GraphTraversalError({
        message: `Database error: ${e.message}`,
      })
    )
  ),
  Effect.catchTag("GraphRAGError", (e) =>
    Effect.fail(
      new Errors.GraphTraversalError({
        message: e.message,
      })
    )
  ),
  Effect.withSpan("graphrag_query")
);
