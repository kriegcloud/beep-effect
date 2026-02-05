# Reflection Log

> Cumulative learnings from the knowledge-ontology-comparison spec execution.

---

## Entry 1: Spec Creation (2026-01-29)

### Phase
Scaffolding (Phase 0)

### What Was Done
- Created spec structure at `specs/knowledge-ontology-comparison/`
- Wrote README.md with purpose, goals, non-goals, and success criteria
- Created COMPARISON_INSTRUCTIONS.md with detailed methodology
- Created AGENT_PROMPT.md with copy-paste ready prompt
- Created placeholder output files in `outputs/`
- Established this REFLECTION_LOG.md

### Key Decisions

1. **Spec Type**: Research/analysis only (no code changes)
   - Rationale: Comparison must be complete before implementation planning
   - Alternative considered: Combined comparison + implementation spec
   - Chosen approach allows thorough analysis without rushing to implementation

2. **Deliverable Structure**: Four separate documents
   - COMPARISON_MATRIX.md: Raw comparison data
   - GAP_ANALYSIS.md: Prioritized findings
   - IMPLEMENTATION_ROADMAP.md: Phased plan
   - CONTEXT_DOCUMENT.md: Full context for future spec
   - Rationale: Separation of concerns, each document serves different audience

3. **Priority Definitions**: P0-P3 scale
   - P0: Critical for core functionality
   - P1: Important for production use
   - P2: Nice to have
   - P3: Future consideration
   - Rationale: Aligns with existing beep-effect priority conventions

4. **Complexity Definitions**: S/M/L/XL scale
   - S: 1-2 days
   - M: 3-5 days
   - L: 1-2 weeks
   - XL: 2+ weeks
   - Rationale: T-shirt sizing is familiar and avoids false precision

### Context from Prior Research

Based on user-provided research, the following key gaps are expected:

**effect-ontology Has (that knowledge slice lacks)**:
- SPARQL support via Oxigraph WASM
- RDFS forward-chaining reasoning
- SHACL shape-based validation
- Two-tier entity resolution architecture
- @effect/workflow durable execution
- Multi-hop GraphRAG with citations
- 60+ Effect services

**knowledge slice Has**:
- Domain models (Entity, Relation, Ontology)
- Database tables with pgvector
- 6-stage extraction pipeline
- Entity clustering via embeddings
- GraphRAG with RRF scoring
- N3.js Turtle parsing
- SKOS vocabulary support

**Known Incomplete**:
- @beep/knowledge-client: Placeholder only
- @beep/knowledge-ui: Placeholder only
- Uses custom AiService (should be @effect/ai)

### Questions for Next Phase

1. What is the actual service count in effect-ontology? (claimed 60+)
2. Is Oxigraph WASM suitable for production use or development only?
3. What @effect/workflow patterns are used and do they apply to our use case?
4. Are there effect-ontology services we explicitly should NOT port?

### Pattern Candidates

None yet - this is scaffolding phase.

### Recommendations for Future Phases

1. **Start with catalog**: Before analyzing gaps, completely catalog effect-ontology
2. **Verify file paths**: Claims from research may be outdated, verify with Glob
3. **Consider domain fit**: effect-ontology may have features not relevant to wealth management
4. **Check @beep/shared-***: Some "missing" features may exist in shared packages

---

## Entry 2: Research Completion (2026-02-03)

### Phase
Phase 1 - Research (Complete)

### What Was Done
- Completed COMPARISON_MATRIX.md with 65 capability rows across 6 categories
- Completed GAP_ANALYSIS.md identifying 23 prioritized gaps
- Completed IMPLEMENTATION_ROADMAP.md with 6-phase migration plan
- Completed CONTEXT_DOCUMENT.md (852 lines) with architectural patterns and code examples
- Answered all research questions from Entry 1

### Key Findings

#### Capability Assessment
| Category | Full Parity | Partial | Missing |
|----------|-------------|---------|---------|
| Entity Resolution | 6 | 2 | 1 |
| GraphRAG | 6 | 2 | 6 |
| Query & Reasoning | 2 | 0 | 14 |
| Workflow & Orchestration | 2 | 0 | 8 |
| RDF Infrastructure | 2 | 3 | 8 |
| Service Architecture | 0 | 1 | 3 |
| **Total** | **18** | **8** | **40** |

