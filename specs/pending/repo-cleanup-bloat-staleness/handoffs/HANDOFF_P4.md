# Handoff P4 — Ranked Candidate Inventory And Approval Loop

## Goal

Build and route a ranked stale-code inventory with explicit user approval and durable evidence.

## Required Inputs

- `../README.md`
- `../outputs/manifest.json`
- `../outputs/cleanup-checklist.md`
- `../outputs/p0-planning-and-document-classification.md`
- `../outputs/p1-workspace-removal-and-regeneration.md`
- `../outputs/p2-docgen-verification-and-cleanup.md`
- `../outputs/p3-dependency-security-and-platform-pruning.md`
- repo areas being explored for candidate deletion

## Required Output

- `../outputs/p4-ranked-candidate-inventory.md`

## Required Decisions

- candidate rubric and scoring
- ranked inventory order
- candidate-by-candidate user decisions
- when to hand off from the P4 orchestrator to `../prompts/CANDIDATE_EXECUTOR_PROMPT.md`
- verification and commit bookkeeping per approved cleanup
- end-of-loop rule when the user stops before the inventory is exhausted

## Required Command Set

- candidate-specific verification commands from the approved inventory entry
- any managed commands triggered by the approved candidate
- one commit per approved candidate unless P0 overrides the default cadence

## Exit Gate

P4 closes only when the ranked inventory is durable, every user decision is logged, every approved candidate has been routed and completed with corresponding verification and commit evidence, and either the inventory is exhausted or the user explicitly ends the candidate loop.
