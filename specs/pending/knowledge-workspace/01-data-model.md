# 01 - Data Model and Persistence

All types in this spec are schema-first. No standalone type aliases or interfaces.
Every schema carries `$I` identity annotations. Every literal domain uses
`LiteralKit`. Every URI uses `S.TemplateLiteral`. Every persisted entity uses
`Model.Class` (via `DomainModel.make`) with `$I`. Events use
`S.TaggedClass` with `$I`.

```ts
// File-scoped identity composer (assumed throughout this document).
import { $SharedDomainId } from "@beep/identity/packages"
const $I = $SharedDomainId.create("knowledge-graph/data-model")
```

---

## 1. KnowledgeNodeKind

Tagged union of node types, built with `LiteralKit` so callers get `.Enum`,
`.is`, `.$match`, `.toTaggedUnion`, and `.thunk` for free.

```ts
/**
 * Discriminant for the kind of knowledge node in the graph.
 *
 * @example
 * ```ts
 * import { LiteralKit } from "@beep/schema"
 *
 * const KnowledgeNodeKind = LiteralKit([
 *   "page", "code-symbol", "code-file", "code-module", "concept",
 * ] as const)
 *
 * KnowledgeNodeKind.is["code-symbol"]("code-symbol") // true
 * KnowledgeNodeKind.Enum.page                        // "page"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
