import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";


const $I = $SchemaId.create("color/HexColor");

export const HexColor = S.TemplateLiteral(
  [
    "#",
    S.String.check(S.isPattern(/^[0-9a-fA-F]{6}$/))
  ]
).pipe(
  $I.annoteSchema("HexColor", {
    description: "A 6-digit hex color string",
    examples: ["#000000", "#FFFFFF"],
  })
)


export type HexColor = typeof HexColor.Type;
