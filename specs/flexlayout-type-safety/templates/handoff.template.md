# FlexLayout Type Safety Handoff — P[N] → P[N+1]

> Session ended: [TIMESTAMP]
> Next session should start with: [STARTING_POINT]

---

## Session Summary

### Metrics
| Metric | Start | End | Delta |
|--------|-------|-----|-------|
| Files completed | X | Y | +Z |
| Total issues fixed | X | Y | +Z |
| Build status | Pass | Pass | — |

### Work Completed
| File | Status | Issues Fixed | Agent |
|------|--------|--------------|-------|
| [FILE_1] | completed | 5 | effect-schema-expert |
| [FILE_2] | completed | 3 | effect-predicate-master |

### Work In Progress
| File | Current State | Remaining Issues |
|------|---------------|------------------|
| [FILE] | Line 150, fixing native methods | 4 |

---

## Lessons Learned

### What Worked Well
1. [Specific technique that was effective]
2. [Another effective approach]

### What Needed Adjustment
1. [Issue encountered] → [How it was resolved]
2. [Another issue] → [Resolution]

### Prompt Improvements Made
```markdown
# Original prompt fragment
[OLD_TEXT]

# Improved prompt fragment
[NEW_TEXT]
```

---

## Remaining Work

### Next Batch (Recommended)
| Priority | File | Est. Issues | Recommended Agent |
|----------|------|-------------|-------------------|
| 1 | [FILE] | ~X | effect-schema-expert |
| 2 | [FILE] | ~X | effect-predicate-master |
| 3 | [FILE] | ~X | effect-predicate-master |

### Blocked Items
| File | Blocker | Resolution Needed |
|------|---------|-------------------|
| [FILE] | [Description] | [What needs to happen] |

### Deferred Items
| File | Reason | When to Address |
|------|--------|-----------------|
| [FILE] | [Why deferred] | [Condition for addressing] |

---

## Updated Sub-Agent Prompts

### effect-schema-expert (if refined)
```markdown
[Updated prompt incorporating learnings]
```

### effect-predicate-master (if refined)
```markdown
[Updated prompt incorporating learnings]
```

---

## P[N+1] Orchestrator Prompt

Copy this prompt to start the next session:

```markdown
# FlexLayout Type Safety — P[N+1] Orchestrator

## Context from P[N]
You are continuing the FlexLayout type safety audit.

### Completed So Far
- Files completed: [LIST]
- Build status: Pass

### Starting Point
Begin with: [SPECIFIC_FILE_OR_TASK]

### Learnings to Apply
1. [Key learning from previous session]
2. [Another learning]

## Your Tasks

### Immediate: Complete In-Progress Work
[If any work was in progress]

### Then: Process Next Batch
[List files in priority order]

## Critical Rules
1. NEVER write code directly — use sub-agents
2. Verify after EVERY file
3. Log learnings to REFLECTION_LOG.md
4. Generate handoff if context filling up

## Verification Commands
```bash
bun run check && bun run build
```

## Begin
[Specific instruction for where to start]
```

---

## Verification State

Last successful verification:
```
[TIMESTAMP]
$ bun run check
[OUTPUT_SUMMARY]

$ bun run build
[OUTPUT_SUMMARY]
```

Uncommitted changes:
```
[git status output if relevant]
```

---

## Notes for Next Agent

[Any context, warnings, or tips that would help the next session be more effective]
