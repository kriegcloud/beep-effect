# enron-knowledge-demo-integration Handoff: Phase 1

> Context + constraints to start Phase 1.

---

## Context for Phase 1

### Working Context (≤2K tokens)

- Current task: Wire knowledge-demo to real Enron extraction, GraphRAG, and LLM meeting prep via runtime RPC
- Scope: This specification covers wire knowledge-demo to real enron extraction, graphrag, and llm meeting prep via runtime rpc.
- Success criteria:
  - [ ] Primary goal achieved
  - [ ] Outputs generated
  - [ ] Tests passing
  - [ ] Documentation updated
- Constraints:
  - Follow `AGENTS.md` guardrails
  - Avoid long-running processes without confirmation
  - Prefer incremental diffs + checkpoints

### Episodic Context (≤1K tokens)

- Phase 0 outcome: spec scaffolded (README + structure created)
- Next step: run Discovery and write outputs under `outputs/`

### Semantic Context (≤500 tokens)

- Repo constants: Bun + Effect-based codebase, strict lint/check/test gates
- Spec guide: `specs/_guide/README.md`
- Handoff standard: `specs/_guide/HANDOFF_STANDARDS.md`

### Procedural Context (links only)

- Entry prompt: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
- Orchestration: `MASTER_ORCHESTRATION.md` (complex specs)

## Context Budget Audit

Use `specs/_guide/HANDOFF_STANDARDS.md`:

- Direct tool calls: aim ≤ 10 (Yellow 11-15; Red 16+)
- Large file reads (>200 lines): aim ≤ 2 (Yellow 3-4; Red 5+)
- Sub-agent delegations: aim ≤ 5

If you hit Yellow/Red zone, create a checkpoint handoff rather than pushing through.

---

## Verification Commands

```bash
bun run lint
bun run check
bun run test
```
