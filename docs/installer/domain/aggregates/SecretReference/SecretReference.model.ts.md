---
title: SecretReference.model.ts
nav_order: 9
parent: "@beep/installer-domain"
---

## SecretReference.model.ts overview

Secret reference aggregate model.

Since v0.0.0

---
## Exports Grouped by Category
- [aggregates](#aggregates)
  - [SecretReference (class)](#secretreference-class)
  - [SecretReferencePurpose](#secretreferencepurpose)
  - [SecretReferencePurpose (type alias)](#secretreferencepurpose-type-alias)
  - [SecretReferenceStatus](#secretreferencestatus)
  - [SecretReferenceStatus (type alias)](#secretreferencestatus-type-alias)
---

# aggregates

## SecretReference (class)

Secret reference consumed by stack installer workflows.

**Example**

```ts
import { SecretReference } from "@beep/installer-domain/aggregates/SecretReference"

console.log(SecretReference)
```

**Signature**

```ts
declare class SecretReference
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/SecretReference/SecretReference.model.ts#L88)

Since v0.0.0

## SecretReferencePurpose

Installer secret reference purpose.

**Example**

```ts
import { SecretReferencePurpose } from "@beep/installer-domain/aggregates/SecretReference"

console.log(SecretReferencePurpose)
```

**Signature**

```ts
declare const SecretReferencePurpose: AnnotatedSchema<LiteralKit<readonly ["discord-bot-token", "claude-auth", "codex-auth", "provider-api-key"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/SecretReference/SecretReference.model.ts#L29)

Since v0.0.0

## SecretReferencePurpose (type alias)

Runtime type for `SecretReferencePurpose`.

**Signature**

```ts
type SecretReferencePurpose = typeof SecretReferencePurpose.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/SecretReference/SecretReference.model.ts#L46)

Since v0.0.0

## SecretReferenceStatus

Dry-run status for a secret reference.

**Example**

```ts
import { SecretReferenceStatus } from "@beep/installer-domain/aggregates/SecretReference"

console.log(SecretReferenceStatus)
```

**Signature**

```ts
declare const SecretReferenceStatus: AnnotatedSchema<LiteralKit<readonly ["reference-valid", "reference-missing", "reference-unchecked"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/SecretReference/SecretReference.model.ts#L61)

Since v0.0.0

## SecretReferenceStatus (type alias)

Runtime type for `SecretReferenceStatus`.

**Signature**

```ts
type SecretReferenceStatus = typeof SecretReferenceStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/SecretReference/SecretReference.model.ts#L73)

Since v0.0.0