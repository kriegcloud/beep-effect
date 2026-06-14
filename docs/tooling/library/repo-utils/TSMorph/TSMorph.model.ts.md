---
title: TSMorph.model.ts
nav_order: 58
parent: "@beep/repo-utils"
---

## TSMorph.model.ts overview

TSMorph request, result, and branded identifier models.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ByteLength](#bytelength)
  - [ByteLength (type alias)](#bytelength-type-alias)
  - [ByteOffset](#byteoffset)
  - [ByteOffset (type alias)](#byteoffset-type-alias)
  - [ColumnNumber](#columnnumber)
  - [ColumnNumber (type alias)](#columnnumber-type-alias)
  - [ContentHash](#contenthash)
  - [ContentHash (type alias)](#contenthash-type-alias)
  - [ContentHashFromBytes](#contenthashfrombytes)
  - [ContentHashFromSourceText](#contenthashfromsourcetext)
  - [FilePathToTsConfigFilePath](#filepathtotsconfigfilepath)
  - [FilePathToTypeScriptDeclarationFilePath](#filepathtotypescriptdeclarationfilepath)
  - [FilePathToTypeScriptFilePath](#filepathtotypescriptfilepath)
  - [FilePathToTypeScriptImplementationFilePath](#filepathtotypescriptimplementationfilepath)
  - [InternalTsMorphNode](#internaltsmorphnode)
  - [InternalTsMorphProject](#internaltsmorphproject)
  - [InternalTsMorphSourceFile](#internaltsmorphsourcefile)
  - [LineNumber](#linenumber)
  - [LineNumber (type alias)](#linenumber-type-alias)
  - [ProjectCacheKey](#projectcachekey)
  - [ProjectCacheKey (type alias)](#projectcachekey-type-alias)
  - [ProjectScopeId](#projectscopeid)
  - [ProjectScopeId (type alias)](#projectscopeid-type-alias)
  - [ProjectScopeIdParts](#projectscopeidparts)
  - [RepoRootPath](#reporootpath)
  - [RepoRootPath (type alias)](#reporootpath-type-alias)
  - [SourceText](#sourcetext)
  - [SourceText (type alias)](#sourcetext-type-alias)
  - [Symbol (class)](#symbol-class)
  - [Symbol (namespace)](#symbol-namespace)
    - [Type (type alias)](#type-type-alias)
    - [Encoded (type alias)](#encoded-type-alias)
  - [SymbolCategory](#symbolcategory)
  - [SymbolCategory (type alias)](#symbolcategory-type-alias)
  - [SymbolFilePath](#symbolfilepath)
  - [SymbolFilePath (type alias)](#symbolfilepath-type-alias)
  - [SymbolId](#symbolid)
  - [SymbolId (type alias)](#symbolid-type-alias)
  - [SymbolIdParts](#symbolidparts)
  - [SymbolInit (type alias)](#symbolinit-type-alias)
  - [SymbolKind](#symbolkind)
  - [SymbolKind (type alias)](#symbolkind-type-alias)
  - [SymbolKindToCategory](#symbolkindtocategory)
  - [SymbolKindToCategory (type alias)](#symbolkindtocategory-type-alias)
  - [SymbolNameSegment](#symbolnamesegment)
  - [SymbolNameSegment (type alias)](#symbolnamesegment-type-alias)
  - [SymbolQualifiedName](#symbolqualifiedname)
  - [SymbolQualifiedName (type alias)](#symbolqualifiedname-type-alias)
  - [TsConfigFilePath](#tsconfigfilepath)
  - [TsConfigFilePath (type alias)](#tsconfigfilepath-type-alias)
  - [TsMorphDiagnostic](#tsmorphdiagnostic)
  - [TsMorphDiagnostic (type alias)](#tsmorphdiagnostic-type-alias)
  - [TsMorphDiagnosticCategory](#tsmorphdiagnosticcategory)
  - [TsMorphDiagnosticCategory (type alias)](#tsmorphdiagnosticcategory-type-alias)
  - [TsMorphDiagnosticsRequest (class)](#tsmorphdiagnosticsrequest-class)
  - [TsMorphDiagnosticsResult (class)](#tsmorphdiagnosticsresult-class)
  - [TsMorphFileOutline (class)](#tsmorphfileoutline-class)
  - [TsMorphFileOutlineRequest (class)](#tsmorphfileoutlinerequest-class)
  - [TsMorphProjectInspectionRequest (class)](#tsmorphprojectinspectionrequest-class)
  - [TsMorphProjectScope (class)](#tsmorphprojectscope-class)
  - [TsMorphProjectScopeRequest (class)](#tsmorphprojectscoperequest-class)
  - [TsMorphReferencePolicy](#tsmorphreferencepolicy)
  - [TsMorphReferencePolicy (type alias)](#tsmorphreferencepolicy-type-alias)
  - [TsMorphScopeEntrypoint](#tsmorphscopeentrypoint)
  - [TsMorphScopeEntrypoint (type alias)](#tsmorphscopeentrypoint-type-alias)
  - [TsMorphScopeMode](#tsmorphscopemode)
  - [TsMorphScopeMode (type alias)](#tsmorphscopemode-type-alias)
  - [TsMorphSearchLimit](#tsmorphsearchlimit)
  - [TsMorphSearchLimit (type alias)](#tsmorphsearchlimit-type-alias)
  - [TsMorphSourceTextRequest (class)](#tsmorphsourcetextrequest-class)
  - [TsMorphSourceTextResult (class)](#tsmorphsourcetextresult-class)
  - [TsMorphSymbolLookupRequest (class)](#tsmorphsymbollookuprequest-class)
  - [TsMorphSymbolLookupResult (class)](#tsmorphsymbollookupresult-class)
  - [TsMorphSymbolSearchRequest (class)](#tsmorphsymbolsearchrequest-class)
  - [TsMorphSymbolSearchResult (class)](#tsmorphsymbolsearchresult-class)
  - [TsMorphSymbolSourceRequest (class)](#tsmorphsymbolsourcerequest-class)
  - [TsMorphSymbolSourceResult (class)](#tsmorphsymbolsourceresult-class)
  - [TypeScriptDeclarationFilePath](#typescriptdeclarationfilepath)
  - [TypeScriptDeclarationFilePath (type alias)](#typescriptdeclarationfilepath-type-alias)
  - [TypeScriptFilePath](#typescriptfilepath)
  - [TypeScriptFilePath (type alias)](#typescriptfilepath-type-alias)
  - [TypeScriptImplementationFilePath](#typescriptimplementationfilepath)
  - [TypeScriptImplementationFilePath (type alias)](#typescriptimplementationfilepath-type-alias)
  - [TypeScriptImplementationFilePathToSymbolFilePath](#typescriptimplementationfilepathtosymbolfilepath)
  - [WorkspaceDirectoryPath](#workspacedirectorypath)
  - [WorkspaceDirectoryPath (type alias)](#workspacedirectorypath-type-alias)
- [utilities](#utilities)
  - [makeProjectCacheKey](#makeprojectcachekey)
  - [makeProjectScopeId](#makeprojectscopeid)
  - [makeSymbol](#makesymbol)
  - [makeSymbolId](#makesymbolid)
  - [symbolCategoryFromKind](#symbolcategoryfromkind)
---

# models

## ByteLength

Non-negative byte length schema.

**Example**

```ts
import { ByteLength } from "@beep/repo-utils"
const value = ByteLength
```

**Signature**

```ts
declare const ByteLength: AnnotatedSchema<S.brand<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">, "ByteLength">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L634)

Since v0.0.0

## ByteLength (type alias)

Branded non-negative byte length.

**Example**

```ts
import type { ByteLength } from "@beep/repo-utils"
type Example = ByteLength
```

**Signature**

```ts
type ByteLength = typeof ByteLength.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L652)

Since v0.0.0

## ByteOffset

Non-negative byte offset schema.

**Example**

```ts
import { ByteOffset } from "@beep/repo-utils"
const value = ByteOffset
```

**Signature**

```ts
declare const ByteOffset: AnnotatedSchema<S.brand<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">, "ByteOffset">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L603)

Since v0.0.0

## ByteOffset (type alias)

Branded non-negative byte offset.

**Example**

```ts
import type { ByteOffset } from "@beep/repo-utils"
type Example = ByteOffset
```

**Signature**

```ts
type ByteOffset = typeof ByteOffset.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L621)

Since v0.0.0

## ColumnNumber

Positive 1-based column number schema.

**Example**

```ts
import { ColumnNumber } from "@beep/repo-utils"
const value = ColumnNumber
```

**Signature**

```ts
declare const ColumnNumber: AnnotatedSchema<S.brand<S.Int, "ColumnNumber">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L572)

Since v0.0.0

## ColumnNumber (type alias)

Branded positive 1-based column number.

**Example**

```ts
import type { ColumnNumber } from "@beep/repo-utils"
type Example = ColumnNumber
```

**Signature**

```ts
type ColumnNumber = typeof ColumnNumber.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L590)

Since v0.0.0

## ContentHash

SHA-256 content hash schema.

**Example**

```ts
import { ContentHash } from "@beep/repo-utils"
const value = ContentHash
```

**Signature**

```ts
declare const ContentHash: AnnotatedSchema<S.brand<S.brand<S.String, "Sha256Hex">, "ContentHash">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L665)

Since v0.0.0

## ContentHash (type alias)

Branded SHA-256 content hash.

**Example**

```ts
import type { ContentHash } from "@beep/repo-utils"
type Example = ContentHash
```

**Signature**

```ts
type ContentHash = typeof ContentHash.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L683)

Since v0.0.0

## ContentHashFromBytes

Effectful one-way schema transformation from source bytes to a canonical content hash.

**Example**

```ts
import { ContentHashFromBytes } from "@beep/repo-utils"
const value = ContentHashFromBytes
```

**Signature**

```ts
declare const ContentHashFromBytes: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.brand<S.String, "Sha256Hex">, "ContentHash">>, S.Uint8Array, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1007)

Since v0.0.0

## ContentHashFromSourceText

Effectful one-way schema transformation from source text to a canonical content hash.

**Example**

```ts
import { ContentHashFromSourceText } from "@beep/repo-utils"
const value = ContentHashFromSourceText
```

**Signature**

```ts
declare const ContentHashFromSourceText: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.brand<S.String, "Sha256Hex">, "ContentHash">>, S.brand<S.NonEmptyString, "SourceText"> & SchemaStatics<S.brand<S.NonEmptyString, "SourceText">>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1038)

Since v0.0.0

## FilePathToTsConfigFilePath

Schema transformation from a generic file path to a `TsConfigFilePath`.

**Example**

```ts
import { FilePathToTsConfigFilePath } from "@beep/repo-utils"
const value = FilePathToTsConfigFilePath
```

**Signature**

```ts
declare const FilePathToTsConfigFilePath: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.brand<S.String, "FilePath">, "TsConfigFilePath">>, S.brand<S.String, "FilePath"> & SchemaStatics<S.brand<S.String, "FilePath">>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L897)

Since v0.0.0

## FilePathToTypeScriptDeclarationFilePath

Schema transformation from a generic file path to a TypeScript declaration file path.

**Example**

```ts
import { FilePathToTypeScriptDeclarationFilePath } from "@beep/repo-utils"
const value = FilePathToTypeScriptDeclarationFilePath
```

**Signature**

```ts
declare const FilePathToTypeScriptDeclarationFilePath: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.brand<S.String, "FilePath">, "TypeScriptDeclarationFilePath">>, S.brand<S.String, "FilePath"> & SchemaStatics<S.brand<S.String, "FilePath">>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L939)

Since v0.0.0

## FilePathToTypeScriptFilePath

Schema transformation from a generic file path to a TypeScript source file path.

**Example**

```ts
import { FilePathToTypeScriptFilePath } from "@beep/repo-utils"
const value = FilePathToTypeScriptFilePath
```

**Signature**

```ts
declare const FilePathToTypeScriptFilePath: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.Union<readonly [AnnotatedSchema<S.brand<S.brand<S.String, "FilePath">, "TypeScriptImplementationFilePath">>, AnnotatedSchema<S.brand<S.brand<S.String, "FilePath">, "TypeScriptDeclarationFilePath">>]>>, S.brand<S.String, "FilePath"> & SchemaStatics<S.brand<S.String, "FilePath">>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L960)

Since v0.0.0

## FilePathToTypeScriptImplementationFilePath

Schema transformation from a generic file path to a TypeScript implementation file path.

**Example**

```ts
import { FilePathToTypeScriptImplementationFilePath } from "@beep/repo-utils"
const value = FilePathToTypeScriptImplementationFilePath
```

**Signature**

```ts
declare const FilePathToTypeScriptImplementationFilePath: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.brand<S.String, "FilePath">, "TypeScriptImplementationFilePath">>, S.brand<S.String, "FilePath"> & SchemaStatics<S.brand<S.String, "FilePath">>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L918)

Since v0.0.0

## InternalTsMorphNode

Internal runtime schema for a live ts-morph Node instance.

**Example**

```ts
import { InternalTsMorphNode } from "@beep/repo-utils"
const value = InternalTsMorphNode
```

**Signature**

```ts
declare const InternalTsMorphNode: AnnotatedSchema<S.declare<TsMorphNode<ts.Node>, TsMorphNode<ts.Node>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1100)

Since v0.0.0

## InternalTsMorphProject

Internal runtime schemas.
These are intentionally not re-exported from the package entrypoint.

**Example**

```ts
import { InternalTsMorphProject } from "@beep/repo-utils"
const value = InternalTsMorphProject
```

**Signature**

```ts
declare const InternalTsMorphProject: AnnotatedSchema<S.instanceOf<Project, Project>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1064)

Since v0.0.0

## InternalTsMorphSourceFile

Internal runtime schema for a live ts-morph SourceFile instance.

**Example**

```ts
import { InternalTsMorphSourceFile } from "@beep/repo-utils"
const value = InternalTsMorphSourceFile
```

**Signature**

```ts
declare const InternalTsMorphSourceFile: AnnotatedSchema<S.declare<SourceFile, SourceFile>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1081)

Since v0.0.0

## LineNumber

Positive 1-based line number schema.

**Example**

```ts
import { LineNumber } from "@beep/repo-utils"
const value = LineNumber
```

**Signature**

```ts
declare const LineNumber: AnnotatedSchema<S.brand<S.Int, "LineNumber">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L541)

Since v0.0.0

## LineNumber (type alias)

Branded positive 1-based line number.

**Example**

```ts
import type { LineNumber } from "@beep/repo-utils"
type Example = LineNumber
```

**Signature**

```ts
type LineNumber = typeof LineNumber.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L559)

Since v0.0.0

## ProjectCacheKey

Cache key schema for memoized ts-morph projects.

**Example**

```ts
import { ProjectCacheKey } from "@beep/repo-utils"
const value = ProjectCacheKey
```

**Signature**

```ts
declare const ProjectCacheKey: AnnotatedSchema<S.brand<S.TemplateLiteral<readonly [AnnotatedSchema<S.brand<S.brand<S.String, "FilePath">, "TsConfigFilePath">>, "::", LiteralKit<readonly ["syntax", "semantic"], undefined>, "#", LiteralKit<readonly ["workspaceOnly", "followReferences"], undefined>]>, "ProjectCacheKey">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L810)

Since v0.0.0

## ProjectCacheKey (type alias)

Branded cache key for memoized ts-morph projects.

**Example**

```ts
import type { ProjectCacheKey } from "@beep/repo-utils"
type Example = ProjectCacheKey
```

**Signature**

```ts
type ProjectCacheKey = typeof ProjectCacheKey.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L828)

Since v0.0.0

## ProjectScopeId

Stable identity schema for a resolved ts-morph project scope.

**Example**

```ts
import { ProjectScopeId } from "@beep/repo-utils"
const value = ProjectScopeId
```

**Signature**

```ts
declare const ProjectScopeId: AnnotatedSchema<S.brand<S.TemplateLiteral<readonly [AnnotatedSchema<S.brand<S.brand<S.String, "FilePath">, "TsConfigFilePath">>, "::", LiteralKit<readonly ["syntax", "semantic"], undefined>, "#", LiteralKit<readonly ["workspaceOnly", "followReferences"], undefined>]>, "ProjectScopeId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L756)

Since v0.0.0

## ProjectScopeId (type alias)

Branded stable identity for a resolved ts-morph project scope.

**Example**

```ts
import type { ProjectScopeId } from "@beep/repo-utils"
type Example = ProjectScopeId
```

**Signature**

```ts
type ProjectScopeId = typeof ProjectScopeId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L774)

Since v0.0.0

## ProjectScopeIdParts

Parsed components of a `ProjectScopeId`.

**Example**

```ts
import { ProjectScopeIdParts } from "@beep/repo-utils"
const value = ProjectScopeIdParts
```

**Signature**

```ts
declare const ProjectScopeIdParts: AnnotatedSchema<S.TemplateLiteralParser<readonly [AnnotatedSchema<S.brand<S.brand<S.String, "FilePath">, "TsConfigFilePath">>, "::", LiteralKit<readonly ["syntax", "semantic"], undefined>, "#", LiteralKit<readonly ["workspaceOnly", "followReferences"], undefined>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L787)

Since v0.0.0

## RepoRootPath

Repository root directory path schema.

**Example**

```ts
import { RepoRootPath } from "@beep/repo-utils"
const value = RepoRootPath
```

**Signature**

```ts
declare const RepoRootPath: AnnotatedSchema<S.brand<S.brand<S.String, "FilePath">, "RepoRootPath">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L121)

Since v0.0.0

## RepoRootPath (type alias)

Branded repository root directory path.

**Example**

```ts
import type { RepoRootPath } from "@beep/repo-utils"
type Example = RepoRootPath
```

**Signature**

```ts
type RepoRootPath = typeof RepoRootPath.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L139)

Since v0.0.0

## SourceText

Non-empty source text schema.

**Example**

```ts
import { SourceText } from "@beep/repo-utils"
const value = SourceText
```

**Signature**

```ts
declare const SourceText: AnnotatedSchema<S.brand<S.NonEmptyString, "SourceText">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L510)

Since v0.0.0

## SourceText (type alias)

Branded non-empty source text.

**Example**

```ts
import type { SourceText } from "@beep/repo-utils"
type Example = SourceText
```

**Signature**

```ts
type SourceText = typeof SourceText.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L528)

Since v0.0.0

## Symbol (class)

TS-native symbol record with strict identity, kind, and source-location metadata.

**Example**

```ts
import { Symbol as TsMorphSymbol } from "@beep/repo-utils"
const schema = TsMorphSymbol
```

**Signature**

```ts
declare class Symbol
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1119)

Since v0.0.0

## Symbol (namespace)

Namespace helpers for normalized TSMorph symbols.

**Example**

```ts
import { Symbol as TsMorphSymbol } from "@beep/repo-utils"
const schema = TsMorphSymbol
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1189)

Since v0.0.0

### Type (type alias)

Runtime-decoded `Symbol` value type.

**Example**

```ts
import type { Symbol as TsMorphSymbol } from "@beep/repo-utils"
type Example = TsMorphSymbol.Type
```

**Signature**

```ts
type Type = Symbol
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1201)

Since v0.0.0

### Encoded (type alias)

Encoded representation of a `Symbol` value.

**Example**

```ts
import type { Symbol as TsMorphSymbol } from "@beep/repo-utils"
type Example = TsMorphSymbol.Encoded
```

**Signature**

```ts
type Encoded = typeof Symbol.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1213)

Since v0.0.0

## SymbolCategory

Coarse symbol categories used by the TSMorph models.

**Example**

```ts
import { SymbolCategory } from "@beep/repo-utils"
const value = SymbolCategory
```

**Signature**

```ts
declare const SymbolCategory: LiteralKit<readonly ["function", "class", "member", "type"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L425)

Since v0.0.0

## SymbolCategory (type alias)

Literal union of coarse TSMorph symbol categories.

**Example**

```ts
import type { SymbolCategory } from "@beep/repo-utils"
type Example = SymbolCategory
```

**Signature**

```ts
type SymbolCategory = typeof SymbolCategory.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L438)

Since v0.0.0

## SymbolFilePath

Symbol-safe implementation file path schema.

**Example**

```ts
import { SymbolFilePath } from "@beep/repo-utils"
const value = SymbolFilePath
```

**Signature**

```ts
declare const SymbolFilePath: AnnotatedSchema<S.brand<S.brand<S.brand<S.String, "FilePath">, "TypeScriptImplementationFilePath">, "SymbolFilePath">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L306)

Since v0.0.0

## SymbolFilePath (type alias)

Branded symbol-safe implementation file path.

**Example**

```ts
import type { SymbolFilePath } from "@beep/repo-utils"
type Example = SymbolFilePath
```

**Signature**

```ts
type SymbolFilePath = typeof SymbolFilePath.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L324)

Since v0.0.0

## SymbolId

Stable symbol identity schema.

**Example**

```ts
import { SymbolId } from "@beep/repo-utils"
const value = SymbolId
```

**Signature**

```ts
declare const SymbolId: AnnotatedSchema<S.brand<S.TemplateLiteral<readonly [AnnotatedSchema<S.brand<S.brand<S.brand<S.String, "FilePath">, "TypeScriptImplementationFilePath">, "SymbolFilePath">>, "::", AnnotatedSchema<S.brand<S.String, "SymbolQualifiedName">>, "#", LiteralKit<readonly ["FunctionDeclaration", "ClassDeclaration", "MethodDeclaration", "Constructor", "GetAccessor", "SetAccessor", "InterfaceDeclaration", "TypeAliasDeclaration", "EnumDeclaration"], undefined>]>, "SymbolId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L849)

Since v0.0.0

## SymbolId (type alias)

Branded stable symbol identity.

**Example**

```ts
import type { SymbolId } from "@beep/repo-utils"
type Example = SymbolId
```

**Signature**

```ts
type SymbolId = typeof SymbolId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L867)

Since v0.0.0

## SymbolIdParts

Parsed components of a `SymbolId`.

**Example**

```ts
import { SymbolIdParts } from "@beep/repo-utils"
const value = SymbolIdParts
```

**Signature**

```ts
declare const SymbolIdParts: AnnotatedSchema<S.TemplateLiteralParser<readonly [AnnotatedSchema<S.brand<S.brand<S.brand<S.String, "FilePath">, "TypeScriptImplementationFilePath">, "SymbolFilePath">>, "::", AnnotatedSchema<S.brand<S.String, "SymbolQualifiedName">>, "#", LiteralKit<readonly ["FunctionDeclaration", "ClassDeclaration", "MethodDeclaration", "Constructor", "GetAccessor", "SetAccessor", "InterfaceDeclaration", "TypeAliasDeclaration", "EnumDeclaration"], undefined>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L880)

Since v0.0.0

## SymbolInit (type alias)

Input shape for constructing a normalized `Symbol`.

**Example**

```ts
import type { SymbolInit } from "@beep/repo-utils"
type Example = SymbolInit
```

**Signature**

```ts
type SymbolInit = Omit<Symbol.Type, "id" | "category"> & {
  readonly id?: SymbolId | undefined;
  readonly category?: SymbolCategory | undefined;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1227)

Since v0.0.0

## SymbolKind

Supported TypeScript declaration kinds for normalized symbols.

**Example**

```ts
import { SymbolKind } from "@beep/repo-utils"
const value = SymbolKind
```

**Signature**

```ts
declare const SymbolKind: LiteralKit<readonly ["FunctionDeclaration", "ClassDeclaration", "MethodDeclaration", "Constructor", "GetAccessor", "SetAccessor", "InterfaceDeclaration", "TypeAliasDeclaration", "EnumDeclaration"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L399)

Since v0.0.0

## SymbolKind (type alias)

Literal union of supported TypeScript declaration kinds.

**Example**

```ts
import type { SymbolKind } from "@beep/repo-utils"
type Example = SymbolKind
```

**Signature**

```ts
type SymbolKind = typeof SymbolKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L412)

Since v0.0.0

## SymbolKindToCategory

Schema transformation from declaration kind to coarse symbol category.

**Example**

```ts
import { SymbolKindToCategory } from "@beep/repo-utils"
const value = SymbolKindToCategory
```

**Signature**

```ts
declare const SymbolKindToCategory: AnnotatedSchema<S.decodeTo<LiteralKit<readonly ["function", "class", "member", "type"], undefined>, LiteralKit<readonly ["FunctionDeclaration", "ClassDeclaration", "MethodDeclaration", "Constructor", "GetAccessor", "SetAccessor", "InterfaceDeclaration", "TypeAliasDeclaration", "EnumDeclaration"], undefined>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L474)

Since v0.0.0

## SymbolKindToCategory (type alias)

Output type produced by `SymbolKindToCategory`.

**Example**

```ts
import type { SymbolKindToCategory } from "@beep/repo-utils"
type Example = SymbolKindToCategory
```

**Signature**

```ts
type SymbolKindToCategory = typeof SymbolKindToCategory.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L497)

Since v0.0.0

## SymbolNameSegment

Single segment schema for a symbol name.

**Example**

```ts
import { SymbolNameSegment } from "@beep/repo-utils"
const value = SymbolNameSegment
```

**Signature**

```ts
declare const SymbolNameSegment: AnnotatedSchema<S.brand<S.String, "SymbolNameSegment">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L337)

Since v0.0.0

## SymbolNameSegment (type alias)

Branded single symbol name segment.

**Example**

```ts
import type { SymbolNameSegment } from "@beep/repo-utils"
type Example = SymbolNameSegment
```

**Signature**

```ts
type SymbolNameSegment = typeof SymbolNameSegment.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L355)

Since v0.0.0

## SymbolQualifiedName

Qualified symbol name schema.

**Example**

```ts
import { SymbolQualifiedName } from "@beep/repo-utils"
const value = SymbolQualifiedName
```

**Signature**

```ts
declare const SymbolQualifiedName: AnnotatedSchema<S.brand<S.String, "SymbolQualifiedName">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L368)

Since v0.0.0

## SymbolQualifiedName (type alias)

Branded qualified symbol name.

**Example**

```ts
import type { SymbolQualifiedName } from "@beep/repo-utils"
type Example = SymbolQualifiedName
```

**Signature**

```ts
type SymbolQualifiedName = typeof SymbolQualifiedName.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L386)

Since v0.0.0

## TsConfigFilePath

`tsconfig*.json` file path schema.

**Example**

```ts
import { TsConfigFilePath } from "@beep/repo-utils"
const value = TsConfigFilePath
```

**Signature**

```ts
declare const TsConfigFilePath: AnnotatedSchema<S.brand<S.brand<S.String, "FilePath">, "TsConfigFilePath">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L183)

Since v0.0.0

## TsConfigFilePath (type alias)

Branded `tsconfig*.json` file path.

**Example**

```ts
import type { TsConfigFilePath } from "@beep/repo-utils"
type Example = TsConfigFilePath
```

**Signature**

```ts
type TsConfigFilePath = typeof TsConfigFilePath.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L201)

Since v0.0.0

## TsMorphDiagnostic

Tagged union schema for normalized TypeScript diagnostics.

**Example**

```ts
import { TsMorphDiagnostic } from "@beep/repo-utils"
const value = TsMorphDiagnostic
```

**Signature**

```ts
declare const TsMorphDiagnostic: S.toTaggedUnion<"category", readonly [typeof TsMorphDiagnosticError, typeof TsMorphDiagnosticWarning, typeof TsMorphDiagnosticSuggestion, typeof TsMorphDiagnosticMessage]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1811)

Since v0.0.0

## TsMorphDiagnostic (type alias)

Decoded normalized TypeScript diagnostic union.

**Example**

```ts
import type { TsMorphDiagnostic } from "@beep/repo-utils"
type Example = TsMorphDiagnostic
```

**Signature**

```ts
type TsMorphDiagnostic = typeof TsMorphDiagnostic.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1836)

Since v0.0.0

## TsMorphDiagnosticCategory

Supported normalized diagnostic categories.

**Example**

```ts
import { TsMorphDiagnosticCategory } from "@beep/repo-utils"
const value = TsMorphDiagnosticCategory
```

**Signature**

```ts
declare const TsMorphDiagnosticCategory: LiteralKit<readonly ["error", "warning", "suggestion", "message"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1727)

Since v0.0.0

## TsMorphDiagnosticCategory (type alias)

Literal union of normalized diagnostic categories.

**Example**

```ts
import type { TsMorphDiagnosticCategory } from "@beep/repo-utils"
type Example = TsMorphDiagnosticCategory
```

**Signature**

```ts
type TsMorphDiagnosticCategory = typeof TsMorphDiagnosticCategory.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1740)

Since v0.0.0

## TsMorphDiagnosticsRequest (class)

Request schema for TypeScript diagnostics in a resolved scope.

**Example**

```ts
import { TsMorphDiagnosticsRequest } from "@beep/repo-utils"
const value = TsMorphDiagnosticsRequest
```

**Signature**

```ts
declare class TsMorphDiagnosticsRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1849)

Since v0.0.0

## TsMorphDiagnosticsResult (class)

Diagnostics payload for a TypeScript file.

**Example**

```ts
import { TsMorphDiagnosticsResult } from "@beep/repo-utils"
const value = TsMorphDiagnosticsResult
```

**Signature**

```ts
declare class TsMorphDiagnosticsResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1870)

Since v0.0.0

## TsMorphFileOutline (class)

File outline payload for a TypeScript source file.

**Example**

```ts
import { TsMorphFileOutline } from "@beep/repo-utils"
const value = TsMorphFileOutline
```

**Signature**

```ts
declare class TsMorphFileOutline
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1498)

Since v0.0.0

## TsMorphFileOutlineRequest (class)

Request schema for extracting a file outline.

**Example**

```ts
import { TsMorphFileOutlineRequest } from "@beep/repo-utils"
const value = TsMorphFileOutlineRequest
```

**Signature**

```ts
declare class TsMorphFileOutlineRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1477)

Since v0.0.0

## TsMorphProjectInspectionRequest (class)

Request schema for read-only ts-morph project inspection.

**Example**

```ts
import { TsMorphProjectInspectionRequest } from "@beep/repo-utils"
const value = TsMorphProjectInspectionRequest
```

**Signature**

```ts
declare class TsMorphProjectInspectionRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1423)

Since v0.0.0

## TsMorphProjectScope (class)

Resolved ts-morph project scope payload.

**Example**

```ts
import { TsMorphProjectScope } from "@beep/repo-utils"
const value = TsMorphProjectScope
```

**Signature**

```ts
declare class TsMorphProjectScope
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1451)

Since v0.0.0

## TsMorphProjectScopeRequest (class)

Request schema for resolving a ts-morph project scope.

**Example**

```ts
import { TsMorphProjectScopeRequest } from "@beep/repo-utils"
const value = TsMorphProjectScopeRequest
```

**Signature**

```ts
declare class TsMorphProjectScopeRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1400)

Since v0.0.0

## TsMorphReferencePolicy

Reference traversal policies for ts-morph scope resolution.

**Example**

```ts
import { TsMorphReferencePolicy } from "@beep/repo-utils"
const value = TsMorphReferencePolicy
```

**Signature**

```ts
declare const TsMorphReferencePolicy: LiteralKit<readonly ["workspaceOnly", "followReferences"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L722)

Since v0.0.0

## TsMorphReferencePolicy (type alias)

Literal union of ts-morph reference traversal policies.

**Example**

```ts
import type { TsMorphReferencePolicy } from "@beep/repo-utils"
type Example = TsMorphReferencePolicy
```

**Signature**

```ts
type TsMorphReferencePolicy = typeof TsMorphReferencePolicy.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L735)

Since v0.0.0

## TsMorphScopeEntrypoint

Tagged union schema for ts-morph scope resolution entrypoints.

**Example**

```ts
import { TsMorphScopeEntrypoint } from "@beep/repo-utils"
const value = TsMorphScopeEntrypoint
```

**Signature**

```ts
declare const TsMorphScopeEntrypoint: S.Union<readonly [typeof TsMorphScopeEntrypointTsConfig, typeof TsMorphScopeEntrypointFile]> & TaggedUnionUtils<"_tag", readonly [typeof TsMorphScopeEntrypointTsConfig, typeof TsMorphScopeEntrypointFile], [typeof TsMorphScopeEntrypointTsConfig, typeof TsMorphScopeEntrypointFile]> & { make: (input: string) => TsMorphScopeEntrypointTsConfig | TsMorphScopeEntrypointFile; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1358)

Since v0.0.0

## TsMorphScopeEntrypoint (type alias)

Decoded ts-morph scope entrypoint union.

**Example**

```ts
import type { TsMorphScopeEntrypoint } from "@beep/repo-utils"
type Example = TsMorphScopeEntrypoint
```

**Signature**

```ts
type TsMorphScopeEntrypoint = typeof TsMorphScopeEntrypoint.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1387)

Since v0.0.0

## TsMorphScopeMode

Supported ts-morph project scope modes.

**Example**

```ts
import { TsMorphScopeMode } from "@beep/repo-utils"
const value = TsMorphScopeMode
```

**Signature**

```ts
declare const TsMorphScopeMode: LiteralKit<readonly ["syntax", "semantic"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L696)

Since v0.0.0

## TsMorphScopeMode (type alias)

Literal union of ts-morph project scope modes.

**Example**

```ts
import type { TsMorphScopeMode } from "@beep/repo-utils"
type Example = TsMorphScopeMode
```

**Signature**

```ts
type TsMorphScopeMode = typeof TsMorphScopeMode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L709)

Since v0.0.0

## TsMorphSearchLimit

Positive result-limit schema for ts-morph search.

**Example**

```ts
import { TsMorphSearchLimit } from "@beep/repo-utils"
const value = TsMorphSearchLimit
```

**Signature**

```ts
declare const TsMorphSearchLimit: AnnotatedSchema<S.brand<S.Int, "TsMorphSearchLimit">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1604)

Since v0.0.0

## TsMorphSearchLimit (type alias)

Branded positive result limit for ts-morph search.

**Example**

```ts
import type { TsMorphSearchLimit } from "@beep/repo-utils"
type Example = TsMorphSearchLimit
```

**Signature**

```ts
type TsMorphSearchLimit = typeof TsMorphSearchLimit.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1622)

Since v0.0.0

## TsMorphSourceTextRequest (class)

Request schema for reading file source text.

**Example**

```ts
import { TsMorphSourceTextRequest } from "@beep/repo-utils"
const value = TsMorphSourceTextRequest
```

**Signature**

```ts
declare class TsMorphSourceTextRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1520)

Since v0.0.0

## TsMorphSourceTextResult (class)

Source text payload for a TypeScript file.

**Example**

```ts
import { TsMorphSourceTextResult } from "@beep/repo-utils"
const value = TsMorphSourceTextResult
```

**Signature**

```ts
declare class TsMorphSourceTextResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1540)

Since v0.0.0

## TsMorphSymbolLookupRequest (class)

Request schema for symbol lookup by stable identifier.

**Example**

```ts
import { TsMorphSymbolLookupRequest } from "@beep/repo-utils"
const value = TsMorphSymbolLookupRequest
```

**Signature**

```ts
declare class TsMorphSymbolLookupRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1562)

Since v0.0.0

## TsMorphSymbolLookupResult (class)

Symbol lookup result payload.

**Example**

```ts
import { TsMorphSymbolLookupResult } from "@beep/repo-utils"
const value = TsMorphSymbolLookupResult
```

**Signature**

```ts
declare class TsMorphSymbolLookupResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1583)

Since v0.0.0

## TsMorphSymbolSearchRequest (class)

Request schema for symbol search within a resolved scope.

**Example**

```ts
import { TsMorphSymbolSearchRequest } from "@beep/repo-utils"
const value = TsMorphSymbolSearchRequest
```

**Signature**

```ts
declare class TsMorphSymbolSearchRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1635)

Since v0.0.0

## TsMorphSymbolSearchResult (class)

Symbol search result payload.

**Example**

```ts
import { TsMorphSymbolSearchResult } from "@beep/repo-utils"
const value = TsMorphSymbolSearchResult
```

**Signature**

```ts
declare class TsMorphSymbolSearchResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1659)

Since v0.0.0

## TsMorphSymbolSourceRequest (class)

Request schema for reading symbol source text.

**Example**

```ts
import { TsMorphSymbolSourceRequest } from "@beep/repo-utils"
const value = TsMorphSymbolSourceRequest
```

**Signature**

```ts
declare class TsMorphSymbolSourceRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1683)

Since v0.0.0

## TsMorphSymbolSourceResult (class)

Symbol source payload including extracted text.

**Example**

```ts
import { TsMorphSymbolSourceResult } from "@beep/repo-utils"
const value = TsMorphSymbolSourceResult
```

**Signature**

```ts
declare class TsMorphSymbolSourceResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1704)

Since v0.0.0

## TypeScriptDeclarationFilePath

TypeScript declaration file path schema.

**Example**

```ts
import { TypeScriptDeclarationFilePath } from "@beep/repo-utils"
const value = TypeScriptDeclarationFilePath
```

**Signature**

```ts
declare const TypeScriptDeclarationFilePath: AnnotatedSchema<S.brand<S.brand<S.String, "FilePath">, "TypeScriptDeclarationFilePath">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L245)

Since v0.0.0

## TypeScriptDeclarationFilePath (type alias)

Branded TypeScript declaration file path.

**Example**

```ts
import type { TypeScriptDeclarationFilePath } from "@beep/repo-utils"
type Example = TypeScriptDeclarationFilePath
```

**Signature**

```ts
type TypeScriptDeclarationFilePath = typeof TypeScriptDeclarationFilePath.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L263)

Since v0.0.0

## TypeScriptFilePath

TypeScript source file path schema.

**Example**

```ts
import { TypeScriptFilePath } from "@beep/repo-utils"
const value = TypeScriptFilePath
```

**Signature**

```ts
declare const TypeScriptFilePath: AnnotatedSchema<S.Union<readonly [AnnotatedSchema<S.brand<S.brand<S.String, "FilePath">, "TypeScriptImplementationFilePath">>, AnnotatedSchema<S.brand<S.brand<S.String, "FilePath">, "TypeScriptDeclarationFilePath">>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L276)

Since v0.0.0

## TypeScriptFilePath (type alias)

Branded TypeScript source file path.

**Example**

```ts
import type { TypeScriptFilePath } from "@beep/repo-utils"
type Example = TypeScriptFilePath
```

**Signature**

```ts
type TypeScriptFilePath = typeof TypeScriptFilePath.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L293)

Since v0.0.0

## TypeScriptImplementationFilePath

TypeScript implementation file path schema.

**Example**

```ts
import { TypeScriptImplementationFilePath } from "@beep/repo-utils"
const value = TypeScriptImplementationFilePath
```

**Signature**

```ts
declare const TypeScriptImplementationFilePath: AnnotatedSchema<S.brand<S.brand<S.String, "FilePath">, "TypeScriptImplementationFilePath">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L214)

Since v0.0.0

## TypeScriptImplementationFilePath (type alias)

Branded TypeScript implementation file path.

**Example**

```ts
import type { TypeScriptImplementationFilePath } from "@beep/repo-utils"
type Example = TypeScriptImplementationFilePath
```

**Signature**

```ts
type TypeScriptImplementationFilePath = typeof TypeScriptImplementationFilePath.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L232)

Since v0.0.0

## TypeScriptImplementationFilePathToSymbolFilePath

Schema transformation from a TypeScript implementation file path to a symbol-safe file path.

**Example**

```ts
import { TypeScriptImplementationFilePathToSymbolFilePath } from "@beep/repo-utils"
const value = TypeScriptImplementationFilePathToSymbolFilePath
```

**Signature**

```ts
declare const TypeScriptImplementationFilePathToSymbolFilePath: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.brand<S.brand<S.String, "FilePath">, "TypeScriptImplementationFilePath">, "SymbolFilePath">>, S.brand<S.brand<S.String, "FilePath">, "TypeScriptImplementationFilePath"> & SchemaStatics<S.brand<S.brand<S.String, "FilePath">, "TypeScriptImplementationFilePath">>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L981)

Since v0.0.0

## WorkspaceDirectoryPath

Workspace directory path schema.

**Example**

```ts
import { WorkspaceDirectoryPath } from "@beep/repo-utils"
const value = WorkspaceDirectoryPath
```

**Signature**

```ts
declare const WorkspaceDirectoryPath: AnnotatedSchema<S.brand<S.brand<S.String, "FilePath">, "WorkspaceDirectoryPath">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L152)

Since v0.0.0

## WorkspaceDirectoryPath (type alias)

Branded workspace directory path.

**Example**

```ts
import type { WorkspaceDirectoryPath } from "@beep/repo-utils"
type Example = WorkspaceDirectoryPath
```

**Signature**

```ts
type WorkspaceDirectoryPath = typeof WorkspaceDirectoryPath.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L170)

Since v0.0.0

# utilities

## makeProjectCacheKey

Builds a stable `ProjectCacheKey` from validated scope identity parts.

**Example**

```ts
import { makeProjectCacheKey } from "@beep/repo-utils"
const value = makeProjectCacheKey
```

**Signature**

```ts
declare const makeProjectCacheKey: (parts: { readonly tsConfigPath: TsConfigFilePath; readonly mode: TsMorphScopeMode; readonly referencePolicy: TsMorphReferencePolicy; }) => ProjectCacheKey
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1286)

Since v0.0.0

## makeProjectScopeId

Builds a stable `ProjectScopeId` from validated scope identity parts.

**Example**

```ts
import { makeProjectScopeId } from "@beep/repo-utils"
const value = makeProjectScopeId
```

**Signature**

```ts
declare const makeProjectScopeId: (parts: { readonly tsConfigPath: TsConfigFilePath; readonly mode: TsMorphScopeMode; readonly referencePolicy: TsMorphReferencePolicy; }) => ProjectScopeId
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1264)

Since v0.0.0

## makeSymbol

Normalizes symbol input by deriving missing identity and category fields.

**Example**

```ts
import { makeSymbol } from "@beep/repo-utils"
const value = makeSymbol
```

**Signature**

```ts
declare const makeSymbol: (input: SymbolInit) => Symbol
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1306)

Since v0.0.0

## makeSymbolId

Builds a stable `SymbolId` from validated symbol identity parts.

**Example**

```ts
import { makeSymbolId } from "@beep/repo-utils"
const value = makeSymbolId
```

**Signature**

```ts
declare const makeSymbolId: (parts: { readonly filePath: SymbolFilePath; readonly qualifiedName: SymbolQualifiedName; readonly kind: SymbolKind; }) => SymbolId
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L1245)

Since v0.0.0

## symbolCategoryFromKind

Maps a declaration kind to its coarse symbol category.

**Example**

```ts
import { symbolCategoryFromKind } from "@beep/repo-utils"
const value = symbolCategoryFromKind
```

**Signature**

```ts
declare const symbolCategoryFromKind: (value: "InterfaceDeclaration" | "TypeAliasDeclaration" | "EnumDeclaration" | "ClassDeclaration" | "FunctionDeclaration" | "MethodDeclaration" | "Constructor" | "GetAccessor" | "SetAccessor") => MatchReturn<{ readonly FunctionDeclaration: () => "function"; readonly ClassDeclaration: () => "class"; readonly MethodDeclaration: () => "member"; readonly Constructor: () => "member"; readonly GetAccessor: () => "member"; readonly SetAccessor: () => "member"; readonly InterfaceDeclaration: () => "type"; readonly TypeAliasDeclaration: () => "type"; readonly EnumDeclaration: () => "type"; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.model.ts#L451)

Since v0.0.0