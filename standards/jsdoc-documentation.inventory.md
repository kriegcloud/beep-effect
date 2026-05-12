# JSDoc Documentation Compliance Inventory

Generated: 2026-05-12T03:19:48.260Z

## Scope

The package universe is the current `bun run topo-sort` output. This inventory checks repo JSDoc rules that package docgen does not fully validate yet: required export tags, summaries, TSDoc grammar, forbidden legacy tags, example import aliases, unsafe examples, root TSDoc custom tag registration, and schema annotation/type-alias gaps.

## Totals

| Metric | Count |
|---|---:|
| packages | 57 |
| cleanPackages | 20 |
| packagesWithoutPublicSrcSurface | 1 |
| packagesNeedingRemediation | 36 |
| publicModules | 850 |
| publicExports | 5934 |
| openModules | 123 |
| openExports | 2603 |
| missingExportExamples | 2414 |
| missingExportCategories | 50 |
| missingExportSince | 48 |
| forbiddenTagFindings | 15 |
| malformedConditionalTagFindings | 0 |
| exampleImportFindings | 22 |
| unsafeExampleFindings | 71 |
| schemaAnnotationFindings | 131 |
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
| 2 | `@beep/identity` | `packages/foundation/modeling/identity` | needs-remediation | 3 | 87 | 0 | 24 |
| 3 | `@beep/utils` | `packages/foundation/modeling/utils` | needs-remediation | 20 | 135 | 2 | 40 |
| 4 | `@beep/data` | `packages/foundation/primitive/data` | clean | 7 | 39 | 0 | 0 |
| 5 | `@beep/messages` | `packages/foundation/modeling/messages` | needs-remediation | 2 | 6 | 0 | 1 |
| 6 | `@beep/schema` | `packages/foundation/modeling/schema` | needs-remediation | 132 | 1283 | 7 | 1044 |
| 7 | `@beep/architecture-lab-domain` | `packages/architecture-lab/domain` | needs-remediation | 6 | 25 | 0 | 24 |
| 8 | `@beep/colors` | `packages/foundation/capability/colors` | clean | 1 | 9 | 0 | 0 |
| 9 | `@beep/test-utils` | `packages/tooling/test-kit/test-utils` | needs-remediation | 2 | 21 | 0 | 6 |
| 10 | `@beep/shared-domain` | `packages/shared/domain` | needs-remediation | 34 | 187 | 0 | 9 |
| 11 | `@beep/chalk` | `packages/foundation/capability/chalk` | clean | 1 | 35 | 0 | 0 |
| 12 | `@beep/repo-utils` | `packages/tooling/library/repo-utils` | needs-remediation | 58 | 613 | 2 | 74 |
| 13 | `@beep/duckdb` | `packages/drivers/duckdb` | needs-remediation | 4 | 15 | 0 | 3 |
| 14 | `@beep/architecture-lab-config` | `packages/architecture-lab/config` | needs-remediation | 9 | 20 | 0 | 18 |
| 15 | `@beep/architecture-lab-tables` | `packages/architecture-lab/tables` | needs-remediation | 4 | 12 | 0 | 11 |
| 16 | `@beep/architecture-lab-use-cases` | `packages/architecture-lab/use-cases` | needs-remediation | 9 | 32 | 0 | 31 |
| 17 | `@beep/postgres` | `packages/drivers/postgres` | needs-remediation | 7 | 35 | 0 | 5 |
| 18 | `@beep/workspace-domain` | `packages/workspace/domain` | clean | 21 | 40 | 0 | 0 |
| 19 | `@beep/drizzle` | `packages/drivers/drizzle` | needs-remediation | 4 | 15 | 0 | 3 |
| 20 | `@beep/repo-docgen` | `packages/tooling/tool/docgen` | needs-remediation | 8 | 66 | 0 | 21 |
| 21 | `@beep/repo-ai-metrics` | `packages/tooling/library/ai-metrics` | clean | 14 | 168 | 0 | 0 |
| 22 | `@beep/ffmpeg` | `packages/drivers/ffmpeg` | needs-remediation | 4 | 38 | 0 | 6 |
| 23 | `@beep/observability` | `packages/foundation/capability/observability` | needs-remediation | 23 | 134 | 3 | 30 |
| 24 | `@beep/repo-configs` | `packages/tooling/policy-pack/repo-configs` | needs-remediation | 24 | 130 | 0 | 5 |
| 25 | `@beep/openai-compat` | `packages/drivers/openai-compat` | clean | 4 | 50 | 0 | 0 |
| 26 | `@beep/ui` | `packages/foundation/ui-system/ui` | needs-remediation | 119 | 508 | 109 | 504 |
| 27 | `@beep/law-practice-domain` | `packages/law-practice/domain` | clean | 14 | 25 | 0 | 0 |
| 28 | `@beep/agent-capability-use-cases` | `packages/agent-capability/use-cases` | needs-remediation | 13 | 47 | 0 | 11 |
| 29 | `@beep/agent-capability-domain` | `packages/agent-capability/domain` | clean | 7 | 12 | 0 | 0 |
| 30 | `@beep/epistemic-domain` | `packages/epistemic/domain` | clean | 13 | 21 | 0 | 0 |
| 31 | `@beep/wealth-management-domain` | `packages/wealth-management/domain` | clean | 14 | 25 | 0 | 0 |
| 32 | `@beep/architecture-lab-ui` | `packages/architecture-lab/ui` | needs-remediation | 3 | 7 | 0 | 6 |
| 33 | `@beep/architecture-lab-server` | `packages/architecture-lab/server` | needs-remediation | 9 | 22 | 0 | 21 |
| 34 | `@beep/root` | `.` | no-public-src-surface | 0 | 0 | 0 | 0 |
| 35 | `@beep/workspace-tables` | `packages/workspace/tables` | needs-remediation | 7 | 10 | 0 | 2 |
| 36 | `@beep/db-admin` | `packages/_internal/db-admin` | needs-remediation | 4 | 7 | 0 | 6 |
| 37 | `@beep/architecture-lab-client` | `packages/architecture-lab/client` | needs-remediation | 3 | 7 | 0 | 6 |
| 38 | `@beep/repo-cli` | `packages/tooling/tool/cli` | needs-remediation | 72 | 524 | 0 | 375 |
| 39 | `@beep/shared-server` | `packages/shared/server` | clean | 1 | 1 | 0 | 0 |
| 40 | `@beep/shared-config` | `packages/shared/config` | clean | 1 | 1 | 0 | 0 |
| 41 | `@beep/sandbox` | `packages/foundation/capability/sandbox` | needs-remediation | 29 | 290 | 0 | 248 |
| 42 | `@beep/shared-use-cases` | `packages/shared/use-cases` | clean | 1 | 1 | 0 | 0 |
| 43 | `@beep/shared-tables` | `packages/shared/tables` | needs-remediation | 11 | 14 | 0 | 11 |
| 44 | `@beep/md` | `packages/foundation/capability/md` | clean | 5 | 131 | 0 | 0 |
| 45 | `@beep/semantic-web` | `packages/foundation/capability/semantic-web` | needs-remediation | 29 | 256 | 0 | 9 |
| 46 | `@beep/venice-ai` | `packages/drivers/venice-ai` | clean | 3 | 35 | 0 | 0 |
| 47 | `@beep/op-ip-web` | `apps/op-ip-web` | needs-remediation | 5 | 6 | 0 | 5 |
| 48 | `@beep/professional-runtime-proof` | `apps/professional-runtime-proof` | clean | 1 | 4 | 0 | 0 |
| 49 | `@beep/acp` | `packages/drivers/acp` | needs-remediation | 10 | 406 | 0 | 1 |
| 50 | `@beep/nlp` | `packages/foundation/capability/nlp` | needs-remediation | 49 | 278 | 0 | 31 |
| 51 | `@beep/infra` | `infra` | clean | 2 | 10 | 0 | 0 |
| 52 | `@beep/codedank-web` | `apps/codedank-web` | needs-remediation | 5 | 6 | 0 | 5 |
| 53 | `@beep/xai` | `packages/drivers/xai` | clean | 7 | 62 | 0 | 0 |
| 54 | `@beep/architecture-lab-proof` | `apps/architecture-lab-proof` | needs-remediation | 1 | 4 | 0 | 3 |
| 55 | `@beep/shared-client` | `packages/shared/client` | clean | 1 | 1 | 0 | 0 |
| 56 | `@beep/openai` | `packages/drivers/openai` | needs-remediation | 1 | 1 | 0 | 1 |
| 57 | `@beep/shared-ui` | `packages/shared/ui` | clean | 4 | 7 | 0 | 0 |

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
- `src/Id.ts:119` `IdentityInterpolationError` (class) - 1 schema annotation/type-alias gap(s)
- `src/Id.ts:150` `IdentitySegmentCountError` (class) - 1 schema annotation/type-alias gap(s)
- `src/Id.ts:381` `IdentityString` (type) - 1 unsafe example violation(s)
- `src/Id.ts:398` `IdentitySymbol` (type) - 1 unsafe example violation(s)
- `src/packages.ts:640` `RepoPkgs` (const) - missing @example
- `src/packages.ts:646` `$MdId` (const) - missing summary; missing @example
- `src/packages.ts:652` `$CodedankWebId` (const) - missing summary; missing @example
- `src/packages.ts:658` `$OpIpWebId` (const) - missing summary; missing @example
- `src/packages.ts:664` `$DrizzleId` (const) - missing summary; missing @example
- `src/packages.ts:670` `$DuckdbId` (const) - missing summary; missing @example
- `src/packages.ts:676` `$FfmpegId` (const) - missing summary; missing @example
- `src/packages.ts:682` `$PostgresId` (const) - missing summary; missing @example
- `src/packages.ts:845` `$OpenaiId` (const) - missing summary; missing @example
- `src/packages.ts:851` `$VeniceAiId` (const) - missing summary; missing @example
- `src/packages.ts:857` `$XaiId` (const) - missing summary; missing @example
- `src/packages.ts:895` `$WorkspaceTablesId` (const) - missing summary; missing @example
- `src/packages.ts:901` `$ArchitectureLabDomainId` (const) - missing summary; missing @example
- `src/packages.ts:908` `$ArchitectureLabUseCasesId` (const) - missing summary; missing @example
- `src/packages.ts:915` `$ArchitectureLabConfigId` (const) - missing summary; missing @example
- `src/packages.ts:922` `$ArchitectureLabServerId` (const) - missing summary; missing @example
- `src/packages.ts:929` `$ArchitectureLabTablesId` (const) - missing summary; missing @example
- `src/packages.ts:936` `$ArchitectureLabClientId` (const) - missing summary; missing @example
- `src/packages.ts:943` `$ArchitectureLabUiId` (const) - missing summary; missing @example
- `src/packages.ts:950` `$ArchitectureLabProofId` (const) - missing summary; missing @example

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
- `src/Event.ts:18` `export * from "effect/unstable/encoding/Sse";` (re-export) - missing @example
- `src/Event.ts:72` `makeEvent` (const) - missing @example
- `src/Function.ts:60` `tuple` (function) - forbidden @template
- `src/Function.ts:86` `tupledCurry` (function) - forbidden @template
- `src/Function.ts:112` `reverseCurry` (function) - forbidden @template
- `src/Function.ts:137` `curry` (function) - forbidden @template
- `src/Function.ts:162` `uncurry` (function) - forbidden @template
- `src/Function.ts:192` `lazy` (function) - forbidden @template
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
- `src/index.ts:90` `export * as Str from "./Str.ts";` (re-export) - missing @example
- `src/index.ts:97` `export * as Stream from "./Stream.ts";` (re-export) - missing @example
- `src/index.ts:104` `export * as Struct from "./Struct.ts";` (re-export) - missing @example
- `src/index.ts:111` `export * as Text from "./Text.ts";` (re-export) - missing @example
- `src/index.ts:118` `export * from "./thunk.ts";` (re-export) - missing @example

### @beep/messages

Path: `packages/foundation/modeling/messages`

Export findings:
- `src/i18n.ts:195` `logIssues` (const) - missing @example

### @beep/schema

Path: `packages/foundation/modeling/schema`

Module findings:
- `src/Sql/Constants.ts:1` (jsdoc) - missing summary
- `src/Sql/index.ts:1` (jsdoc) - missing summary
- `src/VariantSchema.ts:1` (jsdoc) - missing summary
- `src/http/headers/_internal/index.ts:1` (jsdoc) - missing summary
- `src/location/CardinalDirection.ts:1` (packageDocumentation) - missing summary
- `src/person/Age.ts:1` (packageDocumentation) - missing summary
- `src/person/Sex.ts:1` (packageDocumentation) - missing summary

