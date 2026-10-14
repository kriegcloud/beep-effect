# Knowledge-Surface Audit & Automation

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Turn the agent-facing knowledge surfaces — `goals/`, `explorations/`, `.claude/skills/`,
`.agents/skills/`, `docs/`, `CLAUDE.md` / `AGENTS.md`, and the `.claude` / `.agents` /
`.codex` trees — into audited, gated, self-proving infrastructure: permanent
new-violation gates, not a one-time cleanup.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/knowledge-surface-automation/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth (ratified 2026-07-31 doctrine:
   workstreams A-E, ratified decisions, remaining grill items, spin-offs).
3. [`PLAN.md`](./PLAN.md) - active execution plan (phases P0-P6).
4. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing; declares
   `provides: [knowledge/doctor, skills/warehouse, goals/graph, goals/bootstrap]`
   (Workstream D's additive capability extension, declared ahead of schema support on
   purpose - decode-compatibility is a P1 test).
5. [`research/`](./research/) - P0 deliverables (`prior-ritual-lessons.md`,
   `surface-inventory.md`, `cli-ground-truth.md`, `SOURCES.md`) and the ratified
   [`p2-grill-decisions.md`](./research/p2-grill-decisions.md).
6. [`history/`](./history/) - evidence and closeouts, if present.

## Current Phase

P4 in progress. Shipped on main so far:

- **D:** `beep goals next|explain|catalog` (in-memory SQLite projection,
  differential-tested) and the Mermaid capability-graph section in `goals/INDEX.md`.
- **E:** `goals bootstrap|adopt --write --expect <planId>` (atomic publish, exclusive
  adoption). This packet adopted itself with its own executor (self-hosting test case
  #1).
- **E-3b:** the read-only `beep explore graduate <exploration> --goal <slug>=<title>
  --plan [--json]` compiles a content-addressed `graduation-plan/v1` (one bootstrap
  plan per child, the hash-pinned exploration manifest edit, the refusal matrix, and
  `alreadyPublished` replay classification).
- **E-3c:** `explore graduate --write --expect <planId>` publishes the remaining children
  through `publishBootstrapPlan`, then flips the exploration manifest through the
  pre-image check adoption shares (`replacePinnedFile`), appends `stage-entered` and
  `status-set` for explorations with `ops/events/`, and prints a `graduation-receipt/v1`.
  A crash between children resumes by re-running the same command. Bootstrap, adopt,
  and graduate are now all self-hosted: this PR graduated
  `explorations/typed-agent-skill-contracts` with its own executor, publishing
  `goals/skill-contract-gate-certificates` beside the already-published
  `goals/skill-contract-kernel` (E17).
- **B:** the read-only `beep skills lock-plan` with six ratified resolution seeds;
  B-3a classifies drift against upstream path history. B-3b adds
  `lock-plan --write --expect <planDigest>`, flips `skills-lock.json` to v2 (6 vendored,
  31 local), and records the remaining local edits as pinned patch series under
  `.agents/skill-patches/`; receipt in [`research/p4-report-skills-lock-plan.md`](./research/p4-report-skills-lock-plan.md).
- **C:** Stage-2 PR 1, the read-only `beep knowledge doctor --report`, with its
  FP-eyeball report
  ([`research/p4-report-knowledge-doctor.md`](./research/p4-report-knowledge-doctor.md)).
- **Designs:** B, E, and C Stage 2
  ([`research/p4-skills-warehouse-design.md`](./research/p4-skills-warehouse-design.md),
  [`research/p4-goals-materialize-design.md`](./research/p4-goals-materialize-design.md),
  [`research/p4-knowledge-doctor-design.md`](./research/p4-knowledge-doctor-design.md)),
  plus E-3 graduation
  ([`research/p4-explore-graduate-design.md`](./research/p4-explore-graduate-design.md)).
- **D (PR 3):** `beep goals doctor` emits `capability-duplicate-declaration`,
  `capability-reference-provides` and `capability-packet-id-mismatch` (blocking,
  ratcheted) and `capability-stranded` (advisory), all zero on the live census; the
  four missing `provides` are declared.
- **B-3a:** `skills lock-plan` classifies drift against upstream path history (B11).
- **B-3b:** `lock-plan --write --expect <planDigest>` flipped `skills-lock.json` to v2
  (#1679).
- **B-4 (#1709):** `beep skills materialize [--check] [--skill <name>]` rebuilds every
  vendored skill from its pinned upstream plus its patch series, verified before it
  writes, through one clearing-house writer for both install targets; `skills update
  --check` reports hand-edited vendored output (`hand-edited-vendored-output`) and
  names both remedies. Decisions B24–B27 in
  [`research/p5-warehouse-update-train-design.md`](./research/p5-warehouse-update-train-design.md).
- **B-5 (this PR, opens P5):** `beep skills relock --skill <name> [--expect <planDigest>]`
  records a bumped pin's snapshot and effective hashes after a clean replay, and refuses
  (lock untouched) when a hunk conflicts, matches only at a shifted line, or the license
  bytes changed; `beep skills replay` is the read-only per-hunk report, and
  `beep skills train-issue` renders the batch's parent issue. `renovate.json` gains the
  per-skill `git-refs` regex manager over `skills-lock.json`, and
  `.github/workflows/skills-update-train.yml` replays every lock or patch change, relocks
  and rebuilds clean Renovate bumps, and writes the weekly batch issue. Decisions B28–B33
  in the same design doc.

C Stage-2 PR 2 (the C report's verdict fixes: whole-line assertion markers, arrow-chain
command spans, accepted doc fixes, and the `beep <cmd>` planned-command spelling),
C Stage-2 PR 2b (the domain evaluators), and B-3b (the skills lock write and flip) are
on main.

B-4 (`beep skills materialize`) is on main (#1709). This PR is B-5, the first P5 piece:
`skills relock`, `skills replay`, `skills train-issue`, the Renovate custom manager, and
the update-train workflow. B-6 (the hunk ledger, `--ghost`, `skills patch add`, and
`skills review`) is next for Workstream B, then Ritual 1 (the operator's classification).

Phase-0 verdicts: [`research/p1-fp-eyeball-verdicts.md`](./research/p1-fp-eyeball-verdicts.md).

## Latest Evidence

[PR #529](https://github.com/beep-effect/beep-effect/pull/529) — packet opening + P0/P1
research corpus, published via yeet full local proof. P2 grill decisions landed as their
own docs-only PR per the ratified process.

## Notes

Linked campaign: [Repository freshness audit](../knowledge-freshness-audit/README.md)
adds a paused, report-first campaign for semantic claim coverage, evidence-backed
remediation, and a bounded Jev evaluation. It inherits this initiative's ratified
decisions; the broader graph, bootstrap, warehouse, and scheduling roadmap remains
owned here. Its initial planning PR does not activate or complete the audit.

Research input: [`research/2026-08-13-compound-engineering-capture.md`](./research/2026-08-13-compound-engineering-capture.md)
preserves the folded always-on compounding vision behind the friction-ledger,
buzz-channel, and reflection-skill direction.

Self-hosting seed: this packet was deliberately hand-rolled before `beep goals
bootstrap` exists. When Workstream E's adoption path lands, the doctor adopts this
packet as its own first test case (hash-pinned adoption patch + preservation report).
Grill outcomes for the open decisions in SPEC.md land as their own docs-only PR before
implementation PRs.
