---
title: layout.ts
nav_order: 26
parent: "@beep/ui"
---

## layout.ts overview

---
## Exports Grouped by Category
- [themes](#themes)
  - [layoutTheme](#layouttheme)
---

# themes

## layoutTheme

Layout theme theme value.

**Example**

```ts
import { layoutTheme } from "@beep/ui/themes/components/layout"

console.log(layoutTheme)
```

**Signature**

```ts
declare const layoutTheme: Components<Omit<Theme, "palette" | "components"> & CssVarsTheme> | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/themes/components/layout.ts#L16)

Since v0.0.0