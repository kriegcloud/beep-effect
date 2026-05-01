import {
  DateTimeInput,
  DateTimeInputDate,
  DateTimeInputInstant,
  DateTimeInputInstantWithZone,
  DateTimeInputKind,
  DateTimeInputNumber,
  DateTimeInputParts,
  DateTimeInputString,
  DateTimeUtcFromValid,
} from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import * as DateTime from "effect/DateTime";
import * as S from "effect/Schema";

const iso = "2024-01-01T00:00:00.000Z";
const epochMilliseconds = 1_704_067_200_000;

const decodeInput = S.decodeUnknownSync(DateTimeInput);
const decodeUtc = S.decodeUnknownSync(DateTimeUtcFromValid);
const encodeUtc = S.encodeSync(DateTimeUtcFromValid);

const expectEpochMillis = (actual: DateTime.Utc, expected: number) => {
  expect(DateTime.toEpochMillis(actual)).toBe(expected);
};

describe("DateTimeInputKind", () => {
  it("decodes supported discriminator values", () => {
    expect(S.decodeUnknownSync(DateTimeInputKind)("Instant")).toBe("Instant");
  });
});

describe("DateTimeInput primitive schemas", () => {
  it("decode raw string, number, and Date inputs", () => {
    expect(decodeInput(iso)).toBe(iso);
    expect(decodeInput(epochMilliseconds)).toBe(epochMilliseconds);

    const date = new Date(iso);

    expect(decodeInput(date)).toBe(date);
  });

  it("decode tagged string, number, and Date inputs", () => {
    const stringInput = DateTimeInputString.makeTagged(iso);
    const numberInput = DateTimeInputNumber.makeTagged(epochMilliseconds);
    const dateInput = DateTimeInputDate.makeTagged(new Date(iso));

    expect(S.decodeUnknownSync(DateTimeInputString.Tagged)(stringInput)).toEqual(stringInput);
    expect(S.decodeUnknownSync(DateTimeInputNumber.Tagged)(numberInput)).toEqual(numberInput);
    expect(S.decodeUnknownSync(DateTimeInputDate.Tagged)(dateInput)).toEqual(dateInput);
  });

  it("rejects invalid primitive inputs", () => {
    expect(() => S.decodeUnknownSync(DateTimeInputString)("not-a-date")).toThrow(
      "Expected a string that can be converted into a DateTime.Utc"
    );
    expect(() => S.decodeUnknownSync(DateTimeInputNumber)(Number.POSITIVE_INFINITY)).toThrow();
    expect(() => S.decodeUnknownSync(DateTimeInputDate)(new Date("not-a-date"))).toThrow();
  });
});

describe("DateTimeInput tagged object schemas", () => {
  it("decodes Instant and InstantWithZone transport objects", () => {
    expect(decodeInput(new DateTimeInputInstant({ epochMilliseconds }))).toEqual(
      new DateTimeInputInstant({ epochMilliseconds })
    );
    expect(
      decodeInput(
        new DateTimeInputInstantWithZone({
          epochMilliseconds,
          timeZoneId: "Europe/London",
        })
      )
    ).toEqual(
      new DateTimeInputInstantWithZone({
        epochMilliseconds,
        timeZoneId: "Europe/London",
      })
    );
  });

  it("rejects invalid InstantWithZone time zone identifiers", () => {
    expect(() =>
      S.decodeUnknownSync(DateTimeInputInstantWithZone)({
        _tag: "InstantWithZone",
        epochMilliseconds,
        timeZoneId: "Not/AZone",
      })
    ).toThrow("Expected a valid DateTime time zone identifier");
  });

  it("decodes partial Parts transport objects", () => {
    expect(
      decodeInput(
        new DateTimeInputParts({
          year: 2024,
          month: 1,
          day: 2,
          hour: 3,
          minute: 4,
          second: 5,
          millisecond: 6,
        })
      )
    ).toEqual(
      new DateTimeInputParts({
        year: 2024,
        month: 1,
        day: 2,
        hour: 3,
        minute: 4,
        second: 5,
        millisecond: 6,
      })
    );
  });
});

describe("DateTimeUtcFromValid", () => {
  it("decodes raw DateTime.Input primitives into DateTime.Utc", () => {
    expectEpochMillis(decodeUtc(iso), epochMilliseconds);
    expectEpochMillis(decodeUtc(epochMilliseconds), epochMilliseconds);
    expectEpochMillis(decodeUtc(new Date(iso)), epochMilliseconds);
  });

  it("decodes tagged primitive inputs into DateTime.Utc", () => {
    expectEpochMillis(decodeUtc(DateTimeInputString.makeTagged(iso)), epochMilliseconds);
    expectEpochMillis(decodeUtc(DateTimeInputNumber.makeTagged(epochMilliseconds)), epochMilliseconds);
    expectEpochMillis(decodeUtc(DateTimeInputDate.makeTagged(new Date(iso))), epochMilliseconds);
  });

  it("decodes existing DateTime.Utc and DateTime.Zoned values into UTC", () => {
    const utc = DateTime.makeUnsafe(iso);
    const zoned = DateTime.makeZonedUnsafe(iso, { timeZone: "Europe/London" });

    expectEpochMillis(decodeUtc(utc), epochMilliseconds);
    expectEpochMillis(decodeUtc(zoned), epochMilliseconds);
  });

  it("decodes Instant and InstantWithZone into UTC", () => {
    expectEpochMillis(decodeUtc(new DateTimeInputInstant({ epochMilliseconds })), epochMilliseconds);
    expectEpochMillis(
      decodeUtc(
        new DateTimeInputInstantWithZone({
          epochMilliseconds,
          timeZoneId: "UTC",
        })
      ),
      epochMilliseconds
    );
  });

  it("decodes partial Parts into UTC", () => {
    const decoded = decodeUtc(
      new DateTimeInputParts({
        year: 2024,
        month: 1,
        day: 2,
        hour: 3,
        minute: 4,
        second: 5,
        millisecond: 6,
      })
    );

    expect(DateTime.formatIso(decoded)).toBe("2024-01-02T03:04:05.006Z");
  });

  it("encodes DateTime.Utc into canonical tagged ISO string input", () => {
    expect(encodeUtc(DateTime.makeUnsafe(iso))).toEqual(DateTimeInputString.makeTagged(iso));
  });

  it("rejects input that passes the shape schema but cannot become a DateTime.Utc", () => {
    expect(() => decodeUtc(new DateTimeInputParts({ year: 1e100 }))).toThrow(
      "Expected a valid Effect DateTime.Input value"
    );
  });
});