#### Critical Gaps (P0)
1. **Durable Workflow Execution** - No @effect/workflow integration for crash recovery
2. **SPARQL Query Engine** - No graph traversal or standard query language
3. **Inference/Reasoning Layer** - No RDFS forward-chaining for derived facts
4. **Batch State Persistence** - No persistence for long-running extractions
5. **Durable Persistence** - No saga pattern for recovery from partial failures
6. **Cross-batch Entity Resolution** - No deduplication across processing batches

#### Effort Estimate
- Total implementation: 18-24 weeks
- Critical path: 9 weeks minimum (Phase 0 → 1 → 4)
- Parallel tracks available: Entity Resolution + Workflow Durability

### Answers to Entry 1 Questions

1. **Service count in effect-ontology**: 50+ services confirmed, organized into Query, Resolution, RAG, Workflow, and Infrastructure layers

2. **Oxigraph WASM suitability**: Development and light production use. For heavy production loads, consider native Oxigraph or external triple store.

3. **@effect/workflow patterns**: Saga pattern with PostgreSQL persistence for crash recovery. Directly applicable to batch extraction pipeline.

4. **Services NOT to port**: Rate limiting infrastructure can use existing @beep/shared-* utilities. Federation services are P3 (future consideration).

### Key Decisions

1. **Phase 0 Foundation First**
   - Decision: RDF infrastructure (triple store, Turtle parsing) must precede query/reasoning
   - Rationale: SPARQL and reasoning depend on proper RDF data model
   - Impact: 2-3 week delay before query capabilities

2. **Parallel Track Strategy**
   - Decision: Entity Resolution and Workflow Durability can proceed independently
   - Rationale: No dependencies between these tracks after Phase 0
   - Impact: 3-4 weeks saved through parallelization

3. **Re-SHACL Pattern Adoption**
   - Decision: Validate shapes without full materialization
   - Rationale: effect-ontology approach avoids memory overhead of storing all derived facts
   - Alternative: Full materialization (rejected due to memory concerns)

4. **Two-Tier Entity Resolution**
   - Decision: Adopt MentionRecord + ResolvedEntity pattern from effect-ontology
   - Rationale: Enables audit trail, re-resolution, and temporal tracking
   - Impact: Requires table schema changes in knowledge slice

### What Worked Well

- **Parallel exploration agents**: Running two Explore agents (reference vs current) simultaneously provided comprehensive coverage without context exhaustion
- **Contextualization protocol**: Passing full findings to deliverable-writing agents ensured no information loss between research and documentation
- **Template-driven outputs**: Gap entry templates and comparison row templates ensured consistent, machine-parseable outputs
- **Research question anchoring**: Specific questions from Entry 1 provided clear completion criteria

### What Could Be Improved

- **Earlier file path verification**: Some initial research assumptions about effect-ontology structure required correction
- **Context budget management**: CONTEXT_DOCUMENT.md approached context limits; future specs should consider splitting into multiple files
- **Intermediate checkpoints**: Could benefit from more frequent small commits during research phase

### Architectural Insights Worth Preserving

1. **Two-tier entity resolution** (MentionRecord + ResolvedEntity) enables:
   - Complete audit trail of resolution decisions
   - Re-resolution when confidence thresholds change
   - Temporal tracking of entity evolution

2. **Re-SHACL validation pattern** avoids full materialization overhead:
   - Validate shapes directly against source triples
   - Derive only facts needed for validation
   - Memory-efficient for large ontologies

3. **RRF scoring (k=60)** is research-optimal for hybrid retrieval:
   - Balances vector similarity and keyword matching
   - k=60 derived from academic research on rank fusion
   - Currently hardcoded; could be service-configurable

4. **@effect/workflow + PostgreSQL persistence** enables:
   - Crash recovery for long-running extractions
   - Saga pattern for partial failure rollback
   - Workflow state inspection and debugging

### Suggested Follow-on Specs

Based on roadmap phases, recommend creating these implementation specs:

| Spec Name | Phase | Priority | Est. Effort |
|-----------|-------|----------|-------------|
| `specs/knowledge-rdf-foundation/` | 0 | P0 | 2-3 weeks |
| `specs/knowledge-sparql-integration/` | 1.1 | P0 | 2 weeks |
| `specs/knowledge-reasoning-engine/` | 1.2 | P0 | 2 weeks |
| `specs/knowledge-workflow-durability/` | 3 | P0 | 3-4 weeks |
| `specs/knowledge-entity-resolution-v2/` | 2 | P1 | 2-3 weeks |
| `specs/knowledge-graphrag-plus/` | 4 | P1 | 2 weeks |

