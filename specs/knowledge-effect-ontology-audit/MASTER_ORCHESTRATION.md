# Master Orchestration: Knowledge vs Effect-Ontology Audit

> Complete workflow for the 6-phase architectural audit.

---

## Orchestrator Role

The orchestrator **coordinates** work but does NOT perform substantive research. Tasks exceeding 20 tool calls MUST be delegated to specialized agents.

### Thresholds

**Delegation Threshold** (when to delegate vs do directly):
```
small_task := |files| <= 3 ∧ |tool_calls| <= 5
large_task := |files| > 3 ∨ |tool_calls| > 5 ∨ requires_deep_exploration

small_task → orchestrator MAY execute directly
large_task → MUST delegate to specialized agent
```

**Checkpoint Threshold** (when to pause and create handoff):
- Tool calls reach 15 in current session
- Large file reads reach 4
- Context > 75% (Yellow Zone)

---

## Delegation Matrix

| Phase | Task | Est. Tool Calls | Delegate To | Output |
|-------|------|-----------------|-------------|--------|
| 1 | Inventory 100+ files | 200+ | codebase-researcher | outputs/EFFECT_ONTOLOGY_INVENTORY.md |
| 2 | Categorize capabilities | 50+ | doc-writer | outputs/CAPABILITY_CATEGORIES.md |
| 3 | Gap analysis | 100+ | codebase-researcher | outputs/GAP_ANALYSIS.md |
| 4 | Technology alignment | 30 | mcp-researcher | outputs/TECHNOLOGY_ALIGNMENT.md |
| 5 | Extract patterns | 50+ | doc-writer | outputs/PATTERN_CATALOG.md |
| 6a | Generate roadmap | 30 | doc-writer | outputs/SPEC_ROADMAP.md |
| 6b | Define specs | 40 | doc-writer | outputs/SPEC_DEFINITIONS.md |
| 6c | Create generator prompt | 20 | doc-writer | outputs/SPEC_GENERATOR_PROMPT.md |
| 6d | Domain adaptation | 30 | doc-writer | outputs/DOMAIN_ADAPTATION_GUIDE.md |

---

## Context Budget Protocol

### Per-Handoff Budget

| Memory Type | Budget | Content |
|-------------|--------|---------|
| Working Context | ≤2,000 tokens | Current phase tasks, immediate blockers |
| Episodic Context | ≤1,000 tokens | Previous phase summaries (≤200 tokens each) |
| Semantic Context | ≤500 tokens | Tech stack, domain constants |
| Procedural Context | Links only | Reference to AGENT_PROMPTS.md |

**Total**: ≤4,000 tokens per handoff

### Context Placement Strategy

```markdown
## Working Context (what I'm doing now)
[Current phase tasks, blockers, next steps]

## Episodic Context (what happened before)
Phase 1: Completed inventory of 127 files. Key finding: ...
Phase 2: Categorized into 11 categories. Notable: ...

## Semantic Context (constants)
- effect-ontology: `.repos/effect-ontology/packages/@core-v2/`
- knowledge slice: `packages/knowledge/`
- Domain: Wealth management for UHNWI clients

## Procedural Context (how to do things)
See AGENT_PROMPTS.md for sub-agent task definitions.
```

---

## Checkpoint Protocol

### Checkpoint Triggers

Create intra-phase checkpoint when:
- Tool calls reach 15 in current session
- Large file reads reach 4
- Entering Yellow Zone (context > 75%)
- Before starting gap analysis comparisons (100+ comparisons)
- After completing major deliverable section

### Checkpoint Format

```markdown
## Checkpoint P[N].[M] - [Date]

### Progress
- [ ] Completed: [what's done]
- [ ] In Progress: [current work]
- [ ] Remaining: [what's left]

### Context Snapshot
[Copy of Working Context ≤500 tokens]

### Next Steps
1. [Immediate action]
2. [Following action]
```

---

## Phase Execution Details

### Phase 1: Source Inventory

**Objective**: Catalog every source file in effect-ontology

**Scope**: `.repos/effect-ontology/packages/@core-v2/src/**/*.ts`

