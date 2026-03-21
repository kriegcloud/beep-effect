import {
  DirectedGraph,
  DirectedGraphFromSelf,
  EdgeEncoded,
  type EdgeEncoded as EdgeEncodedType,
  EdgeFromSelf,
  type EdgeIndex,
  type EdgeIndex as EdgeIndexType,
  GraphEncoded,
  type GraphEncoded as GraphEncodedType,
  type GraphKind,
  type GraphKind as GraphKindType,
  MutableDirectedGraph,
  type NodeIndex,
  type NodeIndex as NodeIndexType,
} from "@beep/schema";
import type * as Brand from "effect/Brand";
import * as Graph_ from "effect/Graph";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

describe("Graph primitives", () => {
  it("brands node and edge indices", () => {
    expect<typeof NodeIndex.Type>().type.toBe<number & Brand.Brand<"NodeIndex">>();
    expect<NodeIndexType>().type.toBe<number & Brand.Brand<"NodeIndex">>();

    expect<typeof EdgeIndex.Type>().type.toBe<number & Brand.Brand<"EdgeIndex">>();
    expect<EdgeIndexType>().type.toBe<number & Brand.Brand<"EdgeIndex">>();
  });

  it("preserves the graph kind union", () => {
    expect<typeof GraphKind.Type>().type.toBe<"directed" | "undirected">();
    expect<GraphKindType>().type.toBe<"directed" | "undirected">();
  });
});

describe("Graph edge schemas", () => {
  it("preserves encoded edge schema types", () => {
    const schema = EdgeEncoded(S.NumberFromString);

    expect(schema.data).type.toBe<typeof S.NumberFromString>();
    expect<typeof schema.Type>().type.toBe<EdgeEncodedType<number>>();
    expect<typeof schema.Encoded>().type.toBe<EdgeEncodedType<string>>();
  });

  it("preserves runtime edge schema types", () => {
    const schema = EdgeFromSelf(S.NumberFromString);
    const decode = S.decodeUnknownSync(schema);
    const decoded = decode(new Graph_.Edge({ source: 0, target: 1, data: "1" }));

    expect(schema.data).type.toBe<typeof S.NumberFromString>();
    expect<typeof schema.Type>().type.toBe<Graph_.Edge<number>>();
    expect<typeof schema.Encoded>().type.toBe<Graph_.Edge<string>>();
    expect(decoded).type.toBe<Graph_.Edge<number>>();
  });
});

describe("Graph schemas", () => {
  it("preserves the encoded graph schema surface", () => {
    const schema = GraphEncoded(S.NumberFromString, S.String);

    expect(schema.node).type.toBe<typeof S.NumberFromString>();
    expect(schema.edge).type.toBe<typeof S.String>();
    expect<typeof schema.Type>().type.toBe<GraphEncodedType<number, string>>();
    expect<typeof schema.Encoded>().type.toBe<GraphEncodedType<string, string>>();
  });

  it("preserves immutable directed graph transform types", () => {
    const schema = DirectedGraph({
      node: S.NumberFromString,
      edge: S.String,
    });
    const decode = S.decodeUnknownSync(schema);
    const decoded = decode({
      _tag: "Graph",
      type: "directed",
      nodes: [[0, "1"]],
      edges: [],
    });

    expect(schema.node).type.toBe<typeof S.NumberFromString>();
    expect(schema.edge).type.toBe<typeof S.String>();
    expect<typeof schema.Type>().type.toBe<Graph_.DirectedGraph<number, string>>();
    expect<typeof schema.Encoded>().type.toBe<GraphEncodedType<string, string>>();
    expect(decoded).type.toBe<Graph_.DirectedGraph<number, string>>();
  });

  it("preserves mutable directed graph transform types", () => {
    const schema = MutableDirectedGraph({
      node: S.NumberFromString,
      edge: S.String,
    });

    expect<typeof schema.Type>().type.toBe<Graph_.MutableDirectedGraph<number, string>>();
    expect<typeof schema.Encoded>().type.toBe<GraphEncodedType<string, string>>();
  });

  it("preserves immutable directed graph FromSelf types", () => {
    const schema = DirectedGraphFromSelf({
      node: S.NumberFromString,
      edge: S.String,
    });

    expect<typeof schema.Type>().type.toBe<Graph_.DirectedGraph<number, string>>();
    expect<typeof schema.Encoded>().type.toBe<Graph_.DirectedGraph<string, string>>();
  });
});