### Pattern Candidates

1. **Parallel Agent Exploration** - For large comparison specs, parallel agents exploring different codebases simultaneously
2. **Contextualization Protocol** - Full findings summary before deliverable writing prevents information loss
3. **Research Question Anchoring** - Explicit questions provide completion criteria for open-ended research

### Recommendations for Implementation Phases

1. **Start with Phase 0 immediately** - RDF foundation unblocks all query/reasoning work
2. **Create integration tests early** - Use tmp/effect-ontology tests as reference for expected behavior
3. **Preserve effect-ontology service boundaries** - Don't merge services; they exist for testability
4. **Consider incremental migration** - Can use effect-ontology services directly while porting

---

## Prompt Refinements

> Tracking evolution of agent prompts based on learnings from spec execution.

### Prompt Refinement #1: Codebase Explorer Scope

**Original prompt approach:**
> "Research the tmp/effect-ontology repository thoroughly"

**Refined to:**
> "Research tmp/effect-ontology with focus on 6 key areas: Query/Reasoning, Entity Resolution, GraphRAG, Workflow Orchestration, RDF Infrastructure, Service Architecture"

**Rationale:** The original unbounded prompt risked context exhaustion. Scoping to specific capability areas provides focused research without missing critical features.

---

### Prompt Refinement #2: Gap Analysis Prioritization

**Original prompt approach:**
> "Identify gaps between the implementations"

**Refined to:**
> "Identify gaps and prioritize using P0-P3 scale (P0=critical for core functionality, P1=important for production, P2=nice to have, P3=future consideration) with S/M/L/XL complexity estimates"

**Rationale:** Without explicit prioritization criteria, gap analysis would lack actionability. The P0-P3 scale aligns with existing beep-effect conventions.

---

### Prompt Refinement #3: Context Preservation in Handoffs

**Original scaffolding approach:**
> Single AGENT_PROMPT.md file with all context

**Refined to:**
> Dual handoff protocol: HANDOFF_P1.md (full context, tiered memory) + P1_ORCHESTRATOR_PROMPT.md (copy-paste ready)

**Rationale:** Spec-reviewer identified missing handoff protocol as critical gap. Dual files enable session resumption without context loss.

---

### Prompt Refinement #4: Output Template Structure

**Original approach:**
> Placeholder output files with minimal structure

**Refined to:**
> Created `templates/` directory with `gap-entry.template.md` and `comparison-row.template.md` for consistent output format

**Rationale:** Templates ensure comparison agents produce consistent, machine-parseable outputs that can be aggregated into implementation specs.

---

### Prompt Refinement #5: Research Question Anchoring

**Original approach:**
> Open-ended "explore and document" directive

**Refined to:**
> Anchor research with specific questions: "What is the actual service count?", "Is Oxigraph WASM production-suitable?", "What @effect/workflow patterns apply?"

**Rationale:** Concrete questions provide checkpoints for research completion and prevent scope creep into tangential areas.

---

### Prompt Refinement #6: Negative Scope Definition

**Original approach:**
> Define what to include only

**Refined to:**
> Explicitly define Non-Goals section: "No code generation", "No performance benchmarking", "Not a tutorial"

**Rationale:** Negative constraints prevent agents from over-delivering on tasks that should wait for implementation phases.

---

## Entry 3: Legal Review & Remediation (2026-02-03)

### Phase
Phase 1 - Legal Review & Remediation

### What Was Done
- Conducted comprehensive legal review of all Phase 1 deliverables using `/legal-review` skill
- Identified 24 total violations: 12 MAJOR and 12 MINOR
- Deployed 3 parallel remediation agents to fix violations by category
- All violations successfully remediated across:
  - COMPARISON_MATRIX.md
  - GAP_ANALYSIS.md
  - IMPLEMENTATION_ROADMAP.md
  - CONTEXT_DOCUMENT.md

### Violation Summary

