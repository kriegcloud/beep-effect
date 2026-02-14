import { $TodoxId } from "@beep/identity/packages";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as MutableHashMap from "effect/MutableHashMap";
import * as S from "effect/Schema";
import { SCALE } from "../constants";
import type { Connections } from "./createConnections";

const $I = $TodoxId.create("app/graph/logic/createNodes");

export class NodePosition extends S.Class<NodePosition>($I`NodePosition`)({
  x: S.Number,
  y: S.Number,
}) {}

export class NodeType extends S.Class<NodeType>($I`NodeType`)({
  key: S.String,
  position: NodePosition,
}) {}

export const createNodes = (connections: Connections) => {
  const nodeKeys = MutableHashMap.keys(connections);

  return pipe(
    nodeKeys,
    A.map(
      (key) =>
        new NodeType({
          key,
          position: new NodePosition({
            x: Math.random() * (SCALE * 0.6) + SCALE * 0.2,
            y: Math.random() * (SCALE * 0.6) + SCALE * 0.2,
          }),
        })
    )
  );
};