Export findings:
- `src/ArrayOf.ts:40` `ArrayOfStrings` (type) - missing @example
- `src/ArrayOf.ts:69` `NonEmptyArrayOfStrings` (type) - missing @example
- `src/ArrayOf.ts:98` `ArrayOfNonEmptyStrings` (type) - missing @example
- `src/ArrayOf.ts:127` `NonEmptyArrayOfNonEmptyStrings` (type) - missing @example
- `src/ArrayOf.ts:156` `ArrayOfNumbers` (type) - missing @example
- `src/ArrayOf.ts:185` `NonEmptyArrayOfNumbers` (type) - missing @example
- `src/ArrayOf.ts:214` `ArrayOfInts` (type) - missing @example
- `src/ArrayOf.ts:243` `NonEmptyArrayOfInts` (type) - missing @example
- `src/BigDecimal.ts:33` `BigDecimalFromNumber` (const) - 1 schema annotation/type-alias gap(s)
- `src/BufferEncoding.ts:27` `BuffEncoding` (const) - 1 schema annotation/type-alias gap(s)
- `src/CommonTextSchemas.ts:65` `TrimmedNonEmptyText` (type) - 1 unsafe example violation(s)
- `src/CommonTextSchemas.ts:110` `CommaSeparatedList` (type) - 1 unsafe example violation(s)
- `src/Cuid.ts:19` `sha512` (const) - missing @example
- `src/Cuid.ts:34` `Cuid` (const) - missing @example
- `src/Cuid.ts:45` `Cuid` (type) - missing @example
- `src/Cuid.ts:53` `isCuid` (const) - missing @example
- `src/Cuid.ts:62` `CuidSeed` (type) - missing @example
- `src/Cuid.ts:75` `CuidState` (class) - missing @example
- `src/Cuid.ts:116` `cuid` (const) - missing @example
- `src/CurrencyCode.ts:51` `CurrencyCode` (type) - 1 unsafe example violation(s)
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
- `src/EntitySchema.ts:31` `Fields` (type) - missing @example
- `src/EntitySchema.ts:39` `EntityVariantFieldInput` (type) - missing @example
- `src/EntitySchema.ts:51` `EntityFieldInput` (type) - missing @example
- `src/EntitySchema.ts:59` `EntityFieldInputs` (type) - missing @example
- `src/EntitySchema.ts:67` `SelectedFieldOf` (type) - missing @example
- `src/EntitySchema.ts:83` `SelectedFieldsOf` (type) - missing @example
- `src/EntitySchema.ts:93` `StorageKind` (const) - missing @example
- `src/EntitySchema.ts:115` `StorageKind` (type) - missing @example
- `src/EntitySchema.ts:123` `ValueStrategy` (const) - missing @example
- `src/EntitySchema.ts:144` `ValueStrategy` (type) - missing @example
- `src/EntitySchema.ts:152` `PersistStrategy` (const) - missing @example
- `src/EntitySchema.ts:160` `PersistStrategy` (type) - missing @example
- `src/EntitySchema.ts:168` `IndexHintKind` (const) - missing @example
- `src/EntitySchema.ts:180` `IndexHintKind` (type) - missing @example
- `src/EntitySchema.ts:200` `IndexHint` (const) - missing @example
- `src/EntitySchema.ts:214` `IndexHint` (type) - missing @example
- `src/EntitySchema.ts:222` `EncodedAbsenceKind` (const) - missing @example
- `src/EntitySchema.ts:244` `EncodedAbsenceKind` (type) - missing @example
- `src/EntitySchema.ts:252` `PersistOptions` (type) - missing @example
- `src/EntitySchema.ts:291` `PersistDescriptor` (type) - missing @example
- `src/EntitySchema.ts:316` `PersistDescriptor` (namespace) - 1 unsafe example violation(s)
- `src/EntitySchema.ts:365` `PersistDescriptor` (const) - missing @example
- `src/EntitySchema.ts:380` `PersistDescriptorByValueStrategy` (type) - missing @example
- `src/EntitySchema.ts:398` `EntityIdLike` (type) - missing @example
- `src/EntitySchema.ts:441` `PersistDescriptorFor` (type) - missing @example
- `src/EntitySchema.ts:455` `PersistDescriptorForInput` (type) - missing @example
- `src/EntitySchema.ts:463` `PersistedFor` (type) - missing @example
- `src/EntitySchema.ts:473` `PersistedMap` (type) - missing @example
- `src/EntitySchema.ts:490` `CheckedPersistedFor` (type) - missing @example
- `src/EntitySchema.ts:501` `Definition` (type) - missing @example
- `src/EntitySchema.ts:527` `EncodedShape` (type) - missing @example
- `src/EntitySchema.ts:537` `TypeShape` (type) - missing @example
- `src/EntitySchema.ts:547` `SchemaAnnotations` (type) - missing @example
- `src/EntitySchema.ts:555` `SnakeCase` (type) - missing @example
- `src/EntitySchema.ts:563` `LastPathSegment` (type) - missing @example
- `src/EntitySchema.ts:573` `TableNameFromIdentifier` (type) - missing @example
- `src/EntitySchema.ts:581` `ColumnNameFor` (type) - missing @example
- `src/EntitySchema.ts:593` `ClassInput` (type) - missing @example
- `src/EntitySchema.ts:611` `defineClassInput` (const) - missing @example
- `src/EntitySchema.ts:660` `EntityClass` (type) - missing @example
- `src/EntitySchema.ts:686` `EntityClass` (namespace) - 1 unsafe example violation(s)
- `src/EntitySchema.ts:712` `Assign` (type) - missing @example
- `src/EntitySchema.ts:722` `AssignPersisted` (type) - missing @example
- `src/EntitySchema.ts:733` `AssignedEntityParts` (type) - missing @example
- `src/EntitySchema.ts:749` `AssignedPersisted` (type) - missing @example
- `src/EntitySchema.ts:766` `assignEntityParts` (const) - missing @example
- `src/EntitySchema.ts:788` `ClassFactory` (type) - missing @example
- `src/EntitySchema.ts:1614` `ClassFactory` (const) - missing @example
- `src/EntitySchema.ts:842` `persist` (const) - missing @example
- `src/EntitySchema.ts:860` `DateTimeFromMillis` (const) - missing @example
- `src/EntitySchema.ts:868` `int` (const) - missing @example
- `src/EntitySchema.ts:876` `literal` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/EntitySchema.ts:888` `tableNameFromIdentifier` (const) - missing @example
- `src/EntitySchema.ts:899` `columnNameFor` (const) - missing @example
- `src/EntitySchema.ts:1030` `EncodedFieldShape` (const) - missing @example
- `src/EntitySchema.ts:1059` `EncodedFieldShape` (type) - missing @example
- `src/EntitySchema.ts:1067` `encodedAstFor` (const) - missing @example
- `src/EntitySchema.ts:1103` `encodedFieldShape` (const) - missing @example
- `src/EntitySchema.ts:1123` `selectedRowFieldShape` (const) - missing @example
- `src/EntitySchema.ts:1143` `isEncodedNullable` (const) - missing @example
- `src/EntitySchema.ts:1151` `isEncodedOptional` (const) - missing @example
- `src/EntitySchema.ts:1635` `getDefinition` (const) - missing @example
- `src/FileExtension.ts:121` `ApplicationFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:160` `VideoFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:199` `TextFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:238` `ImageFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:277` `AudioFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:315` `MiscFileExtension` (type) - 1 unsafe example violation(s)
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
- `src/Float16Array.ts:85` `Float16Arr` (type) - missing @example
- `src/Float16Array.ts:136` `Float16ArrayFromArray` (type) - missing @example
- `src/Float16Array.ts:144` `Float16ArrayFromArray` (namespace) - missing @example
- `src/Float16Array.ts:178` `Float16ArrayField` (const) - missing @example
- `src/Float32Array.ts:53` `Float32Arr` (type) - missing @example
- `src/Float32Array.ts:101` `Float32ArrayFromArray` (type) - missing @example
- `src/Float32Array.ts:109` `Float32ArrayFromArray` (namespace) - missing @example
- `src/Float32Array.ts:143` `Float32ArrayField` (const) - missing @example
- `src/Float64Array.ts:53` `Float64Arr` (type) - missing @example
- `src/Float64Array.ts:101` `Float64ArrayFromArray` (type) - missing @example
- `src/Float64Array.ts:109` `Float64ArrayFromArray` (namespace) - missing @example
- `src/Float64Array.ts:143` `Float64ArrayField` (const) - missing @example
- `src/Fn.ts:451` `ThunkOf` (function) - missing summary; missing @example, @category, @since
- `src/Fn.ts:455` `ThunkOf` (function) - missing summary; missing @example, @category, @since
- `src/Fn.ts:564` `Fn` (function) - missing summary; missing @example, @category, @since
- `src/Fn.ts:130` `FnType` (type) - 1 unsafe example violation(s)
- `src/Fn.ts:174` `FnSchemaNoArg` (interface) - missing @example
- `src/Fn.ts:193` `FnSchemaUnary` (interface) - missing @example
- `src/Fn.ts:213` `FnSchema` (type) - missing @example
- `src/Fn.ts:229` `FnSchemaStatics` (type) - missing @example
- `src/Fn.ts:426` `AnyFn` (type) - missing @example
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
- `src/Int.ts:98` `PosInt` (type) - 1 unsafe example violation(s)
- `src/Int.ts:137` `PostgresSerialInt` (type) - 1 unsafe example violation(s)
- `src/Int.ts:180` `NegInt` (type) - 1 unsafe example violation(s)
- `src/Int.ts:223` `NonPositiveInt` (type) - 1 unsafe example violation(s)
- `src/Json.ts:39` `JsonObject` (type) - missing @example
- `src/Json.ts:68` `JsonArray` (type) - missing @example
- `src/Jsonc.ts:99` `JsoncTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/Jsonl.ts:107` `JsonlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/KebabStr.ts:54` `KebabCaseStr` (type) - 1 unsafe example violation(s)
- `src/LiteralKit.ts:697` `LiteralKit` (function) - 1 unsafe example violation(s)
- `src/LiteralKit.ts:644` `LiteralKit` (interface) - missing summary; missing @example, @category
- `src/LiteralKit.ts:36` `LiteralToKey` (type) - missing @example
- `src/LocalDate.ts:129` `isLocalDate` (const) - missing @example
- `src/LocalDate.ts:213` `fromString` (const) - missing @example
- `src/LocalDate.ts:236` `fromDate` (const) - missing @example
- `src/LocalDate.ts:250` `today` (const) - missing @example
- `src/LocalDate.ts:258` `todayEffect` (const) - missing @example
- `src/LocalDate.ts:269` `fromDateTime` (const) - missing @example
- `src/LocalDate.ts:284` `Order` (const) - missing @example
- `src/LocalDate.ts:303` `isBefore` (const) - missing @example
- `src/LocalDate.ts:314` `isAfter` (const) - missing @example
- `src/LocalDate.ts:325` `equals` (const) - missing @example
- `src/LocalDate.ts:340` `addDays` (const) - missing @example
- `src/LocalDate.ts:355` `addMonths` (const) - missing @example
- `src/LocalDate.ts:370` `addYears` (const) - missing @example
- `src/LocalDate.ts:385` `diffInDays` (const) - missing @example
- `src/LocalDate.ts:401` `startOfMonth` (const) - missing @example
- `src/LocalDate.ts:415` `endOfMonth` (const) - missing @example
- `src/LocalDate.ts:429` `startOfYear` (const) - missing @example
- `src/LocalDate.ts:443` `endOfYear` (const) - missing @example
- `src/LocalDate.ts:457` `isLeapYear` (const) - missing @example
- `src/LocalDate.ts:467` `daysInMonth` (const) - missing @example
- `src/LocalDate.ts:514` `LocalDateFromString` (type) - missing @example
- `src/LocalDate.ts:522` `LocalDateFromString` (namespace) - missing @example
- `src/Logs.ts:43` `LogLevel` (type) - missing @example
- `src/Logs.ts:74` `LogSeverity` (type) - missing @example
- `src/MappedLiteralKit.ts:331` `MappedLiteralKit` (function) - 1 unsafe example violation(s)
- `src/MappedLiteralKit.ts:300` `MappedLiteralKit` (interface) - missing summary; missing @example, @category
- `src/Markdown.ts:137` `Markdown` (type) - missing @example
- `src/Markdown.ts:165` `MarkdownTextToHtml` (const) - 1 schema annotation/type-alias gap(s)
- `src/Model.ts:34` `Any` (type) - missing @example
- `src/Model.ts:49` `VariantsDatabase` (type) - missing @example
- `src/Model.ts:57` `VariantsJson` (type) - missing @example
- `src/Model.ts:65` `Variant` (type) - missing @example
- `src/Model.ts:73` `DefaultVariant` (type) - missing @example
- `src/Model.ts:98` `ClassShape` (type) - missing @example
- `src/Model.ts:23` `Class` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model.ts:23` `extract` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model.ts:23` `Field` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model.ts:23` `FieldExcept` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model.ts:23` `FieldOnly` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model.ts:23` `fieldEvolve` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model.ts:23` `Struct` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model.ts:23` `Union` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model.ts:281` `fields` (const) - 1 example import violation(s)
- `src/Model.ts:311` `Overridable` (interface) - missing @example
- `src/Model.ts:328` `Overridable` (const) - missing @example
- `src/Model.ts:319` `Overrideable` (interface) - missing @example
- `src/Model.ts:336` `Overrideable` (const) - missing @example
- `src/Model.ts:344` `Generated` (interface) - missing @example
- `src/Model.ts:384` `GeneratedByApp` (interface) - missing @example
- `src/Model.ts:401` `GeneratedByApp` (const) - missing @example
- `src/Model.ts:415` `Sensitive` (interface) - missing @example
- `src/Model.ts:464` `optionalOption` (interface) - 1 example import violation(s)
- `src/Model.ts:482` `optionalOption` (const) - 1 example import violation(s); 2 schema annotation/type-alias gap(s)
- `src/Model.ts:514` `FieldOption` (interface) - 1 example import violation(s)
- `src/Model.ts:542` `FieldOption` (const) - 1 example import violation(s)
- `src/Model.ts:604` `BooleanSqlite` (const) - 1 example import violation(s); 2 schema annotation/type-alias gap(s)
- `src/Model.ts:646` `Date` (const) - 1 example import violation(s); 2 schema annotation/type-alias gap(s)
- `src/Model.ts:761` `DateTimeInsert` (const) - 1 example import violation(s)
- `src/Model.ts:807` `DateTimeInsertFromDate` (const) - 1 example import violation(s)
- `src/Model.ts:853` `DateTimeInsertFromNumber` (const) - 1 example import violation(s)
- `src/Model.ts:901` `DateTimeUpdate` (const) - 1 example import violation(s)
- `src/Model.ts:950` `DateTimeUpdateFromDate` (const) - 1 example import violation(s)
- `src/Model.ts:999` `DateTimeUpdateFromNumber` (const) - 1 example import violation(s)
- `src/Model.ts:1022` `JsonFromString` (interface) - 1 example import violation(s)
- `src/Model.ts:1050` `JsonFromString` (const) - 1 example import violation(s)
- `src/Model.ts:1079` `UuidV4Insert` (interface) - 1 example import violation(s)
- `src/Model.ts:1146` `UuidV4Insert` (const) - 1 example import violation(s)
- `src/Model.ts:1121` `UuidV4WithGenerate` (const) - 1 example import violation(s)
- `src/MutableHashMap.ts:82` `MutableHashMapIso` (type) - missing @example
- `src/MutableHashMap.ts:92` `MutableHashMapFromSelf` (interface) - missing @example
- `src/MutableHashMap.ts:162` `MutableHashMapFromSelf` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashMap.ts:110` `MutableHashMap` (interface) - missing @example
- `src/MutableHashMap.ts:261` `MutableHashMap` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashSet.ts:54` `MutableHashSetIso` (type) - missing @example
- `src/MutableHashSet.ts:62` `MutableHashSetFromSelf` (interface) - missing @example
- `src/MutableHashSet.ts:127` `MutableHashSetFromSelf` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashSet.ts:79` `MutableHashSet` (interface) - missing @example
- `src/MutableHashSet.ts:220` `MutableHashSet` (const) - 1 schema annotation/type-alias gap(s)
- `src/Number.ts:163` `NonNegNum` (type) - 1 unsafe example violation(s)
- `src/Number.ts:213` `NonNegativeInt` (type) - 1 unsafe example violation(s)
- `src/Options.ts:78` `OptionFromOptionalNullishKey` (const) - forbidden @template
- `src/PascalStr.ts:54` `PascalCaseStr` (type) - 1 unsafe example violation(s)
- `src/Percentage.ts:55` `Percentage` (type) - 1 unsafe example violation(s)
- `src/Percentage.ts:93` `TWENTY` (const) - missing @example
- `src/Percentage.ts:100` `FIFTY` (const) - missing @example
- `src/Percentage.ts:107` `HUNDRED` (const) - missing @example
- `src/PosixPath.ts:53` `PosixPath` (type) - 1 unsafe example violation(s)
- `src/PosixPath.ts:70` `NativePathToPosixPath` (const) - 1 schema annotation/type-alias gap(s)
- `src/RegExp.ts:80` `RegExpStr` (type) - 1 unsafe example violation(s)
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
- `src/SchemaUtils/toEquivalence.ts:32` `DualEquivalence` (type) - forbidden @template
- `src/SchemaUtils/toEquivalence.ts:64` `toEquivalence` (const) - forbidden @template
- `src/SchemaUtils/withEncodeDefault.ts:40` `withEncodeDefault` (const) - forbidden @template
- `src/SchemaUtils/withEncodeDefault.ts:83` `boolWithDefault` (const) - 2 schema annotation/type-alias gap(s)
- `src/SchemaUtils/withKeyDefaults.ts:113` `withEmptyArrayDefaults` (function) - forbidden @template
- `src/SchemaUtils/withKeyDefaults.ts:118` `withEmptyArrayDefaults` (function) - missing summary; missing @example, @category, @since
- `src/SchemaUtils/withKeyDefaults.ts:123` `withEmptyArrayDefaults` (function) - missing summary; missing @example, @category, @since
- `src/SchemaUtils/withKeyDefaults.ts:49` `withKeyDefaults` (const) - forbidden @template
- `src/SchemaUtils/withKeyDefaults.ts:153` `boolKeyWithDefault` (const) - 2 schema annotation/type-alias gap(s)
- `src/SchemaUtils/withLiteralKitStatics.ts:25` `withLiteralKitStatics` (const) - missing @example
- `src/Sha256.ts:79` `Sha256Hex` (type) - 1 unsafe example violation(s)
- `src/Sha256.ts:126` `Sha256HexFromBytes` (type) - 1 unsafe example violation(s)
- `src/Sha256.ts:169` `Sha256HexFromHexBytes` (type) - 1 unsafe example violation(s)
- `src/Slug.ts:96` `Slug` (type) - missing @example
- `src/Slug.ts:104` `SlugFromStr` (const) - missing @example
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
- `src/String.ts:49` `NonEmptyTrimmedStr` (type) - 1 unsafe example violation(s)
- `src/String.ts:87` `UUID` (type) - 1 unsafe example violation(s)
- `src/String.ts:154` `OptionFromNullableStr` (type) - missing @example
- `src/Thunk.ts:37` `TypeId` (type) - missing @example
- `src/Thunk.ts:46` `ThunkUnknown` (type) - missing @example
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
- `src/Toml.ts:84` `TomlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/Transformations.ts:47` `destructiveTransform` (const) - 2 schema annotation/type-alias gap(s)
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
- `src/VariantSchema.ts:658` `Overrideable` (const) - missing @example
- `src/Xml.ts:79` `XmlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/Yaml.ts:101` `YamlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
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
- `src/blockchain/index.ts:12` `export * from "./CryptoTxnHash.ts";` (re-export) - missing @example
- `src/blockchain/index.ts:17` `export * from "./CryptoWalletAddress.ts";` (re-export) - missing @example
- `src/blockchain/index.ts:22` `export * from "./EthAmount.ts";` (re-export) - missing @example
- `src/blockchain/index.ts:27` `export * from "./EthereumValidatorPublicKey.ts";` (re-export) - missing @example
- `src/blockchain/index.ts:32` `export * from "./EvmAddress.ts";` (re-export) - missing @example
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
- `src/csv/index.ts:304` `export * from "./CsvCodecOptions.ts";` (re-export) - missing @example
- `src/csv/index.ts:309` `export * from "./CsvError.ts";` (re-export) - missing @example
- `src/csv/index.ts:314` `export * from "./format/index.ts";` (re-export) - missing @example
- `src/csv/index.ts:319` `export * from "./parse/index.ts";` (re-export) - missing @example
- `src/csv/index.ts:298` `CsvText` (type) - missing @example
- `src/csv/parse/CsvParser.ts:98` `ParsedField` (class) - missing summary; missing @example
- `src/csv/parse/CsvParser.ts:243` `ParsedRow` (class) - missing summary; missing @example
- `src/csv/parse/CsvParser.ts:381` `parseCsvRows` (const) - missing @example
- `src/csv/parse/ParserOptions.ts:60` `HeaderValueInput` (const) - missing @example
- `src/csv/parse/ParserOptions.ts:72` `HeaderValueInput` (type) - missing @example
- `src/csv/parse/ParserOptions.ts:80` `ParserOptionsError` (class) - missing @example
- `src/csv/parse/ParserOptions.ts:107` `ParserOptions` (class) - missing @example
- `src/csv/parse/ParserOptions.ts:226` `ParserOptionsArgs` (type) - missing @example
- `src/csv/parse/index.ts:12` `export * from "./CsvParser.ts";` (re-export) - missing @example
- `src/csv/parse/index.ts:17` `export * from "./ParserOptions.ts";` (re-export) - missing @example
- `src/csv/parse/index.ts:22` `export * from "./types.ts";` (re-export) - missing @example
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
- `src/http/HttpMethod/HttpMethod.ts:19` `HttpMethod_` (const) - missing summary; missing @example; 2 schema annotation/type-alias gap(s)
- `src/http/HttpMethod/HttpMethod.ts:49` `HttpMethod` (const) - missing summary; missing @example
- `src/http/HttpMethod/HttpMethod.ts:79` `HttpMethod` (type) - missing summary; missing @example
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
- `src/http/headers/CrossOriginEmbedderPolicy.ts:29` `CoepValue` (const) - missing summary; missing @example
- `src/http/headers/CrossOriginEmbedderPolicy.ts:40` `CoepValue` (type) - missing summary; missing @example
- `src/http/headers/CrossOriginEmbedderPolicy.ts:48` `CrossOriginEmbedderPolicyOption` (const) - missing summary; missing @example
- `src/http/headers/CrossOriginEmbedderPolicy.ts:59` `CrossOriginEmbedderPolicyOption` (type) - missing summary; missing @example
- `src/http/headers/CrossOriginEmbedderPolicy.ts:66` `COEPResponseHeader` (class) - missing @example
- `src/http/headers/CrossOriginEmbedderPolicy.ts:88` `CrossOriginEmbedderPolicyHeader` (const) - missing @example
- `src/http/headers/CrossOriginEmbedderPolicy.ts:165` `CrossOriginEmbedderPolicyHeader` (type) - missing summary; missing @example
- `src/http/headers/CrossOriginOpenerPolicy.ts:51` `CoopValue` (type) - missing @example
- `src/http/headers/CrossOriginOpenerPolicy.ts:83` `CrossOriginOpenerPolicyOption` (type) - missing @example
- `src/http/headers/CrossOriginOpenerPolicy.ts:103` `CrossOriginOpenerPolicyResponseHeader` (class) - 1 example import violation(s)
- `src/http/headers/CrossOriginOpenerPolicy.ts:192` `CrossOriginOpenerPolicyHeader` (type) - missing @example
- `src/http/headers/CrossOriginResourcePolicy.ts:27` `CorpValue` (const) - missing summary; missing @example
- `src/http/headers/CrossOriginResourcePolicy.ts:38` `CorpValue` (type) - missing summary; missing @example
- `src/http/headers/CrossOriginResourcePolicy.ts:46` `CrossOriginResourcePolicyOption` (const) - missing summary; missing @example
- `src/http/headers/CrossOriginResourcePolicy.ts:57` `CrossOriginResourcePolicyOption` (type) - missing summary; missing @example
- `src/http/headers/CrossOriginResourcePolicy.ts:63` `CrossOriginResourcePolicyResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/CrossOriginResourcePolicy.ts:81` `CrossOriginResourcePolicyHeader` (const) - missing summary; missing @example
- `src/http/headers/CrossOriginResourcePolicy.ts:139` `CrossOriginResourcePolicyHeader` (type) - missing summary; missing @example
- `src/http/headers/Csp.ts:27` `DirectiveSource` (const) - missing summary; missing @example
- `src/http/headers/Csp.ts:37` `DirectiveSource` (type) - missing summary; missing @example
- `src/http/headers/Csp.ts:49` `ContentSecurityPolicyHeaderName` (const) - missing summary; missing @example
- `src/http/headers/Csp.ts:60` `ContentSecurityPolicyHeaderName` (type) - missing summary; missing @example
- `src/http/headers/Csp.ts:118` `createDirectiveValue` (const) - missing @example
- `src/http/headers/Csp.ts:146` `PluginTypes` (const) - missing summary; missing @example
- `src/http/headers/Csp.ts:156` `PluginTypes` (type) - missing summary; missing @example
- `src/http/headers/Csp.ts:179` `Sandbox` (const) - missing summary; missing @example
- `src/http/headers/Csp.ts:190` `Sandbox` (type) - missing summary; missing @example
- `src/http/headers/Csp.ts:233` `FetchDirective` (class) - missing summary; missing @example
- `src/http/headers/Csp.ts:302` `DocumentDirective` (class) - missing summary; missing @example
- `src/http/headers/Csp.ts:346` `NavigationDirective` (class) - missing summary; missing @example
- `src/http/headers/Csp.ts:390` `ReportURI` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/http/headers/Csp.ts:400` `ReportingDirective` (class) - missing summary; missing @example
- `src/http/headers/Csp.ts:436` `CspDirectives` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/http/headers/Csp.ts:451` `ContentSecurityPolicyOptionStruct` (class) - missing summary; missing @example
- `src/http/headers/Csp.ts:483` `ContentSecurityPolicyOption` (const) - missing summary; missing @example
- `src/http/headers/Csp.ts:493` `ContentSecurityPolicyOption` (type) - missing summary; missing @example
- `src/http/headers/Csp.ts:499` `ContentSecurityPolicyResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/Csp.ts:558` `createContentSecurityPolicyOptionHeaderValue` (const) - missing summary; missing @example
- `src/http/headers/Csp.ts:584` `ContentSecurityPolicyHeader` (const) - missing summary; missing @example
- `src/http/headers/Csp.ts:652` `ContentSecurityPolicyHeader` (type) - missing summary; missing @example
- `src/http/headers/ExpectCT.ts:26` `ExpectCTConfig` (class) - missing summary; missing @example
- `src/http/headers/ExpectCT.ts:41` `ExpectCTEnabled` (const) - missing summary; missing @example
- `src/http/headers/ExpectCT.ts:51` `ExpectCTEnabled` (type) - missing summary; missing @example
- `src/http/headers/ExpectCT.ts:57` `ExpectCTOption` (const) - missing summary; missing @example
- `src/http/headers/ExpectCT.ts:67` `ExpectCTOption` (type) - missing summary; missing @example
- `src/http/headers/ExpectCT.ts:73` `ExpectCTResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/ExpectCT.ts:149` `ExpectCTHeader` (const) - missing summary; missing @example
- `src/http/headers/ExpectCT.ts:207` `ExpectCTHeader` (type) - missing summary; missing @example
- `src/http/headers/ForceHttpsRedirect.ts:26` `ForceHttpsRedirectConfig` (class) - missing summary; missing @example
- `src/http/headers/ForceHttpsRedirect.ts:41` `ForceHttpsRedirectEnabled` (const) - missing summary; missing @example
- `src/http/headers/ForceHttpsRedirect.ts:51` `ForceHttpsRedirectEnabled` (type) - missing summary; missing @example
- `src/http/headers/ForceHttpsRedirect.ts:57` `ForceHttpsRedirectOption` (const) - missing summary; missing @example
- `src/http/headers/ForceHttpsRedirect.ts:67` `ForceHttpsRedirectOption` (type) - missing summary; missing @example
- `src/http/headers/ForceHttpsRedirect.ts:73` `ForceHttpsRedirectResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/ForceHttpsRedirect.ts:102` `ForceHttpsRedirectHeader` (const) - missing summary; missing @example
- `src/http/headers/ForceHttpsRedirect.ts:172` `ForceHttpsRedirectHeader` (type) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:29` `FrameGuardMode` (const) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:40` `FrameGuardMode` (type) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:46` `FrameGuardAllowFromConfig` (class) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:59` `FrameGuardAllowFrom` (const) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:69` `FrameGuardAllowFrom` (type) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:75` `FrameGuardOption` (const) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:85` `FrameGuardOption` (type) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:91` `FrameGuardResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:135` `FrameGuardHeader` (const) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:207` `FrameGuardHeader` (type) - missing summary; missing @example
- `src/http/headers/NoOpen.ts:28` `NoOpenValue` (const) - missing summary; missing @example
- `src/http/headers/NoOpen.ts:39` `NoOpenValue` (type) - missing summary; missing @example
- `src/http/headers/NoOpen.ts:47` `NoOpenOption` (const) - missing summary; missing @example
- `src/http/headers/NoOpen.ts:58` `NoOpenOption` (type) - missing summary; missing @example
- `src/http/headers/NoOpen.ts:64` `NoOpenResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/NoOpen.ts:80` `NoOpenHeader` (const) - missing summary; missing @example
- `src/http/headers/NoOpen.ts:139` `NoOpenHeader` (type) - missing summary; missing @example
- `src/http/headers/NoSniff.ts:52` `NoSniffValue` (type) - missing @example
- `src/http/headers/NoSniff.ts:84` `NoSniffOption` (type) - missing @example
- `src/http/headers/NoSniff.ts:101` `NoSniffResponseHeader` (class) - 1 example import violation(s)
- `src/http/headers/NoSniff.ts:189` `NoSniffHeader` (type) - missing @example
- `src/http/headers/PermissionsPolicy.ts:58` `PermissionsPolicyDirective` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:69` `PermissionsPolicyDirective` (type) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:75` `PermissionsPolicyDirectiveKey` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:92` `PermissionsPolicyDirectiveKey` (type) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:98` `QuotedOrigin` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:114` `QuotedOrigin` (type) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:122` `PermissionsPolicyDirectiveValueSingle` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:133` `PermissionsPolicyDirectiveValueSingle` (type) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:139` `PermissionsPolicyAllowlistedOrigin` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:149` `PermissionsPolicyAllowlistedOrigin` (type) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:155` `PermissionsPolicyDirectiveValue` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:169` `PermissionsPolicyDirectiveValue` (type) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:175` `PermissionsPolicyDirectives` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:188` `PermissionsPolicyDirectives` (type) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:194` `PermissionsPolicyOptionStruct` (class) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:209` `PermissionsPolicyOption` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:219` `PermissionsPolicyOption` (type) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:225` `PermissionsPolicyResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:273` `PermissionsPolicyHeader` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:335` `PermissionsPolicyHeader` (type) - missing summary; missing @example
- `src/http/headers/PermittedCrossDomainPolicies.ts:34` `PermittedCrossDomainPoliciesValue` (const) - missing summary; missing @example
- `src/http/headers/PermittedCrossDomainPolicies.ts:45` `PermittedCrossDomainPoliciesValue` (type) - missing summary; missing @example
- `src/http/headers/PermittedCrossDomainPolicies.ts:53` `PermittedCrossDomainPoliciesOption` (const) - missing summary; missing @example
- `src/http/headers/PermittedCrossDomainPolicies.ts:64` `PermittedCrossDomainPoliciesOption` (type) - missing summary; missing @example
- `src/http/headers/PermittedCrossDomainPolicies.ts:70` `PermittedCrossDomainPoliciesResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/PermittedCrossDomainPolicies.ts:88` `PermittedCrossDomainPoliciesHeader` (const) - missing summary; missing @example
- `src/http/headers/PermittedCrossDomainPolicies.ts:150` `PermittedCrossDomainPoliciesHeader` (type) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:36` `ReferrerPolicyValue` (const) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:47` `ReferrerPolicyValue` (type) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:53` `ReferrerPolicyValueList` (const) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:63` `ReferrerPolicyValueList` (type) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:69` `ReferrerPolicyOption` (const) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:79` `ReferrerPolicyOption` (type) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:85` `ReferrerPolicyResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:126` `ReferrerPolicyHeader` (const) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:190` `ReferrerPolicyHeader` (type) - missing summary; missing @example
- `src/http/headers/SecureHeader.ts:33` `SecureHeader` (const) - missing summary; missing @example
- `src/http/headers/SecureHeader.ts:44` `SecureHeader` (type) - missing summary; missing @example
- `src/http/headers/SecureHeaderError.ts:109` `CspError` (class) - missing summary; missing @example
- `src/http/headers/SecureHeaderError.ts:115` `ForceHttpsRedirectError` (class) - missing summary; missing @example
- `src/http/headers/SecureHeaderError.ts:121` `XssProtectionError` (class) - missing summary; missing @example
- `src/http/headers/SecureHeaderError.ts:127` `ReferrerPolicyError` (class) - missing summary; missing @example
- `src/http/headers/SecureHeaderError.ts:133` `NoSniffError` (class) - missing summary; missing @example
- `src/http/headers/SecureHeaderError.ts:139` `NoOpenError` (class) - missing summary; missing @example
- `src/http/headers/SecureHeaderError.ts:145` `FrameGuardError` (class) - missing summary; missing @example
- `src/http/headers/SecureHeaderError.ts:151` `ExpectCtError` (class) - missing summary; missing @example
- `src/http/headers/SecureHeaderError.ts:157` `PermissionsPolicyError` (class) - missing summary; missing @example
- `src/http/headers/SecureHeaderError.ts:163` `CrossOriginOpenerPolicyError` (class) - missing summary; missing @example
- `src/http/headers/SecureHeaderError.ts:169` `CrossOriginEmbedderPolicyError` (class) - missing summary; missing @example
- `src/http/headers/SecureHeaderError.ts:175` `CrossOriginResourcePolicyError` (class) - missing summary; missing @example
- `src/http/headers/SecureHeaderError.ts:181` `PermittedCrossDomainPoliciesError` (class) - missing summary; missing @example
- `src/http/headers/SecureHeaderError.ts:187` `CoreError` (class) - missing summary; missing @example
- `src/http/headers/SecureHeaderError.ts:193` `SecureHeaderError` (const) - missing summary; missing @example
- `src/http/headers/SecureHeaderError.ts:221` `SecureHeaderError` (type) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:28` `XSSProtectionMode` (const) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:39` `XSSProtectionMode` (type) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:45` `XSSProtectionReportConfig` (class) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:58` `XSSProtectionReport` (const) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:68` `XSSProtectionReport` (type) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:74` `XSSProtectionOption` (const) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:84` `XSSProtectionOption` (type) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:90` `XSSProtectionResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:142` `XSSProtectionHeader` (const) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:193` `XSSProtectionHeader` (type) - missing summary; missing @example
- `src/http/headers/_internal/helpers.ts:22` `ArrayOfStrOrStr` (const) - missing summary; missing @example
- `src/http/headers/_internal/helpers.ts:32` `ArrayOfStrOrStr` (type) - missing summary; missing @example
- `src/http/headers/_internal/helpers.ts:38` `StringOrUrl` (const) - missing summary; missing @example
- `src/http/headers/_internal/helpers.ts:48` `StringOrUrl` (type) - missing summary; missing @example
- `src/http/headers/_internal/helpers.ts:54` `EncodedStrictURIFromStrOrURL` (const) - missing summary; missing @example
- `src/http/headers/_internal/helpers.ts:78` `EncodedStrictURIFromStrOrURL` (type) - missing summary; missing @example
- `src/http/headers/_internal/helpers.ts:87` `encodeStrictURI` (const) - missing summary; missing @example
- `src/http/headers/_internal/helpers.ts:94` `encodeStrictURIOption` (const) - missing summary; missing @example
- `src/http/headers/_internal/helpers.ts:100` `wrapArray` (const) - missing summary; missing @example
- `src/http/headers/_internal/helpers.ts:107` `ResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/_internal/helpers.ts:121` `makeHeaderEncodeForbidden` (const) - missing summary; missing @example
- `src/http/headers/_internal/helpers.ts:134` `makeResponseHeader` (const) - missing summary; missing @example
- `src/http/headers/_internal/helpers.ts:150` `makeResponseHeaderOption` (const) - missing summary; missing @example
- `src/http/headers/_internal/index.ts:5` `export * from "./helpers.ts";` (re-export) - missing @example
- `src/http/headers/index.ts:12` `export * from "./CrossOriginEmbedderPolicy.ts";` (re-export) - missing @example
- `src/http/headers/index.ts:17` `export * from "./CrossOriginOpenerPolicy.ts";` (re-export) - missing @example
- `src/http/headers/index.ts:22` `export * from "./CrossOriginResourcePolicy.ts";` (re-export) - missing @example
- `src/http/headers/index.ts:27` `export * from "./Csp.ts";` (re-export) - missing @example
- `src/http/headers/index.ts:32` `export * from "./ExpectCT.ts";` (re-export) - missing @example
- `src/http/headers/index.ts:37` `export * from "./ForceHttpsRedirect.ts";` (re-export) - missing @example
- `src/http/headers/index.ts:42` `export * from "./FrameGuard.ts";` (re-export) - missing @example
- `src/http/headers/index.ts:47` `export * from "./NoOpen.ts";` (re-export) - missing @example
- `src/http/headers/index.ts:52` `export * from "./NoSniff.ts";` (re-export) - missing @example
- `src/http/headers/index.ts:57` `export * from "./PermissionsPolicy.ts";` (re-export) - missing @example
- `src/http/headers/index.ts:62` `export * from "./PermittedCrossDomainPolicies.ts";` (re-export) - missing @example
- `src/http/headers/index.ts:67` `export * from "./ReferrerPolicy.ts";` (re-export) - missing @example
- `src/http/headers/index.ts:72` `export * from "./SecureHeader.ts";` (re-export) - missing @example
- `src/http/headers/index.ts:77` `export * from "./SecureHeaderError.ts";` (re-export) - missing @example
- `src/http/headers/index.ts:82` `export * from "./SecureHeaderOptions.ts";` (re-export) - missing @example
- `src/http/headers/index.ts:87` `export * from "./XSSProtection.ts";` (re-export) - missing @example
- `src/http/index.ts:12` `export * from "./HttpMethod/index.ts";` (re-export) - missing @example
- `src/http/index.ts:17` `export * from "./HttpProtocol.ts";` (re-export) - missing @example
- `src/http/index.ts:22` `export * as HttpStatus from "./HttpStatus.ts";` (re-export) - missing @example
- `src/http/index.ts:27` `export * from "./headers/index.ts";` (re-export) - missing @example
- `src/index.ts:8` `export * from "./Number.ts";` (re-export) - missing @example
- `src/index.ts:20` `export * from "./LiteralKit.ts";` (re-export) - missing @example
- `src/index.ts:25` `export * from "./MappedLiteralKit.ts";` (re-export) - missing @example
- `src/index.ts:33` `export * from "./AbortSignal.ts";` (re-export) - missing @example
- `src/index.ts:38` `export * from "./ArrayOf.ts";` (re-export) - missing @example
- `src/index.ts:43` `export * from "./BigDecimal.ts";` (re-export) - missing @example
- `src/index.ts:48` `export * from "./BufferEncoding.ts";` (re-export) - missing @example
- `src/index.ts:53` `export * from "./blockchain/index.ts";` (re-export) - missing @example
- `src/index.ts:58` `export * from "./CauseTaggedError.ts";` (re-export) - missing @example
- `src/index.ts:63` `export * from "./CommonTextSchemas.ts";` (re-export) - missing @example
- `src/index.ts:68` `export * from "./color/index.ts";` (re-export) - missing @example
- `src/index.ts:73` `export * from "./csv.ts";` (re-export) - missing @example
- `src/index.ts:78` `export * from "./DateTimeUtcFromValid.ts";` (re-export) - missing @example
- `src/index.ts:83` `export * as DomainModel from "./DomainModel.ts";` (re-export) - missing @example
- `src/index.ts:88` `export * from "./Duration.ts";` (re-export) - missing @example
- `src/index.ts:93` `export * from "./dom/index.ts";` (re-export) - missing @example
- `src/index.ts:98` `export * from "./EffectSchema.ts";` (re-export) - missing @example
- `src/index.ts:103` `export * from "./Email.ts";` (re-export) - missing @example
- `src/index.ts:108` `export * as EntitySchema from "./EntitySchema.ts";` (re-export) - missing @example
- `src/index.ts:113` `export * from "./FileExtension.ts";` (re-export) - missing @example
- `src/index.ts:118` `export * from "./FileName.ts";` (re-export) - missing @example
- `src/index.ts:123` `export * from "./FilePath.ts";` (re-export) - missing @example
- `src/index.ts:128` `export * from "./Float16Array.ts";` (re-export) - missing @example
- `src/index.ts:133` `export * from "./Float32Array.ts";` (re-export) - missing @example
- `src/index.ts:138` `export * from "./Float64Array.ts";` (re-export) - missing @example
- `src/index.ts:143` `export * from "./Fn.ts";` (re-export) - missing @example
- `src/index.ts:148` `export * from "./Glob.ts";` (re-export) - missing @example
- `src/index.ts:153` `export * from "./Graph.ts";` (re-export) - missing @example
- `src/index.ts:158` `export * from "./Html.ts";` (re-export) - missing @example
- `src/index.ts:163` `export * from "./http/index.ts";` (re-export) - missing @example
- `src/index.ts:168` `export * from "./Int.ts";` (re-export) - missing @example
- `src/index.ts:173` `export * from "./Json.ts";` (re-export) - missing @example
- `src/index.ts:178` `export * from "./Jsonc.ts";` (re-export) - missing @example
- `src/index.ts:183` `export * from "./Jsonl.ts";` (re-export) - missing @example
- `src/index.ts:188` `export * from "./KebabStr.ts";` (re-export) - missing @example
- `src/index.ts:193` `export * from "./LocalDate.ts";` (re-export) - missing @example
- `src/index.ts:198` `export * from "./Logs.ts";` (re-export) - missing @example
- `src/index.ts:203` `export * from "./location/index.ts";` (re-export) - missing @example
- `src/index.ts:208` `export * from "./Markdown.ts";` (re-export) - missing @example
- `src/index.ts:213` `export * from "./MimeType.ts";` (re-export) - missing @example
- `src/index.ts:218` `export * as Model from "./Model.ts";` (re-export) - missing @example
- `src/index.ts:223` `export * from "./MutableHashMap.ts";` (re-export) - missing @example
- `src/index.ts:228` `export * from "./MutableHashSet.ts";` (re-export) - missing @example
- `src/index.ts:233` `export * from "./Options.ts";` (re-export) - missing @example
- `src/index.ts:238` `export * from "./PascalStr.ts";` (re-export) - missing @example
- `src/index.ts:243` `export * from "./PosixPath.ts";` (re-export) - missing @example
- `src/index.ts:248` `export * from "./Primitive.ts";` (re-export) - missing @example
- `src/index.ts:253` `export * from "./PromiseSchema.ts";` (re-export) - missing @example
- `src/index.ts:258` `export * from "./person/index.ts";` (re-export) - missing @example
- `src/index.ts:263` `export * from "./Record.ts";` (re-export) - missing @example
- `src/index.ts:268` `export * from "./RegExp.ts";` (re-export) - missing @example
- `src/index.ts:273` `export * as SchemaUtils from "./SchemaUtils/index.ts";` (re-export) - missing @example
- `src/index.ts:278` `export * from "./SemanticVersion.ts";` (re-export) - missing @example
- `src/index.ts:283` `export * from "./SeverityLevel.ts";` (re-export) - missing @example
- `src/index.ts:288` `export * from "./Sha256.ts";` (re-export) - missing @example
- `src/index.ts:293` `export * from "./Slug.ts";` (re-export) - missing @example
- `src/index.ts:298` `export * from "./SnakeStr.ts";` (re-export) - missing @example
- `src/index.ts:303` `export * from "./StatusCauseError.ts";` (re-export) - missing @example
- `src/index.ts:308` `export * from "./StatusCauseTaggedErrorClass.ts";` (re-export) - missing @example
- `src/index.ts:313` `export * from "./String.ts";` (re-export) - missing @example
- `src/index.ts:318` `export * from "./TaggedErrorClass.ts";` (re-export) - missing @example
- `src/index.ts:323` `export * from "./Timezone.ts";` (re-export) - missing @example
- `src/index.ts:328` `export * from "./Toml.ts";` (re-export) - missing @example
- `src/index.ts:333` `export * from "./Transformations.ts";` (re-export) - missing @example
- `src/index.ts:338` `export * from "./URL.ts";` (re-export) - missing @example
- `src/index.ts:343` `export * as VariantSchema from "./VariantSchema.ts";` (re-export) - missing @example
- `src/index.ts:348` `export * from "./Xml.ts";` (re-export) - missing @example
- `src/index.ts:353` `export * from "./Yaml.ts";` (re-export) - missing @example
- `src/index.ts:14` `VERSION` (const) - missing summary; missing @example
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

### @beep/architecture-lab-domain

Path: `packages/architecture-lab/domain`

Export findings:
- `src/aggregates/WorkItem/WorkItem.errors.ts:23` `WorkItemAlreadyArchived` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:40` `WorkItemInvalidTransition` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:79` `WorkItemAssigneeRequired` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:96` `WorkItemDomainError` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:104` `WorkItemDomainError` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/aggregates/WorkItem/WorkItem.model.ts:24` `WorkItem` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:43` `CreateWorkItemInput` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:60` `create` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:77` `assign` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:102` `complete` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:126` `reopen` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:144` `archive` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:21` `WorkItemId` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:36` `WorkItemId` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:44` `WorkItemTitle` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:58` `WorkItemTitle` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:66` `WorkItemStatus` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:79` `WorkItemStatus` (type) - missing @example
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.errors.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:14` `export * from "./WorkItem.model.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:21` `export * from "./WorkItem.values.js";` (re-export) - missing @example
- `src/aggregates/index.ts:7` `export * as WorkItem from "./WorkItem/index.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as Aggregates from "./aggregates/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example

### @beep/test-utils

Path: `packages/tooling/test-kit/test-utils`

Export findings:
- `src/SqlTest.ts:187` `PgliteTestcontainersTestDriverConfigInput` (type) - missing @example
- `src/SqlTest.ts:240` `PgExternalTestDriverConfigInput` (type) - missing @example
- `src/SqlTest.ts:248` `PgliteSqlTestLayerMode` (type) - missing @example
- `src/SqlTest.ts:256` `PgliteSqlTestLayerOptions` (interface) - missing @example
- `src/SqlTest.ts:437` `PgliteTestcontainerResource` (interface) - 1 unsafe example violation(s)
- `src/index.ts:14` `export * from "./SqlTest.js";` (re-export) - missing @example

### @beep/shared-domain

Path: `packages/shared/domain`

Export findings:
- `src/entity/EntityId.ts:70` `EntityIdValue` (type) - 1 unsafe example violation(s)
- `src/entity/EntityId.ts:86` `EntityIdValueFor` (type) - 1 unsafe example violation(s)
- `src/entity/EntityId.ts:241` `Definition` (class) - 1 unsafe example violation(s)
- `src/entity/EntityId.ts:303` `EntityId` (type) - 1 unsafe example violation(s)
- `src/entity/EntityId.ts:348` `Any` (type) - 1 unsafe example violation(s)
- `src/entity/Principal.ts:64` `UserPrincipal` (class) - 1 unsafe example violation(s)
- `src/entity/Principal.ts:88` `ServiceAccountPrincipal` (class) - 1 unsafe example violation(s)
- `src/entity/Principal.ts:113` `AgentPrincipal` (class) - 1 unsafe example violation(s)
- `src/entity/Principal.ts:140` `ConnectorAccountPrincipal` (class) - 1 unsafe example violation(s)

### @beep/repo-utils

Path: `packages/tooling/library/repo-utils`

Module findings:
- `src/TypeScript/index.ts:1` (jsdoc) - missing summary
- `src/TypeScript/models/index.ts:1` (jsdoc) - missing summary

Export findings:
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
- `src/JSDoc/index.ts:8` `export * as Models from "./models/index.js";` (re-export) - missing @example
- `src/JSDoc/models/TSCategory.model.ts:275` `make` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/models/TagValue.model.ts:11` `export * from "./tag-values/index.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:14` `export * from "./ApplicableTo.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:19` `export * from "./ASTDerivability.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:24` `export * as CanonicalJSDocSourceMetadata from "./CanonicalJSDocSourceMetadata.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:29` `export * from "./HasJSDocApplicableToMapEntry.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:34` `export * from "./JSDocTagAnnotation.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:39` `export * as JSDocTagDefinition from "./JSDocTagDefinition.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:44` `export * from "./Specification.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:49` `export * from "./TagKind.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:54` `export * from "./TagParameters.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:59` `export * from "./TagValue.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:64` `export * from "./TSCategory.model.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/_fields.ts:22` `typeField` (const) - 2 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/_fields.ts:35` `optionalType` (const) - 2 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/_fields.ts:48` `nameField` (const) - 2 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/_fields.ts:61` `optionalName` (const) - 2 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/_fields.ts:74` `optionalDesc` (const) - 2 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/index.ts:16` `export * from "./AccessModifierTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:21` `export * from "./ClosureTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:26` `export * from "./DocumentationTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:31` `export * from "./EventDependencyTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:36` `export * from "./InlineTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:41` `export * from "./OrganizationalTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:46` `export * from "./RemainingTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:52` `export * from "./StructuralTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:57` `export * from "./TSDocTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:62` `export * from "./TypeDocTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:67` `export * from "./TypeScriptTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:361` `TagValue` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/index.ts:535` `TagName` (const) - 1 schema annotation/type-alias gap(s)
- `src/Reuse/index.ts:7` `export * from "./Reuse.model.js";` (re-export) - missing @example
- `src/Reuse/index.ts:14` `export * from "./Reuse.service.js";` (re-export) - missing @example
- `src/TSMorph/TSMorph.model.ts:417` `SymbolKind` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:443` `SymbolCategory` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:728` `TsMorphScopeMode` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:754` `TsMorphReferencePolicy` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:1784` `TsMorphDiagnosticCategory` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.service.ts:272` `TSMorphServiceError` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/index.ts:7` `export * from "./TSMorph.model.js";` (re-export) - missing @example
- `src/TSMorph/index.ts:14` `export * from "./TSMorph.service.js";` (re-export) - missing @example
- `src/TypeScript/index.ts:5` `export * from "./models/index.js";` (re-export) - missing @example
- `src/TypeScript/models/index.ts:5` `export * from "./TSSyntaxKind.model.js";` (re-export) - missing @example
- `src/errors/index.ts:12` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  CyclicDependencyError,
} from "./CyclicDependencyError.js";` (re-export) - missing @example
- `src/errors/index.ts:24` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  DomainError,
} from "./DomainError.js";` (re-export) - missing @example
- `src/errors/index.ts:35` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  NoSuchFileError,
} from "./NoSuchFileError.js";` (re-export) - missing @example
- `src/index.ts:15` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  extractWorkspaceDependencies,
} from "./Dependencies.js";` (re-export) - missing @example
- `src/index.ts:26` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  buildRepoDependencyIndex,
} from "./DependencyIndex.js";` (re-export) - missing @example
- `src/index.ts:37` `export {
  /**
   * @category errors
   * @since 0.0.0
   */
  CyclicDependencyError,
  /**
   * @category errors
   * @since 0.0.0
   */
  DomainError,
  /**
   * @category errors
   * @since 0.0.0
   */
  NoSuchFileError,
} from "./errors/index.js";` (re-export) - missing @example
- `src/index.ts:108` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  computeTransitiveClosure,
  /**
   * @category utilities
   * @since 0.0.0
   */
  detectCycles,
  /**
   * @category utilities
   * @since 0.0.0
   */
  topologicalSort,
} from "./Graph.js";` (re-export) - missing @example
- `src/index.ts:129` `export {
  /**
   * @category serialization
   * @since 0.0.0
   */
  jsonParse,
  /**
   * @category serialization
   * @since 0.0.0
   */
  jsonStringifyCompact,
  /**
   * @category serialization
   * @since 0.0.0
   */
  jsonStringifyPretty,
} from "./JsonUtils.js";` (re-export) - missing @example
- `src/index.ts:150` `export * from "./Reuse/index.js";` (re-export) - missing @example
- `src/index.ts:155` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  findRepoRoot,
} from "./Root.js";` (re-export) - missing @example
- `src/index.ts:166` `export {
  /**
   * @category schemas
   * @since 0.0.0
   */
  decodePackageJson,
  /**
   * @category schemas
   * @since 0.0.0
   */
  decodePackageJsonEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  decodePackageJsonExit,
  /**
   * @category schemas
   * @since 0.0.0
   */
  encodePackageJsonEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  encodePackageJsonPrettyEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  encodePackageJsonToJsonEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  NpmPackageJson,
  /**
   * @category schemas
   * @since 0.0.0
   */
  PackageJson,
} from "./schemas/PackageJson.js";` (re-export) - missing @example
- `src/index.ts:212` `export {
  /**
   * @category schemas
   * @since 0.0.0
   */
  applyPackageJsonPatchEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  diffPackageJsonEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  encodePackageJsonCanonicalPrettyEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  getPackageJsonSchemaIssues,
  /**
   * @category schemas
   * @since 0.0.0
   */
  normalizePackageJsonEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  npmPackageJsonJsonSchema,
  /**
   * @category schemas
   * @since 0.0.0
   */
  PackageJsonValidationIssue,
  /**
   * @category schemas
   * @since 0.0.0
   */
  packageJsonJsonSchema,
} from "./schemas/PackageJsonTools.js";` (re-export) - missing @example
- `src/index.ts:258` `export {
  /**
   * @category schemas
   * @since 0.0.0
   */
  decodeTSConfig,
  /**
   * @category schemas
   * @since 0.0.0
   */
  decodeTSConfigEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  decodeTSConfigExit,
  /**
   * @category schemas
   * @since 0.0.0
   */
  decodeTSConfigFromJsoncTextEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  encodeTSConfigEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  encodeTSConfigPrettyEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  encodeTSConfigToJsonEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  TSConfig,
  /**
   * @category schemas
   * @since 0.0.0
   */
  TSConfigBuildOptions,
  /**
   * @category schemas
   * @since 0.0.0
   */
  TSConfigCompilerOptions,
  /**
   * @category schemas
   * @since 0.0.0
   */
  TSConfigReference,
  /**
   * @category schemas
   * @since 0.0.0
   */
  TSConfigTypeAcquisition,
  /**
   * @category schemas
   * @since 0.0.0
   */
  TSConfigWatchOptions,
  /**
   * @category schemas
   * @since 0.0.0
   */
  TSNodeConfig,
} from "./schemas/TSConfig.js";` (re-export) - missing @example
- `src/index.ts:334` `export {
  /**
   * @category models
   * @since 0.0.0
   */
  type DependencyRecord,
  /**
   * @category models
   * @since 0.0.0
   */
  emptyWorkspaceDeps,
  /**
   * @category models
   * @since 0.0.0
   */
  WorkspaceDeps,
} from "./schemas/WorkspaceDeps.js";` (re-export) - missing @example
- `src/index.ts:355` `export * from "./TSMorph/index.js";` (re-export) - missing @example
- `src/index.ts:360` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  collectTsConfigPaths,
} from "./TsConfig.js";` (re-export) - missing @example
- `src/index.ts:371` `export * from "./TypeScript/index.js";` (re-export) - missing @example
- `src/index.ts:404` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  getWorkspaceDir,
  /**
   * @category utilities
   * @since 0.0.0
   */
  resolveWorkspaceDirs,
} from "./Workspaces.js";` (re-export) - missing @example

### @beep/duckdb

Path: `packages/drivers/duckdb`

Export findings:
- `src/index.ts:14` `export * from "./DuckDb.errors.ts";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./DuckDb.models.ts";` (re-export) - missing @example
- `src/index.ts:30` `export * from "./DuckDb.service.ts";` (re-export) - missing @example

