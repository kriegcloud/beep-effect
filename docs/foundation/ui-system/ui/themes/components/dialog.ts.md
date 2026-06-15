---
title: dialog.ts
nav_order: 25
parent: "@beep/ui"
---

## dialog.ts overview

---
## Exports Grouped by Category
- [themes](#themes)
  - [dialogTheme](#dialogtheme)
---

# themes

## dialogTheme

Dialog theme theme value.

**Example**

```ts
import { dialogTheme } from "@beep/ui/themes/components/dialog"

console.log(dialogTheme)
```

**Signature**

```ts
declare const dialogTheme: Components<Omit<Theme, "palette" | "components"> & CssVarsTheme> | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/themes/components/dialog.ts#L16)

Since v0.0.0