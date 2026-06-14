---
title: StackManifest.model.ts
nav_order: 11
parent: "@beep/installer-domain"
---

## StackManifest.model.ts overview

AI stack manifest aggregate model.

Since v0.0.0

---
## Exports Grouped by Category
- [aggregates](#aggregates)
  - [AIStackManifest (class)](#aistackmanifest-class)
  - [ManifestCapability (class)](#manifestcapability-class)
  - [ManifestDiscordChannel (class)](#manifestdiscordchannel-class)
  - [ManifestProvider (class)](#manifestprovider-class)
  - [P1LiveProofSnapshot (class)](#p1liveproofsnapshot-class)
  - [P1aDryRunSnapshot (class)](#p1adryrunsnapshot-class)
  - [StackInstallerPlatform](#stackinstallerplatform)
  - [StackInstallerPlatform (type alias)](#stackinstallerplatform-type-alias)
  - [StackInstallerProvider](#stackinstallerprovider)
  - [StackInstallerProvider (type alias)](#stackinstallerprovider-type-alias)
  - [ValidationEvent (class)](#validationevent-class)
  - [ValidationStatus](#validationstatus)
  - [ValidationStatus (type alias)](#validationstatus-type-alias)
  - [ValidationTier](#validationtier)
  - [ValidationTier (type alias)](#validationtier-type-alias)
---

# aggregates

## AIStackManifest (class)

AI stack manifest assembled by the workspace slice.

**Example**

```ts
import { AIStackManifest } from "@beep/installer-domain/aggregates/StackManifest"

console.log(AIStackManifest)
```

**Signature**

```ts
declare class AIStackManifest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/StackManifest/StackManifest.model.ts#L212)

Since v0.0.0

## ManifestCapability (class)

Manifest capability entry.

**Example**

```ts
import { ManifestCapability } from "@beep/installer-domain/aggregates/StackManifest"

console.log(ManifestCapability)
```

**Signature**

```ts
declare class ManifestCapability
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/StackManifest/StackManifest.model.ts#L187)

Since v0.0.0

## ManifestDiscordChannel (class)

Manifest Discord channel target.

**Example**

```ts
import { ManifestDiscordChannel } from "@beep/installer-domain/aggregates/StackManifest"

console.log(ManifestDiscordChannel)
```

**Signature**

```ts
declare class ManifestDiscordChannel
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/StackManifest/StackManifest.model.ts#L162)

Since v0.0.0

## ManifestProvider (class)

Manifest provider entry.

**Example**

```ts
import { ManifestProvider } from "@beep/installer-domain/aggregates/StackManifest"

console.log(ManifestProvider)
```

**Signature**

```ts
declare class ManifestProvider
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/StackManifest/StackManifest.model.ts#L137)

Since v0.0.0

## P1LiveProofSnapshot (class)

P1 live proof snapshot containing only sanitized validation evidence.

**Example**

```ts
import { P1LiveProofSnapshot } from "@beep/installer-domain/aggregates/StackManifest"

console.log(P1LiveProofSnapshot)
```

**Signature**

```ts
declare class P1LiveProofSnapshot
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/StackManifest/StackManifest.model.ts#L294)

Since v0.0.0

## P1aDryRunSnapshot (class)

Deterministic P1A snapshot containing a manifest and validation feed.

**Example**

```ts
import { P1aDryRunSnapshot } from "@beep/installer-domain/aggregates/StackManifest"

console.log(P1aDryRunSnapshot)
```

**Signature**

```ts
declare class P1aDryRunSnapshot
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/StackManifest/StackManifest.model.ts#L269)

Since v0.0.0

## StackInstallerPlatform

Host platforms tracked by v1 installer manifests.

**Example**

```ts
import { StackInstallerPlatform } from "@beep/installer-domain/aggregates/StackManifest"

console.log(StackInstallerPlatform)
```

**Signature**

```ts
declare const StackInstallerPlatform: AnnotatedSchema<LiteralKit<readonly ["macos", "windows", "linux"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/StackManifest/StackManifest.model.ts#L29)

Since v0.0.0

## StackInstallerPlatform (type alias)

Runtime type for `StackInstallerPlatform`.

**Signature**

```ts
type StackInstallerPlatform = typeof StackInstallerPlatform.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/StackManifest/StackManifest.model.ts#L41)

Since v0.0.0

## StackInstallerProvider

Provider names tracked by the stack manifest.

**Example**

```ts
import { StackInstallerProvider } from "@beep/installer-domain/aggregates/StackManifest"

console.log(StackInstallerProvider)
```

**Signature**

```ts
declare const StackInstallerProvider: AnnotatedSchema<LiteralKit<readonly ["claude", "codex"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/StackManifest/StackManifest.model.ts#L56)

Since v0.0.0

## StackInstallerProvider (type alias)

Runtime type for `StackInstallerProvider`.

**Signature**

```ts
type StackInstallerProvider = typeof StackInstallerProvider.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/StackManifest/StackManifest.model.ts#L68)

Since v0.0.0

## ValidationEvent (class)

Validation event emitted while proving an installer manifest.

**Example**

```ts
import { ValidationEvent } from "@beep/installer-domain/aggregates/StackManifest"

console.log(ValidationEvent)
```

**Signature**

```ts
declare class ValidationEvent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/StackManifest/StackManifest.model.ts#L242)

Since v0.0.0

## ValidationStatus

Validation status for installer evidence events.

**Example**

```ts
import { ValidationStatus } from "@beep/installer-domain/aggregates/StackManifest"

console.log(ValidationStatus)
```

**Signature**

```ts
declare const ValidationStatus: AnnotatedSchema<LiteralKit<readonly ["passed", "failed", "indeterminate"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/StackManifest/StackManifest.model.ts#L110)

Since v0.0.0

## ValidationStatus (type alias)

Runtime type for `ValidationStatus`.

**Signature**

```ts
type ValidationStatus = typeof ValidationStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/StackManifest/StackManifest.model.ts#L122)

Since v0.0.0

## ValidationTier

Validation tier for installer evidence events.

**Example**

```ts
import { ValidationTier } from "@beep/installer-domain/aggregates/StackManifest"

console.log(ValidationTier)
```

**Signature**

```ts
declare const ValidationTier: AnnotatedSchema<LiteralKit<readonly ["existence", "version", "config", "liveness", "user-confirmation"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/StackManifest/StackManifest.model.ts#L83)

Since v0.0.0

## ValidationTier (type alias)

Runtime type for `ValidationTier`.

**Signature**

```ts
type ValidationTier = typeof ValidationTier.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/StackManifest/StackManifest.model.ts#L95)

Since v0.0.0