**Execution**:
1. Spawn `codebase-researcher` with Phase 1 prompt from AGENT_PROMPTS.md
2. Agent reads all files and produces inventory
3. Review output for completeness
4. Verify all directories covered:
   - Cluster/
   - Contract/
   - Domain/ (Error/, Model/, Rdf/, Schema/)
   - Prompt/
   - Runtime/ (Persistence/)
   - Schema/
   - Service/ (LlmControl/)
   - Telemetry/
   - Utils/
   - Workflow/

**Completion Criteria**:
- [ ] outputs/EFFECT_ONTOLOGY_INVENTORY.md created
- [ ] 100+ files documented
- [ ] All directories covered
- [ ] REFLECTION_LOG.md updated
- [ ] handoffs/HANDOFF_P2.md created

### Phase 2: Capability Categorization

**Objective**: Group capabilities into functional categories

**Categories** (11 total):
1. Core Domain - Models, schemas, errors, value objects
2. Extraction Pipeline - Text processing, LLM extraction, grounding
3. Entity Resolution - Clustering, similarity, deduplication
4. RDF/Reasoning - RDF store, SPARQL, RDFS inference
5. Durability - Workflows, activities, persistence
6. Events - Event bus, broadcasting, streaming, logging
7. Resilience - Circuit breaker, rate limiting, backpressure
8. Runtime - Layer composition, cluster, activity runners
9. Contracts - RPC definitions, progress streaming, SSE
10. Telemetry - Tracing, metrics, cost calculation
11. Utilities - IRI handling, text processing, similarity scoring

**Execution**:
1. Spawn `doc-writer` with Phase 2 prompt from AGENT_PROMPTS.md
2. Agent uses inventory to categorize capabilities
3. Review output for correct groupings
4. Verify integration points documented

**Completion Criteria**:
- [ ] outputs/CAPABILITY_CATEGORIES.md created
- [ ] All 11 categories documented
- [ ] Key services/classes identified per category
- [ ] REFLECTION_LOG.md updated
- [ ] handoffs/HANDOFF_P3.md created

### Phase 3: Gap Analysis

**Objective**: Compare each capability against beep-effect knowledge slice

**Scope**:
- effect-ontology: From inventory
- beep-effect: `packages/knowledge/{domain,tables,server,client}/src/`

**Gap Types**:
- **None** - Feature parity achieved
- **Partial** - Functionality exists but incomplete
- **Missing** - No equivalent implementation
- **Different** - Different approach, evaluate alignment

**Priority Levels**:
- **P0** - Critical (blocks core functionality)
- **P1** - High (required for production)
- **P2** - Medium (nice to have)
- **P3** - Low (future consideration)

**Execution**:
1. Spawn `codebase-researcher` with Phase 3 prompt from AGENT_PROMPTS.md
2. Agent compares each capability from inventory
3. Review output for accuracy
4. Use RUBRICS.md for consistent scoring

**Completion Criteria**:
- [ ] outputs/GAP_ANALYSIS.md created
- [ ] Every capability assessed
- [ ] No "unknown" entries
- [ ] All priorities assigned
- [ ] REFLECTION_LOG.md updated
- [ ] handoffs/HANDOFF_P4.md created

### Phase 4: Technology Alignment

**Objective**: Document all Effect ecosystem packages and alignment

**Package Categories**:
```typescript
// Core Effect
effect, @effect/platform, @effect/platform-bun
@effect/sql, @effect/sql-pg, @effect/sql-drizzle

// AI/LLM
@effect/ai, @effect/ai-anthropic, @effect/ai-openai

// Durability
@effect/workflow, @effect/cluster

// Experimental
@effect/experimental

// Observability
@effect/opentelemetry
```

**Execution**:
1. Spawn `mcp-researcher` with Phase 4 prompt from AGENT_PROMPTS.md
2. Agent checks each package usage
3. Review version alignment
4. Document required changes

**Completion Criteria**:
- [ ] outputs/TECHNOLOGY_ALIGNMENT.md created
- [ ] All packages documented
- [ ] Version alignment checked
- [ ] REFLECTION_LOG.md updated
- [ ] handoffs/HANDOFF_P5.md created

### Phase 5: Pattern Documentation

**Objective**: Extract reusable patterns from effect-ontology

