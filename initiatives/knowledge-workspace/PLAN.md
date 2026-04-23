# 05 - Implementation Phases

## Delegation Strategy

Work distribution across agent tooling and specialist skills based on task characteristics.

### Specialist Skills

Four specialist agent skills provide domain knowledge for delegated tasks:

| Skill | Location | Domain |
|-------|----------|--------|
| `eventlog-graph-specialist` | `.agents/skills/eventlog-graph-specialist/` | EventLog primitives, graph event modeling, journal queries, projection |
| `schema-model-specialist` | `.agents/skills/schema-model-specialist/` | `S.Class` + `$I`, `LiteralKit`, `Model.Class`, `S.toTaggedUnion`, `S.TemplateLiteral` |
| `atom-reactivity-specialist` | `.agents/skills/atom-reactivity-specialist/` | `Atom.make`, `Atom.derived`, `Atom.searchParam`, `Reactivity.stream`, `Reactivity.mutation` |
| `jsdoc-annotation-specialist` | `.agents/skills/jsdoc-annotation-specialist/` | JSDoc with `@example`, `@category`, `@since 0.0.0` on all exported schemas |

### UI/UX Coding and Design -- Claude Code + Chrome Plugin

Use Claude Code with the Chrome DevTools plugin for all frontend development, visual QA, browser-based testing, and design implementation. This combination excels at iterative visual work where the feedback loop is "change code, see result in browser, adjust."

Assign to Claude Code + Chrome:
- Cytoscape React wrapper component (`CytoscapeService` as full `Context.Service`)
- Graph canvas component and interaction handlers
- Detail panel components (node inspector, backlinks, statistics)
- Navigation UI (breadcrumb, sidebar, query bar)
- Temporal scrubber component
- WikiLinkTypeaheadPlugin (typeahead dropdown UI)
- BacklinkDisplayPlugin (in-editor backlinks pane)
- WikiLinkNode decorator component (hover card, visual treatment)
- All CSS/Tailwind styling work
- Visual regression testing via screenshots

Skills used: `atom-reactivity-specialist` (for all frontend state atoms).

### Backend Heavy Tasks -- Codex Plugin

Use the Codex plugin for Effect-heavy backend work. Codex is more thorough for service composition, schema design, and domain logic where correctness matters more than visual iteration speed.

Assign to Codex:
- `KnowledgeGraph` facade over Effect `EventLog` primitives
- `EventGroup` definition for graph domain events
- `EventLog.Handlers` implementations for each event tag
- `SqlEventJournal` configuration for graph persistence
- WikiLinkNode serialization logic (exportJSON, importJSON, MarkdownTransformer)
- Link resolution service (slug lookup, resolved status)
- `extractBlockLinks` basic `[[wiki_link]]` extraction (Phase 2); `[[code:...]]` prefix extension deferred to Phase 3
- Page save to `EventLog.write` emission pipeline
- Replay projection engine (temporal rebuild from `effect_event_journal` table)
- Cross-domain `[[code:SymbolName]]` resolution service
- `Model.Class` definitions for Page, KnowledgeNode entities

Skills used: `eventlog-graph-specialist`, `schema-model-specialist`, `jsdoc-annotation-specialist`.

### Mixed Tasks

For tasks that span both layers, start with Codex for the Effect service/schema layer, then hand off to Claude Code + Chrome for the UI that consumes it. Example: the graph canvas needs a Cytoscape element projection (Codex builds the data pipeline) rendered in a React component (Claude Code + Chrome builds the visual).

---

## Phase 0: Agent Bootstrapping

**Goal**: Create the four specialist skills, validate them against a scratchpad, and establish thin wrappers so all subsequent phases can delegate effectively.

**Primary agents**: Manual setup + Codex for validation.

### Deliverables

