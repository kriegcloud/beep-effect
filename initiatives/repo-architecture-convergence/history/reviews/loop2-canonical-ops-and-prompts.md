# Loop 2 Re-review: Canonical Ops And Prompts

## Canonical Baseline

Strongest in-repo baseline reviewed: [initiatives/agent-governance-control-plane](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/agent-governance-control-plane/README.md). That packet establishes the canonical skeleton this initiative was expected to reach: authoritative `README.md` plus `SPEC.md`, durable design docs, `history/`, `ops/manifest.json`, per-phase handoffs, per-phase orchestrator prompts, and reusable prompt assets.

`repo-architecture-convergence` now matches that baseline structurally and in a few places exceeds it:

- it has a shared ops readme, shared prompt layer, prompt-assets catalog, per-phase handoffs, per-phase orchestrator prompts, and a machine-readable manifest
- it has a canonical adversarial review surface under [history/reviews/README.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/history/reviews/README.md:1)
- it has initiative-wide critique inputs indexed in [ops/manifest.json](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/manifest.json:152)

The remaining issues are not about missing skeleton. They are about the executable ops surface still disagreeing with the packet's own authoritative contract.

## Remaining Findings

### Critical

#### C1. The executable ops layer still uses the superseded phase model instead of the authoritative execution-led phase model

Category: phase orchestration drift

Evidence:

- [SPEC.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/SPEC.md:119) through [SPEC.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/SPEC.md:233) defines the loop1-remediated model:
  `P1 Program Controls`, `P2 Enablement and Wiring Cutover`, `P3 Shared-Kernel and Non-Slice Extraction`, `P4 repo-memory`, `P5 editor`, `P6 Remaining Operational/App/Agent Cutovers`, `P7 Final Architecture and Repo-Law Verification`.
- [ops/manifest.json](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/manifest.json:300) through [ops/manifest.json](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/manifest.json:814) still indexes the older sequence:
  `Family Groundwork And Metadata`, `Shared Kernel Contraction`, `Repo-Memory Slice Migration`, `Editor Slice Migration`, `Operational Workspace Cutover`, `Agents And Runtime Adapter Cutover`, `Export Cutover And Final Verification`.
- The handoff layer matches the older model, not the remediated one:
  [HANDOFF_P2.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P2.md:1),
  [HANDOFF_P5.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P5.md:1),
  [HANDOFF_P7.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P7.md:1).

Why it matters:

- The packet now has two incompatible phase contracts.
- Operators who follow `ops/` will execute work in the wrong order and against the wrong phase boundaries.
- This breaks the whole reason `ops/` exists as the canonical execution surface.

Concrete remediation:

- Rewrite `ops/manifest.json`, `ops/handoffs/*.md`, `ops/handoffs/*_ORCHESTRATOR_PROMPT.md`, and any phase-output references so they use exactly the same phase names, order, dependencies, and exit intent as `SPEC.md`.
- After that, re-check `README.md`, `PLAN.md`, `ops/README.md`, and `ops/handoffs/README.md` for any stale phrasing.

#### C2. The ops artifact model cannot satisfy the packet's own required durable work products

Category: artifact contract mismatch

Evidence:

- [SPEC.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/SPEC.md:90) through [SPEC.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/SPEC.md:97) requires additional canonical artifacts, including:
  `history/outputs/p0-consumer-importer-census.md`,
  `ops/compatibility-ledger.md`,
  `ops/architecture-amendment-register.md`,
  `history/outputs/p7-architecture-compliance-matrix.md`,
  `history/outputs/p7-repo-law-compliance-matrix.md`.
- [ops/README.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/README.md:26) through [ops/README.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/README.md:32) says each phase owns one primary output plus three review artifacts.
- [ops/prompts/agent-prompts.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/prompts/agent-prompts.md:24) through [ops/prompts/agent-prompts.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/prompts/agent-prompts.md:33) encodes the same one-output model.
- [ops/manifest.json](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/manifest.json:239) exposes only one `artifacts.output` per phase and does not index the extra required scorecards or ledgers.
- Search across the entire `ops/` surface for `p0-consumer-importer-census`, `p7-architecture-compliance-matrix`, `p7-repo-law-compliance-matrix`, `compatibility-ledger`, and `architecture-amendment-register` returned no matches.

Why it matters:

- An operator can follow the current ops packet exactly and still fail the authoritative spec.
- P0 and P7 in particular cannot close correctly because their required proof artifacts are not part of the executable contract.

Concrete remediation:

- Change the ops artifact model from "one output per phase" to "one or more required outputs per phase plus cross-phase durable artifacts".
- Index every required durable artifact in `ops/manifest.json` with path, owner phase, and status.
- Update the shared prompt layer and handoffs so P0, P1, and P7 explicitly own their extra artifacts.

### High

#### H1. The shared prompt and handoff layer still frames later phases as packet-definition work instead of executed repo-change work

Category: execution semantics drift

Evidence:

- [HANDOFF_P3.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P3.md:5) says "Produce the decision-complete migration packet".
- [HANDOFF_P4.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P4.md:5) says the same for `editor`.
- [HANDOFF_P5.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P5.md:5) says "Close the migration packet".
- [HANDOFF_P6.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P6.md:5) and [HANDOFF_P7.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/HANDOFF_P7.md:5) keep the same packet-closing framing.
- The corresponding orchestrator prompts are still written around defining routes and surfaces, not landing repo diffs plus validation evidence:
  [P3_ORCHESTRATOR_PROMPT.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/P3_ORCHESTRATOR_PROMPT.md:15),
  [P5_ORCHESTRATOR_PROMPT.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/P5_ORCHESTRATOR_PROMPT.md:15),
  [P7_ORCHESTRATOR_PROMPT.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/handoffs/P7_ORCHESTRATOR_PROMPT.md:15).

