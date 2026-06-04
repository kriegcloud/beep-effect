# Ontology Modeling Foundation

## Status

Lifecycle: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Mission

Create a domain-safe modeling foundation for RDF and ontology authoring.
Promote the scratch ontology builder into `@beep/ontology` while extracting
pure RDF/linked-data primitives into `@beep/rdf`.

## Launch

Use this command for execution-capable sessions:

```text
/goal follow the instructions in goals/ontology-modeling-foundation/GOAL.md
```

`GOAL.md` is the compact launcher. `SPEC.md` remains the normative contract.

## Read This First

1. [`GOAL.md`](./GOAL.md) - compact `/goal` launcher.
2. [`SPEC.md`](./SPEC.md) - normative source of truth.
3. [`PLAN.md`](./PLAN.md) - active execution plan.
4. [`research/package-home.md`](./research/package-home.md) - package-home rationale.
5. [`ops/manifest.json`](./ops/manifest.json) - machine-readable routing.
6. [`history/`](./history/) - evidence and closeouts, if present.

## Current Phase

P0/P1 implementation bootstrap: create the packet, scaffold `@beep/rdf` and
`@beep/ontology`, then migrate the scratchpad POC into package-owned code.

## Latest Evidence

Not started.

## Notes

- `@beep/ontology` must be importable from domain packages, so it belongs in
  `foundation/modeling`, not `foundation/capability`.
- `@beep/semantic-web` remains the capability package for semantic-web
  services, adapters, and compatibility re-exports.
- Scratchpad remains as a thin package-consumer example after promotion.
