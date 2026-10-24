/**
 * Software-supply-chain artifacts as Effect schemas: a CycloneDX 1.6 SBOM, the
 * NTIA minimum-elements report, in-toto statements, SLSA provenance, the
 * Sigstore bundle value and the workload identity token contract.
 *
 * **Details**
 *
 * Every module is pure and reaches no `@sigstore/*` or `node:*` import. The
 * Sigstore DSSE signer that consumes `IdentityToken` and produces a
 * `SigstoreBundle` stays out of this package, so a consumer that emits an SBOM
 * never pulls Fulcio's transport into its bundle.
 *
 * **Example** (Read the SLSA predicate identifier from the entry point)
 *
 * ```ts
 * import { SLSA_PROVENANCE_V1 } from "@beep/sbom/SlsaProvenance";
 *
 * console.log(SLSA_PROVENANCE_V1) // https://slsa.dev/provenance/v1
 * ```
 *
 * @packageDocumentation
 * @since 0.0.0
 */

export { IdentityToken, IdentityTokenError, type IdentityTokenShape } from "./IdentityToken.ts";
export {
  CYCLONEDX_BOM_PREDICATE,
  IN_TOTO_STATEMENT_V1,
  InTotoStatement,
  InTotoStatementInput,
  InTotoSubject,
  InTotoSubjectInput,
  InvalidSha256DigestError,
  type PredicateType,
  Sha256Digest,
} from "./InTotoStatement.ts";
export { NtiaElement, NtiaElementId, NtiaReport } from "./NtiaReport.ts";
export { Sbom, SbomInput, SbomJsonOptions, SbomWriteError } from "./Sbom.ts";
export {
  Component,
  ComponentType,
  Contact,
  ExternalReference,
  ExternalReferenceType,
  SbomDocument,
  SbomMetadata,
  Supplier,
} from "./SbomDocument.ts";
export {
  ComponentInput,
  CopyrightYears,
  SbomMetadataOptions,
  SbomMetadataSource,
} from "./SbomMetadataSource.ts";
export { IN_TOTO_PAYLOAD_TYPE, SIGSTORE_BUNDLE_V0_3_MEDIA_TYPE, SigstoreBundle } from "./SigstoreBundle.ts";
export {
  GITHUB_BUILD_TYPE,
  GitHubWorkflowProvenance,
  SLSA_PROVENANCE_V1,
  SlsaBuildDefinition,
  SlsaProvenance,
  SlsaRunDetails,
} from "./SlsaProvenance.ts";
