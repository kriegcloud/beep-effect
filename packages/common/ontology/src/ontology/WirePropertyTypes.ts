/**
 * Wire-level property type identifiers for ontology properties.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/WirePropertyTypes
 */
import { $OntologyId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $OntologyId.create("ontology/WirePropertyTypes");

/**
 * Base wire property type identifiers supported by the ontology API.
 *
 * @since 0.0.0
 * @category schemas
 */
export const WirePropertyType = LiteralKit([
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
  $I.annote("WirePropertyType", {
    description:
      "Union of supported ontology wire property type identifiers used in property metadata and wire payloads.",
  })
);

/**
 * Type for {@link WirePropertyType}.
 *
 * @since 0.0.0
 * @category models
 */
export type WirePropertyType = typeof WirePropertyType.Type;
