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
 * Runtime schema for OntologyMetadata.
 *
 * @since 0.0.0
 * @category schemas
 */
export class OntologyMetadata extends S.Class<OntologyMetadata>($I`OntologyMetadata`)(
  {
    expectsClientVersion: S.optionalKey(S.Unknown),
    ontologyRid: S.String,
    ontologyApiName: S.String,
    userAgent: S.String,
  },
  $I.annote("OntologyMetadata", {
    description: "Metadata emitted with ontology definitions and request context.",
  })
) {}