const KnowledgeNodeKind = LiteralKit([
  "page",
  "code-symbol",
  "code-file",
  "code-module",
  "concept",
] as const).pipe(
  $I.annoteSchema("KnowledgeNodeKind", {
    description: "Classification of knowledge graph node types.",
  })
)
```

| Kind | Description | Source |
|---|---|---|
| `page` | Human-authored document in the vault | `.beep/vault/pages/{slug}.md` |
| `code-symbol` | A `RepoSymbolRecord` (function, class, interface, typeAlias, const, enum, namespace) | `repo-memory.db` |
| `code-file` | A `RepoSourceFile` | `repo-memory.db` |
| `code-module` | A module specifier (package or local path) | `repo-memory.db` |
| `concept` | Future: legal, IP, compliance entities | Domain-specific stores |

Adding a new kind requires: (1) add the literal, (2) add a corresponding body
case to `KnowledgeNodeBody`, (3) add projection logic in the relevant indexer.
All `.$match` and `Match` call sites get a compile error until handled.

---

## 2. KnowledgeEdgeKind

```ts
/**
 * Discriminant for the kind of relationship edge in the graph.
 *
 * @example
 * ```ts
 * import { LiteralKit } from "@beep/schema"
 *
 * const KnowledgeEdgeKind = LiteralKit([
 *   "wiki-link", "code-import", "code-export", "code-dependency", "semantic",
 * ] as const)
 *
 * KnowledgeEdgeKind.$match("wiki-link", {
 *   "wiki-link":       () => 1.0,
 *   "code-import":     () => 1.0,
 *   "code-export":     () => 1.0,
 *   "code-dependency": () => 1.0,
 *   semantic:          () => 0.7,
 * })
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
const KnowledgeEdgeKind = LiteralKit([
  "wiki-link",
  "code-import",
  "code-export",
  "code-dependency",
  "semantic",
] as const).pipe(
  $I.annoteSchema("KnowledgeEdgeKind", {
    description: "Classification of knowledge graph edge types.",
  })
)
```

| Kind | Description | Certainty | Source |
|---|---|---|---|
| `wiki-link` | `[[slug]]` reference in markdown body | 1.0 | Vault page parser |
| `code-import` | AST import edge between symbols/files | 1.0 | repo-memory indexer |
| `code-export` | Symbol exported from a file | 1.0 | repo-memory indexer |
| `code-dependency` | File depends on file (transitive closure of imports) | 1.0 | repo-memory indexer |
| `semantic` | LLM-inferred relationship | 0.6 - 0.85 | Agent inference pipeline |

Semantic edges live inside the No-Escape Theorem boundary. They never promote to
procedural certainty without explicit user confirmation.

---

## 3. KnowledgeDomain

```ts
/**
 * Domain partition for knowledge graph nodes.
 *
 * @example
 * ```ts
 * import { LiteralKit } from "@beep/schema"
 *
 * const KnowledgeDomain = LiteralKit([
 *   "code", "legal", "compliance", "general",
 * ] as const)
 *
 * KnowledgeDomain.Enum.general // "general"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
const KnowledgeDomain = LiteralKit([
  "code",
  "legal",
  "compliance",
  "general",
] as const).pipe(
  $I.annoteSchema("KnowledgeDomain", {
    description: "Domain partition for knowledge graph nodes.",
  })
)
```

---

## 4. Node IDs via S.TemplateLiteral

Each node kind has a deterministic URI-shaped ID. The IDs are built with
`S.TemplateLiteral` so they are validated at decode time, branded, and
parseable via `S.TemplateLiteralParser` when needed.

```ts
import * as S from "effect/Schema"

/**
 * URL-safe page slug used as the filename stem inside the vault.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * const Slug = S.NonEmptyTrimmedString.pipe(S.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
 * S.decodeUnknownSync(Slug)("design-decisions")
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
const Slug = S.NonEmptyTrimmedString.pipe(
  S.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  $I.annoteSchema("Slug", { description: "URL-safe page slug." })
)
type Slug = typeof Slug.Type

/**
 * URI identifying a vault page node.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // Validates: "beep:page/design-decisions"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
const PageNodeId = S.TemplateLiteral(["beep:page/", Slug]).pipe(
  $I.annoteSchema("PageNodeId", { description: "URI for page nodes." })
)
type PageNodeId = typeof PageNodeId.Type

/**
 * URI identifying a code symbol node.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // Validates: "beep:symbol/repo-memory/RepoSymbolRecord"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
const SymbolNodeId = S.TemplateLiteral([
  "beep:symbol/", RepoId, "/", S.NonEmptyString,
]).pipe(
  $I.annoteSchema("SymbolNodeId", { description: "URI for code symbol nodes." })
)
type SymbolNodeId = typeof SymbolNodeId.Type

/**
 * URI identifying a code file node.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // Validates: "beep:file/repo-memory/src/internal/domain.ts"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
const FileNodeId = S.TemplateLiteral([
  "beep:file/", RepoId, "/", S.NonEmptyString,
]).pipe(
  $I.annoteSchema("FileNodeId", { description: "URI for code file nodes." })
)
type FileNodeId = typeof FileNodeId.Type

/**
 * URI identifying a code module node.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // Validates: "beep:module/repo-memory/effect/Schema"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
const ModuleNodeId = S.TemplateLiteral([
  "beep:module/", RepoId, "/", S.NonEmptyString,
]).pipe(
  $I.annoteSchema("ModuleNodeId", { description: "URI for code module nodes." })
)
type ModuleNodeId = typeof ModuleNodeId.Type

/**
 * URI identifying a concept node.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // Validates: "beep:concept/legal/patent-claim-42"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
const ConceptNodeId = S.TemplateLiteral([
  "beep:concept/", S.NonEmptyString, "/", S.NonEmptyString,
]).pipe(
  $I.annoteSchema("ConceptNodeId", { description: "URI for concept nodes." })
)
type ConceptNodeId = typeof ConceptNodeId.Type
```

### Union

```ts
/**
 * Union of all knowledge node URI schemas. The node ID is the primary key in
 * both the event log and the materialized view. Deterministic generation means
 * re-indexing the same source produces the same IDs, enabling clean diff-based
 * event emission.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // Any of the five URI patterns is valid:
 * // "beep:page/my-page"
 * // "beep:symbol/repo-memory/MyClass"
 * // "beep:file/repo-memory/src/index.ts"
 * // "beep:module/repo-memory/effect/Schema"
 * // "beep:concept/legal/patent-42"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
const KnowledgeNodeId = S.Union([
  PageNodeId,
  SymbolNodeId,
  FileNodeId,
  ModuleNodeId,
  ConceptNodeId,
]).pipe(
  $I.annoteSchema("KnowledgeNodeId", {
    description: "Union of all knowledge node URI schemas.",
  })
)
type KnowledgeNodeId = typeof KnowledgeNodeId.Type
```

### ID pattern table

| Kind | Pattern | Example |
|---|---|---|
| `page` | `beep:page/{slug}` | `beep:page/design-decisions` |
| `code-symbol` | `beep:symbol/{repoId}/{qualifiedName}` | `beep:symbol/repo-memory/RepoSymbolRecord` |
| `code-file` | `beep:file/{repoId}/{filePath}` | `beep:file/repo-memory/src/internal/domain.ts` |
| `code-module` | `beep:module/{repoId}/{specifier}` | `beep:module/repo-memory/effect/Schema` |
| `concept` | `beep:concept/{domain}/{id}` | `beep:concept/legal/patent-claim-42` |

---

## 5. Edge ID

```ts
/**
 * Deterministic URI for graph edges. Composed from source and target node IDs
 * plus the edge kind to guarantee uniqueness.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // Validates: "beep:edge/wiki-link/beep:page/a->beep:page/b"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
const KnowledgeEdgeId = S.NonEmptyTrimmedString.pipe(
  S.brand("KnowledgeEdgeId"),
  $I.annoteSchema("KnowledgeEdgeId", {
    description: "Deterministic URI identifying a graph edge.",
  })
)
type KnowledgeEdgeId = typeof KnowledgeEdgeId.Type
```

---

## 6. CertaintyTier

```ts
/**
 * Floating-point certainty score between 0.0 and 1.0, branded. Used by both
 * nodes and edges to express confidence in the data source.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // 1.0 = procedural / human, 0.7 = LLM high-confidence
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
const CertaintyTier = S.Number.pipe(
  S.greaterThanOrEqualTo(0),
  S.lessThanOrEqualTo(1),
  S.brand("CertaintyTier"),
  $I.annoteSchema("CertaintyTier", {
    description: "Certainty score between 0.0 and 1.0.",
  })
)
type CertaintyTier = typeof CertaintyTier.Type
```

---

## 7. Domain-Specific Node Bodies (KnowledgeNodeBody)

Each node kind carries a typed body as a tagged union discriminated by `kind`,
built via `KnowledgeNodeKind.toTaggedUnion`. The body variants reuse existing
schemas where possible.

```ts
/**
 * Tagged union of per-kind node payloads. Discriminated on `"kind"` so that
 * `KnowledgeNodeBody.$match` gives exhaustive pattern matching.
 *
 * @example
 * ```ts
 * import { LiteralKit } from "@beep/schema"
 * import * as S from "effect/Schema"
 *
 * // KnowledgeNodeKind.toTaggedUnion("kind")({...cases...})
 * ```
 *
 * @category models
 * @since 0.0.0
 */
