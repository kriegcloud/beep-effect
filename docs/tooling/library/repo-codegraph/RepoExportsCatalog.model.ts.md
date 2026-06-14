---
title: RepoExportsCatalog.model.ts
nav_order: 4
parent: "@beep/repo-codegraph"
---

## RepoExportsCatalog.model.ts overview

Schema-first models for the generated repo export catalog.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [RepoExportsCatalog (class)](#repoexportscatalog-class)
  - [RepoExportsCatalogAuthority (class)](#repoexportscatalogauthority-class)
  - [RepoExportsCatalogEntry (class)](#repoexportscatalogentry-class)
  - [RepoExportsCatalogIndex (class)](#repoexportscatalogindex-class)
  - [RepoExportsCatalogIndexPackage (class)](#repoexportscatalogindexpackage-class)
  - [RepoExportsCatalogIndexSchemaVersion](#repoexportscatalogindexschemaversion)
  - [RepoExportsCatalogIndexSchemaVersion (type alias)](#repoexportscatalogindexschemaversion-type-alias)
  - [RepoExportsCatalogIndexStandard](#repoexportscatalogindexstandard)
  - [RepoExportsCatalogIndexStandard (type alias)](#repoexportscatalogindexstandard-type-alias)
  - [RepoExportsCatalogPackage (class)](#repoexportscatalogpackage-class)
  - [RepoExportsCatalogPackageCounts (class)](#repoexportscatalogpackagecounts-class)
  - [RepoExportsCatalogSchemaVersion](#repoexportscatalogschemaversion)
  - [RepoExportsCatalogSchemaVersion (type alias)](#repoexportscatalogschemaversion-type-alias)
  - [RepoExportsCatalogShard (class)](#repoexportscatalogshard-class)
  - [RepoExportsCatalogShardFingerprint (class)](#repoexportscatalogshardfingerprint-class)
  - [RepoExportsCatalogShardFingerprintInput (class)](#repoexportscatalogshardfingerprintinput-class)
  - [RepoExportsCatalogShardSchemaVersion](#repoexportscatalogshardschemaversion)
  - [RepoExportsCatalogShardSchemaVersion (type alias)](#repoexportscatalogshardschemaversion-type-alias)
  - [RepoExportsCatalogShardStandard](#repoexportscatalogshardstandard)
  - [RepoExportsCatalogShardStandard (type alias)](#repoexportscatalogshardstandard-type-alias)
  - [RepoExportsCatalogSource (class)](#repoexportscatalogsource-class)
  - [RepoExportsCatalogStandard](#repoexportscatalogstandard)
  - [RepoExportsCatalogStandard (type alias)](#repoexportscatalogstandard-type-alias)
  - [RepoExportsCatalogTotals (class)](#repoexportscatalogtotals-class)
- [schemas](#schemas)
  - [decodeRepoExportsCatalog](#decoderepoexportscatalog)
  - [decodeRepoExportsCatalogIndex](#decoderepoexportscatalogindex)
  - [decodeRepoExportsCatalogShard](#decoderepoexportscatalogshard)
---

# models

## RepoExportsCatalog (class)

Generated repo export catalog.

**Example**

```ts
import { RepoExportsCatalog } from "@beep/repo-codegraph"
console.log(RepoExportsCatalog)
```

**Signature**

```ts
declare class RepoExportsCatalog
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L613)

Since v0.0.0

## RepoExportsCatalogAuthority (class)

Current authority posture recorded by the export catalog.

**Example**

```ts
import { RepoExportsCatalogAuthority } from "@beep/repo-codegraph"
const authority = RepoExportsCatalogAuthority.make({
  boundaryDoctrine: ["standards/ARCHITECTURE.md"],
  canonicalStatus: "not-evaluated",
  note: "Descriptive export metadata.",
  posture: "descriptive-current-state"
})
console.log(authority.posture)
```

**Signature**

```ts
declare class RepoExportsCatalogAuthority
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L93)

Since v0.0.0

## RepoExportsCatalogEntry (class)

One legal public export fact from the generated catalog.

**Example**

```ts
import { RepoExportsCatalogEntry } from "@beep/repo-codegraph"
const entry = RepoExportsCatalogEntry.make({
  categories: ["schemas"],
  exportKind: "const",
  exportSubpath: ".",
  exportedFromPath: "packages/foundation/modeling/schema/src/index.ts",
  importSpecifier: "@beep/schema",
  packageName: "@beep/schema",
  packagePath: "packages/foundation/modeling/schema",
  searchText: "unknown record",
  since: ["0.0.0"],
  sourceLine: 29,
  sourcePath: "packages/foundation/modeling/schema/src/Record.ts",
  summary: "Schema for object records with string keys and unknown values.",
  symbolName: "UnknownRecord",
  tags: ["@category"],
  topoOrder: 1
})
console.log(entry.importSpecifier)
```

**Signature**

```ts
declare class RepoExportsCatalogEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L224)

Since v0.0.0

## RepoExportsCatalogIndex (class)

Compact root index for package-local repo export catalog shards.

**Example**

```ts
import { RepoExportsCatalogIndex } from "@beep/repo-codegraph"
import { RepoExportsCatalogSource } from "@beep/repo-codegraph"
const index = RepoExportsCatalogIndex.make({
  authority: {
    boundaryDoctrine: ["standards/ARCHITECTURE.md"],
    canonicalStatus: "not-evaluated",
    note: "Descriptive export metadata.",
    posture: "descriptive-current-state"
  },
  deterministic: true,
  packages: [],
  schemaVersion: "repo-exports-catalog-index/v1",
  source: RepoExportsCatalogSource.make({
    generator: "bun run beep quality repo-exports-catalog",
    inputs: ["package.json exports"],
    packageUniverseCommand: "bun run topo-sort"
  }),
  standard: "repo-exports-catalog-index",
  totals: {
    importSpecifiers: 0,
    missingWorkspaceMetadata: 0,
    packages: 0,
    packagesWithPublicExports: 0,
    packagesWithoutPublicExports: 0,
    publicExportEntries: 0,
    uniquePackageSymbols: 0
  }
})
console.log(index.standard)
```

**Signature**

```ts
declare class RepoExportsCatalogIndex
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L587)

Since v0.0.0

## RepoExportsCatalogIndexPackage (class)

One package entry in the compact root repo export catalog index.

**Example**

```ts
import { RepoExportsCatalogIndexPackage } from "@beep/repo-codegraph"
const pkg = RepoExportsCatalogIndexPackage.make({
  packageName: "@beep/example",
  packagePath: "packages/example",
  shardPath: "packages/example/.beep/repo-exports/catalog.shard.jsonc",
  status: "has-public-exports",
  topoOrder: 1
})
console.log(pkg.shardPath)
```

**Signature**

```ts
declare class RepoExportsCatalogIndexPackage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L534)

Since v0.0.0

## RepoExportsCatalogIndexSchemaVersion

Generated export catalog index schema version.

**Example**

```ts
import { RepoExportsCatalogIndexSchemaVersion } from "@beep/repo-codegraph"
console.log(RepoExportsCatalogIndexSchemaVersion.Enum["repo-exports-catalog-index/v1"])
```

**Signature**

```ts
declare const RepoExportsCatalogIndexSchemaVersion: AnnotatedSchema<LiteralKit<readonly ["repo-exports-catalog-index/v1"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L496)

Since v0.0.0

## RepoExportsCatalogIndexSchemaVersion (type alias)

Runtime type for `RepoExportsCatalogIndexSchemaVersion`.

**Example**

```ts
import type { RepoExportsCatalogIndexSchemaVersion } from "@beep/repo-codegraph"
const version: RepoExportsCatalogIndexSchemaVersion = "repo-exports-catalog-index/v1"
console.log(version)
```

**Signature**

```ts
type RepoExportsCatalogIndexSchemaVersion = typeof RepoExportsCatalogIndexSchemaVersion.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L514)

Since v0.0.0

## RepoExportsCatalogIndexStandard

Generated export catalog index standard identifier.

**Example**

```ts
import { RepoExportsCatalogIndexStandard } from "@beep/repo-codegraph"
console.log(RepoExportsCatalogIndexStandard.Enum["repo-exports-catalog-index"])
```

**Signature**

```ts
declare const RepoExportsCatalogIndexStandard: AnnotatedSchema<LiteralKit<readonly ["repo-exports-catalog-index"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L465)

Since v0.0.0

## RepoExportsCatalogIndexStandard (type alias)

Runtime type for `RepoExportsCatalogIndexStandard`.

**Example**

```ts
import type { RepoExportsCatalogIndexStandard } from "@beep/repo-codegraph"
const standard: RepoExportsCatalogIndexStandard = "repo-exports-catalog-index"
console.log(standard)
```

**Signature**

```ts
type RepoExportsCatalogIndexStandard = typeof RepoExportsCatalogIndexStandard.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L483)

Since v0.0.0

## RepoExportsCatalogPackage (class)

Per-package export catalog entry.

**Example**

```ts
import { RepoExportsCatalogPackage } from "@beep/repo-codegraph"
import { RepoExportsCatalogPackageCounts } from "@beep/repo-codegraph"
const pkg = RepoExportsCatalogPackage.make({
  counts: RepoExportsCatalogPackageCounts.make({
    publicExportEntries: 0,
    sourceFiles: 0,
    uniqueSymbols: 0
  }),
  exports: [],
  importSpecifiers: [],
  packageName: "@beep/example",
  packagePath: "packages/tooling/library/example",
  status: "has-public-exports",
  topoOrder: 1
})
console.log(pkg.packageName)
```

**Signature**

```ts
declare class RepoExportsCatalogPackage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L272)

Since v0.0.0

## RepoExportsCatalogPackageCounts (class)

Per-package counts in the generated export catalog.

**Example**

```ts
import { RepoExportsCatalogPackageCounts } from "@beep/repo-codegraph"
const counts = RepoExportsCatalogPackageCounts.make({
  publicExportEntries: 1,
  sourceFiles: 1,
  uniqueSymbols: 1
})
console.log(counts.uniqueSymbols)
```

**Signature**

```ts
declare class RepoExportsCatalogPackageCounts
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L183)

Since v0.0.0

## RepoExportsCatalogSchemaVersion

Generated export catalog schema version.

**Example**

```ts
import { RepoExportsCatalogSchemaVersion } from "@beep/repo-codegraph"
console.log(RepoExportsCatalogSchemaVersion.Enum["repo-exports-catalog/v1"])
```

**Signature**

```ts
declare const RepoExportsCatalogSchemaVersion: AnnotatedSchema<LiteralKit<readonly ["repo-exports-catalog/v1"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L56)

Since v0.0.0

## RepoExportsCatalogSchemaVersion (type alias)

Runtime type for `RepoExportsCatalogSchemaVersion`.

**Example**

```ts
import type { RepoExportsCatalogSchemaVersion } from "@beep/repo-codegraph"
const version: RepoExportsCatalogSchemaVersion = "repo-exports-catalog/v1"
console.log(version)
```

**Signature**

```ts
type RepoExportsCatalogSchemaVersion = typeof RepoExportsCatalogSchemaVersion.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L74)

Since v0.0.0

## RepoExportsCatalogShard (class)

Package-local generated repo export catalog shard.

**Example**

```ts
import { RepoExportsCatalogShard } from "@beep/repo-codegraph"
import { RepoExportsCatalogShardFingerprint } from "@beep/repo-codegraph"
import { RepoExportsCatalogPackage } from "@beep/repo-codegraph"
const shard = RepoExportsCatalogShard.make({
  deterministic: true,
  fingerprint: RepoExportsCatalogShardFingerprint.make({
    algorithm: "sha256",
    digest: "c".repeat(64),
    inputs: []
  }),
  package: RepoExportsCatalogPackage.make({
    counts: { publicExportEntries: 0, sourceFiles: 0, uniqueSymbols: 0 },
    exports: [],
    importSpecifiers: [],
    packageName: "@beep/example",
    packagePath: "packages/example",
    status: "no-public-exports",
    topoOrder: 1
  }),
  schemaVersion: "repo-exports-catalog-shard/v1",
  source: {},
  standard: "repo-exports-catalog-shard"
})
console.log(shard.package.packageName)
```

**Signature**

```ts
declare class RepoExportsCatalogShard
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L440)

Since v0.0.0

## RepoExportsCatalogShardFingerprint (class)

Deterministic content fingerprint for a repo export catalog shard.

**Example**

```ts
import { RepoExportsCatalogShardFingerprint } from "@beep/repo-codegraph"
const fingerprint = RepoExportsCatalogShardFingerprint.make({
  algorithm: "sha256",
  digest: "b".repeat(64),
  inputs: []
})
console.log(fingerprint.algorithm)
```

**Signature**

```ts
declare class RepoExportsCatalogShardFingerprint
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L394)

Since v0.0.0

## RepoExportsCatalogShardFingerprintInput (class)

One content input recorded in a repo export catalog shard fingerprint.

**Example**

```ts
import { RepoExportsCatalogShardFingerprintInput } from "@beep/repo-codegraph"
const input = RepoExportsCatalogShardFingerprintInput.make({
  bytes: 42,
  path: "packages/example/package.json",
  sha256: "a".repeat(64)
})
console.log(input.path)
```

**Signature**

```ts
declare class RepoExportsCatalogShardFingerprintInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L365)

Since v0.0.0

## RepoExportsCatalogShardSchemaVersion

Generated export catalog shard schema version.

**Example**

```ts
import { RepoExportsCatalogShardSchemaVersion } from "@beep/repo-codegraph"
console.log(RepoExportsCatalogShardSchemaVersion.Enum["repo-exports-catalog-shard/v1"])
```

**Signature**

```ts
declare const RepoExportsCatalogShardSchemaVersion: AnnotatedSchema<LiteralKit<readonly ["repo-exports-catalog-shard/v1"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L329)

Since v0.0.0

## RepoExportsCatalogShardSchemaVersion (type alias)

Runtime type for `RepoExportsCatalogShardSchemaVersion`.

**Example**

```ts
import type { RepoExportsCatalogShardSchemaVersion } from "@beep/repo-codegraph"
const version: RepoExportsCatalogShardSchemaVersion = "repo-exports-catalog-shard/v1"
console.log(version)
```

**Signature**

```ts
type RepoExportsCatalogShardSchemaVersion = typeof RepoExportsCatalogShardSchemaVersion.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L347)

Since v0.0.0

## RepoExportsCatalogShardStandard

Generated export catalog shard standard identifier.

**Example**

```ts
import { RepoExportsCatalogShardStandard } from "@beep/repo-codegraph"
console.log(RepoExportsCatalogShardStandard.Enum["repo-exports-catalog-shard"])
```

**Signature**

```ts
declare const RepoExportsCatalogShardStandard: AnnotatedSchema<LiteralKit<readonly ["repo-exports-catalog-shard"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L298)

Since v0.0.0

## RepoExportsCatalogShardStandard (type alias)

Runtime type for `RepoExportsCatalogShardStandard`.

**Example**

```ts
import type { RepoExportsCatalogShardStandard } from "@beep/repo-codegraph"
const standard: RepoExportsCatalogShardStandard = "repo-exports-catalog-shard"
console.log(standard)
```

**Signature**

```ts
type RepoExportsCatalogShardStandard = typeof RepoExportsCatalogShardStandard.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L316)

Since v0.0.0

## RepoExportsCatalogSource (class)

Source metadata for the generated export catalog.

**Example**

```ts
import { RepoExportsCatalogSource } from "@beep/repo-codegraph"
const source = RepoExportsCatalogSource.make({
  generator: "bun run beep quality repo-exports-catalog",
  inputs: ["package.json exports"],
  packageUniverseCommand: "bun run topo-sort"
})
console.log(source.generator)
```

**Signature**

```ts
declare class RepoExportsCatalogSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L121)

Since v0.0.0

## RepoExportsCatalogStandard

Generated export catalog standard identifier.

**Example**

```ts
import { RepoExportsCatalogStandard } from "@beep/repo-codegraph"
console.log(RepoExportsCatalogStandard.Enum["repo-exports-catalog"])
```

**Signature**

```ts
declare const RepoExportsCatalogStandard: AnnotatedSchema<LiteralKit<readonly ["repo-exports-catalog"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L25)

Since v0.0.0

## RepoExportsCatalogStandard (type alias)

Runtime type for `RepoExportsCatalogStandard`.

**Example**

```ts
import type { RepoExportsCatalogStandard } from "@beep/repo-codegraph"
const standard: RepoExportsCatalogStandard = "repo-exports-catalog"
console.log(standard)
```

**Signature**

```ts
type RepoExportsCatalogStandard = typeof RepoExportsCatalogStandard.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L43)

Since v0.0.0

## RepoExportsCatalogTotals (class)

Count metadata recorded in the generated export catalog.

**Example**

```ts
import { RepoExportsCatalogTotals } from "@beep/repo-codegraph"
const totals = RepoExportsCatalogTotals.make({
  importSpecifiers: 1,
  missingWorkspaceMetadata: 0,
  packages: 1,
  packagesWithPublicExports: 1,
  packagesWithoutPublicExports: 0,
  publicExportEntries: 1,
  uniquePackageSymbols: 1
})
console.log(totals.packages)
```

**Signature**

```ts
declare class RepoExportsCatalogTotals
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L152)

Since v0.0.0

# schemas

## decodeRepoExportsCatalog

Decode unknown input into a generated repo export catalog.

**Example**

```ts
import { decodeRepoExportsCatalog } from "@beep/repo-codegraph"
console.log(decodeRepoExportsCatalog)
```

**Signature**

```ts
declare const decodeRepoExportsCatalog: (input: unknown, options?: ParseOptions) => Effect<RepoExportsCatalog, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L639)

Since v0.0.0

## decodeRepoExportsCatalogIndex

Decode unknown input into a compact repo export catalog index.

**Example**

```ts
import { decodeRepoExportsCatalogIndex } from "@beep/repo-codegraph"
console.log(decodeRepoExportsCatalogIndex)
```

**Signature**

```ts
declare const decodeRepoExportsCatalogIndex: (input: unknown, options?: ParseOptions) => Effect<RepoExportsCatalogIndex, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L652)

Since v0.0.0

## decodeRepoExportsCatalogShard

Decode unknown input into a package-local repo export catalog shard.

**Example**

```ts
import { decodeRepoExportsCatalogShard } from "@beep/repo-codegraph"
console.log(decodeRepoExportsCatalogShard)
```

**Signature**

```ts
declare const decodeRepoExportsCatalogShard: (input: unknown, options?: ParseOptions) => Effect<RepoExportsCatalogShard, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.model.ts#L665)

Since v0.0.0