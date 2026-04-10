# V2T Canonical Spec - Quick Start

## Fresh Session Flow

1. Start the main session as the phase orchestrator. Prefer `codex -p v2t_orchestrator` when available.
2. Run `bun run codex:hook:session-start`.
3. Read [outputs/manifest.json](./outputs/manifest.json) first, then follow `fresh_session_read_order`.
4. When `fresh_session_read_order` reaches [prompts/GRAPHITI_MEMORY_PROTOCOL.md](./prompts/GRAPHITI_MEMORY_PROTOCOL.md), run the Graphiti preflight, including the `get_episodes` fallback when fact search fails or is empty.
5. Open the active phase handoff and active phase orchestrator prompt from `active_phase_assets`.
6. Read prior phase artifacts that constrain the active phase.
7. If command, task, ownership, or installer claims are in scope, read the root plus workspace `package.json` and `turbo.json` files before trusting the package docs, and include `infra/package.json` for deployment surfaces.
8. Execute only the active phase as the orchestrator and stop at its exit gate.
9. Update the active phase artifact and [outputs/manifest.json](./outputs/manifest.json) before exiting.
10. Write the Graphiti session-end summary before ending the session whenever the phase produced durable repo truth, architecture decisions, reusable failures, or meaningful in-progress status.

## Active Phase Resolver

- Use `outputs/manifest.json` as the only authority for `active_phase`.
- Treat `fresh_session_read_order` inside the manifest as the canonical ordered startup list after the manifest is open.
- Treat every shorter startup list in this package as a summary of the manifest order, not a competing ordered source.
- Use `active_phase_assets` to resolve the matching handoff, orchestrator prompt, output artifact, and trackers without guessing.
- Do not infer the active phase from status prose inside the markdown artifacts.
- When the active phase is `p0`, treat [outputs/grill-log.md](./outputs/grill-log.md) as an active tracker, not optional history.
- If a package name or task claim disagrees with the manifest, trust the live workspace manifests first, then repair the manifest and rerun the validator before continuing.

## Phase Session Model

- The active phase session is always the orchestrator.
- Use sub-agents only after the orchestrator has formed a local plan.
- Keep worker write scopes disjoint.
- Use [prompts/ORCHESTRATOR_OPERATING_MODEL.md](./prompts/ORCHESTRATOR_OPERATING_MODEL.md) and [prompts/PHASE_DELEGATION_PROMPTS.md](./prompts/PHASE_DELEGATION_PROMPTS.md) when delegating.
- Use [prompts/GRAPHITI_MEMORY_PROTOCOL.md](./prompts/GRAPHITI_MEMORY_PROTOCOL.md) for Graphiti recall, fallback logging, and session-end writeback.
- Use [../../../.codex/agents/README.md](../../../.codex/agents/README.md) to choose the right Effect v4 specialist.

## If You Are Editing This Package

- Update [outputs/manifest.json](./outputs/manifest.json) when routing, command gates, or validator expectations change.
- Update [REFLECTION_LOG.md](./REFLECTION_LOG.md) when package-local structure, operator guidance, or validator behavior changes.
- Append [outputs/grill-log.md](./outputs/grill-log.md) only when you are locking a new package-shape decision or default.
- Run the package-local spec gate before you stop.
- If validator failures mention live script surfaces, repair the manifest and the copied operator guidance together before rerunning it.

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
- `infra/Pulumi.yaml`
- `infra/src/internal/entry.ts`
- `infra/src/V2T.ts`
- `infra/scripts/v2t-workstation.sh`
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
If the validator disagrees with copied command text, repair the command text rather than weakening the validator.
If the validator says a documented gate lacks a live backing script, treat the workspace manifests as authoritative and update the package docs or manifest in the same pass.

### When Planning Or Implementing Code

- `bunx turbo run check --filter=@beep/infra --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run test --filter=@beep/infra --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run build --filter=@beep/v2t --filter=@beep/VT2`
- `bun run --cwd apps/V2T lint`
- `bun run --cwd infra lint`
- `bun run lint:effect-laws`
- `bun run lint:jsdoc`
- `bun run check:effect-laws-allowlist`
- `bun run lint:schema-first`
- `bun run docgen` when exported APIs or JSDoc examples changed

If exported APIs or JSDoc examples did not change, record `bun run docgen` as `not applicable` in readiness evidence instead of omitting it.

Important notes:

- the live app workspace package name is `@beep/v2t`, not the stale uppercase
  app filter
- the live workstation/deployment workspace package name is `@beep/infra`, and
  its operator commands come from `infra/package.json`
- `@beep/VT2` has no package-local `lint` or `docgen` task, so VT2 conformance must be proven through the repo-law commands above
- use `bun run --cwd apps/V2T lint` for the targeted app lint gate
- use `bun run --cwd infra lint` for the targeted infra lint gate when the
  slice touches installer or deployment code
- do not substitute `turbo run lint --filter=@beep/v2t`, because the filtered
  Turbo run is dependency-expanded and therefore not equivalent to app-only
  lint evidence
