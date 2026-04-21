# Knowledge Workspace

## Thesis

The knowledge workspace treats an event-sourced graph as its core data primitive. The graph is not computed from current state. The Effect `EventLog` from `effect/unstable/eventlog` is the source of truth. Every mutation -- node created, edge formed, property updated -- is an immutable `Entry` in the `EventJournal` carrying a UUID, event tag, primary key, msgpack payload, and timestamp. The graph that users see and query is a materialized projection of that journal, rebuilt or scrubbed to any point in time on demand.

This design makes real-time streaming and temporal replay natural consequences of the architecture rather than bolted-on features. A Lexical rich text editor with `[[wiki_link]]` support provides the authoring surface. Cytoscape renders the live graph. Users watch edges form during indexing, scrub through graph history like an Obsidian timelapse, and trace every connection back to the event and actor that created it.

The workspace serves both code AST intelligence (repo-memory) and future expert memory domains (legal, IP, compliance) through a shared event-sourced substrate and provenance-first architecture built on the existing `ProvBundle` from `@beep/semantic-web`.

## Document Index

| Document | Summary |
|----------|---------|
| [00-event-sourced-graph.md](./00-event-sourced-graph.md) | EventLog + EventGroup + KnowledgeGraph facade pattern, projection engine, `SqlEventJournal` persistence |
| [01-data-model.md](./01-data-model.md) | Node/edge type system, persistence format, FS layout, link resolution |
| [02-real-time-and-replay.md](./02-real-time-and-replay.md) | Live streaming via `EventJournal.changes` PubSub, `Reactivity` integration, temporal scrubber |
| [03-ui-architecture.md](./03-ui-architecture.md) | Three-zone layout, Cytoscape graph rendering, navigation, detail panels |
| [04-lexical-integration.md](./04-lexical-integration.md) | `WikiLinkNode` with `S.Class` schema, typeahead plugin, `Model.Class` page entity, editor port strategy |
| [PLAN.md](./PLAN.md) | Phase 0 (agent bootstrapping) through Phase 3, delegation strategy, specialist skills |

## Current Repo Anchors

This spec composes on top of three existing spec sets:

- [Expert Memory Big Picture](../expert-memory-big-picture/README.md) -- broader expert-memory vision, domain transfer thesis, six durable properties
- [Repo Expert-Memory Local-First V0](../repo-expert-memory-local-first-v0/README.md) -- repo-memory local-first architecture, sidecar protocol, cluster substrate
- [Memory Architecture Standard](../../standards/memory-architecture/README.md) -- the binding memory architecture standard (No-Escape Theorem, four-layer taxonomy, thread triage)

When this spec and those upstream documents conflict, the upstream standards win on architectural invariants. This spec has authority only over workspace-specific UI, editor, and graph visualization concerns.

## Architectural Decisions

Eleven architectural questions were resolved during spec development. These decisions are binding for all implementation phases.

| Decision | Question | Resolution |
|----------|----------|------------|
| **Q1** | Where does agent knowledge live? | `.agents/skills/` directory with thin wrappers. Skills are validated against scratchpad files that must type-check. |
| **Q2** | Custom event log or Effect primitives? | Thin domain facade (`KnowledgeGraph`) over Effect `EventLog` from `effect/unstable/eventlog`. No custom event log implementation. |
| **Q3** | Schema patterns for entities and events? | `Model.Class` for persisted entities (Page, KnowledgeNode). `S.TaggedClass` for graph events. `S.Class` + `$I` identity for all schemas. |
| **Q4** | Separate databases per domain? | Single `graph.db` with two table owners: `effect_event_journal` (managed by `SqlEventJournal`) and `graph_nodes`/`graph_edges` (managed by projection handlers). |
| **Q5** | React hooks for frontend state? | Hard ban on React hooks for server state. `Atom.make` for local state, `Atom.readable` for derived state, `Atom.searchParam` for URL state, `Reactivity.stream` for server-derived state, `runtime.fn` for mutations. From day one. |
| **Q6** | Node ID format? | `S.TemplateLiteral` per domain: `beep:page/{slug}`, `beep:symbol/{repoId}/{name}`, `beep:file/{repoId}/{path}`. |
| **Q7** | How many specialist agents? | Four: `eventlog-graph-specialist`, `schema-model-specialist`, `atom-reactivity-specialist`, `jsdoc-annotation-specialist`. |
| **Q8** | Do skills replace Codex agents? | No. Skills complement existing Codex agents. Codex uses skills as domain knowledge; Claude Code + Chrome uses skills for state patterns. |
| **Q9** | Phase ordering? | Phase 0 (agent bootstrapping) blocks everything. Skills must be validated before any implementation begins. |
| **Q10** | Spec rewrite scope? | Full rewrite of all six spec documents + README to align with Effect v4 syntax, `$I` identity, `LiteralKit`, `EventLog` primitives, `Atom.runtime`. |
| **Q11** | Cytoscape integration pattern? | `CytoscapeService` as a full `Context.Service`, not a React hook. Service manages instance lifecycle, style switching, element diffing, and animation. |

## Codebase Grounding

