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

### Durable Tracking

- [outputs/manifest.json](./outputs/manifest.json) - machine-readable phase status and file routing
- [outputs/grill-log.md](./outputs/grill-log.md) - durable record of locked package decisions
- [outputs/v2t_app_notes.html](./outputs/v2t_app_notes.html) - upstream PRD input
- [outputs/V2_animination_V2T.md](./outputs/V2_animination_V2T.md) - earlier V2T notes preserved as source input

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
- `packages/common/ui/src/components/speech-input.tsx` already provides a reusable speech/transcript UI primitive
- root Graphiti tooling and proxy commands already exist for memory infrastructure
- `apps/V2T/vite.config.ts` already defines a local sidecar proxy seam for `/api`

## Source-Of-Truth Order

Disagreement is resolved in this order:

1. repo law and current repo reality
2. this README
3. [outputs/manifest.json](./outputs/manifest.json)
4. phase artifacts in order: `RESEARCH.md`, `DESIGN_RESEARCH.md`, `PLANNING.md`, `EXECUTION.md`, `VERIFICATION.md`
5. handoffs and [AGENT_PROMPTS.md](./AGENT_PROMPTS.md)
6. preserved raw inputs under `outputs/`

## Working Contract

- Keep the canonical package in-place at `specs/pending/V2T`.
- Preserve `outputs/v2t_app_notes.html`, `outputs/V2_animination_V2T.md`, and the reference image as source inputs.
- Treat the exact root-level phase documents as authoritative artifacts, not aliases of `outputs/pN-...` files.
- Use `grill-me` during P0 whenever meaningful ambiguity remains, and append the result to [outputs/grill-log.md](./outputs/grill-log.md).
- Keep provider-specific logic behind explicit adapters and service seams.
- Default the first execution slice to a repo-grounded vertical slice:
  capture, transcript, session review, memory-enriched composition packet, and export orchestration seams.
- Do not claim production-grade autonomous video generation until the provider contracts, failure handling, and verification evidence exist.
- Update [outputs/manifest.json](./outputs/manifest.json) whenever phase status changes.
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
| P1 | Design Research | `DESIGN_RESEARCH.md` | workflow, domain model, storage posture, adapter seams, and UI surfaces are decision complete |
| P2 | Planning | `PLANNING.md` | file/module rollout order, acceptance criteria, and verification commands are explicit enough for another agent to implement |
| P3 | Execution | `EXECUTION.md` | the committed slice is implemented, deviations are logged, and targeted checks/tests pass |
| P4 | Verification | `VERIFICATION.md` | manual and automated evidence proves the implemented slice meets the spec and residual gaps are named |

## Scope

### In Scope

- the canonical V2T app package under `apps/V2T`
- local-first capture, transcript, session review, memory retrieval, composition configuration, and export orchestration seams
- typed domain models, provider adapters, and sidecar service boundaries
- verification commands and evidence for the app workspace

### Out Of Scope

- immediate multi-user collaboration
- unattended social publishing
- claiming final provider choices are production-ready without phase evidence
- inventing new repo-wide governance beyond what this package needs

## Success Criteria

This spec package is complete only when all of these statements are true:

- a fresh Codex session can resume from [QUICK_START.md](./QUICK_START.md) and the active handoff without inventing package structure
- the five phase artifacts stay aligned with current repo seams in `apps/V2T`
- external provider boundaries are explicit enough to swap mocks, stubs, or real integrations without reopening the whole design
- the execution phase can be carried out from [PLANNING.md](./PLANNING.md) without hidden decisions
- the verification phase proves what is actually implemented and what is still deferred
