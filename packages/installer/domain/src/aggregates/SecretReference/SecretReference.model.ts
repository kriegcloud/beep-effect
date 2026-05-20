/**
 * Secret reference aggregate model.
 *
 * @packageDocumentation
 * @category aggregates
 * @since 0.0.0
 */

import { $InstallerDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { OnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference";
import * as S from "effect/Schema";

const $I = $InstallerDomainId.create("aggregates/SecretReference/SecretReference.model");

/**
 * Installer secret reference purpose.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const SecretReferencePurpose = LiteralKit([
  "discord-bot-token",
  "claude-auth",
  "codex-auth",
  "provider-api-key",
] as const).pipe(
  $I.annoteSchema("SecretReferencePurpose", {
    description: "Allowed purposes for credential references accepted by installer dry-run verbs.",
  })
);

/**
 * Runtime type for {@link SecretReferencePurpose}.
 *
 * @category aggregates
 * @since 0.0.0
 */
export type SecretReferencePurpose = typeof SecretReferencePurpose.Type;

/**
 * Dry-run status for a secret reference.
 *
 * @category aggregates
 * @since 0.0.0
 */
export const SecretReferenceStatus = LiteralKit([
  "reference-valid",
  "reference-missing",
  "reference-unchecked",
] as const).pipe(
  $I.annoteSchema("SecretReferenceStatus", {
    description: "Dry-run validation status for a 1Password reference.",
  })
);

/**
 * Runtime type for {@link SecretReferenceStatus}.
 *
 * @category aggregates
 * @since 0.0.0
 */
export type SecretReferenceStatus = typeof SecretReferenceStatus.Type;

/**
 * Secret reference consumed by stack installer workflows.
 *
 * @category aggregates
 * @since 0.0.0
 */
export class SecretReference extends S.Class<SecretReference>($I`SecretReference`)(
  {
    id: S.NonEmptyString,
    purpose: SecretReferencePurpose,
    reference: OnePasswordReference,
    status: SecretReferenceStatus,
    usedBy: S.NonEmptyString,
    notes: S.Array(S.NonEmptyString),
  },
  $I.annote("SecretReference", {
    title: "Secret reference",
    description: "A validated 1Password reference; plaintext secret material is intentionally not representable.",
  })
) {}
