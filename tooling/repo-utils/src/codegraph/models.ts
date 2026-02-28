import { $RepoUtilsId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt } from "@beep/schema";
import { pipe, Tuple } from "effect";
import * as S from "effect/Schema";

// cspell:ignore codegraph
const $I = $RepoUtilsId.create("codegraph/models");

/**
 * Node kind schema for code graph nodes.
 *
 * @category codegraph
 * @since 0.0.0
 */
export const NodeKind = LiteralKit([
  "package",
  "file",
  "namespace",
  "class",
  "interface",
  "type_alias",
  "enum",
  "enum_member",
  "function",
  "method",
  "constructor",
  "getter",
  "setter",
  "property",
  "parameter",
  "variable",
  "decorator",
  "jsx_component",
  "module_declaration",
]).annotate(
  $I.annote("NodeKind", {
    description: "The kind of node in the code graph.",
  })
);

/**
 * Node kind literal union.
 *
 * @category codegraph
 * @since 0.0.0
 */
export type NodeKind = typeof NodeKind.Type;

/**
 * Graph node schema tagged by {@link NodeKind}.
 *
 * @category codegraph
 * @since 0.0.0
 */
export const GraphNode = NodeKind.mapMembers((members) => {
  const makeNodeKind = <T extends NodeKind>(literal: S.Literal<T>) =>
    S.Struct({
      kind: S.tag(literal.literal),
      id: S.String,
      label: S.String,
      filePath: S.String,
      line: NonNegativeInt,
      endline: NonNegativeInt,
      exported: S.Boolean,
      meta: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)),
    });

  return pipe(
    members,
    Tuple.evolve([
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
      (tag) => makeNodeKind(tag),
    ])
  );
}).pipe(
  S.toTaggedUnion("kind"),
  S.annotate(
    $I.annote("GraphNode", {
      description: "A node in the code graph.",
    })
  )
);

/**
 * Graph node helper types.
 *
 * @category codegraph
 * @since 0.0.0
 */
export declare namespace GraphNode {
  /**
   * Decoded graph node.
   *
   * @category codegraph
   * @since 0.0.0
   */
  export type Type = typeof GraphNode.Type;
  /**
   * Encoded graph node.
   *
   * @category codegraph
   * @since 0.0.0
   */
  export type Encoded = typeof GraphNode.Encoded;
}

/**
 * Edge kind schema for graph relationships.
 *
 * @category codegraph
 * @since 0.0.0
 */
export const EdgeKind = LiteralKit([
  "imports",
  "re_exports",
  "calls",
  "instantiates",
  "extends",
  "implements",
  "overrides",
  "contains",
  "has_method",
  "has_constructor",
  "has_property",
  "has_getter",
  "has_setter",
  "has_parameter",
  "has_member",
  "type_reference",
  "return_type",
  "generic_constraint",
  "reads_property",
  "writes_property",
  "decorates",
  "throws",
  "conditional_calls",
  "test_covers",
  "uses_type",
  "exports",
]);

/**
 * Edge kind literal union.
 *
 * @category codegraph
 * @since 0.0.0
 */
export type EdgeKind = typeof EdgeKind.Type;

/**
 * Graph edge schema tagged by {@link EdgeKind}.
 *
 * @category codegraph
 * @since 0.0.0
 */
export const GraphEdge = EdgeKind.mapMembers((members) => {
  const makeGraphEdge = <T extends EdgeKind>(literal: S.Literal<T>) =>
    S.Struct({
      kind: S.tag(literal.literal),
      source: S.String,
      target: S.String,
      label: S.OptionFromOptionalKey(S.String),
      meta: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)),
    });
  return pipe(
    members,
    Tuple.evolve([
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
      (tag) => makeGraphEdge(tag),
    ])
  );
}).pipe(
  S.toTaggedUnion("kind"),
  S.annotate(
    $I.annote("GraphEdge", {
      description: "An edge in the code graph.",
    })
  )
);

