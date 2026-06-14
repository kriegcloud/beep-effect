---
title: public.ts
nav_order: 2
parent: "@beep/installer-use-cases"
---

## public.ts overview

Installer public use-case exports.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [SecretReferenceReadError (class)](#secretreferencereaderror-class)
- [use-cases](#use-cases)
  - [DiscordChannelPlan (class)](#discordchannelplan-class)
  - [DiscordLiveValidationRequest (class)](#discordlivevalidationrequest-class)
  - [DiscordLiveValidationResult (class)](#discordlivevalidationresult-class)
  - [HostDependencyPlan (class)](#hostdependencyplan-class)
  - [HostDependencyValidationResult (class)](#hostdependencyvalidationresult-class)
  - [InstallerDryRunVerb (class)](#installerdryrunverb-class)
  - [P1A_DISCORD_CHANNEL_VERB_INPUTS](#p1a_discord_channel_verb_inputs)
  - [P1A_DRY_RUN_SNAPSHOT_INPUT](#p1a_dry_run_snapshot_input)
  - [P1A_HOST_DEPENDENCY_VERB_INPUTS](#p1a_host_dependency_verb_inputs)
  - [P1A_INSTALLER_DRY_RUN_REGISTRY_INPUTS](#p1a_installer_dry_run_registry_inputs)
  - [P1A_PROVIDER_ACCOUNT_VERB_INPUTS](#p1a_provider_account_verb_inputs)
  - [P1A_SECRET_REFERENCE_VERB_INPUTS](#p1a_secret_reference_verb_inputs)
  - [P1A_WORKSPACE_VERB_INPUTS](#p1a_workspace_verb_inputs)
  - [P1ManualProofRequest (class)](#p1manualproofrequest-class)
  - [P1ManualProofResult (class)](#p1manualproofresult-class)
  - [ProviderAccountPlan (class)](#provideraccountplan-class)
  - [ProviderAuthValidationResult (class)](#providerauthvalidationresult-class)
  - [SecretReferencePlan (class)](#secretreferenceplan-class)
  - [SecretReferenceValidationRequest (class)](#secretreferencevalidationrequest-class)
  - [SecretReferenceValidationResult (class)](#secretreferencevalidationresult-class)
  - [WorkspaceDryRunPlan (class)](#workspacedryrunplan-class)
---

# errors

## SecretReferenceReadError (class)

Typed failure for an approved live secret read.

**Example**

```ts
import { SecretReferenceReadError } from "@beep/installer-use-cases/public"

console.log(SecretReferenceReadError)
```

**Signature**

```ts
declare class SecretReferenceReadError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L262)

Since v0.0.0

# use-cases

## DiscordChannelPlan (class)

Dry-run Discord channel preview plan.

**Example**

```ts
import { DiscordChannelPlan } from "@beep/installer-use-cases/public"

console.log(DiscordChannelPlan)
```

**Signature**

```ts
declare class DiscordChannelPlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L286)

Since v0.0.0

## DiscordLiveValidationRequest (class)

Live Discord validation request.

**Example**

```ts
import { DiscordLiveValidationRequest } from "@beep/installer-use-cases/public"

console.log(DiscordLiveValidationRequest)
```

**Signature**

```ts
declare class DiscordLiveValidationRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L311)

Since v0.0.0

## DiscordLiveValidationResult (class)

Live Discord validation result.

**Example**

```ts
import { DiscordLiveValidationResult } from "@beep/installer-use-cases/public"

console.log(DiscordLiveValidationResult)
```

**Signature**

```ts
declare class DiscordLiveValidationResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L337)

Since v0.0.0

## HostDependencyPlan (class)

Dry-run dependency preview plan.

**Example**

```ts
import { HostDependencyPlan } from "@beep/installer-use-cases/public"

console.log(HostDependencyPlan)
```

**Signature**

```ts
declare class HostDependencyPlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L74)

Since v0.0.0

## HostDependencyValidationResult (class)

Live host dependency validation result.

**Example**

```ts
import { HostDependencyValidationResult } from "@beep/installer-use-cases/public"

console.log(HostDependencyValidationResult)
```

**Signature**

```ts
declare class HostDependencyValidationResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L99)

Since v0.0.0

## InstallerDryRunVerb (class)

Dry-run verb owned by the installer slice.

**Example**

```ts
import { InstallerDryRunVerb } from "@beep/installer-use-cases/public"

console.log(InstallerDryRunVerb)
```

**Signature**

```ts
declare class InstallerDryRunVerb
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L47)

Since v0.0.0

## P1A_DISCORD_CHANNEL_VERB_INPUTS

Static P1A verb contracts owned by the Discord-channel concept.

**Example**

```ts
import { P1A_DISCORD_CHANNEL_VERB_INPUTS } from "@beep/installer-use-cases/public"

console.log(P1A_DISCORD_CHANNEL_VERB_INPUTS)
```

**Signature**

```ts
declare const P1A_DISCORD_CHANNEL_VERB_INPUTS: readonly [{ readonly dryRunOnly: true; readonly id: "installer.channels.validate-discord-target"; readonly label: "Validate Discord Target"; readonly requiresApproval: false; readonly summary: "Check guild/channel identifiers and bot-token reference shape without contacting Discord."; }, { readonly dryRunOnly: true; readonly id: "installer.channels.preview-message-route"; readonly label: "Preview Message Route"; readonly requiresApproval: true; readonly summary: "Render the Discord route a human would approve before live messaging exists."; }]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L530)

Since v0.0.0

## P1A_DRY_RUN_SNAPSHOT_INPUT

Deterministic P1A manifest snapshot input.

**Example**

```ts
import { P1A_DRY_RUN_SNAPSHOT_INPUT } from "@beep/installer-use-cases/public"

console.log(P1A_DRY_RUN_SNAPSHOT_INPUT)
```

**Signature**

```ts
declare const P1A_DRY_RUN_SNAPSHOT_INPUT: { readonly generatedBy: "@beep/installer-use-cases"; readonly manifest: { readonly capabilities: readonly [{ readonly id: "provider-claude"; readonly label: "Claude Provider"; readonly summary: "Claude account intent is represented without live authentication."; }, { readonly id: "provider-codex"; readonly label: "Codex Provider"; readonly summary: "Codex account intent is represented without live authentication."; }, { readonly id: "channel-discord"; readonly label: "Discord Channel"; readonly summary: "Discord is the only v1 notification channel."; }]; readonly credentialReferences: readonly ["op://Private/Discord Bot/token", "op://Private/Claude/token", "op://Private/Codex/token"]; readonly discordChannel: { readonly channelId: "012345678901234567"; readonly displayName: "ai-stack-installer"; readonly guildId: "987654321098765432"; }; readonly dryRunOnly: true; readonly manifestId: "stack-installer-p1a-dry-run"; readonly providers: readonly [{ readonly authMode: "one-password-reference"; readonly provider: "claude"; readonly status: "unchecked"; }, { readonly authMode: "one-password-reference"; readonly provider: "codex"; readonly status: "unchecked"; }]; readonly targetPlatform: "macos"; readonly version: "p1a.0"; }; readonly validationEvents: readonly [{ readonly id: "dependency-registry-static"; readonly message: "Dependency verbs are installer-owned and dry-run-only."; readonly status: "passed"; readonly subject: "installer:host-dependencies"; readonly tier: "config"; }, { readonly id: "secret-reference-shape"; readonly message: "Credential inputs are 1Password references, not plaintext values."; readonly status: "passed"; readonly subject: "installer:secret-references"; readonly tier: "config"; }, { readonly id: "provider-coverage"; readonly message: "Claude and Codex provider fixtures are both represented."; readonly status: "passed"; readonly subject: "installer:providers"; readonly tier: "existence"; }, { readonly id: "discord-v1-channel"; readonly message: "Discord is represented as the only v1 channel."; readonly status: "passed"; readonly subject: "installer:discord-channel"; readonly tier: "existence"; }]; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L611)

Since v0.0.0

## P1A_HOST_DEPENDENCY_VERB_INPUTS

Static P1A verb contracts owned by the host-dependency concept.

**Example**

```ts
import { P1A_HOST_DEPENDENCY_VERB_INPUTS } from "@beep/installer-use-cases/public"

console.log(P1A_HOST_DEPENDENCY_VERB_INPUTS)
```

**Signature**

```ts
declare const P1A_HOST_DEPENDENCY_VERB_INPUTS: readonly [{ readonly dryRunOnly: true; readonly id: "installer.dependencies.detect-host"; readonly label: "Detect Host Dependencies"; readonly requiresApproval: false; readonly summary: "Check whether required tools appear to exist without installing or upgrading anything."; }, { readonly dryRunOnly: true; readonly id: "installer.dependencies.preview-install-plan"; readonly label: "Preview Dependency Plan"; readonly requiresApproval: true; readonly summary: "Render the package/app plan a human would approve before live installation is enabled."; }]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L440)

Since v0.0.0

## P1A_INSTALLER_DRY_RUN_REGISTRY_INPUTS

Static P1A dry-run registry inputs composed inside the installer slice.

**Example**

```ts
import { P1A_INSTALLER_DRY_RUN_REGISTRY_INPUTS } from "@beep/installer-use-cases/public"

console.log(P1A_INSTALLER_DRY_RUN_REGISTRY_INPUTS)
```

**Signature**

```ts
declare const P1A_INSTALLER_DRY_RUN_REGISTRY_INPUTS: readonly [{ readonly dryRunOnly: true; readonly id: "installer.dependencies.detect-host"; readonly label: "Detect Host Dependencies"; readonly requiresApproval: false; readonly summary: "Check whether required tools appear to exist without installing or upgrading anything."; }, { readonly dryRunOnly: true; readonly id: "installer.dependencies.preview-install-plan"; readonly label: "Preview Dependency Plan"; readonly requiresApproval: true; readonly summary: "Render the package/app plan a human would approve before live installation is enabled."; }, { readonly dryRunOnly: true; readonly id: "installer.security.validate-one-password-reference"; readonly label: "Validate 1Password References"; readonly requiresApproval: false; readonly summary: "Validate reference syntax and purpose while refusing plaintext secrets."; }, { readonly dryRunOnly: true; readonly id: "installer.security.preview-secret-usage"; readonly label: "Preview Secret Usage"; readonly requiresApproval: true; readonly summary: "Show which workflow will consume each 1Password reference before live execution exists."; }, { readonly dryRunOnly: true; readonly id: "installer.providers.validate-claude"; readonly label: "Validate Claude Provider"; readonly requiresApproval: false; readonly summary: "Check Claude provider intent and credential-reference shape without making a network call."; }, { readonly dryRunOnly: true; readonly id: "installer.providers.validate-codex"; readonly label: "Validate Codex Provider"; readonly requiresApproval: false; readonly summary: "Check Codex provider intent and credential-reference shape without making a network call."; }, { readonly dryRunOnly: true; readonly id: "installer.channels.validate-discord-target"; readonly label: "Validate Discord Target"; readonly requiresApproval: false; readonly summary: "Check guild/channel identifiers and bot-token reference shape without contacting Discord."; }, { readonly dryRunOnly: true; readonly id: "installer.channels.preview-message-route"; readonly label: "Preview Message Route"; readonly requiresApproval: true; readonly summary: "Render the Discord route a human would approve before live messaging exists."; }, { readonly dryRunOnly: true; readonly id: "installer.workspace.compose-stack-manifest"; readonly label: "Compose Stack Manifest"; readonly requiresApproval: false; readonly summary: "Assemble the dry-run manifest from installer-owned contracts."; }, { readonly dryRunOnly: true; readonly id: "installer.workspace.record-validation-event"; readonly label: "Record Validation Event"; readonly requiresApproval: false; readonly summary: "Record deterministic evidence events for the P1A proof surface."; }]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L590)

Since v0.0.0

## P1A_PROVIDER_ACCOUNT_VERB_INPUTS

Static P1A verb contracts owned by the provider-account concept.

**Example**

```ts
import { P1A_PROVIDER_ACCOUNT_VERB_INPUTS } from "@beep/installer-use-cases/public"

console.log(P1A_PROVIDER_ACCOUNT_VERB_INPUTS)
```

**Signature**

```ts
declare const P1A_PROVIDER_ACCOUNT_VERB_INPUTS: readonly [{ readonly dryRunOnly: true; readonly id: "installer.providers.validate-claude"; readonly label: "Validate Claude Provider"; readonly requiresApproval: false; readonly summary: "Check Claude provider intent and credential-reference shape without making a network call."; }, { readonly dryRunOnly: true; readonly id: "installer.providers.validate-codex"; readonly label: "Validate Codex Provider"; readonly requiresApproval: false; readonly summary: "Check Codex provider intent and credential-reference shape without making a network call."; }]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L500)

Since v0.0.0

## P1A_SECRET_REFERENCE_VERB_INPUTS

Static P1A verb contracts owned by the secret-reference concept.

**Example**

```ts
import { P1A_SECRET_REFERENCE_VERB_INPUTS } from "@beep/installer-use-cases/public"

console.log(P1A_SECRET_REFERENCE_VERB_INPUTS)
```

**Signature**

```ts
declare const P1A_SECRET_REFERENCE_VERB_INPUTS: readonly [{ readonly dryRunOnly: true; readonly id: "installer.security.validate-one-password-reference"; readonly label: "Validate 1Password References"; readonly requiresApproval: false; readonly summary: "Validate reference syntax and purpose while refusing plaintext secrets."; }, { readonly dryRunOnly: true; readonly id: "installer.security.preview-secret-usage"; readonly label: "Preview Secret Usage"; readonly requiresApproval: true; readonly summary: "Show which workflow will consume each 1Password reference before live execution exists."; }]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L470)

Since v0.0.0

## P1A_WORKSPACE_VERB_INPUTS

Static P1A verb contracts owned by the stack-manifest concept.

**Example**

```ts
import { P1A_WORKSPACE_VERB_INPUTS } from "@beep/installer-use-cases/public"

console.log(P1A_WORKSPACE_VERB_INPUTS)
```

**Signature**

```ts
declare const P1A_WORKSPACE_VERB_INPUTS: readonly [{ readonly dryRunOnly: true; readonly id: "installer.workspace.compose-stack-manifest"; readonly label: "Compose Stack Manifest"; readonly requiresApproval: false; readonly summary: "Assemble the dry-run manifest from installer-owned contracts."; }, { readonly dryRunOnly: true; readonly id: "installer.workspace.record-validation-event"; readonly label: "Record Validation Event"; readonly requiresApproval: false; readonly summary: "Record deterministic evidence events for the P1A proof surface."; }]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L560)

Since v0.0.0

## P1ManualProofRequest (class)

P1 Manual Mode proof request.

**Example**

```ts
import { P1ManualProofRequest } from "@beep/installer-use-cases/public"

console.log(P1ManualProofRequest)
```

**Signature**

```ts
declare class P1ManualProofRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L388)

Since v0.0.0

## P1ManualProofResult (class)

P1 Manual Mode proof result.

**Example**

```ts
import { P1ManualProofResult } from "@beep/installer-use-cases/public"

console.log(P1ManualProofResult)
```

**Signature**

```ts
declare class P1ManualProofResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L417)

Since v0.0.0

## ProviderAccountPlan (class)

Dry-run provider preview plan.

**Example**

```ts
import { ProviderAccountPlan } from "@beep/installer-use-cases/public"

console.log(ProviderAccountPlan)
```

**Signature**

```ts
declare class ProviderAccountPlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L125)

Since v0.0.0

## ProviderAuthValidationResult (class)

Live provider authentication validation result.

**Example**

```ts
import { ProviderAuthValidationResult } from "@beep/installer-use-cases/public"

console.log(ProviderAuthValidationResult)
```

**Signature**

```ts
declare class ProviderAuthValidationResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L150)

Since v0.0.0

## SecretReferencePlan (class)

Dry-run secret-reference preview plan.

**Example**

```ts
import { SecretReferencePlan } from "@beep/installer-use-cases/public"

console.log(SecretReferencePlan)
```

**Signature**

```ts
declare class SecretReferencePlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L179)

Since v0.0.0

## SecretReferenceValidationRequest (class)

Live 1Password reference validation request.

**Example**

```ts
import { SecretReferenceValidationRequest } from "@beep/installer-use-cases/public"

console.log(SecretReferenceValidationRequest)
```

**Signature**

```ts
declare class SecretReferenceValidationRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L204)

Since v0.0.0

## SecretReferenceValidationResult (class)

Live 1Password reference validation result.

**Example**

```ts
import { SecretReferenceValidationResult } from "@beep/installer-use-cases/public"

console.log(SecretReferenceValidationResult)
```

**Signature**

```ts
declare class SecretReferenceValidationResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L232)

Since v0.0.0

## WorkspaceDryRunPlan (class)

Workspace dry-run plan.

**Example**

```ts
import { WorkspaceDryRunPlan } from "@beep/installer-use-cases/public"

console.log(WorkspaceDryRunPlan)
```

**Signature**

```ts
declare class WorkspaceDryRunPlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/use-cases/src/public.ts#L363)

Since v0.0.0