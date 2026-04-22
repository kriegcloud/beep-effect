/**
 * Dataset canonicalization service contract.
 *
 * @packageDocumentation
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
 * @example
 * ```ts
 * import { CanonicalizationAlgorithm } from "@beep/semantic-web/services/canonicalization"
 *
 * void CanonicalizationAlgorithm
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const CanonicalizationAlgorithm = LiteralKit(["rdfc-1.0", "lexical-sort-v1"] as const).annotate(
  $I.annote("CanonicalizationAlgorithm", {
    description: "Canonicalization algorithm name with an explicit graph-safe default and lexical fallback.",
  })
);

/**
 * Typed canonicalization error.
 *
 * @example
 * ```ts
 * import { CanonicalizationError } from "@beep/semantic-web/services/canonicalization"
 *
 * void CanonicalizationError
 * ```
 *
 * @since 0.0.0
 * @category error handling
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
 * @example
 * ```ts
 * import { CanonicalizeDatasetRequest } from "@beep/semantic-web/services/canonicalization"
 *
 * void CanonicalizeDatasetRequest
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { FingerprintDatasetRequest } from "@beep/semantic-web/services/canonicalization"
 *
 * void FingerprintDatasetRequest
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { CanonicalDatasetResult } from "@beep/semantic-web/services/canonicalization"
 *
 * void CanonicalDatasetResult
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { DatasetFingerprint } from "@beep/semantic-web/services/canonicalization"
 *
 * void DatasetFingerprint
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import type { CanonicalizationServiceShape } from "@beep/semantic-web/services/canonicalization"
 *
 * const acceptCanonicalizationServiceShape = (value: CanonicalizationServiceShape) => value
 * void acceptCanonicalizationServiceShape
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { CanonicalizationService } from "@beep/semantic-web/services/canonicalization"
 *
 * void CanonicalizationService
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class CanonicalizationService extends Context.Service<CanonicalizationService, CanonicalizationServiceShape>()(
  $I`CanonicalizationService`
) {}
