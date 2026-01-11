# FlexLayout Type Safety — Master Orchestration

> Complete workflow for systematically auditing and improving type safety in the flexlayout-react module.

---

## Overview

This orchestration follows the [SPEC_CREATION_GUIDE](../SPEC_CREATION_GUIDE.md) agent-assisted workflow.

### Standard Agents (Per Phase)

| Phase | Agents | Purpose |
|-------|--------|---------|
| Discovery | `codebase-researcher` | Scan files, catalog patterns |
| Evaluation | `code-reviewer`, `architecture-pattern-enforcer` | Score against rubrics |
| Synthesis | `reflector`, `doc-writer` | Improve prompts, generate plans |
| Iteration | `reflector` | Continuous improvement |

### Domain Agents (For Fixes)

| Agent | Use For |
|-------|---------|
| `effect-schema-expert` | Schema validation, encode/decode patterns |
| `effect-predicate-master` | Type guards, narrowing, exhaustive checks |
| `effect-researcher` | API lookup, idiomatic patterns |

The orchestrator NEVER writes code directly. It:
1. Uses `codebase-researcher` to identify unsafe patterns
2. Uses `code-reviewer` to validate against rubrics
3. Selects the appropriate domain agent for fixes
4. Uses `reflector` to improve prompts after each batch

---

## Phase 0: Scaffolding (Complete)

This spec has been scaffolded with:
- `README.md` — Entry point
- `QUICK_START.md` — 5-minute execution
- `MASTER_ORCHESTRATION.md` — This document
- `AGENT_PROMPTS.md` — Sub-agent prompt templates
- `RUBRICS.md` — Unsafe pattern detection criteria
- `REFLECTION_LOG.md` — Accumulated learnings
- `templates/` — Output templates

---

## Phase 1: Discovery

**Objective**: Catalog all files and identify unsafe patterns without making changes.

**Primary Agent**: `codebase-researcher`

### Step 1.1: Generate File Inventory (codebase-researcher)

Create `outputs/codebase-context.md`:

```markdown
# FlexLayout File Checklist

## Model Files (14 files)
| File | Status | Unsafe Patterns | Agent | Notes |
|------|--------|-----------------|-------|-------|
| IJsonModel.ts | completed | Schema classes | effect-schema-expert | Already refactored |
| BorderNode.ts | completed | toJson mutations | effect-schema-expert | decodeUnknownSync added |
| TabNode.ts | completed | toJson mutations | effect-schema-expert | decodeUnknownSync added |
| Model.ts | pending | | | |
| TabSetNode.ts | pending | | | |
| RowNode.ts | pending | | | |
| BorderSet.ts | pending | | | |
| Node.ts | pending | | | |
| Actions.ts | pending | | | |
| Action.ts | pending | | | |
| Utils.ts | pending | | | |
| IDraggable.ts | pending | | | |
| IDropTarget.ts | pending | | | |
| ICloseType.ts | pending | | | |
| LayoutWindow.ts | pending | | | |

## View Files (18 files)
| File | Status | Unsafe Patterns | Agent | Notes |
|------|--------|-----------------|-------|-------|
| Layout.tsx | pending | | | |
| TabSet.tsx | pending | | | |
| Tab.tsx | pending | | | |
| TabButton.tsx | pending | | | |
| Row.tsx | pending | | | |
| Splitter.tsx | pending | | | |
| BorderTabSet.tsx | pending | | | |
| BorderTab.tsx | pending | | | |
| BorderButton.tsx | pending | | | |
| PopoutWindow.tsx | pending | | | |
| PopupMenu.tsx | pending | | | |
| DragContainer.tsx | pending | | | |
| Overlay.tsx | pending | | | |
| SizeTracker.tsx | pending | | | |
| TabButtonStamp.tsx | pending | | | |
| TabOverflowHook.tsx | pending | | | |
| ErrorBoundary.tsx | pending | | | |
| Icons.tsx | pending | | | |
| Utils.tsx | pending | | | |

## Utility Files (12 files)
| File | Status | Unsafe Patterns | Agent | Notes |
|------|--------|-----------------|-------|-------|
| index.ts | pending | | | |
| Types.ts | pending | | | |
| Attribute.ts | pending | | | |
| AttributeDefinitions.ts | pending | | | |
| DockLocation.ts | pending | | | |
| DropInfo.ts | pending | | | |
| I18nLabel.ts | pending | | | |
| Orientation.ts | pending | | | |
| Rect.ts | pending | | | |
| values.ts | pending | | | |
```

### Step 1.2: Scan Each File for Unsafe Patterns (codebase-researcher)

For each file, deploy `codebase-researcher` (or `effect-researcher` for Effect-specific patterns):

