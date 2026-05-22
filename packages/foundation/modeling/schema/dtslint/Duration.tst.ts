import * as Duration from "@beep/schema/Duration";
import { type Effect, pipe } from "effect";
import type * as D from "effect/Duration";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

describe("Duration", () => {
  it("preserves the DurationUnit alias surface", () => {
    expect<Duration.Unit>().type.toBe<Duration.Unit>();
  });

  it("tracks the one-way duration transformation schema types", () => {
    expect<Duration.FromInput>().type.toBe<D.Duration>();
    expect<typeof Duration.FromInput.Encoded>().type.toBe<typeof Duration.Input.Encoded>();
  });

  it("keeps the duration input boundary as the encoded surface", () => {
    expect<Duration.Input>().type.toBe<Duration.Input>();
  });

  it("exposes decode and encode helpers with the expected effect types", () => {
    const decode = S.decodeUnknownEffect(Duration.FromInput);
    const encode = S.encodeEffect(Duration.FromInput);
    const input = Duration.Object.make({ seconds: 1 });
    const duration = S.decodeSync(Duration.FromInput)(input);
    const encoded = pipe(duration, encode);

    expect(duration).type.toBe<D.Duration>();
    expect(decode(input)).type.toBe<Effect.Effect<D.Duration, S.SchemaError, never>>();
    expect(encoded).type.toBe<Effect.Effect<typeof Duration.Input.Encoded, S.SchemaError, never>>();
  });

  it("exposes concise role names from the canonical namespace import", () => {
    expect<Duration.Input>().type.toBe<Duration.Input>();
    expect<Duration.FromInput>().type.toBe<D.Duration>();
    expect<typeof Duration.FromInput.Encoded>().type.toBe<typeof Duration.Input.Encoded>();
    expect<Duration.Schema>().type.toBe<D.Duration>();
  });
});
