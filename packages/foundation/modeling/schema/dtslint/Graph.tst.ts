import * as GraphSchema from "@beep/schema/Graph";
import * as Graph_ from "effect/Graph";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";
import type * as Brand from "effect/Brand";

describe("Graph primitives", () => {
  it("brands node and edge indices", () => {
    expect<GraphSchema.NodeIndex>().type.toBe<number & Brand.Brand<"NodeIndex">>();
    expect<GraphSchema.NodeIndex>().type.toBe<number & Brand.Brand<"NodeIndex">>();

    expect<GraphSchema.EdgeIndex>().type.toBe<number & Brand.Brand<"EdgeIndex">>();
    expect<GraphSchema.EdgeIndex>().type.toBe<number & Brand.Brand<"EdgeIndex">>();
  });

  it("preserves the graph kind union", () => {
    expect<GraphSchema.GraphKind>().type.toBe<"directed" | "undirected">();
    expect<GraphSchema.GraphKind>().type.toBe<"directed" | "undirected">();
  });
});

describe("Graph edge schemas", () => {
  it("preserves encoded edge schema types", () => {
    const schema = GraphSchema.EdgeEncoded(S.NumberFromString);

    expect(schema.data).type.toBe<typeof S.NumberFromString>();
    expect<typeof schema.Type>().type.toBe<GraphSchema.EdgeEncoded<number>>();
    expect<typeof schema.Encoded>().type.toBe<GraphSchema.EdgeEncoded<string>>();
  });

  it("preserves runtime edge schema types", () => {
    const schema = GraphSchema.EdgeFromSelf(S.NumberFromString);
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
    const schema = GraphSchema.GraphEncoded(S.NumberFromString, S.String);

    expect(schema.node).type.toBe<typeof S.NumberFromString>();
    expect(schema.edge).type.toBe<typeof S.String>();
    expect<typeof schema.Type>().type.toBe<GraphSchema.GraphEncoded<number, string>>();
    expect<typeof schema.Encoded>().type.toBe<GraphSchema.GraphEncoded<string, string>>();
  });

  it("preserves immutable directed graph transform types", () => {
    const schema = GraphSchema.DirectedGraph({
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
    expect<typeof schema.Encoded>().type.toBe<GraphSchema.GraphEncoded<string, string>>();
    expect(decoded).type.toBe<Graph_.DirectedGraph<number, string>>();
  });

  it("preserves mutable directed graph transform types", () => {
    const schema = GraphSchema.MutableDirectedGraph({
      node: S.NumberFromString,
      edge: S.String,
    });

    expect<typeof schema.Type>().type.toBe<Graph_.MutableDirectedGraph<number, string>>();
    expect<typeof schema.Encoded>().type.toBe<GraphSchema.GraphEncoded<string, string>>();
  });

  it("preserves immutable directed graph FromSelf types", () => {
    const schema = GraphSchema.DirectedGraphFromSelf({
      node: S.NumberFromString,
      edge: S.String,
    });

    expect<typeof schema.Type>().type.toBe<Graph_.DirectedGraph<number, string>>();
    expect<typeof schema.Encoded>().type.toBe<Graph_.DirectedGraph<string, string>>();
  });
});
