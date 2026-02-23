# Reflection Log: Unified AI Tooling (.beep)

## P0 - Preliminary Research and Constraint Freeze (2026-02-23)

### What worked
- Starting from completed-spec patterns kept structure consistent and handoff-ready.
- Primary vendor docs were enough to close most ambiguity around MCP, AGENTS layering, and JetBrains support.
- Decision review before implementation exposed hidden conflicts early (AGENTS freshness requirement vs deferred hook wiring).

### What we learned
- Interop momentum exists, but full cross-tool parity still requires adapters.
- AGENTS.md standardization helps, but `CLAUDE.md` compatibility is still required.
- JetBrains has broader scope than project rules alone (MCP config + prompt library + indexing controls).
- JSON targets need sidecar metadata for managed state because inline comment markers are not portable.

### What failed / constraints hit
- Some docs (Cursor and parts of Claude/Codex pages) are dynamic, so extraction confidence varies by page section.
- AGENTS memory protocol (`search_memory_facts`, `add_memory`) could not be called directly in this runtime because no Graphiti MCP tool endpoint is exposed in-tool.

### Methodology notes
- Keep claims source-backed and mark low-confidence items explicitly.
- Prefer deterministic full-file ownership for managed targets; avoid implicit merge magic.
- Separate design contracts from branch-specific rollout constraints (CI/hooks deferred, semantics not deferred).

## P0b - Comprehensive Spec Review Closure (2026-02-23)

### What changed
- Integrated 12 decision answers into ADRs, handoffs, and phase gates.
- Added `outputs/comprehensive-review.md` to surface remaining pre-execution unknowns.
- Locked packaging recommendation to `tooling/beep-sync` runtime + `.beep/` data.

### Remaining focus areas before coding
- Lock SDK wiring details against the chosen auth policy (desktop local + service-account automation).
- Define adapter fixtures for JetBrains prompt-library managed outputs.
- Encode AGENTS generation over every workspace package in P1 schema/compile rules.
