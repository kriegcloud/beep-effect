# V2T Canonical Spec

## Status

**BOOTSTRAPPED**

## Owner

@beep-team

## Created / Updated

- **Created:** 2026-04-10
- **Updated:** 2026-04-10

## Quick Navigation

### Root

 - [README.md](./README.md) - operator guide and package overview
- [QUICK_START.md](./QUICK_START.md) - fresh-session operator entrypoint
- [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) - condensed per-phase orchestrator prompts
- [REFLECTION_LOG.md](./REFLECTION_LOG.md) - corrections, assumptions, and follow-up learnings

### Phase Artifacts

- [RESEARCH.md](./RESEARCH.md) - P0 research baseline and repo-grounded findings
- [DESIGN_RESEARCH.md](./DESIGN_RESEARCH.md) - P1 design research and system contract
- [PLANNING.md](./PLANNING.md) - P2 implementation sequencing and acceptance plan
- [EXECUTION.md](./EXECUTION.md) - P3 execution contract and implementation record
- [VERIFICATION.md](./VERIFICATION.md) - P4 verification matrix and final evidence

### Handoffs

- [handoffs/README.md](./handoffs/README.md) - handoff index
- [handoffs/HANDOFF_P0-P4.md](./handoffs/HANDOFF_P0-P4.md) - combined cross-phase handoff
- [handoffs/P0-P4_ORCHESTRATOR_PROMPT.md](./handoffs/P0-P4_ORCHESTRATOR_PROMPT.md) - combined phase router prompt
- [handoffs/HANDOFF_P0.md](./handoffs/HANDOFF_P0.md)
- [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md)
- [handoffs/HANDOFF_P2.md](./handoffs/HANDOFF_P2.md)
- [handoffs/HANDOFF_P3.md](./handoffs/HANDOFF_P3.md)
- [handoffs/HANDOFF_P4.md](./handoffs/HANDOFF_P4.md)
- [handoffs/P0_ORCHESTRATOR_PROMPT.md](./handoffs/P0_ORCHESTRATOR_PROMPT.md)
- [handoffs/P1_ORCHESTRATOR_PROMPT.md](./handoffs/P1_ORCHESTRATOR_PROMPT.md)
- [handoffs/P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md)
- [handoffs/P3_ORCHESTRATOR_PROMPT.md](./handoffs/P3_ORCHESTRATOR_PROMPT.md)
- [handoffs/P4_ORCHESTRATOR_PROMPT.md](./handoffs/P4_ORCHESTRATOR_PROMPT.md)

### Delegation Assets

- [prompts/README.md](./prompts/README.md) - delegation kit index
- [prompts/ORCHESTRATOR_OPERATING_MODEL.md](./prompts/ORCHESTRATOR_OPERATING_MODEL.md) - phase orchestrator rules
- [prompts/GRAPHITI_MEMORY_PROTOCOL.md](./prompts/GRAPHITI_MEMORY_PROTOCOL.md) - canonical Graphiti recall and writeback contract
- [prompts/SUBAGENT_OUTPUT_CONTRACT.md](./prompts/SUBAGENT_OUTPUT_CONTRACT.md) - required worker return format
- [prompts/PHASE_DELEGATION_PROMPTS.md](./prompts/PHASE_DELEGATION_PROMPTS.md) - ready-to-paste sub-agent prompt templates

### Durable Tracking

- [outputs/manifest.json](./outputs/manifest.json) - machine-readable phase status and file routing
- [outputs/codex-plan-mode-prompt.md](./outputs/codex-plan-mode-prompt.md) - pasteable fresh-session entry prompt
- [outputs/validate-spec.mjs](./outputs/validate-spec.mjs) - package-local manifest and markdown-link validator
- [outputs/grill-log.md](./outputs/grill-log.md) - durable record of locked package decisions
- [outputs/v2t_app_notes.html](./outputs/v2t_app_notes.html) - upstream PRD input
- [outputs/V2_animination_V2T.md](./outputs/V2_animination_V2T.md) - earlier V2T notes preserved as source input

### Codex Runtime Assets

- [../../../.codex/config.toml](../../../.codex/config.toml) - project-scoped custom agent registry and `v2t_orchestrator` profile
- [../../../.codex/agents/README.md](../../../.codex/agents/README.md) - specialist Effect v4 agent catalog

## Session Resume Checklist

