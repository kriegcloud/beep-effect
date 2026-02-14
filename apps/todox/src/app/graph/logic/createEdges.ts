import { $TodoxId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as MutableHashMap from "effect/MutableHashMap";
import * as S from "effect/Schema";
import type { Connections } from "./createConnections";

const $I = $TodoxId.create("app/graph/logic/createEdges");

export class Edge extends S.Class<Edge>($I`Edge`)(
  {
    source: S.String,
    target: S.String,
  },
  $I.annotations("Edge", {
    description:
      "Represents a connection between two nodes in the graph, indicating a relationship or link from the source node to the target node.",
  })
) {}

export const createEdges = (connections: Connections): Array<Edge> => {
  const edges = A.empty<Edge>();

  MutableHashMap.forEach(connections, (targets, source) => {
    for (const target of targets) {
      edges.push(new Edge({ source, target }));
    }
  });

  return edges;
};
