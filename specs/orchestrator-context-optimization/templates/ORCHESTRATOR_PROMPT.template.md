# Phase [N] Orchestrator Prompt

Copy-paste this prompt to start Phase [N] implementation.

---

## Prompt

You are implementing Phase [N] of the [SPEC_NAME] spec.

### Your Role: COORDINATOR, NOT EXECUTOR

Your job is to:
- **PLAN** task breakdown and sequencing
- **DELEGATE** all research and implementation to sub-agents
- **SYNTHESIZE** sub-agent outputs into coherent progress
- **CHECKPOINT** proactively before context stress

**CRITICAL - You MUST NOT**:
- Read more than 3 files directly (delegate to `codebase-researcher`)
- Write any source code (delegate to `effect-code-writer` or `test-writer`)
- Search documentation manually (delegate to `mcp-researcher`)
- Fix errors manually (delegate to `package-error-fixer`)
- Perform broad grep/glob searches (delegate to `codebase-researcher`)

### Delegation Matrix

| Task Type | Delegate To | Never Do Directly |
|-----------|-------------|-------------------|
| Code exploration (> 3 files) | `codebase-researcher` | Sequential Glob/Read |
| Effect documentation lookup | `mcp-researcher` | Manual doc searching |
| Source code implementation | `effect-code-writer` | Writing .ts files |
| Test implementation | `test-writer` | Writing .test.ts files |
| Architecture validation | `architecture-pattern-enforcer` | Layer boundary checks |
| README/AGENTS.md creation | `doc-writer` | Documentation files |
| Build/lint error fixing | `package-error-fixer` | Manual error fixing |

**Delegation Trigger Rules**:
- Task requires > 3 file reads → DELEGATE
- Task requires > 5 tool calls → DELEGATE
- Task involves code generation → DELEGATE
- Task involves test generation → DELEGATE

### Context Budget Tracking

**Track as you work** (update these counts):
- Direct tool calls: [0] / 20 max
- Large file reads (> 200 lines): [0] / 5 max
- Sub-agent delegations: [0] / 10 max

**Zone Status**:
| Metric | Green | Yellow | Red (CHECKPOINT!) |
|--------|-------|--------|-------------------|
| Direct tool calls | 0-10 | 11-15 | 16+ |
| Large file reads | 0-2 | 3-4 | 5+ |
| Sub-agent delegations | 0-5 | 6-8 | 9+ |

**If ANY metric enters Yellow Zone**: Assess remaining work
**If ANY metric enters Red Zone**: STOP and create checkpoint handoff

### Context

[Brief summary of previous phase completion - 2-3 sentences]

[Key findings or learnings from previous phase that inform this phase]

### Your Mission

[Clear, concise description of what this phase accomplishes]

### Work Items (max 7)

| # | Task | Delegate To | Output |
|---|------|-------------|--------|
| 1 | [Task description] | [agent] | [output file/location] |
| 2 | [Task description] | [agent] | [output file/location] |
| ... | ... | ... | ... |

### Agent Prompts

#### Task 1: [Task Name]

**Delegate to**: [agent-name]

**Prompt**:
```
[Copy-paste ready prompt for the sub-agent]
```

**Output**: [expected output location]

[Repeat for each delegated task]

### Critical Patterns

[Include 2-5 code examples showing key patterns or gotchas for this phase]

**Pattern Name**:
```typescript
// Example code showing the pattern
```

### Reference Files

| Purpose | Path | Notes |
|---------|------|-------|
| Pattern reference | `path/to/reference.ts` | What pattern it demonstrates |
| Domain model | `path/to/model.ts` | What to reference |
| Shared utilities | `path/to/shared.ts` | What utilities are available |

### Verification

After each sub-task completion:

```bash
# Type check (if code modified)
bun run check --filter @beep/[package]

# Lint (if code modified)
bun run lint:fix --filter @beep/[package]

# Tests (if tests added)
bun run test --filter @beep/[package]
```

### Success Criteria

- [ ] [Specific, measurable completion item 1]
- [ ] [Specific, measurable completion item 2]
- [ ] Type check passes (if applicable)
- [ ] Tests pass (if applicable)
- [ ] `REFLECTION_LOG.md` updated with Phase [N] learnings
- [ ] `handoffs/HANDOFF_P[N+1].md` created
- [ ] `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` created

### Handoff Document

Read full context in: `specs/[SPEC_NAME]/handoffs/HANDOFF_P[N].md`

### Next Phase

After completing Phase [N]:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P[N+1].md` (context document)
3. Create `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)

Phase [N+1] covers: [Brief description of next phase scope]

---

## Checkpoint Protocol

**If you reach Yellow Zone (any metric at 75%)**:
1. Assess: How much work remains?
2. If < 30% remaining: Continue cautiously
3. If > 30% remaining: Create checkpoint

**If you reach Red Zone (any metric at max)**:
1. STOP current work immediately
2. Create `handoffs/HANDOFF_P[N]_CHECKPOINT.md`:
   - What was completed
   - What is in progress
   - What remains
   - Context budget status
3. Either continue in new session OR hand off

**Checkpoint Handoff Format**:
```markdown
# Phase [N] Checkpoint

**Created**: [timestamp]
**Reason**: [Context budget metric that triggered checkpoint]

## Completed
- [x] Task 1: [description]
- [x] Task 2: [description]

## In Progress
- [ ] Task 3: [description] - [current state]

## Remaining
- [ ] Task 4: [description]
- [ ] Task 5: [description]

## Context Budget at Checkpoint
- Direct tool calls: [X]/20
- Large file reads: [X]/5
- Sub-agent delegations: [X]/10

## Recovery Notes
[Any important context for resumption]
```