| Deliverable | Owner | Purpose |
|-------------|-------|---------|
| `.agents/skills/eventlog-graph-specialist/` | Manual | Skill knowledge for EventLog, EventJournal, EventGroup, SqlEventJournal |
| `.agents/skills/schema-model-specialist/` | Manual | Skill knowledge for `S.Class` + `$I`, `LiteralKit`, `Model.Class`, `S.toTaggedUnion` |
| `.agents/skills/atom-reactivity-specialist/` | Manual | Skill knowledge for `Atom.make`, `Atom.derived`, `Atom.searchParam`, `Reactivity` |
| `.agents/skills/jsdoc-annotation-specialist/` | Manual | Skill knowledge for JSDoc with `@example`, `@category`, `@since 0.0.0` |
| `scratchpad/skill-validation/*.ts` | Codex | Type-checking scratchpad files proving each skill's APIs compile |
| Rules wrapper in `.agents/` | Manual | Thin wrapper linking skills to delegation strategy |

### Validation

Each skill must produce a scratchpad file that type-checks against the repo's `tsconfig.json`. The scratchpad proves the APIs referenced in the skill are real, not hallucinated.

```ts
/**
 * Skill validation: all four specialist skills compile.
 *
 * @example
 * ```ts
 * import { $ScratchId } from "@beep/identity"
 * import { LiteralKit } from "@beep/schema"
 * import * as S from "effect/Schema"
 *
 * const $I = $ScratchId.create("phase0-validation")
 *
 * // schema-model-specialist
 * const Status = LiteralKit(["active", "inactive"] as const)
 * class Entity extends S.Class<Entity>($I`Entity`)({
 *   status: Status,
 * }) {}
 *
 * // eventlog-graph-specialist
 * // (validated in separate scratchpad against EventGroup, EventLog)
 *
 * // atom-reactivity-specialist
 * // (validated in separate scratchpad against Atom, Reactivity)
 *
 * // jsdoc-annotation-specialist
 * // (validated by checking JSDoc on Entity above)
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
```

### Acceptance Criteria

- [ ] All four skills exist at `.agents/skills/{name}/`
- [ ] Scratchpad files type-check with `pnpm check`
- [ ] Rules wrapper references all four skills
- [ ] Delegation strategy table in this document matches skill assignments

---

## Phase 1: Event-Sourced Graph + Code Visualization

**Goal**: Prove that repo-memory can project into an event-sourced graph backed by Effect `EventLog` primitives and render in real-time via Cytoscape.

**Primary agents**: Codex (`eventlog-graph-specialist`, `schema-model-specialist`) for backend, Claude Code + Chrome (`atom-reactivity-specialist`) for UI.

### New Packages and Files

| File | Owner | Purpose |
|------|-------|---------|
| `packages/common/ui/.../codegraph/CytoscapeCanvas.tsx` | Claude Code + Chrome | React wrapper with `CytoscapeService` as `Context.Service` |
| `apps/desktop/src/components/WorkspaceLayout.tsx` | Claude Code + Chrome | Three-zone layout shell (nav, canvas, detail) |
| `apps/desktop/src/components/GraphCanvas.tsx` | Claude Code + Chrome | Cytoscape instance management, zoom, pan, selection |
| `apps/desktop/src/components/DetailPanel.tsx` | Claude Code + Chrome | Right-zone inspector for selected node/edge |
| `apps/desktop/src/components/QueryBar.tsx` | Claude Code + Chrome | Search and filter bar above graph canvas |

### EventGroup Definition

```ts
/**
 * Graph domain events defined as an `EventGroup`.
 *
 * @example
 * ```ts
 * import { EventGroup } from "effect/unstable/eventlog"
 * import * as S from "effect/Schema"
 *
 * const KnowledgeGraphEvents = EventGroup.empty
 *   .add({
 *     tag: "NodeCreated",
 *     primaryKey: (p) => p.nodeId,
 *     payload: S.Struct({
 *       nodeId: KnowledgeNodeId,
 *       kind: KnowledgeNodeKind,
 *       domain: KnowledgeDomain,
 *       displayLabel: S.NonEmptyTrimmedString,
 *       certainty: CertaintyTier,
 *       body: KnowledgeNodeBody,
 *     }),
 *   })
 *   .add({
 *     tag: "EdgeCreated",
 *     primaryKey: (p) => p.edgeId,
 *     payload: S.Struct({
 *       edgeId: KnowledgeEdgeId,
 *       sourceNodeId: KnowledgeNodeId,
 *       targetNodeId: KnowledgeNodeId,
 *       kind: KnowledgeEdgeKind,
 *       displayLabel: S.NonEmptyTrimmedString,
 *       certainty: CertaintyTier,
 *     }),
 *   })
 *   // ... NodeUpdated, NodeRemoved, EdgeRemoved, SnapshotReset
 * ```
 *
 * @category events
 * @since 0.0.0
 */
