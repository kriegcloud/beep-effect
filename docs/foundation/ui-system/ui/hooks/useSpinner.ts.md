---
title: useSpinner.ts
nav_order: 8
parent: "@beep/ui"
---

## useSpinner.ts overview

---
## Exports Grouped by Category
- [components](#components)
  - [useSpinner](#usespinner)
---

# components

## useSpinner

Use spinner hook.

**Example**

```ts
import { useSpinner } from "@beep/ui/hooks/useSpinner"

console.log(useSpinner)
```

**Signature**

```ts
declare const useSpinner: <T>(increment: (params?: T) => void, decrement: (params?: T) => void) => { up: (params?: T) => void; down: (params?: T) => void; stop: () => void; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useSpinner.ts#L149)

Since v0.0.0