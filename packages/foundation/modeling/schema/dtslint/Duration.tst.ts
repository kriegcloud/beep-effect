import {
  DurationFromInput,
  type DurationFromInput as DurationFromInputType,
  type DurationInput,
  type DurationInput as DurationInputType,
  DurationObject,
  type DurationUnit,
  type DurationUnit as DurationUnitType,
  type Unit,
} from "@beep/schema";
import type * as Duration from "@beep/schema/Duration";
import { type Effect, pipe } from "effect";
import type * as D from "effect/Duration";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

describe("Duration", () => {
  it("preserves the DurationUnit alias surface", () => {
    expect<DurationUnitType>().type.toBe<Unit>();
    expect<DurationUnit>().type.toBe<DurationUnitType>();
  });

  it("tracks the one-way duration transformation schema types", () => {
    expect<DurationFromInput>().type.toBe<D.Duration>();
    expect<typeof DurationFromInput.Encoded>().type.toBe<typeof DurationInput.Encoded>();
    expect<DurationFromInputType>().type.toBe<D.Duration>();
  });

  it("keeps the duration input boundary as the encoded surface", () => {
    expect<DurationInputType>().type.toBe<DurationInput>();
  });

  it("exposes decode and encode helpers with the expected effect types", () => {
    const decode = S.decodeUnknownEffect(DurationFromInput);
    const encode = S.encodeEffect(DurationFromInput);
    const input = new DurationObject({ seconds: 1 });
    const duration = S.decodeSync(DurationFromInput)(input);
    const encoded = pipe(duration, encode);

    expect(duration).type.toBe<D.Duration>();
    expect(decode(input)).type.toBe<Effect.Effect<D.Duration, S.SchemaError, never>>();
    expect(encoded).type.toBe<Effect.Effect<typeof DurationInput.Encoded, S.SchemaError, never>>();
  });

  it("exposes concise role names from the canonical namespace import", () => {
    expect<Duration.Input>().type.toBe<DurationInput>();
    expect<Duration.FromInput>().type.toBe<D.Duration>();
    expect<typeof Duration.FromInput.Encoded>().type.toBe<typeof Duration.Input.Encoded>();
    expect<typeof Duration.Schema.Type>().type.toBe<D.Duration>();
  });
});
