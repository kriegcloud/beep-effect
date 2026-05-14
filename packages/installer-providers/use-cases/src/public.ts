/**
 * installer-providers public use-case exports.
 *
 * @packageDocumentation
 * @category use-cases
 * @since 0.0.0
 */

import { $InstallerProvidersUseCasesId } from "@beep/identity/packages";
import {
  ProviderAccount,
  ProviderAccountStatus,
  ProviderAuthMode,
  ProviderKind,
} from "@beep/installer-providers-domain/aggregates/ProviderAccount";
import * as S from "effect/Schema";

const $I = $InstallerProvidersUseCasesId.create("public");

/**
 * Dry-run verb owned by the installer-providers slice.
 *
 * @category use-cases
 * @since 0.0.0
 */
export class ProviderAccountVerb extends S.Class<ProviderAccountVerb>($I`ProviderAccountVerb`)(
  {
    id: S.NonEmptyString,
    label: S.NonEmptyString,
    summary: S.NonEmptyString,
    requiresApproval: S.Boolean,
    dryRunOnly: S.Boolean,
  },
  $I.annote("ProviderAccountVerb", {
    title: "Provider account verb",
    description: "Slice-owned dry-run verb contract for Claude and Codex provider validation.",
  })
) {}

/**
 * Dry-run provider preview plan.
 *
 * @category use-cases
 * @since 0.0.0
 */
export class ProviderAccountPlan extends S.Class<ProviderAccountPlan>($I`ProviderAccountPlan`)(
  {
    accounts: S.Array(ProviderAccount),
    verbs: S.Array(ProviderAccountVerb),
    notes: S.Array(S.NonEmptyString),
  },
  $I.annote("ProviderAccountPlan", {
    title: "Provider account plan",
    description: "Deterministic preview of provider configuration without logging in or mutating state.",
  })
) {}

/**
 * Live provider authentication validation result.
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
 * Static P1A verb contracts owned by the provider slice.
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
