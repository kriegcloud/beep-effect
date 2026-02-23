# Phase 5 Handoff: Infrastructure Polish

**Date**: 2026-02-07
**From**: Phase 4 (Semantic Enrichment - Complete)
**To**: Phase 5 (Infrastructure Polish)
**Status**: Ready for implementation (independent of Phases 2-4, except 5B depends on 5A)
**Git Ref**: `working-tree` (phase-4 changes validated on 2026-02-07)

---

## Mission

Add named graph management, W3C PROV-O provenance, token budget enforcement, pre-composed Layer bundles, and NL-to-SPARQL translation. Enhancement-level gaps improving interoperability, cost control, DX, and accessibility.

**Roadmap Reference**: `outputs/IMPLEMENTATION_ROADMAP.md` Phase 4 (Weeks 12-14)
**Gaps Addressed**: #6 (Named Graphs), #7 (PROV-O), #13 (Token Budget), #14 (Layer Bundles), #15 (NL-to-SPARQL)

### Phase 4 Completion Snapshot
- SHACL validation service and policy/report VOs implemented.
- Reasoning profiles + OWL rules implemented (`rdfs-*`, `owl-*`, `custom`).
- SPARQL `DESCRIBE` implemented in parser, executor, and service dispatch.
- Validation/Reasoning/Sparql test suites passing.

---

## Context Budget Status

| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| Direct tool calls | 0-10 | 11-15 | 16+ |
| Large file reads (>200 lines) | 0-2 | 3-4 | 5+ |
| Sub-agent delegations | 0-5 | 6-8 | 9+ |

**Phase 5 Budget**: Starting fresh. If any metric enters Yellow Zone, create checkpoint before continuing.

---

## Working Context (~250 tokens)

**Current task**: Implement 5 independent infrastructure enhancements.

**Success criteria**:
- [ ] Named graphs: create, list, drop via API; GRAPH clause in SPARQL queries
- [ ] Extraction stores triples in per-extraction named graph (`urn:beep:extraction:<id>`)
- [ ] PROV-O Activity/Agent/wasGeneratedBy triples generated during extraction
- [ ] Provenance triples stored in `urn:beep:provenance` named graph
- [ ] Token usage tracked per stage with budget enforcement (warn at 80%, hard limit configurable)
- [ ] All Layer bundles compose without conflicts (`Layer.mergeAll` compiles)
- [ ] NL question generates syntactically valid SPARQL via LLM
- [ ] Generated SPARQL executes and returns correct results
- [ ] Parse errors trigger retry with feedback (max 3 attempts)
- [ ] Type check passes (`bun run check --filter @beep/knowledge-server`)
- [ ] Lint passes (`bun run lint:fix --filter @beep/knowledge-server`)
- [ ] Tests pass (`bun test packages/knowledge/server/test/Rdf/ test/Sparql/ test/Resilience/`)
- [ ] `REFLECTION_LOG.md` updated

**Blocking**: 5B (PROV-O) depends on 5A (Named Graphs). All others independent.

---

## Episodic Context (~200 tokens)

### Phase 1 Summary
Research identified 20 actionable gaps. This phase closes 5 P1-P2 infrastructure gaps. Previous phases close P0 workflow gaps (Phases 2-3) and P1 semantic gaps (Phase 4).

### Remaining After Phase 5
5 P3 gaps deferred: Content Enrichment, Document Classifier, Image Extraction, Curation Workflow, Wikidata Linking.

---

## Semantic Context (~100 tokens)

**Knowledge slice**: `packages/knowledge/{domain,server}`
**Tech stack**: N3.js (quads natively), @effect/ai, pgvector
**Namespaces**: RDF, RDFS, OWL, SKOS in `server/src/Ontology/constants.ts` (add PROV-O)

See `outputs/CONTEXT_DOCUMENT.md` for service details.

---

## Schema Shapes

New domain types to create:

```typescript
// domain/src/value-objects/rdf/NamedGraph.ts
export class NamedGraph extends S.Class<NamedGraph>("NamedGraph")({
  iri: S.String,
  created: BS.DateTimeUtcFromAllAcceptable,
  quadCount: S.Number,
}) {}

// domain/src/value-objects/rdf/ProvenanceVocabulary.ts
export class ProvActivity extends S.Class<ProvActivity>("ProvActivity")({
  iri: S.String,
  startedAtTime: BS.DateTimeUtcFromAllAcceptable,
  endedAtTime: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, { nullable: true }),
  wasAssociatedWith: S.String,
}) {}

// domain/src/value-objects/token-budget.value.ts
export class TokenBudget extends S.Class<TokenBudget>("TokenBudget")({
  stage: S.String,
  limit: S.Number,
  used: S.Number,
  policy: S.Literal("warn", "hard-limit"),
}) {}
```

---

## Phase 5 Sub-Tasks

### 5A. Named Graphs (Gap #6) -- Days 1-4

**Priority**: P1 | **Complexity**: M

