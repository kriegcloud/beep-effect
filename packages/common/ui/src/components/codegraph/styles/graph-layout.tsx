import { $UiId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import type { TUnsafe } from "@beep/types";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

const $I = $UiId.create("components/codegraph/styles/graph-layout");

export const LayoutName = LiteralKit(["cose", "breadthFirst", "concentric", "circle"]).pipe(
  $I.annoteSchema("LayoutName", {
    description: "Available graph layout names for codegraph",
  })
);

export type LayoutName = typeof LayoutName.Type;

export class LayoutBase extends S.Class<LayoutBase>($I`LayoutBase`)({
  animate: S.Boolean,
  fit: S.Boolean,
  padding: S.Number,
  nodeDimensionsIncludeLabels: S.Boolean,
}) {}

const LayoutNodeFunction = S.declare((i: unknown): i is (param: TUnsafe.Any) => number => P.isFunction(i));

export class CircleLayout extends S.TaggedClass<CircleLayout>($I`CircleLayout`)(
  LayoutName.Enum.circle,
  {
    avoidOverlap: S.Boolean,
  },
  $I.annote("CircleLayout", {
    description: "Configuration options for the CircleLayout algorithm",
  })
) {}

export class ConcentricLayout extends S.TaggedClass<ConcentricLayout>($I`ConcentricLayout`)(
  LayoutName.Enum.concentric,
  {
    concentric: LayoutNodeFunction,
    levelWidth: LayoutNodeFunction,
    avoidOverlap: S.Boolean,
    minNodeSpacing: S.Number,
  },
  $I.annote("ConcentricLayout", {
    description: "Configuration options for the ConcentricLayout algorithm",
  })
) {}

export class BreadthFirstLayout extends S.TaggedClass<BreadthFirstLayout>($I`BreadthFirstLayout`)(
  LayoutName.Enum.breadthFirst,
  {
    directed: S.Boolean,
    spacingFactor: S.Number,
    avoidOverlap: S.Boolean,
    circle: S.Boolean,
    grid: S.Boolean,
    maximal: S.Boolean,
  },
  $I.annote("BreadthFirstLayout", {
    description: "Configuration options for the BreadthFirstLayout algorithm",
  })
) {}

export class CoseLayout extends S.TaggedClass<CoseLayout>($I`CoseLayout`)(
  LayoutName.Enum.cose,
  {
    nestingFactor: S.Number,
    gravity: S.Number,
    numIter: S.Number,
    initialTemp: S.Number,
    coolingFactor: S.Number,
    minTemp: S.Number,
    randomize: S.Boolean,
    componentSpacing: S.Number,
    nodeRepulsion: LayoutNodeFunction,
    idealEdgeLength: LayoutNodeFunction,
    edgeElasticity: LayoutNodeFunction,
  },
  $I.annote("CoseLayout", {
    description: "Configuration options for the CoseLayout algorithm",
  })
) {}

export const GraphLayout = S.Union([BreadthFirstLayout, CircleLayout, ConcentricLayout, CoseLayout]).pipe(
  S.toTaggedUnion("_tag"),
  $I.annoteSchema("GraphLayout", {
    description: "Available graph layout algorithms for codegraph",
  })
);
