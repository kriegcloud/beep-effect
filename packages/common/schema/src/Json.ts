/**
 * A module containing effect schema's for json data types
 *
 * @module @beep/schema/Json
 * @since 0.0.0
 */
import {$SchemaId} from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("Json");

/**
 * A Schema for a Json Object
 *
 * @category Validation
 * @since 0.0.0
 */
export const JsonObject = S.Record(
  S.String,
  S.Json
)
  .pipe(
    $I.annoteSchema(
      "JsonObject",
      {
        description: "A Json Object"
      }
    )
  );

/**
 * Type of {@link JsonObject} {@inheritDoc JsonObject}
 *
 * @category Validation
 * @since 0.0.0
 */
export type JsonObject = typeof JsonObject.Type;


/**
 * A Schema for a Json Array
 *
 * @category Validation
 * @since 0.0.0
 */
export const JsonArray = S.Array(S.Json)
  .pipe(
    $I.annoteSchema(
      "JsonArray",
      {
        description: "A Json Array"
      }
    )
  );

/**
 * Type of {@link JsonArray} {@inheritDoc JsonArray}
 *
 * @category Validation
 * @since 0.0.0
 */
export type JsonArray = typeof JsonArray.Type;
