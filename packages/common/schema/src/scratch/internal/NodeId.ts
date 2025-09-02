import { BrandedUUID } from "@beep/schema/custom";
import type * as B from "effect/Brand";
import * as S from "effect/Schema";
import { v4 as uuid } from "uuid";
export const NodeId = BrandedUUID("NodeId").pipe(
  S.optional,
  S.withDefaults({
    decoding: () => uuid() as B.Branded<string, "NodeId">,
    constructor: () => uuid() as B.Branded<string, "NodeId">,
  })
);

export namespace NodeId {
  export type Type = S.Schema.Type<typeof NodeId>;
  export type Encoded = S.Schema.Encoded<typeof NodeId>;
  export type Brand = B.Branded<string, "NodeId">;
}