const KnowledgeNodeBody = KnowledgeNodeKind.toTaggedUnion("kind")({
  page: {
    slug: Slug,
    title: S.NonEmptyTrimmedString,
    outboundLinks: S.Array(S.NonEmptyTrimmedString),
    excerpt: S.String.pipe(S.optionalKey, SchemaUtils.withKeyDefaults("")),
  },
  "code-symbol": {
    repoId: RepoId,
    symbolName: S.NonEmptyTrimmedString,
    qualifiedName: S.NonEmptyTrimmedString,
    symbolKind: RepoSymbolKind,
    filePath: S.NonEmptyTrimmedString,
    signature: S.String.pipe(S.optionalKey, SchemaUtils.withKeyDefaults("")),
    exported: S.Boolean,
  },
  "code-file": {
    repoId: RepoId,
    filePath: S.NonEmptyTrimmedString,
    workspaceName: S.String.pipe(S.optionalKey, SchemaUtils.withKeyDefaults("")),
    lineCount: S.Int,
  },
  "code-module": {
    repoId: RepoId,
    specifier: S.NonEmptyTrimmedString,
  },
  concept: {
    domain: S.NonEmptyTrimmedString,
    jurisdiction: S.String.pipe(S.optionalKey, SchemaUtils.withKeyDefaults("")),
    statuteRef: S.String.pipe(S.optionalKey, SchemaUtils.withKeyDefaults("")),
    effectiveDate: S.optionalKey(S.DateTimeUtc),
    complianceStatus: S.String.pipe(S.optionalKey, SchemaUtils.withKeyDefaults("")),
  },
})
type KnowledgeNodeBody = typeof KnowledgeNodeBody.Type
```

Returned value has `.match`, `.cases`, `.guards`, `.isAnyOf` attached by
`S.toTaggedUnion`.

---

## 8. Universal Node Envelope (GraphNode)

Every node in the graph shares a common envelope defined with `DomainModel.make`.
The factory auto-injects audit columns (`createdAt`, `updatedAt`, `deletedAt`,
`createdBy`, `updatedBy`, `deletedBy`, `version`, `source`).

```ts
import * as M from "@beep/schema/Model"
import { DomainModel } from "@beep/shared-domain/factories"
import { SchemaUtils } from "@beep/schema"

