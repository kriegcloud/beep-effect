/**
 * Dataset canonicalization service contract.
 *
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { LiteralKit, Sha256Hex, TaggedErrorClass } from "@beep/schema";
import { Context, type Effect } from "effect";
import * as S from "effect/Schema";
import { Dataset } from "../rdf.ts";
import { makeSemanticSchemaMetadata } from "../semantic-schema-metadata.ts";

const $I = $SemanticWebId.create("services/canonicalization");

const serviceContractMetadata = (canonicalName: string, overview: string) =>
  makeSemanticSchemaMetadata({
    kind: "serviceContract",
    canonicalName,
    overview,
    status: "stable",
    specifications: [{ name: "RDF Dataset Canonicalization 1.0", disposition: "normative" }],
    equivalenceBasis: "Canonical text and fingerprint equality.",
    representations: [{ kind: "RDF/JS" }, { kind: "TriG" }],
    canonicalizationRequired: true,
    implementationNotes: [
      "rdfc-1.0 is the graph-safe canonicalization algorithm for semantic identity and fingerprinting.",
      "lexical-sort-v1 remains a deterministic fallback for non-semantic ordering workflows only.",
    ],
  });

/**
 * Canonicalization algorithm name.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const CanonicalizationAlgorithm = LiteralKit(["rdfc-1.0", "lexical-sort-v1"] as const).annotate(
  $I.annote("CanonicalizationAlgorithm", {
    description: "Canonicalization algorithm name with an explicit graph-safe default and lexical fallback.",
  })
);

/**
 * Typed canonicalization error.
 *
 * @since 0.0.0
 * @category Errors
 */
export class CanonicalizationError extends TaggedErrorClass<CanonicalizationError>($I`CanonicalizationError`)(
  "CanonicalizationError",
  {
    reason: LiteralKit([
      "workLimitExceeded",
      "unsupportedAlgorithm",
      "canonicalizationFailure",
      "fingerprintFailure",
    ] as const),
    message: S.String,
  },
  $I.annote("CanonicalizationError", {
    description: "Typed canonicalization error.",
    semanticSchemaMetadata: serviceContractMetadata("CanonicalizationError", "Typed canonicalization error."),
  })
) {}

/**
 * Dataset canonicalization request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CanonicalizeDatasetRequest extends S.Class<CanonicalizeDatasetRequest>($I`CanonicalizeDatasetRequest`)(
  {
    dataset: Dataset,
    algorithm: CanonicalizationAlgorithm,
    workLimit: S.OptionFromOptionalKey(S.Number),
  },
  $I.annote("CanonicalizeDatasetRequest", {
    description: "Dataset canonicalization request.",
    semanticSchemaMetadata: serviceContractMetadata(
      "CanonicalizeDatasetRequest",
      "Request to canonicalize an RDF dataset."
    ),
  })
) {}

/**
 * Dataset fingerprint request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class FingerprintDatasetRequest extends S.Class<FingerprintDatasetRequest>($I`FingerprintDatasetRequest`)(
  {
    dataset: Dataset,
    algorithm: CanonicalizationAlgorithm,
    workLimit: S.OptionFromOptionalKey(S.Number),
  },
  $I.annote("FingerprintDatasetRequest", {
    description: "Dataset fingerprint request.",
    semanticSchemaMetadata: serviceContractMetadata(
      "FingerprintDatasetRequest",
      "Request to fingerprint an RDF dataset."
    ),
  })
) {}

/**
 * Canonical dataset output.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CanonicalDatasetResult extends S.Class<CanonicalDatasetResult>($I`CanonicalDatasetResult`)(
  {
    canonicalText: S.String,
    dataset: Dataset,
  },
  $I.annote("CanonicalDatasetResult", {
    description: "Canonical dataset output.",
    semanticSchemaMetadata: serviceContractMetadata("CanonicalDatasetResult", "Canonical dataset output."),
  })
) {}

/**
 * Dataset fingerprint output.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class DatasetFingerprint extends S.Class<DatasetFingerprint>($I`DatasetFingerprint`)(
  {
    canonicalText: S.String,
    fingerprint: Sha256Hex,
  },
  $I.annote("DatasetFingerprint", {
    description: "Dataset fingerprint output.",
    semanticSchemaMetadata: serviceContractMetadata("DatasetFingerprint", "Dataset fingerprint output."),
  })
) {}

/**
 * Canonicalization service contract shape.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface CanonicalizationServiceShape {
  readonly canonicalize: (
    request: CanonicalizeDatasetRequest
  ) => Effect.Effect<CanonicalDatasetResult, CanonicalizationError>;
  readonly fingerprint: (
    request: FingerprintDatasetRequest
  ) => Effect.Effect<DatasetFingerprint, CanonicalizationError>;
}

/**
 * Canonicalization service tag.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class CanonicalizationService extends Context.Service<CanonicalizationService, CanonicalizationServiceShape>()(
  $I`CanonicalizationService`
) {}
