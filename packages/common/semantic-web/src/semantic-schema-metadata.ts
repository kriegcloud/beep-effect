/**
 * Semantic schema metadata helpers for public `@beep/semantic-web` families.
 *
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SemanticWebId.create("semantic-schema-metadata");

/**
 * Closed v1 metadata kind domain for semantic-web schemas.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const SemanticSchemaMetadataKind = LiteralKit([
  "identifier",
  "vocabularyTerm",
  "ontologyConstruct",
  "rdfConstruct",
  "jsonldConstruct",
  "provenanceConstruct",
  "serviceContract",
  "adapterBoundary",
] as const).annotate(
  $I.annote("SemanticSchemaMetadataKind", {
    description: "Closed v1 metadata kind domain for semantic-web schemas.",
  })
);

/**
 * Type for {@link SemanticSchemaMetadataKind}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SemanticSchemaMetadataKind = typeof SemanticSchemaMetadataKind.Type;

/**
 * Stability classification for semantic-web schema metadata.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const SemanticSchemaStatus = LiteralKit(["experimental", "stable", "deprecated"] as const).annotate(
  $I.annote("SemanticSchemaStatus", {
    description: "Stability classification for semantic-web schema metadata.",
  })
);

/**
 * Type for {@link SemanticSchemaStatus}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SemanticSchemaStatus = typeof SemanticSchemaStatus.Type;

/**
 * Specification disposition attached to a semantic schema reference.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const SemanticSchemaSpecificationDisposition = LiteralKit(["normative", "informative"] as const).annotate(
  $I.annote("SemanticSchemaSpecificationDisposition", {
    description: "Specification disposition attached to a semantic schema reference.",
  })
);

/**
 * Type for {@link SemanticSchemaSpecificationDisposition}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SemanticSchemaSpecificationDisposition = typeof SemanticSchemaSpecificationDisposition.Type;

/**
 * Representation label for semantic-web values.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const SemanticRepresentationKind = LiteralKit([
  "RDF/JS",
  "JSON-LD",
  "Turtle",
  "TriG",
  "RDF/XML",
  "JSON Schema",
] as const).annotate(
  $I.annote("SemanticRepresentationKind", {
    description: "Representation label for semantic-web values.",
  })
);

/**
 * Type for {@link SemanticRepresentationKind}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SemanticRepresentationKind = typeof SemanticRepresentationKind.Type;

/**
 * Single specification reference attached to public semantic-web schemas.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SemanticSchemaSpecification extends S.Class<SemanticSchemaSpecification>($I`SemanticSchemaSpecification`)(
  {
    name: S.NonEmptyString,
    version: S.OptionFromOptionalKey(S.NonEmptyString),
    section: S.OptionFromOptionalKey(S.NonEmptyString),
    url: S.OptionFromOptionalKey(S.NonEmptyString),
    localRef: S.OptionFromOptionalKey(S.NonEmptyString),
    disposition: SemanticSchemaSpecificationDisposition,
  },
  $I.annote("SemanticSchemaSpecification", {
    description: "Single specification reference attached to public semantic-web schemas.",
  })
) {}

/**
 * Single representation note attached to semantic-web schemas.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SemanticRepresentation extends S.Class<SemanticRepresentation>($I`SemanticRepresentation`)(
  {
    kind: SemanticRepresentationKind,
    note: S.OptionFromOptionalKey(S.NonEmptyString),
  },
  $I.annote("SemanticRepresentation", {
    description: "Single representation note attached to semantic-web schemas.",
  })
) {}

/**
 * Typed metadata payload stored in the `semanticSchemaMetadata` annotation key.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SemanticSchemaMetadata extends S.Class<SemanticSchemaMetadata>($I`SemanticSchemaMetadata`)(
  {
    kind: SemanticSchemaMetadataKind,
    canonicalName: S.NonEmptyString,
    overview: S.NonEmptyString,
    status: SemanticSchemaStatus,
    specifications: S.NonEmptyArray(SemanticSchemaSpecification),
    equivalenceBasis: S.NonEmptyString,
    canonicalIri: S.OptionFromOptionalKey(S.NonEmptyString),
    preferredPrefix: S.OptionFromOptionalKey(S.NonEmptyString),
    aliases: S.OptionFromOptionalKey(S.Array(S.NonEmptyString)),
    canonicalizationRequired: S.OptionFromOptionalKey(S.Boolean),
    representations: S.OptionFromOptionalKey(S.Array(SemanticRepresentation)),
    provenanceProfile: S.OptionFromOptionalKey(S.NonEmptyString),
    evidenceAnchoring: S.OptionFromOptionalKey(S.NonEmptyString),
    timeSemantics: S.OptionFromOptionalKey(S.NonEmptyString),
    implementationNotes: S.OptionFromOptionalKey(S.Array(S.NonEmptyString)),
    nonGoals: S.OptionFromOptionalKey(S.Array(S.NonEmptyString)),
  },
  $I.annote("SemanticSchemaMetadata", {
    description: "Typed metadata payload stored in the semanticSchemaMetadata annotation key.",
  })
) {}

/**
 * Payload stored in the `semanticSchemaMetadata` annotation key.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SemanticSchemaMetadataAnnotationPayload = SemanticSchemaMetadata;

declare module "effect/Schema" {
  namespace Annotations {
    interface Annotations {
      readonly semanticSchemaMetadata?: SemanticSchemaMetadataAnnotationPayload | undefined;
    }
  }
}

const decodeSemanticSchemaMetadata = S.decodeUnknownSync(SemanticSchemaMetadata);

/**
 * Validate a metadata payload before attaching it to a public schema.
 *
 * @param metadata - Encoded metadata payload.
 * @returns Validated metadata payload.
 * @since 0.0.0
 * @category DomainModel
 */
export const makeSemanticSchemaMetadata = (
  metadata: typeof SemanticSchemaMetadata.Encoded
): SemanticSchemaMetadataAnnotationPayload => decodeSemanticSchemaMetadata(metadata);

/**
 * Attach validated semantic metadata to any Effect schema.
 *
 * @param schema - Target schema.
 * @param metadata - Encoded metadata payload.
 * @returns Annotated schema.
 * @since 0.0.0
 * @category DomainModel
 */
export const annotateSemanticSchema = <Schema extends S.Top>(
  schema: Schema,
  metadata: typeof SemanticSchemaMetadata.Encoded
): Schema["~rebuild.out"] => schema.annotate({ semanticSchemaMetadata: makeSemanticSchemaMetadata(metadata) });

/**
 * Read semantic metadata from any Effect schema, if present.
 *
 * @param schema - Target schema.
 * @returns Metadata payload or `undefined`.
 * @since 0.0.0
 * @category DomainModel
 */
export const getSemanticSchemaMetadata = (schema: S.Top): SemanticSchemaMetadataAnnotationPayload | undefined =>
  S.resolveInto(schema)?.semanticSchemaMetadata;
