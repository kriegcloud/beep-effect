# Codex Phase Entry Prompt

Use this as the pasteable entry prompt for a fresh Codex session working inside the V2T canonical spec package.

```markdown
Use the canonical phased spec package at `specs/pending/V2T/`.

Read these files first:
- `AGENTS.md`
- `specs/pending/V2T/README.md`
- `specs/pending/V2T/QUICK_START.md`
- `specs/pending/V2T/AGENT_PROMPTS.md`
- `specs/pending/V2T/outputs/manifest.json`
- `specs/pending/V2T/outputs/grill-log.md`
- `specs/pending/V2T/handoffs/HANDOFF_P0-P4.md`
- `specs/pending/V2T/handoffs/P0-P4_ORCHESTRATOR_PROMPT.md`

Then:
- determine the active phase from `outputs/manifest.json`
- read only the matching phase handoff and matching phase orchestrator prompt
- execute only that phase
- write or refine the named phase artifact
- update `outputs/manifest.json` when the phase state changes
- update `outputs/grill-log.md` when the active phase is `p0`
- stop at the phase exit gate and wait for explicit instruction before moving to the next phase

Start by gathering repo context with:
- `bun run codex:hook:session-start`

Prefer `rg` / `rg --files` and parallel exploration.

Rules that apply in every phase:
- preserve the raw PRD and legacy notes under `outputs/`
- treat `apps/V2T` and `packages/VT2` as the current shell-and-sidecar pair unless a phase artifact explicitly documents a migration
- do not invent an app-local server path if the existing `@beep/VT2` control plane can carry the slice
- keep provider logic behind explicit adapters
- summarize verification and residual risk in the active phase artifact

If the active phase is `p0`:
- use the `grill-me` skill when meaningful product or architecture ambiguity remains
- log every new locked decision in `outputs/grill-log.md`

If the active phase is `p3` or `p4`:
- verify both `apps/V2T` and `packages/VT2` when the implemented slice changes both surfaces
- distinguish shipped behavior from deferred provider ambition explicitly
```

## Phase Router

- Combined router: `handoffs/P0-P4_ORCHESTRATOR_PROMPT.md`
- P0: `handoffs/P0_ORCHESTRATOR_PROMPT.md`
- P1: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
- P2: `handoffs/P2_ORCHESTRATOR_PROMPT.md`
- P3: `handoffs/P3_ORCHESTRATOR_PROMPT.md`
- P4: `handoffs/P4_ORCHESTRATOR_PROMPT.md`
