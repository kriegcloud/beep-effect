---
title: TsconfigAliasTargets.ts
nav_order: 53
parent: "@beep/repo-utils"
---

## TsconfigAliasTargets.ts overview

Shared alias target helpers for tsconfig and docgen path mappings.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [CanonicalAliasTargets (class)](#canonicalaliastargets-class)
  - [buildCanonicalAliasTargets](#buildcanonicalaliastargets)
  - [buildDocgenAliasTargets](#builddocgenaliastargets)
  - [resolveRootExportTarget](#resolverootexporttarget)
  - [resolveSubpathExportTarget](#resolvesubpathexporttarget)
  - [resolveWildcardExportTarget](#resolvewildcardexporttarget)
---

# models

## CanonicalAliasTargets (class)

Canonical alias targets derived for a package root export.

**Example**

```ts
console.log("CanonicalAliasTargets")
```

**Signature**

```ts
declare class CanonicalAliasTargets
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TsconfigAliasTargets.ts#L35)

Since v0.0.0

## buildCanonicalAliasTargets

Build root and wildcard alias targets for a package export target.

**Example**

```ts
console.log("buildCanonicalAliasTargets")
```

**Signature**

```ts
declare const buildCanonicalAliasTargets: { (packagePath: string, rootExportTarget: string): CanonicalAliasTargets; (rootExportTarget: string): (packagePath: string) => CanonicalAliasTargets; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TsconfigAliasTargets.ts#L154)

Since v0.0.0

## buildDocgenAliasTargets

Build source-root and source-wildcard alias targets for docgen example resolution.

Unlike root tsconfig aliases, docgen aliases should mirror source exports directly
so example imports resolve to concrete `*.ts` files.

**Example**

```ts
console.log("buildDocgenAliasTargets")
```

**Signature**

```ts
declare const buildDocgenAliasTargets: { (packagePath: string, options: BuildDocgenAliasTargetsOptions): CanonicalAliasTargets; (options: BuildDocgenAliasTargetsOptions): (packagePath: string) => CanonicalAliasTargets; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TsconfigAliasTargets.ts#L204)

Since v0.0.0

## resolveRootExportTarget

Resolve the canonical root export target from a package `exports` field.

**Example**

```ts
console.log("resolveRootExportTarget")
```

**Signature**

```ts
declare const resolveRootExportTarget: (exportsField: unknown) => O.Option<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TsconfigAliasTargets.ts#L89)

Since v0.0.0

## resolveSubpathExportTarget

Resolve a specific subpath export target from a package `exports` field.

**Example**

```ts
console.log("resolveSubpathExportTarget")
```

**Signature**

```ts
declare const resolveSubpathExportTarget: { (exportsField: unknown, subpath: string): O.Option<string>; (subpath: string): (exportsField: unknown) => O.Option<string>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TsconfigAliasTargets.ts#L115)

Since v0.0.0

## resolveWildcardExportTarget

Resolve the wildcard export target from a package `exports` field.

**Example**

```ts
console.log("resolveWildcardExportTarget")
```

**Signature**

```ts
declare const resolveWildcardExportTarget: (exportsField: unknown) => O.Option<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/TsconfigAliasTargets.ts#L138)

Since v0.0.0