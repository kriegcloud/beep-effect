# Quick Start

> 5-minute guide to launching Storybook implementation.

---

## TL;DR

1. Copy prompt from `handoffs/P1_ORCHESTRATOR_PROMPT.md`
2. Paste into new Claude session
3. Let orchestrator launch sub-agents
4. Review outputs in `outputs/`
5. Continue with next phase prompt

---

## Phase Launch Commands

### Phase 1: Research
```
Copy: specs/storybook-implementation/handoffs/P1_ORCHESTRATOR_PROMPT.md
```

### Phase 2-5: Continue Pattern
Each phase creates its own `P[N+1]_ORCHESTRATOR_PROMPT.md` for the next phase.

---

## Orchestrator Rules (Critical)

The orchestrator MUST:
- Delegate ALL research to `codebase-researcher`
- Delegate ALL external lookups to `web-researcher`
- Delegate ALL code writing to `effect-code-writer`
- Only read compressed outputs, never source files
- Create handoffs before ending each phase

---

## Key Files

| File | Purpose |
|------|---------|
| `README.md` | Spec overview and success criteria |
| `MASTER_ORCHESTRATION.md` | Detailed phase workflows |
| `AGENT_PROMPTS.md` | Sub-agent prompt templates |
| `RUBRICS.md` | Evaluation criteria |
| `handoffs/` | Phase transition documents |
| `outputs/` | Sub-agent deliverables |

---

## Verification (After Each Phase)

```bash
# Check outputs exist
ls specs/storybook-implementation/outputs/

# After Phase 4+
bun run storybook --filter=@beep/ui
```

---

## Stuck?

1. Check `REFLECTION_LOG.md` for previous learnings
2. Re-read `MASTER_ORCHESTRATION.md` for phase requirements
3. Ask user for clarification via `AskUserQuestion`
