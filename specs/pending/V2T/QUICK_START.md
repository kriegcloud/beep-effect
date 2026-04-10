# V2T Canonical Spec - Quick Start

## Fresh Session Flow

1. Start the main session as the phase orchestrator. Prefer `codex -p v2t_orchestrator` when available.
2. Run `bun run codex:hook:session-start`.
3. Read [README.md](./README.md).
4. Read [outputs/manifest.json](./outputs/manifest.json) and trust `active_phase` plus `active_phase_assets`.
5. Read [prompts/README.md](./prompts/README.md).
6. Read [../../../.codex/config.toml](../../../.codex/config.toml) and [../../../.codex/agents/README.md](../../../.codex/agents/README.md) so the available specialist agents are explicit.
7. Read `AGENTS.md`, [../../../.patterns/jsdoc-documentation.md](../../../.patterns/jsdoc-documentation.md), [../../../standards/effect-first-development.md](../../../standards/effect-first-development.md), [../../../standards/schema-first.inventory.jsonc](../../../standards/schema-first.inventory.jsonc), and [../../../tooling/configs/src/eslint/SchemaFirstRule.ts](../../../tooling/configs/src/eslint/SchemaFirstRule.ts).
8. Use the `effect-first-development` and `schema-first-development` skills when they are available in-session.
9. Read [outputs/grill-log.md](./outputs/grill-log.md) for locked package-shape decisions.
10. Use [outputs/codex-plan-mode-prompt.md](./outputs/codex-plan-mode-prompt.md) when bootstrapping a fresh Codex session.
11. Read [handoffs/HANDOFF_P0-P4.md](./handoffs/HANDOFF_P0-P4.md) and [handoffs/P0-P4_ORCHESTRATOR_PROMPT.md](./handoffs/P0-P4_ORCHESTRATOR_PROMPT.md).
12. Open the active phase handoff and active phase orchestrator prompt from `active_phase_assets`.
13. Read prior phase artifacts that constrain the active phase.
14. If command, task, or ownership claims are in scope, read the root plus workspace `package.json` and `turbo.json` files before trusting the package docs.
15. Execute only the active phase as the orchestrator and stop at its exit gate.
16. Update the active phase artifact and [outputs/manifest.json](./outputs/manifest.json) before exiting.

## Active Phase Resolver

- Use `outputs/manifest.json` as the only authority for `active_phase`.
- Use `active_phase_assets` to resolve the matching handoff, orchestrator prompt, output artifact, and trackers without guessing.
- Do not infer the active phase from status prose inside the markdown artifacts.
- When the active phase is `p0`, treat [outputs/grill-log.md](./outputs/grill-log.md) as an active tracker, not optional history.

## Phase Session Model

- The active phase session is always the orchestrator.
- Use sub-agents only after the orchestrator has formed a local plan.
- Keep worker write scopes disjoint.
- Use [prompts/ORCHESTRATOR_OPERATING_MODEL.md](./prompts/ORCHESTRATOR_OPERATING_MODEL.md) and [prompts/PHASE_DELEGATION_PROMPTS.md](./prompts/PHASE_DELEGATION_PROMPTS.md) when delegating.
- Use [../../../.codex/agents/README.md](../../../.codex/agents/README.md) to choose the right Effect v4 specialist.

## If You Are Editing This Package

- Update [outputs/manifest.json](./outputs/manifest.json) when routing, command gates, or validator expectations change.
- Update [REFLECTION_LOG.md](./REFLECTION_LOG.md) when package-local structure, operator guidance, or validator behavior changes.
- Append [outputs/grill-log.md](./outputs/grill-log.md) only when you are locking a new package-shape decision or default.
- Run the package-local spec gate before you stop.

## Combined Router

- Combined handoff: [handoffs/HANDOFF_P0-P4.md](./handoffs/HANDOFF_P0-P4.md)
- Combined orchestration prompt: [handoffs/P0-P4_ORCHESTRATOR_PROMPT.md](./handoffs/P0-P4_ORCHESTRATOR_PROMPT.md)
- Fresh-session entry prompt: [outputs/codex-plan-mode-prompt.md](./outputs/codex-plan-mode-prompt.md)
- Spec validator: [outputs/validate-spec.mjs](./outputs/validate-spec.mjs)
- Delegation kit: [prompts/README.md](./prompts/README.md)

## Phase Table

| Phase | Handoff | Prompt | Artifact |
|---|---|---|---|
| P0 | [HANDOFF_P0.md](./handoffs/HANDOFF_P0.md) | [P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md) | [RESEARCH.md](./RESEARCH.md) |
| P1 | [HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | [P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md) | [DESIGN_RESEARCH.md](./DESIGN_RESEARCH.md) |
| P2 | [HANDOFF_P2.md](./handoffs/HANDOFF_P2.md) | [P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md) | [PLANNING.md](./PLANNING.md) |
| P3 | [HANDOFF_P3.md](./handoffs/HANDOFF_P3.md) | [P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md) | [EXECUTION.md](./EXECUTION.md) |
| P4 | [HANDOFF_P4.md](./handoffs/HANDOFF_P4.md) | [P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md) | [VERIFICATION.md](./VERIFICATION.md) |

## Active Inputs

- [outputs/v2t_app_notes.html](./outputs/v2t_app_notes.html)
- [outputs/V2_animination_V2T.md](./outputs/V2_animination_V2T.md)
- `apps/V2T`
- `packages/VT2`
- shared UI speech input in `packages/common/ui/src/components/speech-input.tsx`
- `apps/V2T/scripts/build-sidecar.ts`
- root Graphiti commands and proxy tooling

## Default Starting Point

Unless a stronger user instruction overrides it, the package assumes the first implementation slice should convert the existing `apps/V2T` shell into a local-first workspace that can:

- capture or ingest a conversation
- create structured transcript/session artifacts
- retrieve memory context through an explicit adapter seam
- configure a composition run
- produce export-ready composition packets and artifact records
- do so by extending the current `@beep/VT2` control plane instead of inventing a second app-local server

## Conformance Gate Summary

### When Editing This Spec Package

- `git diff --check -- specs/pending/V2T`
- `node specs/pending/V2T/outputs/validate-spec.mjs`

Do not treat root `bun run lint:markdown` as sufficient here because `.markdownlint-cli2.jsonc` currently ignores `specs/**`.

### When Planning Or Implementing Code

- `bunx turbo run check --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run test --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run build --filter=@beep/v2t --filter=@beep/VT2`
- `bun run --cwd apps/V2T lint`
- `bun run lint:effect-laws`
- `bun run lint:jsdoc`
- `bun run check:effect-laws-allowlist`
- `bun run lint:schema-first`
- `bun run docgen` when exported APIs or JSDoc examples changed

Important notes:

- the live app workspace package name is `@beep/v2t`, not the stale uppercase
  app filter
- `@beep/VT2` has no package-local `lint` or `docgen` task, so VT2 conformance must be proven through the repo-law commands above
- use `bun run --cwd apps/V2T lint` for the targeted app lint gate
- do not substitute `turbo run lint --filter=@beep/v2t`, because dependency
  lint expansion still reaches the nonexistent `@beep/VT2#lint` task
