# @beep/knowledge-domain — Agent Guide

## Purpose & Fit
- Domain layer for ontology-guided knowledge extraction, entity resolution, and GraphRAG context assembly.
- Provides pure, effect-free foundation schemas for knowledge graphs using topological catamorphism over OWL ontologies.
- Defines core types for extracting structured knowledge graphs from unstructured text using LLM prompting.
- Exposes monoid algebra (`KnowledgeIndexMonoid`) for parallel graph merging with associativity guarantees.

## Surface Map
- **Entities (`src/entities/`)**
  - `Embedding` — Vector embedding entity for semantic search, with `pgvector`-compatible schema and dimension constraints.
- **Value Objects (`src/value-objects/`)** — Immutable domain primitives for knowledge graph structures.
- **Schemas** — `Entity`, `Relation`, `KnowledgeGraph`, `EvidenceSpan` for extraction output typing.
- **Branded IDs** — `EntityId`, `RelationId`, `ExtractionId` for type-safe ID handling.

## Usage Snapshots
- `packages/knowledge/server/src/db/repos/` — Repository implementations reference domain entities.
- `packages/knowledge/tables/src/tables/` — Drizzle schemas mirror domain entity structures.
- `packages/_internal/db-admin/` — Migrations align with domain schema definitions.

## Authoring Guardrails
- ALWAYS namespace Effect imports (`import * as Effect from "effect/Effect"`, `import * as S from "effect/Schema"`).
- NEVER use native `.map`, `.filter`, or `for...of`; use Effect utilities (`A.map`, `A.filter`).
- Entity models MUST remain pure and infrastructure-agnostic—no database or HTTP dependencies.
- Use `@beep/schema` (`BS` helpers) for all schema definitions with proper optionality patterns.
- Branded IDs MUST use `S.String.pipe(S.brand("TypeName"))` for type safety.

## Quick Recipes
```ts
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { Embedding } from "@beep/knowledge-domain/entities";

// Decode embedding from external source
const decodeEmbedding = (data: unknown) =>
  Effect.gen(function* () {
    const embedding = yield* S.decodeUnknown(Embedding.Model)(data);
    yield* Effect.logInfo("embedding.decoded", { id: embedding.id });
    return embedding;
  });
```

## Verifications
- `bun run check --filter @beep/knowledge-domain`
- `bun run lint --filter @beep/knowledge-domain`
- `bun run test --filter @beep/knowledge-domain`

## Contributor Checklist
- [ ] Entity changes align with `@beep/knowledge-tables` schemas.
- [ ] Use `makeFields` for audit columns via `@beep/shared-domain`.
- [ ] Branded IDs registered in `@beep/shared-domain/entity-ids`.
- [ ] Re-run verification commands before submitting changes.
