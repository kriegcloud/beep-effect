import { $RepoUtilsId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt } from "@beep/schema";
import { pipe, Tuple } from "effect";
import * as S from "effect/Schema";

// cspell:ignore codegraph
const $I = $RepoUtilsId.create("codegraph/ingest/types");

/**
 * Source range for a discovered symbol.
 *
 * @category codegraph
 * @since 0.0.0
 */
export class Range extends S.Class<Range>($I`Range`)(
  {
    startLine: NonNegativeInt,
    startCol: NonNegativeInt,
    endLine: NonNegativeInt,
    endCol: NonNegativeInt,
  },
  $I.annote("Range", {
    description: "A range of lines and columns in a file.",
  })
) {}

/**
 * Symbol kind schema.
 *
 * @category codegraph
 * @since 0.0.0
 */
export const SymbolKind = LiteralKit(["function", "class", "method", "variable", "module"]).annotate(
  $I.annote("SymbolKind", {
    description: "The kind of symbol.",
  })
);
/**
 * Symbol kind literal union.
 *
 * @category codegraph
 * @since 0.0.0
 */
export type SymbolKind = typeof SymbolKind.Type;
const SymbolRecFields = {
  id: S.String,
  name: S.String,
  file: S.String,
  range: Range,
  signature: S.OptionFromOptionalKey(S.String),
  parentId: S.OptionFromOptionalKey(S.NullOr(S.String)),
};

/**
 * Symbol record tagged by {@link SymbolKind}.
 *
 * @category codegraph
 * @since 0.0.0
 */
export const SymbolRec = SymbolKind.toTaggedUnion("kind")({
  function: SymbolRecFields,
  class: SymbolRecFields,
  method: SymbolRecFields,
  variable: SymbolRecFields,
  module: SymbolRecFields,
}).pipe(
  S.annotate(
    $I.annote("SymbolRec", {
      description: "A symbol record with kind, id, name, file, range, signature, and parentId.",
    })
  )
);
/**
 * Symbol record helper types.
 *
 * @category codegraph
 * @since 0.0.0
 */
export declare namespace SymbolRec {
  /**
   * Decoded symbol record.
   *
   * @category codegraph
   * @since 0.0.0
   */
  export type Type = typeof SymbolRec.Type;
  /**
   * Encoded symbol record.
   *
   * @category codegraph
   * @since 0.0.0
   */
  export type Encoded = typeof SymbolRec.Encoded;
}
/**
 * Edge kind schema.
 *
 * @category codegraph
 * @since 0.0.0
 */
export const EdgeType = LiteralKit(["defines", "call", "import", "member_of"]).annotate(
  $I.annote("EdgeType", {
    description: "The type of edge between symbols.",
  })
);

/**
 * Edge kind literal union.
 *
 * @category codegraph
 * @since 0.0.0
 */
export type EdgeType = typeof EdgeType.Type;

/**
 * Edge record tagged by {@link EdgeType}.
 *
 * @category codegraph
 * @since 0.0.0
 */
export const EdgeRec = EdgeType.mapMembers((members) => {
  const makeTagged = <T extends typeof EdgeType.Type>(literal: S.Literal<T>) =>
    S.Struct({
      src: S.String,
      dst: S.String,
      type: S.tag(literal.literal),
    });

  return pipe(
    members,
    Tuple.evolve([
      (tag) => makeTagged(tag),
      (tag) => makeTagged(tag),
      (tag) => makeTagged(tag),
      (tag) => makeTagged(tag),
    ])
  );
}).pipe(
  S.toTaggedUnion("type"),
  S.annotate(
    $I.annote("EdgeRec", {
      description: "An edge record with source, destination, and type.",
    })
  )
);

/**
 * Edge record helper types.
 *
 * @category codegraph
 * @since 0.0.0
 */
export declare namespace EdgeRec {
  /**
   * Decoded edge record.
   *
   * @category codegraph
   * @since 0.0.0
   */
  export type Type = typeof EdgeRec.Type;
  /**
   * Encoded edge record.
   *
   * @category codegraph
   * @since 0.0.0
   */
  export type Encoded = typeof EdgeRec.Encoded;
}

/**
 * Top-level graph payload.
 *
 * @category codegraph
 * @since 0.0.0
 */
export class Graph extends S.Class<Graph>($I`Graph`)({
  symbols: S.Array(SymbolRec),
  edges: S.Array(EdgeRec),
}) {}
