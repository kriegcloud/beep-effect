# JSDoc Documentation Compliance Inventory

Generated: 2026-05-01T16:51:55.953Z

## Scope

The package universe is the current `bun run topo-sort` output. This inventory checks repo JSDoc rules that package docgen does not fully validate yet: required export tags, summaries, TSDoc grammar, forbidden legacy tags, example import aliases, unsafe examples, root TSDoc custom tag registration, and schema annotation/type-alias gaps.

## Totals

| Metric | Count |
|---|---:|
| packages | 48 |
| cleanPackages | 22 |
| packagesWithoutPublicSrcSurface | 1 |
| packagesNeedingRemediation | 25 |
| publicModules | 760 |
| publicExports | 4846 |
| openModules | 128 |
| openExports | 2821 |
| missingExportExamples | 2180 |
| missingExportCategories | 735 |
| missingExportSince | 437 |
| forbiddenTagFindings | 9 |
| malformedConditionalTagFindings | 0 |
| exampleImportFindings | 22 |
| unsafeExampleFindings | 98 |
| schemaAnnotationFindings | 126 |
| rootPolicyOpen | 0 |

## Root Policy

| File | Tag | Status | Missing |
|---|---|---|---|
| tsdoc.json | `@effects` | resolved | none |
| tsdoc.json | `@precondition` | resolved | none |
| tsdoc.json | `@postcondition` | resolved | none |
| tsdoc.json | `@invariant` | resolved | none |

## Package Summary

| Order | Package | Path | Status | Modules | Exports | Open Modules | Open Exports |
|---:|---|---|---|---:|---:|---:|---:|
| 1 | `@beep/types` | `packages/foundation/primitive/types` | needs-remediation | 5 | 10 | 0 | 3 |
| 2 | `@beep/identity` | `packages/foundation/modeling/identity` | needs-remediation | 3 | 71 | 0 | 11 |
| 3 | `@beep/utils` | `packages/foundation/modeling/utils` | needs-remediation | 20 | 129 | 2 | 35 |
| 4 | `@beep/data` | `packages/foundation/primitive/data` | clean | 7 | 39 | 0 | 0 |
| 5 | `@beep/messages` | `packages/foundation/modeling/messages` | needs-remediation | 2 | 6 | 0 | 1 |
| 6 | `@beep/schema` | `packages/foundation/modeling/schema` | needs-remediation | 131 | 1267 | 7 | 1171 |
| 7 | `@beep/shared-domain` | `packages/shared/domain` | needs-remediation | 31 | 186 | 0 | 10 |
| 8 | `@beep/chalk` | `packages/foundation/capability/chalk` | clean | 1 | 35 | 0 | 0 |
| 9 | `@beep/repo-utils` | `packages/tooling/library/repo-utils` | needs-remediation | 58 | 613 | 4 | 191 |
| 10 | `@beep/colors` | `packages/foundation/capability/colors` | clean | 1 | 9 | 0 | 0 |
| 11 | `@beep/fixture-lab-specimen-domain` | `packages/fixture-lab/specimen/domain` | needs-remediation | 6 | 10 | 0 | 2 |
| 12 | `@beep/test-utils` | `packages/tooling/test-kit/test-utils` | needs-remediation | 2 | 21 | 0 | 7 |
| 13 | `@beep/repo-docgen` | `packages/tooling/tool/docgen` | needs-remediation | 8 | 66 | 0 | 21 |
| 14 | `@beep/ffmpeg` | `packages/drivers/ffmpeg` | needs-remediation | 4 | 38 | 0 | 6 |
| 15 | `@beep/observability` | `packages/foundation/capability/observability` | needs-remediation | 23 | 131 | 3 | 33 |
| 16 | `@beep/repo-configs` | `packages/tooling/policy-pack/repo-configs` | clean | 6 | 18 | 0 | 0 |
| 17 | `@beep/fixture-lab-specimen-config` | `packages/fixture-lab/specimen/config` | needs-remediation | 7 | 16 | 0 | 2 |
| 18 | `@beep/fixture-lab-specimen-use-cases` | `packages/fixture-lab/specimen/use-cases` | needs-remediation | 10 | 24 | 0 | 4 |
| 19 | `@beep/drizzle` | `packages/drivers/drizzle` | needs-remediation | 4 | 15 | 0 | 8 |
| 20 | `@beep/tenancy-domain` | `packages/tenancy/domain` | clean | 14 | 30 | 0 | 0 |
| 21 | `@beep/law-practice-domain` | `packages/law-practice/domain` | clean | 14 | 25 | 0 | 0 |
| 22 | `@beep/agent-capability-use-cases` | `packages/agent-capability/use-cases` | needs-remediation | 13 | 47 | 0 | 11 |
| 23 | `@beep/agent-capability-domain` | `packages/agent-capability/domain` | clean | 7 | 12 | 0 | 0 |
| 24 | `@beep/workspace-domain` | `packages/workspace/domain` | clean | 21 | 40 | 0 | 0 |
| 25 | `@beep/epistemic-domain` | `packages/epistemic/domain` | clean | 13 | 22 | 0 | 0 |
| 26 | `@beep/wealth-management-domain` | `packages/wealth-management/domain` | clean | 14 | 25 | 0 | 0 |
| 27 | `@beep/ui` | `packages/foundation/ui-system/ui` | needs-remediation | 118 | 506 | 109 | 506 |
| 28 | `@beep/root` | `.` | no-public-src-surface | 0 | 0 | 0 | 0 |
| 29 | `@beep/fixture-lab-specimen-tables` | `packages/fixture-lab/specimen/tables` | clean | 6 | 12 | 0 | 0 |
| 30 | `@beep/db-admin` | `packages/_internal/db-admin` | clean | 1 | 1 | 0 | 0 |
| 31 | `@beep/repo-cli` | `packages/tooling/tool/cli` | needs-remediation | 63 | 443 | 0 | 359 |
| 32 | `@beep/shared-server` | `packages/shared/server` | clean | 1 | 1 | 0 | 0 |
| 33 | `@beep/shared-config` | `packages/shared/config` | clean | 1 | 1 | 0 | 0 |
| 34 | `@beep/sandbox` | `packages/foundation/capability/sandbox` | needs-remediation | 23 | 219 | 3 | 204 |
| 35 | `@beep/shared-use-cases` | `packages/shared/use-cases` | clean | 1 | 1 | 0 | 0 |
| 36 | `@beep/fixture-lab-specimen-server` | `packages/fixture-lab/specimen/server` | clean | 5 | 9 | 0 | 0 |
| 37 | `@beep/shared-tables` | `packages/shared/tables` | needs-remediation | 6 | 6 | 0 | 5 |
| 38 | `@beep/md` | `packages/foundation/capability/md` | clean | 5 | 131 | 0 | 0 |
| 39 | `@beep/semantic-web` | `packages/foundation/capability/semantic-web` | needs-remediation | 29 | 256 | 0 | 9 |
| 40 | `@beep/fixture-lab-specimen-ui` | `packages/fixture-lab/specimen/ui` | clean | 3 | 4 | 0 | 0 |
| 41 | `@beep/professional-runtime-proof` | `apps/professional-runtime-proof` | clean | 1 | 4 | 0 | 0 |
| 42 | `@beep/nlp` | `packages/foundation/capability/nlp` | needs-remediation | 49 | 278 | 0 | 203 |
| 43 | `@beep/infra` | `infra` | clean | 1 | 1 | 0 | 0 |
| 44 | `@beep/codedank-web` | `apps/codedank-web` | needs-remediation | 5 | 6 | 0 | 5 |
| 45 | `@beep/fixture-lab-specimen-client` | `packages/fixture-lab/specimen/client` | needs-remediation | 5 | 19 | 0 | 9 |
| 46 | `@beep/shared-client` | `packages/shared/client` | clean | 1 | 1 | 0 | 0 |
| 47 | `@beep/postgres` | `packages/drivers/postgres` | needs-remediation | 7 | 35 | 0 | 5 |
| 48 | `@beep/shared-ui` | `packages/shared/ui` | clean | 4 | 7 | 0 | 0 |

## Open Findings

### @beep/types

Path: `packages/foundation/primitive/types`

Export findings:
- `src/TArray.types.ts:29` `Elem` (type) - forbidden @template; 1 unsafe example violation(s)
- `src/TString.types.ts:31` `NonEmpty` (type) - 1 unsafe example violation(s)
- `src/TString.types.ts:53` `Chars` (type) - 1 unsafe example violation(s)

### @beep/identity

Path: `packages/foundation/modeling/identity`

Export findings:
- `src/Id.ts:88` `IdentityInterpolationError` (class) - 1 schema annotation/type-alias gap(s)
- `src/Id.ts:119` `IdentitySegmentCountError` (class) - 1 schema annotation/type-alias gap(s)
- `src/Id.ts:350` `IdentityString` (type) - 1 unsafe example violation(s)
- `src/Id.ts:367` `IdentitySymbol` (type) - 1 unsafe example violation(s)
- `src/packages.ts:628` `RepoPkgs` (const) - missing @example
- `src/packages.ts:634` `$MdId` (const) - missing summary; missing @example
- `src/packages.ts:640` `$CodedankWebId` (const) - missing summary; missing @example
- `src/packages.ts:646` `$DrizzleId` (const) - missing summary; missing @example
- `src/packages.ts:652` `$FfmpegId` (const) - missing summary; missing @example
- `src/packages.ts:658` `$PostgresId` (const) - missing summary; missing @example
- `src/packages.ts:805` `$SandboxId` (const) - missing summary; missing @example

### @beep/utils

Path: `packages/foundation/modeling/utils`

Module findings:
- `src/Predicate.ts:1` (packageDocumentation) - missing summary
- `src/Str.ts:1` (packageDocumentation) - missing summary

Export findings:
- `src/Array.ts:258` `export * from "effect/Array";` (re-export) - missing @example
- `src/Array.ts:61` `assertNonEmptyArray` (const) - 1 unsafe example violation(s)
- `src/Array.ts:81` `assertNonEmptyReadonlyArray` (const) - 1 unsafe example violation(s)
- `src/Array.ts:303` `fromIterableNonEmpty` (const) - 1 unsafe example violation(s)
- `src/DateTime.ts:35` `export * from "effect/DateTime";` (re-export) - missing @example
- `src/Event.ts:17` `export * from "effect/unstable/encoding/Sse";` (re-export) - missing @example, @category
- `src/Event.ts:71` `makeEvent` (const) - missing @example
- `src/Function.ts:16` `export * from "effect/Function";` (re-export) - missing @example
- `src/Glob.ts:34` `Pattern` (const) - 1 schema annotation/type-alias gap(s)
- `src/Number.ts:63` `export * from "effect/Number";` (re-export) - missing @example
- `src/Option.ts:73` `export * from "effect/Option";` (re-export) - missing @example
- `src/Option.ts:48` `propFromNullishOr` (const) - 1 unsafe example violation(s)
- `src/Predicate.ts:16` `export * from "effect/Predicate";` (re-export) - missing @example
- `src/Predicate.ts:43` `hasProperties` (const) - 1 unsafe example violation(s)
- `src/Str.ts:597` `export * from "effect/String";` (re-export) - missing @example
- `src/Str.ts:180` `mapPrefix` (const) - 1 example import violation(s)
- `src/Str.ts:226` `mapPostfix` (const) - 1 example import violation(s)
- `src/Str.ts:635` `fromNumber` (const) - forbidden @template
- `src/Struct.ts:623` `export * from "effect/Struct";` (re-export) - missing @example
- `src/Struct.ts:568` `keysNonEmpty` (const) - 1 unsafe example violation(s)
- `src/index.ts:14` `export * as A from "./Array.ts";` (re-export) - missing @example
- `src/index.ts:22` `export * as Bool from "./Bool.ts";` (re-export) - missing @example
- `src/index.ts:30` `export * as DateTime from "./DateTime.ts";` (re-export) - missing @example
- `src/index.ts:38` `export * as FileSystem from "./FileSystem.ts";` (re-export) - missing @example
- `src/index.ts:46` `export * as Html from "./Html.ts";` (re-export) - missing @example
- `src/index.ts:54` `export * from "./isBlockedObjectKey.ts";` (re-export) - missing @example
- `src/index.ts:61` `export * as Num from "./Number.ts";` (re-export) - missing @example
- `src/index.ts:68` `export * as O from "./Option.ts";` (re-export) - missing @example
- `src/index.ts:75` `export * as P from "./Predicate.ts";` (re-export) - missing @example
- `src/index.ts:82` `export * from "./Random.ts";` (re-export) - missing @example
- `src/index.ts:89` `export * as Str from "./Str.ts";` (re-export) - missing @example
- `src/index.ts:96` `export * as Stream from "./Stream.ts";` (re-export) - missing @example
- `src/index.ts:103` `export * as Struct from "./Struct.ts";` (re-export) - missing @example
- `src/index.ts:110` `export * as Text from "./Text.ts";` (re-export) - missing @example
- `src/index.ts:117` `export * from "./thunk.ts";` (re-export) - missing @example

### @beep/messages

Path: `packages/foundation/modeling/messages`

Export findings:
- `src/i18n.ts:195` `logIssues` (const) - missing @example

### @beep/schema

Path: `packages/foundation/modeling/schema`

Module findings:
- `src/Sql/Constants.ts:1` (jsdoc) - missing summary; 1 category casing violation(s)
- `src/Sql/index.ts:1` (jsdoc) - missing summary; 1 category casing violation(s)
- `src/VariantSchema.ts:1` (jsdoc) - missing summary
- `src/http/headers/_internal/index.ts:1` (jsdoc) - missing summary
- `src/location/CardinalDirection.ts:1` (packageDocumentation) - missing summary
- `src/person/Age.ts:1` (packageDocumentation) - missing summary
- `src/person/Sex.ts:1` (packageDocumentation) - missing summary

