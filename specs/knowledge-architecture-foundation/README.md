# Knowledge Architecture Foundation (Phase -1)

> Establish package allocation, API patterns, and layer boundaries before implementing knowledge graph capabilities.

---

## Status

**ACTIVE** - Foundation phase for knowledge slice implementation

---

## Purpose

This specification establishes the architectural foundation required before implementing knowledge graph capabilities. It defines:

1. **Package allocation** - Which packages own which capabilities
2. **RPC patterns** - Slice-specific RPC contracts and handlers
3. **Layer boundaries** - Clear separation between domain, tables, and server
4. **EntityId standards** - Branded IDs for all knowledge entities
5. **Error schemas** - Tagged errors for all failure modes
6. **Value objects** - Core RDF types (Quad, QuadPattern, SparqlBindings)

This is Phase -1 from the `knowledge-ontology-comparison` spec roadmap. All subsequent implementation phases depend on these architectural decisions being finalized.

---

## Complexity Classification

Using the formula from `specs/_guide/README.md`:

```
Complexity = (Phases × 2) + (Agents × 3) + (CrossPkg × 4) + (ExtDeps × 3) + (Uncertainty × 5) + (Research × 2)
```

| Factor | Value | Contribution |
|--------|-------|--------------|
| Phases | 1 | 2 |
| Agents | 2 | 6 |
| Cross-Package Dependencies | 3 | 12 |
| External Dependencies | 0 | 0 |
| Uncertainty | 1 | 5 |
| Research Required | 0 | 0 |
| **Total** | | **25** |

**Classification: Medium** (21-40 points)

This is a single-phase architectural spec with moderate cross-package impact.

---

## Background

### Context

The `knowledge-ontology-comparison` spec identified significant capability gaps between the effect-ontology reference implementation and the current knowledge slice. Before implementing those capabilities, architectural decisions must be documented and enforced.

### Related Specs

| Spec | Status | Relevance |
|------|--------|-----------|
| `specs/knowledge-ontology-comparison/` | COMPLETE | Source of Phase -1 requirements |
| `specs/knowledge-graph-integration/` | COMPLETE | Original knowledge architecture |

### Key Documents

- [IMPLEMENTATION_ROADMAP.md](../knowledge-ontology-comparison/outputs/IMPLEMENTATION_ROADMAP.md) - Phase -1 details
- [CONTEXT_DOCUMENT.md](../knowledge-ontology-comparison/outputs/CONTEXT_DOCUMENT.md) - Full architectural context
- [GAP_ANALYSIS.md](../knowledge-ontology-comparison/outputs/GAP_ANALYSIS.md) - Capability gaps

---

## Goals

1. **Package Allocation Matrix**
   - Document which package owns each capability
   - Establish clear boundaries between domain, tables, and server
   - Follow existing beep-effect patterns from documents slice

2. **RPC Pattern Decisions**
   - Define slice-specific RPC contracts (NOT shared kernel)
   - Follow `@effect/rpc` patterns from documents slice
   - Include prefix namespacing for all RPC groups

3. **Layer Boundary Rules**
   - ALLOWED/FORBIDDEN lists for each package
   - Dependency direction rules
   - TypeScript import enforcement

4. **EntityId Standards**
   - Define all knowledge slice EntityIds
   - Follow `@beep/shared-domain` patterns
   - Include table column `.$type<>()` requirements

5. **Error Schemas**
   - Tagged errors for all failure modes
   - Consistent naming conventions
   - Recovery hints where applicable

6. **Value Object Schemas**
   - Quad (subject, predicate, object, graph)
   - QuadPattern (pattern matching)
   - SparqlBindings (query results)
   - InferenceResult (reasoning output)

7. **Architecture Decision Record**
   - Document key decisions and rationale
   - Include alternatives considered
   - Provide migration guidance

---

## Non-Goals

- **NOT** implementing RDF store or SPARQL services (Phase 0-1)
- **NOT** implementing workflow durability (Phase 3)
- **NOT** implementing GraphRAG enhancements (Phase 4)
- **NOT** modifying existing ExtractionPipeline behavior
- **NOT** creating database migrations (tables phase)

This is an **architecture and scaffolding** specification only.

---

## Deliverables

| Document | Purpose | Location |
|----------|---------|----------|
| PACKAGE_ALLOCATION.md | Package-to-capability mapping | outputs/ |
| RPC_PATTERNS.md | RPC contract and handler patterns | outputs/ |
| LAYER_BOUNDARIES.md | Package dependency rules | outputs/ |
| ENTITYID_AUDIT.md | EntityId definitions and usage | outputs/ |
| ERROR_SCHEMAS.md | Tagged error definitions | outputs/ |
| VALUE_OBJECTS.md | Core RDF type schemas | outputs/ |
| ADR.md | Architecture Decision Record | outputs/ |

---

