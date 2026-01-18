# Master Orchestration: Knowledge Graph Integration

> Complete phase workflows, checkpoints, and handoff protocols for integrating effect-ontology patterns into beep-effect.

---

## Phase 0: Foundation

**Duration**: 2-3 sessions
**Status**: Pending
**Agents**: `codebase-researcher`, `architecture-pattern-enforcer`

### Objectives

1. Create `packages/knowledge/*` vertical slice structure
2. Define core domain models (Entity, Relation, Mention, KnowledgeGraph)
3. Create table schemas with RLS policies
4. Set up pgvector extension for embeddings

### Tasks

#### Task 0.1: Slice Scaffolding

**Agent**: Manual (Orchestrator)

```
Create the knowledge vertical slice packages:

packages/knowledge/
├── domain/          # @beep/knowledge-domain
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── Entity.ts
│       ├── Relation.ts
│       ├── Mention.ts
│       ├── KnowledgeGraph.ts
│       ├── OntologyContext.ts
│       └── Errors.ts
├── tables/          # @beep/knowledge-tables
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── schema.ts
│       ├── entities.ts
│       ├── relations.ts
│       ├── extractions.ts
│       ├── ontologies.ts
│       └── embeddings.ts
├── server/          # @beep/knowledge-server
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       └── db/
│           └── Db/Db.ts
├── client/          # @beep/knowledge-client
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts
└── ui/              # @beep/knowledge-ui
    ├── package.json
    ├── tsconfig.json
    └── src/
        └── index.ts

Follow patterns from packages/iam/* for structure.
```

#### Task 0.2: Domain Models

**Agent**: Manual with `mcp-researcher` for Effect Schema patterns

```typescript
// @beep/knowledge-domain/src/Entity.ts
import * as S from "effect/Schema";
import * as M from "@effect/sql/Model";
import { BS } from "@beep/schema";

// Branded entity ID
export const EntityId = S.String.pipe(S.brand("EntityId"));
export type EntityId = S.Schema.Type<typeof EntityId>;

// Evidence span linking fact to source text
export class EvidenceSpan extends S.Class<EvidenceSpan>("EvidenceSpan")({
  text: S.String,
  startOffset: S.Number,
  endOffset: S.Number,
  sourceUri: S.String,
  confidence: S.Number,
}) {}

// Core entity model
export class Entity extends S.Class<Entity>("Entity")({
  id: EntityId,
  organizationId: SharedEntityIds.OrganizationId,
  types: S.Array(S.String),  // OWL class IRIs
  mention: S.String,         // Canonical surface form
  attributes: S.Record({ key: S.String, value: S.Unknown }),
  mentions: S.optional(S.Array(EvidenceSpan)),
  groundingConfidence: S.optional(S.Number),
  createdAt: S.Date,
  updatedAt: S.Date,
}) {}

// SQL Model for repository pattern
export const EntityModel = M.Class<EntityModel>("EntityModel")({
  // ... Drizzle-compatible model
});
```

```typescript
// @beep/knowledge-domain/src/Relation.ts
import * as S from "effect/Schema";

export const RelationId = S.String.pipe(S.brand("RelationId"));
export type RelationId = S.Schema.Type<typeof RelationId>;

export class ObjectReference extends S.Class<ObjectReference>("ObjectReference")({
  "@id": EntityId,
}) {}

export class Relation extends S.Class<Relation>("Relation")({
  id: RelationId,
  organizationId: SharedEntityIds.OrganizationId,
  subjectId: EntityId,
  predicate: S.String,  // Property IRI
  object: S.Union(S.String, ObjectReference),  // Literal or entity ref
  evidence: S.Array(EvidenceSpan),
  confidence: S.Number,
  createdAt: S.Date,
}) {}
```

