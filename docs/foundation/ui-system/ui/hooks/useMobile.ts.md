---
title: useMobile.ts
nav_order: 6
parent: "@beep/ui"
---

## useMobile.ts overview

Responsive mobile-state helpers for `@beep/ui`.

**Example**

```ts
import { resolveIsMobile } from "@beep/ui/hooks/useMobile"

console.log(resolveIsMobile)
```

**Example**

```ts
import { useIsMobile } from "@beep/ui/hooks/useMobile"

console.log(useIsMobile)
```

Since v0.0.0

---
## Exports Grouped by Category
- [components](#components)
  - [useIsMobile](#useismobile)
- [utilities](#utilities)
  - [resolveIsMobile](#resolveismobile)
---

# components

## useIsMobile

Use is mobile hook.

**Example**

```ts
import { useIsMobile } from "@beep/ui/hooks/useMobile"

console.log(useIsMobile)
```

**Signature**

```ts
declare const useIsMobile: () => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useMobile.ts#L59)

Since v0.0.0

# utilities

## resolveIsMobile

Resolve is mobile export.

**Example**

```ts
import { resolveIsMobile } from "@beep/ui/hooks/useMobile"

console.log(resolveIsMobile)
```

**Signature**

```ts
declare const resolveIsMobile: (isMobile: O.Option<boolean>) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/ui/src/hooks/useMobile.ts#L44)

Since v0.0.0