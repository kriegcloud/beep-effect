# JSDoc Documentation Compliance Inventory

Generated: 2026-05-20T10:47:47.870Z

## Scope

The package universe is the current `bun run topo-sort` output. This inventory checks repo JSDoc rules that package docgen does not fully validate yet: required export tags, summaries, TSDoc grammar, forbidden legacy tags, example import aliases, unsafe examples, root TSDoc custom tag registration, and schema annotation/type-alias gaps.

## Totals

| Metric | Count |
|---|---:|
| packages | 77 |
| cleanPackages | 22 |
| packagesWithoutPublicSrcSurface | 1 |
| packagesNeedingRemediation | 54 |
| publicModules | 1002 |
| publicExports | 6797 |
| openModules | 117 |
| openExports | 3106 |
| missingExportExamples | 2936 |
| missingExportCategories | 51 |
| missingExportSince | 49 |
| forbiddenTagFindings | 7 |
| malformedConditionalTagFindings | 0 |
| exampleImportFindings | 20 |
| unsafeExampleFindings | 62 |
| schemaAnnotationFindings | 136 |
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
| 1 | `@beep/types` | `packages/foundation/primitive/types` | clean | 5 | 10 | 0 | 0 |
| 2 | `@beep/identity` | `packages/foundation/modeling/identity` | needs-remediation | 3 | 107 | 0 | 19 |
| 3 | `@beep/utils` | `packages/foundation/modeling/utils` | clean | 20 | 147 | 0 | 0 |
| 4 | `@beep/data` | `packages/foundation/primitive/data` | clean | 7 | 39 | 0 | 0 |
| 5 | `@beep/messages` | `packages/foundation/modeling/messages` | needs-remediation | 2 | 6 | 0 | 1 |
| 6 | `@beep/schema` | `packages/foundation/modeling/schema` | needs-remediation | 132 | 1283 | 7 | 1044 |
| 7 | `@beep/shared-domain` | `packages/shared/domain` | needs-remediation | 36 | 192 | 0 | 13 |
| 8 | `@beep/test-utils` | `packages/tooling/test-kit/test-utils` | needs-remediation | 3 | 23 | 0 | 7 |
| 9 | `@beep/installer-domain` | `packages/installer/domain` | needs-remediation | 12 | 52 | 0 | 52 |
| 10 | `@beep/drizzle` | `packages/drivers/drizzle` | needs-remediation | 4 | 15 | 0 | 3 |
| 11 | `@beep/architecture-lab-domain` | `packages/architecture-lab/domain` | needs-remediation | 15 | 52 | 0 | 51 |
| 12 | `@beep/colors` | `packages/foundation/capability/colors` | clean | 1 | 9 | 0 | 0 |
| 13 | `@beep/chalk` | `packages/foundation/capability/chalk` | clean | 1 | 35 | 0 | 0 |
| 14 | `@beep/repo-utils` | `packages/tooling/library/repo-utils` | needs-remediation | 58 | 613 | 2 | 74 |
| 15 | `@beep/duckdb` | `packages/drivers/duckdb` | needs-remediation | 4 | 15 | 0 | 3 |
| 16 | `@beep/canvas-domain` | `packages/canvas/domain` | needs-remediation | 8 | 37 | 0 | 36 |
| 17 | `@beep/discord` | `packages/drivers/discord` | needs-remediation | 4 | 12 | 0 | 12 |
| 18 | `@beep/ai-provider-cli` | `packages/drivers/ai-provider-cli` | needs-remediation | 4 | 12 | 0 | 12 |
| 19 | `@beep/installer-use-cases` | `packages/installer/use-cases` | needs-remediation | 3 | 30 | 0 | 30 |
| 20 | `@beep/onepassword-cli` | `packages/drivers/onepassword-cli` | needs-remediation | 4 | 12 | 0 | 12 |
| 21 | `@beep/architecture-lab-config` | `packages/architecture-lab/config` | needs-remediation | 9 | 21 | 0 | 19 |
| 22 | `@beep/architecture-lab-tables` | `packages/architecture-lab/tables` | needs-remediation | 7 | 21 | 0 | 20 |
| 23 | `@beep/architecture-lab-use-cases` | `packages/architecture-lab/use-cases` | needs-remediation | 18 | 62 | 0 | 61 |
| 24 | `@beep/postgres` | `packages/drivers/postgres` | needs-remediation | 7 | 35 | 0 | 5 |
| 25 | `@beep/workspace-domain` | `packages/workspace/domain` | clean | 21 | 40 | 0 | 0 |
| 26 | `@beep/repo-codegraph` | `packages/tooling/library/repo-codegraph` | clean | 5 | 40 | 0 | 0 |
| 27 | `@beep/face-detection` | `packages/drivers/face-detection` | needs-remediation | 4 | 27 | 0 | 23 |
| 28 | `@beep/repo-docgen` | `packages/tooling/tool/docgen` | needs-remediation | 8 | 66 | 0 | 21 |
| 29 | `@beep/repo-ai-metrics` | `packages/tooling/library/ai-metrics` | needs-remediation | 17 | 226 | 0 | 2 |
| 30 | `@beep/runpod` | `packages/drivers/runpod` | needs-remediation | 6 | 174 | 0 | 174 |
| 31 | `@beep/ffmpeg` | `packages/drivers/ffmpeg` | needs-remediation | 4 | 38 | 0 | 6 |
| 32 | `@beep/observability` | `packages/foundation/capability/observability` | needs-remediation | 23 | 134 | 3 | 30 |
| 33 | `@beep/repo-configs` | `packages/tooling/policy-pack/repo-configs` | needs-remediation | 24 | 130 | 0 | 5 |
| 34 | `@beep/canvas-use-cases` | `packages/canvas/use-cases` | needs-remediation | 10 | 34 | 0 | 33 |
| 35 | `@beep/hubspot` | `packages/drivers/hubspot` | needs-remediation | 4 | 20 | 0 | 3 |
| 36 | `@beep/ui` | `packages/foundation/ui-system/ui` | needs-remediation | 117 | 493 | 105 | 489 |
| 37 | `@beep/sanity` | `packages/drivers/sanity` | needs-remediation | 4 | 16 | 0 | 3 |
| 38 | `@beep/openai-compat` | `packages/drivers/openai-compat` | clean | 4 | 50 | 0 | 0 |
| 39 | `@beep/installer-server` | `packages/installer/server` | needs-remediation | 3 | 19 | 0 | 19 |
| 40 | `@beep/law-practice-domain` | `packages/law-practice/domain` | clean | 14 | 25 | 0 | 0 |
| 41 | `@beep/agent-capability-use-cases` | `packages/agent-capability/use-cases` | needs-remediation | 13 | 47 | 0 | 11 |
| 42 | `@beep/agent-capability-domain` | `packages/agent-capability/domain` | clean | 7 | 12 | 0 | 0 |
| 43 | `@beep/epistemic-domain` | `packages/epistemic/domain` | clean | 13 | 21 | 0 | 0 |
| 44 | `@beep/wealth-management-domain` | `packages/wealth-management/domain` | clean | 14 | 25 | 0 | 0 |
| 45 | `@beep/architecture-lab-ui` | `packages/architecture-lab/ui` | needs-remediation | 3 | 7 | 0 | 6 |
| 46 | `@beep/architecture-lab-server` | `packages/architecture-lab/server` | needs-remediation | 13 | 34 | 0 | 33 |
| 47 | `@beep/root` | `.` | no-public-src-surface | 0 | 0 | 0 | 0 |
| 48 | `@beep/workspace-tables` | `packages/workspace/tables` | needs-remediation | 7 | 10 | 0 | 2 |
| 49 | `@beep/db-admin` | `packages/_internal/db-admin` | needs-remediation | 4 | 7 | 0 | 6 |
| 50 | `@beep/architecture-lab-client` | `packages/architecture-lab/client` | needs-remediation | 3 | 7 | 0 | 6 |
| 51 | `@beep/repo-cli` | `packages/tooling/tool/cli` | needs-remediation | 83 | 631 | 0 | 400 |
| 52 | `@beep/shared-server` | `packages/shared/server` | clean | 1 | 1 | 0 | 0 |
| 53 | `@beep/canvas-server` | `packages/canvas/server` | needs-remediation | 9 | 23 | 0 | 22 |
| 54 | `@beep/shared-config` | `packages/shared/config` | clean | 1 | 1 | 0 | 0 |
| 55 | `@beep/sandbox` | `packages/foundation/capability/sandbox` | needs-remediation | 29 | 290 | 0 | 248 |
| 56 | `@beep/shared-use-cases` | `packages/shared/use-cases` | clean | 1 | 1 | 0 | 0 |
| 57 | `@beep/oip-web` | `apps/oip-web` | needs-remediation | 24 | 57 | 0 | 6 |
| 58 | `@beep/shared-tables` | `packages/shared/tables` | needs-remediation | 11 | 14 | 0 | 11 |
| 59 | `@beep/md` | `packages/foundation/capability/md` | clean | 5 | 131 | 0 | 0 |
| 60 | `@beep/canvas` | `apps/canvas` | needs-remediation | 1 | 1 | 0 | 1 |
| 61 | `@beep/semantic-web` | `packages/foundation/capability/semantic-web` | needs-remediation | 29 | 256 | 0 | 9 |
| 62 | `@beep/venice-ai` | `packages/drivers/venice-ai` | clean | 3 | 35 | 0 | 0 |
| 63 | `@beep/stack-installer` | `apps/stack-installer` | needs-remediation | 6 | 19 | 0 | 19 |
| 64 | `@beep/professional-desktop` | `apps/professional-desktop` | needs-remediation | 2 | 2 | 0 | 1 |
| 65 | `@beep/professional-runtime-proof` | `apps/professional-runtime-proof` | clean | 1 | 4 | 0 | 0 |
| 66 | `@beep/acp` | `packages/drivers/acp` | needs-remediation | 10 | 406 | 0 | 1 |
| 67 | `@beep/nlp` | `packages/foundation/capability/nlp` | needs-remediation | 49 | 278 | 0 | 31 |
| 68 | `@beep/infra` | `infra` | clean | 3 | 22 | 0 | 0 |
| 69 | `@beep/codedank-web` | `apps/codedank-web` | needs-remediation | 5 | 6 | 0 | 5 |
| 70 | `@beep/xai` | `packages/drivers/xai` | clean | 7 | 62 | 0 | 0 |
| 71 | `@beep/architecture-lab-proof` | `apps/architecture-lab-proof` | needs-remediation | 1 | 3 | 0 | 2 |
| 72 | `@beep/konva` | `packages/drivers/konva` | needs-remediation | 1 | 1 | 0 | 1 |
| 73 | `@beep/shared-client` | `packages/shared/client` | clean | 1 | 1 | 0 | 0 |
| 74 | `@beep/canvas-client` | `packages/canvas/client` | needs-remediation | 1 | 1 | 0 | 1 |
| 75 | `@beep/openai` | `packages/drivers/openai` | needs-remediation | 1 | 1 | 0 | 1 |
| 76 | `@beep/canvas-ui` | `packages/canvas/ui` | needs-remediation | 1 | 1 | 0 | 1 |
| 77 | `@beep/shared-ui` | `packages/shared/ui` | clean | 4 | 7 | 0 | 0 |

## Open Findings

### @beep/identity

Path: `packages/foundation/modeling/identity`

Export findings:
- `src/Id.ts:119` `IdentityInterpolationError` (class) - 1 schema annotation/type-alias gap(s)
- `src/Id.ts:150` `IdentitySegmentCountError` (class) - 1 schema annotation/type-alias gap(s)
- `src/Id.ts:381` `IdentityString` (type) - 1 unsafe example violation(s)
- `src/Id.ts:398` `IdentitySymbol` (type) - 1 unsafe example violation(s)
- `src/packages.ts:676` `RepoPkgs` (const) - missing @example
- `src/packages.ts:682` `$MdId` (const) - missing summary; missing @example
- `src/packages.ts:688` `$CodedankWebId` (const) - missing summary; missing @example
- `src/packages.ts:694` `$OipWebId` (const) - missing summary; missing @example
- `src/packages.ts:700` `$DrizzleId` (const) - missing summary; missing @example
- `src/packages.ts:706` `$DuckdbId` (const) - missing summary; missing @example
- `src/packages.ts:712` `$FaceDetectionId` (const) - missing summary; missing @example
- `src/packages.ts:718` `$FfmpegId` (const) - missing summary; missing @example
- `src/packages.ts:724` `$PostgresId` (const) - missing summary; missing @example
- `src/packages.ts:887` `$OpenaiId` (const) - missing summary; missing @example
- `src/packages.ts:893` `$VeniceAiId` (const) - missing summary; missing @example
- `src/packages.ts:899` `$XaiId` (const) - missing summary; missing @example
- `src/packages.ts:1109` `$InstallerDomainId` (const) - missing @example
- `src/packages.ts:1117` `$InstallerUseCasesId` (const) - missing @example
- `src/packages.ts:1126` `$InstallerServerId` (const) - missing @example

### @beep/messages

Path: `packages/foundation/modeling/messages`

Export findings:
- `src/i18n.ts:197` `logIssues` (const) - missing @example

### @beep/schema

Path: `packages/foundation/modeling/schema`

