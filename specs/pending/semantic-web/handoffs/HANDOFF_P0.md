# P0 Handoff - Package Topology and Boundaries

## Objective

Finalize the package topology, the long-term boundary with `@beep/schema`, the seed-asset posture for `IRI` and `ProvO`, and the classification of local upstream semantic-web libraries.

## Inputs

- [README.md](../README.md)
- [design/module-topology-and-boundaries.md](../design/module-topology-and-boundaries.md)
- [design/foundation-decisions.md](../design/foundation-decisions.md)
- [research/2026-03-08-initial-exploration.md](../research/2026-03-08-initial-exploration.md)
- [research/2026-03-08-effect-v4-module-selection.md](../research/2026-03-08-effect-v4-module-selection.md)
- [manifest.json](../outputs/manifest.json)

## Required Work

1. Confirm the required public module families for v1.
2. Make the long-term ownership boundary with `@beep/schema` explicit.
3. Record the migration posture for the existing `IRI` and `ProvO` seed assets.
4. Classify each required upstream semantic-web reference as:
   - adapter target
   - implementation reference
   - research-only reference
5. Record any remaining uncertainty as explicit open questions with recommended defaults.

## Deliverable

Write: `outputs/p0-package-topology-and-boundaries.md`

## Completion Checklist

- [ ] `@beep/schema` boundary is explicit
- [ ] required module families are explicit
- [ ] `IRI` and `ProvO` seed-asset posture is explicit
- [ ] upstream reference classification table is complete
- [ ] unresolved items are bounded and explicit

## Exit Gate

P0 is complete when later phases no longer need to reopen package ownership, public module families, or upstream classification.
