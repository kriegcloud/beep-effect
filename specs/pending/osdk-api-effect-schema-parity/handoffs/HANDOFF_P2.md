# Handoff P2

## Objective
Implement and audit foundation modules with compile-safe behavior and parity-oriented correctness.

## Inputs
1. P1 contracts
2. `packages/common/ontology/src` foundation files
3. Upstream source equivalents

## Required Work
Implement/audit this exact P2 scope and produce change evidence:

```text
src/Logger.ts
src/object/Attachment.ts
src/object/Media.ts
src/object/PropertySecurity.ts
src/object/Result.ts
src/PageResult.ts
src/ontology/OntologyMetadata.ts
src/ontology/PrimaryKeyTypes.ts
src/ontology/WirePropertyTypes.ts
src/ontology/VersionString.ts
src/ontology/valueFormatting/PropertyBooleanFormattingRule.ts
src/ontology/valueFormatting/PropertyKnownTypeFormattingRule.ts
src/ontology/valueFormatting/PropertyValueFormattingUtils.ts
src/ontology/valueFormatting/PropertyDateAndTimestampFormattingRule.ts
src/ontology/valueFormatting/PropertyNumberFormattingRule.ts
src/ontology/valueFormatting/PropertyValueFormattingRule.ts
src/mapping/DurationMapping.ts
src/mapping/DataValueMapping.ts
src/timeseries/timeseries.ts
src/OsdkMetadata.ts
src/OsdkObjectPrimaryKeyType.ts
src/util/IncludeValuesExtending.ts
```

## Deliverables
- `outputs/p2-foundation/implementation-log.md`
- `outputs/p2-foundation/changed-files-manifest.md`

## Completion Checklist
- [ ] P2 module scope complete.
- [ ] Foundation compiles.
- [ ] No unresolved recursion blocker remains.
- [ ] P3 handoff + prompt authored.

## Memory Protocol
Proxy-only routing and fallback text are mandatory.

## Exit Gate
P2 closes when foundation is compile-ready for ontology core work.
