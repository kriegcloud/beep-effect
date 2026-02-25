import { auth } from "@beep/web/lib/auth/server";
import {
  deriveNeighborNodes,
  GraphNodeDetailsSchema,
  GraphSearchResultSchema,
  mapEntityNodesToGraphNodes,
  mapEntityNodeToGraphNode,
  mapFactsToGraphFacts,
  mapFactsToGraphLinks,
  mapSearchToGraphData,
} from "@beep/web/lib/effect/mappers";
import { GraphitiService, type GraphitiServiceError } from "@beep/web/lib/graphiti/client";
import { Effect, Match, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { type NextRequest, NextResponse } from "next/server";

const decodeNumberFromString = S.decodeUnknownOption(S.NumberFromString);
const decodeInt = S.decodeUnknownOption(S.Int);

const GraphSearchRouteResponseSchema = S.Struct({
  mode: S.Literals(["search", "node"]),
  graph: GraphSearchResultSchema,
  details: S.optionalKey(GraphNodeDetailsSchema),
});

type GraphSearchRouteResponse = typeof GraphSearchRouteResponseSchema.Type;

type GraphNodeDetails = typeof GraphNodeDetailsSchema.Type;

const decodeResponse = S.decodeUnknownEffect(GraphSearchRouteResponseSchema);

const defaultSeedQuery = "effect v4";
const defaultLimit = 120;
const defaultMaxFacts = 40;
const defaultMaxNeighbors = 50;

const graphitiErrorDescription = Match.type<GraphitiServiceError>().pipe(
  Match.tagsExhaustive({
    GraphitiRequestError: ({ message }) => message,
    GraphitiProtocolError: ({ message }) => message,
    GraphitiResponseDecodeError: ({ message }) => message,
    GraphitiToolError: ({ toolName, message }) => `${toolName}: ${message}`,
    GraphitiHttpStatusError: ({ status, body }) => `HTTP ${status}: ${body}`,
  })
);

const parseOptionalPositiveInt = (value: string | null): O.Option<number> =>
  pipe(
    O.fromNullishOr(value),
    O.flatMap(decodeNumberFromString),
    O.flatMap(decodeInt),
    O.filter((parsed) => parsed >= 1)
  );

const parseSearchInput = (request: NextRequest) => {
  const params = request.nextUrl.searchParams;

  return {
    query: O.fromNullishOr(params.get("q")),
    nodeId: O.fromNullishOr(params.get("nodeId")),
    limit: pipe(
      parseOptionalPositiveInt(params.get("limit")),
      O.getOrElse(() => defaultLimit)
    ),
    maxFacts: pipe(
      parseOptionalPositiveInt(params.get("maxFacts")),
      O.getOrElse(() => defaultMaxFacts)
    ),
    maxNeighbors: pipe(
      parseOptionalPositiveInt(params.get("maxNeighbors")),
      O.getOrElse(() => defaultMaxNeighbors)
    ),
  };
};

const graphFromDetails = (details: GraphNodeDetails): typeof GraphSearchResultSchema.Type => ({
  nodes: pipe(
    O.fromNullishOr(details.node),
    O.match({
      onNone: () => details.neighbors,
      onSome: (node) =>
        pipe(
          details.neighbors,
          A.prepend(node),
          A.dedupeWith((left, right) => left.id === right.id)
        ),
    })
  ),
  links: details.links,
});

const searchGraph = Effect.fn("GraphSearchRoute.searchGraph")(function* (request: NextRequest) {
  const graphiti = yield* GraphitiService;
  const input = parseSearchInput(request);

  return yield* pipe(
    input.nodeId,
    O.match({
      onNone: () =>
        Effect.gen(function* () {
          const query = pipe(
            input.query,
            O.getOrElse(() => defaultSeedQuery)
          );

          const nodes = yield* graphiti.searchNodes({
            query,
            maxNodes: input.limit,
          });

          const facts = yield* graphiti.searchFacts({
            query,
            maxFacts: input.limit,
          });

          return {
            mode: "search" as const,
            graph: mapSearchToGraphData(nodes, facts),
          };
        }),
      onSome: (nodeId) =>
        Effect.gen(function* () {
          const lookup = yield* graphiti.getNode({
            nodeId,
            maxFacts: input.maxFacts,
            maxNeighbors: input.maxNeighbors,
          });

          const links = mapFactsToGraphLinks(lookup.facts);
          const facts = mapFactsToGraphFacts(lookup.facts);

          const neighbors = pipe(
            lookup.node,
            O.match({
              onNone: () => mapEntityNodesToGraphNodes(lookup.neighbors),
              onSome: (node) => deriveNeighborNodes(node.uuid, lookup.neighbors, lookup.facts),
            })
          );

          const details = pipe(
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

          return {
            mode: "node" as const,
            graph: graphFromDetails(details),
            details,
          };
        }),
    })
  );
});

const runRoute = (request: NextRequest) =>
  searchGraph(request).pipe(
    Effect.flatMap((payload) => decodeResponse(payload).pipe(Effect.mapError((cause) => cause.message))),
    Effect.mapError((error): string =>
      Match.value(error).pipe(
        Match.when(P.isString, (message) => message),
        Match.orElse((graphitiError) => graphitiErrorDescription(graphitiError))
      )
    ),
    Effect.provide(GraphitiService.layer),
    Effect.match({
      onFailure: (message) =>
        NextResponse.json(
          {
            error: {
              code: "GraphSearchFailed",
              message,
            },
          },
          { status: 500 }
        ),
      onSuccess: (payload: GraphSearchRouteResponse) => NextResponse.json(payload, { status: 200 }),
    })
  );

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  return pipe(
    O.fromNullishOr(session),
    O.match({
      onNone: () =>
        NextResponse.json(
          {
            error: {
              code: "GraphUnauthorized",
              message: "Authentication required",
            },
          },
          { status: 401 }
        ),
      onSome: () => Effect.runPromise(runRoute(request)),
    })
  );
}