```typescript
// @beep/knowledge-domain/src/KnowledgeGraph.ts
import * as S from "effect/Schema";
import { Entity } from "./Entity.js";
import { Relation } from "./Relation.js";

export class KnowledgeGraph extends S.Class<KnowledgeGraph>("KnowledgeGraph")({
  entities: S.Array(Entity),
  relations: S.Array(Relation),
}) {}

// Monoid operation for graph merging
export const mergeGraphs = (a: KnowledgeGraph, b: KnowledgeGraph): KnowledgeGraph => {
  // Implementation follows tmp/effect-ontology/packages/@core-v2/src/Workflow/Merge.ts
  // - Entity merge by ID with type voting
  // - Relation merge by signature (subjectId, predicate, object)
  // - Associative and has identity (empty graph)
};
```

#### Task 0.3: Table Schemas

**Agent**: Manual following `packages/shared/tables/` patterns

```typescript
// @beep/knowledge-tables/src/entities.ts
import { OrgTable } from "@beep/shared-tables";
import { relations } from "drizzle-orm";
import { text, jsonb, real, index } from "drizzle-orm/pg-core";

export const entities = OrgTable.make("entities", {
  types: text("types").array().notNull(),
  mention: text("mention").notNull(),
  attributes: jsonb("attributes").default({}).notNull(),
  mentions: jsonb("mentions"),  // EvidenceSpan[]
  groundingConfidence: real("grounding_confidence"),
});

export const entitiesRelations = relations(entities, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [entities.organizationId],
    references: [organizations.id],
  }),
  subjectRelations: many(relationsTable, { relationName: "subject" }),
  objectRelations: many(relationsTable, { relationName: "object" }),
}));

// Index for type-based queries
export const entitiesIndexes = {
  typesIdx: index("idx_entities_types").on(entities.types),
  orgIdx: index("idx_entities_org_id").on(entities.organizationId),
};
```

```typescript
// @beep/knowledge-tables/src/embeddings.ts
import { OrgTable } from "@beep/shared-tables";
import { text, vector, index } from "drizzle-orm/pg-core";

// Requires: CREATE EXTENSION IF NOT EXISTS vector;
export const embeddings = OrgTable.make("embeddings", {
  entityId: text("entity_id").notNull().references(() => entities.id),
  vector: vector("vector", { dimensions: 1024 }),  // Voyage/Nomic dimension
  provider: text("provider").notNull(),  // "voyage", "nomic", "openai"
  model: text("model").notNull(),
  taskType: text("task_type"),  // "search_query", "search_document"
});

// HNSW index for fast similarity search
export const embeddingsIndexes = {
  vectorIdx: index("idx_embeddings_vector").using(
    "hnsw",
    embeddings.vector.op("vector_cosine_ops")
  ),
};
```

#### Task 0.4: RLS Policies

**Agent**: Manual

```sql
-- Migration: 001_knowledge_rls.sql

-- Enable RLS on all knowledge tables
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ontologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policy (same pattern as IAM)
CREATE POLICY tenant_isolation_entities ON entities
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY tenant_isolation_relations ON relations
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY tenant_isolation_extractions ON extractions
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY tenant_isolation_ontologies ON ontologies
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY tenant_isolation_embeddings ON embeddings
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);
```

### Checkpoint

Before proceeding to P1:
- [ ] All 5 packages created with correct structure
- [ ] Domain models compile without errors
- [ ] Table schemas migrate successfully
- [ ] RLS policies applied to all tables
- [ ] pgvector extension enabled
- [ ] `bun run check --filter @beep/knowledge-*` passes
- [ ] REFLECTION_LOG.md updated
- [ ] HANDOFF_P1.md created

### Handoff

Create `handoffs/HANDOFF_P1.md` with:
- Package structure decisions made
- Schema design rationale
- Table relationships diagram
- P1 task refinements

---

## Phase 1: Ontology Service

**Duration**: 2-3 sessions
**Status**: Pending
**Agents**: `codebase-researcher`, `mcp-researcher`

### Objectives

