# Effect-Ontology Analysis

> Reference implementation analysis for knowledge graph integration.

**Generated**: 2026-01-18
**Source**: `tmp/effect-ontology/packages/@core-v2/src/`

---

## Executive Summary

The effect-ontology codebase provides a functional, type-safe system for extracting structured knowledge graphs from unstructured text using ontology-guided LLM prompting. This analysis maps its patterns to beep-effect integration requirements.

---

## Architecture Overview

### Directory Structure

```
packages/@core-v2/src/
├── Cluster/             # Distributed execution
├── Contract/            # Progress streaming contracts
├── Domain/              # Pure types, schemas (no I/O)
│   ├── Error/           # Typed errors
│   ├── Model/           # Domain models
│   │   ├── Entity.ts    # Entity, Relation, EvidenceSpan
│   │   ├── Ontology.ts  # ClassDefinition, PropertyDefinition
│   │   └── ...
│   ├── Schema/          # API schemas
│   └── Rdf/             # RDF constants and IRI utilities
├── Prompt/              # Prompt construction
├── Runtime/             # Layer composition, HTTP server
├── Schema/              # EntityFactory, RelationFactory
├── Service/             # Effect.Service classes
│   ├── Config.ts        # Configuration
│   ├── Ontology.ts      # OWL parsing, class hierarchy
│   ├── Embedding.ts     # Embedding service
│   └── LlmControl/      # Token budget, rate limiting
├── Telemetry/           # OpenTelemetry integration
├── Utils/               # Common utilities
└── Workflow/            # Business logic
    ├── StreamingExtraction.ts
    ├── Merge.ts         # Monoid merge operations
    └── EntityResolution.ts
```

---

## Domain Models

### Entity Model

**Source**: `Domain/Model/Entity.ts`

```typescript
export class Entity extends Schema.Class<Entity>("Entity")({
  id: EntityIdSchema,           // Snake_case identifier
  mention: Schema.String,       // Original text span
  types: Schema.Array(Schema.String).pipe(Schema.minItems(1)), // OWL class IRIs
  attributes: AttributesSchema, // Property-value pairs
  mentions: Schema.optional(Schema.Array(EvidenceSpanSchema)),
  groundingScore: Schema.optional(Schema.Number),
}) {}
```

**Key Patterns**:
- Uses `Schema.Class` for domain entities
- Types array requires at least one OWL class IRI
- Attributes stored as key-value pairs (property IRI → value)
- Optional evidence spans for provenance

### EvidenceSpan

**Source**: `Domain/Model/Entity.ts`

```typescript
export const EvidenceSpanSchema = Schema.Struct({
  text: Schema.String,
  startChar: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
  endChar: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
  confidence: Schema.optional(Schema.Number.pipe(
    Schema.greaterThanOrEqualTo(0),
    Schema.lessThanOrEqualTo(1)
  )),
})
```

**Beep-Effect Mapping**:
- Rename `startChar`/`endChar` to `startOffset`/`endOffset` for clarity
- Add `sourceUri` for multi-document tracking

### ClassDefinition

**Source**: `Domain/Model/Ontology.ts`

```typescript
export class ClassDefinition extends Schema.Class<ClassDefinition>("ClassDefinition")({
  id: IriSchema,              // Full IRI
  label: Schema.String,       // rdfs:label
  comment: Schema.String,     // rdfs:comment
  properties: Schema.Array(IriSchema),  // Applicable property IRIs
  prefLabels: Schema.Array(Schema.String),  // skos:prefLabel
  altLabels: Schema.Array(Schema.String),   // skos:altLabel
  parents: Schema.Array(IriSchema),    // rdfs:subClassOf
  children: Schema.Array(IriSchema),   // Inverse subClassOf
}) {}
```

**Key Insight**: Classes track both inherited properties (via `parents`) and applicable properties (direct `rdfs:domain`).

---

## KnowledgeGraph Monoid

### Source: `Workflow/Merge.ts`

The merge operation implements a monoid for combining knowledge graph fragments:

```typescript
// Identity element
export const emptyGraph: KnowledgeGraph = {
  entities: [],
  relations: []
};

// Combine operation (associative)
export const mergeGraphs = (a: KnowledgeGraph, b: KnowledgeGraph): KnowledgeGraph => {
  // 1. Merge entities by ID
  //    - Type voting: select most frequent types
  //    - Attribute merging: last-write-wins with conflict tracking
  // 2. Merge relations by signature (subjectId, predicate, object)
  //    - Deduplicate identical relations
  //    - Accumulate evidence spans
  return { entities, relations };
};
```

