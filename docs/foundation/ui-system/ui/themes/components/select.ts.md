---
title: select.ts
nav_order: 31
parent: "@beep/ui"
---

## select.ts overview

---
## Exports Grouped by Category
- [themes](#themes)
  - [selectTheme](#selecttheme)
---

# themes

## selectTheme

Select theme theme value.

**Example**

```ts
import { selectTheme } from "@beep/ui/themes/components/select"

console.log(selectTheme)
```

**Signature**

```ts
declare const selectTheme: Components<Omit<Theme, "palette" | "components"> & CssVarsTheme> | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/themes/components/select.ts#L17)

Since v0.0.0