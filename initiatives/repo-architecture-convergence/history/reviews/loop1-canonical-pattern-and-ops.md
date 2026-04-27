# Loop 1 Review — Canonical Pattern And Ops

## Canonical Baseline

The strongest comprehensive canonical initiative packet currently checked into
the repo is `initiatives/agent-governance-control-plane`.

That packet is the baseline because it is not only structurally complete, but
also operationally legible:

- it carries the expected root package surfaces (`README.md`, `SPEC.md`,
  `PLAN.md`, `design/`, `history/`, `ops/manifest.json`, `ops/handoffs/`)
- it also includes reusable operational surfaces that make the packet runnable
  by other agents without local invention:
  `ops/prompt-assets/` and `ops/prompts/agent-prompts.md`
- its manifest inventories prompt assets machine-readably
  (`initiatives/agent-governance-control-plane/ops/manifest.json:11-36`)
- its SPEC exposes prompt assets in navigation and names them as part of the
  packet contract
  (`initiatives/agent-governance-control-plane/SPEC.md:64-71`,
  `156-178`)
- its prompts define required reads, required outputs, and verification checks
  instead of only naming a target file
  (`initiatives/agent-governance-control-plane/ops/prompts/agent-prompts.md:7-77`,
  `ops/prompt-assets/VALIDATION_ORCHESTRATOR_PROMPT.md:7-26`)

`repo-architecture-convergence` is directionally strong, but it does not yet
match that operational completeness.

## Findings

### Critical

#### 1. Missing reusable prompt-asset layer

Category: `misalignment`

Evidence:
- The canonical baseline exposes prompt assets in both navigation and manifest:
  `initiatives/agent-governance-control-plane/SPEC.md:64-71`,
  `initiatives/agent-governance-control-plane/ops/manifest.json:30-36`.
- `repo-architecture-convergence` has no `ops/prompt-assets/` directory and no
  `ops/prompts/` directory in its checked-in tree; its README and SPEC expose
  only handoffs/prompts under `ops/handoffs/`
  (`initiatives/repo-architecture-convergence/README.md:18-26`,
  `initiatives/repo-architecture-convergence/SPEC.md:16-69`,
  `202-215`).

Why it matters:
- The packet currently has phase prompts, but no reusable validation prompt,
  implementation executor prompt, auditor-catalog prompt, workflow template, or
  initiative bootstrap surface.
- That means orchestration logic will be reinvented per loop, which is exactly
  the failure mode the canonical packet solved.
- In practice, critique, remediation, and re-validation sessions will drift in
  output shape and rigor.

Concrete remediation:
- Add `ops/prompt-assets/` with at least:
  `VALIDATION_ORCHESTRATOR_PROMPT.md`,
  `IMPLEMENTATION_EXECUTOR_PROMPT.md`,
  `AUDITOR_CATALOG_PROMPT.md`,
  `CATEGORY_WORKFLOW_TEMPLATE.md`,
  and a convergence-specific bootstrap/execution template.
- Add `ops/prompts/agent-prompts.md` as the centralized prompt catalog.
- Wire these assets into `README.md`, `SPEC.md`, `ops/handoffs/README.md`, and
  `ops/manifest.json`.

#### 2. The phase model documents migrations more than it executes them

Category: `better phase`

Evidence:
- The success criteria require real repo-state convergence
  (`initiatives/repo-architecture-convergence/SPEC.md:241-263`).
- But core migration phases are written as packet-production phases:
  `P3` says "Produce the decision-complete migration packet"
  (`ops/handoffs/HANDOFF_P3.md:3-6`);
  `P4` says the same for `editor`
  (`ops/handoffs/HANDOFF_P4.md:3-6`);
  `P5` and `P6` similarly "close the migration packet" rather than land the
  work.
- The phase table also marks P3-P6 as route/packet closure rather than landed
  implementation evidence
  (`initiatives/repo-architecture-convergence/SPEC.md:219-228`).

Why it matters:
- As written, the initiative can complete its phase outputs while the codebase
  still remains largely unmigrated.
- That breaks the user's requested outcome: a packet comprehensive enough that
  the codebase ends 100% aligned with `ARCHITECTURE.md`.
- The packet currently guarantees planning completeness better than convergence
  completeness.

Concrete remediation:
- Rewrite P3-P7 so each phase closes on landed repository change plus explicit
  verification evidence, not only a route packet.
- Either:
  1. keep the same phase count but change objectives/exit gates to
     implementation and validation outcomes, or
  2. split each major area into `packet` then `execution` subphases and make
     final completion depend on executed moves, import rewrites, and passing
     verification.
