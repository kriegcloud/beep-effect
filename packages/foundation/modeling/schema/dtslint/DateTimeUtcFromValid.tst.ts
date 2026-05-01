import {
  type DateTimeInput,
  DateTimeInputDate,
  type DateTimeInputDateTime,
  type DateTimeInputInstant,
  type DateTimeInputInstantWithZone,
  type DateTimeInputKind,
  DateTimeInputNumber,
  type DateTimeInputParts,
  DateTimeInputString,
  DateTimeUtcFromValid,
  type DateTimeUtcFromValid as DateTimeUtcFromValidType,
} from "@beep/schema";
import { type Effect, pipe } from "effect";
import type * as DateTime from "effect/DateTime";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

describe("DateTimeUtcFromValid", () => {
  it("tracks primitive input schema types", () => {
    expect<typeof DateTimeInputString.Type>().type.toBe<string>();
    expect<typeof DateTimeInputNumber.Type>().type.toBe<number>();
    expect<typeof DateTimeInputDate.Type>().type.toBe<Date>();
    expect<typeof DateTimeInputDateTime.Type>().type.toBe<DateTime.DateTime>();
  });

  it("tracks tagged primitive helper types", () => {
    const taggedString = DateTimeInputString.makeTagged("2024-01-01T00:00:00.000Z");
    const taggedNumber = DateTimeInputNumber.makeTagged(1_704_067_200_000);
    const taggedDate = DateTimeInputDate.makeTagged(new Date("2024-01-01T00:00:00.000Z"));

    expect(taggedString).type.toBe<{
      readonly _tag: "string";
      readonly value: string;
    }>();
    expect(taggedNumber).type.toBe<{
      readonly _tag: "number";
      readonly value: number;
    }>();
    expect(taggedDate).type.toBe<{
      readonly _tag: "Date";
      readonly value: Date;
    }>();
  });

  it("tracks tagged object input schema types", () => {
    expect<typeof DateTimeInputInstant.Type>().type.toBe<DateTimeInputInstant>();
    expect<typeof DateTimeInputInstantWithZone.Type>().type.toBe<DateTimeInputInstantWithZone>();
    expect<typeof DateTimeInputParts.Type>().type.toBe<DateTimeInputParts>();
  });

  it("keeps the full input and UTC transformation types aligned", () => {
    expect<DateTimeInputKind>().type.toBe<
      "number" | "string" | "Date" | "DateTime" | "Parts" | "Instant" | "InstantWithZone"
    >();
    expect<typeof DateTimeInput.Type>().type.toBe<DateTimeInput>();
    expect<typeof DateTimeUtcFromValid.Type>().type.toBe<DateTime.Utc>();
    expect<DateTimeUtcFromValidType>().type.toBe<DateTime.Utc>();
    expect<typeof DateTimeUtcFromValid.Encoded>().type.toBe<typeof DateTimeInput.Encoded>();
  });

  it("exposes decode and encode helpers with expected effect types", () => {
    const decode = S.decodeUnknownEffect(DateTimeUtcFromValid);
    const encode = S.encodeEffect(DateTimeUtcFromValid);
    const utc = S.decodeUnknownSync(DateTimeUtcFromValid)("2024-01-01T00:00:00.000Z");
    const encoded = pipe(utc, encode);

    expect(utc).type.toBe<DateTime.Utc>();
    expect(decode("2024-01-01T00:00:00.000Z")).type.toBe<Effect.Effect<DateTime.Utc, S.SchemaError, never>>();
    expect(encoded).type.toBe<Effect.Effect<typeof DateTimeInput.Encoded, S.SchemaError, never>>();
  });
});
