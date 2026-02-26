# P2 Foundation Changed Files Manifest

## Legend

- `added`: New file created for locked P2 scope.
- `modified`: Existing P2 file updated for schema/type/API parity.
- `deleted`: File removed due canonical path/casing convergence.

## File list

| Status | File | Reason |
|---|---|---|
| added | `packages/common/ontology/src/Logger.ts` | Implemented canonical Logger surface for parity with upstream `./Logger`. |
| deleted | `packages/common/ontology/src/logger.ts` | Removed non-canonical casing alias that caused TS casing collision with `Logger.ts`. |
| modified | `packages/common/ontology/src/object/Attachment.ts` | Replaced stub with attachment interface + runtime schemas (`AttachmentUpload`, `AttachmentMetadata`). |
| modified | `packages/common/ontology/src/object/Media.ts` | Aligned media payload types with upstream fields (including `readToken`), optional-key semantics, and schema fidelity. |
| modified | `packages/common/ontology/src/object/PropertySecurity.ts` | Removed branded drift from `MarkingId` and aligned optional property semantics via `S.optionalKey`. |
| modified | `packages/common/ontology/src/object/Result.ts` | Reworked to upstream-compatible `Result<V>`, `isOk`, `isError` with schema constructors. |
| modified | `packages/common/ontology/src/PageResult.ts` | Reworked to upstream-compatible page-result model + schema constructor with optional token semantics. |
| modified | `packages/common/ontology/src/ontology/OntologyMetadata.ts` | Corrected metadata shape to ontology contract fields and retained runtime schema boundary. |
| modified | `packages/common/ontology/src/ontology/PrimaryKeyTypes.ts` | Introduced canonical plural surface with compatibility alias (`PrimaryKeyType`). |
| modified | `packages/common/ontology/src/ontology/WirePropertyTypes.ts` | Added canonical `BaseWirePropertyTypes` + `WirePropertyTypes` surfaces with compatibility alias (`WirePropertyType`). |
| modified | `packages/common/ontology/src/ontology/VersionString.ts` | Fixed version-string type fidelity and runtime validation path. |
| modified | `packages/common/ontology/src/ontology/valueFormatting/PropertyBooleanFormattingRule.ts` | Normalized boolean-rule discriminator to literal schema for stable union interoperability. |
| modified | `packages/common/ontology/src/ontology/valueFormatting/PropertyDateAndTimestampFormattingRule.ts` | Stabilized date/timestamp format unions and discriminator schemas for runtime-safe imports. |
| modified | `packages/common/ontology/src/ontology/valueFormatting/PropertyKnownTypeFormattingRule.ts` | Corrected misspelled exported symbol and implemented canonical known-type formatting schema. |
| modified | `packages/common/ontology/src/ontology/valueFormatting/PropertyValueFormattingUtils.ts` | Corrected field parity (`propertyApiName`) for property references. |
| modified | `packages/common/ontology/src/ontology/valueFormatting/PropertyNumberFormattingRule.ts` | Normalized optional-field schema semantics to `S.optionalKey(...)` for fidelity. |
| modified | `packages/common/ontology/src/ontology/valueFormatting/PropertyValueFormattingRule.ts` | Updated union member naming/imports to canonical known-type rule and added exported type alias. |
| added | `packages/common/ontology/src/mapping/DurationMapping.ts` | Implemented duration shorthand-to-canonical mapping contract. |
| modified | `packages/common/ontology/src/mapping/DataValueMapping.ts` | Replaced stub with full wire/client mapping interfaces and bucket/geospatial support types. |
| added | `packages/common/ontology/src/timeseries/timeseries.ts` | Implemented timeseries query types, duration mapping, and property accessor contracts. |
| added | `packages/common/ontology/src/OsdkMetadata.ts` | Added OSDK metadata surface and runtime schema. |
| added | `packages/common/ontology/src/OsdkObjectPrimaryKeyType.ts` | Added primary-key bridge type based on data-value mapping + primary-key type set. |
| added | `packages/common/ontology/src/util/IncludeValuesExtending.ts` | Added filtered mapped-type utility used by parity type contracts. |
| added | `packages/common/ontology/test/runtime/p2-foundation.test.ts` | Added runtime tests so ontology package test lane executes and validates touched foundation behaviors. |

## Check evidence for this manifest

- `bun run --cwd packages/common/ontology check` ✅
- `bun run --cwd packages/common/ontology test` ✅
- `bun run test:types` ✅
