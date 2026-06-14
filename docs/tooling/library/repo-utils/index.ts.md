---
title: index.ts
nav_order: 9
parent: "@beep/repo-utils"
---

## index.ts overview

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [FsUtilsLive](#fsutilslive)
- [errors](#errors)
  - [CyclicDependencyError](#cyclicdependencyerror)
  - [DomainError](#domainerror)
  - [NoSuchFileError](#nosuchfileerror)
- [models](#models)
  - [DependencyRecord](#dependencyrecord)
  - [FsUtils](#fsutils)
  - [FsUtilsShape](#fsutilsshape)
  - [GlobOptions](#globoptions)
  - [UniqueNpmDeps](#uniquenpmdeps)
  - [WorkspaceDeps](#workspacedeps)
  - [emptyWorkspaceDeps](#emptyworkspacedeps)
- [schemas](#schemas)
  - [NpmPackageJson](#npmpackagejson)
  - [PackageJson](#packagejson)
  - [PackageJsonValidationIssue](#packagejsonvalidationissue)
  - [TSConfig](#tsconfig)
  - [TSConfigBuildOptions](#tsconfigbuildoptions)
  - [TSConfigCompilerOptions](#tsconfigcompileroptions)
  - [TSConfigReference](#tsconfigreference)
  - [TSConfigTypeAcquisition](#tsconfigtypeacquisition)
  - [TSConfigWatchOptions](#tsconfigwatchoptions)
  - [TSNodeConfig](#tsnodeconfig)
  - [applyPackageJsonPatchEffect](#applypackagejsonpatcheffect)
  - [decodePackageJson](#decodepackagejson)
  - [decodePackageJsonEffect](#decodepackagejsoneffect)
  - [decodePackageJsonExit](#decodepackagejsonexit)
  - [decodeTSConfig](#decodetsconfig)
  - [decodeTSConfigEffect](#decodetsconfigeffect)
  - [decodeTSConfigExit](#decodetsconfigexit)
  - [decodeTSConfigFromJsoncTextEffect](#decodetsconfigfromjsonctexteffect)
  - [diffPackageJsonEffect](#diffpackagejsoneffect)
  - [encodePackageJsonCanonicalPrettyEffect](#encodepackagejsoncanonicalprettyeffect)
  - [encodePackageJsonEffect](#encodepackagejsoneffect)
  - [encodePackageJsonPrettyEffect](#encodepackagejsonprettyeffect)
  - [encodePackageJsonToJsonEffect](#encodepackagejsontojsoneffect)
  - [encodeTSConfigEffect](#encodetsconfigeffect)
  - [encodeTSConfigPrettyEffect](#encodetsconfigprettyeffect)
  - [encodeTSConfigToJsonEffect](#encodetsconfigtojsoneffect)
  - [getPackageJsonSchemaIssues](#getpackagejsonschemaissues)
  - [normalizePackageJsonEffect](#normalizepackagejsoneffect)
  - [npmPackageJsonJsonSchema](#npmpackagejsonjsonschema)
  - [packageJsonJsonSchema](#packagejsonjsonschema)
- [serialization](#serialization)
  - [jsonParse](#jsonparse)
  - [jsonStringifyCompact](#jsonstringifycompact)
  - [jsonStringifyPretty](#jsonstringifypretty)
- [utilities](#utilities)
  - ["./Reuse/index.js" (namespace export)](#reuseindexjs-namespace-export)
  - ["./TSMorph/index.js" (namespace export)](#tsmorphindexjs-namespace-export)
  - ["./TypeScript/index.js" (namespace export)](#typescriptindexjs-namespace-export)
  - [buildRepoDependencyIndex](#buildrepodependencyindex)
  - [collectTsConfigPaths](#collecttsconfigpaths)
  - [collectUniqueNpmDependencies](#collectuniquenpmdependencies)
  - [computeTransitiveClosure](#computetransitiveclosure)
  - [detectCycles](#detectcycles)
  - [extractWorkspaceDependencies](#extractworkspacedependencies)
  - [findRepoRoot](#findreporoot)
  - [getWorkspaceDir](#getworkspacedir)
  - [resolveWorkspaceDirs](#resolveworkspacedirs)
  - [topologicalSort](#topologicalsort)
---

# constructors

## FsUtilsLive

Live layer for the filesystem utility service.

**Example**

```ts
import { FsUtilsLive } from "@beep/repo-utils"
console.log(FsUtilsLive)
```

**Signature**

```ts
declare const FsUtilsLive: Layer<FsUtils, never, FileSystem | Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L77)

Since v0.0.0

# errors

## CyclicDependencyError

**Signature**

```ts
declare const CyclicDependencyError: typeof CyclicDependencyError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L42)

Since v0.0.0

## DomainError

**Signature**

```ts
declare const DomainError: typeof DomainError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L47)

Since v0.0.0

## NoSuchFileError

**Signature**

```ts
declare const NoSuchFileError: typeof NoSuchFileError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L52)

Since v0.0.0

# models

## DependencyRecord

**Signature**

```ts
declare const DependencyRecord: AnnotatedSchema<$Record<String, String>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L339)

Since v0.0.0

## FsUtils

Filesystem utility service tag.

**Example**

```ts
import { FsUtils } from "@beep/repo-utils"
console.log(FsUtils)
```

**Signature**

```ts
declare const FsUtils: typeof FsUtils
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L65)

Since v0.0.0

## FsUtilsShape

Service shape implemented by `FsUtils` providers.

**Example**

```ts
import type { FsUtilsShape } from "@beep/repo-utils"
const key = "readJson" satisfies keyof FsUtilsShape
console.log(key)
```

**Signature**

```ts
declare const FsUtilsShape: FsUtilsShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L90)

Since v0.0.0

## GlobOptions

Options accepted by filesystem glob helpers.

**Example**

```ts
import { GlobOptions } from "@beep/repo-utils"
const options = GlobOptions.make({ cwd: "src" })
console.log(options.cwd)
```

**Signature**

```ts
declare const GlobOptions: typeof GlobOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L103)

Since v0.0.0

## UniqueNpmDeps

Result model for unique NPM dependency aggregation.

**Example**

```ts
import { UniqueNpmDeps } from "@beep/repo-utils"
const deps = UniqueNpmDeps.make({
  dependencies: ["effect"],
  devDependencies: ["vitest"]
})
console.log(deps)
```

**Signature**

```ts
declare const UniqueNpmDeps: typeof UniqueNpmDeps
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L399)

Since v0.0.0

## WorkspaceDeps

**Signature**

```ts
declare const WorkspaceDeps: typeof WorkspaceDeps
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L349)

Since v0.0.0

## emptyWorkspaceDeps

**Signature**

```ts
declare const emptyWorkspaceDeps: (packageName: string) => WorkspaceDeps
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L344)

Since v0.0.0

# schemas

## NpmPackageJson

**Signature**

```ts
declare const NpmPackageJson: typeof NpmPackageJson
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L201)

Since v0.0.0

## PackageJson

**Signature**

```ts
declare const PackageJson: typeof PackageJson
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L206)

Since v0.0.0

## PackageJsonValidationIssue

**Signature**

```ts
declare const PackageJsonValidationIssue: typeof PackageJsonValidationIssue
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L247)

Since v0.0.0

## TSConfig

**Signature**

```ts
declare const TSConfig: typeof TSConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L298)

Since v0.0.0

## TSConfigBuildOptions

**Signature**

```ts
declare const TSConfigBuildOptions: typeof TSConfigBuildOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L303)

Since v0.0.0

## TSConfigCompilerOptions

**Signature**

```ts
declare const TSConfigCompilerOptions: typeof TSConfigCompilerOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L308)

Since v0.0.0

## TSConfigReference

**Signature**

```ts
declare const TSConfigReference: typeof TSConfigReference
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L313)

Since v0.0.0

## TSConfigTypeAcquisition

**Signature**

```ts
declare const TSConfigTypeAcquisition: typeof TSConfigTypeAcquisition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L318)

Since v0.0.0

## TSConfigWatchOptions

**Signature**

```ts
declare const TSConfigWatchOptions: typeof TSConfigWatchOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L323)

Since v0.0.0

## TSNodeConfig

**Signature**

```ts
declare const TSNodeConfig: typeof TSNodeConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L328)

Since v0.0.0

## applyPackageJsonPatchEffect

**Signature**

```ts
declare const applyPackageJsonPatchEffect: { (patch: JsonPatch): (base: unknown) => Effect<PackageJson.Type, SchemaError | DomainError>; (base: unknown, patch: JsonPatch): Effect<PackageJson.Type, SchemaError | DomainError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L217)

Since v0.0.0

## decodePackageJson

**Signature**

```ts
declare const decodePackageJson: (input: unknown) => PackageJson.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L171)

Since v0.0.0

## decodePackageJsonEffect

**Signature**

```ts
declare const decodePackageJsonEffect: (input: unknown) => Effect<PackageJson.Type, SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L176)

Since v0.0.0

## decodePackageJsonExit

**Signature**

```ts
declare const decodePackageJsonExit: (input: unknown) => Exit<PackageJson.Type, SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L181)

Since v0.0.0

## decodeTSConfig

**Signature**

```ts
declare const decodeTSConfig: (input: unknown) => TSConfig.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L263)

Since v0.0.0

## decodeTSConfigEffect

**Signature**

```ts
declare const decodeTSConfigEffect: (input: unknown) => Effect<TSConfig.Type, SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L268)

Since v0.0.0

## decodeTSConfigExit

**Signature**

```ts
declare const decodeTSConfigExit: (input: unknown) => Exit<TSConfig.Type, SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L273)

Since v0.0.0

## decodeTSConfigFromJsoncTextEffect

**Signature**

```ts
declare const decodeTSConfigFromJsoncTextEffect: (input: string) => Effect<TSConfig.Type, SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L278)

Since v0.0.0

## diffPackageJsonEffect

**Signature**

```ts
declare const diffPackageJsonEffect: { (after: unknown): (before: unknown) => Effect<JsonPatch, SchemaError>; (before: unknown, after: unknown): Effect<JsonPatch, SchemaError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L222)

Since v0.0.0

## encodePackageJsonCanonicalPrettyEffect

**Signature**

```ts
declare const encodePackageJsonCanonicalPrettyEffect: (input: unknown) => Effect<string, SchemaError | DomainError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L227)

Since v0.0.0

## encodePackageJsonEffect

**Signature**

```ts
declare const encodePackageJsonEffect: (input: unknown) => Effect<PackageJson.Encoded, SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L186)

Since v0.0.0

## encodePackageJsonPrettyEffect

**Signature**

```ts
declare const encodePackageJsonPrettyEffect: (input: unknown) => Effect<string, SchemaError | DomainError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L191)

Since v0.0.0

## encodePackageJsonToJsonEffect

**Signature**

```ts
declare const encodePackageJsonToJsonEffect: (input: unknown) => Effect<string, SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L196)

Since v0.0.0

## encodeTSConfigEffect

**Signature**

```ts
declare const encodeTSConfigEffect: (input: unknown) => Effect<TSConfig.Encoded, SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L283)

Since v0.0.0

## encodeTSConfigPrettyEffect

**Signature**

```ts
declare const encodeTSConfigPrettyEffect: (input: unknown) => Effect<string, SchemaError | DomainError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L288)

Since v0.0.0

## encodeTSConfigToJsonEffect

**Signature**

```ts
declare const encodeTSConfigToJsonEffect: (input: unknown) => Effect<string, SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L293)

Since v0.0.0

## getPackageJsonSchemaIssues

**Signature**

```ts
declare const getPackageJsonSchemaIssues: (error: SchemaError) => ReadonlyArray<PackageJsonValidationIssue>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L232)

Since v0.0.0

## normalizePackageJsonEffect

**Signature**

```ts
declare const normalizePackageJsonEffect: (input: unknown) => Effect<PackageJson.Encoded, SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L237)

Since v0.0.0

## npmPackageJsonJsonSchema

**Signature**

```ts
declare const npmPackageJsonJsonSchema: Document<"draft-2020-12">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L242)

Since v0.0.0

## packageJsonJsonSchema

**Signature**

```ts
declare const packageJsonJsonSchema: Document<"draft-2020-12">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L252)

Since v0.0.0

# serialization

## jsonParse

**Signature**

```ts
declare const jsonParse: (input: string) => Effect<unknown, DomainError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L134)

Since v0.0.0

## jsonStringifyCompact

**Signature**

```ts
declare const jsonStringifyCompact: (value: unknown) => Effect<string, DomainError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L139)

Since v0.0.0

## jsonStringifyPretty

**Signature**

```ts
declare const jsonStringifyPretty: (value: unknown) => Effect<string, DomainError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L144)

Since v0.0.0

# utilities

## "./Reuse/index.js" (namespace export)

Re-exports all named exports from the "./Reuse/index.js" module.

**Signature**

```ts
export * from "./Reuse/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L150)

Since v0.0.0

## "./TSMorph/index.js" (namespace export)

Re-exports all named exports from the "./TSMorph/index.js" module.

**Signature**

```ts
export * from "./TSMorph/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L355)

Since v0.0.0

## "./TypeScript/index.js" (namespace export)

Re-exports all named exports from the "./TypeScript/index.js" module.

**Signature**

```ts
export * from "./TypeScript/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L371)

Since v0.0.0

## buildRepoDependencyIndex

**Signature**

```ts
declare const buildRepoDependencyIndex: (rootDir: string) => Effect<HashMap<string, WorkspaceDeps>, NoSuchFileError | DomainError, FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L31)

Since v0.0.0

## collectTsConfigPaths

**Signature**

```ts
declare const collectTsConfigPaths: (rootDir: string) => Effect<HashMap<string, ReadonlyArray<string>>, NoSuchFileError | DomainError, FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L365)

Since v0.0.0

## collectUniqueNpmDependencies

Collect unique NPM dependency names from the workspace graph.

**Example**

```ts
import { collectUniqueNpmDependencies } from "@beep/repo-utils"
console.log(collectUniqueNpmDependencies)
```

**Signature**

```ts
declare const collectUniqueNpmDependencies: (rootDir: string) => Effect<UniqueNpmDeps, NoSuchFileError | DomainError, FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L383)

Since v0.0.0

## computeTransitiveClosure

**Signature**

```ts
declare const computeTransitiveClosure: { (pkg: string): (adjacencyList: HashMap<string, HashSet<string>>) => Effect<HashSet<string>>; (adjacencyList: HashMap<string, HashSet<string>>, pkg: string): Effect<HashSet<string>>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L113)

Since v0.0.0

## detectCycles

**Signature**

```ts
declare const detectCycles: (adjacencyList: HashMap<string, HashSet<string>>) => Effect<ReadonlyArray<ReadonlyArray<string>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L118)

Since v0.0.0

## extractWorkspaceDependencies

**Signature**

```ts
declare const extractWorkspaceDependencies: { (workspaceNames: HashSet<string>): (packageJson: PackageJson) => WorkspaceDeps; (packageJson: PackageJson, workspaceNames: HashSet<string>): WorkspaceDeps; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L20)

Since v0.0.0

## findRepoRoot

**Signature**

```ts
declare const findRepoRoot: (startFrom?: undefined | string) => Effect<string, NoSuchFileError, FileSystem>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L160)

Since v0.0.0

## getWorkspaceDir

**Signature**

```ts
declare const getWorkspaceDir: { (rootDir: string, name: string): Effect<Option<string>, NoSuchFileError | DomainError, FsUtils>; (name: string): (rootDir: string) => Effect<Option<string>, NoSuchFileError | DomainError, FsUtils>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L409)

Since v0.0.0

## resolveWorkspaceDirs

**Signature**

```ts
declare const resolveWorkspaceDirs: (rootDir: string) => Effect<HashMap<string, string>, NoSuchFileError | DomainError, FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L414)

Since v0.0.0

## topologicalSort

**Signature**

```ts
declare const topologicalSort: (adjacencyList: HashMap<string, HashSet<string>>) => Effect<ReadonlyArray<string>, CyclicDependencyError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/index.ts#L123)

Since v0.0.0