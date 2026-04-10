# P0-P4 Handoff - `V2T`

## Objective

Carry the V2T canonical spec through the P0-P4 sequence without reopening locked package-shape decisions unless conflicting repo evidence requires it.

## Mode Handling

If Plan mode is available and active, do not edit spec artifacts yet. First read the required inputs, confirm which defaults are already locked, resolve remaining ambiguities through non-mutating exploration, and produce a decision-complete phase plan. Only write or refine the current phase output artifact when operating outside Plan mode.

## Phase Agent Model

- The active phase session is always the phase orchestrator.
- The orchestrator forms a local plan before delegating.
- Use sub-agents only for bounded parallel work.
- Keep write scopes disjoint and assume a shared worktree unless explicit
  isolation is available.
- The orchestrator owns integration, gate evidence, and artifact updates.
- Use `prompts/ORCHESTRATOR_OPERATING_MODEL.md` and
  `prompts/PHASE_DELEGATION_PROMPTS.md` when delegation helps.
- Sub-agents do not own phase closure, manifest authority, or scope expansion.

## Required Read Order

1. [README.md](../README.md)
2. [outputs/manifest.json](../outputs/manifest.json)
3. [outputs/grill-log.md](../outputs/grill-log.md)
4. `../../../../AGENTS.md`
5. `../../../../.patterns/jsdoc-documentation.md`
6. `../../../../standards/effect-first-development.md`
7. `../../../../standards/schema-first.inventory.jsonc`
8. `../../../../tooling/configs/src/eslint/SchemaFirstRule.ts`
9. `../../../../apps/V2T/package.json`
10. `../../../../packages/VT2/package.json`
11. `../prompts/ORCHESTRATOR_OPERATING_MODEL.md`
12. `../prompts/PHASE_DELEGATION_PROMPTS.md`
13. the current phase output
14. the relevant repo seams in `apps/V2T` and `packages/VT2`
15. preserved raw inputs under `outputs/` only when deeper evidence is needed
16. the current phase handoff and matching phase orchestrator prompt

## Phase Sequence

| Phase | Focus | Output | Handoff | Orchestrator |
|---|---|---|---|---|
| P0 | Research | [RESEARCH.md](../RESEARCH.md) | [HANDOFF_P0.md](./HANDOFF_P0.md) | [P0_ORCHESTRATOR_PROMPT.md](./P0_ORCHESTRATOR_PROMPT.md) |
| P1 | Design Research | [DESIGN_RESEARCH.md](../DESIGN_RESEARCH.md) | [HANDOFF_P1.md](./HANDOFF_P1.md) | [P1_ORCHESTRATOR_PROMPT.md](./P1_ORCHESTRATOR_PROMPT.md) |
| P2 | Planning | [PLANNING.md](../PLANNING.md) | [HANDOFF_P2.md](./HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./P2_ORCHESTRATOR_PROMPT.md) |
| P3 | Execution | [EXECUTION.md](../EXECUTION.md) | [HANDOFF_P3.md](./HANDOFF_P3.md) | [P3_ORCHESTRATOR_PROMPT.md](./P3_ORCHESTRATOR_PROMPT.md) |
| P4 | Verification | [VERIFICATION.md](../VERIFICATION.md) | [HANDOFF_P4.md](./HANDOFF_P4.md) | [P4_ORCHESTRATOR_PROMPT.md](./P4_ORCHESTRATOR_PROMPT.md) |

## Constraints

- Preserve the exact root-level phase artifact names already locked in the package.
- Use the current `apps/V2T` plus `packages/VT2` shell-and-sidecar pair unless a phase artifact explicitly documents a migration.
- Verify workspace identity from the manifests before writing Turbo filter
  commands. The current names are `@beep/v2t` and `@beep/VT2`.
- Do not invent an app-local server path when the existing `@beep/VT2` control plane can carry the slice.
- Preserve the raw PRD and legacy notes under `outputs/`.
- Enforce the conformance matrix from `README.md`; do not claim a gate passed without recording the concrete command result.
- Treat `outputs/validate-spec.mjs` plus `git diff --check -- specs/pending/V2T` as the package-local spec gate because root markdown lint ignores `specs/**`.
- Use the custom agents under `.codex/config.toml` only as workers or auditors; do not let them replace the phase orchestrator.
- Run the Graphiti preflight when the MCP is available, and document fallback
  behavior instead of silently skipping memory context.
- Stop at the active phase exit gate instead of silently rolling forward.

## Evidence Rules

- Record gate outcomes in the active phase artifact, not in the handoff itself.
- Distinguish `planned`, `passed`, `failed`, `blocked`, `not run`, and `not applicable`; do not imply that a required gate passed just because it is listed.
- Treat worker reports as evidence inputs that still require orchestrator review and integration.
- If a later phase finds an unresolved earlier-phase assumption, stop and send it back rather than normalizing the mismatch.

## Cross-Phase Stop Conditions

- Stop if the current phase would need to reopen product shape that belongs to P0.
- Stop if the current phase would need to invent system contracts that belong to P1.
- Stop if the current phase would need to implement work that belongs to P3 while still operating in P0, P1, or P2.
- Stop if the current phase would need to make a readiness call before P4.
- Stop if delegation would erase orchestrator ownership through overlapping scopes or unreviewed worker outputs.

## Exit Condition

This handoff is complete when the current phase output is internally consistent with the README, the manifest, the repo seams it names, and the conformance gates it claims, and when the next phase can proceed without reopening settled defaults.
