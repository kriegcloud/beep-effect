# P2 Orchestrator Prompt

## 1. Context
P1 contracts are frozen. Begin foundation implementation.

## 2. Mission
Implement and audit low-dependency foundation modules for compile-safe parity groundwork.

## 3. Inputs
1. P1 contract outputs
2. P2 module scope list from README
3. `handoffs/HANDOFF_P2.md`

## 4. Non-negotiable locks
1. Preserve established ontology annotation conventions.
2. No unsafe type escapes.
3. Keep module/file naming aligned with upstream parity goals.

## 5. Agent assignments
1. foundation implementation owner
2. foundation parity audit owner

## 6. Required outputs
1. `outputs/p2-foundation/implementation-log.md`
2. `outputs/p2-foundation/changed-files-manifest.md`

Locked module scope for this phase:

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

## 7. Required checks
1. Discovery commands
2. Package-level compile check for ontology package

## 8. Exit gate
P2 scope complete, compiles, no unresolved recursion blockers, P3 handoff/prompt authored.

## 9. Memory protocol
Apply proxy health and metrics checks; fallback string on failure is mandatory.

## 10. Handoff document pointer
`handoffs/HANDOFF_P2.md`