**Files to Modify**: `server/src/Rdf/RdfStoreService.ts` (add graph API), `server/src/Sparql/QueryExecutor.ts` (GRAPH clause), `server/src/Sparql/FilterEvaluator.ts` (graph-scoped matching)
**Files to Create**: `domain/src/value-objects/rdf/NamedGraph.ts`

**Note**: N3.Store already supports quads. Use 4th component (graph) for named graph scoping.

---

### 5B. PROV-O Provenance (Gap #7) -- Days 5-8

**Priority**: P1 | **Complexity**: M | **Depends on**: 5A

**Files to Create**: `server/src/Rdf/{ProvOConstants.ts, ProvenanceEmitter.ts}`, `domain/src/value-objects/rdf/ProvenanceVocabulary.ts`
**Files to Modify**: `server/src/Extraction/ExtractionPipeline.ts`, `server/src/Extraction/GraphAssembler.ts`, `server/src/Ontology/constants.ts`

---

### 5C. Token Budget (Gap #13) -- Days 9-12

**Priority**: P2 | **Complexity**: M

**Files to Create**: `server/src/Resilience/TokenBudget.ts`, `domain/src/value-objects/token-budget.value.ts`
**Files to Modify**: `server/src/Extraction/{MentionExtractor,EntityExtractor,RelationExtractor}.ts`, `server/src/GraphRAG/GroundedAnswerGenerator.ts`

---

### 5D. Layer Bundles (Gap #14) -- Days 13-14

**Priority**: P2 | **Complexity**: S

**Files to Create**: `server/src/Runtime/ServiceBundles.ts`

**Bundles**: SemanticInfra, Extraction, GraphRAG, Resolution, LlmControl

---

### 5E. NL-to-SPARQL (Gap #15) -- Days 15-18

**Priority**: P2 | **Complexity**: M

**Files to Create**: `server/src/Sparql/{SparqlGenerator.ts, SparqlGeneratorPrompts.ts}`
**Files to Modify**: `server/src/GraphRAG/GraphRAGService.ts`

**Safety**: MUST reject UPDATE/INSERT/DELETE from LLM output. Read-only only. Execution timeout required.

---

## Parallelization

| Track A | Track B |
|---------|---------|
| 5A: Named Graphs (days 1-4) | 5C: Token Budget (days 1-4) |
| 5B: PROV-O (days 5-8) | 5D: Layer Bundles (days 5-6) |
| 5E: NL-to-SPARQL (days 9-12) | Buffer / Testing (days 7-12) |

---

## Procedural Context

- Effect patterns: `.claude/rules/effect-patterns.md`
- Testing: `.claude/commands/patterns/effect-testing-patterns.md`
- Roadmap: `outputs/IMPLEMENTATION_ROADMAP.md` Phase 4 section
- Context: `outputs/CONTEXT_DOCUMENT.md`

---

## Known Issues & Gotchas

1. **N3.Store quads**: Use graph component of quads for named graphs, not separate stores.
2. **PROV-O namespace**: Add `prov:` alongside existing RDF/RDFS/OWL/SKOS in `Ontology/constants.ts`.
3. **Token counting**: Use `@effect/ai` response metadata for post-call counts.
4. **NL-to-SPARQL safety**: Read-only queries only. Reject UPDATE/INSERT/DELETE. Add timeout.
5. **Layer bundles**: Test `Layer.mergeAll(BundleA, BundleB)` compiles without conflicts.
6. **Pre-existing test failures**: 32 in PromptTemplates, 2 type errors in TestLayers.ts / GmailExtractionAdapter.test.ts. Unrelated to Phase 5 work.

---

## Verification Checklist

| Sub-Task | Type Check | Tests Pass | Verified |
|----------|-----------|------------|----------|
| 5A: Named Graphs | [ ] | [ ] | [ ] |
| 5B: PROV-O | [ ] | [ ] | [ ] |
| 5C: Token Budget | [ ] | [ ] | [ ] |
| 5D: Layer Bundles | [ ] | [ ] | [ ] |
| 5E: NL-to-SPARQL | [ ] | [ ] | [ ] |

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint:fix --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Rdf/
bun test packages/knowledge/server/test/Sparql/
bun test packages/knowledge/server/test/Resilience/
```

---

## Context Budget Verification

- [ ] Working context <= 2,000 tokens (PASS: ~250)
- [ ] Episodic context <= 1,000 tokens (PASS: ~200)
- [ ] Semantic context <= 500 tokens (PASS: ~100)
- [ ] Procedural context uses links (PASS)
- [ ] Total <= 4,000 tokens (PASS: ~800 handoff + ~700 procedural links + ~800 schema shapes = ~2,300 estimated)

---

## Completion

After Phase 5:
1. Update `REFLECTION_LOG.md` with final learnings
2. All P0-P2 gaps from GAP_ANALYSIS.md are closed
3. Remaining 5 P3 gaps deferred to future specs
4. Consider `specs/knowledge-curation-workflow/` for human-in-the-loop review