### @beep/architecture-lab-config

Path: `packages/architecture-lab/config`

Export findings:
- `src/aggregates/WorkItem/WorkItem.config.ts:20` `WorkItemPublicConfig` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:37` `WorkItemServerConfig` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:54` `WorkItemSecretConfig` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:70` `defaultWorkItemPublicConfig` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:81` `defaultWorkItemServerConfig` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:92` `defaultWorkItemSecretConfig` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:29` `WorkItemConfigShape` (interface) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:41` `WorkItemConfig` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:49` `testWorkItemConfig` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:61` `ArchitectureLabConfigLive` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:69` `ArchitectureLabConfigTest` (const) - missing @example
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.config.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:14` `export * from "./WorkItem.layer.js";` (re-export) - missing @example
- `src/layer.ts:7` `export {
  ArchitectureLabConfigLive,
  WorkItemConfig,
  type WorkItemConfigShape,
} from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/public.ts:7` `export { defaultWorkItemPublicConfig, WorkItemPublicConfig } from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/secrets.ts:7` `export { defaultWorkItemSecretConfig, WorkItemSecretConfig } from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/server.ts:7` `export { defaultWorkItemServerConfig, WorkItemConfig, WorkItemServerConfig } from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/test.ts:7` `export {
  ArchitectureLabConfigTest,
  testWorkItemConfig,
  WorkItemConfig,
  type WorkItemConfigShape,
} from "./aggregates/WorkItem/index.js";` (re-export) - missing @example

### @beep/architecture-lab-tables

Path: `packages/architecture-lab/tables`

Export findings:
- `src/aggregates/WorkItem/WorkItem.table.ts:20` `WORK_ITEM_TABLE_NAME` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:28` `workItemTable` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:43` `WorkItemRow` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:51` `WorkItemInsert` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:59` `toWorkItemInsert` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:72` `fromWorkItemRow` (const) - missing @example
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.table.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * from "./tables.js";` (re-export) - missing @example
- `src/tables.ts:17` `DbSchema` (const) - missing @example
- `src/tables.ts:27` `DbSchema` (type) - missing @example

### @beep/architecture-lab-use-cases

Path: `packages/architecture-lab/use-cases`

Export findings:
- `src/aggregates/WorkItem/WorkItem.commands.ts:21` `CreateWorkItemCommand` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:38` `AssignWorkItemCommand` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:55` `CompleteWorkItemCommand` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:71` `ReopenWorkItemCommand` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:87` `ArchiveWorkItemCommand` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:103` `GetWorkItemQuery` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:119` `ListWorkItemsQuery` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:22` `WorkItemNotFound` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:39` `WorkItemConflict` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:57` `WorkItemActionRejected` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:75` `WorkItemActionFailed` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:92` `WorkItemActionError` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:100` `WorkItemActionError` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/aggregates/WorkItem/WorkItem.repository.ts:23` `WorkItemRepositoryNotFound` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.repository.ts:42` `WorkItemRepositoryConflict` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.repository.ts:62` `WorkItemRepositoryUnavailable` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.repository.ts:81` `WorkItemRepositoryError` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.repository.ts:92` `WorkItemRepositoryShape` (interface) - missing @example
- `src/aggregates/WorkItem/WorkItem.repository.ts:111` `WorkItemRepository` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.use-cases.ts:50` `WorkItemUseCasesShape` (interface) - missing @example
- `src/aggregates/WorkItem/WorkItem.use-cases.ts:68` `WorkItemUseCases` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.use-cases.ts:78` `toWorkItemActionError` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.use-cases.ts:116` `makeWorkItemUseCases` (const) - missing @example
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.commands.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:14` `export * from "./WorkItem.errors.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:21` `export * from "./WorkItem.use-cases.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/server.ts:7` `export * from "./WorkItem.repository.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/server.ts:14` `export { makeWorkItemUseCases, toWorkItemActionError } from "./WorkItem.use-cases.js";` (re-export) - missing @example
- `src/index.ts:30` `export * from "./public.js";` (re-export) - missing @example
- `src/public.ts:7` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/server.ts:7` `export * as WorkItem from "./aggregates/WorkItem/server.js";` (re-export) - missing @example

### @beep/postgres

Path: `packages/drivers/postgres`

Export findings:
- `src/index.ts:14` `export * from "./Postgres.client.ts";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./Postgres.drizzle.ts";` (re-export) - missing @example
- `src/index.ts:30` `export * from "./Postgres.errors.ts";` (re-export) - missing @example
- `src/index.ts:38` `export * from "./Postgres.format.ts";` (re-export) - missing @example
- `src/index.ts:46` `export * from "./Postgres.sqlstate.ts";` (re-export) - missing @example