1. Run `bun run codex:hook:session-start` from the repo root.
2. Read [outputs/manifest.json](./outputs/manifest.json) first, then follow `fresh_session_read_order`. The shorter startup lists elsewhere in this package are summaries, not competing ordered sources.
3. When `fresh_session_read_order` reaches [prompts/GRAPHITI_MEMORY_PROTOCOL.md](./prompts/GRAPHITI_MEMORY_PROTOCOL.md), run the Graphiti preflight or fallback exactly as documented there.
4. Trust `active_phase` plus `active_phase_assets` and read only the active phase handoff, active phase orchestrator prompt, and prior phase artifacts that constrain the active phase.
5. When command or task claims matter, confirm them against the live `package.json` and `turbo.json` files for the root, `apps/V2T`, and `packages/VT2`, plus `infra/package.json` for installer and deployment surfaces.
6. Execute only the active phase as the orchestrator.
7. Update the active phase artifact, [outputs/manifest.json](./outputs/manifest.json), and the package logs touched by the change before exiting.
8. Write the Graphiti session-end summary before ending the session whenever the phase produced durable repo truth, architecture decisions, reusable failures, or meaningful in-progress status.

## Purpose

### Problem

`apps/V2T` already exists as a workspace shell, and the PRD captures a compelling voice-to-timeline product direction, but the repo does not yet have a canonical, phase-structured spec that turns those notes into an execution-ready delivery contract.

### Solution

This package formalizes V2T as a five-phase canonical spec rooted in the current repo reality:

1. P0 research
2. P1 design research
3. P2 planning
4. P3 execution
5. P4 verification

The package keeps the exact phase artifact names requested by the user and preserves the original PRD artifacts in place under `specs/pending/V2T`.

## Product Summary

V2T is a local-first conversation-to-video workspace. The product captures a recording, produces a structured transcript and companion notes, enriches the session with memory and contextual research, lets the user configure a composition style, and routes the result into long-form or short-form video output.

The canonical spec is grounded in current repo anchors:

- `apps/V2T` already exists as the app workspace and currently provides the starter shell
- `packages/VT2` already exists as the SQLite-backed Effect sidecar package, with a control-plane protocol in `packages/VT2/src/protocol.ts` and runtime wiring in `packages/VT2/src/Server/index.ts`
- `packages/common/ui/src/components/speech-input.tsx` already provides a reusable speech/transcript UI primitive
- root Graphiti tooling and proxy commands already exist for memory infrastructure
- `apps/V2T/vite.config.ts` already defines a local sidecar proxy seam for `/api`
- `apps/V2T/scripts/build-sidecar.ts` and `apps/V2T/scripts/dev-with-portless.ts` already bind the app shell to the existing sidecar runtime
- `infra/Pulumi.yaml`, `infra/src/entry.ts`, `infra/src/V2T.ts`, and `infra/scripts/v2t-workstation.sh` already define a live `@beep/infra` workstation-install and deployment surface for V2T

## Source-Of-Truth Order

Disagreement is resolved in this order:

1. repo law and current repo reality
2. [outputs/manifest.json](./outputs/manifest.json) for machine-routable package contract data such as `active_phase`, `active_phase_assets`, command gates, tracked files, and custom-agent inventory
3. this README for explanatory and operator guidance that must not contradict repo law or the manifest
4. phase artifacts in order: `RESEARCH.md`, `DESIGN_RESEARCH.md`, `PLANNING.md`, `EXECUTION.md`, `VERIFICATION.md`
5. handoffs, the combined phase router, and [AGENT_PROMPTS.md](./AGENT_PROMPTS.md)
6. preserved raw inputs under `outputs/`

Manifest notes:

- all file paths stored in [outputs/manifest.json](./outputs/manifest.json) are package-root-relative, not manifest-file-relative
- `active_phase_assets` is the fastest authoritative route to the active phase handoff, prompt, output, and trackers
- `fresh_session_read_order` is the canonical ordered startup list once the manifest is open
- this README explains package intent and operator workflow, but the manifest owns machine-readable routing and gate truth

## Active Phase Contract

- [outputs/manifest.json](./outputs/manifest.json) is the machine authority for `active_phase`, `active_phase_assets`, and the package-wide command gates.
- This README is explanatory guidance. If it disagrees with repo law, live manifests, or the package manifest, repair the prose instead of routing around the machine contract.
- Do not infer the active phase from prose status headings inside individual markdown files.
- Package status `BOOTSTRAPPED` means the package structure and routing exist; it does not imply the active phase artifact is already complete.
- If package-local routing, command gates, or validator behavior changes, update the manifest in the same pass.