/**
 * Materialized graph node with audit columns. The `nodeId` is the URI-shaped
 * primary key (not an auto-increment integer), so it uses `M.GeneratedByApp`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // GraphNode.make({ nodeId: "beep:page/foo", kind: "page", ... })
 * // GraphNode.insert.make({ nodeId: "beep:page/foo", ... })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GraphNode extends DomainModel.make<GraphNode>($I`GraphNodeModel`)(
  {
    nodeId: M.GeneratedByApp(KnowledgeNodeId),
    kind: KnowledgeNodeKind,
    domain: KnowledgeDomain,
    displayLabel: S.NonEmptyTrimmedString,
    certainty: CertaintyTier,
    body: KnowledgeNodeBody,
    tags: S.Array(S.NonEmptyTrimmedString).pipe(S.optionalKey, SchemaUtils.withKeyDefaults([])),
    aliases: S.Array(S.NonEmptyTrimmedString).pipe(S.optionalKey, SchemaUtils.withKeyDefaults([])),
    lastSequence: NonNegativeInt,
  },
  $I.annote("GraphNodeModel", {
    description: "Materialized graph node with audit columns.",
  })
) {}
```

Produces six variants: `GraphNode` (select), `GraphNode.insert`,
`GraphNode.update`, `GraphNode.json`, `GraphNode.jsonCreate`,
`GraphNode.jsonUpdate`.

---

## 9. Edge Model (GraphEdge)

```ts
/**
 * Materialized graph edge with audit columns.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // GraphEdge.make({ edgeId: "beep:edge/...", sourceNodeId: "beep:page/a", ... })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GraphEdge extends DomainModel.make<GraphEdge>($I`GraphEdgeModel`)(
  {
    edgeId: M.GeneratedByApp(KnowledgeEdgeId),
    sourceNodeId: KnowledgeNodeId,
    targetNodeId: KnowledgeNodeId,
    kind: KnowledgeEdgeKind,
    displayLabel: S.NonEmptyTrimmedString,
    certainty: CertaintyTier,
    lastSequence: NonNegativeInt,
  },
  $I.annote("GraphEdgeModel", {
    description: "Materialized graph edge with audit columns.",
  })
) {}
```

---

## 10. Page Model

Vault-specific fields for a human-authored page. Not a graph-level entity -- it
represents the on-disk markdown document before it is projected into the graph.

```ts
/**
 * A vault page document with frontmatter metadata. This is the domain model for
 * `.beep/vault/pages/{slug}.md` files, separate from the graph projection.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // Page.make({ slug: "design-decisions", title: "Design Decisions", ... })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Page extends DomainModel.make<Page>($I`PageModel`)(
  {
    id: M.GeneratedByApp(PageNodeId),
    slug: Slug,
    title: S.NonEmptyTrimmedString,
    domain: KnowledgeDomain.pipe(S.optionalKey, SchemaUtils.withKeyDefaults("general")),
    certainty: CertaintyTier.pipe(S.optionalKey, SchemaUtils.withKeyDefaults(1.0)),
    tags: S.Array(S.NonEmptyTrimmedString).pipe(S.optionalKey, SchemaUtils.withKeyDefaults([])),
    aliases: S.Array(S.NonEmptyTrimmedString).pipe(S.optionalKey, SchemaUtils.withKeyDefaults([])),
    outboundLinks: S.Array(S.NonEmptyTrimmedString).pipe(S.optionalKey, SchemaUtils.withKeyDefaults([])),
    excerpt: S.String.pipe(S.optionalKey, SchemaUtils.withKeyDefaults("")),
  },
  $I.annote("PageModel", {
    description: "Vault page document with frontmatter metadata.",
  })
) {}
```

---

## 11. GraphEvent Variants

Append-only event schemas for graph mutations. Each variant is an
`S.TaggedClass` with `$I` identity. Full event log semantics are detailed in
`00-event-sourced-graph.md`; this section provides the schema definitions.

```ts
/**
 * Emitted when a new node enters the graph.
 *
 * @category models
 * @since 0.0.0
 */
