/**
 * OntoUML JSON Schema domain models.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $OntologyId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

// cspell:words OntoUML Powertype Powertypes

const $I = $OntologyId.create("domain/Ontouml/Ontouml.model");

const hasUniqueJsonItems = (items: ReadonlyArray<unknown>): boolean => {
  const seen = new Set<string>();

  for (const item of items) {
    const key = JSON.stringify(item);

    if (key === undefined || seen.has(key)) {
      return false;
    }

    seen.add(key);
  }

  return true;
};

const hasAtLeastOneKey = (record: Readonly<Record<string, unknown>>): boolean => Object.keys(record).length > 0;

const uniqueItemsCheck = <const Identifier extends string>(
  identifier: Identifier,
  title: string,
  description: string
) =>
  S.makeFilter<ReadonlyArray<unknown>>(hasUniqueJsonItems, {
    ...$I.annote(identifier as never, { description }),
    title,
    message: "Array items must be unique by JSON value",
  });

const nonEmptyRecordCheck = <const Identifier extends string>(
  identifier: Identifier,
  title: string,
  description: string
) =>
  S.makeFilter<Readonly<Record<string, unknown>>>(hasAtLeastOneKey, {
    ...$I.annote(identifier as never, { description }),
    title,
    message: "Record must contain at least one key",
  });

/**
 * Non-empty OntoUML element identifier.
 *
 * @example
 * ```ts
 * import { OntoumlId } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlId)("class-1"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlId = S.NonEmptyString.pipe(
  $I.annoteSchema("OntoumlId", {
    description: "Non-empty string that identifies an OntoUML object within its object type.",
  })
);

/**
 * Runtime type for {@link OntoumlId}.
 *
 * @example
 * ```ts
 * import type { OntoumlId } from "@beep/ontology"
 *
 * const id: OntoumlId = "class-1" as OntoumlId
 * console.log(id)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlId = typeof OntoumlId.Type;

/**
 * Nullable non-empty string from the OntoUML JSON schema.
 *
 * @example
 * ```ts
 * import { OntoumlNullableString } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlNullableString)(null))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlNullableString = S.NullOr(S.NonEmptyString).pipe(
  $I.annoteSchema("OntoumlNullableString", {
    description: "Nullable non-empty string used by OntoUML JSON fields.",
  })
);

/**
 * Runtime type for {@link OntoumlNullableString}.
 *
 * @example
 * ```ts
 * import type { OntoumlNullableString } from "@beep/ontology"
 *
 * const text: OntoumlNullableString = null
 * console.log(text)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlNullableString = typeof OntoumlNullableString.Type;

/**
 * Nullable finite number from the OntoUML JSON schema.
 *
 * @example
 * ```ts
 * import { OntoumlNullableNumber } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlNullableNumber)(42))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlNullableNumber = S.NullOr(S.Finite).pipe(
  $I.annoteSchema("OntoumlNullableNumber", {
    description: "Nullable finite number used by OntoUML JSON fields.",
  })
);

/**
 * Runtime type for {@link OntoumlNullableNumber}.
 *
 * @example
 * ```ts
 * import type { OntoumlNullableNumber } from "@beep/ontology"
 *
 * const value: OntoumlNullableNumber = 42
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlNullableNumber = typeof OntoumlNullableNumber.Type;

/**
 * Nullable boolean from the OntoUML JSON schema.
 *
 * @example
 * ```ts
 * import { OntoumlNullableBoolean } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlNullableBoolean)(false))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlNullableBoolean = S.NullOr(S.Boolean).pipe(
  $I.annoteSchema("OntoumlNullableBoolean", {
    description: "Nullable boolean used by OntoUML JSON meta-properties.",
  })
);

/**
 * Runtime type for {@link OntoumlNullableBoolean}.
 *
 * @example
 * ```ts
 * import type { OntoumlNullableBoolean } from "@beep/ontology"
 *
 * const flag: OntoumlNullableBoolean = null
 * console.log(flag)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlNullableBoolean = typeof OntoumlNullableBoolean.Type;

/**
 * Non-empty language map branch for multilingual OntoUML strings.
 *
 * @example
 * ```ts
 * import { OntoumlLanguageStringMap } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlLanguageStringMap)({ en: "Name" }))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlLanguageStringMap = S.Record(S.NonEmptyString, S.NonEmptyString)
  .check(
    nonEmptyRecordCheck(
      "OntoumlLanguageStringMapNonEmptyCheck",
      "OntoUML Language String Map Non Empty Check",
      "Requires multilingual OntoUML string objects to contain at least one language entry."
    )
  )
  .pipe(
    $I.annoteSchema("OntoumlLanguageStringMap", {
      description: "Non-empty record of BCP 47-like language keys to non-empty localized strings.",
    })
  );

/**
 * Runtime type for {@link OntoumlLanguageStringMap}.
 *
 * @example
 * ```ts
 * import type { OntoumlLanguageStringMap } from "@beep/ontology"
 *
 * const value: OntoumlLanguageStringMap = { en: "Vehicle" }
 * console.log(value.en)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlLanguageStringMap = typeof OntoumlLanguageStringMap.Type;

/**
 * Nullable string or language map used for OntoUML names and descriptions.
 *
 * @example
 * ```ts
 * import { OntoumlMultilingualString } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlMultilingualString)({ en: "Person" }))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlMultilingualString = S.Union([OntoumlNullableString, OntoumlLanguageStringMap]).pipe(
  $I.annoteSchema("OntoumlMultilingualString", {
    description: "Nullable string or non-empty language map used by OntoUML textual fields.",
  })
);

/**
 * Runtime type for {@link OntoumlMultilingualString}.
 *
 * @example
 * ```ts
 * import type { OntoumlMultilingualString } from "@beep/ontology"
 *
 * const value: OntoumlMultilingualString = { en: "Person" }
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlMultilingualString = typeof OntoumlMultilingualString.Type;

/**
 * OntoUML name field.
 *
 * @example
 * ```ts
 * import { OntoumlName } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlName)("Order"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlName = OntoumlMultilingualString.pipe(
  $I.annoteSchema("OntoumlName", {
    description: "Nullable multilingual OntoUML object name.",
  })
);

/**
 * Runtime type for {@link OntoumlName}.
 *
 * @example
 * ```ts
 * import type { OntoumlName } from "@beep/ontology"
 *
 * const name: OntoumlName = "Order"
 * console.log(name)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlName = typeof OntoumlName.Type;

/**
 * OntoUML description field.
 *
 * @example
 * ```ts
 * import { OntoumlDescription } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlDescription)(null))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlDescription = OntoumlMultilingualString.pipe(
  $I.annoteSchema("OntoumlDescription", {
    description: "Nullable multilingual OntoUML free-text description.",
  })
);

/**
 * Runtime type for {@link OntoumlDescription}.
 *
 * @example
 * ```ts
 * import type { OntoumlDescription } from "@beep/ontology"
 *
 * const description: OntoumlDescription = null
 * console.log(description)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlDescription = typeof OntoumlDescription.Type;

/**
 * OntoUML stereotype field.
 *
 * @example
 * ```ts
 * import { OntoumlStereotype } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlStereotype)("kind"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlStereotype = OntoumlNullableString.pipe(
  $I.annoteSchema("OntoumlStereotype", {
    description: "Nullable non-empty OntoUML stereotype string.",
  })
);

/**
 * Runtime type for {@link OntoumlStereotype}.
 *
 * @example
 * ```ts
 * import type { OntoumlStereotype } from "@beep/ontology"
 *
 * const stereotype: OntoumlStereotype = "kind"
 * console.log(stereotype)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlStereotype = typeof OntoumlStereotype.Type;

/**
 * Diagram element type literals.
 *
 * @example
 * ```ts
 * import { OntoumlDiagramElementType } from "@beep/ontology"
 *
 * console.log(OntoumlDiagramElementType.is.Shape("Shape"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlDiagramElementType = LiteralKit(["Shape", "Line", "Label"]).annotate(
  $I.annote("OntoumlDiagramElementType", {
    description: "Closed literal domain for OntoUML diagram element types.",
  })
);

/**
 * Runtime type for {@link OntoumlDiagramElementType}.
 *
 * @example
 * ```ts
 * import type { OntoumlDiagramElementType } from "@beep/ontology"
 *
 * const value: OntoumlDiagramElementType = "Shape"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlDiagramElementType = typeof OntoumlDiagramElementType.Type;

/**
 * OntoUML property aggregation kind literals.
 *
 * @example
 * ```ts
 * import { OntoumlAggregationKind } from "@beep/ontology"
 *
 * console.log(OntoumlAggregationKind.is.COMPOSITE("COMPOSITE"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlAggregationKind = LiteralKit(["NONE", "SHARED", "COMPOSITE"]).annotate(
  $I.annote("OntoumlAggregationKind", {
    description: "Closed literal domain for OntoUML property aggregation kinds.",
  })
);

/**
 * Runtime type for {@link OntoumlAggregationKind}.
 *
 * @example
 * ```ts
 * import type { OntoumlAggregationKind } from "@beep/ontology"
 *
 * const value: OntoumlAggregationKind = "NONE"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlAggregationKind = typeof OntoumlAggregationKind.Type;

/**
 * OntoUML reference target type literals.
 *
 * @example
 * ```ts
 * import { OntoumlReferenceType } from "@beep/ontology"
 *
 * console.log(OntoumlReferenceType.is.Class("Class"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlReferenceType = LiteralKit([
  "Package",
  "Class",
  "Relation",
  "Generalization",
  "GeneralizationSet",
  "Property",
  "Enumeration",
  "Literal",
]).annotate(
  $I.annote("OntoumlReferenceType", {
    description: "Closed literal domain for OntoUML reference target types.",
  })
);

/**
 * Runtime type for {@link OntoumlReferenceType}.
 *
 * @example
 * ```ts
 * import type { OntoumlReferenceType } from "@beep/ontology"
 *
 * const value: OntoumlReferenceType = "Class"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlReferenceType = typeof OntoumlReferenceType.Type;

/**
 * Non-null OntoUML reference object.
 *
 * @example
 * ```ts
 * import { OntoumlReferenceObject } from "@beep/ontology"
 *
 * const reference = OntoumlReferenceObject.make({ type: "Class", id: "class-1" })
 * console.log(reference.id)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OntoumlReferenceObject extends S.Class<OntoumlReferenceObject>($I`OntoumlReferenceObject`)(
  {
    type: OntoumlReferenceType,
    id: OntoumlId,
  },
  $I.annote("OntoumlReferenceObject", {
    description: "Non-null reference to an OntoUML model element.",
  })
) {}

/**
 * Nullable OntoUML reference definition.
 *
 * @example
 * ```ts
 * import { OntoumlReference } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlReference)(null))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlReference = S.NullOr(OntoumlReferenceObject).pipe(
  $I.annoteSchema("OntoumlReference", {
    description: "Nullable reference to an OntoUML model element.",
  })
);

/**
 * Runtime type for {@link OntoumlReference}.
 *
 * @example
 * ```ts
 * import type { OntoumlReference } from "@beep/ontology"
 *
 * const reference: OntoumlReference = null
 * console.log(reference)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlReference = typeof OntoumlReference.Type;

const OntoumlUniqueReferenceArray = S.NonEmptyArray(OntoumlReference).check(
  uniqueItemsCheck(
    "OntoumlUniqueReferenceArrayUniqueItemsCheck",
    "OntoUML Unique Reference Array Unique Items Check",
    "Requires arrays of OntoUML references to contain unique JSON values."
  )
);

/**
 * OntoUML color field.
 *
 * @example
 * ```ts
 * import { OntoumlColor } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlColor)("#ff99a3"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlColor = OntoumlNullableString.pipe(
  $I.annoteSchema("OntoumlColor", {
    description: "Nullable color string used by OntoUML diagram styles.",
  })
);

/**
 * Runtime type for {@link OntoumlColor}.
 *
 * @example
 * ```ts
 * import type { OntoumlColor } from "@beep/ontology"
 *
 * const color: OntoumlColor = "#ff99a3"
 * console.log(color)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlColor = typeof OntoumlColor.Type;

/**
 * OntoUML diagram line style field.
 *
 * @example
 * ```ts
 * import { OntoumlLineStyle } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlLineStyle)("dashed"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlLineStyle = OntoumlNullableString.pipe(
  $I.annoteSchema("OntoumlLineStyle", {
    description: "Nullable line-style string used by OntoUML diagrams.",
  })
);

/**
 * Runtime type for {@link OntoumlLineStyle}.
 *
 * @example
 * ```ts
 * import type { OntoumlLineStyle } from "@beep/ontology"
 *
 * const style: OntoumlLineStyle = "solid"
 * console.log(style)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlLineStyle = typeof OntoumlLineStyle.Type;

/**
 * OntoUML diagram point.
 *
 * @example
 * ```ts
 * import { OntoumlPoint } from "@beep/ontology"
 *
 * const point = OntoumlPoint.make({ x: 0, y: 0 })
 * console.log(point.x)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OntoumlPoint extends S.Class<OntoumlPoint>($I`OntoumlPoint`)(
  {
    x: OntoumlNullableNumber,
    y: OntoumlNullableNumber,
  },
  $I.annote("OntoumlPoint", {
    description: "Diagram coordinate relative to the top-left corner of an OntoUML diagram.",
  })
) {}

/**
 * Nullable non-empty array of OntoUML diagram points.
 *
 * @example
 * ```ts
 * import { OntoumlPoints } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlPoints)([{ x: 0, y: 0 }]))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlPoints = OntoumlPoint.pipe(
  S.NonEmptyArray,
  S.NullOr,
  $I.annoteSchema("OntoumlPoints", {
    description: "Nullable non-empty list of coordinates used to position an OntoUML diagram element.",
  })
);

/**
 * Runtime type for {@link OntoumlPoints}.
 *
 * @example
 * ```ts
 * import type { OntoumlPoints } from "@beep/ontology"
 *
 * const points: OntoumlPoints = [{ x: 0, y: 0 }]
 * console.log(points)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlPoints = typeof OntoumlPoints.Type;

/**
 * Nullable visibility flags for OntoUML diagram elements.
 *
 * @example
 * ```ts
 * import { OntoumlVisibility } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlVisibility)({ attributes: false }))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlVisibility = S.NullOr(
  S.Record(S.NonEmptyString, S.Boolean).check(
    nonEmptyRecordCheck(
      "OntoumlVisibilityNonEmptyCheck",
      "OntoUML Visibility Non Empty Check",
      "Requires visibility maps to contain at least one flag."
    )
  )
).pipe(
  $I.annoteSchema("OntoumlVisibility", {
    description: "Nullable record of visibility flags for diagram element compartments.",
  })
);

/**
 * Runtime type for {@link OntoumlVisibility}.
 *
 * @example
 * ```ts
 * import type { OntoumlVisibility } from "@beep/ontology"
 *
 * const visibility: OntoumlVisibility = { attributes: false }
 * console.log(visibility)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlVisibility = typeof OntoumlVisibility.Type;

/**
 * Non-null OntoUML background style.
 *
 * @example
 * ```ts
 * import { OntoumlBackgroundObject } from "@beep/ontology"
 *
 * const background = OntoumlBackgroundObject.make({ color: "#fff", transparency: 0 })
 * console.log(background.color)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OntoumlBackgroundObject extends S.Class<OntoumlBackgroundObject>($I`OntoumlBackgroundObject`)(
  {
    color: OntoumlColor,
    transparency: OntoumlNullableNumber,
  },
  $I.annote("OntoumlBackgroundObject", {
    description: "Non-null background style for an OntoUML diagram element.",
  })
) {}

/**
 * Nullable OntoUML background style.
 *
 * @example
 * ```ts
 * import { OntoumlBackground } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlBackground)(null))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlBackground = S.NullOr(OntoumlBackgroundObject).pipe(
  $I.annoteSchema("OntoumlBackground", {
    description: "Nullable background style for an OntoUML diagram element.",
  })
);

/**
 * Runtime type for {@link OntoumlBackground}.
 *
 * @example
 * ```ts
 * import type { OntoumlBackground } from "@beep/ontology"
 *
 * const background: OntoumlBackground = null
 * console.log(background)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlBackground = typeof OntoumlBackground.Type;

/**
 * Non-null OntoUML line style object.
 *
 * @example
 * ```ts
 * import { OntoumlLineObject } from "@beep/ontology"
 *
 * const line = OntoumlLineObject.make({ color: "#000", transparency: 0, weight: 1, style: "solid" })
 * console.log(line.weight)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OntoumlLineObject extends S.Class<OntoumlLineObject>($I`OntoumlLineObject`)(
  {
    color: OntoumlColor,
    transparency: OntoumlNullableNumber,
    weight: OntoumlNullableNumber,
    style: OntoumlLineStyle,
  },
  $I.annote("OntoumlLineObject", {
    description: "Non-null line style for an OntoUML diagram element.",
  })
) {}

/**
 * Nullable OntoUML line style object.
 *
 * @example
 * ```ts
 * import { OntoumlLine } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlLine)(null))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlLine = S.NullOr(OntoumlLineObject).pipe(
  $I.annoteSchema("OntoumlLine", {
    description: "Nullable line style for an OntoUML diagram element.",
  })
);

/**
 * Runtime type for {@link OntoumlLine}.
 *
 * @example
 * ```ts
 * import type { OntoumlLine } from "@beep/ontology"
 *
 * const line: OntoumlLine = null
 * console.log(line)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlLine = typeof OntoumlLine.Type;

/**
 * Non-null OntoUML font style.
 *
 * @example
 * ```ts
 * import { OntoumlFontObject } from "@beep/ontology"
 *
 * const font = OntoumlFontObject.make({ name: "Arial", size: 12, color: "#111" })
 * console.log(font.name)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OntoumlFontObject extends S.Class<OntoumlFontObject>($I`OntoumlFontObject`)(
  {
    name: OntoumlNullableString,
    size: OntoumlNullableNumber,
    color: OntoumlColor,
  },
  $I.annote("OntoumlFontObject", {
    description: "Non-null font style for an OntoUML diagram element.",
  })
) {}

/**
 * Nullable OntoUML font style.
 *
 * @example
 * ```ts
 * import { OntoumlFont } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlFont)(null))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlFont = S.NullOr(OntoumlFontObject).pipe(
  $I.annoteSchema("OntoumlFont", {
    description: "Nullable font style for an OntoUML diagram element.",
  })
);

/**
 * Runtime type for {@link OntoumlFont}.
 *
 * @example
 * ```ts
 * import type { OntoumlFont } from "@beep/ontology"
 *
 * const font: OntoumlFont = null
 * console.log(font)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlFont = typeof OntoumlFont.Type;

/**
 * OntoUML model element property assignments.
 *
 * @example
 * ```ts
 * import { OntoumlPropertyAssignments } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlPropertyAssignments)({ reviewed: true }))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlPropertyAssignments: S.Codec<null | Readonly<Record<string, OntoumlPropertyAssignmentValue>>> =
  S.suspend(() =>
    S.NullOr(S.Record(S.String, OntoumlPropertyAssignmentValue)).pipe(
      $I.annoteSchema("OntoumlPropertyAssignments", {
        description: "Nullable record of OntoUML property assignment values.",
      })
    )
  );

/**
 * Runtime type for {@link OntoumlPropertyAssignments}.
 *
 * @example
 * ```ts
 * import type { OntoumlPropertyAssignments } from "@beep/ontology"
 *
 * const assignments: OntoumlPropertyAssignments = { reviewed: true }
 * console.log(assignments)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlPropertyAssignments = typeof OntoumlPropertyAssignments.Type;

/**
 * OntoUML property assignment array value.
 *
 * @example
 * ```ts
 * import { OntoumlPropertyAssignmentArray } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlPropertyAssignmentArray)(["a", "b"]))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlPropertyAssignmentArray: S.Codec<
  readonly [boolean | number | string | OntoumlReference, ...(boolean | number | string | OntoumlReference)[]]
> = S.suspend(() =>
  S.NonEmptyArray(S.Union([S.Boolean, S.Finite, S.String, OntoumlReference])).check(
    uniqueItemsCheck(
      "OntoumlPropertyAssignmentArrayUniqueItemsCheck",
      "OntoUML Property Assignment Array Unique Items Check",
      "Requires OntoUML property assignment arrays to contain unique JSON values."
    )
  )
).pipe(
  $I.annoteSchema("OntoumlPropertyAssignmentArray", {
    description: "Non-empty unique array of OntoUML property assignment scalar values.",
  })
);

/**
 * Runtime type for {@link OntoumlPropertyAssignmentArray}.
 *
 * @example
 * ```ts
 * import type { OntoumlPropertyAssignmentArray } from "@beep/ontology"
 *
 * const values: OntoumlPropertyAssignmentArray = ["tag"]
 * console.log(values)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlPropertyAssignmentArray = typeof OntoumlPropertyAssignmentArray.Type;

/**
 * OntoUML property assignment value.
 *
 * @example
 * ```ts
 * import { OntoumlPropertyAssignmentValue } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlPropertyAssignmentValue)("tag"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlPropertyAssignmentValue: S.Codec<
  null | boolean | number | string | OntoumlReference | OntoumlPropertyAssignmentArray
> = S.suspend(() =>
  S.Union([S.Null, S.Boolean, S.Finite, S.String, OntoumlReference, OntoumlPropertyAssignmentArray]).pipe(
    $I.annoteSchema("OntoumlPropertyAssignmentValue", {
      description: "Value accepted by an OntoUML property assignment.",
    })
  )
);

/**
 * Runtime type for {@link OntoumlPropertyAssignmentValue}.
 *
 * @example
 * ```ts
 * import type { OntoumlPropertyAssignmentValue } from "@beep/ontology"
 *
 * const value: OntoumlPropertyAssignmentValue = true
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlPropertyAssignmentValue = typeof OntoumlPropertyAssignmentValue.Type;

/**
 * Nullable non-empty OntoUML property list.
 *
 * @example
 * ```ts
 * import { OntoumlProperties } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlProperties)(null))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlProperties = S.suspend(() => OntoumlProperty.pipe(S.NonEmptyArray, S.NullOr)).pipe(
  $I.annoteSchema("OntoumlProperties", {
    description: "Nullable non-empty list of OntoUML properties.",
  })
);

/**
 * Runtime type for {@link OntoumlProperties}.
 *
 * @example
 * ```ts
 * import type { OntoumlProperties } from "@beep/ontology"
 *
 * const properties: OntoumlProperties = null
 * console.log(properties)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlProperties = typeof OntoumlProperties.Type;

/**
 * Nullable non-empty array of OntoUML literals.
 *
 * @example
 * ```ts
 * import { OntoumlLiterals } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlLiterals)(null))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlLiterals = S.suspend(() => OntoumlLiteral.pipe(S.NonEmptyArray, S.NullOr)).pipe(
  $I.annoteSchema("OntoumlLiterals", {
    description: "Nullable non-empty list of literals for OntoUML enumeration classes.",
  })
);

/**
 * Runtime type for {@link OntoumlLiterals}.
 *
 * @example
 * ```ts
 * import type { OntoumlLiterals } from "@beep/ontology"
 *
 * const literals: OntoumlLiterals = null
 * console.log(literals)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlLiterals = typeof OntoumlLiterals.Type;

/**
 * Nullable unique list of OntoUML instance natures.
 *
 * @example
 * ```ts
 * import { OntoumlRestrictedTo } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlRestrictedTo)(["functional-complex"]))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlRestrictedTo = S.NullOr(
  S.NonEmptyArray(S.NonEmptyString).check(
    uniqueItemsCheck(
      "OntoumlRestrictedToUniqueItemsCheck",
      "OntoUML Restricted To Unique Items Check",
      "Requires OntoUML restrictedTo values to be unique."
    )
  )
).pipe(
  $I.annoteSchema("OntoumlRestrictedTo", {
    description: "Nullable unique list of allowed ontological natures for instances of a class.",
  })
);

/**
 * Runtime type for {@link OntoumlRestrictedTo}.
 *
 * @example
 * ```ts
 * import type { OntoumlRestrictedTo } from "@beep/ontology"
 *
 * const restrictedTo: OntoumlRestrictedTo = ["functional-complex"]
 * console.log(restrictedTo)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlRestrictedTo = typeof OntoumlRestrictedTo.Type;

/**
 * OntoUML literal model.
 *
 * @example
 * ```ts
 * import { OntoumlLiteral } from "@beep/ontology"
 *
 * const literal = OntoumlLiteral.make({ type: "Literal", id: "literal-1", name: "Open", description: null, propertyAssignments: null })
 * console.log(literal.id)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OntoumlLiteral extends S.Class<OntoumlLiteral>($I`OntoumlLiteral`)(
  {
    type: S.Literal("Literal"),
    id: OntoumlId,
    name: OntoumlName,
    description: OntoumlDescription,
    propertyAssignments: OntoumlPropertyAssignments,
  },
  $I.annote("OntoumlLiteral", {
    description: "Value defined for an OntoUML enumeration class.",
  })
) {}

/**
 * OntoUML property model.
 *
 * @example
 * ```ts
 * import { OntoumlProperty } from "@beep/ontology"
 *
 * const property = OntoumlProperty.make({
 *   type: "Property",
 *   id: "property-1",
 *   name: "name",
 *   description: null,
 *   cardinality: "1",
 *   stereotype: null,
 *   propertyAssignments: null,
 *   propertyType: null,
 *   subsettedProperties: null,
 *   redefinedProperties: null,
 *   aggregationKind: null,
 *   isDerived: false,
 *   isOrdered: false,
 *   isReadOnly: false
 * })
 * console.log(property.id)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OntoumlProperty extends S.Class<OntoumlProperty>($I`OntoumlProperty`)(
  {
    type: S.Literal("Property"),
    id: OntoumlId,
    name: OntoumlName,
    description: OntoumlDescription,
    cardinality: OntoumlNullableString,
    stereotype: OntoumlStereotype,
    propertyAssignments: OntoumlPropertyAssignments,
    propertyType: OntoumlReference,
    subsettedProperties: S.NullOr(OntoumlUniqueReferenceArray),
    redefinedProperties: S.NullOr(OntoumlUniqueReferenceArray),
    aggregationKind: S.NullOr(OntoumlAggregationKind),
    isDerived: OntoumlNullableBoolean,
    isOrdered: OntoumlNullableBoolean,
    isReadOnly: OntoumlNullableBoolean,
  },
  $I.annote("OntoumlProperty", {
    description: "Property exhibited by instances of OntoUML classes, relations, or derivation relations.",
  })
) {}

type OntoumlPackageShape = {
  readonly type: "Package";
  readonly id: OntoumlId;
  readonly name: OntoumlName;
  readonly description: OntoumlDescription;
  readonly contents: OntoumlPackageContentsShape;
  readonly propertyAssignments: OntoumlPropertyAssignments;
};

type OntoumlPackageContentShape =
  | OntoumlPackageShape
  | OntoumlClass
  | OntoumlRelation
  | OntoumlGeneralization
  | OntoumlGeneralizationSet;

type OntoumlPackageContentsShape = null | readonly [OntoumlPackageContentShape, ...OntoumlPackageContentShape[]];

/**
 * OntoUML package model.
 *
 * @example
 * ```ts
 * import { OntoumlPackage } from "@beep/ontology"
 *
 * const pkg = OntoumlPackage.make({ type: "Package", id: "pkg", name: "Pkg", description: null, contents: null, propertyAssignments: null })
 * console.log(pkg.type)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const OntoumlPackage: S.Codec<OntoumlPackageShape> = S.Struct({
  type: S.Literal("Package"),
  id: OntoumlId,
  name: OntoumlName,
  description: OntoumlDescription,
  contents: S.suspend((): S.Codec<OntoumlPackageContentsShape> => OntoumlPackageContents),
  propertyAssignments: OntoumlPropertyAssignments,
}).pipe(
  $I.annoteSchema("OntoumlPackage", {
    description: "OntoUML package element containing nested model elements.",
  })
) as S.Codec<OntoumlPackageShape>;

/**
 * Runtime type for {@link OntoumlPackage}.
 *
 * @example
 * ```ts
 * import type { OntoumlPackage } from "@beep/ontology"
 *
 * const pkg: OntoumlPackage = {
 *   type: "Package",
 *   id: "pkg",
 *   name: "Pkg",
 *   description: null,
 *   contents: null,
 *   propertyAssignments: null
 * }
 * console.log(pkg.id)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlPackage = typeof OntoumlPackage.Type;

/**
 * OntoUML class model.
 *
 * @example
 * ```ts
 * import { OntoumlClass } from "@beep/ontology"
 *
 * const modelClass = OntoumlClass.make({
 *   type: "Class",
 *   id: "class-1",
 *   name: "Person",
 *   description: null,
 *   stereotype: "kind",
 *   properties: null,
 *   propertyAssignments: null,
 *   literals: null,
 *   isAbstract: false,
 *   isDerived: false,
 *   isExtensional: null,
 *   isPowertype: null,
 *   order: null,
 *   restrictedTo: null
 * })
 * console.log(modelClass.name)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OntoumlClass extends S.Class<OntoumlClass>($I`OntoumlClass`)(
  {
    type: S.Literal("Class"),
    id: OntoumlId,
    name: OntoumlName,
    description: OntoumlDescription,
    stereotype: OntoumlStereotype,
    properties: OntoumlProperties,
    propertyAssignments: OntoumlPropertyAssignments,
    literals: OntoumlLiterals,
    isAbstract: OntoumlNullableBoolean,
    isDerived: OntoumlNullableBoolean,
    isExtensional: OntoumlNullableBoolean,
    isPowertype: OntoumlNullableBoolean,
    order: OntoumlNullableString,
    restrictedTo: OntoumlRestrictedTo,
  },
  $I.annote("OntoumlClass", {
    description: "OntoUML class element with stereotypes, properties, literals, and class meta-properties.",
  })
) {}

/**
 * OntoUML relation model.
 *
 * @example
 * ```ts
 * import { OntoumlRelation } from "@beep/ontology"
 *
 * const relation = OntoumlRelation.make({
 *   type: "Relation",
 *   id: "relation-1",
 *   name: "worksFor",
 *   description: null,
 *   stereotype: "material",
 *   properties: null,
 *   propertyAssignments: null,
 *   isAbstract: false,
 *   isDerived: false
 * })
 * console.log(relation.id)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OntoumlRelation extends S.Class<OntoumlRelation>($I`OntoumlRelation`)(
  {
    type: S.Literal("Relation"),
    id: OntoumlId,
    name: OntoumlName,
    description: OntoumlDescription,
    stereotype: OntoumlStereotype,
    properties: OntoumlProperties,
    propertyAssignments: OntoumlPropertyAssignments,
    isAbstract: OntoumlNullableBoolean,
    isDerived: OntoumlNullableBoolean,
  },
  $I.annote("OntoumlRelation", {
    description: "OntoUML relation element with ordered relation-end properties.",
  })
) {}

/**
 * OntoUML generalization model.
 *
 * @example
 * ```ts
 * import { OntoumlGeneralization } from "@beep/ontology"
 *
 * const generalization = OntoumlGeneralization.make({
 *   type: "Generalization",
 *   id: "gen-1",
 *   name: null,
 *   description: null,
 *   general: { type: "Class", id: "parent" },
 *   specific: { type: "Class", id: "child" },
 *   propertyAssignments: null
 * })
 * console.log(generalization.id)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OntoumlGeneralization extends S.Class<OntoumlGeneralization>($I`OntoumlGeneralization`)(
  {
    type: S.Literal("Generalization"),
    id: OntoumlId,
    name: OntoumlName,
    description: OntoumlDescription,
    general: OntoumlReference,
    specific: OntoumlReference,
    propertyAssignments: OntoumlPropertyAssignments,
  },
  $I.annote("OntoumlGeneralization", {
    description: "OntoUML generalization relation between a general and specific model element.",
  })
) {}

/**
 * Nullable non-empty generalization reference list.
 *
 * @example
 * ```ts
 * import { OntoumlGeneralizationReferences } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlGeneralizationReferences)(null))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlGeneralizationReferences = OntoumlReference.pipe(
  S.NonEmptyArray,
  S.NullOr,
  $I.annoteSchema("OntoumlGeneralizationReferences", {
    description: "Nullable non-empty array of references to OntoUML generalizations.",
  })
);

/**
 * Runtime type for {@link OntoumlGeneralizationReferences}.
 *
 * @example
 * ```ts
 * import type { OntoumlGeneralizationReferences } from "@beep/ontology"
 *
 * const references: OntoumlGeneralizationReferences = null
 * console.log(references)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlGeneralizationReferences = typeof OntoumlGeneralizationReferences.Type;

/**
 * OntoUML generalization set model.
 *
 * @example
 * ```ts
 * import { OntoumlGeneralizationSet } from "@beep/ontology"
 *
 * const set = OntoumlGeneralizationSet.make({
 *   type: "GeneralizationSet",
 *   id: "gs-1",
 *   name: null,
 *   description: null,
 *   isDisjoint: true,
 *   isComplete: false,
 *   categorizer: null,
 *   generalizations: null,
 *   propertyAssignments: null
 * })
 * console.log(set.id)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OntoumlGeneralizationSet extends S.Class<OntoumlGeneralizationSet>($I`OntoumlGeneralizationSet`)(
  {
    type: S.Literal("GeneralizationSet"),
    id: OntoumlId,
    name: OntoumlName,
    description: OntoumlDescription,
    isDisjoint: OntoumlNullableBoolean,
    isComplete: OntoumlNullableBoolean,
    categorizer: OntoumlReference,
    generalizations: OntoumlGeneralizationReferences,
    propertyAssignments: OntoumlPropertyAssignments,
  },
  $I.annote("OntoumlGeneralizationSet", {
    description: "OntoUML generalization set with disjointness, completeness, and optional categorizer.",
  })
) {}

/**
 * OntoUML package content union.
 *
 * @example
 * ```ts
 * import { OntoumlPackageContent } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlPackageContent)({ type: "Package", id: "pkg", name: "Pkg", description: null, contents: null, propertyAssignments: null }))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlPackageContent: S.Codec<OntoumlPackageContentShape> = S.Union([
  OntoumlPackage,
  OntoumlClass,
  OntoumlRelation,
  OntoumlGeneralization,
  OntoumlGeneralizationSet,
]).pipe(
  $I.annoteSchema("OntoumlPackageContent", {
    description: "Union of OntoUML model elements that may appear inside a package.",
  })
) as S.Codec<OntoumlPackageContentShape>;

/**
 * Runtime type for {@link OntoumlPackageContent}.
 *
 * @example
 * ```ts
 * import type { OntoumlPackageContent } from "@beep/ontology"
 *
 * const content: OntoumlPackageContent = { type: "Package", id: "pkg", name: "Pkg", description: null, contents: null, propertyAssignments: null }
 * console.log(content.type)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlPackageContent = typeof OntoumlPackageContent.Type;

/**
 * Nullable non-empty unique package contents.
 *
 * @example
 * ```ts
 * import { OntoumlPackageContents } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlPackageContents)(null))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlPackageContents: S.Codec<OntoumlPackageContentsShape> = OntoumlPackageContent.pipe(S.NonEmptyArray)
  .check(
    uniqueItemsCheck(
      "OntoumlPackageContentsUniqueItemsCheck",
      "OntoUML Package Contents Unique Items Check",
      "Requires package contents to contain unique JSON values."
    )
  )
  .pipe(
    S.NullOr,
    $I.annoteSchema("OntoumlPackageContents", {
      description: "Nullable non-empty unique array of OntoUML package contents.",
    })
  ) as S.Codec<OntoumlPackageContentsShape>;

/**
 * Runtime type for {@link OntoumlPackageContents}.
 *
 * @example
 * ```ts
 * import type { OntoumlPackageContents } from "@beep/ontology"
 *
 * const contents: OntoumlPackageContents = null
 * console.log(contents)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlPackageContents = typeof OntoumlPackageContents.Type;

type OntoumlDiagramElementShape = {
  readonly type: OntoumlDiagramElementType;
  readonly id: OntoumlId;
  readonly source: OntoumlReference;
  readonly field: OntoumlNullableString;
  readonly points: OntoumlPoints;
  readonly font: OntoumlFont;
  readonly line: OntoumlLine;
  readonly background: OntoumlBackground;
  readonly visibility: OntoumlVisibility;
  readonly elements: null | readonly [OntoumlDiagramElementShape, ...OntoumlDiagramElementShape[]];
  readonly [key: string]: unknown;
};

/**
 * OntoUML diagram element model.
 *
 * @example
 * ```ts
 * import { OntoumlDiagramElement } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlDiagramElement)({
 *   type: "Shape",
 *   id: "shape-1",
 *   source: { type: "Class", id: "class-1" },
 *   field: null,
 *   points: [{ x: 0, y: 0 }],
 *   font: null,
 *   line: null,
 *   background: null,
 *   visibility: null,
 *   elements: null
 * }))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlDiagramElement: S.Codec<OntoumlDiagramElementShape> = S.StructWithRest(
  S.Struct({
    type: OntoumlDiagramElementType,
    id: OntoumlId,
    source: OntoumlReference,
    field: OntoumlNullableString,
    points: OntoumlPoints,
    font: OntoumlFont,
    line: OntoumlLine,
    background: OntoumlBackground,
    visibility: OntoumlVisibility,
    elements: S.suspend(() =>
      OntoumlDiagramElement.pipe(S.NonEmptyArray)
        .check(
          uniqueItemsCheck(
            "OntoumlDiagramElementChildrenUniqueItemsCheck",
            "OntoUML Diagram Element Children Unique Items Check",
            "Requires nested OntoUML diagram elements to contain unique JSON values."
          )
        )
        .pipe(S.NullOr)
    ),
  }),
  [S.Record(S.String, S.Unknown)]
).pipe(
  $I.annoteSchema("OntoumlDiagramElement", {
    description: "Diagram element representing a shape, line, or label in an OntoUML diagram.",
  })
) as S.Codec<OntoumlDiagramElementShape>;

/**
 * Runtime type for {@link OntoumlDiagramElement}.
 *
 * @example
 * ```ts
 * import type { OntoumlDiagramElement } from "@beep/ontology"
 *
 * const element: OntoumlDiagramElement = {
 *   type: "Label",
 *   id: "label-1",
 *   source: null,
 *   field: "name",
 *   points: null,
 *   font: null,
 *   line: null,
 *   background: null,
 *   visibility: null,
 *   elements: null
 * }
 * console.log(element.type)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlDiagramElement = typeof OntoumlDiagramElement.Type;

/**
 * Nullable non-empty unique diagram contents.
 *
 * @example
 * ```ts
 * import { OntoumlDiagramContents } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlDiagramContents)(null))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlDiagramContents = S.NullOr(
  S.NonEmptyArray(OntoumlDiagramElement).check(
    uniqueItemsCheck(
      "OntoumlDiagramContentsUniqueItemsCheck",
      "OntoUML Diagram Contents Unique Items Check",
      "Requires diagram contents to contain unique JSON values."
    )
  )
).pipe(
  $I.annoteSchema("OntoumlDiagramContents", {
    description: "Nullable non-empty unique array of OntoUML diagram elements.",
  })
);

/**
 * Runtime type for {@link OntoumlDiagramContents}.
 *
 * @example
 * ```ts
 * import type { OntoumlDiagramContents } from "@beep/ontology"
 *
 * const contents: OntoumlDiagramContents = null
 * console.log(contents)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlDiagramContents = typeof OntoumlDiagramContents.Type;

/**
 * OntoUML diagram model.
 *
 * @example
 * ```ts
 * import { OntoumlDiagram } from "@beep/ontology"
 *
 * const diagram = OntoumlDiagram.make({ type: "Diagram", id: "diagram-1", name: "Main", description: null, owner: null, contents: null })
 * console.log(diagram.id)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OntoumlDiagram extends S.Class<OntoumlDiagram>($I`OntoumlDiagram`)(
  {
    type: S.Literal("Diagram"),
    id: OntoumlId,
    name: OntoumlName,
    description: OntoumlDescription,
    owner: OntoumlReference,
    contents: OntoumlDiagramContents,
  },
  $I.annote("OntoumlDiagram", {
    description: "OntoUML diagram that depicts elements from the model.",
  })
) {}

/**
 * Nullable non-empty array of OntoUML diagrams.
 *
 * @example
 * ```ts
 * import { OntoumlDiagrams } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(OntoumlDiagrams)(null))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OntoumlDiagrams = OntoumlDiagram.pipe(
  S.NonEmptyArray,
  S.NullOr,
  $I.annoteSchema("OntoumlDiagrams", {
    description: "Nullable non-empty array of OntoUML diagrams contained by a project.",
  })
);

/**
 * Runtime type for {@link OntoumlDiagrams}.
 *
 * @example
 * ```ts
 * import type { OntoumlDiagrams } from "@beep/ontology"
 *
 * const diagrams: OntoumlDiagrams = null
 * console.log(diagrams)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OntoumlDiagrams = typeof OntoumlDiagrams.Type;

/**
 * OntoUML project model.
 *
 * @example
 * ```ts
 * import { OntoumlProject } from "@beep/ontology"
 *
 * const project = OntoumlProject.make({
 *   type: "Project",
 *   id: "project-1",
 *   name: "Example",
 *   description: null,
 *   model: { type: "Package", id: "model", name: "Model", description: null, contents: null, propertyAssignments: null },
 *   diagrams: null
 * })
 * console.log(project.type)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OntoumlProject extends S.Class<OntoumlProject>($I`OntoumlProject`)(
  {
    type: S.Literal("Project"),
    id: OntoumlId,
    name: OntoumlName,
    description: OntoumlDescription,
    model: OntoumlPackage,
    diagrams: OntoumlDiagrams,
  },
  $I.annote("OntoumlProject", {
    description: "Project of an ontology in OntoUML 2, including model and optional diagram data.",
  })
) {}

/**
 * Guard for OntoUML projects.
 *
 * @example
 * ```ts
 * import { isOntoumlProject } from "@beep/ontology"
 *
 * console.log(isOntoumlProject({ type: "Project" }))
 * ```
 *
 * @category guards
 * @since 0.0.0
 */
export const isOntoumlProject = S.is(OntoumlProject);
