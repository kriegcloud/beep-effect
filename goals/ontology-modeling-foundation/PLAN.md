# Ontology Modeling Foundation Plan

This plan executes [SPEC.md](./SPEC.md). It creates a domain-safe RDF modeling
package, promotes the scratch ontology builder into a modeling package, and
keeps semantic-web compatibility import paths intact.

## Status

Status: `active`

## P0: Packet Bootstrap

Status: in progress

Goal: Record the package-home decisions, dependency constraints, V1 cutline,
and verification lanes.

Exit Criteria:

- [ ] `README.md`, `SPEC.md`, `PLAN.md`, `GOAL.md`,
  `research/package-home.md`, and `ops/manifest.json` exist.
- [ ] The packet targets `@beep/rdf` and `@beep/ontology` as
  `foundation/modeling` packages.
- [ ] The packet rejects folding ontology authoring into `@beep/semantic-web`.
- [ ] Scratchpad `tsgo`, `tsc`, and Vitest checks are named.

Required Checks:

```sh
test "$(wc -m < goals/ontology-modeling-foundation/GOAL.md)" -le 4000
jq . goals/ontology-modeling-foundation/ops/manifest.json
rg -n "ontology-modeling-foundation|GOAL.md|agentLaunchers|packetAnchorDocument" goals/ontology-modeling-foundation
git diff --check -- goals/ontology-modeling-foundation
```

## P1: Scaffold Modeling Packages

Status: pending

Goal: Create package shells through repo tooling.

Implementation Steps:

1. Preserve unrelated dirty worktree changes.
2. Run scaffold dry-runs:
   - `bun run create-package rdf --family foundation --kind modeling --description "RDF modeling package" --dry-run`
   - `bun run create-package ontology --family foundation --kind modeling --description "Ontology modeling package" --dry-run`
3. Run the actual scaffold commands.
4. Let the scaffold update workspace, identity registration, lockfile, aliases,
   tstyche, tsconfig references, syncpack, and docgen surfaces.
5. Confirm `$RdfId` and `$OntologyId` are available from
   `@beep/identity/packages`.

Exit Criteria:

- [ ] `packages/foundation/modeling/rdf` exists and publishes `@beep/rdf`.
- [ ] `packages/foundation/modeling/ontology` exists and publishes
  `@beep/ontology`.
- [ ] Both package manifests declare `beep.family = "foundation"` and
  `beep.kind = "modeling"`.

## P2: RDF Modeling Extraction

Status: pending

Goal: Move pure semantic primitives into `@beep/rdf` and keep
`@beep/semantic-web` compatibility paths.

Implementation Steps:

1. Move or recreate pure value modules under PascalCase concept subpaths:
   - `Iri`
   - `Uri`
   - `Rdf`
   - `JsonLd`
   - `Vocab/Rdf`
   - `Vocab/Rdfs`
   - `Vocab/Owl`
   - `Vocab/Xsd`
   - `Vocab/Oa`
   - `Vocab/Prov`
2. Keep PROV, evidence, services, and adapters in `@beep/semantic-web`.
3. Re-export extracted modules from existing `@beep/semantic-web` pure-value
   subpaths.
4. Update semantic-web tests only as needed to keep existing behavior green.

Exit Criteria:

- [ ] New code can import pure values from `@beep/rdf`.
- [ ] Existing semantic-web pure import paths still compile.
- [ ] `@beep/rdf` has no capability, driver, tooling, app, or product-slice
  dependencies.

## P3: Ontology Package Promotion

Status: pending

Goal: Move reusable ontology-builder code from scratchpad into `@beep/ontology`.

Implementation Steps:

1. Promote annotation, reference, assembly, metadata, and projection modules.
2. Replace `$ScratchpadId` with `$OntologyId`.
3. Replace semantic-web imports with `@beep/rdf`.
4. Preserve the ergonomic root API:
   `import { Ontology } from "@beep/ontology"`.
5. Keep explicit public subpaths for model/reference/projection concepts.
6. Add package tests for annotation storage, assembly, relationships,
   JSON-LD/Turtle projection, round trip, and missing schema target failures.
7. Add dtslint coverage for root and subpath imports.

Exit Criteria:

- [ ] `@beep/ontology` owns reusable builder implementation.
- [ ] The package root exposes `Ontology`.
- [ ] Tests prove the current scratch POC behavior.
- [ ] `@beep/ontology` depends only on allowed modeling/primitive packages and
  `effect`.

## P4: Scratchpad Consumer Example

Status: pending

Goal: Turn scratchpad into a thin package-consumer proof.

Implementation Steps:

1. Replace local ontology-builder implementation imports with
   `@beep/ontology`.
2. Replace RDF/IRI/vocab imports with `@beep/rdf`.
3. Keep the example ontology, FOLIO-inspired relationship example, smoke
   values, and scratch tests.
4. Remove scratch-local reusable builder modules when package tests cover them.

Exit Criteria:

- [ ] Scratchpad imports packages rather than owning the builder.
- [ ] Scratchpad remains useful as an example and smoke surface.
- [ ] Scratch `tsgo`, `tsc`, and Vitest checks pass.

## P5: Quality And Handoff

Status: pending

Goal: Prove the package promotion and record any unrelated failures clearly.

Required Checks:

```sh
bun run --filter=@beep/rdf check test lint
bun run --filter=@beep/ontology check test lint
bunx tsgo -p scratchpad/tsconfig.json
bunx tsc -p scratchpad/tsconfig.json --noEmit --pretty false
bunx vitest run --config scratchpad/vitest.config.ts
bun run docgen:local
bun run repo-exports:catalog:check
git diff --check -- goals/ontology-modeling-foundation packages/foundation/modeling/rdf packages/foundation/modeling/ontology scratchpad
```

Exit Criteria:

- [ ] Required checks are green, or unrelated failures are reproduced and
  recorded separately.
- [ ] Packet status and evidence are updated if implementation readiness
  changes.
- [ ] No unrelated refactors or formatting churn.

Stop Conditions:

- Do not add product semantics to foundation packages.
- Do not import `@beep/semantic-web` from `@beep/ontology`.
- Do not remove semantic-web compatibility re-exports in this initiative.