**Pattern Categories**:
1. Service Definition - Effect.Service with accessors
2. Layer Composition - Dependency ordering, merging
3. Error Handling - Tagged errors, recovery strategies
4. Stream Processing - Backpressure, cancellation
5. State Management - Ref, Deferred, FiberMap
6. Event Patterns - PubSub, EventJournal, broadcasting
7. Testing Patterns - Layer sharing, mocking
8. Configuration - Environment-based config

**Execution**:
1. Spawn `doc-writer` with Phase 5 prompt from AGENT_PROMPTS.md
2. Agent extracts patterns from inventory
3. Review for applicability
4. Verify code references are accurate

**Completion Criteria**:
- [ ] outputs/PATTERN_CATALOG.md created
- [ ] 8+ pattern categories documented
- [ ] Effect-ontology examples included
- [ ] REFLECTION_LOG.md updated
- [ ] handoffs/HANDOFF_P6.md created

### Phase 6: Spec Roadmap Generation

**Objective**: Produce actionable spec definitions

**Deliverables**:
1. SPEC_ROADMAP.md - Ordered list with dependencies
2. SPEC_DEFINITIONS.md - Detailed scope per spec
3. SPEC_GENERATOR_PROMPT.md - Prompt for spec creation
4. DOMAIN_ADAPTATION_GUIDE.md - Wealth management guidance

**Execution**:
1. Spawn `doc-writer` with Phase 6 prompt from AGENT_PROMPTS.md
2. Agent synthesizes gaps into coherent specs
3. Review for completeness
4. Verify dependency ordering

**Completion Criteria**:
- [ ] All 4 deliverables created in outputs/
- [ ] Specs ordered by dependency
- [ ] Domain adaptation documented
- [ ] REFLECTION_LOG.md updated
- [ ] Final summary added to README.md

---

## Handoff Protocol

### End of Each Phase

1. **Update REFLECTION_LOG.md**:
   ```markdown
   ### Entry [Date] (Phase N)

   **What Worked**: ...
   **What Didn't Work**: ...
   **Learnings**: ...
   **Recommendations**: ...
   ```

2. **Create HANDOFF_P[N+1].md**:
   - Copy template from handoffs/HANDOFF_TEMPLATE.md
   - Fill with ≤4,000 tokens of context
   - Include phase completion summary
   - Document next phase tasks

3. **Create P[N+1]_ORCHESTRATOR_PROMPT.md**:
   - Copy-paste ready prompt for next session
   - Reference HANDOFF_P[N+1].md
   - Include immediate first steps

---

## Anti-Patterns to Avoid

### #1: Orchestrator Research
**Pattern**: Orchestrator reading 100+ files directly
**Fix**: Delegate to `codebase-researcher`

### #2: Context Overload
**Pattern**: Handoff exceeds 4,000 tokens
**Fix**: Compress to tiered memory model

### #3: Static Prompts
**Pattern**: Same prompt regardless of findings
**Fix**: Adapt AGENT_PROMPTS based on previous phase

### #4: Phase Too Large
**Pattern**: Phase 1 with 100+ files in single session
**Fix**: Checkpoint after 50 files

### #5: Skip Reflection
**Pattern**: No REFLECTION_LOG entry after phase
**Fix**: Mandatory reflection before handoff

---

## Quality Gates

Before marking spec complete:

```bash
# Verify all outputs exist
ls -la specs/knowledge-effect-ontology-audit/outputs/

# Check inventory completeness
wc -l outputs/EFFECT_ONTOLOGY_INVENTORY.md  # Should be 300+ lines

# Verify gap coverage
grep -c "Unknown" outputs/GAP_ANALYSIS.md  # Should be 0

# Check roadmap has dependencies
grep -c "depends on" outputs/SPEC_ROADMAP.md  # Should be > 0
```

---

## Reference Files

| File | Purpose |
|------|---------|
| [QUICK_START.md](QUICK_START.md) | 5-minute triage |
| [AGENT_PROMPTS.md](AGENT_PROMPTS.md) | Sub-agent task definitions |
| [RUBRICS.md](RUBRICS.md) | Gap assessment scoring |
| [README.md](README.md) | Domain context, success criteria |
| [templates/](templates/) | Deliverable templates |
| [handoffs/](handoffs/) | Phase transition documents |
| [outputs/](outputs/) | Completed deliverables |
