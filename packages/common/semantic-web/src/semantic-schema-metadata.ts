/**
 * Semantic schema metadata helpers for public `@beep/semantic-web` families.
 *
 * @packageDocumentation
 * @since 0.0.0
 * @module
 */

import { $SemanticWebId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $SemanticWebId.create("semantic-schema-metadata");

/**
 * Closed v1 metadata kind domain for semantic-web schemas.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { SemanticSchemaMetadataKind } from "@beep/semantic-web/semantic-schema-metadata"
 *
 * console.log(S.is(SemanticSchemaMetadataKind)("identifier")) // true
 * console.log(S.is(SemanticSchemaMetadataKind)("unknown")) // false
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import type { SemanticSchemaMetadataKind } from "@beep/semantic-web/semantic-schema-metadata"
 *
 * const acceptSemanticSchemaMetadataKind = (value: SemanticSchemaMetadataKind) => value
 * void acceptSemanticSchemaMetadataKind
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type SemanticSchemaMetadataKind = typeof SemanticSchemaMetadataKind.Type;

/**
 * Stability classification for semantic-web schema metadata.
 *
 * @example
 * ```ts
 * import { SemanticSchemaStatus } from "@beep/semantic-web/semantic-schema-metadata"
 *
 * void SemanticSchemaStatus
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const SemanticSchemaStatus = LiteralKit(["experimental", "stable", "deprecated"] as const).annotate(
  $I.annote("SemanticSchemaStatus", {
    description: "Stability classification for semantic-web schema metadata.",
  })
);

/**
 * Type for {@link SemanticSchemaStatus}.
 *
 * @example
 * ```ts
 * import type { SemanticSchemaStatus } from "@beep/semantic-web/semantic-schema-metadata"
 *
 * const acceptSemanticSchemaStatus = (value: SemanticSchemaStatus) => value
 * void acceptSemanticSchemaStatus
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type SemanticSchemaStatus = typeof SemanticSchemaStatus.Type;

/**
 * Specification disposition attached to a semantic schema reference.
 *
 * @example
 * ```ts
 * import { SemanticSchemaSpecificationDisposition } from "@beep/semantic-web/semantic-schema-metadata"
 *
 * void SemanticSchemaSpecificationDisposition
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export const SemanticSchemaSpecificationDisposition = LiteralKit(["normative", "informative"] as const).annotate(
  $I.annote("SemanticSchemaSpecificationDisposition", {
    description: "Specification disposition attached to a semantic schema reference.",
  })
);

/**
 * Type for {@link SemanticSchemaSpecificationDisposition}.
 *
 * @example
 * ```ts
 * import type { SemanticSchemaSpecificationDisposition } from "@beep/semantic-web/semantic-schema-metadata"
 *
 * const acceptSemanticSchemaSpecificationDisposition = (value: SemanticSchemaSpecificationDisposition) => value
 * void acceptSemanticSchemaSpecificationDisposition
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type SemanticSchemaSpecificationDisposition = typeof SemanticSchemaSpecificationDisposition.Type;

/**
 * Representation label for semantic-web values.
 *
 * @example
 * ```ts
 * import { SemanticRepresentationKind } from "@beep/semantic-web/semantic-schema-metadata"
 *
 * void SemanticRepresentationKind
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import type { SemanticRepresentationKind } from "@beep/semantic-web/semantic-schema-metadata"
 *
 * const acceptSemanticRepresentationKind = (value: SemanticRepresentationKind) => value
 * void acceptSemanticRepresentationKind
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type SemanticRepresentationKind = typeof SemanticRepresentationKind.Type;

/**
 * Single specification reference attached to public semantic-web schemas.
 *
 * @example
 * ```ts
 * import { SemanticSchemaSpecification } from "@beep/semantic-web/semantic-schema-metadata"
 *
 * void SemanticSchemaSpecification
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { SemanticRepresentation } from "@beep/semantic-web/semantic-schema-metadata"
 *
 * void SemanticRepresentation
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```ts
 * import { SemanticSchemaMetadata } from "@beep/semantic-web/semantic-schema-metadata"
 *
 * void SemanticSchemaMetadata
 * ```
 *
 * @since 0.0.0
 * @category models
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
    aliases: S.NonEmptyString.pipe(S.Array, S.OptionFromOptionalKey),
    canonicalizationRequired: S.OptionFromOptionalKey(S.Boolean),
    representations: SemanticRepresentation.pipe(S.Array, S.OptionFromOptionalKey),
    provenanceProfile: S.OptionFromOptionalKey(S.NonEmptyString),
    evidenceAnchoring: S.OptionFromOptionalKey(S.NonEmptyString),
    timeSemantics: S.OptionFromOptionalKey(S.NonEmptyString),
    implementationNotes: S.NonEmptyString.pipe(S.Array, S.OptionFromOptionalKey),
    nonGoals: S.NonEmptyString.pipe(S.Array, S.OptionFromOptionalKey),
  },
  $I.annote("SemanticSchemaMetadata", {
    description: "Typed metadata payload stored in the semanticSchemaMetadata annotation key.",
  })
) {}

/**
 * Payload stored in the `semanticSchemaMetadata` annotation key.
 *
 * @example
 * ```ts
 * import type { SemanticSchemaMetadataAnnotationPayload } from "@beep/semantic-web/semantic-schema-metadata"
 *
 * const acceptSemanticSchemaMetadataAnnotationPayload = (value: SemanticSchemaMetadataAnnotationPayload) => value
 * void acceptSemanticSchemaMetadataAnnotationPayload
 * ```
 *
 * @since 0.0.0
 * @category models
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
 * @example
 * ```typescript
 * import { makeSemanticSchemaMetadata } from "@beep/semantic-web/semantic-schema-metadata"
 *
 * const metadata = makeSemanticSchemaMetadata({
 *
 *
 *
 *
 *
 *
 * })
 * console.log(metadata.kind) // "identifier"
 * ```
 *
 * @param metadata - Encoded metadata payload.
 * @returns Validated metadata payload.
 * @since 0.0.0
 * @category utilities
 */
export const makeSemanticSchemaMetadata = (
  metadata: typeof SemanticSchemaMetadata.Encoded
): SemanticSchemaMetadataAnnotationPayload => decodeSemanticSchemaMetadata(metadata);

/**
 * Attach validated semantic metadata to any Effect schema.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { annotateSemanticSchema } from "@beep/semantic-web/semantic-schema-metadata"
 *
 * const MySchema = annotateSemanticSchema(S.String, {
 *
 *
 *
 *
 *
 *
 * })
 * void MySchema
 * ```
 *
 * @param schema - Target schema.
 * @param metadata - Encoded metadata payload.
 * @returns Annotated schema.
 * @since 0.0.0
 * @category utilities
 */
export const annotateSemanticSchema: {
  <Schema extends S.Top>(metadata: typeof SemanticSchemaMetadata.Encoded): (schema: Schema) => Schema["Rebuild"];
  <Schema extends S.Top>(schema: Schema, metadata: typeof SemanticSchemaMetadata.Encoded): Schema["Rebuild"];
} = dual(
  2,
  <Schema extends S.Top>(schema: Schema, metadata: typeof SemanticSchemaMetadata.Encoded): Schema["Rebuild"] =>
    schema.annotate({ semanticSchemaMetadata: makeSemanticSchemaMetadata(metadata) })
);

const hasAnnotationsRecord = (
  value: unknown
): value is Readonly<Record<string, unknown>> & {
  annotations?:
    | {
        semanticSchemaMetadata?: SemanticSchemaMetadataAnnotationPayload | undefined;
      }
    | undefined;
} => P.isObject(value);

const findSemanticSchemaMetadata = (
  value: unknown,
  visited: WeakSet<object>
): SemanticSchemaMetadataAnnotationPayload | undefined => {
  if (A.isArray(value)) {
    if (visited.has(value)) {
      return;
    }

    visited.add(value);

    for (const nested of value) {
      const metadata = findSemanticSchemaMetadata(nested, visited);
      if (metadata !== undefined) {
        return metadata;
      }
    }

    return;
  }

  if (!P.isObject(value)) {
    return;
  }

  if (visited.has(value)) {
    return;
  }

  visited.add(value);

  if (hasAnnotationsRecord(value) && value.annotations?.semanticSchemaMetadata !== undefined) {
    return value.annotations.semanticSchemaMetadata;
  }

  for (const nested of R.values(value)) {
    const metadata = findSemanticSchemaMetadata(nested, visited);
    if (metadata !== undefined) {
      return metadata;
    }
  }

  return;
};

/**
 * Read semantic metadata from any Effect schema, if present.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { getSemanticSchemaMetadata } from "@beep/semantic-web/semantic-schema-metadata"
 *
 * const metadata = getSemanticSchemaMetadata(S.String)
 * console.log(metadata) // undefined (no metadata attached)
 * ```
 *
 * @param schema - Target schema.
 * @returns Metadata payload or `undefined`.
 * @since 0.0.0
 * @category utilities
 */
export const getSemanticSchemaMetadata = (schema: S.Top): SemanticSchemaMetadataAnnotationPayload | undefined =>
  findSemanticSchemaMetadata(schema.ast, new WeakSet());
