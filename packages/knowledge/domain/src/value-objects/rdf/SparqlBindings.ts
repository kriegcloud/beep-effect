/**
 * SPARQL Bindings value objects
 *
 * Data structures for SPARQL query results following the W3C SPARQL
 * Results format specification.
 *
 * @module knowledge-domain/value-objects/rdf/SparqlBindings
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

import { Term } from "./Quad";

const $I = $KnowledgeDomainId.create("value-objects/rdf/SparqlBindings");

/**
 * VariableName - SPARQL variable name (without ? prefix)
 *
 * @since 0.1.0
 * @category value-objects
 */
export const VariableName = S.NonEmptyTrimmedString.annotations(
  $I.annotations("VariableName", {
    title: "Variable Name",
    description: "SPARQL variable name (without ? prefix)",
  })
);

export type VariableName = typeof VariableName.Type;

/**
 * SparqlBinding - A single variable binding
 *
 * Maps a variable name to its bound RDF term value.
 *
 * @since 0.1.0
 * @category value-objects
 */
export class SparqlBinding extends S.Class<SparqlBinding>($I`SparqlBinding`)({
  /**
   * Variable name (without ? prefix)
   */
  name: VariableName.annotations({
    title: "Name",
    description: "Variable name (without ? prefix)",
  }),

  /**
   * Bound RDF term value
   */
  value: Term.annotations({
    title: "Value",
    description: "Bound RDF term value",
  }),
}) {}

/**
 * SparqlRow - A single result row (array of bindings)
 *
 * Represents one solution from a SPARQL SELECT query, containing
 * bindings for each projected variable.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const SparqlRow = S.Array(SparqlBinding).annotations(
  $I.annotations("SparqlRow", {
    title: "SPARQL Row",
    description: "Single result row with variable bindings",
  })
);

export type SparqlRow = typeof SparqlRow.Type;

/**
 * SparqlBindings - Complete SPARQL query result set
 *
 * Contains the column names (projected variables) and rows of bindings.
 * Follows the W3C SPARQL Results format structure.
 *
 * @since 0.1.0
 * @category value-objects
 */
export class SparqlBindings extends S.Class<SparqlBindings>($I`SparqlBindings`)({
  /**
   * Projected variable names (column headers)
   */
  columns: S.Array(VariableName).annotations({
    title: "Columns",
    description: "Projected variable names (column headers)",
  }),

  /**
   * Result rows (array of binding arrays)
   */
  rows: S.Array(SparqlRow).annotations({
    title: "Rows",
    description: "Result rows with variable bindings",
  }),
}) {}

/**
 * Creates an empty SparqlBindings with specified columns.
 *
 * @since 0.1.0
 * @category value-objects
 */
export const emptySparqlBindings = (columns: ReadonlyArray<VariableName>): SparqlBindings =>
  new SparqlBindings({ columns: [...columns], rows: [] });
