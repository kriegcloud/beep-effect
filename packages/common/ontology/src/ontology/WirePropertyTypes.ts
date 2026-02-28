/**
 * Wire-level property type identifiers for ontology properties.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/WirePropertyTypes
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import {LiteralKit} from "@beep/schema";

const $I = $OntologyId.create("ontology/WirePropertyTypes");

/**
 * Base wire property type identifiers supported by the ontology API.
 *
 * @since 0.0.0
 * @category schemas
 */
export const BaseWirePropertyTypes = LiteralKit([
  "string",
  "datetime",
  "double",
  "boolean",
  "integer",
  "timestamp",
  "short",
  "long",
  "float",
  "decimal",
  "byte",
  "marking",
  "mediaReference",
  "numericTimeseries",
  "stringTimeseries",
  "sensorTimeseries",
  "attachment",
  "geopoint",
  "geoshape",
  "geotimeSeriesReference",
  "vector",
]).annotate(
    $I.annote("BaseWirePropertyTypes", {
      description: "Union of scalar and complex ontology wire property type identifiers.",
    })
  )

/**
 * Type for {@link BaseWirePropertyTypes}.
 *
 * @since 0.0.0
 * @category models
 */
export type BaseWirePropertyTypes = typeof BaseWirePropertyTypes.Type;

/**
 * Ontology wire property type: either a base type or a map from key to base type.
 *
 * @since 0.0.0
 * @category schemas
 */
export const WirePropertyTypes = S.Union([BaseWirePropertyTypes, S.Record(S.String, BaseWirePropertyTypes)]).pipe(
  S.annotate(
    $I.annote("WirePropertyTypes", {
      description: "Wire property type union supporting scalar type literals or keyed nested base type maps.",
    })
  )
);

/**
 * Type for {@link WirePropertyTypes}.
 *
 * @since 0.0.0
 * @category models
 */
export type WirePropertyTypes = typeof WirePropertyTypes.Type;

/**
 * Compatibility alias for {@link BaseWirePropertyTypes}.
 *
 * @since 0.0.0
 * @category schemas
 */
export const WirePropertyType = BaseWirePropertyTypes;

/**
 * Compatibility alias type for {@link BaseWirePropertyTypes}.
 *
 * @since 0.0.0
 * @category models
 */
export type WirePropertyType = BaseWirePropertyTypes;