Module findings:
- `src/http/headers/_internal/index.ts:1` (jsdoc) - missing summary
- `src/location/CardinalDirection.ts:1` (packageDocumentation) - missing summary
- `src/person/Age.ts:1` (packageDocumentation) - missing summary
- `src/person/Sex.ts:1` (packageDocumentation) - missing summary
- `src/Sql/Constants.ts:1` (jsdoc) - missing summary
- `src/Sql/index.ts:1` (jsdoc) - missing summary
- `src/VariantSchema.ts:1` (jsdoc) - missing summary

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
- `src/blockchain/CryptoTxnHash.ts:60` `CryptoTxnHash` (const) - missing @example
- `src/blockchain/CryptoTxnHash.ts:75` `CryptoTxnHash` (type) - missing @example
- `src/blockchain/CryptoTxnHash.ts:83` `CryptoTxnHashRedacted` (const) - missing @example
- `src/blockchain/CryptoTxnHash.ts:101` `CryptoTxnHashRedacted` (type) - missing @example
- `src/blockchain/CryptoWalletAddress.ts:181` `CryptoWalletAddress` (const) - missing @example
- `src/blockchain/CryptoWalletAddress.ts:196` `CryptoWalletAddress` (type) - missing @example
- `src/blockchain/CryptoWalletAddress.ts:204` `CryptoWalletAddressRedacted` (const) - missing @example
- `src/blockchain/CryptoWalletAddress.ts:223` `CryptoWalletAddressRedacted` (type) - missing @example
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
- `src/BufferEncoding.ts:27` `BuffEncoding` (const) - 1 schema annotation/type-alias gap(s)
- `src/color/Color.ts:385` `HexColorInput` (const) - missing @example
- `src/color/Color.ts:399` `HexColorInput` (type) - missing @example
- `src/color/Color.ts:407` `HexColor` (const) - missing @example
- `src/color/Color.ts:422` `HexColor` (type) - missing @example
- `src/color/Color.ts:430` `NormalizeHexColor` (const) - missing @example
- `src/color/Color.ts:451` `NormalizeHexColor` (type) - missing @example
- `src/color/Color.ts:459` `RgbInputChannel` (const) - missing @example
- `src/color/Color.ts:474` `RgbInputChannel` (type) - missing @example
- `src/color/Color.ts:482` `RgbChannel` (const) - missing @example
- `src/color/Color.ts:498` `RgbChannel` (type) - missing @example
- `src/color/Color.ts:506` `RgbInput` (class) - missing @example
- `src/color/Color.ts:523` `Rgb` (class) - missing @example
- `src/color/Color.ts:540` `OklchCoordinate` (const) - missing @example
- `src/color/Color.ts:555` `OklchCoordinate` (type) - missing @example
- `src/color/Color.ts:563` `OklchLightness` (const) - missing @example
- `src/color/Color.ts:579` `OklchLightness` (type) - missing @example
- `src/color/Color.ts:587` `OklchChroma` (const) - missing @example
- `src/color/Color.ts:603` `OklchChroma` (type) - missing @example
- `src/color/Color.ts:611` `OklchHue` (const) - missing @example
- `src/color/Color.ts:627` `OklchHue` (type) - missing @example
- `src/color/Color.ts:635` `OklchInput` (class) - missing @example
- `src/color/Color.ts:652` `OklchColor` (class) - missing @example
- `src/color/Color.ts:669` `HexColorScale12` (const) - missing @example
- `src/color/Color.ts:686` `HexColorScale12` (type) - missing @example
- `src/color/Color.ts:694` `RgbaColorString` (const) - missing @example
- `src/color/Color.ts:709` `RgbaColorString` (type) - missing @example
- `src/color/Color.ts:717` `HexToRgb` (const) - missing @example
- `src/color/Color.ts:738` `HexToRgb` (type) - missing @example
- `src/color/Color.ts:746` `RgbToHex` (const) - missing @example
- `src/color/Color.ts:764` `RgbToHex` (type) - missing @example
- `src/color/Color.ts:772` `RgbToOklch` (const) - missing @example
- `src/color/Color.ts:790` `RgbToOklch` (type) - missing @example
- `src/color/Color.ts:798` `OklchToRgb` (const) - missing @example
- `src/color/Color.ts:816` `OklchToRgb` (type) - missing @example
- `src/color/Color.ts:824` `HexToOklch` (const) - missing @example
- `src/color/Color.ts:845` `HexToOklch` (type) - missing @example
- `src/color/Color.ts:853` `OklchToHex` (const) - missing @example
- `src/color/Color.ts:871` `OklchToHex` (type) - missing @example
- `src/color/Color.ts:879` `ColorAmount` (const) - missing @example
- `src/color/Color.ts:894` `ColorAmount` (type) - missing @example
- `src/color/Color.ts:912` `GenerateScaleInput` (class) - missing @example
- `src/color/Color.ts:928` `GenerateScale` (const) - missing @example
- `src/color/Color.ts:948` `GenerateScale` (type) - missing @example
- `src/color/Color.ts:956` `GenerateNeutralScaleInput` (class) - missing @example
- `src/color/Color.ts:972` `GenerateNeutralScale` (const) - missing @example
- `src/color/Color.ts:992` `GenerateNeutralScale` (type) - missing @example
- `src/color/Color.ts:1000` `GenerateAlphaScaleInput` (class) - missing @example
- `src/color/Color.ts:1016` `GenerateAlphaScale` (const) - missing @example
- `src/color/Color.ts:1036` `GenerateAlphaScale` (type) - missing @example
- `src/color/Color.ts:1044` `MixColorsInput` (class) - missing @example
- `src/color/Color.ts:1061` `MixColors` (const) - missing @example
- `src/color/Color.ts:1079` `MixColors` (type) - missing @example
- `src/color/Color.ts:1087` `LightenInput` (class) - missing @example
- `src/color/Color.ts:1103` `Lighten` (const) - missing @example
- `src/color/Color.ts:1121` `Lighten` (type) - missing @example
- `src/color/Color.ts:1129` `DarkenInput` (class) - missing @example
- `src/color/Color.ts:1145` `Darken` (const) - missing @example
- `src/color/Color.ts:1163` `Darken` (type) - missing @example
- `src/color/Color.ts:1171` `WithAlphaInput` (class) - missing @example
- `src/color/Color.ts:1187` `WithAlpha` (const) - missing @example
- `src/color/Color.ts:1205` `WithAlpha` (type) - missing @example
- `src/color/index.ts:7` `export * from "./Color.ts";` (re-export) - missing @example
- `src/CommonTextSchemas.ts:64` `TrimmedNonEmptyText` (type) - 1 unsafe example violation(s)
- `src/CommonTextSchemas.ts:109` `CommaSeparatedList` (type) - 1 unsafe example violation(s)
- `src/csv.ts:13` `export * from "./csv/index.ts";` (re-export) - missing @example
- `src/csv/CsvCodecOptions.ts:38` `CsvCodecOptions` (class) - missing @example
- `src/csv/CsvCodecOptions.ts:105` `CsvCodecOptionsArgs` (type) - missing @example
- `src/csv/CsvCodecOptions.ts:113` `CsvCodecOptionsParseOptions` (const) - missing @example
- `src/csv/CsvError.ts:34` `CsvError` (class) - missing @example
- `src/csv/CsvError.ts:42` `csvError` (const) - missing @example
- `src/csv/format/CsvFormatter.ts:100` `formatCsvHeaderRow` (const) - missing @example
- `src/csv/format/CsvFormatter.ts:125` `formatCsvDataRow` (const) - missing @example
- `src/csv/format/CsvFormatter.ts:152` `formatCsvDocument` (const) - missing @example
- `src/csv/format/index.ts:14` `export * from "./CsvFormatter.ts";` (re-export) - missing @example
- `src/csv/index.ts:308` `export * from "./CsvCodecOptions.ts";` (re-export) - missing @example
- `src/csv/index.ts:313` `export * from "./CsvError.ts";` (re-export) - missing @example
- `src/csv/index.ts:318` `export * from "./format/index.ts";` (re-export) - missing @example
- `src/csv/index.ts:323` `export * from "./parse/index.ts";` (re-export) - missing @example
- `src/csv/index.ts:302` `CsvText` (type) - missing @example
- `src/csv/parse/CsvParser.ts:98` `ParsedField` (class) - missing summary; missing @example
- `src/csv/parse/CsvParser.ts:243` `ParsedRow` (class) - missing summary; missing @example
- `src/csv/parse/CsvParser.ts:379` `parseCsvRows` (const) - missing @example
- `src/csv/parse/index.ts:12` `export * from "./CsvParser.ts";` (re-export) - missing @example
- `src/csv/parse/index.ts:17` `export * from "./ParserOptions.ts";` (re-export) - missing @example
- `src/csv/parse/index.ts:22` `export * from "./types.ts";` (re-export) - missing @example
- `src/csv/parse/ParserOptions.ts:60` `HeaderValueInput` (const) - missing @example
- `src/csv/parse/ParserOptions.ts:72` `HeaderValueInput` (type) - missing @example
- `src/csv/parse/ParserOptions.ts:80` `ParserOptionsError` (class) - missing @example
- `src/csv/parse/ParserOptions.ts:107` `ParserOptions` (class) - missing @example
- `src/csv/parse/ParserOptions.ts:226` `ParserOptionsArgs` (type) - missing @example
- `src/csv/parse/types.ts:20` `HeaderArray` (const) - missing @example
- `src/csv/parse/types.ts:35` `HeaderArray` (type) - missing @example
- `src/csv/parse/types.ts:44` `HeaderTransformFunction` (const) - missing @example
- `src/csv/parse/types.ts:59` `HeaderTransformFunction` (type) - missing @example
- `src/Cuid.ts:19` `sha512` (const) - missing @example
- `src/Cuid.ts:34` `Cuid` (const) - missing @example
- `src/Cuid.ts:45` `Cuid` (type) - missing @example
- `src/Cuid.ts:53` `isCuid` (const) - missing @example
- `src/Cuid.ts:62` `CuidSeed` (type) - missing @example
- `src/Cuid.ts:75` `CuidState` (class) - missing @example
- `src/Cuid.ts:117` `cuid` (const) - missing @example
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
- `src/dom/elements.ts:190` `isDragEvent` (const) - missing @example
- `src/dom/elements.ts:198` `DOMDragEvent` (const) - missing @example
- `src/dom/elements.ts:210` `DOMDragEvent` (type) - missing @example
- `src/dom/events.ts:20` `isEvent` (const) - missing @example
- `src/dom/events.ts:30` `isMouseEvent` (const) - missing @example
- `src/dom/events.ts:38` `DOMEvent` (const) - missing @example
- `src/dom/events.ts:50` `DOMEvent` (type) - missing @example
- `src/dom/events.ts:58` `DOMMouseEvent` (const) - missing @example
- `src/dom/events.ts:70` `DOMMouseEvent` (type) - missing @example
- `src/dom/index.ts:14` `export * from "./elements.ts";` (re-export) - missing @example
- `src/dom/index.ts:21` `export * from "./events.ts";` (re-export) - missing @example
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
- `src/FilePath.ts:78` `HasNullByte` (type) - missing @example
- `src/FilePath.ts:87` `SupportedWindowsNamespace` (const) - missing @example
- `src/FilePath.ts:109` `SupportedWindowsNamespace` (type) - missing @example
- `src/FilePath.ts:117` `UsesPosixSeparator` (const) - missing @example
- `src/FilePath.ts:139` `UsesPosixSeparator` (type) - missing @example
- `src/FilePath.ts:147` `UsesWindowsSeparator` (const) - missing @example
- `src/FilePath.ts:169` `UsesWindowsSeparator` (type) - missing @example
- `src/FilePath.ts:177` `EndsWithSeparator` (const) - missing @example
- `src/FilePath.ts:199` `EndsWithSeparator` (type) - missing @example
- `src/FilePath.ts:209` `WindowsDotSegment` (const) - missing @example
- `src/FilePath.ts:221` `WindowsDotSegment` (type) - missing @example
- `src/FilePath.ts:230` `ValidWindowsPlainPathSegment` (const) - missing @example
- `src/FilePath.ts:273` `ValidWindowsPlainPathSegment` (type) - missing @example
- `src/FilePath.ts:283` `ValidWindowsRootSegment` (const) - missing @example
- `src/FilePath.ts:305` `ValidWindowsRootSegment` (type) - missing @example
- `src/FilePath.ts:314` `ValidWindowsPathSegment` (const) - missing @example
- `src/FilePath.ts:329` `ValidWindowsPathSegment` (type) - missing @example
- `src/FilePath.ts:337` `WindowsSegments` (const) - missing @example
- `src/FilePath.ts:352` `WindowsSegments` (type) - missing @example
- `src/FilePath.ts:361` `ValidWindowsUncRest` (const) - missing @example
- `src/FilePath.ts:376` `ValidWindowsUncRest` (type) - missing @example
- `src/FilePath.ts:384` `ValidWindowsUncSegments` (const) - missing @example
- `src/FilePath.ts:402` `ValidWindowsUncSegments` (type) - missing @example
- `src/FilePath.ts:410` `WindowsDriveRoot` (const) - missing @example
- `src/FilePath.ts:432` `WindowsDriveRoot` (type) - missing @example
- `src/FilePath.ts:440` `WindowsUncRoot` (const) - missing @example
- `src/FilePath.ts:462` `WindowsUncRoot` (type) - missing @example
- `src/FilePath.ts:474` `HasLeafSegment` (const) - missing @example
- `src/FilePath.ts:523` `HasLeafSegment` (type) - missing @example
- `src/FilePath.ts:538` `WindowsDrivePath` (const) - missing @example
- `src/FilePath.ts:587` `WindowsDrivePath` (type) - missing @example
- `src/FilePath.ts:596` `WindowsUncPath` (const) - missing @example
- `src/FilePath.ts:651` `WindowsUncPath` (type) - missing @example
- `src/FilePath.ts:662` `WindowsRelativePath` (const) - missing @example
- `src/FilePath.ts:729` `WindowsRelativePath` (type) - missing @example
- `src/FilePath.ts:745` `SupportedPathFamily` (const) - missing @example
- `src/FilePath.ts:757` `SupportedPathFamily` (type) - missing @example
- `src/FilePath.ts:864` `FilePath` (type) - missing @example
- `src/Float16Array.ts:52` `isFloat16Array` (const) - missing @example
- `src/Float16Array.ts:86` `Float16Arr` (type) - missing @example
- `src/Float16Array.ts:137` `Float16ArrayFromArray` (type) - missing @example
- `src/Float16Array.ts:145` `Float16ArrayFromArray` (namespace) - missing @example
- `src/Float16Array.ts:179` `Float16ArrayField` (const) - missing @example
- `src/Float32Array.ts:54` `Float32Arr` (type) - missing @example
- `src/Float32Array.ts:102` `Float32ArrayFromArray` (type) - missing @example
- `src/Float32Array.ts:110` `Float32ArrayFromArray` (namespace) - missing @example
- `src/Float32Array.ts:144` `Float32ArrayField` (const) - missing @example
- `src/Float64Array.ts:54` `Float64Arr` (type) - missing @example
- `src/Float64Array.ts:102` `Float64ArrayFromArray` (type) - missing @example
- `src/Float64Array.ts:110` `Float64ArrayFromArray` (namespace) - missing @example
- `src/Float64Array.ts:144` `Float64ArrayField` (const) - missing @example
- `src/Fn.ts:450` `ThunkOf` (function) - missing summary; missing @example, @category, @since
- `src/Fn.ts:454` `ThunkOf` (function) - missing summary; missing @example, @category, @since
- `src/Fn.ts:563` `Fn` (function) - missing summary; missing @example, @category, @since
- `src/Fn.ts:129` `FnType` (type) - 1 unsafe example violation(s)
- `src/Fn.ts:173` `FnSchemaNoArg` (interface) - missing @example
- `src/Fn.ts:192` `FnSchemaUnary` (interface) - missing @example
- `src/Fn.ts:212` `FnSchema` (type) - missing @example
- `src/Fn.ts:228` `FnSchemaStatics` (type) - missing @example
- `src/Fn.ts:425` `AnyFn` (type) - missing @example
- `src/Glob.ts:120` `Glob` (type) - missing @example
- `src/Graph.ts:282` `NodeIndex` (type) - missing @example
- `src/Graph.ts:314` `EdgeIndex` (const) - missing @example
- `src/Graph.ts:327` `EdgeIndex` (type) - missing @example
- `src/Graph.ts:335` `EdgeIndexFromString` (const) - missing @example
- `src/Graph.ts:348` `GraphKind` (const) - missing @example
- `src/Graph.ts:360` `GraphKind` (type) - missing @example
- `src/Graph.ts:368` `EdgeEncoded` (type) - missing @example
- `src/Graph.ts:476` `EdgeEncoded` (const) - missing @example
- `src/Graph.ts:380` `GraphEncoded` (type) - missing @example
- `src/Graph.ts:678` `GraphEncoded` (const) - missing @example
- `src/Graph.ts:416` `EdgeEncodedSchema` (interface) - missing @example
- `src/Graph.ts:433` `GraphEncodedSchema` (interface) - missing @example
- `src/Graph.ts:453` `isEdge` (const) - missing @example
- `src/Graph.ts:463` `isGraph` (const) - missing @example
- `src/Graph.ts:496` `EdgeFromSelf` (interface) - missing @example
- `src/Graph.ts:536` `EdgeFromSelf` (const) - missing @example
- `src/Graph.ts:513` `EdgeTransform` (interface) - missing @example
- `src/Graph.ts:599` `EdgeTransform` (const) - missing @example
- `src/Graph.ts:525` `Edge` (interface) - missing @example
- `src/Graph.ts:708` `GraphFromSelf` (interface) - missing @example
- `src/Graph.ts:926` `GraphFromSelf` (const) - missing @example
- `src/Graph.ts:726` `DirectedGraphFromSelf` (interface) - missing @example
- `src/Graph.ts:944` `DirectedGraphFromSelf` (const) - missing @example
- `src/Graph.ts:744` `UndirectedGraphFromSelf` (interface) - missing @example
- `src/Graph.ts:965` `UndirectedGraphFromSelf` (const) - missing @example
- `src/Graph.ts:762` `MutableGraphFromSelf` (interface) - missing @example
- `src/Graph.ts:986` `MutableGraphFromSelf` (const) - missing @example
- `src/Graph.ts:780` `MutableDirectedGraphFromSelf` (interface) - missing @example
- `src/Graph.ts:1004` `MutableDirectedGraphFromSelf` (const) - missing @example
- `src/Graph.ts:798` `MutableUndirectedGraphFromSelf` (interface) - missing @example
- `src/Graph.ts:1025` `MutableUndirectedGraphFromSelf` (const) - missing @example
- `src/Graph.ts:1044` `DirectedGraph` (interface) - missing @example
- `src/Graph.ts:1057` `UndirectedGraph` (interface) - missing @example
- `src/Graph.ts:1201` `UndirectedGraph` (const) - missing @example
- `src/Graph.ts:1070` `MutableDirectedGraph` (interface) - missing @example
- `src/Graph.ts:1225` `MutableDirectedGraph` (const) - missing @example
- `src/Graph.ts:1083` `MutableUndirectedGraph` (interface) - missing @example
- `src/Graph.ts:1249` `MutableUndirectedGraph` (const) - missing @example
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
- `src/http/headers/Csp.ts:25` `DirectiveSource` (const) - missing summary; missing @example
- `src/http/headers/Csp.ts:35` `DirectiveSource` (type) - missing summary; missing @example
- `src/http/headers/Csp.ts:47` `ContentSecurityPolicyHeaderName` (const) - missing summary; missing @example
- `src/http/headers/Csp.ts:58` `ContentSecurityPolicyHeaderName` (type) - missing summary; missing @example
- `src/http/headers/Csp.ts:116` `createDirectiveValue` (const) - missing @example
- `src/http/headers/Csp.ts:144` `PluginTypes` (const) - missing summary; missing @example
- `src/http/headers/Csp.ts:154` `PluginTypes` (type) - missing summary; missing @example
- `src/http/headers/Csp.ts:177` `Sandbox` (const) - missing summary; missing @example
- `src/http/headers/Csp.ts:188` `Sandbox` (type) - missing summary; missing @example
- `src/http/headers/Csp.ts:231` `FetchDirective` (class) - missing summary; missing @example
- `src/http/headers/Csp.ts:300` `DocumentDirective` (class) - missing summary; missing @example
- `src/http/headers/Csp.ts:344` `NavigationDirective` (class) - missing summary; missing @example
- `src/http/headers/Csp.ts:388` `ReportURI` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/http/headers/Csp.ts:398` `ReportingDirective` (class) - missing summary; missing @example
- `src/http/headers/Csp.ts:434` `CspDirectives` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/http/headers/Csp.ts:449` `ContentSecurityPolicyOptionStruct` (class) - missing summary; missing @example
- `src/http/headers/Csp.ts:481` `ContentSecurityPolicyOption` (const) - missing summary; missing @example
- `src/http/headers/Csp.ts:491` `ContentSecurityPolicyOption` (type) - missing summary; missing @example
- `src/http/headers/Csp.ts:497` `ContentSecurityPolicyResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/Csp.ts:555` `createContentSecurityPolicyOptionHeaderValue` (const) - missing summary; missing @example
- `src/http/headers/Csp.ts:581` `ContentSecurityPolicyHeader` (const) - missing summary; missing @example
- `src/http/headers/Csp.ts:649` `ContentSecurityPolicyHeader` (type) - missing summary; missing @example
- `src/http/headers/ExpectCT.ts:27` `ExpectCTConfig` (class) - missing summary; missing @example
- `src/http/headers/ExpectCT.ts:42` `ExpectCTEnabled` (const) - missing summary; missing @example
- `src/http/headers/ExpectCT.ts:52` `ExpectCTEnabled` (type) - missing summary; missing @example
- `src/http/headers/ExpectCT.ts:58` `ExpectCTOption` (const) - missing summary; missing @example
- `src/http/headers/ExpectCT.ts:68` `ExpectCTOption` (type) - missing summary; missing @example
- `src/http/headers/ExpectCT.ts:74` `ExpectCTResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/ExpectCT.ts:150` `ExpectCTHeader` (const) - missing summary; missing @example
- `src/http/headers/ExpectCT.ts:208` `ExpectCTHeader` (type) - missing summary; missing @example
- `src/http/headers/ForceHttpsRedirect.ts:27` `ForceHttpsRedirectConfig` (class) - missing summary; missing @example
- `src/http/headers/ForceHttpsRedirect.ts:42` `ForceHttpsRedirectEnabled` (const) - missing summary; missing @example
- `src/http/headers/ForceHttpsRedirect.ts:52` `ForceHttpsRedirectEnabled` (type) - missing summary; missing @example
- `src/http/headers/ForceHttpsRedirect.ts:58` `ForceHttpsRedirectOption` (const) - missing summary; missing @example
- `src/http/headers/ForceHttpsRedirect.ts:68` `ForceHttpsRedirectOption` (type) - missing summary; missing @example
- `src/http/headers/ForceHttpsRedirect.ts:74` `ForceHttpsRedirectResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/ForceHttpsRedirect.ts:103` `ForceHttpsRedirectHeader` (const) - missing summary; missing @example
- `src/http/headers/ForceHttpsRedirect.ts:173` `ForceHttpsRedirectHeader` (type) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:30` `FrameGuardMode` (const) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:41` `FrameGuardMode` (type) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:47` `FrameGuardAllowFromConfig` (class) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:60` `FrameGuardAllowFrom` (const) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:70` `FrameGuardAllowFrom` (type) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:76` `FrameGuardOption` (const) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:86` `FrameGuardOption` (type) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:92` `FrameGuardResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:137` `FrameGuardHeader` (const) - missing summary; missing @example
- `src/http/headers/FrameGuard.ts:211` `FrameGuardHeader` (type) - missing summary; missing @example
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
- `src/http/headers/PermissionsPolicy.ts:57` `PermissionsPolicyDirective` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:68` `PermissionsPolicyDirective` (type) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:74` `PermissionsPolicyDirectiveKey` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:91` `PermissionsPolicyDirectiveKey` (type) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:97` `QuotedOrigin` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:113` `QuotedOrigin` (type) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:121` `PermissionsPolicyDirectiveValueSingle` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:132` `PermissionsPolicyDirectiveValueSingle` (type) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:138` `PermissionsPolicyAllowlistedOrigin` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:148` `PermissionsPolicyAllowlistedOrigin` (type) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:154` `PermissionsPolicyDirectiveValue` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:168` `PermissionsPolicyDirectiveValue` (type) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:174` `PermissionsPolicyDirectives` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:187` `PermissionsPolicyDirectives` (type) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:193` `PermissionsPolicyOptionStruct` (class) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:208` `PermissionsPolicyOption` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:218` `PermissionsPolicyOption` (type) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:224` `PermissionsPolicyResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:272` `PermissionsPolicyHeader` (const) - missing summary; missing @example
- `src/http/headers/PermissionsPolicy.ts:334` `PermissionsPolicyHeader` (type) - missing summary; missing @example
- `src/http/headers/PermittedCrossDomainPolicies.ts:34` `PermittedCrossDomainPoliciesValue` (const) - missing summary; missing @example
- `src/http/headers/PermittedCrossDomainPolicies.ts:45` `PermittedCrossDomainPoliciesValue` (type) - missing summary; missing @example
- `src/http/headers/PermittedCrossDomainPolicies.ts:53` `PermittedCrossDomainPoliciesOption` (const) - missing summary; missing @example
- `src/http/headers/PermittedCrossDomainPolicies.ts:64` `PermittedCrossDomainPoliciesOption` (type) - missing summary; missing @example
- `src/http/headers/PermittedCrossDomainPolicies.ts:70` `PermittedCrossDomainPoliciesResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/PermittedCrossDomainPolicies.ts:88` `PermittedCrossDomainPoliciesHeader` (const) - missing summary; missing @example
- `src/http/headers/PermittedCrossDomainPolicies.ts:150` `PermittedCrossDomainPoliciesHeader` (type) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:37` `ReferrerPolicyValue` (const) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:48` `ReferrerPolicyValue` (type) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:54` `ReferrerPolicyValueList` (const) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:64` `ReferrerPolicyValueList` (type) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:70` `ReferrerPolicyOption` (const) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:80` `ReferrerPolicyOption` (type) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:86` `ReferrerPolicyResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:126` `ReferrerPolicyHeader` (const) - missing summary; missing @example
- `src/http/headers/ReferrerPolicy.ts:192` `ReferrerPolicyHeader` (type) - missing summary; missing @example
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
- `src/http/headers/XSSProtection.ts:29` `XSSProtectionMode` (const) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:40` `XSSProtectionMode` (type) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:46` `XSSProtectionReportConfig` (class) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:59` `XSSProtectionReport` (const) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:69` `XSSProtectionReport` (type) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:75` `XSSProtectionOption` (const) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:85` `XSSProtectionOption` (type) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:91` `XSSProtectionResponseHeader` (class) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:144` `XSSProtectionHeader` (const) - missing summary; missing @example
- `src/http/headers/XSSProtection.ts:195` `XSSProtectionHeader` (type) - missing summary; missing @example
- `src/http/HttpMethod/HttpMethod.ts:19` `HttpMethod_` (const) - missing summary; missing @example; 2 schema annotation/type-alias gap(s)
- `src/http/HttpMethod/HttpMethod.ts:49` `HttpMethod` (const) - missing summary; missing @example
- `src/http/HttpMethod/HttpMethod.ts:79` `HttpMethod` (type) - missing summary; missing @example
- `src/http/HttpMethod/index.ts:12` `export * from "./HttpMethod.ts";` (re-export) - missing @example
- `src/http/HttpProtocol.ts:18` `HttpProtocol` (const) - missing @example
- `src/http/HttpProtocol.ts:30` `HttpProtocol` (type) - missing @example
- `src/http/HttpStatus.ts:38` `HttpStatusCategory` (const) - missing @example
- `src/http/HttpStatus.ts:66` `HttpStatusCategory` (type) - missing @example
- `src/http/HttpStatus.ts:79` `Continue` (const) - missing @example
- `src/http/HttpStatus.ts:93` `Continue` (type) - missing @example
- `src/http/HttpStatus.ts:102` `SwitchingProtocols` (const) - missing @example
- `src/http/HttpStatus.ts:116` `SwitchingProtocols` (type) - missing @example
- `src/http/HttpStatus.ts:126` `Processing` (const) - missing @example
- `src/http/HttpStatus.ts:140` `Processing` (type) - missing @example
- `src/http/HttpStatus.ts:149` `EarlyHints` (const) - missing @example
- `src/http/HttpStatus.ts:163` `EarlyHints` (type) - missing @example
- `src/http/HttpStatus.ts:173` `HttpStatus1XX` (const) - missing @example
- `src/http/HttpStatus.ts:191` `HttpStatus1XX` (namespace) - missing @example
- `src/http/HttpStatus.ts:207` `HttpStatus1XX` (type) - missing @example
- `src/http/HttpStatus.ts:219` `Ok` (const) - missing @example
- `src/http/HttpStatus.ts:233` `Ok` (type) - missing @example
- `src/http/HttpStatus.ts:241` `Created` (const) - missing @example
- `src/http/HttpStatus.ts:254` `Created` (type) - missing @example
- `src/http/HttpStatus.ts:264` `Accepted` (const) - missing @example
- `src/http/HttpStatus.ts:278` `Accepted` (type) - missing @example
- `src/http/HttpStatus.ts:289` `NonAuthoritativeInformation` (const) - missing @example
- `src/http/HttpStatus.ts:303` `NonAuthoritativeInformation` (type) - missing @example
- `src/http/HttpStatus.ts:312` `NoContent` (const) - missing @example
- `src/http/HttpStatus.ts:325` `NoContent` (type) - missing @example
- `src/http/HttpStatus.ts:334` `ResetContent` (const) - missing @example
- `src/http/HttpStatus.ts:348` `ResetContent` (type) - missing @example
- `src/http/HttpStatus.ts:359` `PartialContent` (const) - missing @example
- `src/http/HttpStatus.ts:373` `PartialContent` (type) - missing @example
- `src/http/HttpStatus.ts:383` `MultiStatus` (const) - missing @example
- `src/http/HttpStatus.ts:397` `MultiStatus` (type) - missing @example
- `src/http/HttpStatus.ts:407` `AlreadyReported` (const) - missing @example
- `src/http/HttpStatus.ts:421` `AlreadyReported` (type) - missing @example
- `src/http/HttpStatus.ts:431` `ImUsed` (const) - missing @example
- `src/http/HttpStatus.ts:445` `ImUsed` (type) - missing @example
- `src/http/HttpStatus.ts:454` `HttpStatus2XX` (const) - missing @example
- `src/http/HttpStatus.ts:478` `HttpStatus2XX` (namespace) - missing @example
- `src/http/HttpStatus.ts:494` `HttpStatus2XX` (type) - missing @example
- `src/http/HttpStatus.ts:509` `MultipleChoices` (const) - missing @example
- `src/http/HttpStatus.ts:527` `MultipleChoices` (type) - missing @example
- `src/http/HttpStatus.ts:536` `MovedPermanently` (const) - missing @example
- `src/http/HttpStatus.ts:550` `MovedPermanently` (type) - missing @example
- `src/http/HttpStatus.ts:562` `Found` (const) - missing @example
- `src/http/HttpStatus.ts:576` `Found` (type) - missing @example
- `src/http/HttpStatus.ts:585` `SeeOther` (const) - missing @example
- `src/http/HttpStatus.ts:599` `SeeOther` (type) - missing @example
- `src/http/HttpStatus.ts:610` `NotModified` (const) - missing @example
- `src/http/HttpStatus.ts:624` `NotModified` (type) - missing @example
- `src/http/HttpStatus.ts:633` `UseProxy` (const) - missing @example
- `src/http/HttpStatus.ts:647` `UseProxy` (type) - missing @example
- `src/http/HttpStatus.ts:656` `SwitchProxy` (const) - missing @example
- `src/http/HttpStatus.ts:670` `SwitchProxy` (type) - missing @example
- `src/http/HttpStatus.ts:682` `TemporaryRedirect` (const) - missing @example
- `src/http/HttpStatus.ts:696` `TemporaryRedirect` (type) - missing @example
- `src/http/HttpStatus.ts:707` `PermanentRedirect` (const) - missing @example
- `src/http/HttpStatus.ts:721` `PermanentRedirect` (type) - missing @example
- `src/http/HttpStatus.ts:732` `HttpStatus3XX` (const) - missing @example
- `src/http/HttpStatus.ts:755` `HttpStatus3XX` (type) - missing @example
- `src/http/HttpStatus.ts:763` `HttpStatus3XX` (namespace) - missing @example
- `src/http/HttpStatus.ts:785` `BadRequest` (const) - missing @example
- `src/http/HttpStatus.ts:799` `BadRequest` (type) - missing @example
- `src/http/HttpStatus.ts:813` `Unauthorized` (const) - missing @example
- `src/http/HttpStatus.ts:834` `Unauthorized` (type) - missing @example
- `src/http/HttpStatus.ts:844` `PaymentRequired` (const) - missing @example
- `src/http/HttpStatus.ts:858` `PaymentRequired` (type) - missing @example
- `src/http/HttpStatus.ts:873` `Forbidden` (const) - missing @example
- `src/http/HttpStatus.ts:887` `Forbidden` (type) - missing @example
- `src/http/HttpStatus.ts:899` `NotFound` (const) - missing @example
- `src/http/HttpStatus.ts:913` `NotFound` (type) - missing @example
- `src/http/HttpStatus.ts:922` `MethodNotAllowed` (const) - missing @example
- `src/http/HttpStatus.ts:936` `MethodNotAllowed` (type) - missing @example
- `src/http/HttpStatus.ts:945` `NotAcceptable` (const) - missing @example
- `src/http/HttpStatus.ts:959` `NotAcceptable` (type) - missing @example
- `src/http/HttpStatus.ts:969` `ProxyAuthenticationRequired` (const) - missing @example
- `src/http/HttpStatus.ts:983` `ProxyAuthenticationRequired` (type) - missing @example
- `src/http/HttpStatus.ts:996` `RequestTimeout` (const) - missing @example
- `src/http/HttpStatus.ts:1010` `RequestTimeout` (type) - missing @example
- `src/http/HttpStatus.ts:1021` `Conflict` (const) - missing @example
- `src/http/HttpStatus.ts:1035` `Conflict` (type) - missing @example
- `src/http/HttpStatus.ts:1047` `Gone` (const) - missing @example
- `src/http/HttpStatus.ts:1061` `Gone` (type) - missing @example
- `src/http/HttpStatus.ts:1070` `LengthRequired` (const) - missing @example
- `src/http/HttpStatus.ts:1084` `LengthRequired` (type) - missing @example
- `src/http/HttpStatus.ts:1093` `PreconditionFailed` (const) - missing @example
- `src/http/HttpStatus.ts:1107` `PreconditionFailed` (type) - missing @example
- `src/http/HttpStatus.ts:1120` `PayloadTooLarge` (const) - missing @example
- `src/http/HttpStatus.ts:1134` `PayloadTooLarge` (type) - missing @example
- `src/http/HttpStatus.ts:1144` `UriTooLong` (const) - missing @example
- `src/http/HttpStatus.ts:1158` `UriTooLong` (type) - missing @example
- `src/http/HttpStatus.ts:1168` `UnsupportedMediaType` (const) - missing @example
- `src/http/HttpStatus.ts:1182` `UnsupportedMediaType` (type) - missing @example
- `src/http/HttpStatus.ts:1192` `RangeNotSatisfiable` (const) - missing @example
- `src/http/HttpStatus.ts:1206` `RangeNotSatisfiable` (type) - missing @example
- `src/http/HttpStatus.ts:1215` `ExpectationFailed` (const) - missing @example
- `src/http/HttpStatus.ts:1229` `ExpectationFailed` (type) - missing @example
- `src/http/HttpStatus.ts:1238` `ImATeapot` (const) - missing @example
- `src/http/HttpStatus.ts:1252` `ImATeapot` (type) - missing @example
- `src/http/HttpStatus.ts:1261` `MisdirectedRequest` (const) - missing @example
- `src/http/HttpStatus.ts:1274` `MisdirectedRequest` (type) - missing @example
- `src/http/HttpStatus.ts:1285` `UnprocessableEntity` (const) - missing @example
- `src/http/HttpStatus.ts:1299` `UnprocessableEntity` (type) - missing @example
- `src/http/HttpStatus.ts:1307` `Locked` (const) - missing @example
- `src/http/HttpStatus.ts:1320` `Locked` (type) - missing @example
- `src/http/HttpStatus.ts:1329` `FailedDependency` (const) - missing @example
- `src/http/HttpStatus.ts:1343` `FailedDependency` (type) - missing @example
- `src/http/HttpStatus.ts:1352` `TooEarly` (const) - missing @example
- `src/http/HttpStatus.ts:1366` `TooEarly` (type) - missing @example
- `src/http/HttpStatus.ts:1376` `UpgradeRequired` (const) - missing @example
- `src/http/HttpStatus.ts:1390` `UpgradeRequired` (type) - missing @example
- `src/http/HttpStatus.ts:1402` `PreconditionRequired` (const) - missing @example
- `src/http/HttpStatus.ts:1416` `PreconditionRequired` (type) - missing @example
- `src/http/HttpStatus.ts:1434` `TooManyRequests` (const) - missing @example
- `src/http/HttpStatus.ts:1448` `TooManyRequests` (type) - missing @example
- `src/http/HttpStatus.ts:1458` `RequestHeaderFieldsTooLarge` (const) - missing @example
- `src/http/HttpStatus.ts:1472` `RequestHeaderFieldsTooLarge` (type) - missing @example
- `src/http/HttpStatus.ts:1482` `UnavailableForLegalReasons` (const) - missing @example
- `src/http/HttpStatus.ts:1496` `UnavailableForLegalReasons` (type) - missing @example
- `src/http/HttpStatus.ts:1508` `HttpStatus4XX` (const) - missing @example
- `src/http/HttpStatus.ts:1555` `HttpStatus4XX` (namespace) - missing @example
- `src/http/HttpStatus.ts:1571` `HttpStatus4XX` (type) - missing @example
- `src/http/HttpStatus.ts:1588` `InternalServerError` (const) - missing @example
- `src/http/HttpStatus.ts:1602` `InternalServerError` (type) - missing @example
- `src/http/HttpStatus.ts:1611` `NotImplemented` (const) - missing @example
- `src/http/HttpStatus.ts:1625` `NotImplemented` (type) - missing @example
- `src/http/HttpStatus.ts:1636` `BadGateway` (const) - missing @example
- `src/http/HttpStatus.ts:1650` `BadGateway` (type) - missing @example
- `src/http/HttpStatus.ts:1661` `ServiceUnavailable` (const) - missing @example
- `src/http/HttpStatus.ts:1675` `ServiceUnavailable` (type) - missing @example
- `src/http/HttpStatus.ts:1688` `GatewayTimeout` (const) - missing @example
- `src/http/HttpStatus.ts:1702` `GatewayTimeout` (type) - missing @example
- `src/http/HttpStatus.ts:1711` `HttpVersionNotSupported` (const) - missing @example
- `src/http/HttpStatus.ts:1725` `HttpVersionNotSupported` (type) - missing @example
- `src/http/HttpStatus.ts:1737` `VariantAlsoNegotiates` (const) - missing @example
- `src/http/HttpStatus.ts:1751` `VariantAlsoNegotiates` (type) - missing @example
- `src/http/HttpStatus.ts:1760` `InsufficientStorage` (const) - missing @example
- `src/http/HttpStatus.ts:1774` `InsufficientStorage` (type) - missing @example
- `src/http/HttpStatus.ts:1783` `LoopDetected` (const) - missing @example
- `src/http/HttpStatus.ts:1796` `LoopDetected` (type) - missing @example
- `src/http/HttpStatus.ts:1805` `NotExtended` (const) - missing @example
- `src/http/HttpStatus.ts:1819` `NotExtended` (type) - missing @example
- `src/http/HttpStatus.ts:1830` `NetworkAuthenticationRequired` (const) - missing @example
- `src/http/HttpStatus.ts:1844` `NetworkAuthenticationRequired` (type) - missing @example
- `src/http/HttpStatus.ts:1854` `HttpStatus5XX` (const) - missing @example
- `src/http/HttpStatus.ts:1879` `HttpStatus5XX` (namespace) - missing @example
- `src/http/HttpStatus.ts:1895` `HttpStatus5XX` (type) - missing @example
- `src/http/HttpStatus.ts:1909` `RequestHeaderFieldsTooLargeShopify` (const) - missing @example
- `src/http/HttpStatus.ts:1923` `RequestHeaderFieldsTooLargeShopify` (type) - missing @example
- `src/http/HttpStatus.ts:1933` `LoginTimeout` (const) - missing @example
- `src/http/HttpStatus.ts:1947` `LoginTimeout` (type) - missing @example
- `src/http/HttpStatus.ts:1956` `RequestHeaderTooLarge` (const) - missing @example
- `src/http/HttpStatus.ts:1970` `RequestHeaderTooLarge` (type) - missing @example
- `src/http/HttpStatus.ts:1979` `SslCertificateError` (const) - missing @example
- `src/http/HttpStatus.ts:1993` `SslCertificateError` (type) - missing @example
- `src/http/HttpStatus.ts:2002` `SslCertificateRequired` (const) - missing @example
- `src/http/HttpStatus.ts:2016` `SslCertificateRequired` (type) - missing @example
- `src/http/HttpStatus.ts:2025` `ClientClosedRequest` (const) - missing @example
- `src/http/HttpStatus.ts:2039` `ClientClosedRequest` (type) - missing @example
- `src/http/HttpStatus.ts:2049` `WebServerReturnedAnUnknownError` (const) - missing @example
- `src/http/HttpStatus.ts:2063` `WebServerReturnedAnUnknownError` (type) - missing @example
- `src/http/HttpStatus.ts:2073` `WebServerIsDown` (const) - missing @example
- `src/http/HttpStatus.ts:2087` `WebServerIsDown` (type) - missing @example
- `src/http/HttpStatus.ts:2096` `SslHandshakeFailed` (const) - missing @example
- `src/http/HttpStatus.ts:2110` `SslHandshakeFailed` (type) - missing @example
- `src/http/HttpStatus.ts:2121` `InvalidSslCertificate` (const) - missing @example
- `src/http/HttpStatus.ts:2135` `InvalidSslCertificate` (type) - missing @example
- `src/http/HttpStatus.ts:2146` `HttpStatusUnofficial` (const) - missing @example
- `src/http/HttpStatus.ts:2170` `HttpStatusUnofficial` (namespace) - missing @example
- `src/http/HttpStatus.ts:2186` `HttpStatusUnofficial` (type) - missing @example
- `src/http/HttpStatus.ts:2198` `HttpStatus` (const) - missing @example
- `src/http/HttpStatus.ts:2217` `HttpStatus` (namespace) - missing @example
- `src/http/HttpStatus.ts:2233` `HttpStatus` (type) - missing @example
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
- `src/LocalDate.ts:124` `isLocalDate` (const) - missing @example
- `src/LocalDate.ts:208` `fromString` (const) - missing @example
- `src/LocalDate.ts:231` `fromDate` (const) - missing @example
- `src/LocalDate.ts:245` `today` (const) - missing @example
- `src/LocalDate.ts:253` `todayEffect` (const) - missing @example
- `src/LocalDate.ts:264` `fromDateTime` (const) - missing @example
- `src/LocalDate.ts:279` `Order` (const) - missing @example
- `src/LocalDate.ts:298` `isBefore` (const) - missing @example
- `src/LocalDate.ts:309` `isAfter` (const) - missing @example
- `src/LocalDate.ts:320` `equals` (const) - missing @example
- `src/LocalDate.ts:335` `addDays` (const) - missing @example
- `src/LocalDate.ts:350` `addMonths` (const) - missing @example
- `src/LocalDate.ts:365` `addYears` (const) - missing @example
- `src/LocalDate.ts:380` `diffInDays` (const) - missing @example
- `src/LocalDate.ts:396` `startOfMonth` (const) - missing @example
- `src/LocalDate.ts:409` `endOfMonth` (const) - missing @example
- `src/LocalDate.ts:422` `startOfYear` (const) - missing @example
- `src/LocalDate.ts:435` `endOfYear` (const) - missing @example
- `src/LocalDate.ts:448` `isLeapYear` (const) - missing @example
- `src/LocalDate.ts:456` `daysInMonth` (const) - missing @example
- `src/LocalDate.ts:503` `LocalDateFromString` (type) - missing @example
- `src/LocalDate.ts:511` `LocalDateFromString` (namespace) - missing @example
- `src/location/CardinalDirection.ts:16` `CardinalDirection` (const) - missing @example
- `src/location/CardinalDirection.ts:27` `CardinalDirection` (type) - missing @example
- `src/location/CardinalDirection.ts:35` `CardinalDirectionAbbrev` (const) - missing @example
- `src/location/CardinalDirection.ts:47` `CardinalDirectionAbbrev` (type) - missing @example
- `src/location/index.ts:12` `export * from "./CardinalDirection.ts";` (re-export) - missing @example
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
- `src/MutableHashMap.ts:81` `MutableHashMapIso` (type) - missing @example
- `src/MutableHashMap.ts:91` `MutableHashMapFromSelf` (interface) - missing @example
- `src/MutableHashMap.ts:161` `MutableHashMapFromSelf` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashMap.ts:109` `MutableHashMap` (interface) - missing @example
- `src/MutableHashMap.ts:260` `MutableHashMap` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashSet.ts:53` `MutableHashSetIso` (type) - missing @example
- `src/MutableHashSet.ts:61` `MutableHashSetFromSelf` (interface) - missing @example
- `src/MutableHashSet.ts:126` `MutableHashSetFromSelf` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashSet.ts:78` `MutableHashSet` (interface) - missing @example
- `src/MutableHashSet.ts:219` `MutableHashSet` (const) - 1 schema annotation/type-alias gap(s)
- `src/Number.ts:163` `NonNegNum` (type) - 1 unsafe example violation(s)
- `src/Number.ts:213` `NonNegativeInt` (type) - 1 unsafe example violation(s)
- `src/Options.ts:78` `OptionFromOptionalNullishKey` (const) - forbidden @template
- `src/PascalStr.ts:54` `PascalCaseStr` (type) - 1 unsafe example violation(s)
- `src/Percentage.ts:55` `Percentage` (type) - 1 unsafe example violation(s)
- `src/Percentage.ts:93` `TWENTY` (const) - missing @example
- `src/Percentage.ts:100` `FIFTY` (const) - missing @example
- `src/Percentage.ts:107` `HUNDRED` (const) - missing @example
- `src/person/Age.ts:16` `Age` (const) - missing @example
- `src/person/Age.ts:34` `Age` (type) - missing @example
- `src/person/index.ts:12` `export * from "./Age.ts";` (re-export) - missing @example
- `src/person/index.ts:18` `export * from "./Sex.ts";` (re-export) - missing @example
- `src/person/Sex.ts:16` `Sex` (const) - missing @example
- `src/person/Sex.ts:27` `Sex` (type) - missing @example
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
- `src/SchemaUtils/withKeyDefaults.ts:114` `withEmptyArrayDefaults` (function) - forbidden @template
- `src/SchemaUtils/withKeyDefaults.ts:119` `withEmptyArrayDefaults` (function) - missing summary; missing @example, @category, @since
- `src/SchemaUtils/withKeyDefaults.ts:124` `withEmptyArrayDefaults` (function) - missing summary; missing @example, @category, @since
- `src/SchemaUtils/withKeyDefaults.ts:50` `withKeyDefaults` (const) - forbidden @template
- `src/SchemaUtils/withKeyDefaults.ts:154` `boolKeyWithDefault` (const) - 2 schema annotation/type-alias gap(s)
- `src/SchemaUtils/withLiteralKitStatics.ts:24` `withLiteralKitStatics` (const) - missing @example
- `src/Sha256.ts:79` `Sha256Hex` (type) - 1 unsafe example violation(s)
- `src/Sha256.ts:126` `Sha256HexFromBytes` (type) - 1 unsafe example violation(s)
- `src/Sha256.ts:169` `Sha256HexFromHexBytes` (type) - 1 unsafe example violation(s)
- `src/Slug.ts:98` `Slug` (type) - missing @example
- `src/Slug.ts:106` `SlugFromStr` (const) - missing @example
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
- `src/Sql/index.ts:5` `export * from "./Sql.ts";` (re-export) - missing @example
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
- `src/Timestamp.ts:292` `now` (const) - missing @example
- `src/Timestamp.ts:300` `nowEffect` (const) - missing @example
- `src/Timestamp.ts:311` `Order` (const) - missing @example
- `src/Timestamp.ts:323` `isBefore` (const) - missing @example
- `src/Timestamp.ts:334` `isAfter` (const) - missing @example
- `src/Timestamp.ts:345` `equals` (const) - missing @example
- `src/Timestamp.ts:356` `addMillis` (const) - missing @example
- `src/Timestamp.ts:367` `addSeconds` (const) - missing @example
- `src/Timestamp.ts:378` `addMinutes` (const) - missing @example
- `src/Timestamp.ts:389` `addHours` (const) - missing @example
- `src/Timestamp.ts:400` `addDays` (const) - missing @example
- `src/Timestamp.ts:411` `diffInMillis` (const) - missing @example
- `src/Timestamp.ts:422` `diffInSeconds` (const) - missing @example
- `src/Timestamp.ts:433` `min` (const) - missing @example
- `src/Timestamp.ts:444` `max` (const) - missing @example
- `src/Timestamp.ts:455` `EPOCH` (const) - missing @example
- `src/Toml.ts:94` `TomlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/Transformations.ts:47` `destructiveTransform` (const) - 2 schema annotation/type-alias gap(s)
- `src/URL.ts:85` `URLStr` (type) - 1 unsafe example violation(s)
- `src/VariantSchema.ts:19` `TypeId` (const) - missing summary; missing @example
- `src/VariantSchema.ts:27` `Struct` (interface) - missing summary; missing @example
- `src/VariantSchema.ts:43` `Struct` (namespace) - missing summary; missing @example
- `src/VariantSchema.ts:37` `isStruct` (const) - missing summary; missing @example
- `src/VariantSchema.ts:79` `Field` (interface) - missing summary; missing @example
- `src/VariantSchema.ts:93` `Field` (namespace) - missing summary; missing @example
- `src/VariantSchema.ts:88` `isField` (const) - missing summary; missing @example
- `src/VariantSchema.ts:147` `ExtractFields` (type) - missing summary; missing @example
- `src/VariantSchema.ts:167` `Extract` (type) - missing summary; missing @example
- `src/VariantSchema.ts:229` `fields` (const) - missing summary; missing @example
- `src/VariantSchema.ts:235` `Class` (interface) - missing summary; missing @example
- `src/VariantSchema.ts:344` `Union` (interface) - missing summary; missing @example
- `src/VariantSchema.ts:353` `Union` (namespace) - missing summary; missing @example
- `src/VariantSchema.ts:448` `make` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/VariantSchema.ts:579` `Override` (const) - missing summary; missing @example
- `src/VariantSchema.ts:585` `Overridable` (interface) - missing summary; missing @example
- `src/VariantSchema.ts:608` `Overridable` (const) - missing summary; missing @example
- `src/VariantSchema.ts:659` `Overrideable` (const) - missing @example
- `src/Xml.ts:79` `XmlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/Yaml.ts:96` `YamlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)

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
- `src/values/OnePasswordReference/index.ts:9` `export * from "./OnePasswordReference.model.ts";` (re-export) - missing @example
- `src/values/OnePasswordReference/OnePasswordReference.model.ts:35` `OnePasswordReference` (const) - missing @example
- `src/values/OnePasswordReference/OnePasswordReference.model.ts:50` `OnePasswordReference` (type) - missing @example
- `src/values/OnePasswordReference/OnePasswordReference.model.ts:58` `isOnePasswordReference` (const) - missing @example

### @beep/test-utils

Path: `packages/tooling/test-kit/test-utils`

Export findings:
- `src/index.ts:14` `export * from "./Layer.js";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./SqlTest.js";` (re-export) - missing @example
- `src/SqlTest.ts:190` `PgliteTestcontainersTestDriverConfigInput` (type) - missing @example
- `src/SqlTest.ts:243` `PgExternalTestDriverConfigInput` (type) - missing @example
- `src/SqlTest.ts:251` `PgliteSqlTestLayerMode` (type) - missing @example
- `src/SqlTest.ts:259` `PgliteSqlTestLayerOptions` (interface) - missing @example
- `src/SqlTest.ts:440` `PgliteTestcontainerResource` (interface) - 1 unsafe example violation(s)

