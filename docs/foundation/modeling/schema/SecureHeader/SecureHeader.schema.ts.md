---
title: SecureHeader.schema.ts
nav_order: 192
parent: "@beep/schema"
---

## SecureHeader.schema.ts overview

CSP header schema & constructor's

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [SecureHeader (type alias)](#secureheader-type-alias)
- [schemas](#schemas)
  - [Schema](#schema)
  - [SecureHeader](#secureheader)
---

# models

## SecureHeader (type alias)

Runtime type for secure header identifiers.

**Signature**

```ts
type SecureHeader = typeof SecureHeader.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeader/SecureHeader.schema.ts#L55)

Since v0.0.0

# schemas

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: LiteralKit<readonly ["CONTENT_SECURITY_POLICY", "FORCE_HTTPS_REDIRECT", "XSS_PROTECTION", "REFERRER_POLICY", "NO_SNIFF", "NO_OPEN", "FRAME_GUARD", "EXPECT_CT", "PERMISSIONS_POLICY", "CROSS_ORIGIN_OPENER_POLICY", "CROSS_ORIGIN_EMBEDDER_POLICY", "CROSS_ORIGIN_RESOURCE_POLICY", "PERMITTED_CROSS_DOMAIN_POLICIES", "CORE"], undefined> & SchemaStatics<LiteralKit<readonly ["CONTENT_SECURITY_POLICY", "FORCE_HTTPS_REDIRECT", "XSS_PROTECTION", "REFERRER_POLICY", "NO_SNIFF", "NO_OPEN", "FRAME_GUARD", "EXPECT_CT", "PERMISSIONS_POLICY", "CROSS_ORIGIN_OPENER_POLICY", "CROSS_ORIGIN_EMBEDDER_POLICY", "CROSS_ORIGIN_RESOURCE_POLICY", "PERMITTED_CROSS_DOMAIN_POLICIES", "CORE"], undefined>> & LiteralKitStatics<readonly ["CONTENT_SECURITY_POLICY", "FORCE_HTTPS_REDIRECT", "XSS_PROTECTION", "REFERRER_POLICY", "NO_SNIFF", "NO_OPEN", "FRAME_GUARD", "EXPECT_CT", "PERMISSIONS_POLICY", "CROSS_ORIGIN_OPENER_POLICY", "CROSS_ORIGIN_EMBEDDER_POLICY", "CROSS_ORIGIN_RESOURCE_POLICY", "PERMITTED_CROSS_DOMAIN_POLICIES", "CORE"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeader/SecureHeader.schema.ts#L63)

Since v0.0.0

## SecureHeader

Secure header literal schema.

**Example**

```ts
import { SecureHeader } from "@beep/schema/SecureHeader"

console.log(SecureHeader.Options)
```

**Signature**

```ts
declare const SecureHeader: LiteralKit<readonly ["CONTENT_SECURITY_POLICY", "FORCE_HTTPS_REDIRECT", "XSS_PROTECTION", "REFERRER_POLICY", "NO_SNIFF", "NO_OPEN", "FRAME_GUARD", "EXPECT_CT", "PERMISSIONS_POLICY", "CROSS_ORIGIN_OPENER_POLICY", "CROSS_ORIGIN_EMBEDDER_POLICY", "CROSS_ORIGIN_RESOURCE_POLICY", "PERMITTED_CROSS_DOMAIN_POLICIES", "CORE"], undefined> & SchemaStatics<LiteralKit<readonly ["CONTENT_SECURITY_POLICY", "FORCE_HTTPS_REDIRECT", "XSS_PROTECTION", "REFERRER_POLICY", "NO_SNIFF", "NO_OPEN", "FRAME_GUARD", "EXPECT_CT", "PERMISSIONS_POLICY", "CROSS_ORIGIN_OPENER_POLICY", "CROSS_ORIGIN_EMBEDDER_POLICY", "CROSS_ORIGIN_RESOURCE_POLICY", "PERMITTED_CROSS_DOMAIN_POLICIES", "CORE"], undefined>> & LiteralKitStatics<readonly ["CONTENT_SECURITY_POLICY", "FORCE_HTTPS_REDIRECT", "XSS_PROTECTION", "REFERRER_POLICY", "NO_SNIFF", "NO_OPEN", "FRAME_GUARD", "EXPECT_CT", "PERMISSIONS_POLICY", "CROSS_ORIGIN_OPENER_POLICY", "CROSS_ORIGIN_EMBEDDER_POLICY", "CROSS_ORIGIN_RESOURCE_POLICY", "PERMITTED_CROSS_DOMAIN_POLICIES", "CORE"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeader/SecureHeader.schema.ts#L42)

Since v0.0.0