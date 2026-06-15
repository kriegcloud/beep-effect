---
title: TSMorph.shared.ts
nav_order: 60
parent: "@beep/repo-utils"
---

## TSMorph.shared.ts overview

Shared TSMorph normalization helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [NamedDeclaration (class)](#nameddeclaration-class)
- [utilities](#utilities)
  - [OutlineDeclaration (type alias)](#outlinedeclaration-type-alias)
  - [byNormalizedDiagnosticAscending](#bynormalizeddiagnosticascending)
  - [byTsMorphSymbolAscending](#bytsmorphsymbolascending)
  - [flattenDiagnosticMessageText](#flattendiagnosticmessagetext)
  - [getDeclarationName](#getdeclarationname)
  - [makeKeywords](#makekeywords)
  - [makeScopeSymbolSearchText](#makescopesymbolsearchtext)
  - [makeSummary](#makesummary)
  - [normalizeDiagnosticCategory](#normalizediagnosticcategory)
  - [pipeQualifiedName](#pipequalifiedname)
  - [readDecorators](#readdecorators)
  - [readDocstring](#readdocstring)
  - [readSignature](#readsignature)
---

# models

## NamedDeclaration (class)

Named declaration summary discovered from a TypeScript source file.

**Example**

```ts
import { NamedDeclaration } from "@beep/repo-utils/TSMorph/TSMorph.shared"
console.log(NamedDeclaration)
```

**Signature**

```ts
declare class NamedDeclaration
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.shared.ts#L344)

Since v0.0.0

# utilities

## OutlineDeclaration (type alias)

Supported declaration nodes for normalized TSMorph symbol extraction.

**Example**

```ts
import type { OutlineDeclaration } from "@beep/repo-utils/TSMorph/TSMorph.shared"
type Example = OutlineDeclaration
```

**Signature**

```ts
type OutlineDeclaration = | ClassDeclaration
  | ConstructorDeclaration
  | EnumDeclaration
  | FunctionDeclaration
  | GetAccessorDeclaration
  | InterfaceDeclaration
  | MethodDeclaration
  | SetAccessorDeclaration
  | TypeAliasDeclaration
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.shared.ts#L44)

Since v0.0.0

## byNormalizedDiagnosticAscending

Deterministic ordering for normalized diagnostics.

**Example**

```ts
import { byNormalizedDiagnosticAscending } from "@beep/repo-utils/TSMorph/TSMorph.shared"
const value = byNormalizedDiagnosticAscending
```

**Signature**

```ts
declare const byNormalizedDiagnosticAscending: Order.Order<TsMorphDiagnosticError | TsMorphDiagnosticWarning | TsMorphDiagnosticSuggestion | TsMorphDiagnosticMessage>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.shared.ts#L102)

Since v0.0.0

## byTsMorphSymbolAscending

Deterministic symbol ordering used by normalized TSMorph symbol collections.

**Example**

```ts
import { byTsMorphSymbolAscending } from "@beep/repo-utils/TSMorph/TSMorph.shared"
const value = byTsMorphSymbolAscending
```

**Signature**

```ts
declare const byTsMorphSymbolAscending: Order.Order<TsMorphSymbol>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.shared.ts#L73)

Since v0.0.0

## flattenDiagnosticMessageText

Flatten a TypeScript diagnostic message chain into normalized text.

**Example**

```ts
import { flattenDiagnosticMessageText } from "@beep/repo-utils/TSMorph/TSMorph.shared"
const value = flattenDiagnosticMessageText
```

**Signature**

```ts
declare const flattenDiagnosticMessageText: (message: string | DiagnosticMessageChain) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.shared.ts#L302)

Since v0.0.0

## getDeclarationName

Read the normalized name and kind for a supported declaration node.

**Example**

```ts
import { getDeclarationName } from "@beep/repo-utils/TSMorph/TSMorph.shared"
const value = getDeclarationName
```

**Signature**

```ts
declare const getDeclarationName: (declaration: OutlineDeclaration) => O.Option<NamedDeclaration>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.shared.ts#L382)

Since v0.0.0

## makeKeywords

Build stable symbol keywords from normalized declaration metadata.

**Example**

```ts
import { makeKeywords } from "@beep/repo-utils/TSMorph/TSMorph.shared"
const value = makeKeywords
```

**Signature**

```ts
declare const makeKeywords: { (qualifiedName: string, options: { readonly kind: SymbolKind; }): (name: string) => ReadonlyArray<string>; (name: string, qualifiedName: string, options: { readonly kind: SymbolKind; }): ReadonlyArray<string>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.shared.ts#L215)

Since v0.0.0

## makeScopeSymbolSearchText

Build deterministic lowercased search text for a normalized symbol entry.

**Example**

```ts
import { makeScopeSymbolSearchText } from "@beep/repo-utils/TSMorph/TSMorph.shared"
const value = makeScopeSymbolSearchText
```

**Signature**

```ts
declare const makeScopeSymbolSearchText: { (sourceText: SourceText): (symbol: TsMorphSymbol) => string; (symbol: TsMorphSymbol, sourceText: SourceText): string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.shared.ts#L254)

Since v0.0.0

## makeSummary

Derive the normalized summary text for a declaration.

**Example**

```ts
import { makeSummary } from "@beep/repo-utils/TSMorph/TSMorph.shared"
const value = makeSummary
```

**Signature**

```ts
declare const makeSummary: (docstring: O.Option<string>) => O.Option<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.shared.ts#L198)

Since v0.0.0

## normalizeDiagnosticCategory

Normalize TypeScript diagnostic categories into the public service literal domain.

**Example**

```ts
import { normalizeDiagnosticCategory } from "@beep/repo-utils/TSMorph/TSMorph.shared"
const value = normalizeDiagnosticCategory
```

**Signature**

```ts
declare const normalizeDiagnosticCategory: (category: DiagnosticCategory) => TsMorphDiagnostic["category"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.shared.ts#L330)

Since v0.0.0

## pipeQualifiedName

Extend a parent symbol qualified name with one child declaration segment.

**Example**

```ts
import { pipeQualifiedName } from "@beep/repo-utils/TSMorph/TSMorph.shared"
const value = pipeQualifiedName
```

**Signature**

```ts
declare const pipeQualifiedName: { (name: string): (parentSymbol: O.Option<TsMorphSymbol>) => string; (parentSymbol: O.Option<TsMorphSymbol>, name: string): string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.shared.ts#L440)

Since v0.0.0

## readDecorators

Read normalized decorator text attached to a declaration.

**Example**

```ts
import { readDecorators } from "@beep/repo-utils/TSMorph/TSMorph.shared"
const value = readDecorators
```

**Signature**

```ts
declare const readDecorators: (node: OutlineDeclaration) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.shared.ts#L156)

Since v0.0.0

## readDocstring

Read the normalized JSDoc description text attached to a declaration.

**Example**

```ts
import { readDocstring } from "@beep/repo-utils/TSMorph/TSMorph.shared"
const value = readDocstring
```

**Signature**

```ts
declare const readDocstring: (node: OutlineDeclaration) => O.Option<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.shared.ts#L128)

Since v0.0.0

## readSignature

Read the first non-empty signature line for a declaration.

**Example**

```ts
import { readSignature } from "@beep/repo-utils/TSMorph/TSMorph.shared"
const value = readSignature
```

**Signature**

```ts
declare const readSignature: (node: OutlineDeclaration) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/TSMorph/TSMorph.shared.ts#L174)

Since v0.0.0