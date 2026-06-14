---
title: DomainError.ts
nav_order: 4
parent: "@beep/repo-utils"
---

## DomainError.ts overview

Generic domain error for operations that fail for non-file-specific reasons.

Use this for JSON parse failures, glob failures, and other operational
errors where a more specific error type is not warranted.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [DomainError (class)](#domainerror-class)
---

# error-handling

## DomainError (class)

A generic domain-level error with an optional underlying cause.

**Example**

```ts
import { DomainError } from "@beep/repo-utils/errors/DomainError"
const error = DomainError.make({
  message: "Operation failed"
})
console.log(error.message)
```

**Signature**

```ts
declare class DomainError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/repo-utils/src/errors/DomainError.ts#L32)

Since v0.0.0