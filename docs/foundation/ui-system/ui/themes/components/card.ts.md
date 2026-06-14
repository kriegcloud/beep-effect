---
title: card.ts
nav_order: 20
parent: "@beep/ui"
---

## card.ts overview

---
## Exports Grouped by Category
- [themes](#themes)
  - [cardTheme](#cardtheme)
---

# themes

## cardTheme

Card theme theme value.

**Example**

```ts
import { cardTheme } from "@beep/ui/themes/components/card"

console.log(cardTheme)
```

**Signature**

```ts
declare const cardTheme: Components<Omit<Theme, "palette" | "components"> & CssVarsTheme> | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/themes/components/card.ts#L16)

Since v0.0.0