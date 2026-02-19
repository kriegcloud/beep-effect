---
title: Parser.ts
nav_order: 8
parent: Modules
---

## Parser overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [parsers](#parsers)
  - [parseClasses](#parseclasses)
  - [parseConstants](#parseconstants)
  - [parseExports](#parseexports)
  - [parseFiles](#parsefiles)
  - [parseFunctions](#parsefunctions)
  - [parseInterfaces](#parseinterfaces)
  - [parseModule](#parsemodule)
  - [parseNamespaces](#parsenamespaces)
  - [parseTypeAliases](#parsetypealiases)

---

# parsers

## parseClasses

**Signature**

```ts
export declare const parseClasses: Effect.Effect<Domain.Class[], string[], Configuration.Configuration | Source>
```

Added in v1.0.0

## parseConstants

**Signature**

```ts
export declare const parseConstants: Effect.Effect<Domain.Constant[], string[], Configuration.Configuration | Source>
```

Added in v1.0.0

## parseExports

**Signature**

```ts
export declare const parseExports: Effect.Effect<Domain.Export[], string[], Configuration.Configuration | Source>
```

Added in v1.0.0

## parseFiles

**Signature**

```ts
export declare const parseFiles: (
  files: ReadonlyArray<File.File>
) => Effect.Effect<Domain.Module[], string[][], Process.Process | Configuration.Configuration | Path.Path>
```

Added in v1.0.0

## parseFunctions

**Signature**

```ts
export declare const parseFunctions: Effect.Effect<Domain.Function[], string[], Configuration.Configuration | Source>
```

Added in v1.0.0

## parseInterfaces

**Signature**

```ts
export declare const parseInterfaces: Effect.Effect<Domain.Interface[], string[], Configuration.Configuration | Source>
```

Added in v1.0.0

## parseModule

**Signature**

```ts
export declare const parseModule: Effect.Effect<
  Domain.Module,
  string[],
  Configuration.Configuration | Path.Path | Source
>
```

Added in v1.0.0

## parseNamespaces

**Signature**

```ts
export declare const parseNamespaces: Effect.Effect<Domain.Namespace[], string[], Configuration.Configuration | Source>
```

Added in v1.0.0

## parseTypeAliases

**Signature**

```ts
export declare const parseTypeAliases: Effect.Effect<Domain.TypeAlias[], string[], Configuration.Configuration | Source>
```

Added in v1.0.0
