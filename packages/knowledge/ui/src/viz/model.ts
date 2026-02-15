import * as A from "effect/Array";
import * as Graph from "effect/Graph";
import type * as O from "effect/Option";
import type { KnowledgeGraph } from "../fixtures/knowledgeGraph";

export type VizNode = {
  readonly id: string;
  readonly label: string;
  readonly typeIri: string;
  readonly confidence: number;
  readonly attributes: Readonly<Record<string, string | number | boolean>>;
  x: number;
  y: number;
  vx: number;
  vy: number;
  pinned?: boolean | undefined;
};

export type VizLink = {
  readonly id: string;
  readonly sourceId: string;
  readonly targetId: string;
  readonly predicate: string;
  readonly confidence: number;
};

export type VizLiteralRelation = {
  readonly id: string;
  readonly subjectId: string;
  readonly predicate: string;
  readonly literalValue: string;
  readonly literalType?: string | undefined;
  readonly confidence: number;
  readonly evidence?: string | undefined;
};

export type VizGraphStats = {
  readonly entityCount: number;
  readonly relationCount: number;
  readonly unresolvedSubjects: number;
  readonly unresolvedObjects: number;
  readonly linkCount: number;
  readonly literalRelationCount: number;
  readonly droppedLinkCount: number;
};

export type VizGraph = {
  readonly nodes: ReadonlyArray<VizNode>;
  readonly links: ReadonlyArray<VizLink>;
  readonly literalsBySubjectId: Readonly<Record<string, ReadonlyArray<VizLiteralRelation>>>;
  readonly stats: VizGraphStats;
};

export type EffectGraphModel = {
  readonly graph: Graph.DirectedGraph<VizNode, VizLink>;
  readonly indexById: ReadonlyMap<string, Graph.NodeIndex>;
};

const hashString = (input: string): number => {
  // Simple, deterministic 32-bit hash for stable initial layout.
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const toUnit = (n: number): number => {
  // Map 0..2^32-1 to [0, 1)
  return n / 4294967296;
};

const initialPosition = (id: string): { readonly x: number; readonly y: number } => {
  const h1 = hashString(id);
  const h2 = hashString(`${id}::y`);
  // Spread nodes around a disc of radius ~300 in world units.
  const a = toUnit(h1) * Math.PI * 2;
  const r = Math.sqrt(toUnit(h2)) * 300;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r };
};

export const fromKnowledgeGraph = (graph: KnowledgeGraph): VizGraph => {
  const seen = new Set<string>();
  const nodes: Array<VizNode> = [];

  for (const e of graph.entities) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);

    const { x, y } = initialPosition(e.id);
    nodes.push({
      id: e.id,
      label: e.canonicalName ?? e.mention,
      typeIri: e.primaryType,
      confidence: e.confidence,
      attributes: e.attributes,
      x,
      y,
      vx: 0,
      vy: 0,
    });
  }

  const nodeIdSet = new Set(nodes.map((n) => n.id));

  const links: Array<VizLink> = [];
  const literalsBySubject: Record<string, Array<VizLiteralRelation>> = {};
  let dropped = 0;

  for (const r of graph.relations) {
    if (r.objectId !== undefined) {
      if (!nodeIdSet.has(r.subjectId) || !nodeIdSet.has(r.objectId)) {
        dropped += 1;
        continue;
      }
      links.push({
        id: r.id,
        sourceId: r.subjectId,
        targetId: r.objectId,
        predicate: r.predicate,
        confidence: r.confidence,
      });
      continue;
    }

    if (r.literalValue !== undefined) {
      const next: VizLiteralRelation = {
        id: r.id,
        subjectId: r.subjectId,
        predicate: r.predicate,
        literalValue: r.literalValue,
        literalType: r.literalType,
        confidence: r.confidence,
        evidence: r.evidence,
      };
      const bucket = literalsBySubject[r.subjectId];
      if (bucket) bucket.push(next);
      else literalsBySubject[r.subjectId] = [next];
    }
  }

  const literalsBySubjectId: Record<string, ReadonlyArray<VizLiteralRelation>> = {};
  for (const key of Object.keys(literalsBySubject)) {
    const bucket = literalsBySubject[key];
    if (bucket) literalsBySubjectId[key] = bucket;
  }

  return {
    nodes,
    links,
    literalsBySubjectId,
    stats: {
      entityCount: graph.stats.entityCount,
      relationCount: graph.stats.relationCount,
      unresolvedSubjects: graph.stats.unresolvedSubjects,
      unresolvedObjects: graph.stats.unresolvedObjects,
      linkCount: links.length,
      literalRelationCount: Object.values(literalsBySubjectId).reduce((acc, xs) => acc + xs.length, 0),
      droppedLinkCount: dropped,
    },
  };
};

const buildIndexById = (graph: Graph.DirectedGraph<VizNode, VizLink>): ReadonlyMap<string, Graph.NodeIndex> => {
  const map = new Map<string, Graph.NodeIndex>();
  for (const [nodeIndex, node] of Graph.entries(Graph.nodes(graph))) {
    map.set(node.id, nodeIndex);
  }
  return map;
};

