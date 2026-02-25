import {
  deriveNeighborNodes,
  mapEntityNodesToGraphNodes,
  mapEntityNodeToGraphNode,
  mapFactsToGraphFacts,
  mapFactsToGraphLinks,
  mapSearchToGraphData,
} from "@beep/web/lib/effect/mappers";
import { KnowledgeGraphToolkit } from "@beep/web/lib/effect/tools";
import { GraphitiService, type GraphitiServiceError } from "@beep/web/lib/graphiti/client";
import { Effect, flow, Match, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as AiError from "effect/unstable/ai/AiError";

const graphitiErrorDescription = Match.type<GraphitiServiceError>().pipe(
  Match.tagsExhaustive({
    GraphitiRequestError: ({ message }) => message,
    GraphitiProtocolError: ({ message }) => message,
    GraphitiResponseDecodeError: ({ message }) => message,
    GraphitiToolError: ({ toolName, message }) => `${toolName}: ${message}`,
    GraphitiHttpStatusError: ({ status, body }) => `HTTP ${status}: ${body}`,
  })
);

const toAiError =
  (method: string) =>
  (error: GraphitiServiceError): AiError.AiError =>
    AiError.make({
      module: "KnowledgeGraphToolkit",
      method,
      reason: new AiError.UnknownError({
        description: graphitiErrorDescription(error),
      }),
    });

const loadNodesForScope = Effect.fn("KnowledgeGraphToolkit.loadNodesForScope")(function* (options: {
  readonly scope: "nodes" | "edges" | "both";
  readonly query: string;
  readonly limit: number;
}) {
  const graphiti = yield* GraphitiService;

  return yield* Match.value(options.scope).pipe(
    Match.when("edges", () => Effect.succeed(A.empty())),
    Match.orElse(() =>
      graphiti.searchNodes({
        query: options.query,
        maxNodes: options.limit,
      })
    )
  );
});

const loadFactsForScope = Effect.fn("KnowledgeGraphToolkit.loadFactsForScope")(function* (options: {
  readonly scope: "nodes" | "edges" | "both";
  readonly query: string;
  readonly limit: number;
}) {
  const graphiti = yield* GraphitiService;

  return yield* Match.value(options.scope).pipe(
    Match.when("nodes", () => Effect.succeed(A.empty())),
    Match.orElse(() =>
      graphiti.searchFacts({
        query: options.query,
        maxFacts: options.limit,
      })
    )
  );
});

const searchGraphHandler = Effect.fn("KnowledgeGraphToolkit.SearchGraph")(function* (params) {
  const scope = params.scope ?? "both";
  const limit = params.limit ?? 20;

  const nodes = yield* loadNodesForScope({
    scope,
    query: params.query,
    limit,
  });

  const facts = yield* loadFactsForScope({
    scope,
    query: params.query,
    limit,
  });

  return mapSearchToGraphData(nodes, facts);
});

const getNodeHandler = Effect.fn("KnowledgeGraphToolkit.GetNode")(function* (params) {
  const graphiti = yield* GraphitiService;
  const lookup = yield* graphiti.getNode({
    nodeId: params.nodeId,
  });

  const links = mapFactsToGraphLinks(lookup.facts);
  const facts = mapFactsToGraphFacts(lookup.facts);
  const { neighbors: lookupNeighbors } = lookup;

  const neighbors = pipe(
    lookup.node,
    O.match({
      onNone: () => mapEntityNodesToGraphNodes(lookupNeighbors),
      onSome: (node) => deriveNeighborNodes(node.uuid, lookupNeighbors, lookup.facts),
    })
  );

  return pipe(
    lookup.node,
    O.map(mapEntityNodeToGraphNode),
    O.match({
      onNone: () => ({
        neighbors,
        links,
        facts,
      }),
      onSome: (node) => ({
        node,
        neighbors,
        links,
        facts,
      }),
    })
  );
});

const getFactsHandler = Effect.fn("KnowledgeGraphToolkit.GetFacts")(function* (params) {
  const graphiti = yield* GraphitiService;
  const facts = yield* graphiti.searchFacts({
    query: params.query,
    maxFacts: params.maxFacts ?? 20,
  });

  return {
    facts: mapFactsToGraphFacts(facts),
    links: mapFactsToGraphLinks(facts),
  };
});

export const knowledgeGraphHandlers = KnowledgeGraphToolkit.of({
  SearchGraph: flow(searchGraphHandler, Effect.mapError(toAiError("SearchGraph"))),

  GetNode: flow(getNodeHandler, Effect.mapError(toAiError("GetNode"))),

  GetFacts: flow(getFactsHandler, Effect.mapError(toAiError("GetFacts"))),
});

export const KnowledgeGraphToolsLayer = KnowledgeGraphToolkit.toLayer(knowledgeGraphHandlers);
