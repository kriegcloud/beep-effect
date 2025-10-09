import type { $Schema, FactId, Session } from "../../network/types";
import { hashIdAttr } from "../utils";

const retrieveFactValueByIdAttr = <TSchema extends $Schema, T extends keyof TSchema, X extends TSchema[T]>(
  session: Session<TSchema>,
  id: FactId.Type,
  attr: T
): X | undefined => {
  const hashed = hashIdAttr([id, attr.toString()]);
  const nodes = session.idAttrNodes.get(hashed);
  if (nodes === undefined) return;
  const alphaNodes = nodes.alphaNodes;
  for (const node of alphaNodes) {
    const result = node.facts.get(id.toString())?.get(attr.toString());
    if (result !== undefined) return result[2];
  }
  return undefined;
};

export default retrieveFactValueByIdAttr;
