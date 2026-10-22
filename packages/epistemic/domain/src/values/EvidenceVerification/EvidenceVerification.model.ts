/**
 * Evidence-verification manifestation identity.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import {
  makeEvidenceVerification,
  makeEvidenceVerificationManifestationKey,
} from "@beep/epistemics/EvidenceVerification";
import { $EpistemicDomainId } from "@beep/identity/packages";
import * as EpistemicIdentity from "@beep/shared-domain/identity/Epistemic";
import * as S from "effect/Schema";
import type * as Result from "effect/Result";

const schemas = makeEvidenceVerification({
  $I: $EpistemicDomainId.create("values/EvidenceVerification/EvidenceVerification.model"),
  ids: { evidence: EpistemicIdentity.EvidenceId },
});

/**
 * Digest naming one exact evidence-to-source verification manifestation.
 *
 * **Details**
 *
 * The key is unique only within an organization. Persistence therefore applies
 * uniqueness to `(org_id, manifestation_key)` rather than to this digest alone.
 *
 * **Example** (Validate 64-character key)
 *
 * ```ts
 * import { EvidenceVerificationManifestationKey } from "@beep/epistemic-domain/values/EvidenceVerification"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(EvidenceVerificationManifestationKey)("a".repeat(64))) // true
 * ```
 *
 * @category identifiers
 * @since 0.0.0
 */
export const EvidenceVerificationManifestationKey = schemas.EvidenceVerificationManifestationKey;

/**
 * Runtime type for {@link EvidenceVerificationManifestationKey}.
 *
 * **Example** (Typed empty keys array)
 *
 * ```ts
 * import type { EvidenceVerificationManifestationKey } from "@beep/epistemic-domain/values/EvidenceVerification"
 *
 * const keys: ReadonlyArray<EvidenceVerificationManifestationKey> = []
 * console.log(keys.length)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export type EvidenceVerificationManifestationKey = typeof EvidenceVerificationManifestationKey.Type;

/**
 * Exact immutable payload sealed by an evidence-verification manifestation key.
 *
 * **Example** (Check evidenceId field exists)
 *
 * ```ts
 * import { EvidenceVerificationManifestation } from "@beep/epistemic-domain/values/EvidenceVerification"
 *
 * console.log(EvidenceVerificationManifestation.fields.evidenceId !== undefined) // true
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export class EvidenceVerificationManifestation extends S.Opaque<
  EvidenceVerificationManifestation,
  { readonly brand: unique symbol }
>()(schemas.EvidenceVerificationManifestationSchema) {}

const digest = makeEvidenceVerificationManifestationKey({
  EvidenceVerificationManifestation,
  EvidenceVerificationManifestationKey,
});

/**
 * Compute the stable key for one exact verification manifestation.
 *
 * **Details**
 *
 * The versioned canonical wire encoding includes the evidence id, exact source
 * identity, and exact anchor. Repeating the same manifestation produces the
 * same key; changing any bound field produces a different key.
 *
 * **Example** (Key function type and fields)
 *
 * ```ts
 * import { EvidenceVerificationManifestation, evidenceVerificationManifestationKey } from "@beep/epistemic-domain/values/EvidenceVerification"
 *
 * console.log(typeof evidenceVerificationManifestationKey)
 * console.log(EvidenceVerificationManifestation.fields.verifiedAnchor !== undefined)
 * ```
 *
 * @category encoding
 * @since 0.0.0
 */
export const evidenceVerificationManifestationKey: (
  manifestation: EvidenceVerificationManifestation
) => Result.Result<EvidenceVerificationManifestationKey, S.SchemaError> = digest.evidenceVerificationManifestationKey;

/**
 * Check a persisted manifestation key against its exact immutable payload.
 *
 * **Example** (Validator function type check)
 *
 * ```ts
 * import { isEvidenceVerificationManifestationKey } from "@beep/epistemic-domain/values/EvidenceVerification"
 *
 * console.log(typeof isEvidenceVerificationManifestationKey)
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const isEvidenceVerificationManifestationKey: {
  (
    key: EvidenceVerificationManifestationKey
  ): (manifestation: EvidenceVerificationManifestation) => Result.Result<boolean, S.SchemaError>;
  (
    manifestation: EvidenceVerificationManifestation,
    key: EvidenceVerificationManifestationKey
  ): Result.Result<boolean, S.SchemaError>;
} = digest.isEvidenceVerificationManifestationKey;
