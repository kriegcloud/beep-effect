/**
 * Ontology metadata definition models.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/OntologyMetadata
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("ontology/OntologyMetadata");

/**
 * Metadata carried by ontology definitions.
 *
 * @since 0.0.0
 * @category models
 */
export interface OntologyMetadata<_NEVER_USED_KEPT_FOR_BACKCOMPAT = unknown> {
  readonly expectsClientVersion?: _NEVER_USED_KEPT_FOR_BACKCOMPAT;
  readonly ontologyRid: string;
  readonly ontologyApiName: string;
  readonly userAgent: string;
}

/**
 * Runtime schema for {@link OntologyMetadata}.
 *
 * @since 0.0.0
 * @category schemas
 */
export const OntologyMetadata = S.Struct({
  expectsClientVersion: S.optionalKey(S.Unknown),
  ontologyRid: S.String,
  ontologyApiName: S.String,
  userAgent: S.String,
}).pipe(
  S.annotate(
    $I.annote("OntologyMetadata", {
      description: "Metadata emitted with ontology definitions and request context.",
    })
  )
);
