/**
 * Internal schema module support.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import { EdgeIndex, GraphKind, NodeIndex } from "./Graph.primitives.ts";
import { $I, type GraphKindValue } from "./Graph.shared.ts";

/**
 * Encoded edge representation used by graph codecs.
 *
 * @since 0.0.0
 * @category models
 */
export type EdgeEncoded<Data> = Readonly<{
  readonly source: NodeIndex;
  readonly target: NodeIndex;
  readonly data: Data;
}>;

/**
 * Encoded graph representation used by graph codecs.
 *
 * @since 0.0.0
 * @category models
 */
export type GraphEncoded<Node, Edge, Kind extends GraphKindValue = GraphKindValue> = Readonly<{
  readonly _tag: "Graph";
  readonly type: Kind;
  readonly nodes: ReadonlyArray<readonly [NodeIndex, Node]>;
  readonly edges: ReadonlyArray<{
    readonly index: EdgeIndex;
    readonly source: NodeIndex;
    readonly target: NodeIndex;
    readonly data: Edge;
  }>;
}>;

/** @internal */
/**
 * Public schema module export.
 *
 * @category type-level
 * @since 0.0.0
 */
export type EdgeIso<Data extends S.Top> = Readonly<{
  readonly source: NodeIndex;
  readonly target: NodeIndex;
  readonly data: Data["Iso"];
}>;

/** @internal */
/**
 * Public schema module export.
 *
 * @category type-level
 * @since 0.0.0
 */
export type GraphIso<Node extends S.Top, Edge extends S.Top, Kind extends GraphKindValue = GraphKindValue> = Readonly<{
  readonly _tag: "Graph";
  readonly type: Kind;
  readonly nodes: ReadonlyArray<readonly [NodeIndex, Node["Iso"]]>;
  readonly edges: ReadonlyArray<{
    readonly index: EdgeIndex;
    readonly source: NodeIndex;
    readonly target: NodeIndex;
    readonly data: Edge["Iso"];
  }>;
}>;

/**
 * Schema type for encoded graph edges.
 *
 * @since 0.0.0
 * @category validation
 */
export interface EdgeEncodedSchema<Data extends S.Top>
  extends S.Codec<
    EdgeEncoded<Data["Type"]>,
    EdgeEncoded<Data["Encoded"]>,
    Data["DecodingServices"],
    Data["EncodingServices"]
  > {
  readonly data: Data;
  readonly Rebuild: this;
}

/**
 * Schema type for encoded graphs.
 *
 * @since 0.0.0
 * @category validation
 */
export interface GraphEncodedSchema<Node extends S.Top, Edge extends S.Top>
  extends S.Codec<
    GraphEncoded<Node["Type"], Edge["Type"]>,
    GraphEncoded<Node["Encoded"], Edge["Encoded"]>,
    Node["DecodingServices"] | Edge["DecodingServices"],
    Node["EncodingServices"] | Edge["EncodingServices"]
  > {
  readonly edge: Edge;
  readonly node: Node;
  readonly Rebuild: this;
}

/**
 * Schema for encoded graph edges.
 *
 * @param data - Schema for edge payloads.
 * @returns Schema for the encoded edge representation.
 * @since 0.0.0
 * @category validation
 */
export const EdgeEncoded = <Data extends S.Top>(data: Data): EdgeEncodedSchema<Data> => {
  const schema = S.Class<EdgeEncoded<Data["Type"]>>($I`EdgeEncoded`)({
    source: NodeIndex,
    target: NodeIndex,
    data,
  }).mapFields((fields) => fields);

  return S.make<EdgeEncodedSchema<Data>>(schema.ast, { data }).pipe(
    $I.annoteSchema("EdgeEncoded", {
      description: "The encoded representation of an Effect graph edge.",
    })
  );
};

/**
 * Schema for encoded graphs.
 *
 * @param node - Schema for node payloads.
 * @param edge - Schema for edge payloads.
 * @returns Encoded graph schema.
 * @since 0.0.0
 * @category validation
 */
export const GraphEncoded: {
  <Node extends S.Top, Edge extends S.Top>(node: Node): (edge: Edge) => GraphEncodedSchema<Node, Edge>;
  <Node extends S.Top, Edge extends S.Top>(node: Node, edge: Edge): GraphEncodedSchema<Node, Edge>;
} = dual(2, <Node extends S.Top, Edge extends S.Top>(node: Node, edge: Edge) => {
  const schema = S.TaggedStruct("Graph", {
    type: GraphKind,
    nodes: S.Array(S.Tuple([NodeIndex, node])),
    edges: S.Array(
      S.Class<GraphEncoded<Node["Type"], Edge["Type"]>["edges"][number]>($I`GraphEncodedEdge`)({
        index: EdgeIndex,
        source: NodeIndex,
        target: NodeIndex,
        data: edge,
      }).mapFields((fields) => fields)
    ),
  });

  return S.make<GraphEncodedSchema<Node, Edge>>(schema.ast, { node, edge }).pipe(
    $I.annoteSchema("GraphEncoded", {
      description: "The encoded representation of an Effect graph value.",
    })
  );
});
