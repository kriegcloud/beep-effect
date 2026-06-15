---
title: security.ts
nav_order: 23
parent: "@beep/repo-configs"
---

## security.ts overview

Secure header helpers for shared Next.js configuration.

**Example**

```ts
import { withSecureHeaders } from "@beep/repo-configs/next/security"
const config = withSecureHeaders({ reactStrictMode: true })
console.log(config)
```

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - ["./security/index.ts" (namespace export)](#securityindexts-namespace-export)
---

# configuration

## "./security/index.ts" (namespace export)

Re-exports all named exports from the "./security/index.ts" module.

**Example**

```ts
import { withSecureHeaders } from "@beep/repo-configs/next/security"
const config = withSecureHeaders({ reactStrictMode: true })
console.log(config)
```

**Signature**

```ts
export * from "./security/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/security.ts#L20)

Since v0.0.0