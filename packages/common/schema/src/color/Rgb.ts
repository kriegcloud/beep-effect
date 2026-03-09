import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("color/OklchColor");

export class Rgb extends S.Class<Rgb>($I`Rgb`)(
  {
    r: S.Number,
    g: S.Number,
    b: S.Number,
  },
  $I.annote("Rgb", {
    description: "A color in RGB space",
  })
) {

}