| Asset | Location | What's There |
|-------|----------|--------------|
| wiki_link extraction | `packages/editor/core/src/Canonical.ts:389` | `extractBlockLinks` regex, `PageLinkRef`, `withDerivedOutboundLinks` |
| Lexical editor | `packages/editor/lexical/src/EditorSurface.tsx` | 4 node types currently (Heading, Paragraph, Quote, Text) |
| Cytoscape styles | `packages/common/ui/.../codegraph/styles/graph-styles.tsx` | 948 lines, 17 node types, 9 edge types, performance variants |
| D3 knowledge graph | `packages/common/ui/src/components/knowledge-graph.tsx` | Existing force-directed SVG graph |
| PROV model | `packages/common/semantic-web/src/prov.ts` | 782 lines, 19 PROV record variants, `ProvBundle` |
| EventJournal pattern | `packages/repo-memory/runtime/src/internal/RepoRunEventLog.ts` | `EventJournal` + Reactivity + monotonic sequences |
| Desktop app | `apps/desktop/src/RepoMemoryDesktop.tsx` | 1831-line monolith to decompose |
| UI primitives | `packages/common/ui/src/components/` | resizable, sidebar, command, hover-card, breadcrumb |
| Event sourcing primitives | `.repos/effect-v4/packages/effect/src/unstable/eventlog/` | `EventLog`, `EventJournal`, `EventGroup`, `Event`, `SqlEventJournal` |
| Atom + Reactivity | `.repos/effect-v4/packages/effect/src/unstable/reactivity/` | `Atom`, `Reactivity`, `AtomRegistry`, `AtomRef`, `AsyncResult` |
| Model.Class | `.repos/effect-v4/packages/effect/src/unstable/schema/Model.ts` | Multi-variant domain model schemas |
| LiteralKit | `packages/common/schema/src/LiteralKit.ts` | Schema-backed literal toolkit with `Enum`, `is`, `$match`, `toTaggedUnion` |
| Atom reactivity specialist | `.agents/skills/atom-reactivity-specialist/` | Frontend state skill (Phase 0 deliverable) |
| Schema model specialist | `.agents/skills/schema-model-specialist/` | Schema modeling skill (Phase 0 deliverable) |
| EventLog graph specialist | `.agents/skills/eventlog-graph-specialist/` | EventLog + graph skill (Phase 0 deliverable) |
| JSDoc annotation specialist | `.agents/skills/jsdoc-annotation-specialist/` | Documentation skill (Phase 0 deliverable) |
| Skill validation scratchpad | `scratchpad/skill-validation/schema-model-test.ts` | Proves `LiteralKit`, `S.Class` + `$I`, `S.toTaggedUnion`, `S.TemplateLiteral` compile |

## Scope

### In Scope

- Code and document graph as a unified workspace surface
- Lexical rich text editor with `[[wiki_link]]` support and Obsidian-like graph behavior
- Event-sourced persistence via Effect `EventLog` + `SqlEventJournal` as source of truth
- Real-time graph mutation streaming via `EventJournal.changes` PubSub
- Temporal replay via `effect_event_journal` table queries
- Cytoscape-based graph visualization with existing style system
- Provenance-first architecture using existing `ProvBundle` from `@beep/semantic-web`
- Decomposition of the desktop app monolith into composable workspace zones
- Phase 0 agent bootstrapping with four specialist skills
- `Atom.runtime` for all frontend state (hard ban on React hooks for server state)
- `Model.Class` for persisted entities, `S.TaggedClass` for events, `LiteralKit` for unions

### Out Of Scope

- Legal, IP, and compliance domains (future Phase 4 extension)
- Production deployment, hosting, or infrastructure
- Auth, IAM, and multi-tenancy
- Mobile or web companion apps
- Sync, collaboration, or multi-user editing
- Changes to repo-memory SQLite schema or indexing pipeline

## Anti-Goals

This spec does not replace existing repo-memory or editor implementations. It composes on top of them.

- repo-memory SQLite stays as-is. The graph is a derived projection from the event journal, not a new source of truth for code intelligence.
- The Effect `EventLog` + `EventJournal` primitives from `effect/unstable/eventlog` are the foundation. This spec defines an `EventGroup` and handlers for the graph domain, not a custom event sourcing framework.
- The Lexical editor port builds on the existing 4-node-type surface in `packages/editor/lexical`. It adds wiki_link nodes and graph-aware plugins, not a new editor framework.
- Cytoscape adoption reuses the existing 948-line style system. The D3 knowledge graph component remains available for simpler non-interactive views.
- Frontend state uses `Atom` from `effect/unstable/reactivity` exclusively. No `useState`, `useEffect`, or TanStack Query for server-derived state.

## Success Condition

This spec succeeds if another engineer can build the knowledge workspace without making new architectural decisions about:
- how graph mutations are persisted and replayed (Answer: `EventLog` + `SqlEventJournal`)
- how the editor integrates with the graph (Answer: `KnowledgeGraph` facade + `EventLog.write`)
- how real-time streaming reaches the UI (Answer: `EventJournal.changes` PubSub + `Reactivity` keys + `Atom`)
- how temporal replay works mechanically (Answer: `effect_event_journal` table queries up to a timestamp)
- which existing infrastructure to reuse versus replace (Answer: all existing, no replacements)
- what ships in each phase and what acceptance looks like (Answer: Phase 0-3 with checkboxes)
- which agent handles which task (Answer: delegation strategy table with specialist skill assignments)
