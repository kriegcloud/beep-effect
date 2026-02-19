# Phase 1 Handoff: Ontology Service

**Date**: 2026-01-18
**From**: Phase 0 (Foundation)
**To**: Phase 1 (Ontology Service)
**Status**: Ready for implementation

---

## Phase 0 Completion Summary

Phase 0 successfully established the foundation layer for the knowledge graph integration:

### Files Created

| Category | Files |
|----------|-------|
| Entity IDs | `packages/shared/domain/src/entity-ids/knowledge/ids.ts` - Added KnowledgeEntityId, RelationId, OntologyId, ExtractionId, MentionId |
| Value Objects | `packages/knowledge/domain/src/value-objects/EvidenceSpan.ts`, `Attributes.ts` |
| Domain Models | Entity, Relation, Ontology, Extraction, Mention models |
| Error Types | extraction.errors.ts, ontology.errors.ts, grounding.errors.ts |
| Tables | entity.table.ts, relation.table.ts, ontology.table.ts, extraction.table.ts, mention.table.ts |
| RLS Policies | `packages/_internal/db-admin/drizzle/0001_enable_rls_policies.sql` |
| Slice Relations | Updated `packages/_internal/db-admin/src/slice-relations.ts` |

### Key Design Patterns Established

| Pattern | Implementation | Notes |
|---------|----------------|-------|
| Entity ID | `KnowledgeEntityIds.KnowledgeEntityId` | Uses `knowledge_entity__uuid` format |
| Domain Model | `M.Class` + `makeFields` | Includes audit columns automatically |
| Table Definition | `OrgTable.make(EntityId)` | Auto organization FK + RLS |
| Error Types | `S.TaggedError` | Effect-style discriminated errors |
| RLS Policies | `org_id = current_setting('app.org_id')` | Tenant isolation |

---

## Phase 1 Scope

Phase 1 implements the Ontology Service for OWL/RDFS parsing and management.

### Primary Objectives

1. **Ontology Parser**: Parse OWL/RDFS files (Turtle, RDF/XML, JSON-LD, N-Triples)
2. **ClassDefinition Model**: Extract class hierarchies with properties
3. **PropertyDefinition Model**: Extract object and datatype properties
4. **OntologyService Effect.Service**: CRUD operations + caching
5. **OntologyRepo**: Database persistence layer

### Reference Implementation

The effect-ontology reference at `tmp/effect-ontology/` provides proven patterns:

```
tmp/effect-ontology/packages/@core-v2/src/Domain/Model/
├── Ontology.ts         # ClassDefinition, PropertyDefinition schemas
└── OntologyRef.ts      # Ontology reference patterns

tmp/effect-ontology/packages/@core-v2/src/Ontology/
├── OntologyParser.ts   # N3.js-based Turtle parser
├── OntologyService.ts  # Service layer
└── OntologyStore.ts    # In-memory storage (adapt to DB)
```

---

## Required Files to Create

### 1. Domain Models

```
packages/knowledge/domain/src/entities/ClassDefinition/
├── ClassDefinition.model.ts    # OWL/RDFS class with properties
└── index.ts

packages/knowledge/domain/src/entities/PropertyDefinition/
├── PropertyDefinition.model.ts # Object/datatype property
└── index.ts
```

### 2. Value Objects

```
packages/knowledge/domain/src/value-objects/
├── OntologyRef.ts      # URI reference to ontology
├── PropertyRange.ts    # Property range constraints
└── OntologyStats.ts    # Class/property counts
```

### 3. Server Components

```
packages/knowledge/server/src/Ontology/
├── OntologyParser.ts       # N3.js-based parser service
├── OntologyService.ts      # Effect.Service for CRUD
├── OntologyCache.ts        # Parsed ontology caching
└── index.ts

packages/knowledge/server/src/db/repos/
├── Ontology.repo.ts        # Ontology persistence
├── ClassDefinition.repo.ts # ClassDefinition persistence
└── PropertyDefinition.repo.ts
```

### 4. Tables (if not covered by Ontology)

```
packages/knowledge/tables/src/tables/
├── classDefinition.table.ts    # OWL class definitions
└── propertyDefinition.table.ts # OWL property definitions
```

