/**
 * Value-object schemas for the knowledge graph.
 *
 * This is the foundation module. All other knowledge graph modules depend on
 * these types for node/edge identification, classification, and metadata.
 *
 * @example
 * ```typescript
 * import {
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * } from "@beep/knowledge-graph/Schemas"
 *
 * KnowledgeNodeKind.Enum.page // "page"
 * KnowledgeEdgeKind.is["wiki_link"]("wiki_link") // true
 * KnowledgeDomain.Enum.general // "general"
 * ```
 *
 * @module
 * @since 0.0.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { LiteralKit, NonEmptyTrimmedStr, SchemaUtils, Slug } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("knowledge-graph/Schemas");

// ---------------------------------------------------------------------------
// 1. KnowledgeNodeKind
// ---------------------------------------------------------------------------

/**
 * Discriminant for the kind of knowledge node in the graph.
 *
 * Supports `"page"`, `"code-symbol"`, `"code-file"`, `"code-module"`, and
 * `"concept"`. Built with {@link LiteralKit} so callers get `.Enum`, `.is`,
 * `.$match`, `.toTaggedUnion`, and `.thunk` for free.
 *
 * @example
 * ```typescript
 * import { KnowledgeNodeKind } from "@beep/knowledge-graph/Schemas"
 *
 * KnowledgeNodeKind.is["code-symbol"]("code-symbol") // true
 * KnowledgeNodeKind.Enum.page // "page"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const KnowledgeNodeKind = LiteralKit([
  "page",
  "code-symbol",
  "code-file",
  "code-module",
  "concept",
] as const).pipe(
  $I.annoteSchema("KnowledgeNodeKind", {
    description: "Classification of knowledge graph node types.",
  })
);

/**
 * Runtime type for {@link KnowledgeNodeKind}.
 *
 * @since 0.0.0
 * @category models
 */
export type KnowledgeNodeKind = typeof KnowledgeNodeKind.Type;

// ---------------------------------------------------------------------------
// 2. KnowledgeEdgeKind
// ---------------------------------------------------------------------------

/**
 * Discriminant for the kind of relationship edge in the graph.
 *
 * Supports `"wiki_link"`, `"code_import"`, `"code_export"`,
 * `"code_dependency"`, and `"semantic"`. Built with {@link LiteralKit}.
 *
 * @example
 * ```typescript
 * import { KnowledgeEdgeKind } from "@beep/knowledge-graph/Schemas"
 *
 * KnowledgeEdgeKind.$match("wiki_link", {
 * 
 * 
 * 
 * 
 * 
 * })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const KnowledgeEdgeKind = LiteralKit([
  "wiki_link",
  "code_import",
  "code_export",
  "code_dependency",
  "semantic",
]).pipe(
  $I.annoteSchema("KnowledgeEdgeKind", {
    description: "Classification of knowledge graph edge types.",
  })
);

/**
 * Runtime type for {@link KnowledgeEdgeKind}.
 *
 * @since 0.0.0
 * @category models
 */
export type KnowledgeEdgeKind = typeof KnowledgeEdgeKind.Type;

// ---------------------------------------------------------------------------
// 3. KnowledgeDomain
// ---------------------------------------------------------------------------

/**
 * Domain partition for knowledge graph nodes.
 *
 * Supports `"code"`, `"legal"`, `"compliance"`, and `"general"`.
 *
 * @example
 * ```typescript
 * import { KnowledgeDomain } from "@beep/knowledge-graph/Schemas"
 *
 * KnowledgeDomain.Enum.general // "general"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const KnowledgeDomain = LiteralKit(["code", "legal", "compliance", "general"]).pipe(
  $I.annoteSchema("KnowledgeDomain", {
    description: "Domain partition for knowledge graph nodes.",
  })
);

/**
 * Runtime type for {@link KnowledgeDomain}.
 *
 * @since 0.0.0
 * @category models
 */
export type KnowledgeDomain = typeof KnowledgeDomain.Type;

// ---------------------------------------------------------------------------
// 4. CertaintyTier
// ---------------------------------------------------------------------------

