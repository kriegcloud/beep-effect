import { EffectSchema, type EffectSchema as EffectSchemaType } from "@beep/schema/EffectSchema";
import { Effect, pipe } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

describe("EffectSchema", () => {
  it("preserves the effect schema surface", () => {
    expect<EffectSchemaType>().type.toBe<Effect.Effect<unknown, unknown, unknown>>();
    expect<typeof EffectSchema.Type>().type.toBe<EffectSchemaType>();
    expect<typeof EffectSchema.Encoded>().type.toBe<Effect.Effect<unknown, unknown, unknown>>();
  });

  it("exposes decode and encode helpers with the expected effect types", () => {
    const decode = S.decodeUnknownEffect(EffectSchema);
    const encode = S.encodeEffect(EffectSchema);
    const value = Effect.succeed("done");
    const decoded = pipe(value, decode);
    const encoded = pipe(value, encode);

    expect(decoded).type.toBe<Effect.Effect<EffectSchemaType, S.SchemaError, never>>();
    expect(encoded).type.toBe<Effect.Effect<Effect.Effect<unknown, unknown, unknown>, S.SchemaError, never>>();
  });
});
