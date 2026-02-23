# Phase 5 Orchestrator Prompt

> **Full Context:** [HANDOFF_P5.md](./HANDOFF_P5.md) | **Roadmap:** [IMPLEMENTATION_ROADMAP.md](../outputs/IMPLEMENTATION_ROADMAP.md)

Copy-paste this prompt to start Phase 5 implementation.

---

## Prompt

You are implementing Phase 5 of the `knowledge-ontology-comparison` spec: **Infrastructure Polish**.

### Context

Phase 1 (Research) and Phase 4 (Semantic Enrichment) are complete. This phase contains 5 independent sub-tasks (except 5B depends on 5A). Can run in parallel with Phases 2-3 or after them. All additive enhancements.

### Your Mission

| Sub-Task | Gap | Priority | Days | Deliverable |
|----------|-----|----------|------|-------------|
| 5A: Named Graphs | #6 | P1 | 1-4 | RdfStoreService graph API + GRAPH clause |
| 5B: PROV-O Provenance | #7 | P1 | 5-8 | ProvOConstants + ProvenanceEmitter (depends 5A) |
| 5C: Token Budget | #13 | P2 | 1-4 | TokenBudget service + extractor integrations |
| 5D: Layer Bundles | #14 | P2 | 5-6 | ServiceBundles.ts |
| 5E: NL-to-SPARQL | #15 | P2 | 7-10 | SparqlGenerator + prompts |

### Delegation Protocol

Orchestrator MUST delegate ALL implementation. If reading >3 reference files, delegate to `codebase-researcher`.

| Sub-Task | Delegate To | Est. Tool Calls | Expected Output |
|----------|-------------|-----------------|-----------------|
| 5A: Named graph API | `effect-code-writer` | ~10-12 | RdfStoreService mods + QueryExecutor mods + NamedGraph VO |
| 5B: PROV-O emitter | `effect-code-writer` | ~10-12 | ProvOConstants + ProvenanceEmitter + pipeline mods |
| 5C: Token budget | `effect-code-writer` | ~10-12 | TokenBudget.ts + extractor mods |
| 5D: Layer bundles | `effect-code-writer` | ~5-8 | ServiceBundles.ts |
| 5E: NL-to-SPARQL | `effect-code-writer` | ~10-15 | SparqlGenerator + prompts + GraphRAG integration |
| Domain VOs | `domain-modeler` | ~5-8 | NamedGraph.ts + ProvenanceVocabulary.ts + token-budget.value.ts |
| Tests | `test-writer` | ~10-15 | test/Rdf/ + test/Sparql/ + test/Resilience/ |
| Type fixes | `package-error-fixer` | ~5 | Compilation fixes |

**Parallelization**:
- Track A: 5A -> 5B -> 5E (sequential, 5B depends on 5A)
- Track B: 5C -> 5D (independent)

### Critical Patterns

**Pattern 1: Named Graph via N3.Quad**
```typescript
// N3.Store already supports quads. Use graph component:
const quad = new N3.Quad(subject, predicate, object, namedNode("urn:beep:extraction:abc123"));
store.addQuad(quad);
// Query within graph:
store.getQuads(null, null, null, namedNode("urn:beep:extraction:abc123"));
```

**Pattern 2: PROV-O Triple Generation**
```typescript
const provTriples = [
  new N3.Quad(activity, RDF.type, PROV.Activity, provGraph),
  new N3.Quad(activity, PROV.startedAtTime, literal(startTime), provGraph),
  new N3.Quad(entity, PROV.wasGeneratedBy, activity, provGraph),
];
```

**Pattern 3: Token Budget via Ref**
```typescript
export class TokenBudgetService extends Effect.Service<TokenBudgetService>()("TokenBudget", {
  effect: Effect.gen(function* () {
    const budgets = yield* Ref.make(new Map<string, { used: number; limit: number }>());
    return {
      recordUsage: (stage: string, tokens: number) =>
        Ref.update(budgets, (m) => { /* update + check limit */ }),
    };
  }),
}) {}
```

**Pattern 4: Layer Bundle Composition**
```typescript
export const SemanticInfraBundle = Layer.mergeAll(
  RdfStoreServiceLive, SerializerLive, SparqlServiceLive, ReasonerServiceLive,
);
```

### Critical Constraints

1. **N3.Store quads**: Use graph component for named graphs, not separate stores
2. **PROV-O namespace**: Add to existing `Ontology/constants.ts` alongside RDF/RDFS/OWL/SKOS
3. **NL-to-SPARQL safety**: MUST reject UPDATE/INSERT/DELETE. Read-only only. Execution timeout.
4. **Token counting**: Use `@effect/ai` response metadata for post-call accuracy
5. **Bundle composability**: Test `Layer.mergeAll(BundleA, BundleB)` compiles without service conflicts
6. **Effect patterns**: Namespace imports, tagged errors, Layer composition

### Context Budget Tracking

Monitor during Phase 5:
- After 5A (Named Graphs): If tool calls >10 or file reads >2, create checkpoint before 5B
- After 5B (PROV-O): If sub-agent delegations >5, create checkpoint before 5E
- Track B (5C, 5D): Smaller tasks, unlikely to hit Yellow Zone. Monitor delegations count.
- After each sub-task: Run `bun run check --filter @beep/knowledge-server 2>&1 | wc -l` to estimate error volume

### Reference Files

**CRITICAL**: If reading >3 files, delegate to `codebase-researcher`.

**RDF infrastructure**: `server/src/Rdf/RdfStoreService.ts`
**SPARQL**: `server/src/Sparql/{QueryExecutor,SparqlService,FilterEvaluator}.ts`
**Extraction pipeline**: `server/src/Extraction/{ExtractionPipeline,GraphAssembler}.ts`
**Ontology constants**: `server/src/Ontology/constants.ts`
**GraphRAG**: `server/src/GraphRAG/GraphRAGService.ts`
**Full context**: `outputs/CONTEXT_DOCUMENT.md`, `outputs/IMPLEMENTATION_ROADMAP.md` Phase 4

### Verification

After each sub-task:
```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint:fix --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Rdf/
bun test packages/knowledge/server/test/Sparql/
bun test packages/knowledge/server/test/Resilience/
```

### Success Criteria

- [ ] Named graphs: create, list, drop, query via GRAPH clause
- [ ] Extraction stores triples in per-extraction named graph
- [ ] PROV-O Activity/Agent/wasGeneratedBy triples generated during extraction
- [ ] Provenance triples in `urn:beep:provenance` named graph
- [ ] Token usage tracked per stage (warn at 80%, hard limit configurable)
- [ ] All Layer bundles compose without conflicts
- [ ] Test files use bundles instead of individual layer composition
- [ ] NL question generates syntactically valid SPARQL
- [ ] Generated SPARQL executes and returns correct results
- [ ] Parse errors trigger retry with feedback (max 3)
- [ ] NL-to-SPARQL rejects UPDATE/INSERT/DELETE (read-only)
- [ ] Type check passes
- [ ] Tests pass
- [ ] `REFLECTION_LOG.md` updated with final learnings

### Handoff Document

Read full context in: `specs/knowledge-ontology-comparison/handoffs/HANDOFF_P5.md`

### Completion

After Phase 5:
1. Update `REFLECTION_LOG.md` with final learnings
2. All P0-P2 gaps closed
3. Remaining 5 P3 gaps deferred to future specs
4. No further phases for this spec
