import { $SchemaId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const $I = $SchemaId.create("primitives/effect");

export class EffectFromSelf extends S.declare(Effect.isEffect).annotations(
  $I.annotations("EffectFromSelf", {
    description: "A schema for an effect",
  })
) {}

export declare namespace EffectFromSelf {
  export type Type = typeof EffectFromSelf.Type;
}