Why it matters:

- This directly reintroduces the loop1 failure mode.
- Workers are still being told to define migration packets where the spec now requires executed implementation plus proof.

Concrete remediation:

- Rewrite every handoff objective, required output section, evidence section, and exit gate so the unit of work is landed repo change plus proof.
- Rewrite every orchestrator prompt so the required outcomes start with executed repo diffs, importer rewrites, compatibility deletions, and gate evidence.

#### H2. The mandatory command gate and Graphiti contract is still absent from the executable ops surface

Category: verification contract gap

Evidence:

- [SPEC.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/SPEC.md:271) through [SPEC.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/SPEC.md:279) names exact required commands, including `bun run graphiti:proxy:ensure`, `bun run config-sync:check`, `bun run check`, `bun run lint`, `bun run test`, `bun run docgen`, and `bun run audit:full`.
- [ops/prompts/agent-prompts.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/prompts/agent-prompts.md:6) through [ops/prompts/agent-prompts.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/prompts/agent-prompts.md:42) does not name any of those commands.
- [ops/prompt-assets/verification-checks.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/prompt-assets/verification-checks.md:1) through [ops/prompt-assets/verification-checks.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/prompt-assets/verification-checks.md:15) is generic and does not encode the command matrix.
- Repo-wide search across `ops/manifest.json`, `ops/handoffs/*.md`, `ops/prompts/agent-prompts.md`, and `ops/prompt-assets/*.md` for `graphiti:proxy:ensure`, `config-sync:check`, `bun run check`, `bun run lint`, `bun run test`, `bun run docgen`, `audit:full`, and `requiredCommands` returned no matches.

Why it matters:

- The packet claims ops is the execution surface, but the execution surface still does not tell workers what to run.
- That makes "evidence verified" non-replayable and easy to hand-wave.

Concrete remediation:

- Add per-phase `requiredCommands` and `requiredSearchAudits` to `ops/manifest.json`.
- Mirror those exact commands in each handoff and orchestrator prompt.
- Add Graphiti bootstrap and writeback obligations to `ops/prompts/agent-prompts.md`.

#### H3. The review namespace is internally inconsistent: `loopN-*` in the review surface, `pX-*` in the ops surface

Category: review contract drift

Evidence:

- [history/reviews/README.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/history/reviews/README.md:20) through [history/reviews/README.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/history/reviews/README.md:24) defines the naming contract only as `loopN-<topic>.md`, `loopN-remediation-register.md`, and `loopN-rereview-gate.md`.
- [ops/README.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/README.md:28) through [ops/README.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/README.md:31) defines per-phase artifacts as `pX-critique.md`, `pX-remediation.md`, and `pX-rereview.md`.
- [ops/manifest.json](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/manifest.json:185) through [ops/manifest.json](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/ops/manifest.json:188) encodes the same `pX-*` pattern.

Why it matters:

- The review surface and the ops surface disagree about what a valid review artifact is.
- That makes automation, handoff instructions, and future review loops ambiguous.

Concrete remediation:

- Decide whether phase reviews are part of the `loopN-*` namespace or a separate `pX-*` namespace.
- Then update `history/reviews/README.md`, `ops/README.md`, and `ops/manifest.json` so the distinction is explicit and machine-readable.

#### H4. The canonical paths for the compatibility ledger and amendment register are still unresolved

Category: durable ops index drift

Evidence:

- [SPEC.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/SPEC.md:93) and [SPEC.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/SPEC.md:94) declare the canonical paths as `ops/compatibility-ledger.md` and `ops/architecture-amendment-register.md`.
- Those files do not exist in `ops/`.
- The existing ledger files are instead under:
  [history/ledgers/compatibility-ledger.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/history/ledgers/compatibility-ledger.md)
  and
  [history/ledgers/amendment-register.md](/home/elpresidank/YeeBois/projects/beep-effect/initiatives/repo-architecture-convergence/history/ledgers/amendment-register.md).
- The `ops/` surface does not index either location.

Why it matters:

- These are blocking governance artifacts, not optional notes.
- Right now the spec, the file tree, and the machine-readable ops index all disagree on where operators should maintain them.

Concrete remediation:

- Pick one canonical location and one canonical name set.
- Update the spec, ops manifest, prompt layer, and handoffs to point to that single location.
- If `history/ledgers/` is the keeper, index it explicitly from `ops/manifest.json`.

## Clean Areas

- The initiative now has the full canonical packet skeleton: root contract docs, durable design docs, `history/`, `ops/`, handoffs, prompts, and prompt assets.
- The ops layer is now clearly separated into shared prompt layer, prompt assets, handoffs, and a machine-readable manifest.
- A durable adversarial review surface now exists and is clearly linked as part of the packet, which is a real improvement over loop1.
- The manifest now inventories prompt assets and the baseline loop1 critique set, which is materially closer to the canonical control-plane packet.

## Final Verdict

`6 findings` remain in this lens.

By severity:

- `Critical`: `2`
- `High`: `4`

Verdict:

- `Not clean yet.` The packet now looks canonical on the outside, but the actual execution surface is still internally split between the old document-first phase model and the new execution-first spec contract. Until the ops layer is realigned, it is still possible for a careful operator to follow the packet faithfully and miss the authoritative requirements.