```

### Node ID via S.TemplateLiteral

```ts
/**
 * Knowledge node IDs use `S.TemplateLiteral` per domain.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 *
 * const PageNodeId = S.TemplateLiteral(["beep:page/", S.String])
 * const SymbolNodeId = S.TemplateLiteral(["beep:symbol/", S.String, "/", S.String])
 * const FileNodeId = S.TemplateLiteral(["beep:file/", S.String, "/", S.String])
 *
 * const KnowledgeNodeId = S.Union([PageNodeId, SymbolNodeId, FileNodeId])
 * ```
 *
 * @category identifiers
 * @since 0.0.0
 */
```

### Wiring

1. **repo-memory index completion to graph event emission**: When a repo-memory `RunEvent` completes, the indexer reads new/changed/removed symbols and calls `KnowledgeGraph.emitNodeCreated`, `emitEdgeCreated`, etc. The facade delegates to `EventLog.write` with the appropriate event tag.

2. **Graph projection via EventLog handlers**: The `EventLog.Handlers` group implements each event tag handler. On `NodeCreated`, the handler inserts into the materialized `graph_nodes` table. The `SqlEventJournal` persists the raw entries in `effect_event_journal`.

3. **Live streaming during index runs**: The `EventJournal.changes` PubSub publishes entries as they are appended. The `Reactivity` service invalidates registered keys. Frontend atoms subscribed to `["graph:nodes", "graph:edges"]` auto-refresh.

4. **Citation highlighting on query completion**: When a grounded query returns results, the citation paths are mapped to node/edge IDs. The graph canvas applies `.search-match` CSS classes to matched elements, creating a visual highlight overlay.

### Frontend State (Atom.runtime)

```ts
/**
 * All frontend graph state via Atom -- no React hooks for server state.
 *
 * @example
 * ```ts
 * import { Atom } from "effect/unstable/reactivity"
 *
 * // Persisted in URL search params
 * const canvasMode$ = Atom.searchParam("mode")
 * const activeSymbol$ = Atom.searchParam("symbol")
 * const activePage$ = Atom.searchParam("page")
 *
 * // Local UI state
 * const selectedElement$ = Atom.make<SelectedElement | null>(null)
 * const graphLayout$ = Atom.make<LayoutAlgorithm>("cose-bilkent")
 * const filterState$ = Atom.make<FilterState>(defaultFilters)
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
```

### Acceptance Criteria

- [ ] Index a repo and watch the graph build in real-time (nodes appear, edges form)
- [ ] Click a symbol node: detail panel shows signature, JSDoc, location, importers
- [ ] Click a file node: detail panel shows exports, imports, imported-by
- [ ] Run a grounded query: see citation paths highlighted on the graph
- [ ] Query stage trace shows Grounding to Retrieval to Packet to Answer pipeline
- [ ] Graph search filters nodes in real-time (by kind, domain, label substring)
- [ ] `graphStylesFast` performance variant engages for repos with 300+ exported symbols
- [ ] Event journal persists entries in `effect_event_journal` and survives process restart
- [ ] Graph index rebuilds correctly from a cold replay of the event journal

> **Note**: Reconcile table definitions between spec 00 and spec 01 before implementation -- ensure single canonical schema.

---

## Phase 2: Lexical Editor + wiki_linking

**Goal**: Add a rich text editor with `[[wiki_link]]` support that connects to the event-sourced graph via the `KnowledgeGraph` facade.

**Primary agents**: Codex (`schema-model-specialist`, `eventlog-graph-specialist`) for serialization and event emission, Claude Code + Chrome (`atom-reactivity-specialist`) for visual components.

### New Files

| File | Owner | Purpose |
|------|-------|---------|
| `packages/editor/lexical/src/nodes/WikiLinkNode.ts` | Codex (serialization + schema) + Claude Code + Chrome (visual) | Custom `DecoratorNode` for `[[wiki_link]]` with `S.Class` schema |
| `packages/editor/lexical/src/plugins/WikiLinkTypeaheadPlugin.tsx` | Claude Code + Chrome | Typeahead dropdown triggered by `[[` |
| `packages/editor/lexical/src/plugins/BacklinkDisplayPlugin.tsx` | Claude Code + Chrome | Collapsible backlinks pane below editor |
| `packages/editor/lexical/src/transformers/wikiLinkTransformer.ts` | Codex | Markdown import/export for `[[...]]` syntax |
| `packages/editor/domain/src/VaultPersistence.ts` | Codex | Markdown + YAML frontmatter + optional Lexical JSON sidecar |

### Schema-First Patterns

WikiLinkNode serialization uses `S.Class` with `$I` identity for type-safe boundaries:

```ts
/**
 * WikiLink serialization schema with $I identity.
 *
 * @example
 * ```ts
 * import { $KnowledgeId } from "@beep/identity/packages"
 * import * as S from "effect/Schema"
 *
 * const $I = $KnowledgeId.create("WikiLink")
 *
 * class SerializedWikiLink extends S.Class<SerializedWikiLink>($I`SerializedWikiLink`)({
 *   targetSlug: S.NonEmptyTrimmedString,
 *   displayText: S.NonEmptyTrimmedString,
 *   resolved: S.Boolean,
 * }) {}
 *
 * // Validation at import boundary
 * const validated = S.decodeUnknownSync(SerializedWikiLink)(rawJson)
 * ```
 *
 * @category model
 * @since 0.0.0
 */