## Mandatory Conformance Inputs

Every phase in this package must treat these as required inputs, not optional reading:

- `AGENTS.md`
- the `effect-first-development` skill when available in-session
- the `schema-first-development` skill when available in-session
- [../../../.patterns/jsdoc-documentation.md](../../../.patterns/jsdoc-documentation.md)
- [../../../standards/effect-first-development.md](../../../standards/effect-first-development.md)
- [../../../standards/schema-first.inventory.jsonc](../../../standards/schema-first.inventory.jsonc)
- [../../../tooling/configs/src/eslint/SchemaFirstRule.ts](../../../tooling/configs/src/eslint/SchemaFirstRule.ts)
- root `package.json`, root `turbo.json`, `infra/package.json`, and the workspace `package.json` / `turbo.json` files for `apps/V2T` and `packages/VT2` whenever commands, ownership, task gates, or installer/deployment surfaces are discussed

If these sources disagree, the tie-break order is:

1. `AGENTS.md`
2. active repo skills used for the turn
3. live workspace scripts and task graph
4. repo standards docs
5. this package

## Workspace Identity And Command Truth

- `apps/V2T/package.json` is the authoritative source for the app workspace identity, and its current package name is `@beep/v2t`.
- `packages/VT2/package.json` is the authoritative source for the sidecar workspace identity, and its current package name is `@beep/VT2`.
- `infra/package.json` is the authoritative source for the workstation/deployment workspace identity, and its current package name is `@beep/infra`.
- `@beep/infra` does not currently have a workspace-local `turbo.json`, so command truth for infra comes from `infra/package.json` plus the root `turbo.json`.
- Directory names are not authoritative for Turbo filter casing. Never infer a package filter from `apps/V2T` or `packages/VT2` alone.
- When adding or changing command examples, verify the package names from the live manifests first. If command truth is uncertain, confirm with a dry run such as `bunx turbo run check --filter=@beep/v2t --dry=json`.
- `outputs/manifest.json` must mirror the live package names and command-truth files. If the workspace manifests change, repair the manifest and rerun the validator in the same pass.
- The validator also treats the root, app, and sidecar script surfaces as live command truth. If a documented gate depends on a missing script, fix the docs or manifest rather than weakening the validator.

## Graphiti Memory Protocol

- [prompts/GRAPHITI_MEMORY_PROTOCOL.md](./prompts/GRAPHITI_MEMORY_PROTOCOL.md) is the canonical recall and writeback contract for this package.
- Use `group_id: "beep-dev"` for `add_memory`, `source: "text"`, and `source_description: "codex-cli session"`.
- When the wrapper exposes `group_ids` as a string for recall, pass the JSON array literal string `"[\"beep-dev\"]"` instead of the plain string `beep-dev`.
- Try Graphiti recall in this order: `search_memory_facts`, one shorter fallback query, `get_episodes`, then repo-local fallback.
- If recall fails, log the exact query, exact error text, and any `get_episodes` fallback result in the phase artifact, then continue with the documented repo-local fallback instead of blocking the phase.
- Write back material decisions, repo-specific findings, tricky fixes, and meaningful session-end progress summaries using the template in the protocol doc.

## Phase Agent Model

Every active phase session is the phase orchestrator.

- The orchestrator owns the phase plan, delegation decisions, integration, quality-gate evidence, and artifact updates.
- Sub-agents are bounded workers or auditors. They do not own phase closure, manifest authority, or scope expansion.
- Use the delegation kit under [prompts/README.md](./prompts/README.md) when a phase benefits from parallel work.
- Use [prompts/GRAPHITI_MEMORY_PROTOCOL.md](./prompts/GRAPHITI_MEMORY_PROTOCOL.md) when phase recall or session-end writeback is in scope.
- Prefer the repo-local custom agent registry in [../../../.codex/config.toml](../../../.codex/config.toml) and [../../../.codex/agents/README.md](../../../.codex/agents/README.md) for Effect v4 specialist delegation.
- Assume the CLI workers share the same worktree unless the runtime explicitly provides isolation. Disjoint write scopes are therefore mandatory, not just stylistic.
- The recommended fresh-session profile is `codex -p v2t_orchestrator`, but the active phase still remains the orchestrator even when no sub-agents are used.