| Category | MAJOR | MINOR | Files Affected |
|----------|-------|-------|----------------|
| Effect Pattern Violations | 6 | 4 | CONTEXT_DOCUMENT.md, IMPLEMENTATION_ROADMAP.md |
| Internal Consistency Violations | 3 | 5 | GAP_ANALYSIS.md, COMPARISON_MATRIX.md |
| RPC Pattern Violations | 3 | 3 | CONTEXT_DOCUMENT.md, IMPLEMENTATION_ROADMAP.md |

### Key Learnings

#### Effect Pattern Violations

1. **Service Definition Pattern**: Services MUST use `Effect.Service<T>()("name", { accessors: true, effect: Effect.gen(...) })` - not just type annotations. The `effect:` key enables the service to run effectful computations.

2. **EntityId Branding**: ALWAYS use branded EntityIds from `@beep/shared-domain` or slice-specific modules - NEVER plain `S.String`. Missing `.$type<EntityId.Type>()` on table columns causes type-unsafe joins.

3. **Schema Import Alias**: Use `S` from `effect/Schema` - not `Schema`. This follows the codebase's single-letter alias convention documented in `.claude/rules/effect-patterns.md`.

#### RPC Pattern Violations

4. **RPC Handler Pattern**: The correct pattern is `.middleware(Policy).of({ handlers }).toLayer()` - NOT `.toLayer(Effect.gen(...))`. The `.of({ handlers })` call accepts a record of handler functions.

5. **RpcGroup Prefix**: ALWAYS include `.prefix("entity_")` when defining RpcGroups. This ensures RPC endpoints are namespaced correctly.

6. **Handler File Location**: Handlers go in `src/rpc/v1/{entity}/_rpcs.ts` - NOT `src/handlers/`. The codebase convention places RPC definitions alongside their schemas in vertical slice structure.

#### Internal Consistency Violations

7. **Priority Dependencies**: If Gap A blocks Gap B, they cannot have the same priority - elevate the blocker. Example: "SPARQL Engine" blocking "Multi-hop Traversal" required SPARQL to be P0 and Multi-hop to be P1.

8. **Gap Consolidation**: Document when raw gap counts differ from actionable work items. The comparison identified 40 missing capabilities but GAP_ANALYSIS.md contained 23 actionable gaps because some were grouped or deferred.

### What Worked Well

- **Parallel remediation**: Running 3 specialized agents (Effect patterns, RPC patterns, internal consistency) in parallel completed fixes efficiently
- **Legal review categorization**: The three-category violation taxonomy (Effect, RPC, Consistency) provided clear remediation ownership
- **Specific citations**: Legal review cited exact file locations and line references, enabling precise fixes

### What Could Be Improved

- **Earlier pattern validation**: Effect and RPC patterns should be validated during writing, not as a post-hoc review
- **Checklist integration**: A pre-commit checklist for common violations would catch issues earlier
- **Template enforcement**: Code example templates in spec structure could enforce correct patterns

### Pattern Candidates

1. **Pre-deliverable Legal Review**: Run `/legal-review` on individual deliverables during writing, not just at phase completion
2. **Pattern Violation Taxonomy**: Categorize violations by remediation owner (Effect expert, RPC expert, domain expert)
3. **Parallel Remediation Agents**: Deploy specialized agents for each violation category simultaneously

### Recommendations for Future Specs

1. **Include pattern validation in COMPARISON_INSTRUCTIONS.md**: Add a checklist section for Effect/RPC patterns when specs contain code examples
2. **Create code example templates**: Pre-validated templates for common patterns (Service definition, RPC handler, Schema definition) to copy-paste into deliverables
3. **Add consistency validation step**: Before finalizing multi-document specs, cross-check counts and priorities across all files
4. **Reference `.claude/rules/effect-patterns.md`**: Explicitly cite the patterns document in agent prompts for specs containing code examples
5. **Dependency priority rule**: Add to spec guidelines - "If Gap A is prerequisite for Gap B, then Priority(A) < Priority(B)"

---

## Entry 4: P1 Re-Execution -- Data Accuracy Correction (2026-02-05)

### Phase
Phase 1 - Research (Re-execution)

### What Was Done
- Re-executed P1 research after discovering all 4 deliverables from 2026-02-03 contained severe factual errors
- Inventoried effect-ontology reference (68+ services cataloged across 7 categories)
- Audited knowledge-slice current state with direct file inspection (90+ TypeScript files verified)
- Rewrote COMPARISON_MATRIX.md: 121 rows (up from 65), parity corrected from 27% to 54%
- Rewrote GAP_ANALYSIS.md: reduced from 23 gaps to 20 remaining, added "Closed Gaps" traceability section
- Rewrote IMPLEMENTATION_ROADMAP.md: reduced from 8 phases/18-23 weeks to 4 phases/12-14 weeks
- Rewrote CONTEXT_DOCUMENT.md: corrected all false claims about missing capabilities, updated file inventory

