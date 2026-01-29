# Outputs

This directory holds phase artifacts and deliverables for the Knowledge Graph POC Demo specification.

## Directory Structure

| Directory | Purpose | Key Artifacts |
|-----------|---------|---------------|
| `phase-1-extraction/` | Entity extraction pipeline outputs | Extraction schemas, pipeline tests, entity samples |
| `phase-2-relations/` | Relation parsing deliverables | Relation schemas, parser implementation, test fixtures |
| `phase-3-graphrag/` | GraphRAG retrieval artifacts | Query interface specs, retrieval tests, demo queries |
| `phase-4-resolution/` | Entity resolution outputs | Resolution algorithms, SameAs link tests, merge strategies |
| `phase-5-polish/` | Final integration deliverables | API documentation, performance benchmarks, demo scripts |

## Naming Conventions

### File Naming

- **Implementation files**: `{feature}-{descriptor}.ts` (e.g., `extraction-pipeline.ts`)
- **Test files**: `{feature}.test.ts` (e.g., `extraction-pipeline.test.ts`)
- **Schema files**: `{entity}-schema.ts` (e.g., `entity-schema.ts`)
- **Documentation**: `{topic}-{type}.md` (e.g., `api-reference.md`)
- **Sample data**: `{entity}-samples.json` (e.g., `entity-samples.json`)

### Artifact Prefixes

- `IMPL_` - Implementation code
- `TEST_` - Test suites
- `DOC_` - Documentation
- `SAMPLE_` - Sample data/fixtures
- `BENCH_` - Performance benchmarks

## Phase Artifact Examples

### Phase 1: Entity Extraction
```
phase-1-extraction/
├── extraction-schema.ts
├── extraction-pipeline.ts
├── extraction-pipeline.test.ts
└── entity-samples.json
```

### Phase 2: Relation Parsing
```
phase-2-relations/
├── relation-schema.ts
├── relation-parser.ts
├── relation-parser.test.ts
└── relation-samples.json
```

### Phase 3: GraphRAG Retrieval
```
phase-3-graphrag/
├── query-interface.ts
├── retrieval-service.ts
├── retrieval-service.test.ts
└── demo-queries.json
```

### Phase 4: Entity Resolution
```
phase-4-resolution/
├── resolution-algorithm.ts
├── sameas-link-service.ts
├── resolution.test.ts
└── merge-strategies.md
```

### Phase 5: Polish and Demo
```
phase-5-polish/
├── api-reference.md
├── performance-benchmarks.md
├── demo-script.ts
└── integration.test.ts
```
