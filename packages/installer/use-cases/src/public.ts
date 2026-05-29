/**
 * Installer public use-case exports.
 *
 * @packageDocumentation
 * @category use-cases
 * @since 0.0.0
 */

import { $InstallerUseCasesId } from "@beep/identity/packages";
import { DiscordChannel, DiscordChannelStatus } from "@beep/installer-domain/aggregates/DiscordChannel";
import { HostDependency } from "@beep/installer-domain/aggregates/HostDependency";
import {
  ProviderAccount,
  ProviderAccountStatus,
  ProviderAuthMode,
  ProviderKind,
} from "@beep/installer-domain/aggregates/ProviderAccount";
import {
  SecretReference,
  SecretReferencePurpose,
  SecretReferenceStatus,
} from "@beep/installer-domain/aggregates/SecretReference";
import {
  P1aDryRunSnapshot,
  P1LiveProofSnapshot,
  StackInstallerPlatform,
} from "@beep/installer-domain/aggregates/StackManifest";
import { TaggedErrorClass } from "@beep/schema";
import { OnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference";
import * as S from "effect/Schema";

const $I = $InstallerUseCasesId.create("public");

/**
 * Dry-run verb owned by the installer slice.
 *
 * @example
 * ```ts
 * import { InstallerDryRunVerb } from "@beep/installer-use-cases/public"
 *
 * console.log(InstallerDryRunVerb)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export class InstallerDryRunVerb extends S.Class<InstallerDryRunVerb>($I`InstallerDryRunVerb`)(
  {
    dryRunOnly: S.Boolean,
    id: S.NonEmptyString,
    label: S.NonEmptyString,
    requiresApproval: S.Boolean,
    summary: S.NonEmptyString,
  },
  $I.annote("InstallerDryRunVerb", {
    title: "Installer dry-run verb",
    description: "Dry-run verb contract owned by an installer concept.",
  })
) {}

/**
 * Dry-run dependency preview plan.
 *
 * @example
 * ```ts
 * import { HostDependencyPlan } from "@beep/installer-use-cases/public"
 *
 * console.log(HostDependencyPlan)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export class HostDependencyPlan extends S.Class<HostDependencyPlan>($I`HostDependencyPlan`)(
  {
    dependencies: S.Array(HostDependency),
    notes: S.Array(S.NonEmptyString),
    verbs: S.Array(InstallerDryRunVerb),
  },
  $I.annote("HostDependencyPlan", {
    title: "Host dependency plan",
    description: "Deterministic preview of host dependencies; it never runs installers.",
  })
) {}

/**
 * Live host dependency validation result.
 *
 * @example
 * ```ts
 * import { HostDependencyValidationResult } from "@beep/installer-use-cases/public"
 *
 * console.log(HostDependencyValidationResult)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export class HostDependencyValidationResult extends S.Class<HostDependencyValidationResult>(
  $I`HostDependencyValidationResult`
)(
  {
    dependency: HostDependency,
    message: S.NonEmptyString,
  },
  $I.annote("HostDependencyValidationResult", {
    title: "Host dependency validation result",
    description: "Sanitized live command-existence and version probe result.",
  })
) {}

/**
 * Dry-run provider preview plan.
 *
 * @example
 * ```ts
 * import { ProviderAccountPlan } from "@beep/installer-use-cases/public"
 *
 * console.log(ProviderAccountPlan)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export class ProviderAccountPlan extends S.Class<ProviderAccountPlan>($I`ProviderAccountPlan`)(
  {
    accounts: S.Array(ProviderAccount),
    notes: S.Array(S.NonEmptyString),
    verbs: S.Array(InstallerDryRunVerb),
  },
  $I.annote("ProviderAccountPlan", {
    title: "Provider account plan",
    description: "Deterministic preview of provider configuration without logging in or mutating state.",
  })
) {}

/**
 * Live provider authentication validation result.
 *
 * @example
 * ```ts
 * import { ProviderAuthValidationResult } from "@beep/installer-use-cases/public"
 *
 * console.log(ProviderAuthValidationResult)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export class ProviderAuthValidationResult extends S.Class<ProviderAuthValidationResult>(
  $I`ProviderAuthValidationResult`
)(
  {
    authMode: ProviderAuthMode,
    command: S.NonEmptyString,
    message: S.NonEmptyString,
    provider: ProviderKind,
    status: ProviderAccountStatus,
  },
  $I.annote("ProviderAuthValidationResult", {
    title: "Provider auth validation result",
    description: "Sanitized Claude or Codex local-session status for P1 Manual Mode.",
  })
) {}

/**
 * Dry-run secret-reference preview plan.
 *
 * @example
 * ```ts
 * import { SecretReferencePlan } from "@beep/installer-use-cases/public"
 *
 * console.log(SecretReferencePlan)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export class SecretReferencePlan extends S.Class<SecretReferencePlan>($I`SecretReferencePlan`)(
  {
    notes: S.Array(S.NonEmptyString),
    references: S.Array(SecretReference),
    verbs: S.Array(InstallerDryRunVerb),
  },
  $I.annote("SecretReferencePlan", {
    title: "Secret reference plan",
    description: "Deterministic preview of required credential references without resolving secrets.",
  })
) {}

/**
 * Live 1Password reference validation request.
 *
 * @example
 * ```ts
 * import { SecretReferenceValidationRequest } from "@beep/installer-use-cases/public"
 *
 * console.log(SecretReferenceValidationRequest)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export class SecretReferenceValidationRequest extends S.Class<SecretReferenceValidationRequest>(
  $I`SecretReferenceValidationRequest`
)(
  {
    id: S.NonEmptyString,
    purpose: SecretReferencePurpose,
    reference: OnePasswordReference,
    usedBy: S.NonEmptyString,
  },
  $I.annote("SecretReferenceValidationRequest", {
    title: "Secret reference validation request",
    description: "Live Manual Mode request to validate a 1Password reference without exposing its value.",
  })
) {}

/**
 * Live 1Password reference validation result.
 *
 * @example
 * ```ts
 * import { SecretReferenceValidationResult } from "@beep/installer-use-cases/public"
 *
 * console.log(SecretReferenceValidationResult)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export class SecretReferenceValidationResult extends S.Class<SecretReferenceValidationResult>(
  $I`SecretReferenceValidationResult`
)(
  {
    byteLength: S.optionalKey(S.Number),
    message: S.NonEmptyString,
    purpose: SecretReferencePurpose,
    reference: OnePasswordReference,
    status: SecretReferenceStatus,
    usedBy: S.NonEmptyString,
  },
  $I.annote("SecretReferenceValidationResult", {
    title: "Secret reference validation result",
    description: "Sanitized live validation result for a 1Password reference.",
  })
) {}

/**
 * Typed failure for an approved live secret read.
 *
 * @example
 * ```ts
 * import { SecretReferenceReadError } from "@beep/installer-use-cases/public"
 *
 * console.log(SecretReferenceReadError)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class SecretReferenceReadError extends TaggedErrorClass<SecretReferenceReadError>($I`SecretReferenceReadError`)(
  "SecretReferenceReadError",
  {
    message: S.NonEmptyString,
    reference: OnePasswordReference,
  },
  $I.annote("SecretReferenceReadError", {
    description: "Live secret read failed; the plaintext value is never included.",
  })
) {}

/**
 * Dry-run Discord channel preview plan.
 *
 * @example
 * ```ts
 * import { DiscordChannelPlan } from "@beep/installer-use-cases/public"
 *
 * console.log(DiscordChannelPlan)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export class DiscordChannelPlan extends S.Class<DiscordChannelPlan>($I`DiscordChannelPlan`)(
  {
    channels: S.Array(DiscordChannel),
    notes: S.Array(S.NonEmptyString),
    verbs: S.Array(InstallerDryRunVerb),
  },
  $I.annote("DiscordChannelPlan", {
    title: "Discord channel plan",
    description: "Deterministic preview of Discord routing without sending messages or mutating a guild.",
  })
) {}

/**
 * Live Discord validation request.
 *
 * @example
 * ```ts
 * import { DiscordLiveValidationRequest } from "@beep/installer-use-cases/public"
 *
 * console.log(DiscordLiveValidationRequest)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export class DiscordLiveValidationRequest extends S.Class<DiscordLiveValidationRequest>(
  $I`DiscordLiveValidationRequest`
)(
  {
    channel: DiscordChannel,
    testMessageContent: S.NonEmptyString,
  },
  $I.annote("DiscordLiveValidationRequest", {
    title: "Discord live validation request",
    description: "Manual Mode Discord channel validation plus deterministic test-message request.",
  })
) {}

/**
 * Live Discord validation result.
 *
 * @example
 * ```ts
 * import { DiscordLiveValidationResult } from "@beep/installer-use-cases/public"
 *
 * console.log(DiscordLiveValidationResult)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export class DiscordLiveValidationResult extends S.Class<DiscordLiveValidationResult>($I`DiscordLiveValidationResult`)(
  {
    channel: DiscordChannel,
    message: S.NonEmptyString,
    messageId: S.optionalKey(S.String),
    status: DiscordChannelStatus,
  },
  $I.annote("DiscordLiveValidationResult", {
    title: "Discord live validation result",
    description: "Sanitized Discord liveness and test-message proof metadata.",
  })
) {}

/**
 * Workspace dry-run plan.
 *
 * @example
 * ```ts
 * import { WorkspaceDryRunPlan } from "@beep/installer-use-cases/public"
 *
 * console.log(WorkspaceDryRunPlan)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export class WorkspaceDryRunPlan extends S.Class<WorkspaceDryRunPlan>($I`WorkspaceDryRunPlan`)(
  {
    notes: S.Array(S.NonEmptyString),
    snapshot: P1aDryRunSnapshot,
    verbs: S.Array(InstallerDryRunVerb),
  },
  $I.annote("WorkspaceDryRunPlan", {
    title: "Workspace dry-run plan",
    description: "Deterministic stack manifest snapshot plus installer-owned dry-run verbs.",
  })
) {}

/**
 * P1 Manual Mode proof request.
 *
 * @example
 * ```ts
 * import { P1ManualProofRequest } from "@beep/installer-use-cases/public"
 *
 * console.log(P1ManualProofRequest)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export class P1ManualProofRequest extends S.Class<P1ManualProofRequest>($I`P1ManualProofRequest`)(
  {
    discordBotTokenReference: OnePasswordReference,
    discordChannelDisplayName: S.NonEmptyString,
    discordChannelId: S.NonEmptyString,
    discordGuildId: S.NonEmptyString,
    operatorLabel: S.NonEmptyString,
    targetPlatform: StackInstallerPlatform,
    testMessageContent: S.NonEmptyString,
  },
  $I.annote("P1ManualProofRequest", {
    title: "P1 Manual Mode proof request",
    description: "User-entered Manual Mode inputs for live P1 validation.",
  })
) {}

/**
 * P1 Manual Mode proof result.
 *
 * @example
 * ```ts
 * import { P1ManualProofResult } from "@beep/installer-use-cases/public"
 *
 * console.log(P1ManualProofResult)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export class P1ManualProofResult extends S.Class<P1ManualProofResult>($I`P1ManualProofResult`)(
  {
    snapshot: P1LiveProofSnapshot,
  },
  $I.annote("P1ManualProofResult", {
    title: "P1 Manual Mode proof result",
    description: "Sanitized output returned to the app after live Manual Mode validation.",
  })
) {}

/**
 * Static P1A verb contracts owned by the host-dependency concept.
 *
 * @example
 * ```ts
 * import { P1A_HOST_DEPENDENCY_VERB_INPUTS } from "@beep/installer-use-cases/public"
 *
 * console.log(P1A_HOST_DEPENDENCY_VERB_INPUTS)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export const P1A_HOST_DEPENDENCY_VERB_INPUTS = [
  {
    dryRunOnly: true,
    id: "installer.dependencies.detect-host",
    label: "Detect Host Dependencies",
    requiresApproval: false,
    summary: "Check whether required tools appear to exist without installing or upgrading anything.",
  },
  {
    dryRunOnly: true,
    id: "installer.dependencies.preview-install-plan",
    label: "Preview Dependency Plan",
    requiresApproval: true,
    summary: "Render the package/app plan a human would approve before live installation is enabled.",
  },
] as const;

/**
 * Static P1A verb contracts owned by the secret-reference concept.
 *
 * @example
 * ```ts
 * import { P1A_SECRET_REFERENCE_VERB_INPUTS } from "@beep/installer-use-cases/public"
 *
 * console.log(P1A_SECRET_REFERENCE_VERB_INPUTS)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export const P1A_SECRET_REFERENCE_VERB_INPUTS = [
  {
    dryRunOnly: true,
    id: "installer.security.validate-one-password-reference",
    label: "Validate 1Password References",
    requiresApproval: false,
    summary: "Validate reference syntax and purpose while refusing plaintext secrets.",
  },
  {
    dryRunOnly: true,
    id: "installer.security.preview-secret-usage",
    label: "Preview Secret Usage",
    requiresApproval: true,
    summary: "Show which workflow will consume each 1Password reference before live execution exists.",
  },
] as const;

/**
 * Static P1A verb contracts owned by the provider-account concept.
 *
 * @example
 * ```ts
 * import { P1A_PROVIDER_ACCOUNT_VERB_INPUTS } from "@beep/installer-use-cases/public"
 *
 * console.log(P1A_PROVIDER_ACCOUNT_VERB_INPUTS)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export const P1A_PROVIDER_ACCOUNT_VERB_INPUTS = [
  {
    dryRunOnly: true,
    id: "installer.providers.validate-claude",
    label: "Validate Claude Provider",
    requiresApproval: false,
    summary: "Check Claude provider intent and credential-reference shape without making a network call.",
  },
  {
    dryRunOnly: true,
    id: "installer.providers.validate-codex",
    label: "Validate Codex Provider",
    requiresApproval: false,
    summary: "Check Codex provider intent and credential-reference shape without making a network call.",
  },
] as const;

/**
 * Static P1A verb contracts owned by the Discord-channel concept.
 *
 * @example
 * ```ts
 * import { P1A_DISCORD_CHANNEL_VERB_INPUTS } from "@beep/installer-use-cases/public"
 *
 * console.log(P1A_DISCORD_CHANNEL_VERB_INPUTS)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export const P1A_DISCORD_CHANNEL_VERB_INPUTS = [
  {
    dryRunOnly: true,
    id: "installer.channels.validate-discord-target",
    label: "Validate Discord Target",
    requiresApproval: false,
    summary: "Check guild/channel identifiers and bot-token reference shape without contacting Discord.",
  },
  {
    dryRunOnly: true,
    id: "installer.channels.preview-message-route",
    label: "Preview Message Route",
    requiresApproval: true,
    summary: "Render the Discord route a human would approve before live messaging exists.",
  },
] as const;

/**
 * Static P1A verb contracts owned by the stack-manifest concept.
 *
 * @example
 * ```ts
 * import { P1A_WORKSPACE_VERB_INPUTS } from "@beep/installer-use-cases/public"
 *
 * console.log(P1A_WORKSPACE_VERB_INPUTS)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export const P1A_WORKSPACE_VERB_INPUTS = [
  {
    dryRunOnly: true,
    id: "installer.workspace.compose-stack-manifest",
    label: "Compose Stack Manifest",
    requiresApproval: false,
    summary: "Assemble the dry-run manifest from installer-owned contracts.",
  },
  {
    dryRunOnly: true,
    id: "installer.workspace.record-validation-event",
    label: "Record Validation Event",
    requiresApproval: false,
    summary: "Record deterministic evidence events for the P1A proof surface.",
  },
] as const;

/**
 * Static P1A dry-run registry inputs composed inside the installer slice.
 *
 * @example
 * ```ts
 * import { P1A_INSTALLER_DRY_RUN_REGISTRY_INPUTS } from "@beep/installer-use-cases/public"
 *
 * console.log(P1A_INSTALLER_DRY_RUN_REGISTRY_INPUTS)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export const P1A_INSTALLER_DRY_RUN_REGISTRY_INPUTS = [
  ...P1A_HOST_DEPENDENCY_VERB_INPUTS,
  ...P1A_SECRET_REFERENCE_VERB_INPUTS,
  ...P1A_PROVIDER_ACCOUNT_VERB_INPUTS,
  ...P1A_DISCORD_CHANNEL_VERB_INPUTS,
  ...P1A_WORKSPACE_VERB_INPUTS,
] as const;

/**
 * Deterministic P1A manifest snapshot input.
 *
 * @example
 * ```ts
 * import { P1A_DRY_RUN_SNAPSHOT_INPUT } from "@beep/installer-use-cases/public"
 *
 * console.log(P1A_DRY_RUN_SNAPSHOT_INPUT)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export const P1A_DRY_RUN_SNAPSHOT_INPUT = {
  generatedBy: "@beep/installer-use-cases",
  manifest: {
    capabilities: [
      {
        id: "provider-claude",
        label: "Claude Provider",
        summary: "Claude account intent is represented without live authentication.",
      },
      {
        id: "provider-codex",
        label: "Codex Provider",
        summary: "Codex account intent is represented without live authentication.",
      },
      {
        id: "channel-discord",
        label: "Discord Channel",
        summary: "Discord is the only v1 notification channel.",
      },
    ],
    credentialReferences: ["op://Private/Discord Bot/token", "op://Private/Claude/token", "op://Private/Codex/token"],
    discordChannel: {
      channelId: "012345678901234567",
      displayName: "ai-stack-installer",
      guildId: "987654321098765432",
    },
    dryRunOnly: true,
    manifestId: "stack-installer-p1a-dry-run",
    providers: [
      {
        authMode: "one-password-reference",
        provider: "claude",
        status: "unchecked",
      },
      {
        authMode: "one-password-reference",
        provider: "codex",
        status: "unchecked",
      },
    ],
    targetPlatform: "macos",
    version: "p1a.0",
  },
  validationEvents: [
    {
      id: "dependency-registry-static",
      message: "Dependency verbs are installer-owned and dry-run-only.",
      status: "passed",
      subject: "installer:host-dependencies",
      tier: "config",
    },
    {
      id: "secret-reference-shape",
      message: "Credential inputs are 1Password references, not plaintext values.",
      status: "passed",
      subject: "installer:secret-references",
      tier: "config",
    },
    {
      id: "provider-coverage",
      message: "Claude and Codex provider fixtures are both represented.",
      status: "passed",
      subject: "installer:providers",
      tier: "existence",
    },
    {
      id: "discord-v1-channel",
      message: "Discord is represented as the only v1 channel.",
      status: "passed",
      subject: "installer:discord-channel",
      tier: "existence",
    },
  ],
} as const;
