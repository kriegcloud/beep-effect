import { $SchemaId } from "@beep/identity";

import * as S from "effect/Schema";

const $I = $SchemaId.create("color/OklchColor");

export class OklchColor extends S.Class<OklchColor>($I`OklchColor`)(
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
        maximum: 0.4, // ?
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
  $I.annote("OklchColor", {
    description: "A color in Oklch space",
  })
) {}