Export findings:
- `src/AbortSignal.ts:28` `isAbortSignal` (const) - resolved
- `src/AbortSignal.ts:46` `AbortSig` (const) - resolved
- `src/AbortSignal.ts:65` `AbortSig` (type) - resolved
- `src/ArrayOf.ts:28` `ArrayOfStrings` (const) - resolved
- `src/ArrayOf.ts:40` `ArrayOfStrings` (type) - missing @example
- `src/ArrayOf.ts:57` `NonEmptyArrayOfStrings` (const) - resolved
- `src/ArrayOf.ts:69` `NonEmptyArrayOfStrings` (type) - missing @example
- `src/ArrayOf.ts:86` `ArrayOfNonEmptyStrings` (const) - resolved
- `src/ArrayOf.ts:98` `ArrayOfNonEmptyStrings` (type) - missing @example
- `src/ArrayOf.ts:115` `NonEmptyArrayOfNonEmptyStrings` (const) - resolved
- `src/ArrayOf.ts:127` `NonEmptyArrayOfNonEmptyStrings` (type) - missing @example
- `src/ArrayOf.ts:144` `ArrayOfNumbers` (const) - resolved
- `src/ArrayOf.ts:156` `ArrayOfNumbers` (type) - missing @example
- `src/ArrayOf.ts:173` `NonEmptyArrayOfNumbers` (const) - resolved
- `src/ArrayOf.ts:185` `NonEmptyArrayOfNumbers` (type) - missing @example
- `src/ArrayOf.ts:202` `ArrayOfInts` (const) - resolved
- `src/ArrayOf.ts:214` `ArrayOfInts` (type) - missing @example
- `src/ArrayOf.ts:231` `NonEmptyArrayOfInts` (const) - resolved
- `src/ArrayOf.ts:243` `NonEmptyArrayOfInts` (type) - missing @example
- `src/BigDecimal.ts:33` `BigDecimalFromNumber` (const) - 1 schema annotation/type-alias gap(s)
- `src/BinaryFileExtension.ts:239` `hasBinaryExtension` (function) - resolved
- `src/BinaryFileExtension.ts:266` `isBinaryContent` (function) - resolved
- `src/BinaryFileExtension.ts:177` `BinaryFileExtension` (const) - resolved
- `src/BinaryFileExtension.ts:199` `BinaryFileExtension` (type) - resolved
- `src/BinaryFileExtension.ts:217` `isBinaryFileExtension` (const) - resolved
- `src/BufferEncoding.ts:27` `BuffEncoding` (const) - 1 schema annotation/type-alias gap(s)
- `src/BufferEncoding.ts:59` `BufferEncoding` (type) - resolved
- `src/CommonTextSchemas.ts:37` `TrimmedNonEmptyText` (const) - resolved
- `src/CommonTextSchemas.ts:65` `TrimmedNonEmptyText` (type) - 1 unsafe example violation(s)
- `src/CommonTextSchemas.ts:82` `CommaSeparatedList` (const) - resolved
- `src/CommonTextSchemas.ts:110` `CommaSeparatedList` (type) - 1 unsafe example violation(s)
- `src/CommonTextSchemas.ts:127` `NormalizedBooleanString` (const) - resolved
- `src/CommonTextSchemas.ts:155` `NormalizedBooleanString` (type) - resolved
- `src/Cuid.ts:19` `sha512` (const) - missing @example
- `src/Cuid.ts:34` `Cuid` (const) - missing @example
- `src/Cuid.ts:45` `Cuid` (type) - missing @example
- `src/Cuid.ts:53` `isCuid` (const) - missing @example
- `src/Cuid.ts:62` `CuidSeed` (type) - missing @example
- `src/Cuid.ts:75` `CuidState` (class) - missing @example
- `src/Cuid.ts:116` `cuid` (const) - missing @example
- `src/CurrencyCode.ts:31` `CurrencyCode` (const) - resolved
- `src/CurrencyCode.ts:51` `CurrencyCode` (type) - 1 unsafe example violation(s)
- `src/CurrencyCode.ts:67` `isCurrencyCode` (const) - resolved
- `src/CurrencyCode.ts:82` `USD` (const) - resolved
- `src/CurrencyCode.ts:89` `EUR` (const) - missing @example
- `src/CurrencyCode.ts:96` `GBP` (const) - missing @example
- `src/CurrencyCode.ts:103` `JPY` (const) - missing @example
- `src/CurrencyCode.ts:110` `CHF` (const) - missing @example
- `src/CurrencyCode.ts:117` `CAD` (const) - missing @example
- `src/CurrencyCode.ts:124` `AUD` (const) - missing @example
- `src/CurrencyCode.ts:131` `CNY` (const) - missing @example
- `src/CurrencyCode.ts:138` `HKD` (const) - missing @example
- `src/CurrencyCode.ts:145` `SGD` (const) - missing @example
- `src/DomainModel.ts:33` `defaultFields` (const) - 2 schema annotation/type-alias gap(s)
- `src/Duration.ts:96` `DurationUnit` (type) - missing @example
- `src/Duration.ts:104` `Unit` (type) - missing @example
- `src/Duration.ts:189` `DurationInput` (type) - missing @example
- `src/Duration.ts:249` `DurationFromInput` (type) - missing @example
- `src/EffectSchema.ts:56` `isEffect` (const) - resolved
- `src/EffectSchema.ts:76` `EffectSchema` (const) - resolved
- `src/EffectSchema.ts:98` `EffectSchema` (type) - resolved
- `src/EntitySchema.ts:29` `Fields` (type) - missing @example
- `src/EntitySchema.ts:37` `StorageKind` (const) - missing @example
- `src/EntitySchema.ts:58` `StorageKind` (type) - missing @example
- `src/EntitySchema.ts:66` `ValueStrategy` (const) - missing @example
- `src/EntitySchema.ts:87` `ValueStrategy` (type) - missing @example
- `src/EntitySchema.ts:95` `PersistStrategy` (const) - missing @example
- `src/EntitySchema.ts:103` `PersistStrategy` (type) - missing @example
- `src/EntitySchema.ts:111` `IndexHintKind` (const) - missing @example
- `src/EntitySchema.ts:123` `IndexHintKind` (type) - missing @example
- `src/EntitySchema.ts:143` `IndexHint` (const) - missing @example
- `src/EntitySchema.ts:157` `IndexHint` (type) - missing @example
- `src/EntitySchema.ts:165` `EncodedAbsenceKind` (const) - missing @example
- `src/EntitySchema.ts:187` `EncodedAbsenceKind` (type) - missing @example
- `src/EntitySchema.ts:195` `PersistOptions` (type) - missing @example
- `src/EntitySchema.ts:224` `PersistDescriptor` (type) - missing @example
- `src/EntitySchema.ts:249` `PersistDescriptor` (namespace) - 1 unsafe example violation(s)
- `src/EntitySchema.ts:297` `PersistDescriptor` (const) - missing @example
- `src/EntitySchema.ts:312` `PersistDescriptorByValueStrategy` (type) - missing @example
- `src/EntitySchema.ts:330` `EntityIdLike` (type) - missing @example
- `src/EntitySchema.ts:342` `EntityIdSchema` (type) - missing @example
- `src/EntitySchema.ts:368` `PersistDescriptorFor` (type) - missing @example
- `src/EntitySchema.ts:378` `PersistedFor` (type) - missing @example
- `src/EntitySchema.ts:388` `PersistedMap` (type) - missing @example
- `src/EntitySchema.ts:405` `Definition` (type) - missing @example
- `src/EntitySchema.ts:422` `EncodedShape` (type) - missing @example
- `src/EntitySchema.ts:432` `TypeShape` (type) - missing @example
- `src/EntitySchema.ts:442` `SchemaAnnotations` (type) - missing @example
- `src/EntitySchema.ts:450` `SnakeCase` (type) - missing @example
- `src/EntitySchema.ts:458` `LastPathSegment` (type) - missing @example
- `src/EntitySchema.ts:468` `TableNameFromIdentifier` (type) - missing @example
- `src/EntitySchema.ts:476` `ColumnNameFor` (type) - missing @example
- `src/EntitySchema.ts:488` `ClassInput` (type) - missing @example
- `src/EntitySchema.ts:529` `EntityClass` (type) - missing @example
- `src/EntitySchema.ts:554` `EntityClass` (namespace) - 1 unsafe example violation(s)
- `src/EntitySchema.ts:580` `Assign` (type) - missing @example
- `src/EntitySchema.ts:588` `AssignPersisted` (type) - missing @example
- `src/EntitySchema.ts:598` `ClassFactory` (type) - missing @example
- `src/EntitySchema.ts:1046` `ClassFactory` (const) - missing @example
- `src/EntitySchema.ts:652` `persist` (const) - missing @example
- `src/EntitySchema.ts:669` `DateTimeFromMillis` (const) - missing @example
- `src/EntitySchema.ts:677` `int` (const) - missing @example
- `src/EntitySchema.ts:685` `entityId` (const) - missing @example
- `src/EntitySchema.ts:694` `generatedId` (const) - missing @example
- `src/EntitySchema.ts:702` `literal` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/EntitySchema.ts:714` `tableNameFromIdentifier` (const) - missing @example
- `src/EntitySchema.ts:725` `columnNameFor` (const) - missing @example
- `src/EntitySchema.ts:782` `EncodedFieldShape` (type) - missing @example
- `src/EntitySchema.ts:796` `encodedAstFor` (const) - missing @example
- `src/EntitySchema.ts:832` `encodedFieldShape` (const) - missing @example
- `src/EntitySchema.ts:852` `selectedRowFieldShape` (const) - missing @example
- `src/EntitySchema.ts:868` `isEncodedNullable` (const) - missing @example
- `src/EntitySchema.ts:876` `isEncodedOptional` (const) - missing @example
- `src/EntitySchema.ts:1067` `getDefinition` (const) - missing @example
- `src/FileExtension.ts:72` `extractMimeExtensions` (const) - resolved
- `src/FileExtension.ts:99` `ApplicationFileExtension` (const) - resolved
- `src/FileExtension.ts:121` `ApplicationFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:138` `VideoFileExtension` (const) - resolved
- `src/FileExtension.ts:160` `VideoFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:177` `TextFileExtension` (const) - resolved
- `src/FileExtension.ts:199` `TextFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:216` `ImageFileExtension` (const) - resolved
- `src/FileExtension.ts:238` `ImageFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:255` `AudioFileExtension` (const) - resolved
- `src/FileExtension.ts:277` `AudioFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:293` `MiscFileExtension` (const) - resolved
- `src/FileExtension.ts:315` `MiscFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:332` `FileExtension` (const) - resolved
- `src/FileExtension.ts:358` `FileExtension` (type) - 1 unsafe example violation(s)
- `src/FileName.ts:100` `FileName` (const) - missing summary; missing @example
- `src/FileName.ts:118` `FileName` (type) - 1 unsafe example violation(s)
- `src/FilePath.ts:79` `HasNullByte` (type) - missing @example
- `src/FilePath.ts:88` `SupportedWindowsNamespace` (const) - missing @example
- `src/FilePath.ts:110` `SupportedWindowsNamespace` (type) - missing @example
- `src/FilePath.ts:118` `UsesPosixSeparator` (const) - missing @example
- `src/FilePath.ts:140` `UsesPosixSeparator` (type) - missing @example
- `src/FilePath.ts:148` `UsesWindowsSeparator` (const) - missing @example
- `src/FilePath.ts:170` `UsesWindowsSeparator` (type) - missing @example
- `src/FilePath.ts:178` `EndsWithSeparator` (const) - missing @example
- `src/FilePath.ts:200` `EndsWithSeparator` (type) - missing @example
- `src/FilePath.ts:210` `WindowsDotSegment` (const) - missing @example
- `src/FilePath.ts:222` `WindowsDotSegment` (type) - missing @example
- `src/FilePath.ts:231` `ValidWindowsPlainPathSegment` (const) - missing @example
- `src/FilePath.ts:274` `ValidWindowsPlainPathSegment` (type) - missing @example
- `src/FilePath.ts:284` `ValidWindowsRootSegment` (const) - missing @example
- `src/FilePath.ts:306` `ValidWindowsRootSegment` (type) - missing @example
- `src/FilePath.ts:315` `ValidWindowsPathSegment` (const) - missing @example
- `src/FilePath.ts:330` `ValidWindowsPathSegment` (type) - missing @example
- `src/FilePath.ts:338` `WindowsSegments` (const) - missing @example
- `src/FilePath.ts:353` `WindowsSegments` (type) - missing @example
- `src/FilePath.ts:362` `ValidWindowsUncRest` (const) - missing @example
- `src/FilePath.ts:377` `ValidWindowsUncRest` (type) - missing @example
- `src/FilePath.ts:385` `ValidWindowsUncSegments` (const) - missing @example
- `src/FilePath.ts:403` `ValidWindowsUncSegments` (type) - missing @example
- `src/FilePath.ts:411` `WindowsDriveRoot` (const) - missing @example
- `src/FilePath.ts:433` `WindowsDriveRoot` (type) - missing @example
- `src/FilePath.ts:441` `WindowsUncRoot` (const) - missing @example
- `src/FilePath.ts:463` `WindowsUncRoot` (type) - missing @example
- `src/FilePath.ts:475` `HasLeafSegment` (const) - missing @example
- `src/FilePath.ts:524` `HasLeafSegment` (type) - missing @example
- `src/FilePath.ts:539` `WindowsDrivePath` (const) - missing @example
- `src/FilePath.ts:588` `WindowsDrivePath` (type) - missing @example
- `src/FilePath.ts:597` `WindowsUncPath` (const) - missing @example
- `src/FilePath.ts:652` `WindowsUncPath` (type) - missing @example
- `src/FilePath.ts:663` `WindowsRelativePath` (const) - missing @example
- `src/FilePath.ts:730` `WindowsRelativePath` (type) - missing @example
- `src/FilePath.ts:746` `SupportedPathFamily` (const) - missing @example
- `src/FilePath.ts:758` `SupportedPathFamily` (type) - missing @example
- `src/FilePath.ts:865` `FilePath` (type) - missing @example
- `src/Float16Array.ts:51` `isFloat16Array` (const) - missing @example
- `src/Float16Array.ts:73` `Float16Arr` (const) - resolved
- `src/Float16Array.ts:85` `Float16Arr` (type) - missing @example
- `src/Float16Array.ts:112` `Float16ArrayFromArray` (const) - resolved
- `src/Float16Array.ts:136` `Float16ArrayFromArray` (type) - missing @example
- `src/Float16Array.ts:144` `Float16ArrayFromArray` (namespace) - missing @example
- `src/Float16Array.ts:178` `Float16ArrayField` (const) - missing @example
- `src/Float32Array.ts:39` `Float32Arr` (const) - resolved
- `src/Float32Array.ts:53` `Float32Arr` (type) - missing @example
- `src/Float32Array.ts:80` `Float32ArrayFromArray` (const) - resolved
- `src/Float32Array.ts:101` `Float32ArrayFromArray` (type) - missing @example
- `src/Float32Array.ts:109` `Float32ArrayFromArray` (namespace) - missing @example
- `src/Float32Array.ts:143` `Float32ArrayField` (const) - missing @example
- `src/Float64Array.ts:39` `Float64Arr` (const) - resolved
- `src/Float64Array.ts:53` `Float64Arr` (type) - missing @example
- `src/Float64Array.ts:80` `Float64ArrayFromArray` (const) - resolved
- `src/Float64Array.ts:101` `Float64ArrayFromArray` (type) - missing @example
- `src/Float64Array.ts:109` `Float64ArrayFromArray` (namespace) - missing @example
- `src/Float64Array.ts:143` `Float64ArrayField` (const) - missing @example
- `src/Fn.ts:450` `ThunkOf` (function) - resolved
- `src/Fn.ts:451` `ThunkOf` (function) - missing summary; missing @example, @category, @since
- `src/Fn.ts:455` `ThunkOf` (function) - missing summary; missing @example, @category, @since
- `src/Fn.ts:479` `Fn` (function) - resolved
- `src/Fn.ts:503` `Fn` (function) - resolved
- `src/Fn.ts:528` `Fn` (function) - resolved
- `src/Fn.ts:558` `Fn` (function) - resolved
- `src/Fn.ts:564` `Fn` (function) - missing summary; missing @example, @category, @since
- `src/Fn.ts:130` `FnType` (type) - 1 unsafe example violation(s)
- `src/Fn.ts:174` `FnSchemaNoArg` (interface) - missing @example
- `src/Fn.ts:193` `FnSchemaUnary` (interface) - missing @example
- `src/Fn.ts:213` `FnSchema` (type) - missing @example
- `src/Fn.ts:229` `FnSchemaStatics` (type) - missing @example
- `src/Fn.ts:414` `AnyFn` (const) - resolved
- `src/Fn.ts:426` `AnyFn` (type) - missing @example
- `src/Glob.ts:106` `Glob` (const) - resolved
- `src/Glob.ts:121` `Glob` (type) - missing @example
- `src/Graph.ts:279` `NodeIndex` (type) - missing @example
- `src/Graph.ts:311` `EdgeIndex` (const) - missing @example
- `src/Graph.ts:324` `EdgeIndex` (type) - missing @example
- `src/Graph.ts:332` `EdgeIndexFromString` (const) - missing @example
- `src/Graph.ts:345` `GraphKind` (const) - missing @example
- `src/Graph.ts:357` `GraphKind` (type) - missing @example
- `src/Graph.ts:365` `EdgeEncoded` (type) - missing @example
- `src/Graph.ts:473` `EdgeEncoded` (const) - missing @example
- `src/Graph.ts:377` `GraphEncoded` (type) - missing @example
- `src/Graph.ts:675` `GraphEncoded` (const) - missing @example
- `src/Graph.ts:413` `EdgeEncodedSchema` (interface) - missing @example
- `src/Graph.ts:430` `GraphEncodedSchema` (interface) - missing @example
- `src/Graph.ts:450` `isEdge` (const) - missing @example
- `src/Graph.ts:460` `isGraph` (const) - missing @example
- `src/Graph.ts:493` `EdgeFromSelf` (interface) - missing @example
- `src/Graph.ts:533` `EdgeFromSelf` (const) - missing @example
- `src/Graph.ts:510` `EdgeTransform` (interface) - missing @example
- `src/Graph.ts:596` `EdgeTransform` (const) - missing @example
- `src/Graph.ts:522` `Edge` (interface) - missing @example
- `src/Graph.ts:705` `GraphFromSelf` (interface) - missing @example
- `src/Graph.ts:923` `GraphFromSelf` (const) - missing @example
- `src/Graph.ts:723` `DirectedGraphFromSelf` (interface) - missing @example
- `src/Graph.ts:941` `DirectedGraphFromSelf` (const) - missing @example
- `src/Graph.ts:741` `UndirectedGraphFromSelf` (interface) - missing @example
- `src/Graph.ts:962` `UndirectedGraphFromSelf` (const) - missing @example
- `src/Graph.ts:759` `MutableGraphFromSelf` (interface) - missing @example
- `src/Graph.ts:983` `MutableGraphFromSelf` (const) - missing @example
- `src/Graph.ts:777` `MutableDirectedGraphFromSelf` (interface) - missing @example
- `src/Graph.ts:1001` `MutableDirectedGraphFromSelf` (const) - missing @example
- `src/Graph.ts:795` `MutableUndirectedGraphFromSelf` (interface) - missing @example
- `src/Graph.ts:1022` `MutableUndirectedGraphFromSelf` (const) - missing @example
- `src/Graph.ts:1041` `DirectedGraph` (interface) - missing @example
- `src/Graph.ts:1054` `UndirectedGraph` (interface) - missing @example
- `src/Graph.ts:1198` `UndirectedGraph` (const) - missing @example
- `src/Graph.ts:1067` `MutableDirectedGraph` (interface) - missing @example
- `src/Graph.ts:1222` `MutableDirectedGraph` (const) - missing @example
- `src/Graph.ts:1080` `MutableUndirectedGraph` (interface) - missing @example
- `src/Graph.ts:1246` `MutableUndirectedGraph` (const) - missing @example
- `src/Int.ts:29` `Int` (const) - resolved
- `src/Int.ts:55` `Int` (type) - resolved
- `src/Int.ts:72` `PosInt` (const) - resolved
- `src/Int.ts:98` `PosInt` (type) - 1 unsafe example violation(s)
- `src/Int.ts:137` `PostgresSerialInt` (type) - 1 unsafe example violation(s)
- `src/Int.ts:154` `NegInt` (const) - resolved
- `src/Int.ts:180` `NegInt` (type) - 1 unsafe example violation(s)
- `src/Int.ts:197` `NonPositiveInt` (const) - resolved
- `src/Int.ts:223` `NonPositiveInt` (type) - 1 unsafe example violation(s)
- `src/Int.ts:240` `NonNegativeInt` (const) - resolved
- `src/Int.ts:266` `NonNegativeInt` (type) - 1 unsafe example violation(s)
- `src/Json.ts:27` `JsonObject` (const) - resolved
- `src/Json.ts:39` `JsonObject` (type) - missing @example
- `src/Json.ts:56` `JsonArray` (const) - resolved
- `src/Json.ts:68` `JsonArray` (type) - missing @example
- `src/Jsonc.ts:36` `JsoncParseDiagnostic` (class) - resolved
- `src/Jsonc.ts:99` `JsoncTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/Jsonc.ts:139` `decodeJsoncTextAs` (const) - resolved
- `src/Jsonl.ts:107` `JsonlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/Jsonl.ts:144` `decodeJsonlTextAs` (const) - resolved
- `src/KebabStr.ts:28` `KebabCaseStr` (const) - resolved
- `src/KebabStr.ts:54` `KebabCaseStr` (type) - 1 unsafe example violation(s)
- `src/LiteralKit.ts:697` `LiteralKit` (function) - 1 unsafe example violation(s)
- `src/LiteralKit.ts:644` `LiteralKit` (interface) - missing summary; missing @example, @category
- `src/LiteralKit.ts:36` `LiteralToKey` (type) - missing @example
- `src/LiteralKit.ts:215` `matchLiteral` (const) - resolved
- `src/LiteralKit.ts:377` `LiteralNotInSetError` (class) - resolved
- `src/LiteralKit.ts:393` `LiteralKitKeyCollisionError` (class) - resolved
- `src/LiteralKit.ts:411` `LiteralKitEnumMappingDuplicateLiteralError` (class) - resolved
- `src/LiteralKit.ts:427` `LiteralKitEnumMappingCoverageError` (class) - resolved
- `src/LiteralKit.ts:443` `LiteralKitTaggedUnionLiteralError` (class) - resolved
- `src/LocalDate.ts:128` `isLocalDate` (const) - missing @example
- `src/LocalDate.ts:218` `fromString` (const) - missing @example
- `src/LocalDate.ts:241` `fromDate` (const) - missing @example
- `src/LocalDate.ts:255` `today` (const) - missing @example
- `src/LocalDate.ts:263` `todayEffect` (const) - missing @example
- `src/LocalDate.ts:274` `fromDateTime` (const) - missing @example
- `src/LocalDate.ts:289` `Order` (const) - missing @example
- `src/LocalDate.ts:308` `isBefore` (const) - missing @example
- `src/LocalDate.ts:319` `isAfter` (const) - missing @example
- `src/LocalDate.ts:330` `equals` (const) - missing @example
- `src/LocalDate.ts:345` `addDays` (const) - missing @example
- `src/LocalDate.ts:360` `addMonths` (const) - missing @example
- `src/LocalDate.ts:375` `addYears` (const) - missing @example
- `src/LocalDate.ts:390` `diffInDays` (const) - missing @example
- `src/LocalDate.ts:406` `startOfMonth` (const) - missing @example
- `src/LocalDate.ts:420` `endOfMonth` (const) - missing @example
- `src/LocalDate.ts:434` `startOfYear` (const) - missing @example
- `src/LocalDate.ts:448` `endOfYear` (const) - missing @example
- `src/LocalDate.ts:462` `isLeapYear` (const) - missing @example
- `src/LocalDate.ts:472` `daysInMonth` (const) - missing @example
- `src/LocalDate.ts:519` `LocalDateFromString` (type) - missing @example
- `src/LocalDate.ts:527` `LocalDateFromString` (namespace) - missing @example
- `src/Logs.ts:31` `LogLevel` (const) - resolved
- `src/Logs.ts:43` `LogLevel` (type) - missing @example
- `src/Logs.ts:62` `LogSeverity` (const) - resolved
- `src/Logs.ts:74` `LogSeverity` (type) - missing @example
- `src/MappedLiteralKit.ts:331` `MappedLiteralKit` (function) - 1 unsafe example violation(s)
- `src/MappedLiteralKit.ts:300` `MappedLiteralKit` (interface) - missing summary; missing @example, @category
- `src/MappedLiteralKit.ts:100` `MappedLiteralDuplicateError` (class) - resolved
- `src/Markdown.ts:118` `Markdown` (const) - resolved
- `src/Markdown.ts:137` `Markdown` (type) - missing @example
- `src/Markdown.ts:165` `MarkdownTextToHtml` (const) - 1 schema annotation/type-alias gap(s)
- `src/Markdown.ts:206` `decodeMarkdownTextAs` (const) - resolved
- `src/MimeType.ts:56` `extractMimeTypes` (const) - resolved
- `src/MimeType.ts:74` `MimeType` (const) - resolved
- `src/MimeType.ts:115` `MimeType` (type) - 1 unsafe example violation(s)
- `src/MimeType.ts:132` `ApplicationMimeType` (const) - resolved
- `src/MimeType.ts:147` `ApplicationMimeType` (type) - 1 unsafe example violation(s)
- `src/MimeType.ts:164` `VideoMimeType` (const) - resolved
- `src/MimeType.ts:179` `VideoMimeType` (type) - 1 unsafe example violation(s)
- `src/MimeType.ts:196` `TextMimeType` (const) - resolved
- `src/MimeType.ts:211` `TextMimeType` (type) - 1 unsafe example violation(s)
- `src/MimeType.ts:228` `ImageMimeType` (const) - resolved
- `src/MimeType.ts:243` `ImageMimeType` (type) - 1 unsafe example violation(s)
- `src/MimeType.ts:260` `AudioMimeType` (const) - resolved
- `src/MimeType.ts:275` `AudioMimeType` (type) - 1 unsafe example violation(s)
- `src/MimeType.ts:283` `MiscMimeType` (const) - missing @example
- `src/MimeType.ts:298` `MiscMimeType` (type) - 1 unsafe example violation(s)
- `src/Model.ts:35` `Any` (type) - missing @example
- `src/Model.ts:50` `VariantsDatabase` (type) - missing @example
- `src/Model.ts:58` `VariantsJson` (type) - missing @example
- `src/Model.ts:66` `Variant` (type) - missing @example
- `src/Model.ts:74` `DefaultVariant` (type) - missing @example
- `src/Model.ts:99` `ClassShape` (type) - missing @example
- `src/Model.ts:24` `Class` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model.ts:24` `extract` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model.ts:24` `Field` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model.ts:24` `FieldExcept` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model.ts:24` `FieldOnly` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model.ts:24` `fieldEvolve` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model.ts:24` `Struct` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model.ts:24` `Union` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model.ts:282` `fields` (const) - 1 example import violation(s)
- `src/Model.ts:311` `Overridable` (interface) - missing @example
- `src/Model.ts:336` `Overridable` (const) - missing @example
- `src/Model.ts:376` `Generated` (interface) - missing @example
- `src/Model.ts:416` `GeneratedByApp` (interface) - missing @example
- `src/Model.ts:433` `GeneratedByApp` (const) - missing @example
- `src/Model.ts:447` `Sensitive` (interface) - missing @example
- `src/Model.ts:496` `optionalOption` (interface) - 1 example import violation(s)
- `src/Model.ts:514` `optionalOption` (const) - 1 example import violation(s); 2 schema annotation/type-alias gap(s)
- `src/Model.ts:546` `FieldOption` (interface) - 1 example import violation(s)
- `src/Model.ts:574` `FieldOption` (const) - 1 example import violation(s)
- `src/Model.ts:636` `BooleanSqlite` (const) - 1 example import violation(s); 2 schema annotation/type-alias gap(s)
- `src/Model.ts:678` `Date` (const) - 1 example import violation(s); 2 schema annotation/type-alias gap(s)
- `src/Model.ts:793` `DateTimeInsert` (const) - 1 example import violation(s)
- `src/Model.ts:839` `DateTimeInsertFromDate` (const) - 1 example import violation(s)
- `src/Model.ts:885` `DateTimeInsertFromNumber` (const) - 1 example import violation(s)
- `src/Model.ts:933` `DateTimeUpdate` (const) - 1 example import violation(s)
- `src/Model.ts:982` `DateTimeUpdateFromDate` (const) - 1 example import violation(s)
- `src/Model.ts:1031` `DateTimeUpdateFromNumber` (const) - 1 example import violation(s)
- `src/Model.ts:1054` `JsonFromString` (interface) - 1 example import violation(s)
- `src/Model.ts:1082` `JsonFromString` (const) - 1 example import violation(s)
- `src/Model.ts:1111` `UuidV4Insert` (interface) - 1 example import violation(s)
- `src/Model.ts:1178` `UuidV4Insert` (const) - 1 example import violation(s)
- `src/Model.ts:1153` `UuidV4WithGenerate` (const) - 1 example import violation(s)
- `src/MutableHashMap.ts:82` `MutableHashMapIso` (type) - missing @example
- `src/MutableHashMap.ts:92` `MutableHashMapFromSelf` (interface) - missing @example
- `src/MutableHashMap.ts:162` `MutableHashMapFromSelf` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashMap.ts:110` `MutableHashMap` (interface) - missing @example
- `src/MutableHashMap.ts:261` `MutableHashMap` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashMap.ts:137` `isMutableHashMap` (const) - resolved
- `src/MutableHashSet.ts:54` `MutableHashSetIso` (type) - missing @example
- `src/MutableHashSet.ts:62` `MutableHashSetFromSelf` (interface) - missing @example
- `src/MutableHashSet.ts:127` `MutableHashSetFromSelf` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashSet.ts:79` `MutableHashSet` (interface) - missing @example
- `src/MutableHashSet.ts:220` `MutableHashSet` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashSet.ts:102` `isMutableHashSet` (const) - resolved
- `src/Number.ts:29` `isPositive` (const) - resolved
- `src/Number.ts:91` `isNonNegative` (const) - resolved
- `src/Number.ts:109` `isNegative` (const) - resolved
- `src/Number.ts:127` `isNonPositive` (const) - resolved
- `src/Number.ts:144` `NonNegativeInt` (const) - resolved
- `src/Number.ts:166` `NonNegativeInt` (type) - 1 unsafe example violation(s)
- `src/Options.ts:78` `OptionFromOptionalNullishKey` (const) - forbidden @template
- `src/PascalStr.ts:28` `PascalCaseStr` (const) - resolved
- `src/PascalStr.ts:54` `PascalCaseStr` (type) - 1 unsafe example violation(s)
- `src/Percentage.ts:32` `Percentage` (const) - resolved
- `src/Percentage.ts:55` `Percentage` (type) - 1 unsafe example violation(s)
- `src/Percentage.ts:71` `isPercentage` (const) - resolved
- `src/Percentage.ts:86` `ZERO` (const) - resolved
- `src/Percentage.ts:93` `TWENTY` (const) - missing @example
- `src/Percentage.ts:100` `FIFTY` (const) - missing @example
- `src/Percentage.ts:107` `HUNDRED` (const) - missing @example
- `src/Percentage.ts:122` `toDecimal` (const) - resolved
- `src/Percentage.ts:138` `fromDecimal` (const) - resolved
- `src/Percentage.ts:154` `isZero` (const) - resolved
- `src/Percentage.ts:170` `isFull` (const) - resolved
- `src/Percentage.ts:186` `complement` (const) - resolved
- `src/Percentage.ts:202` `format` (const) - resolved
- `src/PosixPath.ts:31` `PosixPath` (const) - resolved
- `src/PosixPath.ts:53` `PosixPath` (type) - 1 unsafe example violation(s)
- `src/PosixPath.ts:70` `NativePathToPosixPath` (const) - 1 schema annotation/type-alias gap(s)
- `src/PosixPath.ts:104` `normalizePath` (const) - resolved
- `src/Primitive.ts:28` `Primitive` (const) - resolved
- `src/Primitive.ts:47` `Primitive` (type) - resolved
- `src/PromiseSchema.ts:64` `isPromise` (const) - resolved
- `src/PromiseSchema.ts:91` `PromiseSchema` (const) - resolved
- `src/PromiseSchema.ts:112` `PromiseSchema` (type) - resolved
- `src/RegExp.ts:58` `RegExpStr` (const) - resolved
- `src/RegExp.ts:80` `RegExpStr` (type) - 1 unsafe example violation(s)
- `src/RegExp.ts:107` `RegExpFromStr` (const) - resolved
- `src/RegExp.ts:135` `RegExpFromStr` (type) - 1 unsafe example violation(s)
- `src/SchemaUtils/index.ts:12` `export * from "./optionalKeyWithDefaults.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:17` `export * from "./pluck.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:22` `export * from "./split.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:27` `export * from "./toEquivalence.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:32` `export * from "./withEncodeDefault.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:37` `export * from "./withKeyDefaults.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:42` `export * from "./withLiteralKitStatics.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:47` `export * from "./withStatics.ts";` (re-export) - missing @example
- `src/SchemaUtils/optionalKeyWithDefaults.ts:20` `optionalKeyWithDefault` (const) - missing @example
- `src/SchemaUtils/pluck.ts:57` `pluck` (function) - forbidden @template
- `src/SchemaUtils/split.ts:49` `split` (function) - resolved
- `src/SchemaUtils/toEquivalence.ts:32` `DualEquivalence` (type) - forbidden @template
- `src/SchemaUtils/toEquivalence.ts:64` `toEquivalence` (const) - forbidden @template
- `src/SchemaUtils/withEncodeDefault.ts:40` `withEncodeDefault` (const) - forbidden @template
- `src/SchemaUtils/withEncodeDefault.ts:83` `boolWithDefault` (const) - 2 schema annotation/type-alias gap(s)
- `src/SchemaUtils/withKeyDefaults.ts:113` `withEmptyArrayDefaults` (function) - forbidden @template
- `src/SchemaUtils/withKeyDefaults.ts:118` `withEmptyArrayDefaults` (function) - missing summary; missing @example, @category, @since
- `src/SchemaUtils/withKeyDefaults.ts:123` `withEmptyArrayDefaults` (function) - missing summary; missing @example, @category, @since
- `src/SchemaUtils/withKeyDefaults.ts:49` `withKeyDefaults` (const) - forbidden @template
- `src/SchemaUtils/withKeyDefaults.ts:153` `boolKeyWithDefault` (const) - 2 schema annotation/type-alias gap(s)
- `src/SchemaUtils/withLiteralKitStatics.ts:24` `withLiteralKitStatics` (const) - missing @example, @category
- `src/SemanticVersion.ts:46` `SemanticVersion` (const) - resolved
- `src/SemanticVersion.ts:75` `SemanticVersion` (type) - resolved
- `src/SeverityLevel.ts:30` `SeverityLevel` (const) - resolved
- `src/SeverityLevel.ts:49` `SeverityLevel` (type) - resolved
- `src/Sha256.ts:57` `Sha256Hex` (const) - resolved
- `src/Sha256.ts:79` `Sha256Hex` (type) - 1 unsafe example violation(s)
- `src/Sha256.ts:101` `Sha256HexFromBytes` (const) - resolved
- `src/Sha256.ts:126` `Sha256HexFromBytes` (type) - 1 unsafe example violation(s)
- `src/Sha256.ts:147` `Sha256HexFromHexBytes` (const) - resolved
- `src/Sha256.ts:169` `Sha256HexFromHexBytes` (type) - 1 unsafe example violation(s)
- `src/Slug.ts:96` `Slug` (type) - missing @example
- `src/Slug.ts:104` `SlugFromStr` (const) - missing @example
- `src/SnakeStr.ts:28` `SnakeCaseStr` (const) - resolved
- `src/SnakeStr.ts:54` `SnakeCaseStr` (type) - 1 unsafe example violation(s)
- `src/Sql/ColumnDef.ts:18` `PrimaryKey` (const) - missing summary; missing @example
- `src/Sql/ColumnDef.ts:28` `PrimaryKey` (type) - missing summary; missing @example
- `src/Sql/ColumnDef.ts:34` `Unique` (const) - missing summary; missing @example
- `src/Sql/ColumnDef.ts:44` `Unique` (type) - missing summary; missing @example
- `src/Sql/ColumnDef.ts:50` `IsNull` (const) - missing summary; missing @example
- `src/Sql/ColumnDef.ts:60` `AutoIncrement` (const) - missing summary; missing @example
- `src/Sql/ColumnDef.ts:70` `AutoIncrement` (type) - missing summary; missing @example
- `src/Sql/ColumnDef.ts:76` `UniqueName` (const) - missing summary; missing @example
- `src/Sql/ColumnDef.ts:86` `UniqueName` (type) - missing summary; missing @example
- `src/Sql/Constants.ts:5` `CONSTANTS` (const) - missing summary; missing @example
- `src/Sql/Error.ts:23` `ErrorSeverity` (const) - missing @example
- `src/Sql/Error.ts:34` `ErrorSeverity` (type) - missing summary; missing @example
- `src/Sql/Error.ts:42` `commonFields` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/Sql/Error.ts:206` `IdentifierTooLongError` (class) - missing @example
- `src/Sql/Error.ts:218` `InvalidIdentifierCharsError` (class) - missing @example
- `src/Sql/Error.ts:229` `NullablePrimaryKeyError` (class) - missing @example
- `src/Sql/Error.ts:247` `MissingVariantSchemaError` (class) - missing @example
- `src/Sql/Error.ts:261` `UnsupportedColumnTypeError` (class) - missing @example
- `src/Sql/Error.ts:278` `EmptyModelIdentifierError` (class) - missing @example
- `src/Sql/Error.ts:289` `MultipleAutoIncrementError` (class) - missing @example
- `src/Sql/Error.ts:302` `ModelValidationAggregateError` (class) - missing @example
- `src/Sql/Error.ts:313` `AutoIncrementTypeError` (class) - missing @example
- `src/Sql/Error.ts:322` `DSLValidationError` (const) - missing @example
- `src/Sql/Error.ts:344` `DSLValidationError` (type) - missing summary; missing @example
- `src/Sql/Error.ts:350` `DSLValidationError` (namespace) - missing summary; missing @example
- `src/Sql/Sql.ts:21` `Dialect` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:40` `Dialect` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:46` `ColumnDataType` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:64` `ColumnDataType` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:404` `ColumnDataType` (namespace) - missing summary; missing @example
- `src/Sql/Sql.ts:70` `ColumnDataArrayConstraint` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:88` `ColumnDataArrayConstraint` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:94` `ColumnDataBigIntConstraint` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:104` `ColumnDataBigIntConstraint` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:110` `ColumnDataNumberConstraint` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:137` `ColumnDataNumberConstraint` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:143` `ColumnDataObjectConstraint` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:167` `ColumnDataObjectConstraint` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:173` `ColumnDataStringConstraint` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:201` `ColumnDataStringConstraint` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:207` `ColumnDataConstraint` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:223` `ColumnDataConstraint` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:238` `ColumnType` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:255` `ColumnType` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:261` `UpdateDeleteAction` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:271` `UpdateDeleteAction` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:277` `DimensionStringFromNumber` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:294` `DimensionStringFromNumber` (namespace) - missing summary; missing @example
- `src/Sql/Sql.ts:309` `ArrayDimension` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:319` `ArrayDimension` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:325` `ArrayDimensionString` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:335` `ArrayDimensionString` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:341` `PolicyConfigAs` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:350` `PolicyConfigAs` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:356` `PolicyConfigFor` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:366` `PolicyConfigFor` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:372` `Casing` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:382` `Casing` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:388` `RelationType` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:398` `RelationType` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:434` `ColumnTypeData` (class) - missing @example
- `src/Sql/Sql.ts:448` `ColumnTypeData` (namespace) - missing summary; missing @example
- `src/Sql/Sql.ts:462` `Assume` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:468` `ExtractColumnTypeData` (type) - missing summary; missing @example
- `src/Sql/Sql.ts:477` `ArrayColumnTypeDataConstraint` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:491` `ArrayColumnTypeDataConstraint` (namespace) - missing summary; missing @example
- `src/Sql/Sql.ts:506` `BigIntColumnTypeDataConstraint` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:520` `BigIntColumnTypeDataConstraint` (namespace) - missing summary; missing @example
- `src/Sql/Sql.ts:535` `NumberColumnTypeDataConstraint` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:548` `NumberColumnTypeDataConstraint` (namespace) - missing summary; missing @example
- `src/Sql/Sql.ts:563` `ObjectColumnTypeDataConstraint` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:576` `ObjectColumnTypeDataConstraint` (namespace) - missing summary; missing @example
- `src/Sql/Sql.ts:590` `StringColumnTypeDataConstraint` (const) - missing summary; missing @example
- `src/Sql/Sql.ts:603` `StringColumnTypeDataConstraint` (namespace) - missing summary; missing @example
- `src/Sql/Sql.ts:618` `MakeOptions` (interface) - missing summary; missing @example
- `src/Sql/Sql.ts:627` `MakeReturn` (interface) - missing summary; missing @example
- `src/Sql/Sql.ts:642` `make` (const) - missing summary; missing @example
- `src/Sql/index.ts:5` `export * from "./Sql.ts";` (re-export) - missing @example
- `src/StatusCauseError.ts:39` `StatusCauseFields` (const) - 2 schema annotation/type-alias gap(s)
- `src/String.ts:28` `NonEmptyTrimmedStr` (const) - resolved
- `src/String.ts:49` `NonEmptyTrimmedStr` (type) - 1 unsafe example violation(s)
- `src/String.ts:66` `UUID` (const) - resolved
- `src/String.ts:87` `UUID` (type) - 1 unsafe example violation(s)
- `src/String.ts:104` `NullableStr` (const) - resolved
- `src/String.ts:124` `NullableStr` (type) - resolved
- `src/String.ts:141` `OptionFromNullableStr` (const) - resolved
- `src/String.ts:154` `OptionFromNullableStr` (type) - missing @example
- `src/Thunk.ts:37` `TypeId` (type) - missing @example
- `src/Thunk.ts:46` `ThunkUnknown` (type) - missing @example
- `src/Thunk.ts:82` `ThunkUnknown` (const) - resolved
- `src/Thunk.ts:64` `nominal` (const) - resolved
- `src/Thunk.ts:131` `make` (const) - resolved
- `src/Timestamp.ts:67` `ISOStr` (type) - missing @example
- `src/Timestamp.ts:100` `EpochMillis` (type) - missing @example
- `src/Timestamp.ts:119` `ToIsoStr` (const) - 1 schema annotation/type-alias gap(s)
- `src/Timestamp.ts:147` `ToIsoStr` (namespace) - missing @example
- `src/Timestamp.ts:139` `ToIsoString` (type) - missing @example
- `src/Timestamp.ts:252` `isTimestamp` (const) - missing @example
- `src/Timestamp.ts:260` `fromDateTime` (const) - missing @example
- `src/Timestamp.ts:269` `fromDate` (const) - missing @example
- `src/Timestamp.ts:277` `fromString` (const) - missing @example
- `src/Timestamp.ts:293` `now` (const) - missing @example
- `src/Timestamp.ts:301` `nowEffect` (const) - missing @example
- `src/Timestamp.ts:312` `Order` (const) - missing @example
- `src/Timestamp.ts:324` `isBefore` (const) - missing @example
- `src/Timestamp.ts:335` `isAfter` (const) - missing @example
- `src/Timestamp.ts:346` `equals` (const) - missing @example
- `src/Timestamp.ts:357` `addMillis` (const) - missing @example
- `src/Timestamp.ts:368` `addSeconds` (const) - missing @example
- `src/Timestamp.ts:379` `addMinutes` (const) - missing @example
- `src/Timestamp.ts:390` `addHours` (const) - missing @example
- `src/Timestamp.ts:401` `addDays` (const) - missing @example
- `src/Timestamp.ts:412` `diffInMillis` (const) - missing @example
- `src/Timestamp.ts:423` `diffInSeconds` (const) - missing @example
- `src/Timestamp.ts:434` `min` (const) - missing @example
- `src/Timestamp.ts:445` `max` (const) - missing @example
- `src/Timestamp.ts:456` `EPOCH` (const) - missing @example
- `src/Timezone.ts:28` `Timezone` (const) - resolved
- `src/Timezone.ts:493` `Timezone` (type) - resolved
- `src/Toml.ts:84` `TomlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/Toml.ts:123` `decodeTomlTextAs` (const) - resolved
- `src/Transformations.ts:47` `destructiveTransform` (const) - 2 schema annotation/type-alias gap(s)
- `src/URL.ts:60` `URLStr` (const) - resolved
- `src/URL.ts:85` `URLStr` (type) - 1 unsafe example violation(s)
- `src/VariantSchema.ts:18` `TypeId` (const) - missing summary; missing @example
- `src/VariantSchema.ts:26` `Struct` (interface) - missing summary; missing @example
- `src/VariantSchema.ts:42` `Struct` (namespace) - missing summary; missing @example
- `src/VariantSchema.ts:36` `isStruct` (const) - missing summary; missing @example
- `src/VariantSchema.ts:78` `Field` (interface) - missing summary; missing @example
- `src/VariantSchema.ts:92` `Field` (namespace) - missing summary; missing @example
- `src/VariantSchema.ts:87` `isField` (const) - missing summary; missing @example
- `src/VariantSchema.ts:146` `ExtractFields` (type) - missing summary; missing @example
- `src/VariantSchema.ts:166` `Extract` (type) - missing summary; missing @example
- `src/VariantSchema.ts:228` `fields` (const) - missing summary; missing @example
- `src/VariantSchema.ts:234` `Class` (interface) - missing summary; missing @example
- `src/VariantSchema.ts:343` `Union` (interface) - missing summary; missing @example
- `src/VariantSchema.ts:352` `Union` (namespace) - missing summary; missing @example
- `src/VariantSchema.ts:447` `make` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/VariantSchema.ts:578` `Override` (const) - missing summary; missing @example
- `src/VariantSchema.ts:584` `Overridable` (interface) - missing summary; missing @example
- `src/VariantSchema.ts:607` `Overridable` (const) - missing summary; missing @example
- `src/Xml.ts:79` `XmlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/Xml.ts:119` `decodeXmlTextAs` (const) - resolved
- `src/Yaml.ts:78` `parseYaml` (const) - resolved
- `src/Yaml.ts:101` `YamlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/Yaml.ts:141` `decodeYamlTextAs` (const) - resolved
- `src/blockchain/CryptoTxnHash.ts:60` `CryptoTxnHash` (const) - missing @example
- `src/blockchain/CryptoTxnHash.ts:75` `CryptoTxnHash` (type) - missing @example
- `src/blockchain/CryptoTxnHash.ts:83` `CryptoTxnHashRedacted` (const) - missing @example
- `src/blockchain/CryptoTxnHash.ts:101` `CryptoTxnHashRedacted` (type) - missing @example
- `src/blockchain/CryptoWalletAddress.ts:182` `CryptoWalletAddress` (const) - missing @example
- `src/blockchain/CryptoWalletAddress.ts:197` `CryptoWalletAddress` (type) - missing @example
- `src/blockchain/CryptoWalletAddress.ts:205` `CryptoWalletAddressRedacted` (const) - missing @example
- `src/blockchain/CryptoWalletAddress.ts:224` `CryptoWalletAddressRedacted` (type) - missing @example
- `src/blockchain/EthAmount.ts:48` `EthAmount` (const) - missing @example
- `src/blockchain/EthAmount.ts:66` `EthAmount` (type) - missing @example
- `src/blockchain/EthereumValidatorPublicKey.ts:41` `EthereumValidatorPublicKey` (const) - missing @example
- `src/blockchain/EthereumValidatorPublicKey.ts:56` `EthereumValidatorPublicKey` (type) - missing @example
- `src/blockchain/EthereumValidatorPublicKey.ts:64` `EthereumValidatorPublicKeyRedacted` (const) - missing @example
- `src/blockchain/EthereumValidatorPublicKey.ts:82` `EthereumValidatorPublicKeyRedacted` (type) - missing @example
- `src/blockchain/EvmAddress.ts:78` `EvmAddress` (const) - missing @example
- `src/blockchain/EvmAddress.ts:93` `EvmAddress` (type) - missing @example
- `src/blockchain/EvmAddress.ts:101` `EvmAddressRedacted` (const) - missing @example
- `src/blockchain/EvmAddress.ts:119` `EvmAddressRedacted` (type) - missing @example
- `src/blockchain/index.ts:11` `export * from "./CryptoTxnHash.ts";` (re-export) - missing @example, @category
- `src/blockchain/index.ts:15` `export * from "./CryptoWalletAddress.ts";` (re-export) - missing @example, @category
- `src/blockchain/index.ts:19` `export * from "./EthAmount.ts";` (re-export) - missing @example, @category
- `src/blockchain/index.ts:23` `export * from "./EthereumValidatorPublicKey.ts";` (re-export) - missing @example, @category
- `src/blockchain/index.ts:27` `export * from "./EvmAddress.ts";` (re-export) - missing @example, @category
- `src/color/Color.ts:387` `HexColorInput` (const) - missing @example
- `src/color/Color.ts:401` `HexColorInput` (type) - missing @example
- `src/color/Color.ts:409` `HexColor` (const) - missing @example
- `src/color/Color.ts:424` `HexColor` (type) - missing @example
- `src/color/Color.ts:432` `NormalizeHexColor` (const) - missing @example
- `src/color/Color.ts:453` `NormalizeHexColor` (type) - missing @example
- `src/color/Color.ts:461` `RgbInputChannel` (const) - missing @example
- `src/color/Color.ts:476` `RgbInputChannel` (type) - missing @example
- `src/color/Color.ts:484` `RgbChannel` (const) - missing @example
- `src/color/Color.ts:500` `RgbChannel` (type) - missing @example
- `src/color/Color.ts:508` `RgbInput` (class) - missing @example
- `src/color/Color.ts:525` `Rgb` (class) - missing @example
- `src/color/Color.ts:542` `OklchCoordinate` (const) - missing @example
- `src/color/Color.ts:557` `OklchCoordinate` (type) - missing @example
- `src/color/Color.ts:565` `OklchLightness` (const) - missing @example
- `src/color/Color.ts:581` `OklchLightness` (type) - missing @example
- `src/color/Color.ts:589` `OklchChroma` (const) - missing @example
- `src/color/Color.ts:605` `OklchChroma` (type) - missing @example
- `src/color/Color.ts:613` `OklchHue` (const) - missing @example
- `src/color/Color.ts:629` `OklchHue` (type) - missing @example
- `src/color/Color.ts:637` `OklchInput` (class) - missing @example
- `src/color/Color.ts:654` `OklchColor` (class) - missing @example
- `src/color/Color.ts:671` `HexColorScale12` (const) - missing @example
- `src/color/Color.ts:688` `HexColorScale12` (type) - missing @example
- `src/color/Color.ts:696` `RgbaColorString` (const) - missing @example
- `src/color/Color.ts:711` `RgbaColorString` (type) - missing @example
- `src/color/Color.ts:719` `HexToRgb` (const) - missing @example
- `src/color/Color.ts:740` `HexToRgb` (type) - missing @example
- `src/color/Color.ts:748` `RgbToHex` (const) - missing @example
- `src/color/Color.ts:766` `RgbToHex` (type) - missing @example
- `src/color/Color.ts:774` `RgbToOklch` (const) - missing @example
- `src/color/Color.ts:792` `RgbToOklch` (type) - missing @example
- `src/color/Color.ts:800` `OklchToRgb` (const) - missing @example
- `src/color/Color.ts:818` `OklchToRgb` (type) - missing @example
- `src/color/Color.ts:826` `HexToOklch` (const) - missing @example
- `src/color/Color.ts:847` `HexToOklch` (type) - missing @example
- `src/color/Color.ts:855` `OklchToHex` (const) - missing @example
- `src/color/Color.ts:873` `OklchToHex` (type) - missing @example
- `src/color/Color.ts:881` `ColorAmount` (const) - missing @example
- `src/color/Color.ts:896` `ColorAmount` (type) - missing @example
- `src/color/Color.ts:914` `GenerateScaleInput` (class) - missing @example
- `src/color/Color.ts:930` `GenerateScale` (const) - missing @example
- `src/color/Color.ts:950` `GenerateScale` (type) - missing @example
- `src/color/Color.ts:958` `GenerateNeutralScaleInput` (class) - missing @example
- `src/color/Color.ts:974` `GenerateNeutralScale` (const) - missing @example
- `src/color/Color.ts:994` `GenerateNeutralScale` (type) - missing @example
- `src/color/Color.ts:1002` `GenerateAlphaScaleInput` (class) - missing @example
- `src/color/Color.ts:1018` `GenerateAlphaScale` (const) - missing @example
- `src/color/Color.ts:1038` `GenerateAlphaScale` (type) - missing @example
- `src/color/Color.ts:1046` `MixColorsInput` (class) - missing @example
- `src/color/Color.ts:1063` `MixColors` (const) - missing @example
- `src/color/Color.ts:1081` `MixColors` (type) - missing @example
- `src/color/Color.ts:1089` `LightenInput` (class) - missing @example
- `src/color/Color.ts:1105` `Lighten` (const) - missing @example
- `src/color/Color.ts:1123` `Lighten` (type) - missing @example
- `src/color/Color.ts:1131` `DarkenInput` (class) - missing @example
- `src/color/Color.ts:1147` `Darken` (const) - missing @example
- `src/color/Color.ts:1165` `Darken` (type) - missing @example
- `src/color/Color.ts:1173` `WithAlphaInput` (class) - missing @example
- `src/color/Color.ts:1189` `WithAlpha` (const) - missing @example
- `src/color/Color.ts:1207` `WithAlpha` (type) - missing @example
- `src/color/index.ts:7` `export * from "./Color.ts";` (re-export) - missing @example
- `src/csv.ts:13` `export * from "./csv/index.ts";` (re-export) - missing @example
- `src/csv/CsvCodecOptions.ts:38` `CsvCodecOptions` (class) - missing @example
- `src/csv/CsvCodecOptions.ts:105` `CsvCodecOptionsArgs` (type) - missing @example
- `src/csv/CsvCodecOptions.ts:113` `CsvCodecOptionsParseOptions` (const) - missing @example
- `src/csv/CsvError.ts:34` `CsvError` (class) - missing @example
- `src/csv/CsvError.ts:42` `csvError` (const) - missing @example
- `src/csv/format/CsvFormatter.ts:102` `formatCsvHeaderRow` (const) - missing @example
- `src/csv/format/CsvFormatter.ts:128` `formatCsvDataRow` (const) - missing @example
- `src/csv/format/CsvFormatter.ts:156` `formatCsvDocument` (const) - missing @example
- `src/csv/format/index.ts:14` `export * from "./CsvFormatter.ts";` (re-export) - missing @example
- `src/csv/index.ts:303` `export * from "./CsvCodecOptions.ts";` (re-export) - missing @example, @category
- `src/csv/index.ts:307` `export * from "./CsvError.ts";` (re-export) - missing @example, @category
- `src/csv/index.ts:311` `export * from "./format/index.ts";` (re-export) - missing @example, @category
- `src/csv/index.ts:315` `export * from "./parse/index.ts";` (re-export) - missing @example, @category
- `src/csv/index.ts:271` `CSV` (const) - resolved
- `src/csv/index.ts:298` `CsvText` (type) - missing @example
- `src/csv/parse/CsvParser.ts:97` `ParsedField` (class) - missing summary; missing @example, @category
- `src/csv/parse/CsvParser.ts:241` `ParsedRow` (class) - missing summary; missing @example, @category
- `src/csv/parse/CsvParser.ts:379` `parseCsvRows` (const) - missing @example
- `src/csv/parse/ParserOptions.ts:60` `HeaderValueInput` (const) - missing @example
- `src/csv/parse/ParserOptions.ts:72` `HeaderValueInput` (type) - missing @example
- `src/csv/parse/ParserOptions.ts:80` `ParserOptionsError` (class) - missing @example
- `src/csv/parse/ParserOptions.ts:107` `ParserOptions` (class) - missing @example
- `src/csv/parse/ParserOptions.ts:226` `ParserOptionsArgs` (type) - missing @example
- `src/csv/parse/index.ts:11` `export * from "./CsvParser.ts";` (re-export) - missing @example, @category
- `src/csv/parse/index.ts:15` `export * from "./ParserOptions.ts";` (re-export) - missing @example, @category
- `src/csv/parse/index.ts:19` `export * from "./types.ts";` (re-export) - missing @example, @category
- `src/csv/parse/types.ts:20` `HeaderArray` (const) - missing @example
- `src/csv/parse/types.ts:35` `HeaderArray` (type) - missing @example
- `src/csv/parse/types.ts:44` `HeaderTransformFunction` (const) - missing @example
- `src/csv/parse/types.ts:59` `HeaderTransformFunction` (type) - missing @example
- `src/dom/elements.ts:22` `isHTMLElement` (const) - missing @example
- `src/dom/elements.ts:30` `DOMHtmlElement` (const) - missing @example
- `src/dom/elements.ts:42` `DOMHtmlElement` (type) - missing @example
- `src/dom/elements.ts:52` `isCSSProperties` (const) - missing @example
- `src/dom/elements.ts:67` `DOMCssProperties` (const) - missing @example
- `src/dom/elements.ts:81` `isReactNode` (const) - missing @example
- `src/dom/elements.ts:119` `DOMReactNode` (const) - missing @example
- `src/dom/elements.ts:131` `DOMReactNode` (type) - missing @example
- `src/dom/elements.ts:141` `isReactRef` (const) - missing @example
- `src/dom/elements.ts:175` `createDOMRefSchema` (const) - missing @example
- `src/dom/elements.ts:191` `isDragEvent` (const) - missing @example
- `src/dom/elements.ts:199` `DOMDragEvent` (const) - missing @example
- `src/dom/elements.ts:211` `DOMDragEvent` (type) - missing @example
- `src/dom/events.ts:20` `isEvent` (const) - missing @example
- `src/dom/events.ts:30` `isMouseEvent` (const) - missing @example
- `src/dom/events.ts:38` `DOMEvent` (const) - missing @example
- `src/dom/events.ts:50` `DOMEvent` (type) - missing @example
- `src/dom/events.ts:58` `DOMMouseEvent` (const) - missing @example
- `src/dom/events.ts:70` `DOMMouseEvent` (type) - missing @example
- `src/dom/index.ts:14` `export * from "./elements.ts";` (re-export) - missing @example
- `src/dom/index.ts:21` `export * from "./events.ts";` (re-export) - missing @example
- `src/http/HttpMethod/HttpMethod.ts:18` `HttpMethod_` (const) - missing summary; missing @example, @category; 2 schema annotation/type-alias gap(s)
- `src/http/HttpMethod/HttpMethod.ts:47` `HttpMethod` (const) - missing summary; missing @example, @category
- `src/http/HttpMethod/HttpMethod.ts:76` `HttpMethod` (type) - missing summary; missing @example, @category
- `src/http/HttpMethod/index.ts:12` `export * from "./HttpMethod.ts";` (re-export) - missing @example
- `src/http/HttpProtocol.ts:18` `HttpProtocol` (const) - missing @example
- `src/http/HttpProtocol.ts:30` `HttpProtocol` (type) - missing @example
- `src/http/HttpStatus.ts:37` `HttpStatusCategory` (const) - missing @example
- `src/http/HttpStatus.ts:65` `HttpStatusCategory` (type) - missing @example
- `src/http/HttpStatus.ts:78` `Continue` (const) - missing @example
- `src/http/HttpStatus.ts:92` `Continue` (type) - missing @example
- `src/http/HttpStatus.ts:101` `SwitchingProtocols` (const) - missing @example
- `src/http/HttpStatus.ts:115` `SwitchingProtocols` (type) - missing @example
- `src/http/HttpStatus.ts:125` `Processing` (const) - missing @example
- `src/http/HttpStatus.ts:139` `Processing` (type) - missing @example
- `src/http/HttpStatus.ts:148` `EarlyHints` (const) - missing @example
- `src/http/HttpStatus.ts:162` `EarlyHints` (type) - missing @example
- `src/http/HttpStatus.ts:172` `HttpStatus1XX` (const) - missing @example
- `src/http/HttpStatus.ts:190` `HttpStatus1XX` (namespace) - missing @example
- `src/http/HttpStatus.ts:206` `HttpStatus1XX` (type) - missing @example
- `src/http/HttpStatus.ts:218` `Ok` (const) - missing @example
- `src/http/HttpStatus.ts:232` `Ok` (type) - missing @example
- `src/http/HttpStatus.ts:240` `Created` (const) - missing @example
- `src/http/HttpStatus.ts:253` `Created` (type) - missing @example
- `src/http/HttpStatus.ts:263` `Accepted` (const) - missing @example
- `src/http/HttpStatus.ts:277` `Accepted` (type) - missing @example
- `src/http/HttpStatus.ts:288` `NonAuthoritativeInformation` (const) - missing @example
- `src/http/HttpStatus.ts:302` `NonAuthoritativeInformation` (type) - missing @example
- `src/http/HttpStatus.ts:311` `NoContent` (const) - missing @example
- `src/http/HttpStatus.ts:324` `NoContent` (type) - missing @example
- `src/http/HttpStatus.ts:333` `ResetContent` (const) - missing @example
- `src/http/HttpStatus.ts:347` `ResetContent` (type) - missing @example
- `src/http/HttpStatus.ts:358` `PartialContent` (const) - missing @example
- `src/http/HttpStatus.ts:372` `PartialContent` (type) - missing @example
- `src/http/HttpStatus.ts:382` `MultiStatus` (const) - missing @example
- `src/http/HttpStatus.ts:396` `MultiStatus` (type) - missing @example
- `src/http/HttpStatus.ts:406` `AlreadyReported` (const) - missing @example
- `src/http/HttpStatus.ts:420` `AlreadyReported` (type) - missing @example
- `src/http/HttpStatus.ts:430` `ImUsed` (const) - missing @example
- `src/http/HttpStatus.ts:444` `ImUsed` (type) - missing @example
- `src/http/HttpStatus.ts:453` `HttpStatus2XX` (const) - missing @example
- `src/http/HttpStatus.ts:477` `HttpStatus2XX` (namespace) - missing @example
- `src/http/HttpStatus.ts:493` `HttpStatus2XX` (type) - missing @example
- `src/http/HttpStatus.ts:508` `MultipleChoices` (const) - missing @example
- `src/http/HttpStatus.ts:526` `MultipleChoices` (type) - missing @example
- `src/http/HttpStatus.ts:535` `MovedPermanently` (const) - missing @example
- `src/http/HttpStatus.ts:549` `MovedPermanently` (type) - missing @example
- `src/http/HttpStatus.ts:561` `Found` (const) - missing @example
- `src/http/HttpStatus.ts:575` `Found` (type) - missing @example
- `src/http/HttpStatus.ts:584` `SeeOther` (const) - missing @example
- `src/http/HttpStatus.ts:598` `SeeOther` (type) - missing @example
- `src/http/HttpStatus.ts:609` `NotModified` (const) - missing @example
- `src/http/HttpStatus.ts:623` `NotModified` (type) - missing @example
- `src/http/HttpStatus.ts:632` `UseProxy` (const) - missing @example
- `src/http/HttpStatus.ts:646` `UseProxy` (type) - missing @example
- `src/http/HttpStatus.ts:655` `SwitchProxy` (const) - missing @example
- `src/http/HttpStatus.ts:669` `SwitchProxy` (type) - missing @example
- `src/http/HttpStatus.ts:681` `TemporaryRedirect` (const) - missing @example
- `src/http/HttpStatus.ts:695` `TemporaryRedirect` (type) - missing @example
- `src/http/HttpStatus.ts:706` `PermanentRedirect` (const) - missing @example
- `src/http/HttpStatus.ts:720` `PermanentRedirect` (type) - missing @example
- `src/http/HttpStatus.ts:731` `HttpStatus3XX` (const) - missing @example
- `src/http/HttpStatus.ts:754` `HttpStatus3XX` (type) - missing @example
- `src/http/HttpStatus.ts:762` `HttpStatus3XX` (namespace) - missing @example
- `src/http/HttpStatus.ts:784` `BadRequest` (const) - missing @example
- `src/http/HttpStatus.ts:798` `BadRequest` (type) - missing @example
- `src/http/HttpStatus.ts:812` `Unauthorized` (const) - missing @example
- `src/http/HttpStatus.ts:833` `Unauthorized` (type) - missing @example
- `src/http/HttpStatus.ts:843` `PaymentRequired` (const) - missing @example
- `src/http/HttpStatus.ts:857` `PaymentRequired` (type) - missing @example
- `src/http/HttpStatus.ts:872` `Forbidden` (const) - missing @example
- `src/http/HttpStatus.ts:886` `Forbidden` (type) - missing @example
- `src/http/HttpStatus.ts:898` `NotFound` (const) - missing @example
- `src/http/HttpStatus.ts:912` `NotFound` (type) - missing @example
- `src/http/HttpStatus.ts:921` `MethodNotAllowed` (const) - missing @example
- `src/http/HttpStatus.ts:935` `MethodNotAllowed` (type) - missing @example
- `src/http/HttpStatus.ts:944` `NotAcceptable` (const) - missing @example
- `src/http/HttpStatus.ts:958` `NotAcceptable` (type) - missing @example
- `src/http/HttpStatus.ts:968` `ProxyAuthenticationRequired` (const) - missing @example
- `src/http/HttpStatus.ts:982` `ProxyAuthenticationRequired` (type) - missing @example
- `src/http/HttpStatus.ts:995` `RequestTimeout` (const) - missing @example
- `src/http/HttpStatus.ts:1009` `RequestTimeout` (type) - missing @example
- `src/http/HttpStatus.ts:1020` `Conflict` (const) - missing @example
- `src/http/HttpStatus.ts:1034` `Conflict` (type) - missing @example
- `src/http/HttpStatus.ts:1046` `Gone` (const) - missing @example
- `src/http/HttpStatus.ts:1060` `Gone` (type) - missing @example
- `src/http/HttpStatus.ts:1069` `LengthRequired` (const) - missing @example
- `src/http/HttpStatus.ts:1083` `LengthRequired` (type) - missing @example
- `src/http/HttpStatus.ts:1092` `PreconditionFailed` (const) - missing @example
- `src/http/HttpStatus.ts:1106` `PreconditionFailed` (type) - missing @example
- `src/http/HttpStatus.ts:1119` `PayloadTooLarge` (const) - missing @example
- `src/http/HttpStatus.ts:1133` `PayloadTooLarge` (type) - missing @example
- `src/http/HttpStatus.ts:1143` `UriTooLong` (const) - missing @example
- `src/http/HttpStatus.ts:1157` `UriTooLong` (type) - missing @example
- `src/http/HttpStatus.ts:1167` `UnsupportedMediaType` (const) - missing @example
- `src/http/HttpStatus.ts:1181` `UnsupportedMediaType` (type) - missing @example
- `src/http/HttpStatus.ts:1191` `RangeNotSatisfiable` (const) - missing @example
- `src/http/HttpStatus.ts:1205` `RangeNotSatisfiable` (type) - missing @example
- `src/http/HttpStatus.ts:1214` `ExpectationFailed` (const) - missing @example
- `src/http/HttpStatus.ts:1228` `ExpectationFailed` (type) - missing @example
- `src/http/HttpStatus.ts:1237` `ImATeapot` (const) - missing @example
- `src/http/HttpStatus.ts:1251` `ImATeapot` (type) - missing @example
- `src/http/HttpStatus.ts:1260` `MisdirectedRequest` (const) - missing @example
- `src/http/HttpStatus.ts:1273` `MisdirectedRequest` (type) - missing @example
- `src/http/HttpStatus.ts:1284` `UnprocessableEntity` (const) - missing @example
- `src/http/HttpStatus.ts:1298` `UnprocessableEntity` (type) - missing @example
- `src/http/HttpStatus.ts:1306` `Locked` (const) - missing @example
- `src/http/HttpStatus.ts:1319` `Locked` (type) - missing @example
- `src/http/HttpStatus.ts:1328` `FailedDependency` (const) - missing @example
- `src/http/HttpStatus.ts:1342` `FailedDependency` (type) - missing @example
- `src/http/HttpStatus.ts:1351` `TooEarly` (const) - missing @example
- `src/http/HttpStatus.ts:1365` `TooEarly` (type) - missing @example
- `src/http/HttpStatus.ts:1375` `UpgradeRequired` (const) - missing @example
- `src/http/HttpStatus.ts:1389` `UpgradeRequired` (type) - missing @example
- `src/http/HttpStatus.ts:1401` `PreconditionRequired` (const) - missing @example
- `src/http/HttpStatus.ts:1415` `PreconditionRequired` (type) - missing @example
- `src/http/HttpStatus.ts:1433` `TooManyRequests` (const) - missing @example
- `src/http/HttpStatus.ts:1447` `TooManyRequests` (type) - missing @example
- `src/http/HttpStatus.ts:1457` `RequestHeaderFieldsTooLarge` (const) - missing @example
- `src/http/HttpStatus.ts:1471` `RequestHeaderFieldsTooLarge` (type) - missing @example
- `src/http/HttpStatus.ts:1481` `UnavailableForLegalReasons` (const) - missing @example
- `src/http/HttpStatus.ts:1495` `UnavailableForLegalReasons` (type) - missing @example
- `src/http/HttpStatus.ts:1507` `HttpStatus4XX` (const) - missing @example
- `src/http/HttpStatus.ts:1554` `HttpStatus4XX` (namespace) - missing @example
- `src/http/HttpStatus.ts:1570` `HttpStatus4XX` (type) - missing @example
- `src/http/HttpStatus.ts:1587` `InternalServerError` (const) - missing @example
- `src/http/HttpStatus.ts:1601` `InternalServerError` (type) - missing @example
- `src/http/HttpStatus.ts:1610` `NotImplemented` (const) - missing @example
- `src/http/HttpStatus.ts:1624` `NotImplemented` (type) - missing @example
- `src/http/HttpStatus.ts:1635` `BadGateway` (const) - missing @example
- `src/http/HttpStatus.ts:1649` `BadGateway` (type) - missing @example
- `src/http/HttpStatus.ts:1660` `ServiceUnavailable` (const) - missing @example
- `src/http/HttpStatus.ts:1674` `ServiceUnavailable` (type) - missing @example
- `src/http/HttpStatus.ts:1687` `GatewayTimeout` (const) - missing @example
- `src/http/HttpStatus.ts:1701` `GatewayTimeout` (type) - missing @example
- `src/http/HttpStatus.ts:1710` `HttpVersionNotSupported` (const) - missing @example
- `src/http/HttpStatus.ts:1724` `HttpVersionNotSupported` (type) - missing @example
- `src/http/HttpStatus.ts:1736` `VariantAlsoNegotiates` (const) - missing @example
- `src/http/HttpStatus.ts:1750` `VariantAlsoNegotiates` (type) - missing @example
- `src/http/HttpStatus.ts:1759` `InsufficientStorage` (const) - missing @example
- `src/http/HttpStatus.ts:1773` `InsufficientStorage` (type) - missing @example
- `src/http/HttpStatus.ts:1782` `LoopDetected` (const) - missing @example
- `src/http/HttpStatus.ts:1795` `LoopDetected` (type) - missing @example
- `src/http/HttpStatus.ts:1804` `NotExtended` (const) - missing @example
- `src/http/HttpStatus.ts:1818` `NotExtended` (type) - missing @example
- `src/http/HttpStatus.ts:1829` `NetworkAuthenticationRequired` (const) - missing @example
- `src/http/HttpStatus.ts:1843` `NetworkAuthenticationRequired` (type) - missing @example
- `src/http/HttpStatus.ts:1853` `HttpStatus5XX` (const) - missing @example
- `src/http/HttpStatus.ts:1878` `HttpStatus5XX` (namespace) - missing @example
- `src/http/HttpStatus.ts:1894` `HttpStatus5XX` (type) - missing @example
- `src/http/HttpStatus.ts:1908` `RequestHeaderFieldsTooLargeShopify` (const) - missing @example
- `src/http/HttpStatus.ts:1922` `RequestHeaderFieldsTooLargeShopify` (type) - missing @example
- `src/http/HttpStatus.ts:1932` `LoginTimeout` (const) - missing @example
- `src/http/HttpStatus.ts:1946` `LoginTimeout` (type) - missing @example
- `src/http/HttpStatus.ts:1955` `RequestHeaderTooLarge` (const) - missing @example
- `src/http/HttpStatus.ts:1969` `RequestHeaderTooLarge` (type) - missing @example
- `src/http/HttpStatus.ts:1978` `SslCertificateError` (const) - missing @example
- `src/http/HttpStatus.ts:1992` `SslCertificateError` (type) - missing @example
- `src/http/HttpStatus.ts:2001` `SslCertificateRequired` (const) - missing @example
- `src/http/HttpStatus.ts:2015` `SslCertificateRequired` (type) - missing @example
- `src/http/HttpStatus.ts:2024` `ClientClosedRequest` (const) - missing @example
- `src/http/HttpStatus.ts:2038` `ClientClosedRequest` (type) - missing @example
- `src/http/HttpStatus.ts:2048` `WebServerReturnedAnUnknownError` (const) - missing @example
- `src/http/HttpStatus.ts:2062` `WebServerReturnedAnUnknownError` (type) - missing @example
- `src/http/HttpStatus.ts:2072` `WebServerIsDown` (const) - missing @example
- `src/http/HttpStatus.ts:2086` `WebServerIsDown` (type) - missing @example
- `src/http/HttpStatus.ts:2095` `SslHandshakeFailed` (const) - missing @example
- `src/http/HttpStatus.ts:2109` `SslHandshakeFailed` (type) - missing @example
- `src/http/HttpStatus.ts:2120` `InvalidSslCertificate` (const) - missing @example
- `src/http/HttpStatus.ts:2134` `InvalidSslCertificate` (type) - missing @example
- `src/http/HttpStatus.ts:2145` `HttpStatusUnofficial` (const) - missing @example
- `src/http/HttpStatus.ts:2169` `HttpStatusUnofficial` (namespace) - missing @example
- `src/http/HttpStatus.ts:2185` `HttpStatusUnofficial` (type) - missing @example
- `src/http/HttpStatus.ts:2197` `HttpStatus` (const) - missing @example
- `src/http/HttpStatus.ts:2216` `HttpStatus` (namespace) - missing @example
- `src/http/HttpStatus.ts:2232` `HttpStatus` (type) - missing @example
- `src/http/headers/CrossOriginEmbedderPolicy.ts:28` `CoepValue` (const) - missing summary; missing @example, @category
- `src/http/headers/CrossOriginEmbedderPolicy.ts:38` `CoepValue` (type) - missing summary; missing @example, @category
- `src/http/headers/CrossOriginEmbedderPolicy.ts:45` `CrossOriginEmbedderPolicyOption` (const) - missing summary; missing @example, @category
- `src/http/headers/CrossOriginEmbedderPolicy.ts:55` `CrossOriginEmbedderPolicyOption` (type) - missing summary; missing @example, @category
- `src/http/headers/CrossOriginEmbedderPolicy.ts:61` `COEPResponseHeader` (class) - missing @example, @category
- `src/http/headers/CrossOriginEmbedderPolicy.ts:82` `CrossOriginEmbedderPolicyHeader` (const) - missing @example, @category
- `src/http/headers/CrossOriginEmbedderPolicy.ts:158` `CrossOriginEmbedderPolicyHeader` (type) - missing summary; missing @example, @category
- `src/http/headers/CrossOriginOpenerPolicy.ts:51` `CoopValue` (type) - missing @example
- `src/http/headers/CrossOriginOpenerPolicy.ts:83` `CrossOriginOpenerPolicyOption` (type) - missing @example
- `src/http/headers/CrossOriginOpenerPolicy.ts:103` `CrossOriginOpenerPolicyResponseHeader` (class) - 1 example import violation(s)
- `src/http/headers/CrossOriginOpenerPolicy.ts:192` `CrossOriginOpenerPolicyHeader` (type) - missing @example
- `src/http/headers/CrossOriginResourcePolicy.ts:26` `CorpValue` (const) - missing summary; missing @example, @category
- `src/http/headers/CrossOriginResourcePolicy.ts:36` `CorpValue` (type) - missing summary; missing @example, @category
- `src/http/headers/CrossOriginResourcePolicy.ts:43` `CrossOriginResourcePolicyOption` (const) - missing summary; missing @example, @category
- `src/http/headers/CrossOriginResourcePolicy.ts:53` `CrossOriginResourcePolicyOption` (type) - missing summary; missing @example, @category
- `src/http/headers/CrossOriginResourcePolicy.ts:58` `CrossOriginResourcePolicyResponseHeader` (class) - missing summary; missing @example, @category
- `src/http/headers/CrossOriginResourcePolicy.ts:75` `CrossOriginResourcePolicyHeader` (const) - missing summary; missing @example, @category
- `src/http/headers/CrossOriginResourcePolicy.ts:132` `CrossOriginResourcePolicyHeader` (type) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:26` `DirectiveSource` (const) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:35` `DirectiveSource` (type) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:46` `ContentSecurityPolicyHeaderName` (const) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:56` `ContentSecurityPolicyHeaderName` (type) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:114` `createDirectiveValue` (const) - missing @example
- `src/http/headers/Csp.ts:141` `PluginTypes` (const) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:150` `PluginTypes` (type) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:172` `Sandbox` (const) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:182` `Sandbox` (type) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:224` `FetchDirective` (class) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:292` `DocumentDirective` (class) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:335` `NavigationDirective` (class) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:378` `ReportURI` (const) - missing summary; missing @example, @category; 1 schema annotation/type-alias gap(s)
- `src/http/headers/Csp.ts:387` `ReportingDirective` (class) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:422` `CspDirectives` (const) - missing summary; missing @example, @category; 1 schema annotation/type-alias gap(s)
- `src/http/headers/Csp.ts:436` `ContentSecurityPolicyOptionStruct` (class) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:467` `ContentSecurityPolicyOption` (const) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:476` `ContentSecurityPolicyOption` (type) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:481` `ContentSecurityPolicyResponseHeader` (class) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:539` `createContentSecurityPolicyOptionHeaderValue` (const) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:564` `ContentSecurityPolicyHeader` (const) - missing summary; missing @example, @category
- `src/http/headers/Csp.ts:631` `ContentSecurityPolicyHeader` (type) - missing summary; missing @example, @category
- `src/http/headers/ExpectCT.ts:25` `ExpectCTConfig` (class) - missing summary; missing @example, @category
- `src/http/headers/ExpectCT.ts:39` `ExpectCTEnabled` (const) - missing summary; missing @example, @category
- `src/http/headers/ExpectCT.ts:48` `ExpectCTEnabled` (type) - missing summary; missing @example, @category
- `src/http/headers/ExpectCT.ts:53` `ExpectCTOption` (const) - missing summary; missing @example, @category
- `src/http/headers/ExpectCT.ts:62` `ExpectCTOption` (type) - missing summary; missing @example, @category
- `src/http/headers/ExpectCT.ts:67` `ExpectCTResponseHeader` (class) - missing summary; missing @example, @category
- `src/http/headers/ExpectCT.ts:142` `ExpectCTHeader` (const) - missing summary; missing @example, @category
- `src/http/headers/ExpectCT.ts:199` `ExpectCTHeader` (type) - missing summary; missing @example, @category
- `src/http/headers/ForceHttpsRedirect.ts:25` `ForceHttpsRedirectConfig` (class) - missing summary; missing @example, @category
- `src/http/headers/ForceHttpsRedirect.ts:39` `ForceHttpsRedirectEnabled` (const) - missing summary; missing @example, @category
- `src/http/headers/ForceHttpsRedirect.ts:48` `ForceHttpsRedirectEnabled` (type) - missing summary; missing @example, @category
- `src/http/headers/ForceHttpsRedirect.ts:53` `ForceHttpsRedirectOption` (const) - missing summary; missing @example, @category
- `src/http/headers/ForceHttpsRedirect.ts:62` `ForceHttpsRedirectOption` (type) - missing summary; missing @example, @category
- `src/http/headers/ForceHttpsRedirect.ts:67` `ForceHttpsRedirectResponseHeader` (class) - missing summary; missing @example, @category
- `src/http/headers/ForceHttpsRedirect.ts:95` `ForceHttpsRedirectHeader` (const) - missing summary; missing @example, @category
- `src/http/headers/ForceHttpsRedirect.ts:164` `ForceHttpsRedirectHeader` (type) - missing summary; missing @example, @category
- `src/http/headers/FrameGuard.ts:28` `FrameGuardMode` (const) - missing summary; missing @example, @category
- `src/http/headers/FrameGuard.ts:38` `FrameGuardMode` (type) - missing summary; missing @example, @category
- `src/http/headers/FrameGuard.ts:43` `FrameGuardAllowFromConfig` (class) - missing summary; missing @example, @category
- `src/http/headers/FrameGuard.ts:55` `FrameGuardAllowFrom` (const) - missing summary; missing @example, @category
- `src/http/headers/FrameGuard.ts:64` `FrameGuardAllowFrom` (type) - missing summary; missing @example, @category
- `src/http/headers/FrameGuard.ts:69` `FrameGuardOption` (const) - missing summary; missing @example, @category
- `src/http/headers/FrameGuard.ts:78` `FrameGuardOption` (type) - missing summary; missing @example, @category
- `src/http/headers/FrameGuard.ts:83` `FrameGuardResponseHeader` (class) - missing summary; missing @example, @category
- `src/http/headers/FrameGuard.ts:126` `FrameGuardHeader` (const) - missing summary; missing @example, @category
- `src/http/headers/FrameGuard.ts:197` `FrameGuardHeader` (type) - missing summary; missing @example, @category
- `src/http/headers/NoOpen.ts:27` `NoOpenValue` (const) - missing summary; missing @example, @category
- `src/http/headers/NoOpen.ts:37` `NoOpenValue` (type) - missing summary; missing @example, @category
- `src/http/headers/NoOpen.ts:44` `NoOpenOption` (const) - missing summary; missing @example, @category
- `src/http/headers/NoOpen.ts:54` `NoOpenOption` (type) - missing summary; missing @example, @category
- `src/http/headers/NoOpen.ts:59` `NoOpenResponseHeader` (class) - missing summary; missing @example, @category
- `src/http/headers/NoOpen.ts:74` `NoOpenHeader` (const) - missing summary; missing @example, @category
- `src/http/headers/NoOpen.ts:132` `NoOpenHeader` (type) - missing summary; missing @example, @category
- `src/http/headers/NoSniff.ts:52` `NoSniffValue` (type) - missing @example
- `src/http/headers/NoSniff.ts:84` `NoSniffOption` (type) - missing @example
- `src/http/headers/NoSniff.ts:101` `NoSniffResponseHeader` (class) - 1 example import violation(s)
- `src/http/headers/NoSniff.ts:189` `NoSniffHeader` (type) - missing @example
- `src/http/headers/PermissionsPolicy.ts:57` `PermissionsPolicyDirective` (const) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:67` `PermissionsPolicyDirective` (type) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:72` `PermissionsPolicyDirectiveKey` (const) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:88` `PermissionsPolicyDirectiveKey` (type) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:93` `QuotedOrigin` (const) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:108` `QuotedOrigin` (type) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:115` `PermissionsPolicyDirectiveValueSingle` (const) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:125` `PermissionsPolicyDirectiveValueSingle` (type) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:130` `PermissionsPolicyAllowlistedOrigin` (const) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:139` `PermissionsPolicyAllowlistedOrigin` (type) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:144` `PermissionsPolicyDirectiveValue` (const) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:157` `PermissionsPolicyDirectiveValue` (type) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:162` `PermissionsPolicyDirectives` (const) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:174` `PermissionsPolicyDirectives` (type) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:179` `PermissionsPolicyOptionStruct` (class) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:193` `PermissionsPolicyOption` (const) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:202` `PermissionsPolicyOption` (type) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:207` `PermissionsPolicyResponseHeader` (class) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:254` `PermissionsPolicyHeader` (const) - missing summary; missing @example, @category
- `src/http/headers/PermissionsPolicy.ts:315` `PermissionsPolicyHeader` (type) - missing summary; missing @example, @category
- `src/http/headers/PermittedCrossDomainPolicies.ts:33` `PermittedCrossDomainPoliciesValue` (const) - missing summary; missing @example, @category
- `src/http/headers/PermittedCrossDomainPolicies.ts:43` `PermittedCrossDomainPoliciesValue` (type) - missing summary; missing @example, @category
- `src/http/headers/PermittedCrossDomainPolicies.ts:50` `PermittedCrossDomainPoliciesOption` (const) - missing summary; missing @example, @category
- `src/http/headers/PermittedCrossDomainPolicies.ts:60` `PermittedCrossDomainPoliciesOption` (type) - missing summary; missing @example, @category
- `src/http/headers/PermittedCrossDomainPolicies.ts:65` `PermittedCrossDomainPoliciesResponseHeader` (class) - missing summary; missing @example, @category
- `src/http/headers/PermittedCrossDomainPolicies.ts:82` `PermittedCrossDomainPoliciesHeader` (const) - missing summary; missing @example, @category
- `src/http/headers/PermittedCrossDomainPolicies.ts:143` `PermittedCrossDomainPoliciesHeader` (type) - missing summary; missing @example, @category
- `src/http/headers/ReferrerPolicy.ts:35` `ReferrerPolicyValue` (const) - missing summary; missing @example, @category
- `src/http/headers/ReferrerPolicy.ts:45` `ReferrerPolicyValue` (type) - missing summary; missing @example, @category
- `src/http/headers/ReferrerPolicy.ts:50` `ReferrerPolicyValueList` (const) - missing summary; missing @example, @category
- `src/http/headers/ReferrerPolicy.ts:59` `ReferrerPolicyValueList` (type) - missing summary; missing @example, @category
- `src/http/headers/ReferrerPolicy.ts:64` `ReferrerPolicyOption` (const) - missing summary; missing @example, @category
- `src/http/headers/ReferrerPolicy.ts:73` `ReferrerPolicyOption` (type) - missing summary; missing @example, @category
- `src/http/headers/ReferrerPolicy.ts:78` `ReferrerPolicyResponseHeader` (class) - missing summary; missing @example, @category
- `src/http/headers/ReferrerPolicy.ts:118` `ReferrerPolicyHeader` (const) - missing summary; missing @example, @category
- `src/http/headers/ReferrerPolicy.ts:181` `ReferrerPolicyHeader` (type) - missing summary; missing @example, @category
- `src/http/headers/SecureHeader.ts:32` `SecureHeader` (const) - missing summary; missing @example, @category
- `src/http/headers/SecureHeader.ts:42` `SecureHeader` (type) - missing summary; missing @example, @category
- `src/http/headers/SecureHeaderError.ts:108` `CspError` (class) - missing summary; missing @example, @category
- `src/http/headers/SecureHeaderError.ts:113` `ForceHttpsRedirectError` (class) - missing summary; missing @example, @category
- `src/http/headers/SecureHeaderError.ts:118` `XssProtectionError` (class) - missing summary; missing @example, @category
- `src/http/headers/SecureHeaderError.ts:123` `ReferrerPolicyError` (class) - missing summary; missing @example, @category
- `src/http/headers/SecureHeaderError.ts:128` `NoSniffError` (class) - missing summary; missing @example, @category
- `src/http/headers/SecureHeaderError.ts:133` `NoOpenError` (class) - missing summary; missing @example, @category
- `src/http/headers/SecureHeaderError.ts:138` `FrameGuardError` (class) - missing summary; missing @example, @category
- `src/http/headers/SecureHeaderError.ts:143` `ExpectCtError` (class) - missing summary; missing @example, @category
- `src/http/headers/SecureHeaderError.ts:148` `PermissionsPolicyError` (class) - missing summary; missing @example, @category
- `src/http/headers/SecureHeaderError.ts:153` `CrossOriginOpenerPolicyError` (class) - missing summary; missing @example, @category
- `src/http/headers/SecureHeaderError.ts:158` `CrossOriginEmbedderPolicyError` (class) - missing summary; missing @example, @category
- `src/http/headers/SecureHeaderError.ts:163` `CrossOriginResourcePolicyError` (class) - missing summary; missing @example, @category
- `src/http/headers/SecureHeaderError.ts:168` `PermittedCrossDomainPoliciesError` (class) - missing summary; missing @example, @category
- `src/http/headers/SecureHeaderError.ts:173` `CoreError` (class) - missing summary; missing @example, @category
- `src/http/headers/SecureHeaderError.ts:178` `SecureHeaderError` (const) - missing summary; missing @example, @category
- `src/http/headers/SecureHeaderError.ts:205` `SecureHeaderError` (type) - missing summary; missing @example, @category
- `src/http/headers/XSSProtection.ts:27` `XSSProtectionMode` (const) - missing summary; missing @example, @category
- `src/http/headers/XSSProtection.ts:37` `XSSProtectionMode` (type) - missing summary; missing @example, @category
- `src/http/headers/XSSProtection.ts:42` `XSSProtectionReportConfig` (class) - missing summary; missing @example, @category
- `src/http/headers/XSSProtection.ts:54` `XSSProtectionReport` (const) - missing summary; missing @example, @category
- `src/http/headers/XSSProtection.ts:63` `XSSProtectionReport` (type) - missing summary; missing @example, @category
- `src/http/headers/XSSProtection.ts:68` `XSSProtectionOption` (const) - missing summary; missing @example, @category
- `src/http/headers/XSSProtection.ts:77` `XSSProtectionOption` (type) - missing summary; missing @example, @category
- `src/http/headers/XSSProtection.ts:82` `XSSProtectionResponseHeader` (class) - missing summary; missing @example, @category
- `src/http/headers/XSSProtection.ts:133` `XSSProtectionHeader` (const) - missing summary; missing @example, @category
- `src/http/headers/XSSProtection.ts:183` `XSSProtectionHeader` (type) - missing summary; missing @example, @category
- `src/http/headers/_internal/helpers.ts:21` `ArrayOfStrOrStr` (const) - missing summary; missing @example, @category
- `src/http/headers/_internal/helpers.ts:30` `ArrayOfStrOrStr` (type) - missing summary; missing @example, @category
- `src/http/headers/_internal/helpers.ts:35` `StringOrUrl` (const) - missing summary; missing @example, @category
- `src/http/headers/_internal/helpers.ts:44` `StringOrUrl` (type) - missing summary; missing @example, @category
- `src/http/headers/_internal/helpers.ts:49` `EncodedStrictURIFromStrOrURL` (const) - missing summary; missing @example, @category
- `src/http/headers/_internal/helpers.ts:72` `EncodedStrictURIFromStrOrURL` (type) - missing summary; missing @example, @category
- `src/http/headers/_internal/helpers.ts:80` `encodeStrictURI` (const) - missing summary; missing @example, @category
- `src/http/headers/_internal/helpers.ts:86` `encodeStrictURIOption` (const) - missing summary; missing @example, @category
- `src/http/headers/_internal/helpers.ts:91` `wrapArray` (const) - missing summary; missing @example, @category
- `src/http/headers/_internal/helpers.ts:97` `ResponseHeader` (class) - missing summary; missing @example, @category
- `src/http/headers/_internal/helpers.ts:110` `makeHeaderEncodeForbidden` (const) - missing summary; missing @example, @category
- `src/http/headers/_internal/helpers.ts:122` `makeResponseHeader` (const) - missing summary; missing @example, @category
- `src/http/headers/_internal/helpers.ts:137` `makeResponseHeaderOption` (const) - missing summary; missing @example, @category
- `src/http/headers/_internal/index.ts:4` `export * from "./helpers.ts";` (re-export) - missing @example, @category
- `src/http/headers/index.ts:11` `export * from "./CrossOriginEmbedderPolicy.ts";` (re-export) - missing @example, @category
- `src/http/headers/index.ts:15` `export * from "./CrossOriginOpenerPolicy.ts";` (re-export) - missing @example, @category
- `src/http/headers/index.ts:19` `export * from "./CrossOriginResourcePolicy.ts";` (re-export) - missing @example, @category
- `src/http/headers/index.ts:23` `export * from "./Csp.ts";` (re-export) - missing @example, @category
- `src/http/headers/index.ts:27` `export * from "./ExpectCT.ts";` (re-export) - missing @example, @category
- `src/http/headers/index.ts:31` `export * from "./ForceHttpsRedirect.ts";` (re-export) - missing @example, @category
- `src/http/headers/index.ts:35` `export * from "./FrameGuard.ts";` (re-export) - missing @example, @category
- `src/http/headers/index.ts:39` `export * from "./NoOpen.ts";` (re-export) - missing @example, @category
- `src/http/headers/index.ts:43` `export * from "./NoSniff.ts";` (re-export) - missing @example, @category
- `src/http/headers/index.ts:47` `export * from "./PermissionsPolicy.ts";` (re-export) - missing @example, @category
- `src/http/headers/index.ts:51` `export * from "./PermittedCrossDomainPolicies.ts";` (re-export) - missing @example, @category
- `src/http/headers/index.ts:55` `export * from "./ReferrerPolicy.ts";` (re-export) - missing @example, @category
- `src/http/headers/index.ts:59` `export * from "./SecureHeader.ts";` (re-export) - missing @example, @category
- `src/http/headers/index.ts:63` `export * from "./SecureHeaderError.ts";` (re-export) - missing @example, @category
- `src/http/headers/index.ts:67` `export * from "./SecureHeaderOptions.ts";` (re-export) - missing @example, @category
- `src/http/headers/index.ts:71` `export * from "./XSSProtection.ts";` (re-export) - missing @example, @category
- `src/http/index.ts:12` `export * from "./HttpMethod/index.ts";` (re-export) - missing @example
- `src/http/index.ts:17` `export * from "./HttpProtocol.ts";` (re-export) - missing @example
- `src/http/index.ts:22` `export * as HttpStatus from "./HttpStatus.ts";` (re-export) - missing @example
- `src/http/index.ts:27` `export * from "./headers/index.ts";` (re-export) - missing @example
- `src/index.ts:24` `export * from "./LiteralKit.ts";` (re-export) - missing @example
- `src/index.ts:29` `export * from "./MappedLiteralKit.ts";` (re-export) - missing @example
- `src/index.ts:37` `export * from "./ArrayOf.ts";` (re-export) - missing @example
- `src/index.ts:42` `export * from "./CommonTextSchemas.ts";` (re-export) - missing @example
- `src/index.ts:47` `export * from "./color/index.ts";` (re-export) - missing @example
- `src/index.ts:52` `export * from "./csv.ts";` (re-export) - missing @example
- `src/index.ts:57` `export * from "./EffectSchema.ts";` (re-export) - missing @example
- `src/index.ts:62` `export * from "./Email.ts";` (re-export) - missing @example
- `src/index.ts:67` `export * from "./FileExtension.ts";` (re-export) - missing @example
- `src/index.ts:72` `export * from "./FileName.ts";` (re-export) - missing @example
- `src/index.ts:77` `export * from "./FilePath.ts";` (re-export) - missing @example
- `src/index.ts:82` `export * from "./Float16Array.ts";` (re-export) - missing @example
- `src/index.ts:87` `export * from "./Float32Array.ts";` (re-export) - missing @example
- `src/index.ts:92` `export * from "./Float64Array.ts";` (re-export) - missing @example
- `src/index.ts:97` `export * from "./Glob.ts";` (re-export) - missing @example
- `src/index.ts:102` `export * from "./Graph.ts";` (re-export) - missing @example
- `src/index.ts:107` `export * from "./Html.ts";` (re-export) - missing @example
- `src/index.ts:112` `export * from "./Int.ts";` (re-export) - missing @example
- `src/index.ts:117` `export * from "./Jsonc.ts";` (re-export) - missing @example
- `src/index.ts:122` `export * from "./Jsonl.ts";` (re-export) - missing @example
- `src/index.ts:127` `export * from "./Logs.ts";` (re-export) - missing @example
- `src/index.ts:132` `export * from "./Markdown.ts";` (re-export) - missing @example
- `src/index.ts:137` `export * from "./MimeType.ts";` (re-export) - missing @example
- `src/index.ts:142` `export * from "./MutableHashMap.ts";` (re-export) - missing @example
- `src/index.ts:147` `export * from "./MutableHashSet.ts";` (re-export) - missing @example
- `src/index.ts:152` `export * from "./PosixPath.ts";` (re-export) - missing @example
- `src/index.ts:157` `export * from "./PromiseSchema.ts";` (re-export) - missing @example
- `src/index.ts:183` `export * from "./AbortSignal.ts";` (re-export) - missing @example
- `src/index.ts:188` `export * from "./BigDecimal.ts";` (re-export) - missing @example
- `src/index.ts:193` `export * from "./BufferEncoding.ts";` (re-export) - missing @example
- `src/index.ts:198` `export * from "./blockchain/index.ts";` (re-export) - missing @example
- `src/index.ts:203` `export * from "./CauseTaggedError.ts";` (re-export) - missing @example
- `src/index.ts:208` `export * from "./DateTimeUtcFromValid.ts";` (re-export) - missing @example
- `src/index.ts:213` `export * as DomainModel from "./DomainModel.ts";` (re-export) - missing @example
- `src/index.ts:218` `export * from "./Duration.ts";` (re-export) - missing @example
- `src/index.ts:223` `export * from "./dom/index.ts";` (re-export) - missing @example
- `src/index.ts:228` `export * as EntitySchema from "./EntitySchema.ts";` (re-export) - missing @example
- `src/index.ts:233` `export * from "./Fn.ts";` (re-export) - missing @example
- `src/index.ts:238` `export * from "./http/index.ts";` (re-export) - missing @example
- `src/index.ts:243` `export * from "./Json.ts";` (re-export) - missing @example
- `src/index.ts:248` `export * from "./KebabStr.ts";` (re-export) - missing @example
- `src/index.ts:253` `export * from "./LocalDate.ts";` (re-export) - missing @example
- `src/index.ts:258` `export * from "./location/index.ts";` (re-export) - missing @example
- `src/index.ts:263` `export * as Model from "./Model.ts";` (re-export) - missing @example
- `src/index.ts:268` `export * from "./Options.ts";` (re-export) - missing @example
- `src/index.ts:273` `export * from "./PascalStr.ts";` (re-export) - missing @example
- `src/index.ts:278` `export * from "./Primitive.ts";` (re-export) - missing @example
- `src/index.ts:283` `export * from "./person/index.ts";` (re-export) - missing @example
- `src/index.ts:288` `export * from "./RegExp.ts";` (re-export) - missing @example
- `src/index.ts:293` `export * as SchemaUtils from "./SchemaUtils/index.ts";` (re-export) - missing @example
- `src/index.ts:298` `export * from "./SemanticVersion.ts";` (re-export) - missing @example
- `src/index.ts:303` `export * from "./SeverityLevel.ts";` (re-export) - missing @example
- `src/index.ts:308` `export * from "./Sha256.ts";` (re-export) - missing @example
- `src/index.ts:313` `export * from "./Slug.ts";` (re-export) - missing @example
- `src/index.ts:318` `export * from "./SnakeStr.ts";` (re-export) - missing @example
- `src/index.ts:323` `export * from "./StatusCauseError.ts";` (re-export) - missing @example
- `src/index.ts:328` `export * from "./StatusCauseTaggedErrorClass.ts";` (re-export) - missing @example
- `src/index.ts:333` `export * from "./String.ts";` (re-export) - missing @example
- `src/index.ts:338` `export * from "./TaggedErrorClass.ts";` (re-export) - missing @example
- `src/index.ts:343` `export * from "./Timezone.ts";` (re-export) - missing @example
- `src/index.ts:348` `export * from "./Toml.ts";` (re-export) - missing @example
- `src/index.ts:353` `export * from "./Transformations.ts";` (re-export) - missing @example
- `src/index.ts:358` `export * from "./URL.ts";` (re-export) - missing @example
- `src/index.ts:363` `export * as VariantSchema from "./VariantSchema.ts";` (re-export) - missing @example
- `src/index.ts:368` `export * from "./Xml.ts";` (re-export) - missing @example
- `src/index.ts:373` `export * from "./Yaml.ts";` (re-export) - missing @example
- `src/index.ts:18` `VERSION` (const) - missing summary; missing @example
- `src/index.ts:162` `isNegative` (const) - missing summary; missing @example
- `src/index.ts:167` `isNonNegative` (const) - missing summary; missing @example
- `src/index.ts:172` `isNonPositive` (const) - missing summary; missing @example
- `src/index.ts:177` `isPositive` (const) - missing summary; missing @example
- `src/location/CardinalDirection.ts:16` `CardinalDirection` (const) - missing @example
- `src/location/CardinalDirection.ts:27` `CardinalDirection` (type) - missing @example
- `src/location/CardinalDirection.ts:35` `CardinalDirectionAbbrev` (const) - missing @example
- `src/location/CardinalDirection.ts:47` `CardinalDirectionAbbrev` (type) - missing @example
- `src/location/index.ts:12` `export * from "./CardinalDirection.ts";` (re-export) - missing @example
- `src/person/Age.ts:16` `Age` (const) - missing @example
- `src/person/Age.ts:34` `Age` (type) - missing @example
- `src/person/Sex.ts:16` `Sex` (const) - missing @example
- `src/person/Sex.ts:27` `Sex` (type) - missing @example
- `src/person/index.ts:12` `export * from "./Age.ts";` (re-export) - missing @example
- `src/person/index.ts:18` `export * from "./Sex.ts";` (re-export) - missing @example
- `src/sqlite/ast.ts:22` `ColumnTypeTag` (const) - missing @example
- `src/sqlite/ast.ts:34` `ColumnTypeTag` (type) - missing @example
- `src/sqlite/ast.ts:42` `ColumnTypeText` (class) - missing @example
- `src/sqlite/ast.ts:56` `ColumnTypeNull` (class) - missing @example
- `src/sqlite/ast.ts:70` `ColumnTypeReal` (class) - missing @example
- `src/sqlite/ast.ts:84` `ColumnTypeInteger` (class) - missing @example
- `src/sqlite/ast.ts:98` `ColumnTypeBlob` (class) - missing @example
- `src/sqlite/ast.ts:112` `ColumnType` (const) - missing @example
- `src/sqlite/ast.ts:131` `ColumnType` (type) - missing @example
- `src/sqlite/ast.ts:139` `Column` (class) - missing @example
- `src/sqlite/ast.ts:162` `Index` (class) - missing @example
- `src/sqlite/ast.ts:241` `ForeignKey` (class) - missing @example
- `src/sqlite/ast.ts:259` `Table` (class) - missing @example
- `src/sqlite/ast.ts:277` `DbSchema` (class) - missing @example

