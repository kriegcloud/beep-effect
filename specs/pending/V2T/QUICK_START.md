# V2T Canonical Spec - Quick Start

## Fresh Session Flow

1. Start the main session as the phase orchestrator. Prefer `codex -p v2t_orchestrator` when available.
2. Read [README.md](./README.md).
3. Read [prompts/README.md](./prompts/README.md).
4. Read [../../../.codex/config.toml](../../../.codex/config.toml) and [../../../.codex/agents/README.md](../../../.codex/agents/README.md) so the available specialist agents are explicit.
5. Read `AGENTS.md`, [../../../.patterns/jsdoc-documentation.md](../../../.patterns/jsdoc-documentation.md), [../../../standards/effect-first-development.md](../../../standards/effect-first-development.md), [../../../standards/schema-first.inventory.jsonc](../../../standards/schema-first.inventory.jsonc), and [../../../tooling/configs/src/eslint/SchemaFirstRule.ts](../../../tooling/configs/src/eslint/SchemaFirstRule.ts).
6. Use the `effect-first-development` and `schema-first-development` skills when they are available in-session.
7. Run `bun run codex:hook:session-start` when useful, then do the Graphiti memory preflight if the MCP is available: `get_status`, then `search_memory_facts` with `group_ids` as `["beep-dev"]` or the JSON string `"[\"beep-dev\"]"` when the wrapper only accepts strings.
8. Read [outputs/manifest.json](./outputs/manifest.json) and trust `active_phase`.
9. Read [outputs/grill-log.md](./outputs/grill-log.md) for locked package-shape decisions.
10. Use [outputs/codex-plan-mode-prompt.md](./outputs/codex-plan-mode-prompt.md) when bootstrapping a fresh Codex session.
11. Read [handoffs/HANDOFF_P0-P4.md](./handoffs/HANDOFF_P0-P4.md) and [handoffs/P0-P4_ORCHESTRATOR_PROMPT.md](./handoffs/P0-P4_ORCHESTRATOR_PROMPT.md).
12. Open the active phase handoff from `handoffs/`.
13. Read prior phase artifacts that constrain the active phase.
14. Verify workspace identity from `apps/V2T/package.json` and `packages/VT2/package.json` before copying or editing any Turbo filter commands. The current package names are `@beep/v2t` and `@beep/VT2`.
15. Execute only the active phase as the orchestrator and stop at its exit gate.
16. Update the active phase artifact and [outputs/manifest.json](./outputs/manifest.json) before exiting.

## Phase Session Model

- The active phase session is always the orchestrator.
- Use sub-agents only after the orchestrator has formed a local plan.
- Keep worker write scopes disjoint. In the CLI workflow, assume workers share
  the same worktree unless explicit isolation exists.
- Use [prompts/ORCHESTRATOR_OPERATING_MODEL.md](./prompts/ORCHESTRATOR_OPERATING_MODEL.md) and [prompts/PHASE_DELEGATION_PROMPTS.md](./prompts/PHASE_DELEGATION_PROMPTS.md) when delegating.
- Use [../../../.codex/agents/README.md](../../../.codex/agents/README.md) to choose the right Effect v4 specialist.

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
- `apps/V2T/package.json` and `packages/VT2/package.json` for live workspace
  package names and task availability

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
- `bunx turbo run lint --filter=@beep/v2t`
- `bun run lint:effect-laws`
- `bun run lint:jsdoc`
- `bun run check:effect-laws-allowlist`
- `bun run lint:schema-first`
- `bun run docgen` when exported APIs or JSDoc examples changed

Important note:

- `@beep/VT2` has no package-local `lint` or `docgen` task, so VT2 conformance must be proven through the repo-law commands above
- `@beep/v2t` is the live app package name even though the folder is
  `apps/V2T`, so always verify filter casing from the manifest before editing
  command examples