/**
 * Floating-point certainty score between 0.0 and 1.0, branded.
 *
 * Used by nodes and edges to express confidence in the data source.
 * A value of `1.0` represents procedural / human certainty, while
 * lower values (e.g. `0.7`) indicate LLM-inferred confidence.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { CertaintyTier } from "@beep/knowledge-graph/Schemas"
 *
 * const score = S.decodeUnknownSync(CertaintyTier)(0.85)
 * console.log(score) // 0.85
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CertaintyTier = S.Number.check(S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(1)).pipe(
  S.brand("CertaintyTier"),
  $I.annoteSchema("CertaintyTier", {
    description: "Confidence score in the range [0, 1].",
  })
);

/**
 * Runtime type for {@link CertaintyTier}.
 *
 * @since 0.0.0
 * @category models
 */
export type CertaintyTier = typeof CertaintyTier.Type;

// ---------------------------------------------------------------------------
// 5. Node ID types (S.TemplateLiteral per domain)
// ---------------------------------------------------------------------------

/**
 * URI identifying a vault page node.
 *
 * Shaped as `beep:page/{slug}` where the slug segment follows the
 * {@link Slug} schema from `@beep/schema`.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { PageNodeId } from "@beep/knowledge-graph/Schemas"
 *
 * const id = S.decodeUnknownSync(PageNodeId)("beep:page/design-decisions")
 * console.log(id) // "beep:page/design-decisions"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const PageNodeId = S.TemplateLiteral(["beep:page/", Slug]).pipe(
  $I.annoteSchema("PageNodeId", { description: "URI for page nodes." })
);

/**
 * Runtime type for {@link PageNodeId}.
 *
 * @since 0.0.0
 * @category models
 */
export type PageNodeId = typeof PageNodeId.Type;

/**
 * URI identifying a code symbol node.
 *
 * Shaped as `beep:symbol/{repoId}/{qualifiedName}`.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { SymbolNodeId } from "@beep/knowledge-graph/Schemas"
 *
 * const id = S.decodeUnknownSync(SymbolNodeId)("beep:symbol/repo-memory/RepoSymbolRecord")
 * console.log(id) // "beep:symbol/repo-memory/RepoSymbolRecord"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SymbolNodeId = S.TemplateLiteral(["beep:symbol/", S.NonEmptyString, "/", S.NonEmptyString]).pipe(
  $I.annoteSchema("SymbolNodeId", { description: "URI for code symbol nodes." })
);

/**
 * Runtime type for {@link SymbolNodeId}.
 *
 * @since 0.0.0
 * @category models
 */
export type SymbolNodeId = typeof SymbolNodeId.Type;

/**
 * URI identifying a code file node.
 *
 * Shaped as `beep:file/{repoId}/{filePath}`.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { FileNodeId } from "@beep/knowledge-graph/Schemas"
 *
 * const id = S.decodeUnknownSync(FileNodeId)("beep:file/repo-memory/src/index.ts")
 * console.log(id) // "beep:file/repo-memory/src/index.ts"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const FileNodeId = S.TemplateLiteral(["beep:file/", S.NonEmptyString, "/", S.NonEmptyString]).pipe(
  $I.annoteSchema("FileNodeId", { description: "URI for code file nodes." })
);

/**
 * Runtime type for {@link FileNodeId}.
 *
 * @since 0.0.0
 * @category models
 */
export type FileNodeId = typeof FileNodeId.Type;

/**
 * URI identifying a code module node.
 *
 * Shaped as `beep:module/{repoId}/{specifier}`.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { ModuleNodeId } from "@beep/knowledge-graph/Schemas"
 *
 * const id = S.decodeUnknownSync(ModuleNodeId)("beep:module/repo-memory/effect/Schema")
 * console.log(id) // "beep:module/repo-memory/effect/Schema"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ModuleNodeId = S.TemplateLiteral(["beep:module/", S.NonEmptyString, "/", S.NonEmptyString]).pipe(
  $I.annoteSchema("ModuleNodeId", { description: "URI for code module nodes." })
);

/**
 * Runtime type for {@link ModuleNodeId}.
 *
 * @since 0.0.0
 * @category models
 */
export type ModuleNodeId = typeof ModuleNodeId.Type;