### @beep/shared-domain

Path: `packages/shared/domain`

Export findings:
- `src/entity/BaseEntity.ts:214` `BaseEntity` (type) - 1 unsafe example violation(s)
- `src/entity/EntityId.ts:69` `EntityIdValue` (type) - 1 unsafe example violation(s)
- `src/entity/EntityId.ts:85` `EntityIdValueFor` (type) - 1 unsafe example violation(s)
- `src/entity/EntityId.ts:240` `Definition` (class) - 1 unsafe example violation(s)
- `src/entity/EntityId.ts:302` `EntityId` (type) - 1 unsafe example violation(s)
- `src/entity/EntityId.ts:348` `Any` (type) - 1 unsafe example violation(s)
- `src/entity/Principal.ts:64` `UserPrincipal` (class) - 1 unsafe example violation(s)
- `src/entity/Principal.ts:88` `ServiceAccountPrincipal` (class) - 1 unsafe example violation(s)
- `src/entity/Principal.ts:113` `AgentPrincipal` (class) - 1 unsafe example violation(s)
- `src/entity/Principal.ts:140` `ConnectorAccountPrincipal` (class) - 1 unsafe example violation(s)

### @beep/repo-utils

Path: `packages/tooling/library/repo-utils`

Module findings:
- `src/Reuse/index.ts:1` (jsdoc) - 1 category casing violation(s)
- `src/TSMorph/index.ts:1` (jsdoc) - 1 category casing violation(s)
- `src/TypeScript/index.ts:1` (jsdoc) - missing summary
- `src/TypeScript/models/index.ts:1` (jsdoc) - missing summary

