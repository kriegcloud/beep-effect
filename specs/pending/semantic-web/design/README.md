# Design Notes

These documents are normative for the pending `@beep/semantic-web` spec package.

## Current Design Set

- [module-topology-and-boundaries.md](./module-topology-and-boundaries.md) - initial public module map, `@beep/schema` boundary, seed-asset migration posture, and upstream library classification
- [provenance-and-evidence.md](./provenance-and-evidence.md) - minimal PROV profile, evidence anchoring model, lifecycle time rules, and bounded projection strategy
- [semantic-schema-metadata.md](./semantic-schema-metadata.md) - typed annotation pattern for important public semantic-web schema families
- [foundation-decisions.md](./foundation-decisions.md) - preserved locked defaults from the exploratory pass

## Document Roles

- `foundation-decisions.md` captures defaults that should remain stable unless stronger local evidence forces a change.
- `module-topology-and-boundaries.md` turns those defaults into a concrete package map.
- `provenance-and-evidence.md` narrows the provenance surface so implementation work does not drift into maximalism.
- `semantic-schema-metadata.md` defines where rich schema metadata is required, optional, or intentionally avoided.
