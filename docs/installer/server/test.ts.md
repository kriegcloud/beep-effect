---
title: test.ts
nav_order: 3
parent: "@beep/installer-server"
---

## test.ts overview

installer server test layer.

Since v0.0.0

---
## Exports Grouped by Category
- [testing](#testing)
  - [InstallerServerTest](#installerservertest)
---

# testing

## InstallerServerTest

Deterministic test layer for the installer slice.

**Example**

```ts
import { InstallerServerTest } from "@beep/installer-server/test"

console.log(InstallerServerTest)
```

**Signature**

```ts
declare const InstallerServerTest: Layer<HostDependencyUseCases | ProviderAccountUseCases | SecretReferenceUseCases | DiscordChannelUseCases | StackManifestUseCases | P1ManualProofWorkflow, SchemaError, ChildProcessSpawner | OnePasswordCli | AiProviderCli | Discord>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/test.ts#L24)

Since v0.0.0