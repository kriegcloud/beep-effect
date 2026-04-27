# Loop 1 Review — Phases, Gates, And Process

## Scope

This review stress-tests only the initiative execution model for
`repo-architecture-convergence`: phase sequencing, dependency handling, exit
gates, handoff rigor, and orchestration prompts. It does not review routing
correctness package by package.

## Findings

### Critical

#### F-C1 — The initiative is structured as a documentation program, not an execution program

Category: `misalignment`

Evidence: `SPEC.md:217-228` defines every phase output as a markdown artifact.
`history/quick-start.md:3-9` tells operators to read docs, run a prompt, write
or refine the phase output, and update the manifest. The combined orchestrator
prompt at `ops/handoffs/P0-P7_ORCHESTRATOR_PROMPT.md:1-6` says to "write or
refine only the active phase output". Phase handoffs such as
`ops/handoffs/HANDOFF_P3.md:33-49` and `ops/handoffs/HANDOFF_P7.md:27-43`
close when an implementer could act, not when the repo has actually been
migrated and revalidated.

Why it matters: the initiative success criteria in `SPEC.md:243-263` describe
repo state, but the phase model only requires planning artifacts. That makes it
possible to "complete" the initiative while the codebase is still materially
non-compliant.

Concrete remediation: convert the initiative into a two-track program. Either
split each major phase into `design` and `execution` phases, or redefine each
phase deliverable so it includes both repo changes and validation evidence.
Phase completion must require code movement plus passing checks, not only a
decision packet.

#### F-C2 — There is no durable control plane for compatibility shims or amendment candidates

Category: `issue`

Evidence: `ops/handoffs/HANDOFF_P7.md:17-23` requires listing every temporary
compatibility surface at the end. `design/non-slice-family-migration.md:75-84`
defines the alias policy, but only at the active-phase-output level. The
manifest at `ops/manifest.json:31-109` has no registry for aliases, owners,
consumers, deletion phases, gate evidence, or architecture-amendment
candidates.

Why it matters: P7 depends on perfect recall across all prior phases. Without a
single ledger, shims and exceptions will be missed, and the initiative cannot
prove that the second architecture has actually been deleted.

Concrete remediation: add a durable control-plane artifact and wire every phase
to it. Minimum needed: a compatibility ledger with owner, creation phase,
consumers, deletion phase, validation query, and status; plus an amendment
candidate register with rationale, blocking scope, and resolution status.

### High

#### F-H1 — Tooling enablement is scheduled too late relative to slice migration

Category: `better phase`

Evidence: `SPEC.md:188-191` says topology and metadata groundwork must be
normalized before large moves stay coherent. `design/non-slice-family-migration.md:13-26`
says the old topology is still encoded in workspaces, path aliases, `docgen`,
`turbo`, scripts, and `create-package`. But `ops/handoffs/HANDOFF_P1.md:18-28`
only asks for those changes to be defined, while
`ops/handoffs/HANDOFF_P5.md:19-25` delays the operational rewrite plan until
after `P3` and `P4`.

Why it matters: `repo-memory` and `editor` migrations will be executed while
the repo still emits and validates the legacy topology. That is the exact drift
mode the initiative says it wants to eliminate.

Concrete remediation: insert an enablement-execution phase before slice
migration. That phase should land workspace globs, alias rewrites, scaffolder
updates, docgen updates, and repo-check updates before `repo-memory` or
`editor` move.

#### F-H2 — The `shared/use-cases` decision is forced before slice evidence exists

Category: `better phase`

Evidence: `design/current-state-routing-canon.md:150-160` says P0 should close
whether any high-bar `shared/use-cases` package is needed after `repo-memory`
and `editor` migrate. `ops/handoffs/HANDOFF_P2.md:19-24` requires a decision in
P2. But the evidence that would justify or reject such a package is produced by
the slice work in `P3` and `P4`.

Why it matters: the initiative is asking for a repo-wide shared-kernel verdict
before the two key slice migrations have been modeled in enough detail. That
creates avoidable rework and invites a speculative exception.

Concrete remediation: make P2 provisional for shared-kernel contraction and
defer the final `shared/use-cases` verdict to a post-slice confirmation gate.
If the phase numbering stays the same, P2 should record a hypothesis and P7
should require confirmation or deletion.