---

## Implementation Guidance

### OntologyParser Pattern (from effect-ontology)

```typescript
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Parser, Store } from "n3";

export class OntologyParser extends Effect.Service<OntologyParser>()("OntologyParser", {
  dependencies: [],
  effect: Effect.gen(function* () {
    const parseOwl = (content: string) =>
      Effect.async<Store, ParseError>((cb) => {
        const parser = new Parser({ format: "Turtle" });
        const store = new Store();
        parser.parse(content, (error, quad) => {
          if (error) return cb(Effect.fail(new ParseError({ message: error.message })));
          if (quad) store.addQuad(quad);
          else cb(Effect.succeed(store));
        });
      });

    return {
      parse: parseOwl,
      extractClasses: (store: Store) => /* ... */,
      extractProperties: (store: Store) => /* ... */,
    };
  }),
}) {}
```

### OntologyService Pattern

```typescript
export class OntologyService extends Effect.Service<OntologyService>()("OntologyService", {
  dependencies: [OntologyRepo, OntologyParser, OntologyCache],
  effect: Effect.gen(function* () {
    const repo = yield* OntologyRepo;
    const parser = yield* OntologyParser;
    const cache = yield* OntologyCache;

    return {
      create: (input: OntologyInput) => Effect.gen(function* () {
        const parsed = yield* parser.parse(input.content);
        const classes = yield* parser.extractClasses(parsed);
        const properties = yield* parser.extractProperties(parsed);
        const ontology = yield* repo.create({
          ...input,
          classCount: classes.length,
          propertyCount: properties.length,
        });
        yield* cache.set(ontology.id, { classes, properties });
        return ontology;
      }),

      getById: (id: OntologyId) => Effect.gen(function* () {
        const cached = yield* cache.get(id);
        if (Option.isSome(cached)) return cached.value;
        const ontology = yield* repo.findById(id);
        // Re-parse if not cached
        const content = yield* fetchOntologyContent(ontology.storagePath);
        const parsed = yield* parser.parse(content);
        yield* cache.set(id, parsed);
        return ontology;
      }),
    };
  }),
}) {}
```

---

## Verification Criteria

### Build Verification

```bash
bunx turbo run check --filter="@beep/knowledge-*"
bunx turbo run lint:fix --filter="@beep/knowledge-*"
```

### Unit Test Requirements

- OntologyParser parses valid Turtle file
- OntologyParser fails gracefully on invalid input
- OntologyService.create stores ontology and extracts classes
- OntologyCache provides LRU eviction

### Integration Test Requirements

- Create ontology via API
- Query classes/properties for ontology
- Handle multi-tenant isolation (different orgs)

---

## Dependencies

### NPM Packages to Add

```bash
cd packages/knowledge/server
bun add n3
bun add -d @types/n3
```

### Effect Patterns

- `Effect.Service` with accessors: true
- `Effect.async` for N3 callback wrapping
- `Stream` for streaming quad processing (large ontologies)
- `@effect/cache` for parsed ontology caching

---

## Critical Path Notes

1. **N3.js Integration**: The parser is callback-based; wrap in `Effect.async`
2. **Large Ontology Handling**: Use `Stream` for parsing, batch inserts for classes
3. **Cache Strategy**: LRU cache by ontology ID, invalidate on update
4. **Storage**: Store raw content in S3/blob storage, metadata in DB

---

## Related Files for Reference

| Purpose | Path |
|---------|------|
| Ontology table | `packages/knowledge/tables/src/tables/ontology.table.ts` |
| Ontology model | `packages/knowledge/domain/src/entities/Ontology/Ontology.model.ts` |
| Effect Service pattern | `packages/iam/server/src/db/Db/Db.ts` |
| Reference parser | `tmp/effect-ontology/packages/@core-v2/src/Ontology/OntologyParser.ts` |

---

## Next Phase Preview

Phase 2 (Extraction Pipeline) will use the OntologyService to:
- Load ontology for extraction scope
- Validate extracted entity types against ontology classes
- Validate relation predicates against ontology properties
