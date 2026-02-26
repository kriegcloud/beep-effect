/**
 * Shared metadata fields attached to ontology API calls.
 *
 * @since 0.0.0
 * @module @beep/ontology/OntologyMetadata
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("OntologyMetadata");

/**
 * Optional metadata included with ontology requests.
 *
 * @since 0.0.0
 * @category models
 */
export class OntologyMetadata extends S.Class<OntologyMetadata>($I`OntologyMetadata`)(
  {
    extraUserAgent: S.String,
  },
  $I.annote("OntologyMetadata", {
    description: "Optional metadata for ontology requests, including additional user-agent suffix information.",
  })
) {}
