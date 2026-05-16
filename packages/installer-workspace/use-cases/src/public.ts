/**
 * installer-workspace public use-case exports.
 *
 * @packageDocumentation
 * @category use-cases
 * @since 0.0.0
 */

import { $InstallerWorkspaceUseCasesId } from "@beep/identity/packages";
import {
  P1aDryRunSnapshot,
  P1LiveProofSnapshot,
  StackInstallerPlatform,
} from "@beep/installer-workspace-domain/aggregates/StackManifest";
import { OnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference";
import * as S from "effect/Schema";

const $I = $InstallerWorkspaceUseCasesId.create("public");

/**
 * Dry-run verb owned by the installer-workspace slice.
 *
 * @category use-cases
 * @since 0.0.0
 */
export class WorkspaceDryRunVerb extends S.Class<WorkspaceDryRunVerb>($I`WorkspaceDryRunVerb`)(
  {
    id: S.NonEmptyString,
    label: S.NonEmptyString,
    summary: S.NonEmptyString,
    requiresApproval: S.Boolean,
    dryRunOnly: S.Boolean,
  },
  $I.annote("WorkspaceDryRunVerb", {
    title: "Workspace dry-run verb",
    description: "Slice-owned dry-run verb contract for stack manifest composition.",
  })
) {}

/**
 * Workspace dry-run plan.
 *
 * @category use-cases
 * @since 0.0.0
 */
export class WorkspaceDryRunPlan extends S.Class<WorkspaceDryRunPlan>($I`WorkspaceDryRunPlan`)(
  {
    snapshot: P1aDryRunSnapshot,
    verbs: S.Array(WorkspaceDryRunVerb),
    notes: S.Array(S.NonEmptyString),
  },
  $I.annote("WorkspaceDryRunPlan", {
    title: "Workspace dry-run plan",
    description: "Deterministic stack manifest snapshot plus workspace-owned dry-run verbs.",
  })
) {}

/**
 * App-local P1 Manual Mode proof request.
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
 * Static P1A verb contracts owned by the workspace slice.
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
    summary: "Assemble the dry-run manifest from validated package-owned contracts.",
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
 * Deterministic P1A manifest snapshot input.
 *
 * @category use-cases
 * @since 0.0.0
 */
export const P1A_DRY_RUN_SNAPSHOT_INPUT = {
  generatedBy: "@beep/installer-workspace-use-cases",
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
      message: "Dependency verbs are slice-owned and dry-run-only.",
      status: "passed",
      subject: "installer-dependencies",
      tier: "config",
    },
    {
      id: "secret-reference-shape",
      message: "Credential inputs are 1Password references, not plaintext values.",
      status: "passed",
      subject: "installer-security",
      tier: "config",
    },
    {
      id: "provider-coverage",
      message: "Claude and Codex provider fixtures are both represented.",
      status: "passed",
      subject: "installer-providers",
      tier: "existence",
    },
    {
      id: "discord-v1-channel",
      message: "Discord is represented as the only v1 channel.",
      status: "passed",
      subject: "installer-channels",
      tier: "existence",
    },
  ],
} as const;
