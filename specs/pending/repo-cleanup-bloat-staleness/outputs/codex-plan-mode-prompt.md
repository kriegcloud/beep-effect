# Codex Phase Entry Prompt

Use this as the pasteable entry prompt for a fresh Codex session working inside this cleanup spec package.

```markdown
Use the canonical phased spec package at `specs/pending/repo-cleanup-bloat-staleness/`.

Read these files first:
- `AGENTS.md`
- `specs/pending/repo-cleanup-bloat-staleness/README.md`
- `specs/pending/repo-cleanup-bloat-staleness/QUICK_START.md`
- `specs/pending/repo-cleanup-bloat-staleness/AGENT_PROMPTS.md`
- `specs/pending/repo-cleanup-bloat-staleness/outputs/manifest.json`
- `specs/pending/repo-cleanup-bloat-staleness/handoffs/HANDOFF_P0-P7.md`
- `specs/pending/repo-cleanup-bloat-staleness/handoffs/P0-P7_ORCHESTRATOR_PROMPT.md`

Then:
- determine the active phase from `outputs/manifest.json`
- read only the matching phase handoff and matching phase orchestrator prompt
- execute only that phase
- write or refine the named phase output
- update `outputs/cleanup-checklist.md`
- update `outputs/manifest.json` when phase state changes
- update `outputs/grill-log.md` when the active phase is P0
- stop at the phase exit gate and wait for explicit instruction before moving to the next phase

Start by gathering repo context with:
- `bun run codex:hook:session-start`
- `bun run trustgraph:status`

Use `bun run trustgraph:context -- --prompt "<targeted prompt>"` only if it will materially improve repo context.
Prefer `rg` / `rg --files` and parallel exploration.

Rules that apply in every phase:
- preserve historical, security, and research docs by default
- clean active surfaces and generated artifacts when they are stale
- treat managed commands as part of cleanup completeness
- follow the command matrix and phase output contract from `README.md`
- log out-of-phase findings instead of widening scope opportunistically
- follow the default commit cadence unless `outputs/p0-planning-and-document-classification.md` overrides it
- summarize verification and residual risk in the phase output
- do not push or merge without explicit confirmation

If the active phase is `p0`:
- use the `grill-me` skill immediately
- log every question, recommended answer, user answer, and evidence-backed resolution in `outputs/grill-log.md`
- create or refine `outputs/p0-planning-and-document-classification.md`

If the active phase is `p4`:
- build or refine `outputs/p4-ranked-candidate-inventory.md`
- present one candidate at a time
- do not delete a candidate until I answer `yes`
- when I answer `yes`, route the approved candidate into a fresh session using `prompts/CANDIDATE_EXECUTOR_PROMPT.md`
- after the executor cleanup finishes, record verification and the candidate commit, then stop and wait for confirmation before moving to the next candidate

If the active phase is `p6` or `p7`:
- keep the work focused on reuse-discovery tooling and its contracts
- do not treat the new tooling as permission for autonomous repo-wide edits
- preserve the tooling pilot boundary unless the user explicitly broadens it
```

## Phase Router

- Combined router: `handoffs/P0-P7_ORCHESTRATOR_PROMPT.md`
- P0: `handoffs/P0_ORCHESTRATOR_PROMPT.md`
- P1: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
- P2: `handoffs/P2_ORCHESTRATOR_PROMPT.md`
- P3: `handoffs/P3_ORCHESTRATOR_PROMPT.md`
- P4: `handoffs/P4_ORCHESTRATOR_PROMPT.md`
- P5: `handoffs/P5_ORCHESTRATOR_PROMPT.md`
- P6: `handoffs/P6_ORCHESTRATOR_PROMPT.md`
- P7: `handoffs/P7_ORCHESTRATOR_PROMPT.md`
