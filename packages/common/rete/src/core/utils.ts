import type { InternalFactRepresentation } from "@beep/rete/network";
import * as Struct from "effect/Struct";
import type { InsertBeepFact } from "./types";

export const insertFactToFact = <SCHEMA extends object>(
  insertion: InsertBeepFact<SCHEMA>
): InternalFactRepresentation<SCHEMA> => {
  // @ts-expect-error
  return Struct.keys(insertion).flatMap((id) =>
    Struct.keys(insertion[id]!).map((attr) => {
      const val = insertion[id]![attr]!;
      return [id, attr, val] as [string, string, any];
    })
  );
};
