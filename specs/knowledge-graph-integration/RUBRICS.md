# Rubrics: Knowledge Graph Integration

> Evaluation criteria for each phase of the knowledge graph integration spec.

---

## Scoring Guide

Each criterion is scored on a 0-3 scale:

| Score | Meaning |
|-------|---------|
| **3** | Fully met - No issues, production ready |
| **2** | Partially met - Minor issues, needs polish |
| **1** | Minimally met - Major gaps, needs rework |
| **0** | Not met - Absent or completely broken |

**Phase Pass Threshold**: Average score >= 2.5 and no individual criterion below 2.

---

## Phase 0: Foundation

### P0.1 Package Structure (Weight: High)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Directories created** | All 5 packages exist: domain, tables, server, client, ui | /3 |
| **Package.json valid** | Dependencies, main, exports configured correctly | /3 |
| **tsconfig.json valid** | Extends base config, correct paths | /3 |
| **Path aliases work** | `@beep/knowledge-*` resolves correctly | /3 |
| **Layer order correct** | domain -> tables -> server -> client -> ui | /3 |

**Verification**:
```bash
ls packages/knowledge/*/package.json
bun run check --filter @beep/knowledge-*
```

### P0.2 Domain Models (Weight: High)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Entity schema** | Complete with all required fields, branded ID | /3 |
| **Relation schema** | Subject/predicate/object with evidence | /3 |
| **KnowledgeGraph schema** | Contains entities and relations arrays | /3 |
| **EvidenceSpan schema** | Offset tracking, confidence, source URI | /3 |
| **Error types defined** | TaggedError for all failure modes | /3 |
| **Namespace imports** | Uses `import * as S from "effect/Schema"` | /3 |
| **No S.Any usage** | All nested structures fully typed | /3 |

**Verification**:
```typescript
// Should compile without errors
import { Entity, Relation, KnowledgeGraph } from "@beep/knowledge-domain";
```

### P0.3 Table Schemas (Weight: High)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **entities table** | All columns with correct types | /3 |
| **relations table** | Foreign keys, indexes defined | /3 |
| **extractions table** | Status tracking, source URI | /3 |
| **ontologies table** | Turtle content, versioning | /3 |
| **embeddings table** | pgvector column, HNSW index | /3 |
| **OrgTable.make usage** | All tables use multi-tenant factory | /3 |
| **Drizzle relations** | Foreign key relationships defined | /3 |

**Verification**:
```bash
bun run db:generate
# Should generate migration without errors
```

### P0.4 RLS Policies (Weight: Critical)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **All tables covered** | RLS enabled on 5 tables | /3 |
| **Tenant isolation** | Policy uses `current_setting('app.current_org_id')` | /3 |
| **Policy applies to all ops** | SELECT, INSERT, UPDATE, DELETE | /3 |
| **Migration file exists** | `001_knowledge_rls.sql` or equivalent | /3 |

**Verification**:
```sql
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename LIKE '%knowledge%';
```

### P0.5 pgvector Setup (Weight: Medium)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Extension enabled** | `CREATE EXTENSION vector` in migration | /3 |
| **Vector column defined** | Correct dimensions (1024 for Voyage) | /3 |
| **HNSW index created** | Cosine ops configured | /3 |

---

## Phase 1: Ontology Service

### P1.1 N3.js Integration (Weight: High)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Parser wrapper** | Effect-wrapped N3.Parser | /3 |
| **Store creation** | Proper quad storage | /3 |
| **Error handling** | Parse errors are typed Effect errors | /3 |
| **Resource cleanup** | Store properly scoped if needed | /3 |

### P1.2 Class Hierarchy (Weight: High)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **rdfs:subClassOf extraction** | Parent-child relationships captured | /3 |
| **Transitive closure** | Inheritance chain computed | /3 |
| **Cycle detection** | Handles malformed ontologies | /3 |
| **Root class identification** | Top-level classes identified | /3 |

### P1.3 Property Scoping (Weight: High)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **rdfs:domain extraction** | Property-class associations | /3 |
| **rdfs:range extraction** | Value type constraints | /3 |
| **Inheritance propagation** | Properties inherit to subclasses | /3 |
| **Multi-domain handling** | Union domains resolved | /3 |

