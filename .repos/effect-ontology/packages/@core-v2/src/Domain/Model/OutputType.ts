/**
 * Domain Model: Output Type
 *
 * Defines the types of artifacts that can be saved from an extraction run.
 * Each output type maps to a specific filename and content format.
 *
 * @since 2.0.0
 * @module Domain/Model/OutputType
 */

import { Schema } from "effect"

/**
 * Output Type - Union of all supported artifact types
 *
 * @since 2.0.0
 * @category Domain
 */
export const OutputTypeSchema = Schema.Union(
  Schema.Literal("knowledge-graph"),
  Schema.Literal("entity-resolution-graph"),
  Schema.Literal("rdf-turtle"),
  Schema.Literal("mermaid-diagram"),
  Schema.Literal("metadata"),
  Schema.Literal("entities"),
  Schema.Literal("relations")
)

/**
 * Output Type type
 */
export type OutputType = Schema.Schema.Type<typeof OutputTypeSchema>

/**
 * Output Type Registry
 *
 * Maps output types to their filenames and descriptions.
 *
 * @since 2.0.0
 */
export const OutputTypeRegistry = {
  "knowledge-graph": {
    filename: "knowledge-graph.json",
    description: "Extracted entities and relations in JSON format"
  },
  "entity-resolution-graph": {
    filename: "entity-resolution-graph.json",
    description: "Entity resolution graph with canonical mappings and stats"
  },
  "rdf-turtle": {
    filename: "graph.ttl",
    description: "RDF graph serialized as Turtle"
  },
  "mermaid-diagram": {
    filename: "erg-diagram.md",
    description: "Mermaid diagram visualization of entity resolution graph"
  },
  "metadata": {
    filename: "metadata.json",
    description: "Output metadata with hashes, sizes, and types"
  },
  "entities": {
    filename: "entities.json",
    description: "Extracted entities in JSON format"
  },
  "relations": {
    filename: "relations.json",
    description: "Extracted relations in JSON format"
  }
} as const

/**
 * Get filename for output type
 *
 * @param type - Output type
 * @returns Filename for the output type
 *
 * @example
 * ```typescript
 * const filename = getOutputFilename("knowledge-graph")
 * // => "knowledge-graph.json"
 * ```
 *
 * @since 2.0.0
 */
export const getOutputFilename = (type: OutputType): string => {
  return OutputTypeRegistry[type].filename
}

/**
 * Get description for output type
 *
 * @param type - Output type
 * @returns Description of the output type
 *
 * @since 2.0.0
 */
export const getOutputDescription = (type: OutputType): string => {
  return OutputTypeRegistry[type].description
}
