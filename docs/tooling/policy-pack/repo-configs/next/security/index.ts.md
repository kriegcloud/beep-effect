---
title: index.ts
nav_order: 24
parent: "@beep/repo-configs"
---

## index.ts overview

Secure header helpers for shared Next.js configuration.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [withSecureHeaders](#withsecureheaders)
- [configuration](#configuration)
  - [DEFAULT_BEEP_SECURE_HEADERS](#default_beep_secure_headers)
- [constructors](#constructors)
  - [makeSecureHeaders](#makesecureheaders)
- [models](#models)
  - [SecureHeadersConfig (type alias)](#secureheadersconfig-type-alias)
- [schemas](#schemas)
  - [SecureHeader (class)](#secureheader-class)
  - [SecureHeadersConfig](#secureheadersconfig)
---

# combinators

## withSecureHeaders

Add shared secure headers to a Next.js config.

**Example**

```ts
import { withSecureHeaders } from "@beep/repo-configs/next/security"
const config = withSecureHeaders({ reactStrictMode: true })
console.log(config)
```

**Signature**

```ts
declare const withSecureHeaders: (config: NextConfig, secureHeadersConfig?: SecureHeadersConfig) => NextConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/security/index.ts#L221)

Since v0.0.0

# configuration

## DEFAULT_BEEP_SECURE_HEADERS

Default secure headers shared by current Next.js apps in this repo.

**Example**

```ts
import { DEFAULT_BEEP_SECURE_HEADERS } from "@beep/repo-configs/next/security"
const headers = DEFAULT_BEEP_SECURE_HEADERS
console.log(headers)
```

**Signature**

```ts
declare const DEFAULT_BEEP_SECURE_HEADERS: ReadonlyArray<SecureHeader>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/security/index.ts#L127)

Since v0.0.0

# constructors

## makeSecureHeaders

Build the secure header list for the shared Next.js preset.

**Example**

```ts
import { makeSecureHeaders } from "@beep/repo-configs/next/security"
const headers = makeSecureHeaders({
  additionalHeaders: [{ key: "X-Beep", value: "1" }]
})
console.log(headers)
```

**Signature**

```ts
declare const makeSecureHeaders: (config?: SecureHeadersConfig) => ReadonlyArray<SecureHeader>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/security/index.ts#L189)

Since v0.0.0

# models

## SecureHeadersConfig (type alias)

Shared secure-header configuration for the repo Next.js preset.

**Example**

```ts
import type { SecureHeadersConfig } from "@beep/repo-configs/next/security"
const config: SecureHeadersConfig = {
  source: "/(.*)"
}
console.log(config)
```

**Signature**

```ts
type SecureHeadersConfig = typeof SecureHeadersConfig.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/security/index.ts#L113)

Since v0.0.0

# schemas

## SecureHeader (class)

A secure HTTP response header emitted through Next.js `headers()`.

**Example**

```ts
import { SecureHeader } from "@beep/repo-configs/next/security"
const header = SecureHeader.make({
  key: "X-Content-Type-Options",
  value: "nosniff"
})
console.log(header)
```

**Signature**

```ts
declare class SecureHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/security/index.ts#L36)

Since v0.0.0

## SecureHeadersConfig

Shared secure-header configuration for the repo Next.js preset.

**Example**

```ts
import type { SecureHeadersConfig } from "@beep/repo-configs/next/security"
const config: SecureHeadersConfig = {
  additionalHeaders: [{ key: "X-Beep", value: "1" }]
}
console.log(config)
```

**Signature**

```ts
declare const SecureHeadersConfig: AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof SecureHeadersConfigValue]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/policy-pack/repo-configs/src/next/security/index.ts#L93)

Since v0.0.0