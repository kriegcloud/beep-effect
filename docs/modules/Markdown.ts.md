---
title: Markdown.ts
nav_order: 7
parent: Modules
---

## Markdown overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [printers](#printers)
  - [printModule](#printmodule)

---

# printers

## printModule

**Signature**

```ts
export declare const printModule: (module: Domain.Module, order: number) => Effect.Effect<string>
```

**Example**

```ts
import * as Markdown from "@effect/docgen/Markdown"
import * as Domain from "@effect/docgen/Domain"
import { Option } from "effect"

const doc = Domain.createNamedDoc("tests", Option.none(), Option.some("1.0.0"), false, [], Option.none())
const m = Domain.createModule(doc, ["src", "tests.ts"], [], [], [], [], [], [], [])
console.log(Markdown.printModule(m, 0))
```

Added in v1.0.0
