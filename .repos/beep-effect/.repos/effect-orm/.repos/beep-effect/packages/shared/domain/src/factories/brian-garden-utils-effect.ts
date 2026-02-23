import { BS } from "@beep/schema";
import { MarkerType, Position as XYFlowPosition } from "@xyflow/react";
import { pipe, Struct } from "effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as M from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";

// Converts XYFlow's Position enum into a MappedLiteralKit... Yeah this is an effect/Schema now dig deeper for set of sick fucking utils attached
export const { DecodedEnum: Position } = BS.MappedLiteralKitFromEnum(XYFlowPosition);

// Domain schemas
export const Maintainer = BS.StructRecord({ name: S.String, email: BS.NullishString, url: BS.NullishString });
export type Maintainer = typeof Maintainer.Type;

export const Sprout = BS.StructRecord({
  name: S.String,
  description: BS.NullishString,
  homepage_url: S.String,
  logo: BS.NullishString,
  project_url: BS.NullishString,
  repo_url: BS.NullishString,
  twitter: BS.NullishString,
});
export type Sprout = typeof Sprout.Type;

export const Theme = BS.StructRecord({
  background_color: BS.NullishString,
  primary_color: BS.NullishString,
  secondary_color: BS.NullishString,
  text_color: BS.NullishString,
});

// Position schema for flow nodes
const Position2D = S.Struct({ x: S.Number, y: S.Number });
type Position2D = typeof Position2D.Type;

// Helper to create kind discriminator with constructor default
const Kind = <K extends string>(kind: K) => BS.LiteralWithDefault(kind);

// Shared node fields
const baseNodeFields = {
  id: S.String,
  label: S.String,
  description: BS.NullishString,
  theme: BS.Nullish(Theme),
};

// Position fields factory with configurable defaults
const PositionFields = (xDefault: number, yDefault: number) =>
  ({
    x: BS.NumWithDefault(xDefault),
    y: BS.NumWithDefault(yDefault),
  }) as const;

// Mixin for position getter - adds computed `position` property to classes with x/y fields
type HasXY = { readonly x: number; readonly y: number };
// biome-ignore lint/suspicious/noExplicitAny: Mixin constructor constraint
type Constructor<T = {}> = new (...args: any[]) => T;
const WithPosition = <T extends Constructor<HasXY>>(Base: T) =>
  class extends Base {
    get position(): Position2D {
      return { x: this.x, y: this.y };
    }
  };

// Node classes with "kind" discriminator and computed position getters
export class GardenNode extends WithPosition(
  S.Class<GardenNode>("GardenNode")({
    kind: Kind("garden"),
    ...baseNodeFields,
    version: BS.NullishString,
    icon: BS.NullishString,
    ...PositionFields(0, 0),
  })
) {
  get sourcePosition() {
    return Position.Bottom;
  }

  get targetPosition() {
    return Position.Top;
  }
}

export class SproutNode extends WithPosition(
  S.Class<SproutNode>("SproutNode")({
    kind: Kind("sprout"),
    ...baseNodeFields,
    homepage_url: S.String,
    logo: BS.NullishString,
    repo_url: BS.NullishString,
    ...PositionFields(0, 100),
  })
) {
  get targetPosition() {
    return Position.Top;
  }
}

export class SupergardenNode extends WithPosition(
  S.Class<SupergardenNode>("SupergardenNode")({
    kind: Kind("supergarden"),
    ...baseNodeFields,
    version: BS.NullishString,
    url: BS.NullishString,
    logo: BS.NullishString,
    ...PositionFields(-400, -200),
  })
) {
  get sourcePosition() {
    return Position.Bottom;
  }
}

export class SubgardenNode extends WithPosition(
  S.Class<SubgardenNode>("SubgardenNode")({
    kind: Kind("subgarden"),
    ...baseNodeFields,
    version: BS.NullishString,
    depth: BS.NumWithDefault(0),
    ...PositionFields(0, 150),
  })
) {
  get sourcePosition() {
    return Position.Bottom;
  }

  get targetPosition() {
    return Position.Top;
  }
}

