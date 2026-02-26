/**
 * Primary key scalar type definitions for ontology object types.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/PrimaryKeyTypes
 */
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("ontology/PrimaryKeyTypes");

/**
 * Allowed scalar wire types for ontology object primary keys.
 *
 * @since 0.0.0
 * @category schemas
 */
export const PrimaryKeyTypes = S.Union([
  S.Literal("string"),
  S.Literal("datetime"),
  S.Literal("double"),
  S.Literal("integer"),
  S.Literal("timestamp"),
  S.Literal("short"),
  S.Literal("long"),
  S.Literal("byte"),
]).pipe(
  S.annotate(
    $I.annote("PrimaryKeyTypes", {
      description: "Supported scalar wire types used by ontology object primary keys.",
    })
  )
);

/**
 * Type for {@link PrimaryKeyTypes}.
 *
 * @since 0.0.0
 * @category models
 */
export type PrimaryKeyTypes = typeof PrimaryKeyTypes.Type;

/**
 * Compatibility alias for {@link PrimaryKeyTypes}.
 *
 * @since 0.0.0
 * @category schemas
 */
export const PrimaryKeyType = PrimaryKeyTypes;

/**
 * Compatibility alias type for {@link PrimaryKeyTypes}.
 *
 * @since 0.0.0
 * @category models
 */
export type PrimaryKeyType = PrimaryKeyTypes;
