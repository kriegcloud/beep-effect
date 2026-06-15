---
title: Layer.ts
nav_order: 2
parent: "@beep/installer-server"
---

## Layer.ts overview

Installer server layer.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [DiscordChannelServerLive](#discordchannelserverlive)
  - [HostDependencyServerLive](#hostdependencyserverlive)
  - [InstallerConceptServerLive](#installerconceptserverlive)
  - [InstallerServerLive](#installerserverlive)
  - [P1ManualProofWorkflowLive](#p1manualproofworkflowlive)
  - [ProviderAccountServerLive](#provideraccountserverlive)
  - [SecretReferenceServerLive](#secretreferenceserverlive)
  - [StackManifestServerLive](#stackmanifestserverlive)
  - [makeDiscordChannelServer](#makediscordchannelserver)
  - [makeHostDependencyServer](#makehostdependencyserver)
  - [makeProviderAccountServer](#makeprovideraccountserver)
  - [makeSecretReferenceServer](#makesecretreferenceserver)
  - [makeStackManifestServer](#makestackmanifestserver)
- [workflows](#workflows)
  - [makeP1ManualProofWorkflow](#makep1manualproofworkflow)
  - [previewP1ManualProof](#previewp1manualproof)
  - [runP1ManualProof](#runp1manualproof)
---

# layers

## DiscordChannelServerLive

Discord-channel concept layer.

**Example**

```ts
import { DiscordChannelServerLive } from "@beep/installer-server/layer"

console.log(DiscordChannelServerLive)
```

**Signature**

```ts
declare const DiscordChannelServerLive: Layer.Layer<DiscordChannelUseCases, S.SchemaError, Discord>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/Layer.ts#L804)

Since v0.0.0

## HostDependencyServerLive

Host-dependency concept layer.

**Example**

```ts
import { HostDependencyServerLive } from "@beep/installer-server/layer"

console.log(HostDependencyServerLive)
```

**Signature**

```ts
declare const HostDependencyServerLive: Layer.Layer<HostDependencyUseCases, S.SchemaError, ChildProcessSpawner.ChildProcessSpawner>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/Layer.ts#L759)

Since v0.0.0

## InstallerConceptServerLive

Concept-local installer services.

**Example**

```ts
import { InstallerConceptServerLive } from "@beep/installer-server/layer"

console.log(InstallerConceptServerLive)
```

**Signature**

```ts
declare const InstallerConceptServerLive: Layer.Layer<HostDependencyUseCases | ProviderAccountUseCases | SecretReferenceUseCases | DiscordChannelUseCases | StackManifestUseCases, S.SchemaError, ChildProcessSpawner.ChildProcessSpawner | OnePasswordCli | AiProviderCli | Discord>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/Layer.ts#L834)

Since v0.0.0

## InstallerServerLive

Complete installer server layer.

**Example**

```ts
import { InstallerServerLive } from "@beep/installer-server/layer"

console.log(InstallerServerLive)
```

**Signature**

```ts
declare const InstallerServerLive: Layer.Layer<HostDependencyUseCases | ProviderAccountUseCases | SecretReferenceUseCases | DiscordChannelUseCases | StackManifestUseCases | P1ManualProofWorkflow, S.SchemaError, ChildProcessSpawner.ChildProcessSpawner | OnePasswordCli | AiProviderCli | Discord>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/Layer.ts#L870)

Since v0.0.0

## P1ManualProofWorkflowLive

P1 Manual Mode proof workflow layer.

**Example**

```ts
import { P1ManualProofWorkflowLive } from "@beep/installer-server/layer"

console.log(P1ManualProofWorkflowLive)
```

**Signature**

```ts
declare const P1ManualProofWorkflowLive: Layer.Layer<P1ManualProofWorkflow, never, HostDependencyUseCases | ProviderAccountUseCases | SecretReferenceUseCases | DiscordChannelUseCases>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/Layer.ts#L855)

Since v0.0.0

## ProviderAccountServerLive

Provider-account concept layer.

**Example**

```ts
import { ProviderAccountServerLive } from "@beep/installer-server/layer"

console.log(ProviderAccountServerLive)
```

**Signature**

```ts
declare const ProviderAccountServerLive: Layer.Layer<ProviderAccountUseCases, S.SchemaError, AiProviderCli>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/Layer.ts#L789)

Since v0.0.0

## SecretReferenceServerLive

Secret-reference concept layer.

**Example**

```ts
import { SecretReferenceServerLive } from "@beep/installer-server/layer"

console.log(SecretReferenceServerLive)
```

**Signature**

```ts
declare const SecretReferenceServerLive: Layer.Layer<SecretReferenceUseCases, S.SchemaError, OnePasswordCli>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/Layer.ts#L774)

Since v0.0.0

## StackManifestServerLive

Stack-manifest concept layer.

**Example**

```ts
import { StackManifestServerLive } from "@beep/installer-server/layer"

console.log(StackManifestServerLive)
```

**Signature**

```ts
declare const StackManifestServerLive: Layer.Layer<StackManifestUseCases, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/Layer.ts#L819)

Since v0.0.0

## makeDiscordChannelServer

Build the Discord-channel concept server.

**Example**

```ts
import { makeDiscordChannelServer } from "@beep/installer-server/layer"

console.log(makeDiscordChannelServer)
```

**Signature**

```ts
declare const makeDiscordChannelServer: () => Effect.Effect<{ previewDiscordChannels: Effect.Effect<DiscordChannelPlan, never, never>; validateDiscordChannel: (rawRequest: DiscordLiveValidationRequest, botToken: Redacted.Redacted<string>) => Effect.Effect<DiscordLiveValidationResult, S.SchemaError, never>; }, S.SchemaError, Discord>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/Layer.ts#L506)

Since v0.0.0

## makeHostDependencyServer

Build the host-dependency concept server.

**Example**

```ts
import { makeHostDependencyServer } from "@beep/installer-server/layer"

console.log(makeHostDependencyServer)
```

**Signature**

```ts
declare const makeHostDependencyServer: () => Effect.Effect<{ previewHostDependencies: Effect.Effect<HostDependencyPlan, never, never>; validateRequiredCommands: Effect.Effect<[HostDependencyValidationResult, ...HostDependencyValidationResult[]], never, never>; }, S.SchemaError, ChildProcessSpawner.ChildProcessSpawner>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/Layer.ts#L343)

Since v0.0.0

## makeProviderAccountServer

Build the provider-account concept server.

**Example**

```ts
import { makeProviderAccountServer } from "@beep/installer-server/layer"

console.log(makeProviderAccountServer)
```

**Signature**

```ts
declare const makeProviderAccountServer: () => Effect.Effect<{ previewProviderAccounts: Effect.Effect<ProviderAccountPlan, never, never>; validateProviderAuths: Effect.Effect<[ProviderAuthValidationResult, ...ProviderAuthValidationResult[]], never, never>; }, S.SchemaError, AiProviderCli>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/Layer.ts#L458)

Since v0.0.0

## makeSecretReferenceServer

Build the secret-reference concept server.

**Example**

```ts
import { makeSecretReferenceServer } from "@beep/installer-server/layer"

console.log(makeSecretReferenceServer)
```

**Signature**

```ts
declare const makeSecretReferenceServer: () => Effect.Effect<{ previewSecretReferences: Effect.Effect<SecretReferencePlan, never, never>; readSecretReference: (reference: string & Brand<"OnePasswordReference">) => Effect.Effect<Redacted.Redacted<string>, SecretReferenceReadError, never>; validateSecretReference: (rawRequest: SecretReferenceValidationRequest) => Effect.Effect<SecretReferenceValidationResult, S.SchemaError, never>; }, S.SchemaError, OnePasswordCli>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/Layer.ts#L368)

Since v0.0.0

## makeStackManifestServer

Build the stack-manifest concept server.

**Example**

```ts
import { makeStackManifestServer } from "@beep/installer-server/layer"

console.log(makeStackManifestServer)
```

**Signature**

```ts
declare const makeStackManifestServer: () => Effect.Effect<{ previewWorkspace: Effect.Effect<WorkspaceDryRunPlan, never, never>; }, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/Layer.ts#L570)

Since v0.0.0

# workflows

## makeP1ManualProofWorkflow

Build the P1 Manual Mode proof workflow.

**Example**

```ts
import { makeP1ManualProofWorkflow } from "@beep/installer-server/layer"

console.log(makeP1ManualProofWorkflow)
```

**Signature**

```ts
declare const makeP1ManualProofWorkflow: () => Effect.Effect<{ preview: (rawRequest: P1ManualProofRequest) => Effect.Effect<P1ManualProofResult, S.SchemaError, never>; run: (rawRequest: P1ManualProofRequest) => Effect.Effect<P1ManualProofResult, S.SchemaError | SecretReferenceReadError, never>; }, never, HostDependencyUseCases | ProviderAccountUseCases | SecretReferenceUseCases | DiscordChannelUseCases>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/Layer.ts#L591)

Since v0.0.0

## previewP1ManualProof

Preview the P1 Manual Mode proof without sending a Discord message.

**Example**

```ts
import { previewP1ManualProof } from "@beep/installer-server/layer"

console.log(previewP1ManualProof)
```

**Signature**

```ts
declare const previewP1ManualProof: (request: P1ManualProofRequest) => Effect.Effect<P1ManualProofResult, S.SchemaError, P1ManualProofWorkflow>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/Layer.ts#L905)

Since v0.0.0

## runP1ManualProof

Run the live P1 Manual Mode proof and return sanitized evidence.

**Example**

```ts
import { runP1ManualProof } from "@beep/installer-server/layer"

console.log(runP1ManualProof)
```

**Signature**

```ts
declare const runP1ManualProof: (request: P1ManualProofRequest) => Effect.Effect<P1ManualProofResult, S.SchemaError | SecretReferenceReadError, P1ManualProofWorkflow>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/server/src/Layer.ts#L885)

Since v0.0.0