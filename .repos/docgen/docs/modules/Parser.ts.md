---
title: Parser.ts
nav_order: 7
parent: Modules
---

## Parser.ts overview

Since v0.6.0

---

## Exports Grouped by Category

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
declare const parseClasses: Effect.Effect<Array<Domain.Class>, never, Source>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Parser.ts#L584)

Since v0.6.0

## parseConstants

**Signature**

```ts
declare const parseConstants: Effect.Effect<Array<Domain.Constant>, never, Source>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Parser.ts#L315)

Since v0.6.0

## parseExports

**Signature**

```ts
declare const parseExports: Effect.Effect<Array<Domain.Export>, never, Source>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Parser.ts#L391)

Since v0.6.0

## parseFiles

**Signature**

```ts
declare const parseFiles: (
  files: ReadonlyArray<Domain.File>
) => Effect.Effect<
  Array<Domain.Module>,
  [Array<string>, ...Array<string>[]],
  Configuration.Configuration | Domain.Process | Path.Path
>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Parser.ts#L688)

Since v0.6.0

## parseFunctions

**Signature**

```ts
declare const parseFunctions: Effect.Effect<Array<Domain.Function>, never, Source>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Parser.ts#L240)

Since v0.6.0

## parseInterfaces

**Signature**

```ts
declare const parseInterfaces: Effect.Effect<Array<Domain.Interface>, never, Source>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Parser.ts#L133)

Since v0.6.0

## parseModule

**Signature**

```ts
declare const parseModule: Effect.Effect<Domain.Module, never, Configuration.Configuration | Source>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Parser.ts#L613)

Since v0.6.0

## parseNamespaces

**Signature**

```ts
declare const parseNamespaces: Effect.Effect<Array<Domain.Namespace>, never, Configuration.Configuration | Source>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Parser.ts#L437)

Since v0.6.0

## parseTypeAliases

**Signature**

```ts
declare const parseTypeAliases: Effect.Effect<Array<Domain.TypeAlias>, never, Source>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Parser.ts#L285)

Since v0.6.0
