# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Effect Ontology is a functional, type-safe system for extracting structured knowledge graphs from unstructured text using ontology-guided LLM prompting. Built entirely with Effect-TS, it implements a mathematically rigorous pipeline based on topological catamorphism and monoid folding over OWL ontologies.

## Commands

### Development
```bash
bun install              # Install dependencies
bun run build            # Build @core-v2 package
bun run check            # TypeScript type checking
bun run test             # Run all tests (vitest)
bun run test:watch       # Run tests in watch mode
bun run lint             # ESLint across the repo
bun run lint-fix         # ESLint with auto-fix
```

### Running Tests

**IMPORTANT: Always use `bun run test`, never `bun test` directly.**

The project uses vitest configured in `vitest.config.ts`. Using `bun test` invokes Bun's built-in test runner which has different behavior and will produce incorrect results.

```bash
cd packages/@core-v2

# Full test suite (CORRECT)
bun run test

# Single file (CORRECT)
bun run test test/Service/Config.test.ts

# By test name pattern (CORRECT)
bun run test -t "test name pattern"

# Watch mode (CORRECT)
bun run test:watch

# Interactive UI (CORRECT)
bun run test:ui

# WRONG - Do NOT use these:
# bun test                    # Uses Bun's test runner, NOT vitest
# bun test test/...           # Wrong runner
```

### Server & Database
```bash
cd packages/@core-v2
bun run serve                  # Start extraction server
bun run serve:postgres         # Start with Postgres (uses .env.postgres)
bun run db:start               # Start Postgres via docker-compose
bun run db:stop                # Stop Postgres
bun run db:psql                # Connect to Postgres shell
```

### Benchmarking
```bash
bun run benchmark:smoke        # Quick sanity check (10 samples)
bun run benchmark:quick        # Standard run (100 samples)
bun run benchmark:full         # Full benchmark (all samples)
```

### Infrastructure
```bash
cd infra
terraform init
terraform plan
terraform apply
```

## Architecture

### Monorepo Structure
```
packages/@core-v2/       # Main extraction framework
  src/
    Cluster/             # Distributed execution: ExtractionEntity, BackpressureHandler
    Contract/            # Progress streaming contracts
    Domain/              # Pure types, schemas, error definitions (no I/O)
      Error/             # Typed errors (Rdf, Llm, Ontology, Extraction, Workflow, Shacl)
      Model/             # Domain models (Entity, Ontology, BatchWorkflow, EntityResolution)
      Schema/            # API schemas (BatchRequest, BatchStatusResponse, Batch)
      Rdf/               # RDF constants and IRI utilities
    Prompt/              # Prompt construction and rendering (PromptGenerator, RuleSet)
    Runtime/             # Production layer composition, HTTP server, health checks
      Persistence/       # PostgreSQL workflow persistence
    Schema/              # Shared schema definitions (EntityFactory, RelationFactory)
    Service/             # Effect.Service classes with .Default layers
      LlmControl/        # Token budget, stage timeout, rate limiting
    Telemetry/           # OpenTelemetry attributes, tracing, metrics, cost calculator
    Utils/               # Common utilities (IRI, Text, Similarity, IdempotencyKey)
    Workflow/            # Composable business logic (StreamingExtraction, EntityResolution)
  test/                  # Mirrors src/ structure
  docs/                  # Architecture docs and Effect patterns reference
    architecture/        # System architecture, Effect patterns guide
    ontology_research/   # SOTA research on NLP, entity resolution, RDF
    plans/               # Implementation plans
tools/deploy/            # Deployment CLI
infra/                   # Terraform modules (GCP Cloud Run, Postgres, Storage)
ontologies/              # OWL ontology files (Turtle format)
docs/                    # Root-level Effect patterns and style guides
```

### Extraction Pipeline
```
Turtle RDF → Graph<NodeId> + OntologyContext
           → KnowledgeIndex (HashMap via monoid fold)
           → Enriched KnowledgeIndex (inheritance applied)
           → StructuredPrompt → Prompt String
           → LLM → KnowledgeGraph (JSON)
           → N3.Store (RDF quads)
           → ValidationReport + Turtle
```

### Key Services

