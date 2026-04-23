# Shared Agent Prompt Layer

Use this file as the common instruction layer for every worker operating on the
repo architecture convergence initiative.

## Required Startup

1. Read `ops/manifest.json` to confirm the active phase, dependency graph,
   artifact bundle, command gates, and current blockers.
2. Run `bun run graphiti:proxy:ensure` when Graphiti is available in the
   environment. If it is unavailable, record an explicit skipped reason in the
   evidence pack and manifest.
3. Read the active phase handoff and matching orchestrator prompt.
4. Load the reusable assets in `ops/prompt-assets/`.
5. Read the required design docs, prior evidence packs, durable ledgers, and
   review artifacts before touching phase-owned surfaces.

## Core Duties

- Treat `SPEC.md`, `PLAN.md`, and the architecture standards as binding.
- Execute the current phase as landed repo change plus proof, not as packet
  authoring.
- Maintain the full phase artifact bundle:
  evidence pack, phase-owned durable artifacts, critique, remediation,
  re-review, and manifest updates.
- Record the exact commands, timestamps, exits, and search audits needed to
  replay the proof.
- Update authoritative ledger paths when temporary exceptions or amendment
  candidates exist.
- Use the blocker taxonomy from `ops/prompt-assets/blocker-protocol.md` instead
  of informal blocker labels.

## Graphiti Duties

- Bootstrap Graphiti at phase start with `bun run graphiti:proxy:ensure` when
  the environment exposes it.
- If Graphiti memory is responsive, consult it for relevant repo context before
  execution starts.
- Record Graphiti bootstrap and writeback status in the evidence pack.
- Before handoff, write back the phase summary, key decisions, and unresolved
  blockers when Graphiti is available.

## Artifact Contract

Every phase must maintain all of the following:

1. The phase evidence pack in `history/outputs/`.
2. Every extra durable artifact owned by that phase.
3. A critique artifact that records findings with severity and exact evidence.
4. A remediation artifact that maps each finding to a disposition.
5. A re-review artifact that decides whether the phase is cleared or blocked.
6. Manifest updates for status, artifacts, evidence, blockers, and
   `nextAction`.

## Verification Contract

- Run the exact command gates named in the manifest and active handoff.
- Record concrete proof: command lines, timestamps, exit codes, `rg` commands,
  counts, ledger deltas, and changed repo surfaces.
- Do not mark a phase `completed` while any blocking finding is still open.
- Evidence produced before the last material repo change is stale and cannot
  close a phase.
- If the phase did not land repo changes, it is scaffold-only and cannot be
  marked complete.

## Blocker Contract

- A blocker is any taxonomy-classified condition that prevents trustworthy
  closure: missing inputs, missing routes or owners, ungoverned compatibility
  surfaces, failed command gates, stale evidence, or narrative-only outputs.
- When blocked, keep the phase out of `completed`, record the blocker in the
  review loop, and update the manifest blocker fields.
- If a blocker implies a lasting standards conflict, record it in
  `ops/architecture-amendment-register.md` instead of inventing a silent
  workaround.

## Completion Response Contract

Every closeout should state:

1. Which artifact bundle members changed.
2. Which command gates and search audits ran and what they proved.
3. Whether Graphiti was bootstrapped and whether writeback succeeded or was
   skipped.
4. Whether critique findings were remediated and re-reviewed.
5. Any remaining blockers or residual risks.
6. Which manifest fields changed and what the next action is.
