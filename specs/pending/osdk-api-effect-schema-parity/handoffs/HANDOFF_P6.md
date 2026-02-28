# Handoff P6

## Objective
Finalize stable export surface, alias compatibility, unstable namespace, and package export configuration.

## Inputs
1. P1 compatibility contract
2. P5 implementation outputs
3. Upstream stable index + unstable barrel

## Required Work
1. Align `src/index.ts` to stable parity contract.
2. Add/align `src/public/unstable.ts` and experimental modules.
3. Preserve legacy alias compatibility files.
4. Update `packages/common/ontology/package.json` exports for unstable path.

Locked P6 scope:

```text
src/index.ts
src/public/unstable.ts
src/experimental/Experiment.ts
src/experimental/createMediaReference.ts
src/experimental/fetchOneByRid.ts
src/experimental/fetchPageByRid.ts
src/experimental/getBulkLinks.ts
src/OntologyBase.ts
src/OntologyObject.ts
src/OntologyObjectFrom.ts
src/OntologyObjectPrimaryKey.ts
src/definitions/LinkDefinition.ts
packages/common/ontology/package.json
```

## Deliverables
- `outputs/p6-public-surface/export-parity-matrix.md`
- `outputs/p6-public-surface/alias-compatibility-report.md`

## Completion Checklist
- [ ] Stable export parity complete.
- [ ] Unstable export parity complete.
- [ ] Alias compatibility verified.
- [ ] P7 handoff + prompt authored.

## Memory Protocol
Proxy-only routing and fallback text are mandatory.

## Exit Gate
P6 closes when verification can run against finalized public surface.
