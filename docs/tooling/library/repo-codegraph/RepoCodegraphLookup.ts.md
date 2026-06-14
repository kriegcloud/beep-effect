---
title: RepoCodegraphLookup.ts
nav_order: 3
parent: "@beep/repo-codegraph"
---

## RepoCodegraphLookup.ts overview

Deterministic lookup scoring over the generated repo export catalog.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [FromPackageResolution (class)](#frompackageresolution-class)
  - [LookupOptions (class)](#lookupoptions-class)
  - [NormalizedPathLikeSelector (class)](#normalizedpathlikeselector-class)
- [utilities](#utilities)
  - [lookupRepoExports](#lookuprepoexports)
---

# models

## FromPackageResolution (class)

Resolved package and selector details for a lookup request.

**Example**

```ts
import { FromPackageResolution } from "@beep/repo-codegraph/RepoCodegraphLookup"
console.log(FromPackageResolution)
```

**Signature**

```ts
declare class FromPackageResolution
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.ts#L61)

Since v0.0.0

## LookupOptions (class)

Optional freshness and import-policy inputs for repo codegraph lookup.

**Example**

```ts
import { LookupOptions } from "@beep/repo-codegraph/RepoCodegraphLookup"
console.log(LookupOptions)
```

**Signature**

```ts
declare class LookupOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.ts#L82)

Since v0.0.0

## NormalizedPathLikeSelector (class)

Normalized path-like selector tokens used for catalog matching.

**Example**

```ts
import { NormalizedPathLikeSelector } from "@beep/repo-codegraph/RepoCodegraphLookup"
console.log(NormalizedPathLikeSelector)
```

**Signature**

```ts
declare class NormalizedPathLikeSelector
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.ts#L103)

Since v0.0.0

# utilities

## lookupRepoExports

Lookup public repo exports by symbol name or free-text intent.

**Example**

```ts
import { lookupRepoExports } from "@beep/repo-codegraph"
console.log(lookupRepoExports)
```

**Signature**

```ts
declare const lookupRepoExports: { (catalog: RepoExportsCatalog, request: RepoCodegraphLookupRequest, options?: LookupOptions): RepoCodegraphLookupResult; (request: RepoCodegraphLookupRequest, options?: LookupOptions): (catalog: RepoExportsCatalog) => RepoCodegraphLookupResult; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-codegraph/src/RepoCodegraphLookup.ts#L623)

Since v0.0.0