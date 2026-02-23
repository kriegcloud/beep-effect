# Phase 4 Handoff: Semantic Enrichment

**Date**: 2026-02-05
**From**: Phase 1 (Research - Complete)
**To**: Phase 4 (Semantic Enrichment)
**Status**: Ready for implementation (independent of Phases 2-3)
**Git Ref**: `0340358f49` (main, 2026-02-05)

---

## Mission

Add SHACL validation, complete reasoning profiles with OWL rules, and fill the SPARQL DESCRIBE gap. Builds on existing SPARQL, Reasoning, and RDF infrastructure.

**Roadmap Reference**: `outputs/IMPLEMENTATION_ROADMAP.md` Phase 3 (Weeks 9-11)
**Gaps Addressed**: #4 (SHACL Validation), #5 (SPARQL DESCRIBE), #8 (Reasoning Profiles), #9 (OWL Rules)

---

## Context Budget Status

| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| Direct tool calls | 0-10 | 11-15 | 16+ |
| Large file reads (>200 lines) | 0-2 | 3-4 | 5+ |
| Sub-agent delegations | 0-5 | 6-8 | 9+ |

**Phase 4 Budget**: Starting fresh. After 4A (SHACL), consider checkpoint if tool calls >15.

---

## Working Context (~250 tokens)

**Current task**: Add semantic enrichment to the knowledge slice.

**Success criteria**:
- [ ] SHACL shapes auto-generated from ontology `rdfs:domain`, `rdfs:range`, cardinality
- [ ] Validation detects missing required properties, wrong cardinality, incorrect types
- [ ] Policy-based control: warn/reject/ignore per shape severity
- [ ] `profile: "rdfs-subclass"` applies only rdfs9 + rdfs11
- [ ] `profile: "rdfs-full"` matches current default behavior exactly
- [ ] Custom rule arrays accepted via `profile: "custom"`
- [ ] owl:sameAs produces symmetric + transitive closure
- [ ] owl:inverseOf generates inverse triples
- [ ] `DESCRIBE <iri>` returns all triples about that entity
- [ ] Type check passes (`bun run check --filter @beep/knowledge-server`)
- [ ] Lint passes (`bun run lint:fix --filter @beep/knowledge-server`)
- [ ] Tests pass (`bun test packages/knowledge/server/test/Validation/ test/Reasoning/ test/Sparql/`)
- [ ] `REFLECTION_LOG.md` updated

**Blocking issues**: None. Independent of Phases 2-3.

---

## Episodic Context (~200 tokens)

### Phase 1 Summary
Research found substantial semantic infrastructure already implemented:

| Subsystem | Parity | Missing |
|-----------|--------|---------|
| SPARQL | 5/6 | DESCRIBE |
| Reasoning | 3/5 | Profiles, OWL |
| RDF | 3/4 | Named Graphs (Phase 5) |

This phase fills the remaining SPARQL + Reasoning gaps.

---

## Semantic Context (~150 tokens)

**Knowledge slice**: `packages/knowledge/{domain,server}`

**Services to extend** (see `outputs/CONTEXT_DOCUMENT.md` for full patterns):
- `server/src/Reasoning/ForwardChainer.ts` -- add profile + OWL rules
- `server/src/Sparql/QueryExecutor.ts` -- add DESCRIBE
- `server/src/Ontology/OntologyService.ts` -- generate SHACL shapes

**External deps**: `shacl-engine` (pure JS, N3.Store compatible), `sparqljs` (already in use)

---

## Dependency Verification

| Service | Capability | Source File | Verified (P1) |
|---------|------------|-------------|---------------|
| ForwardChainer | RDFS rules | `server/src/Reasoning/ForwardChainer.ts` | Y |
| QueryExecutor | SELECT/CONSTRUCT/ASK | `server/src/Sparql/QueryExecutor.ts` | Y |
| RdfStoreService | N3.Store wrapper | `server/src/Rdf/RdfStoreService.ts` | Y |
| OntologyService | Ontology loading | `server/src/Ontology/OntologyService.ts` | Y |
| SameAsLinker | owl:sameAs generation | `server/src/EntityResolution/SameAsLinker.ts` | Y |