## Phase Overview

| Phase | Description | Agent | Output |
|-------|-------------|-------|--------|
| **P1** | Package allocation research | codebase-researcher | Package matrix |
| **P2** | RPC pattern extraction | codebase-researcher | Pattern documentation |
| **P3** | Schema scaffolding | doc-writer | EntityIds, errors, value objects |
| **P4** | ADR creation | doc-writer | Architecture decision record |

---

## Key Decisions (from IMPLEMENTATION_ROADMAP)

### RPC Pattern Decision

**Decision**: Use `@effect/rpc` with slice-specific RPCs (NOT HttpApi, NOT shared kernel)

**Pattern Reference**: Follow `packages/documents/domain/src/entities/Document/Document.rpc.ts`

**Key Requirements**:
1. RPC contracts in `@beep/knowledge-domain`
2. RPC handlers in `@beep/knowledge-server`
3. Middleware applied BEFORE `.toLayer()`
4. Handler keys include prefix (e.g., `entity_get`)

### Package Allocation Decision

| Capability | Package | Rationale |
|------------|---------|-----------|
| Value objects (Quad, QuadPattern) | `@beep/knowledge-domain` | Domain values - no implementation |
| Service interfaces | `@beep/knowledge-domain` | Service contracts only |
| Service implementations | `@beep/knowledge-server` | Server-side implementation |
| Table definitions | `@beep/knowledge-tables` | Drizzle table definitions |
| RPC handlers | `@beep/knowledge-server` | Handler layer composition |

### Layer Boundary Rules

```
knowledge-domain:
  ALLOWED:
    - Value objects
    - Entity models
    - Tagged errors
    - RPC contracts
    - EntityId definitions
    - Schema definitions

  FORBIDDEN:
    - Service implementations
    - Database access
    - External API calls
    - Layer definitions

knowledge-tables:
  ALLOWED:
    - Drizzle table definitions
    - Column type mappings with .$type<EntityId.Type>()
    - Index definitions
    - Foreign key relationships

  FORBIDDEN:
    - Query logic
    - Repository methods
    - Business logic

knowledge-server:
  ALLOWED:
    - Service implementations
    - RPC handlers
    - Repository implementations
    - Layer composition
    - External service integration

  FORBIDDEN:
    - Domain type definitions (use knowledge-domain)
    - Table definitions (use knowledge-tables)
```

---

## Success Criteria

- [ ] Package allocation matrix documents all capabilities
- [ ] RPC contracts compile without implementation
- [ ] All EntityIds defined in `@beep/knowledge-domain`
- [ ] Dependency rules enforced by TypeScript imports
- [ ] Error schemas follow `S.TaggedError` pattern
- [ ] Value objects use `S.Class` or `S.Struct` as appropriate
- [ ] ADR documents all key decisions with rationale
- [ ] Team aligned on layer boundaries

---

## Timeline

**Duration**: 1 week

| Day | Focus |
|-----|-------|
| 1 | Package allocation research and documentation |
| 2 | RPC pattern extraction and documentation |
| 3 | EntityId audit and additions |
| 4 | Error schemas and value objects |
| 5 | ADR creation and team review |

---

## Dependencies

**None** - This is foundational work that blocks all other phases.

**Blocks**:
- Phase 0: RDF Foundation
- Phase 1: Query & Reasoning Layer
- Phase 2: Entity Resolution Enhancements
- Phase 3: Workflow Durability
- Phase 4: GraphRAG Enhancements
- Phase 5: Production Resilience
- Phase 6: POC Integration

---

## Team

| Role | Responsibility |
|------|----------------|
| Architect | Package allocation decisions |
| Developer | Schema scaffolding |
| Reviewer | ADR review |

---

## Reference Files

### Existing Patterns to Follow

```
packages/documents/domain/src/entities/Document/
  Document.model.ts           # Entity model pattern
  Document.rpc.ts             # RPC contract pattern
  Document.errors.ts          # Tagged error pattern

packages/shared/domain/src/value-objects/
  EntityId.ts                 # EntityId pattern

packages/documents/server/src/rpc/v1/document/
  _rpcs.ts                    # RPC handler pattern
```

### Knowledge Slice Current State

```
packages/knowledge/
  domain/src/
    entities/
      Entity/                 # Existing entity model
      Relation/               # Existing relation model
      Ontology/               # Existing ontology model
    value-objects/
      Confidence.ts           # Existing value object
  tables/src/
    tables/                   # Existing table definitions
  server/src/
    services/                 # Existing service implementations
```

---

## Related Documentation

- [REFLECTION_LOG.md](./REFLECTION_LOG.md) - Session learnings
- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Mandatory patterns
- [Database Patterns](../../documentation/patterns/database-patterns.md) - Table patterns
- [knowledge-ontology-comparison](../knowledge-ontology-comparison/) - Source spec