```markdown
Analyze the file at [FILE_PATH] and identify unsafe patterns:

1. **Type Safety Issues**:
   - `any` types
   - Type assertions (`as`, `!`)
   - Unchecked type casts
   - Missing null/undefined checks

2. **Effect Pattern Violations**:
   - Native array methods (.map, .filter, .find, .reduce)
   - Native string methods (.split, .includes, .startsWith)
   - Direct property access without Option
   - Mutations of readonly properties

3. **Error Handling Gaps**:
   - Unchecked optional access
   - Missing exhaustive switch/match
   - Silent failures (empty catch blocks)

Output format:
```json
{
  "file": "[FILE_PATH]",
  "patterns": [
    {
      "type": "any_type | type_assertion | native_method | unchecked_access | mutation",
      "location": "line:column",
      "code": "snippet",
      "severity": "critical | high | medium | low",
      "suggestedAgent": "effect-schema-expert | effect-predicate-master"
    }
  ]
}
```

Do NOT fix anything — analysis only.
```

### Step 1.3: Self-Reflection Checkpoint

After scanning all files, log to `REFLECTION_LOG.md`:
- Most common unsafe patterns
- Files with highest severity
- Any false positives in detection
- Improvements to scanning prompt

---

## Phase 2: Evaluation

**Objective**: Score and prioritize findings.

**Primary Agents**: `code-reviewer`, `architecture-pattern-enforcer`

### Step 2.1: Aggregate Findings (code-reviewer)

Create `outputs/guideline-review.md`:

```markdown
# FlexLayout Type Safety Evaluation

## Summary Statistics
| Metric | Count |
|--------|-------|
| Total files | 44 |
| Files with issues | X |
| Critical issues | X |
| High issues | X |
| Medium issues | X |
| Low issues | X |

## Priority Queue
| Rank | File | Critical | High | Medium | Low | Recommended Agent |
|------|------|----------|------|--------|-----|-------------------|
| 1 | model/Model.ts | 5 | 12 | 8 | 3 | effect-schema-expert |
| 2 | ... | | | | | |

## Pattern Distribution
| Pattern Type | Count | Primary Agent |
|--------------|-------|---------------|
| Native array methods | X | effect-predicate-master |
| Type assertions | X | effect-schema-expert |
| Unchecked access | X | effect-predicate-master |
| any types | X | effect-schema-expert |
```

### Step 2.2: Apply Rubrics

Score each file using `RUBRICS.md` criteria:
- **Serialization Safety**: Does toJson() validate output?
- **Mutation Safety**: Are mutations properly typed?
- **Access Safety**: Is optional access guarded?
- **Exhaustiveness**: Are switches/matches complete?

### Step 2.3: Self-Reflection Checkpoint

Log to `REFLECTION_LOG.md`:
- Were severity ratings accurate?
- Any patterns that need new rubric categories?
- Prioritization adjustments needed?

---

## Phase 3: Synthesis

**Objective**: Generate actionable plans and improve methodology.

**Primary Agents**: `reflector`, `doc-writer`

### Step 3.1: Prompt Improvement (reflector)

Before generating the plan, use `reflector` to analyze REFLECTION_LOG.md and improve prompts:

```
Use the reflector agent to analyze REFLECTION_LOG.md entries from Phase 1-2.

Output:
- Pattern analysis
- Prompt refinements for domain agents
- Anti-pattern warnings
- Methodology improvements

Apply improvements to AGENT_PROMPTS.md.
```

### Step 3.2: Create Remediation Plan (doc-writer)

Create `outputs/remediation-plan.md`:

```markdown
# FlexLayout Remediation Plan

## Execution Batches

### Batch 1: Model Serialization (High Impact)
| File | Issues | Agent | Estimated Complexity |
|------|--------|-------|---------------------|
| model/Model.ts | 28 | effect-schema-expert | High |
| model/TabSetNode.ts | 15 | effect-schema-expert | Medium |
| model/RowNode.ts | 12 | effect-schema-expert | Medium |

### Batch 2: Model Mutations
| File | Issues | Agent | Estimated Complexity |
|------|--------|-------|---------------------|
| model/Actions.ts | 20 | effect-predicate-master | High |
| model/Node.ts | 18 | effect-schema-expert | Medium |

### Batch 3: View Components
[...]

## Sub-Agent Prompts by Batch
[Include specific prompts from AGENT_PROMPTS.md]
```

### Step 3.2: Generate First Handoff

Create `handoffs/HANDOFF_P1.md` with:
- Context for Phase 4
- First batch tasks
- Sub-agent prompts
- Success criteria

---

## Phase 4+: Iterative Execution

