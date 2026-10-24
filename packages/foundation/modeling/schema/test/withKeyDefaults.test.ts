import { ArrayKeyDefaultEmpty } from "@beep/schema/SchemaUtils/withKeyDefaults";
import { describe, expect, it } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const Settings = S.Struct({ values: ArrayKeyDefaultEmpty(S.FiniteFromString) });

describe("ArrayKeyDefaultEmpty", () => {
  const TextSettings = S.Struct({ values: ArrayKeyDefaultEmpty(S.String) });

  it.effect.prop(
    "round-trips schema-derived arrays without dropping or changing their elements",
    [Arbitrary.schema(TextSettings)],
    Effect.fnUntraced(function* ([settings]) {
      const encoded = yield* S.encodeEffect(TextSettings)(settings);
      expect(yield* S.decodeEffect(TextSettings)(encoded)).toEqual(settings);
    })
  );

  it.effect("defaults absent keys while preserving element decoding and encoding", () =>
    Effect.gen(function* () {
      expect(Settings.make({}).values).toEqual([]);
      expect(yield* S.decodeEffect(Settings)({})).toEqual({ values: [] });
      expect(yield* S.decodeEffect(Settings)({ values: ["42"] })).toEqual({ values: [42] });
      expect(yield* S.encodeEffect(Settings)({ values: [42] })).toEqual({ values: ["42"] });
      expect(yield* S.encodeEffect(Settings)({ values: [] })).toEqual({ values: [] });
    })
  );

  it.effect("rejects explicit undefined and invalid elements", () =>
    Effect.gen(function* () {
      expect(yield* Effect.isFailure(S.decodeUnknownEffect(Settings)({ values: undefined }))).toBe(true);
      expect(yield* Effect.isFailure(S.decodeUnknownEffect(Settings)({ values: [42] }))).toBe(true);
    })
  );
});