// Union of all flow node types
export const FlowNode = S.Union(GardenNode, SproutNode, SupergardenNode, SubgardenNode);
export type FlowNode = typeof FlowNode.Type;
// Flow edge schema
export const FlowEdge = S.Struct({
  id: S.String,
  source: S.String,
  target: S.String,
  sourceHandle: S.optional(S.String),
  targetHandle: S.optional(S.String),
  animated: S.optional(S.Boolean),
  markerEnd: S.optional(S.Struct({ type: S.String })),
  style: S.optional(S.Record({ key: S.String, value: S.Unknown })),
});
export type FlowEdge = typeof FlowEdge.Type;

// Flow graph schema
export const FlowGraph = S.Struct({
  nodes: S.Array(FlowNode),
  edges: S.Array(FlowEdge),
});
export declare namespace FlowGraph {
  export type Type = typeof FlowGraph.Type;
}

// Garden schema (recursive)
const gardenBaseFields = {
  name: S.String,
  created_at: BS.NullishString,
  description: BS.NullishString,
  updated_at: BS.NullishString,
  version: BS.NullishString,
  maintainers: BS.Nullish(S.Array(Maintainer)),
  sprouts: BS.Nullish(S.Array(Sprout)),
  theme: BS.Nullish(Theme),
};

interface Garden extends S.Struct.Type<typeof gardenBaseFields> {
  readonly subgardens?: ReadonlyArray<Garden> | undefined;
  readonly supergardens?: ReadonlyArray<Garden> | undefined;

  readonly [key: string]: unknown;
}

interface GardenEncoded extends S.Struct.Encoded<typeof gardenBaseFields> {
  readonly subgardens?: ReadonlyArray<GardenEncoded> | undefined;
  readonly supergardens?: ReadonlyArray<GardenEncoded> | undefined;

  readonly [key: string]: unknown;
}

export const Garden: S.Schema<Garden, GardenEncoded> = S.Struct(
  {
    ...gardenBaseFields,
    subgardens: S.optional(S.Array(S.suspend((): S.Schema<Garden, GardenEncoded> => Garden))),
    supergardens: S.optional(S.Array(S.suspend((): S.Schema<Garden, GardenEncoded> => Garden))),
  },
  S.Record({ key: S.String, value: S.Unknown })
);

export const GardenSchema = Garden;
export type GardenSchema = typeof GardenSchema.Type;

// Conversion utilities
export const Convert = {
  toGardenSchema: S.decodeUnknownSync(S.parseJson(GardenSchema)),
  gardenSchemaToJson: S.encodeSync(S.parseJson(GardenSchema)),
  toGardenSchemaSafe: S.decodeUnknownEither(S.parseJson(GardenSchema)),
};

// Flow options (tagged union)
const flowOptionsFields = { expandSubgardens: S.optional(S.Boolean), animateEdges: S.optional(S.Boolean) };
export const FlowOptions = BS.TaggedUnionWith({
  tags: ["default", "straight", "step", "smoothstep", "simplebezier"],
  fields: flowOptionsFields,
});

export const FlowDefault = S.TaggedStruct("default", flowOptionsFields);

export const NodeType = BS.StringLiteralKit("garden", "sprout", "supergarden", "subgarden");

const prefixId = (prefix?: undefined | string) => (normalizedId: string) =>
  prefix ? `${prefix}-${normalizedId}` : normalizedId;

export const generateId: {
  (type: string, name: string, prefix?: string): string;
  (type: string, prefix?: string): (name: string) => string;
} = F.dual(
  (args: IArguments | ArrayLike<any>) => args.length >= 2,
  (type: string, name: string, prefix?: string): string =>
    pipe(
      name,
      Str.replaceAll(/[^a-zA-Z0-9\s]/g, ""),
      Str.replaceAll(/\s+/g, "-"),
      Str.toLowerCase,
      prefixId(prefix),
      (base) => `${type}-${base}`
    )
);

// Converts nullable array to non-nullable readonly array (returns empty if null/undefined)
const nullableToArray = <T>(nullable: T[] | ReadonlyArray<T> | undefined | null): readonly T[] =>
  pipe(O.fromNullable(nullable), O.getOrElse(A.empty<T>));