Export findings:
- `src/Dependencies.ts:75` `extractWorkspaceDependencies` (const) - resolved
- `src/DependencyIndex.ts:55` `buildRepoDependencyIndex` (const) - resolved
- `src/Graph.ts:109` `topologicalSort` (const) - resolved
- `src/Graph.ts:168` `detectCycles` (const) - resolved
- `src/Graph.ts:324` `computeTransitiveClosure` (const) - resolved
- `src/JSDoc/JSDoc.ts:510` `StructuralJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:1139` `AccessModifierJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:1536` `DocumentationContentJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:1960` `TSDocSpecificJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:2085` `InlineJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:2369` `OrganizationalJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:2556` `EventDependencyJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:3280` `RemainingJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:3841` `ClosureSpecificJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:4232` `TypeDocSpecificJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:4322` `TypeScriptSpecificJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:4368` `JSDocTag` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/index.ts:7` `export * as Models from "./models/index.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/TSCategory.model.ts:275` `make` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/models/TagValue.model.ts:11` `export * from "./tag-values/index.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:13` `export * from "./ApplicableTo.model.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/index.ts:17` `export * from "./ASTDerivability.model.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/index.ts:21` `export * as CanonicalJSDocSourceMetadata from "./CanonicalJSDocSourceMetadata.model.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/index.ts:25` `export * from "./HasJSDocApplicableToMapEntry.model.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/index.ts:29` `export * from "./JSDocTagAnnotation.model.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/index.ts:33` `export * as JSDocTagDefinition from "./JSDocTagDefinition.model.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/index.ts:37` `export * from "./Specification.model.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/index.ts:41` `export * from "./TagKind.model.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/index.ts:45` `export * from "./TagParameters.model.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/index.ts:49` `export * from "./TagValue.model.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/index.ts:53` `export * from "./TSCategory.model.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/tag-values/_fields.ts:22` `typeField` (const) - 2 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/_fields.ts:35` `optionalType` (const) - 2 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/_fields.ts:48` `nameField` (const) - 2 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/_fields.ts:61` `optionalName` (const) - 2 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/_fields.ts:74` `optionalDesc` (const) - 2 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/index.ts:15` `export * from "./AccessModifierTagValues.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/tag-values/index.ts:19` `export * from "./ClosureTagValues.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/tag-values/index.ts:23` `export * from "./DocumentationTagValues.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/tag-values/index.ts:27` `export * from "./EventDependencyTagValues.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/tag-values/index.ts:31` `export * from "./InlineTagValues.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/tag-values/index.ts:35` `export * from "./OrganizationalTagValues.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/tag-values/index.ts:39` `export * from "./RemainingTagValues.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/tag-values/index.ts:44` `export * from "./StructuralTagValues.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/tag-values/index.ts:48` `export * from "./TSDocTagValues.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/tag-values/index.ts:52` `export * from "./TypeDocTagValues.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/tag-values/index.ts:56` `export * from "./TypeScriptTagValues.js";` (re-export) - missing @example, @category
- `src/JSDoc/models/tag-values/index.ts:350` `TagValue` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/index.ts:524` `TagName` (const) - 1 schema annotation/type-alias gap(s)
- `src/Reuse/index.ts:7` `export * from "./Reuse.model.js";` (re-export) - missing @example
- `src/Reuse/index.ts:14` `export * from "./Reuse.service.js";` (re-export) - missing @example
- `src/Root.ts:47` `findRepoRoot` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:121` `RepoRootPath` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:141` `RepoRootPath` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:154` `WorkspaceDirectoryPath` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:174` `WorkspaceDirectoryPath` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:187` `TsConfigFilePath` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:207` `TsConfigFilePath` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:220` `TypeScriptImplementationFilePath` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:240` `TypeScriptImplementationFilePath` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:253` `TypeScriptDeclarationFilePath` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:273` `TypeScriptDeclarationFilePath` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:286` `TypeScriptFilePath` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:305` `TypeScriptFilePath` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:318` `SymbolFilePath` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:338` `SymbolFilePath` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:351` `SymbolNameSegment` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:371` `SymbolNameSegment` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:384` `SymbolQualifiedName` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:404` `SymbolQualifiedName` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:417` `SymbolKind` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:430` `SymbolKind` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:443` `SymbolCategory` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:456` `SymbolCategory` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:469` `symbolCategoryFromKind` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:492` `SymbolKindToCategory` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:517` `SymbolKindToCategory` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:530` `SourceText` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:550` `SourceText` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:563` `LineNumber` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:583` `LineNumber` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:596` `ColumnNumber` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:616` `ColumnNumber` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:629` `ByteOffset` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:649` `ByteOffset` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:662` `ByteLength` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:682` `ByteLength` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:695` `ContentHash` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:715` `ContentHash` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:728` `TsMorphScopeMode` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:741` `TsMorphScopeMode` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:754` `TsMorphReferencePolicy` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:767` `TsMorphReferencePolicy` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:788` `ProjectScopeId` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:808` `ProjectScopeId` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:821` `ProjectScopeIdParts` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:844` `ProjectCacheKey` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:864` `ProjectCacheKey` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:877` `SymbolId` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:897` `SymbolId` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:910` `SymbolIdParts` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:933` `FilePathToTsConfigFilePath` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:956` `FilePathToTypeScriptImplementationFilePath` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:979` `FilePathToTypeScriptDeclarationFilePath` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:1002` `FilePathToTypeScriptFilePath` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:1025` `TypeScriptImplementationFilePathToSymbolFilePath` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:1053` `ContentHashFromBytes` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:1086` `ContentHashFromSourceText` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:1114` `InternalTsMorphProject` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:1133` `InternalTsMorphSourceFile` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:1154` `InternalTsMorphNode` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:1175` `Symbol` (class) - resolved
- `src/TSMorph/TSMorph.model.ts:1245` `Symbol` (namespace) - resolved
- `src/TSMorph/TSMorph.model.ts:1283` `SymbolInit` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:1301` `makeSymbolId` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:1320` `makeProjectScopeId` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:1342` `makeProjectCacheKey` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:1362` `makeSymbol` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:1408` `TsMorphScopeEntrypoint` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:1442` `TsMorphScopeEntrypoint` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:1455` `TsMorphProjectScopeRequest` (class) - resolved
- `src/TSMorph/TSMorph.model.ts:1478` `TsMorphProjectInspectionRequest` (class) - resolved
- `src/TSMorph/TSMorph.model.ts:1506` `TsMorphProjectScope` (class) - resolved
- `src/TSMorph/TSMorph.model.ts:1532` `TsMorphFileOutlineRequest` (class) - resolved
- `src/TSMorph/TSMorph.model.ts:1553` `TsMorphFileOutline` (class) - resolved
- `src/TSMorph/TSMorph.model.ts:1575` `TsMorphSourceTextRequest` (class) - resolved
- `src/TSMorph/TSMorph.model.ts:1595` `TsMorphSourceTextResult` (class) - resolved
- `src/TSMorph/TSMorph.model.ts:1617` `TsMorphSymbolLookupRequest` (class) - resolved
- `src/TSMorph/TSMorph.model.ts:1638` `TsMorphSymbolLookupResult` (class) - resolved
- `src/TSMorph/TSMorph.model.ts:1659` `TsMorphSearchLimit` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:1679` `TsMorphSearchLimit` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:1692` `TsMorphSymbolSearchRequest` (class) - resolved
- `src/TSMorph/TSMorph.model.ts:1716` `TsMorphSymbolSearchResult` (class) - resolved
- `src/TSMorph/TSMorph.model.ts:1740` `TsMorphSymbolSourceRequest` (class) - resolved
- `src/TSMorph/TSMorph.model.ts:1761` `TsMorphSymbolSourceResult` (class) - resolved
- `src/TSMorph/TSMorph.model.ts:1784` `TsMorphDiagnosticCategory` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:1797` `TsMorphDiagnosticCategory` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:1868` `TsMorphDiagnostic` (const) - resolved
- `src/TSMorph/TSMorph.model.ts:1894` `TsMorphDiagnostic` (type) - resolved
- `src/TSMorph/TSMorph.model.ts:1907` `TsMorphDiagnosticsRequest` (class) - resolved
- `src/TSMorph/TSMorph.model.ts:1928` `TsMorphDiagnosticsResult` (class) - resolved
- `src/TSMorph/TSMorph.service.ts:122` `TsMorphServiceUnavailableError` (class) - resolved
- `src/TSMorph/TSMorph.service.ts:147` `TsMorphScopeResolutionError` (class) - resolved
- `src/TSMorph/TSMorph.service.ts:172` `TsMorphProjectLoadError` (class) - resolved
- `src/TSMorph/TSMorph.service.ts:195` `TsMorphSourceFileError` (class) - resolved
- `src/TSMorph/TSMorph.service.ts:219` `TsMorphSymbolNotFoundError` (class) - resolved
- `src/TSMorph/TSMorph.service.ts:247` `TsMorphUnsupportedFileError` (class) - resolved
- `src/TSMorph/TSMorph.service.ts:272` `TSMorphServiceError` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.service.ts:292` `TSMorphServiceError` (type) - resolved
- `src/TSMorph/TSMorph.service.ts:305` `TSMorphServiceShape` (type) - resolved
- `src/TSMorph/TSMorph.service.ts:352` `TSMorphService` (class) - resolved
- `src/TSMorph/TSMorph.service.ts:696` `createTSMorphService` (const) - resolved
- `src/TSMorph/TSMorph.service.ts:1383` `TSMorphServiceLive` (const) - resolved
- `src/TSMorph/TSMorph.shared.ts:42` `OutlineDeclaration` (type) - resolved
- `src/TSMorph/TSMorph.shared.ts:71` `byTsMorphSymbolAscending` (const) - resolved
- `src/TSMorph/TSMorph.shared.ts:100` `byNormalizedDiagnosticAscending` (const) - resolved
- `src/TSMorph/TSMorph.shared.ts:126` `readDocstring` (const) - resolved
- `src/TSMorph/TSMorph.shared.ts:154` `readDecorators` (const) - resolved
- `src/TSMorph/TSMorph.shared.ts:172` `readSignature` (const) - resolved
- `src/TSMorph/TSMorph.shared.ts:196` `makeSummary` (const) - resolved
- `src/TSMorph/TSMorph.shared.ts:213` `makeKeywords` (const) - resolved
- `src/TSMorph/TSMorph.shared.ts:236` `makeScopeSymbolSearchText` (const) - resolved
- `src/TSMorph/TSMorph.shared.ts:284` `flattenDiagnosticMessageText` (const) - resolved
- `src/TSMorph/TSMorph.shared.ts:312` `normalizeDiagnosticCategory` (const) - resolved
- `src/TSMorph/TSMorph.shared.ts:328` `getDeclarationName` (const) - resolved
- `src/TSMorph/TSMorph.shared.ts:404` `pipeQualifiedName` (const) - resolved
- `src/TSMorph/index.ts:7` `export * from "./TSMorph.model.js";` (re-export) - missing @example
- `src/TSMorph/index.ts:14` `export * from "./TSMorph.service.js";` (re-export) - missing @example
- `src/TsConfig.ts:49` `collectTsConfigPaths` (const) - resolved
- `src/TypeScript/index.ts:4` `export * from "./models/index.js";` (re-export) - missing @example, @category
- `src/TypeScript/models/index.ts:4` `export * from "./TSSyntaxKind.model.js";` (re-export) - missing @example, @category
- `src/Workspaces.ts:92` `resolveWorkspaceDirs` (const) - resolved
- `src/Workspaces.ts:200` `getWorkspaceDir` (const) - resolved
- `src/errors/index.ts:10` `export {
  /**
   * @since 0.0.0
   */
  CyclicDependencyError,
} from "./CyclicDependencyError.js";` (re-export) - missing @example, @category
- `src/errors/index.ts:20` `export {
  /**
   * @since 0.0.0
   */
  DomainError,
} from "./DomainError.js";` (re-export) - missing @example, @category
- `src/errors/index.ts:29` `export {
  /**
   * @since 0.0.0
   */
  NoSuchFileError,
} from "./NoSuchFileError.js";` (re-export) - missing @example, @category
- `src/index.ts:13` `export {
  /**
   * @since 0.0.0
   */
  extractWorkspaceDependencies,
} from "./Dependencies.js";` (re-export) - missing @example, @category
- `src/index.ts:22` `export {
  /**
   * @since 0.0.0
   */
  buildRepoDependencyIndex,
} from "./DependencyIndex.js";` (re-export) - missing @example, @category
- `src/index.ts:31` `export {
  /**
   * @since 0.0.0
   */
  CyclicDependencyError,
  /**
   * @since 0.0.0
   */
  DomainError,
  /**
   * @since 0.0.0
   */
  NoSuchFileError,
} from "./errors/index.js";` (re-export) - missing @example, @category
- `src/index.ts:98` `export {
  /**
   * @since 0.0.0
   */
  computeTransitiveClosure,
  /**
   * @since 0.0.0
   */
  detectCycles,
  /**
   * @since 0.0.0
   */
  topologicalSort,
} from "./Graph.js";` (re-export) - missing @example, @category
- `src/index.ts:115` `export {
  /**
   * @since 0.0.0
   */
  jsonParse,
  /**
   * @since 0.0.0
   */
  jsonStringifyCompact,
  /**
   * @since 0.0.0
   */
  jsonStringifyPretty,
} from "./JsonUtils.js";` (re-export) - missing @example, @category
- `src/index.ts:132` `export * from "./Reuse/index.js";` (re-export) - missing @example, @category
- `src/index.ts:136` `export {
  /**
   * @since 0.0.0
   */
  findRepoRoot,
} from "./Root.js";` (re-export) - missing @example, @category
- `src/index.ts:145` `export {
  /**
   * @since 0.0.0
   */
  decodePackageJson,
  /**
   * @since 0.0.0
   */
  decodePackageJsonEffect,
  /**
   * @since 0.0.0
   */
  decodePackageJsonExit,
  /**
   * @since 0.0.0
   */
  encodePackageJsonEffect,
  /**
   * @since 0.0.0
   */
  encodePackageJsonPrettyEffect,
  /**
   * @since 0.0.0
   */
  encodePackageJsonToJsonEffect,
  /**
   * @since 0.0.0
   */
  NpmPackageJson,
  /**
   * @since 0.0.0
   */
  PackageJson,
} from "./schemas/PackageJson.js";` (re-export) - missing @example, @category
- `src/index.ts:182` `export {
  /**
   * @since 0.0.0
   */
  applyPackageJsonPatchEffect,
  /**
   * @since 0.0.0
   */
  diffPackageJsonEffect,
  /**
   * @since 0.0.0
   */
  encodePackageJsonCanonicalPrettyEffect,
  /**
   * @since 0.0.0
   */
  getPackageJsonSchemaIssues,
  /**
   * @since 0.0.0
   */
  normalizePackageJsonEffect,
  /**
   * @since 0.0.0
   */
  npmPackageJsonJsonSchema,
  /**
   * @since 0.0.0
   */
  PackageJsonValidationIssue,
  /**
   * @since 0.0.0
   */
  packageJsonJsonSchema,
} from "./schemas/PackageJsonTools.js";` (re-export) - missing @example, @category
- `src/index.ts:219` `export {
  /**
   * @since 0.0.0
   */
  decodeTSConfig,
  /**
   * @since 0.0.0
   */
  decodeTSConfigEffect,
  /**
   * @since 0.0.0
   */
  decodeTSConfigExit,
  /**
   * @since 0.0.0
   */
  decodeTSConfigFromJsoncTextEffect,
  /**
   * @since 0.0.0
   */
  encodeTSConfigEffect,
  /**
   * @since 0.0.0
   */
  encodeTSConfigPrettyEffect,
  /**
   * @since 0.0.0
   */
  encodeTSConfigToJsonEffect,
  /**
   * @since 0.0.0
   */
  TSConfig,
  /**
   * @since 0.0.0
   */
  TSConfigBuildOptions,
  /**
   * @since 0.0.0
   */
  TSConfigCompilerOptions,
  /**
   * @since 0.0.0
   */
  TSConfigReference,
  /**
   * @since 0.0.0
   */
  TSConfigTypeAcquisition,
  /**
   * @since 0.0.0
   */
  TSConfigWatchOptions,
  /**
   * @since 0.0.0
   */
  TSNodeConfig,
} from "./schemas/TSConfig.js";` (re-export) - missing @example, @category
- `src/index.ts:280` `export {
  /**
   * @since 0.0.0
   */
  type DependencyRecord,
  /**
   * @since 0.0.0
   */
  emptyWorkspaceDeps,
  /**
   * @since 0.0.0
   */
  WorkspaceDeps,
} from "./schemas/WorkspaceDeps.js";` (re-export) - missing @example, @category
- `src/index.ts:297` `export * from "./TSMorph/index.js";` (re-export) - missing @example, @category
- `src/index.ts:301` `export {
  /**
   * @since 0.0.0
   */
  collectTsConfigPaths,
} from "./TsConfig.js";` (re-export) - missing @example, @category
- `src/index.ts:310` `export * from "./TypeScript/index.js";` (re-export) - missing @example, @category
- `src/index.ts:342` `export {
  /**
   * @since 0.0.0
   */
  getWorkspaceDir,
  /**
   * @since 0.0.0
   */
  resolveWorkspaceDirs,
} from "./Workspaces.js";` (re-export) - missing @example, @category

### @beep/fixture-lab-specimen-domain

Path: `packages/fixture-lab/specimen/domain`

Export findings:
- `src/entities/Specimen/Specimen.policy.ts:24` `observeSpecimen` (const) - 1 unsafe example violation(s)
- `src/entities/Specimen/Specimen.policy.ts:45` `retireSpecimen` (const) - 1 unsafe example violation(s)

### @beep/test-utils

Path: `packages/tooling/test-kit/test-utils`

Export findings:
- `src/SqlTest.ts:186` `PgliteTestcontainersTestDriverConfigInput` (type) - missing @example
- `src/SqlTest.ts:239` `PgExternalTestDriverConfigInput` (type) - missing @example
- `src/SqlTest.ts:247` `PgliteSqlTestLayerMode` (type) - missing @example
- `src/SqlTest.ts:255` `PgliteSqlTestLayerOptions` (interface) - missing @example
- `src/SqlTest.ts:436` `PgliteTestcontainerResource` (interface) - 1 unsafe example violation(s)
- `src/index.ts:8` `export * from "./SqlTest.js";` (re-export) - missing @example, @category
- `src/index.ts:22` `VERSION` (const) - resolved

### @beep/repo-docgen

Path: `packages/tooling/tool/docgen`

Export findings:
- `src/Configuration.ts:54` `ConfigurationSchema` (class) - 1 schema annotation/type-alias gap(s)
- `src/Configuration.ts:96` `ConfigurationShape` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:79` `Position` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:116` `Doc` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:192` `DocEntry` (class) - 1 unsafe example violation(s); 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:241` `Class` (class) - 1 unsafe example violation(s); 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:299` `Interface` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:346` `Function` (class) - 1 unsafe example violation(s); 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:393` `TypeAlias` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:440` `Constant` (class) - 1 unsafe example violation(s); 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:496` `Export` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:552` `Namespace` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:597` `Module` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:672` `File` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:732` `DocgenError` (class) - 1 schema annotation/type-alias gap(s)
- `src/index.ts:11` `export * as Checker from "./Checker.js";` (re-export) - missing @example, @category
- `src/index.ts:16` `export * as Configuration from "./Configuration.js";` (re-export) - missing @example, @category
- `src/index.ts:21` `export * as Core from "./Core.js";` (re-export) - missing @example, @category
- `src/index.ts:26` `export * as Domain from "./Domain.js";` (re-export) - missing @example, @category
- `src/index.ts:31` `export * as Parser from "./Parser.js";` (re-export) - missing @example, @category
- `src/index.ts:36` `export * as Printer from "./Printer.js";` (re-export) - missing @example, @category

