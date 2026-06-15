---
title: DocgenConfig.ts
nav_order: 47
parent: "@beep/repo-utils"
---

## DocgenConfig.ts overview

Shared docgen config builders for repo-managed package documentation.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [CanonicalDocgenConfig (class)](#canonicaldocgenconfig-class)
  - [CanonicalDocgenConfigInput (class)](#canonicaldocgenconfiginput-class)
  - [CanonicalDocgenExamplesCompilerOptions (class)](#canonicaldocgenexamplescompileroptions-class)
  - [DocgenAliasSource (class)](#docgenaliassource-class)
  - [buildDocgenAliasSource](#builddocgenaliassource)
  - [collectDocgenWorkspaceDependencyNames](#collectdocgenworkspacedependencynames)
  - [createCanonicalDocgenConfig](#createcanonicaldocgenconfig)
  - [mergeManagedDocgenConfig](#mergemanageddocgenconfig)
  - [toCanonicalDocgenConfigJson](#tocanonicaldocgenconfigjson)
  - [toDocgenExamplesCompilerOptionsJson](#todocgenexamplescompileroptionsjson)
- [utilities](#utilities)
  - [DEFAULT_DOCGEN_EXCLUDE](#default_docgen_exclude)
---

# models

## CanonicalDocgenConfig (class)

Canonical repo docgen config payload.

**Example**

```ts
console.log("CanonicalDocgenConfig")
```

**Signature**

```ts
declare class CanonicalDocgenConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/DocgenConfig.ts#L163)

Since v0.0.0

## CanonicalDocgenConfigInput (class)

Input used to build the canonical repo docgen config for a package.

**Example**

```ts
console.log("CanonicalDocgenConfigInput")
```

**Signature**

```ts
declare class CanonicalDocgenConfigInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/DocgenConfig.ts#L93)

Since v0.0.0

## CanonicalDocgenExamplesCompilerOptions (class)

Managed TypeScript compiler options used for docgen examples.

**Example**

```ts
console.log("CanonicalDocgenExamplesCompilerOptions")
```

**Signature**

```ts
declare class CanonicalDocgenExamplesCompilerOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/DocgenConfig.ts#L117)

Since v0.0.0

## DocgenAliasSource (class)

Workspace alias metadata used to build docgen example path mappings.

**Example**

```ts
console.log("DocgenAliasSource")
```

**Signature**

```ts
declare class DocgenAliasSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/DocgenConfig.ts#L71)

Since v0.0.0

## buildDocgenAliasSource

Build docgen alias targets for one workspace package from its exports.

**Example**

```ts
console.log("buildDocgenAliasSource")
```

**Signature**

```ts
declare const buildDocgenAliasSource: { (packageName: string, packageRelativePath: string, packageJson: PackageJson.Type): DocgenAliasSource; (packageRelativePath: string, packageJson: PackageJson.Type): (packageName: string) => DocgenAliasSource; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/DocgenConfig.ts#L290)

Since v0.0.0

## collectDocgenWorkspaceDependencyNames

Collect direct workspace package dependencies from a package manifest.

**Example**

```ts
console.log("collectDocgenWorkspaceDependencyNames")
```

**Signature**

```ts
declare const collectDocgenWorkspaceDependencyNames: (packageJson: PackageJson.Type) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/DocgenConfig.ts#L264)

Since v0.0.0

## createCanonicalDocgenConfig

Build the canonical repo docgen config for a package.

**Example**

```ts
console.log("createCanonicalDocgenConfig")
```

**Signature**

```ts
declare const createCanonicalDocgenConfig: (input: CanonicalDocgenConfigInput) => Effect.Effect<CanonicalDocgenConfig, never, Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/DocgenConfig.ts#L406)

Since v0.0.0

## mergeManagedDocgenConfig

Merge managed docgen fields into an existing parsed `docgen.json` document.

Existing package-local extras are preserved. The default `exclude` field is only
backfilled when it is absent so package-specific exclusions survive sync.

**Example**

```ts
console.log("mergeManagedDocgenConfig")
```

**Signature**

```ts
declare const mergeManagedDocgenConfig: { (existing: Readonly<Record<string, unknown>>, canonical: CanonicalDocgenConfig): Record<string, unknown>; (canonical: CanonicalDocgenConfig): (existing: Readonly<Record<string, unknown>>) => Record<string, unknown>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/DocgenConfig.ts#L471)

Since v0.0.0

## toCanonicalDocgenConfigJson

Convert the canonical docgen config model to a plain JSON-compatible object.

**Example**

```ts
console.log("toCanonicalDocgenConfigJson")
```

**Signature**

```ts
declare const toCanonicalDocgenConfigJson: (config: CanonicalDocgenConfig) => { readonly $schema: string; readonly exclude: ReadonlyArray<string>; readonly srcLink: string; readonly examplesCompilerOptions: Readonly<Record<string, unknown>>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/DocgenConfig.ts#L238)

Since v0.0.0

## toDocgenExamplesCompilerOptionsJson

Convert canonical docgen compiler options to a plain JSON-compatible object.

**Example**

```ts
console.log("toDocgenExamplesCompilerOptionsJson")
```

**Signature**

```ts
declare const toDocgenExamplesCompilerOptionsJson: (options: CanonicalDocgenExamplesCompilerOptions) => Readonly<Record<string, unknown>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/DocgenConfig.ts#L192)

Since v0.0.0

# utilities

## DEFAULT_DOCGEN_EXCLUDE

Default docgen exclude globs for repo packages.

**Example**

```ts
console.log("DEFAULT_DOCGEN_EXCLUDE")
```

**Signature**

```ts
declare const DEFAULT_DOCGEN_EXCLUDE: readonly ["src/internal/**/*.ts"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/DocgenConfig.ts#L59)

Since v0.0.0