### Key Findings

#### The Original Deliverables Were Severely Outdated

The 2026-02-03 deliverables incorrectly listed these as gaps (all were actually implemented):

| Falsely Listed as Gap | Actual Implementation |
|---|---|
| SPARQL Query Engine | `Sparql/` -- SparqlService, SparqlParser, QueryExecutor, FilterEvaluator (6 files) |
| Forward-Chaining Reasoner | `Reasoning/` -- ForwardChainer, ReasonerService, RdfsRules (4 files) |
| Triple Store | `Rdf/RdfStoreService.ts` -- N3.Store wrapper |
| RDF Serialization | `Rdf/Serializer.ts` -- Turtle/N-Triples via N3.Writer |
| Grounded Answer Generation | `GraphRAG/GroundedAnswerGenerator.ts` -- @effect/ai LanguageModel |
| Citation Validation | `GraphRAG/CitationValidator.ts` -- SPARQL ASK queries |
| Reasoning Traces | `GraphRAG/ReasoningTraceFormatter.ts` -- step-by-step inference chains |
| Cross-Batch Entity Resolution | `EntityResolution/EntityRegistry.ts` + `BloomFilter.ts` |
| Cumulative Entity Registry | `EntityResolution/EntityRegistry.ts` -- persists across batches |
| Immutable Evidence Layer | `MentionRecord` entity with model, table, and repository |

#### Corrected Statistics

| Metric | Previous (Wrong) | Corrected |
|---|---|---|
| Comparison rows | 65 | 121 |
| FULL parity | 18 (27%) | 66 (54%) |
| PARTIAL parity | 8 | 17 |
| GAP (remaining) | 40 | 38 |
| Actionable gaps | 23 | 20 |
| Implementation estimate | 18-23 weeks | 12-14 weeks |
| Roadmap phases | 8 | 4 |

### Key Decisions

1. **Direct File Inspection Over Delegated Exploration**
   - Decision: Read actual source files with Glob/Read instead of relying on haiku-model codebase exploration agents
   - Rationale: A haiku-model exploration agent was too slow (killed after 10 minutes) and unreliable. Direct file inspection proved faster and more accurate
   - Impact: Discovery of 10 major capabilities falsely listed as gaps

2. **Parallel Agent Writing Strategy**
   - Decision: Launch separate agents for each deliverable rather than one agent for all 4
   - Rationale: Each deliverable requires different source file reading; parallelism reduces total time
   - Impact: All 4 deliverables completed in ~30 minutes total

3. **Closed Gaps Traceability**
   - Decision: Added explicit "Closed Gaps" section in GAP_ANALYSIS.md documenting the 10 gaps that were resolved
   - Rationale: Future readers need to understand why gap count decreased without assuming capabilities were descoped
   - Impact: Clear audit trail from 40 raw gaps to 20 actionable gaps

### What Worked Well

- **Direct source verification**: Reading actual TypeScript files (SparqlService.ts, ForwardChainer.ts, etc.) immediately revealed the data accuracy problem
- **Parallel background agents**: Running COMPARISON_MATRIX, GAP_ANALYSIS, IMPLEMENTATION_ROADMAP, and CONTEXT_DOCUMENT agents in parallel maximized throughput
- **Detailed agent prompts with file inventories**: Passing the complete Glob output to writing agents prevented them from repeating the same error of assuming missing files
- **Cross-session resumption**: The handoff protocol successfully preserved context across 3 session continuations

### What Could Be Improved

- **Always verify with Glob before claiming something is missing**: The original P1 execution assumed capabilities were absent based on incomplete exploration rather than verifying file existence
- **Use opus-tier agents for codebase exploration**: The haiku agent (a5ade08) failed to complete the audit task; direct Glob/Read or opus-tier agents are more reliable for large codebases
- **Session context budgeting**: This task required 3 session continuations. Could be mitigated by more aggressive parallelization upfront
- **Earlier data validation**: If the 2026-02-03 deliverables had been spot-checked against actual source files, the errors would have been caught immediately

