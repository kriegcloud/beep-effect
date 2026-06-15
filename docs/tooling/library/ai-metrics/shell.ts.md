---
title: shell.ts
nav_order: 16
parent: "@beep/repo-ai-metrics"
---

## shell.ts overview

Shell rendering helpers for AI metrics operator commands.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [shellQuote](#shellquote)
---

# utilities

## shellQuote

Quote a value as one POSIX shell token.

**Example**

```ts
import { shellQuote } from "@beep/repo-ai-metrics"

console.log(shellQuote("op://vault/item/field"))
```

**Signature**

```ts
declare const shellQuote: (value: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/shell.ts#L24)

Since v0.0.0