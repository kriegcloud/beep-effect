# Phase 1 Orchestrator Prompt

Copy-paste this prompt to start Phase 1 (Ontology Service) implementation.

---

## Prompt

You are implementing Phase 1 (Ontology Service) of the Knowledge Graph Integration spec.

### Context

Phase 0 (Foundation) is complete. The knowledge slice now has:

- **Entity IDs**: KnowledgeEntityId, RelationId, OntologyId, ExtractionId, MentionId in `@beep/shared-domain`
- **Domain models**: Entity, Relation, Ontology, Extraction, Mention with M.Class + makeFields pattern
- **Value objects**: EvidenceSpan, Attributes for provenance tracking
- **Tables**: All tables created with OrgTable.make pattern + RLS policies
- **Error types**: Extraction, Ontology, and Grounding error hierarchies

### Your Mission

Implement the Ontology Service for OWL/RDFS parsing and management:

1. **OntologyParser**: N3.js-based parser for Turtle/RDF/JSON-LD files
2. **ClassDefinition model**: OWL/RDFS class with properties and hierarchy
3. **PropertyDefinition model**: Object and datatype properties
4. **OntologyService**: Effect.Service for CRUD + caching
5. **OntologyRepo**: Database persistence with organization scoping

### Reference Implementation

The effect-ontology repo provides working patterns:

```
tmp/effect-ontology/packages/@core-v2/src/
├── Domain/Model/
│   ├── Ontology.ts          # ClassDefinition schema
│   └── OntologyRef.ts       # Reference patterns
└── Ontology/
    ├── OntologyParser.ts    # N3.js parser (adapt to Effect.async)
    └── OntologyService.ts   # Service layer
```

### Files to Create

```
packages/knowledge/domain/src/entities/
├── ClassDefinition/
│   ├── ClassDefinition.model.ts
│   └── index.ts
└── PropertyDefinition/
    ├── PropertyDefinition.model.ts
    └── index.ts

packages/knowledge/server/src/Ontology/
├── OntologyParser.ts        # N3 callback → Effect.async
├── OntologyService.ts       # Effect.Service with accessors: true
├── OntologyCache.ts         # LRU cache for parsed ontologies
└── index.ts

packages/knowledge/server/src/db/repos/
├── Ontology.repo.ts
├── ClassDefinition.repo.ts
└── PropertyDefinition.repo.ts

packages/knowledge/tables/src/tables/
├── classDefinition.table.ts
└── propertyDefinition.table.ts
```

### Critical Patterns

**Effect.Service with dependencies**:
```typescript
export class OntologyService extends Effect.Service<OntologyService>()(
  "@beep/knowledge-server/OntologyService",
  {
    dependencies: [OntologyRepo.Default, OntologyParser.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const repo = yield* OntologyRepo;
      const parser = yield* OntologyParser;

      return {
        create: (input: OntologyInput) => Effect.gen(function* () {
          const parsed = yield* parser.parse(input.content);
          // ... store ontology and extracted classes
        }),
      };
    }),
  }
) {}
```

**N3.js callback wrapping**:
```typescript
import { Parser, Store } from "n3";

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
```

### Dependencies to Add

```bash
cd packages/knowledge/server
bun add n3
bun add -d @types/n3
```

### Verification

```bash
bunx turbo run check --filter="@beep/knowledge-*"
bunx turbo run test --filter="@beep/knowledge-*"
```

### Success Criteria

1. `OntologyParser.parse` successfully parses schema.org Turtle file
2. `OntologyService.create` persists ontology with class/property counts
3. `OntologyService.getById` returns cached parsed ontology
4. All knowledge packages pass type checking
5. Unit tests cover parser edge cases (invalid input, malformed RDF)

### Handoff Document

Full context available at: `specs/knowledge-graph-integration/handoffs/HANDOFF_P1.md`

### On Completion

1. Update `specs/knowledge-graph-integration/REFLECTION_LOG.md` with Phase 1 learnings
2. Create `handoffs/HANDOFF_P2.md` for Extraction Pipeline phase
3. Create `handoffs/P2_ORCHESTRATOR_PROMPT.md`