- Ensure the manifest status model distinguishes `planned`, `executing`,
  `validated`, and `closed`.

### High

#### 3. Per-phase orchestrator prompts are materially underspecified

Category: `issue`

Evidence:
- The combined prompt is only a short generic instruction block
  (`initiatives/repo-architecture-convergence/ops/handoffs/P0-P7_ORCHESTRATOR_PROMPT.md:1-6`).
- The phase prompts are similarly terse; for example P0 is six lines and
  mostly names files and routing targets
  (`initiatives/repo-architecture-convergence/ops/handoffs/P0_ORCHESTRATOR_PROMPT.md:1-6`).
- The canonical baseline prompt surfaces are much stronger:
  required actions and outputs in
  `initiatives/agent-governance-control-plane/ops/prompt-assets/VALIDATION_ORCHESTRATOR_PROMPT.md:7-26`
  and verification bullets in
  `initiatives/agent-governance-control-plane/ops/prompts/agent-prompts.md:7-77`.

Why it matters:
- Short prompts are easy to execute inconsistently.
- They do not force agents to emit the same artifacts, verify the same
  conditions, or stop on the same blockers.
- That is especially risky in parallel adversarial loops where consistency is
  the whole point.

Concrete remediation:
- Expand every orchestrator prompt to include:
  required inputs,
  required outputs,
  mandatory verification checks,
  blocker conditions,
  explicit refusal rules for unresolved ambiguity,
  and required manifest/update steps.

#### 4. The manifest is not a full machine-readable index of operational assets

Category: `inconsistency`

Evidence:
- The current manifest inventories structural patterns, design docs, and phases
  only (`initiatives/repo-architecture-convergence/ops/manifest.json:12-109`).
- The canonical baseline manifest explicitly inventories prompt assets
  (`initiatives/agent-governance-control-plane/ops/manifest.json:11-36`).
- The current manifest does not describe prompt assets, prompt catalogs, review
  artifacts, or any critique/remediation loop surfaces.

Why it matters:
- Agents and automation cannot discover the full packet surface from the
  manifest alone.
- That makes `manifest.json` weaker as an orchestration source and increases
  drift between human-facing docs and machine-facing routing.

Concrete remediation:
- Extend the manifest with sections for:
  `promptAssets`,
  `opsPrompts`,
  `reviewArtifacts`,
  `phaseStatusModel`,
  and optionally `requiredLoops` or `qualityGates`.
- Keep the manifest authoritative enough that a session can bootstrap from it
  without browsing the whole tree.

#### 5. There is no canonical home for critique-loop artifacts

Category: `better process`

Evidence:
- The packet tree currently contains `design/`, `history/outputs/`, and
  `ops/handoffs/`, but no checked-in review surface.
- The usage docs only instruct operators to write phase outputs and update the
  manifest
  (`initiatives/repo-architecture-convergence/ops/handoffs/README.md:6-39`,
  `initiatives/repo-architecture-convergence/history/quick-start.md:3-12`).

Why it matters:
- Parallel adversarial review produces artifacts that need a durable,
  collision-safe landing zone.
- Without a canonical review surface, critiques become ephemeral terminal work
  instead of part of the initiative evidence trail.
- That makes remediation tracking and re-review much weaker than it needs to
  be.

Concrete remediation:
- Add `history/reviews/README.md` plus a naming contract such as
  `loopN-<topic>.md`.
- Add a review-loop section to the manifest.
- Update quick-start and handoff docs so critique artifacts are first-class
  inputs to remediation and re-validation.

### Medium

#### 6. Handoffs define tasks, but not the required artifact schema

Category: `improvement`

Evidence:
- P3 and P4 handoffs list required work and completion checklists, but they do
  not define the required internal sections of the output artifact
  (`ops/handoffs/HANDOFF_P3.md:18-49`,
  `ops/handoffs/HANDOFF_P4.md:19-46`).
- The canonical baseline handoffs are paired with prompt assets and explicit
  decision contracts that narrow output shape
  (`initiatives/agent-governance-control-plane/ops/handoffs/HANDOFF_P0.md:8-18`,
  `ops/prompts/agent-prompts.md:7-77`).

Why it matters:
- Two competent agents can satisfy the same checklist with incompatible output
  structures.
- Later phases then have to re-parse and normalize prior outputs before using
  them.

Concrete remediation:
- For each phase, define a required artifact structure.
- At minimum include named sections such as:
  route table,
  dependency order,
  compatibility ledger,
  import/app impact,
  command/verification plan,
  unresolved blockers,
  and closure statement.

