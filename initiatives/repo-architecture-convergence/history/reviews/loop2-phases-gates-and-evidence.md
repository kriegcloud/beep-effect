# Loop 2 Re-review: Phases, Gates, And Evidence

## Scope

This re-review covers the updated execution contract for
`initiatives/repo-architecture-convergence` with a narrow lens on phase
sequencing, dependencies, exit criteria, blocker handling, and evidence rules.
It reviews the authoritative plan surfaces in `SPEC.md` and `PLAN.md`, then
stress-tests whether the machine-readable and operator-facing control surfaces
in `ops/` and `history/` actually enforce the same model.

## Remaining Findings

### Critical

#### 1. Control surfaces still encode the pre-remediation phase model and dependency graph

- Category: Phase model and dependency coherence
- Evidence:
  - `SPEC.md:136-220` and `PLAN.md:17-36` define the execution-led sequence as
    `P2 enablement`, `P3 shared-kernel and non-slice extraction`,
    `P4 repo-memory`, `P5 editor`, and `P6 remaining operational/app/agent cutovers`.
  - `ops/handoffs/README.md:28-33` still advertises `P2 Shared Kernel Contraction`,
    `P3 Repo-Memory Slice Migration`, `P5 Operational Workspace Cutover`, and
    `P6 Agents And Runtime Adapter Cutover`.
  - `ops/handoffs/HANDOFF_P0-P7.md:42-49` repeats the old order.
  - `ops/manifest.json:381-388`, `ops/manifest.json:465-473`,
    `ops/manifest.json:641-648`, and `ops/manifest.json:726-733` still encode
    the stale phase names and stale dependencies.
- Why it matters:
  The operator flow starts with `ops/manifest.json` and the handoff packet, so
  the executable control plane can still launch the wrong phase, use the wrong
  dependency assumptions, and skip the early enablement work that the spec now
  treats as mandatory before slice migration.
- Concrete remediation:
  Rewrite the manifest, handoff index, and cross-phase handoff so they match
  the `SPEC.md`/`PLAN.md` phase model exactly. Update per-phase names,
  objectives, artifact references, and dependency graphs so `P2` is enablement,
  `P3` is shared-kernel/non-slice extraction, `P4` is `repo-memory`, `P5` is
  `editor`, and `P6` owns the remaining operational/app/agent cutovers.

#### 2. The operator packets still frame later phases as packet authoring instead of executed repo work

- Category: Exit criteria and execution posture
- Evidence:
  - `SPEC.md:253-266` requires evidence packs with changed surfaces, commands,
    audits, ledger deltas, and readiness statements.
  - `SPEC.md:289-291` explicitly says narrative intent without executed repo
    diffs is scaffold-only and blocks closure.
  - `ops/README.md:17-22` still tells operators to "Produce or update the phase
    output".
  - `ops/handoffs/HANDOFF_P3.md:5-6` and `ops/handoffs/HANDOFF_P4.md:5-6`
    still say "Produce the decision-complete migration packet".
  - `ops/handoffs/HANDOFF_P5.md:5-6` and `ops/handoffs/HANDOFF_P6.md:5-7`
    still say "Close the migration packet".
  - `ops/handoffs/HANDOFF_P7.md:30-37` still centers "Define" and "Produce"
    outputs instead of landed proof artifacts.
  - `ops/prompt-assets/required-outputs.md:12-17` allows artifacts to answer
    "What changed or was reviewed", which still normalizes review-only progress.
- Why it matters:
  A worker can still follow the official phase packet and end with refreshed
  markdown rather than landed repo changes. That recreates the exact
  document-first failure mode that loop1 was supposed to eliminate.
- Concrete remediation:
  Rewrite `ops/README.md`, `required-outputs.md`, and `HANDOFF_P3` through
  `HANDOFF_P7` so phase closure requires executed repo diffs, importer rewires,
  compatibility deletions or governed shims, command evidence, and search-audit
  proof. Reserve "define" language only for `P0`, `P1`, or explicit amendment
  candidates.

### High

#### 3. The exact command-gate stack exists in the spec, but it is not operationalized in the phase packets

- Category: Gate execution and evidence capture
- Evidence:
  - `SPEC.md:258-278` and `PLAN.md:50-59` define exact commands and when they
    are mandatory: `graphiti:proxy:ensure`, `config-sync:check`, `check`,
    `lint`, `test`, `docgen`, `audit:full`, and exact search audits.
  - `ops/prompts/agent-prompts.md:37-42` says to run the checks named in the
    handoff and prompt assets.
  - `ops/prompt-assets/verification-checks.md:1-15` contains no command list.
  - `ops/handoffs/P2_ORCHESTRATOR_PROMPT.md:23-28` and
    `ops/handoffs/P7_ORCHESTRATOR_PROMPT.md:24-30` describe verification only
    in abstract terms, and the same pattern holds across the remaining phase
    prompts and handoffs.