/**
 * URI identifying a concept node.
 *
 * Shaped as `beep:concept/{domain}/{id}`.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { ConceptNodeId } from "@beep/knowledge-graph/Schemas"
 *
 * const id = S.decodeUnknownSync(ConceptNodeId)("beep:concept/legal/patent-claim-42")
 * console.log(id) // "beep:concept/legal/patent-claim-42"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ConceptNodeId = S.TemplateLiteral(["beep:concept/", S.NonEmptyString, "/", S.NonEmptyString]).pipe(
  $I.annoteSchema("ConceptNodeId", { description: "URI for concept nodes." })
);

/**
 * Runtime type for {@link ConceptNodeId}.
 *
 * @since 0.0.0
 * @category models
 */
export type ConceptNodeId = typeof ConceptNodeId.Type;

// ---------------------------------------------------------------------------
// 6. KnowledgeNodeId (union)
// ---------------------------------------------------------------------------

/**
 * Union of all knowledge node URI schemas.
 *
 * The node ID is the primary key in both the event log and the materialized
 * view. Deterministic generation means re-indexing the same source produces
 * the same IDs, enabling clean diff-based event emission.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { KnowledgeNodeId } from "@beep/knowledge-graph/Schemas"
 *
 * S.decodeUnknownSync(KnowledgeNodeId)("beep:page/my-page")
 * S.decodeUnknownSync(KnowledgeNodeId)("beep:symbol/repo-memory/MyClass")
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const KnowledgeNodeId = S.Union([PageNodeId, SymbolNodeId, FileNodeId, ModuleNodeId, ConceptNodeId]).pipe(
  $I.annoteSchema("KnowledgeNodeId", {
    description: "URI-shaped identifier for knowledge graph nodes.",
  })
);

/**
 * Runtime type for {@link KnowledgeNodeId}.
 *
 * @since 0.0.0
 * @category models
 */
export type KnowledgeNodeId = typeof KnowledgeNodeId.Type;

// ---------------------------------------------------------------------------
// 7. KnowledgeEdgeId
// ---------------------------------------------------------------------------

/**
 * Deterministic URI identifying a graph edge.
 *
 * Composed from source and target node IDs plus the edge kind to guarantee
 * uniqueness.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { KnowledgeEdgeId } from "@beep/knowledge-graph/Schemas"
 *
 * const id = S.decodeUnknownSync(KnowledgeEdgeId)("beep:edge/wiki_link/beep:page/a->beep:page/b")
 * console.log(id)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const KnowledgeEdgeId = NonEmptyTrimmedStr.pipe(
  S.brand("KnowledgeEdgeId"),
  $I.annoteSchema("KnowledgeEdgeId", {
    description: "Deterministic URI identifying a graph edge.",
  })
);

/**
 * Runtime type for {@link KnowledgeEdgeId}.
 *
 * @since 0.0.0
 * @category models
 */
export type KnowledgeEdgeId = typeof KnowledgeEdgeId.Type;

// ---------------------------------------------------------------------------
// 8. NodeMetadata
// ---------------------------------------------------------------------------

/**
 * Display and filtering metadata for a knowledge graph node.
 *
 * Carries the node's domain partition, provenance source, searchable tags,
 * display aliases, and a certainty score. All optional fields have sensible
 * defaults applied at both construction and decoding time.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { NodeMetadata } from "@beep/knowledge-graph/Schemas"
 *
 * const meta = S.decodeUnknownSync(NodeMetadata)({ source: "vault-parser" })
 * console.log(meta.domain) // "general"
 * console.log(meta.certainty) // 1
 * console.log(meta.tags) // []
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class NodeMetadata extends S.Class<NodeMetadata>($I`NodeMetadata`)(
  {
    domain: KnowledgeDomain.pipe(S.optionalKey, SchemaUtils.withKeyDefaults("general")),
    source: NonEmptyTrimmedStr,
    tags: S.Array(NonEmptyTrimmedStr).pipe(S.optionalKey, SchemaUtils.withKeyDefaults([])),
    aliases: S.Array(NonEmptyTrimmedStr).pipe(S.optionalKey, SchemaUtils.withKeyDefaults([])),
    certainty: CertaintyTier.pipe(S.optionalKey, SchemaUtils.withKeyDefaults(CertaintyTier.make(1))),
  },
  $I.annote("NodeMetadata", {
    description: "Display and filtering metadata for a knowledge graph node.",
  })
) {}
