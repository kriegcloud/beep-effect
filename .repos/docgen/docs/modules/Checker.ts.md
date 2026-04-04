---
title: Checker.ts
nav_order: 1
parent: Modules
---

## Checker.ts overview

Since v0.6.0

---

## Exports Grouped by Category

- [utils](#utils)
  - [checkClasses](#checkclasses)
  - [checkConstants](#checkconstants)
  - [checkExports](#checkexports)
  - [checkFunctions](#checkfunctions)
  - [checkInterfaces](#checkinterfaces)
  - [checkModule](#checkmodule)
  - [checkModules](#checkmodules)
  - [checkNamespaces](#checknamespaces)
  - [checkTypeAliases](#checktypealiases)

---

# utils

## checkClasses

**Signature**

```ts
declare const checkClasses: (
  models: ReadonlyArray<Domain.Class>
) => Effect.Effect<Array<string>, never, Configuration.Configuration | Parser.Source>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Checker.ts#L112)

Since v0.6.0

## checkConstants

**Signature**

```ts
declare const checkConstants: (
  models: ReadonlyArray<Domain.Constant>
) => Effect.Effect<Array<string>, never, Configuration.Configuration | Parser.Source>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Checker.ts#L125)

Since v0.6.0

## checkExports

**Signature**

```ts
declare const checkExports: (
  models: ReadonlyArray<Domain.Export>
) => Effect.Effect<Array<string>, never, Configuration.Configuration | Parser.Source>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Checker.ts#L185)

Since v0.6.0

## checkFunctions

**Signature**

```ts
declare const checkFunctions: (
  models: ReadonlyArray<Domain.Function>
) => Effect.Effect<Array<string>, never, Configuration.Configuration | Parser.Source>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Checker.ts#L87)

Since v0.6.0

## checkInterfaces

**Signature**

```ts
declare const checkInterfaces: (
  models: ReadonlyArray<Domain.Interface>
) => Effect.Effect<Array<string>, never, Configuration.Configuration | Parser.Source>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Checker.ts#L138)

Since v0.6.0

## checkModule

**Signature**

```ts
declare const checkModule: (module: Domain.Module) => Effect.Effect<Array<string>, never, Configuration.Configuration>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Checker.ts#L192)

Since v0.6.0

## checkModules

**Signature**

```ts
declare const checkModules: (
  modules: ReadonlyArray<Domain.Module>
) => Effect.Effect<Array<string>, never, Configuration.Configuration>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Checker.ts#L216)

Since v0.6.0

## checkNamespaces

**Signature**

```ts
declare const checkNamespaces: (
  models: ReadonlyArray<Domain.Namespace>
) => Effect.Effect<Array<string>, never, Configuration.Configuration | Parser.Source>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Checker.ts#L172)

Since v0.6.0

## checkTypeAliases

**Signature**

```ts
declare const checkTypeAliases: (
  models: ReadonlyArray<Domain.TypeAlias>
) => Effect.Effect<Array<string>, never, Configuration.Configuration | Parser.Source>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Checker.ts#L151)

Since v0.6.0
