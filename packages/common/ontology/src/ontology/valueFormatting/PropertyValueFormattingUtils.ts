/**
 * Shared schema fragments for value formatting rule composition.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/valueFormatting/PropertyValueFormattingUtils
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("ontology/valueFormatting/PropertyValueFormattingUtils");

/**
 * Runtime schema for StringConstant.
 *
 * @since 0.0.0
 * @category Validation
 */
export class StringConstant extends S.Class<StringConstant>($I`StringConstant`)(
  {
    type: S.tag("constant"),
    value: S.String,
  },
  $I.annote("StringConstant", {
    description: "Static string value used directly in formatting configuration fields.",
  })
) {}

/**
 * Runtime schema for PropertyTypeReference.
 *
 * @since 0.0.0
 * @category Validation
 */
export class PropertyTypeReference extends S.Class<PropertyTypeReference>($I`PropertyTypeReference`)(
  {
    type: S.tag("propertyType"),
    propertyApiName: S.String,
  },
  $I.annote("PropertyTypeReference", {
    description: "Reference to another ontology property API name used as a dynamic formatting source.",
  })
) {}

/**
 * Runtime schema for PropertyTypeReferenceOrStringConstant.
 *
 * @since 0.0.0
 * @category Validation
 */
export const PropertyTypeReferenceOrStringConstant = S.Union([PropertyTypeReference, StringConstant]).pipe(
  S.toTaggedUnion("type"),
  S.annotate(
    $I.annote("PropertyTypeReferenceOrStringConstant", {
      description:
        "Tagged union allowing formatting config to use either a constant string value or a referenced property type value.",
    })
  )
);