### @beep/drizzle

Path: `packages/drivers/drizzle`

Export findings:
- `src/index.ts:14` `export * from "./Drizzle.errors.ts";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./Drizzle.service.ts";` (re-export) - missing @example
- `src/index.ts:30` `export * as EntityTable from "./EntityTable.ts";` (re-export) - missing @example

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
- `src/index.ts:12` `export * as Checker from "./Checker.js";` (re-export) - missing @example
- `src/index.ts:18` `export * as Configuration from "./Configuration.js";` (re-export) - missing @example
- `src/index.ts:24` `export * as Core from "./Core.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as Domain from "./Domain.js";` (re-export) - missing @example
- `src/index.ts:36` `export * as Parser from "./Parser.js";` (re-export) - missing @example
- `src/index.ts:42` `export * as Printer from "./Printer.js";` (re-export) - missing @example

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
- `src/experimental/server/index.ts:5` `export * from "./DevToolsRelay.ts";` (re-export) - missing @example
- `src/experimental/server/index.ts:10` `export * from "./OtlpPacketLab.ts";` (re-export) - missing @example
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
- `src/server/TraceContext.ts:93` `withIncomingTraceContext` (const) - missing @example
- `src/server/index.ts:5` `export * from "./Config.ts";` (re-export) - missing @example
- `src/server/index.ts:10` `export * from "./DevTools.ts";` (re-export) - missing @example
- `src/server/index.ts:15` `export * from "./ErrorReporting.ts";` (re-export) - missing @example
- `src/server/index.ts:20` `export * from "./HttpApiTelemetry.ts";` (re-export) - missing @example
- `src/server/index.ts:25` `export * from "./Layer.ts";` (re-export) - missing @example
- `src/server/index.ts:30` `export * from "./NodeSdk.ts";` (re-export) - missing @example
- `src/server/index.ts:35` `export * from "./Prometheus.ts";` (re-export) - missing @example
- `src/server/index.ts:40` `export * from "./TraceContext.ts";` (re-export) - missing @example
- `src/web/index.ts:5` `export * from "./Config.ts";` (re-export) - missing @example
- `src/web/index.ts:10` `export * from "./Layer.ts";` (re-export) - missing @example

