# Quick Start

> 5-minute guide to starting lexical Effect alignment work.

---

## Before You Begin

**Verify you are an ORCHESTRATOR**:
- You coordinate sub-agents
- You do NOT write code directly
- You do NOT research code directly
- You read only compressed summaries and checklists

---

## Starting a Phase

### 1. Read the Phase Definition

```
MASTER_ORCHESTRATION.md → Phase [N] section
```

### 2. Prepare Agent Prompts

Check `agent-prompts/` for:
- `P[N]-[category]-discovery.md`
- `P[N]-code-writer.md`

### 3. Deploy Discovery Agents

```
Deploy 4 codebase-researcher agents in parallel:
- Batch 1: nodes/, plugins/A*-F*
- Batch 2: plugins/G*-M*
- Batch 3: plugins/N*-Z*
- Batch 4: everything else
```

### 4. Wait for Discovery

Each agent creates: `outputs/P[N]-discovery-[batch].md`

### 5. Consolidate

Deploy consolidator agent to create: `outputs/P[N]-MASTER_CHECKLIST.md`

### 6. Execute in Batches

Deploy effect-code-writer agents:
- Batch size: 5 files per batch
- Wait for batch completion before next batch
- Reference: `agent-prompts/P[N]-code-writer.md`

### 7. Verify

```bash
bun run build
bun run check
bun run lint:fix
bun run lint
```

### 8. Reflect & Handoff

```
Deploy reflector agent
Update REFLECTION_LOG.md
Create handoffs/HANDOFF_P[N+1].md
Create handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md
```

---

## Quick Commands

```bash
# Quality checks
bun run build
bun run check
bun run lint:fix
bun run lint

# Targeted type check (if full check is too slow)
bun tsc --noEmit apps/todox/src/app/lexical/path/to/file.ts
```

---

## Context Limits

If you reach **50% context**:

1. Stop current work
2. Create `handoffs/P[N][a-z]_ORCHESTRATOR_PROMPT.md`
3. Document progress and remaining work
4. End session

---

## File Locations

| What | Where |
|------|-------|
| Spec root | `specs/lexical-effect-alignment/` |
| Agent prompts | `specs/lexical-effect-alignment/agent-prompts/` |
| Discovery outputs | `specs/lexical-effect-alignment/outputs/P[N]-discovery-*.md` |
| Master checklists | `specs/lexical-effect-alignment/outputs/P[N]-MASTER_CHECKLIST.md` |
| Handoffs | `specs/lexical-effect-alignment/handoffs/` |
| Target code | `apps/todox/src/app/lexical/` |

---

## Phase Summary

| Phase | What to Replace | With |
|-------|-----------------|------|
| P1 | Array methods | `effect/Array` |
| P2 | String methods | `effect/String` |
| P3 | `new Set()` | `effect/HashSet` |
| P4 | `new Map()` | `effect/HashMap` |
| P5 | `throw new Error()` | `S.TaggedError` |
| P6 | `JSON.parse/stringify` | `S.parseJson` |
| P7 | Promise patterns | Effect runtime |
| P8 | Raw regex | `Str.match` |
| P9 | `switch` | `effect/Match` |
| P10 | `new Date()` | `effect/DateTime` |
| P11 | Nullable returns | `effect/Option` |

---

## Emergency Procedures

### Build Fails After Execution

1. Check error messages for specific files
2. Deploy single code-writer agent to fix
3. Re-run build

### Too Many Violations

If master checklist has >100 violations:
1. Split phase into sub-phases (P1a, P1b, etc.)
2. Create intra-phase handoffs
3. Execute sub-phases sequentially

### Agent Produces Bad Output

1. Document issue in REFLECTION_LOG.md
2. Improve agent prompt in `agent-prompts/`
3. Re-deploy agent with improved prompt
