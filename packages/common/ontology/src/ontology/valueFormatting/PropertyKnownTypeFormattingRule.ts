/**
 * Formatting rules for known ontology semantic value types.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/valueFormatting/PropertyKnownTypeFormattingRule
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("ontology/valueFormatting/PropertyKnownTypeFormattingRule");

/**
 * Known platform-specific semantic property types.
 *
 * @since 0.0.0
 * @category Validation
 */
export const KnownType = S.Literals(["USER_OR_GROUP_ID", "RESOURCE_RID", "ARTIFACT_GID"]).pipe(
  S.annotate(
    $I.annote("KnownType", {
      description: "Known semantic property kinds with specialized formatting behavior.",
    })
  )
);

/**
 * Type for {@link KnownType}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type KnownType = typeof KnownType.Type;

/**
 * Formatting rule for properties tagged as a known semantic type.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PropertyKnownTypeFormattingRule extends S.Class<PropertyKnownTypeFormattingRule>(
  $I`PropertyKnownTypeFormattingRule`
)(
  {
    type: S.tag("knownType"),
    knownType: KnownType,
  },
  $I.annote("PropertyKnownTypeFormattingRule", {
    description: "Formatting rule variant for known semantic property types.",
  })
) {}