class NodeCreated extends S.TaggedClass<NodeCreated>($I`NodeCreated`)(
  "NodeCreated",
  {
    nodeId: KnowledgeNodeId,
    kind: KnowledgeNodeKind,
    domain: KnowledgeDomain,
    displayLabel: S.NonEmptyTrimmedString,
    certainty: CertaintyTier,
    body: KnowledgeNodeBody,
  },
  $I.annote("NodeCreated", {
    description: "Emitted when a new node enters the graph.",
  })
) {}

/**
 * Emitted when an existing node is mutated via a partial patch.
 *
 * @category models
 * @since 0.0.0
 */
class NodeUpdated extends S.TaggedClass<NodeUpdated>($I`NodeUpdated`)(
  "NodeUpdated",
  {
    nodeId: KnowledgeNodeId,
    patch: S.Record(S.String, S.Unknown),
  },
  $I.annote("NodeUpdated", {
    description: "Emitted when an existing node is mutated.",
  })
) {}

/**
 * Emitted when a node is removed from the graph.
 *
 * @category models
 * @since 0.0.0
 */
class NodeRemoved extends S.TaggedClass<NodeRemoved>($I`NodeRemoved`)(
  "NodeRemoved",
  {
    nodeId: KnowledgeNodeId,
    reason: S.NonEmptyTrimmedString,
  },
  $I.annote("NodeRemoved", {
    description: "Emitted when a node is removed from the graph.",
  })
) {}

/**
 * Emitted when a new edge connects two nodes.
 *
 * @category models
 * @since 0.0.0
 */
class EdgeCreated extends S.TaggedClass<EdgeCreated>($I`EdgeCreated`)(
  "EdgeCreated",
  {
    edgeId: KnowledgeEdgeId,
    sourceNodeId: KnowledgeNodeId,
    targetNodeId: KnowledgeNodeId,
    kind: KnowledgeEdgeKind,
    displayLabel: S.NonEmptyTrimmedString,
    certainty: CertaintyTier,
  },
  $I.annote("EdgeCreated", {
    description: "Emitted when a new edge connects two nodes.",
  })
) {}

/**
 * Emitted when an edge is removed.
 *
 * @category models
 * @since 0.0.0
 */
class EdgeRemoved extends S.TaggedClass<EdgeRemoved>($I`EdgeRemoved`)(
  "EdgeRemoved",
  {
    edgeId: KnowledgeEdgeId,
    reason: S.NonEmptyTrimmedString,
  },
  $I.annote("EdgeRemoved", {
    description: "Emitted when an edge is removed.",
  })
) {}

/**
 * Emitted on bulk replace (e.g. full re-index). The projection drops all state
 * derived from `source` and rebuilds from subsequent events.
 *
 * @category models
 * @since 0.0.0
 */
class SnapshotReset extends S.TaggedClass<SnapshotReset>($I`SnapshotReset`)(
  "SnapshotReset",
  {
    source: S.NonEmptyTrimmedString,
    reason: S.NonEmptyTrimmedString,
  },
  $I.annote("SnapshotReset", {
    description: "Emitted on bulk replace to clear derived state for a source.",
  })
) {}
```

### GraphEvent union

```ts
/**
 * Discriminated union of all graph mutation events.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * // S.decodeUnknownSync(GraphEvent)({ _tag: "NodeCreated", ... })
 * ```
 *
 * @category models
 * @since 0.0.0
 */
