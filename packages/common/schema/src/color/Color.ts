import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("color/Color");

export const Hex =
  S.flip(S.TemplateLiteralParser(["#", S.String.check(S.isPattern(/^[0-9a-fA-F]{6}$/))])).pipe(
    $I.annoteSchema("HexColor", {
      description: "A 6-digit hex color string",
      examples: ["#000000", "#FFFFFF"],
    })
  )

export type Hex = typeof Hex.Type;

export declare namespace Hex {
  export type Encoded = typeof Hex.Encoded;
}

export class Oklch extends S.Class<Oklch>($I`Oklch`)(
  {
    l: S.Number.check(
      S.isBetween({
        minimum: 0,
        maximum: 1,
      })
    ).annotateKey({
      description: "Lightness 0-1",
    }),
    c: S.Number.check(
      S.isBetween({
        minimum: 0,
        maximum: 0.4, // ? not sure what the correct value should be.
      })
    ).annotateKey({
      description: "Chroma 0-0.4+",
    }),
    h: S.Number.check(
      S.isBetween({
        minimum: 0,
        maximum: 360,
      })
    ),
  },
  $I.annote("Oklch", {
    description: "A color in Oklch space",
  })
) {}

export class Rgb extends S.Class<Rgb>($I`Rgb`)(
  {
    r: S.Number, // TODO(ben): figure out invariants
    g: S.Number, // TODO(ben): figure out invariants
    b: S.Number, // TODO(ben): figure out invariants
  },
  $I.annote("Rgb", {
    description: "A color in RGB space",
  })
) {

}


