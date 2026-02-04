# Effect Ontology

A functional, type-safe system for extracting structured knowledge graphs from unstructured text using ontology-guided LLM prompting. Built with Effect-TS, implementing a mathematically rigorous pipeline based on topological catamorphism and monoid folding.

## Mathematical Foundation

The system transforms OWL ontologies into LLM prompts via a **topological catamorphism** over a directed acyclic graph (DAG). The ontology is modeled as a dependency graph G = (V, E) where:

- **Vertices (V)**: OWL classes, identified by IRIs
- **Edges (E)**: `rdfs:subClassOf` relationships, oriented as Child → Parent
- **Context (Γ)**: A mapping from nodes to their data (labels, properties, comments)

The prompt generation is defined as a fold over this graph using an algebra α:

```
α: D × List<R> → R
```

where D is the node data domain and R is the result monoid. The algorithm processes nodes in topological order, ensuring dependencies (subclasses) are computed before dependents (superclasses).

**Result Monoid**: The system uses a `KnowledgeIndex` monoid (HashMap-based) rather than string concatenation. This enables:

- **Queryable structure**: O(1) lookup by IRI instead of linear search
- **Context pruning**: Focus operations select relevant classes without dumping entire ontology
- **Deferred rendering**: Structure is preserved until final prompt assembly

The monoid operation is HashMap union with custom merge semantics, satisfying associativity and identity laws required for correct folding.

## Why Effect

Effect provides the mathematical abstractions and type safety needed for this pipeline:

**Typed Error Channels**: The `E` channel in `Effect<A, E, R>` ensures all failure modes are explicit and composable. Graph cycles, missing nodes, LLM failures, and RDF parsing errors are tracked through the type system.

**Dependency Injection**: The `R` channel enables clean service composition via Layers. The extraction pipeline depends on `LlmService`, `RdfService`, and `ShaclService`, all provided through Effect's context system without global state or manual wiring.

**Structured Concurrency**: Effect's Fiber model provides cancellation and resource management. The extraction pipeline uses scoped services (PubSub) that automatically clean up when the Effect scope ends.

**Referential Transparency**: All operations are pure or explicitly effectful. The topological solver, algebra application, and prompt rendering are deterministic and testable without mocks.

## Architecture

The pipeline follows a three-phase architecture:

```
Turtle RDF
  ↓ [Graph/Builder]
Graph<NodeId> + OntologyContext
  ↓ [Prompt/Solver + knowledgeIndexAlgebra]
KnowledgeIndex (HashMap<IRI, KnowledgeUnit>)
  ↓ [Prompt/Enrichment]
Enriched KnowledgeIndex (with inherited properties)
  ↓ [Prompt/Render]
StructuredPrompt
  ↓ [Prompt/PromptDoc]
Prompt String
  ↓ [Services/Llm]
KnowledgeGraph (JSON)
  ↓ [Services/Rdf]
N3.Store (RDF quads)
  ↓ [Services/Shacl]
ValidationReport + Turtle
```

**Phase 1: Pure Fold** - The graph solver applies the algebra in topological order, building a raw `KnowledgeIndex` with class definitions and structure (parent/child relationships).

**Phase 2: Effectful Enrichment** - The `InheritanceService` computes effective properties (own + inherited) for each class. This is separate from the fold because inheritance flows downward (parent → child) while the fold processes upward (child → parent).

**Phase 3: Rendering** - The enriched index is rendered to a `StructuredPrompt`, then to a formatted string using `@effect/printer` for declarative document construction.

## Usage

### Basic Extraction

```typescript
import { ExtractionWorkflow, ExtractionWorkflowLive } from "@effect-ontology/core-v2"
import type { RunConfig } from "@effect-ontology/core-v2/Domain/Model/ExtractionRun"
import { Effect } from "effect"

const text = "Alice is a person who knows Bob. Bob works for Acme Corp."
const config: RunConfig = {
  ontologyPath: "./ontologies/foaf.ttl",
  concurrency: 4,
  chunking: {
    maxChunkSize: 800,
    preserveSentences: true
  }
}

const program = Effect.gen(function* () {
  const workflow = yield* ExtractionWorkflow
  return yield* workflow.extract(text, config)
}).pipe(
  Effect.provide(ExtractionWorkflowLive),
  Effect.scoped
)

const graph = await Effect.runPromise(program)
console.log(graph)
```

### Expected Output

**Input Text:**
```
Alice is a person who knows Bob. Bob works for Acme Corp.
```

