# P0 Handoff - Package Topology and Boundaries

## Objective

Finalize the package topology, the long-term boundary with `@beep/schema`, the seed-asset posture for `IRI` and `ProvO`, and the classification of local upstream semantic-web libraries.

## Mode Handling

If you are operating in Plan Mode, do not edit spec artifacts yet. First read the required inputs, confirm which defaults are already locked, resolve remaining ambiguities through non-mutating exploration and targeted user questions, and produce a decision-complete phase plan. Only in a non-Plan execution session should you write or refine the phase output artifact.

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
5. Carry forward only residual uncertainty that is not already locked. Do not reopen the settled defaults around internal `idna/`, curated root exports, or conditional-only `@beep/schema` compatibility shims.

## Deliverable

Write: `outputs/p0-package-topology-and-boundaries.md`

## Completion Checklist

- [ ] `@beep/schema` boundary is explicit
- [ ] required module families are explicit
- [ ] `IRI` and `ProvO` seed-asset posture is explicit
- [ ] upstream reference classification table is complete
- [ ] locked defaults remain closed and any residual uncertainty is bounded and explicit

## Exit Gate

P0 is complete when later phases no longer need to reopen package ownership, public module families, or upstream classification.
