// NOTE: The generic type T is our TSchema type. MatchT is the map of bindings

import type { IdAttr, InternalFactRepresentation } from "@beep/rete/network/types";

export const getIdAttr = <TSchema extends object>(fact: InternalFactRepresentation<TSchema>): IdAttr<TSchema> => {
  // TODO: Good way to assert that fact[1] is actually keyof T at compile time?
  return [fact[0]!, fact[1]! as keyof TSchema];
};

export default getIdAttr;