**Core Services:**
- **ConfigService**: Effect Config-based configuration with LLM provider selection
- **StorageService**: Abstracted storage (GCS/Local/Memory) for documents and graphs
- **OntologyService**: Parses OWL/Turtle, builds dependency graphs, computes class hierarchies
- **RdfBuilder**: RDF parsing/serialization (N3.js) and graph construction

**Extraction Services:**
- **EntityExtractor/RelationExtractor**: LLM-based extraction using `@effect/ai`
- **Grounder**: Entity grounding/linking with embedding similarity
- **NlpService**: Text chunking, tokenization, entity mention detection (wink-nlp)
- **SimilarityScorer**: Embedding-based entity similarity scoring

**Orchestration:**
- **WorkflowOrchestrator**: High-level batch workflow API with durable persistence
- **BatchStateHub**: PubSub for real-time state changes
- **BatchStatePersistence**: State snapshots in storage

**LLM Control:**
- **TokenBudgetService**: Token allocation and tracking per stage
- **StageTimeoutService**: Per-stage timeout enforcement
- **LlmSemaphore**: Concurrency control for LLM calls
- **CircuitBreaker**: Failure protection for external services

See `packages/@core-v2/docs/architecture/system-architecture.md` for full service dependency graph.

### Layer Composition Pattern
Services follow Effect's `Effect.Service` pattern with `Default`/`DefaultWithoutDependencies`:
```typescript
// Small layer bundles, composed once
export const LlmInfra = Layer.mergeAll(LlmService.Default, NlpService.Default)
export const CoreServices = Layer.mergeAll(
  OntologyService.Default,
  RdfBuilder.Default
).pipe(Layer.provide(LlmInfra))
```

## Effect Patterns

### Service Definition
```typescript
export class MyService extends Effect.Service<MyService>()("MyService", {
  effect: Effect.gen(function* () {
    const dep = yield* SomeDependency
    return { method: (x) => Effect.succeed(x) }
  }),
  dependencies: [SomeDependency.Default],
  accessors: true  // Always enable for static accessors
})
```

### Testing with Layers
```typescript
import { it } from "@effect/vitest"
import { TestConfigProviderLayer } from "./setup.js"

it.effect("test name", () =>
  Effect.gen(function* () {
    const svc = yield* MyService
    // assertions
  }).pipe(
    Effect.provide(MyService.Default),
    Effect.provide(TestConfigProviderLayer)
  )
)
```

### Resource Safety
- Use `Effect.scoped` and `Effect.acquireRelease` for resources
- Services with cleanup needs use `scoped` mode in `Effect.Service`
- N3 stores, HTTP clients, and file handles must be scoped

### Error Handling
- Typed errors via `Data.TaggedError` or `Schema.TaggedError`
- Use `Effect.fail` and `Effect.mapError`, never `throw`
- All failure modes explicit in the `E` type parameter

## Configuration

Environment variables use Effect Config with nested paths (delimiter: `.`):

```bash
# LLM Provider (anthropic | openai | gemini | openrouter)
LLM.PROVIDER=anthropic
LLM.ANTHROPIC_API_KEY=sk-...
LLM.ANTHROPIC_MODEL=claude-haiku-4-5

# For browser (Vite)
VITE_LLM_PROVIDER=anthropic
VITE_LLM_ANTHROPIC_API_KEY=sk-...
```

Copy `.env.example` to `.env` and configure your LLM provider.

### Ontology Configuration

For extraction to correctly type entities, external vocabularies (FOAF, PROV-O, W3C ORG) must be loaded:

```bash
# Main ontology path (required) - must be absolute path for local storage
ONTOLOGY_PATH=/path/to/ontologies/seattle/seattle.ttl

# External vocabularies for owl:imports resolution (required for proper entity typing)
# Contains FOAF, PROV-O, W3C ORG, SKOS, OWL-Time bundled together
ONTOLOGY_EXTERNAL_VOCABS_PATH=/path/to/ontologies/external/merged-external.ttl

# Optional: ontology registry for multi-ontology support
ONTOLOGY_REGISTRY_PATH=registry.json
```

