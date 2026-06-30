/**
 * Internal schema module support.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Effect, Graph as Graph_ } from "effect";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import {
  makeGraphConstructionIssue,
  makeInvalidGraphIssue,
  sortRawEdgeEntries,
  sortRawNodeEntries,
} from "./Graph.shared.ts";
import type { SchemaIssue } from "effect";
import type { GraphEncoded } from "./Graph.encoded.ts";
import type { GraphKindValue } from "./Graph.shared.ts";

const populateMutableGraph = Effect.fn("Schema.Graph.populateMutableGraph")(function* <
  Node,
  Edge,
  Kind extends GraphKindValue,
>(
  mutable: Graph_.MutableGraph<Node, Edge, Kind>,
  encoded: GraphEncoded<Node, Edge, Kind>,
  actual: unknown
): Effect.fn.Return<Graph_.MutableGraph<Node, Edge, Kind>, SchemaIssue.Issue> {
  for (const [expectedIndex, node] of sortRawNodeEntries(encoded.nodes)) {
    const receivedIndex = Graph_.addNode(mutable, node);

    if (receivedIndex !== expectedIndex) {
      return yield* Effect.fail(makeGraphConstructionIssue(actual, "node", expectedIndex, receivedIndex));
    }
  }

  for (const { index, source, target, data } of sortRawEdgeEntries(encoded.edges)) {
    const receivedIndex = yield* Effect.try({
      try: () => Graph_.addEdge(mutable, source, target, data),
      catch: (cause) =>
        makeInvalidGraphIssue(actual, P.isError(cause) ? cause.message : "Failed to construct graph edge"),
    });

    if (receivedIndex !== index) {
      return yield* Effect.fail(makeGraphConstructionIssue(actual, "edge", index, receivedIndex));
    }
  }

  return mutable;
});

/** @internal */
/**
 * Public schema module export.
 *
 * @category constructors
 * @since 0.0.0
 */
export const rebuildImmutableGraph: {
  <Node, Edge>(
    encoded: GraphEncoded<Node, Edge>,
    options: { readonly actual: unknown; readonly expectedType?: GraphKindValue | undefined }
  ): Effect.Effect<Graph_.Graph<Node, Edge, GraphKindValue>, SchemaIssue.Issue>;
  (options: {
    readonly actual: unknown;
    readonly expectedType?: GraphKindValue | undefined;
  }): <Node, Edge>(
    encoded: GraphEncoded<Node, Edge>
  ) => Effect.Effect<Graph_.Graph<Node, Edge, GraphKindValue>, SchemaIssue.Issue>;
} = dual(
  2,
  <Node, Edge>(
    encoded: GraphEncoded<Node, Edge>,
    options: { readonly actual: unknown; readonly expectedType?: GraphKindValue | undefined }
  ): Effect.Effect<Graph_.Graph<Node, Edge, GraphKindValue>, SchemaIssue.Issue> => {
    const { actual, expectedType } = options;
    if (expectedType !== undefined && encoded.type !== expectedType) {
      return Effect.fail(makeInvalidGraphIssue(actual, `Expected ${expectedType} graph, got ${encoded.type}`));
    }

    if (encoded.type === "directed") {
      return Effect.map(
        populateMutableGraph(Graph_.beginMutation(Graph_.directed<Node, Edge>()), encoded, actual),
        Graph_.endMutation
      );
    }

    return Effect.map(
      populateMutableGraph(Graph_.beginMutation(Graph_.undirected<Node, Edge>()), encoded, actual),
      Graph_.endMutation
    );
  }
);

/** @internal */
/**
 * Public schema module export.
 *
 * @category constructors
 * @since 0.0.0
 */
export const rebuildMutableGraph: {
  <Node, Edge>(
    encoded: GraphEncoded<Node, Edge>,
    options: { readonly actual: unknown; readonly expectedType?: GraphKindValue | undefined }
  ): Effect.Effect<Graph_.MutableGraph<Node, Edge, GraphKindValue>, SchemaIssue.Issue>;
  (options: {
    readonly actual: unknown;
    readonly expectedType?: GraphKindValue | undefined;
  }): <Node, Edge>(
    encoded: GraphEncoded<Node, Edge>
  ) => Effect.Effect<Graph_.MutableGraph<Node, Edge, GraphKindValue>, SchemaIssue.Issue>;
} = dual(
  2,
  <Node, Edge>(
    encoded: GraphEncoded<Node, Edge>,
    options: { readonly actual: unknown; readonly expectedType?: GraphKindValue | undefined }
  ): Effect.Effect<Graph_.MutableGraph<Node, Edge, GraphKindValue>, SchemaIssue.Issue> =>
    Effect.map(rebuildImmutableGraph(encoded, options), Graph_.beginMutation)
);
