---
root: false
targets: ["packages/common/knowledge-graph/**", "initiatives/knowledge-workspace/**"]
description: "Knowledge workspace specialist skills"
globs: ["packages/common/knowledge-graph/**", "initiatives/knowledge-workspace/**"]
---

# Knowledge Workspace

When working in knowledge graph or knowledge workspace packages, consult these specialist skills:

- `bun run beep docs skills atom-reactivity-specialist` — frontend state with Atom.runtime, React hooks ban
- `bun run beep docs skills schema-model-specialist` — Model.Class, EntityId, $I identity, LiteralKit
- `bun run beep docs skills jsdoc-annotation-specialist` — JSDoc, @example, $I.annote compliance
- `bun run beep docs skills eventlog-graph-specialist` — Effect EventLog, EventGroup, KnowledgeGraph facade

Key architectural decisions:

1. Effect EventLog primitives for event sourcing (not custom).
2. Atom.runtime + Context.Service for all frontend state (no React hooks).
3. Model.Class for persisted entities, S.TaggedClass for events.
4. S.TemplateLiteral for URI-shaped node IDs.
5. Single .beep/graph/graph.db with two table owners.