---

## Phase 4 Sub-Tasks

### 4A. SHACL Validation (Gap #4) -- Days 1-8

**Priority**: P1 | **Complexity**: L | **Estimate**: 1.5 weeks

**Files to Create**:
```
server/src/Validation/{index.ts, ShaclService.ts, ShaclParser.ts, ShapeGenerator.ts, ValidationReport.ts}
domain/src/value-objects/{shacl-policy.value.ts, validation-report.value.ts}
```

**Files to Modify**:
```
server/src/Extraction/GraphAssembler.ts     # Optional validation gate
server/src/Ontology/OntologyService.ts      # Generate shapes from ontology
```

**Key constraints**: Re-SHACL pattern (rdfs-subclass inference before validation). Shapes cached via content hashing.

---

### 4B. Reasoning Profiles (Gap #8) -- Days 9-10

**Priority**: P1 | **Complexity**: S | **Estimate**: 1.5 days

**Files to Modify**: `server/src/Reasoning/ForwardChainer.ts`, `server/src/Reasoning/ReasonerService.ts`
**Files to Create**: `domain/src/value-objects/reasoning/ReasoningProfile.ts`

**Profiles**: `rdfs-full` | `rdfs-subclass` | `rdfs-domain-range` | `owl-sameas` | `owl-full` | `custom`

---

### 4C. OWL Rules (Gap #9) -- Days 11-13

**Priority**: P1 | **Complexity**: S-M | **Estimate**: 2.5 days

**Files to Create**: `server/src/Reasoning/OwlRules.ts`
**Files to Modify**: `server/src/Reasoning/ForwardChainer.ts`, `server/src/Reasoning/ReasonerService.ts`

**Rules**: sameAs-symmetry, sameAs-transitivity, sameAs-property-propagation, inverseOf, transitiveProperty, symmetricProperty

**Constraint**: Configurable max inference depth to prevent explosion from sameAs-property-propagation.

---

### 4D. SPARQL DESCRIBE (Gap #5) -- Day 14

**Priority**: P1 | **Complexity**: S | **Estimate**: 1 day

**Files to Modify**: `server/src/Sparql/QueryExecutor.ts`, `server/src/Sparql/SparqlService.ts`

**Implementation**: DESCRIBE = CONSTRUCT of all triples where IRI appears as subject or object. sparqljs already parses DESCRIBE.

---

## Procedural Context

- Effect patterns: `.claude/rules/effect-patterns.md`
- Testing: `.claude/commands/patterns/effect-testing-patterns.md`
- Roadmap: `outputs/IMPLEMENTATION_ROADMAP.md` Phase 3 section
- Context: `outputs/CONTEXT_DOCUMENT.md`

---

## Known Issues & Gotchas

1. **SHACL engine selection**: Prototype both `shacl-engine` and `rdf-validate-shacl` for N3.Store compatibility.
2. **OWL inference explosion**: sameAs-property-propagation generates many triples. Configurable max depth required.
3. **Profile backward compat**: `profile: "rdfs-full"` MUST match current default behavior exactly.
4. **DESCRIBE targets**: Handle both explicit IRIs and variable-bound targets from sparqljs.
5. **Pre-existing test failures**: 32 in PromptTemplates, 2 type errors in TestLayers.ts / GmailExtractionAdapter.test.ts. Unrelated to Phase 4 work.

---

## Context Budget Verification

- [ ] Working context <= 2,000 tokens (PASS: ~250)
- [ ] Episodic context <= 1,000 tokens (PASS: ~200)
- [ ] Semantic context <= 500 tokens (PASS: ~150)
- [ ] Procedural context uses links (PASS)
- [ ] Total <= 4,000 tokens (PASS: ~850 handoff + ~700 procedural links = ~1,550 estimated)

---

## Verification

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint:fix --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Validation/
bun test packages/knowledge/server/test/Reasoning/
bun test packages/knowledge/server/test/Sparql/
```

---

## Next Phase

After Phase 4:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P5.md` (context document)
3. Create `handoffs/P5_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)
4. Phase 5 (Infrastructure Polish) can proceed
5. Consider SHACL + batch state machine integration if Phase 3 complete
