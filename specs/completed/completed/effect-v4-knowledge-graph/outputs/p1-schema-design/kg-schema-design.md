# Knowledge Graph Schema Design: Effect v4 API

**Date:** 2026-02-21
**Status:** ACTIVE
**group_id:** `effect-v4`

---

## 1. Design Rationale

### The Effect v4 Knowledge Challenge

Effect v4 (beta) represents a major API overhaul from v3. Claude sessions frequently hallucinate v3 patterns (e.g., `Context.GenericTag`, `@effect/platform` imports, `Effect.catchAll`). This KG captures the complete v4 API surface for semantic lookup.

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Entity type granularity | 7 entity types | Covers modules, functions, types, patterns, concepts, migrations, and services |
| Episode narrative format | Structured text with labeled sections | Graphiti's LLM extracts entities better from labeled narrative than raw JSON |
| group_id | `effect-v4` | Isolate from `beep-dev` (project memories) and `palantir-ontology` |
| Ingestion order | Docs first, then functions | Module-level docs create entity context that improves function episode resolution |
| Module scope | 130 stable + key unstable | Stable modules are highest value; unstable covers CLI, HTTP, AI, SQL |

### Graphiti Constraints (from Palantir spec learnings)

1. All relationships are `RELATES_TO` in FalkorDB -- semantic type lives in the `name` property
2. Entity type classification is LLM-driven (soft, not hard constraints)
3. Reserved fields: `uuid`, `name`, `labels`, `created_at`, `summary`, `attributes`, `name_embedding`
4. Attributes must be flat key-value (no nested objects)
5. `add_memory` with narrative text is the ingestion interface

---

## 2. Entity Type Catalog

| # | Entity Type | Description | Expected Count |
|---|------------|-------------|----------------|
| 1 | **Module** | An Effect module (e.g., Array, Effect, Schema, Stream) | ~130 stable + ~18 unstable |
| 2 | **Function** | An exported function with signature and description | ~1500-2000 |
| 3 | **TypeDef** | A type alias, interface, class, branded type, or namespace | ~500-800 |
| 4 | **Pattern** | A design/usage pattern (error handling, resource management, etc.) | ~30-50 |
| 5 | **Concept** | A high-level concept (concurrency, streaming, dependency injection) | ~20-30 |
| 6 | **MigrationChange** | A specific v3->v4 API change with before/after code | ~50-80 |
| 7 | **Service** | An Effect service (FileSystem, Path, Terminal, Console, etc.) | ~15-20 |

---

## 3. Relationship Type Catalog

| Relationship | Source -> Target | Example |
|-------------|-----------------|---------|
| EXPORTS | Module -> Function/TypeDef | Array EXPORTS map |
| DEPENDS_ON | Module -> Module | Stream DEPENDS_ON Effect |
| REPLACES | Function/TypeDef -> Function/TypeDef | Effect.catch REPLACES Effect.catchAll |
| IMPLEMENTS | Function -> Concept | Effect.gen IMPLEMENTS generator-pattern |
| USES_PATTERN | Module -> Pattern | Schema USES_PATTERN builder-pattern |
| PROVIDES | Service -> Module | FileSystem PROVIDES effect/FileSystem |
| HAS_PARAMETER | Function -> TypeDef | map HAS_PARAMETER Function<A, B> |
| RETURNS | Function -> TypeDef | map RETURNS Array<B> |
| DESCRIBED_IN | Pattern/Concept -> Module | error-handling DESCRIBED_IN .patterns/error-handling.md |

---

## 4. Episode Narrative Templates

### Module Episode

```
Title: [ModuleName] Module
Category: module
Module Path: effect/[ModuleName]

Description: [Summary from index.ts JSDoc]

Mental Model: [From index.ts JSDoc @description block]

Common Tasks:
- [Task 1]: [function1], [function2]
- [Task 2]: [function3]

Key Exports: [list of primary functions/types]

Gotchas: [Known pitfalls from JSDoc]

Since: [version]
```

### Function Episode

```
Title: [ModuleName].[functionName]
Category: function
Module Path: effect/[ModuleName]

Description: [JSDoc description]

Signature: [full TypeScript signature]

Parameters:
- [param1]: [type] - [description]
- [param2]: [type] - [description]

Returns: [return type and description]

Example:
[code example from JSDoc @example]

Category Tag: [from @category JSDoc]
Since: [from @since JSDoc]
Related: [cross-references]
```

### Type Episode

```
Title: [ModuleName].[TypeName]
Category: type
Module Path: effect/[ModuleName]

Description: [JSDoc description]

Definition: [type definition or interface shape]

Type Parameters:
- [A]: [constraint and description]

Used By: [functions that use this type]

Since: [from @since JSDoc]
```

### Migration Episode

```
Title: Migration: [change description]
Category: migration
Source: [migration guide filename]

Change: [what changed]

v3 Pattern:
[old code]

v4 Pattern:
[new code]

Reason: [why it changed]

Affected Modules: [list of modules]
```

### Pattern Episode

```
Title: Pattern: [pattern name]
Category: pattern
Source: [pattern guide filename]

Description: [what this pattern solves]

When to Use: [use cases]

Implementation:
[code example]

Key Functions: [functions involved]

Related Patterns: [cross-references]
```

### Concept Episode

```
Title: Concept: [concept name]
Category: concept

Description: [what this concept means in Effect]

Key Modules: [modules that implement this concept]

Example:
[code showing the concept in action]

Related Concepts: [cross-references]
```

### Service Episode

```
Title: Service: [ServiceName]
Category: service
Module Path: effect/[ModuleName]

Description: [what this service provides]

Methods:
- [method1]: [signature] - [description]
- [method2]: [signature] - [description]

Default Implementation: [if any]
Platform Implementations: [Node, Bun, Browser variants]

Dependencies: [other services required]
Since: [version]
```

---

## 5. Ingestion Strategy

### Batch Order (docs before functions for better entity resolution)

| Batch | Source | Episodes | Purpose |
|-------|--------|----------|---------|
| 0 | Seed episode | 1 | Establish core Effect v4 entities |
| 1 | Module JSDoc from index.ts | ~130 | Create Module entities with rich context |
| 2 | Migration guides | ~50 | Create MigrationChange entities |
| 3 | Pattern guides + markdown docs | ~35 | Create Pattern and Concept entities |
| 4 | Enrichment (corrections, specs, blog) | ~30 | Add cross-references and corrections |
| 5+ | Function/type episodes | ~2000-2800 | Link to established Module/Concept entities |

### Ingestion Parameters

- **group_id:** `effect-v4`
- **source:** `text` (narrative format)
- **source_description:** varies by batch (e.g., "Effect v4 module documentation", "Effect v4 migration guide")
- **Delay between episodes:** 2 seconds (prevent LLM queue overwhelm)

---

## 6. Query Patterns

### AI Grounding (prevent hallucinations)

```
search_memory_facts({ query: "How do I create a tagged service in Effect v4?", group_ids: ["effect-v4"] })
search_nodes({ query: "Context.Tag replacement", group_ids: ["effect-v4"] })
```

### API Discovery

```
search_nodes({ query: "array filtering functions", group_ids: ["effect-v4"] })
search_memory_facts({ query: "JSON decoding with Schema", group_ids: ["effect-v4"] })
```

### Migration Assistance

```
search_memory_facts({ query: "Effect.catchAll replacement", group_ids: ["effect-v4"] })
search_nodes({ query: "Layer.scoped", group_ids: ["effect-v4"] })
```
