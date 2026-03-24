import {
  DirectedGraph,
  DirectedGraphFromSelf,
  EdgeEncoded,
  EdgeFromSelf,
  EdgeIndex,
  EdgeIndexFromString,
  EdgeTransform,
  GraphEncoded,
  GraphFromSelf,
  GraphKind,
  isEdge,
  isGraph,
  MutableDirectedGraph,
  MutableDirectedGraphFromSelf,
  NodeIndex,
  NodeIndexFromString,
  UndirectedGraph,
} from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import * as Graph_ from "effect/Graph";
import * as S from "effect/Schema";

describe("Graph indices", () => {
  it("brands non-negative integer node and edge indices", () => {
    expect(S.decodeUnknownSync(NodeIndex)(0)).toBe(0);
    expect(S.decodeUnknownSync(NodeIndexFromString)("2")).toBe(2);
    expect(S.decodeUnknownSync(EdgeIndex)(1)).toBe(1);
    expect(S.decodeUnknownSync(EdgeIndexFromString)("3")).toBe(3);
  });

  it("rejects invalid indices", () => {
    expect(() => S.decodeUnknownSync(NodeIndex)(-1)).toThrow("Expected a value greater than or equal to 0, got -1");
    expect(() => S.decodeUnknownSync(EdgeIndexFromString)("-1")).toThrow(
      "Expected a value greater than or equal to 0, got -1"
    );
  });

  it("decodes graph kind discriminators", () => {
    expect(S.decodeUnknownSync(GraphKind)("directed")).toBe("directed");
    expect(S.decodeUnknownSync(GraphKind)("undirected")).toBe("undirected");
  });
});

describe("Graph edge schemas", () => {
  it("preserves metadata on encoded edge schemas", () => {
    const schema = EdgeEncoded(S.NumberFromString);

    expect(schema.data).toBe(S.NumberFromString);
    expect(schema.annotate({}).data).toBe(S.NumberFromString);
  });

  it("transforms encoded edges into Graph.Edge instances and back", () => {
    const schema = EdgeTransform(S.NumberFromString);
    const decoded = S.decodeUnknownSync(schema)({ source: 0, target: 1, data: "1" });

    expect(isEdge(decoded)).toBe(true);
    expect(decoded).toBeInstanceOf(Graph_.Edge);
    expect(decoded.source).toBe(0);
    expect(decoded.target).toBe(1);
    expect(decoded.data).toBe(1);
    expect(S.encodeSync(schema)(decoded)).toEqual({ source: 0, target: 1, data: "1" });
  });

  it("validates existing Graph.Edge instances with nested transforms", () => {
    const schema = EdgeFromSelf(S.NumberFromString);
    const decoded = S.decodeUnknownSync(schema)(new Graph_.Edge({ source: 0, target: 1, data: "1" }));

    expect(decoded).toBeInstanceOf(Graph_.Edge);
    expect(decoded.data).toBe(1);
    expect(() => S.decodeUnknownSync(schema)(new Graph_.Edge({ source: 0, target: 1, data: null }))).toThrow(
      "Expected string, got null"
    );
  });
});

describe("Graph encoded schemas", () => {
  it("preserves metadata on encoded graph schemas", () => {
    const schema = GraphEncoded(S.String, S.NumberFromString);

    expect(schema.node).toBe(S.String);
    expect(schema.edge).toBe(S.NumberFromString);
    expect(schema.annotate({}).node).toBe(S.String);
    expect(schema.annotate({}).edge).toBe(S.NumberFromString);
  });
});

describe("DirectedGraph", () => {
  it("decodes encoded payloads into immutable directed graphs and sorts nodes by index", () => {
    const schema = DirectedGraph({
      node: S.NumberFromString,
      edge: S.String,
    });
    const decoded = S.decodeUnknownSync(schema)({
      _tag: "Graph",
      type: "directed",
      nodes: [
        [1, "2"],
        [0, "1"],
      ],
      edges: [{ index: 0, source: 0, target: 1, data: "a" }],
    });

    expect(schema.node).toBe(S.NumberFromString);
    expect(schema.edge).toBe(S.String);
    expect(isGraph(decoded)).toBe(true);
    expect(decoded.type).toBe("directed");
    expect(decoded.mutable).toBe(false);
    expect(Array.from(decoded.nodes.entries())).toEqual([
      [0, 1],
      [1, 2],
    ]);
    expect(Array.from(decoded.edges.entries())).toEqual([[0, new Graph_.Edge({ source: 0, target: 1, data: "a" })]]);
  });

  it("encodes immutable directed graphs back to the wire shape", () => {
    const schema = DirectedGraph({
      node: S.NumberFromString,
      edge: S.String,
    });
    const graph = Graph_.directed<number, string>((mutable) => {
      const a = Graph_.addNode(mutable, 1);
      const b = Graph_.addNode(mutable, 2);
      Graph_.addEdge(mutable, a, b, "a");
    });

    expect(S.encodeSync(schema)(graph)).toEqual({
      _tag: "Graph",
      type: "directed",
      nodes: [
        [0, "1"],
        [1, "2"],
      ],
      edges: [{ index: 0, source: 0, target: 1, data: "a" }],
    });
  });

  it("rejects the wrong graph kind and malformed topology", () => {
    const schema = DirectedGraph({
      node: S.String,
      edge: S.String,
    });

    expect(() =>
      S.decodeUnknownSync(schema)({
        _tag: "Graph",
        type: "undirected",
        nodes: [],
        edges: [],
      })
    ).toThrow("Expected directed graph, got undirected");

    expect(() =>
      S.decodeUnknownSync(schema)({
        _tag: "Graph",
        type: "directed",
        nodes: [[0, "a"]],
        edges: [{ index: 0, source: 0, target: 1, data: "x" }],
      })
    ).toThrow("Node 1 does not exist");

    expect(() =>
      S.decodeUnknownSync(schema)({
        _tag: "Graph",
        type: "directed",
        nodes: [[1, "a"]],
        edges: [],
      })
    ).toThrow("Expected node index 1, got 0");
  });
});