### @beep/installer-domain

Path: `packages/installer/domain`

Export findings:
- `src/aggregates/DiscordChannel/DiscordChannel.model.ts:22` `DiscordChannelKind` (const) - missing @example
- `src/aggregates/DiscordChannel/DiscordChannel.model.ts:34` `DiscordChannelKind` (type) - missing @example
- `src/aggregates/DiscordChannel/DiscordChannel.model.ts:42` `DiscordChannelStatus` (const) - missing @example
- `src/aggregates/DiscordChannel/DiscordChannel.model.ts:54` `DiscordChannelStatus` (type) - missing @example
- `src/aggregates/DiscordChannel/DiscordChannel.model.ts:62` `DiscordChannel` (class) - missing @example
- `src/aggregates/DiscordChannel/index.ts:7` `export * from "./DiscordChannel.model.js";` (re-export) - missing @example
- `src/aggregates/HostDependency/HostDependency.model.ts:21` `HostDependencyKind` (const) - missing @example
- `src/aggregates/HostDependency/HostDependency.model.ts:33` `HostDependencyKind` (type) - missing @example
- `src/aggregates/HostDependency/HostDependency.model.ts:41` `HostDependencyStatus` (const) - missing @example
- `src/aggregates/HostDependency/HostDependency.model.ts:53` `HostDependencyStatus` (type) - missing @example
- `src/aggregates/HostDependency/HostDependency.model.ts:61` `HostDependency` (class) - missing @example
- `src/aggregates/HostDependency/index.ts:7` `export * from "./HostDependency.model.js";` (re-export) - missing @example
- `src/aggregates/index.ts:15` `export * as DiscordChannel from "./DiscordChannel/index.js";` (re-export) - missing @example
- `src/aggregates/index.ts:23` `export * as HostDependency from "./HostDependency/index.js";` (re-export) - missing @example
- `src/aggregates/index.ts:31` `export * as ProviderAccount from "./ProviderAccount/index.js";` (re-export) - missing @example
- `src/aggregates/index.ts:39` `export * as SecretReference from "./SecretReference/index.js";` (re-export) - missing @example
- `src/aggregates/index.ts:47` `export * as StackManifest from "./StackManifest/index.js";` (re-export) - missing @example
- `src/aggregates/ProviderAccount/index.ts:7` `export * from "./ProviderAccount.model.js";` (re-export) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:22` `ProviderKind` (const) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:34` `ProviderKind` (type) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:42` `ProviderAuthMode` (const) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:54` `ProviderAuthMode` (type) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:62` `ProviderAccountStatus` (const) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:74` `ProviderAccountStatus` (type) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:82` `ProviderAccount` (class) - missing @example
- `src/aggregates/SecretReference/index.ts:7` `export * from "./SecretReference.model.js";` (re-export) - missing @example
- `src/aggregates/SecretReference/SecretReference.model.ts:22` `SecretReferencePurpose` (const) - missing @example
- `src/aggregates/SecretReference/SecretReference.model.ts:39` `SecretReferencePurpose` (type) - missing @example
- `src/aggregates/SecretReference/SecretReference.model.ts:47` `SecretReferenceStatus` (const) - missing @example
- `src/aggregates/SecretReference/SecretReference.model.ts:63` `SecretReferenceStatus` (type) - missing @example
- `src/aggregates/SecretReference/SecretReference.model.ts:71` `SecretReference` (class) - missing @example
- `src/aggregates/StackManifest/index.ts:7` `export * from "./StackManifest.model.js";` (re-export) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:22` `StackInstallerPlatform` (const) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:34` `StackInstallerPlatform` (type) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:42` `StackInstallerProvider` (const) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:54` `StackInstallerProvider` (type) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:62` `ValidationTier` (const) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:80` `ValidationTier` (type) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:88` `ValidationStatus` (const) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:100` `ValidationStatus` (type) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:108` `ManifestProvider` (class) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:126` `ManifestDiscordChannel` (class) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:144` `ManifestCapability` (class) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:162` `AIStackManifest` (class) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:185` `ValidationEvent` (class) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:205` `P1aDryRunSnapshot` (class) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:223` `P1LiveProofSnapshot` (class) - missing @example
- `src/index.ts:23` `export * as Aggregates from "./aggregates/index.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as Entities from "./entities/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as Identity from "./identity/index.js";` (re-export) - missing @example
- `src/index.ts:44` `export * as Values from "./values/index.js";` (re-export) - missing @example
- `src/index.ts:15` `VERSION` (const) - missing @example