### @beep/ffmpeg

Path: `packages/drivers/ffmpeg`

Export findings:
- `src/FFmpeg.models.ts:72` `PositiveFrameRate` (type) - 1 unsafe example violation(s)
- `src/FFmpeg.models.ts:131` `PositiveMilliseconds` (type) - 1 unsafe example violation(s)
- `src/FFmpeg.models.ts:190` `SafeFramePrefix` (type) - 1 unsafe example violation(s)
- `src/index.ts:14` `export * from "./FFmpeg.errors.ts";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./FFmpeg.models.ts";` (re-export) - missing @example
- `src/index.ts:30` `export * from "./FFmpeg.service.ts";` (re-export) - missing @example

### @beep/observability

Path: `packages/foundation/capability/observability`

Module findings:
- `src/experimental/server/index.ts:1` (jsdoc) - missing summary
- `src/server/index.ts:1` (jsdoc) - missing summary
- `src/web/index.ts:1` (jsdoc) - missing summary

Export findings:
- `src/Metric.ts:189` `trackDuration` (const) - missing @example
- `src/Metric.ts:312` `observeWorkflow` (const) - missing @example
- `src/Metric.ts:443` `observeHttpRequest` (const) - missing @example
- `src/PhaseProfiler.ts:261` `profilePhase` (const) - missing @example
- `src/experimental/server/index.ts:4` `export * from "./DevToolsRelay.ts";` (re-export) - missing @example, @category
- `src/experimental/server/index.ts:8` `export * from "./OtlpPacketLab.ts";` (re-export) - missing @example, @category
- `src/index.ts:47` `export * from "./CauseDiagnostics.ts";` (re-export) - missing @example
- `src/index.ts:55` `export * from "./CoreConfig.ts";` (re-export) - missing @example
- `src/index.ts:63` `export * from "./HttpError.ts";` (re-export) - missing @example
- `src/index.ts:71` `export * from "./Logging.ts";` (re-export) - missing @example
- `src/index.ts:79` `export * from "./Metric.ts";` (re-export) - missing @example
- `src/index.ts:87` `export * from "./Observed.ts";` (re-export) - missing @example
- `src/index.ts:95` `export * from "./PhaseProfiler.ts";` (re-export) - missing @example
- `src/server/Config.ts:69` `toOtlpResource` (const) - 1 unsafe example violation(s)
- `src/server/HttpApiTelemetry.ts:265` `makeHttpApiTelemetryDescriptor` (const) - 1 unsafe example violation(s)
- `src/server/HttpApiTelemetry.ts:304` `httpApiFailureStatus` (const) - 1 unsafe example violation(s)
- `src/server/HttpApiTelemetry.ts:424` `observeHttpApiEffect` (const) - missing @example
- `src/server/HttpApiTelemetry.ts:583` `observeHttpApiHandler` (const) - missing @example
- `src/server/Layer.ts:29` `layerLocalLgtmServer` (const) - 1 unsafe example violation(s)
- `src/server/NodeSdk.ts:52` `toNodeSdkResource` (const) - 1 unsafe example violation(s)
- `src/server/NodeSdk.ts:69` `makeNodeSdkServerConfig` (const) - 1 unsafe example violation(s)
- `src/server/NodeSdk.ts:139` `layerNodeSdkServer` (const) - 1 unsafe example violation(s)
- `src/server/TraceContext.ts:93` `withIncomingTraceContext` (const) - missing @example
- `src/server/index.ts:4` `export * from "./Config.ts";` (re-export) - missing @example, @category
- `src/server/index.ts:8` `export * from "./DevTools.ts";` (re-export) - missing @example, @category
- `src/server/index.ts:12` `export * from "./ErrorReporting.ts";` (re-export) - missing @example, @category
- `src/server/index.ts:16` `export * from "./HttpApiTelemetry.ts";` (re-export) - missing @example, @category
- `src/server/index.ts:20` `export * from "./Layer.ts";` (re-export) - missing @example, @category
- `src/server/index.ts:24` `export * from "./NodeSdk.ts";` (re-export) - missing @example, @category
- `src/server/index.ts:28` `export * from "./Prometheus.ts";` (re-export) - missing @example, @category
- `src/server/index.ts:32` `export * from "./TraceContext.ts";` (re-export) - missing @example, @category
- `src/web/index.ts:4` `export * from "./Config.ts";` (re-export) - missing @example, @category
- `src/web/index.ts:8` `export * from "./Layer.ts";` (re-export) - missing @example, @category

### @beep/fixture-lab-specimen-config

Path: `packages/fixture-lab/specimen/config`

Export findings:
- `src/Config.ts:29` `SpecimenConfigShape` (interface) - 1 unsafe example violation(s)
- `src/Layer.ts:27` `export type { SpecimenConfigShape } from "./Config.js";` (re-export) - 1 unsafe example violation(s)

### @beep/fixture-lab-specimen-use-cases

Path: `packages/fixture-lab/specimen/use-cases`

Export findings:
- `src/entities/Specimen/Specimen.ports.ts:31` `SpecimenRepository` (interface) - 1 unsafe example violation(s)
- `src/entities/Specimen/Specimen.service.ts:28` `SpecimenUseCases` (interface) - 1 unsafe example violation(s)
- `src/entities/Specimen/Specimen.service.ts:60` `makeSpecimenUseCases` (const) - 1 unsafe example violation(s)
- `src/public.ts:64` `export type { SpecimenUseCases } from "./entities/Specimen/Specimen.service.js";` (re-export) - 1 unsafe example violation(s)

### @beep/drizzle

Path: `packages/drivers/drizzle`

Export findings:
- `src/EntityTable.ts:102` `ColumnBuilderFor` (type) - missing @example
- `src/EntityTable.ts:114` `ColumnBuilderMapFor` (type) - missing @example
- `src/EntityTable.ts:126` `TableFor` (type) - missing @example
- `src/EntityTable.ts:344` `pgTableFrom` (const) - missing @example
- `src/EntityTable.ts:360` `columns` (const) - missing @example
- `src/index.ts:14` `export * from "./Drizzle.errors.ts";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./Drizzle.service.ts";` (re-export) - missing @example
- `src/index.ts:30` `export * as EntityTable from "./EntityTable.ts";` (re-export) - missing @example

### @beep/agent-capability-use-cases

Path: `packages/agent-capability/use-cases`

