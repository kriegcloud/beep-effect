---
title: AiProviderCli.service.ts
nav_order: 3
parent: "@beep/ai-provider-cli"
---

## AiProviderCli.service.ts overview

Effect service for Claude and Codex CLI status probes.

Since v0.0.0

---
## Exports Grouped by Category
- [services](#services)
  - [AiProviderCli (class)](#aiprovidercli-class)
  - [AiProviderCliRunner (type alias)](#aiproviderclirunner-type-alias)
---

# services

## AiProviderCli (class)

Effect service for Claude and Codex CLI status checks.

**Example**

```ts
import { AiProviderCli } from "@beep/ai-provider-cli/AiProviderCli.service"

console.log(AiProviderCli)
```

**Signature**

```ts
declare class AiProviderCli
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ai-provider-cli/src/AiProviderCli.service.ts#L141)

Since v0.0.0

## AiProviderCliRunner (type alias)

Product-neutral process runner used by provider CLI probes.

**Example**

```ts
import type { AiProviderCliRunner } from "@beep/ai-provider-cli/AiProviderCli.service"

const value = {} as AiProviderCliRunner
console.log(value)
```

**Signature**

```ts
type AiProviderCliRunner = (
  provider: AiProviderCliProvider,
  command: string,
  args: ReadonlyArray<string>
) => Effect.Effect<AiProviderCliProcessResult, AiProviderCliError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/ai-provider-cli/src/AiProviderCli.service.ts#L39)

Since v0.0.0