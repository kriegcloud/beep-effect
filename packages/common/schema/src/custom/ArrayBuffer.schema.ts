import * as S from "effect/Schema";
import { CustomId } from "./_id";

const Id = CustomId.compose("arrayBuffer");
export class ArrBuffer extends S.instanceOf(ArrayBuffer).annotations(
  Id.annotations("ArrayBuffer", {
    description: "An Array Buffer",
  })
) {
  static readonly is = S.is(this);
}

export declare namespace ArrBuffer {
  export type Type = S.Schema.Type<typeof ArrBuffer>;
  export type Encoded = S.Schema.Encoded<typeof ArrBuffer>;
}
