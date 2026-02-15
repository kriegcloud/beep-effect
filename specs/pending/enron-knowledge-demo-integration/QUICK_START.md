# Enron Knowledge Demo Integration Quick Start

> Fast-start checklist for this spec.

---

## 1) Read Core Spec Docs

- `README.md`
- `MASTER_ORCHESTRATION.md`
- `RUBRICS.md`

## 2) Start from Phase 1 Handoff + Prompt

- `handoffs/HANDOFF_P1.md`
- `handoffs/P1_ORCHESTRATOR_PROMPT.md`

## 3) Produce Discovery Outputs First

- `outputs/codebase-context.md`
- `outputs/current-vs-target-matrix.md`

## 4) Respect Locked Decisions

- Curated scenarios only
- Explicit `Ingest Scenario`
- Full-thread extraction with deterministic cap (25 docs)
- Org-scoped persistence
- `ENABLE_ENRON_KNOWLEDGE_DEMO` gate

## 5) Verify Early, Not Just At The End

```bash
bun run check --filter @beep/todox
bun run check --filter @beep/server
bun run check --filter @beep/runtime-server
bun run check --filter @beep/knowledge-server
```

Then run tests for touched packages before phase handoff.