### @beep/repo-configs

Path: `packages/tooling/policy-pack/repo-configs`

Export findings:
- `src/next.ts:14` `export * from "./next/index.ts";` (re-export) - missing @example
- `src/next/internal.ts:19` `schemaIssueToError` (const) - missing @example
- `src/next/internal.ts:30` `isFunctionValue` (const) - missing @example
- `src/next/models/AllowedDevOrigin.schema.ts:57` `AllowedDevOrigin` (type) - 1 unsafe example violation(s)
- `src/next/models/ImageConfig.schema.ts:28` `LoaderValue` (const) - 1 schema annotation/type-alias gap(s)

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
- `src/components/accordion.tsx:11` `Accordion` (function) - missing summary; missing @example
- `src/components/accordion.tsx:58` `AccordionContent` (function) - missing summary; missing @example
- `src/components/accordion.tsx:19` `AccordionItem` (function) - missing summary; missing @example
- `src/components/accordion.tsx:29` `AccordionTrigger` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:12` `AlertDialog` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:168` `AlertDialogAction` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:188` `AlertDialogCancel` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:53` `AlertDialogContent` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:148` `AlertDialogDescription` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:97` `AlertDialogFooter` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:80` `AlertDialogHeader` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:114` `AlertDialogMedia` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:36` `AlertDialogOverlay` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:28` `AlertDialogPortal` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:131` `AlertDialogTitle` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:20` `AlertDialogTrigger` (function) - missing summary; missing @example
- `src/components/alert.tsx:25` `Alert` (function) - missing summary; missing @example
- `src/components/alert.tsx:67` `AlertAction` (function) - missing summary; missing @example
- `src/components/alert.tsx:50` `AlertDescription` (function) - missing summary; missing @example
- `src/components/alert.tsx:33` `AlertTitle` (function) - missing summary; missing @example
- `src/components/aspect-ratio.tsx:7` `AspectRatio` (function) - missing summary; missing @example
- `src/components/avatar.tsx:14` `Avatar` (function) - missing summary; missing @example
- `src/components/avatar.tsx:86` `AvatarFallback` (function) - missing summary; missing @example
- `src/components/avatar.tsx:35` `AvatarImage` (function) - missing summary; missing @example
- `src/components/badge.tsx:34` `Badge` (function) - missing summary; missing @example
- `src/components/badge.tsx:10` `badgeVariants` (const) - missing summary; missing @example
- `src/components/banner.tsx:10` `bannerVariants` (const) - missing summary; missing @example
- `src/components/blocks/editor-00/editor.tsx:28` `Editor` (function) - missing @example
- `src/components/blocks/editor-00/nodes.ts:12` `nodes` (const) - missing @example
- `src/components/blocks/editor-00/plugins.tsx:12` `Plugins` (function) - missing @example
- `src/components/breadcrumb.tsx:11` `Breadcrumb` (function) - missing summary; missing @example
- `src/components/breadcrumb.tsx:89` `BreadcrumbEllipsis` (function) - missing summary; missing @example
- `src/components/breadcrumb.tsx:36` `BreadcrumbItem` (function) - missing summary; missing @example
- `src/components/breadcrumb.tsx:44` `BreadcrumbLink` (function) - missing summary; missing @example
- `src/components/breadcrumb.tsx:19` `BreadcrumbList` (function) - missing summary; missing @example
- `src/components/breadcrumb.tsx:54` `BreadcrumbPage` (function) - missing summary; missing @example
- `src/components/breadcrumb.tsx:71` `BreadcrumbSeparator` (function) - missing summary; missing @example
- `src/components/button-group.tsx:33` `ButtonGroup` (function) - missing summary; missing @example
- `src/components/button-group.tsx:76` `ButtonGroupSeparator` (function) - missing summary; missing @example
- `src/components/button-group.tsx:53` `ButtonGroupText` (function) - missing summary; missing @example
- `src/components/button-group.tsx:12` `buttonGroupVariants` (const) - missing summary; missing @example
- `src/components/button.tsx:49` `Button` (function) - missing summary; missing @example
- `src/components/button.tsx:10` `buttonVariants` (const) - missing summary; missing @example
- `src/components/calendar-event-card.tsx:36` `CalendarEventCard` (function) - missing summary; missing @example
- `src/components/calendar-event-card.tsx:134` `EventTitle` (function) - missing summary; missing @example
- `src/components/calendar-event-card.tsx:148` `EventTime` (function) - missing summary; missing @example
- `src/components/calendar-event-card.tsx:168` `EventLocation` (function) - missing summary; missing @example
- `src/components/calendar-event-card.tsx:11` `EventStatus` (type) - missing summary; missing @example
- `src/components/calendar-event-card.tsx:16` `EventVariant` (type) - missing summary; missing @example
- `src/components/calendar.tsx:13` `Calendar` (function) - missing summary; missing @example
- `src/components/calendar.tsx:142` `CalendarDayButton` (function) - missing summary; missing @example
- `src/components/card.tsx:8` `Card` (function) - missing summary; missing @example
- `src/components/card.tsx:69` `CardAction` (function) - missing summary; missing @example
- `src/components/card.tsx:83` `CardContent` (function) - missing summary; missing @example
- `src/components/card.tsx:61` `CardDescription` (function) - missing summary; missing @example
- `src/components/card.tsx:91` `CardFooter` (function) - missing summary; missing @example
- `src/components/card.tsx:30` `CardHeader` (function) - missing summary; missing @example
- `src/components/card.tsx:47` `CardTitle` (function) - missing summary; missing @example
- `src/components/carousel.tsx:51` `Carousel` (function) - missing summary; missing @example
- `src/components/carousel.tsx:15` `CarouselApi` (type) - missing summary; missing @example
- `src/components/carousel.tsx:150` `CarouselContent` (function) - missing summary; missing @example
- `src/components/carousel.tsx:164` `CarouselItem` (function) - missing summary; missing @example
- `src/components/carousel.tsx:216` `CarouselNext` (function) - missing summary; missing @example
- `src/components/carousel.tsx:182` `CarouselPrevious` (function) - missing summary; missing @example
- `src/components/carousel.tsx:42` `useCarousel` (function) - missing summary; missing @example
- `src/components/checkbox.tsx:11` `Checkbox` (function) - missing summary; missing @example
- `src/components/codegraph/components/SearchBar.tsx:15` `SearchMode` (const) - missing summary; missing @example
- `src/components/codegraph/components/SearchBar.tsx:25` `SearchMode` (type) - missing summary; missing @example
- `src/components/codegraph/components/SearchBar.tsx:31` `SearchBarProps` (class) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/components/codegraph/components/StatsPanel.tsx:32` `StatsPanel` (function) - missing summary; missing @example
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
- `src/components/codegraph/styles/graph-layout.tsx:13` `LayoutName` (const) - missing summary; missing @example
- `src/components/codegraph/styles/graph-layout.tsx:23` `LayoutName` (type) - missing summary; missing @example
- `src/components/codegraph/styles/graph-layout.tsx:29` `LayoutBase` (class) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/components/codegraph/styles/graph-layout.tsx:42` `CircleLayout` (class) - missing summary; missing @example
- `src/components/codegraph/styles/graph-layout.tsx:56` `ConcentricLayout` (class) - missing summary; missing @example
- `src/components/codegraph/styles/graph-layout.tsx:73` `BreadthFirstLayout` (class) - missing summary; missing @example
- `src/components/codegraph/styles/graph-layout.tsx:92` `CoseLayout` (class) - missing summary; missing @example
- `src/components/codegraph/styles/graph-layout.tsx:116` `GraphLayout` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/components/codegraph/styles/graph-styles.tsx:10` `graphStyles` (const) - missing summary; missing @example
- `src/components/codegraph/styles/graph-styles.tsx:520` `graphStylesFast` (const) - missing @example
- `src/components/collapsible.tsx:10` `Collapsible` (function) - missing summary; missing @example
- `src/components/collapsible.tsx:26` `CollapsibleContent` (function) - missing summary; missing @example
- `src/components/collapsible.tsx:18` `CollapsibleTrigger` (function) - missing summary; missing @example
- `src/components/combobox.tsx:14` `Combobox` (const) - missing summary; missing @example
- `src/components/combobox.tsx:256` `ComboboxChip` (function) - missing summary; missing @example
- `src/components/combobox.tsx:236` `ComboboxChips` (function) - missing summary; missing @example
- `src/components/combobox.tsx:291` `ComboboxChipsInput` (function) - missing summary; missing @example
- `src/components/combobox.tsx:197` `ComboboxCollection` (function) - missing summary; missing @example
- `src/components/combobox.tsx:94` `ComboboxContent` (function) - missing summary; missing @example
- `src/components/combobox.tsx:205` `ComboboxEmpty` (function) - missing summary; missing @example
- `src/components/combobox.tsx:175` `ComboboxGroup` (function) - missing summary; missing @example
- `src/components/combobox.tsx:58` `ComboboxInput` (function) - missing summary; missing @example
- `src/components/combobox.tsx:151` `ComboboxItem` (function) - missing summary; missing @example
- `src/components/combobox.tsx:183` `ComboboxLabel` (function) - missing summary; missing @example
- `src/components/combobox.tsx:134` `ComboboxList` (function) - missing summary; missing @example
- `src/components/combobox.tsx:222` `ComboboxSeparator` (function) - missing summary; missing @example
- `src/components/combobox.tsx:28` `ComboboxTrigger` (function) - missing summary; missing @example
- `src/components/combobox.tsx:20` `ComboboxValue` (function) - missing summary; missing @example
- `src/components/combobox.tsx:305` `useComboboxAnchor` (function) - missing summary; missing @example
- `src/components/command.tsx:14` `Command` (function) - missing summary; missing @example
- `src/components/command.tsx:31` `CommandDialog` (function) - missing summary; missing @example
- `src/components/command.tsx:97` `CommandEmpty` (function) - missing summary; missing @example
- `src/components/command.tsx:111` `CommandGroup` (function) - missing summary; missing @example
- `src/components/command.tsx:62` `CommandInput` (function) - missing summary; missing @example
- `src/components/command.tsx:142` `CommandItem` (function) - missing summary; missing @example
- `src/components/command.tsx:83` `CommandList` (function) - missing summary; missing @example
- `src/components/command.tsx:128` `CommandSeparator` (function) - missing summary; missing @example
- `src/components/command.tsx:162` `CommandShortcut` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:12` `ContextMenu` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:177` `ContextMenuCheckboxItem` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:42` `ContextMenuContent` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:77` `ContextMenuGroup` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:106` `ContextMenuItem` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:85` `ContextMenuLabel` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:20` `ContextMenuPortal` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:202` `ContextMenuRadioGroup` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:210` `ContextMenuRadioItem` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:234` `ContextMenuSeparator` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:248` `ContextMenuShortcut` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:133` `ContextMenuSub` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:169` `ContextMenuSubContent` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:141` `ContextMenuSubTrigger` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:28` `ContextMenuTrigger` (function) - missing summary; missing @example
- `src/components/conversation.tsx:14` `ConversationProps` (type) - missing summary; missing @example
- `src/components/conversation.tsx:20` `Conversation` (const) - missing summary; missing @example
- `src/components/conversation.tsx:34` `ConversationContentProps` (type) - missing summary; missing @example
- `src/components/conversation.tsx:40` `ConversationContent` (const) - missing summary; missing @example
- `src/components/conversation.tsx:48` `ConversationEmptyStateProps` (type) - missing summary; missing @example
- `src/components/conversation.tsx:58` `ConversationEmptyState` (const) - missing summary; missing @example
- `src/components/conversation.tsx:86` `ConversationScrollButtonProps` (type) - missing summary; missing @example
- `src/components/conversation.tsx:92` `ConversationScrollButton` (const) - missing summary; missing @example
- `src/components/dialog.tsx:13` `Dialog` (function) - missing summary; missing @example
- `src/components/dialog.tsx:163` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:164` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:165` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:166` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:167` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:168` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:169` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:170` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:171` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:37` `DialogClose` (function) - missing summary; missing @example
- `src/components/dialog.tsx:62` `DialogContent` (function) - missing summary; missing @example
- `src/components/dialog.tsx:151` `DialogDescription` (function) - missing summary; missing @example
- `src/components/dialog.tsx:110` `DialogFooter` (function) - missing summary; missing @example
- `src/components/dialog.tsx:102` `DialogHeader` (function) - missing summary; missing @example
- `src/components/dialog.tsx:45` `DialogOverlay` (function) - missing summary; missing @example
- `src/components/dialog.tsx:29` `DialogPortal` (function) - missing summary; missing @example
- `src/components/dialog.tsx:137` `DialogTitle` (function) - missing summary; missing @example
- `src/components/dialog.tsx:21` `DialogTrigger` (function) - missing summary; missing @example
- `src/components/drawer.tsx:11` `Drawer` (function) - missing summary; missing @example
- `src/components/drawer.tsx:35` `DrawerClose` (function) - missing summary; missing @example
- `src/components/drawer.tsx:60` `DrawerContent` (function) - missing summary; missing @example
- `src/components/drawer.tsx:122` `DrawerDescription` (function) - missing summary; missing @example
- `src/components/drawer.tsx:100` `DrawerFooter` (function) - missing summary; missing @example
- `src/components/drawer.tsx:83` `DrawerHeader` (function) - missing summary; missing @example
- `src/components/drawer.tsx:43` `DrawerOverlay` (function) - missing summary; missing @example
- `src/components/drawer.tsx:27` `DrawerPortal` (function) - missing summary; missing @example
- `src/components/drawer.tsx:108` `DrawerTitle` (function) - missing summary; missing @example
- `src/components/drawer.tsx:19` `DrawerTrigger` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:13` `DropdownMenu` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:281` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:282` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:283` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:284` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:285` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:286` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:287` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:288` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:289` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:290` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:291` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:292` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:293` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:294` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:191` `DropdownMenuCheckboxItem` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:37` `DropdownMenuContent` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:71` `DropdownMenuGroup` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:100` `DropdownMenuItem` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:79` `DropdownMenuLabel` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:21` `DropdownMenuPortal` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:219` `DropdownMenuRadioGroup` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:227` `DropdownMenuRadioItem` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:254` `DropdownMenuSeparator` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:268` `DropdownMenuShortcut` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:127` `DropdownMenuSub` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:163` `DropdownMenuSubContent` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:135` `DropdownMenuSubTrigger` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:29` `DropdownMenuTrigger` (function) - missing summary; missing @example
- `src/components/editor/editor-ui/content-editable.tsx:16` `ContentEditable` (function) - missing @example
- `src/components/editor/themes/editor-theme.ts:13` `editorTheme` (const) - missing @example
- `src/components/empty.tsx:10` `Empty` (function) - missing summary; missing @example
- `src/components/empty.tsx:100` `EmptyContent` (function) - missing summary; missing @example
- `src/components/empty.tsx:83` `EmptyDescription` (function) - missing summary; missing @example
- `src/components/empty.tsx:27` `EmptyHeader` (function) - missing summary; missing @example
- `src/components/empty.tsx:56` `EmptyMedia` (function) - missing summary; missing @example
- `src/components/empty.tsx:75` `EmptyTitle` (function) - missing summary; missing @example
- `src/components/field.tsx:85` `Field` (function) - missing summary; missing @example
- `src/components/field.tsx:105` `FieldContent` (function) - missing summary; missing @example
- `src/components/field.tsx:154` `FieldDescription` (function) - missing summary; missing @example
- `src/components/field.tsx:204` `FieldError` (function) - missing summary; missing @example
- `src/components/field.tsx:53` `FieldGroup` (function) - missing summary; missing @example
- `src/components/field.tsx:119` `FieldLabel` (function) - missing summary; missing @example
- `src/components/field.tsx:34` `FieldLegend` (function) - missing summary; missing @example
- `src/components/field.tsx:173` `FieldSeparator` (function) - missing summary; missing @example
- `src/components/field.tsx:17` `FieldSet` (function) - missing summary; missing @example
- `src/components/field.tsx:137` `FieldTitle` (function) - missing summary; missing @example
- `src/components/hover-card.tsx:11` `HoverCard` (function) - missing summary; missing @example
- `src/components/hover-card.tsx:27` `HoverCardContent` (function) - missing summary; missing @example
- `src/components/hover-card.tsx:19` `HoverCardTrigger` (function) - missing summary; missing @example
- `src/components/input-group.tsx:15` `InputGroup` (function) - missing summary; missing @example
- `src/components/input-group.tsx:51` `InputGroupAddon` (function) - missing summary; missing @example
- `src/components/input-group.tsx:91` `InputGroupButton` (function) - missing summary; missing @example
- `src/components/input-group.tsx:132` `InputGroupInput` (function) - missing summary; missing @example
- `src/components/input-group.tsx:116` `InputGroupText` (function) - missing summary; missing @example
- `src/components/input-group.tsx:149` `InputGroupTextarea` (function) - missing summary; missing @example
- `src/components/input-otp.tsx:12` `InputOTP` (function) - missing summary; missing @example
- `src/components/input-otp.tsx:34` `InputOTPGroup` (function) - missing summary; missing @example
- `src/components/input-otp.tsx:85` `InputOTPSeparator` (function) - missing summary; missing @example
- `src/components/input-otp.tsx:51` `InputOTPSlot` (function) - missing summary; missing @example
- `src/components/input.tsx:9` `Input` (function) - missing summary; missing @example
- `src/components/item.tsx:52` `Item` (function) - missing summary; missing @example
- `src/components/item.tsx:166` `ItemActions` (function) - missing summary; missing @example
- `src/components/item.tsx:120` `ItemContent` (function) - missing summary; missing @example
- `src/components/item.tsx:148` `ItemDescription` (function) - missing summary; missing @example
- `src/components/item.tsx:188` `ItemFooter` (function) - missing summary; missing @example
- `src/components/item.tsx:13` `ItemGroup` (function) - missing summary; missing @example
- `src/components/item.tsx:174` `ItemHeader` (function) - missing summary; missing @example
- `src/components/item.tsx:101` `ItemMedia` (function) - missing summary; missing @example
- `src/components/item.tsx:23` `ItemSeparator` (function) - missing summary; missing @example
- `src/components/item.tsx:134` `ItemTitle` (function) - missing summary; missing @example
- `src/components/kbd.tsx:8` `Kbd` (function) - missing summary; missing @example
- `src/components/kbd.tsx:25` `KbdGroup` (function) - missing summary; missing @example
- `src/components/knowledge-graph.tsx:17` `GraphNode` (interface) - missing summary; missing @example
- `src/components/knowledge-graph.tsx:36` `GraphLink` (interface) - missing summary; missing @example
- `src/components/knowledge-graph.tsx:70` `KnowledgeGraphHandle` (interface) - missing summary; missing @example
- `src/components/knowledge-graph.tsx:108` `KnowledgeGraph` (const) - missing summary; missing @example
- `src/components/knowledge-graph.tsx:108` `default` (const) - missing summary; missing @example
- `src/components/label.tsx:10` `Label` (function) - missing summary; missing @example
- `src/components/link-preview.tsx:103` `LinkPreview` (function) - missing summary; missing @example
- `src/components/live-waveform.tsx:12` `LiveWaveformProps` (type) - missing summary; missing @example
- `src/components/live-waveform.tsx:39` `LiveWaveform` (const) - missing summary; missing @example
- `src/components/menubar.tsx:28` `Menubar` (function) - missing summary; missing @example
- `src/components/menubar.tsx:133` `MenubarCheckboxItem` (function) - missing summary; missing @example
- `src/components/menubar.tsx:83` `MenubarContent` (function) - missing summary; missing @example
- `src/components/menubar.tsx:50` `MenubarGroup` (function) - missing summary; missing @example
- `src/components/menubar.tsx:109` `MenubarItem` (function) - missing summary; missing @example
- `src/components/menubar.tsx:190` `MenubarLabel` (function) - missing summary; missing @example
- `src/components/menubar.tsx:42` `MenubarMenu` (function) - missing summary; missing @example
- `src/components/menubar.tsx:58` `MenubarPortal` (function) - missing summary; missing @example
- `src/components/menubar.tsx:158` `MenubarRadioGroup` (function) - missing summary; missing @example
- `src/components/menubar.tsx:166` `MenubarRadioItem` (function) - missing summary; missing @example
- `src/components/menubar.tsx:205` `MenubarSeparator` (function) - missing summary; missing @example
- `src/components/menubar.tsx:219` `MenubarShortcut` (function) - missing summary; missing @example
- `src/components/menubar.tsx:236` `MenubarSub` (function) - missing summary; missing @example
- `src/components/menubar.tsx:268` `MenubarSubContent` (function) - missing summary; missing @example
- `src/components/menubar.tsx:244` `MenubarSubTrigger` (function) - missing summary; missing @example
- `src/components/menubar.tsx:66` `MenubarTrigger` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:11` `NavigationMenu` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:83` `NavigationMenuContent` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:150` `NavigationMenuIndicator` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:45` `NavigationMenuItem` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:133` `NavigationMenuLink` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:31` `NavigationMenuList` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:100` `NavigationMenuPositioner` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:63` `NavigationMenuTrigger` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:55` `navigationMenuTriggerStyle` (const) - missing summary; missing @example
- `src/components/notification-card.tsx:132` `NotificationCard` (function) - missing summary; missing @example
- `src/components/notification-card.tsx:23` `NotificationStatus` (type) - missing summary; missing @example
- `src/components/notification-card.tsx:29` `ActionType` (const) - missing summary; missing @example
- `src/components/notification-card.tsx:39` `ActionType` (type) - missing summary; missing @example
- `src/components/notification-card.tsx:45` `ActionStyle` (const) - missing summary; missing @example
- `src/components/notification-card.tsx:54` `ActionStyle` (type) - missing summary; missing @example
- `src/components/notification-card.tsx:67` `NotificationAction` (const) - missing summary; missing @example
- `src/components/notification-card.tsx:82` `NotificationAction` (type) - missing summary; missing @example
- `src/components/orb.tsx:39` `Orb` (function) - missing summary; missing @example
- `src/components/orb.tsx:17` `AgentState` (type) - missing summary; missing @example
- `src/components/pagination.tsx:10` `Pagination` (function) - missing summary; missing @example
- `src/components/pagination.tsx:25` `PaginationContent` (function) - missing summary; missing @example
- `src/components/pagination.tsx:92` `PaginationEllipsis` (function) - missing summary; missing @example
- `src/components/pagination.tsx:33` `PaginationItem` (function) - missing summary; missing @example
- `src/components/pagination.tsx:46` `PaginationLink` (function) - missing summary; missing @example
- `src/components/pagination.tsx:79` `PaginationNext` (function) - missing summary; missing @example
- `src/components/pagination.tsx:66` `PaginationPrevious` (function) - missing summary; missing @example
- `src/components/popover.tsx:11` `Popover` (function) - missing summary; missing @example
- `src/components/popover.tsx:27` `PopoverContent` (function) - missing summary; missing @example
- `src/components/popover.tsx:80` `PopoverDescription` (function) - missing summary; missing @example
- `src/components/popover.tsx:64` `PopoverHeader` (function) - missing summary; missing @example
- `src/components/popover.tsx:72` `PopoverTitle` (function) - missing summary; missing @example
- `src/components/popover.tsx:19` `PopoverTrigger` (function) - missing summary; missing @example
- `src/components/progress.tsx:11` `Progress` (function) - missing summary; missing @example
- `src/components/progress.tsx:45` `ProgressIndicator` (function) - missing summary; missing @example
- `src/components/progress.tsx:59` `ProgressLabel` (function) - missing summary; missing @example
- `src/components/progress.tsx:31` `ProgressTrack` (function) - missing summary; missing @example
- `src/components/progress.tsx:69` `ProgressValue` (function) - missing summary; missing @example
- `src/components/radio-group.tsx:12` `RadioGroup` (function) - missing summary; missing @example
- `src/components/radio-group.tsx:20` `RadioGroupItem` (function) - missing summary; missing @example
- `src/components/resizable.tsx:32` `ResizableHandle` (function) - missing summary; missing @example
- `src/components/resizable.tsx:19` `ResizablePanel` (function) - missing summary; missing @example
- `src/components/resizable.tsx:11` `ResizablePanelGroup` (function) - missing summary; missing @example
- `src/components/scroll-area.tsx:11` `ScrollArea` (function) - missing summary; missing @example
- `src/components/scroll-area.tsx:30` `ScrollBar` (function) - missing summary; missing @example
- `src/components/select.tsx:12` `Select` (const) - missing summary; missing @example
- `src/components/select.tsx:64` `SelectContent` (function) - missing summary; missing @example
- `src/components/select.tsx:18` `SelectGroup` (function) - missing summary; missing @example
- `src/components/select.tsx:120` `SelectItem` (function) - missing summary; missing @example
- `src/components/select.tsx:106` `SelectLabel` (function) - missing summary; missing @example
- `src/components/select.tsx:179` `SelectScrollDownButton` (function) - missing summary; missing @example
- `src/components/select.tsx:160` `SelectScrollUpButton` (function) - missing summary; missing @example
- `src/components/select.tsx:146` `SelectSeparator` (function) - missing summary; missing @example
- `src/components/select.tsx:36` `SelectTrigger` (function) - missing summary; missing @example
- `src/components/select.tsx:26` `SelectValue` (function) - missing summary; missing @example
- `src/components/separator.tsx:11` `Separator` (function) - missing summary; missing @example
- `src/components/sheet.tsx:13` `Sheet` (function) - missing summary; missing @example
- `src/components/sheet.tsx:29` `SheetClose` (function) - missing summary; missing @example
- `src/components/sheet.tsx:54` `SheetContent` (function) - missing summary; missing @example
- `src/components/sheet.tsx:125` `SheetDescription` (function) - missing summary; missing @example
- `src/components/sheet.tsx:103` `SheetFooter` (function) - missing summary; missing @example
- `src/components/sheet.tsx:95` `SheetHeader` (function) - missing summary; missing @example
- `src/components/sheet.tsx:111` `SheetTitle` (function) - missing summary; missing @example
- `src/components/sheet.tsx:21` `SheetTrigger` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:179` `Sidebar` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:444` `SidebarContent` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:420` `SidebarFooter` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:461` `SidebarGroup` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:489` `SidebarGroupAction` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:509` `SidebarGroupContent` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:471` `SidebarGroupLabel` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:410` `SidebarHeader` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:396` `SidebarInput` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:378` `SidebarInset` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:517` `SidebarMenu` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:606` `SidebarMenuAction` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:637` `SidebarMenuBadge` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:562` `SidebarMenuButton` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:525` `SidebarMenuItem` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:659` `SidebarMenuSkeleton` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:689` `SidebarMenuSub` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:715` `SidebarMenuSubButton` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:707` `SidebarMenuSubItem` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:67` `SidebarProvider` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:350` `SidebarRail` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:434` `SidebarSeparator` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:325` `SidebarTrigger` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:38` `useSidebar` (function) - missing summary; missing @example
- `src/components/skeleton.tsx:7` `Skeleton` (function) - missing summary; missing @example
- `src/components/slider.tsx:13` `Slider` (function) - missing summary; missing @example
- `src/components/sonner.tsx:12` `Toaster` (const) - missing summary; missing @example
- `src/components/speech-input.tsx:142` `SpeechInput` (const) - missing summary; missing @example
- `src/components/speech-input.tsx:399` `SpeechInputCancelButton` (const) - missing summary; missing @example
- `src/components/speech-input.tsx:355` `SpeechInputPreview` (const) - missing summary; missing @example
- `src/components/speech-input.tsx:298` `SpeechInputRecordButton` (const) - missing summary; missing @example
- `src/components/speech-input.tsx:56` `useSpeechInput` (function) - missing summary; missing @example
- `src/components/spinner.tsx:9` `Spinner` (function) - missing summary; missing @example
- `src/components/switch.tsx:11` `Switch` (function) - missing summary; missing @example
- `src/components/table-icons.tsx:9` `BorderAllIcon` (function) - missing summary; missing @example
- `src/components/table-icons.tsx:44` `BorderBottomIcon` (function) - missing summary; missing @example
- `src/components/table-icons.tsx:91` `BorderLeftIcon` (function) - missing summary; missing @example
- `src/components/table-icons.tsx:138` `BorderNoneIcon` (function) - missing summary; missing @example
- `src/components/table-icons.tsx:191` `BorderRightIcon` (function) - missing summary; missing @example
- `src/components/table-icons.tsx:238` `BorderTopIcon` (function) - missing summary; missing @example
- `src/components/table.tsx:10` `Table` (function) - missing summary; missing @example
- `src/components/table.tsx:30` `TableBody` (function) - missing summary; missing @example
- `src/components/table.tsx:97` `TableCaption` (function) - missing summary; missing @example
- `src/components/table.tsx:83` `TableCell` (function) - missing summary; missing @example
- `src/components/table.tsx:38` `TableFooter` (function) - missing summary; missing @example
- `src/components/table.tsx:66` `TableHead` (function) - missing summary; missing @example
- `src/components/table.tsx:22` `TableHeader` (function) - missing summary; missing @example
- `src/components/table.tsx:52` `TableRow` (function) - missing summary; missing @example
- `src/components/tabs.tsx:11` `Tabs` (function) - missing summary; missing @example
- `src/components/tabs.tsx:84` `TabsContent` (function) - missing summary; missing @example
- `src/components/tabs.tsx:45` `TabsList` (function) - missing summary; missing @example
- `src/components/tabs.tsx:64` `TabsTrigger` (function) - missing summary; missing @example
- `src/components/tabs.tsx:26` `tabsListVariants` (const) - missing summary; missing @example
- `src/components/textarea.tsx:8` `Textarea` (function) - missing summary; missing @example
- `src/components/toast.tsx:62` `ToastVariant` (const) - missing summary; missing @example
- `src/components/toast.tsx:72` `ToastVariant` (type) - missing summary; missing @example
- `src/components/toast.tsx:78` `ToastData` (class) - missing summary; missing @example
- `src/components/toast.tsx:91` `Toast` (const) - missing summary; missing @example
- `src/components/toast.tsx:108` `ToastAction` (const) - missing summary; missing @example
- `src/components/toast.tsx:175` `ToastActionElement` (type) - missing summary; missing @example
- `src/components/toast.tsx:126` `ToastClose` (const) - missing summary; missing @example
- `src/components/toast.tsx:157` `ToastDescription` (const) - missing summary; missing @example
- `src/components/toast.tsx:169` `ToastProps` (type) - missing summary; missing @example
- `src/components/toast.tsx:19` `ToastProvider` (const) - missing summary; missing @example
- `src/components/toast.tsx:146` `ToastTitle` (const) - missing summary; missing @example
- `src/components/toast.tsx:25` `ToastViewport` (const) - missing summary; missing @example
- `src/components/toaster.tsx:20` `Toaster` (function) - missing summary; missing @example
- `src/components/todo-item.tsx:92` `TodoItem` (function) - missing summary; missing @example
- `src/components/toggle-group.tsx:26` `ToggleGroup` (function) - missing summary; missing @example
- `src/components/toggle-group.tsx:64` `ToggleGroupItem` (function) - missing summary; missing @example
- `src/components/toggle.tsx:36` `Toggle` (function) - missing summary; missing @example
- `src/components/toggle.tsx:11` `toggleVariants` (const) - missing summary; missing @example
- `src/components/toolbar.tsx:20` `Toolbar` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:28` `ToolbarToggleGroup` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:65` `ToolbarLink` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:73` `ToolbarSeparator` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:198` `ToolbarSplitButton` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:208` `ToolbarSplitButtonPrimary` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:237` `ToolbarSplitButtonSecondary` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:266` `ToolbarToggleItem` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:279` `ToolbarGroup` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:331` `ToolbarMenuGroup` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:143` `ToolbarButton` (const) - missing summary; missing @example
- `src/components/tooltip.tsx:18` `Tooltip` (function) - missing summary; missing @example
- `src/components/tooltip.tsx:34` `TooltipContent` (function) - missing summary; missing @example
- `src/components/tooltip.tsx:10` `TooltipProvider` (function) - missing summary; missing @example
- `src/components/tooltip.tsx:26` `TooltipTrigger` (function) - missing summary; missing @example
- `src/components/tour.tsx:41` `Step` (interface) - missing summary; missing @example
- `src/components/tour.tsx:60` `Tour` (interface) - missing summary; missing @example
- `src/components/tour.tsx:69` `TourProvider` (function) - missing summary; missing @example
- `src/components/tour.tsx:32` `useTour` (function) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:9` `default` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:39` `Default` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:54` `Outline` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:62` `Secondary` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:70` `Ghost` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:78` `Destructive` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:86` `Link` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:94` `Small` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:102` `Large` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:110` `ClickInteraction` (const) - missing summary; missing @example
- `src/components/ui/button.tsx:64` `Button` (function) - missing @example
- `src/components/ui/button.tsx:20` `buttonVariants` (const) - missing @example
- `src/components/ui/tooltip.tsx:21` `Tooltip` (function) - missing summary; missing @example
- `src/components/ui/tooltip.tsx:37` `TooltipContent` (function) - missing summary; missing @example
- `src/components/ui/tooltip.tsx:13` `TooltipProvider` (function) - missing @example
- `src/components/ui/tooltip.tsx:29` `TooltipTrigger` (function) - missing summary; missing @example
- `src/hooks/index.ts:13` `export * from "./useNumberInput.ts";` (re-export) - missing @example
- `src/hooks/useMobile.ts:32` `useIsMobile` (function) - missing @example
- `src/hooks/useMobile.ts:24` `resolveIsMobile` (const) - missing @example
- `src/hooks/useNumberInput.ts:213` `minSafeInteger` (const) - missing @example
- `src/hooks/useNumberInput.ts:221` `maxSafeInteger` (const) - missing @example
- `src/hooks/useNumberInput.ts:229` `BoundaryParams` (class) - missing @example
- `src/hooks/useNumberInput.ts:247` `SpinParams` (class) - missing @example
- `src/hooks/useNumberInput.ts:377` `NumberInputEventType` (const) - missing @example
- `src/hooks/useNumberInput.ts:389` `NumberInputEventType` (type) - missing @example
- `src/hooks/useNumberInput.ts:397` `NumberInputError` (const) - missing @example
- `src/hooks/useNumberInput.ts:409` `NumberInputError` (type) - missing @example
- `src/hooks/useNumberInput.ts:417` `NumberInputChangeMetadata` (class) - missing @example
- `src/hooks/useNumberInput.ts:455` `UseNumberInputOptions` (type) - missing @example
- `src/hooks/useNumberInput.ts:520` `useNumberBoundary` (const) - missing @example
- `src/hooks/useNumberInput.ts:596` `useNumberInput` (const) - missing @example
- `src/hooks/useSpinner.ts:134` `useSpinner` (function) - missing @example
- `src/index.ts:21` `VERSION` (const) - missing summary; missing @example
- `src/lib/index.ts:5` `export * from "./url.ts";` (re-export) - missing @example
- `src/lib/index.ts:10` `export * from "./utils.ts";` (re-export) - missing @example
- `src/lib/react-invariant.ts:20` `ReactContextInvariantOptions` (class) - missing @example
- `src/lib/url.ts:77` `sanitizeAnchorHref` (const) - missing @example
- `src/lib/utils.ts:20` `cn` (function) - missing @example
- `src/themes/colors.ts:30` `colors` (const) - missing @example
- `src/themes/components/alert.ts:7` `alertTheme` (const) - missing summary; missing @example
- `src/themes/components/autocomplete.ts:14` `autocompleteTheme` (const) - missing summary; missing @example
- `src/themes/components/avatar.ts:7` `avatarTheme` (const) - missing summary; missing @example
- `src/themes/components/button.ts:8` `buttonTheme` (const) - missing summary; missing @example
- `src/themes/components/card.ts:7` `cardTheme` (const) - missing summary; missing @example
- `src/themes/components/chip.ts:14` `chipTheme` (const) - missing summary; missing @example
- `src/themes/components/controls.ts:86` `controlsTheme` (const) - missing summary; missing @example
- `src/themes/components/data-grid.ts:8` `dataGridTheme` (const) - missing summary; missing @example
- `src/themes/components/date-picker.ts:10` `datePickerTheme` (const) - missing summary; missing @example
- `src/themes/components/dialog.ts:7` `dialogTheme` (const) - missing summary; missing @example
- `src/themes/components/layout.ts:7` `layoutTheme` (const) - missing summary; missing @example
- `src/themes/components/link.ts:7` `linkTheme` (const) - missing summary; missing @example
- `src/themes/components/list.ts:7` `listTheme` (const) - missing summary; missing @example
- `src/themes/components/menu.ts:7` `menuTheme` (const) - missing summary; missing @example
- `src/themes/components/progress.ts:7` `progressTheme` (const) - missing summary; missing @example
- `src/themes/components/select.ts:8` `selectTheme` (const) - missing summary; missing @example
- `src/themes/components/svg-icon.ts:7` `svgIconTheme` (const) - missing summary; missing @example
- `src/themes/components/table.ts:7` `tableTheme` (const) - missing summary; missing @example
- `src/themes/components/text-field.ts:32` `textFieldTheme` (const) - missing summary; missing @example
- `src/themes/components/tree-view.ts:8` `treeViewTheme` (const) - missing summary; missing @example
- `src/themes/index.ts:12` `export * from "./theme.ts";` (re-export) - missing @example
- `src/themes/index.ts:17` `export * from "./theme-provider.tsx";` (re-export) - missing @example
- `src/themes/scales.ts:7` `CONTROL_HEIGHTS` (const) - missing @example
- `src/themes/scales.ts:19` `CONTROL_TOUCH_HEIGHTS` (const) - missing @example
- `src/themes/scales.ts:35` `TOUCH_MEDIA_QUERY` (const) - missing @example
- `src/themes/scales.ts:44` `SWITCH_SIZES` (const) - missing @example
- `src/themes/scales.ts:56` `SWITCH_TOUCH_SIZES` (const) - missing @example
- `src/themes/shadows.ts:9` `shadows` (const) - missing @example
- `src/themes/theme-provider.tsx:96` `AppThemeProvider` (function) - missing @example
- `src/themes/theme-provider.tsx:111` `useThemeMode` (function) - missing @example
- `src/themes/theme-provider.tsx:26` `ThemeMode` (const) - missing @example
- `src/themes/theme-provider.tsx:38` `ThemeMode` (type) - missing @example
- `src/themes/theme-provider.tsx:46` `ResolvedThemeMode` (const) - missing @example
- `src/themes/theme-provider.tsx:58` `ResolvedThemeMode` (type) - missing @example
- `src/themes/theme-provider.tsx:78` `resolveThemeMode` (const) - missing @example
- `src/themes/theme.ts:33` `theme` (const) - missing @example
- `src/themes/types.ts:9` `ThemeOptions` (type) - missing @example
- `src/themes/types.ts:17` `ThemeComponents` (type) - missing @example
- `src/themes/typography.ts:89` `typography` (const) - missing @example
- `src/themes/typography.ts:113` `typographyTheme` (const) - missing @example
- `src/types/component.ts:18` `OverridableComponent` (type) - missing summary; missing @example
- `src/types/component.ts:33` `ForwardStyledProps` (type) - missing summary; missing @example
- `src/types/index.ts:5` `export * from "./component";` (re-export) - missing @example

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

### @beep/architecture-lab-ui

Path: `packages/architecture-lab/ui`

Export findings:
- `src/aggregates/WorkItem/WorkItem.view-model.ts:28` `WorkItemVisibleAction` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.view-model.ts:41` `WorkItemVisibleAction` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.view-model.ts:49` `WorkItemSummaryViewModel` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.view-model.ts:88` `toWorkItemSummaryViewModel` (const) - missing @example
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.view-model.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example

