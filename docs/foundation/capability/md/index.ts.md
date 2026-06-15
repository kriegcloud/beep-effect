---
title: index.ts
nav_order: 1
parent: "@beep/md"
---

## index.ts overview

Package version.

**Example**

```ts
import { VERSION } from "@beep/md"

console.log(VERSION) // "0.0.0"
```

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [VERSION](#version)
- [constructors](#constructors)
  - ["./Md.ts" (namespace export)](#mdts-namespace-export)
- [formatting](#formatting)
  - ["./Md.render.ts" (namespace export)](#mdrenderts-namespace-export)
- [models](#models)
  - ["./Md.model.ts" (namespace export)](#mdmodelts-namespace-export)
- [utilities](#utilities)
  - ["./Md.utils.ts" (namespace export)](#mdutilsts-namespace-export)
---

# configuration

## VERSION

Package version.

**Example**

```ts
import { VERSION } from "@beep/md"

console.log(VERSION) // "0.0.0"
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/index.ts#L21)

Since v0.0.0

# constructors

## "./Md.ts" (namespace export)

Re-exports all named exports from the "./Md.ts" module.

**Example**

```ts
import { Md } from "@beep/md"
import { Result } from "effect"

const markdown = Md.render(Md.make([Md.h1`Hello`]))
console.log(Result.getOrThrow(markdown)) // "# Hello"
```

**Signature**

```ts
export * from "./Md.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/index.ts#L66)

Since v0.0.0

# formatting

## "./Md.render.ts" (namespace export)

Re-exports all named exports from the "./Md.render.ts" module.

**Example**

```ts
import { Md, MarkdownAdapter } from "@beep/md"

console.log(MarkdownAdapter.render(Md.make([Md.p`Hello`]))) // "Hello"
```

**Signature**

```ts
export * from "./Md.render.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/index.ts#L50)

Since v0.0.0

# models

## "./Md.model.ts" (namespace export)

Re-exports all named exports from the "./Md.model.ts" module.

**Example**

```ts
import { Document } from "@beep/md"

console.log(Document.make({ children: [] })._tag) // "document"
```

**Signature**

```ts
export * from "./Md.model.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/index.ts#L36)

Since v0.0.0

# utilities

## "./Md.utils.ts" (namespace export)

Re-exports all named exports from the "./Md.utils.ts" module.

**Example**

```ts
import { escapeMarkdownText } from "@beep/md"

console.log(escapeMarkdownText("#")) // "\\#"
```

**Signature**

```ts
export * from "./Md.utils.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/index.ts#L80)

Since v0.0.0