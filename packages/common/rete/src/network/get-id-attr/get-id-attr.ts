// NOTE: The generic type T is our TSchema type. MatchT is the map of bindings

import type { $Schema, IdAttr, InternalFactRepresentation } from "@beep/rete/network/types";

export const getIdAttr = <TSchema extends $Schema>(fact: InternalFactRepresentation<TSchema>): IdAttr<TSchema> => {
  // fact is already typed as [FactId.Type, keyof TSchema, _]
  return [fact[0], fact[1]];
};

export default getIdAttr;
