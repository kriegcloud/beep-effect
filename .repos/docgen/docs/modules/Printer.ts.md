---
title: Printer.ts
nav_order: 8
parent: Modules
---

## Printer.ts overview

Since v0.6.0

---

## Exports Grouped by Category

- [printers](#printers)
  - [printModule](#printmodule)
- [utils](#utils)
  - [prettify](#prettify)
  - [printFrontMatter](#printfrontmatter)

---

# printers

## printModule

**Signature**

```ts
declare const printModule: (module: Domain.Module) => Effect.Effect<string, never, Configuration.Configuration>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Printer.ts#L320)

Since v0.6.0

# utils

## prettify

**Signature**

```ts
declare const prettify: (s: string) => Effect.Effect<string, never, never>
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Printer.ts#L372)

Since v0.6.0

## printFrontMatter

**Signature**

```ts
declare const printFrontMatter: (module: Domain.Module, nav_order: number) => string
```

[Source](https://github.com/effect-ts/docgen/blob/main/src/Printer.ts#L361)

Since v0.6.0
