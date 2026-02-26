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
 * Constant string literal value for formatting configuration.
 *
 * @since 0.0.0
 * @category models
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
 * Reference to another property type name used in formatting configuration.
 *
 * @since 0.0.0
 * @category models
 */
export class PropertyTypeReference extends S.Class<PropertyTypeReference>($I`PropertyTypeReference`)(
  {
    type: S.tag("propertyType"),
    value: S.String,
  },
  $I.annote("PropertyTypeReference", {
    description: "Reference to another ontology property type identifier used as a dynamic formatting source.",
  })
) {}

/**
 * Either a fixed constant string or a property type reference.
 *
 * @since 0.0.0
 * @category schemas
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

/**
 * Type for {@link PropertyTypeReferenceOrStringConstant}.
 *
 * @since 0.0.0
 * @category models
 */
export type PropertyTypeReferenceOrStringConstant = typeof PropertyTypeReferenceOrStringConstant.Type;
