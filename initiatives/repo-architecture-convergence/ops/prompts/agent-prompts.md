# Shared Agent Prompt Layer

Use this file as the common instruction layer for every worker operating on the
repo architecture convergence initiative.

## Required Startup

1. Follow the exact worker-read order and source-of-truth order from
   `README.md`, `SPEC.md`, and `ops/manifest.json`. This file adds no new
   authority and must not be read ahead of that contract.
2. For any `P0` batch that records baseline architecture or repo-law status,
   reread `standards/ARCHITECTURE.md`, `standards/effect-laws-v1.md`, and
   `standards/effect-first-development.md` before that baseline is recorded.
   For `P2` through `P7` code-moving or code-review work, read those same
   three standards before edits or gate interpretation begin.
3. For `P7` final verification or any closeout re-check, immediately before
   matrix scoring or closure claims, reread those three standards plus
   `ops/compatibility-ledger.md` and
   `ops/architecture-amendment-register.md`.
4. Run `bun run graphiti:proxy:ensure` when Graphiti is available in the
   environment. If it is unavailable, record an explicit skipped reason in the
   evidence pack and manifest.
5. Read the phase-specific design docs, prior evidence packs, durable ledgers,
   and review artifacts named in the manifest and active handoff before
   touching phase-owned surfaces.

## Core Duties

- Treat the exact `SPEC.md` source-of-truth order as binding. Do not compress
  or restate it as a shorter precedence ladder here.
- Execute the current phase as landed repo change plus proof, not as packet
  authoring.
- Maintain the full phase artifact bundle:
  evidence pack, phase-owned durable artifacts, critique, remediation,
  re-review, and manifest updates.
- Use only `ops/compatibility-ledger.md` and
  `ops/architecture-amendment-register.md` as live governance ledgers. Treat
  any ledger copies or discussions outside `ops/` as historical or planning
  context only.
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

1. The phase evidence pack in `history/outputs/`, including the worker-read
   acknowledgment for the batch.
2. Every extra durable artifact owned by that phase.
3. A critique artifact that records findings with severity and exact evidence.
4. A remediation artifact that maps each finding to a disposition.
5. A re-review artifact that decides whether the phase is cleared or blocked.
6. Manifest updates for status, artifacts, evidence, blockers, and
   `nextAction`.

## Verification Contract

- Run the exact command gates named in the manifest and active handoff.
- Record concrete proof: the worker-read acknowledgment, required standards
  rereads, command lines, timestamps, exit codes, and the active phase's
  manifest-listed search-audit ids. At the current manifest version, every
  phase record lists all seven catalog families. Include repo-law boundary
  audits, ledger deltas, and changed repo surfaces wherever the batch touches
  them.
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
