---
title: index.ts
nav_order: 9
parent: "@beep/repo-configs"
---

## index.ts overview

Constituent Next.js configuration model schemas.

**Example**

```ts
import { NextConfig } from "@beep/repo-configs/next"
const schema = NextConfig
console.log(schema)
```

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - ["./SharedNextConfig.model.ts" (namespace export)](#sharednextconfigmodelts-namespace-export)
  - ["./security/index.ts" (namespace export)](#securityindexts-namespace-export)
- [models](#models)
  - ["./NextConfig.model.ts" (namespace export)](#nextconfigmodelts-namespace-export)
  - ["./models/index.ts" (namespace export)](#modelsindexts-namespace-export)
---

# configuration

## "./SharedNextConfig.model.ts" (namespace export)

Re-exports all named exports from the "./SharedNextConfig.model.ts" module.

**Example**

```ts
import { defineBeepNextConfig } from "@beep/repo-configs/next"
const config = defineBeepNextConfig({
  repoRoot: "/repo",
  allowedDevOrigins: ["oip-web.localhost"]
})
console.log(config)
```

**Signature**

```ts
export * from "./SharedNextConfig.model.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/index.ts#L49)

Since v0.0.0

## "./security/index.ts" (namespace export)

Re-exports all named exports from the "./security/index.ts" module.

**Example**

```ts
import { withSecureHeaders } from "@beep/repo-configs/next"
const config = withSecureHeaders({ reactStrictMode: true })
console.log(config)
```

**Signature**

```ts
export * from "./security/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/index.ts#L62)

Since v0.0.0

# models

## "./NextConfig.model.ts" (namespace export)

Re-exports all named exports from the "./NextConfig.model.ts" module.

**Example**

```ts
import { defineNextConfig } from "@beep/repo-configs/next"
const config = defineNextConfig({ reactStrictMode: true })
console.log(config)
```

**Signature**

```ts
export * from "./NextConfig.model.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/index.ts#L33)

Since v0.0.0

## "./models/index.ts" (namespace export)

Re-exports all named exports from the "./models/index.ts" module.

**Example**

```ts
import { NextConfig } from "@beep/repo-configs/next"
const schema = NextConfig
console.log(schema)
```

**Signature**

```ts
export * from "./models/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/index.ts#L20)

Since v0.0.0