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
 * @category models
 */
export interface OsdkMetadata {
  readonly extraUserAgent: string;
}

/**
 * Runtime schema for {@link OsdkMetadata}.
 *
 * @since 0.0.0
 * @category schemas
 */
export const OsdkMetadata = S.Struct({
  extraUserAgent: S.String,
}).pipe(
  S.annotate(
    $I.annote("OsdkMetadata", {
      description: "Optional metadata that appends extra user-agent information to OSDK requests.",
    })
  )
);