#### F-H3 — Exit gates are narrative rather than testable

Category: `better process`

Evidence: `ops/handoffs/HANDOFF_P0.md:44-47`, `HANDOFF_P1.md:43-46`,
`HANDOFF_P2.md:38-40`, `HANDOFF_P3.md:46-49`, `HANDOFF_P4.md:43-46`,
`HANDOFF_P5.md:40-42`, and `HANDOFF_P7.md:40-43` all use prose gates like
"fresh implementer can..." or "legible shared-kernel surface". P7 defines a
verification suite in principle, but does not require earlier phases to attach
measurable evidence.

Why it matters: subjective gates make phase closure a judgment call. In a large
parallel migration, that means later phases inherit ambiguity instead of a
verified baseline.

Concrete remediation: require every phase to publish explicit validation
evidence. Each handoff should name required commands, required search queries,
required manifests or ledgers to update, and the exact artifacts that prove the
gate passed.

#### F-H4 — The phase model lacks a dependency and consumer graph gate

Category: `issue`

Evidence: `ops/handoffs/HANDOFF_P0.md:19-30` inventories workspaces and routes,
but it does not require a dependency graph or importer census. Slice handoffs
only call out one app each: `ops/handoffs/HANDOFF_P3.md:28-31` mentions
`apps/desktop`, and `ops/handoffs/HANDOFF_P4.md:27-29` mentions
`apps/editor-app`.

Why it matters: package moves fail at the consumers, not at the package
boundary diagram. Without a graph of dependents, hidden importers and scripts
will be discovered late, when the batch is already in flight.

Concrete remediation: expand P0 so it produces a consumer/dependency census for
every moved package family. Then require later phases to enumerate all affected
consumers, the migration order, and the verification scope per consumer set.

#### F-H5 — There is no batch execution, green-bar, or rollback protocol

Category: `better process`

Evidence: the operator flow in `history/quick-start.md:3-9` and the phase table
in `SPEC.md:217-228` are artifact-centric. The only explicit repo-quality
requirement appears at the end-state criteria in `SPEC.md:258-263` and
`design/verification-and-cutover.md:8-24`.

Why it matters: without batch rules, the program invites oversized moves that
break the workspace for long periods. That is especially dangerous for early
high-blast-radius work such as `repo-memory`, workspace-root moves, and import
surface rewrites.

Concrete remediation: define an execution protocol with maximum batch size,
required quality commands after each batch, stop-the-line conditions,
consumer-first migration order, and rollback or hold-point rules when a batch
fails.

### Medium

#### F-M1 — The manifest state model is too weak for parallel orchestration

Category: `inconsistency`

Evidence: `ops/manifest.json:4-11` and `ops/manifest.json:31-95` only expose
`pending` and `completed` states and basic phase pointers. There is no
`blocked`, `in_review`, `ready`, `dependsOn`, `blockedBy`, `evidence`, or
`owner` field.

Why it matters: a multi-agent migration needs an explicit state machine. With
the current manifest, orchestration has no machine-readable way to distinguish a
scaffolded phase, a blocked phase, a phase awaiting validation, or a phase that
has passed but not yet been merged.

Concrete remediation: extend the manifest schema with dependencies, readiness
state, blockers, owners, evidence links, compatibility-ledger references, and
amendment-candidate references.

#### F-M2 — The orchestrator prompts omit critical housekeeping and escalation rules

Category: `better process`

Evidence: the combined prompt at `ops/handoffs/P0-P7_ORCHESTRATOR_PROMPT.md:1-6`
and the phase prompts such as `ops/handoffs/P0_ORCHESTRATOR_PROMPT.md:1-6` and
`ops/handoffs/P3_ORCHESTRATOR_PROMPT.md:1-6` are short and task-local. They do
not require prereq checks, manifest updates, reflection-log updates, ledger
updates, validation capture, or a blocking path when prerequisites are not met.

Why it matters: short prompts are easy to execute inconsistently. Different
operators will produce differently shaped outputs, forget control-plane updates,
and silently continue past unresolved blockers.

Concrete remediation: replace the current one-paragraph prompts with a fixed
execution template that requires prereq validation, artifact updates, ledger
updates, gate evidence, blockers, and explicit escalation when a dependency is
not ready.

