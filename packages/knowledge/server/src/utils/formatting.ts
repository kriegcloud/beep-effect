import type { AssembledEntity } from "../Extraction/GraphAssembler";
import { extractLocalName } from "../Ontology/constants";

export const formatEntityForEmbedding = (entity: AssembledEntity): string => {
  const name = entity.canonicalName ?? entity.mention;
  const typeLabel = extractLocalName(entity.primaryType);
  return `${name} is a ${typeLabel}`;
};