**Merge Strategies**:

| Component | Strategy | Conflict Resolution |
|-----------|----------|---------------------|
| Entity types | Frequency voting | Most common type wins |
| Entity attributes | Union with override | Last value wins, conflicts logged |
| Entity mentions | Accumulate | Concatenate evidence spans |
| Relations | Signature dedup | Keep highest confidence |
| Relation evidence | Accumulate | Concatenate spans |

### Monoid Laws Verification

```typescript
// Associativity: merge(merge(a, b), c) === merge(a, merge(b, c))
// Identity: merge(empty, a) === a AND merge(a, empty) === a
```

Property tests in `test/Workflow/Merge.test.ts` verify these laws with `fast-check`.

---

## Extraction Pipeline

### 6-Phase Flow

**Source**: `Workflow/StreamingExtraction.ts`

```
1. CHUNK     - Split text into overlapping chunks (sentence-aware)
2. MENTION   - Detect entity mentions in each chunk
3. ENTITY    - Extract typed entities (constrained to ontology classes)
4. SCOPE     - Resolve property scopes by entity type
5. RELATION  - Extract relations (constrained to ontology properties)
6. GROUND    - Ground relations via embedding similarity
```

### Phase Implementation Pattern

Each phase follows:

```typescript
export class PhaseExtractor extends Effect.Service<PhaseExtractor>()(
  "PhaseExtractor",
  {
    dependencies: [AiService.Default, OntologyService.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const ai = yield* AiService;
      const ontology = yield* OntologyService;

      return {
        extract: (input, ontologyContext) =>
          Effect.gen(function* () {
            // Build prompt with ontology guidance
            const prompt = buildPrompt(input, ontologyContext);

            // Constrain output to ontology types
            const schema = makeConstrainedSchema(ontologyContext);

            // LLM call with structured output
            const result = yield* ai.generateObject({ schema, prompt });

            // Transform to domain types
            return transformToDomain(result, input);
          }),
      };
    }),
  }
) {}
```

---

## Ontology Service

### Source: `Service/Ontology.ts`

Key capabilities:

1. **Parse Turtle/OWL**: N3.js parser integration
2. **Build class hierarchy**: DAG with parent/child relationships
3. **Property scoping**: Domain/range extraction
4. **Topological fold**: Catamorphism over class DAG

### Class Hierarchy Construction

```typescript
// Extract rdfs:subClassOf triples
const subClassTriples = store.getQuads(null, RDFS.subClassOf, null);

// Build adjacency list (DAG)
const hierarchy = new Map<string, ClassDefinition>();

// Topological sort for inheritance computation
const sorted = topologicalSort(hierarchy);

// Fold to accumulate inherited properties
for (const classIri of sorted) {
  const classDef = hierarchy.get(classIri);
  const inheritedProps = classDef.parents.flatMap(p =>
    hierarchy.get(p)?.properties ?? []
  );
  classDef.properties = dedupe([...classDef.properties, ...inheritedProps]);
}
```

---

## Embedding Service

### Source: `Service/Embedding.ts`

Provider-agnostic embedding interface:

```typescript
export interface EmbeddingService {
  embed(text: string, taskType: TaskType): Effect.Effect<Vector, EmbeddingError>;
  embedBatch(texts: string[], taskType: TaskType): Effect.Effect<Vector[], EmbeddingError>;
}

type TaskType = "search_query" | "search_document";
```

### Provider Implementations

| Provider | Dimensions | Task Types | Notes |
|----------|------------|------------|-------|
| Voyage AI | 1024 | Both | Production default |
| Nomic (local) | 768 | Both | Development/offline |
| OpenAI | 1536 | Single | Fallback |

---

## Grounding Service

### Source: `Service/Grounder.ts`

Filters hallucinated relations by comparing:
- Relation as natural language statement
- Source text embedding