### Low

#### F-L1 — Placeholder outputs create false-positive artifact presence

Category: `improvement`

Evidence: `history/outputs/p0-repo-census-and-routing-canon.md:1-15` already
exists as a placeholder, while the manifest at `ops/manifest.json:31-95` points
to output paths without distinguishing scaffold-only artifacts from completed
ones.

Why it matters: humans and automation can mistake artifact presence for
artifact readiness, especially in a parallel review or execution loop.

Concrete remediation: either do not create phase-output files until the phase
starts, or mark placeholders with explicit frontmatter and manifest state such
as `artifactState: scaffold`.

## Better Phasing

The current order should be replaced with an execution-oriented sequence:

1. `P0` — Repo census, routing canon, dependency graph, and amendment
   candidates.
2. `P1` — Program controls: manifest schema, compatibility ledger, amendment
   register, gate templates, and baseline validation queries.
3. `P2` — Enablement execution: workspace globs, path aliases, scaffolder,
   `docgen`, repo checks, and automation updates that prevent topology
   regression.
4. `P3` — Shared-kernel provisional contraction and driver/foundation
   extraction rules.
5. `P4` — `repo-memory` migration design plus batched implementation and
   validation.
6. `P5` — `editor` migration design plus batched implementation and validation.
7. `P6` — Operational package and agent/runtime-adapter cutovers, using the
   already-updated tooling model.
8. `P7` — Post-slice shared-kernel confirmation, exception closure, canonical
   subpath completion, compatibility deletion, and final repo verification.

If the packet must keep the existing phase names, the minimum safe rewrite is:

1. split current P1 into `contract` and `execution`
2. move the execution half before current P3
3. make current P2 provisional on `shared/use-cases`
4. add a control-plane artifact phase before any migration work closes

## Better Process

The initiative needs stronger operating rules:

1. Every phase must update a shared compatibility ledger and amendment register.
2. Every phase must attach machine-checkable evidence before the gate can pass.
3. Every package move must have a consumer list, a batch boundary, and a
   required green-bar command set.
4. Every phase prompt must include prereq checks, blocking rules, and required
   housekeeping updates.
5. The manifest must become a real state machine, not a scaffold pointer list.
6. Placeholder outputs must be clearly marked as scaffold-only.
7. Final verification must consume accumulated ledgers rather than reconstruct
   repo history from memory.

## Required Remediations

1. Redesign the initiative so phases close on executed repo changes plus
   validation evidence, not on decision packets alone.
2. Add a compatibility ledger and amendment register, then require every phase
   to maintain them.
3. Insert an enablement-execution phase before slice migration and move
   workspace/scaffolder/repo-check cutover ahead of `repo-memory`.
4. Add a dependency and importer census to P0 and make it an input to every
   later phase.
5. Replace narrative exit gates with explicit commands, searches, and evidence
   artifacts.
6. Defer the final `shared/use-cases` decision until slice evidence exists.
7. Upgrade the manifest and prompts to support blocking, validation, and
   parallel orchestration.

## Residual Risks

Even after the remediations above, the initiative will still carry two hard
risks:

1. actual package moves may expose repo-law conflicts that require a real
   architecture amendment rather than better planning
2. app-level and script-level consumers outside the obvious slice boundaries may
   widen the blast radius beyond what the current packet assumes

Those are acceptable risks only if the control plane can surface them early and
block phase closure when they are unresolved.

## Verdict

The initiative is not currently acceptable as an execution model for achieving
full compliance with `standards/ARCHITECTURE.md`.

It is a strong bootstrap packet, but it still behaves like a planning packet.
Without the remediations above, the program can produce polished artifacts while
leaving major migration and verification work implicit.

## Required Changes Checklist

- [ ] Convert phase closure from documentation-only to execution-plus-validation
- [ ] Add a compatibility ledger and amendment register
- [ ] Move tooling enablement execution ahead of slice migrations
- [ ] Add dependency and consumer graph requirements to P0 and downstream phases
- [ ] Replace narrative gates with measurable validation gates
- [ ] Defer final `shared/use-cases` closure until after slice evidence exists
- [ ] Upgrade manifest and prompts for blockers, evidence, and housekeeping
- [ ] Mark placeholder outputs as scaffold-only or remove them until phase start