Export findings:
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.fixtures.ts:55` `RuntimeFixtureInput` (class) - 1 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.service.ts:27` `ProfessionalRuntimeSdk` (interface) - 1 unsafe example violation(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:23` `RuntimeCandidateLifecycle` (const) - 2 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:38` `RuntimeClaimConfidence` (const) - 2 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:53` `RuntimeApprovalDecision` (const) - 2 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:68` `RuntimeRequestKind` (const) - 2 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:83` `RuntimeSourceKind` (const) - 2 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:98` `RuntimeActivityType` (const) - 2 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:113` `RuntimeUsageMode` (const) - 2 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/index.ts:80` `export type { ProfessionalRuntimeSdk } from "./ProfessionalRuntime.service.js";` (re-export) - 1 unsafe example violation(s)
- `src/public.ts:78` `export type { ProfessionalRuntimeSdk } from "./processes/ProfessionalRuntime/ProfessionalRuntime.service.js";` (re-export) - 1 unsafe example violation(s)

### @beep/ui

Path: `packages/foundation/ui-system/ui`

Module findings:
- `src/components/accordion.tsx:1` (none) - missing summary; missing @since
- `src/components/alert-dialog.tsx:1` (none) - missing summary; missing @since
- `src/components/alert.tsx:1` (none) - missing summary; missing @since
- `src/components/aspect-ratio.tsx:1` (none) - missing summary; missing @since
- `src/components/avatar.tsx:1` (none) - missing summary; missing @since
- `src/components/badge.tsx:1` (none) - missing summary; missing @since
- `src/components/banner.tsx:1` (none) - missing summary; missing @since
- `src/components/blocks/editor-00/editor.tsx:1` (none) - missing summary; missing @since
- `src/components/blocks/editor-00/nodes.ts:1` (none) - missing summary; missing @since
- `src/components/blocks/editor-00/plugins.tsx:1` (none) - missing summary; missing @since
- `src/components/breadcrumb.tsx:1` (none) - missing summary; missing @since
- `src/components/button-group.tsx:1` (none) - missing summary; missing @since
- `src/components/button.tsx:1` (none) - missing summary; missing @since
- `src/components/calendar-event-card.tsx:1` (none) - missing summary; missing @since
- `src/components/calendar.tsx:1` (none) - missing summary; missing @since
- `src/components/card.tsx:1` (none) - missing summary; missing @since
- `src/components/carousel.tsx:1` (none) - missing summary; missing @since
- `src/components/checkbox.tsx:1` (none) - missing summary; missing @since
- `src/components/codegraph/components/SearchBar.tsx:1` (none) - missing summary; missing @since
- `src/components/codegraph/components/StatsPanel.tsx:1` (none) - missing summary; missing @since
- `src/components/codegraph/neo4j.ts:1` (none) - missing summary; missing @since
- `src/components/codegraph/styles/graph-layout.tsx:1` (none) - missing summary; missing @since
- `src/components/codegraph/styles/graph-styles.tsx:1` (none) - missing summary; missing @since
- `src/components/collapsible.tsx:1` (none) - missing summary; missing @since
- `src/components/combobox.tsx:1` (none) - missing summary; missing @since
- `src/components/command.tsx:1` (none) - missing summary; missing @since
- `src/components/context-menu.tsx:1` (none) - missing summary; missing @since
- `src/components/conversation.tsx:1` (none) - missing summary; missing @since
- `src/components/dialog.tsx:1` (none) - missing summary; missing @since
- `src/components/drawer.tsx:1` (none) - missing summary; missing @since
- `src/components/dropdown-menu.tsx:1` (none) - missing summary; missing @since
- `src/components/editor/editor-ui/content-editable.tsx:1` (none) - missing summary; missing @since
- `src/components/editor/themes/editor-theme.ts:1` (none) - missing summary; missing @since
- `src/components/empty.tsx:1` (none) - missing summary; missing @since
- `src/components/field.tsx:1` (none) - missing summary; missing @since
- `src/components/hover-card.tsx:1` (none) - missing summary; missing @since
- `src/components/input-group.tsx:1` (none) - missing summary; missing @since
- `src/components/input-otp.tsx:1` (none) - missing summary; missing @since
- `src/components/input.tsx:1` (none) - missing summary; missing @since
- `src/components/item.tsx:1` (none) - missing summary; missing @since
- `src/components/kbd.tsx:1` (none) - missing summary; missing @since
- `src/components/knowledge-graph.tsx:1` (none) - missing summary; missing @since
- `src/components/label.tsx:1` (none) - missing summary; missing @since
- `src/components/link-preview.tsx:1` (none) - missing summary; missing @since
- `src/components/live-waveform.tsx:1` (none) - missing summary; missing @since
- `src/components/menubar.tsx:1` (none) - missing summary; missing @since
- `src/components/navigation-menu.tsx:1` (none) - missing summary; missing @since
- `src/components/notification-card.tsx:1` (none) - missing summary; missing @since
- `src/components/orb.tsx:1` (none) - missing summary; missing @since
- `src/components/pagination.tsx:1` (none) - missing summary; missing @since
- `src/components/popover.tsx:1` (none) - missing summary; missing @since
- `src/components/progress.tsx:1` (none) - missing summary; missing @since
- `src/components/radio-group.tsx:1` (none) - missing summary; missing @since
- `src/components/resizable.tsx:1` (none) - missing summary; missing @since
- `src/components/scroll-area.tsx:1` (none) - missing summary; missing @since
- `src/components/select.tsx:1` (none) - missing summary; missing @since
- `src/components/separator.tsx:1` (none) - missing summary; missing @since
- `src/components/sheet.tsx:1` (none) - missing summary; missing @since
- `src/components/sidebar.tsx:1` (none) - missing summary; missing @since
- `src/components/skeleton.tsx:1` (none) - missing summary; missing @since
- `src/components/slider.tsx:1` (none) - missing summary; missing @since
- `src/components/sonner.tsx:1` (none) - missing summary; missing @since
- `src/components/speech-input.tsx:1` (none) - missing summary; missing @since
- `src/components/spinner.tsx:1` (none) - missing summary; missing @since
- `src/components/switch.tsx:1` (none) - missing summary; missing @since
- `src/components/table-icons.tsx:1` (none) - missing summary; missing @since
- `src/components/table.tsx:1` (none) - missing summary; missing @since
- `src/components/tabs.tsx:1` (none) - missing summary; missing @since
- `src/components/textarea.tsx:1` (none) - missing summary; missing @since
- `src/components/toast.tsx:1` (none) - missing summary; missing @since
- `src/components/toaster.tsx:1` (none) - missing summary; missing @since
- `src/components/todo-item.tsx:1` (none) - missing summary; missing @since
- `src/components/toggle-group.tsx:1` (none) - missing summary; missing @since
- `src/components/toggle.tsx:1` (none) - missing summary; missing @since
- `src/components/toolbar.tsx:1` (none) - missing summary; missing @since
- `src/components/tooltip.tsx:1` (none) - missing summary; missing @since
- `src/components/tour.tsx:1` (none) - missing summary; missing @since
- `src/components/ui/button.stories.tsx:1` (none) - missing summary; missing @since
- `src/components/ui/tooltip.tsx:1` (none) - missing summary; missing @since
- `src/hooks/useNumberInput.ts:1` (none) - missing summary; missing @since
- `src/hooks/useSpinner.ts:1` (none) - missing summary; missing @since
- `src/lib/index.ts:1` (jsdoc) - missing summary
- `src/themes/colors.ts:1` (none) - missing summary; missing @since
- `src/themes/components/alert.ts:1` (none) - missing summary; missing @since
- `src/themes/components/autocomplete.ts:1` (none) - missing summary; missing @since
- `src/themes/components/avatar.ts:1` (none) - missing summary; missing @since
- `src/themes/components/button.ts:1` (none) - missing summary; missing @since
- `src/themes/components/card.ts:1` (none) - missing summary; missing @since
- `src/themes/components/chip.ts:1` (none) - missing summary; missing @since
- `src/themes/components/controls.ts:1` (none) - missing summary; missing @since
- `src/themes/components/data-grid.ts:1` (none) - missing summary; missing @since
- `src/themes/components/date-picker.ts:1` (none) - missing summary; missing @since
- `src/themes/components/dialog.ts:1` (none) - missing summary; missing @since
- `src/themes/components/layout.ts:1` (none) - missing summary; missing @since
- `src/themes/components/link.ts:1` (none) - missing summary; missing @since
- `src/themes/components/list.ts:1` (none) - missing summary; missing @since
- `src/themes/components/menu.ts:1` (none) - missing summary; missing @since
- `src/themes/components/progress.ts:1` (none) - missing summary; missing @since
- `src/themes/components/select.ts:1` (none) - missing summary; missing @since
- `src/themes/components/svg-icon.ts:1` (none) - missing summary; missing @since
- `src/themes/components/table.ts:1` (none) - missing summary; missing @since
- `src/themes/components/text-field.ts:1` (none) - missing summary; missing @since
- `src/themes/components/tree-view.ts:1` (none) - missing summary; missing @since
- `src/themes/shadows.ts:1` (none) - missing summary; missing @since
- `src/themes/theme.ts:1` (none) - missing summary; missing @since
- `src/themes/types.ts:1` (none) - missing summary; missing @since
- `src/themes/typography.ts:1` (none) - missing summary; missing @since
- `src/types/component.ts:1` (none) - missing summary; missing @since
- `src/types/index.ts:1` (jsdoc) - missing summary

Export findings:
- `src/components/accordion.tsx:7` `Accordion` (function) - missing summary; missing @example, @category, @since
- `src/components/accordion.tsx:42` `AccordionContent` (function) - missing summary; missing @example, @category, @since
- `src/components/accordion.tsx:11` `AccordionItem` (function) - missing summary; missing @example, @category, @since
- `src/components/accordion.tsx:17` `AccordionTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/alert-dialog.tsx:8` `AlertDialog` (function) - missing summary; missing @example, @category, @since
- `src/components/alert-dialog.tsx:124` `AlertDialogAction` (function) - missing summary; missing @example, @category, @since
- `src/components/alert-dialog.tsx:140` `AlertDialogCancel` (function) - missing summary; missing @example, @category, @since
- `src/components/alert-dialog.tsx:33` `AlertDialogContent` (function) - missing summary; missing @example, @category, @since
- `src/components/alert-dialog.tsx:108` `AlertDialogDescription` (function) - missing summary; missing @example, @category, @since
- `src/components/alert-dialog.tsx:69` `AlertDialogFooter` (function) - missing summary; missing @example, @category, @since
- `src/components/alert-dialog.tsx:56` `AlertDialogHeader` (function) - missing summary; missing @example, @category, @since
- `src/components/alert-dialog.tsx:82` `AlertDialogMedia` (function) - missing summary; missing @example, @category, @since
- `src/components/alert-dialog.tsx:20` `AlertDialogOverlay` (function) - missing summary; missing @example, @category, @since
- `src/components/alert-dialog.tsx:16` `AlertDialogPortal` (function) - missing summary; missing @example, @category, @since
- `src/components/alert-dialog.tsx:95` `AlertDialogTitle` (function) - missing summary; missing @example, @category, @since
- `src/components/alert-dialog.tsx:12` `AlertDialogTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/alert.tsx:21` `Alert` (function) - missing summary; missing @example, @category, @since
- `src/components/alert.tsx:51` `AlertAction` (function) - missing summary; missing @example, @category, @since
- `src/components/alert.tsx:38` `AlertDescription` (function) - missing summary; missing @example, @category, @since
- `src/components/alert.tsx:25` `AlertTitle` (function) - missing summary; missing @example, @category, @since
- `src/components/aspect-ratio.tsx:3` `AspectRatio` (function) - missing summary; missing @example, @category, @since
- `src/components/avatar.tsx:10` `Avatar` (function) - missing summary; missing @example, @category, @since
- `src/components/avatar.tsx:74` `AvatarFallback` (function) - missing summary; missing @example, @category, @since
- `src/components/avatar.tsx:27` `AvatarImage` (function) - missing summary; missing @example, @category, @since
- `src/components/badge.tsx:26` `Badge` (function) - missing summary; missing @example, @category, @since
- `src/components/badge.tsx:6` `badgeVariants` (const) - missing summary; missing @example, @category, @since
- `src/components/banner.tsx:6` `bannerVariants` (const) - missing summary; missing @example, @category, @since
- `src/components/blocks/editor-00/editor.tsx:28` `Editor` (function) - missing @example
- `src/components/blocks/editor-00/nodes.ts:12` `nodes` (const) - missing @example
- `src/components/blocks/editor-00/plugins.tsx:12` `Plugins` (function) - missing @example
- `src/components/breadcrumb.tsx:7` `Breadcrumb` (function) - missing summary; missing @example, @category, @since
- `src/components/breadcrumb.tsx:61` `BreadcrumbEllipsis` (function) - missing summary; missing @example, @category, @since
- `src/components/breadcrumb.tsx:24` `BreadcrumbItem` (function) - missing summary; missing @example, @category, @since
- `src/components/breadcrumb.tsx:28` `BreadcrumbLink` (function) - missing summary; missing @example, @category, @since
- `src/components/breadcrumb.tsx:11` `BreadcrumbList` (function) - missing summary; missing @example, @category, @since
- `src/components/breadcrumb.tsx:34` `BreadcrumbPage` (function) - missing summary; missing @example, @category, @since
- `src/components/breadcrumb.tsx:47` `BreadcrumbSeparator` (function) - missing summary; missing @example, @category, @since
- `src/components/button-group.tsx:25` `ButtonGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/button-group.tsx:60` `ButtonGroupSeparator` (function) - missing summary; missing @example, @category, @since
- `src/components/button-group.tsx:41` `ButtonGroupText` (function) - missing summary; missing @example, @category, @since
- `src/components/button-group.tsx:8` `buttonGroupVariants` (const) - missing summary; missing @example, @category, @since
- `src/components/button.tsx:41` `Button` (function) - missing summary; missing @example, @category, @since
- `src/components/button.tsx:6` `buttonVariants` (const) - missing summary; missing @example, @category, @since
- `src/components/calendar-event-card.tsx:24` `CalendarEventCard` (function) - missing summary; missing @example, @category, @since
- `src/components/calendar-event-card.tsx:118` `EventTitle` (function) - missing summary; missing @example, @category, @since
- `src/components/calendar-event-card.tsx:128` `EventTime` (function) - missing summary; missing @example, @category, @since
- `src/components/calendar-event-card.tsx:144` `EventLocation` (function) - missing summary; missing @example, @category, @since
- `src/components/calendar-event-card.tsx:7` `EventStatus` (type) - missing summary; missing @example, @category, @since
- `src/components/calendar-event-card.tsx:8` `EventVariant` (type) - missing summary; missing @example, @category, @since
- `src/components/calendar.tsx:9` `Calendar` (function) - missing summary; missing @example, @category, @since
- `src/components/calendar.tsx:134` `CalendarDayButton` (function) - missing summary; missing @example, @category, @since
- `src/components/card.tsx:4` `Card` (function) - missing summary; missing @example, @category, @since
- `src/components/card.tsx:49` `CardAction` (function) - missing summary; missing @example, @category, @since
- `src/components/card.tsx:59` `CardContent` (function) - missing summary; missing @example, @category, @since
- `src/components/card.tsx:45` `CardDescription` (function) - missing summary; missing @example, @category, @since
- `src/components/card.tsx:63` `CardFooter` (function) - missing summary; missing @example, @category, @since
- `src/components/card.tsx:22` `CardHeader` (function) - missing summary; missing @example, @category, @since
- `src/components/card.tsx:35` `CardTitle` (function) - missing summary; missing @example, @category, @since
- `src/components/carousel.tsx:43` `Carousel` (function) - missing summary; missing @example, @category, @since
- `src/components/carousel.tsx:10` `CarouselApi` (type) - missing summary; missing @example, @category, @since
- `src/components/carousel.tsx:138` `CarouselContent` (function) - missing summary; missing @example, @category, @since
- `src/components/carousel.tsx:148` `CarouselItem` (function) - missing summary; missing @example, @category, @since
- `src/components/carousel.tsx:192` `CarouselNext` (function) - missing summary; missing @example, @category, @since
- `src/components/carousel.tsx:162` `CarouselPrevious` (function) - missing summary; missing @example, @category, @since
- `src/components/carousel.tsx:33` `useCarousel` (function) - missing summary; missing @example, @category, @since
- `src/components/checkbox.tsx:7` `Checkbox` (function) - missing summary; missing @example, @category, @since
- `src/components/codegraph/components/SearchBar.tsx:11` `SearchMode` (const) - missing summary; missing @example, @category, @since
- `src/components/codegraph/components/SearchBar.tsx:17` `SearchMode` (type) - missing summary; missing @example, @category, @since
- `src/components/codegraph/components/SearchBar.tsx:19` `SearchBarProps` (class) - missing summary; missing @example, @category, @since; 1 schema annotation/type-alias gap(s)
- `src/components/codegraph/components/StatsPanel.tsx:28` `StatsPanel` (function) - missing summary; missing @example, @category, @since
- `src/components/codegraph/neo4j.ts:11` `DeadCodeItem` (class) - missing summary; missing @example
- `src/components/codegraph/neo4j.ts:25` `GodObjectItem` (class) - missing summary; missing @example
- `src/components/codegraph/neo4j.ts:40` `GodFileItem` (class) - missing summary; missing @example
- `src/components/codegraph/neo4j.ts:53` `DuplicateGroupFunction` (class) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/components/codegraph/neo4j.ts:62` `DuplicateGroup` (class) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/components/codegraph/neo4j.ts:72` `HealthStats` (class) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/components/codegraph/neo4j.ts:100` `ViewMode` (const) - missing summary; missing @example
- `src/components/codegraph/neo4j.ts:110` `ViewMode` (type) - missing summary; missing @example
- `src/components/codegraph/neo4j.ts:116` `CacheKey` (const) - missing summary; missing @example
- `src/components/codegraph/neo4j.ts:126` `CacheKey` (type) - missing summary; missing @example
- `src/components/codegraph/styles/graph-layout.tsx:9` `LayoutName` (const) - missing summary; missing @example, @category, @since
- `src/components/codegraph/styles/graph-layout.tsx:15` `LayoutName` (type) - missing summary; missing @example, @category, @since
- `src/components/codegraph/styles/graph-layout.tsx:17` `LayoutBase` (class) - missing summary; missing @example, @category, @since; 1 schema annotation/type-alias gap(s)
- `src/components/codegraph/styles/graph-layout.tsx:26` `CircleLayout` (class) - missing summary; missing @example, @category, @since
- `src/components/codegraph/styles/graph-layout.tsx:36` `ConcentricLayout` (class) - missing summary; missing @example, @category, @since
- `src/components/codegraph/styles/graph-layout.tsx:49` `BreadthFirstLayout` (class) - missing summary; missing @example, @category, @since
- `src/components/codegraph/styles/graph-layout.tsx:64` `CoseLayout` (class) - missing summary; missing @example, @category, @since
- `src/components/codegraph/styles/graph-layout.tsx:84` `GraphLayout` (const) - missing summary; missing @example, @category, @since; 1 schema annotation/type-alias gap(s)
- `src/components/codegraph/styles/graph-styles.tsx:6` `graphStyles` (const) - missing summary; missing @example, @category, @since
- `src/components/codegraph/styles/graph-styles.tsx:511` `graphStylesFast` (const) - missing @example, @category, @since
- `src/components/collapsible.tsx:6` `Collapsible` (function) - missing summary; missing @example, @category, @since
- `src/components/collapsible.tsx:14` `CollapsibleContent` (function) - missing summary; missing @example, @category, @since
- `src/components/collapsible.tsx:10` `CollapsibleTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/combobox.tsx:10` `Combobox` (const) - missing summary; missing @example, @category, @since
- `src/components/combobox.tsx:200` `ComboboxChip` (function) - missing summary; missing @example, @category, @since
- `src/components/combobox.tsx:184` `ComboboxChips` (function) - missing summary; missing @example, @category, @since
- `src/components/combobox.tsx:231` `ComboboxChipsInput` (function) - missing summary; missing @example, @category, @since
- `src/components/combobox.tsx:157` `ComboboxCollection` (function) - missing summary; missing @example, @category, @since
- `src/components/combobox.tsx:74` `ComboboxContent` (function) - missing summary; missing @example, @category, @since
- `src/components/combobox.tsx:161` `ComboboxEmpty` (function) - missing summary; missing @example, @category, @since
- `src/components/combobox.tsx:143` `ComboboxGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/combobox.tsx:42` `ComboboxInput` (function) - missing summary; missing @example, @category, @since
- `src/components/combobox.tsx:123` `ComboboxItem` (function) - missing summary; missing @example, @category, @since
- `src/components/combobox.tsx:147` `ComboboxLabel` (function) - missing summary; missing @example, @category, @since
- `src/components/combobox.tsx:110` `ComboboxList` (function) - missing summary; missing @example, @category, @since
- `src/components/combobox.tsx:174` `ComboboxSeparator` (function) - missing summary; missing @example, @category, @since
- `src/components/combobox.tsx:16` `ComboboxTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/combobox.tsx:12` `ComboboxValue` (function) - missing summary; missing @example, @category, @since
- `src/components/combobox.tsx:241` `useComboboxAnchor` (function) - missing summary; missing @example, @category, @since
- `src/components/command.tsx:10` `Command` (function) - missing summary; missing @example, @category, @since
- `src/components/command.tsx:23` `CommandDialog` (function) - missing summary; missing @example, @category, @since
- `src/components/command.tsx:77` `CommandEmpty` (function) - missing summary; missing @example, @category, @since
- `src/components/command.tsx:87` `CommandGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/command.tsx:50` `CommandInput` (function) - missing summary; missing @example, @category, @since
- `src/components/command.tsx:110` `CommandItem` (function) - missing summary; missing @example, @category, @since
- `src/components/command.tsx:67` `CommandList` (function) - missing summary; missing @example, @category, @since
- `src/components/command.tsx:100` `CommandSeparator` (function) - missing summary; missing @example, @category, @since
- `src/components/command.tsx:126` `CommandShortcut` (function) - missing summary; missing @example, @category, @since
- `src/components/context-menu.tsx:8` `ContextMenu` (function) - missing summary; missing @example, @category, @since
- `src/components/context-menu.tsx:133` `ContextMenuCheckboxItem` (function) - missing summary; missing @example, @category, @since
- `src/components/context-menu.tsx:26` `ContextMenuContent` (function) - missing summary; missing @example, @category, @since
- `src/components/context-menu.tsx:57` `ContextMenuGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/context-menu.tsx:78` `ContextMenuItem` (function) - missing summary; missing @example, @category, @since
- `src/components/context-menu.tsx:61` `ContextMenuLabel` (function) - missing summary; missing @example, @category, @since
- `src/components/context-menu.tsx:12` `ContextMenuPortal` (function) - missing summary; missing @example, @category, @since
- `src/components/context-menu.tsx:154` `ContextMenuRadioGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/context-menu.tsx:158` `ContextMenuRadioItem` (function) - missing summary; missing @example, @category, @since
- `src/components/context-menu.tsx:178` `ContextMenuSeparator` (function) - missing summary; missing @example, @category, @since
- `src/components/context-menu.tsx:188` `ContextMenuShortcut` (function) - missing summary; missing @example, @category, @since
- `src/components/context-menu.tsx:101` `ContextMenuSub` (function) - missing summary; missing @example, @category, @since
- `src/components/context-menu.tsx:129` `ContextMenuSubContent` (function) - missing summary; missing @example, @category, @since
- `src/components/context-menu.tsx:105` `ContextMenuSubTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/context-menu.tsx:16` `ContextMenuTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/conversation.tsx:10` `ConversationProps` (type) - missing summary; missing @example, @category, @since
- `src/components/conversation.tsx:12` `Conversation` (const) - missing summary; missing @example, @category, @since
- `src/components/conversation.tsx:22` `ConversationContentProps` (type) - missing summary; missing @example, @category, @since
- `src/components/conversation.tsx:24` `ConversationContent` (const) - missing summary; missing @example, @category, @since
- `src/components/conversation.tsx:28` `ConversationEmptyStateProps` (type) - missing summary; missing @example, @category, @since
- `src/components/conversation.tsx:34` `ConversationEmptyState` (const) - missing summary; missing @example, @category, @since
- `src/components/conversation.tsx:58` `ConversationScrollButtonProps` (type) - missing summary; missing @example, @category, @since
- `src/components/conversation.tsx:60` `ConversationScrollButton` (const) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:9` `Dialog` (function) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:123` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:124` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:125` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:126` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:127` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:128` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:129` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:130` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:131` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:21` `DialogClose` (function) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:38` `DialogContent` (function) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:111` `DialogDescription` (function) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:78` `DialogFooter` (function) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:74` `DialogHeader` (function) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:25` `DialogOverlay` (function) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:17` `DialogPortal` (function) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:101` `DialogTitle` (function) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:13` `DialogTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/drawer.tsx:7` `Drawer` (function) - missing summary; missing @example, @category, @since
- `src/components/drawer.tsx:19` `DrawerClose` (function) - missing summary; missing @example, @category, @since
- `src/components/drawer.tsx:36` `DrawerContent` (function) - missing summary; missing @example, @category, @since
- `src/components/drawer.tsx:82` `DrawerDescription` (function) - missing summary; missing @example, @category, @since
- `src/components/drawer.tsx:68` `DrawerFooter` (function) - missing summary; missing @example, @category, @since
- `src/components/drawer.tsx:55` `DrawerHeader` (function) - missing summary; missing @example, @category, @since
- `src/components/drawer.tsx:23` `DrawerOverlay` (function) - missing summary; missing @example, @category, @since
- `src/components/drawer.tsx:15` `DrawerPortal` (function) - missing summary; missing @example, @category, @since
- `src/components/drawer.tsx:72` `DrawerTitle` (function) - missing summary; missing @example, @category, @since
- `src/components/drawer.tsx:11` `DrawerTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:9` `DropdownMenu` (function) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:221` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:222` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:223` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:224` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:225` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:226` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:227` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:228` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:229` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:230` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:231` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:232` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:233` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:234` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:147` `DropdownMenuCheckboxItem` (function) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:21` `DropdownMenuContent` (function) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:51` `DropdownMenuGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:72` `DropdownMenuItem` (function) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:55` `DropdownMenuLabel` (function) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:13` `DropdownMenuPortal` (function) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:171` `DropdownMenuRadioGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:175` `DropdownMenuRadioItem` (function) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:198` `DropdownMenuSeparator` (function) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:208` `DropdownMenuShortcut` (function) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:95` `DropdownMenuSub` (function) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:123` `DropdownMenuSubContent` (function) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:99` `DropdownMenuSubTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:17` `DropdownMenuTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/editor/editor-ui/content-editable.tsx:16` `ContentEditable` (function) - missing @example
- `src/components/editor/themes/editor-theme.ts:13` `editorTheme` (const) - missing @example
- `src/components/empty.tsx:6` `Empty` (function) - missing summary; missing @example, @category, @since
- `src/components/empty.tsx:76` `EmptyContent` (function) - missing summary; missing @example, @category, @since
- `src/components/empty.tsx:63` `EmptyDescription` (function) - missing summary; missing @example, @category, @since
- `src/components/empty.tsx:19` `EmptyHeader` (function) - missing summary; missing @example, @category, @since
- `src/components/empty.tsx:44` `EmptyMedia` (function) - missing summary; missing @example, @category, @since
- `src/components/empty.tsx:59` `EmptyTitle` (function) - missing summary; missing @example, @category, @since
- `src/components/field.tsx:69` `Field` (function) - missing summary; missing @example, @category, @since
- `src/components/field.tsx:85` `FieldContent` (function) - missing summary; missing @example, @category, @since
- `src/components/field.tsx:122` `FieldDescription` (function) - missing summary; missing @example, @category, @since
- `src/components/field.tsx:164` `FieldError` (function) - missing summary; missing @example, @category, @since
- `src/components/field.tsx:41` `FieldGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/field.tsx:95` `FieldLabel` (function) - missing summary; missing @example, @category, @since
- `src/components/field.tsx:26` `FieldLegend` (function) - missing summary; missing @example, @category, @since
- `src/components/field.tsx:137` `FieldSeparator` (function) - missing summary; missing @example, @category, @since
- `src/components/field.tsx:13` `FieldSet` (function) - missing summary; missing @example, @category, @since
- `src/components/field.tsx:109` `FieldTitle` (function) - missing summary; missing @example, @category, @since
- `src/components/hover-card.tsx:7` `HoverCard` (function) - missing summary; missing @example, @category, @since
- `src/components/hover-card.tsx:15` `HoverCardContent` (function) - missing summary; missing @example, @category, @since
- `src/components/hover-card.tsx:11` `HoverCardTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/input-group.tsx:11` `InputGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/input-group.tsx:43` `InputGroupAddon` (function) - missing summary; missing @example, @category, @since
- `src/components/input-group.tsx:79` `InputGroupButton` (function) - missing summary; missing @example, @category, @since
- `src/components/input-group.tsx:112` `InputGroupInput` (function) - missing summary; missing @example, @category, @since
- `src/components/input-group.tsx:100` `InputGroupText` (function) - missing summary; missing @example, @category, @since
- `src/components/input-group.tsx:125` `InputGroupTextarea` (function) - missing summary; missing @example, @category, @since
- `src/components/input-otp.tsx:8` `InputOTP` (function) - missing summary; missing @example, @category, @since
- `src/components/input-otp.tsx:26` `InputOTPGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/input-otp.tsx:69` `InputOTPSeparator` (function) - missing summary; missing @example, @category, @since
- `src/components/input-otp.tsx:39` `InputOTPSlot` (function) - missing summary; missing @example, @category, @since
- `src/components/input.tsx:5` `Input` (function) - missing summary; missing @example, @category, @since
- `src/components/item.tsx:40` `Item` (function) - missing summary; missing @example, @category, @since
- `src/components/item.tsx:134` `ItemActions` (function) - missing summary; missing @example, @category, @since
- `src/components/item.tsx:100` `ItemContent` (function) - missing summary; missing @example, @category, @since
- `src/components/item.tsx:120` `ItemDescription` (function) - missing summary; missing @example, @category, @since
- `src/components/item.tsx:148` `ItemFooter` (function) - missing summary; missing @example, @category, @since
- `src/components/item.tsx:9` `ItemGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/item.tsx:138` `ItemHeader` (function) - missing summary; missing @example, @category, @since
- `src/components/item.tsx:85` `ItemMedia` (function) - missing summary; missing @example, @category, @since
- `src/components/item.tsx:15` `ItemSeparator` (function) - missing summary; missing @example, @category, @since
- `src/components/item.tsx:110` `ItemTitle` (function) - missing summary; missing @example, @category, @since
- `src/components/kbd.tsx:4` `Kbd` (function) - missing summary; missing @example, @category, @since
- `src/components/kbd.tsx:17` `KbdGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/knowledge-graph.tsx:13` `GraphNode` (interface) - missing summary; missing @example, @category, @since
- `src/components/knowledge-graph.tsx:28` `GraphLink` (interface) - missing summary; missing @example, @category, @since
- `src/components/knowledge-graph.tsx:58` `KnowledgeGraphHandle` (interface) - missing summary; missing @example, @category, @since
- `src/components/knowledge-graph.tsx:92` `KnowledgeGraph` (const) - missing summary; missing @example, @category, @since
- `src/components/knowledge-graph.tsx:92` `default` (const) - missing summary; missing @example, @category, @since
- `src/components/label.tsx:6` `Label` (function) - missing summary; missing @example, @category, @since
- `src/components/link-preview.tsx:99` `LinkPreview` (function) - missing summary; missing @example, @category, @since
- `src/components/live-waveform.tsx:8` `LiveWaveformProps` (type) - missing summary; missing @example, @category, @since
- `src/components/live-waveform.tsx:31` `LiveWaveform` (const) - missing summary; missing @example, @category, @since
- `src/components/menubar.tsx:24` `Menubar` (function) - missing summary; missing @example, @category, @since
- `src/components/menubar.tsx:101` `MenubarCheckboxItem` (function) - missing summary; missing @example, @category, @since
- `src/components/menubar.tsx:59` `MenubarContent` (function) - missing summary; missing @example, @category, @since
- `src/components/menubar.tsx:38` `MenubarGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/menubar.tsx:81` `MenubarItem` (function) - missing summary; missing @example, @category, @since
- `src/components/menubar.tsx:146` `MenubarLabel` (function) - missing summary; missing @example, @category, @since
- `src/components/menubar.tsx:34` `MenubarMenu` (function) - missing summary; missing @example, @category, @since
- `src/components/menubar.tsx:42` `MenubarPortal` (function) - missing summary; missing @example, @category, @since
- `src/components/menubar.tsx:122` `MenubarRadioGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/menubar.tsx:126` `MenubarRadioItem` (function) - missing summary; missing @example, @category, @since
- `src/components/menubar.tsx:157` `MenubarSeparator` (function) - missing summary; missing @example, @category, @since
- `src/components/menubar.tsx:167` `MenubarShortcut` (function) - missing summary; missing @example, @category, @since
- `src/components/menubar.tsx:180` `MenubarSub` (function) - missing summary; missing @example, @category, @since
- `src/components/menubar.tsx:204` `MenubarSubContent` (function) - missing summary; missing @example, @category, @since
- `src/components/menubar.tsx:184` `MenubarSubTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/menubar.tsx:46` `MenubarTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/navigation-menu.tsx:7` `NavigationMenu` (function) - missing summary; missing @example, @category, @since
- `src/components/navigation-menu.tsx:59` `NavigationMenuContent` (function) - missing summary; missing @example, @category, @since
- `src/components/navigation-menu.tsx:114` `NavigationMenuIndicator` (function) - missing summary; missing @example, @category, @since
- `src/components/navigation-menu.tsx:33` `NavigationMenuItem` (function) - missing summary; missing @example, @category, @since
- `src/components/navigation-menu.tsx:101` `NavigationMenuLink` (function) - missing summary; missing @example, @category, @since
- `src/components/navigation-menu.tsx:23` `NavigationMenuList` (function) - missing summary; missing @example, @category, @since
- `src/components/navigation-menu.tsx:72` `NavigationMenuPositioner` (function) - missing summary; missing @example, @category, @since
- `src/components/navigation-menu.tsx:43` `NavigationMenuTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/navigation-menu.tsx:39` `navigationMenuTriggerStyle` (const) - missing summary; missing @example, @category, @since
- `src/components/notification-card.tsx:105` `NotificationCard` (function) - missing summary; missing @example, @category, @since
- `src/components/notification-card.tsx:19` `NotificationStatus` (type) - missing summary; missing @example, @category, @since
- `src/components/notification-card.tsx:21` `ActionType` (const) - missing summary; missing @example, @category, @since
- `src/components/notification-card.tsx:27` `ActionType` (type) - missing summary; missing @example, @category, @since
- `src/components/notification-card.tsx:29` `ActionStyle` (const) - missing summary; missing @example, @category, @since
- `src/components/notification-card.tsx:34` `ActionStyle` (type) - missing summary; missing @example, @category, @since
- `src/components/notification-card.tsx:43` `NotificationAction` (const) - missing summary; missing @example, @category, @since
- `src/components/notification-card.tsx:54` `NotificationAction` (type) - missing summary; missing @example, @category, @since
- `src/components/orb.tsx:31` `Orb` (function) - missing summary; missing @example, @category, @since
- `src/components/orb.tsx:13` `AgentState` (type) - missing summary; missing @example, @category, @since
- `src/components/pagination.tsx:6` `Pagination` (function) - missing summary; missing @example, @category, @since
- `src/components/pagination.tsx:17` `PaginationContent` (function) - missing summary; missing @example, @category, @since
- `src/components/pagination.tsx:64` `PaginationEllipsis` (function) - missing summary; missing @example, @category, @since
- `src/components/pagination.tsx:21` `PaginationItem` (function) - missing summary; missing @example, @category, @since
- `src/components/pagination.tsx:30` `PaginationLink` (function) - missing summary; missing @example, @category, @since
- `src/components/pagination.tsx:55` `PaginationNext` (function) - missing summary; missing @example, @category, @since
- `src/components/pagination.tsx:46` `PaginationPrevious` (function) - missing summary; missing @example, @category, @since
- `src/components/popover.tsx:7` `Popover` (function) - missing summary; missing @example, @category, @since
- `src/components/popover.tsx:15` `PopoverContent` (function) - missing summary; missing @example, @category, @since
- `src/components/popover.tsx:56` `PopoverDescription` (function) - missing summary; missing @example, @category, @since
- `src/components/popover.tsx:48` `PopoverHeader` (function) - missing summary; missing @example, @category, @since
- `src/components/popover.tsx:52` `PopoverTitle` (function) - missing summary; missing @example, @category, @since
- `src/components/popover.tsx:11` `PopoverTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/progress.tsx:7` `Progress` (function) - missing summary; missing @example, @category, @since
- `src/components/progress.tsx:33` `ProgressIndicator` (function) - missing summary; missing @example, @category, @since
- `src/components/progress.tsx:43` `ProgressLabel` (function) - missing summary; missing @example, @category, @since
- `src/components/progress.tsx:23` `ProgressTrack` (function) - missing summary; missing @example, @category, @since
- `src/components/progress.tsx:49` `ProgressValue` (function) - missing summary; missing @example, @category, @since
- `src/components/radio-group.tsx:8` `RadioGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/radio-group.tsx:12` `RadioGroupItem` (function) - missing summary; missing @example, @category, @since
- `src/components/resizable.tsx:20` `ResizableHandle` (function) - missing summary; missing @example, @category, @since
- `src/components/resizable.tsx:11` `ResizablePanel` (function) - missing summary; missing @example, @category, @since
- `src/components/resizable.tsx:7` `ResizablePanelGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/scroll-area.tsx:7` `ScrollArea` (function) - missing summary; missing @example, @category, @since
- `src/components/scroll-area.tsx:22` `ScrollBar` (function) - missing summary; missing @example, @category, @since
- `src/components/select.tsx:8` `Select` (const) - missing summary; missing @example, @category, @since
- `src/components/select.tsx:44` `SelectContent` (function) - missing summary; missing @example, @category, @since
- `src/components/select.tsx:10` `SelectGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/select.tsx:92` `SelectItem` (function) - missing summary; missing @example, @category, @since
- `src/components/select.tsx:82` `SelectLabel` (function) - missing summary; missing @example, @category, @since
- `src/components/select.tsx:139` `SelectScrollDownButton` (function) - missing summary; missing @example, @category, @since
- `src/components/select.tsx:124` `SelectScrollUpButton` (function) - missing summary; missing @example, @category, @since
- `src/components/select.tsx:114` `SelectSeparator` (function) - missing summary; missing @example, @category, @since
- `src/components/select.tsx:20` `SelectTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/select.tsx:14` `SelectValue` (function) - missing summary; missing @example, @category, @since
- `src/components/separator.tsx:7` `Separator` (function) - missing summary; missing @example, @category, @since
- `src/components/sheet.tsx:9` `Sheet` (function) - missing summary; missing @example, @category, @since
- `src/components/sheet.tsx:17` `SheetClose` (function) - missing summary; missing @example, @category, @since
- `src/components/sheet.tsx:38` `SheetContent` (function) - missing summary; missing @example, @category, @since
- `src/components/sheet.tsx:93` `SheetDescription` (function) - missing summary; missing @example, @category, @since
- `src/components/sheet.tsx:79` `SheetFooter` (function) - missing summary; missing @example, @category, @since
- `src/components/sheet.tsx:75` `SheetHeader` (function) - missing summary; missing @example, @category, @since
- `src/components/sheet.tsx:83` `SheetTitle` (function) - missing summary; missing @example, @category, @since
- `src/components/sheet.tsx:13` `SheetTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:169` `Sidebar` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:402` `SidebarContent` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:386` `SidebarFooter` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:415` `SidebarGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:435` `SidebarGroupAction` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:451` `SidebarGroupContent` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:421` `SidebarGroupLabel` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:380` `SidebarHeader` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:370` `SidebarInput` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:356` `SidebarInset` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:455` `SidebarMenu` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:532` `SidebarMenuAction` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:559` `SidebarMenuBadge` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:492` `SidebarMenuButton` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:459` `SidebarMenuItem` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:577` `SidebarMenuSkeleton` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:603` `SidebarMenuSub` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:621` `SidebarMenuSubButton` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:617` `SidebarMenuSubItem` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:61` `SidebarProvider` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:332` `SidebarRail` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:396` `SidebarSeparator` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:311` `SidebarTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/sidebar.tsx:33` `useSidebar` (function) - missing summary; missing @example, @category, @since
- `src/components/skeleton.tsx:3` `Skeleton` (function) - missing summary; missing @example, @category, @since
- `src/components/slider.tsx:9` `Slider` (function) - missing summary; missing @example, @category, @since
- `src/components/sonner.tsx:8` `Toaster` (const) - missing summary; missing @example, @category, @since
- `src/components/speech-input.tsx:136` `SpeechInput` (const) - missing summary; missing @example, @category, @since
- `src/components/speech-input.tsx:381` `SpeechInputCancelButton` (const) - missing summary; missing @example, @category, @since
- `src/components/speech-input.tsx:341` `SpeechInputPreview` (const) - missing summary; missing @example, @category, @since
- `src/components/speech-input.tsx:288` `SpeechInputRecordButton` (const) - missing summary; missing @example, @category, @since
- `src/components/speech-input.tsx:51` `useSpeechInput` (function) - missing summary; missing @example, @category, @since
- `src/components/spinner.tsx:5` `Spinner` (function) - missing summary; missing @example, @category, @since
- `src/components/switch.tsx:7` `Switch` (function) - missing summary; missing @example, @category, @since
- `src/components/table-icons.tsx:5` `BorderAllIcon` (function) - missing summary; missing @example, @category, @since
- `src/components/table-icons.tsx:36` `BorderBottomIcon` (function) - missing summary; missing @example, @category, @since
- `src/components/table-icons.tsx:79` `BorderLeftIcon` (function) - missing summary; missing @example, @category, @since
- `src/components/table-icons.tsx:122` `BorderNoneIcon` (function) - missing summary; missing @example, @category, @since
- `src/components/table-icons.tsx:171` `BorderRightIcon` (function) - missing summary; missing @example, @category, @since
- `src/components/table-icons.tsx:214` `BorderTopIcon` (function) - missing summary; missing @example, @category, @since
- `src/components/table.tsx:6` `Table` (function) - missing summary; missing @example, @category, @since
- `src/components/table.tsx:18` `TableBody` (function) - missing summary; missing @example, @category, @since
- `src/components/table.tsx:65` `TableCaption` (function) - missing summary; missing @example, @category, @since
- `src/components/table.tsx:55` `TableCell` (function) - missing summary; missing @example, @category, @since
- `src/components/table.tsx:22` `TableFooter` (function) - missing summary; missing @example, @category, @since
- `src/components/table.tsx:42` `TableHead` (function) - missing summary; missing @example, @category, @since
- `src/components/table.tsx:14` `TableHeader` (function) - missing summary; missing @example, @category, @since
- `src/components/table.tsx:32` `TableRow` (function) - missing summary; missing @example, @category, @since
- `src/components/tabs.tsx:7` `Tabs` (function) - missing summary; missing @example, @category, @since
- `src/components/tabs.tsx:64` `TabsContent` (function) - missing summary; missing @example, @category, @since
- `src/components/tabs.tsx:33` `TabsList` (function) - missing summary; missing @example, @category, @since
- `src/components/tabs.tsx:48` `TabsTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/tabs.tsx:18` `tabsListVariants` (const) - missing summary; missing @example, @category, @since
- `src/components/textarea.tsx:4` `Textarea` (function) - missing summary; missing @example, @category, @since
- `src/components/toast.tsx:50` `ToastVariant` (const) - missing summary; missing @example, @category, @since
- `src/components/toast.tsx:56` `ToastVariant` (type) - missing summary; missing @example, @category, @since
- `src/components/toast.tsx:58` `ToastData` (class) - missing summary; missing @example, @category, @since
- `src/components/toast.tsx:67` `Toast` (const) - missing summary; missing @example, @category, @since
- `src/components/toast.tsx:80` `ToastAction` (const) - missing summary; missing @example, @category, @since
- `src/components/toast.tsx:127` `ToastActionElement` (type) - missing summary; missing @example, @category, @since
- `src/components/toast.tsx:94` `ToastClose` (const) - missing summary; missing @example, @category, @since
- `src/components/toast.tsx:117` `ToastDescription` (const) - missing summary; missing @example, @category, @since
- `src/components/toast.tsx:125` `ToastProps` (type) - missing summary; missing @example, @category, @since
- `src/components/toast.tsx:15` `ToastProvider` (const) - missing summary; missing @example, @category, @since
- `src/components/toast.tsx:110` `ToastTitle` (const) - missing summary; missing @example, @category, @since
- `src/components/toast.tsx:17` `ToastViewport` (const) - missing summary; missing @example, @category, @since
- `src/components/toaster.tsx:16` `Toaster` (function) - missing summary; missing @example, @category, @since
- `src/components/todo-item.tsx:88` `TodoItem` (function) - missing summary; missing @example, @category, @since
- `src/components/toggle-group.tsx:22` `ToggleGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/toggle-group.tsx:56` `ToggleGroupItem` (function) - missing summary; missing @example, @category, @since
- `src/components/toggle.tsx:28` `Toggle` (function) - missing summary; missing @example, @category, @since
- `src/components/toggle.tsx:7` `toggleVariants` (const) - missing summary; missing @example, @category, @since
- `src/components/toolbar.tsx:16` `Toolbar` (function) - missing summary; missing @example, @category, @since
- `src/components/toolbar.tsx:20` `ToolbarToggleGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/toolbar.tsx:53` `ToolbarLink` (function) - missing summary; missing @example, @category, @since
- `src/components/toolbar.tsx:57` `ToolbarSeparator` (function) - missing summary; missing @example, @category, @since
- `src/components/toolbar.tsx:174` `ToolbarSplitButton` (function) - missing summary; missing @example, @category, @since
- `src/components/toolbar.tsx:180` `ToolbarSplitButtonPrimary` (function) - missing summary; missing @example, @category, @since
- `src/components/toolbar.tsx:205` `ToolbarSplitButtonSecondary` (function) - missing summary; missing @example, @category, @since
- `src/components/toolbar.tsx:230` `ToolbarToggleItem` (function) - missing summary; missing @example, @category, @since
- `src/components/toolbar.tsx:239` `ToolbarGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/toolbar.tsx:287` `ToolbarMenuGroup` (function) - missing summary; missing @example, @category, @since
- `src/components/toolbar.tsx:123` `ToolbarButton` (const) - missing summary; missing @example, @category, @since
- `src/components/tooltip.tsx:10` `Tooltip` (function) - missing summary; missing @example, @category, @since
- `src/components/tooltip.tsx:18` `TooltipContent` (function) - missing summary; missing @example, @category, @since
- `src/components/tooltip.tsx:6` `TooltipProvider` (function) - missing summary; missing @example, @category, @since
- `src/components/tooltip.tsx:14` `TooltipTrigger` (function) - missing summary; missing @example, @category, @since
- `src/components/tour.tsx:35` `Step` (interface) - missing summary; missing @example, @category, @since
- `src/components/tour.tsx:50` `Tour` (interface) - missing summary; missing @example, @category, @since
- `src/components/tour.tsx:55` `TourProvider` (function) - missing summary; missing @example, @category, @since
- `src/components/tour.tsx:27` `useTour` (function) - missing summary; missing @example, @category, @since
- `src/components/ui/button.stories.tsx:5` `default` (const) - missing summary; missing @example, @category, @since
- `src/components/ui/button.stories.tsx:28` `Default` (const) - missing summary; missing @example, @category
- `src/components/ui/button.stories.tsx:40` `Outline` (const) - missing summary; missing @example, @category
- `src/components/ui/button.stories.tsx:45` `Secondary` (const) - missing summary; missing @example, @category
- `src/components/ui/button.stories.tsx:50` `Ghost` (const) - missing summary; missing @example, @category
- `src/components/ui/button.stories.tsx:55` `Destructive` (const) - missing summary; missing @example, @category
- `src/components/ui/button.stories.tsx:60` `Link` (const) - missing summary; missing @example, @category
- `src/components/ui/button.stories.tsx:65` `Small` (const) - missing summary; missing @example, @category
- `src/components/ui/button.stories.tsx:70` `Large` (const) - missing summary; missing @example, @category
- `src/components/ui/button.stories.tsx:75` `ClickInteraction` (const) - missing summary; missing @example, @category
- `src/components/ui/button.tsx:63` `Button` (function) - missing @example
- `src/components/ui/button.tsx:19` `buttonVariants` (const) - missing @example
- `src/components/ui/tooltip.tsx:17` `Tooltip` (function) - missing summary; missing @example, @category, @since
- `src/components/ui/tooltip.tsx:25` `TooltipContent` (function) - missing summary; missing @example, @category, @since
- `src/components/ui/tooltip.tsx:13` `TooltipProvider` (function) - missing @example
- `src/components/ui/tooltip.tsx:21` `TooltipTrigger` (function) - missing summary; missing @example, @category, @since
- `src/hooks/index.ts:12` `export * from "./useNumberInput.ts";` (re-export) - missing @example
- `src/hooks/useMobile.ts:31` `useIsMobile` (function) - missing @example
- `src/hooks/useMobile.ts:23` `resolveIsMobile` (const) - missing @example
- `src/hooks/useNumberInput.ts:213` `minSafeInteger` (const) - missing @example
- `src/hooks/useNumberInput.ts:221` `maxSafeInteger` (const) - missing @example
- `src/hooks/useNumberInput.ts:229` `BoundaryParams` (class) - missing @example
- `src/hooks/useNumberInput.ts:247` `SpinParams` (class) - missing @example
- `src/hooks/useNumberInput.ts:278` `toNumber` (const) - resolved
- `src/hooks/useNumberInput.ts:310` `numberToString` (const) - resolved
- `src/hooks/useNumberInput.ts:357` `getStepFactor` (const) - resolved
- `src/hooks/useNumberInput.ts:377` `NumberInputEventType` (const) - missing @example
- `src/hooks/useNumberInput.ts:389` `NumberInputEventType` (type) - missing @example
- `src/hooks/useNumberInput.ts:397` `NumberInputError` (const) - missing @example
- `src/hooks/useNumberInput.ts:409` `NumberInputError` (type) - missing @example
- `src/hooks/useNumberInput.ts:417` `NumberInputChangeMetadata` (class) - missing @example
- `src/hooks/useNumberInput.ts:455` `UseNumberInputOptions` (type) - missing @example
- `src/hooks/useNumberInput.ts:520` `useNumberBoundary` (const) - missing @example
- `src/hooks/useNumberInput.ts:596` `useNumberInput` (const) - missing @example
- `src/hooks/useSpinner.ts:134` `useSpinner` (function) - missing @example
- `src/index.ts:20` `VERSION` (const) - missing summary; missing @example
- `src/lib/index.ts:4` `export * from "./url.ts";` (re-export) - missing @example, @category
- `src/lib/index.ts:5` `export * from "./utils.ts";` (re-export) - missing @example, @category, @since
- `src/lib/url.ts:76` `sanitizeAnchorHref` (const) - missing @example
- `src/lib/utils.ts:19` `cn` (function) - missing @example
- `src/themes/colors.ts:30` `colors` (const) - missing @example
- `src/themes/components/alert.ts:6` `alertTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/autocomplete.ts:13` `autocompleteTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/avatar.ts:6` `avatarTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/button.ts:7` `buttonTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/card.ts:6` `cardTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/chip.ts:13` `chipTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/controls.ts:85` `controlsTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/data-grid.ts:7` `dataGridTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/date-picker.ts:9` `datePickerTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/dialog.ts:6` `dialogTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/layout.ts:6` `layoutTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/link.ts:6` `linkTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/list.ts:6` `listTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/menu.ts:6` `menuTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/progress.ts:6` `progressTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/select.ts:7` `selectTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/svg-icon.ts:6` `svgIconTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/table.ts:6` `tableTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/text-field.ts:31` `textFieldTheme` (const) - missing summary; missing @example, @category
- `src/themes/components/tree-view.ts:7` `treeViewTheme` (const) - missing summary; missing @example, @category
- `src/themes/index.ts:11` `export * from "./theme.ts";` (re-export) - missing @example
- `src/themes/index.ts:16` `export * from "./theme-provider.tsx";` (re-export) - missing @example
- `src/themes/scales.ts:7` `CONTROL_HEIGHTS` (const) - missing @example
- `src/themes/scales.ts:19` `CONTROL_TOUCH_HEIGHTS` (const) - missing @example
- `src/themes/scales.ts:35` `TOUCH_MEDIA_QUERY` (const) - missing @example
- `src/themes/scales.ts:44` `SWITCH_SIZES` (const) - missing @example
- `src/themes/scales.ts:56` `SWITCH_TOUCH_SIZES` (const) - missing @example
- `src/themes/shadows.ts:9` `shadows` (const) - missing @example
- `src/themes/theme-provider.tsx:95` `AppThemeProvider` (function) - missing @example
- `src/themes/theme-provider.tsx:110` `useThemeMode` (function) - missing @example
- `src/themes/theme-provider.tsx:25` `ThemeMode` (const) - missing @example
- `src/themes/theme-provider.tsx:37` `ThemeMode` (type) - missing @example
- `src/themes/theme-provider.tsx:45` `ResolvedThemeMode` (const) - missing @example
- `src/themes/theme-provider.tsx:57` `ResolvedThemeMode` (type) - missing @example
- `src/themes/theme-provider.tsx:77` `resolveThemeMode` (const) - missing @example
- `src/themes/theme.ts:33` `theme` (const) - missing @example
- `src/themes/types.ts:9` `ThemeOptions` (type) - missing @example
- `src/themes/types.ts:17` `ThemeComponents` (type) - missing @example
- `src/themes/typography.ts:89` `typography` (const) - missing @example
- `src/themes/typography.ts:113` `typographyTheme` (const) - missing @example
- `src/types/component.ts:17` `OverridableComponent` (type) - missing summary; missing @example, @category
- `src/types/component.ts:31` `ForwardStyledProps` (type) - missing summary; missing @example, @category
- `src/types/index.ts:5` `export * from "./component";` (re-export) - missing @example

### @beep/repo-cli

Path: `packages/tooling/tool/cli`

Export findings:
- `src/commands/AIDocs/AIDocs.ts:23` `AIDocsError` (class) - missing @example
- `src/commands/AIDocs/AIDocs.ts:37` `AIDocKind` (const) - missing @example
- `src/commands/AIDocs/AIDocs.ts:87` `AIDocKind` (type) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:41` `ConfigUpdateResult` (class) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:58` `ConfigUpdateTarget` (class) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:76` `ConfigUpdateTargetResult` (class) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:99` `ConfigUpdateBatchResult` (class) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:325` `updateTsconfigPackages` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:366` `updateTsconfigPaths` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:420` `updateTstycheConfig` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:530` `updateRootConfigsForTargets` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:572` `checkConfigNeedsUpdateForTargets` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:616` `updateRootConfigs` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:644` `checkConfigNeedsUpdate` (const) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:84` `PlannedFile` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:100` `PlannedSymlink` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:116` `FileGenerationPlanInput` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:134` `GenerationActionKind` (const) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:145` `GenerationActionKind` (type) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:186` `GenerationAction` (const) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:210` `GenerationAction` (type) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:218` `FileGenerationPlan` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:234` `FileGenerationExecutionResult` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:255` `FileGenerationPlanServiceShape` (type) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:269` `FileGenerationPlanService` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:468` `createFileGenerationPlanService` (const) - missing @example
- `src/commands/CreatePackage/Handler.ts:77` `resolveCreatePackageTemplateDir` (const) - missing @example
- `src/commands/CreatePackage/Handler.ts:267` `TemplateContext` (class) - missing @example
- `src/commands/CreatePackage/Handler.ts:544` `createPackageCommand` (const) - missing @example
- `src/commands/CreatePackage/TemplateService.ts:24` `TemplateSpec` (class) - missing @example
- `src/commands/CreatePackage/TemplateService.ts:40` `RenderedTemplate` (class) - missing @example
- `src/commands/CreatePackage/TemplateService.ts:56` `TemplateRenderRequest` (class) - missing @example
- `src/commands/CreatePackage/TemplateService.ts:76` `TemplateServiceShape` (type) - missing @example
- `src/commands/CreatePackage/TemplateService.ts:88` `TemplateService` (class) - missing @example
- `src/commands/CreatePackage/TemplateService.ts:126` `createTemplateService` (const) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:23` `TsMorphMutationKind` (const) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:39` `TsMorphMutationKind` (type) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:113` `TsMorphMutation` (const) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:134` `TsMorphMutation` (type) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:186` `TsMorphMutationOutcome` (type) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:194` `TsMorphIntegrationResult` (class) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:211` `TsMorphMutationAdapter` (type) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:221` `TsMorphIntegrationServiceShape` (type) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:234` `TsMorphIntegrationService` (class) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:258` `createTsMorphIntegrationService` (const) - missing @example
- `src/commands/CreatePackage/index.ts:16` `createPackageCommand` (const) - missing @example
- `src/commands/Docgen/index.ts:607` `docgenCommand` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:85` `DocgenPackageStatus` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:100` `DocgenPackageStatus` (type) - missing @example
- `src/commands/Docgen/internal/Operations.ts:114` `DocgenConfigDocument` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:143` `DocgenWorkspacePackage` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:164` `DocgenIssuePriority` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:175` `DocgenIssuePriority` (type) - missing @example
- `src/commands/Docgen/internal/Operations.ts:183` `DocgenExportKind` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:204` `DocgenExportKind` (type) - missing @example
- `src/commands/Docgen/internal/Operations.ts:212` `DocgenExportAnalysis` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:236` `DocgenAnalysisSummary` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:256` `DocgenPackageAnalysis` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:275` `DocgenGenerationResult` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:295` `DocgenAggregateResult` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1013` `normalizeDocsOutputPath` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1024` `loadDocgenConfigDocument` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1052` `createDocgenConfigDocument` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1095` `discoverDocgenWorkspacePackages` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1138` `resolveDocgenWorkspacePackage` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1190` `analyzePackageDocumentation` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1234` `generateAnalysisReport` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1348` `generateAnalysisJson` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1358` `aggregateGeneratedDocs` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1508` `runDocgenForPackage` (const) - missing @example
- `src/commands/Files/Files.command.ts:386` `filesCommand` (const) - missing @example
- `src/commands/Files/Files.errors.ts:54` `formatPlatformError` (const) - missing @example
- `src/commands/Files/Files.errors.ts:74` `failOnExtensionlessFile` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:24` `PositiveMediaDimension` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:52` `PositiveMediaDimension` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:60` `FileSha256Hash` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:79` `FileSha256Hash` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:87` `NonNegativePixelOffset` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:115` `NonNegativePixelOffset` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:123` `MediaKind` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:135` `MediaKind` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:143` `SupportedMetadataImageExtension` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:163` `SupportedMetadataImageExtension` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:171` `NormalizeImageFormatInput` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:183` `NormalizeImageFormatInput` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:191` `NormalizeImageFormat` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:203` `NormalizeImageFormat` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:211` `NormalizeSkippedReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:231` `NormalizeSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:239` `CreateCaptionFilesSkippedReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:260` `CreateCaptionFilesSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:268` `BorderSide` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:280` `BorderSide` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:288` `BorderDetectionKind` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:307` `BorderDetectionKind` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:315` `DetectBordersSkippedReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:335` `DetectBordersSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:343` `CandidateAssessmentProfile` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:355` `CandidateAssessmentProfile` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:363` `CandidateAssessmentDecision` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:375` `CandidateAssessmentDecision` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:383` `CandidateAssessmentReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:399` `CandidateAssessmentReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:407` `ArchivePoorCandidatesSkippedReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:427` `ArchivePoorCandidatesSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:435` `CandidateRatioThreshold` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:454` `CandidateRatioThreshold` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:462` `BorderDetectionPercentage` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:496` `BorderDetectionPercentage` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:504` `BorderDetectionMaxScanPercentage` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:538` `BorderDetectionMaxScanPercentage` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:546` `BorderDetectionTolerance` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:580` `BorderDetectionTolerance` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:588` `RgbChannel` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:622` `RgbChannel` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:630` `ImageSizeMetadata` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:647` `FfprobeSideData` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:662` `FfprobeStream` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:680` `FfprobeOutput` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:695` `SafeFilePrefix` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:741` `SafeFilePrefix` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:782` `RenamePlanEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:807` `SortAndRenameSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:859` `StripMetadataSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:903` `CreateCaptionFilesOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:921` `CreateCaptionFilesPlanEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:943` `CreateCaptionFilesSkippedEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:965` `CreateCaptionFilesPlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:984` `CreateCaptionFilesSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1004` `NormalizeFilesOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1029` `NormalizeManifestOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1048` `NormalizePlanEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1076` `NormalizeSkippedEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1100` `NormalizePlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1121` `NormalizeSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1150` `NormalizeManifestSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1170` `NormalizeManifest` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1192` `ArchivePoorCandidatesOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1219` `ArchivePoorCandidatesManifestOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1242` `CandidateAssessmentMetrics` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1260` `ArchivedSidecarEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1279` `ArchivePoorCandidatesEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1306` `ArchivePoorCandidatesSkippedEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1327` `ArchivePoorCandidatesPlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1347` `ArchivePoorCandidatesSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1373` `ArchivePoorCandidatesManifestSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1394` `ArchivePoorCandidatesManifest` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1418` `DetectBordersOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1438` `CropBordersOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1458` `RgbColor` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1475` `DetectBorderSideMeasurement` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1496` `DetectBordersEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1519` `DetectBordersSkippedEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1538` `DetectBordersSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1557` `DetectBordersReport` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1577` `CropBordersPlanEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1603` `CropBordersPlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1622` `CropBordersSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1643` `SortableFileCollection` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1659` `RenamePlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1675` `StripMetadataPlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1693` `decodeImageSizeMetadata` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1701` `decodeFfprobeOutputJson` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1709` `decodeRotationNumber` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/commands/Files/Files.schemas.ts:1717` `decodeSafeFilePrefix` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1725` `decodeNormalizeMaxLongEdge` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1733` `decodeArchivePoorCandidatesOptions` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1741` `decodeCreateCaptionFilesOptions` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1749` `decodeDetectBordersOptions` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1757` `decodeCropBordersOptions` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1765` `encodeNormalizeManifest` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1773` `encodeArchivePoorCandidatesManifest` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1781` `encodeDetectBordersReport` (const) - missing @example
- `src/commands/Files/Files.service.ts:146` `FilesCommandServiceShape` (interface) - missing @example
- `src/commands/Files/Files.service.ts:212` `FilesCommandService` (class) - missing @example
- `src/commands/Files/Files.service.ts:2998` `printFilesIndex` (const) - missing @example
- `src/commands/Files/Files.service.ts:3607` `FilesCommandServiceLive` (const) - missing @example
- `src/commands/Files/Files.service.ts:3618` `archivePoorCandidates` (const) - missing @example
- `src/commands/Files/Files.service.ts:3633` `createCaptionFiles` (const) - missing @example
- `src/commands/Files/Files.service.ts:3648` `cropBordersFiles` (const) - missing @example
- `src/commands/Files/Files.service.ts:3663` `detectBordersFiles` (const) - missing @example
- `src/commands/Files/Files.service.ts:3678` `normalizeFiles` (const) - missing @example
- `src/commands/Files/Files.service.ts:3696` `sortAndRenameFiles` (const) - missing @example
- `src/commands/Files/Files.service.ts:3723` `stripMetadataFiles` (const) - resolved
- `src/commands/Files/Files.utils.ts:220` `stringEquivalence` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/commands/Files/Files.utils.ts:228` `isImageFileExtension` (const) - missing @example
- `src/commands/Files/Files.utils.ts:236` `isVideoFileExtension` (const) - missing @example
- `src/commands/Files/Files.utils.ts:244` `isSupportedMetadataImageExtension` (const) - missing @example
- `src/commands/Files/Files.utils.ts:252` `bySizeDescendingThenNameAscending` (const) - missing @example
- `src/commands/Files/Files.utils.ts:263` `byNameAscending` (const) - missing @example
- `src/commands/Files/Files.utils.ts:276` `normalizeBareExtension` (const) - missing @example
- `src/commands/Files/Files.utils.ts:286` `mediaKindFromExtension` (const) - missing @example
- `src/commands/Files/Files.utils.ts:309` `formatIndex` (const) - missing @example
- `src/commands/Files/Files.utils.ts:322` `collectText` (const) - missing @example
- `src/commands/Files/Files.utils.ts:340` `isExifOrientationRotated` (const) - missing @example
- `src/commands/Files/Files.utils.ts:350` `isQuarterTurnRotation` (const) - missing @example
- `src/commands/Files/Files.utils.ts:364` `maybeSwapDimensions` (const) - missing @example
- `src/commands/Files/Files.utils.ts:386` `rotationFromStream` (const) - missing @example
- `src/commands/Files/Files.utils.ts:407` `targetNameForEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:431` `hasSkippedFiles` (const) - missing @example
- `src/commands/Files/Files.utils.ts:441` `selectedCanonicalPathSet` (const) - missing @example
- `src/commands/Files/Files.utils.ts:457` `renderPlanEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:467` `renderStripMetadataPlanEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:478` `renderCreateCaptionFilesPlanEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:489` `renderCreateCaptionFilesSkippedEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:500` `renderNormalizePlanEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:511` `renderNormalizeSkippedEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:522` `normalizeOutputExtension` (const) - missing @example
- `src/commands/Files/Files.utils.ts:532` `sharpFormatForNormalize` (const) - missing @example
- `src/commands/Files/Files.utils.ts:544` `normalizeOutputDimensions` (const) - missing @example
- `src/commands/Files/Files.utils.ts:573` `mediaDimensionsChanged` (const) - missing @example
- `src/commands/Files/Files.utils.ts:589` `roundCandidateMetric` (const) - missing @example
- `src/commands/Files/Files.utils.ts:600` `assessImageCandidate` (const) - missing @example
- `src/commands/Files/Files.utils.ts:644` `renderArchivePoorCandidatesEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:661` `renderArchivePoorCandidatesSkippedEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:672` `rgbToHex` (const) - missing @example
- `src/commands/Files/Files.utils.ts:683` `classifyBorderSides` (const) - missing @example
- `src/commands/Files/Files.utils.ts:729` `analyzeSolidBorders` (const) - missing @example
- `src/commands/Files/Files.utils.ts:746` `renderDetectBordersEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:765` `renderDetectBordersSkippedEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:785` `cropBordersPlanEntryFromDetection` (const) - missing @example
- `src/commands/Files/Files.utils.ts:823` `renderCropBordersPlanEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:836` `makeStripMetadataTempEntries` (const) - missing @example
- `src/commands/Files/Files.utils.ts:861` `isSupportedMetadataImageFile` (const) - missing @example
- `src/commands/Files/index.ts:13` `export * from "./Files.command.js";` (re-export) - missing @example, @category
- `src/commands/Files/index.ts:19` `export * from "./Files.errors.js";` (re-export) - missing @example, @category
- `src/commands/Files/index.ts:25` `export * from "./Files.schemas.js";` (re-export) - missing @example, @category
- `src/commands/Files/index.ts:31` `export * from "./Files.service.js";` (re-export) - missing @example, @category
- `src/commands/Files/index.ts:37` `export * from "./Files.utils.js";` (re-export) - missing @example, @category
- `src/commands/Graphiti/internal/ProxyServices.ts:56` `ContainerHealthState` (const) - 1 schema annotation/type-alias gap(s)
- `src/commands/Graphiti/internal/ProxyServices.ts:72` `DependencyHealthState` (const) - 1 schema annotation/type-alias gap(s)
- `src/commands/Image/index.ts:118` `imageCommand` (const) - resolved
- `src/commands/Quality/Tasks.ts:46` `QualityTaskName` (const) - resolved
- `src/commands/Quality/Tasks.ts:63` `QualityTaskName` (type) - resolved
- `src/commands/Quality/Tasks.ts:80` `PackageTaskProfile` (class) - resolved
- `src/commands/Quality/Tasks.ts:107` `QualityTaskStep` (class) - resolved
- `src/commands/Quality/Tasks.ts:136` `QualityTaskInvocation` (class) - resolved
- `src/commands/Quality/Tasks.ts:664` `sqlIntegrationStepForTesting` (const) - missing @example
- `src/commands/Quality/Tasks.ts:678` `runSqlIntegrationTestLaneForTesting` (const) - missing @example
- `src/commands/Quality/Tasks.ts:819` `rootQualityStepsForTesting` (const) - missing @example
- `src/commands/Quality/Tasks.ts:938` `parseQualityTaskInvocation` (const) - resolved
- `src/commands/Quality/Tasks.ts:982` `runQualityTask` (const) - resolved
- `src/commands/Quality/Tasks.ts:1016` `runQualityTaskIfRequested` (const) - resolved
- `src/commands/Quality/Tasks.ts:1048` `collectStepOutput` (const) - resolved
- `src/commands/Reuse/index.ts:361` `reuseCommand` (const) - missing @example
- `src/commands/Reuse/internal/CodexRunner.ts:23` `CodexRunnerStage` (const) - missing @example
- `src/commands/Reuse/internal/CodexRunner.ts:37` `CodexRunnerStage` (type) - missing @example
- `src/commands/Reuse/internal/CodexRunner.ts:45` `CodexSmokeResult` (class) - missing @example
- `src/commands/Reuse/internal/CodexRunner.ts:64` `CodexRunnerError` (class) - missing @example
- `src/commands/Reuse/internal/CodexRunner.ts:83` `runCodexSmoke` (const) - missing @example
- `src/commands/SyncDataToTs/index.ts:462` `syncDataToTsCommand` (const) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:24` `SyncDataSourceFormat` (const) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:36` `SyncDataSourceFormat` (type) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:46` `SyncDataRunMode` (const) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:58` `SyncDataRunMode` (type) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:66` `SyncDataToTsError` (class) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:86` `SyncDataToTsDriftError` (class) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:104` `SyncDataTargetProjection` (class) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:170` `SyncDataTarget` (const) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:186` `SyncDataTarget` (type) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:194` `SyncDataTargetResult` (class) - missing @example
- `src/commands/SyncDataToTs/targets/Iso4217.ts:28` `ISO4217_SOURCE_URL` (const) - missing @example
- `src/commands/SyncDataToTs/targets/Iso4217.ts:283` `iso4217Target` (const) - missing @example
- `src/commands/SyncDataToTs/targets/index.ts:16` `syncDataTargets` (const) - missing @example
- `src/commands/TsconfigSync.ts:53` `export {
  /**
   * Build canonical tsconfig alias targets from a package root export.
   *
   * @category DomainModel
   * @since 0.0.0
   */
  buildCanonicalAliasTargets,
  /**
   * Resolve the canonical root export target from a package `exports` field.
   *
   * @category DomainModel
   * @since 0.0.0
   */
  resolveRootExportTarget,
} from "./Shared/TsconfigAliasTargets.js";` (re-export) - missing @example
- `src/commands/TsconfigSync.ts:153` `TsconfigSyncDriftError` (class) - missing @example
- `src/commands/TsconfigSync.ts:171` `TsconfigSyncCycleError` (class) - missing @example
- `src/commands/TsconfigSync.ts:189` `TsconfigSyncFilterError` (class) - missing @example
- `src/commands/TsconfigSync.ts:214` `TsconfigSyncMode` (const) - missing @example
- `src/commands/TsconfigSync.ts:268` `TsconfigSyncRunOptions` (const) - missing @example
- `src/commands/TsconfigSync.ts:287` `TsconfigSyncRunOptions` (type) - missing @example
- `src/commands/TsconfigSync.ts:295` `TsconfigSyncSection` (const) - missing @example
- `src/commands/TsconfigSync.ts:315` `TsconfigSyncSection` (type) - missing @example
- `src/commands/TsconfigSync.ts:401` `TsconfigSyncChange` (const) - missing @example
- `src/commands/TsconfigSync.ts:425` `TsconfigSyncChange` (type) - missing @example
- `src/commands/TsconfigSync.ts:526` `PlannedFileChange` (const) - missing @example
- `src/commands/TsconfigSync.ts:550` `PlannedFileChange` (type) - missing @example
- `src/commands/TsconfigSync.ts:592` `TsconfigSyncResult` (const) - missing @example
- `src/commands/TsconfigSync.ts:608` `TsconfigSyncResult` (type) - missing @example
- `src/commands/TsconfigSync.ts:624` `WorkspaceDescriptor` (class) - missing @example
- `src/commands/TsconfigSync.ts:675` `TsconfigWithReferences` (class) - missing @example
- `src/commands/TsconfigSync.ts:690` `TsconfigWithPaths` (class) - missing @example
- `src/commands/TsconfigSync.ts:1695` `syncTsconfigAtRoot` (const) - missing @example
- `src/commands/TsconfigSync.ts:1830` `tsconfigSyncCommand` (const) - missing @example
- `src/commands/VersionSync/index.ts:48` `versionSyncCommand` (const) - missing @example
- `src/commands/VersionSync/internal/Handler.ts:70` `handleVersionSync` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:25` `VersionSyncError` (class) - missing @example
- `src/commands/VersionSync/internal/Models.ts:40` `NetworkUnavailableError` (class) - missing @example
- `src/commands/VersionSync/internal/Models.ts:55` `VersionSyncDriftError` (class) - missing @example
- `src/commands/VersionSync/internal/Models.ts:72` `VersionDriftItem` (class) - missing @example
- `src/commands/VersionSync/internal/Models.ts:98` `VersionCategory` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:116` `VersionCategory` (type) - missing @example
- `src/commands/VersionSync/internal/Models.ts:109` `VersionCategoryOptions` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:130` `VersionCategoryStatus` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:162` `VersionCategoryStatus` (type) - missing @example
- `src/commands/VersionSync/internal/Models.ts:141` `VersionCategoryStatusMatch` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:148` `VersionCategoryStatusEnum` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:155` `VersionCategoryStatusThunk` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:251` `VersionCategoryReport` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:272` `VersionCategoryReport` (type) - missing @example
- `src/commands/VersionSync/internal/Models.ts:280` `VersionSyncReport` (class) - missing @example
- `src/commands/VersionSync/internal/Models.ts:303` `VersionSyncMode` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:322` `VersionSyncMode` (type) - missing @example
- `src/commands/VersionSync/internal/Models.ts:314` `VersionSyncModeMatch` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:381` `VersionSyncOptions` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:397` `VersionSyncOptions` (type) - missing @example
- `src/commands/VersionSync/internal/Models.ts:405` `VersionSyncUpdateLocation` (class) - missing @example
- `src/commands/VersionSync/internal/Models.ts:421` `VersionSyncResolution` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/BiomeResolver.ts:149` `BiomeSchemaState` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/BiomeResolver.ts:169` `resolveBiomeSchema` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/BiomeResolver.ts:244` `buildBiomeReport` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/BiomeResolver.ts:289` `updateBiomeSchema` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/BunResolver.ts:103` `BunSemver` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/BunResolver.ts:257` `BunVersionState` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/BunResolver.ts:280` `resolveBunVersions` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/BunResolver.ts:394` `buildBunReport` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/DockerResolver.ts:129` `DockerImageState` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/DockerResolver.ts:327` `resolveDockerImages` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/DockerResolver.ts:455` `buildDockerReport` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/EffectResolver.ts:63` `EffectCatalogState` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/EffectResolver.ts:153` `resolveEffectCatalog` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/EffectResolver.ts:218` `buildEffectReport` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/NodeResolver.ts:33` `NodeVersionLocation` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/NodeResolver.ts:52` `NodeVersionState` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/NodeResolver.ts:132` `resolveNodeVersions` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/NodeResolver.ts:247` `buildNodeReport` (const) - missing @example
- `src/commands/VersionSync/internal/services/CategorySelectionService.ts:25` `CategorySelectionServiceShape` (type) - missing @example
- `src/commands/VersionSync/internal/services/CategorySelectionService.ts:36` `CategorySelectionService` (class) - missing @example
- `src/commands/VersionSync/internal/services/CategorySelectionService.ts:66` `CategorySelectionServiceLive` (const) - missing @example
- `src/commands/VersionSync/internal/services/ReportRendererService.ts:32` `ReportRendererServiceShape` (type) - missing @example
- `src/commands/VersionSync/internal/services/ReportRendererService.ts:43` `ReportRendererService` (class) - missing @example
- `src/commands/VersionSync/internal/services/ReportRendererService.ts:127` `ReportRendererServiceLive` (const) - missing @example
- `src/commands/VersionSync/internal/services/ResolverService.ts:42` `ResolverServiceShape` (type) - missing @example
- `src/commands/VersionSync/internal/services/ResolverService.ts:55` `ResolverService` (class) - missing @example
- `src/commands/VersionSync/internal/services/ResolverService.ts:153` `ResolverServiceLive` (const) - missing @example
- `src/commands/VersionSync/internal/services/UpdateApplierService.ts:46` `UpdateApplierServiceShape` (type) - missing @example
- `src/commands/VersionSync/internal/services/UpdateApplierService.ts:59` `UpdateApplierService` (class) - missing @example
- `src/commands/VersionSync/internal/services/UpdateApplierService.ts:237` `UpdateApplierServiceLive` (const) - missing @example
- `src/commands/VersionSync/internal/updaters/PackageJsonUpdater.ts:38` `updatePackageManagerField` (const) - missing @example
- `src/commands/VersionSync/internal/updaters/PackageJsonUpdater.ts:94` `updateCatalogEntry` (const) - missing @example
- `src/commands/VersionSync/internal/updaters/PlainTextUpdater.ts:21` `updatePlainTextFile` (const) - missing @example
- `src/commands/VersionSync/internal/updaters/YamlFileUpdater.ts:53` `updateYamlValue` (const) - missing @example
- `src/commands/VersionSync/internal/updaters/YamlFileUpdater.ts:116` `replaceNodeVersionWithFile` (const) - missing @example
- `src/index.ts:19` `export {
  /**
   * Code generation command for workspace barrels and exports.
   *
   * @since 0.0.0
   */
  codegenCommand,
} from "./commands/Codegen.js";` (re-export) - missing @example, @category
- `src/index.ts:32` `export {
  /**
   * Package scaffolding command for creating new workspace packages.
   *
   * @since 0.0.0
   */
  createPackageCommand,
} from "./commands/CreatePackage/index.js";` (re-export) - missing @example, @category
- `src/index.ts:45` `export {
  /**
   * Human-first docgen command group.
   *
   * @since 0.0.0
   */
  docgenCommand,
} from "./commands/Docgen/index.js";` (re-export) - missing @example, @category
- `src/index.ts:58` `export {
  /**
   * Command-first docs discovery command tree.
   *
   * @since 0.0.0
   */
  docsCommand,
} from "./commands/Docs.js";` (re-export) - missing @example, @category
- `src/index.ts:71` `export {
  /**
   * Dataset file curation command group.
   *
   * @since 0.0.0
   */
  filesCommand,
} from "./commands/Files/index.js";` (re-export) - missing @example, @category
- `src/index.ts:84` `export {
  /**
   * Graphiti operational command group.
   *
   * @since 0.0.0
   */
  graphitiCommand,
} from "./commands/Graphiti/index.js";` (re-export) - missing @example, @category
- `src/index.ts:97` `export {
  /**
   * Image and video curation command group.
   *
   * @since 0.0.0
   */
  imageCommand,
} from "./commands/Image/index.js";` (re-export) - missing @example, @category
- `src/index.ts:110` `export {
  /**
   * Effect laws command group.
   *
   * @since 0.0.0
   */
  lawsCommand,
} from "./commands/Laws/index.js";` (re-export) - missing @example, @category
- `src/index.ts:123` `export {
  /**
   * Lint policy command group.
   *
   * @since 0.0.0
   */
  lintCommand,
} from "./commands/Lint/index.js";` (re-export) - missing @example, @category
- `src/index.ts:136` `export {
  /**
   * Purge command for removing root/workspace build artifacts.
   *
   * @since 0.0.0
   */
  purgeCommand,
} from "./commands/Purge.js";` (re-export) - missing @example, @category
- `src/index.ts:149` `export {
  /**
   * Reuse-discovery command group.
   *
   * @since 0.0.0
   */
  reuseCommand,
} from "./commands/Reuse/index.js";` (re-export) - missing @example, @category
- `src/index.ts:162` `export {
  /**
   * Root CLI command that composes subcommands.
   *
   * @since 0.0.0
   */
  rootCommand,
} from "./commands/Root.js";` (re-export) - missing @example, @category
- `src/index.ts:175` `export {
  /**
   * Official data sync command for checked-in generated TypeScript modules.
   *
   * @since 0.0.0
   */
  syncDataToTsCommand,
} from "./commands/SyncDataToTs/index.js";` (re-export) - missing @example, @category
- `src/index.ts:188` `export {
  /**
   * Dependency topological sort command.
   *
   * @since 0.0.0
   */
  topoSortCommand,
} from "./commands/TopoSort.js";` (re-export) - missing @example, @category
- `src/index.ts:201` `export {
  /**
   * Tsconfig sync command for workspace tsconfig references and root aliases.
   *
   * @since 0.0.0
   */
  tsconfigSyncCommand,
} from "./commands/TsconfigSync.js";` (re-export) - missing @example, @category
- `src/index.ts:214` `export {
  /**
   * Version sync command for detecting and fixing version drift.
   *
   * @since 0.0.0
   */
  versionSyncCommand,
} from "./commands/VersionSync/index.js";` (re-export) - missing @example, @category

### @beep/sandbox

Path: `packages/foundation/capability/sandbox`

Module findings:
- `src/AgentStreamEmitter.ts:1` (jsdoc) - missing summary; missing @since
- `src/Display.ts:1` (none) - missing summary; missing @since
- `src/Sandbox.error-handler.ts:1` (none) - missing summary; missing @since

Export findings:
- `src/Agent.provider.ts:64` `ParsedStreamEvent` (const) - missing @example
- `src/Agent.provider.ts:90` `ParsedStreamEvent` (type) - missing @example
- `src/Agent.provider.ts:98` `CodexEffort` (const) - missing @example
- `src/Agent.provider.ts:110` `CodexEffort` (type) - missing @example
- `src/Agent.provider.ts:118` `ClaudeEffort` (const) - missing @example
- `src/Agent.provider.ts:130` `ClaudeEffort` (type) - missing @example
- `src/Agent.provider.ts:138` `AgentCommandOptions` (class) - missing @example
- `src/Agent.provider.ts:155` `PrintCommand` (class) - missing @example
- `src/Agent.provider.ts:171` `IterationUsage` (class) - missing @example
- `src/Agent.provider.ts:189` `CodexOptions` (class) - missing @example
- `src/Agent.provider.ts:205` `ClaudeCodeOptions` (class) - missing @example
- `src/Agent.provider.ts:222` `AgentProvider` (interface) - missing @example
- `src/Agent.provider.ts:238` `DEFAULT_CLAUDE_MODEL` (const) - missing @example
- `src/Agent.provider.ts:458` `codex` (const) - missing @example
- `src/Agent.provider.ts:482` `claudeCode` (const) - missing @example
- `src/AgentStreamEmitter.ts:21` `AgentStreamEvent` (const) - missing @example
- `src/AgentStreamEmitter.ts:48` `AgentStreamEvent` (type) - missing @example
- `src/AgentStreamEmitter.ts:56` `AgentStreamEvent` (namespace) - missing @example
- `src/AgentStreamEmitter.ts:72` `AgentStreamEmitterShape` (interface) - missing @example
- `src/AgentStreamEmitter.ts:82` `AgentStreamEmitter` (class) - missing @example
- `src/AgentStreamEmitter.ts:92` `noopAgentStreamEmitterLayer` (const) - missing @example
- `src/AgentStreamEmitter.ts:107` `callbackAgentStreamEmitterLayer` (const) - missing @example
- `src/Display.ts:18` `Severity` (const) - missing @example
- `src/Display.ts:30` `Severity` (type) - missing @example
- `src/Display.ts:38` `DisplayEntryStatus` (class) - missing @example
- `src/Display.ts:55` `DisplayEntryIntro` (class) - missing @example
- `src/Display.ts:71` `DisplayEntrySpinner` (class) - missing @example
- `src/Display.ts:87` `DisplayEntrySummary` (class) - missing @example
- `src/Display.ts:104` `DisplayEntryTaskLog` (class) - missing @example
- `src/Display.ts:121` `DisplayEntryText` (class) - missing @example
- `src/Display.ts:137` `DisplayEntryToolCall` (class) - missing @example
- `src/Display.ts:154` `DisplayEntry` (const) - missing @example
- `src/Display.ts:174` `DisplayEntry` (type) - missing @example
- `src/Display.ts:182` `DisplayServiceShape` (interface) - missing @example
- `src/Display.ts:207` `Display` (class) - missing @example
- `src/Display.ts:215` `SilentDisplay` (const) - missing @example
- `src/Display.ts:401` `FileDisplay` (const) - missing @example
- `src/Display.ts:431` `terminalStyle` (const) - missing @example
- `src/Display.ts:444` `ClackDisplay` (const) - missing @example
- `src/Env.ts:25` `MergeProviderEnvOptions` (class) - missing @example
- `src/Env.ts:78` `resolveEnv` (const) - missing @example
- `src/Env.ts:109` `mergeProviderEnv` (const) - missing @example
- `src/Orchestrator.ts:31` `IterationResult` (class) - missing @example
- `src/Orchestrator.ts:48` `CommitSummary` (class) - missing @example
- `src/Orchestrator.ts:63` `OrchestrateResult` (class) - missing @example
- `src/Orchestrator.ts:83` `OrchestrateOptions` (interface) - missing @example
- `src/Orchestrator.ts:135` `orchestrate` (const) - missing @example
- `src/Prompt.ts:27` `SHELL_BLOCK_MARKER` (const) - missing @example
- `src/Prompt.ts:35` `BUILT_IN_PROMPT_ARG_KEYS` (const) - missing @example
- `src/Prompt.ts:43` `BuiltInPromptArgKey` (const) - missing @example
- `src/Prompt.ts:55` `BuiltInPromptArgKey` (type) - missing @example
- `src/Prompt.ts:63` `PromptArgValue` (const) - missing @example
- `src/Prompt.ts:75` `PromptArgValue` (type) - missing @example
- `src/Prompt.ts:83` `PromptArgs` (const) - missing @example
- `src/Prompt.ts:95` `PromptArgs` (type) - missing @example
- `src/Prompt.ts:105` `PromptSource` (const) - missing @example
- `src/Prompt.ts:117` `PromptSource` (type) - missing @example
- `src/Prompt.ts:125` `ResolvePromptOptions` (class) - missing @example
- `src/Prompt.ts:141` `ResolvedPrompt` (class) - missing @example
- `src/Prompt.ts:157` `resolvePrompt` (const) - missing @example
- `src/Prompt.ts:184` `validateNoArgsWithInlinePrompt` (const) - missing @example
- `src/Prompt.ts:203` `validateNoBuiltInArgOverride` (const) - missing @example
- `src/Prompt.ts:222` `findMissingPromptArgKeys` (const) - missing @example
- `src/Prompt.ts:251` `substitutePromptArgs` (const) - missing @example
- `src/RecoveryMessage.ts:39` `FailedStep` (type) - missing @example
- `src/Run.ts:51` `DEFAULT_MAX_ITERATIONS` (const) - missing @example
- `src/Run.ts:59` `LoggingOptionKind` (const) - missing @example
- `src/Run.ts:71` `LoggingOptionKind` (type) - missing @example
- `src/Run.ts:79` `Timeouts` (class) - missing @example
- `src/Run.ts:101` `FileLoggingOption` (class) - missing @example
- `src/Run.ts:118` `StdoutLoggingOption` (class) - missing @example
- `src/Run.ts:132` `LoggingOption` (const) - missing @example
- `src/Run.ts:144` `LoggingOption` (type) - missing @example
- `src/Run.ts:152` `RunSummaryRowOptions` (class) - missing @example
- `src/Run.ts:171` `FileDisplayStartupOptions` (class) - missing @example
- `src/Run.ts:189` `RunResult` (class) - missing @example
- `src/Run.ts:215` `RunOptions` (interface) - missing @example
- `src/Run.ts:238` `sanitizeBranchForFilename` (const) - missing @example
- `src/Run.ts:246` `buildLogFilename` (const) - missing @example
- `src/Run.ts:264` `buildRunSummaryRows` (const) - missing @example
- `src/Run.ts:277` `buildCompletionMessage` (const) - missing @example
- `src/Run.ts:297` `formatContextWindowSize` (const) - missing @example
- `src/Run.ts:313` `buildContextWindowLines` (const) - missing @example
- `src/Run.ts:456` `run` (const) - missing @example
- `src/Sandbox.error-handler.ts:11` `formatErrorMessage` (const) - missing @example
- `src/Sandbox.errors.ts:21` `ExecError` (class) - missing @example
- `src/Sandbox.errors.ts:37` `ExecHostError` (class) - missing @example
- `src/Sandbox.errors.ts:53` `CopyError` (class) - missing @example
- `src/Sandbox.errors.ts:67` `DockerError` (class) - missing @example
- `src/Sandbox.errors.ts:81` `PodmanError` (class) - missing @example
- `src/Sandbox.errors.ts:95` `SyncError` (class) - missing @example
- `src/Sandbox.errors.ts:109` `WorktreeError` (class) - missing @example
- `src/Sandbox.errors.ts:123` `PromptError` (class) - missing @example
- `src/Sandbox.errors.ts:137` `AgentError` (class) - missing @example
- `src/Sandbox.errors.ts:153` `ConfigDirError` (class) - missing @example
- `src/Sandbox.errors.ts:167` `InitError` (class) - missing @example
- `src/Sandbox.errors.ts:181` `AgentIdleTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:198` `WorktreeTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:216` `ContainerStartTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:234` `CopyToWorktreeTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:253` `CopyToWorktreeError` (class) - missing @example
- `src/Sandbox.errors.ts:271` `SyncInTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:287` `HookTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:304` `GitSetupTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:321` `PromptExpansionTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:340` `CommitCollectionTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:358` `MergeToHostTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:376` `SessionCaptureError` (class) - missing @example
- `src/Sandbox.errors.ts:392` `CwdError` (class) - missing @example
- `src/Sandbox.errors.ts:408` `SandboxError` (const) - missing @example
- `src/Sandbox.errors.ts:473` `SandboxError` (type) - missing @example
- `src/Sandbox.errors.ts:481` `SandboxError` (namespace) - missing @example
- `src/Sandbox.observability.ts:135` `SandboxPhaseAttributes` (const) - missing @example
- `src/Sandbox.observability.ts:147` `SandboxPhaseAttributes` (type) - missing @example
- `src/Sandbox.process.ts:84` `SandboxProcessShape` (interface) - missing @example
- `src/Sandbox.process.ts:167` `SandboxProcessLive` (const) - missing @example
- `src/Sandbox.provider.ts:23` `SandboxProviderKind` (const) - missing @example
- `src/Sandbox.provider.ts:35` `SandboxProviderKind` (type) - missing @example
- `src/Sandbox.provider.ts:43` `ExecResult` (class) - missing @example
- `src/Sandbox.provider.ts:60` `SandboxExecOptions` (class) - missing @example
- `src/Sandbox.provider.ts:77` `InteractiveExecResult` (class) - missing @example
- `src/Sandbox.provider.ts:92` `InteractiveExecOptions` (interface) - missing @example
- `src/Sandbox.provider.ts:105` `MountEntry` (class) - missing @example
- `src/Sandbox.provider.ts:122` `BindMountCreateOptions` (class) - missing @example
- `src/Sandbox.provider.ts:140` `IsolatedCreateOptions` (class) - missing @example
- `src/Sandbox.provider.ts:155` `HeadBranchStrategy` (class) - missing @example
- `src/Sandbox.provider.ts:169` `MergeToHeadBranchStrategy` (class) - missing @example
- `src/Sandbox.provider.ts:183` `NamedBranchStrategy` (class) - missing @example
- `src/Sandbox.provider.ts:200` `BranchStrategy` (const) - missing @example
- `src/Sandbox.provider.ts:212` `BranchStrategy` (type) - missing @example
- `src/Sandbox.provider.ts:220` `SandboxHandle` (interface) - missing @example
- `src/Sandbox.provider.ts:237` `BindMountSandboxHandle` (interface) - missing @example
- `src/Sandbox.provider.ts:247` `IsolatedSandboxHandle` (interface) - missing @example
- `src/Sandbox.provider.ts:257` `NoSandboxHandle` (interface) - missing @example
- `src/Sandbox.provider.ts:265` `BindMountSandboxProvider` (interface) - missing @example
- `src/Sandbox.provider.ts:279` `IsolatedSandboxProvider` (interface) - missing @example
- `src/Sandbox.provider.ts:292` `NoSandboxProvider` (interface) - missing @example
- `src/Sandbox.provider.ts:308` `SandboxProvider` (type) - missing @example
- `src/Sandbox.provider.ts:319` `BindMountSandboxProviderConfig` (interface) - missing @example
- `src/Sandbox.provider.ts:332` `IsolatedSandboxProviderConfig` (interface) - missing @example
- `src/Sandbox.provider.ts:344` `createBindMountSandboxProvider` (const) - missing @example
- `src/Sandbox.provider.ts:360` `createIsolatedSandboxProvider` (const) - missing @example
- `src/Sandbox.provider.ts:383` `fromPromiseBindMountSandboxProvider` (const) - missing @example
- `src/Sandbox.provider.ts:403` `fromPromiseIsolatedSandboxProvider` (const) - missing @example
- `src/Sandbox.provider.ts:423` `matchSandboxProvider` (const) - missing @example
- `src/Sandbox.providers.ts:48` `NoSandboxOptions` (class) - missing @example
- `src/Sandbox.providers.ts:63` `ContainerProviderOptions` (class) - missing @example
- `src/Sandbox.providers.ts:261` `noSandbox` (const) - missing @example
- `src/Sandbox.providers.ts:313` `docker` (const) - missing @example
- `src/Sandbox.providers.ts:322` `podman` (const) - missing @example
- `src/Session.ts:23` `SessionPathsShape` (interface) - missing @example
- `src/Session.ts:34` `SessionPaths` (class) - missing @example
- `src/Session.ts:42` `SessionStore` (interface) - missing @example
- `src/Session.ts:54` `encodeProjectPath` (const) - missing @example
- `src/Session.ts:62` `sessionPathsLayer` (const) - missing @example
- `src/Session.ts:71` `defaultSessionPathsLayer` (const) - missing @example
- `src/Session.ts:82` `SessionTransferResult` (class) - missing @example
- `src/Session.ts:97` `hostSessionStore` (const) - missing @example
- `src/Session.ts:136` `sandboxSessionStore` (const) - missing @example
- `src/Session.ts:164` `transferSession` (const) - missing @example
- `src/TextDeltaBuffer.ts:52` `TextDeltaFlush` (type) - missing @example
- `src/Worktree.ts:34` `WorktreeInfo` (class) - missing @example
- `src/Worktree.ts:50` `CreateWorktreeInfoOptions` (class) - missing @example
- `src/Worktree.ts:68` `sanitizeName` (const) - missing @example
- `src/Worktree.ts:76` `generateTempBranchName` (const) - missing @example
- `src/Worktree.ts:118` `getCurrentBranch` (const) - missing @example
- `src/Worktree.ts:130` `hasUncommittedChanges` (const) - missing @example
- `src/Worktree.ts:142` `createWorktreeInfo` (const) - missing @example
- `src/Worktree.ts:202` `removeWorktree` (const) - missing @example
- `src/Worktree.ts:215` `pruneStaleWorktrees` (const) - missing @example
- `src/Worktree.ts:241` `collectCommitShas` (const) - missing @example
- `src/createSandbox.ts:29` `CreateSandboxOptions` (interface) - missing @example
- `src/createSandbox.ts:43` `CreateSandboxResult` (class) - missing @example
- `src/createSandbox.ts:59` `createSandbox` (const) - missing @example
- `src/createWorktree.ts:28` `CreateWorktreeOptions` (class) - missing @example
- `src/createWorktree.ts:46` `Worktree` (interface) - missing @example
- `src/createWorktree.ts:67` `CreateWorktreeResult` (class) - missing @example
- `src/createWorktree.ts:83` `createWorktree` (const) - missing @example
- `src/index.ts:29` `export * from "./Agent.provider.ts";` (re-export) - missing @example
- `src/index.ts:37` `export * from "./AgentStreamEmitter.ts";` (re-export) - missing @example
- `src/index.ts:44` `export * from "./createSandbox.ts";` (re-export) - missing @example
- `src/index.ts:51` `export * from "./createWorktree.ts";` (re-export) - missing @example
- `src/index.ts:58` `export * from "./Display.ts";` (re-export) - missing @example
- `src/index.ts:65` `export * from "./Env.ts";` (re-export) - missing @example
- `src/index.ts:72` `export * from "./interactive.ts";` (re-export) - missing @example
- `src/index.ts:79` `export * from "./Orchestrator.ts";` (re-export) - missing @example
- `src/index.ts:86` `export * from "./Prompt.ts";` (re-export) - missing @example
- `src/index.ts:93` `export * from "./RecoveryMessage.ts";` (re-export) - missing @example
- `src/index.ts:100` `export * from "./Run.ts";` (re-export) - missing @example
- `src/index.ts:107` `export * from "./resolveCwd.ts";` (re-export) - missing @example
- `src/index.ts:114` `export * from "./Sandbox.error-handler.ts";` (re-export) - missing @example
- `src/index.ts:121` `export * from "./Sandbox.errors.ts";` (re-export) - missing @example
- `src/index.ts:128` `export * from "./Sandbox.observability.ts";` (re-export) - missing @example
- `src/index.ts:135` `export * from "./Sandbox.process.ts";` (re-export) - missing @example
- `src/index.ts:142` `export * from "./Sandbox.provider.ts";` (re-export) - missing @example
- `src/index.ts:149` `export * from "./Sandbox.providers.ts";` (re-export) - missing @example
- `src/index.ts:156` `export * from "./Session.ts";` (re-export) - missing @example
- `src/index.ts:163` `export * from "./TextDeltaBuffer.ts";` (re-export) - missing @example
- `src/index.ts:170` `export * from "./terminalCleanup.ts";` (re-export) - missing @example
- `src/index.ts:177` `export * from "./Worktree.ts";` (re-export) - missing @example
- `src/interactive.ts:25` `InteractiveResult` (class) - missing @example
- `src/interactive.ts:45` `interactive` (const) - missing @example
- `src/terminalCleanup.ts:29` `TerminalCleanupStdin` (interface) - missing @example
- `src/terminalCleanup.ts:40` `TerminalCleanupStdout` (interface) - missing @example

### @beep/shared-tables

Path: `packages/shared/tables`

Export findings:
- `src/entities/Organization/index.ts:7` `export * from "./Organization.table.js";` (re-export) - missing @example
- `src/entities/index.ts:7` `export * as Organization from "./Organization/index.js";` (re-export) - missing @example
- `src/index.ts:14` `export * as Entities from "./entities/index.ts";` (re-export) - missing @example
- `src/table/Table.ts:14` `export { EntityTable } from "@beep/drizzle";` (re-export) - missing @example
- `src/table/index.ts:14` `export * as Table from "./Table.ts";` (re-export) - missing @example

### @beep/semantic-web

Path: `packages/foundation/capability/semantic-web`

Export findings:
- `src/index.ts:29` `export * from "./iri.ts";` (re-export) - missing @example
- `src/services/canonicalization.ts:47` `CanonicalizationAlgorithm` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/jsonld-context.ts:43` `JsonLdContextErrorReason` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/jsonld-document.ts:45` `JsonLdDocumentErrorReason` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/jsonld-stream-parse.ts:229` `JsonLdStreamParseErrorReason` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/jsonld-stream-serialize.ts:107` `JsonLdStreamSerializeErrorReason` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/provenance.ts:64` `ProvenanceExportProfile` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/shacl-validation.ts:46` `ShaclSeverity` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/sparql-query.ts:42` `SparqlQueryProfile` (const) - 1 schema annotation/type-alias gap(s)

### @beep/nlp

Path: `packages/foundation/capability/nlp`

Export findings:
- `src/Core/Document.ts:42` `DocumentId` (const) - resolved
- `src/Core/Document.ts:64` `DocumentId` (type) - resolved
- `src/Core/Document.ts:79` `DocumentIndex` (type) - resolved
- `src/Core/Document.ts:111` `DocumentIndex` (const) - resolved
- `src/Core/Document.ts:94` `documentIndex` (const) - resolved
- `src/Core/Document.ts:168` `Document` (class) - resolved
- `src/Core/Pattern.ts:78` `WinkPOSTag` (const) - resolved
- `src/Core/Pattern.ts:98` `WinkPOSTag` (type) - resolved
- `src/Core/Pattern.ts:113` `WinkEntityType` (const) - resolved
- `src/Core/Pattern.ts:133` `WinkEntityType` (type) - resolved
- `src/Core/Pattern.ts:159` `POSPatternOption` (const) - resolved
- `src/Core/Pattern.ts:182` `POSPatternOption` (type) - resolved
- `src/Core/Pattern.ts:197` `EntityPatternOption` (const) - resolved
- `src/Core/Pattern.ts:220` `EntityPatternOption` (type) - resolved
- `src/Core/Pattern.ts:235` `LiteralPatternOption` (const) - resolved
- `src/Core/Pattern.ts:259` `LiteralPatternOption` (type) - resolved
- `src/Core/Pattern.ts:274` `POSPatternElement` (class) - resolved
- `src/Core/Pattern.ts:297` `EntityPatternElement` (class) - resolved
- `src/Core/Pattern.ts:320` `LiteralPatternElement` (class) - resolved
- `src/Core/Pattern.ts:343` `PatternElement` (const) - resolved
- `src/Core/Pattern.ts:364` `PatternElement` (type) - resolved
- `src/Core/Pattern.ts:379` `PatternId` (const) - resolved
- `src/Core/Pattern.ts:401` `PatternId` (type) - resolved
- `src/Core/Pattern.ts:416` `MarkRange` (const) - resolved
- `src/Core/Pattern.ts:437` `MarkRange` (type) - resolved
- `src/Core/Pattern.ts:452` `Pattern` (class) - resolved
- `src/Core/PatternBuilders.ts:100` `pos` (function) - resolved
- `src/Core/PatternBuilders.ts:101` `pos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:102` `pos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:125` `entity` (function) - resolved
- `src/Core/PatternBuilders.ts:126` `entity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:127` `entity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:150` `literal` (function) - resolved
- `src/Core/PatternBuilders.ts:151` `literal` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:152` `literal` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:172` `optionalPos` (function) - resolved
- `src/Core/PatternBuilders.ts:173` `optionalPos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:174` `optionalPos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:197` `optionalEntity` (function) - resolved
- `src/Core/PatternBuilders.ts:198` `optionalEntity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:199` `optionalEntity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:222` `optionalLiteral` (function) - resolved
- `src/Core/PatternBuilders.ts:223` `optionalLiteral` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:224` `optionalLiteral` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:250` `make` (const) - resolved
- `src/Core/PatternBuilders.ts:272` `withMark` (const) - resolved
- `src/Core/PatternBuilders.ts:290` `withoutMark` (const) - resolved
- `src/Core/PatternBuilders.ts:311` `addElements` (const) - resolved
- `src/Core/PatternBuilders.ts:332` `prependElements` (const) - resolved
- `src/Core/PatternBuilders.ts:353` `withId` (const) - resolved
- `src/Core/PatternBuilders.ts:371` `hasMark` (const) - resolved
- `src/Core/PatternBuilders.ts:386` `getMark` (const) - resolved
- `src/Core/PatternBuilders.ts:402` `length` (const) - resolved
- `src/Core/PatternBuilders.ts:417` `elements` (const) - resolved
- `src/Core/PatternBuilders.ts:432` `elementAt` (const) - resolved
- `src/Core/PatternBuilders.ts:456` `isEmpty` (const) - resolved
- `src/Core/PatternBuilders.ts:471` `head` (const) - resolved
- `src/Core/PatternBuilders.ts:486` `last` (const) - resolved
- `src/Core/PatternBuilders.ts:501` `mapElements` (const) - resolved
- `src/Core/PatternBuilders.ts:522` `filterElements` (const) - resolved
- `src/Core/PatternBuilders.ts:543` `take` (const) - resolved
- `src/Core/PatternBuilders.ts:564` `drop` (const) - resolved
- `src/Core/PatternBuilders.ts:585` `combine` (const) - resolved
- `src/Core/PatternBuilders.ts:607` `PatternPatch` (type) - resolved
- `src/Core/PatternBuilders.ts:622` `applyPatch` (const) - resolved
- `src/Core/PatternBuilders.ts:640` `composePatches` (const) - resolved
- `src/Core/PatternBuilders.ts:656` `patchReplaceLiteralAt` (const) - resolved
- `src/Core/PatternBuilders.ts:682` `patchReplaceAllLiterals` (const) - resolved
- `src/Core/PatternBuilders.ts:705` `generalizeLiterals` (const) - resolved
- `src/Core/PatternOperations.ts:27` `isPOSElement` (const) - resolved
- `src/Core/PatternOperations.ts:43` `isEntityElement` (const) - resolved
- `src/Core/PatternOperations.ts:59` `isLiteralElement` (const) - resolved
- `src/Core/PatternOperations.ts:75` `extractElementValues` (const) - resolved
- `src/Core/PatternOperations.ts:90` `extractBracketContent` (const) - resolved
- `src/Core/PatternOperations.ts:106` `splitBracketValues` (const) - resolved
- `src/Core/PatternOperations.ts:121` `joinBracketValues` (const) - resolved
- `src/Core/PatternParsers.ts:107` `BracketStringToPOSPatternElement` (const) - 1 schema annotation/type-alias gap(s)
- `src/Core/PatternParsers.ts:138` `BracketStringToEntityPatternElement` (const) - 1 schema annotation/type-alias gap(s)
- `src/Core/PatternParsers.ts:171` `BracketStringToLiteralPatternElement` (const) - 1 schema annotation/type-alias gap(s)
- `src/Core/PatternParsers.ts:204` `BracketStringToPatternElement` (const) - resolved
- `src/Core/PatternParsers.ts:229` `BracketStringToPatternElement` (type) - resolved
- `src/Core/PatternParsers.ts:244` `PatternFromString` (const) - resolved
- `src/Core/Sentence.ts:35` `SentenceIndex` (type) - resolved
- `src/Core/Sentence.ts:67` `SentenceIndex` (const) - resolved
- `src/Core/Sentence.ts:50` `sentenceIndex` (const) - resolved
- `src/Core/Sentence.ts:82` `Sentence` (class) - resolved
- `src/Core/Token.ts:30` `TokenIndex` (type) - resolved
- `src/Core/Token.ts:75` `TokenIndex` (const) - resolved
- `src/Core/Token.ts:45` `isTokenIndex` (const) - resolved
- `src/Core/Token.ts:60` `tokenIndex` (const) - resolved
- `src/Core/Token.ts:90` `CharPosition` (type) - resolved
- `src/Core/Token.ts:137` `CharPosition` (const) - resolved
- `src/Core/Token.ts:105` `isCharPosition` (const) - resolved
- `src/Core/Token.ts:120` `charPosition` (const) - resolved
- `src/Core/Token.ts:152` `Token` (class) - resolved
- `src/Core/Tokenization.ts:38` `TokenizationError` (class) - resolved
- `src/Core/Tokenization.ts:62` `Tokenization` (class) - resolved
- `src/Core/Tokenization.ts:77` `tokenize` (const) - resolved
- `src/Core/Tokenization.ts:95` `sentences` (const) - resolved
- `src/Core/Tokenization.ts:113` `tokenizeToDocument` (const) - resolved
- `src/Core/Tokenization.ts:134` `tokenCount` (const) - resolved
- `src/Core/index.ts:11` `export * from "./Document.ts";` (re-export) - missing @example
- `src/Core/index.ts:16` `export * from "./Pattern.ts";` (re-export) - missing @example
- `src/Core/index.ts:21` `export * from "./PatternBuilders.ts";` (re-export) - missing @example
- `src/Core/index.ts:26` `export * from "./PatternOperations.ts";` (re-export) - missing @example
- `src/Core/index.ts:31` `export * from "./PatternParsers.ts";` (re-export) - missing @example
- `src/Core/index.ts:36` `export * from "./Sentence.ts";` (re-export) - missing @example
- `src/Core/index.ts:41` `export * from "./Token.ts";` (re-export) - missing @example
- `src/Core/index.ts:46` `export * from "./Tokenization.ts";` (re-export) - missing @example
- `src/Layers/index.ts:25` `NLPBaseLive` (const) - resolved
- `src/Layers/index.ts:40` `TokenizationModuleLive` (const) - resolved
- `src/Layers/index.ts:55` `NLPAppLive` (const) - resolved
- `src/Tools/BowCosineSimilarity.ts:58` `BowCosineSimilarity` (const) - resolved
- `src/Tools/ChunkBySentences.ts:57` `ChunkBySentences` (const) - resolved
- `src/Tools/CorpusStats.ts:49` `CorpusStats` (const) - resolved
- `src/Tools/CreateCorpus.ts:64` `CreateCorpus` (const) - resolved
- `src/Tools/DeleteCorpus.ts:48` `DeleteCorpus` (const) - resolved
- `src/Tools/DocumentStats.ts:40` `DocumentStats` (const) - resolved
- `src/Tools/ExtractEntities.ts:65` `ExtractEntities` (const) - resolved
- `src/Tools/ExtractKeywords.ts:55` `ExtractKeywords` (const) - resolved
- `src/Tools/LearnCorpus.ts:68` `LearnCorpus` (const) - resolved
- `src/Tools/LearnCustomEntities.ts:83` `LearnCustomEntities` (const) - resolved
- `src/Tools/NGrams.ts:71` `NGrams` (const) - resolved
- `src/Tools/NlpToolkit.ts:335` `NlpTools` (const) - resolved
- `src/Tools/NlpToolkit.ts:370` `NlpToolkit` (const) - resolved
- `src/Tools/NlpToolkit.ts:385` `NlpToolkitLive` (const) - resolved
- `src/Tools/PhoneticMatch.ts:58` `PhoneticMatch` (const) - resolved
- `src/Tools/QueryCorpus.ts:75` `QueryCorpus` (const) - resolved
- `src/Tools/RankByRelevance.ts:63` `RankByRelevance` (const) - resolved
- `src/Tools/Sentences.ts:50` `Sentences` (const) - resolved
- `src/Tools/TextSimilarity.ts:58` `TextSimilarity` (const) - resolved
- `src/Tools/Tokenize.ts:50` `Tokenize` (const) - resolved
- `src/Tools/ToolExport.ts:85` `ExportedToolError` (class) - resolved
- `src/Tools/ToolExport.ts:131` `ExportedTool` (interface) - resolved
- `src/Tools/ToolExport.ts:279` `exportTools` (const) - resolved
- `src/Tools/TransformText.ts:79` `TransformText` (const) - resolved
- `src/Tools/TverskySimilarity.ts:71` `TverskySimilarity` (const) - resolved
- `src/Tools/_schemas.ts:59` `AiToken` (class) - resolved
- `src/Tools/_schemas.ts:90` `AiSentence` (class) - resolved
- `src/Tools/_schemas.ts:116` `AiKeyword` (class) - resolved
- `src/Tools/_schemas.ts:139` `AiDocumentStats` (class) - resolved
- `src/Tools/_schemas.ts:164` `AiSentenceChunk` (class) - resolved
- `src/Tools/_schemas.ts:190` `AiRankedText` (class) - resolved
- `src/Tools/_schemas.ts:213` `AiEntity` (class) - resolved
- `src/Tools/_schemas.ts:241` `AiNGram` (class) - resolved
- `src/Tools/_schemas.ts:264` `AiPhoneticMatch` (class) - resolved
- `src/Tools/_schemas.ts:290` `AiCorpusConfig` (class) - resolved
- `src/Tools/_schemas.ts:315` `AiCorpusSummary` (class) - resolved
- `src/Tools/_schemas.ts:341` `AiCorpusRankedDocument` (class) - resolved
- `src/Tools/_schemas.ts:366` `AiCorpusIdf` (class) - resolved
- `src/Tools/_schemas.ts:389` `AiCorpusMatrixShape` (class) - resolved
- `src/Tools/_schemas.ts:412` `AiCorpusStats` (class) - resolved
- `src/Wink/Layer.ts:33` `WinkLayerLive` (const) - resolved
- `src/Wink/Layer.ts:56` `WinkLayerAllLive` (const) - resolved
- `src/Wink/WinkCorpusManager.ts:264` `CorpusManagerError` (class) - resolved
- `src/Wink/WinkCorpusManager.ts:727` `WinkCorpusManager` (class) - resolved
- `src/Wink/WinkCorpusManager.ts:744` `WinkCorpusManagerLive` (const) - resolved
- `src/Wink/WinkEngine.ts:51` `InstanceId` (const) - resolved
- `src/Wink/WinkEngine.ts:73` `InstanceId` (type) - resolved
- `src/Wink/WinkEngine.ts:88` `WinkEngineState` (class) - resolved
- `src/Wink/WinkEngine.ts:111` `WinkEngineRuntimeState` (type) - resolved
- `src/Wink/WinkEngine.ts:240` `WinkEngine` (class) - resolved
- `src/Wink/WinkEngine.ts:255` `WinkEngineLive` (const) - resolved
- `src/Wink/WinkEngineRef.ts:56` `WinkEngineRef` (class) - resolved
- `src/Wink/WinkEngineRef.ts:71` `WinkEngineRefLive` (const) - resolved
- `src/Wink/WinkErrors.ts:37` `WinkEngineError` (class) - resolved
- `src/Wink/WinkErrors.ts:82` `WinkTokenizationError` (class) - resolved
- `src/Wink/WinkErrors.ts:131` `WinkEntityError` (class) - resolved
- `src/Wink/WinkErrors.ts:180` `WinkError` (type) - resolved
- `src/Wink/WinkPattern.ts:63` `EntityGroupName` (const) - resolved
- `src/Wink/WinkPattern.ts:85` `EntityGroupName` (type) - resolved
- `src/Wink/WinkPattern.ts:100` `CustomEntityExample` (class) - resolved
- `src/Wink/WinkPattern.ts:144` `WinkEngineCustomEntities` (class) - resolved
- `src/Wink/WinkSimilarity.ts:74` `TverskyParams` (class) - resolved
- `src/Wink/WinkSimilarity.ts:101` `DocumentTermSet` (class) - resolved
- `src/Wink/WinkSimilarity.ts:128` `SimilarityScore` (class) - resolved
- `src/Wink/WinkSimilarity.ts:158` `SimilarityError` (class) - resolved
- `src/Wink/WinkSimilarity.ts:285` `WinkSimilarity` (class) - resolved
- `src/Wink/WinkSimilarity.ts:300` `WinkSimilarityLive` (const) - resolved
- `src/Wink/WinkTokenizer.ts:45` `SentenceSpanFailure` (class) - resolved
- `src/Wink/WinkTokenizer.ts:339` `WinkTokenization` (const) - resolved
- `src/Wink/WinkTokenizer.ts:354` `WinkTokenizationLive` (const) - resolved
- `src/Wink/WinkUtils.ts:118` `WinkUtilsError` (class) - resolved
- `src/Wink/WinkUtils.ts:242` `WinkUtils` (class) - resolved
- `src/Wink/WinkUtils.ts:257` `WinkUtilsLive` (const) - resolved
- `src/Wink/WinkVectorizer.ts:79` `ScopedVectorizer` (interface) - resolved
- `src/Wink/WinkVectorizer.ts:116` `BM25Norm` (const) - resolved
- `src/Wink/WinkVectorizer.ts:191` `BM25Config` (class) - resolved
- `src/Wink/WinkVectorizer.ts:220` `DefaultBM25Config` (const) - resolved
- `src/Wink/WinkVectorizer.ts:240` `DocumentVector` (class) - resolved
- `src/Wink/WinkVectorizer.ts:268` `BagOfWords` (class) - resolved
- `src/Wink/WinkVectorizer.ts:295` `TermFrequency` (class) - resolved
- `src/Wink/WinkVectorizer.ts:322` `VectorizerError` (class) - resolved
- `src/Wink/WinkVectorizer.ts:525` `WinkVectorizer` (class) - resolved
- `src/Wink/WinkVectorizer.ts:540` `WinkVectorizerLive` (const) - resolved
- `src/Wink/index.ts:38` `export * from "./WinkCorpusManager.ts";` (re-export) - missing @example
- `src/Wink/index.ts:43` `export * from "./WinkEngine.ts";` (re-export) - missing @example
- `src/Wink/index.ts:72` `export * from "./WinkErrors.ts";` (re-export) - missing @example
- `src/Wink/index.ts:77` `export * from "./WinkPattern.ts";` (re-export) - missing @example
- `src/Wink/index.ts:82` `export * from "./WinkSimilarity.ts";` (re-export) - missing @example
- `src/Wink/index.ts:87` `export * from "./WinkTokenizer.ts";` (re-export) - missing @example
- `src/Wink/index.ts:92` `export * from "./WinkUtils.ts";` (re-export) - missing @example
- `src/Wink/index.ts:97` `export * from "./WinkVectorizer.ts";` (re-export) - missing @example

### @beep/codedank-web

Path: `apps/codedank-web`

Export findings:
- `src/app/layout.tsx:41` `default` (function) - missing @example
- `src/app/layout.tsx:29` `metadata` (const) - missing @example
- `src/app/manifest.ts:16` `default` (function) - missing @example
- `src/app/page.tsx:17` `default` (function) - missing @example
- `src/mdx-components.tsx:18` `useMDXComponents` (function) - missing @example

### @beep/fixture-lab-specimen-client

Path: `packages/fixture-lab/specimen/client`

Export findings:
- `src/entities/Specimen/Specimen.command-client.ts:58` `SpecimenCommandTransport` (interface) - 1 unsafe example violation(s)
- `src/entities/Specimen/Specimen.command-client.ts:79` `SpecimenCommandClient` (interface) - 1 unsafe example violation(s)
- `src/entities/Specimen/Specimen.command-client.ts:104` `makeSpecimenCommandClient` (const) - 1 unsafe example violation(s)
- `src/entities/Specimen/Specimen.query-client.ts:58` `SpecimenQueryTransport` (interface) - 1 unsafe example violation(s)
- `src/entities/Specimen/Specimen.query-client.ts:79` `SpecimenQueryClient` (interface) - 1 unsafe example violation(s)
- `src/entities/Specimen/Specimen.query-client.ts:103` `makeSpecimenQueryClient` (const) - 1 unsafe example violation(s)
- `src/entities/Specimen/Specimen.service.ts:75` `SpecimenClientTransport` (interface) - 1 unsafe example violation(s)
- `src/entities/Specimen/Specimen.service.ts:96` `SpecimenClient` (interface) - 1 unsafe example violation(s)
- `src/entities/Specimen/Specimen.service.ts:118` `makeSpecimenClient` (const) - 1 unsafe example violation(s)

### @beep/postgres

Path: `packages/drivers/postgres`

Export findings:
- `src/index.ts:14` `export * from "./Postgres.client.ts";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./Postgres.drizzle.ts";` (re-export) - missing @example
- `src/index.ts:30` `export * from "./Postgres.errors.ts";` (re-export) - missing @example
- `src/index.ts:38` `export * from "./Postgres.format.ts";` (re-export) - missing @example
- `src/index.ts:46` `export * from "./Postgres.sqlstate.ts";` (re-export) - missing @example

