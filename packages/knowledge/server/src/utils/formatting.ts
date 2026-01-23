/**
 * Formatting utilities for entity text representation
 *
 * @module knowledge-server/utils/formatting
 * @since 0.1.0
 */
import type { AssembledEntity } from "../Extraction/GraphAssembler";
import { extractLocalName } from "../Ontology/constants";

/**
 * Format entity for embedding text
 *
 * Creates a natural language description suitable for embedding.
 *
 * @param entity - The assembled entity to format
 * @returns Formatted string representation for embedding
 *
 * @since 0.1.0
 * @category formatting
 */
export const formatEntityForEmbedding = (entity: AssembledEntity): string => {
  const name = entity.canonicalName ?? entity.mention;
  const typeLabel = extractLocalName(entity.primaryType);
  return `${name} is a ${typeLabel}`;
};