const GraphEvent = S.Union([
  NodeCreated,
  NodeUpdated,
  NodeRemoved,
  EdgeCreated,
  EdgeRemoved,
  SnapshotReset,
]).pipe(
  $I.annoteSchema("GraphEvent", {
    description: "Discriminated union of all graph mutation events.",
  })
)
type GraphEvent = typeof GraphEvent.Type
```

> **Cross-reference**: These event schemas define the canonical field shapes. Doc 00 (§ Event Payloads) wraps some fields in a `NodeMetadata` container for the EventGroup registration — both representations encode the same domain facts.

---

## 12. Persistence by Certainty Tier

| Layer | Source of Truth | Format | Theorem Status |
|---|---|---|---|
| Procedural (code) | `repo-memory.db` (SQLite) | Stays as-is, unchanged | OUTSIDE No-Escape |
| Long-term (human knowledge) | `.beep/vault/pages/*.md` | Markdown + YAML frontmatter + optional `.lexical.json` sidecar | OUTSIDE No-Escape |
| Graph store | `.beep/graph/graph.db` | SQLite (event log tables + materialized view tables) | Derived |
| Relational (LLM-inferred) | Event log with TTL | SQLite with certainty field | INSIDE No-Escape |

The No-Escape Theorem: LLM-inferred data (certainty < 1.0) never overwrites or
replaces human-authored or AST-derived data. It lives in the relational layer,
subject to TTL expiry and user confirmation gates. Promotion to a higher tier
requires explicit user action.

---

## 13. FS Layout

```
.beep/
  workspace.json                    # workspace-level config (name, repos, domains)
  vault/
    pages/
      {slug}.md                     # human-authored page (markdown + YAML frontmatter)
      {slug}.lexical.json           # sidecar, only when rich nodes exist
    assets/
      excalidraw/{id}.excalidraw    # embedded excalidraw diagrams
      images/{hash}.png             # image assets (content-addressed)
  repo-memory/
    repo-memory.db                  # existing, unchanged
  graph/
    graph.db                        # single database: event log + materialized views
```

Key design decisions:

- **Single graph.db**: The event log tables and materialized view tables coexist
  in one SQLite file. This avoids cross-database joins and simplifies the
  projection pipeline. The event log tables are the source of truth; the view
  tables are derived and can be dropped and rebuilt via replay.
- **Flat page directory**: no nested folders. Slugs are the namespace. Obsidian
  handles 50K+ files in a flat directory without issue.
- **Content-addressed assets**: images use hash-based filenames to enable dedup
  and immutability.
- **Sidecar pattern**: rich Lexical state lives alongside markdown, not inside
  it.
- **SQLite files are gitignored**: they are derived artifacts. The event log can
  be replayed on any machine.

---

## 14. Markdown Page Format

Every page in the vault is a markdown file with YAML frontmatter.

```markdown
---
id: "beep:page/design-decisions"
slug: "design-decisions"
title: "Design Decisions"
created: 2026-04-15T00:00:00Z
updated: 2026-04-15T12:30:00Z
tags:
  - architecture
  - decisions
domain: general
certainty: 1.0
aliases:
  - "arch-decisions"
---

# Design Decisions

This page documents key architectural decisions for the workspace.

See also [[event-sourcing]] and [[data-model]].

References code: [[code:GraphEventLog]] and [[code:src/internal/domain.ts]].
```

### Frontmatter fields

| Field | Schema | Required | Description |
|---|---|---|---|
| `id` | `PageNodeId` | yes | `S.TemplateLiteral(["beep:page/", Slug])` URI |
| `slug` | `Slug` | yes | URL-safe, unique across vault |
| `title` | `S.NonEmptyTrimmedString` | yes | Display title |
| `created` | `S.DateTimeUtc` | yes | Creation timestamp |
| `updated` | `S.DateTimeUtc` | yes | Last modification timestamp |
| `tags` | `S.Array(S.NonEmptyTrimmedString)` | no | Defaults to `[]` via `withKeyDefaults` |
| `domain` | `KnowledgeDomain` | no | Defaults to `"general"` via `withKeyDefaults` |
| `certainty` | `CertaintyTier` | no | Defaults to `1.0` via `withKeyDefaults` |
| `aliases` | `S.Array(S.NonEmptyTrimmedString)` | no | Alternative names for link resolution |

---

## 15. Lexical Sidecar

The `.lexical.json` sidecar file is only created when a page contains rich nodes
that cannot round-trip through markdown:

- Excalidraw embeds
- Complex tables with merged cells
- Embedded media with layout metadata
- Custom block nodes with structured data

The markdown file is **always the human-readable primary**. A page without a
sidecar is a pure markdown page. The sidecar preserves Lexical editor state that
would be lost in a markdown-only representation.

Sidecar structure:

```json
{
  "version": 1,
  "lexicalState": { },
  "richNodes": [
    {
      "type": "excalidraw",
      "id": "node-abc123",
      "assetRef": "excalidraw/abc123.excalidraw",
      "position": { "line": 42, "placeholder": "<!-- excalidraw:abc123 -->" }
    }
  ]
}
```

The markdown file contains placeholder comments (`<!-- excalidraw:abc123 -->`)
at the positions where rich nodes appear. The sidecar maps these placeholders to
their full Lexical representations.

Git-friendliness: markdown diffs well, YAML frontmatter diffs well, Lexical
sidecar JSON has noisy diffs. This is an acceptable tradeoff since the sidecar
is supplementary and the markdown is always readable.

---

## 16. Link Resolution Table

Wiki-link syntax supports prefixed targets for cross-domain linking.

| Syntax | Resolves To | Example |
|---|---|---|
| `[[page-slug]]` | Page in vault | `[[design-decisions]]` |
| `[[code:SymbolName]]` | Symbol in repo-memory | `[[code:GraphEventLog]]` |
| `[[code:path/to/file.ts]]` | File in repo-memory | `[[code:src/internal/domain.ts]]` |
| `[[legal:concept-id]]` | Future: legal domain entity | `[[legal:patent-claim-42]]` |

Unprefixed links resolve to pages (backward-compatible). The prefix acts as a
namespace discriminator.

Resolution priority:

1. If prefixed, resolve in the specified domain.
2. If unprefixed, resolve as page slug.
3. If no match, mark as broken link (surface in UI, do not create edge).

### S.TemplateLiteral parsing note

The `KnowledgeNodeId` union can be used directly with `S.decodeUnknown` to
validate and classify an inbound link target. For structured parsing (extracting
the repo ID and qualified name from a symbol URI), use
`S.TemplateLiteralParser`:

```ts
const SymbolNodeIdParts = S.TemplateLiteralParser([
  "beep:symbol/", RepoId, "/", S.NonEmptyString,
])
// Decodes "beep:symbol/repo-memory/MyClass"
//      => readonly ["beep:symbol/", RepoId, "/", string]
```

---

## 17. Drizzle Table Definitions

Tables use `Table.make` from `@beep/shared-tables`. Since graph entities use
URI-shaped text primary keys (not auto-increment integers), the tables override
the default `id` column with a text `node_id` or `edge_id` primary key. For
these non-standard-id tables, raw `sqliteTable` is acceptable -- but the audit
columns are still composed from `makeGlobalColumns`.

```ts
import { makeGlobalColumns } from "@beep/shared-tables/common"
import * as sqlite from "drizzle-orm/sqlite-core"

/**
 * Materialized graph node table. Uses `node_id` (text URI) as primary key
 * instead of the standard auto-increment integer.
 *
 * @category tables
 * @since 0.0.0
 */
