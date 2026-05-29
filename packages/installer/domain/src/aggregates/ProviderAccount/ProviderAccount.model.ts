/**
 * Provider account aggregate model.
 *
 * @packageDocumentation
 * @category aggregates
 * @since 0.0.0
 */

import { $InstallerDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { OnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference";
import * as S from "effect/Schema";

const $I = $InstallerDomainId.create("aggregates/ProviderAccount/ProviderAccount.model");

/**
 * Provider supported by the v1 installer dry-run.
 *
 * @example
 * ```ts
 * import { ProviderKind } from "@beep/installer-domain/aggregates/ProviderAccount"
 *
 * console.log(ProviderKind)
 * ```
 *
 * @category aggregates
 * @since 0.0.0
 */
export const ProviderKind = LiteralKit(["claude", "codex"]).pipe(
  $I.annoteSchema("ProviderKind", {
    description: "AI provider account families included in the P1A dry-run spine.",
  })
);

/**
 * Runtime type for {@link ProviderKind}.
 *
 * @category aggregates
 * @since 0.0.0
 */
export type ProviderKind = typeof ProviderKind.Type;

/**
 * Authentication shape for a provider account.
 *
 * @example
 * ```ts
 * import { ProviderAuthMode } from "@beep/installer-domain/aggregates/ProviderAccount"
 *
 * console.log(ProviderAuthMode)
 * ```
 *
 * @category aggregates
 * @since 0.0.0
 */
export const ProviderAuthMode = LiteralKit(["one-password-reference", "existing-local-session"]).pipe(
  $I.annoteSchema("ProviderAuthMode", {
    description: "Provider authentication sources the dry-run can describe without resolving secrets.",
  })
);

/**
 * Runtime type for {@link ProviderAuthMode}.
 *
 * @category aggregates
 * @since 0.0.0
 */
export type ProviderAuthMode = typeof ProviderAuthMode.Type;

/**
 * Dry-run status for a provider account.
 *
 * @example
 * ```ts
 * import { ProviderAccountStatus } from "@beep/installer-domain/aggregates/ProviderAccount"
 *
 * console.log(ProviderAccountStatus)
 * ```
 *
 * @category aggregates
 * @since 0.0.0
 */
export const ProviderAccountStatus = LiteralKit(["configured", "missing", "unchecked"]).pipe(
  $I.annoteSchema("ProviderAccountStatus", {
    description: "Dry-run validation status for a provider account.",
  })
);

/**
 * Runtime type for {@link ProviderAccountStatus}.
 *
 * @category aggregates
 * @since 0.0.0
 */
export type ProviderAccountStatus = typeof ProviderAccountStatus.Type;

/**
 * Provider account requested by the installer.
 *
 * @example
 * ```ts
 * import { ProviderAccount } from "@beep/installer-domain/aggregates/ProviderAccount"
 *
 * console.log(ProviderAccount)
 * ```
 *
 * @category aggregates
 * @since 0.0.0
 */
export class ProviderAccount extends S.Class<ProviderAccount>($I`ProviderAccount`)(
  {
    id: S.NonEmptyString,
    provider: ProviderKind,
    displayName: S.NonEmptyString,
    authMode: ProviderAuthMode,
    credentialReference: S.OptionFromOptionalKey(OnePasswordReference),
    status: ProviderAccountStatus,
    workspaceHint: S.NonEmptyString,
  },
  $I.annote("ProviderAccount", {
    title: "Provider account",
    description: "A Claude or Codex provider account represented without plaintext credentials.",
  })
) {}