```

### Wiring

1. **Page saves to graph event emission**: When a page is saved, diff the current `[[wiki_link]]` set against the previous save. The `KnowledgeGraph` facade calls `EventLog.write` for `NodeCreated`/`NodeUpdated` (document node) and `EdgeCreated`/`EdgeRemoved` (wiki_link edges). Uses `extractBlockLinks` from `packages/editor/domain/src/Canonical.ts:389`.

2. **Extend `extractBlockLinks` regex**: The regex currently matches `[[target]]`. In Phase 2, basic `[[wiki_link]]` extraction is sufficient. The `[[code:SymbolName]]` prefix resolution belongs in Phase 3 (which adds cross-domain resolution); do not extend the regex for `code:` prefix support until then.

3. **WikiLinkTypeaheadPlugin to PagesGroup.searchPages**: The typeahead calls the existing search endpoint at `packages/editor/protocol/src/index.ts:159` to find matching pages.

4. **Vault persistence**: Pages persist as `.beep/vault/pages/{slug}.md` with YAML frontmatter (title, tags, created, updated) and markdown body. An optional `.beep/vault/pages/{slug}.lexical.json` sidecar stores the full Lexical editor state for lossless round-tripping of rich content that markdown cannot represent.

5. **Page entity**: `Model.Class` provides `select`, `insert`, `update`, `json`, `jsonCreate`, `jsonUpdate` variants from a single definition.

### Frontend State (Atom.runtime)

```ts
/**
 * Editor state via Atom -- no React hooks for data.
 *
 * @example
 * ```ts
 * import { Atom } from "effect/unstable/reactivity"
 *
 * // Active page from URL
 * const activePage$ = Atom.searchParam("page")
 *
 * // Backlink collapse toggle
 * const backlinkCollapsed$ = Atom.make(true)
 *
 * // Page save mutation
 * const savePage = runtime.fn(
 *   (input: PageSaveInput) => KnowledgeGraph.pipe(
 *     Effect.flatMap((graph) => graph.savePage(input)),
 *   ),
 * )
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
```

### Acceptance Criteria

- [ ] Create a new page with YAML frontmatter persisted to `.beep/vault/pages/{slug}.md`
- [ ] Type `[[` then typeahead shows matching pages, select inserts `WikiLinkNode`
- [ ] Save page: document node appears in graph, wiki_link edges connect to linked pages
- [ ] Click wiki_link in editor: navigate to target page
- [ ] Ctrl+click wiki_link: focus target node in graph view
- [ ] Backlinks section shows all pages linking to current page
- [ ] Unresolved links render with amber dashed underline
- [ ] Resolved links render with blue underline and subtle background
- [ ] Markdown round-trip: save as `.md`, reload, wiki_links survive intact
- [ ] "Create page" action in typeahead creates a new page stub
- [ ] `Page` entity uses `Model.Class` with all six variants

---

## Phase 3: Temporal Replay + Unified Graph

**Goal**: Enable time-travel through graph history via `SqlEventJournal` queries and unify code entities with document entities in a single view.

**Primary agents**: Codex (`eventlog-graph-specialist`) for replay projection, Claude Code + Chrome (`atom-reactivity-specialist`) for scrubber UI and unified view.

### New Components

| Component | Owner | Purpose |
|-----------|-------|---------|
| Temporal scrubber UI | Claude Code + Chrome | Timeline slider from first entry to latest |
| Replay projection engine | Codex | Project graph state at arbitrary timestamp via `effect_event_journal` query |
| Cross-domain `[[code:SymbolName]]` resolution | Codex | Resolve `code:` prefix links to code entity nodes |
| Unified graph view | Claude Code + Chrome | Overlay code + document nodes with cross-domain edges |
| Statistics overlay | Claude Code + Chrome | Node/edge counts, domain breakdown during replay |

### Replay via SqlEventJournal

```ts
/**
 * Temporal projection queries the `effect_event_journal` table directly.
 *
 * @example
 * ```ts
 * import * as SqlClient from "effect/unstable/sql/SqlClient"
 * import { Effect } from "effect"
 *
 * const projectAtTimestamp = (timestampMs: bigint) =>
 *   Effect.gen(function*() {
 *     const sql = yield* SqlClient.SqlClient
 *     const entries = yield* sql`
 *       SELECT id, event, primary_key, payload, timestamp
 *       FROM effect_event_journal
 *       WHERE timestamp <= ${timestampMs}
 *       ORDER BY timestamp ASC
 *     `
 *     return yield* replayEntries(entries)
 *   })
 * ```
 *
 * @category replay
 * @since 0.0.0
 */
