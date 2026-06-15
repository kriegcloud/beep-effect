---
title: PackageJson.ts
nav_order: 50
parent: "@beep/repo-utils"
---

## PackageJson.ts overview

Type-safe package.json schemas using Effect v4 Schema.

The exported `NpmPackageJson` schema models the npm/package.json surface we
intentionally support from SchemaStore and npm docs. `PackageJson` extends it
with repo-local top-level fields used in this monorepo.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Author (type alias)](#author-type-alias)
  - [Bin (type alias)](#bin-type-alias)
  - [Browser (type alias)](#browser-type-alias)
  - [Bugs (type alias)](#bugs-type-alias)
  - [BundleDependencies (type alias)](#bundledependencies-type-alias)
  - [Contributors (type alias)](#contributors-type-alias)
  - [DevEngineDependency (type alias)](#devenginedependency-type-alias)
  - [DevEngines (type alias)](#devengines-type-alias)
  - [Directories (type alias)](#directories-type-alias)
  - [Funding (type alias)](#funding-type-alias)
  - [Maintainers (type alias)](#maintainers-type-alias)
  - [Man (type alias)](#man-type-alias)
  - [NpmPackageJson (namespace)](#npmpackagejson-namespace)
    - [Type (type alias)](#type-type-alias)
    - [Encoded (type alias)](#encoded-type-alias)
  - [PackageExports (type alias)](#packageexports-type-alias)
  - [PackageImports (type alias)](#packageimports-type-alias)
  - [PackageJson (namespace)](#packagejson-namespace)
    - [Type (type alias)](#type-type-alias-1)
    - [Encoded (type alias)](#encoded-type-alias-1)
  - [PeerDependenciesMeta (type alias)](#peerdependenciesmeta-type-alias)
  - [Person (type alias)](#person-type-alias)
  - [PublishConfig (type alias)](#publishconfig-type-alias)
  - [Repository (type alias)](#repository-type-alias)
  - [SideEffects (type alias)](#sideeffects-type-alias)
  - [TypesVersions (type alias)](#typesversions-type-alias)
  - [Workspaces (type alias)](#workspaces-type-alias)
- [validation](#validation)
  - [Author](#author)
  - [Bin](#bin)
  - [Browser](#browser)
  - [Bugs](#bugs)
  - [BundleDependencies](#bundledependencies)
  - [Contributors](#contributors)
  - [DevEngineDependency](#devenginedependency)
  - [DevEngines](#devengines)
  - [Directories](#directories)
  - [Funding](#funding)
  - [Maintainers](#maintainers)
  - [Man](#man)
  - [NpmPackageJson (class)](#npmpackagejson-class)
  - [PackageExports](#packageexports)
  - [PackageImports](#packageimports)
  - [PackageJson (class)](#packagejson-class)
  - [PeerDependenciesMeta](#peerdependenciesmeta)
  - [Person](#person)
  - [PublishConfig](#publishconfig)
  - [Repository](#repository)
  - [SideEffects](#sideeffects)
  - [TypesVersions](#typesversions)
  - [Workspaces](#workspaces)
  - [decodePackageJson](#decodepackagejson)
  - [decodePackageJsonEffect](#decodepackagejsoneffect)
  - [decodePackageJsonExit](#decodepackagejsonexit)
  - [encodePackageJsonEffect](#encodepackagejsoneffect)
  - [encodePackageJsonPrettyEffect](#encodepackagejsonprettyeffect)
  - [encodePackageJsonToJsonEffect](#encodepackagejsontojsoneffect)
---

# models

## Author (type alias)

Runtime type for `Author`.

**Example**

```ts
import type { Author } from "@beep/repo-utils/schemas/PackageJson"
const acceptAuthor = (_value: Author) => undefined
console.log(acceptAuthor)
```

**Signature**

```ts
type Author = (typeof Author)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1082)

Since v0.0.0

## Bin (type alias)

Runtime type for `Bin`.

**Example**

```ts
import type { Bin } from "@beep/repo-utils/schemas/PackageJson"
const acceptBin = (_value: Bin) => undefined
console.log(acceptBin)
```

**Signature**

```ts
type Bin = (typeof Bin)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1160)

Since v0.0.0

## Browser (type alias)

Runtime type for `Browser`.

**Example**

```ts
import type { Browser } from "@beep/repo-utils/schemas/PackageJson"
const acceptBrowser = (_value: Browser) => undefined
console.log(acceptBrowser)
```

**Signature**

```ts
type Browser = (typeof Browser)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1173)

Since v0.0.0

## Bugs (type alias)

Runtime type for `Bugs`.

**Example**

```ts
import type { Bugs } from "@beep/repo-utils/schemas/PackageJson"
const acceptBugs = (_value: Bugs) => undefined
console.log(acceptBugs)
```

**Signature**

```ts
type Bugs = (typeof Bugs)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1134)

Since v0.0.0

## BundleDependencies (type alias)

Runtime type for `BundleDependencies`.

**Example**

```ts
import type { BundleDependencies } from "@beep/repo-utils/schemas/PackageJson"
const acceptBundleDependencies = (_value: BundleDependencies) => undefined
console.log(acceptBundleDependencies)
```

**Signature**

```ts
type BundleDependencies = (typeof BundleDependencies)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1225)

Since v0.0.0

## Contributors (type alias)

Runtime type for `Contributors`.

**Example**

```ts
import type { Contributors } from "@beep/repo-utils/schemas/PackageJson"
const acceptContributors = (_value: Contributors) => undefined
console.log(acceptContributors)
```

**Signature**

```ts
type Contributors = (typeof Contributors)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1095)

Since v0.0.0

## DevEngineDependency (type alias)

Runtime type for `DevEngineDependency`.

**Example**

```ts
import type { DevEngineDependency } from "@beep/repo-utils/schemas/PackageJson"
const acceptDevEngineDependency = (_value: DevEngineDependency) => undefined
console.log(acceptDevEngineDependency)
```

**Signature**

```ts
type DevEngineDependency = (typeof DevEngineDependency)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1264)

Since v0.0.0

## DevEngines (type alias)

Runtime type for `DevEngines`.

**Example**

```ts
import type { DevEngines } from "@beep/repo-utils/schemas/PackageJson"
const acceptDevEngines = (_value: DevEngines) => undefined
console.log(acceptDevEngines)
```

**Signature**

```ts
type DevEngines = (typeof DevEngines)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1277)

Since v0.0.0

## Directories (type alias)

Runtime type for `Directories`.

**Example**

```ts
import type { Directories } from "@beep/repo-utils/schemas/PackageJson"
const acceptDirectories = (_value: Directories) => undefined
console.log(acceptDirectories)
```

**Signature**

```ts
type Directories = (typeof Directories)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1186)

Since v0.0.0

## Funding (type alias)

Runtime type for `Funding`.

**Example**

```ts
import type { Funding } from "@beep/repo-utils/schemas/PackageJson"
const acceptFunding = (_value: Funding) => undefined
console.log(acceptFunding)
```

**Signature**

```ts
type Funding = (typeof Funding)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1147)

Since v0.0.0

## Maintainers (type alias)

Runtime type for `Maintainers`.

**Example**

```ts
import type { Maintainers } from "@beep/repo-utils/schemas/PackageJson"
const acceptMaintainers = (_value: Maintainers) => undefined
console.log(acceptMaintainers)
```

**Signature**

```ts
type Maintainers = (typeof Maintainers)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1108)

Since v0.0.0

## Man (type alias)

Runtime type for `Man`.

**Example**

```ts
import type { Man } from "@beep/repo-utils/schemas/PackageJson"
const acceptMan = (_value: Man) => undefined
console.log(acceptMan)
```

**Signature**

```ts
type Man = (typeof Man)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1199)

Since v0.0.0

## NpmPackageJson (namespace)

Namespace helpers for the strict npm package-json schema.

**Example**

```ts
import type { NpmPackageJson } from "@beep/repo-utils/schemas/PackageJson"
const readName = (value: NpmPackageJson.Type) => value.name
console.log(readName)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1011)

Since v0.0.0

### Type (type alias)

Decoded runtime type for `NpmPackageJson`.

**Signature**

```ts
type Type = S.Schema.Type<typeof NpmPackageJson>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1018)

Since v0.0.0

### Encoded (type alias)

Encoded representation for `NpmPackageJson`.

**Signature**

```ts
type Encoded = S.Codec.Encoded<typeof NpmPackageJson>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1025)

Since v0.0.0

## PackageExports (type alias)

Runtime type for `PackageExports`.

**Example**

```ts
import type { PackageExports } from "@beep/repo-utils/schemas/PackageJson"
const acceptPackageExports = (_value: PackageExports) => undefined
console.log(acceptPackageExports)
```

**Signature**

```ts
type PackageExports = (typeof PackageExports)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1290)

Since v0.0.0

## PackageImports (type alias)

Runtime type for `PackageImports`.

**Example**

```ts
import type { PackageImports } from "@beep/repo-utils/schemas/PackageJson"
const acceptPackageImports = (_value: PackageImports) => undefined
console.log(acceptPackageImports)
```

**Signature**

```ts
type PackageImports = (typeof PackageImports)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1303)

Since v0.0.0

## PackageJson (namespace)

Namespace helpers for the repo-aware package-json schema.

**Example**

```ts
import type { PackageJson } from "@beep/repo-utils/schemas/PackageJson"
const readName = (value: PackageJson.Type) => value.name
console.log(readName)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1040)

Since v0.0.0

### Type (type alias)

Decoded runtime type for `PackageJson`.

**Signature**

```ts
type Type = S.Schema.Type<typeof PackageJson>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1047)

Since v0.0.0

### Encoded (type alias)

Encoded representation for `PackageJson`.

**Signature**

```ts
type Encoded = S.Codec.Encoded<typeof PackageJson>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1054)

Since v0.0.0

## PeerDependenciesMeta (type alias)

Runtime type for `PeerDependenciesMeta`.

**Example**

```ts
import type { PeerDependenciesMeta } from "@beep/repo-utils/schemas/PackageJson"
const acceptPeerDependenciesMeta = (_value: PeerDependenciesMeta) => undefined
console.log(acceptPeerDependenciesMeta)
```

**Signature**

```ts
type PeerDependenciesMeta = (typeof PeerDependenciesMeta)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1238)

Since v0.0.0

## Person (type alias)

Runtime type for `Person`.

**Example**

```ts
import type { Person } from "@beep/repo-utils/schemas/PackageJson"
const acceptPerson = (_value: Person) => undefined
console.log(acceptPerson)
```

**Signature**

```ts
type Person = (typeof Person)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1069)

Since v0.0.0

## PublishConfig (type alias)

Runtime type for `PublishConfig`.

**Example**

```ts
import type { PublishConfig } from "@beep/repo-utils/schemas/PackageJson"
const acceptPublishConfig = (_value: PublishConfig) => undefined
console.log(acceptPublishConfig)
```

**Signature**

```ts
type PublishConfig = (typeof PublishConfig)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1329)

Since v0.0.0

## Repository (type alias)

Runtime type for `Repository`.

**Example**

```ts
import type { Repository } from "@beep/repo-utils/schemas/PackageJson"
const acceptRepository = (_value: Repository) => undefined
console.log(acceptRepository)
```

**Signature**

```ts
type Repository = (typeof Repository)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1121)

Since v0.0.0

## SideEffects (type alias)

Runtime type for `SideEffects`.

**Example**

```ts
import type { SideEffects } from "@beep/repo-utils/schemas/PackageJson"
const acceptSideEffects = (_value: SideEffects) => undefined
console.log(acceptSideEffects)
```

**Signature**

```ts
type SideEffects = (typeof SideEffects)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1212)

Since v0.0.0

## TypesVersions (type alias)

Runtime type for `TypesVersions`.

**Example**

```ts
import type { TypesVersions } from "@beep/repo-utils/schemas/PackageJson"
const acceptTypesVersions = (_value: TypesVersions) => undefined
console.log(acceptTypesVersions)
```

**Signature**

```ts
type TypesVersions = (typeof TypesVersions)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1251)

Since v0.0.0

## Workspaces (type alias)

Runtime type for `Workspaces`.

**Example**

```ts
import type { Workspaces } from "@beep/repo-utils/schemas/PackageJson"
const acceptWorkspaces = (_value: Workspaces) => undefined
console.log(acceptWorkspaces)
```

**Signature**

```ts
type Workspaces = (typeof Workspaces)["Type"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1316)

Since v0.0.0

# validation

## Author

The package author field.

**Example**

```ts
import { Author } from "@beep/repo-utils/schemas/PackageJson"
const schema = Author
console.log(schema)
```

**Signature**

```ts
declare const Author: AnnotatedSchema<S.Union<readonly [S.String, typeof PersonObject]> & SchemaStatics<S.Union<readonly [S.String, typeof PersonObject]>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L299)

Since v0.0.0

## Bin

Schema for the `bin` field.

**Example**

```ts
import { Bin } from "@beep/repo-utils/schemas/PackageJson"
const schema = Bin
console.log(schema)
```

**Signature**

```ts
declare const Bin: AnnotatedSchema<S.Union<readonly [S.String, AnnotatedSchema<S.$Record<S.String, S.String>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L416)

Since v0.0.0

## Browser

Schema for the `browser` field.

**Example**

```ts
import { Browser } from "@beep/repo-utils/schemas/PackageJson"
const schema = Browser
console.log(schema)
```

**Signature**

```ts
declare const Browser: AnnotatedSchema<S.Union<readonly [S.String, S.$Record<S.String, AnnotatedSchema<S.Union<readonly [S.String, S.Literal<false>]>>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L435)

Since v0.0.0

## Bugs

Schema for the `bugs` field.

**Example**

```ts
import { Bugs } from "@beep/repo-utils/schemas/PackageJson"
const schema = Bugs
console.log(schema)
```

**Signature**

```ts
declare const Bugs: AnnotatedSchema<S.Union<readonly [S.String, typeof BugsObject]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L376)

Since v0.0.0

## BundleDependencies

Schema for the `bundleDependencies` / `bundledDependencies` fields.

**Example**

```ts
import { BundleDependencies } from "@beep/repo-utils/schemas/PackageJson"
const schema = BundleDependencies
console.log(schema)
```

**Signature**

```ts
declare const BundleDependencies: AnnotatedSchema<S.Union<readonly [S.Boolean, AnnotatedSchema<S.$Array<S.String>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L539)

Since v0.0.0

## Contributors

The package contributors field.

**Example**

```ts
import { Contributors } from "@beep/repo-utils/schemas/PackageJson"
const schema = Contributors
console.log(schema)
```

**Signature**

```ts
declare const Contributors: AnnotatedSchema<S.$Array<AnnotatedSchema<S.Union<readonly [S.String, typeof PersonObject]>>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L318)

Since v0.0.0

## DevEngineDependency

Schema for a development environment requirement entry.

**Example**

```ts
import { DevEngineDependency } from "@beep/repo-utils/schemas/PackageJson"
const schema = DevEngineDependency
console.log(schema)
```

**Signature**

```ts
declare const DevEngineDependency: typeof DevEngineDependencyShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L618)

Since v0.0.0

## DevEngines

Schema for the `devEngines` field.

**Example**

```ts
import { DevEngines } from "@beep/repo-utils/schemas/PackageJson"
const schema = DevEngines
console.log(schema)
```

**Signature**

```ts
declare const DevEngines: typeof DevEnginesShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L660)

Since v0.0.0

## Directories

Schema for the `directories` field.

**Example**

```ts
import { Directories } from "@beep/repo-utils/schemas/PackageJson"
const schema = Directories
console.log(schema)
```

**Signature**

```ts
declare const Directories: typeof DirectoriesShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L476)

Since v0.0.0

## Funding

Schema for the `funding` field.

**Example**

```ts
import { Funding } from "@beep/repo-utils/schemas/PackageJson"
const schema = Funding
console.log(schema)
```

**Signature**

```ts
declare const Funding: AnnotatedSchema<S.Union<readonly [S.String, typeof FundingEntry, S.NonEmptyArray<S.Union<readonly [S.String, typeof FundingEntry]>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L396)

Since v0.0.0

## Maintainers

The package maintainers field.

**Example**

```ts
import { Maintainers } from "@beep/repo-utils/schemas/PackageJson"
const schema = Maintainers
console.log(schema)
```

**Signature**

```ts
declare const Maintainers: AnnotatedSchema<S.$Array<AnnotatedSchema<S.Union<readonly [S.String, typeof PersonObject]>>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L337)

Since v0.0.0

## Man

Schema for the `man` field.

**Example**

```ts
import { Man } from "@beep/repo-utils/schemas/PackageJson"
const schema = Man
console.log(schema)
```

**Signature**

```ts
declare const Man: AnnotatedSchema<S.Union<readonly [S.String, AnnotatedSchema<S.$Array<S.String>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L501)

Since v0.0.0

## NpmPackageJson (class)

Type-safe schema for npm package.json files.

Unexpected keys are rejected by the exported decode helpers.

**Example**

```ts
import { NpmPackageJson } from "@beep/repo-utils/schemas/PackageJson"
const schema = NpmPackageJson
console.log(schema)
```

**Signature**

```ts
declare class NpmPackageJson
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L969)

Since v0.0.0

## PackageExports

Schema for the `exports` field.

**Example**

```ts
import { PackageExports } from "@beep/repo-utils/schemas/PackageJson"
const schema = PackageExports
console.log(schema)
```

**Signature**

```ts
declare const PackageExports: AnnotatedSchema<S.Union<readonly [AnnotatedSchema<S.Union<readonly [AnnotatedSchema<S.String>, S.Null]>>, AnnotatedSchema<S.$Record<AnnotatedSchema<S.String>, S.Codec<PackageExportsEntryOrFallback, PackageExportsEntryOrFallback, never, never>>>, S.Codec<{ readonly [key: string]: PackageExportsEntryOrFallback; }, { readonly [key: string]: PackageExportsEntryOrFallback; }, never, never>, AnnotatedSchema<S.NonEmptyArray<S.Codec<PackageExportsEntry, PackageExportsEntry, never, never>>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L728)

Since v0.0.0

## PackageImports

Schema for the `imports` field.

**Example**

```ts
import { PackageImports } from "@beep/repo-utils/schemas/PackageJson"
const schema = PackageImports
console.log(schema)
```

**Signature**

```ts
declare const PackageImports: AnnotatedSchema<S.$Record<AnnotatedSchema<S.String>, S.Codec<PackageImportsEntryOrFallback, PackageImportsEntryOrFallback, never, never>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L800)

Since v0.0.0

## PackageJson (class)

Type-safe schema for this repo's package.json files.

Extends the npm surface with repo-local metadata fields used by the monorepo.

**Example**

```ts
import { PackageJson } from "@beep/repo-utils/schemas/PackageJson"
const schema = PackageJson
console.log(schema)
```

**Signature**

```ts
declare class PackageJson
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L991)

Since v0.0.0

## PeerDependenciesMeta

Schema for the `peerDependenciesMeta` field.

**Example**

```ts
import { PeerDependenciesMeta } from "@beep/repo-utils/schemas/PackageJson"
const schema = PeerDependenciesMeta
console.log(schema)
```

**Signature**

```ts
declare const PeerDependenciesMeta: AnnotatedSchema<S.$Record<S.String, S.StructWithRest<AnnotatedSchema<S.Struct<{ readonly optional: S.optionalKey<S.Boolean>; }>>, readonly [S.$Record<S.String, S.Codec<Json, Json, never, never>>]>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L558)

Since v0.0.0

## Person

A person involved with the package, represented as a string or structured object.

**Example**

```ts
import { Person } from "@beep/repo-utils/schemas/PackageJson"
const schema = Person
console.log(schema)
```

**Signature**

```ts
declare const Person: AnnotatedSchema<S.Union<readonly [S.String, typeof PersonObject]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L279)

Since v0.0.0

## PublishConfig

Schema for the `publishConfig` field.

**Example**

```ts
import { PublishConfig } from "@beep/repo-utils/schemas/PackageJson"
const schema = PublishConfig
console.log(schema)
```

**Signature**

```ts
declare const PublishConfig: AnnotatedSchema<S.StructWithRest<AnnotatedSchema<S.Struct<{ readonly access: S.optionalKey<S.Literals<readonly ["public", "restricted"]>>; readonly tag: S.optionalKey<S.String>; readonly registry: S.optionalKey<S.String>; readonly provenance: S.optionalKey<S.Boolean>; readonly bin: S.optionalKey<AnnotatedSchema<S.Union<readonly [S.String, AnnotatedSchema<S.$Record<S.String, S.String>>]>>>; readonly exports: S.optionalKey<AnnotatedSchema<S.Union<readonly [AnnotatedSchema<S.Union<readonly [AnnotatedSchema<S.String>, S.Null]>>, AnnotatedSchema<S.$Record<AnnotatedSchema<S.String>, S.Codec<PackageExportsEntryOrFallback, PackageExportsEntryOrFallback, never, never>>>, S.Codec<{ readonly [key: string]: PackageExportsEntryOrFallback; }, { readonly [key: string]: PackageExportsEntryOrFallback; }, never, never>, AnnotatedSchema<S.NonEmptyArray<S.Codec<PackageExportsEntry, PackageExportsEntry, never, never>>>]>>>; }>>, readonly [S.$Record<S.String, S.Codec<Json, Json, never, never>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L878)

Since v0.0.0

## Repository

Schema for the `repository` field.

**Example**

```ts
import { Repository } from "@beep/repo-utils/schemas/PackageJson"
const schema = Repository
console.log(schema)
```

**Signature**

```ts
declare const Repository: AnnotatedSchema<S.Union<readonly [S.String, typeof RepositoryObject]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L356)

Since v0.0.0

## SideEffects

Schema for the `sideEffects` field.

**Example**

```ts
import { SideEffects } from "@beep/repo-utils/schemas/PackageJson"
const schema = SideEffects
console.log(schema)
```

**Signature**

```ts
declare const SideEffects: AnnotatedSchema<S.Union<readonly [S.Boolean, AnnotatedSchema<S.$Array<S.String>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L520)

Since v0.0.0

## TypesVersions

Schema for the `typesVersions` field.

**Example**

```ts
import { TypesVersions } from "@beep/repo-utils/schemas/PackageJson"
const schema = TypesVersions
console.log(schema)
```

**Signature**

```ts
declare const TypesVersions: AnnotatedSchema<S.$Record<S.String, S.$Record<S.String, AnnotatedSchema<S.$Array<S.String>>>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L580)

Since v0.0.0

## Workspaces

Schema for the `workspaces` field.

**Example**

```ts
import { Workspaces } from "@beep/repo-utils/schemas/PackageJson"
const schema = Workspaces
console.log(schema)
```

**Signature**

```ts
declare const Workspaces: AnnotatedSchema<S.Union<readonly [AnnotatedSchema<S.$Array<S.String>>, typeof WorkspacesObject]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L858)

Since v0.0.0

## decodePackageJson

Synchronously decode an unknown value into a strict `PackageJson`.
Throws a `SchemaError` if validation fails.

**Example**

```ts
import { decodePackageJson } from "@beep/repo-utils/schemas/PackageJson"
const packageJson = decodePackageJson({ name: "@beep/example" })
console.log(packageJson)
```

**Signature**

```ts
declare const decodePackageJson: (input: unknown) => PackageJson.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1352)

Since v0.0.0

## decodePackageJsonEffect

Decode an unknown value into a strict `PackageJson` as an Effect.

**Example**

```ts
import { decodePackageJsonEffect } from "@beep/repo-utils/schemas/PackageJson"
const program = decodePackageJsonEffect({ name: "@beep/example" })
console.log(program)
```

**Signature**

```ts
declare const decodePackageJsonEffect: (input: unknown) => Effect.Effect<PackageJson.Type, S.SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1387)

Since v0.0.0

## decodePackageJsonExit

Synchronously decode an unknown value into a strict `PackageJson`,
returning an `Exit` instead of throwing.

**Example**

```ts
import { decodePackageJsonExit } from "@beep/repo-utils/schemas/PackageJson"
const exit = decodePackageJsonExit({ name: "@beep/example" })
console.log(exit)
```

**Signature**

```ts
declare const decodePackageJsonExit: (input: unknown) => Exit.Exit<PackageJson.Type, S.SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1370)

Since v0.0.0

## encodePackageJsonEffect

Encode a strict `PackageJson` value back to its encoded form as an Effect.

The input is first decoded with strict excess-property rejection so callers
do not accidentally encode malformed package.json objects.

**Example**

```ts
import { encodePackageJsonEffect } from "@beep/repo-utils/schemas/PackageJson"
const program = encodePackageJsonEffect({ name: "@beep/example" })
console.log(program)
```

**Signature**

```ts
declare const encodePackageJsonEffect: (input: unknown) => Effect.Effect<PackageJson.Encoded, S.SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1407)

Since v0.0.0

## encodePackageJsonPrettyEffect

Encode a strict `PackageJson` value to a pretty-printed JSON string.

**Example**

```ts
import { encodePackageJsonPrettyEffect } from "@beep/repo-utils/schemas/PackageJson"
const program = encodePackageJsonPrettyEffect({ name: "@beep/example" })
console.log(program)
```

**Signature**

```ts
declare const encodePackageJsonPrettyEffect: (input: unknown) => Effect.Effect<string, S.SchemaError | DomainError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1449)

Since v0.0.0

## encodePackageJsonToJsonEffect

Encode a strict `PackageJson` value to a compact JSON string as an Effect.

**Example**

```ts
import { encodePackageJsonToJsonEffect } from "@beep/repo-utils/schemas/PackageJson"
const program = encodePackageJsonToJsonEffect({ name: "@beep/example" })
console.log(program)
```

**Signature**

```ts
declare const encodePackageJsonToJsonEffect: (input: unknown) => Effect.Effect<string, S.SchemaError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/schemas/PackageJson.ts#L1428)

Since v0.0.0