### @beep/architecture-lab-server

Path: `packages/architecture-lab/server`

Export findings:
- `src/Layer.ts:20` `ArchitectureLabServerLive` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.http.ts:23` `WorkItemHttpResponse` (interface) - missing @example
- `src/aggregates/WorkItem/WorkItem.http.ts:34` `toWorkItemHttpError` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.http.ts:57` `makeWorkItemHttpHandlers` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:24` `makeWorkItemServer` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:35` `WorkItemServer` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:45` `WorkItemServerLayer` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.repo.ts:44` `makeInMemoryWorkItemRepository` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.repo.ts:116` `makeDrizzleWorkItemRepository` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.repo.ts:174` `makeWorkItemRepository` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.rpc.ts:17` `makeWorkItemRpcHandlers` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.tools.ts:17` `WorkItemToolNames` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.tools.ts:33` `makeWorkItemToolHandlers` (const) - missing @example
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.http.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:14` `export * from "./WorkItem.layer.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:21` `export * from "./WorkItem.repo.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:28` `export * from "./WorkItem.rpc.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:35` `export * from "./WorkItem.tools.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * from "./Layer.js";` (re-export) - missing @example
- `src/test.ts:20` `ArchitectureLabServerTest` (const) - missing @example

### @beep/workspace-tables

