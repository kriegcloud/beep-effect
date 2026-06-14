---
title: Printer.ts
nav_order: 10
parent: "@beep/repo-docgen"
---

## Printer.ts overview

Markdown printer for parsed docgen module models.

Since v0.0.0

---
## Exports Grouped by Category
- [formatting](#formatting)
  - [prettify](#prettify)
  - [printFrontMatter](#printfrontmatter)
  - [printModule](#printmodule)
- [models](#models)
  - [Printable (type alias)](#printable-type-alias)
---

# formatting

## prettify

`prettier` is optional in this repo-local port; returning the markdown
unchanged keeps the generation deterministic while avoiding another runtime
dependency during the migration.

**Example**

```ts
import { prettify } from "@beep/repo-docgen/Printer"
const rendered = prettify("# Title")
console.log(rendered)
```

**Signature**

```ts
declare const prettify: (content: string) => Effect.Effect<string, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Printer.ts#L523)

Since v0.0.0

## printFrontMatter

Builds the front matter used for a generated module documentation page.

**Example**

```ts
import { printFrontMatter } from "@beep/repo-docgen/Printer"
console.log(printFrontMatter)
```

**Signature**

```ts
declare const printFrontMatter: { (module: Domain.Module, navOrder: number): string; (navOrder: number): (module: Domain.Module) => string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Printer.ts#L495)

Since v0.0.0

## printModule

Renders a parsed module into markdown grouped by documentation category.

**Example**

```ts
import { printModule } from "@beep/repo-docgen/Printer"
console.log(printModule)
```

**Signature**

```ts
declare const printModule: (module: Domain.Module) => Effect.Effect<string, never, Configuration.Configuration>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Printer.ts#L448)

Since v0.0.0

# models

## Printable (type alias)

Companion type for `Printable`

**Example**

```ts
import { Printable } from "@beep/repo-docgen/Printer";

type ExamplePrintable = Printable
```

**Signature**

```ts
type Printable = typeof Printable.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/Printer.ts#L61)

Since v0.0.0