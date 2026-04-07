# Repo Cleanup: Bloat, Staleness, and Duplication — Agent Prompts

## Phase Start Rule

Every phase starts the same way:

1. Read `AGENTS.md`.
2. Read [README.md](./README.md).
3. Read [outputs/manifest.json](./outputs/manifest.json).
4. Read the prior phase outputs that materially constrain the active phase.
5. Read the active phase handoff.
6. Execute only the active phase and stop at its exit gate.
7. Update the phase output, checklist, and manifest before exiting.

## Prompt: P0 Orchestrator

You are formalizing the cleanup plan, document-preservation policy, and execution contract for this repo cleanup. Read `handoffs/HANDOFF_P0.md`, `AGENTS.md`, root `package.json`, the current spec outputs, and any repo files needed to resolve grilling questions with evidence. Use the `grill-me` skill immediately. Write or refine `outputs/p0-planning-and-document-classification.md`, update `outputs/grill-log.md`, and update `outputs/cleanup-checklist.md` plus `outputs/manifest.json`.

You must verify:

- phase boundaries are explicit
- document-preservation policy is explicit
- command matrix and phase-gate rules are explicit
- commit cadence and approval boundaries are explicit
- verification commands are explicit
- open questions are either resolved or logged clearly

## Prompt: P1 Orchestrator

You are executing the targeted workspace-removal phase. Read `handoffs/HANDOFF_P1.md`, the P0 output, the checklist, and the relevant repo config surfaces. Remove only the approved target workspaces and their active references, regenerate managed artifacts, and write or refine `outputs/p1-workspace-removal-and-regeneration.md`.

You must verify:

- the affected-surface map covers repo graph, TS refs, paths, identity registries, tests, CI, and generated docs
- preserved historical references are logged instead of silently rewritten
- `config-sync`, `version-sync --skip-network`, and `docgen` run when required
- repo quality commands are summarized
- out-of-scope findings are logged for later phases instead of removed opportunistically
- the phase commit is made and recorded if changes were made
- residual risk is explicit

## Prompt: P2 Orchestrator

You are verifying and cleaning docgen ownership for this repo. Read `handoffs/HANDOFF_P2.md`, the P0 and P1 outputs, and the relevant docgen tooling surfaces. Prove what currently drives docgen, remove genuine stale assumptions, and write or refine `outputs/p2-docgen-verification-and-cleanup.md`.

You must verify:

- current docgen ownership is proven from repo files
- `@effect/docgen` is removed only if it truly remains
- stale generated docs tied to removed workspaces are handled
- the required commands and quality checks are summarized
- the phase commit is made and recorded if changes were made

## Prompt: P3 Orchestrator

You are pruning dependency catalog drift, security exceptions, and platform or test config that became stale after workspace cleanup. Read `handoffs/HANDOFF_P3.md`, the P1 and P2 outputs, and the relevant root config files. Write or refine `outputs/p3-dependency-security-and-platform-pruning.md`.

You must verify:

- root catalog, overrides, lockfile, and repo config drift are reviewed
- vuln exceptions and security-scan config are reviewed
- Playwright, e2e, and CI drift are reviewed
- `audit:high` and any required repo-quality commands are summarized
- the phase commit is made and recorded if changes were made

## Prompt: P4 Inventory Orchestrator

You are building and routing the ranked stale-code inventory. Read `handoffs/HANDOFF_P4.md`, the prior phase outputs, and the checklist. Build a ranked inventory with evidence-backed candidates, write or refine `outputs/p4-ranked-candidate-inventory.md`, and update the checklist as the user approves or rejects candidates. When the user approves a candidate, route the cleanup into a fresh executor session using `prompts/CANDIDATE_EXECUTOR_PROMPT.md` instead of widening the orchestrator session.

You must verify:

- every candidate has the full evidence rubric
- user approval is recorded before any deletion
- each approved cleanup is routed to the candidate executor prompt and has verification, checklist, and commit bookkeeping
- rejected and deferred candidates are logged explicitly
- the phase stops after each approved candidate for user confirmation

## Prompt: P5 Orchestrator

You are running the final validation and knowledge closeout. Read `handoffs/HANDOFF_P5.md`, all prior outputs, the checklist, and the final validator prompt if useful. Write or refine `outputs/p5-final-closeout.md`, summarize the final repo-wide verification evidence, run `trustgraph:sync-curated`, and stop before any push.

You must verify:

- final quality commands are summarized
- TrustGraph sync is recorded
- preserved historical references and residual risks are documented
- manifest and checklist reflect final phase state
- the repo is ready for a user-approved push, but no push is performed
