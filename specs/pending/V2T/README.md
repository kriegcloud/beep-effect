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

- [README.md](./README.md) - normative source of truth for this spec package
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

## Source-Of-Truth Order

Disagreement is resolved in this order:

1. repo law and current repo reality
2. this README
3. [outputs/manifest.json](./outputs/manifest.json)
4. phase artifacts in order: `RESEARCH.md`, `DESIGN_RESEARCH.md`, `PLANNING.md`, `EXECUTION.md`, `VERIFICATION.md`
5. handoffs, the combined phase router, and [AGENT_PROMPTS.md](./AGENT_PROMPTS.md)
6. preserved raw inputs under `outputs/`

Manifest note:

- all file paths stored in [outputs/manifest.json](./outputs/manifest.json) are package-root-relative, not manifest-file-relative

## Mandatory Conformance Inputs

Every phase in this package must treat these as required inputs, not optional reading:

- `AGENTS.md`
- the `effect-first-development` skill when available in-session
- the `schema-first-development` skill when available in-session
- [../../../.patterns/jsdoc-documentation.md](../../../.patterns/jsdoc-documentation.md)
- [../../../standards/effect-first-development.md](../../../standards/effect-first-development.md)
- [../../../standards/schema-first.inventory.jsonc](../../../standards/schema-first.inventory.jsonc)
- [../../../tooling/configs/src/eslint/SchemaFirstRule.ts](../../../tooling/configs/src/eslint/SchemaFirstRule.ts)
- root `package.json`, root `turbo.json`, and the workspace `package.json` / `turbo.json` files for `apps/V2T` and `packages/VT2` whenever commands, ownership, or task gates are discussed

If these sources disagree, the tie-break order is:

1. `AGENTS.md`
2. active repo skills used for the turn
3. live workspace scripts and task graph
4. repo standards docs
5. this package

## Workspace Identity And Command Truth

- `apps/V2T/package.json` is the authoritative source for the app workspace
  identity, and its current package name is `@beep/v2t`.
- `packages/VT2/package.json` is the authoritative source for the sidecar
  workspace identity, and its current package name is `@beep/VT2`.
- Directory names are not authoritative for Turbo filter casing. Never infer a
  package filter from `apps/V2T` or `packages/VT2` alone.
- When adding or changing command examples, verify the package names from the
  live manifests first. If command truth is uncertain, confirm with a dry run
  such as `bunx turbo run check --filter=@beep/v2t --dry=json`.

## Graphiti Memory Protocol

- Start phase work with `bun run codex:hook:session-start` when useful.
- If `graphiti-memory` is available in-session, run a lightweight preflight:
  `get_status`, then `search_memory_facts`.
- When the wrapper exposes `group_ids` as a string, pass the JSON array literal
  string `"[\"beep-dev\"]"` instead of the plain string `beep-dev`.
- If Graphiti fact search fails because of the current RediSearch syntax issue,
  continue with repo-local docs and code search, and record that the session
  used a Graphiti fallback instead of blocking the phase.
- Write back material decisions, repo-specific findings, and tricky fixes before
  the phase closes.

## Phase Agent Model

Every active phase session is the phase orchestrator.

- The orchestrator owns the phase plan, delegation decisions, integration,
  quality-gate evidence, and artifact updates.
- Sub-agents are bounded workers or auditors. They do not own phase closure,
  manifest authority, or scope expansion.
- Use the delegation kit under [prompts/README.md](./prompts/README.md) when a
  phase benefits from parallel work.
- Prefer the repo-local custom agent registry in
  [../../../.codex/config.toml](../../../.codex/config.toml) and
  [../../../.codex/agents/README.md](../../../.codex/agents/README.md) for
  Effect v4 specialist delegation.
- Assume the CLI workers share the same worktree unless the runtime explicitly
  provides isolation. Disjoint write scopes are therefore mandatory, not just
  stylistic.
- The recommended fresh-session profile is `codex -p v2t_orchestrator`, but the
  active phase still remains the orchestrator even when no sub-agents are used.

## Review Loop

Every mutating phase must end with at least one read-only review wave.

- Use `effect_v4_quality_reviewer` or an equivalent read-only reviewer after a
  meaningful write wave and before phase closeout.
- If the review finds substantive issues, integrate them and rerun the review.
- A phase may close only when the latest review wave finds no substantive
  issues or the remaining issues are explicitly logged as accepted residual
  risk.

