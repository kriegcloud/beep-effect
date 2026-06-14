---
title: Checker.ts
nav_order: 2
parent: "@beep/repo-docgen"
---

## Checker.ts overview

Validation helpers for parsed docgen modules.

Since v0.0.0

---
## Exports Grouped by Category
- [predicates](#predicates)
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

# predicates

## checkClasses

Checks documented classes and their members for required docgen annotations.

**Example**

```ts
import { checkClasses } from "@beep/repo-docgen/Checker"
const checked = checkClasses([])
console.log(checked)
```

**Signature**

```ts
declare const checkClasses: (models: ReadonlyArray<Domain.Class>) => Effect.Effect<Array<string>, never, Configuration.Configuration | Parser.Source>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Checker.ts#L125)

Since v0.0.0

## checkConstants

Checks documented constants for required docgen annotations.

**Example**

```ts
import { checkConstants } from "@beep/repo-docgen/Checker"
const checked = checkConstants([])
console.log(checked)
```

**Signature**

```ts
declare const checkConstants: (models: ReadonlyArray<Domain.Constant>) => Effect.Effect<Array<string>, never, Configuration.Configuration | Parser.Source>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Checker.ts#L147)

Since v0.0.0

## checkExports

Checks documented manual exports for required docgen annotations.

**Example**

```ts
import { checkExports } from "@beep/repo-docgen/Checker"
const checked = checkExports([])
console.log(checked)
```

**Signature**

```ts
declare const checkExports: (models: ReadonlyArray<Domain.Export>) => Effect.Effect<Array<string>, never, Configuration.Configuration | Parser.Source>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Checker.ts#L241)

Since v0.0.0

## checkFunctions

Checks documented functions for required docgen annotations.

**Example**

```ts
import { checkFunctions } from "@beep/repo-docgen/Checker"
const checked = checkFunctions([])
console.log(checked)
```

**Signature**

```ts
declare const checkFunctions: (models: ReadonlyArray<Domain.Function>) => Effect.Effect<Array<string>, never, Configuration.Configuration | Parser.Source>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Checker.ts#L99)

Since v0.0.0

## checkInterfaces

Checks documented interfaces for required docgen annotations.

**Example**

```ts
import { checkInterfaces } from "@beep/repo-docgen/Checker"
const checked = checkInterfaces([])
console.log(checked)
```

**Signature**

```ts
declare const checkInterfaces: (models: ReadonlyArray<Domain.Interface>) => Effect.Effect<Array<string>, never, Configuration.Configuration | Parser.Source>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Checker.ts#L169)

Since v0.0.0

## checkModule

Checks a parsed module and all of its documented members for required docgen annotations.

**Example**

```ts
import { checkModule } from "@beep/repo-docgen/Checker"
console.log(checkModule)
```

**Signature**

```ts
declare const checkModule: (module: Domain.Module) => Effect.Effect<Array<string>, never, Configuration.Configuration>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Checker.ts#L258)

Since v0.0.0

## checkModules

Checks multiple parsed modules for required docgen annotations.

**Example**

```ts
import { checkModules } from "@beep/repo-docgen/Checker"
const checked = checkModules([])
console.log(checked)
```

**Signature**

```ts
declare const checkModules: (modules: ReadonlyArray<Domain.Module>) => Effect.Effect<Array<string>, never, Configuration.Configuration>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Checker.ts#L302)

Since v0.0.0

## checkNamespaces

Checks documented namespaces and their nested members for required docgen annotations.

**Example**

```ts
import { checkNamespaces } from "@beep/repo-docgen/Checker"
const checked = checkNamespaces([])
console.log(checked)
```

**Signature**

```ts
declare const checkNamespaces: (models: ReadonlyArray<Domain.Namespace>) => Effect.Effect<Array<string>, never, Configuration.Configuration | Parser.Source>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Checker.ts#L219)

Since v0.0.0

## checkTypeAliases

Checks documented type aliases for required docgen annotations.

**Example**

```ts
import { checkTypeAliases } from "@beep/repo-docgen/Checker"
const checked = checkTypeAliases([])
console.log(checked)
```

**Signature**

```ts
declare const checkTypeAliases: (models: ReadonlyArray<Domain.TypeAlias>) => Effect.Effect<Array<string>, never, Configuration.Configuration | Parser.Source>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Checker.ts#L191)

Since v0.0.0