### @beep/drizzle

Path: `packages/drivers/drizzle`

Export findings:
- `src/index.ts:14` `export * from "./Drizzle.errors.ts";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./Drizzle.service.ts";` (re-export) - missing @example
- `src/index.ts:30` `export * as EntityTable from "./EntityTable.ts";` (re-export) - missing @example

### @beep/architecture-lab-domain

Path: `packages/architecture-lab/domain`

Export findings:
- `src/aggregates/index.ts:7` `export * as WorkItem from "./WorkItem/index.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.errors.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:14` `export * from "./WorkItem.model.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:21` `export * from "./WorkItem.values.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:23` `WorkItemAlreadyArchived` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:40` `WorkItemInvalidTransition` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:79` `WorkItemAssigneeRequired` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:96` `WorkItemDomainError` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:104` `WorkItemDomainError` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/aggregates/WorkItem/WorkItem.model.ts:26` `WorkItem` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:46` `CreateWorkItemInput` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:66` `create` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:84` `assign` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:109` `complete` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:133` `reopen` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:151` `archive` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:21` `WorkItemId` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:36` `WorkItemId` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:44` `WorkItemTitle` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:58` `WorkItemTitle` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:66` `WorkItemStatus` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:79` `WorkItemStatus` (type) - missing @example
- `src/entities/index.ts:15` `export * as Worker from "./Worker/index.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:7` `export * from "./Worker.model.js";` (re-export) - missing @example
- `src/entities/Worker/Worker.model.ts:26` `WorkerId` (const) - missing @example
- `src/entities/Worker/Worker.model.ts:34` `WorkerId` (type) - missing @example
- `src/entities/Worker/Worker.model.ts:42` `WorkerOrganizationId` (const) - missing @example
- `src/entities/Worker/Worker.model.ts:50` `WorkerOrganizationId` (type) - missing @example
- `src/entities/Worker/Worker.model.ts:58` `WorkerStatus` (const) - missing @example
- `src/entities/Worker/Worker.model.ts:71` `WorkerStatus` (type) - missing @example
- `src/entities/Worker/Worker.model.ts:79` `Worker` (class) - missing @example
- `src/entities/Worker/Worker.model.ts:107` `CreateWorkerInput` (class) - missing @example
- `src/entities/Worker/Worker.model.ts:132` `create` (const) - missing @example
- `src/identity/ArchitectureLab.ts:21` `WorkerId` (const) - missing @example
- `src/identity/ArchitectureLab.ts:31` `WorkerId` (type) - missing @example
- `src/identity/index.ts:15` `export * as ArchitectureLab from "./ArchitectureLab.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as Aggregates from "./aggregates/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/index.ts:44` `export * as Entities from "./entities/index.js";` (re-export) - missing @example
- `src/index.ts:51` `export * as Worker from "./entities/Worker/index.js";` (re-export) - missing @example
- `src/index.ts:58` `export * as Identity from "./identity/index.js";` (re-export) - missing @example
- `src/index.ts:65` `export * as Values from "./values/index.js";` (re-export) - missing @example
- `src/index.ts:72` `export * as WorkPriority from "./values/WorkPriority/index.js";` (re-export) - missing @example
- `src/values/index.ts:15` `export * as WorkPriority from "./WorkPriority/index.js";` (re-export) - missing @example
- `src/values/WorkPriority/index.ts:7` `export * from "./WorkPriority.behavior.js";` (re-export) - missing @example
- `src/values/WorkPriority/index.ts:14` `export * from "./WorkPriority.model.js";` (re-export) - missing @example
- `src/values/WorkPriority/WorkPriority.behavior.ts:20` `defaultWorkPriority` (const) - missing @example
- `src/values/WorkPriority/WorkPriority.behavior.ts:28` `rank` (const) - missing @example
- `src/values/WorkPriority/WorkPriority.behavior.ts:41` `compare` (const) - missing @example
- `src/values/WorkPriority/WorkPriority.model.ts:20` `WorkPriority` (const) - missing @example
- `src/values/WorkPriority/WorkPriority.model.ts:33` `WorkPriority` (type) - missing @example

### @beep/repo-utils

Path: `packages/tooling/library/repo-utils`

Module findings:
- `src/TypeScript/index.ts:1` (jsdoc) - missing summary
- `src/TypeScript/models/index.ts:1` (jsdoc) - missing summary

Export findings:
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
- `src/JSDoc/index.ts:8` `export * as Models from "./models/index.js";` (re-export) - missing @example
- `src/JSDoc/JSDoc.ts:510` `StructuralJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:1138` `AccessModifierJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:1535` `DocumentationContentJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:1959` `TSDocSpecificJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:2084` `InlineJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:2368` `OrganizationalJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:2555` `EventDependencyJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:3279` `RemainingJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:3840` `ClosureSpecificJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:4231` `TypeDocSpecificJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:4321` `TypeScriptSpecificJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:4367` `JSDocTag` (const) - 1 schema annotation/type-alias gap(s)
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
- `src/JSDoc/models/TagValue.model.ts:11` `export * from "./tag-values/index.js";` (re-export) - missing @example
- `src/JSDoc/models/TSCategory.model.ts:275` `make` (const) - 1 schema annotation/type-alias gap(s)
- `src/Reuse/index.ts:7` `export * from "./Reuse.model.js";` (re-export) - missing @example
- `src/Reuse/index.ts:14` `export * from "./Reuse.service.js";` (re-export) - missing @example
- `src/TSMorph/index.ts:7` `export * from "./TSMorph.model.js";` (re-export) - missing @example
- `src/TSMorph/index.ts:14` `export * from "./TSMorph.service.js";` (re-export) - missing @example
- `src/TSMorph/TSMorph.model.ts:418` `SymbolKind` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:444` `SymbolCategory` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:729` `TsMorphScopeMode` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:755` `TsMorphReferencePolicy` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:1784` `TsMorphDiagnosticCategory` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.service.ts:270` `TSMorphServiceError` (const) - 1 schema annotation/type-alias gap(s)
- `src/TypeScript/index.ts:5` `export * from "./models/index.js";` (re-export) - missing @example
- `src/TypeScript/models/index.ts:5` `export * from "./TSSyntaxKind.model.js";` (re-export) - missing @example

### @beep/duckdb

Path: `packages/drivers/duckdb`

Export findings:
- `src/index.ts:14` `export * from "./DuckDb.errors.ts";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./DuckDb.models.ts";` (re-export) - missing @example
- `src/index.ts:30` `export * from "./DuckDb.service.ts";` (re-export) - missing @example

### @beep/canvas-domain

Path: `packages/canvas/domain`

Export findings:
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:23` `CanvasProjectAlreadyArchived` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:42` `CanvasProjectInvalidTransition` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:81` `CanvasNodeAlreadyExists` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:99` `CanvasNodeNotFound` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:117` `CanvasProjectDomainError` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:129` `CanvasProjectDomainError` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/aggregates/CanvasProject/CanvasProject.model.ts:37` `CanvasNode` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.model.ts:55` `CanvasProject` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.model.ts:74` `CreateCanvasProjectInput` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.model.ts:96` `create` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.model.ts:121` `addNode` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.model.ts:144` `removeNode` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.model.ts:167` `archive` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.model.ts:181` `reopen` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:21` `CanvasProjectId` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:36` `CanvasProjectId` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:44` `CanvasProjectTitle` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:58` `CanvasProjectTitle` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:66` `CanvasProjectStatus` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:79` `CanvasProjectStatus` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:87` `CanvasNodeId` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:102` `CanvasNodeId` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:110` `CanvasNodeKind` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:123` `CanvasNodeKind` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:131` `CanvasNodeLabel` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:145` `CanvasNodeLabel` (type) - missing @example
- `src/aggregates/CanvasProject/index.ts:7` `export * from "./CanvasProject.errors.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:14` `export * from "./CanvasProject.model.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:21` `export * from "./CanvasProject.values.js";` (re-export) - missing @example
- `src/aggregates/index.ts:13` `export * as CanvasProject from "./CanvasProject/index.js";` (re-export) - missing @example
- `src/identity/Canvas.ts:21` `CanvasOperatorId` (const) - missing @example
- `src/identity/Canvas.ts:31` `CanvasOperatorId` (type) - missing @example
- `src/identity/index.ts:15` `export * as Canvas from "./Canvas.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as CanvasProject from "./aggregates/CanvasProject/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as Aggregates from "./aggregates/index.js";` (re-export) - missing @example
- `src/index.ts:44` `export * as Identity from "./identity/index.js";` (re-export) - missing @example

### @beep/discord

Path: `packages/drivers/discord`

Export findings:
- `src/Discord.errors.ts:20` `DiscordErrorReason` (const) - missing @example
- `src/Discord.errors.ts:37` `DiscordErrorReason` (type) - missing @example
- `src/Discord.errors.ts:45` `DiscordError` (class) - missing @example
- `src/Discord.models.ts:19` `DiscordConfigInput` (class) - missing @example
- `src/Discord.models.ts:34` `DiscordChannelRequest` (class) - missing @example
- `src/Discord.models.ts:49` `DiscordCreateMessageRequest` (class) - missing @example
- `src/Discord.models.ts:65` `DiscordChannelProof` (class) - missing @example
- `src/Discord.models.ts:83` `DiscordMessageProof` (class) - missing @example
- `src/Discord.service.ts:196` `Discord` (class) - missing @example
- `src/index.ts:14` `export * from "./Discord.errors.ts";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./Discord.models.ts";` (re-export) - missing @example
- `src/index.ts:30` `export * from "./Discord.service.ts";` (re-export) - missing @example

### @beep/ai-provider-cli

Path: `packages/drivers/ai-provider-cli`

Export findings:
- `src/AiProviderCli.errors.ts:20` `AiProviderCliError` (class) - missing @example
- `src/AiProviderCli.models.ts:20` `AiProviderCliProvider` (const) - missing @example
- `src/AiProviderCli.models.ts:32` `AiProviderCliProvider` (type) - missing @example
- `src/AiProviderCli.models.ts:40` `AiProviderCliAuthStatus` (const) - missing @example
- `src/AiProviderCli.models.ts:52` `AiProviderCliAuthStatus` (type) - missing @example
- `src/AiProviderCli.models.ts:60` `AiProviderCliProcessResult` (class) - missing @example
- `src/AiProviderCli.models.ts:77` `AiProviderCliAuthProbe` (class) - missing @example
- `src/AiProviderCli.service.ts:36` `AiProviderCliRunner` (type) - missing @example
- `src/AiProviderCli.service.ts:128` `AiProviderCli` (class) - missing @example
- `src/index.ts:14` `export * from "./AiProviderCli.errors.ts";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./AiProviderCli.models.ts";` (re-export) - missing @example
- `src/index.ts:30` `export * from "./AiProviderCli.service.ts";` (re-export) - missing @example

### @beep/installer-use-cases

Path: `packages/installer/use-cases`

Export findings:
- `src/index.ts:23` `export * from "./public.js";` (re-export) - missing @example
- `src/index.ts:15` `VERSION` (const) - missing @example
- `src/public.ts:40` `InstallerDryRunVerb` (class) - missing @example
- `src/public.ts:60` `HostDependencyPlan` (class) - missing @example
- `src/public.ts:78` `HostDependencyValidationResult` (class) - missing @example
- `src/public.ts:97` `ProviderAccountPlan` (class) - missing @example
- `src/public.ts:115` `ProviderAuthValidationResult` (class) - missing @example
- `src/public.ts:137` `SecretReferencePlan` (class) - missing @example
- `src/public.ts:155` `SecretReferenceValidationRequest` (class) - missing @example
- `src/public.ts:176` `SecretReferenceValidationResult` (class) - missing @example
- `src/public.ts:199` `SecretReferenceReadError` (class) - missing @example
- `src/public.ts:216` `DiscordChannelPlan` (class) - missing @example
- `src/public.ts:234` `DiscordLiveValidationRequest` (class) - missing @example
- `src/public.ts:253` `DiscordLiveValidationResult` (class) - missing @example
- `src/public.ts:272` `WorkspaceDryRunPlan` (class) - missing @example
- `src/public.ts:290` `P1ManualProofRequest` (class) - missing @example
- `src/public.ts:312` `P1ManualProofResult` (class) - missing @example
- `src/public.ts:328` `P1A_HOST_DEPENDENCY_VERB_INPUTS` (const) - missing @example
- `src/public.ts:351` `P1A_SECRET_REFERENCE_VERB_INPUTS` (const) - missing @example
- `src/public.ts:374` `P1A_PROVIDER_ACCOUNT_VERB_INPUTS` (const) - missing @example
- `src/public.ts:397` `P1A_DISCORD_CHANNEL_VERB_INPUTS` (const) - missing @example
- `src/public.ts:420` `P1A_WORKSPACE_VERB_INPUTS` (const) - missing @example
- `src/public.ts:443` `P1A_INSTALLER_DRY_RUN_REGISTRY_INPUTS` (const) - missing @example
- `src/public.ts:457` `P1A_DRY_RUN_SNAPSHOT_INPUT` (const) - missing @example
- `src/server.ts:49` `HostDependencyUseCases` (class) - missing @example
- `src/server.ts:75` `SecretReferenceUseCases` (class) - missing @example
- `src/server.ts:96` `ProviderAccountUseCases` (class) - missing @example
- `src/server.ts:120` `DiscordChannelUseCases` (class) - missing @example
- `src/server.ts:140` `StackManifestUseCases` (class) - missing @example
- `src/server.ts:163` `P1ManualProofWorkflow` (class) - missing @example

### @beep/onepassword-cli

Path: `packages/drivers/onepassword-cli`

Export findings:
- `src/index.ts:14` `export * from "./OnePasswordCli.errors.ts";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./OnePasswordCli.models.ts";` (re-export) - missing @example
- `src/index.ts:30` `export * from "./OnePasswordCli.service.ts";` (re-export) - missing @example
- `src/OnePasswordCli.errors.ts:22` `OnePasswordCliErrorOptions` (class) - missing @example
- `src/OnePasswordCli.errors.ts:41` `OnePasswordCliError` (class) - missing @example
- `src/OnePasswordCli.models.ts:20` `OnePasswordReferenceProbeStatus` (const) - missing @example
- `src/OnePasswordCli.models.ts:32` `OnePasswordReferenceProbeStatus` (type) - missing @example
- `src/OnePasswordCli.models.ts:40` `OnePasswordCliProcessResult` (class) - missing @example
- `src/OnePasswordCli.models.ts:57` `OnePasswordCliAccount` (class) - missing @example
- `src/OnePasswordCli.models.ts:73` `OnePasswordReferenceProbe` (class) - missing @example
- `src/OnePasswordCli.service.ts:37` `OnePasswordCliRunner` (type) - missing @example
- `src/OnePasswordCli.service.ts:143` `OnePasswordCli` (class) - missing @example

### @beep/architecture-lab-config

Path: `packages/architecture-lab/config`