1. Parse OWL/Turtle ontologies using N3.js
2. Build class hierarchy graph (DAG)
3. Implement property scoping by domain/range
4. Create KnowledgeIndex via topological catamorphism

### Tasks

#### Task 1.1: N3.js Integration

```typescript
// @beep/knowledge-server/src/services/OntologyParser.ts
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { N3 } from "n3";

export class OntologyParser extends Effect.Service<OntologyParser>()(
  "@beep/knowledge-server/OntologyParser",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      return {
        parseTurtle: (turtleContent: string) =>
          Effect.gen(function* () {
            const parser = new N3.Parser();
            const store = new N3.Store();
            const quads = parser.parse(turtleContent);
            store.addQuads(quads);
            return store;
          }),
      };
    }),
  }
) {}
```

#### Task 1.2: Class Hierarchy Builder

```typescript
// @beep/knowledge-server/src/services/OntologyService.ts
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";

export interface ClassDefinition {
  readonly id: string;  // IRI
  readonly label: string;
  readonly comment: string;
  readonly properties: ReadonlyArray<string>;
  readonly prefLabels: ReadonlyArray<string>;
  readonly altLabels: ReadonlyArray<string>;
  readonly parents: ReadonlyArray<string>;
  readonly children: ReadonlyArray<string>;
}

export class OntologyService extends Effect.Service<OntologyService>()(
  "@beep/knowledge-server/OntologyService",
  {
    dependencies: [OntologyParser.Default, KnowledgeDb.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const parser = yield* OntologyParser;
      const db = yield* KnowledgeDb;

      return {
        // Load ontology from Turtle content
        loadFromTurtle: (turtle: string) =>
          Effect.gen(function* () {
            const store = yield* parser.parseTurtle(turtle);
            const classes = yield* extractClasses(store);
            const hierarchy = yield* buildHierarchy(classes);
            return { store, classes, hierarchy };
          }),

        // Get properties valid for a class (including inherited)
        getPropertiesForClass: (classIri: string) =>
          Effect.gen(function* () {
            // Domain/range filtering + inheritance
          }),

        // Get class hierarchy checker for subclass reasoning
        getClassHierarchyChecker: () =>
          Effect.gen(function* () {
            return (childIri: string, parentIri: string): boolean => {
              // Transitive closure check
            };
          }),
      };
    }),
  }
) {}
```

#### Task 1.3: Topological Catamorphism

```typescript
// @beep/knowledge-domain/src/Algebra.ts
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as A from "effect/Array";

// The algebra for folding over the ontology DAG
// α: D × List<R> → R
// where D = ClassDefinition, R = KnowledgeIndex

export interface KnowledgeUnit {
  readonly classIri: string;
  readonly label: string;
  readonly properties: ReadonlyArray<PropertyDefinition>;
  readonly parents: ReadonlyArray<string>;
  readonly children: ReadonlyArray<string>;
}

export type KnowledgeIndex = HashMap.HashMap<string, KnowledgeUnit>;

// Monoid instance for KnowledgeIndex
export const KnowledgeIndexMonoid = {
  empty: HashMap.empty<string, KnowledgeUnit>(),
  combine: (a: KnowledgeIndex, b: KnowledgeIndex): KnowledgeIndex =>
    HashMap.union(a, b, (existing, incoming) => ({
      ...existing,
      // Merge properties, deduplicate
      properties: A.dedupe([...existing.properties, ...incoming.properties]),
    })),
};

// Topological fold over class hierarchy
export const foldOntology = (
  hierarchy: ClassHierarchy,
  algebra: (node: ClassDefinition, childResults: ReadonlyArray<KnowledgeUnit>) => KnowledgeUnit
): Effect.Effect<KnowledgeIndex, OntologyError> =>
  Effect.gen(function* () {
    const sorted = yield* topologicalSort(hierarchy);
    let index = KnowledgeIndexMonoid.empty;

    for (const classIri of sorted) {
      const classDef = hierarchy.get(classIri);
      const childResults = classDef.children.map((c) =>
        HashMap.get(index, c).pipe(O.getOrThrow)
      );
      const unit = algebra(classDef, childResults);
      index = HashMap.set(index, classIri, unit);
    }

    return index;
  });
```