### P1.4 KnowledgeIndex Monoid (Weight: Critical)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Associativity verified** | Property test passes | /3 |
| **Identity element** | Empty HashMap works correctly | /3 |
| **Merge semantics** | Property deduplication correct | /3 |
| **Topological fold** | DAG traversal in correct order | /3 |

**Verification**:
```bash
bun run test -t "monoid" --filter @beep/knowledge-domain
```

---

## Phase 2: Extraction Pipeline

### P2.1 NLP Service (Weight: Medium)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Sentence-aware chunking** | Preserves sentence boundaries | /3 |
| **Configurable overlap** | Overlap sentences work | /3 |
| **Offset tracking** | Character positions accurate | /3 |
| **Stream support** | Large documents don't OOM | /3 |

### P2.2 Mention Extraction (Weight: High)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **LLM integration** | @effect/ai generateObject works | /3 |
| **Schema validation** | Output conforms to MentionSchema | /3 |
| **Evidence spans** | Source text positions captured | /3 |
| **Retry logic** | Rate limits handled gracefully | /3 |

### P2.3 Entity Extraction (Weight: Critical)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Ontology guidance** | Prompt includes class definitions | /3 |
| **Type constraints** | Output limited to ontology classes | /3 |
| **Attribute extraction** | Properties captured per type | /3 |
| **Mention linking** | Entity linked to evidence spans | /3 |

### P2.4 Relation Extraction (Weight: Critical)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Property constraints** | Only valid predicates allowed | /3 |
| **Domain/range enforcement** | Subject/object types validated | /3 |
| **Evidence linking** | Relations linked to source text | /3 |
| **Confidence scoring** | LLM confidence captured | /3 |

### P2.5 Pipeline Orchestration (Weight: High)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **6-phase flow** | All stages execute in order | /3 |
| **Bounded concurrency** | Parallel chunk processing controlled | /3 |
| **Monoid merge** | Graph fragments combine correctly | /3 |
| **Error propagation** | Stage failures surface properly | /3 |
| **Progress tracking** | Extraction status reportable | /3 |

**Verification**:
```bash
bun run test --filter @beep/knowledge-server
# All extraction tests pass
```

---

## Phase 3: Embedding & Grounding

### P3.1 Embedding Service (Weight: High)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Provider abstraction** | Multiple providers supported | /3 |
| **Caching** | Cache key includes provider/model | /3 |
| **Batch API** | Multiple texts in single call | /3 |
| **Task type support** | search_query vs search_document | /3 |

### P3.2 pgvector Queries (Weight: High)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **k-NN search** | Top-k similar entities returned | /3 |
| **Cosine similarity** | Correct operator used | /3 |
| **RLS compatible** | Queries respect tenant isolation | /3 |
| **Performance** | <100ms for 10K entities | /3 |

### P3.3 Grounding Service (Weight: Critical)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Relation-to-statement** | Natural language conversion | /3 |
| **Similarity scoring** | Cosine similarity computed | /3 |
| **Threshold filtering** | Low-confidence relations removed | /3 |
| **Configurable threshold** | 0.8 default, adjustable | /3 |

---

## Phase 4: Entity Resolution

### P4.1 Clustering (Weight: High)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Similarity matrix** | Pairwise scores computed | /3 |
| **Threshold clustering** | Groups formed correctly | /3 |
| **Type consistency** | Only same-type entities clustered | /3 |
| **Scalability** | Handles 1000+ entities | /3 |

### P4.2 Canonical Selection (Weight: High)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Mention frequency** | Most common mention preferred | /3 |
| **Confidence weighting** | Higher confidence prioritized | /3 |
| **Attribute merging** | Combined attributes complete | /3 |
| **owl:sameAs links** | Provenance maintained | /3 |

---

## Phase 5: GraphRAG

### P5.1 Entity Search (Weight: High)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Query embedding** | Input text embedded | /3 |
| **k-NN retrieval** | Top-k entities returned | /3 |
| **Type filtering** | Optional class constraints | /3 |
| **Score thresholding** | Low relevance filtered | /3 |

### P5.2 Subgraph Traversal (Weight: Critical)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **N-hop expansion** | 1-hop, 2-hop configurable | /3 |
| **Bidirectional** | Both subject and object relations | /3 |
| **Cycle handling** | Visited tracking prevents loops | /3 |
| **Size limits** | Max nodes/edges enforced | /3 |