**Generated Prompt (excerpt):**
```
SYSTEM INSTRUCTIONS

Class: Person
Properties:
  - name (string)
  - knows (Person)

Class: Organization
Properties:
  - name (string)

TASK
Extract knowledge graph from the following text:
Alice is a person who knows Bob. Bob works for Acme Corp.
```

**LLM Output (JSON):**
```json
{
  "entities": [
    {
      "@id": "_:person1",
      "@type": "http://xmlns.com/foaf/0.1/Person",
      "properties": [
        { "predicate": "http://xmlns.com/foaf/0.1/name", "object": "Alice" },
        { "predicate": "http://xmlns.com/foaf/0.1/knows", "object": { "@id": "_:person2" } }
      ]
    },
    {
      "@id": "_:person2",
      "@type": "http://xmlns.com/foaf/0.1/Person",
      "properties": [
        { "predicate": "http://xmlns.com/foaf/0.1/name", "object": "Bob" }
      ]
    },
    {
      "@id": "_:org1",
      "@type": "http://xmlns.com/foaf/0.1/Organization",
      "properties": [
        { "predicate": "http://xmlns.com/foaf/0.1/name", "object": "Acme Corp" }
      ]
    }
  ]
}
```

**Final RDF (Turtle):**
```turtle
_:person1 a foaf:Person ;
    foaf:name "Alice" ;
    foaf:knows _:person2 .

_:person2 a foaf:Person ;
    foaf:name "Bob" .

_:org1 a foaf:Organization ;
    foaf:name "Acme Corp" .
```

## LLM Integration

The system uses `@effect/ai`'s `LanguageModel.generateObject` for structured output generation. The schema is dynamically generated from the ontology vocabulary:

```typescript
const schema = makeKnowledgeGraphSchema(classIris, propertyIris)
```

This ensures the LLM can only emit entities with types and properties that exist in the ontology. The schema is a union of literal IRIs, providing type safety at both the schema level (Effect Schema validation) and the LLM level (structured output constraints).

The prompt is constructed from the `KnowledgeIndex`, which can be pruned using focus operations to reduce token usage. For example, if extracting only `Person` entities, the context can be limited to `Person` and its ancestors, excluding unrelated classes like `Vehicle` or `Document`.

## Project Structure

```
packages/@core-v2/src/
  Domain/      # Schemas, models, and error types
  Service/     # LLM, RDF, NLP, extraction, entity resolution services
  Workflow/    # StreamingExtraction, TwoStageExtraction, EntityResolutionGraph
  Runtime/     # Production layer composition (tracing, rate limits, caches)
  Telemetry/   # OpenTelemetry attributes/exporters
  Prompt/      # Prompt helpers and renderers
  Schema/      # Shared schema definitions
  Utils/       # Common utilities
```

## Testing

The codebase includes property-based tests verifying monoid laws, topological ordering guarantees, and inheritance correctness. All tests use Effect's test layer pattern for dependency injection.

## Tracing

OpenTelemetry tracing can be enabled to capture LLM call metrics and performance insights:

```bash
# Enable tracing (default: true)
export TRACING_ENABLED=true

# Jaeger endpoint (default: http://localhost:14268/api/traces)
export JAEGER_ENDPOINT=http://localhost:14268/api/traces
```

### Running Jaeger Locally

To visualize traces, run Jaeger using Docker:

```bash
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 14268:14268 \
  jaegertracing/all-in-one:latest
```

Then view traces at **http://localhost:16686**

### What Gets Traced

The extraction pipeline automatically annotates spans with:

- **LLM Provider**: Model name and provider (Anthropic, OpenAI, Google, etc.)
- **Token Usage**: Input/output token counts for cost tracking
- **Estimated Cost**: Calculated cost in USD based on token usage
- **Extraction Metrics**: Entity and triple counts per extraction
- **Request Details**: Prompt text and response text (optional)

This enables:
- Performance debugging of LLM calls
- Cost attribution and billing
- Bottleneck identification
- Quality monitoring of extractions

### Disabling Tracing

To disable tracing:

```bash
export TRACING_ENABLED=false
```

Or omit the environment variable (tracing is enabled by default).

## References

- **Engineering Specification**: `docs/effect_ontology_engineering_spec.md` - Formal mathematical specification
- **Higher-Order Monoid**: `docs/higher_order_monoid_implementation.md` - KnowledgeIndex architecture
- **Effect Patterns**: `docs/effect-patterns/` - Idiomatic Effect-TS patterns used throughout