### Checkpoint

Before proceeding to P2:
- [ ] Turtle files parse without errors
- [ ] Class hierarchy builds correctly
- [ ] Topological sort produces valid order
- [ ] Property scoping respects domain/range
- [ ] KnowledgeIndex monoid laws verified (property tests)
- [ ] Tests cover edge cases (cycles, missing classes)

---

## Phase 2: Extraction Pipeline

**Duration**: 3-4 sessions
**Status**: Pending
**Agents**: `mcp-researcher`, `test-writer`

### Objectives

1. Implement 6-phase streaming extraction
2. Integrate with @effect/ai for LLM calls
3. Create structured output schemas
4. Implement monoid-based graph merging

### Tasks

#### Task 2.1: NLP Service (Chunking)

```typescript
// @beep/knowledge-server/src/services/NlpService.ts
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";

export interface TextChunk {
  readonly index: number;
  readonly text: string;
  readonly startOffset: number;
  readonly endOffset: number;
}

export interface ChunkingConfig {
  readonly maxChunkSize: number;
  readonly preserveSentences: boolean;
  readonly overlapSentences: number;
}

export class NlpService extends Effect.Service<NlpService>()(
  "@beep/knowledge-server/NlpService",
  {
    accessors: true,
    effect: Effect.succeed({
      chunkText: (text: string, config: ChunkingConfig) =>
        Effect.gen(function* () {
          // Sentence-aware chunking with overlap
          // Returns Stream<TextChunk> for large documents
        }),

      detectMentions: (text: string) =>
        Effect.gen(function* () {
          // NER-style mention detection
          // Uses wink-nlp or similar
        }),
    }),
  }
) {}
```

#### Task 2.2: Extraction Stages

```typescript
// @beep/knowledge-server/src/services/Extraction.ts
import * as Effect from "effect/Effect";
import * as Ai from "@effect/ai";
import * as S from "effect/Schema";

// Stage 2: Mention Extraction
export class MentionExtractor extends Effect.Service<MentionExtractor>()(
  "@beep/knowledge-server/MentionExtractor",
  {
    dependencies: [AiService.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const ai = yield* AiService;

      return {
        extract: (text: string) =>
          ai.generateObject({
            schema: S.Array(MentionSchema),
            prompt: `Extract entity mentions from: ${text}`,
          }),
      };
    }),
  }
) {}

// Stage 3: Entity Extraction (with ontology guidance)
export class EntityExtractor extends Effect.Service<EntityExtractor>()(
  "@beep/knowledge-server/EntityExtractor",
  {
    dependencies: [AiService.Default, OntologyService.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const ai = yield* AiService;
      const ontology = yield* OntologyService;

      return {
        extract: (mentions: Mention[], ontologyContext: OntologyContext) =>
          Effect.gen(function* () {
            // Build prompt with ontology class definitions
            const prompt = yield* buildEntityPrompt(mentions, ontologyContext);

            // LLM output constrained to ontology types
            const schema = makeEntitySchema(ontologyContext.classIris);

            return yield* ai.generateObject({ schema, prompt });
          }),
      };
    }),
  }
) {}

// Stage 5: Relation Extraction
export class RelationExtractor extends Effect.Service<RelationExtractor>()(
  "@beep/knowledge-server/RelationExtractor",
  {
    dependencies: [AiService.Default, OntologyService.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const ai = yield* AiService;
      const ontology = yield* OntologyService;

      return {
        extract: (entities: Entity[], text: string, ontologyContext: OntologyContext) =>
          Effect.gen(function* () {
            // Get valid properties for entity types
            const properties = yield* ontology.getPropertiesForEntities(entities);

            // LLM output constrained to valid predicates
            const schema = makeRelationSchema(properties);
            const prompt = yield* buildRelationPrompt(entities, text, properties);

            return yield* ai.generateObject({ schema, prompt });
          }),
      };
    }),
  }
) {}
```