### P5.3 Context Assembly (Weight: High)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **RRF scoring** | Hybrid relevance ranking | /3 |
| **Token budgeting** | Context fits model limits | /3 |
| **Formatting** | Agent-consumable output | /3 |
| **Provenance** | Source URIs included | /3 |

---

## Phase 6: Todox Integration

### P6.1 Email Extraction (Weight: High)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Email parsing** | Subject, body, metadata | /3 |
| **Client detection** | Organization entities extracted | /3 |
| **Task extraction** | Action items identified | /3 |
| **Date parsing** | Temporal relations captured | /3 |

### P6.2 Knowledge Graph Assembly (Weight: High)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Per-client graphs** | Isolated knowledge per client | /3 |
| **Cross-email linking** | Same entities connected | /3 |
| **Incremental updates** | New emails merged correctly | /3 |
| **Resolution triggers** | Entity resolution on new data | /3 |

### P6.3 Agent Integration (Weight: Critical)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Context API** | GraphRAG accessible to agents | /3 |
| **Query interface** | Natural language to subgraph | /3 |
| **Real-time** | New extractions available quickly | /3 |
| **Accuracy** | Relevant context returned | /3 |

---

## Phase 7: UI Components

### P7.1 Graph Viewer (Weight: Medium)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Node rendering** | Entities displayed correctly | /3 |
| **Edge rendering** | Relations shown with labels | /3 |
| **Layout algorithm** | Readable graph arrangement | /3 |
| **Interaction** | Click, hover, zoom supported | /3 |

### P7.2 Entity Inspector (Weight: Medium)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Attribute display** | All properties shown | /3 |
| **Type hierarchy** | Class inheritance visible | /3 |
| **Evidence viewer** | Source text with highlights | /3 |
| **Related entities** | Navigation to neighbors | /3 |

### P7.3 Extraction Progress (Weight: Low)

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Stage indicator** | Current phase visible | /3 |
| **Progress bar** | Chunk completion shown | /3 |
| **Error display** | Failures communicated | /3 |
| **Cancel support** | Extraction stoppable | /3 |

---

## Cross-Phase Criteria

### Effect Patterns Compliance

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Namespace imports** | No default imports for Effect modules | /3 |
| **Effect.Service usage** | All services follow pattern | /3 |
| **accessors: true** | All services have static accessors | /3 |
| **No async/await** | Only Effect.gen with yield* | /3 |
| **Typed errors** | TaggedError for all failures | /3 |

### Testing Coverage

| Criterion | Description | Score |
|-----------|-------------|-------|
| **Unit tests** | Domain logic tested | /3 |
| **Integration tests** | Services tested with layers | /3 |
| **Property tests** | Monoid laws verified | /3 |
| **@beep/testkit usage** | Standard test patterns | /3 |

### Documentation

| Criterion | Description | Score |
|-----------|-------------|-------|
| **REFLECTION_LOG updated** | Learnings captured per phase | /3 |
| **Handoff files created** | Both HANDOFF and ORCHESTRATOR_PROMPT | /3 |
| **AGENTS.md per package** | Package-level guidance | /3 |
| **Code comments** | Complex logic explained | /3 |

---

## Evaluation Summary Template

```markdown
## Phase [N] Evaluation

**Date**: YYYY-MM-DD
**Evaluator**: [Agent/Human]

### Scores

| Section | Score | Max | Percentage |
|---------|-------|-----|------------|
| P[N].1  | X     | Y   | Z%         |
| P[N].2  | X     | Y   | Z%         |
| ...     | ...   | ... | ...        |
| **Total** | **X** | **Y** | **Z%** |

### Pass/Fail

- [ ] Average score >= 2.5: [PASS/FAIL]
- [ ] No criterion below 2: [PASS/FAIL]
- [ ] **Phase Status**: [PASS/FAIL]

### Issues Found

1. [Issue description and location]
2. [Issue description and location]

### Remediation Required

- [ ] [Action item 1]
- [ ] [Action item 2]
```

---

## Related Documentation

- [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) - Phase tasks
- [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) - Sub-agent prompts
- [REFLECTION_LOG.md](./REFLECTION_LOG.md) - Learnings
- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Code standards