Export findings:
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.config.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:14` `export * from "./WorkItem.layer.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:20` `WorkItemPublicConfig` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:37` `WorkItemServerConfig` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:54` `WorkItemSecretConfig` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:70` `defaultWorkItemPublicConfig` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:81` `defaultWorkItemServerConfig` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:92` `defaultWorkItemSecretConfig` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:30` `WorkItemConfigValue` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:48` `WorkItemConfigShape` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:56` `WorkItemConfig` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:88` `testWorkItemConfig` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:100` `ArchitectureLabConfigLive` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:108` `ArchitectureLabConfigTest` (const) - missing @example
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
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.table.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:22` `WORK_ITEM_TABLE_NAME` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:30` `workItemTable` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:46` `WorkItemRow` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:54` `WorkItemInsert` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:62` `toWorkItemInsert` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:76` `fromWorkItemRow` (const) - missing @example
- `src/entities/index.ts:15` `export * as Worker from "./Worker/index.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:7` `export * from "./Worker.table.js";` (re-export) - missing @example
- `src/entities/Worker/Worker.table.ts:20` `workerTable` (const) - missing @example
- `src/entities/Worker/Worker.table.ts:28` `WORKER_TABLE_NAME` (const) - missing @example
- `src/entities/Worker/Worker.table.ts:36` `WorkerRow` (type) - missing @example
- `src/entities/Worker/Worker.table.ts:44` `WorkerInsert` (type) - missing @example
- `src/entities/Worker/Worker.table.ts:55` `toWorkerInsert` (const) - missing @example
- `src/entities/Worker/Worker.table.ts:63` `fromWorkerRow` (const) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as Worker from "./entities/Worker/index.js";` (re-export) - missing @example
- `src/index.ts:44` `export * from "./tables.js";` (re-export) - missing @example
- `src/tables.ts:23` `DbSchema` (const) - missing @example
- `src/tables.ts:34` `DbSchema` (type) - missing @example

### @beep/architecture-lab-use-cases

Path: `packages/architecture-lab/use-cases`

Export findings:
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.commands.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:14` `export * from "./WorkItem.errors.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:21` `export * from "./WorkItem.use-cases.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/server.ts:7` `export * from "./index.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/server.ts:14` `export * from "./WorkItem.repository.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/server.ts:21` `export { makeWorkItemUseCases, toWorkItemActionError } from "./WorkItem.service.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:25` `CreateWorkItemCommand` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:45` `AssignWorkItemCommand` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:62` `CompleteWorkItemCommand` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:78` `ReopenWorkItemCommand` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:94` `ArchiveWorkItemCommand` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:110` `GetWorkItemQuery` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:126` `ListWorkItemsQuery` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:22` `WORK_ITEM_ACTION_UNAVAILABLE_REASON` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:30` `WorkItemNotFound` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:47` `WorkItemConflict` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:65` `WorkItemActionRejected` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:83` `WorkItemActionFailed` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:100` `WorkItemActionError` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:108` `WorkItemActionError` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/aggregates/WorkItem/WorkItem.repository.ts:23` `WorkItemRepositoryNotFound` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.repository.ts:42` `WorkItemRepositoryConflict` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.repository.ts:62` `WorkItemRepositoryUnavailable` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.repository.ts:81` `WorkItemRepositoryError` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.repository.ts:92` `WorkItemRepositoryShape` (interface) - missing @example
- `src/aggregates/WorkItem/WorkItem.repository.ts:111` `WorkItemRepository` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.service.ts:50` `toWorkItemActionError` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.service.ts:88` `makeWorkItemUseCases` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.use-cases.ts:31` `WorkItemUseCasesShape` (interface) - missing @example
- `src/aggregates/WorkItem/WorkItem.use-cases.ts:49` `WorkItemUseCases` (class) - missing @example
- `src/entities/index.ts:15` `export * as Worker from "./Worker/index.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:7` `export * from "./Worker.commands.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:14` `export * from "./Worker.errors.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:21` `export * from "./Worker.use-cases.js";` (re-export) - missing @example
- `src/entities/Worker/server.ts:7` `export * from "./index.js";` (re-export) - missing @example
- `src/entities/Worker/server.ts:14` `export * from "./Worker.repository.js";` (re-export) - missing @example
- `src/entities/Worker/server.ts:21` `export { makeWorkerUseCases, toWorkerActionError } from "./Worker.service.js";` (re-export) - missing @example
- `src/entities/Worker/Worker.commands.ts:23` `CreateWorkerCommand` (class) - missing @example
- `src/entities/Worker/Worker.commands.ts:41` `GetWorkerQuery` (class) - missing @example
- `src/entities/Worker/Worker.commands.ts:57` `ListWorkersQuery` (class) - missing @example
- `src/entities/Worker/Worker.errors.ts:22` `WORKER_ACTION_UNAVAILABLE_REASON` (const) - missing @example
- `src/entities/Worker/Worker.errors.ts:30` `WorkerNotFound` (class) - missing @example
- `src/entities/Worker/Worker.errors.ts:47` `WorkerConflict` (class) - missing @example
- `src/entities/Worker/Worker.errors.ts:65` `WorkerActionFailed` (class) - missing @example
- `src/entities/Worker/Worker.errors.ts:82` `WorkerActionError` (type) - missing @example
- `src/entities/Worker/Worker.errors.ts:90` `WorkerActionError` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/entities/Worker/Worker.repository.ts:23` `WorkerRepositoryNotFound` (class) - missing @example
- `src/entities/Worker/Worker.repository.ts:40` `WorkerRepositoryConflict` (class) - missing @example
- `src/entities/Worker/Worker.repository.ts:58` `WorkerRepositoryUnavailable` (class) - missing @example
- `src/entities/Worker/Worker.repository.ts:77` `WorkerRepositoryError` (type) - missing @example
- `src/entities/Worker/Worker.repository.ts:85` `WorkerRepositoryShape` (interface) - missing @example
- `src/entities/Worker/Worker.repository.ts:101` `WorkerRepository` (class) - missing @example
- `src/entities/Worker/Worker.service.ts:41` `toWorkerActionError` (const) - missing @example
- `src/entities/Worker/Worker.service.ts:60` `makeWorkerUseCases` (const) - missing @example
- `src/entities/Worker/Worker.use-cases.ts:23` `WorkerUseCasesShape` (interface) - missing @example
- `src/entities/Worker/Worker.use-cases.ts:35` `WorkerUseCases` (class) - missing @example
- `src/index.ts:30` `export * from "./public.js";` (re-export) - missing @example
- `src/public.ts:7` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/public.ts:14` `export * as Worker from "./entities/Worker/index.js";` (re-export) - missing @example
- `src/server.ts:7` `export * as WorkItem from "./aggregates/WorkItem/server.js";` (re-export) - missing @example
- `src/server.ts:14` `export * as Worker from "./entities/Worker/server.js";` (re-export) - missing @example

### @beep/postgres

Path: `packages/drivers/postgres`

Export findings:
- `src/index.ts:14` `export * from "./Postgres.client.ts";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./Postgres.drizzle.ts";` (re-export) - missing @example
- `src/index.ts:30` `export * from "./Postgres.errors.ts";` (re-export) - missing @example
- `src/index.ts:38` `export * from "./Postgres.format.ts";` (re-export) - missing @example
- `src/index.ts:46` `export * from "./Postgres.sqlstate.ts";` (re-export) - missing @example

### @beep/face-detection

Path: `packages/drivers/face-detection`

Export findings:
- `src/FaceDetection.models.ts:20` `PositivePixelDimension` (const) - missing @example
- `src/FaceDetection.models.ts:39` `PositivePixelDimension` (type) - missing @example
- `src/FaceDetection.models.ts:47` `FaceDetectionConfidence` (const) - missing @example
- `src/FaceDetection.models.ts:81` `FaceDetectionConfidence` (type) - missing @example
- `src/FaceDetection.models.ts:89` `FaceDetectionPercentage` (const) - missing @example
- `src/FaceDetection.models.ts:123` `FaceDetectionPercentage` (type) - missing @example
- `src/FaceDetection.models.ts:131` `FaceDetectionTopK` (const) - missing @example
- `src/FaceDetection.models.ts:150` `FaceDetectionTopK` (type) - missing @example
- `src/FaceDetection.models.ts:216` `FaceDetectionPoint` (class) - missing @example
- `src/FaceDetection.models.ts:232` `FaceDetectionBox` (class) - missing @example
- `src/FaceDetection.models.ts:250` `FaceDetectionLandmarks` (class) - missing @example
- `src/FaceDetection.models.ts:269` `FaceDetection` (class) - missing @example
- `src/FaceDetection.models.ts:286` `FaceDetectionResult` (class) - missing @example
- `src/FaceDetection.models.ts:304` `decodeFaceDetectionModelConfig` (const) - missing @example
- `src/FaceDetection.models.ts:312` `decodeFaceDetectionImageRequest` (const) - missing @example
- `src/FaceDetection.service.ts:83` `LoadedFaceDetector` (interface) - missing @example
- `src/FaceDetection.service.ts:93` `FaceDetectionServiceShape` (interface) - missing @example
- `src/FaceDetection.service.ts:106` `FaceDetectionService` (class) - missing @example
- `src/FaceDetection.service.ts:539` `makeFaceDetectionService` (const) - missing @example
- `src/FaceDetection.service.ts:569` `withDetector` (const) - missing @example
- `src/index.ts:14` `export * from "./FaceDetection.errors.ts";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./FaceDetection.models.ts";` (re-export) - missing @example
- `src/index.ts:30` `export * from "./FaceDetection.service.ts";` (re-export) - missing @example

### @beep/repo-docgen

Path: `packages/tooling/tool/docgen`

Export findings:
- `src/Configuration.ts:54` `ConfigurationSchema` (class) - 1 schema annotation/type-alias gap(s)
- `src/Configuration.ts:96` `ConfigurationShape` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:78` `Position` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:115` `Doc` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:193` `DocEntry` (class) - 1 unsafe example violation(s); 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:244` `Class` (class) - 1 unsafe example violation(s); 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:304` `Interface` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:353` `Function` (class) - 1 unsafe example violation(s); 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:402` `TypeAlias` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:451` `Constant` (class) - 1 unsafe example violation(s); 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:509` `Export` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:567` `Namespace` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:614` `Module` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:691` `File` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:751` `DocgenError` (class) - 1 schema annotation/type-alias gap(s)
- `src/index.ts:12` `export * as Checker from "./Checker.js";` (re-export) - missing @example
- `src/index.ts:18` `export * as Configuration from "./Configuration.js";` (re-export) - missing @example
- `src/index.ts:24` `export * as Core from "./Core.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as Domain from "./Domain.js";` (re-export) - missing @example
- `src/index.ts:36` `export * as Parser from "./Parser.js";` (re-export) - missing @example
- `src/index.ts:42` `export * as Printer from "./Printer.js";` (re-export) - missing @example

### @beep/repo-ai-metrics

Path: `packages/tooling/library/ai-metrics`

Export findings:
- `src/agent-effectiveness.ts:84` `AgentEffectivenessStatus` (type) - missing @example
- `src/agent-effectiveness.ts:109` `AgentEffectivenessAnnotationValue` (type) - missing @example

### @beep/runpod

Path: `packages/drivers/runpod`

Export findings:
- `src/_generated/Runpod.generated.ts:23` `Pods` (const) - missing @example
- `src/_generated/Runpod.generated.ts:36` `Pods` (type) - missing @example
- `src/_generated/Runpod.generated.ts:44` `Pod` (class) - missing @example
- `src/_generated/Runpod.generated.ts:149` `PodUpdateInPlaceInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:165` `PodUpdateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:191` `PodCreateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:238` `NetworkVolumes` (const) - missing @example
- `src/_generated/Runpod.generated.ts:257` `NetworkVolumes` (type) - missing @example
- `src/_generated/Runpod.generated.ts:265` `NetworkVolume` (class) - missing @example
- `src/_generated/Runpod.generated.ts:283` `NetworkVolumeCreateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:300` `NetworkVolumeUpdateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:316` `Templates` (const) - missing @example
- `src/_generated/Runpod.generated.ts:329` `Templates` (type) - missing @example
- `src/_generated/Runpod.generated.ts:337` `Template` (class) - missing @example
- `src/_generated/Runpod.generated.ts:369` `TemplateCreateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:397` `TemplateUpdateInPlaceInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:416` `TemplateUpdateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:442` `Endpoints` (const) - missing @example
- `src/_generated/Runpod.generated.ts:455` `Endpoints` (type) - missing @example
- `src/_generated/Runpod.generated.ts:463` `Endpoint` (class) - missing @example
- `src/_generated/Runpod.generated.ts:501` `EndpointUpdateInPlaceInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:523` `EndpointUpdateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:555` `EndpointCreateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:588` `User` (const) - missing @example
- `src/_generated/Runpod.generated.ts:600` `User` (type) - missing @example
- `src/_generated/Runpod.generated.ts:608` `SavingsPlan` (class) - missing @example
- `src/_generated/Runpod.generated.ts:628` `Machine` (class) - missing @example
- `src/_generated/Runpod.generated.ts:681` `DataCenter` (class) - missing @example
- `src/_generated/Runpod.generated.ts:696` `UnauthorizedError` (class) - missing @example
- `src/_generated/Runpod.generated.ts:711` `CudaVersions` (const) - missing @example
- `src/_generated/Runpod.generated.ts:723` `CudaVersions` (type) - missing @example
- `src/_generated/Runpod.generated.ts:731` `GPUTypeId` (const) - missing @example
- `src/_generated/Runpod.generated.ts:743` `GPUTypeId` (type) - missing @example
- `src/_generated/Runpod.generated.ts:751` `ContainerRegistryAuth` (class) - missing @example
- `src/_generated/Runpod.generated.ts:767` `ContainerRegistryAuths` (const) - missing @example
- `src/_generated/Runpod.generated.ts:780` `ContainerRegistryAuths` (type) - missing @example
- `src/_generated/Runpod.generated.ts:788` `ContainerRegistryAuthCreateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:807` `BillingRecord` (class) - missing @example
- `src/_generated/Runpod.generated.ts:828` `BillingRecords` (const) - missing @example
- `src/_generated/Runpod.generated.ts:850` `BillingRecords` (type) - missing @example
- `src/_generated/Runpod.generated.ts:858` `NetworkVolumeBillingRecord` (class) - missing @example
- `src/_generated/Runpod.generated.ts:877` `NetworkVolumeBillingRecords` (const) - missing @example
- `src/_generated/Runpod.generated.ts:897` `NetworkVolumeBillingRecords` (type) - missing @example
- `src/_generated/Runpod.generated.ts:905` `RUNPOD_ALLOWED_CUDA_VERSIONS_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:926` `RUNPOD_CPU_FLAVOR_IDS_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:934` `RUNPOD_CPU_FLAVOR_PRIORITY_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:942` `RUNPOD_CUDA_VERSIONS_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:950` `RUNPOD_DATA_CENTER_ID_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:985` `RUNPOD_DATA_CENTER_IDS_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1020` `RUNPOD_DATA_CENTER_PRIORITY_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1028` `RUNPOD_GPU_TYPE_ID_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1071` `RUNPOD_GPU_TYPE_IDS_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1129` `RUNPOD_GPU_TYPE_PRIORITY_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1137` `RUNPOD_MIN_CUDA_VERSION_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1158` `GetOpenAPIStatus200Response` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1170` `GetOpenAPIStatus200Response` (type) - missing @example
- `src/_generated/Runpod.generated.ts:1178` `GetDocsStatus200TextResponse` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1190` `GetDocsStatus200TextResponse` (type) - missing @example
- `src/_generated/Runpod.generated.ts:1198` `GetOpenAPIRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1211` `GetDocsRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1224` `ListPodsRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1254` `CreatePodRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1269` `GetPodRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1289` `UpdatePodRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1305` `DeletePodRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1320` `UpdatePodViaPostRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1336` `StartPodRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1351` `StopPodRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1366` `ResetPodRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1381` `RestartPodRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1396` `ListEndpointsRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1412` `CreateEndpointRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1427` `GetEndpointRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1444` `UpdateEndpointRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1460` `DeleteEndpointRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1475` `UpdateEndpointViaPostRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1493` `ListTemplatesRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1510` `CreateTemplateRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1525` `GetTemplateRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1543` `UpdateTemplateRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1559` `DeleteTemplateRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1574` `UpdateTemplateViaPostRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1592` `ListNetworkVolumesRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1605` `CreateNetworkVolumeRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1620` `GetNetworkVolumeRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1635` `UpdateNetworkVolumeRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1651` `DeleteNetworkVolumeRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1666` `UpdateNetworkVolumeViaPostRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1684` `ListContainerRegistryAuthsRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1699` `CreateContainerRegistryAuthRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1716` `GetContainerRegistryAuthRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1733` `DeleteContainerRegistryAuthRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1750` `PodBillingRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1770` `EndpointBillingRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1793` `NetworkVolumeBillingRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1810` `RunpodHttpMethod` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/_generated/Runpod.generated.ts:1818` `RunpodHttpMethod` (type) - missing @example
- `src/_generated/Runpod.generated.ts:1826` `RunpodOperationId` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/_generated/Runpod.generated.ts:1868` `RunpodOperationId` (type) - missing @example
- `src/_generated/Runpod.generated.ts:1876` `RunpodRequestBodyKind` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/_generated/Runpod.generated.ts:1884` `RunpodRequestBodyKind` (type) - missing @example
- `src/_generated/Runpod.generated.ts:1892` `RunpodResponseBodyKind` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/_generated/Runpod.generated.ts:1900` `RunpodResponseBodyKind` (type) - missing @example
- `src/_generated/Runpod.generated.ts:1908` `RunpodOperationDescriptor` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1932` `getOpenAPIOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1951` `getDocsOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1970` `listPodsOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2006` `createPodOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2025` `getPodOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2044` `updatePodOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2063` `deletePodOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2082` `updatePodViaPostOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2101` `startPodOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2120` `stopPodOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2139` `resetPodOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2158` `restartPodOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2177` `listEndpointsOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2196` `createEndpointOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2215` `getEndpointOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2234` `updateEndpointOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2253` `deleteEndpointOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2272` `updateEndpointViaPostOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2291` `listTemplatesOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2310` `createTemplateOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2329` `getTemplateOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2348` `updateTemplateOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2367` `deleteTemplateOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2386` `updateTemplateViaPostOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2405` `listNetworkVolumesOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2424` `createNetworkVolumeOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2443` `getNetworkVolumeOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2462` `updateNetworkVolumeOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2481` `deleteNetworkVolumeOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2500` `updateNetworkVolumeViaPostOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2519` `listContainerRegistryAuthsOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2538` `createContainerRegistryAuthOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2557` `getContainerRegistryAuthOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2576` `deleteContainerRegistryAuthOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2595` `podBillingOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2614` `endpointBillingOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2643` `networkVolumeBillingOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2662` `RUNPOD_OPERATION_SPECS` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2847` `RunpodOperationsShape` (interface) - missing @example
- `src/index.ts:14` `export * from "./_generated/Runpod.generated.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./Runpod.config.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./Runpod.docs.ts";` (re-export) - missing @example
- `src/index.ts:35` `export * from "./Runpod.errors.ts";` (re-export) - missing @example
- `src/index.ts:42` `export * from "./Runpod.service.ts";` (re-export) - missing @example
- `src/index.ts:50` `VERSION` (const) - missing @example
- `src/Runpod.config.ts:19` `RUNPOD_API_URL` (const) - missing @example
- `src/Runpod.config.ts:27` `RUNPOD_DOCS_INDEX_URL` (const) - missing @example
- `src/Runpod.config.ts:35` `RunpodConfigInput` (class) - missing @example
- `src/Runpod.config.ts:52` `RunpodDocsConfigInput` (class) - missing @example
- `src/Runpod.docs.ts:29` `RunpodDocsIndexEntry` (class) - missing @example
- `src/Runpod.docs.ts:47` `RunpodDocsIndex` (class) - missing @example
- `src/Runpod.docs.ts:170` `parseRunpodDocsIndex` (const) - missing @example
- `src/Runpod.docs.ts:266` `RunpodDocs` (class) - missing @example
- `src/Runpod.errors.ts:27` `RunpodErrorReason` (const) - missing @example
- `src/Runpod.errors.ts:45` `RunpodErrorReason` (type) - missing @example
- `src/Runpod.errors.ts:53` `RunpodDocsErrorReason` (const) - missing @example
- `src/Runpod.errors.ts:71` `RunpodDocsErrorReason` (type) - missing @example
- `src/Runpod.errors.ts:81` `RunpodError` (class) - missing @example
- `src/Runpod.errors.ts:163` `RunpodDocsError` (class) - missing @example
- `src/Runpod.errors.ts:202` `RunpodErrorOptions` (class) - missing @example
- `src/Runpod.errors.ts:218` `RunpodRawErrorOptions` (class) - missing @example
- `src/Runpod.errors.ts:237` `RunpodDocsErrorOptions` (class) - missing @example
- `src/Runpod.service.ts:31` `RunpodQueryScalar` (const) - missing @example
- `src/Runpod.service.ts:43` `RunpodQueryScalar` (type) - missing @example
- `src/Runpod.service.ts:54` `RunpodQueryValue` (const) - missing @example
- `src/Runpod.service.ts:66` `RunpodQueryValue` (type) - missing @example
- `src/Runpod.service.ts:74` `RunpodRawRequest` (class) - missing @example
- `src/Runpod.service.ts:94` `RunpodRawResponse` (class) - missing @example
- `src/Runpod.service.ts:112` `RunpodShape` (interface) - missing @example
- `src/Runpod.service.ts:804` `Runpod` (class) - missing @example

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
- `src/experimental/server/index.ts:5` `export * from "./DevToolsRelay.ts";` (re-export) - missing @example
- `src/experimental/server/index.ts:10` `export * from "./OtlpPacketLab.ts";` (re-export) - missing @example
- `src/index.ts:47` `export * from "./CauseDiagnostics.ts";` (re-export) - missing @example
- `src/index.ts:55` `export * from "./CoreConfig.ts";` (re-export) - missing @example
- `src/index.ts:63` `export * from "./HttpError.ts";` (re-export) - missing @example
- `src/index.ts:71` `export * from "./Logging.ts";` (re-export) - missing @example
- `src/index.ts:79` `export * from "./Metric.ts";` (re-export) - missing @example
- `src/index.ts:87` `export * from "./Observed.ts";` (re-export) - missing @example
- `src/index.ts:95` `export * from "./PhaseProfiler.ts";` (re-export) - missing @example
- `src/Metric.ts:189` `trackDuration` (const) - missing @example
- `src/Metric.ts:312` `observeWorkflow` (const) - missing @example
- `src/Metric.ts:443` `observeHttpRequest` (const) - missing @example
- `src/PhaseProfiler.ts:261` `profilePhase` (const) - missing @example
- `src/server/Config.ts:69` `toOtlpResource` (const) - 1 unsafe example violation(s)
- `src/server/HttpApiTelemetry.ts:265` `makeHttpApiTelemetryDescriptor` (const) - 1 unsafe example violation(s)
- `src/server/HttpApiTelemetry.ts:304` `httpApiFailureStatus` (const) - 1 unsafe example violation(s)
- `src/server/HttpApiTelemetry.ts:424` `observeHttpApiEffect` (const) - missing @example
- `src/server/HttpApiTelemetry.ts:583` `observeHttpApiHandler` (const) - missing @example
- `src/server/index.ts:5` `export * from "./Config.ts";` (re-export) - missing @example
- `src/server/index.ts:10` `export * from "./DevTools.ts";` (re-export) - missing @example
- `src/server/index.ts:15` `export * from "./ErrorReporting.ts";` (re-export) - missing @example
- `src/server/index.ts:20` `export * from "./HttpApiTelemetry.ts";` (re-export) - missing @example
- `src/server/index.ts:25` `export * from "./Layer.ts";` (re-export) - missing @example
- `src/server/index.ts:30` `export * from "./NodeSdk.ts";` (re-export) - missing @example
- `src/server/index.ts:35` `export * from "./Prometheus.ts";` (re-export) - missing @example
- `src/server/index.ts:40` `export * from "./TraceContext.ts";` (re-export) - missing @example
- `src/server/Layer.ts:29` `layerLocalLgtmServer` (const) - 1 unsafe example violation(s)
- `src/server/TraceContext.ts:93` `withIncomingTraceContext` (const) - missing @example
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

