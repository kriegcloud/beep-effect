import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $SchemaId.create("primitives/buffer");

export class CustomBuffer extends S.instanceOf(Buffer).annotations(
  $I.annotations("CustomBuffer", {
    description: "A Buffer",
  })
) {}

export declare namespace CustomBuffer {
  export type Type = S.Schema.Type<typeof CustomBuffer>;
  export type Encoded = S.Schema.Encoded<typeof CustomBuffer>;
}