**Note**: Config keys are nested under `ONTOLOGY`, so env vars use the `ONTOLOGY_` prefix (e.g., `ONTOLOGY_PATH`, not just `PATH`).

Without `ONTOLOGY_EXTERNAL_VOCABS_PATH`, imported classes like `foaf:Person` and `prov:Activity` won't be available, causing entities to be misclassified.

## Test Configuration

Tests use a dedicated config provider in `test/setup.ts`:
```typescript
export const TestConfigProvider = ConfigProvider.fromMap(new Map([
  ["ONTOLOGY_PATH", "/tmp/test-ontology.ttl"],
  ["LLM_API_KEY", "test-key-for-testing"],
  ["LLM_PROVIDER", "anthropic"],
  // ...
]))
```

## Key Dependencies

- **effect** ^3.19.x - Core Effect runtime
- **@effect/ai**, **@effect/ai-anthropic**, **@effect/ai-openai**, **@effect/ai-google** - LLM integrations
- **@effect/platform-bun** - Bun runtime platform
- **@effect/workflow** - Durable workflow execution
- **@effect/vitest** - Effect-aware test utilities
- **n3** - RDF/Turtle parsing and serialization
- **wink-nlp** - NLP utilities for text processing
- **fast-check** - Property-based testing

## Documentation Reference

### Architecture & Design
- **System Architecture**: `packages/@core-v2/docs/architecture/system-architecture.md` - Component diagrams, workflow pipeline, service layer, data model, infrastructure
- **Effect Patterns Guide**: `packages/@core-v2/docs/architecture/effect-patterns-guide.md` - Comprehensive patterns for Effect-native services, templates, critical issues

### SOTA Research & Implementation
- **SOTA Review**: `packages/@core-v2/docs/ontology_research/sota_review.md` - State-of-the-art NLP/LLM extraction, entity resolution, RDF handling
- **Implementation Roadmap**: `packages/@core-v2/docs/ontology_research/synthesis_and_implementation_roadmap.md` - Prioritized implementation plan
- **Entity Resolution Research**: `packages/@core-v2/docs/ontology_research/entity_resolution_clustering_research.md`
- **SHACL/RDF Research**: `packages/@core-v2/docs/ontology_research/rdf_shacl_reasoning_research.md`

### Style & Patterns
- **Effect Module Style Guide**: `docs/EFFECT_MODULE_STYLE_GUIDE.md` - Module anatomy, documentation, naming, application patterns
- **Glossary**: `packages/@core-v2/docs/GLOSSARY.md` - Domain terminology quick reference

## Documentation & Research Procedures

Follow `.claude/DOC_PROCEDURE.md` and `.claude/RESEARCH_PROCEDURE.md` for repo organization.

### Quick Reference

**Documentation naming:**
- Reference docs: `TOPIC_QUALIFIER.md` (uppercase)
- Doc families: `{TOPIC}_INDEX.md`, `{TOPIC}_QUICKREF.md`, `{TOPIC}_SUMMARY.md`
- Dated plans: `YYYY-MM-DD-topic-slug.md`
- Research: `topic_area_research.md` (lowercase)

**When to archive:** Superseded docs, completed plans, delivery snapshots.
**Archive location:** `docs/archive/{category}-{YYYY-MM}/` with README.md

**Research workflow:** `CONDUCT → DOCUMENT → SYNTHESIZE → PLAN → TRACK → IMPLEMENT → UPDATE`

**Transition research to action when:**
- Gap is P0 (critical)
- Effort bounded (< 2 weeks)
- Dependencies met
- Evidence strong (multiple sources)

**Always update:** `packages/@core-v2/docs/INDEX.md` when adding/archiving docs.

## Style Guidelines

Follow `docs/EFFECT_MODULE_STYLE_GUIDE.md` and `packages/@core-v2/docs/architecture/effect-patterns-guide.md`:
- Public/internal module split
- `@since` and `@category` JSDoc on exports
- `TypeId` branding for domain types
- `dual` for data-first/data-last functions
- `Inspectable`/`toJSON` for debuggable types
- Use `Effect.Service` with `accessors: true` for all new services
- Define typed errors with `Schema.TaggedError` or `Data.TaggedError`
- Use `Layer.scoped` for resources that need cleanup
