# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 (Extraction Pipeline) implementation.

---

## Prompt

You are implementing Phase 2 (Extraction Pipeline) of the Knowledge Graph Integration spec.

### Context

Phase 1 (Ontology Service) is complete. The knowledge slice now has:

- **OntologyParser**: N3.js-based Turtle parser wrapping callbacks in `Effect.async`
- **OntologyCache**: LRU cache with content-hash validation
- **OntologyService**: High-level API for loading, querying, and caching ontologies
- **OntologyContext**: In-memory lookup interface with `findClass`, `findProperty`, `getPropertiesForClass`, `isSubClassOf`, `getAncestors`
- **ClassDefinition/PropertyDefinition**: Domain models and database tables
- **Repos**: OntologyRepo, ClassDefinitionRepo, PropertyDefinitionRepo

### Your Mission

Implement the 6-stage streaming extraction pipeline:

1. **NlpService**: Sentence-aware text chunking with configurable overlap
2. **MentionExtractor**: LLM-powered entity mention detection
3. **EntityExtractor**: Ontology-guided entity type classification
4. **RelationExtractor**: Triple extraction with confidence scoring
5. **GraphAssembler**: Merge entities + relations into knowledge graph
6. **ExtractionPipeline**: Orchestrates all stages as Effect Stream

### Key Integration Point: OntologyContext

Load the ontology BEFORE extraction and pass context to extractors:

```typescript
import { OntologyService, OntologyContext } from "../Ontology/index.js";

// Load ontology once
const ontologyContext = yield* OntologyService.load("my-ontology", turtleContent);

// Pass to extractors for type validation
const entities = yield* EntityExtractor.extract(mentions, ontologyContext);

// Use context methods for validation
const validTypes = ontologyContext.classes.map(c => c.iri);
const isValid = ontologyContext.findClass(typeIri).pipe(O.isSome);
const applicableProps = ontologyContext.getPropertiesForClass(typeIri);
```

### Files to Create

```
packages/knowledge/server/src/Nlp/
├── NlpService.ts           # Text chunking
├── TextChunk.ts            # Chunk schema
└── index.ts

packages/knowledge/server/src/Extraction/
├── MentionExtractor.ts     # Stage 2
├── EntityExtractor.ts      # Stage 3 (uses OntologyContext)
├── RelationExtractor.ts    # Stage 4 (uses OntologyContext)
├── GraphAssembler.ts       # Stage 5
├── ExtractionPipeline.ts   # Orchestration
├── schemas/
│   ├── MentionOutput.ts    # LLM output schema
│   ├── EntityOutput.ts     # LLM output schema
│   └── RelationOutput.ts   # LLM output schema
└── index.ts

packages/knowledge/server/src/Ai/
├── AiService.ts            # @effect/ai wrapper
├── PromptTemplates.ts      # Extraction prompts
└── index.ts
```

### Critical Patterns

**NlpService with Stream**:
```typescript
export class NlpService extends Effect.Service<NlpService>()(
  "@beep/knowledge-server/NlpService",
  {
    accessors: true,
    effect: Effect.succeed({
      chunkText: (text: string, config: ChunkingConfig) =>
        Stream.fromIterable(splitIntoChunks(text, config)),
    }),
  }
) {}
```

**EntityExtractor with Ontology**:
```typescript
export class EntityExtractor extends Effect.Service<EntityExtractor>()(
  "@beep/knowledge-server/EntityExtractor",
  {
    dependencies: [AiService.Default],
    accessors: true,
    effect: Effect.gen(function* () {
      const ai = yield* AiService;

      return {
        extract: (mentions: Mention[], ontologyContext: OntologyContext) =>
          Effect.gen(function* () {
            // Build type options from ontology
            const typeOptions = ontologyContext.classes
              .map(c => `- ${c.iri}: ${c.label} - ${O.getOrElse(c.comment, () => "")}`)
              .join("\n");

            const result = yield* ai.generateObject({
              schema: EntityOutputSchema,
              prompt: buildEntityPrompt(mentions, typeOptions),
            });

            // Validate types against ontology
            return A.filter(result.entities, e =>
              ontologyContext.findClass(e.typeIri).pipe(O.isSome)
            );
          }),
      };
    }),
  }
) {}
```

**Structured Output Schema**:
```typescript
export class ExtractedEntity extends S.Class<ExtractedEntity>("ExtractedEntity")({
  mention: S.String,
  typeIri: S.String,
  confidence: S.Number,
  evidence: S.optional(S.String),
}) {}

export class EntityOutput extends S.Class<EntityOutput>("EntityOutput")({
  entities: S.Array(ExtractedEntity),
}) {}
```

### Dependencies to Add

```bash
cd packages/knowledge/server
bun add @effect/ai wink-nlp
```

### Verification

```bash
bun run check --filter="@beep/knowledge-*"
bun run test --filter="@beep/knowledge-*"
```

### Success Criteria

1. `NlpService.chunkText` correctly splits text preserving sentences
2. `MentionExtractor.extract` returns valid mention schemas
3. `EntityExtractor.extract` classifies mentions using ontology types
4. `RelationExtractor.extract` produces triples with valid predicate IRIs
5. `ExtractionPipeline.run` processes document through all 6 stages
6. All knowledge packages pass type checking

### Handoff Document

Full context available at: `specs/knowledge-graph-integration/handoffs/HANDOFF_P2.md`

### On Completion

1. Update `specs/knowledge-graph-integration/REFLECTION_LOG.md` with Phase 2 learnings
2. Create `handoffs/HANDOFF_P3.md` for Embedding & Grounding phase
3. Create `handoffs/P3_ORCHESTRATOR_PROMPT.md`