### Root Cause Analysis

The original deliverables were written based on research that predated the implementation of SPARQL, Reasoning, RDF, expanded GraphRAG, and entity resolution improvements. The research agents apparently explored an older branch or incomplete working tree. The fundamental lesson: **research deliverables MUST be validated against the actual current source tree, not cached exploration results.**

### Pattern Candidates

1. **Source-Verified Research**: For comparison/audit specs, mandate a Glob verification step that confirms every "missing" capability is actually absent from the file tree
2. **Corrected Document Headers**: When rewriting stale deliverables, add "(Corrected)" to the title and a "What Changed" section explaining corrections
3. **Closed-Gap Traceability**: When gap counts decrease between versions, explicitly document why each gap was closed

### Recommendations for Future Specs

1. **Add verification gate**: Before marking research phase complete, require a "verify gaps against source" step using Glob/Read
2. **Include file inventories in agent prompts**: When delegating to writing agents, always include the actual Glob output so agents cannot fabricate or assume file existence
3. **Prefer direct tools over exploration agents for verification**: Glob + Read is faster and more reliable than spawning exploration agents for "does X exist?" questions
4. **Time-stamp deliverables relative to git state**: Include the git commit hash in deliverables so readers know which state of the code was analyzed

### Prompt Refinement #7: Source Verification Mandate

**Original approach:**
> "Research the codebases and produce comparison deliverables"

**Refined to:**
> "Research the codebases, produce comparison deliverables, and VERIFY every 'missing' capability by checking actual file existence with Glob before listing it as a gap"

**Rationale:** The single biggest error in the original P1 execution was listing 10 implemented capabilities as gaps. A mandatory verification step prevents this class of error entirely.

---

## Entry 5: Phase 2 Implementation -- Workflow Durability + Resilience (2026-02-05)

### Phase
Phase 2 - Implementation (Complete)

### What Was Done

Implemented crash-recoverable extraction workflows and LLM call protection across 5 sub-tasks:

| Sub-Task | Deliverable | Files Created/Modified |
|----------|-------------|----------------------|
| 2A: Workflow Tables | 3 Drizzle tables + 3 EntityIds | `workflow-execution.table.ts`, `workflow-activity.table.ts`, `workflow-signal.table.ts` |
| 2Ba: Domain + Persistence | Value objects, errors, WorkflowPersistence, DurableActivities | `workflow-state.value.ts`, `extraction-progress.value.ts`, `workflow.errors.ts`, `WorkflowPersistence.ts`, `DurableActivities.ts` |
| 2Bb: Workflow + Progress | ExtractionWorkflow orchestrator, ProgressStream SSE | `ExtractionWorkflow.ts`, `ProgressStream.ts` |
| 2C: CircuitBreaker | Combined circuit breaker + rate limiter | `LlmControl/RateLimiter.ts` (CentralRateLimiterService) |
| 2D: Rate Limiter Integration | Wrapped LLM call sites | Modified `EmbeddingService.ts`, `GroundedAnswerGenerator.ts` |

Additional files: `circuit.errors.ts`, `embedding.errors.ts`, `event-bus.error.ts`, `LlmControl/StageTimeout.ts`, `LlmControl/TokenBudget.ts`

### Key Decisions

1. **Custom Workflow Persistence Over @effect/workflow**
   - Decision: Built lightweight custom persistence with PostgreSQL instead of @effect/workflow
   - Rationale: @effect/workflow is alpha (v0.16.0) and requires @effect/cluster, which adds significant infrastructure complexity
   - Alternative: @effect/workflow with cluster -- rejected due to alpha status and cluster dependency
   - Impact: Simpler DI, no cluster infrastructure, full control over persistence schema

2. **Combined CircuitBreaker + RateLimiter (CentralRateLimiterService)**
   - Decision: Single service combining circuit breaker states, request/token rate limiting, and semaphore concurrency
   - Rationale: Discovered existing `CentralRateLimiterService` stub already attempted this pattern; completing it was more coherent than splitting
   - Location: `server/src/LlmControl/RateLimiter.ts` (NOT `server/src/Resilience/` as originally planned)
   - Impact: One service to inject, one Layer to provide, cleaner DI graph

