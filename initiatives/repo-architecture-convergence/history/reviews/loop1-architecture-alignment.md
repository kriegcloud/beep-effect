# Architecture Alignment Review - Loop 1

## Scope

This review compares the `repo-architecture-convergence` initiative packet
against the binding architecture constitution in
`standards/ARCHITECTURE.md` and the companion rationale packet the user named:

- `standards/architecture/README.md`
- `standards/architecture/00-philosophy.md`
- `standards/architecture/01-hexagonal-vertical-slices.md`
- `standards/architecture/02-shared-kernel.md`
- `standards/architecture/03-driver-boundaries.md`
- `standards/architecture/04-rich-domain-model.md`
- `standards/architecture/05-layer-composition.md`
- `standards/architecture/06-configuration-boundaries.md`
- `standards/architecture/07-non-slice-families.md`

The review also sanity-checks the initiative against current repo reality:
active workspaces still exist under `packages/common`, `packages/shared/*`,
`packages/runtime/*`, `packages/repo-memory/*`, `packages/editor/*`,
`tooling/*`, `.agents`, `.claude`, `.codex`, `apps/desktop`, and
`apps/editor-app`.

## Findings

### Critical

#### C1. The initiative is a planning packet, not a convergence program that can actually end in full compliance.

- Category: `issue`
- Evidence:
  - `SPEC.md:217-228` defines every phase output as a markdown artifact under
    `history/outputs/`.
  - `HANDOFF_P3.md:5-6,33-49` says the phase objective is to produce a
    "decision-complete migration packet" and closes when an implementer could
    migrate later.
  - `HANDOFF_P4.md:5-6,31-46` and `HANDOFF_P5.md:5-6,27-43` use the same
    packet-producing posture.
  - `verification-and-cutover.md:37-49` still frames P7 as producing a final
    verification contract, not performing the cutover.
- Why it matters:
  - The user asked for an initiative that gets the codebase to 100% compliance
    with `ARCHITECTURE.md` by the end.
  - The current packet can fully complete while leaving the repo unchanged,
    because its exit gates are documentation-complete rather than
    implementation-complete.
- Concrete remediation:
  - Recast each phase so the primary deliverable is repo state, not a memo.
  - Keep design docs, but pair them with implementation and verification gates:
    migrated packages, import rewrites, deleted aliases, and passing checks.
  - If design-first work is still desired, split each major area into
    `design -> implement -> verify` subphases rather than treating design
    artifacts as phase completion.

#### C2. The packet's definition of done is narrower than the architecture standard, so it can declare success while the repo still violates binding rules.

- Category: `misalignment`
- Evidence:
  - `ARCHITECTURE.md:441-530` defines non-slice dependency ceilings and file-role
    anchors.
  - `ARCHITECTURE.md:585-1045` defines canonical concept topology, domain-kind
    folders, role suffixes, responsibility boundaries, and client/UI/server/
    tables separation.
  - `SPEC.md:243-263` success criteria cover roots, metadata, agent placement,
    shared-kernel contraction, two slice package roles, subpaths, and alias
    deletion, but do not require internal topology, role-suffix compliance,
    domain-kind foldering, or package-boundary remediation across the repo.
- Why it matters:
  - A repo can satisfy the current success criteria and still violate core
    architecture law on file roles, dependency direction, layer placement,
    config purity, driver purity, or client/UI boundaries.
  - That means "initiative complete" is not equivalent to
    "`ARCHITECTURE.md` compliant."
- Concrete remediation:
  - Replace the current success criteria with a compliance matrix mapped
    section-by-section to `ARCHITECTURE.md`.
  - Require closure for:
    - package topology
    - boundary-sensitive exports
    - internal file-role topology
    - dependency-direction legality
    - shared-kernel legality
    - config purity
    - driver purity
    - slice-local layer composition
    - non-slice family/kind dependency ceilings

#### C3. The initiative repeatedly conflates package destinations with export subpaths, which is architecturally wrong and will misroute work.

