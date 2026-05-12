# Canonical Slice Factory Plan

This plan executes [SPEC.md](./SPEC.md). It starts by replacing the drifted
proof target, then systemizes the creation path through `@beep/repo-cli`.

## A. Audit Current Drift

- Read the architecture standards, this initiative packet, and the old
  `repo-architecture-automation` packet.
- Inventory all active references to `fixture-lab/Specimen`,
  `@beep/fixture-lab-specimen-*`, and `$FixtureLabSpecimenId`.
- Classify references as old proof implementation, generated inventory, docs
  guidance, identity/config wiring, or unrelated historical evidence.

## B. Replace The Proof Target

- Create the staged `architecture-lab/WorkItem` proof as synthetic workspaces.
- Start with the smallest legal slice and add optional package roles only when
  a stage needs meaningful behavior.
- Add a dedicated synthetic app harness for app-local Layer composition.
- Remove or rewrite active canonical references to `fixture-lab/Specimen`.

## C. Build The Factory Core

- Add the `beep architecture` command group in `@beep/repo-cli`.
- Model architecture creation as decoded operation plans.
- Implement writer selection over the shared plan model.
- Route ergonomic wrappers through that planner.
- Keep `create-package` compatible while moving future package-creation rules
  toward the same planner.

## D. Prove Granular Creation

- Support whole-slice creation.
- Support adding a domain concept or domain-kind folder.
- Support adding canonical role modules through the shared planner.
- Leave tables, protocol modules, foundation packages, and drivers as explicit
  extension points unless the staged proof requires their first implementation.

## E. Update Guidance

- Update root agent guidance and repo-cli docs so agents discover and prefer
  the architecture commands.
- Update architecture docs only where canonical proof references or generated
  defaults changed.
- Keep old automation notes only as historical reference until deleted.

## Required Checks

Run targeted checks first:

- repo-cli tests for operation planning and idempotency;
- proof package tests and type tests;
- search audits for stale canonical `fixture-lab/Specimen` references.

Then attempt the coherent repo gates:

- `bun run check`
- `bun run lint`
- `bun run test`
- `bun run docgen`
- repo full audit command

Record exact unrelated blockers instead of hiding them.