Path: `packages/workspace/tables`

Export findings:
- `src/Schema.ts:39` `DbSchema` (type) - missing @example
- `src/index.ts:29` `export { DbSchema } from "./Schema.ts";` (re-export) - missing @example

### @beep/db-admin

Path: `packages/_internal/db-admin`

Export findings:
- `src/index.ts:29` `export * from "./targets.js";` (re-export) - missing @example
- `src/migrations/ArchitectureLab.ts:18` `DbAdminMigrationTarget` (interface) - missing @example
- `src/migrations/ArchitectureLab.ts:31` `ArchitectureLabMigrationTarget` (const) - missing @example
- `src/schema.ts:9` `export * from "@beep/architecture-lab-tables/tables";` (re-export) - missing @example
- `src/targets.ts:27` `DbAdminMigrationTargets` (const) - missing @example
- `src/targets.ts:35` `listDbAdminMigrationTargets` (const) - missing @example

### @beep/architecture-lab-client

Path: `packages/architecture-lab/client`

Export findings:
- `src/aggregates/WorkItem/WorkItem.client.ts:22` `WorkItemClientTransport` (interface) - missing @example
- `src/aggregates/WorkItem/WorkItem.client.ts:52` `WorkItemClientShape` (interface) - missing @example
- `src/aggregates/WorkItem/WorkItem.client.ts:60` `WorkItemClient` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.client.ts:68` `makeWorkItemClient` (const) - missing @example
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.client.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example

### @beep/repo-cli

Path: `packages/tooling/tool/cli`

Export findings:
- `src/commands/AIDocs/AIDocs.ts:23` `AIDocsError` (class) - missing @example
- `src/commands/AIDocs/AIDocs.ts:37` `AIDocKind` (const) - missing @example
- `src/commands/AIDocs/AIDocs.ts:87` `AIDocKind` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:29` `ArchitectureDomainKind` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:41` `ArchitectureDomainKind` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:49` `ArchitecturePlanStage` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:61` `ArchitecturePlanStage` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:69` `ArchitectureSliceRole` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:91` `ArchitectureSliceRole` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:99` `ArchitectureWriterKind` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:117` `ArchitectureWriterKind` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:125` `ArchitectureSliceRolePlan` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:143` `ArchitecturePlanTarget` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:162` `WriteFileOperation` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:182` `EnsureFileOperation` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:200` `EnsureAbsentPathOperation` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:217` `ArchitectureOperation` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/commands/Architecture/OperationPlan.ts:225` `ArchitectureOperation` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:233` `CanonicalSliceOperationPlan` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:269` `OperationPlanCheckResult` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:287` `OperationPlanApplyResult` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:817` `makeCanonicalSliceOperationPlan` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:855` `makeArchitectureOperationPlan` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:907` `encodeCanonicalSliceOperationPlanJson` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:915` `decodeCanonicalSliceOperationPlanJson` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:928` `checkCanonicalSliceOperationPlan` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:983` `applyCanonicalSliceOperationPlan` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:1273` `architectureCommand` (const) - missing @example
- `src/commands/Architecture/index.ts:7` `export * from "./OperationPlan.js";` (re-export) - missing @example
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
- `src/commands/Docgen/index.ts:728` `docgenCommand` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:86` `DocgenPackageStatus` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:101` `DocgenPackageStatus` (type) - missing @example
- `src/commands/Docgen/internal/Operations.ts:115` `DocgenConfigDocument` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:144` `DocgenWorkspacePackage` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:165` `DocgenIssuePriority` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:176` `DocgenIssuePriority` (type) - missing @example
- `src/commands/Docgen/internal/Operations.ts:184` `DocgenExportKind` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:205` `DocgenExportKind` (type) - missing @example
- `src/commands/Docgen/internal/Operations.ts:213` `DocgenExportAnalysis` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:239` `DocgenAnalysisSummary` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:260` `DocgenPackageAnalysis` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:279` `DocgenGenerationResult` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:299` `DocgenAggregateResult` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1127` `normalizeDocsOutputPath` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1138` `loadDocgenConfigDocument` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1166` `createDocgenConfigDocument` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1209` `discoverDocgenWorkspacePackages` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1252` `resolveDocgenWorkspacePackage` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1304` `analyzePackageDocumentation` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1348` `generateAnalysisReport` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1466` `generateAnalysisJson` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1476` `aggregateGeneratedDocs` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1626` `runDocgenForPackage` (const) - missing @example
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
- `src/commands/Files/index.ts:15` `export * from "./Files.command.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:22` `export * from "./Files.errors.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:29` `export * from "./Files.schemas.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:36` `export * from "./Files.service.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:43` `export * from "./Files.utils.js";` (re-export) - missing @example
- `src/commands/Graphiti/internal/ProxyServices.ts:56` `ContainerHealthState` (const) - 1 schema annotation/type-alias gap(s)
- `src/commands/Graphiti/internal/ProxyServices.ts:72` `DependencyHealthState` (const) - 1 schema annotation/type-alias gap(s)
- `src/commands/Quality/Tasks.ts:693` `sqlIntegrationStepForTesting` (const) - missing @example
- `src/commands/Quality/Tasks.ts:707` `runSqlIntegrationTestLaneForTesting` (const) - missing @example
- `src/commands/Quality/Tasks.ts:716` `sqlIntegrationConnectionUriFromEnvForTesting` (const) - missing @example
- `src/commands/Quality/Tasks.ts:850` `rootQualityStepsForTesting` (const) - missing @example
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
   * @category models
   * @since 0.0.0
   */
  buildCanonicalAliasTargets,
  /**
   * Resolve the canonical root export target from a package `exports` field.
   *
   * @category models
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
- `src/index.ts:48` `export {
  /**
   * Code generation command for workspace barrels and exports.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  codegenCommand,
} from "./commands/Codegen.js";` (re-export) - missing @example
- `src/index.ts:90` `export {
  /**
   * Package scaffolding command for creating new workspace packages.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  createPackageCommand,
} from "./commands/CreatePackage/index.js";` (re-export) - missing @example
- `src/index.ts:105` `export {
  /**
   * Human-first docgen command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  docgenCommand,
} from "./commands/Docgen/index.js";` (re-export) - missing @example
- `src/index.ts:120` `export {
  /**
   * Command-first docs discovery command tree.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  docsCommand,
} from "./commands/Docs.js";` (re-export) - missing @example
- `src/index.ts:135` `export {
  /**
   * Dataset file curation command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  filesCommand,
} from "./commands/Files/index.js";` (re-export) - missing @example
- `src/index.ts:150` `export {
  /**
   * Graphiti operational command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  graphitiCommand,
} from "./commands/Graphiti/index.js";` (re-export) - missing @example
- `src/index.ts:165` `export {
  /**
   * Image and video curation command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  imageCommand,
} from "./commands/Image/index.js";` (re-export) - missing @example
- `src/index.ts:180` `export {
  /**
   * Effect laws command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  lawsCommand,
} from "./commands/Laws/index.js";` (re-export) - missing @example
- `src/index.ts:195` `export {
  /**
   * Lint policy command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  lintCommand,
} from "./commands/Lint/index.js";` (re-export) - missing @example
- `src/index.ts:210` `export {
  /**
   * Purge command for removing root/workspace build artifacts.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  purgeCommand,
} from "./commands/Purge.js";` (re-export) - missing @example
- `src/index.ts:252` `export {
  /**
   * Reuse-discovery command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  reuseCommand,
} from "./commands/Reuse/index.js";` (re-export) - missing @example
- `src/index.ts:267` `export {
  /**
   * Root CLI command that composes subcommands.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  rootCommand,
} from "./commands/Root.js";` (re-export) - missing @example
- `src/index.ts:282` `export {
  /**
   * Official data sync command for checked-in generated TypeScript modules.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  syncDataToTsCommand,
} from "./commands/SyncDataToTs/index.js";` (re-export) - missing @example
- `src/index.ts:297` `export {
  /**
   * Dependency topological sort command.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  topoSortCommand,
} from "./commands/TopoSort.js";` (re-export) - missing @example
- `src/index.ts:312` `export {
  /**
   * Tsconfig sync command for workspace tsconfig references and root aliases.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  tsconfigSyncCommand,
} from "./commands/TsconfigSync.js";` (re-export) - missing @example
- `src/index.ts:327` `export {
  /**
   * Version sync command for detecting and fixing version drift.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  versionSyncCommand,
} from "./commands/VersionSync/index.js";` (re-export) - missing @example

### @beep/sandbox

Path: `packages/foundation/capability/sandbox`

Export findings:
- `src/Agent.provider.ts:333` `ParsedStreamEvent` (const) - missing @example
- `src/Agent.provider.ts:359` `ParsedStreamEvent` (type) - missing @example
- `src/Agent.provider.ts:367` `CodexEffort` (const) - missing @example
- `src/Agent.provider.ts:379` `CodexEffort` (type) - missing @example
- `src/Agent.provider.ts:387` `ClaudeEffort` (const) - missing @example
- `src/Agent.provider.ts:399` `ClaudeEffort` (type) - missing @example
- `src/Agent.provider.ts:407` `AgentCommandOptions` (class) - missing @example
- `src/Agent.provider.ts:424` `PrintCommand` (class) - missing @example
- `src/Agent.provider.ts:440` `IterationUsage` (class) - missing @example
- `src/Agent.provider.ts:458` `CodexOptions` (class) - missing @example
- `src/Agent.provider.ts:474` `PiOptions` (class) - missing @example
- `src/Agent.provider.ts:489` `OpenCodeOptions` (class) - missing @example
- `src/Agent.provider.ts:504` `ClaudeCodeOptions` (class) - missing @example
- `src/Agent.provider.ts:521` `AgentProvider` (interface) - missing @example
- `src/Agent.provider.ts:537` `DEFAULT_CLAUDE_MODEL` (const) - missing @example
- `src/Agent.provider.ts:759` `codex` (const) - missing @example
- `src/Agent.provider.ts:783` `pi` (const) - missing @example
- `src/Agent.provider.ts:803` `opencode` (const) - missing @example
- `src/Agent.provider.ts:822` `claudeCode` (const) - missing @example
- `src/AgentStreamEmitter.ts:24` `AgentStreamEvent` (const) - missing @example
- `src/AgentStreamEmitter.ts:51` `AgentStreamEvent` (type) - missing @example
- `src/AgentStreamEmitter.ts:59` `AgentStreamEvent` (namespace) - missing @example
- `src/AgentStreamEmitter.ts:75` `AgentStreamEmitterShape` (interface) - missing @example
- `src/AgentStreamEmitter.ts:85` `AgentStreamEmitter` (class) - missing @example
- `src/AgentStreamEmitter.ts:95` `noopAgentStreamEmitterLayer` (const) - missing @example
- `src/AgentStreamEmitter.ts:110` `callbackAgentStreamEmitterLayer` (const) - missing @example
- `src/Display.ts:26` `Severity` (const) - missing @example
- `src/Display.ts:38` `Severity` (type) - missing @example
- `src/Display.ts:46` `DisplayEntryStatus` (class) - missing @example
- `src/Display.ts:63` `DisplayEntryIntro` (class) - missing @example
- `src/Display.ts:79` `DisplayEntrySpinner` (class) - missing @example
- `src/Display.ts:95` `DisplayEntrySummary` (class) - missing @example
- `src/Display.ts:112` `DisplayEntryTaskLog` (class) - missing @example
- `src/Display.ts:129` `DisplayEntryText` (class) - missing @example
- `src/Display.ts:145` `DisplayEntryToolCall` (class) - missing @example
- `src/Display.ts:162` `DisplayEntry` (const) - missing @example
- `src/Display.ts:183` `DisplayEntry` (type) - missing @example
- `src/Display.ts:191` `DisplayServiceShape` (interface) - missing @example
- `src/Display.ts:216` `Display` (class) - missing @example
- `src/Display.ts:234` `SilentDisplay` (const) - missing @example
- `src/Display.ts:422` `FileDisplay` (const) - missing @example
- `src/Display.ts:452` `terminalStyle` (const) - missing @example
- `src/Display.ts:466` `ClackDisplay` (const) - missing @example
- `src/Env.ts:26` `MergeProviderEnvOptions` (class) - missing @example
- `src/Env.ts:79` `resolveEnv` (const) - missing @example
- `src/Env.ts:110` `mergeProviderEnv` (const) - missing @example
- `src/Image.ts:26` `ContainerImageRuntime` (const) - missing @example
- `src/Image.ts:38` `ContainerImageRuntime` (type) - missing @example
- `src/Init.ts:31` `SANDBOX_CONFIG_DIR` (const) - missing @example
- `src/Init.ts:39` `SandboxAgentName` (const) - missing @example
- `src/Init.ts:51` `SandboxAgentName` (type) - missing @example
- `src/Init.ts:59` `SandboxInitProviderName` (const) - missing @example
- `src/Init.ts:71` `SandboxInitProviderName` (type) - missing @example
- `src/Lifecycle.ts:40` `HostLifecycleHookCommand` (class) - missing @example
- `src/Lifecycle.ts:56` `SandboxLifecycleHookCommand` (class) - missing @example
- `src/Lifecycle.ts:73` `HostLifecycleHooks` (class) - missing @example
- `src/Lifecycle.ts:89` `SandboxLifecycleHooks` (class) - missing @example
- `src/Lifecycle.ts:104` `SandboxHooks` (class) - missing @example
- `src/Lifecycle.ts:120` `SandboxLifecycleSetupOptions` (class) - missing @example
- `src/Lifecycle.ts:142` `MergeToHeadOptions` (class) - missing @example
- `src/Lifecycle.ts:162` `RunHostHooksOptions` (class) - missing @example
- `src/Lifecycle.ts:296` `runHostHooks` (const) - missing @example
- `src/Lifecycle.ts:438` `prepareSandboxLifecycle` (const) - missing @example
- `src/Lifecycle.ts:510` `getHostHead` (const) - missing @example
- `src/Lifecycle.ts:535` `mergeToHead` (const) - missing @example
- `src/Orchestrator.ts:33` `IterationResult` (class) - missing @example
- `src/Orchestrator.ts:50` `CommitSummary` (class) - missing @example
- `src/Orchestrator.ts:65` `OrchestrateResult` (class) - missing @example
- `src/Orchestrator.ts:85` `OrchestrateOptions` (interface) - missing @example
- `src/Orchestrator.ts:178` `orchestrate` (const) - missing @example
- `src/Prompt.ts:31` `SHELL_BLOCK_MARKER` (const) - missing @example
- `src/Prompt.ts:42` `BUILT_IN_PROMPT_ARG_KEYS` (const) - missing @example
- `src/Prompt.ts:50` `BUILT_IN_PROMPT_ARG_KEY_SET` (const) - missing @example
- `src/Prompt.ts:58` `BuiltInPromptArgKey` (const) - missing @example
- `src/Prompt.ts:70` `BuiltInPromptArgKey` (type) - missing @example
- `src/Prompt.ts:78` `PromptArgValue` (const) - missing @example
- `src/Prompt.ts:90` `PromptArgValue` (type) - missing @example
- `src/Prompt.ts:98` `PromptArgs` (const) - missing @example
- `src/Prompt.ts:110` `PromptArgs` (type) - missing @example
- `src/Prompt.ts:120` `PromptSource` (const) - missing @example
- `src/Prompt.ts:132` `PromptSource` (type) - missing @example
- `src/Prompt.ts:140` `ResolvePromptOptions` (class) - missing @example
- `src/Prompt.ts:156` `ResolvedPrompt` (class) - missing @example
- `src/Prompt.ts:172` `ExpandPromptShellExpressionsOptions` (class) - missing @example
- `src/Prompt.ts:191` `resolvePrompt` (const) - missing @example
- `src/Prompt.ts:218` `validateNoArgsWithInlinePrompt` (const) - missing @example
- `src/Prompt.ts:237` `validateNoBuiltInArgOverride` (const) - missing @example
- `src/Prompt.ts:256` `findMissingPromptArgKeys` (const) - missing @example
- `src/Prompt.ts:288` `substitutePromptArgs` (const) - missing @example
- `src/Prompt.ts:395` `expandPromptShellExpressions` (const) - missing @example
- `src/RecoveryMessage.ts:40` `FailedStep` (type) - missing @example
- `src/Run.ts:75` `DEFAULT_MAX_ITERATIONS` (const) - missing @example
- `src/Run.ts:83` `LoggingOptionKind` (const) - missing @example
- `src/Run.ts:95` `LoggingOptionKind` (type) - missing @example
- `src/Run.ts:103` `Timeouts` (class) - missing @example
- `src/Run.ts:165` `FileLoggingOption` (class) - missing @example
- `src/Run.ts:182` `StdoutLoggingOption` (class) - missing @example
- `src/Run.ts:196` `LoggingOption` (const) - missing @example
- `src/Run.ts:208` `LoggingOption` (type) - missing @example
- `src/Run.ts:216` `RunSummaryRowOptions` (class) - missing @example
- `src/Run.ts:235` `FileDisplayStartupOptions` (class) - missing @example
- `src/Run.ts:253` `LogFilenameOptions` (class) - missing @example
- `src/Run.ts:269` `RunResult` (class) - missing @example
- `src/Run.ts:295` `RunOptions` (interface) - missing @example
- `src/Run.ts:319` `sanitizeBranchForFilename` (const) - missing @example
- `src/Run.ts:327` `buildLogFilename` (const) - missing @example
- `src/Run.ts:350` `buildRunSummaryRows` (const) - missing @example
- `src/Run.ts:363` `buildCompletionMessage` (const) - missing @example
- `src/Run.ts:392` `formatContextWindowSize` (const) - missing @example
- `src/Run.ts:408` `buildContextWindowLines` (const) - missing @example
- `src/Run.ts:742` `run` (const) - missing @example
- `src/Sandbox.error-handler.ts:57` `formatErrorMessage` (const) - missing @example
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
- `src/Sandbox.errors.ts:287` `SyncOutTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:303` `HookTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:320` `GitSetupTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:337` `PromptExpansionTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:356` `CommitCollectionTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:374` `MergeToHostTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:392` `SessionCaptureError` (class) - missing @example
- `src/Sandbox.errors.ts:408` `CwdError` (class) - missing @example
- `src/Sandbox.errors.ts:424` `SandboxError` (const) - missing @example
- `src/Sandbox.errors.ts:490` `SandboxError` (type) - missing @example
- `src/Sandbox.errors.ts:498` `SandboxError` (namespace) - missing @example
- `src/Sandbox.observability.ts:138` `SandboxPhaseAttributes` (const) - missing @example
- `src/Sandbox.observability.ts:150` `SandboxPhaseAttributes` (type) - missing @example
- `src/Sandbox.process.ts:140` `SandboxProcessShape` (interface) - missing @example
- `src/Sandbox.process.ts:242` `SandboxProcessLive` (const) - missing @example
- `src/Sandbox.provider.ts:23` `SandboxProviderKind` (const) - missing @example
- `src/Sandbox.provider.ts:35` `SandboxProviderKind` (type) - missing @example
- `src/Sandbox.provider.ts:43` `ExecResult` (class) - missing @example
- `src/Sandbox.provider.ts:60` `SandboxExecOptions` (class) - missing @example
- `src/Sandbox.provider.ts:78` `InteractiveExecResult` (class) - missing @example
- `src/Sandbox.provider.ts:93` `InteractiveExecOptions` (interface) - missing @example
- `src/Sandbox.provider.ts:106` `MountEntry` (class) - missing @example
- `src/Sandbox.provider.ts:123` `BindMountCreateOptions` (class) - missing @example
- `src/Sandbox.provider.ts:141` `IsolatedCreateOptions` (class) - missing @example
- `src/Sandbox.provider.ts:156` `HeadBranchStrategy` (class) - missing @example
- `src/Sandbox.provider.ts:170` `MergeToHeadBranchStrategy` (class) - missing @example
- `src/Sandbox.provider.ts:184` `NamedBranchStrategy` (class) - missing @example
- `src/Sandbox.provider.ts:201` `BranchStrategy` (const) - missing @example
- `src/Sandbox.provider.ts:213` `BranchStrategy` (type) - missing @example
- `src/Sandbox.provider.ts:221` `SandboxHandle` (interface) - missing @example
- `src/Sandbox.provider.ts:238` `BindMountSandboxHandle` (interface) - missing @example
- `src/Sandbox.provider.ts:248` `IsolatedSandboxHandle` (interface) - missing @example
- `src/Sandbox.provider.ts:258` `NoSandboxHandle` (interface) - missing @example
- `src/Sandbox.provider.ts:266` `BindMountSandboxProvider` (interface) - missing @example
- `src/Sandbox.provider.ts:280` `IsolatedSandboxProvider` (interface) - missing @example
- `src/Sandbox.provider.ts:293` `NoSandboxProvider` (interface) - missing @example
- `src/Sandbox.provider.ts:309` `SandboxProvider` (type) - missing @example
- `src/Sandbox.provider.ts:320` `BindMountSandboxProviderConfig` (interface) - missing @example
- `src/Sandbox.provider.ts:333` `IsolatedSandboxProviderConfig` (interface) - missing @example
- `src/Sandbox.provider.ts:345` `createBindMountSandboxProvider` (const) - missing @example
- `src/Sandbox.provider.ts:361` `createIsolatedSandboxProvider` (const) - missing @example
- `src/Sandbox.provider.ts:384` `fromPromiseBindMountSandboxProvider` (const) - missing @example
- `src/Sandbox.provider.ts:405` `fromPromiseIsolatedSandboxProvider` (const) - missing @example
- `src/Sandbox.provider.ts:426` `matchSandboxProvider` (const) - missing @example
- `src/Sandbox.providers.ts:60` `NoSandboxOptions` (class) - missing @example
- `src/Sandbox.providers.ts:75` `ContainerProviderOptions` (class) - missing @example
- `src/Sandbox.providers.ts:283` `noSandbox` (const) - missing @example
- `src/Sandbox.providers.ts:340` `docker` (const) - missing @example
- `src/Sandbox.providers.ts:349` `podman` (const) - missing @example
- `src/Session.ts:26` `SessionPathsShape` (class) - missing @example
- `src/Session.ts:42` `SessionId` (const) - missing @example
- `src/Session.ts:58` `SessionId` (type) - missing @example
- `src/Session.ts:66` `SessionPaths` (class) - missing @example
- `src/Session.ts:74` `SessionStore` (interface) - missing @example
- `src/Session.ts:86` `encodeProjectPath` (const) - missing @example
- `src/Session.ts:94` `sessionPathsLayer` (const) - missing @example
- `src/Session.ts:103` `defaultSessionPathsLayer` (const) - missing @example
- `src/Session.ts:132` `SessionTransferResult` (class) - missing @example
- `src/Session.ts:147` `hostSessionStore` (const) - missing @example
- `src/Session.ts:188` `sandboxSessionStore` (const) - missing @example
- `src/Session.ts:220` `transferSession` (const) - missing @example
- `src/SyncIn.ts:29` `SyncInResult` (class) - missing @example
- `src/SyncIn.ts:178` `syncIn` (const) - missing @example
- `src/SyncOut.ts:39` `SyncOutOptions` (class) - missing @example
- `src/SyncOut.ts:54` `SyncOutResult` (class) - missing @example
- `src/SyncOut.ts:358` `syncOut` (const) - missing @example
- `src/Template.ts:27` `SandboxTemplateName` (const) - missing @example
- `src/Template.ts:39` `SandboxTemplateName` (type) - missing @example
- `src/TextDeltaBuffer.ts:52` `TextDeltaFlush` (type) - missing @example
- `src/Worktree.ts:37` `WorktreeInfo` (class) - missing @example
- `src/Worktree.ts:53` `CreateWorktreeInfoOptions` (class) - missing @example
- `src/Worktree.ts:71` `sanitizeName` (const) - missing @example
- `src/Worktree.ts:79` `generateTempBranchName` (const) - missing @example
- `src/Worktree.ts:121` `getCurrentBranch` (const) - missing @example
- `src/Worktree.ts:133` `hasUncommittedChanges` (const) - missing @example
- `src/Worktree.ts:145` `createWorktreeInfo` (const) - missing @example
- `src/Worktree.ts:205` `removeWorktree` (const) - missing @example
- `src/Worktree.ts:218` `pruneStaleWorktrees` (const) - missing @example
- `src/Worktree.ts:244` `collectCommitShas` (const) - missing @example
- `src/createSandbox.ts:30` `CreateSandboxOptions` (interface) - missing @example
- `src/createSandbox.ts:44` `CreateSandboxResult` (class) - missing @example
- `src/createSandbox.ts:60` `createSandbox` (const) - missing @example
- `src/createWorktree.ts:28` `CreateWorktreeOptions` (class) - missing @example
- `src/createWorktree.ts:46` `Worktree` (interface) - missing @example
- `src/createWorktree.ts:68` `CreateWorktreeResult` (class) - missing @example
- `src/createWorktree.ts:84` `createWorktree` (const) - missing @example
- `src/createWorktree.ts:125` `createWorktreeScoped` (const) - missing @example
- `src/index.ts:14` `export * from "./Agent.provider.ts";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./AgentStreamEmitter.ts";` (re-export) - missing @example
- `src/index.ts:29` `export * from "./createSandbox.ts";` (re-export) - missing @example
- `src/index.ts:36` `export * from "./createWorktree.ts";` (re-export) - missing @example
- `src/index.ts:43` `export * from "./Display.ts";` (re-export) - missing @example
- `src/index.ts:50` `export * from "./Env.ts";` (re-export) - missing @example
- `src/index.ts:57` `export * from "./Image.ts";` (re-export) - missing @example
- `src/index.ts:64` `export * from "./Init.ts";` (re-export) - missing @example
- `src/index.ts:71` `export * from "./interactive.ts";` (re-export) - missing @example
- `src/index.ts:78` `export * from "./Lifecycle.ts";` (re-export) - missing @example
- `src/index.ts:85` `export * from "./Orchestrator.ts";` (re-export) - missing @example
- `src/index.ts:92` `export * from "./Prompt.ts";` (re-export) - missing @example
- `src/index.ts:99` `export * from "./RecoveryMessage.ts";` (re-export) - missing @example
- `src/index.ts:106` `export * from "./Run.ts";` (re-export) - missing @example
- `src/index.ts:113` `export * from "./resolveCwd.ts";` (re-export) - missing @example
- `src/index.ts:120` `export * from "./Sandbox.error-handler.ts";` (re-export) - missing @example
- `src/index.ts:127` `export * from "./Sandbox.errors.ts";` (re-export) - missing @example
- `src/index.ts:134` `export * from "./Sandbox.observability.ts";` (re-export) - missing @example
- `src/index.ts:141` `export * from "./Sandbox.process.ts";` (re-export) - missing @example
- `src/index.ts:148` `export * from "./Sandbox.provider.ts";` (re-export) - missing @example
- `src/index.ts:155` `export * from "./Sandbox.providers.ts";` (re-export) - missing @example
- `src/index.ts:162` `export * from "./Session.ts";` (re-export) - missing @example
- `src/index.ts:169` `export * from "./SyncIn.ts";` (re-export) - missing @example
- `src/index.ts:176` `export * from "./SyncOut.ts";` (re-export) - missing @example
- `src/index.ts:183` `export * from "./Template.ts";` (re-export) - missing @example
- `src/index.ts:190` `export * from "./TextDeltaBuffer.ts";` (re-export) - missing @example
- `src/index.ts:197` `export * from "./terminalCleanup.ts";` (re-export) - missing @example
- `src/index.ts:204` `export * from "./Worktree.ts";` (re-export) - missing @example
- `src/interactive.ts:34` `InteractiveResult` (class) - missing @example
- `src/interactive.ts:54` `interactive` (const) - missing @example
- `src/terminalCleanup.ts:29` `TerminalCleanupStdin` (interface) - missing @example
- `src/terminalCleanup.ts:40` `TerminalCleanupStdout` (interface) - missing @example

### @beep/shared-tables

Path: `packages/shared/tables`

Export findings:
- `src/Schema.ts:22` `DbSchema` (const) - missing @example
- `src/Schema.ts:34` `DbSchema` (type) - missing @example
- `src/entities/Membership/index.ts:7` `export * from "./Membership.table.ts";` (re-export) - missing @example
- `src/entities/Organization/index.ts:7` `export * from "./Organization.table.js";` (re-export) - missing @example
- `src/entities/User/index.ts:7` `export * from "./User.table.ts";` (re-export) - missing @example
- `src/entities/index.ts:7` `export * as Membership from "./Membership/index.ts";` (re-export) - missing @example
- `src/entities/index.ts:15` `export * as Organization from "./Organization/index.ts";` (re-export) - missing @example
- `src/entities/index.ts:23` `export * as User from "./User/index.ts";` (re-export) - missing @example
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
- `src/services/jsonld-stream-parse.ts:230` `JsonLdStreamParseErrorReason` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/jsonld-stream-serialize.ts:107` `JsonLdStreamSerializeErrorReason` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/provenance.ts:64` `ProvenanceExportProfile` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/shacl-validation.ts:46` `ShaclSeverity` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/sparql-query.ts:42` `SparqlQueryProfile` (const) - 1 schema annotation/type-alias gap(s)

### @beep/op-ip-web

Path: `apps/op-ip-web`

Export findings:
- `src/app/layout.tsx:41` `default` (function) - missing @example
- `src/app/layout.tsx:29` `metadata` (const) - missing @example
- `src/app/manifest.ts:16` `default` (function) - missing @example
- `src/app/page.tsx:17` `default` (function) - missing @example
- `src/mdx-components.tsx:18` `useMDXComponents` (function) - missing @example

### @beep/acp

Path: `packages/drivers/acp`

Export findings:
- `src/errors.ts:392` `AcpError` (const) - 1 schema annotation/type-alias gap(s)

### @beep/nlp

Path: `packages/foundation/capability/nlp`

Export findings:
- `src/Core/PatternBuilders.ts:101` `pos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:102` `pos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:126` `entity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:127` `entity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:151` `literal` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:152` `literal` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:173` `optionalPos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:174` `optionalPos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:198` `optionalEntity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:199` `optionalEntity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:223` `optionalLiteral` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:224` `optionalLiteral` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternParsers.ts:107` `BracketStringToPOSPatternElement` (const) - 1 schema annotation/type-alias gap(s)
- `src/Core/PatternParsers.ts:138` `BracketStringToEntityPatternElement` (const) - 1 schema annotation/type-alias gap(s)
- `src/Core/PatternParsers.ts:171` `BracketStringToLiteralPatternElement` (const) - 1 schema annotation/type-alias gap(s)
- `src/Core/index.ts:11` `export * from "./Document.ts";` (re-export) - missing @example
- `src/Core/index.ts:16` `export * from "./Pattern.ts";` (re-export) - missing @example
- `src/Core/index.ts:21` `export * from "./PatternBuilders.ts";` (re-export) - missing @example
- `src/Core/index.ts:26` `export * from "./PatternOperations.ts";` (re-export) - missing @example
- `src/Core/index.ts:31` `export * from "./PatternParsers.ts";` (re-export) - missing @example
- `src/Core/index.ts:36` `export * from "./Sentence.ts";` (re-export) - missing @example
- `src/Core/index.ts:41` `export * from "./Token.ts";` (re-export) - missing @example
- `src/Core/index.ts:46` `export * from "./Tokenization.ts";` (re-export) - missing @example
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

### @beep/architecture-lab-proof

Path: `apps/architecture-lab-proof`

Export findings:
- `src/index.ts:38` `ArchitectureLabProofResult` (interface) - missing @example
- `src/index.ts:49` `ArchitectureLabProofLive` (const) - missing @example
- `src/index.ts:57` `runArchitectureLabProof` (const) - missing @example

### @beep/openai

Path: `packages/drivers/openai`

Export findings:
- `src/index.ts:12` `VERSION` (const) - missing summary; missing @example
