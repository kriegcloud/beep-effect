/**
 * SHACL validation service contract.
 *
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import { type Effect, ServiceMap } from "effect";
import * as S from "effect/Schema";
import { Dataset, NamedNode } from "../rdf.ts";
import { makeSemanticSchemaMetadata } from "../semantic-schema-metadata.ts";

const $I = $SemanticWebId.create("services/shacl-validation");

const serviceContractMetadata = (canonicalName: string, overview: string) =>
  makeSemanticSchemaMetadata({
    kind: "serviceContract",
    canonicalName,
    overview,
    status: "stable",
    specifications: [{ name: "SHACL Core", disposition: "informative" }],
    equivalenceBasis: "Shape and result equality by exact field comparison.",
    representations: [{ kind: "RDF/JS" }],
    implementationNotes: [
      "The v1 package surface validates a bounded SHACL-inspired subset covering targetClass, minCount, maxCount, and datatype.",
      "A full external SHACL engine can later back this contract without changing the public request and result wrappers.",
    ],
  });

/**
 * SHACL report severity.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ShaclSeverity = LiteralKit(["info", "warning", "violation"] as const).annotate(
  $I.annote("ShaclSeverity", {
    description: "SHACL report severity.",
  })
);

/**
 * SHACL property shape used by the bounded service contract.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ShaclPropertyShape extends S.Class<ShaclPropertyShape>($I`ShaclPropertyShape`)(
  {
    path: NamedNode,
    minCount: S.OptionFromOptionalKey(NonNegativeInt),
    maxCount: S.OptionFromOptionalKey(NonNegativeInt),
    datatype: S.OptionFromOptionalKey(NamedNode),
  },
  $I.annote("ShaclPropertyShape", {
    description: "SHACL property shape used by the bounded service contract.",
    semanticSchemaMetadata: serviceContractMetadata(
      "ShaclPropertyShape",
      "SHACL property shape used by the bounded service contract."
    ),
  })
) {}

/**
 * SHACL node shape used by the bounded service contract.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ShaclNodeShape extends S.Class<ShaclNodeShape>($I`ShaclNodeShape`)(
  {
    id: S.OptionFromOptionalKey(NamedNode),
    targetClass: S.OptionFromOptionalKey(NamedNode),
    properties: S.Array(ShaclPropertyShape),
  },
  $I.annote("ShaclNodeShape", {
    description: "SHACL node shape used by the bounded service contract.",
    semanticSchemaMetadata: serviceContractMetadata(
      "ShaclNodeShape",
      "SHACL node shape used by the bounded service contract."
    ),
  })
) {}

/**
 * SHACL validation violation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ShaclValidationViolation extends S.Class<ShaclValidationViolation>($I`ShaclValidationViolation`)(
  {
    focusNode: S.String,
    path: NamedNode,
    message: S.String,
    severity: ShaclSeverity,
  },
  $I.annote("ShaclValidationViolation", {
    description: "SHACL validation violation.",
    semanticSchemaMetadata: serviceContractMetadata("ShaclValidationViolation", "SHACL validation violation."),
  })
) {}

/**
 * SHACL validation request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ShaclValidationRequest extends S.Class<ShaclValidationRequest>($I`ShaclValidationRequest`)(
  {
    dataset: Dataset,
    shapes: S.Array(ShaclNodeShape),
    maxResults: S.OptionFromOptionalKey(NonNegativeInt),
  },
  $I.annote("ShaclValidationRequest", {
    description: "SHACL validation request.",
    semanticSchemaMetadata: serviceContractMetadata(
      "ShaclValidationRequest",
      "Request to validate RDF data against bounded SHACL-inspired shapes."
    ),
  })
) {}

/**
 * SHACL validation result.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ShaclValidationResult extends S.Class<ShaclValidationResult>($I`ShaclValidationResult`)(
  {
    conforms: S.Boolean,
    violations: S.Array(ShaclValidationViolation),
    truncated: S.Boolean,
  },
  $I.annote("ShaclValidationResult", {
    description: "SHACL validation result.",
    semanticSchemaMetadata: serviceContractMetadata("ShaclValidationResult", "SHACL validation result."),
  })
) {}

/**
 * Typed SHACL validation error.
 *
 * @since 0.0.0
 * @category Errors
 */
export class ShaclValidationError extends TaggedErrorClass<ShaclValidationError>($I`ShaclValidationError`)(
  "ShaclValidationError",
  {
    reason: LiteralKit(["invalidShape", "engineFailure"] as const),
    message: S.String,
  },
  $I.annote("ShaclValidationError", {
    description: "Typed SHACL validation error.",
    semanticSchemaMetadata: serviceContractMetadata("ShaclValidationError", "Typed SHACL validation error."),
  })
) {}

/**
 * SHACL validation service contract shape.
 *
 * @since 0.0.0
 * @category PortContract
 */
export interface ShaclValidationServiceShape {
  readonly validate: (request: ShaclValidationRequest) => Effect.Effect<ShaclValidationResult, ShaclValidationError>;
}

/**
 * SHACL validation service tag.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class ShaclValidationService extends ServiceMap.Service<ShaclValidationService, ShaclValidationServiceShape>()(
  $I`ShaclValidationService`
) {}
