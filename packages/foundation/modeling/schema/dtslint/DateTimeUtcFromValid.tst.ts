import {
  DateTimeInputDate,
  DateTimeInputNumber,
  DateTimeInputString,
  DateTimeUtcFromValid,
} from "@beep/schema/DateTimeUtcFromValid";
import { pipe } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";
import type {
  DateTimeInput,
  DateTimeInputDateTime,
  DateTimeInputInstant,
  DateTimeInputInstantWithZone,
  DateTimeInputKind,
  DateTimeInputParts,
  DateTimeUtcFromValid as DateTimeUtcFromValidType,
} from "@beep/schema/DateTimeUtcFromValid";
import type { Effect } from "effect";
import type * as DateTime from "effect/DateTime";

describe("DateTimeUtcFromValid", () => {
  it("tracks primitive input schema types", () => {
    expect<DateTimeInputString>().type.toBe<string>();
    expect<DateTimeInputNumber>().type.toBe<number>();
    expect<DateTimeInputDate>().type.toBe<Date>();
    expect<DateTimeInputDateTime>().type.toBe<DateTime.DateTime>();
  });

  it("tracks tagged primitive helper types", () => {
    const taggedString = DateTimeInputString.makeTagged("2024-01-01T00:00:00.000Z");
    const taggedNumber = DateTimeInputNumber.makeTagged(1_704_067_200_000);
    const taggedDate = DateTimeInputDate.makeTagged({} as Date);

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
    expect<DateTimeInputInstant>().type.toBe<DateTimeInputInstant>();
    expect<DateTimeInputInstantWithZone>().type.toBe<DateTimeInputInstantWithZone>();
    expect<DateTimeInputParts>().type.toBe<DateTimeInputParts>();
  });

  it("keeps the full input and UTC transformation types aligned", () => {
    expect<DateTimeInputKind>().type.toBe<
      "number" | "string" | "Date" | "DateTime" | "Parts" | "Instant" | "InstantWithZone"
    >();
    expect<DateTimeInput>().type.toBe<DateTimeInput>();
    expect<DateTimeUtcFromValid>().type.toBe<DateTime.Utc>();
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