describe("UndirectedGraph", () => {
  it("decodes encoded payloads into immutable undirected graphs", () => {
    const schema = UndirectedGraph({
      node: S.String,
      edge: S.NumberFromString,
    });
    const decoded = S.decodeUnknownSync(schema)({
      _tag: "Graph",
      type: "undirected",
      nodes: [
        [0, "a"],
        [1, "b"],
      ],
      edges: [{ index: 0, source: 0, target: 1, data: "1" }],
    });

    expect(decoded.type).toBe("undirected");
    expect(decoded.mutable).toBe(false);
    expect(Array.from(decoded.edges.entries())).toEqual([[0, new Graph_.Edge({ source: 0, target: 1, data: 1 })]]);
  });
});

describe("Graph FromSelf schemas", () => {
  it("validates existing immutable directed graphs with nested transforms", () => {
    const schema = DirectedGraphFromSelf({
      node: S.NumberFromString,
      edge: S.String,
    });
    const graph = Graph_.directed<string, string>((mutable) => {
      const a = Graph_.addNode(mutable, "1");
      const b = Graph_.addNode(mutable, "2");
      Graph_.addEdge(mutable, a, b, "x");
    });
    const decoded = S.decodeUnknownSync(schema)(graph);

    expect(decoded.type).toBe("directed");
    expect(decoded.mutable).toBe(false);
    expect(Array.from(decoded.nodes.entries())).toEqual([
      [0, 1],
      [1, 2],
    ]);
  });

  it("reports nested node decode failures on existing graphs", () => {
    const schema = DirectedGraphFromSelf({
      node: S.NumberFromString,
      edge: S.String,
    });
    const graph = Graph_.directed<string | null, string>((mutable) => {
      const a = Graph_.addNode(mutable, "1");
      const b = Graph_.addNode(mutable, null);
      Graph_.addEdge(mutable, a, b, "x");
    });

    expect(() => S.decodeUnknownSync(schema)(graph)).toThrow(`Expected string, got null
  at ["nodes"][1][1]`);
  });

  it("rejects mutable graphs when the schema expects immutable ones", () => {
    const schema = GraphFromSelf({
      node: S.NumberFromString,
      edge: S.String,
    });
    const graph = Graph_.beginMutation(
      Graph_.directed<string, string>((mutable) => {
        const a = Graph_.addNode(mutable, "1");
        const b = Graph_.addNode(mutable, "2");
        Graph_.addEdge(mutable, a, b, "x");
      })
    );

    expect(() => S.decodeUnknownSync(schema)(graph)).toThrow("Expected GraphFromSelf, got Graph(directed, 2, 1)");
  });

  it("validates existing mutable directed graphs and preserves mutability", () => {
    const schema = MutableDirectedGraphFromSelf({
      node: S.NumberFromString,
      edge: S.String,
    });
    const graph = Graph_.beginMutation(Graph_.directed<string, string>());
    const a = Graph_.addNode(graph, "1");
    const b = Graph_.addNode(graph, "2");
    Graph_.addEdge(graph, a, b, "x");

    const decoded = S.decodeUnknownSync(schema)(graph);

    expect(decoded.type).toBe("directed");
    expect(decoded.mutable).toBe(true);
    expect(Array.from(decoded.nodes.entries())).toEqual([
      [0, 1],
      [1, 2],
    ]);
  });
});

describe("MutableDirectedGraph", () => {
  it("decodes encoded payloads into mutable directed graphs", () => {
    const schema = MutableDirectedGraph({
      node: S.NumberFromString,
      edge: S.String,
    });
    const decoded = S.decodeUnknownSync(schema)({
      _tag: "Graph",
      type: "directed",
      nodes: [
        [0, "1"],
        [1, "2"],
      ],
      edges: [{ index: 0, source: 0, target: 1, data: "a" }],
    });

    expect(decoded.type).toBe("directed");
    expect(decoded.mutable).toBe(true);
    expect(S.encodeSync(schema)(decoded)).toEqual({
      _tag: "Graph",
      type: "directed",
      nodes: [
        [0, "1"],
        [1, "2"],
      ],
      edges: [{ index: 0, source: 0, target: 1, data: "a" }],
    });
  });
});

describe("Graph formatting and equivalence", () => {
  it("derives formatter and equivalence instances", () => {
    const schema = DirectedGraphFromSelf({
      node: S.Number,
      edge: S.String,
    });
    const graphA = Graph_.directed<number, string>((mutable) => {
      const a = Graph_.addNode(mutable, 1);
      const b = Graph_.addNode(mutable, 2);
      Graph_.addEdge(mutable, a, b, "x");
    });
    const graphB = Graph_.directed<number, string>((mutable) => {
      const a = Graph_.addNode(mutable, 1);
      const b = Graph_.addNode(mutable, 2);
      Graph_.addEdge(mutable, a, b, "x");
    });

    expect(S.toFormatter(schema)(graphA)).toBe(
      `Graph.directed({ nodes: [[0, 1], [1, 2]], edges: [[0, Edge(0, 1, "x")]] })`
    );
    expect(S.toEquivalence(schema)(graphA, graphB)).toBe(true);
  });
});
