/**
 * Formatting rules for boolean ontology properties.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/valueFormatting/PropertyBooleanFormattingRule
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("ontology/valueFormatting/PropertyBooleanFormattingRule");

/**
 * Boolean property formatting with explicit true/false display values.
 *
 * @since 0.0.0
 * @category models
 */
export class PropertyBooleanFormattingRule extends S.Class<PropertyBooleanFormattingRule>(
  $I`PropertyBooleanFormattingRule`
)(
  {
    type: S.Literal("boolean"),
    valueIfTrue: S.String,
    valueIfFalse: S.String,
  },
  $I.annote("PropertyBooleanFormattingRule", {
    description: "Formatting rule for boolean properties with configurable display strings for true and false values.",
  })
) {}
