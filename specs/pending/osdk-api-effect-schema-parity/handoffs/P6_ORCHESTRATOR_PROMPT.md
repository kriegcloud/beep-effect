# P6 Orchestrator Prompt

## 1. Context
Stable implementation is in place. Public surface and unstable namespace finalization begins.

## 2. Mission
Finalize stable exports, alias compatibility, unstable exports, and package entrypoints.

## 3. Inputs
1. P1 compatibility contract
2. P5 outputs
3. Upstream stable index + unstable barrel
4. `handoffs/HANDOFF_P6.md`

## 4. Non-negotiable locks
1. Stable parity must be complete before sign-off.
2. Unstable parity must be complete in this phase.
3. Existing `Ontology*` aliases must keep working.

## 5. Agent assignments
1. stable export parity owner
2. unstable namespace owner
3. alias compatibility owner

## 6. Required outputs
1. `outputs/p6-public-surface/export-parity-matrix.md`
2. `outputs/p6-public-surface/alias-compatibility-report.md`

Locked module scope for this phase:

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

## 7. Required checks
1. Discovery commands
2. Export presence checks against upstream lists
3. Package export config validation

## 8. Exit gate
Stable and unstable parity matrices complete; alias compatibility verified; P7 handoff/prompt authored.

## 9. Memory protocol
Apply proxy health and metrics checks; fallback string on failure is mandatory.

## 10. Handoff document pointer
`handoffs/HANDOFF_P6.md`
