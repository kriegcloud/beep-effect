---
title: Sandbox.error-handler.ts
nav_order: 17
parent: "@beep/sandbox"
---

## Sandbox.error-handler.ts overview

Error formatting helpers for sandbox failures.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [formatErrorMessage](#formaterrormessage)
---

# error-handling

## formatErrorMessage

Format a sandbox error with secret-shaped text redacted.

**Example**

```ts
import { formatErrorMessage } from "@beep/sandbox/Sandbox.error-handler"

console.log(formatErrorMessage)
```

**Signature**

```ts
declare const formatErrorMessage: (error: SandboxError) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Sandbox.error-handler.ts#L64)

Since v0.0.0