**Objective**: Fix files in batches, capturing learnings.

**Primary Agents**: `reflector` (for handoffs), domain agents (for fixes)

### Execution Protocol

For each file in the current batch:

1. **Deploy Analysis Agent** (if not already scanned):
   ```
   Task tool → codebase-researcher or effect-researcher
   Prompt: "Analyze [FILE] for unsafe patterns. Output JSON."
   ```

2. **Select Fix Agent** based on dominant pattern:
   - Schema issues → `effect-schema-expert`
   - Predicate issues → `effect-predicate-master`

3. **Deploy Fix Agent** with targeted prompt from `AGENT_PROMPTS.md`

4. **Verify**:
   ```bash
   bun run check && bun run build
   ```

5. **Log Learnings** if anything unexpected:
   - Update `REFLECTION_LOG.md`
   - Refine prompts in `AGENT_PROMPTS.md` if needed

6. **Update Checklist**:
   - Mark file as `completed` or `blocked`
   - Note any remaining issues

### Batch Completion Protocol (reflector)

After each batch, use the `reflector` agent:

1. **Full Verification**:
   ```bash
   bun run lint:fix && bun run check && bun run build
   ```

2. **Deploy Reflector**:
   ```
   Use the reflector agent to analyze this batch's results.

   Input:
   - Files processed and outcomes
   - Errors encountered
   - Prompt effectiveness

   Output:
   - What worked / what didn't
   - Prompt improvements for AGENT_PROMPTS.md
   - HANDOFF_P[N+1].md for next session
   ```

3. **Generate Handoff** (if session ending):
   - Save to `handoffs/HANDOFF_P[N].md`
   - Include updated prompts from reflector analysis
   - List remaining work

### Iteration Loop

```
┌─────────────────────────────────────────────────────┐
│                  ITERATION LOOP                     │
├─────────────────────────────────────────────────────┤
│  1. Execute tasks from HANDOFF_P[N].md              │
│  2. Verify: bun run check && bun run build          │
│  3. Update REFLECTION_LOG.md                        │
│  4. Use reflector to generate HANDOFF_P[N+1].md     │
│  5. If work remains, go to step 1 with P[N+1]       │
└─────────────────────────────────────────────────────┘
```

---

## Orchestrator Critical Rules

1. **NEVER write code directly** — always use sub-agents
2. **Verify after EVERY file** — don't batch fixes without checking
3. **Log unusual patterns** — expand rubrics if new patterns emerge
4. **Generate handoff before context fills** — don't lose progress
5. **Refine prompts continuously** — use learnings to improve agents

---

## Sub-Agent Coordination

### Serial Execution (Required)
- Files within same directory (may have interdependencies)
- Changes that affect shared types

### Parallel Execution (Allowed)
- Independent utility files
- View components with no shared state

### Handoff Between Agents
When one agent identifies work for another:

```markdown
## Cross-Agent Handoff

The effect-schema-expert identified the following for effect-predicate-master:

File: model/Actions.ts:142
Pattern: Switch statement without exhaustive check
Code: `switch (action.type) { ... }`
Recommended: Add exhaustive match with Match.exhaustive
```

---

## Success Metrics

| Metric | Target | Verification |
|--------|--------|--------------|
| Files audited | 44/44 | Checklist complete |
| `any` types | 0 | `grep -r "any" src/flexlayout-react` |
| Native array methods | 0 | `grep -rE "\.(map|filter|find|reduce)\(" src/flexlayout-react` |
| Build status | Pass | `bun run build` |
| Type check status | Pass | `bun run check` |

---

## Reflection Integration

### Per-File Reflection (Quick)
After each file, ask:
- Did the fix work first try?
- Any unexpected type errors?
- Agent prompt clear enough?

### Per-Batch Reflection (Detailed)
After each batch, log to `REFLECTION_LOG.md`:
- Pattern frequency analysis
- Prompt effectiveness ratings
- Improvements applied
- Remaining challenges

### Per-Phase Reflection (Strategic)
At phase transitions:
- Overall progress assessment
- Methodology adjustments
- Prompt library updates

---

## Recovery Procedures

### Build Failure After Fix
1. Revert the file: `git checkout -- [FILE]`
2. Re-analyze with more context
3. Try alternative fix approach
4. Log failure mode to `REFLECTION_LOG.md`

### Agent Produces Invalid Code
1. Reject the change
2. Refine prompt with specific constraint
3. Re-deploy agent
4. Log prompt improvement to `AGENT_PROMPTS.md`

### Context Window Filling
1. Generate immediate handoff
2. Save to `handoffs/HANDOFF_P[N].md`
3. Include all state needed to resume
4. Start fresh session with handoff