export const toEffectGraph = (viz: VizGraph): EffectGraphModel => {
  const indexById = new Map<string, Graph.NodeIndex>();

  const graph = Graph.directed<VizNode, VizLink>((mutable) => {
    for (const node of viz.nodes) {
      const idx = Graph.addNode(mutable, node);
      indexById.set(node.id, idx);
    }
    for (const link of viz.links) {
      const s = indexById.get(link.sourceId);
      const t = indexById.get(link.targetId);
      if (s !== undefined && t !== undefined) {
        Graph.addEdge(mutable, s, t, link);
      }
    }
  });

  return { graph, indexById };
};

export const modelFromEffectGraph = (graph: Graph.DirectedGraph<VizNode, VizLink>): EffectGraphModel => ({
  graph,
  indexById: buildIndexById(graph),
});

export const vizFromEffectGraph = (base: VizGraph, model: EffectGraphModel): VizGraph => {
  const nodes: Array<VizNode> = [];
  const nodeIdSet = new Set<string>();
  for (const [, node] of Graph.entries(Graph.nodes(model.graph))) {
    nodes.push(node);
    nodeIdSet.add(node.id);
  }

  const links: Array<VizLink> = [];
  for (const [, edge] of Graph.entries(Graph.edges(model.graph))) {
    links.push(edge.data);
  }

  const literalsBySubjectId: Record<string, ReadonlyArray<VizLiteralRelation>> = {};
  for (const id of nodeIdSet) {
    const bucket = base.literalsBySubjectId[id];
    if (bucket && bucket.length > 0) literalsBySubjectId[id] = bucket;
  }

  const literalCount = Object.values(literalsBySubjectId).reduce((acc, xs) => acc + xs.length, 0);

  return {
    nodes,
    links,
    literalsBySubjectId,
    stats: {
      entityCount: nodes.length,
      relationCount: base.stats.relationCount,
      unresolvedSubjects: base.stats.unresolvedSubjects,
      unresolvedObjects: base.stats.unresolvedObjects,
      linkCount: links.length,
      literalRelationCount: literalCount,
      droppedLinkCount: base.stats.droppedLinkCount,
    },
  };
};

const nodeFromIndex = (graph: Graph.DirectedGraph<VizNode, VizLink>, i: Graph.NodeIndex): O.Option<VizNode> =>
  Graph.getNode(graph, i);

export const neighborsDirected = (
  model: EffectGraphModel,
  nodeId: string
): { readonly incoming: ReadonlyArray<VizNode>; readonly outgoing: ReadonlyArray<VizNode> } => {
  const idx = model.indexById.get(nodeId);
  if (idx === undefined) return { incoming: A.empty<VizNode>(), outgoing: A.empty<VizNode>() };

  const incomingI = Graph.neighborsDirected(model.graph, idx, "incoming");
  const outgoingI = Graph.neighborsDirected(model.graph, idx, "outgoing");

  const incoming = A.filterMap(incomingI, (i) => nodeFromIndex(model.graph, i));
  const outgoing = A.filterMap(outgoingI, (i) => nodeFromIndex(model.graph, i));

  return { incoming, outgoing };
};

export const neighbors = (model: EffectGraphModel, nodeId: string): ReadonlyArray<VizNode> => {
  const { incoming, outgoing } = neighborsDirected(model, nodeId);
  const seen = new Set<string>();
  const all: Array<VizNode> = [];
  for (const n of incoming) {
    if (seen.has(n.id)) continue;
    seen.add(n.id);
    all.push(n);
  }
  for (const n of outgoing) {
    if (seen.has(n.id)) continue;
    seen.add(n.id);
    all.push(n);
  }
  return all;
};

export const degree = (model: EffectGraphModel, nodeId: string): number => {
  const idx = model.indexById.get(nodeId);
  if (idx === undefined) return 0;
  return (
    Graph.neighborsDirected(model.graph, idx, "incoming").length +
    Graph.neighborsDirected(model.graph, idx, "outgoing").length
  );
};

export const filterByTypeIri = (model: EffectGraphModel, allowed: ReadonlySet<string>): EffectGraphModel => {
  const next = Graph.mutate(model.graph, (mutable) => {
    Graph.filterNodes(mutable, (n) => allowed.has(n.typeIri));
  });
  return modelFromEffectGraph(next);
};

export const subgraphNeighborhood = (model: EffectGraphModel, rootId: string, hops: number): EffectGraphModel => {
  if (hops <= 0) return model;
  const rootIdx = model.indexById.get(rootId);
  if (rootIdx === undefined) return modelFromEffectGraph(Graph.directed<VizNode, VizLink>(() => {}));

  const kept = new Set<string>();
  const frontier: Array<string> = [rootId];
  kept.add(rootId);

  let depth = 0;
  while (depth < hops) {
    const nextFrontier: Array<string> = [];
    for (const id of frontier) {
      for (const n of neighbors(model, id)) {
        if (!kept.has(n.id)) {
          kept.add(n.id);
          nextFrontier.push(n.id);
        }
      }
    }
    frontier.length = 0;
    frontier.push(...nextFrontier);
    depth += 1;
    if (frontier.length === 0) break;
  }

  const next = Graph.mutate(model.graph, (mutable) => {
    Graph.filterNodes(mutable, (n) => kept.has(n.id));
  });
  return modelFromEffectGraph(next);
};
