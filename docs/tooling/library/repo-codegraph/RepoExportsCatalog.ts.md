---
title: RepoExportsCatalog.ts
nav_order: 5
parent: "@beep/repo-codegraph"
---

## RepoExportsCatalog.ts overview

File readers for the generated repo export catalog and lookup policy metadata.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [RepoCodegraphCatalogReadError (class)](#repocodegraphcatalogreaderror-class)
- [utilities](#utilities)
  - [readRepoCodegraphImportPolicies](#readrepocodegraphimportpolicies)
  - [readRepoExportsCatalog](#readrepoexportscatalog)
  - [repoExportsCatalogPath](#repoexportscatalogpath)
---

# error-handling

## RepoCodegraphCatalogReadError (class)

Typed failure raised while reading repo-codegraph inputs.

**Example**

```ts
import { RepoCodegraphCatalogReadError } from "@beep/repo-codegraph"
const error = RepoCodegraphCatalogReadError.make({
  cause: "missing",
  message: "Catalog not found",
  operation: "read",
  path: "standards/repo-exports.catalog.jsonc"
})
console.log(error.operation)
```

**Signature**

```ts
declare class RepoCodegraphCatalogReadError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.ts#L51)

Since v0.0.0

# utilities

## readRepoCodegraphImportPolicies

Read package-local import policies from package.json metadata.

**Example**

```ts
import { readRepoCodegraphImportPolicies } from "@beep/repo-codegraph"
console.log(readRepoCodegraphImportPolicies)
```

**Signature**

```ts
declare const readRepoCodegraphImportPolicies: (repoRoot: string, catalog: RepoExportsCatalog) => Effect.Effect<ReadonlyArray<RepoCodegraphPackageImportPolicy>, RepoCodegraphCatalogReadError, Path.Path | FileSystem.FileSystem>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.ts#L390)

Since v0.0.0

## readRepoExportsCatalog

Read and decode the generated repo export catalog from a repo root.

**Example**

```ts
import { readRepoExportsCatalog } from "@beep/repo-codegraph"
console.log(readRepoExportsCatalog)
```

**Signature**

```ts
declare const readRepoExportsCatalog: (repoRoot: string) => Effect.Effect<RepoExportsCatalog, S.SchemaError | RepoCodegraphCatalogReadError, Path.Path | FileSystem.FileSystem>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.ts#L360)

Since v0.0.0

## repoExportsCatalogPath

Resolve the generated export catalog path for a repo root.

**Example**

```ts
import { repoExportsCatalogPath } from "@beep/repo-codegraph"
console.log(repoExportsCatalogPath("/repo"))
```

**Signature**

```ts
declare const repoExportsCatalogPath: (repoRoot: string) => Effect.Effect<string, never, Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoExportsCatalog.ts#L342)

Since v0.0.0