#### 7. The packet does not define the mandatory critique -> remediation -> re-review loop

Category: `better process`

Evidence:
- Quick-start instructs only: read, run prompt, write output, update manifest
  (`initiatives/repo-architecture-convergence/history/quick-start.md:3-9`).
- The handoff README says the same
  (`initiatives/repo-architecture-convergence/ops/handoffs/README.md:8-12`).
- No local packet document turns adversarial review into a required phase gate,
  even though this initiative is large, cross-cutting, and high-risk.

Why it matters:
- The packet currently depends on good operator habits rather than explicit
  process.
- That is fragile for long-running architecture programs where each phase can
  otherwise close with unchallenged assumptions.

Concrete remediation:
- Add a reusable ops runbook or prompt asset that makes every phase follow:
  critique batch -> synthesis -> remediation batch -> re-critique -> validation
  -> manifest update.
- Make closure contingent on zero unresolved critical/high findings or on an
  explicit exception ledger.

### Low

#### 8. The packet's self-description underclaims the canonical pattern it says it reuses

Category: `inconsistency`

Evidence:
- The current SPEC's structural-pattern list omits phase prompts and prompt
  assets (`initiatives/repo-architecture-convergence/SPEC.md:202-215`).
- The manifest likewise omits `phase prompts` from its structural pattern list
  and contains no prompt-asset inventory
  (`initiatives/repo-architecture-convergence/ops/manifest.json:12-30`).
- The baseline packet explicitly names `per-phase prompts` and inventories
  prompt assets
  (`initiatives/agent-governance-control-plane/SPEC.md:156-167`,
  `ops/manifest.json:11-36`).

Why it matters:
- This is a small signal, but it reflects the broader operational gap: the new
  packet copied the shape of the canonical pattern without fully carrying over
  its prompt and governance surfaces.

Concrete remediation:
- After adding the missing ops assets, update the README, SPEC, and manifest so
  the declared structural pattern matches the actual tree and operating model.

## Better Direction

The packet should evolve from "good migration design scaffold" to "canonical
execution program" in four moves:

1. Restore the full ops layer from the repo's best packet:
   prompt assets, prompt catalog, review surfaces, and machine-readable ops
   inventory.
2. Re-slice the later phases around executed convergence, not only migration
   packet completeness.
3. Define one mandatory loop for every phase:
   critique -> remediation -> re-review -> validation.
4. Standardize artifact schemas so each phase output is directly consumable by
   the next agent without interpretation work.

## Required Remediations

1. Add `ops/prompt-assets/` and `ops/prompts/agent-prompts.md`, then wire them
   into README, SPEC, handoffs, and manifest.
2. Rewrite P3-P7 so completion is based on landed implementation and validation
   evidence, not merely decision-complete migration packets.
3. Expand all orchestrator prompts with required outputs, verification bullets,
   blocker rules, and manifest-update duties.
4. Add a canonical review surface under `history/reviews/` and make critique
   artifacts first-class inputs to remediation.
5. Extend `ops/manifest.json` so it inventories ops assets, review artifacts,
   and a richer phase status model.
6. Add required output schemas to each handoff so phase artifacts are uniform
   and directly reusable.
7. Add an explicit loop runbook that makes critique/remediation/re-review a
   mandatory gate for every phase.
8. Align packet self-description with the actual operational surface after the
   above changes land.

## Residual Risks

- Even after the packet is fixed structurally, the routing judgments themselves
  still need repo-reality validation during execution.
- The largest remaining risk is false closure: phase documents can look strong
  while code movement, import rewrites, and verification debt remain open.
- `repo-memory` and `editor` are still reasonable first migrations, but they
  need execution-grade phase contracts, not only planning-grade ones.

## Verdict

The initiative is not currently acceptable as a canonical end-to-end
architecture convergence packet.

It is a strong bootstrap scaffold with good architectural judgment, but it is
operationally incomplete relative to the repo's strongest canonical pattern and
it does not yet define a phase model that can guarantee the codebase ends in
full `ARCHITECTURE.md` compliance.

### Required Change Checklist

- [ ] Add reusable prompt assets and a centralized prompt catalog
- [ ] Rework later phases around executed migration and validation
- [ ] Strengthen orchestrator prompts with required outputs and blocker rules
- [ ] Add canonical review-loop artifact surfaces and instructions
- [ ] Expand the manifest into a full machine-readable ops index
- [ ] Define required output schemas for each phase artifact
- [ ] Make critique -> remediation -> re-review mandatory
- [ ] Align README/SPEC/manifest wording with the completed ops surface
