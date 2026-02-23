# Validation & Dry Runs

> Pre-flight verification and dry run protocols for validating spec structure before full execution.

---

## Overview

This pattern covers two validation approaches:
1. **Pre-flight Verification**: Verify external API contracts before implementation
2. **Dry Runs**: Test spec structure with representative tasks before full execution

---

## Pre-flight Verification

Before implementing any phase that wraps external APIs (Better Auth, Stripe, etc.), verify the API contract.

### LSP Hover Check

```typescript
// Pre-flight: Verify method signatures before implementation
// In editor, hover over: client.somePlugin.someMethod
// Expected: (params: { field: Type }) => Promise<{ data, error }>
```

### Runtime Sample (When Docs Are Unclear)

```typescript
// Temporary debug code - remove after verification
const response = await client.somePlugin.someMethod({ testParam: "value" });
console.log("Response shape:", JSON.stringify(response, null, 2));
```

### Verification Protocol

1. **Check official docs first** - Most accurate source
2. **LSP hover second** - Confirms TypeScript types
3. **Runtime sample last** - Ground truth when docs/types diverge
4. **Update spec immediately** - Document any deviations found

---

## Phase Validation: Dry Runs

Before executing complex phases with multiple sub-agents, perform a validation dry run to test the spec structure and identify issues early.

### When to Use Dry Runs

Use dry runs for:
- Phases with 3+ parallel sub-agent tasks
- First-time use of new handler patterns or architectures
- Specs where prompt clarity is uncertain
- High-risk changes where rollback is expensive

### Dry Run Protocol

1. **Select Representative Tasks** - Choose 2-3 tasks covering different patterns (e.g., with-payload handler, no-payload handler, complex transformation)
2. **Spawn Sub-Agents** - Each agent implements their task following the spec and produces a reflection document
3. **Synthesize Findings** - Combine individual reflections into actionable spec improvements
4. **Update Spec** - Fix issues discovered during dry run (prompts, examples, decision criteria)
5. **Rollback Code** - Remove implementation artifacts, keep spec improvements and reflections

### Dry Run Artifacts

Store all dry run outputs in `specs/[name]/dry-run/`:

```
specs/[name]/dry-run/
├── REFLECTION_[task-name].md   # Per-agent reflection
├── SYNTHESIS.md                 # Combined findings
└── ORCHESTRATOR_REFLECTION.md  # Repository-level improvements
```

**Artifact Retention**: Keep dry run artifacts in version control. They document validation decisions and prevent regression of spec quality.

### Example Dry Run Flow

```
1. Orchestrator identifies Phase 2 has 6 parallel handler tasks
2. Select 3 representative tasks (no-payload, with-payload, complex)
3. Spawn 3 sub-agents, each produces:
   - Implementation (to be discarded)
   - REFLECTION_[task].md (to be kept)
4. Synthesize → Update spec prompts + examples
5. Git reset implementation, commit spec improvements
6. Proceed with full Phase 2 execution
```

---

## Automated Dry Run Validation Protocol

For specs with complex phases, use this structured validation approach.

### Step 1: Parse Phase Handoff

Extract work items from `HANDOFF_P[N].md`:
- Identify all implementation tasks
- Classify by pattern type (handler, service, test, migration, etc.)
- Count total items and assess scope

```bash
# Extract task count from handoff
grep -c "^\s*-\s*\[" handoffs/HANDOFF_P[N].md
```

### Step 2: Select Representative Sample

Choose 2-3 tasks covering different patterns:

| Selection Criteria | Example |
|-------------------|---------|
| Simple/baseline | No-payload handler, basic query |
| Medium complexity | With-payload handler, CRUD operation |
| High complexity | Multi-step transformation, nested schemas |

**Priority**: Select tasks that are most likely to reveal spec ambiguities.

### Step 3: Spawn Validation Agents

For each selected task, spawn a sub-agent:

```markdown
Implement [task-name] following HANDOFF_P[N].md specification.

After implementation, produce REFLECTION_[task-name].md documenting:
1. What was clear in the specification
2. What required interpretation or assumptions
3. What was missing or ambiguous
4. Suggested spec improvements
```

Each agent produces:
- Implementation artifacts (to be discarded)
- `dry-run/REFLECTION_[task-name].md` (to be kept)

### Step 4: Synthesize Findings

Combine individual reflections into actionable improvements:

```markdown
# Dry Run Synthesis

## Common Issues (3/3 agents reported)
- [Issue 1]: Suggested fix: [fix]
- [Issue 2]: Suggested fix: [fix]

## Spec Improvements Required
1. Update [section] with [clarification]
2. Add example for [pattern]
3. Clarify [ambiguous instruction]

## Prompts to Update
- HANDOFF_P[N].md: [changes]
- P[N]_ORCHESTRATOR_PROMPT.md: [changes]
```

Output: `dry-run/SYNTHESIS.md`

### Step 5: Rollback/Proceed Decision

Evaluate validation results:

| Failure Rate | Action |
|--------------|--------|
| ≤30% tasks fail | Proceed with learnings applied |
| >30% tasks fail | Revise spec and re-validate |

**Failure criteria**: Task counts as failed if:
- Implementation required assumptions not in spec
- Schema verification failed
- Pattern choice was ambiguous

**Proceed protocol**:
1. Apply improvements from SYNTHESIS.md to spec files
2. Git reset implementation artifacts
3. Commit spec improvements only
4. Continue with full phase execution

**Revise protocol**:
1. Apply improvements from SYNTHESIS.md
2. Re-scope the phase if needed (split into sub-phases)
3. Re-run validation with 2-3 different tasks
4. Only proceed when ≤30% failure rate achieved

---

## Decision Matrix: When to Validate

| Condition | Pre-flight | Dry Run |
|-----------|------------|---------|
| Wrapping external API | Required | Optional |
| 3+ parallel sub-agent tasks | Optional | Recommended |
| New handler pattern | Optional | Recommended |
| High rollback cost | Recommended | Required |
| Unclear requirements | N/A | Required |

---

## Related Documentation

- [Spec Guide](../README.md) - Main spec workflow
- [HANDOFF_STANDARDS](../HANDOFF_STANDARDS.md) - Context transfer standards
- [reflection-system](./reflection-system.md) - Pattern extraction workflow