- Category: `inconsistency`
- Evidence:
  - `ARCHITECTURE.md:227-247` makes `packages/<slice>/use-cases/` the canonical
    package.
  - `ARCHITECTURE.md:287-334` makes `/public`, `/server`, and `/test` explicit
    export contracts, not separate package kinds.
  - `current-state-routing-canon.md:107-112,125-126` routes workspaces to
    `repo-memory/use-cases/server`, `repo-memory/use-cases/public`, and
    `editor/use-cases/public`.
  - `repo-memory-migration.md:41-46` and `editor-migration.md:32-33` repeat the
    same subpath-as-destination framing.
- Why it matters:
  - This blurs two separate decisions:
    1. which canonical package owns the code
    2. which subpath exports that code
  - That confusion can create incorrect package splits, false package counts,
    and bad compatibility planning.
- Concrete remediation:
  - Rewrite every route table to use two explicit columns:
    - `Target package`
    - `Target boundary/export surface`
  - Example:
    - `packages/runtime/protocol -> packages/repo-memory/use-cases`
    - exported via `@beep/repo-memory-use-cases/public` and
      `@beep/repo-memory-use-cases/server`

### High

#### H1. The `repo-memory/sqlite` route under-specifies the mandatory `tables` boundary and biases persistence into `server`.

- Category: `misalignment`
- Evidence:
  - `ARCHITECTURE.md:1004-1014` makes `tables` the canonical home for
    product-specific persistence schema and mapping.
  - `repo-memory-migration.md:24-30` includes `tables/` in the target slice
    shape.
  - `repo-memory-migration.md:42` routes `repo-memory/sqlite` primarily to
    `server` plus extracted generic drivers.
  - `current-state-routing-canon.md:108` repeats that same primary route.
- Why it matters:
  - A `sqlite` workspace is exactly where write-model tables, read-model tables,
    and mapping helpers are likely to live.
  - If the packet defaults that package into `server`, the tables boundary can
    disappear in the most persistence-heavy slice in the repo.
- Concrete remediation:
  - Make the default route a required three-way audit:
    - `tables` for product-specific table and row mapping
    - `server` for repository/port implementations and projections
    - `drivers` only for reusable technical SQLite wrappers
  - Update P3 so `tables` is not optional when product persistence shape is
    present.

#### H2. The phase order contradicts the packet's own reasoning by delaying emitter/tooling cutover until after slice migration.

- Category: `better phase`
- Evidence:
  - `SPEC.md:188-190` says generators, scripts, path aliases, docgen configs,
    and package roots must be normalized before large moves can stay coherent.
  - `current-state-routing-canon.md:65-67` says `create-package`, `docgen`,
    `repo-checks`, workspace globs, and root aliases must migrate with tooling
    or the old root will keep reappearing.
  - `SPEC.md:224-227` places `repo-memory` and `editor` slice migration before
    P5 Operational Workspace Cutover.
- Why it matters:
  - The packet correctly identifies old emitters as a drift source, then leaves
    the operational surfaces that own those emitters until after the slice work.
  - That sequencing increases the chance of migrating slices while the repo's
    own tooling still points at the old architecture.
- Concrete remediation:
  - Split P5 into:
    - an early "workspace/emitter plumbing cutover" phase that lands before P3
    - a later "residual tooling relocation" phase if needed
  - At minimum, move `create-package`, workspace globs, path aliases, docgen,
    and repo-checks cutover ahead of the first slice implementation phase.

#### H3. App entrypoint and top-level Layer composition are treated as side effects, not first-class migration work.

- Category: `better process`
- Evidence:
  - `ARCHITECTURE.md:211-214` says live application Layer composition belongs in
    `server`, `client`, or top-level application entrypoint composition.
  - `ARCHITECTURE.md:1321-1356` explicitly warns against God Layers and places
    top-level composition at the app boundary.
  - `HANDOFF_P3.md:28-29` and `HANDOFF_P4.md:27-28` ask only for app impact to
    be specified for `apps/desktop` and `apps/editor-app`.
  - `current-state-routing-canon.md:112` mentions `packages/runtime/server` to
    `repo-memory/server` "plus app-entrypoint wiring" but does not make that a
    dedicated deliverable.