- Why it matters:
  The binding commands are currently easy to skip because the operator-facing
  packets do not actually enumerate them. That means a phase can still appear
  verified without the mandatory command suite or exact search-audit evidence.
- Concrete remediation:
  Add an explicit command-gate block to every phase handoff and orchestrator
  prompt, and mirror that data in `ops/manifest.json`. Each phase packet should
  state the exact commands, when they are required, where results are recorded,
  and when evidence becomes stale.

#### 4. Canonical governance artifacts still have conflicting paths

- Category: Evidence routing and process hygiene
- Evidence:
  - `SPEC.md:92-94` declares the compatibility ledger and
    architecture-amendment register at `ops/compatibility-ledger.md` and
    `ops/architecture-amendment-register.md`.
  - `history/README.md:23-29`, `history/quick-start.md:12-13`, and
    `history/reviews/loop1-rereview-gate.md:16-17` direct operators to
    `history/ledgers/compatibility-ledger.md` and
    `history/ledgers/amendment-register.md`.
- Why it matters:
  The program now has two competing "canonical" homes for the same blocking
  control artifacts. That creates process drift, weakens evidence lookup, and
  makes it unclear which file must be current before a phase can close.
- Concrete remediation:
  Choose one canonical location for both ledgers, then update `SPEC.md`,
  history guidance, manifest references, and future handoffs to that single
  path. The manifest should index the chosen location explicitly.

#### 5. P7 still does not operationalize the two mandatory final compliance matrices

- Category: Final proof completeness
- Evidence:
  - `SPEC.md:95-96` requires
    `history/outputs/p7-architecture-compliance-matrix.md` and
    `history/outputs/p7-repo-law-compliance-matrix.md`.
  - `SPEC.md:236-238` makes both scorecards part of what P7 must land.
  - `ops/manifest.json:841-865` tracks only one P7 output artifact and does not
    list either matrix file.
  - `ops/handoffs/HANDOFF_P7.md:21-38` and
    `ops/handoffs/P7_ORCHESTRATOR_PROMPT.md:18-22` omit both matrix artifacts.
- Why it matters:
  Final closure can still happen without the durable, row-by-row proof objects
  that the spec uses to define 100% architecture and repo-law compliance.
- Concrete remediation:
  Promote both P7 matrices into first-class required artifacts in the manifest,
  P7 handoff, prompt assets, and the P7 output scaffold. The P7 re-review
  should fail unless both matrices exist and are fully populated.

### Medium

#### 6. The blocker severity taxonomy is still inconsistent across the review loop

- Category: Blocker handling and re-review consistency
- Evidence:
  - `ops/prompt-assets/review-loop.md:5-19` uses `blocking`, `major`, `minor`,
    and `note`.
  - `ops/prompt-assets/blocker-protocol.md:3-9` blocks on findings at
    `blocking severity`.
  - `ops/prompts/agent-prompts.md:46-47` defines a blocker as an unresolved
    `high severity` finding.
  - `history/reviews/README.md:36-39` says `critical and high` findings remain
    blocking.
- Why it matters:
  Different reviewers can classify the same defect differently and reach
  different closure decisions, which weakens the critique -> remediation ->
  re-review gate and makes manifest status harder to trust.
- Concrete remediation:
  Standardize one severity vocabulary across all review surfaces, define which
  levels block closure, and require manifest `openFindings` entries to use the
  same taxonomy.

## Clean Areas

- `SPEC.md` now clearly defines an execution-led phase model, measurable exit
  criteria, stale-evidence rules, and reopen-the-owning-phase behavior.
- `PLAN.md` now encodes a real stop-the-line posture instead of treating later
  phases as catch-all cleanup.
- The history surface now correctly treats critique -> remediation -> re-review
  as a required gate and explicitly distinguishes scaffolded outputs from
  executed ones.
- Graphiti bootstrap/writeback and temporary-exception governance are now
  present in the initiative guidance instead of being implicit.

## Final Verdict

The lens is not clean yet.

Remaining findings: `6`

- `Critical`: `2`
- `High`: `3`
- `Medium`: `1`
- `Low`: `0`

The initiative is materially stronger than the loop1 version, but the active
ops control plane still disagrees with the authoritative spec in ways that can
mis-sequence execution, allow document-first closure, and miss mandatory proof
artifacts. This packet should not be treated as phase-execution-safe until the
remaining control-surface inconsistencies are closed.
