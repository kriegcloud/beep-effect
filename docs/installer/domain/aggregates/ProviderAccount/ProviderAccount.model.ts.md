---
title: ProviderAccount.model.ts
nav_order: 7
parent: "@beep/installer-domain"
---

## ProviderAccount.model.ts overview

Provider account aggregate model.

Since v0.0.0

---
## Exports Grouped by Category
- [aggregates](#aggregates)
  - [ProviderAccount (class)](#provideraccount-class)
  - [ProviderAccountStatus](#provideraccountstatus)
  - [ProviderAccountStatus (type alias)](#provideraccountstatus-type-alias)
  - [ProviderAuthMode](#providerauthmode)
  - [ProviderAuthMode (type alias)](#providerauthmode-type-alias)
  - [ProviderKind](#providerkind)
  - [ProviderKind (type alias)](#providerkind-type-alias)
---

# aggregates

## ProviderAccount (class)

Provider account requested by the installer.

**Example**

```ts
import { ProviderAccount } from "@beep/installer-domain/aggregates/ProviderAccount"

console.log(ProviderAccount)
```

**Signature**

```ts
declare class ProviderAccount
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/ProviderAccount/ProviderAccount.model.ts#L110)

Since v0.0.0

## ProviderAccountStatus

Dry-run status for a provider account.

**Example**

```ts
import { ProviderAccountStatus } from "@beep/installer-domain/aggregates/ProviderAccount"

console.log(ProviderAccountStatus)
```

**Signature**

```ts
declare const ProviderAccountStatus: AnnotatedSchema<LiteralKit<readonly ["configured", "missing", "unchecked"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/ProviderAccount/ProviderAccount.model.ts#L83)

Since v0.0.0

## ProviderAccountStatus (type alias)

Runtime type for `ProviderAccountStatus`.

**Signature**

```ts
type ProviderAccountStatus = typeof ProviderAccountStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/ProviderAccount/ProviderAccount.model.ts#L95)

Since v0.0.0

## ProviderAuthMode

Authentication shape for a provider account.

**Example**

```ts
import { ProviderAuthMode } from "@beep/installer-domain/aggregates/ProviderAccount"

console.log(ProviderAuthMode)
```

**Signature**

```ts
declare const ProviderAuthMode: AnnotatedSchema<LiteralKit<readonly ["one-password-reference", "existing-local-session"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/ProviderAccount/ProviderAccount.model.ts#L56)

Since v0.0.0

## ProviderAuthMode (type alias)

Runtime type for `ProviderAuthMode`.

**Signature**

```ts
type ProviderAuthMode = typeof ProviderAuthMode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/ProviderAccount/ProviderAccount.model.ts#L68)

Since v0.0.0

## ProviderKind

Provider supported by the v1 installer dry-run.

**Example**

```ts
import { ProviderKind } from "@beep/installer-domain/aggregates/ProviderAccount"

console.log(ProviderKind)
```

**Signature**

```ts
declare const ProviderKind: AnnotatedSchema<LiteralKit<readonly ["claude", "codex"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/ProviderAccount/ProviderAccount.model.ts#L29)

Since v0.0.0

## ProviderKind (type alias)

Runtime type for `ProviderKind`.

**Signature**

```ts
type ProviderKind = typeof ProviderKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/ProviderAccount/ProviderAccount.model.ts#L41)

Since v0.0.0