import {
  type GraphFact,
  type GraphLink,
  GraphLinkSchema,
  type GraphNode,
  GraphNodeDetailsSchema,
  GraphNodeSchema,
  GraphSearchResultSchema,
} from "@beep/web/lib/effect/mappers";
import { Effect, Match, pipe } from "effect";
import * as A from "effect/Array";
import * as Option from "effect/Option";
import * as Record from "effect/Record";
import * as S from "effect/Schema";
import { Atom } from "effect/unstable/reactivity";

export const GraphSnippetSchema = S.Struct({
  nodes: S.Array(GraphNodeSchema),
  links: S.Array(GraphLinkSchema),
});

export type GraphSnippet = typeof GraphSnippetSchema.Type;

export const GraphSearchApiResponseSchema = S.Struct({
  mode: S.Literals(["search", "node"]),
  graph: GraphSearchResultSchema,
  details: S.optionalKey(GraphNodeDetailsSchema),
});

export type GraphSearchApiResponse = typeof GraphSearchApiResponseSchema.Type;

interface GraphApiRequest {
  readonly query: Option.Option<string>;
  readonly nodeId: Option.Option<string>;
  readonly limit: Option.Option<number>;
  readonly maxFacts: Option.Option<number>;
  readonly maxNeighbors: Option.Option<number>;
}

type NodeDetailsIndex = Record.ReadonlyRecord<string, typeof GraphNodeDetailsSchema.Type>;
type NodeFactsIndex = Record.ReadonlyRecord<string, ReadonlyArray<GraphFact>>;

const decodeGraphSearchApiResponse = S.decodeUnknownEffect(GraphSearchApiResponseSchema);

const emptyGraphData = {
  nodes: A.empty<GraphNode>(),
  links: A.empty<GraphLink>(),
};

const setParam = (params: URLSearchParams, key: string, value: Option.Option<string>) =>
  Option.match(value, {
    onNone: () => undefined,
    onSome: (resolved) => {
      params.set(key, resolved);
      return undefined;
    },
  });

const buildGraphSearchPath = (request: GraphApiRequest): string => {
  const params = new URLSearchParams();

  setParam(params, "q", request.query);
  setParam(params, "nodeId", request.nodeId);
  setParam(
    params,
    "limit",
    pipe(
      request.limit,
      Option.map((value) => `${value}`)
    )
  );
  setParam(
    params,
    "maxFacts",
    pipe(
      request.maxFacts,
      Option.map((value) => `${value}`)
    )
  );
  setParam(
    params,
    "maxNeighbors",
    pipe(
      request.maxNeighbors,
      Option.map((value) => `${value}`)
    )
  );

  return `/api/graph/search?${params.toString()}`;
};

const fetchGraphSearch = Effect.fn("GraphState.fetchGraphSearch")(function* (request: GraphApiRequest) {
  const path = buildGraphSearchPath(request);

  const response = yield* Effect.tryPromise({
    try: () => fetch(path),
    catch: (cause) => `Graph request failed: ${cause}`,
  });

  yield* Match.value(response.ok).pipe(
    Match.when(true, () => Effect.void),
    Match.orElse(() => Effect.fail(`Graph request failed with status ${response.status}`))
  );

  const payload = yield* Effect.tryPromise({
    try: () => response.json(),
    catch: (cause) => `Graph response parse failed: ${cause}`,
  });

  return yield* decodeGraphSearchApiResponse(payload).pipe(Effect.mapError((cause) => cause.message));
});

const nodeMapFromArray = (nodes: ReadonlyArray<GraphNode>): Record.ReadonlyRecord<string, GraphNode> =>
  pipe(
    nodes,
    A.reduce(Record.empty<string, GraphNode>(), (accumulator, node) => Record.set(accumulator, node.id, node))
  );

const linkKey = (link: GraphLink): string => `${link.source}::${link.target}::${link.label}`;

const linkMapFromArray = (links: ReadonlyArray<GraphLink>): Record.ReadonlyRecord<string, GraphLink> =>
  pipe(
    links,
    A.reduce(Record.empty<string, GraphLink>(), (accumulator, link) => Record.set(accumulator, linkKey(link), link))
  );

