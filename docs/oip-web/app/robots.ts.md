---
title: robots.ts
nav_order: 5
parent: "@beep/oip-web"
---

## robots.ts overview

Robots policy for oip.law.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [robots](#robots)
---

# constructors

## robots

Returns the robots policy for OIP.

**Example**

```ts
import robots from "@beep/oip-web/app/robots"

console.log(robots().rules)
```

**Signature**

```ts
declare const robots: () => MetadataRoute.Robots
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/app/robots.ts#L24)

Since v0.0.0