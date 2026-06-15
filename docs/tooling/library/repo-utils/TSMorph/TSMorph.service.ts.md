---
title: TSMorph.service.ts
nav_order: 59
parent: "@beep/repo-utils"
---

## TSMorph.service.ts overview

TSMorph project loading and source-inspection service.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [TSMorphServiceLive](#tsmorphservicelive)
- [models](#models)
  - [TSMorphServiceError](#tsmorphserviceerror)
  - [TSMorphServiceError (type alias)](#tsmorphserviceerror-type-alias)
  - [TSMorphServiceShape (type alias)](#tsmorphserviceshape-type-alias)
  - [TsMorphProjectLoadError (class)](#tsmorphprojectloaderror-class)
  - [TsMorphScopeResolutionError (class)](#tsmorphscoperesolutionerror-class)
  - [TsMorphServiceUnavailableError (class)](#tsmorphserviceunavailableerror-class)
  - [TsMorphSourceFileError (class)](#tsmorphsourcefileerror-class)
  - [TsMorphSymbolNotFoundError (class)](#tsmorphsymbolnotfounderror-class)
  - [TsMorphUnsupportedFileError (class)](#tsmorphunsupportedfileerror-class)
  - [createTSMorphService](#createtsmorphservice)
- [ports](#ports)
  - [TSMorphService (class)](#tsmorphservice-class)
---

# configuration

## TSMorphServiceLive

Default live layer for the current TSMorphService contract.

**Example**

```ts
import { TSMorphServiceLive } from "@beep/repo-utils"
const value = TSMorphServiceLive
```

**Signature**

```ts
declare const TSMorphServiceLive: Layer.Layer<TSMorphService, never, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts#L1324)

Since v0.0.0

# models

## TSMorphServiceError

Tagged union of all recoverable service errors emitted by `TSMorphService`.

**Example**

```ts
import { TSMorphServiceError } from "@beep/repo-utils"
const value = TSMorphServiceError
```

**Signature**

```ts
declare const TSMorphServiceError: S.toTaggedUnion<"_tag", readonly [typeof TsMorphProjectLoadError, typeof TsMorphScopeResolutionError, typeof TsMorphSourceFileError, typeof TsMorphSymbolNotFoundError, typeof TsMorphUnsupportedFileError, typeof TsMorphServiceUnavailableError]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts#L271)

Since v0.0.0

## TSMorphServiceError (type alias)

Tagged union type for all ts-morph service errors.

**Example**

```ts
import type { TSMorphServiceError } from "@beep/repo-utils"
type Example = TSMorphServiceError
```

**Signature**

```ts
type TSMorphServiceError = typeof TSMorphServiceError.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts#L291)

Since v0.0.0

## TSMorphServiceShape (type alias)

Read-only v1 service contract for ts-morph-backed scope, symbol, source, and diagnostic operations.

**Example**

```ts
import type { TSMorphServiceShape } from "@beep/repo-utils"
type Example = TSMorphServiceShape
```

**Signature**

```ts
type TSMorphServiceShape = {
  readonly resolveProjectScope: (
    request: TsMorphProjectScopeRequest
  ) => Effect.Effect<TsMorphProjectScope, TSMorphServiceError>;
  readonly inspectProject: <A>(
    request: TsMorphProjectInspectionRequest,
    inspect: (context: {
      readonly scope: TsMorphProjectScope;
      readonly project: Project;
      readonly sourceFiles: ReadonlyArray<SourceFile>;
    }) => A
  ) => Effect.Effect<A, TSMorphServiceError>;
  readonly getFileOutline: (
    request: TsMorphFileOutlineRequest
  ) => Effect.Effect<TsMorphFileOutline, TSMorphServiceError>;
  readonly getSymbolById: (
    request: TsMorphSymbolLookupRequest
  ) => Effect.Effect<TsMorphSymbolLookupResult, TSMorphServiceError>;
  readonly searchSymbols: (
    request: TsMorphSymbolSearchRequest
  ) => Effect.Effect<TsMorphSymbolSearchResult, TSMorphServiceError>;
  readonly readSourceText: (
    request: TsMorphSourceTextRequest
  ) => Effect.Effect<TsMorphSourceTextResult, TSMorphServiceError>;
  readonly readSymbolSource: (
    request: TsMorphSymbolSourceRequest
  ) => Effect.Effect<TsMorphSymbolSourceResult, TSMorphServiceError>;
  readonly getDiagnostics: (
    request: TsMorphDiagnosticsRequest
  ) => Effect.Effect<TsMorphDiagnosticsResult, TSMorphServiceError>;
  readonly updateSourceFile: (
    filePath: string,
    update: (sourceFile: SourceFile, project: Project) => void
  ) => Effect.Effect<boolean, TSMorphServiceError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts#L304)

Since v0.0.0

## TsMorphProjectLoadError (class)

Typed error returned when a scoped ts-morph project cannot be constructed.

**Example**

```ts
import { TsMorphProjectLoadError } from "@beep/repo-utils"
const value = TsMorphProjectLoadError
```

**Signature**

```ts
declare class TsMorphProjectLoadError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts#L171)

Since v0.0.0

## TsMorphScopeResolutionError (class)

Typed error returned when a scope or repository path cannot be resolved.

**Example**

```ts
import { TsMorphScopeResolutionError } from "@beep/repo-utils"
const value = TsMorphScopeResolutionError
```

**Signature**

```ts
declare class TsMorphScopeResolutionError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts#L146)

Since v0.0.0

## TsMorphServiceUnavailableError (class)

Typed error retained for compatibility with older placeholder service wiring.

**Example**

```ts
import { TsMorphServiceUnavailableError } from "@beep/repo-utils"
const value = TsMorphServiceUnavailableError
```

**Signature**

```ts
declare class TsMorphServiceUnavailableError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts#L121)

Since v0.0.0

## TsMorphSourceFileError (class)

Typed error returned when a TypeScript file cannot be loaded from a resolved scope.

**Example**

```ts
import { TsMorphSourceFileError } from "@beep/repo-utils"
const value = TsMorphSourceFileError
```

**Signature**

```ts
declare class TsMorphSourceFileError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts#L194)

Since v0.0.0

## TsMorphSymbolNotFoundError (class)

Typed error returned when a symbol id cannot be resolved within a scope.

**Example**

```ts
import { TsMorphSymbolNotFoundError } from "@beep/repo-utils"
const value = TsMorphSymbolNotFoundError
```

**Signature**

```ts
declare class TsMorphSymbolNotFoundError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts#L218)

Since v0.0.0

## TsMorphUnsupportedFileError (class)

Typed error returned when a request targets a currently unsupported TypeScript source boundary.

**Example**

```ts
import { TsMorphUnsupportedFileError } from "@beep/repo-utils"
const value = TsMorphUnsupportedFileError
```

**Signature**

```ts
declare class TsMorphUnsupportedFileError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts#L246)

Since v0.0.0

## createTSMorphService

Construct the current live implementation for the v1 TSMorphService contract.

**Example**

```ts
import { createTSMorphService } from "@beep/repo-utils"
const value = createTSMorphService
```

**Signature**

```ts
declare const createTSMorphService: () => Effect.Effect<TSMorphServiceShape, never, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts#L667)

Since v0.0.0

# ports

## TSMorphService (class)

Service tag for the read-only v1 ts-morph contract.

**Example**

```ts
import { TSMorphService } from "@beep/repo-utils"
const value = TSMorphService
```

**Signature**

```ts
declare class TSMorphService
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.service.ts#L351)

Since v0.0.0