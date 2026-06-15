---
title: Parser.ts
nav_order: 9
parent: "@beep/repo-docgen"
---

## Parser.ts overview

TypeScript source parser for docgen module models.

Since v0.0.0

---
## Exports Grouped by Category
- [parsing](#parsing)
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

# parsing

## parseClasses

Parses exported class declarations from the active source file.

**Example**

```ts
import { parseClasses } from "@beep/repo-docgen/Parser"
console.log(parseClasses)
```

**Signature**

```ts
declare const parseClasses: Effect.Effect<Array<Domain.Class>, never, Source>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Parser.ts#L650)

Since v0.0.0

## parseConstants

Parses exported constant declarations from the active source file.

**Example**

```ts
import { parseConstants } from "@beep/repo-docgen/Parser"
console.log(parseConstants)
```

**Signature**

```ts
declare const parseConstants: Effect.Effect<Array<Domain.Constant>, never, Source>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Parser.ts#L373)

Since v0.0.0

## parseExports

Parses manual export declarations from the active source file.

**Example**

```ts
import { parseExports } from "@beep/repo-docgen/Parser"
console.log(parseExports)
```

**Signature**

```ts
declare const parseExports: Effect.Effect<Array<Domain.Export>, never, Source>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Parser.ts#L455)

Since v0.0.0

## parseFiles

Parses a set of source files into sorted module models.

**Example**

```ts
import { parseFiles } from "@beep/repo-docgen/Parser"
const parsed = parseFiles([])
console.log(parsed)
```

**Signature**

```ts
declare const parseFiles: (files: ReadonlyArray<Domain.File>) => Effect.Effect<Array<Domain.Module>, [Array<string>, ...Array<string>[]], Path.Path | Configuration.Configuration | Domain.Process>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Parser.ts#L791)

Since v0.0.0

## parseFunctions

Parses exported function declarations from the active source file.

**Example**

```ts
import { parseFunctions } from "@beep/repo-docgen/Parser"
console.log(parseFunctions)
```

**Signature**

```ts
declare const parseFunctions: Effect.Effect<Array<Domain.Function>, never, Source>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Parser.ts#L299)

Since v0.0.0

## parseInterfaces

Parses exported interface declarations from the active source file.

**Example**

```ts
import { parseInterfaces } from "@beep/repo-docgen/Parser"
console.log(parseInterfaces)
```

**Signature**

```ts
declare const parseInterfaces: Effect.Effect<Array<Domain.Interface>, never, Source>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Parser.ts#L208)

Since v0.0.0

## parseModule

Parses the active source file into a docgen module model.

**Example**

```ts
import { parseModule } from "@beep/repo-docgen/Parser"
console.log(parseModule)
```

**Signature**

```ts
declare const parseModule: Effect.Effect<Domain.Module, never, Source>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Parser.ts#L690)

Since v0.0.0

## parseNamespaces

Parses exported namespace declarations from the active source file.

**Example**

```ts
import { parseNamespaces } from "@beep/repo-docgen/Parser"
console.log(parseNamespaces)
```

**Signature**

```ts
declare const parseNamespaces: Effect.Effect<Array<Domain.Namespace>, never, Source>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Parser.ts#L506)

Since v0.0.0

## parseTypeAliases

Parses exported type alias declarations from the active source file.

**Example**

```ts
import { parseTypeAliases } from "@beep/repo-docgen/Parser"
console.log(parseTypeAliases)
```

**Signature**

```ts
declare const parseTypeAliases: Effect.Effect<Array<Domain.TypeAlias>, never, Source>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Parser.ts#L339)

Since v0.0.0