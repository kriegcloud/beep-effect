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
 * Metadata fields attached to ontology definitions.
 *
 * @since 0.0.0
 * @category models
 */
export class OntologyMetadata extends S.Class<OntologyMetadata>($I`OntologyMetadata`)(
  {
    extraUserAgent: S.String,
  },
  $I.annote("OntologyMetadata", {
    description: "Ontology metadata fields used to extend request user-agent information.",
  })
) {}
