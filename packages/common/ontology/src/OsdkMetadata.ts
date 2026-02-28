/**
 * Shared OSDK metadata fields attached to ontology API calls.
 *
 * @since 0.0.0
 * @module @beep/ontology/OsdkMetadata
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("OsdkMetadata");

/**
 * Optional metadata included with OSDK-backed ontology requests.
 *
 * @since 0.0.0
 * @category schemas
 */
export class OsdkMetadata extends S.Class<OsdkMetadata>($I`OsdkMetadata`)(
  {
    extraUserAgent: S.String,
  },
  $I.annote("OsdkMetadata", {
    description: "Optional metadata that appends extra user-agent information to OSDK requests.",
  })
) {}
