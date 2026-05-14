/**
 * installer-security public use-case exports.
 *
 * @packageDocumentation
 * @category use-cases
 * @since 0.0.0
 */

import { $InstallerSecurityUseCasesId } from "@beep/identity/packages";
import {
  SecretReference,
  SecretReferencePurpose,
  SecretReferenceStatus,
} from "@beep/installer-security-domain/aggregates/SecretReference";
import { TaggedErrorClass } from "@beep/schema";
import { OnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference";
import * as S from "effect/Schema";

const $I = $InstallerSecurityUseCasesId.create("public");

/**
 * Dry-run verb owned by the installer-security slice.
 *
 * @category use-cases
 * @since 0.0.0
 */
export class SecretReferenceVerb extends S.Class<SecretReferenceVerb>($I`SecretReferenceVerb`)(
  {
    id: S.NonEmptyString,
    label: S.NonEmptyString,
    summary: S.NonEmptyString,
    requiresApproval: S.Boolean,
    dryRunOnly: S.Boolean,
  },
  $I.annote("SecretReferenceVerb", {
    title: "Secret reference verb",
    description: "Slice-owned dry-run verb contract for credential-reference validation.",
  })
) {}

/**
 * Dry-run secret-reference preview plan.
 *
 * @category use-cases
 * @since 0.0.0
 */
export class SecretReferencePlan extends S.Class<SecretReferencePlan>($I`SecretReferencePlan`)(
  {
    references: S.Array(SecretReference),
    verbs: S.Array(SecretReferenceVerb),
    notes: S.Array(S.NonEmptyString),
  },
  $I.annote("SecretReferencePlan", {
    title: "Secret reference plan",
    description: "Deterministic preview of required credential references without resolving secrets.",
  })
) {}

/**
 * Live 1Password reference validation request.
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
 * Static P1A verb contracts owned by the security slice.
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