/**
 * Metadata schema for a codebase graph extraction.
 *
 * @category codegraph
 * @since 0.0.0
 */
export class CodebaseGraphMeta extends S.Class<CodebaseGraphMeta>($I`CodebaseGraphMeta`)(
  {
    extractedAt: S.DateTimeUtcFromString,
    fileCount: NonNegativeInt,
    nodeCount: NonNegativeInt,
    edgeCount: NonNegativeInt,
    rootDir: S.String,
    nodeKinds: S.Record(S.String, S.Number),
    nodeKindCounts: S.Record(S.String, S.Number),
  },
  $I.annote("CodebaseGraphMeta", {
    description: "Metadata for a codebase graph.",
  })
) {}

/**
 * Full codebase graph payload.
 *
 * @category codegraph
 * @since 0.0.0
 */
export class CodebaseGraph extends S.Class<CodebaseGraph>($I`CodebaseGraph`)({
  nodes: S.Array(GraphNode),
  edges: S.Array(GraphEdge),
  meta: CodebaseGraphMeta,
}) {}

/**
 * File path schema.
 *
 * @category codegraph
 * @since 0.0.0
 */
export const FilePath = S.String.annotate(
  $I.annote("FilePath", {
    description: "A file path.",
  })
);

/**
 * File path runtime type.
 *
 * @category codegraph
 * @since 0.0.0
 */
export type FilePath = typeof FilePath.Type;

/**
 * Name schema for graph identifiers.
 *
 * @category codegraph
 * @since 0.0.0
 */
export const Name = S.String.annotate(
  $I.annote("Name", {
    description: "A name.",
  })
);

/**
 * Name runtime type.
 *
 * @category codegraph
 * @since 0.0.0
 */
export type Name = typeof Name.Type;

/**
 * Graph node identifier schema.
 *
 * @category codegraph
 * @since 0.0.0
 */
export const GraphNodeId = S.TemplateLiteral([NodeKind, "::", FilePath, "::", Name]).annotate(
  $I.annote("GraphNodeId", {
    description: "A unique identifier for a graph node.",
  })
);

/**
 * Graph node identifier helper types.
 *
 * @category codegraph
 * @since 0.0.0
 */
export declare namespace GraphNodeId {
  /**
   * Decoded graph node identifier.
   *
   * @category codegraph
   * @since 0.0.0
   */
  export type Type = typeof GraphNodeId.Type;
  /**
   * Encoded graph node identifier.
   *
   * @category codegraph
   * @since 0.0.0
   */
  export type Encoded = typeof GraphNodeId.Encoded;
}

/**
 * File identifier schema.
 *
 * @category codegraph
 * @since 0.0.0
 */
export const FileId = S.TemplateLiteral(["file::", FilePath]).annotate(
  $I.annote("FileId", {
    description: "A fileId",
  })
);

/**
 * File identifier helper types.
 *
 * @category codegraph
 * @since 0.0.0
 */
export declare namespace FileId {
  /**
   * Decoded file identifier.
   *
   * @category codegraph
   * @since 0.0.0
   */
  export type Type = typeof FileId.Type;
  /**
   * Encoded file identifier.
   *
   * @category codegraph
   * @since 0.0.0
   */
  export type Encoded = typeof FileId.Encoded;
}

/**
 * Package identifier schema.
 *
 * @category codegraph
 * @since 0.0.0
 */
export const PkgId = S.TemplateLiteral(["package::", Name]).annotate(
  $I.annote("PkgId", {
    description: "A pkgId",
  })
);

/**
 * Package identifier helper types.
 *
 * @category codegraph
 * @since 0.0.0
 */
export declare namespace PkgId {
  /**
   * Decoded package identifier.
   *
   * @category codegraph
   * @since 0.0.0
   */
  export type Type = typeof PkgId.Type;
  /**
   * Encoded package identifier.
   *
   * @category codegraph
   * @since 0.0.0
   */
  export type Encoded = typeof PkgId.Encoded;
}