// Node position configuration - exhaustive matching on "kind" discriminator
export const getNodePositions = M.type<FlowNode>().pipe(
  M.discriminatorsExhaustive("kind")({
    garden: () => ({ sourcePosition: Position.Bottom, targetPosition: Position.Top }),
    sprout: () => ({ targetPosition: Position.Top }),
    supergarden: () => ({ sourcePosition: Position.Bottom }),
    subgarden: () => ({ sourcePosition: Position.Bottom, targetPosition: Position.Top }),
  })
);

// Node style extraction - exhaustive matching on "kind" discriminator
export const getNodeStyle = M.type<FlowNode>().pipe(
  M.discriminatorsExhaustive("kind")({
    garden: (n) => ({ background: n.theme?.primary_color, color: "var(--garden-primary-foreground)" }),
    sprout: () => ({ background: "var(--sprout-bg)" }),
    supergarden: (n) => ({ background: n.theme?.primary_color, color: "var(--garden-chart-9-foreground)" }),
    subgarden: (n) => ({ background: n.theme?.primary_color, color: "var(--garden-chart-5-foreground)" }),
  })
);

type BaseNodeInput = {
  readonly id: string;
  readonly label: string;
  readonly description?: string | undefined;
  readonly theme?: typeof Theme.Type | undefined;
};

type GardenNodeInput = BaseNodeInput & {
  readonly version?: string | undefined;
  readonly icon?: string | undefined;
  readonly x?: number;
  readonly y?: number;
};

type SproutNodeInput = BaseNodeInput & {
  readonly homepage_url: string;
  readonly logo?: string | undefined;
  readonly repo_url?: string | undefined;
  readonly x?: number;
  readonly y?: number;
};

type SupergardenNodeInput = BaseNodeInput & {
  readonly version?: string | undefined;
  readonly url?: string | undefined;
  readonly logo?: string | undefined;
  readonly x?: number;
  readonly y?: number;
};

type SubgardenNodeInput = BaseNodeInput & {
  readonly version?: string | undefined;
  readonly depth?: number;
  readonly x?: number;
  readonly y?: number;
};

// Node factories - use class constructors directly
export const makeGardenNode = (input: GardenNodeInput) => GardenNode.make(input);

export const makeSproutNode: {
  (input: SproutNodeInput, idx?: number): SproutNode;
  (idx?: number): (input: SproutNodeInput) => SproutNode;
} = F.dual(
  (args: any) => typeof args[0] === "object" && "homepage_url" in args[0],
  (input: SproutNodeInput, idx = 0): SproutNode => SproutNode.make({ ...input, x: input.x ?? idx * 180 })
);

export const makeSupergardenNode: {
  (input: SupergardenNodeInput, idx?: number): SupergardenNode;
  (idx?: number): (input: SupergardenNodeInput) => SupergardenNode;
} = F.dual(
  (args: any) => typeof args[0] === "object" && "id" in args[0] && "label" in args[0],
  (input: SupergardenNodeInput, idx = 0): SupergardenNode =>
    SupergardenNode.make({ ...input, x: input.x ?? -400 + idx * 150 })
);

export const makeSubgardenNode: {
  (input: SubgardenNodeInput, idx?: number, depth?: number): SubgardenNode;
  (idx?: number, depth?: number): (input: SubgardenNodeInput) => SubgardenNode;
} = F.dual(
  (args: any) => typeof args[0] === "object" && "id" in args[0] && "label" in args[0],
  (input: SubgardenNodeInput, idx = 0, depth = 0): SubgardenNode =>
    SubgardenNode.make({ ...input, depth, x: input.x ?? idx * 200, y: input.y ?? (depth + 1) * 150 })
);

// Garden search - supports both data-first and data-last
export const findGardenByName: {
  (gardens: ReadonlyArray<Garden>, name: string): O.Option<Garden>;
  (name: string): (gardens: ReadonlyArray<Garden>) => O.Option<Garden>;
} = F.dual(
  2,
  (gardens: ReadonlyArray<Garden>, name: string): O.Option<Garden> =>
    pipe(
      gardens,
      A.findFirst((g) => g.name === name),
      O.orElse(() =>
        pipe(
          gardens,
          A.flatMap((g) => A.appendAll(nullableToArray(g.supergardens))(nullableToArray(g.subgardens))),
          A.match({
            onEmpty: O.none,
            onNonEmpty: findGardenByName(name),
          })
        )
      )
    )
);

