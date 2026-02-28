/**
 * Unified formatting rule union for ontology property value presentation.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/valueFormatting/PropertyValueFormattingRule
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { PropertyBooleanFormattingRule } from "./PropertyBooleanFormattingRule.js";
import {
  PropertyDateFormattingRule,
  PropertyTimestampFormattingRule,
} from "./PropertyDateAndTimestampFormattingRule.js";
import { PropertyKnownTypeFormattingRule } from "./PropertyKnownTypeFormattingRule.js";
import { PropertyNumberFormattingRule } from "./PropertyNumberFormattingRule.js";

const $I = $OntologyId.create("ontology/valueFormatting/PropertyValueFormattingRule");

/**
 * Formatting configuration union for ontology property values.
 *
 * @since 0.0.0
 * @category schemas
 */
export const PropertyValueFormattingRule = S.Union([
  PropertyNumberFormattingRule,
  PropertyTimestampFormattingRule,
  PropertyDateFormattingRule,
  PropertyBooleanFormattingRule,
  PropertyKnownTypeFormattingRule,
]).pipe(
  S.toTaggedUnion("type"),
  S.annotate(
    $I.annote("PropertyValueFormattingRule", {
      description: "Tagged union of all supported ontology property value formatting rule schemas.",
    })
  )
);

/**
 * Type for {@link PropertyValueFormattingRule}.
 *
 * @since 0.0.0
 * @category models
 */
export type PropertyValueFormattingRule = typeof PropertyValueFormattingRule.Type;
