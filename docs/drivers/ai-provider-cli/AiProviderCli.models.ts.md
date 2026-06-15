---
title: AiProviderCli.models.ts
nav_order: 2
parent: "@beep/ai-provider-cli"
---

## AiProviderCli.models.ts overview

Data models for provider CLI probes.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [AiProviderCliAuthProbe (class)](#aiprovidercliauthprobe-class)
  - [AiProviderCliAuthStatus](#aiprovidercliauthstatus)
  - [AiProviderCliAuthStatus (type alias)](#aiprovidercliauthstatus-type-alias)
  - [AiProviderCliProcessResult (class)](#aiprovidercliprocessresult-class)
  - [AiProviderCliProvider](#aiprovidercliprovider)
  - [AiProviderCliProvider (type alias)](#aiprovidercliprovider-type-alias)
---

# models

## AiProviderCliAuthProbe (class)

Redacted provider CLI authentication probe.

**Example**

```ts
import { AiProviderCliAuthProbe } from "@beep/ai-provider-cli/AiProviderCli.models"

console.log(AiProviderCliAuthProbe)
```

**Signature**

```ts
declare class AiProviderCliAuthProbe
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ai-provider-cli/src/AiProviderCli.models.ts#L105)

Since v0.0.0

## AiProviderCliAuthStatus

Provider CLI authentication status.

**Example**

```ts
import { AiProviderCliAuthStatus } from "@beep/ai-provider-cli/AiProviderCli.models"

console.log(AiProviderCliAuthStatus)
```

**Signature**

```ts
declare const AiProviderCliAuthStatus: AnnotatedSchema<LiteralKit<readonly ["authenticated", "not-authenticated"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ai-provider-cli/src/AiProviderCli.models.ts#L54)

Since v0.0.0

## AiProviderCliAuthStatus (type alias)

Runtime type for `AiProviderCliAuthStatus`.

**Signature**

```ts
type AiProviderCliAuthStatus = typeof AiProviderCliAuthStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ai-provider-cli/src/AiProviderCli.models.ts#L66)

Since v0.0.0

## AiProviderCliProcessResult (class)

Provider CLI process result.

**Example**

```ts
import { AiProviderCliProcessResult } from "@beep/ai-provider-cli/AiProviderCli.models"

console.log(AiProviderCliProcessResult)
```

**Signature**

```ts
declare class AiProviderCliProcessResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ai-provider-cli/src/AiProviderCli.models.ts#L81)

Since v0.0.0

## AiProviderCliProvider

AI provider CLI vocabulary.

**Example**

```ts
import { AiProviderCliProvider } from "@beep/ai-provider-cli/AiProviderCli.models"

console.log(AiProviderCliProvider)
```

**Signature**

```ts
declare const AiProviderCliProvider: AnnotatedSchema<LiteralKit<readonly ["claude", "codex"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ai-provider-cli/src/AiProviderCli.models.ts#L27)

Since v0.0.0

## AiProviderCliProvider (type alias)

Runtime type for `AiProviderCliProvider`.

**Signature**

```ts
type AiProviderCliProvider = typeof AiProviderCliProvider.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ai-provider-cli/src/AiProviderCli.models.ts#L39)

Since v0.0.0