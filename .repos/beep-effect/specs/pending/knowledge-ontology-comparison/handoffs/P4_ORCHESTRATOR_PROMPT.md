# Phase 4 Orchestrator Prompt

> **Full Context:** [HANDOFF_P4.md](./HANDOFF_P4.md) | **Roadmap:** [IMPLEMENTATION_ROADMAP.md](../outputs/IMPLEMENTATION_ROADMAP.md)

Copy-paste this prompt to start Phase 4 implementation.

---

## Prompt

You are implementing Phase 4 of the `knowledge-ontology-comparison` spec: **Semantic Enrichment**.

### Context

Phase 1 (Research) is complete. This phase is **independent of Phases 2-3** and can run in parallel. It extends existing SPARQL, Reasoning, and RDF infrastructure.

### Your Mission

| Sub-Task | Gap | Priority | Days | Deliverable |
|----------|-----|----------|------|-------------|
| 4A: SHACL Validation | #4 | P1 | 1-8 | ShaclService + ShapeGenerator + policy VOs |
| 4B: Reasoning Profiles | #8 | P1 | 9-10 | Profile -> rule set mapping in ForwardChainer |
| 4C: OWL Rules | #9 | P1 | 11-13 | OwlRules.ts + ForwardChainer registration |
| 4D: SPARQL DESCRIBE | #5 | P1 | 14 | executeDescribe in QueryExecutor |

### Delegation Protocol

Orchestrator MUST delegate ALL implementation. If reading >3 reference files, delegate to `codebase-researcher`.

| Sub-Task | Delegate To | Est. Tool Calls | Expected Output |
|----------|-------------|-----------------|-----------------|
| Research shacl-engine compatibility | `web-researcher` | ~8-10 | Compatibility report |
| 4A: SHACL validation service | `effect-code-writer` | ~15-20 | 5 server files + 2 domain VOs |
| 4B: Reasoning profiles | `effect-code-writer` | ~8-10 | ForwardChainer + ReasonerService mods + ReasoningProfile VO |
| 4C: OWL rules | `effect-code-writer` | ~10-12 | OwlRules.ts + ForwardChainer/ReasonerService mods |
| 4D: SPARQL DESCRIBE | `effect-code-writer` | ~5-8 | QueryExecutor + SparqlService mods |
| Tests for all | `test-writer` | ~10-15 | test/Validation/ + test/Reasoning/ + test/Sparql/ |
| Type fixes | `package-error-fixer` | ~5 | Compilation fixes |

**Sequencing**: 4A independent. 4B before 4C (profiles needed for OWL profile names). 4D independent.

### Critical Patterns

**Pattern 1: Effect.Service with N3.Store**
```typescript
export class ShaclService extends Effect.Service<ShaclService>()("ShaclService", {
  effect: Effect.gen(function* () {
    const rdf = yield* RdfStoreService;
    const ontology = yield* OntologyService;
    return {
      validate: (graph: N3.Store, policy: ShaclPolicy) =>
        Effect.gen(function* () { /* ... */ }),
    };
  }),
  dependencies: [RdfStoreServiceLive, OntologyServiceLive],
}) {}
```

**Pattern 2: Reasoning Profile as S.Literal Union**
```typescript
export const ReasoningProfile = S.Literal(
  "rdfs-full", "rdfs-subclass", "rdfs-domain-range",
  "owl-sameas", "owl-full", "custom"
);
export type ReasoningProfile = S.Schema.Type<typeof ReasoningProfile>;
```

**Pattern 3: Rule Registration in ForwardChainer**
```typescript
const rulesets: Record<string, ReadonlyArray<Rule>> = {
  "rdfs-full": [...rdfsRules],
  "rdfs-subclass": [rdfs9, rdfs11],
  "owl-sameas": [...owlSameAsRules],
  "owl-full": [...owlSameAsRules, ...owlPropertyRules],
};
```

### Critical Constraints

1. **SHACL + N3.Store**: Must work with existing N3.Store (no format conversion)
2. **Re-SHACL pattern**: Apply `rdfs-subclass` inference BEFORE SHACL validation
3. **Backward compat**: `profile: "rdfs-full"` = current default ForwardChainer behavior
4. **OWL inference limits**: Configurable max depth to prevent explosion
5. **Effect patterns**: Namespace imports, tagged errors, Layer composition

### Reference Files

**CRITICAL**: If reading >3 files, delegate to `codebase-researcher`.

**Reasoning** (to extend):
- `server/src/Reasoning/ForwardChainer.ts` -- add profiles + OWL
- `server/src/Reasoning/RdfsRules.ts` -- existing rule definitions

**SPARQL** (to extend):
- `server/src/Sparql/QueryExecutor.ts` -- add DESCRIBE
- `server/src/Sparql/SparqlService.ts` -- add dispatch

**Ontology** (for shape generation):
- `server/src/Ontology/OntologyService.ts`

**Full context**: `outputs/CONTEXT_DOCUMENT.md`, `outputs/IMPLEMENTATION_ROADMAP.md` Phase 3

### Context Budget Tracking

Monitor during Phase 4:
- After 4A (SHACL): Create checkpoint if tool calls >12 or file reads >3 (4A is largest sub-task)
- After 4C (OWL): Create checkpoint if sub-agent delegations >6 (4C adds rules + modifies ForwardChainer)
- After each sub-task: Run `bun run check --filter @beep/knowledge-server 2>&1 | wc -l` to estimate error volume before delegating fixes

### Verification

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint:fix --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Validation/
bun test packages/knowledge/server/test/Reasoning/
bun test packages/knowledge/server/test/Sparql/
```

### Success Criteria

- [ ] SHACL shapes auto-generated from ontology property definitions
- [ ] Validation detects missing required properties, wrong cardinality, incorrect types
- [ ] Policy-based control: warn/reject/ignore per shape severity
- [ ] `profile: "rdfs-subclass"` applies only rdfs9 + rdfs11
- [ ] `profile: "rdfs-full"` matches current behavior exactly
- [ ] Custom rule arrays accepted via `profile: "custom"`
- [ ] owl:sameAs links produce symmetric + transitive closure
- [ ] owl:inverseOf generates inverse triples
- [ ] owl:TransitiveProperty generates transitive closure
- [ ] `DESCRIBE <iri>` returns all triples about that entity
- [ ] Type check passes
- [ ] Tests pass
- [ ] `REFLECTION_LOG.md` updated

### Handoff Document

Read full context in: `specs/knowledge-ontology-comparison/handoffs/HANDOFF_P4.md`

### Next Phase

After Phase 4:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P5.md` (context document)
3. Create `handoffs/P5_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)
4. Phase 5 (Infrastructure Polish) can proceed. Consider SHACL + batch integration if Phase 3 is done.
