import type { $Schema, InternalFactRepresentation } from "@beep/rete/network";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as Struct from "effect/Struct";
import type { InsertBeepFact } from "./types";
export const insertFactToFact = <TSchema extends $Schema>(
  insertion: InsertBeepFact<TSchema>
): ReadonlyArray<InternalFactRepresentation<TSchema>> => {
  const ids = Struct.keys(insertion);
  return A.flatMap(ids, (id) => {
    const attrs = O.fromNullable(insertion[id]).pipe(O.getOrThrow);
    return A.map(Struct.keys(attrs), (attr) => {
      const a = attr;
      const val = attrs[a];
      return [id, a, val];
    });
  });
};