## Conformance And Gates

### Spec Package Gate

When editing this canonical package itself, do not rely on root markdown lint alone.

- `git diff --check -- specs/pending/V2T`
- `node specs/pending/V2T/outputs/validate-spec.mjs`

Important limitation:

- root `bun run lint:markdown` currently ignores `specs/**`, so it is not a sufficient validation gate for this package

### Active Implementation Floor

When the active phase is planning, execution, or verification for real code changes, the minimum targeted command floor is:

- `bunx turbo run check --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run test --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run build --filter=@beep/v2t --filter=@beep/VT2`
- `bunx turbo run lint --filter=@beep/v2t`
- `bun run lint:effect-laws`
- `bun run lint:jsdoc`
- `bun run check:effect-laws-allowlist`
- `bun run lint:schema-first`

Additional gate:

- `bun run docgen` whenever exported APIs or JSDoc examples changed

Important limitation:

- `@beep/VT2` does not currently define a package-local `lint` or `docgen` task, so VT2 conformance must be enforced through the repo-level law commands above rather than a nonexistent package script
- `@beep/v2t` and `@beep/VT2` must be copied from the live package manifests,
  not reconstructed from folder casing or stale scripts

### Readiness Gate

No phase may claim implementation readiness, merge readiness, or production-style confidence without an explicit record of the applicable results for:

- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen` when exported APIs or JSDoc examples changed

## Working Contract

- Keep the canonical package in-place at `specs/pending/V2T`.
- Preserve `outputs/v2t_app_notes.html`, `outputs/V2_animination_V2T.md`, and the reference image as source inputs.
- Treat the exact root-level phase documents as authoritative artifacts, not aliases of `outputs/pN-...` files.
- Route fresh sessions through [outputs/codex-plan-mode-prompt.md](./outputs/codex-plan-mode-prompt.md), [handoffs/HANDOFF_P0-P4.md](./handoffs/HANDOFF_P0-P4.md), [handoffs/P0-P4_ORCHESTRATOR_PROMPT.md](./handoffs/P0-P4_ORCHESTRATOR_PROMPT.md), and [prompts/README.md](./prompts/README.md) before dropping into a single phase.
- Treat the `codex-plan-mode-prompt.md` filename as a compatibility name only; the prompt applies in either Default mode or Plan mode.
- Treat the active phase session as the phase orchestrator even when sub-agents are used.
- Use repo-local custom agents from `.codex/config.toml` only for bounded work; keep phase ownership in the orchestrator.
- Run the Graphiti memory preflight when the MCP is available, and log fallback
  behavior when fact search is unavailable or currently broken.
- Run a read-only review wave before phase closeout, and do not close the phase
  while substantive findings remain unresolved.
- Use `grill-me` during P0 whenever meaningful ambiguity remains, and append the result to [outputs/grill-log.md](./outputs/grill-log.md).
- Keep provider-specific logic behind explicit adapters and service seams.
- Treat `apps/V2T` plus `packages/VT2` as the current canonical shell-plus-sidecar pair unless a later phase explicitly documents a migration.
- Default the first execution slice to a repo-grounded vertical slice:
  capture, transcript, session review, memory-enriched composition packet, and export orchestration seams.
- Do not claim production-grade autonomous video generation until the provider contracts, failure handling, and verification evidence exist.
- Update [outputs/manifest.json](./outputs/manifest.json) whenever phase status changes.
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
- local-first capture, transcript, session review, memory retrieval, composition configuration, and export orchestration seams
- typed domain models, provider adapters, and sidecar service boundaries
- verification commands and evidence for the app workspace and sidecar package

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
- the five phase artifacts stay aligned with current repo seams in `apps/V2T` and `packages/VT2`
- the command examples stay aligned with the live workspace package names
  `@beep/v2t` and `@beep/VT2`
- the mandatory conformance inputs are referenced explicitly in the active phase artifact whenever they constrain the work
- external provider boundaries are explicit enough to swap mocks, stubs, or real integrations without reopening the whole design
- the execution phase can be carried out from [PLANNING.md](./PLANNING.md) without hidden decisions
- the verification phase proves what is actually implemented and what is still deferred
- the repo-local custom agent presets are documented well enough that future sessions can selectively delegate Effect v4 work instead of improvising worker roles
- no phase closes without explicit evidence for the gates it claims to have satisfied