### @beep/canvas-use-cases

Path: `packages/canvas/use-cases`

Export findings:
- `src/aggregates/CanvasProject/CanvasProject.commands.ts:23` `CreateCanvasProjectCommand` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.commands.ts:40` `ArchiveCanvasProjectCommand` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.commands.ts:56` `AddCanvasNodeCommand` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.commands.ts:73` `RemoveCanvasNodeCommand` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.commands.ts:90` `GetCanvasProjectQuery` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.commands.ts:106` `ListCanvasProjectsQuery` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:22` `CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:30` `CANVAS_PROJECT_CONFLICT_REASON` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:38` `CanvasProjectNotFound` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:55` `CanvasProjectConflict` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:73` `CanvasProjectActionRejected` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:93` `CanvasProjectActionFailed` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:112` `CanvasProjectActionError` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:124` `CanvasProjectActionError` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/aggregates/CanvasProject/CanvasProject.repository.ts:23` `CanvasProjectRepositoryNotFound` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.repository.ts:42` `CanvasProjectRepositoryConflict` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.repository.ts:62` `CanvasProjectRepositoryUnavailable` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.repository.ts:81` `CanvasProjectRepositoryError` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.repository.ts:92` `CanvasProjectRepositoryShape` (interface) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.repository.ts:123` `CanvasProjectRepository` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.service.ts:50` `toCanvasProjectActionError` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.service.ts:96` `makeCanvasProjectUseCases` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.use-cases.ts:30` `CanvasProjectUseCasesShape` (interface) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.use-cases.ts:57` `CanvasProjectUseCases` (class) - missing @example
- `src/aggregates/CanvasProject/index.ts:7` `export * from "./CanvasProject.commands.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:14` `export * from "./CanvasProject.errors.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:21` `export * from "./CanvasProject.use-cases.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/server.ts:14` `export * from "./CanvasProject.repository.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/server.ts:21` `export { makeCanvasProjectUseCases, toCanvasProjectActionError } from "./CanvasProject.service.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/server.ts:28` `export * from "./index.js";` (re-export) - missing @example
- `src/index.ts:30` `export * from "./public.js";` (re-export) - missing @example
- `src/public.ts:7` `export * as CanvasProject from "./aggregates/CanvasProject/index.js";` (re-export) - missing @example
- `src/server.ts:7` `export * as CanvasProject from "./aggregates/CanvasProject/server.js";` (re-export) - missing @example

### @beep/hubspot

Path: `packages/drivers/hubspot`

Export findings:
- `src/index.ts:14` `export * from "./HubSpot.config.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./HubSpot.errors.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./HubSpot.service.ts";` (re-export) - missing @example

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
- `src/themes/theme-init-script.tsx:1` (none) - missing summary; missing @since
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
- `src/components/blocks/editor-00/editor.tsx:29` `Editor` (function) - missing @example
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
- `src/components/editor/editor-ui/content-editable.tsx:20` `ContentEditable` (function) - missing @example
- `src/components/editor/themes/editor-theme.ts:13` `editorTheme` (const) - missing @example
- `src/components/empty.tsx:10` `Empty` (function) - missing summary; missing @example
- `src/components/empty.tsx:100` `EmptyContent` (function) - missing summary; missing @example
- `src/components/empty.tsx:83` `EmptyDescription` (function) - missing summary; missing @example
- `src/components/empty.tsx:27` `EmptyHeader` (function) - missing summary; missing @example
- `src/components/empty.tsx:56` `EmptyMedia` (function) - missing summary; missing @example
- `src/components/empty.tsx:75` `EmptyTitle` (function) - missing summary; missing @example
- `src/components/field.tsx:88` `Field` (function) - missing summary; missing @example
- `src/components/field.tsx:108` `FieldContent` (function) - missing summary; missing @example
- `src/components/field.tsx:157` `FieldDescription` (function) - missing summary; missing @example
- `src/components/field.tsx:208` `FieldError` (function) - missing summary; missing @example
- `src/components/field.tsx:56` `FieldGroup` (function) - missing summary; missing @example
- `src/components/field.tsx:122` `FieldLabel` (function) - missing summary; missing @example
- `src/components/field.tsx:37` `FieldLegend` (function) - missing summary; missing @example
- `src/components/field.tsx:176` `FieldSeparator` (function) - missing summary; missing @example
- `src/components/field.tsx:20` `FieldSet` (function) - missing summary; missing @example
- `src/components/field.tsx:140` `FieldTitle` (function) - missing summary; missing @example
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
- `src/components/knowledge-graph.tsx:18` `GraphNode` (interface) - missing summary; missing @example
- `src/components/knowledge-graph.tsx:37` `GraphLink` (interface) - missing summary; missing @example
- `src/components/knowledge-graph.tsx:71` `KnowledgeGraphHandle` (interface) - missing summary; missing @example
- `src/components/knowledge-graph.tsx:112` `KnowledgeGraph` (const) - missing summary; missing @example
- `src/components/knowledge-graph.tsx:112` `default` (const) - missing summary; missing @example
- `src/components/label.tsx:10` `Label` (function) - missing summary; missing @example
- `src/components/link-preview.tsx:112` `LinkPreview` (function) - missing summary; missing @example
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
- `src/components/notification-card.tsx:133` `NotificationCard` (function) - missing summary; missing @example
- `src/components/notification-card.tsx:24` `NotificationStatus` (type) - missing summary; missing @example
- `src/components/notification-card.tsx:30` `ActionType` (const) - missing summary; missing @example
- `src/components/notification-card.tsx:40` `ActionType` (type) - missing summary; missing @example
- `src/components/notification-card.tsx:46` `ActionStyle` (const) - missing summary; missing @example
- `src/components/notification-card.tsx:55` `ActionStyle` (type) - missing summary; missing @example
- `src/components/notification-card.tsx:68` `NotificationAction` (const) - missing summary; missing @example
- `src/components/notification-card.tsx:83` `NotificationAction` (type) - missing summary; missing @example
- `src/components/orb.tsx:45` `Orb` (function) - missing summary; missing @example
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
- `src/components/sidebar.tsx:184` `Sidebar` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:449` `SidebarContent` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:425` `SidebarFooter` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:466` `SidebarGroup` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:494` `SidebarGroupAction` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:514` `SidebarGroupContent` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:476` `SidebarGroupLabel` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:415` `SidebarHeader` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:401` `SidebarInput` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:383` `SidebarInset` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:522` `SidebarMenu` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:611` `SidebarMenuAction` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:642` `SidebarMenuBadge` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:567` `SidebarMenuButton` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:530` `SidebarMenuItem` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:664` `SidebarMenuSkeleton` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:692` `SidebarMenuSub` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:718` `SidebarMenuSubButton` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:710` `SidebarMenuSubItem` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:72` `SidebarProvider` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:355` `SidebarRail` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:439` `SidebarSeparator` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:330` `SidebarTrigger` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:43` `useSidebar` (function) - missing summary; missing @example
- `src/components/skeleton.tsx:7` `Skeleton` (function) - missing summary; missing @example
- `src/components/slider.tsx:12` `Slider` (function) - missing summary; missing @example
- `src/components/sonner.tsx:12` `Toaster` (const) - missing summary; missing @example
- `src/components/speech-input.tsx:141` `SpeechInput` (const) - missing summary; missing @example
- `src/components/speech-input.tsx:406` `SpeechInputCancelButton` (const) - missing summary; missing @example
- `src/components/speech-input.tsx:357` `SpeechInputPreview` (const) - missing summary; missing @example
- `src/components/speech-input.tsx:300` `SpeechInputRecordButton` (const) - missing summary; missing @example
- `src/components/speech-input.tsx:55` `useSpeechInput` (function) - missing summary; missing @example
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
- `src/components/toaster.tsx:21` `Toaster` (function) - missing summary; missing @example
- `src/components/todo-item.tsx:93` `TodoItem` (function) - missing summary; missing @example
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
- `src/components/tour.tsx:43` `Step` (interface) - missing summary; missing @example
- `src/components/tour.tsx:62` `Tour` (interface) - missing summary; missing @example
- `src/components/tour.tsx:71` `TourProvider` (function) - missing summary; missing @example
- `src/components/tour.tsx:34` `useTour` (function) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:9` `default` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:39` `Default` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:55` `Outline` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:63` `Secondary` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:71` `Ghost` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:79` `Destructive` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:87` `Link` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:95` `Small` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:103` `Large` (const) - missing summary; missing @example
- `src/components/ui/button.stories.tsx:111` `ClickInteraction` (const) - missing summary; missing @example
- `src/components/ui/button.tsx:64` `Button` (function) - missing @example
- `src/components/ui/button.tsx:20` `buttonVariants` (const) - missing @example
- `src/components/ui/tooltip.tsx:21` `Tooltip` (function) - missing summary; missing @example
- `src/components/ui/tooltip.tsx:37` `TooltipContent` (function) - missing summary; missing @example
- `src/components/ui/tooltip.tsx:13` `TooltipProvider` (function) - missing @example
- `src/components/ui/tooltip.tsx:29` `TooltipTrigger` (function) - missing summary; missing @example
- `src/hooks/index.ts:13` `export * from "./use-scribe.ts";` (re-export) - missing @example
- `src/hooks/index.ts:18` `export * from "./useNumberInput.ts";` (re-export) - missing @example
- `src/hooks/use-scribe.ts:141` `useScribe` (function) - missing @example
- `src/hooks/use-scribe.ts:42` `ScribeStatus` (type) - missing @example
- `src/hooks/useMobile.ts:32` `useIsMobile` (function) - missing @example
- `src/hooks/useMobile.ts:24` `resolveIsMobile` (const) - missing @example
- `src/hooks/useNumberInput.ts:212` `minSafeInteger` (const) - missing @example
- `src/hooks/useNumberInput.ts:220` `maxSafeInteger` (const) - missing @example
- `src/hooks/useNumberInput.ts:228` `BoundaryParams` (class) - missing @example
- `src/hooks/useNumberInput.ts:246` `SpinParams` (class) - missing @example
- `src/hooks/useNumberInput.ts:376` `NumberInputEventType` (const) - missing @example
- `src/hooks/useNumberInput.ts:388` `NumberInputEventType` (type) - missing @example
- `src/hooks/useNumberInput.ts:396` `NumberInputError` (const) - missing @example
- `src/hooks/useNumberInput.ts:408` `NumberInputError` (type) - missing @example
- `src/hooks/useNumberInput.ts:416` `NumberInputChangeMetadata` (class) - missing @example
- `src/hooks/useNumberInput.ts:454` `UseNumberInputOptions` (type) - missing @example
- `src/hooks/useNumberInput.ts:519` `useNumberBoundary` (const) - missing @example
- `src/hooks/useNumberInput.ts:595` `useNumberInput` (const) - missing @example
- `src/hooks/useSpinner.ts:134` `useSpinner` (function) - missing @example
- `src/index.ts:21` `VERSION` (const) - missing summary; missing @example
- `src/lib/index.ts:5` `export * from "./url.ts";` (re-export) - missing @example
- `src/lib/index.ts:10` `export * from "./utils.ts";` (re-export) - missing @example
- `src/lib/react-invariant.ts:20` `ReactContextInvariantOptions` (class) - missing @example
- `src/lib/toaster.ts:16` `globalToastManager` (const) - missing @example
- `src/lib/url.ts:85` `sanitizeAnchorHref` (const) - missing @example
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
- `src/themes/index.ts:17` `export * from "./theme-init-script.tsx";` (re-export) - missing @example
- `src/themes/index.ts:22` `export * from "./theme-provider.tsx";` (re-export) - missing @example
- `src/themes/index.ts:27` `export type * from "./types.ts";` (re-export) - missing @example
- `src/themes/scales.ts:7` `CONTROL_HEIGHTS` (const) - missing @example
- `src/themes/scales.ts:19` `CONTROL_TOUCH_HEIGHTS` (const) - missing @example
- `src/themes/scales.ts:35` `TOUCH_MEDIA_QUERY` (const) - missing @example
- `src/themes/scales.ts:44` `SWITCH_SIZES` (const) - missing @example
- `src/themes/scales.ts:56` `SWITCH_TOUCH_SIZES` (const) - missing @example
- `src/themes/shadows.ts:9` `shadows` (const) - missing @example
- `src/themes/theme-init-script.tsx:12` `AppThemeInitScript` (function) - missing @example
- `src/themes/theme-provider.tsx:97` `AppThemeProvider` (function) - missing @example
- `src/themes/theme-provider.tsx:116` `useThemeMode` (function) - missing @example
- `src/themes/theme-provider.tsx:26` `ThemeMode` (const) - missing @example
- `src/themes/theme-provider.tsx:38` `ThemeMode` (type) - missing @example
- `src/themes/theme-provider.tsx:46` `ResolvedThemeMode` (const) - missing @example
- `src/themes/theme-provider.tsx:58` `ResolvedThemeMode` (type) - missing @example
- `src/themes/theme-provider.tsx:79` `resolveThemeMode` (const) - missing @example
- `src/themes/theme.ts:34` `themeOptions` (const) - missing @example
- `src/themes/theme.ts:74` `createAppTheme` (const) - missing @example
- `src/themes/theme.ts:82` `theme` (const) - missing @example
- `src/themes/types.ts:9` `ThemeOptions` (type) - missing @example
- `src/themes/types.ts:17` `ThemeComponents` (type) - missing @example
- `src/themes/typography.ts:89` `typography` (const) - missing @example
- `src/themes/typography.ts:113` `typographyTheme` (const) - missing @example
- `src/types/component.ts:18` `OverridableComponent` (type) - missing summary; missing @example
- `src/types/component.ts:33` `ForwardStyledProps` (type) - missing summary; missing @example
- `src/types/index.ts:5` `export * from "./component";` (re-export) - missing @example

### @beep/sanity

Path: `packages/drivers/sanity`

Export findings:
- `src/index.ts:14` `export * from "./Sanity.config.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./Sanity.errors.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./Sanity.service.ts";` (re-export) - missing @example

### @beep/installer-server

Path: `packages/installer/server`

Export findings:
- `src/index.ts:23` `export * from "./Layer.js";` (re-export) - missing @example
- `src/index.ts:15` `VERSION` (const) - missing @example
- `src/Layer.ts:321` `makeHostDependencyServer` (const) - missing @example
- `src/Layer.ts:338` `makeSecretReferenceServer` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/Layer.ts:393` `makeProviderAccountServer` (const) - missing @example
- `src/Layer.ts:435` `makeDiscordChannelServer` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/Layer.ts:492` `makeStackManifestServer` (const) - missing @example
- `src/Layer.ts:506` `makeP1ManualProofWorkflow` (const) - missing @example
- `src/Layer.ts:669` `HostDependencyServerLive` (const) - missing @example
- `src/Layer.ts:677` `SecretReferenceServerLive` (const) - missing @example
- `src/Layer.ts:685` `ProviderAccountServerLive` (const) - missing @example
- `src/Layer.ts:693` `DiscordChannelServerLive` (const) - missing @example
- `src/Layer.ts:701` `StackManifestServerLive` (const) - missing @example
- `src/Layer.ts:709` `InstallerConceptServerLive` (const) - missing @example
- `src/Layer.ts:723` `P1ManualProofWorkflowLive` (const) - missing @example
- `src/Layer.ts:731` `InstallerServerLive` (const) - missing @example
- `src/Layer.ts:739` `runP1ManualProof` (const) - missing @example
- `src/Layer.ts:752` `previewP1ManualProof` (const) - missing @example
- `src/test.ts:17` `InstallerServerTest` (const) - missing @example

### @beep/agent-capability-use-cases

Path: `packages/agent-capability/use-cases`