- Why it matters:
  - `apps/desktop` and `apps/editor-app` are where stale runtime composition can
    survive even after package names move.
  - Without an explicit entrypoint cutover gate, the repo can keep old global
    runtime assembly and still appear "mostly migrated."
- Concrete remediation:
  - Add an explicit app-entrypoint cutover phase or mandatory subphase covering:
    - `apps/desktop`
    - `apps/editor-app`
    - entrypoint Layer assembly
    - removal of legacy runtime wiring
    - verification that app composition imports slice-local Layers rather than
      reintroducing runtime registries

#### H4. The `editor/lexical` decision is over-collapsed to `ui` and does not require the client/UI split the standard demands.

- Category: `improvement`
- Evidence:
  - `ARCHITECTURE.md:1018-1045` separates `client` ownership from `ui`
    ownership: state, machines, command/query clients, and facades live in
    `client`; presentation composition lives in `ui`.
  - `editor-migration.md:35,39-45` defaults all of `editor/lexical` to `ui`
    unless it extracts outward to `foundation/ui-system` or `drivers`.
- Why it matters:
  - Lexical-heavy code often mixes:
    - editor state machines
    - command/query clients
    - browser adapters
    - presentation components
  - The current packet frames the choice as `ui` vs extraction, but the
    architecture also requires a possible `client` split.
- Concrete remediation:
  - Change the `editor/lexical` decision from a binary route to a three-way
    audit:
    - `editor/client` for state, machines, command/query adapters, facades
    - `editor/ui` for presentation and composition
    - `foundation/ui-system` or `drivers/*` only for truly generic extraction

### Medium

#### M1. The packet allows architecture-amendment candidates to appear, but it never defines how they are resolved.

- Category: `better process`
- Evidence:
  - `SPEC.md:221-228` allows phases to end with explicit amendment candidates.
  - `current-state-routing-canon.md:152-159` names unresolved questions around
    `shared/server`, `shared/tables`, `infra`, and `shared/use-cases`.
  - No phase, handoff, or artifact defines the amendment workflow itself.
- Why it matters:
  - Unresolved amendment candidates can linger indefinitely or get decided
    informally in implementation work.
  - That weakens the packet's own source-of-truth order and makes compliance
    claims ambiguous.
- Concrete remediation:
  - Add an explicit amendment gate:
    - trigger criteria
    - owner
    - required ADR artifact
    - deadline before dependent implementation can close
    - rollback/default path if no amendment is approved

#### M2. Final verification is too generic to prove compliance with the full constitution.

- Category: `misalignment`
- Evidence:
  - `ARCHITECTURE.md:177-220` defines import prohibitions and browser-safety
    rules.
  - `ARCHITECTURE.md:441-530` defines family/kind dependency ceilings and
    canonical non-slice anchors.
  - `ARCHITECTURE.md:712-883` defines domain-kind folders and role suffixes.
  - `verification-and-cutover.md:11-23` reduces verification to legacy roots,
    metadata, subpaths, dependency directions, and quality commands.
  - `HANDOFF_P7.md:17-25` mirrors that generic framing.
- Why it matters:
  - "Dependency checks" and "architecture-audit checks" are too vague to prove
    compliance against a document this specific.
  - The repo can pass a shallow audit and still violate canonical role anchors,
    non-slice family ceilings, or client/UI/server/config rules.
- Concrete remediation:
  - Define a rule-by-rule verification matrix with explicit checks for:
    - slice package presence/absence justification
    - use-case/config/driver/browser subpaths
    - allowed import ceilings by package kind
    - domain-kind folders and role suffixes
    - shared high-bar exception validation
    - app entrypoint composition
    - agent bundle declarative-only runtime adapters

