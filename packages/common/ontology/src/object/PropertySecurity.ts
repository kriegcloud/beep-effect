/**
 * Property security schemas for ontology object properties.
 *
 * @since 0.0.0
 * @module @beep/ontology/object/PropertySecurity
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("object/PropertySecurity");

/**
 * A unique identifier for a security marking.
 *
 * @since 0.0.0
 * @category schemas
 */
export const MarkingId = S.String.annotate(
  $I.annote("MarkingId", {
    description: "A unique identifier for a security marking.",
    documentation: "Markings represent security classifications or access control requirements.",
  })
);

/**
 * Type for {@link MarkingId}.
 *
 * @since 0.0.0
 * @category models
 */
export type MarkingId = typeof MarkingId.Type;

/**
 * Array of marking identifiers.
 *
 * @since 0.0.0
 * @category schemas
 */
export const ArrayOfMarkingId = S.Array(MarkingId).annotate(
  $I.annote("ArrayOfMarkingId", {
    description: "An array of security marking identifiers.",
    documentation: "An array of unique identifiers for security markings.",
  })
);

/**
 * Type for {@link ArrayOfMarkingId}.
 *
 * @since 0.0.0
 * @category models
 */
export type ArrayOfMarkingId = typeof ArrayOfMarkingId.Type;

/**
 * Two-dimensional array of marking identifiers.
 *
 * @since 0.0.0
 * @category schemas
 */
export const TwoDimensionalArrayOfMarkingId = S.Array(ArrayOfMarkingId).annotate(
  $I.annote("TwoDimensionalArrayOfMarkingId", {
    description: "A two-dimensional array of security marking identifiers.",
    documentation: "A two-dimensional array of unique identifiers for security markings.",
  })
);

/**
 * Type for {@link TwoDimensionalArrayOfMarkingId}.
 *
 * @since 0.0.0
 * @category models
 */
export type TwoDimensionalArrayOfMarkingId = typeof TwoDimensionalArrayOfMarkingId.Type;

/**
 * All marking requirements applicable to a property value.
 *
 * @since 0.0.0
 * @category models
 */
export class PropertyMarkings extends S.Class<PropertyMarkings>($I`PropertyMarkings`)(
  {
    conjunctive: S.optionalKey(ArrayOfMarkingId).annotateKey(
      $I.annote("PropertyMarkings.conjunctive", {
        description: "The conjunctive set of markings required to access the property value.",
        documentation: "All markings from a conjunctive set must be met for access.",
      })
    ),

    disjunctive: S.optionalKey(TwoDimensionalArrayOfMarkingId).annotateKey(
      $I.annote("PropertyMarkings.disjunctive", {
        description: "The disjunctive set of markings required to access the property value.",
        documentation:
          "Disjunctive markings are represented as a conjunctive list of disjunctive sets.\nThe top-level array is a conjunction of sets, where each inner array should be\ntreated as a unit where any marking within the set can satisfy the set.\nAll sets within the top level array must be satisfied.",
      })
    ),

    containerConjunctive: S.optionalKey(ArrayOfMarkingId).annotateKey(
      $I.annote("PropertyMarkings.containerConjunctive", {
        description:
          "The conjunctive set of markings for the container of this property value, such as the project of a dataset.",
        documentation:
          "These markings may differ from the actual property marking but still must be satisfied for access.",
      })
    ),

    containerDisjunctive: S.optionalKey(TwoDimensionalArrayOfMarkingId).annotateKey(
      $I.annote("PropertyMarkings.containerDisjunctive", {
        description:
          "The disjunctive set of markings for the container of this property value, such as the project of a dataset.",
        documentation:
          "These markings may differ from the actual property marking but still must be satisfied for access.",
      })
    ),
  },
  $I.annote("PropertyMarkings", {
    description: "All marking requirements applicable to a property value.",
    documentation:
      "Markings represent security classifications or access control requirements that must be satisfied to access the property value.",
  })
) {}

/**
 * Successful property security evaluation result.
 *
 * @since 0.0.0
 * @category models
 */
export class PropertyMarkingsPropertySecurity extends PropertyMarkings.extend<PropertyMarkingsPropertySecurity>(
  $I`PropertyMarkingsPropertySecurity`
)(
  {
    type: S.tag("propertyMarkings"),
  },
  $I.annote("PropertyMarkingsPropertySecurity", {
    description: "Property security result that includes computed property markings.",
  })
) {}

/**
 * Property security evaluation result when policy type is unsupported.
 *
 * @since 0.0.0
 * @category models
 */
export class UnsupportedPolicyPropertySecurity extends S.Class<UnsupportedPolicyPropertySecurity>(
  $I`UnsupportedPolicyPropertySecurity`
)(
  {
    type: S.tag("unsupportedPolicy"),
  },
  $I.annote("UnsupportedPolicyPropertySecurity", {
    description: "Property security result indicating policy evaluation is unsupported for this property.",
  })
) {}

/**
 * Property security evaluation result when computation fails.
 *
 * @since 0.0.0
 * @category models
 */
export class ErrorComputingSecurityPropertySecurity extends S.Class<ErrorComputingSecurityPropertySecurity>(
  $I`ErrorComputingSecurityPropertySecurity`
)(
  {
    type: S.tag("errorComputingSecurity"),
  },
  $I.annote("ErrorComputingSecurityPropertySecurity", {
    description: "Property security result indicating the server could not compute security markings.",
  })
) {}

/**
 * Discriminated union of property security outcomes.
 *
 * @since 0.0.0
 * @category schemas
 */
export const PropertySecurity = S.Union([
  PropertyMarkingsPropertySecurity,
  UnsupportedPolicyPropertySecurity,
  ErrorComputingSecurityPropertySecurity,
]).pipe(
  S.annotate(
    $I.annote("PropertySecurity", {
      description: "Discriminated union representing all possible property security outcomes.",
      documentation:
        "The `type` discriminator distinguishes successful markings, unsupported policy cases, and computation failures.",
    })
  )
);

/**
 * Type for {@link PropertySecurity}.
 *
 * @since 0.0.0
 * @category models
 */
export type PropertySecurity = typeof PropertySecurity.Type;