export const graphNodes = sqlite.sqliteTable("graph_nodes", {
  nodeId: sqlite.text("node_id").primaryKey(),
  kind: sqlite.text("kind").notNull(),
  domain: sqlite.text("domain").notNull(),
  displayLabel: sqlite.text("display_label").notNull(),
  certainty: sqlite.real("certainty").notNull().default(1.0),
  body: sqlite.text("body", { mode: "json" }).notNull(),
  tags: sqlite.text("tags", { mode: "json" }),
  aliases: sqlite.text("aliases", { mode: "json" }),
  lastSequence: sqlite.integer("last_sequence").notNull(),
  ...makeGlobalColumns(),
}, (t) => [
  sqlite.index("idx_nodes_kind").on(t.kind),
  sqlite.index("idx_nodes_domain").on(t.domain),
  sqlite.index("idx_nodes_certainty").on(t.certainty),
])

/**
 * Materialized graph edge table. Uses `edge_id` (text) as primary key.
 *
 * @category tables
 * @since 0.0.0
 */
export const graphEdges = sqlite.sqliteTable("graph_edges", {
  edgeId: sqlite.text("edge_id").primaryKey(),
  sourceNodeId: sqlite.text("source_node_id").notNull(),
  targetNodeId: sqlite.text("target_node_id").notNull(),
  kind: sqlite.text("kind").notNull(),
  displayLabel: sqlite.text("display_label").notNull(),
  certainty: sqlite.real("certainty").notNull().default(1.0),
  lastSequence: sqlite.integer("last_sequence").notNull(),
  ...makeGlobalColumns(),
}, (t) => [
  sqlite.index("idx_edges_source").on(t.sourceNodeId),
  sqlite.index("idx_edges_target").on(t.targetNodeId),
  sqlite.index("idx_edges_kind").on(t.kind),
])

