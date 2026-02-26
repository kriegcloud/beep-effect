/**
 * Primary key scalar type definitions for ontology object types.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/PrimaryKeyTypes
 */
import { $OntologyId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $OntologyId.create("ontology/PrimaryKeyTypes");

/**
 * Allowed scalar wire types for ontology object primary keys.
 *
 * @since 0.0.0
 * @category schemas
 */
export const PrimaryKeyType = LiteralKit([
  "string",
  "datetime",
  "double",
  "integer",
  "timestamp",
  "short",
  "long",
  "byte",
]).annotate(
  $I.annote("PrimaryKeyType", {
    description: "The supported scalar wire property types that may be used as an ontology object primary key.",
  })
);

/**
 * Type for {@link PrimaryKeyType}.
 *
 * @since 0.0.0
 * @category models
 */
export type PrimaryKeyType = typeof PrimaryKeyType.Type;