## Review Loop

Every mutating phase must end with at least one read-only review wave.

- Use `effect_v4_quality_reviewer` or an equivalent read-only reviewer after a meaningful write wave and before phase closeout.
- If the review finds substantive issues, integrate them and rerun the review.
- A phase may close only when the latest review wave finds no substantive issues or the remaining issues are explicitly logged as accepted residual risk.

## Conformance And Gates

### Spec Package Gate

When editing this canonical package itself, do not rely on root markdown lint alone.

- `git diff --check -- specs/pending/V2T`
- `node specs/pending/V2T/outputs/validate-spec.mjs`

Important limitation:

- root `bun run lint:markdown` currently ignores `specs/**`, so it is not a sufficient validation gate for this package

### Active Implementation Floor

When the active phase is planning, execution, or verification for real code changes, the minimum targeted command floor is:

- `bunx turbo run check --filter=@beep/infra --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run test --filter=@beep/infra --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run build --filter=@beep/v2t --filter=@beep/VT2`
- `bun run --cwd apps/V2T lint`
- `bun run --cwd infra lint`
- `bun run lint:effect-laws`
- `bun run lint:jsdoc`
- `bun run check:effect-laws-allowlist`
- `bun run lint:schema-first`

Additional gate:

- `bun run docgen` whenever exported APIs or JSDoc examples changed

Important limitation:

- `@beep/VT2` does not currently define a package-local `lint` or `docgen` task, so VT2 conformance must be enforced through the repo-level law commands above rather than a nonexistent package script
- `@beep/infra` is a live workspace with package-local `check`, `test`, `lint`, and Pulumi operator scripts; do not describe it as future work or infer its commands from app or sidecar patterns
- `@beep/v2t` and `@beep/VT2` must be copied from the live package manifests, not reconstructed from folder casing or stale scripts
- `turbo run lint --filter=@beep/v2t` is not a safe substitute for the app-local lint gate because the filtered Turbo run is dependency-expanded and therefore not equivalent to targeted app-only lint evidence

### Readiness Gate

No phase may claim implementation readiness, merge readiness, or production-style confidence without an explicit record of the applicable results for:

- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`

When exported APIs or JSDoc examples did not change, record `bun run docgen` as `not applicable` instead of omitting it from readiness evidence.

## Package Maintenance Rules

- Update [outputs/manifest.json](./outputs/manifest.json) whenever phase status, routing, command gates, or validator rules change.
- Update [REFLECTION_LOG.md](./REFLECTION_LOG.md) whenever package-local structure, operator workflow, or validator behavior changes.
- Append [outputs/grill-log.md](./outputs/grill-log.md) only when a new package-shape decision or default is being locked.
- Run the spec package gate before closing any package-maintenance change.
- Treat the validator as the final authority for package-contract drift inside owned files; do not trust copied command snippets over validator results.
- If the validator reports command-surface drift, repair both the manifest catalog and the human-facing docs in the same pass so the machine and prose contracts stay aligned.

## Working Contract

- Keep the canonical package in-place at `specs/pending/V2T`.
- Preserve `outputs/v2t_app_notes.html`, `outputs/V2_animination_V2T.md`, and the reference image as source inputs.
- Treat the exact root-level phase documents as authoritative artifacts, not aliases of `outputs/pN-...` files.
- Route fresh sessions through [outputs/codex-plan-mode-prompt.md](./outputs/codex-plan-mode-prompt.md), [handoffs/HANDOFF_P0-P4.md](./handoffs/HANDOFF_P0-P4.md), [handoffs/P0-P4_ORCHESTRATOR_PROMPT.md](./handoffs/P0-P4_ORCHESTRATOR_PROMPT.md), and [prompts/README.md](./prompts/README.md) before dropping into a single phase.
- Follow [outputs/manifest.json](./outputs/manifest.json) `fresh_session_read_order` as the canonical ordered startup list after opening the manifest.
- Treat the `codex-plan-mode-prompt.md` filename as a compatibility name only; the prompt applies in either Default mode or Plan mode.
- Treat the active phase session as the phase orchestrator even when sub-agents are used.
- Use repo-local custom agents from `.codex/config.toml` only for bounded work; keep phase ownership in the orchestrator.
- Run the Graphiti memory preflight when the MCP is available, and log exact query, exact error, fallback behavior, and writeback status via [prompts/GRAPHITI_MEMORY_PROTOCOL.md](./prompts/GRAPHITI_MEMORY_PROTOCOL.md).
- Run a read-only review wave before phase closeout, and do not close the phase while substantive findings remain unresolved.
- Use `grill-me` during P0 whenever meaningful ambiguity remains, and append the result to [outputs/grill-log.md](./outputs/grill-log.md).
- Keep provider-specific logic behind explicit adapters and service seams.
- Treat `apps/V2T` plus `packages/VT2` as the current runtime pair, and treat `@beep/infra` as the current canonical workstation-install and deployment surface unless a later phase explicitly documents a migration.
- Default the first execution slice to a repo-grounded vertical slice: capture, transcript, session review, memory-enriched composition packet, and export orchestration seams.
- Do not claim production-grade autonomous video generation until the provider contracts, failure handling, and verification evidence exist.
- Update [outputs/manifest.json](./outputs/manifest.json) whenever phase status changes.
- Update [REFLECTION_LOG.md](./REFLECTION_LOG.md) whenever package-local routing, operator guidance, or validator behavior changes.
- Record conformance evidence in the active phase artifact instead of implying commands were run.
- Stop at the active phase exit gate instead of silently rolling forward.

## Locked Decisions

These package-shape decisions are already settled and logged in [outputs/grill-log.md](./outputs/grill-log.md):

- use a full canonical spec package
- keep the exact phase filenames `RESEARCH.md`, `DESIGN_RESEARCH.md`, `PLANNING.md`, `EXECUTION.md`, and `VERIFICATION.md`
- canonicalize in-place under `specs/pending/V2T`

## Phase Breakdown

| Phase | Focus | Primary Artifact | Exit Requirement |
|---|---|---|---|
| P0 | Research | `RESEARCH.md` | PRD claims are grounded against repo reality, provider assumptions are classified, and the initial execution slice is explicit |
| P1 | Design Research | `DESIGN_RESEARCH.md` | workflow, domain model, storage posture, adapter seams, UI surfaces, and repo-law constraints are decision complete |
| P2 | Planning | `PLANNING.md` | file/module rollout order, acceptance criteria, and conformance gates are explicit enough for another agent to implement |
| P3 | Execution | `EXECUTION.md` | the committed slice is implemented, deviations are logged, and the required targeted plus repo-law gates are recorded |
| P4 | Verification | `VERIFICATION.md` | manual and automated evidence proves the implemented slice meets the spec, conformance gates are explicit, and residual gaps are named |

## Scope

### In Scope

- the canonical V2T app shell under `apps/V2T`
- the existing V2T sidecar control plane under `packages/VT2`
- the live workstation-install and deployment surfaces under `infra`
- local-first capture, transcript, session review, memory retrieval, composition configuration, and export orchestration seams
- typed domain models, provider adapters, and sidecar service boundaries
- verification commands and evidence for the app workspace, sidecar package, and infra workspace

### Out Of Scope

- immediate multi-user collaboration
- unattended social publishing
- claiming final provider choices are production-ready without phase evidence
- renaming `@beep/VT2` as part of this bootstrap repair pass
- inventing new repo-wide governance beyond what this package needs

## Success Criteria

This spec package is complete only when all of these statements are true:

- a fresh Codex session can resume from [QUICK_START.md](./QUICK_START.md) and the active handoff without inventing package structure
- a fresh Codex session can tell that the active phase session is the orchestrator and can reach the delegation kit without guessing
- the five phase artifacts stay aligned with current repo seams in `apps/V2T`, `packages/VT2`, and `infra`
- the command examples stay aligned with the live workspace package names `@beep/v2t`, `@beep/VT2`, and `@beep/infra`
- the mandatory conformance inputs are referenced explicitly in the active phase artifact whenever they constrain the work
- external provider boundaries are explicit enough to swap mocks, stubs, or real integrations without reopening the whole design
- the execution phase can be carried out from [PLANNING.md](./PLANNING.md) without hidden decisions
- the verification phase proves what is actually implemented and what is still deferred
- the repo-local custom agent presets are documented well enough that future sessions can selectively delegate Effect v4 work instead of improvising worker roles
- the package-local validator can catch manifest drift, file-set drift, and required operator-section drift before a future session starts
- no phase closes without explicit evidence for the gates it claims to have satisfied