const mergeGraphData = (
  current: typeof GraphSearchResultSchema.Type,
  incoming: typeof GraphSearchResultSchema.Type
): typeof GraphSearchResultSchema.Type => ({
  nodes: pipe(
    incoming.nodes,
    A.reduce(nodeMapFromArray(current.nodes), (accumulator, node) => Record.set(accumulator, node.id, node)),
    Record.values
  ),
  links: pipe(
    incoming.links,
    A.reduce(linkMapFromArray(current.links), (accumulator, link) => Record.set(accumulator, linkKey(link), link)),
    Record.values
  ),
});

const graphFromDetails = (details: typeof GraphNodeDetailsSchema.Type): typeof GraphSearchResultSchema.Type => ({
  nodes: pipe(
    Option.fromNullishOr(details.node),
    Option.match({
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

const appendFactForNode = (index: NodeFactsIndex, nodeId: string, fact: GraphFact): NodeFactsIndex => {
  const current = pipe(
    Record.get(index, nodeId),
    Option.getOrElse(() => A.empty<GraphFact>())
  );

  return Record.set(
    index,
    nodeId,
    pipe(
      current,
      A.append(fact),
      A.dedupeWith((left, right) => left.id === right.id)
    )
  );
};

const mergeFactsIntoIndex = (index: NodeFactsIndex, facts: ReadonlyArray<GraphFact>): NodeFactsIndex =>
  pipe(
    facts,
    A.reduce(index, (accumulator, fact) =>
      pipe(
        accumulator,
        (next) => appendFactForNode(next, fact.sourceNodeId, fact),
        (next) => appendFactForNode(next, fact.targetNodeId, fact)
      )
    )
  );

const mergeDetailsIntoIndex = (
  index: NodeDetailsIndex,
  details: typeof GraphNodeDetailsSchema.Type
): NodeDetailsIndex =>
  pipe(
    Option.fromNullishOr(details.node),
    Option.match({
      onNone: () => index,
      onSome: (node) => Record.set(index, node.id, details),
    })
  );

const normalizeGraphResponse = (
  response: GraphSearchApiResponse
): {
  readonly graph: typeof GraphSearchResultSchema.Type;
  readonly details: Option.Option<typeof GraphNodeDetailsSchema.Type>;
} =>
  pipe(
    Option.fromNullishOr(response.details),
    Option.match({
      onNone: () => ({
        graph: response.graph,
        details: Option.none<typeof GraphNodeDetailsSchema.Type>(),
      }),
      onSome: (details) => ({
        graph: graphFromDetails(details),
        details: Option.some(details),
      }),
    })
  );

export const graphSearchQueryAtom = Atom.make("effect v4");

export const graphDataAtom = Atom.make<typeof GraphSearchResultSchema.Type>(emptyGraphData);

export const selectedNodeIdAtom = Atom.make<Option.Option<string>>(Option.none());

export const highlightedNodeIdsAtom = Atom.make<ReadonlyArray<string>>(A.empty());

export const seedGraphLoadedAtom = Atom.make(false);

const nodeDetailsIndexAtom = Atom.make<NodeDetailsIndex>(Record.empty());

const nodeFactsIndexAtom = Atom.make<NodeFactsIndex>(Record.empty());

export const selectedGraphNodeAtom = Atom.make((get) =>
  pipe(
    get(selectedNodeIdAtom),
    Option.flatMap((nodeId) =>
      pipe(
        get(graphDataAtom).nodes,
        A.findFirst((node) => node.id === nodeId)
      )
    )
  )
);

export const selectedNodeDetailsAtom = Atom.make((get) =>
  pipe(
    get(selectedNodeIdAtom),
    Option.flatMap((nodeId) => Record.get(get(nodeDetailsIndexAtom), nodeId))
  )
);

export const selectedNodeFactsAtom = Atom.make((get) =>
  pipe(
    get(selectedNodeIdAtom),
    Option.flatMap((nodeId) => Record.get(get(nodeFactsIndexAtom), nodeId)),
    Option.getOrElse(() => A.empty<GraphFact>())
  )
);

export const loadSeedGraphAtom = Atom.fn<{ readonly query: string; readonly limit: number }>()((input, get) =>
  fetchGraphSearch({
    query: Option.some(input.query),
    nodeId: Option.none(),
    limit: Option.some(input.limit),
    maxFacts: Option.none(),
    maxNeighbors: Option.none(),
  }).pipe(
    Effect.tap((response) =>
      Effect.sync(() => {
        const normalized = normalizeGraphResponse(response);

        get.set(graphDataAtom, normalized.graph);
        get.set(selectedNodeIdAtom, Option.none());
        get.set(highlightedNodeIdsAtom, A.empty());
        get.set(seedGraphLoadedAtom, true);

        const nextDetails = pipe(
          normalized.details,
          Option.match({
            onNone: () => Record.empty<string, typeof GraphNodeDetailsSchema.Type>(),
            onSome: (details) => mergeDetailsIntoIndex(Record.empty(), details),
          })
        );

        const nextFacts = pipe(
          normalized.details,
          Option.match({
            onNone: () => Record.empty<string, ReadonlyArray<GraphFact>>(),
            onSome: (details) => mergeFactsIntoIndex(Record.empty(), details.facts),
          })
        );

        get.set(nodeDetailsIndexAtom, nextDetails);
        get.set(nodeFactsIndexAtom, nextFacts);
      })
    ),
    Effect.map((response) => normalizeGraphResponse(response).graph)
  )
);

export const expandGraphNodeAtom = Atom.fn<{
  readonly nodeId: string;
  readonly maxFacts: number;
  readonly maxNeighbors: number;
}>()((input, get) =>
  fetchGraphSearch({
    query: Option.none(),
    nodeId: Option.some(input.nodeId),
    limit: Option.none(),
    maxFacts: Option.some(input.maxFacts),
    maxNeighbors: Option.some(input.maxNeighbors),
  }).pipe(
    Effect.tap((response) =>
      Effect.sync(() => {
        const normalized = normalizeGraphResponse(response);
        const merged = mergeGraphData(get(graphDataAtom), normalized.graph);

        get.set(graphDataAtom, merged);
        get.set(selectedNodeIdAtom, Option.some(input.nodeId));

        const nextDetails = pipe(
          normalized.details,
          Option.match({
            onNone: () => get(nodeDetailsIndexAtom),
            onSome: (details) => mergeDetailsIntoIndex(get(nodeDetailsIndexAtom), details),
          })
        );

        const nextFacts = pipe(
          normalized.details,
          Option.match({
            onNone: () => get(nodeFactsIndexAtom),
            onSome: (details) => mergeFactsIntoIndex(get(nodeFactsIndexAtom), details.facts),
          })
        );

        get.set(nodeDetailsIndexAtom, nextDetails);
        get.set(nodeFactsIndexAtom, nextFacts);
      })
    ),
    Effect.map((response) => normalizeGraphResponse(response).graph)
  )
);

export const selectGraphNodeAtom = Atom.fn<string>()((nodeId, get) =>
  Effect.sync(() => {
    get.set(selectedNodeIdAtom, Option.some(nodeId));
  })
);

export const clearGraphSelectionAtom = Atom.fn<void>()((_, get) =>
  Effect.sync(() => {
    get.set(selectedNodeIdAtom, Option.none());
  })
);

export const clearGraphHighlightsAtom = Atom.fn<void>()((_, get) =>
  Effect.sync(() => {
    get.set(highlightedNodeIdsAtom, A.empty());
  })
);

export const applyGraphSnippetAtom = Atom.fn<GraphSnippet>()((snippet, get) =>
  Effect.sync(() => {
    const merged = mergeGraphData(get(graphDataAtom), {
      nodes: snippet.nodes,
      links: snippet.links,
    });

    get.set(graphDataAtom, merged);
    get.set(
      highlightedNodeIdsAtom,
      pipe(
        snippet.nodes,
        A.map((node) => node.id)
      )
    );
  })
);
