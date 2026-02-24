import { $I } from "@beep/identity/packages";
import { pipe } from "effect";
import * as A from "effect/Array";
import * as Option from "effect/Option";
import * as S from "effect/Schema";

const $EffectId = $I.create("web").create("effect");
const $MappersId = $EffectId.create("mappers");

export const GraphitiEntityNodeSchema = S.Struct({
  uuid: S.NonEmptyString,
  name: S.NonEmptyString,
  labels: S.Array(S.String),
  createdAt: S.String,
  summary: S.String,
  groupId: S.NonEmptyString,
  attributes: S.Record(S.String, S.Unknown),
}).annotate(
  $MappersId.annotate("GraphitiEntityNodeSchema", {
    title: "Graphiti Entity Node",
    description: "Normalized Graphiti entity node returned by the Graphiti service.",
  })
);

export type GraphitiEntityNode = typeof GraphitiEntityNodeSchema.Type;

export const GraphitiFactSchema = S.Struct({
  uuid: S.NonEmptyString,
  groupId: S.NonEmptyString,
  sourceNodeUuid: S.NonEmptyString,
  targetNodeUuid: S.NonEmptyString,
  name: S.NonEmptyString,
  fact: S.String,
  createdAt: S.String,
  attributes: S.Record(S.String, S.Unknown),
}).annotate(
  $MappersId.annotate("GraphitiFactSchema", {
    title: "Graphiti Fact",
    description: "Normalized Graphiti relationship/fact edge.",
  })
);

export type GraphitiFact = typeof GraphitiFactSchema.Type;

export const GraphNodeSchema = S.Struct({
  id: S.NonEmptyString,
  name: S.NonEmptyString,
  type: S.String,
  summary: S.String,
  val: S.Number.check(S.isGreaterThanOrEqualTo(1)),
}).annotate(
  $MappersId.annotate("GraphNodeSchema", {
    title: "Graph Node",
    description: "Node shape consumed by react-force-graph-2d.",
  })
);

export type GraphNode = typeof GraphNodeSchema.Type;

export const GraphLinkSchema = S.Struct({
  source: S.NonEmptyString,
  target: S.NonEmptyString,
  label: S.String,
  fact: S.String,
}).annotate(
  $MappersId.annotate("GraphLinkSchema", {
    title: "Graph Link",
    description: "Link shape consumed by react-force-graph-2d.",
  })
);

export type GraphLink = typeof GraphLinkSchema.Type;

export const GraphFactSchema = S.Struct({
  id: S.NonEmptyString,
  sourceNodeId: S.NonEmptyString,
  targetNodeId: S.NonEmptyString,
  relationship: S.NonEmptyString,
  fact: S.String,
}).annotate(
  $MappersId.annotate("GraphFactSchema", {
    title: "Graph Fact",
    description: "Fact/relationship payload used by tool responses.",
  })
);

export type GraphFact = typeof GraphFactSchema.Type;

export const GraphSearchResultSchema = S.Struct({
  nodes: S.Array(GraphNodeSchema),
  links: S.Array(GraphLinkSchema),
}).annotate(
  $MappersId.annotate("GraphSearchResultSchema", {
    title: "Graph Search Result",
    description: "Graph search payload containing graph nodes and links.",
  })
);

export type GraphSearchResult = typeof GraphSearchResultSchema.Type;

export const GraphFactsResultSchema = S.Struct({
  facts: S.Array(GraphFactSchema),
  links: S.Array(GraphLinkSchema),
}).annotate(
  $MappersId.annotate("GraphFactsResultSchema", {
    title: "Graph Facts Result",
    description: "Fact search payload containing relationships and rendered links.",
  })
);

export type GraphFactsResult = typeof GraphFactsResultSchema.Type;

export const GraphNodeDetailsSchema = S.Struct({
  node: S.optionalKey(GraphNodeSchema),
  neighbors: S.Array(GraphNodeSchema),
  links: S.Array(GraphLinkSchema),
  facts: S.Array(GraphFactSchema),
}).annotate(
  $MappersId.annotate("GraphNodeDetailsSchema", {
    title: "Graph Node Details",
    description: "Node detail payload including neighboring nodes and relationships.",
  })
);

export type GraphNodeDetails = typeof GraphNodeDetailsSchema.Type;

const defaultNodeType = "Entity";

export const mapEntityNodeToGraphNode = (node: GraphitiEntityNode): GraphNode => ({
  id: node.uuid,
  name: node.name,
  type: pipe(
    node.labels,
    A.head,
    Option.getOrElse(() => defaultNodeType)
  ),
  summary: node.summary,
  val: 1,
});

export const mapFactToGraphLink = (fact: GraphitiFact): GraphLink => ({
  source: fact.sourceNodeUuid,
  target: fact.targetNodeUuid,
  label: fact.name,
  fact: fact.fact,
});

export const mapFactToGraphFact = (fact: GraphitiFact): GraphFact => ({
  id: fact.uuid,
  sourceNodeId: fact.sourceNodeUuid,
  targetNodeId: fact.targetNodeUuid,
  relationship: fact.name,
  fact: fact.fact,
});

export const mapEntityNodesToGraphNodes = (nodes: ReadonlyArray<GraphitiEntityNode>): ReadonlyArray<GraphNode> =>
  pipe(nodes, A.map(mapEntityNodeToGraphNode));

export const mapFactsToGraphLinks = (facts: ReadonlyArray<GraphitiFact>): ReadonlyArray<GraphLink> =>
  pipe(facts, A.map(mapFactToGraphLink));

export const mapFactsToGraphFacts = (facts: ReadonlyArray<GraphitiFact>): ReadonlyArray<GraphFact> =>
  pipe(facts, A.map(mapFactToGraphFact));

export const mapSearchToGraphData = (
  nodes: ReadonlyArray<GraphitiEntityNode>,
  facts: ReadonlyArray<GraphitiFact>
): GraphSearchResult => ({
  nodes: mapEntityNodesToGraphNodes(nodes),
  links: mapFactsToGraphLinks(facts),
});

export const deriveNeighborNodes = (
  nodeId: string,
  candidates: ReadonlyArray<GraphitiEntityNode>,
  facts: ReadonlyArray<GraphitiFact>
): ReadonlyArray<GraphNode> =>
  pipe(
    facts,
    A.filter((fact) => fact.sourceNodeUuid === nodeId || fact.targetNodeUuid === nodeId),
    A.flatMap((fact) => [fact.sourceNodeUuid, fact.targetNodeUuid]),
    A.filter((candidateId) => candidateId !== nodeId),
    A.dedupe,
    A.flatMap((candidateId) =>
      pipe(
        candidates,
        A.findFirst((node) => node.uuid === candidateId),
        Option.match({
          onNone: () => A.empty(),
          onSome: (node) => [mapEntityNodeToGraphNode(node)],
        })
      )
    )
  );