#### Task 2.3: Pipeline Orchestration

```typescript
// @beep/knowledge-server/src/services/ExtractionPipeline.ts
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";

export class ExtractionPipeline extends Effect.Service<ExtractionPipeline>()(
  "@beep/knowledge-server/ExtractionPipeline",
  {
    dependencies: [
      NlpService.Default,
      MentionExtractor.Default,
      EntityExtractor.Default,
      RelationExtractor.Default,
      Grounder.Default,
      OntologyService.Default,
    ],
    accessors: true,
    effect: Effect.gen(function* () {
      const nlp = yield* NlpService;
      const mentionExtractor = yield* MentionExtractor;
      const entityExtractor = yield* EntityExtractor;
      const relationExtractor = yield* RelationExtractor;
      const grounder = yield* Grounder;
      const ontology = yield* OntologyService;

      return {
        extract: (text: string, config: ExtractionConfig) =>
          Effect.gen(function* () {
            // Load ontology context
            const ontologyContext = yield* ontology.loadFromTurtle(config.ontologyTurtle);

            // Phase 1: Chunk
            const chunks = yield* nlp.chunkText(text, config.chunking);

            // Phase 2-6: Process chunks in parallel with bounded concurrency
            const graphFragments = yield* Stream.fromIterable(chunks).pipe(
              Stream.mapEffect(
                (chunk) => processChunk(chunk, ontologyContext),
                { concurrency: config.concurrency }
              ),
              Stream.runCollect
            );

            // Monoid merge
            return F.pipe(
              graphFragments,
              A.reduce(KnowledgeGraph.empty, mergeGraphs)
            );
          }),
      };
    }),
  }
) {}
```

### Checkpoint

Before proceeding to P3:
- [ ] All 6 extraction stages implemented
- [ ] Streaming works for large documents
- [ ] LLM outputs conform to ontology constraints
- [ ] Monoid merge produces correct results
- [ ] Tests for each stage in isolation
- [ ] Integration test for full pipeline

---

## Phase 3: Embedding & Grounding

**Duration**: 2-3 sessions
**Status**: Pending

### Objectives

1. Implement provider-agnostic embedding service
2. Store embeddings in pgvector
3. Implement similarity-based grounding
4. Filter relations by confidence threshold

### Tasks

#### Task 3.1: Embedding Service

```typescript
// @beep/knowledge-server/src/services/EmbeddingService.ts
export class EmbeddingService extends Effect.Service<EmbeddingService>()(
  "@beep/knowledge-server/EmbeddingService",
  {
    dependencies: [EmbeddingProvider.Default, EmbeddingRepo.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const provider = yield* EmbeddingProvider;
      const repo = yield* EmbeddingRepo;

      return {
        embed: (text: string, taskType: TaskType) =>
          Effect.gen(function* () {
            // Check cache first
            const cacheKey = yield* computeCacheKey(text, provider.config);
            const cached = yield* repo.findByCacheKey(cacheKey);
            if (O.isSome(cached)) return cached.value.vector;

            // Generate and cache
            const vector = yield* provider.embed(text, taskType);
            yield* repo.insert({ cacheKey, vector, ...provider.config });
            return vector;
          }),

        embedBatch: (texts: string[], taskType: TaskType) =>
          Effect.gen(function* () {
            // Automatic batching via Effect Request API
          }),
      };
    }),
  }
) {}
```

#### Task 3.2: Grounder Service