// Edge factory - supports both data-first and data-last
const makeEdge: {
  (node: FlowNode, source: string, animated?: boolean): FlowEdge;
  (source: string, animated?: boolean): (node: FlowNode) => FlowEdge;
} = F.dual(
  (args: any) => typeof args[0] === "object" && "id" in args[0] && "kind" in args[0],
  (node: FlowNode, source: string, animated = false): FlowEdge => ({
    id: `${source}-${node.id}`,
    source,
    target: node.id,
    markerEnd: { type: MarkerType.ArrowClosed.toString() },
    animated,
  })
);
const emptyFlowGraph = FlowGraph.make({ nodes: [], edges: [] });

// Track node connections - groupBy creates Record<string, NonEmptyArray<string>>
export const trackNodeConnections = (edges: ReadonlyArray<FlowEdge>) =>
  pipe(edges, A.groupBy(Struct.get("source")), R.map(A.map(Struct.get("target"))));

// Process subgardens recursively into FlowGraph - supports both data-first and data-last
export const processSubgardensRecursively: {
  (garden: Garden, parentId: string, depth?: number): FlowGraph.Type;
  (parentId: string, depth?: number): (garden: Garden) => FlowGraph.Type;
} = F.dual(
  (args: any) => P.compose(P.isObject, P.hasProperty("name"))(A.headNonEmpty(args)),
  (garden: Garden, parentId: string, depth = 0): FlowGraph.Type =>
    pipe(
      nullableToArray(garden.subgardens),
      A.map((sub, idx) => {
        const nodeId = generateId(NodeType.Enum.subgarden, sub.name, parentId);
        const node = makeSubgardenNode(
          {
            id: nodeId,
            label: sub.name,
            description: sub.description,
            theme: sub.theme,
            version: sub.version,
          },
          idx,
          depth
        );
        const edge = makeEdge(node, parentId);
        const nested = processSubgardensRecursively(sub, nodeId, depth + 1);
        return {
          nodes: pipe([node], A.appendAll(nested.nodes)),
          edges: pipe([edge], A.appendAll(nested.edges)),
        };
      }),
      A.reduce(emptyFlowGraph, (acc, item) => ({
        nodes: pipe(acc.nodes, A.appendAll(item.nodes)),
        edges: pipe(acc.edges, A.appendAll(item.edges)),
      }))
    )
);

// Convert Garden to FlowGraph
export const gardenToFlowGraph = (garden: Garden): FlowGraph.Type => {
  const rootId = generateId(NodeType.Enum.garden, garden.name);
  const rootNode = makeGardenNode({
    id: rootId,
    label: garden.name,
    description: garden.description,
    theme: garden.theme,
    version: garden.version,
  });

  const sproutNodes = pipe(
    nullableToArray(garden.sprouts),
    A.map((sprout, idx) =>
      makeSproutNode(
        {
          id: generateId(NodeType.Enum.sprout, sprout.name, rootId),
          label: sprout.name,
          description: sprout.description,
          homepage_url: sprout.homepage_url,
          logo: sprout.logo,
          repo_url: sprout.repo_url,
        },
        idx
      )
    )
  );

  const sproutEdges = pipe(sproutNodes, A.map(makeEdge(rootId)));

  const supergardenNodes = pipe(
    nullableToArray(garden.supergardens),
    A.map((sg, idx) =>
      makeSupergardenNode(
        {
          id: generateId(NodeType.Enum.supergarden, sg.name, rootId),
          label: sg.name,
          description: sg.description,
          theme: sg.theme,
          version: sg.version,
        },
        idx
      )
    )
  );

  const supergardenEdges = pipe(supergardenNodes, A.map(makeEdge(rootId)));

  const subgardensFlow = processSubgardensRecursively(garden, rootId);

  return {
    nodes: pipe(supergardenNodes, A.append(rootNode), A.appendAll(sproutNodes), A.appendAll(subgardensFlow.nodes)),
    edges: pipe(supergardenEdges, A.appendAll(sproutEdges), A.appendAll(subgardensFlow.edges)),
  };
};

// Transformation schema: Garden -> FlowGraph
export const GardenToFlowGraph = BS.destructiveTransform(gardenToFlowGraph)(Garden);