Export findings:
- `src/processes/ProfessionalRuntime/index.ts:80` `export type { ProfessionalRuntimeSdk } from "./ProfessionalRuntime.service.js";` (re-export) - 1 unsafe example violation(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.fixtures.ts:56` `RuntimeFixtureInput` (class) - 1 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.service.ts:27` `ProfessionalRuntimeSdk` (interface) - 1 unsafe example violation(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:23` `RuntimeCandidateLifecycle` (const) - 2 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:38` `RuntimeClaimConfidence` (const) - 2 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:53` `RuntimeApprovalDecision` (const) - 2 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:68` `RuntimeRequestKind` (const) - 2 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:83` `RuntimeSourceKind` (const) - 2 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:98` `RuntimeActivityType` (const) - 2 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:113` `RuntimeUsageMode` (const) - 2 schema annotation/type-alias gap(s)
- `src/public.ts:78` `export type { ProfessionalRuntimeSdk } from "./processes/ProfessionalRuntime/ProfessionalRuntime.service.js";` (re-export) - 1 unsafe example violation(s)

### @beep/architecture-lab-ui

Path: `packages/architecture-lab/ui`

Export findings:
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.view-model.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/WorkItem.view-model.ts:27` `WorkItemVisibleAction` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.view-model.ts:40` `WorkItemVisibleAction` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.view-model.ts:48` `WorkItemSummaryViewModel` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.view-model.ts:87` `toWorkItemSummaryViewModel` (const) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example

### @beep/architecture-lab-server

Path: `packages/architecture-lab/server`

Export findings:
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.http.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:14` `export * from "./WorkItem.layer.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:21` `export * from "./WorkItem.repo.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:28` `export * from "./WorkItem.rpc.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:35` `export * from "./WorkItem.tools.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/WorkItem.http.ts:30` `WorkItemHttpStatus` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.http.ts:43` `WorkItemHttpStatus` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.http.ts:51` `WorkItemHttpResponse` (class) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/aggregates/WorkItem/WorkItem.http.ts:68` `toWorkItemHttpError` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.http.ts:92` `makeWorkItemHttpHandlers` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:24` `makeWorkItemServer` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:35` `WorkItemServer` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:45` `WorkItemServerLayer` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.repo.ts:44` `makeInMemoryWorkItemRepository` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.repo.ts:127` `makeDrizzleWorkItemRepository` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.repo.ts:185` `makeWorkItemRepository` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.rpc.ts:17` `makeWorkItemRpcHandlers` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.tools.ts:17` `WorkItemToolNames` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.tools.ts:33` `makeWorkItemToolHandlers` (const) - missing @example
- `src/entities/index.ts:15` `export * as Worker from "./Worker/index.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:7` `export * from "./Worker.layer.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:14` `export * from "./Worker.repo.js";` (re-export) - missing @example
- `src/entities/Worker/Worker.layer.ts:23` `makeWorkerServer` (const) - missing @example
- `src/entities/Worker/Worker.layer.ts:34` `WorkerServer` (class) - missing @example
- `src/entities/Worker/Worker.layer.ts:44` `WorkerServerLayer` (const) - missing @example
- `src/entities/Worker/Worker.repo.ts:43` `makeInMemoryWorkerRepository` (const) - missing @example
- `src/entities/Worker/Worker.repo.ts:118` `makeDrizzleWorkerRepository` (const) - missing @example
- `src/entities/Worker/Worker.repo.ts:160` `makeWorkerRepository` (const) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as Worker from "./entities/Worker/index.js";` (re-export) - missing @example
- `src/index.ts:44` `export * from "./Layer.js";` (re-export) - missing @example
- `src/Layer.ts:21` `ArchitectureLabServerLive` (const) - missing @example
- `src/test.ts:21` `ArchitectureLabServerTest` (const) - missing @example

### @beep/workspace-tables

Path: `packages/workspace/tables`

Export findings:
- `src/index.ts:29` `export { DbSchema } from "./Schema.ts";` (re-export) - missing @example
- `src/Schema.ts:39` `DbSchema` (type) - missing @example

### @beep/db-admin

Path: `packages/_internal/db-admin`

Export findings:
- `src/index.ts:29` `export * from "./targets.js";` (re-export) - missing @example
- `src/migrations/ArchitectureLab.ts:23` `DbAdminMigrationTarget` (class) - missing @example
- `src/migrations/ArchitectureLab.ts:42` `ArchitectureLabMigrationTarget` (const) - missing @example
- `src/schema.ts:9` `export * from "@beep/architecture-lab-tables/tables";` (re-export) - missing @example
- `src/targets.ts:27` `DbAdminMigrationTargets` (const) - missing @example
- `src/targets.ts:35` `listDbAdminMigrationTargets` (const) - missing @example

### @beep/architecture-lab-client

Path: `packages/architecture-lab/client`

Export findings:
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.client.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/WorkItem.client.ts:22` `WorkItemClientTransport` (interface) - missing @example
- `src/aggregates/WorkItem/WorkItem.client.ts:52` `WorkItemClientShape` (interface) - missing @example
- `src/aggregates/WorkItem/WorkItem.client.ts:60` `WorkItemClient` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.client.ts:68` `makeWorkItemClient` (const) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example

### @beep/repo-cli

Path: `packages/tooling/tool/cli`

Export findings:
- `src/commands/AIDocs/AIDocs.ts:23` `AIDocsError` (class) - missing @example
- `src/commands/AIDocs/AIDocs.ts:37` `AIDocKind` (const) - missing @example
- `src/commands/AIDocs/AIDocs.ts:87` `AIDocKind` (type) - missing @example
- `src/commands/Architecture/index.ts:7` `export * from "./Command.js";` (re-export) - missing @example
- `src/commands/Architecture/index.ts:14` `export * from "./OperationPlan.js";` (re-export) - missing @example
- `src/commands/Architecture/index.ts:21` `export * from "./OperationPlanExecution.js";` (re-export) - missing @example
- `src/commands/Architecture/OperationPlan.ts:26` `ArchitectureDomainKind` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:38` `ArchitectureDomainKind` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:46` `ArchitecturePlanStage` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:58` `ArchitecturePlanStage` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:66` `ArchitectureSliceRole` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:88` `ArchitectureSliceRole` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:177` `ArchitectureWriterKind` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:195` `ArchitectureWriterKind` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:391` `ArchitectureSliceRolePlan` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:409` `ArchitecturePlanTarget` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:428` `WriteFileOperation` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:498` `EnsureFileOperation` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:520` `EnsureAbsentPathOperation` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:541` `ArchitectureOperation` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/commands/Architecture/OperationPlan.ts:554` `ArchitectureOperation` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:592` `CanonicalSliceOperationPlan` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:629` `OperationPlanCheckResult` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:650` `OperationPlanApplyResult` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:2158` `makeCanonicalSliceOperationPlan` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:2203` `makeArchitectureOperationPlan` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:2311` `encodeCanonicalSliceOperationPlanJson` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:2319` `decodeCanonicalSliceOperationPlanJson` (const) - missing @example
- `src/commands/Architecture/OperationPlanPackageJson.ts:64` `renderPackageJsonOperation` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:39` `ConfigUpdateResult` (class) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:56` `ConfigUpdateTarget` (class) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:74` `ConfigUpdateTargetResult` (class) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:97` `ConfigUpdateBatchResult` (class) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:323` `updateTsconfigPackages` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:364` `updateTsconfigPaths` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:418` `updateTstycheConfig` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:528` `updateRootConfigsForTargets` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:570` `checkConfigNeedsUpdateForTargets` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:614` `updateRootConfigs` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:642` `checkConfigNeedsUpdate` (const) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:85` `PlannedFile` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:101` `PlannedSymlink` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:117` `FileGenerationPlanInput` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:135` `GenerationActionKind` (const) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:146` `GenerationActionKind` (type) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:187` `GenerationAction` (const) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:211` `GenerationAction` (type) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:219` `FileGenerationPlan` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:235` `FileGenerationExecutionResult` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:256` `FileGenerationPlanServiceShape` (type) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:270` `FileGenerationPlanService` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:469` `createFileGenerationPlanService` (const) - missing @example
- `src/commands/CreatePackage/Handler.ts:75` `resolveCreatePackageTemplateDir` (const) - missing @example
- `src/commands/CreatePackage/Handler.ts:265` `TemplateContext` (class) - missing @example
- `src/commands/CreatePackage/Handler.ts:552` `createPackageCommand` (const) - missing @example
- `src/commands/CreatePackage/index.ts:16` `createPackageCommand` (const) - missing @example
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
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:184` `TsMorphMutationOutcome` (type) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:192` `TsMorphIntegrationResult` (class) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:209` `TsMorphMutationAdapter` (type) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:219` `TsMorphIntegrationServiceShape` (type) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:232` `TsMorphIntegrationService` (class) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:256` `createTsMorphIntegrationService` (const) - missing @example
- `src/commands/Docgen/index.ts:1170` `docgenCommand` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:84` `DocgenPackageStatus` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:99` `DocgenPackageStatus` (type) - missing @example
- `src/commands/Docgen/internal/Operations.ts:113` `DocgenConfigDocument` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:142` `DocgenWorkspacePackage` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:163` `DocgenIssuePriority` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:174` `DocgenIssuePriority` (type) - missing @example
- `src/commands/Docgen/internal/Operations.ts:182` `DocgenExportKind` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:203` `DocgenExportKind` (type) - missing @example
- `src/commands/Docgen/internal/Operations.ts:211` `DocgenExportAnalysis` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:237` `DocgenAnalysisSummary` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:258` `DocgenPackageAnalysis` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:277` `DocgenGenerationResult` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:297` `DocgenAggregateResult` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1127` `normalizeDocsOutputPath` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1138` `loadDocgenConfigDocument` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1166` `createDocgenConfigDocument` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1209` `discoverDocgenWorkspacePackages` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1251` `resolveDocgenWorkspacePackage` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1303` `analyzePackageDocumentation` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1347` `generateAnalysisReport` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1468` `generateAnalysisJson` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1478` `aggregateGeneratedDocs` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1629` `runDocgenForPackage` (const) - missing @example
- `src/commands/Files/Files.command.ts:447` `filesCommand` (const) - missing @example
- `src/commands/Files/Files.errors.ts:54` `formatPlatformError` (const) - missing @example
- `src/commands/Files/Files.errors.ts:74` `failOnExtensionlessFile` (const) - missing @example
- `src/commands/Files/Files.progress.ts:23` `FilesConcurrency` (const) - missing @example
- `src/commands/Files/Files.progress.ts:73` `isFilesProgressEnabled` (const) - missing @example
- `src/commands/Files/Files.progress.ts:83` `renderFilesProgressBar` (const) - missing @example
- `src/commands/Files/Files.progress.ts:104` `runFilesProgressAll` (const) - missing @example
- `src/commands/Files/Files.progress.ts:172` `runFilesProgressForEach` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:25` `PositiveMediaDimension` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:53` `PositiveMediaDimension` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:61` `FileSha256Hash` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:80` `FileSha256Hash` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:88` `NonNegativePixelOffset` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:116` `NonNegativePixelOffset` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:124` `MediaKind` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:136` `MediaKind` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:144` `SupportedMetadataImageExtension` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:164` `SupportedMetadataImageExtension` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:172` `NormalizeImageFormatInput` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:184` `NormalizeImageFormatInput` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:192` `NormalizeImageFormat` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:204` `NormalizeImageFormat` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:212` `NormalizeSkippedReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:232` `NormalizeSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:240` `CreateCaptionFilesSkippedReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:261` `CreateCaptionFilesSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:269` `BorderSide` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:281` `BorderSide` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:289` `BorderDetectionKind` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:308` `BorderDetectionKind` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:316` `DetectBordersSkippedReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:336` `DetectBordersSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:344` `DetectFacesSkippedReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:365` `DetectFacesSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:373` `DetectFacesFlag` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:391` `DetectFacesFlag` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:399` `CandidateAssessmentProfile` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:411` `CandidateAssessmentProfile` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:419` `CandidateAssessmentDecision` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:431` `CandidateAssessmentDecision` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:439` `CandidateAssessmentReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:455` `CandidateAssessmentReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:463` `ArchivePoorCandidatesSkippedReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:483` `ArchivePoorCandidatesSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:491` `CandidateRatioThreshold` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:510` `CandidateRatioThreshold` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:518` `BorderDetectionPercentage` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:552` `BorderDetectionPercentage` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:560` `BorderDetectionMaxScanPercentage` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:594` `BorderDetectionMaxScanPercentage` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:602` `BorderDetectionTolerance` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:636` `BorderDetectionTolerance` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:644` `RgbChannel` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:678` `RgbChannel` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:686` `ImageSizeMetadata` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:703` `FfprobeSideData` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:718` `FfprobeStream` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:736` `FfprobeOutput` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:751` `SafeFilePrefix` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:797` `SafeFilePrefix` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:838` `RenamePlanEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:863` `SortAndRenameSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:915` `StripMetadataSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:959` `CreateCaptionFilesOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:977` `CreateCaptionFilesPlanEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:999` `CreateCaptionFilesSkippedEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1021` `CreateCaptionFilesPlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1040` `CreateCaptionFilesSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1060` `NormalizeFilesOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1085` `NormalizeManifestOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1104` `NormalizePlanEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1132` `NormalizeSkippedEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1156` `NormalizePlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1177` `NormalizeSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1206` `NormalizeManifestSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1226` `NormalizeManifest` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1248` `ArchivePoorCandidatesOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1275` `ArchivePoorCandidatesManifestOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1298` `CandidateAssessmentMetrics` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1316` `ArchivedSidecarEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1335` `ArchivePoorCandidatesEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1362` `ArchivePoorCandidatesSkippedEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1383` `ArchivePoorCandidatesPlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1403` `ArchivePoorCandidatesSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1429` `ArchivePoorCandidatesManifestSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1450` `ArchivePoorCandidatesManifest` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1474` `DetectBordersOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1494` `DetectFacesOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1516` `DetectFacesReportOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1537` `CropBordersOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1557` `RgbColor` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1574` `DetectBorderSideMeasurement` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1595` `DetectBordersEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1618` `DetectBordersSkippedEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1637` `DetectBordersSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1656` `DetectBordersReport` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1676` `DetectFacesEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1704` `DetectFacesSkippedEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1723` `DetectFacesSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1745` `DetectFacesReport` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1767` `CropBordersPlanEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1793` `CropBordersPlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1812` `CropBordersSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1833` `SortableFileCollection` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1849` `RenamePlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1865` `StripMetadataPlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1883` `decodeImageSizeMetadata` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1891` `decodeFfprobeOutputJson` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1899` `decodeRotationNumber` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/commands/Files/Files.schemas.ts:1907` `decodeSafeFilePrefix` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1915` `decodeNormalizeMaxLongEdge` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1923` `decodeArchivePoorCandidatesOptions` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1931` `decodeCreateCaptionFilesOptions` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1939` `decodeDetectBordersOptions` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1946` `decodeDetectFacesOptions` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1954` `decodeCropBordersOptions` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1962` `encodeNormalizeManifest` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1970` `encodeArchivePoorCandidatesManifest` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1978` `encodeDetectBordersReport` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1985` `encodeDetectFacesReport` (const) - missing @example
- `src/commands/Files/Files.service.ts:206` `FilesCommandServiceShape` (interface) - missing @example
- `src/commands/Files/Files.service.ts:279` `FilesCommandService` (class) - missing @example
- `src/commands/Files/Files.service.ts:3594` `printFilesIndex` (const) - missing @example
- `src/commands/Files/Files.service.ts:4354` `FilesCommandServiceLive` (const) - missing @example
- `src/commands/Files/Files.service.ts:4365` `archivePoorCandidates` (const) - missing @example
- `src/commands/Files/Files.service.ts:4380` `createCaptionFiles` (const) - missing @example
- `src/commands/Files/Files.service.ts:4395` `cropBordersFiles` (const) - missing @example
- `src/commands/Files/Files.service.ts:4410` `detectBordersFiles` (const) - missing @example
- `src/commands/Files/Files.service.ts:4425` `detectFacesFiles` (const) - missing @example
- `src/commands/Files/Files.service.ts:4440` `normalizeFiles` (const) - missing @example
- `src/commands/Files/Files.service.ts:4458` `sortAndRenameFiles` (const) - missing @example
- `src/commands/Files/Files.utils.ts:221` `stringEquivalence` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/commands/Files/Files.utils.ts:229` `isImageFileExtension` (const) - missing @example
- `src/commands/Files/Files.utils.ts:237` `isVideoFileExtension` (const) - missing @example
- `src/commands/Files/Files.utils.ts:245` `isSupportedMetadataImageExtension` (const) - missing @example
- `src/commands/Files/Files.utils.ts:253` `bySizeDescendingThenNameAscending` (const) - missing @example
- `src/commands/Files/Files.utils.ts:264` `byNameAscending` (const) - missing @example
- `src/commands/Files/Files.utils.ts:277` `normalizeBareExtension` (const) - missing @example
- `src/commands/Files/Files.utils.ts:287` `mediaKindFromExtension` (const) - missing @example
- `src/commands/Files/Files.utils.ts:310` `formatIndex` (const) - missing @example
- `src/commands/Files/Files.utils.ts:323` `collectText` (const) - missing @example
- `src/commands/Files/Files.utils.ts:341` `isExifOrientationRotated` (const) - missing @example
- `src/commands/Files/Files.utils.ts:351` `isQuarterTurnRotation` (const) - missing @example
- `src/commands/Files/Files.utils.ts:365` `maybeSwapDimensions` (const) - missing @example
- `src/commands/Files/Files.utils.ts:387` `rotationFromStream` (const) - missing @example
- `src/commands/Files/Files.utils.ts:408` `targetNameForEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:432` `hasSkippedFiles` (const) - missing @example
- `src/commands/Files/Files.utils.ts:442` `selectedCanonicalPathSet` (const) - missing @example
- `src/commands/Files/Files.utils.ts:458` `renderPlanEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:468` `renderStripMetadataPlanEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:479` `renderCreateCaptionFilesPlanEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:490` `renderCreateCaptionFilesSkippedEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:501` `renderNormalizePlanEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:512` `renderNormalizeSkippedEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:523` `normalizeOutputExtension` (const) - missing @example
- `src/commands/Files/Files.utils.ts:533` `sharpFormatForNormalize` (const) - missing @example
- `src/commands/Files/Files.utils.ts:545` `normalizeOutputDimensions` (const) - missing @example
- `src/commands/Files/Files.utils.ts:574` `mediaDimensionsChanged` (const) - missing @example
- `src/commands/Files/Files.utils.ts:590` `roundCandidateMetric` (const) - missing @example
- `src/commands/Files/Files.utils.ts:601` `assessImageCandidate` (const) - missing @example
- `src/commands/Files/Files.utils.ts:645` `renderArchivePoorCandidatesEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:662` `renderArchivePoorCandidatesSkippedEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:673` `rgbToHex` (const) - missing @example
- `src/commands/Files/Files.utils.ts:684` `classifyBorderSides` (const) - missing @example
- `src/commands/Files/Files.utils.ts:730` `analyzeSolidBorders` (const) - missing @example
- `src/commands/Files/Files.utils.ts:747` `renderDetectBordersEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:766` `renderDetectBordersSkippedEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:777` `renderDetectFacesEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:800` `renderDetectFacesSkippedEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:820` `cropBordersPlanEntryFromDetection` (const) - missing @example
- `src/commands/Files/Files.utils.ts:858` `renderCropBordersPlanEntry` (const) - missing @example
- `src/commands/Files/Files.utils.ts:871` `makeStripMetadataTempEntries` (const) - missing @example
- `src/commands/Files/Files.utils.ts:896` `isSupportedMetadataImageFile` (const) - missing @example
- `src/commands/Files/index.ts:15` `export * from "./Files.command.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:22` `export * from "./Files.errors.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:29` `export * from "./Files.progress.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:36` `export * from "./Files.schemas.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:43` `export * from "./Files.service.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:50` `export * from "./Files.utils.js";` (re-export) - missing @example
- `src/commands/Graphiti/internal/ProxyServices.ts:55` `ContainerHealthState` (const) - 1 schema annotation/type-alias gap(s)
- `src/commands/Graphiti/internal/ProxyServices.ts:71` `DependencyHealthState` (const) - 1 schema annotation/type-alias gap(s)
- `src/commands/Quality/internal/Config.ts:22` `configStringOptionSync` (const) - missing @example
- `src/commands/Quality/internal/Config.ts:35` `configStringEqualsSync` (const) - missing @example
- `src/commands/Quality/internal/Config.ts:54` `configStringOption` (const) - missing @example
- `src/commands/Quality/Tasks.ts:874` `sqlIntegrationStepForTesting` (const) - missing @example
- `src/commands/Quality/Tasks.ts:888` `runSqlIntegrationTestLaneForTesting` (const) - missing @example
- `src/commands/Quality/Tasks.ts:897` `sqlIntegrationConnectionUriFromEnvForTesting` (const) - missing @example
- `src/commands/Quality/Tasks.ts:1054` `rootQualityStepsForTesting` (const) - missing @example
- `src/commands/Quality/Tasks.ts:1309` `runQualityTaskStepGroupForTesting` (const) - missing @example
- `src/commands/Reuse/index.ts:517` `reuseCommand` (const) - missing @example
- `src/commands/Reuse/internal/CodexRunner.ts:23` `CodexRunnerStage` (const) - missing @example
- `src/commands/Reuse/internal/CodexRunner.ts:37` `CodexRunnerStage` (type) - missing @example
- `src/commands/Reuse/internal/CodexRunner.ts:45` `CodexSmokeResult` (class) - missing @example
- `src/commands/Reuse/internal/CodexRunner.ts:64` `CodexRunnerError` (class) - missing @example
- `src/commands/Reuse/internal/CodexRunner.ts:83` `runCodexSmoke` (const) - missing @example
- `src/commands/SyncDataToTs/index.ts:460` `syncDataToTsCommand` (const) - missing @example
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
- `src/commands/SyncDataToTs/targets/index.ts:16` `syncDataTargets` (const) - missing @example
- `src/commands/SyncDataToTs/targets/Iso4217.ts:27` `ISO4217_SOURCE_URL` (const) - missing @example
- `src/commands/SyncDataToTs/targets/Iso4217.ts:283` `iso4217Target` (const) - missing @example
- `src/commands/TsconfigSync.ts:51` `export {
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
- `src/commands/TsconfigSync.ts:151` `TsconfigSyncDriftError` (class) - missing @example
- `src/commands/TsconfigSync.ts:169` `TsconfigSyncCycleError` (class) - missing @example
- `src/commands/TsconfigSync.ts:187` `TsconfigSyncFilterError` (class) - missing @example
- `src/commands/TsconfigSync.ts:212` `TsconfigSyncMode` (const) - missing @example
- `src/commands/TsconfigSync.ts:266` `TsconfigSyncRunOptions` (const) - missing @example
- `src/commands/TsconfigSync.ts:285` `TsconfigSyncRunOptions` (type) - missing @example
- `src/commands/TsconfigSync.ts:293` `TsconfigSyncSection` (const) - missing @example
- `src/commands/TsconfigSync.ts:313` `TsconfigSyncSection` (type) - missing @example
- `src/commands/TsconfigSync.ts:399` `TsconfigSyncChange` (const) - missing @example
- `src/commands/TsconfigSync.ts:423` `TsconfigSyncChange` (type) - missing @example
- `src/commands/TsconfigSync.ts:524` `PlannedFileChange` (const) - missing @example
- `src/commands/TsconfigSync.ts:548` `PlannedFileChange` (type) - missing @example
- `src/commands/TsconfigSync.ts:590` `TsconfigSyncResult` (const) - missing @example
- `src/commands/TsconfigSync.ts:606` `TsconfigSyncResult` (type) - missing @example
- `src/commands/TsconfigSync.ts:622` `WorkspaceDescriptor` (class) - missing @example
- `src/commands/TsconfigSync.ts:673` `TsconfigWithReferences` (class) - missing @example
- `src/commands/TsconfigSync.ts:688` `TsconfigWithPaths` (class) - missing @example
- `src/commands/TsconfigSync.ts:1697` `syncTsconfigAtRoot` (const) - missing @example
- `src/commands/TsconfigSync.ts:1832` `tsconfigSyncCommand` (const) - missing @example
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
- `src/commands/VersionSync/internal/resolvers/BiomeResolver.ts:147` `BiomeSchemaState` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/BiomeResolver.ts:167` `resolveBiomeSchema` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/BiomeResolver.ts:242` `buildBiomeReport` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/BiomeResolver.ts:287` `updateBiomeSchema` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/BunResolver.ts:101` `BunSemver` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/BunResolver.ts:255` `BunVersionState` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/BunResolver.ts:278` `resolveBunVersions` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/BunResolver.ts:392` `buildBunReport` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/DockerResolver.ts:127` `DockerImageState` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/DockerResolver.ts:325` `resolveDockerImages` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/DockerResolver.ts:453` `buildDockerReport` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/EffectResolver.ts:61` `EffectCatalogState` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/EffectResolver.ts:146` `resolveEffectCatalog` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/EffectResolver.ts:211` `buildEffectReport` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/NodeResolver.ts:31` `NodeVersionLocation` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/NodeResolver.ts:50` `NodeVersionState` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/NodeResolver.ts:130` `resolveNodeVersions` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/NodeResolver.ts:245` `buildNodeReport` (const) - missing @example
- `src/commands/VersionSync/internal/services/CategorySelectionService.ts:25` `CategorySelectionServiceShape` (type) - missing @example
- `src/commands/VersionSync/internal/services/CategorySelectionService.ts:36` `CategorySelectionService` (class) - missing @example
- `src/commands/VersionSync/internal/services/CategorySelectionService.ts:66` `CategorySelectionServiceLive` (const) - missing @example
- `src/commands/VersionSync/internal/services/ReportRendererService.ts:32` `ReportRendererServiceShape` (type) - missing @example
- `src/commands/VersionSync/internal/services/ReportRendererService.ts:43` `ReportRendererService` (class) - missing @example
- `src/commands/VersionSync/internal/services/ReportRendererService.ts:127` `ReportRendererServiceLive` (const) - missing @example
- `src/commands/VersionSync/internal/services/ResolverService.ts:41` `ResolverServiceShape` (type) - missing @example
- `src/commands/VersionSync/internal/services/ResolverService.ts:54` `ResolverService` (class) - missing @example
- `src/commands/VersionSync/internal/services/ResolverService.ts:152` `ResolverServiceLive` (const) - missing @example
- `src/commands/VersionSync/internal/services/UpdateApplierService.ts:45` `UpdateApplierServiceShape` (type) - missing @example
- `src/commands/VersionSync/internal/services/UpdateApplierService.ts:58` `UpdateApplierService` (class) - missing @example
- `src/commands/VersionSync/internal/services/UpdateApplierService.ts:236` `UpdateApplierServiceLive` (const) - missing @example
- `src/commands/VersionSync/internal/updaters/PackageJsonUpdater.ts:38` `updatePackageManagerField` (const) - missing @example
- `src/commands/VersionSync/internal/updaters/PackageJsonUpdater.ts:94` `updateCatalogEntry` (const) - missing @example
- `src/commands/VersionSync/internal/updaters/PlainTextUpdater.ts:21` `updatePlainTextFile` (const) - missing @example
- `src/commands/VersionSync/internal/updaters/YamlFileUpdater.ts:53` `updateYamlValue` (const) - missing @example
- `src/commands/VersionSync/internal/updaters/YamlFileUpdater.ts:116` `replaceNodeVersionWithFile` (const) - missing @example
- `src/index.ts:75` `export {
  /**
   * Code generation command for workspace barrels and exports.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  codegenCommand,
} from "./commands/Codegen.js";` (re-export) - missing @example
- `src/index.ts:117` `export {
  /**
   * Package scaffolding command for creating new workspace packages.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  createPackageCommand,
} from "./commands/CreatePackage/index.js";` (re-export) - missing @example
- `src/index.ts:132` `export {
  /**
   * Human-first docgen command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  docgenCommand,
} from "./commands/Docgen/index.js";` (re-export) - missing @example
- `src/index.ts:147` `export {
  /**
   * Command-first docs discovery command tree.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  docsCommand,
} from "./commands/Docs.js";` (re-export) - missing @example
- `src/index.ts:162` `export {
  /**
   * Dataset file curation command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  filesCommand,
} from "./commands/Files/index.js";` (re-export) - missing @example
- `src/index.ts:177` `export {
  /**
   * Graphiti operational command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  graphitiCommand,
} from "./commands/Graphiti/index.js";` (re-export) - missing @example
- `src/index.ts:192` `export {
  /**
   * Image and video curation command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  imageCommand,
} from "./commands/Image/index.js";` (re-export) - missing @example
- `src/index.ts:207` `export {
  /**
   * Effect laws command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  lawsCommand,
} from "./commands/Laws/index.js";` (re-export) - missing @example
- `src/index.ts:222` `export {
  /**
   * Lint policy command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  lintCommand,
} from "./commands/Lint/index.js";` (re-export) - missing @example
- `src/index.ts:237` `export {
  /**
   * Purge command for removing root/workspace build artifacts.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  purgeCommand,
} from "./commands/Purge.js";` (re-export) - missing @example
- `src/index.ts:279` `export {
  /**
   * Reuse-discovery command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  reuseCommand,
} from "./commands/Reuse/index.js";` (re-export) - missing @example
- `src/index.ts:294` `export {
  /**
   * Root CLI command that composes subcommands.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  rootCommand,
} from "./commands/Root.js";` (re-export) - missing @example
- `src/index.ts:309` `export {
  /**
   * Official data sync command for checked-in generated TypeScript modules.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  syncDataToTsCommand,
} from "./commands/SyncDataToTs/index.js";` (re-export) - missing @example
- `src/index.ts:324` `export {
  /**
   * Dependency topological sort command.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  topoSortCommand,
} from "./commands/TopoSort.js";` (re-export) - missing @example
- `src/index.ts:339` `export {
  /**
   * Tsconfig sync command for workspace tsconfig references and root aliases.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  tsconfigSyncCommand,
} from "./commands/TsconfigSync.js";` (re-export) - missing @example
- `src/index.ts:354` `export {
  /**
   * Version sync command for detecting and fixing version drift.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  versionSyncCommand,
} from "./commands/VersionSync/index.js";` (re-export) - missing @example

### @beep/canvas-server

Path: `packages/canvas/server`

Export findings:
- `src/aggregates/CanvasProject/CanvasProject.http.ts:30` `CanvasProjectHttpStatus` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.http.ts:43` `CanvasProjectHttpStatus` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.http.ts:51` `CanvasProjectHttpResponse` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.http.ts:68` `toCanvasProjectHttpError` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.http.ts:89` `makeCanvasProjectHttpHandlers` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.layer.ts:24` `makeCanvasProjectServer` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.layer.ts:35` `CanvasProjectServer` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.layer.ts:46` `CanvasProjectServerLayer` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.repo.ts:37` `makeInMemoryCanvasProjectRepository` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.repo.ts:81` `makeCanvasProjectRepository` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.rpc.ts:17` `makeCanvasProjectRpcHandlers` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.tools.ts:17` `CanvasProjectToolNames` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.tools.ts:32` `makeCanvasProjectToolHandlers` (const) - missing @example
- `src/aggregates/CanvasProject/index.ts:7` `export * from "./CanvasProject.http.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:14` `export * from "./CanvasProject.layer.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:21` `export * from "./CanvasProject.repo.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:28` `export * from "./CanvasProject.rpc.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:35` `export * from "./CanvasProject.tools.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as CanvasProject from "./aggregates/CanvasProject/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * from "./Layer.js";` (re-export) - missing @example
- `src/Layer.ts:17` `CanvasServerLive` (const) - missing @example
- `src/test.ts:17` `CanvasServerTest` (const) - missing @example

### @beep/sandbox

Path: `packages/foundation/capability/sandbox`

Export findings:
- `src/Agent.provider.ts:332` `ParsedStreamEvent` (const) - missing @example
- `src/Agent.provider.ts:358` `ParsedStreamEvent` (type) - missing @example
- `src/Agent.provider.ts:366` `CodexEffort` (const) - missing @example
- `src/Agent.provider.ts:378` `CodexEffort` (type) - missing @example
- `src/Agent.provider.ts:386` `ClaudeEffort` (const) - missing @example
- `src/Agent.provider.ts:398` `ClaudeEffort` (type) - missing @example
- `src/Agent.provider.ts:406` `AgentCommandOptions` (class) - missing @example
- `src/Agent.provider.ts:423` `PrintCommand` (class) - missing @example
- `src/Agent.provider.ts:439` `IterationUsage` (class) - missing @example
- `src/Agent.provider.ts:457` `CodexOptions` (class) - missing @example
- `src/Agent.provider.ts:473` `PiOptions` (class) - missing @example
- `src/Agent.provider.ts:488` `OpenCodeOptions` (class) - missing @example
- `src/Agent.provider.ts:503` `ClaudeCodeOptions` (class) - missing @example
- `src/Agent.provider.ts:520` `AgentProvider` (interface) - missing @example
- `src/Agent.provider.ts:536` `DEFAULT_CLAUDE_MODEL` (const) - missing @example
- `src/Agent.provider.ts:760` `codex` (const) - missing @example
- `src/Agent.provider.ts:784` `pi` (const) - missing @example
- `src/Agent.provider.ts:804` `opencode` (const) - missing @example
- `src/Agent.provider.ts:823` `claudeCode` (const) - missing @example
- `src/AgentStreamEmitter.ts:24` `AgentStreamEvent` (const) - missing @example
- `src/AgentStreamEmitter.ts:51` `AgentStreamEvent` (type) - missing @example
- `src/AgentStreamEmitter.ts:59` `AgentStreamEvent` (namespace) - missing @example
- `src/AgentStreamEmitter.ts:75` `AgentStreamEmitterShape` (interface) - missing @example
- `src/AgentStreamEmitter.ts:85` `AgentStreamEmitter` (class) - missing @example
- `src/AgentStreamEmitter.ts:95` `noopAgentStreamEmitterLayer` (const) - missing @example
- `src/AgentStreamEmitter.ts:110` `callbackAgentStreamEmitterLayer` (const) - missing @example
- `src/createSandbox.ts:30` `CreateSandboxOptions` (interface) - missing @example
- `src/createSandbox.ts:44` `CreateSandboxResult` (class) - missing @example
- `src/createSandbox.ts:60` `createSandbox` (const) - missing @example
- `src/createWorktree.ts:28` `CreateWorktreeOptions` (class) - missing @example
- `src/createWorktree.ts:46` `Worktree` (interface) - missing @example
- `src/createWorktree.ts:68` `CreateWorktreeResult` (class) - missing @example
- `src/createWorktree.ts:84` `createWorktree` (const) - missing @example
- `src/createWorktree.ts:125` `createWorktreeScoped` (const) - missing @example
- `src/Display.ts:25` `Severity` (const) - missing @example
- `src/Display.ts:37` `Severity` (type) - missing @example
- `src/Display.ts:45` `DisplayEntryStatus` (class) - missing @example
- `src/Display.ts:62` `DisplayEntryIntro` (class) - missing @example
- `src/Display.ts:78` `DisplayEntrySpinner` (class) - missing @example
- `src/Display.ts:94` `DisplayEntrySummary` (class) - missing @example
- `src/Display.ts:111` `DisplayEntryTaskLog` (class) - missing @example
- `src/Display.ts:128` `DisplayEntryText` (class) - missing @example
- `src/Display.ts:144` `DisplayEntryToolCall` (class) - missing @example
- `src/Display.ts:161` `DisplayEntry` (const) - missing @example
- `src/Display.ts:182` `DisplayEntry` (type) - missing @example
- `src/Display.ts:190` `DisplayServiceShape` (interface) - missing @example
- `src/Display.ts:215` `Display` (class) - missing @example
- `src/Display.ts:233` `SilentDisplay` (const) - missing @example
- `src/Display.ts:421` `FileDisplay` (const) - missing @example
- `src/Display.ts:451` `terminalStyle` (const) - missing @example
- `src/Display.ts:465` `ClackDisplay` (const) - missing @example
- `src/Env.ts:25` `MergeProviderEnvOptions` (class) - missing @example
- `src/Env.ts:78` `resolveEnv` (const) - missing @example
- `src/Env.ts:109` `mergeProviderEnv` (const) - missing @example
- `src/Image.ts:26` `ContainerImageRuntime` (const) - missing @example
- `src/Image.ts:38` `ContainerImageRuntime` (type) - missing @example
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
- `src/Init.ts:30` `SANDBOX_CONFIG_DIR` (const) - missing @example
- `src/Init.ts:38` `SandboxAgentName` (const) - missing @example
- `src/Init.ts:50` `SandboxAgentName` (type) - missing @example
- `src/Init.ts:58` `SandboxInitProviderName` (const) - missing @example
- `src/Init.ts:70` `SandboxInitProviderName` (type) - missing @example
- `src/interactive.ts:34` `InteractiveResult` (class) - missing @example
- `src/interactive.ts:54` `interactive` (const) - missing @example
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
- `src/Orchestrator.ts:32` `IterationResult` (class) - missing @example
- `src/Orchestrator.ts:49` `CommitSummary` (class) - missing @example
- `src/Orchestrator.ts:64` `OrchestrateResult` (class) - missing @example
- `src/Orchestrator.ts:84` `OrchestrateOptions` (interface) - missing @example
- `src/Orchestrator.ts:177` `orchestrate` (const) - missing @example
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
- `src/Prompt.ts:399` `expandPromptShellExpressions` (const) - missing @example
- `src/RecoveryMessage.ts:41` `FailedStep` (type) - missing @example
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
- `src/Session.ts:27` `SessionPathsShape` (class) - missing @example
- `src/Session.ts:43` `SessionId` (const) - missing @example
- `src/Session.ts:59` `SessionId` (type) - missing @example
- `src/Session.ts:67` `SessionPaths` (class) - missing @example
- `src/Session.ts:75` `SessionStore` (interface) - missing @example
- `src/Session.ts:87` `encodeProjectPath` (const) - missing @example
- `src/Session.ts:95` `sessionPathsLayer` (const) - missing @example
- `src/Session.ts:104` `defaultSessionPathsLayer` (const) - missing @example
- `src/Session.ts:133` `SessionTransferResult` (class) - missing @example
- `src/Session.ts:148` `hostSessionStore` (const) - missing @example
- `src/Session.ts:189` `sandboxSessionStore` (const) - missing @example
- `src/Session.ts:221` `transferSession` (const) - missing @example
- `src/SyncIn.ts:29` `SyncInResult` (class) - missing @example
- `src/SyncIn.ts:181` `syncIn` (const) - missing @example
- `src/SyncOut.ts:38` `SyncOutOptions` (class) - missing @example
- `src/SyncOut.ts:53` `SyncOutResult` (class) - missing @example
- `src/SyncOut.ts:357` `syncOut` (const) - missing @example
- `src/Template.ts:25` `SandboxTemplateName` (const) - missing @example
- `src/Template.ts:37` `SandboxTemplateName` (type) - missing @example
- `src/terminalCleanup.ts:29` `TerminalCleanupStdin` (interface) - missing @example
- `src/terminalCleanup.ts:40` `TerminalCleanupStdout` (interface) - missing @example
- `src/TextDeltaBuffer.ts:54` `TextDeltaFlush` (type) - missing @example
- `src/Worktree.ts:36` `WorktreeInfo` (class) - missing @example
- `src/Worktree.ts:52` `CreateWorktreeInfoOptions` (class) - missing @example
- `src/Worktree.ts:70` `sanitizeName` (const) - missing @example
- `src/Worktree.ts:78` `generateTempBranchName` (const) - missing @example
- `src/Worktree.ts:120` `getCurrentBranch` (const) - missing @example
- `src/Worktree.ts:132` `hasUncommittedChanges` (const) - missing @example
- `src/Worktree.ts:144` `createWorktreeInfo` (const) - missing @example
- `src/Worktree.ts:204` `removeWorktree` (const) - missing @example
- `src/Worktree.ts:217` `pruneStaleWorktrees` (const) - missing @example
- `src/Worktree.ts:243` `collectCommitShas` (const) - missing @example

### @beep/oip-web

Path: `apps/oip-web`

Export findings:
- `src/contact/index.ts:14` `export * from "./ContactSubmission.model.ts";` (re-export) - missing @example
- `src/contact/index.ts:21` `export * from "./ContactSubmission.service.ts";` (re-export) - missing @example
- `src/content/index.ts:14` `export * from "./OipContent.data.ts";` (re-export) - missing @example
- `src/content/index.ts:22` `export * from "./OipContent.model.ts";` (re-export) - missing @example
- `src/content/index.ts:30` `export * from "./OipContent.runtime.ts";` (re-export) - missing @example
- `src/content/index.ts:38` `export * from "./OipSeo.ts";` (re-export) - missing @example

### @beep/shared-tables

Path: `packages/shared/tables`

Export findings:
- `src/entities/index.ts:7` `export * as Membership from "./Membership/index.ts";` (re-export) - missing @example
- `src/entities/index.ts:15` `export * as Organization from "./Organization/index.ts";` (re-export) - missing @example
- `src/entities/index.ts:23` `export * as User from "./User/index.ts";` (re-export) - missing @example
- `src/entities/Membership/index.ts:7` `export * from "./Membership.table.ts";` (re-export) - missing @example
- `src/entities/Organization/index.ts:7` `export * from "./Organization.table.js";` (re-export) - missing @example
- `src/entities/User/index.ts:7` `export * from "./User.table.ts";` (re-export) - missing @example
- `src/index.ts:14` `export * as Entities from "./entities/index.ts";` (re-export) - missing @example
- `src/Schema.ts:22` `DbSchema` (const) - missing @example
- `src/Schema.ts:34` `DbSchema` (type) - missing @example
- `src/table/index.ts:14` `export * as Table from "./Table.ts";` (re-export) - missing @example
- `src/table/Table.ts:14` `export { EntityTable } from "@beep/drizzle";` (re-export) - missing @example

### @beep/canvas

Path: `apps/canvas`

Export findings:
- `src/index.ts:11` `VERSION` (const) - missing summary; missing @example

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

### @beep/stack-installer

Path: `apps/stack-installer`

Export findings:
- `src/App.tsx:402` `App` (function) - missing @example
- `src/dry-run-registry.ts:17` `p1aDryRunRegistry` (const) - missing @example
- `src/dry-run-registry.ts:25` `p1aDryRunSnapshot` (const) - missing @example
- `src/index.ts:23` `export * from "./proof/P1ManualProof.js";` (re-export) - missing @example
- `src/index.ts:15` `VERSION` (const) - missing @example
- `src/proof/P1ManualProof.ts:9` `export {
  InstallerServerLive as P1ManualProofSliceLayer,
  previewP1ManualProof,
  runP1ManualProof,
} from "@beep/installer-server";` (re-export) - missing @example
- `src/proof/P1ProofArtifacts.ts:20` `PROOF_FILE_NAME` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:28` `COMMANDS_FILE_NAME` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:36` `CHECKSUMS_FILE_NAME` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:44` `P1_REQUIRED_PLATFORMS` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:52` `P1RequiredPlatform` (type) - missing @example
- `src/proof/P1ProofArtifacts.ts:94` `isP1ProofEvidenceFileName` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:103` `isP1ProofArtifactStatusFileName` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:112` `p1ProofMissingRequiredArtifactFiles` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:126` `p1ProofBundleFileNameForPlatform` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:135` `p1ProofBundleExtractionCommand` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:150` `p1ProofBundleExtractionProcess` (const) - missing @example
- `src/proof/P1ProofCommands.ts:114` `buildP1ProofCommandsText` (const) - missing @example
- `src/proof/P1ProofCommands.ts:129` `p1ProofCommandsTextMatchesPlatform` (const) - missing @example

### @beep/professional-desktop

Path: `apps/professional-desktop`

Export findings:
- `src/App.tsx:93` `App` (function) - missing summary; missing @example, @category, @since

### @beep/acp

Path: `packages/drivers/acp`

Export findings:
- `src/errors.ts:392` `AcpError` (const) - 1 schema annotation/type-alias gap(s)

### @beep/nlp

Path: `packages/foundation/capability/nlp`

Export findings:
- `src/Core/index.ts:11` `export * from "./Document.ts";` (re-export) - missing @example
- `src/Core/index.ts:16` `export * from "./Pattern.ts";` (re-export) - missing @example
- `src/Core/index.ts:21` `export * from "./PatternBuilders.ts";` (re-export) - missing @example
- `src/Core/index.ts:26` `export * from "./PatternOperations.ts";` (re-export) - missing @example
- `src/Core/index.ts:31` `export * from "./PatternParsers.ts";` (re-export) - missing @example
- `src/Core/index.ts:36` `export * from "./Sentence.ts";` (re-export) - missing @example
- `src/Core/index.ts:41` `export * from "./Token.ts";` (re-export) - missing @example
- `src/Core/index.ts:46` `export * from "./Tokenization.ts";` (re-export) - missing @example
- `src/Core/PatternBuilders.ts:100` `pos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:101` `pos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:125` `entity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:126` `entity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:150` `literal` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:151` `literal` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:172` `optionalPos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:173` `optionalPos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:197` `optionalEntity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:198` `optionalEntity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:222` `optionalLiteral` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:223` `optionalLiteral` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternParsers.ts:106` `BracketStringToPOSPatternElement` (const) - 1 schema annotation/type-alias gap(s)
- `src/Core/PatternParsers.ts:137` `BracketStringToEntityPatternElement` (const) - 1 schema annotation/type-alias gap(s)
- `src/Core/PatternParsers.ts:170` `BracketStringToLiteralPatternElement` (const) - 1 schema annotation/type-alias gap(s)
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
- `src/index.ts:42` `ArchitectureLabProofResult` (class) - missing @example
- `src/index.ts:59` `runArchitectureLabProof` (const) - missing @example

### @beep/konva

Path: `packages/drivers/konva`

Export findings:
- `src/index.ts:11` `VERSION` (const) - missing summary; missing @example

### @beep/canvas-client

Path: `packages/canvas/client`

Export findings:
- `src/index.ts:15` `VERSION` (const) - missing @example

### @beep/openai

Path: `packages/drivers/openai`

Export findings:
- `src/index.ts:12` `VERSION` (const) - missing summary; missing @example

### @beep/canvas-ui

Path: `packages/canvas/ui`

Export findings:
- `src/index.ts:15` `VERSION` (const) - missing @example
