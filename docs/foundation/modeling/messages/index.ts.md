---
title: index.ts
nav_order: 2
parent: "@beep/messages"
---

## index.ts overview

Public i18n message formatting exports.

**Example**

```ts
```typescript
import { t, logIssues } from "@beep/messages"

console.log(t("struct.missingKey")) // "This field is required"
console.log(logIssues)
```
```

Since v0.0.0

---
## Exports Grouped by Category

---

# formatting

## "./i18n.js" (namespace export)

Re-exports all named exports from the "./i18n.js" module.

**Example**

```ts
```typescript
import { t, logIssues } from "@beep/messages"

console.log(t("struct.missingKey")) // "This field is required"
console.log(logIssues)
```
```

**Signature**

```ts
export * from "./i18n.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/messages/src/index.ts#L25)

Since v0.0.0