/**
 * Projection checkpoint table. Tracks `last_projected_sequence` and schema
 * version for rebuild detection.
 *
 * @category tables
 * @since 0.0.0
 */
export const graphBuildState = sqlite.sqliteTable("graph_build_state", {
  key: sqlite.text("key").primaryKey(),
  value: sqlite.text("value").notNull(),
})
```

All three tables live in a single `graph.db` file. Event log tables are owned by
`SqlEventJournal` and are not defined here.

---

## 18. How Repo-Memory Entities Surface in the Graph

This is **projection, not migration**. The repo-memory SQLite database remains
the source of truth for code entities. The graph index contains projected copies
for query and visualization purposes.

### Projection scope

Not all repo-memory entities project into the graph. Projecting every internal
symbol would create noise. The projection filter:

- **Exported symbols only**: a `RepoSymbolRecord` projects only if
  `exported = true`. Estimated: 10K of 100K symbols for a large monorepo.
- **All source files**: every `RepoSourceFile` projects as a `code-file` node.
- **Import edges between projected symbols**: a `RepoImportEdge` projects only
  if both source and target are projected nodes.

### Projection mapping

| Repo-Memory Entity | Graph Node/Edge |
|---|---|
| `RepoSymbolRecord` (exported) | `graphNodes` entry with `nodeId = beep:symbol/{repoId}/{qualifiedName}` |
| `RepoSourceFile` | `graphNodes` entry with `nodeId = beep:file/{repoId}/{filePath}` |
| `RepoImportEdge` | `graphEdges` entry with `kind = code-import` |
| `RepoExportEdge` | `graphEdges` entry with `kind = code-export` |

### Projection trigger

The repo-memory indexer emits `GraphEvent` entries after each successful
`RunEvent`. The events carry `actor=indexer:repo-memory`, `source=repo-memory`,
`certainty=1.0`. On a full re-index, a `SnapshotReset` event with
`source=repo-memory` is emitted first, causing the projector to clear all
repo-memory-derived nodes and edges before processing the new events.

---

## 19. Scale Considerations

### Pages

- Target: up to 10K pages in a flat directory.
- Obsidian demonstrates this scale works (handles 50K+ files).
- Flat directory avoids path-based organizational bikeshedding. Tags and graph
  edges provide structure.

### Symbols

- Target: up to 100K symbols in repo-memory (large monorepo).
- Only exported symbols project to the graph (estimated 10K of 100K). This keeps
  the graph navigable.
- Non-exported symbols remain queryable via repo-memory directly.

### Multiple repos

- `repoId` partitioning: each repo gets a unique `repoId` in the node ID
  (`beep:symbol/{repoId}/...`).
- Cross-repo edges are natural: an import from repo A to repo B creates an edge
  between two nodes with different repoIds.
- `SnapshotReset` scoping: re-indexing repo A only clears nodes with
  `source=repo-memory:{repoIdA}`.

### Multiple domains

- Adding a new domain: add a member to the `KnowledgeDomain` literal kit and a
  corresponding case to the `KnowledgeNodeBody` tagged union.
- Compile-time checked: all `.$match` call sites fail to compile until the new
  domain is handled.

### Git-friendliness

| Artifact | Diffs Well | In Git |
|---|---|---|
| Markdown pages | Yes | Yes |
| YAML frontmatter | Yes | Yes |
| Lexical sidecar `.json` | Noisy but acceptable | Yes |
| `graph.db` (SQLite) | No | Gitignored |
| `repo-memory.db` (SQLite) | No | Gitignored |

SQLite files are derived artifacts. The vault markdown files are the only
human-authored content that must be version-controlled. The event log can be
rebuilt from repo-memory + vault scan. The materialized views can be rebuilt from
the event log.