### Low

#### L1. The packet has no built-in adversarial review loop, which is weak process for repo-wide architecture surgery.

- Category: `better process`
- Evidence:
  - The packet scaffolds `history/outputs/` but no review track.
  - The current `history/` tree contains outputs only; review artifacts were not
    part of the packet's canonical pattern.
  - Phase handoffs and prompts require writing/refining outputs, but not a
    mandatory red-team review before phase closure.
- Why it matters:
  - Repo-wide topology changes are exactly where unchallenged assumptions create
    durable scars.
  - The current packet does not force a critique/remediation loop before phases
    lock.
- Concrete remediation:
  - Add `history/reviews/` plus a required critique artifact and remediation log
    for each phase.
  - Require a phase to remain open until review findings are either fixed or
    explicitly waived by amendment.

## Better Direction

The right shape is not "one packet that documents the migration." The right
shape is "one packet that governs design, implementation, verification, and
review until the repo is actually compliant."

The packet should therefore:

1. define compliance against the full constitution, not just root/package
   renames
2. separate package ownership decisions from export-boundary decisions
3. move emitter/tooling cutover early enough to stop the repo from regenerating
   the legacy shape during slice work
4. treat app entrypoints and layer composition as first-class migration
   surfaces
5. require adversarial review and amendment resolution as part of phase closure

## Required Remediations

1. Replace documentation-only phase exit gates with implementation-complete and
   verification-complete exit gates.
2. Rewrite success criteria so they map directly to all binding sections of
   `ARCHITECTURE.md`, including internal topology and boundary rules.
3. Fix every route table that uses `/public` or `/server` as if it were a
   package destination.
4. Make `repo-memory/sqlite` a required `tables`/`server`/`drivers` split audit
   rather than a mostly-`server` route.
5. Pull tooling/emitter cutover earlier than slice execution, or split P5 so
   the drift-producing surfaces move first.
6. Add explicit implementation work for `apps/desktop` and `apps/editor-app`
   entrypoints and layer composition.
7. Change the `editor/lexical` decision into a `client`/`ui`/extract audit.
8. Add a formal architecture-amendment gate for unresolved routing decisions.
9. Expand P7 into a rule-by-rule compliance suite instead of a generic
   verification checklist.
10. Add mandatory review artifacts and remediation loops to each phase.

## Residual Risks

- Some current routing judgments may still change after actual package-content
  audits, especially `shared/server`, `shared/tables`, `editor/lexical`, and
  any package that mixes reusable substrate with product-aware code.
- If the repo wants to preserve any legacy alias beyond migration, that is not
  a packet tweak; it is an architecture amendment.
- The current packet is still useful as bootstrap material, but not as a
  sufficient end-to-end convergence plan.

## Verdict

The initiative is **not acceptable in its current form** as the canonical plan
for getting the repo to 100% compliance with `standards/ARCHITECTURE.md`.

It is a solid bootstrap packet for architecture migration design, but it is not
yet a complete architecture-convergence initiative because:

- it can complete without moving the repo
- its definition of done is narrower than the constitution
- several route decisions are expressed in architecture-invalid terms
- its sequencing and verification model leave major compliance surfaces implicit

## Required Changes Checklist

- [ ] Reframe phases around actual implementation and verification, not only artifacts
- [ ] Replace success criteria with a full `ARCHITECTURE.md` compliance matrix
- [ ] Separate canonical package routes from `/public`/`/server` export decisions
- [ ] Add explicit `tables` handling for `repo-memory/sqlite`
- [ ] Move emitter/tooling cutover earlier than slice execution
- [ ] Add explicit app-entrypoint/layer-composition cutover work
- [ ] Re-audit `editor/lexical` across `client`, `ui`, and extractable pieces
- [ ] Add an architecture-amendment decision gate
- [ ] Expand P7 into a rule-by-rule verification suite
- [ ] Add mandatory critique/remediation review loops per phase
