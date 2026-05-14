/**
 * AI stack manifest aggregate model.
 *
 * @packageDocumentation
 * @category aggregates
 * @since 0.0.0
 */

import { $InstallerWorkspaceDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { OnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference";
import * as S from "effect/Schema";

const $I = $InstallerWorkspaceDomainId.create("aggregates/StackManifest/StackManifest.model");

/**
 * Host platforms tracked by v1 installer manifests.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const StackInstallerPlatform = LiteralKit(["macos", "windows", "linux"] as const).pipe(
  $I.annoteSchema("StackInstallerPlatform", {
    description: "Installer manifest target platform vocabulary.",
  })
);

/**
 * Runtime type for {@link StackInstallerPlatform}.
 *
 * @category aggregates
 * @since 0.0.0
 */
export type StackInstallerPlatform = typeof StackInstallerPlatform.Type;

/**
 * Provider names tracked by the stack manifest.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const StackInstallerProvider = LiteralKit(["claude", "codex"] as const).pipe(
  $I.annoteSchema("StackInstallerProvider", {
    description: "AI provider names represented in a stack installer manifest.",
  })
);

/**
 * Runtime type for {@link StackInstallerProvider}.
 *
 * @category aggregates
 * @since 0.0.0
 */
export type StackInstallerProvider = typeof StackInstallerProvider.Type;

/**
 * Validation tier for installer evidence events.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const ValidationTier = LiteralKit([
  "existence",
  "version",
  "config",
  "liveness",
  "user-confirmation",
] as const).pipe(
  $I.annoteSchema("ValidationTier", {
    description: "Proof tier vocabulary for installer validation events.",
  })
);

/**
 * Runtime type for {@link ValidationTier}.
 *
 * @category aggregates
 * @since 0.0.0
 */
export type ValidationTier = typeof ValidationTier.Type;

/**
 * Validation status for installer evidence events.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const ValidationStatus = LiteralKit(["passed", "failed", "indeterminate"] as const).pipe(
  $I.annoteSchema("ValidationStatus", {
    description: "Result vocabulary for installer validation events.",
  })
);

/**
 * Runtime type for {@link ValidationStatus}.
 *
 * @category aggregates
 * @since 0.0.0
 */
export type ValidationStatus = typeof ValidationStatus.Type;

/**
 * Manifest provider entry.
 *
 * @category aggregates
 * @since 0.0.0
 */
export class ManifestProvider extends S.Class<ManifestProvider>($I`ManifestProvider`)(
  {
    provider: StackInstallerProvider,
    authMode: S.NonEmptyString,
    status: S.NonEmptyString,
  },
  $I.annote("ManifestProvider", {
    title: "Manifest provider",
    description: "Provider capability included in an AI stack manifest.",
  })
) {}

/**
 * Manifest Discord channel target.
 *
 * @category aggregates
 * @since 0.0.0
 */
export class ManifestDiscordChannel extends S.Class<ManifestDiscordChannel>($I`ManifestDiscordChannel`)(
  {
    guildId: S.NonEmptyString,
    channelId: S.NonEmptyString,
    displayName: S.NonEmptyString,
  },
  $I.annote("ManifestDiscordChannel", {
    title: "Manifest Discord channel",
    description: "Discord guild/channel target included in an AI stack manifest.",
  })
) {}

/**
 * Manifest capability entry.
 *
 * @category aggregates
 * @since 0.0.0
 */
export class ManifestCapability extends S.Class<ManifestCapability>($I`ManifestCapability`)(
  {
    id: S.NonEmptyString,
    label: S.NonEmptyString,
    summary: S.NonEmptyString,
  },
  $I.annote("ManifestCapability", {
    title: "Manifest capability",
    description: "Installer capability declared in an AI stack manifest.",
  })
) {}

/**
 * AI stack manifest assembled by the workspace slice.
 *
 * @category aggregates
 * @since 0.0.0
 */
export class AIStackManifest extends S.Class<AIStackManifest>($I`AIStackManifest`)(
  {
    manifestId: S.NonEmptyString,
    version: S.NonEmptyString,
    targetPlatform: StackInstallerPlatform,
    providers: S.Array(ManifestProvider),
    discordChannel: ManifestDiscordChannel,
    credentialReferences: S.Array(OnePasswordReference),
    capabilities: S.Array(ManifestCapability),
    dryRunOnly: S.Boolean,
  },
  $I.annote("AIStackManifest", {
    title: "AI stack manifest",
    description: "Dry-run install manifest for Claude, Codex, and Discord routing.",
  })
) {}

/**
 * Validation event emitted while proving an installer manifest.
 *
 * @category aggregates
 * @since 0.0.0
 */
export class ValidationEvent extends S.Class<ValidationEvent>($I`ValidationEvent`)(
  {
    id: S.NonEmptyString,
    tier: ValidationTier,
    status: ValidationStatus,
    subject: S.NonEmptyString,
    message: S.NonEmptyString,
  },
  $I.annote("ValidationEvent", {
    title: "Validation event",
    description: "Deterministic proof event captured by the P1A dry-run spine.",
  })
) {}

/**
 * Deterministic P1A snapshot containing a manifest and validation feed.
 *
 * @category aggregates
 * @since 0.0.0
 */
export class P1aDryRunSnapshot extends S.Class<P1aDryRunSnapshot>($I`P1aDryRunSnapshot`)(
  {
    manifest: AIStackManifest,
    validationEvents: S.Array(ValidationEvent),
    generatedBy: S.NonEmptyString,
  },
  $I.annote("P1aDryRunSnapshot", {
    title: "P1A dry-run snapshot",
    description: "Deterministic package-level output consumed by the stack installer web shell.",
  })
) {}

/**
 * P1 live proof snapshot containing only sanitized validation evidence.
 *
 * @category aggregates
 * @since 0.0.0
 */
export class P1LiveProofSnapshot extends S.Class<P1LiveProofSnapshot>($I`P1LiveProofSnapshot`)(
  {
    generatedBy: S.NonEmptyString,
    manifest: AIStackManifest,
    validationEvents: S.Array(ValidationEvent),
  },
  $I.annote("P1LiveProofSnapshot", {
    title: "P1 live proof snapshot",
    description: "Sanitized Manual Mode proof output for the Discord vertical.",
  })
) {}