```typescript
// @beep/knowledge-server/src/services/Grounder.ts
const CONFIDENCE_THRESHOLD = 0.8;

export class Grounder extends Effect.Service<Grounder>()(
  "@beep/knowledge-server/Grounder",
  {
    dependencies: [EmbeddingService.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const embedding = yield* EmbeddingService;

      return {
        ground: (relations: Relation[], sourceText: string) =>
          Effect.gen(function* () {
            const textEmbedding = yield* embedding.embed(sourceText, "search_document");

            return yield* F.pipe(
              relations,
              A.filterMap((relation) =>
                Effect.gen(function* () {
                  // Embed the relation as a natural language statement
                  const statement = relationToStatement(relation);
                  const statementEmbedding = yield* embedding.embed(statement, "search_query");

                  // Cosine similarity
                  const similarity = cosineSimilarity(textEmbedding, statementEmbedding);

                  if (similarity >= CONFIDENCE_THRESHOLD) {
                    return O.some({ ...relation, confidence: similarity });
                  }
                  return O.none();
                })
              ),
              Effect.all
            );
          }),
      };
    }),
  }
) {}
```

### Checkpoint

Before proceeding to P4:
- [ ] pgvector queries work correctly
- [ ] Embedding caching reduces API calls
- [ ] Grounding filters hallucinated relations
- [ ] Similarity threshold is configurable
- [ ] Performance: <100ms for 10K entity search

---

## Phase 4: Entity Resolution

**Duration**: 2-3 sessions
**Status**: Pending

### Objectives

1. Implement similarity-based entity clustering
2. Select canonical entity per cluster
3. Maintain `owl:sameAs` links for provenance
4. Handle cross-source entity matching

### Tasks

(Detailed in HANDOFF_P4.md after P3 completion)

---

## Phase 5: GraphRAG

**Duration**: 2-3 sessions
**Status**: Pending

### Objectives

1. Implement k-NN entity search
2. N-hop subgraph traversal
3. RRF scoring for relevance ranking
4. Context formatting for agents

### Tasks

(Detailed in HANDOFF_P5.md after P4 completion)

---

## Phase 6: Todox Integration

**Duration**: 3-4 sessions
**Status**: Pending

### Objectives

1. Email extraction pipeline
2. Client knowledge graph assembly
3. Agent context integration
4. Real-time extraction triggers

### Tasks

(Detailed in HANDOFF_P6.md after P5 completion)

---

## Phase 7: UI Components

**Duration**: 2-3 sessions
**Status**: Pending

### Objectives

1. Knowledge graph viewer component
2. Entity inspector panel
3. Relation explorer
4. Extraction progress indicator

### Tasks

(Detailed in HANDOFF_P7.md after P6 completion)

---

## Cross-Phase Considerations

### Effect Patterns (Mandatory)

All code must follow `.claude/rules/effect-patterns.md`:

```typescript
// REQUIRED: Namespace imports
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as F from "effect/Function";

// REQUIRED: Effect.gen for async operations
const result = yield* Effect.gen(function* () {
  const data = yield* someEffect;
  return data;
});

// REQUIRED: Effect.Service for all services
export class MyService extends Effect.Service<MyService>()(
  "@beep/knowledge-server/MyService",
  {
    dependencies: [...],
    accessors: true,
    effect: Effect.gen(function* () { ... }),
  }
) {}
```

### Testing Requirements

Each phase must include tests:
- Unit tests for domain logic
- Integration tests for services
- Property-based tests for monoid laws
- E2E tests for critical flows

Use `@beep/testkit` patterns.

### Documentation Requirements

Each phase updates:
- AGENTS.md in affected packages
- REFLECTION_LOG.md with learnings
- HANDOFF_P[N+1].md for next phase

---

## Iteration Protocol

After each phase:

1. **Verify** - Run `bun run check` and `bun run test`
2. **Reflect** - Update REFLECTION_LOG.md
3. **Handoff** - Create HANDOFF_P[N+1].md
4. **Review** - Run `architecture-pattern-enforcer` if structure changed
