# Reflection Log

> Cumulative learnings from each phase of the workflow durability specification.

---

## Template

After each phase, add an entry using this structure:

```markdown
## [Phase N] - [Phase Name] - [Date]

### What Worked

- Detection method / approach that succeeded
- Pattern that proved effective
- Tool/agent that delivered value

### What Didn't Work

- Failed detection method
- Anti-pattern encountered
- Tool/agent limitation discovered

### Key Learnings

- Insight about the codebase
- Insight about the problem space
- Insight about the methodology

### Pattern Candidates

- [ ] Pattern name (score: X/102) - Brief description
  - Location: where it was applied
  - Evidence: what validates it
  - Promotion: spec-local / registry / skill
```

---

## Phase Log

## Phase 0: Scaffolding - 2026-02-03

### What Worked

- Complexity formula calculation yielded clear classification (51 points → High)
- Package allocation from knowledge-architecture-foundation spec provided clear boundaries
- HANDOFF_P1.md creation established solid foundation for Phase 1
- Table schema design from database-patterns.md reference

### What Didn't Work

- (To be filled during Phase 1 execution)

### Key Learnings

- @effect/workflow integration has canonical patterns in `.repos/effect-ontology/packages/@core-v2/src/`
- PostgreSQL persistence is handled automatically by `@effect/cluster` via `SqlMessageStorage`/`SqlRunnerStorage`
- Need to verify ALL @effect/workflow API methods against library source before implementing
- **CRITICAL**: Tables are auto-created by @effect/cluster - do NOT create custom Drizzle tables
- Activity.make uses factory pattern with input captured in closure, NOT passed to execute
- Custom EntityIds (WorkflowExecutionId, etc.) are NOT needed - @effect/cluster manages its own IDs

### Pattern Candidates

- (To be filled as patterns emerge during implementation)

### Risks Identified

1. **@effect/workflow API assumptions** - High risk of incorrect API usage without source verification
   - Mitigation: Add source verification table to HANDOFF_P1.md
   - Mitigation: Research @effect/workflow patterns via mcp-researcher before implementation

2. **Checkpoint granularity** - Unclear optimal checkpoint frequency
   - Mitigation: Start with stage-level checkpoints, refine based on performance metrics

3. **SSE connection stability** - Browser connection limits may impact long-running extractions
   - Mitigation: Implement reconnection logic with exponential backoff

### Next Phase Preparation

- Phase 1 ready to start with complete handoff documentation
- Research tasks clearly defined for codebase-researcher
- Success criteria well-specified
- Verification commands documented

---

## API Verification Review - 2026-02-04

### What Worked

- Cross-referencing `.repos/effect-ontology/packages/@core-v2/src/` revealed canonical patterns
- Identified correct Activity factory pattern with closure-captured input
- Discovered @effect/cluster auto-creates tables via SqlMessageStorage/SqlRunnerStorage

### What Didn't Work

- Initial spec examples had incorrect @effect/workflow API patterns
- Assumptions about custom table creation were wrong
- Activity.make example showed `input`/`output` params that don't exist

### Key Learnings

1. **Tables auto-created**: `@effect/cluster` creates `{prefix}_cluster_messages`, `{prefix}_cluster_replies`, `{prefix}_cluster_runners` automatically
2. **Activity factory pattern**: Input must be captured in closure, NOT passed to execute:
   ```typescript
   export const makeActivity = (input: Input) =>
     Activity.make({
       name: `activity-${input.id}`,
       success: OutputSchema,
       error: ErrorSchema,
       execute: Effect.gen(function*() {
         // input captured in closure
         return yield* process(input)
       })
     })
   ```
3. **Workflow.make API**: Uses `payload`, `success`, `error`, `idempotencyKey`, `annotations`, `suspendedRetrySchedule`
4. **No custom EntityIds needed**: @effect/cluster manages workflow execution IDs internally

### Files Updated

- `QUICK_START.md` - Corrected Critical Patterns, Starting Phase 1, Key Technologies
- `README.md` - Corrected Activity pattern example, added Effect import to Orchestrator
- `MASTER_ORCHESTRATION.md` - Added API warning, fixed Phase 1 diagram
- `AGENT_PROMPTS.md` - Added API verification warning
- `handoffs/HANDOFF_P1.md` - Corrected success criteria and file list
- `handoffs/P1_ORCHESTRATOR_PROMPT.md` - Corrected mission and part descriptions
- `REFLECTION_LOG.md` - Updated key learnings

### Pattern Candidates

- [x] Activity Factory Pattern (score: 85/102) - Closure-captured input for durable activities
  - Location: `.repos/effect-ontology/packages/@core-v2/src/Workflow/DurableActivities.ts`
  - Evidence: Used throughout effect-ontology workflow implementation
  - Promotion: spec-local (document in QUICK_START.md Critical Patterns)