```typescript
const groundRelation = (relation: Relation, sourceText: string) =>
  Effect.gen(function* () {
    // Convert relation to statement: "Subject predicate Object"
    const statement = `${relation.subject.mention} ${getPredicateLabel(relation.predicate)} ${relation.object}`;

    // Embed both
    const [stmtEmbed, textEmbed] = yield* Effect.all([
      embedding.embed(statement, "search_query"),
      embedding.embed(sourceText, "search_document"),
    ]);

    // Cosine similarity
    const similarity = cosineSimilarity(stmtEmbed, textEmbed);

    // Filter by threshold (default 0.8)
    if (similarity >= threshold) {
      return { ...relation, groundingScore: similarity };
    }
    return null;
  });
```

---

## Patterns to Adapt for Beep-Effect

### 1. Multi-Tenant Extension

Effect-ontology is single-tenant. Add:

```typescript
// Every entity/relation needs organizationId
export class Entity extends S.Class<Entity>("Entity")({
  id: EntityId,
  organizationId: SharedEntityIds.OrganizationId,  // ADD
  // ... rest of fields
}) {}
```

### 2. Persistence Layer

Effect-ontology uses in-memory + file storage. Adapt to:

```typescript
// PostgreSQL tables with RLS
export const entities = OrgTable.make(KnowledgeEntityIds.EntityId)({
  types: pg.text("types").array().notNull(),
  mention: pg.text("mention").notNull(),
  attributes: pg.jsonb("attributes").default({}).notNull(),
  mentions: pg.jsonb("mentions"),  // EvidenceSpan[]
  groundingConfidence: pg.real("grounding_confidence"),
});
```

### 3. Effect.Service Pattern Alignment

Effect-ontology uses older pattern:

```typescript
// effect-ontology style (Effect.Service v3.x)
export class MyService extends Effect.Service<MyService>()("MyService", {
  effect: Effect.gen(...),
  dependencies: [...],
  accessors: true
}) {}
```

Beep-effect uses same pattern - direct adaptation works.

### 4. pgvector Integration

Add embedding storage with HNSW index:

```typescript
export const embeddings = OrgTable.make(KnowledgeEntityIds.EmbeddingId)({
  entityId: pg.text("entity_id").notNull().references(() => entities.id),
  vector: pg.vector("vector", { dimensions: 1024 }),
  provider: pg.text("provider").notNull(),
  model: pg.text("model").notNull(),
  taskType: pg.text("task_type"),
});

// HNSW index for fast k-NN
export const embeddingsIndexes = {
  vectorIdx: index("embeddings_vector_hnsw_idx").using(
    "hnsw",
    embeddings.vector.op("vector_cosine_ops")
  ),
};
```

---

## Key Differences: Effect-Ontology vs Beep-Effect

| Aspect | Effect-Ontology | Beep-Effect Adaptation |
|--------|-----------------|------------------------|
| Multi-tenancy | None | `organizationId` + RLS |
| Storage | File/Memory | PostgreSQL + pgvector |
| Entity IDs | String | Branded IDs via `EntityId.builder` |
| Schema imports | `Schema` from effect | `S` alias per `.claude/rules` |
| Table factory | None | `OrgTable.make` |
| Repository | None | `DbRepo.make` pattern |

---

## Files to Adapt

| Effect-Ontology File | Beep-Effect Target |
|----------------------|-------------------|
| `Domain/Model/Entity.ts` | `packages/knowledge/domain/src/Entity.ts` |
| `Domain/Model/Ontology.ts` | `packages/knowledge/domain/src/Ontology.ts` |
| `Workflow/Merge.ts` | `packages/knowledge/domain/src/Algebra.ts` |
| `Service/Ontology.ts` | `packages/knowledge/server/src/services/OntologyService.ts` |
| `Service/Embedding.ts` | `packages/knowledge/server/src/services/EmbeddingService.ts` |
| `Workflow/StreamingExtraction.ts` | `packages/knowledge/server/src/services/ExtractionPipeline.ts` |

---

## Recommended Adaptations

1. **Phase 0**: Adapt domain models with multi-tenant support
2. **Phase 1**: Adapt OntologyService, keep N3.js integration
3. **Phase 2**: Adapt extraction pipeline, replace @effect/ai usage
4. **Phase 3**: Implement pgvector-backed EmbeddingService
5. **Phase 4-7**: Continue per MASTER_ORCHESTRATION.md

---

## References

- Effect-ontology CLAUDE.md: `tmp/effect-ontology/CLAUDE.md`
- Technical walkthrough: `tmp/effect-ontology/TECHNICAL_WALKTHROUGH.md`
- Architecture docs: `tmp/effect-ontology/packages/@core-v2/docs/architecture/`