```

### Wiring

1. **Temporal scrubber to replay projection**: The scrubber emits a target timestamp. The replay engine queries `effect_event_journal` for all entries up to that timestamp, producing a point-in-time graph state. The Cytoscape canvas renders this state.

2. **Play mode**: Animate graph evolution by stepping through entries at configurable speed (1x, 2x, 4x, 8x). Each step applies one event to the Cytoscape canvas. Nodes fade in with `opacity` transitions. Edges draw with CSS stroke animations.

3. **Cross-domain resolution**: When a wiki_link uses the `[[code:SymbolName]]` prefix, the link resolution service queries the `graph_nodes` table for nodes with `kind: "code-symbol"` and matching label. If found, the edge connects the document node to the code entity node.

4. **Unified graph rendering**: The Cytoscape canvas renders both code nodes (from repo-memory) and document nodes (from vault) in a single layout. New Cytoscape styles for document nodes and wiki_link edges extend the existing style system at `packages/common/ui/.../codegraph/styles/graph-styles.tsx`.

### Replay State Atoms

```ts
/**
 * Replay atoms -- all local state, no React hooks.
 *
 * @example
 * ```ts
 * import { Atom } from "effect/unstable/reactivity"
 *
 * type ReplaySpeed = 1 | 2 | 4 | 8
 * type ReplayMode = "live" | "paused" | "playing" | "scrubbing"
 *
 * const replayMode$ = Atom.make<ReplayMode>("live")
 * const replaySpeed$ = Atom.make<ReplaySpeed>(1)
 * const replayCursor$ = Atom.make<bigint>(0n)
 *
 * // Derived: entries up to cursor, auto-projected
 * const replayProjection$ = Atom.derived((get) => {
 *   const cursor = get(replayCursor$)
 *   const mode = get(replayMode$)
 *   return mode === "live" ? null : { cursor }
 * })
 *
 * // Mutation: scrub to timestamp
 * const scrubTo = runtime.fn(
 *   (timestamp: bigint) => projectAtTimestamp(timestamp),
 * )
 * ```
 *
 * @category atoms
 * @since 0.0.0
 */