3. **Layer-Level DI for Rate Limiting**
   - Decision: Resolve CentralRateLimiterService at `serviceEffect` construction time (Layer level), not at method call time
   - Rationale: Keeps method R channels as `never`, avoiding R type pollution through entire call graph
   - Pattern: `const limiter = yield* CentralRateLimiterService;` in serviceEffect, then `limiter.acquire(tokens)` inline in methods

4. **S.encodeSync(S.parseJson(schema)) for JSONB Serialization**
   - Decision: Use Schema-based JSON encoding instead of `JSON.stringify` for SQL jsonb columns
   - Rationale: Validates structure through Schema before serializing; consistent with Effect-first patterns
   - Pattern: `const toJsonb = S.encodeSync(S.parseJson(S.Record({ key: S.String, value: S.Unknown })));`

5. **DurableActivity Checkpoint/Replay Pattern**
   - Decision: Check DB for completed activity before execution; skip if already done
   - Rationale: Enables crash recovery -- restart picks up where it left off
   - Pattern: `findCompletedActivity(executionId, name)` → `O.match` → cached result or execute fresh

### What Worked Well

- **Parallel sub-agent delegation**: Running 2Ba and 2C/2D agents simultaneously maximized throughput
- **Existing code patterns as templates**: Entity.repo.ts and EntityCluster.repo.ts provided the `SqlSchema.findAll` + `JSON.stringify(...)::jsonb` patterns that guided WorkflowPersistence implementation
- **Incremental type checking**: `bun tsc --noEmit -p tsconfig.json` for isolated verification avoided turborepo cascading through all dependencies
- **OrgTable.make factory**: Correctly handled multi-tenant table creation with organization_id FK

### What Could Be Improved

- **`sql.json()` doesn't exist**: Agent-generated code used `sql.json(value)` which is not a real `@effect/sql` API. Always verify SqlClient API surface against existing repo code, not assumptions
- **Agent context exhaustion**: Multiple session continuations were needed. More aggressive parallelization and smaller agent scopes would reduce context pressure
- **File path divergence from plan**: HANDOFF_P2.md specified `server/src/Resilience/` directory but actual implementation went to `server/src/LlmControl/`. Plans should be updated when implementation diverges

### Learnings for MEMORY.md

1. **SqlClient has no `.json()` method**: Use `JSON.stringify(value)::jsonb` or `S.encodeSync(S.parseJson(schema))(value)::jsonb` for PostgreSQL jsonb columns
2. **@effect/workflow requires @effect/cluster**: Not suitable for lightweight workflow persistence; build custom with SqlClient + Effect primitives
3. **CentralRateLimiterService location**: `server/src/LlmControl/RateLimiter.ts` -- NOT `server/src/Resilience/`
4. **BS.StringLiteralKit**: Used for circuit states ("closed" | "open" | "half_open") and workflow statuses

### Pattern Candidates

1. **DurableActivity Checkpoint/Replay**: Generic pattern for any long-running pipeline stage -- check DB, skip if done, record on complete/fail
2. **Layer-Level Service Resolution**: Resolve dependencies in serviceEffect to keep method signatures clean
3. **Schema-Based JSONB Serialization**: `S.encodeSync(S.parseJson(schema))` over raw `JSON.stringify`

### Recommendations for Phase 3

1. **Update reference file paths**: Phase 3 handoff references `server/src/Resilience/CircuitBreaker.ts` which doesn't exist; actual location is `server/src/LlmControl/RateLimiter.ts`
2. **BatchOrchestrator should compose ExtractionWorkflow + DurableActivities**: Each document gets its own workflow execution with durable checkpointing
3. **PubSub for batch events**: ProgressStream already uses Effect.PubSub -- BatchEventEmitter should aggregate per-document progress streams
4. **Failure policies leverage CentralRateLimiterService circuit state**: `abort-all` can check circuit breaker state to decide whether to halt

---

## Entry Template

```markdown
## Entry N: [Phase Name] (YYYY-MM-DD)

### Phase
[Phase name and number]

### What Was Done
- [Bullet points of accomplishments]

### Key Decisions
1. **Decision Name**: [What was decided]
   - Rationale: [Why]
   - Alternatives considered: [What else was considered]

### What Worked Well
- [Things that went smoothly]

### What Could Be Improved
- [Areas for improvement]

### Questions Raised
- [Questions for future phases]

### Pattern Candidates
- [Patterns that might be worth promoting]

### Recommendations
- [Advice for future phases]
```
