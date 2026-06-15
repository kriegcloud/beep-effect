---
title: SecureHeaderOptions.schema.ts
nav_order: 196
parent: "@beep/schema"
---

## SecureHeaderOptions.schema.ts overview

Aggregate secure-header option schema and creation helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [createHeadersObject](#createheadersobject)
  - [createSecureHeaders](#createsecureheaders)
- [models](#models)
  - [SecureHeaderEntry (class)](#secureheaderentry-class)
  - [SecureHeaderOptions (class)](#secureheaderoptions-class)
- [schemas](#schemas)
  - [Schema](#schema)
---

# constructors

## createHeadersObject

Resolve secure-header options into a plain `Record<string, string>` header object.

**Example**

```ts
import { Effect } from "effect"
import { createHeadersObject } from "@beep/schema/SecureHeaderOptions"

const program = createHeadersObject({ nosniff: "nosniff" })
console.log(program)
```

**Signature**

```ts
declare const createHeadersObject: (options?: SecureHeaderOptions | undefined) => Effect.Effect<Record<string, string>, CspError | ForceHttpsRedirectError | XssProtectionError | ReferrerPolicyError | NoSniffError | NoOpenError | FrameGuardError | ExpectCtError | PermissionsPolicyError | CrossOriginOpenerPolicyError | CrossOriginEmbedderPolicyError | CrossOriginResourcePolicyError | PermittedCrossDomainPoliciesError | CoreError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderOptions/SecureHeaderOptions.schema.ts#L178)

Since v0.0.0

## createSecureHeaders

Resolve secure-header options into an array of `SecureHeaderEntry` pairs.

**Example**

```ts
import { Effect } from "effect"
import { createSecureHeaders } from "@beep/schema/SecureHeaderOptions"

const program = createSecureHeaders({ nosniff: "nosniff" })
console.log(program)
```

**Signature**

```ts
declare const createSecureHeaders: (options?: SecureHeaderOptions | undefined) => Effect.Effect<ReadonlyArray<SecureHeaderEntry>, CspError | ForceHttpsRedirectError | XssProtectionError | ReferrerPolicyError | NoSniffError | NoOpenError | FrameGuardError | ExpectCtError | PermissionsPolicyError | CrossOriginOpenerPolicyError | CrossOriginEmbedderPolicyError | CrossOriginResourcePolicyError | PermittedCrossDomainPoliciesError | CoreError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderOptions/SecureHeaderOptions.schema.ts#L207)

Since v0.0.0

# models

## SecureHeaderEntry (class)

A rendered secure header pair in `{ key, value }` format.

**Example**

```ts
import { SecureHeaderEntry } from "@beep/schema/SecureHeaderOptions"

const entry = SecureHeaderEntry.make({ key: "X-Content-Type-Options", value: "nosniff" })
console.log(entry)
```

**Signature**

```ts
declare class SecureHeaderEntry
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderOptions/SecureHeaderOptions.schema.ts#L93)

Since v0.0.0

## SecureHeaderOptions (class)

Aggregate input options for configuring all secure response headers.

**Example**

```ts
import { SecureHeaderOptions } from "@beep/schema/SecureHeaderOptions"

const options = SecureHeaderOptions.make({ nosniff: "nosniff" })
console.log(options)
```

**Signature**

```ts
declare class SecureHeaderOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderOptions/SecureHeaderOptions.schema.ts#L58)

Since v0.0.0

# schemas

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: typeof SecureHeaderOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SecureHeaderOptions/SecureHeaderOptions.schema.ts#L226)

Since v0.0.0