```

### Acceptance Criteria

- [ ] Temporal scrubber shows timeline from first to latest entry timestamp
- [ ] Dragging scrubber projects graph at that point in time
- [ ] Play mode animates graph evolution at configurable speed (1x, 2x, 4x, 8x)
- [ ] Filter by source/domain/certainty during replay
- [ ] `[[code:SymbolName]]` in editor resolves to code entity in graph
- [ ] Unified graph shows code nodes AND document nodes with cross-domain edges
- [ ] Statistics overlay shows node/edge counts during replay
- [ ] Scrubbing to an earlier time removes nodes/edges that did not exist yet
- [ ] Scrubbing forward re-applies events correctly (idempotent projection)
- [ ] All replay queries hit `effect_event_journal` table, not custom event store

---

## Phase 4: Expert Memory Domains (Future -- Out of Scope)

Noted here for architectural awareness. This phase is NOT in the current spec scope.

- Legal, IP, and compliance node types added to `KnowledgeNodeKind` `LiteralKit`.
- Domain-specific stores projecting into the same `EventLog` with their own `EventGroup` definitions and `source` values.
- Domain-specific Cytoscape styles added to `graph-styles.tsx`.
- Cross-domain queries spanning code + document + legal + compliance graphs.
- `SnapshotReset` scoped by `source` field ensures domain re-indexing does not affect other domains.

The event-sourced architecture makes this extension natural: new domains define their own `EventGroup`, register handlers, and emit events through the shared `EventLog`. The `Reactivity` service invalidates the right keys. Cytoscape styles are additive. No architectural changes are needed -- only new `EventGroup` definitions and node/edge kind variants.

---

## Delegation Strategy Table

| Task Domain | Primary Agent | Specialist Skills | Rationale |
|-------------|---------------|-------------------|-----------|
| EventLog + EventGroup + Journal | Codex | `eventlog-graph-specialist` | Effect service composition, correctness-critical |
| Schema modeling (`S.Class`, `Model.Class`, `LiteralKit`) | Codex | `schema-model-specialist` | Type-level correctness, variant schemas |
| JSDoc annotations on exported APIs | Codex | `jsdoc-annotation-specialist` | Consistent `@example`/`@category`/`@since` |
| Cytoscape rendering + animation | Claude Code + Chrome | `atom-reactivity-specialist` | Visual iteration, browser feedback loop |
| Lexical plugins (typeahead, backlinks) | Claude Code + Chrome | `atom-reactivity-specialist` | UI interaction, DOM behavior |
| Temporal scrubber UI | Claude Code + Chrome | `atom-reactivity-specialist` | Animation, slider, playback controls |
| All frontend state | Claude Code + Chrome | `atom-reactivity-specialist` | Hard ban on React hooks, `Atom` from day one |
| Layout, CSS, Tailwind | Claude Code + Chrome | (none) | Pure visual work |
| WikiLinkNode serialization | Codex | `schema-model-specialist` | Schema-first validation at data boundary |
| Page save to EventLog pipeline | Codex | `eventlog-graph-specialist` | Effect service pipeline, correctness |
| Replay projection engine | Codex | `eventlog-graph-specialist` | SQL queries against `effect_event_journal` |
| Cross-domain link resolution | Codex | `schema-model-specialist` | Type-safe resolution across domains |

---

## Critical File Modifications by Phase

| Phase | File | Change |
|-------|------|--------|
| 0 | `.agents/skills/` (new) | Four specialist skills + rules wrapper |
| 0 | `scratchpad/skill-validation/` | Type-checking validation files |
| 1 | `packages/common/ui/.../codegraph/styles/graph-styles.tsx` | Extend with document node styles, certainty-based edge opacity, wiki_link edge type |
| 1 | `apps/desktop/src/RepoMemoryDesktop.tsx` | Decompose 1831-line monolith into `WorkspaceLayout`, `GraphCanvas`, `DetailPanel`, `QueryBar` |
| 2 | `packages/editor/domain/src/Canonical.ts` | Basic `[[wiki_link]]` extraction via `extractBlockLinks` (no `[[code:...]]` prefix -- deferred to Phase 3) |
| 2 | `packages/editor/lexical/src/EditorSurface.tsx` | Register `WikiLinkNode` at line 65, mount `WikiLinkTypeaheadPlugin` and `BacklinkDisplayPlugin` |
| 2 | `packages/common/semantic-web/src/prov.ts` | Reuse `ProvBundle` for event provenance (no changes needed, reference only) |
| 3 | `packages/common/ui/.../codegraph/styles/graph-styles.tsx` | Add temporal replay animation styles, cross-domain edge styles |

---

## Verification Matrix

| Phase | What to Verify | How |
|-------|---------------|-----|
| 0 | Skills exist and compile | `ls .agents/skills/` confirms four directories; `pnpm check` passes on scratchpad files |
| 1 | Graph builds in real-time | Index a repo, observe Cytoscape canvas -- nodes and edges appear incrementally |
| 1 | Event journal persistence | Kill process mid-index, restart, verify graph rebuilds from `effect_event_journal` entries |
| 1 | Citations highlight on graph | Run a grounded query, verify `.search-match` CSS classes applied to citation path nodes/edges |
| 1 | Performance variant engages | Index a repo with 300+ exported symbols, verify `graphStylesFast` styles are applied |
| 2 | wiki_links resolve | Create page with `[[link]]`, verify `WikiLinkNode` renders with blue underline |
| 2 | Unresolved links render correctly | Type `[[nonexistent]]`, verify amber dashed underline |
| 2 | Backlinks compute | Create two cross-linked pages, verify backlinks section shows both directions |
| 2 | Markdown round-trip | Save page, read `.md` file, verify `[[link]]` syntax present; reload page, verify `WikiLinkNode` recreated |
| 2 | Graph events emitted on save | Save a page with wiki_links, query `effect_event_journal`, verify `NodeCreated` and `EdgeCreated` entries |
| 3 | Temporal replay works | Scrub timeline to midpoint, verify graph state matches that timestamp's entry set |
| 3 | Play mode animates | Start play mode, verify nodes/edges appear with transition animations |
| 3 | Cross-domain links resolve | Use `[[code:Symbol]]` in a page, save, verify edge connects document node to code entity node in graph |
| 3 | Unified graph renders | Open graph view with both indexed repo and vault pages, verify both node types visible |

---

## Dependency Order

```
Phase 0                          Phase 1                          Phase 2                    Phase 3
────────────────────             ────────────────────────────     ──────────────────────     ──────────────────
Specialist skills            ──> EventGroup definition        ──> WikiLinkNode             ──> Temporal scrubber
Scratchpad validation        ──> EventLog.schema + handlers   ──> WikiLinkTypeaheadPlugin  ──> Replay projection
Rules wrapper                ──> KnowledgeGraph facade        ──> BacklinkDisplayPlugin    ──> Cross-domain resolution
                                 CytoscapeService             ──> Vault persistence        ──> Unified graph view
                                 WorkspaceLayout              ──> Page save -> EventLog    ──> Statistics overlay
                                 DetailPanel                  ──> MarkdownTransformer
                                 QueryBar                     ──> extractBlockLinks (basic)
                                                                  Model.Class for Page
```

Phase 0 blocks everything: without validated specialist skills, delegation is guesswork.

Phase 1 depends on Phase 0: backend work uses `eventlog-graph-specialist` and `schema-model-specialist`; frontend work uses `atom-reactivity-specialist`.

Phase 2 depends on Phase 1: wiki_link edges emit into the `EventLog` and appear on the Cytoscape canvas. Without the event-sourced graph, wiki_links are isolated text decorations.

Phase 3 depends on Phase 2: temporal replay operates over the full event journal including document events. Cross-domain resolution requires both code nodes (Phase 1) and document nodes (Phase 2) in the graph.

Each phase is independently shippable. Phase 0 delivers validated tooling. Phase 1 delivers a working code graph visualization. Phase 2 adds wiki_linking on top. Phase 3 adds time-travel and unification.
