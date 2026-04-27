import type { Effect } from "effect";
import type * as DateTime from "effect/DateTime";
import type * as O from "effect/Option";
import type * as Ord from "effect/Order";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";
import {
  addDays,
  addMonths,
  addYears,
  daysInMonth,
  diffInDays,
  fromDate,
  fromDateTime,
  fromString,
  isAfter,
  isBefore,
  LocalDateFromString,
  type LocalDateFromString as LocalDateFromStringType,
  type Model,
  make,
  makeEffect,
  makeOption,
  Order,
  today,
  todayEffect,
} from "../src/values/LocalDate/index.ts";

describe("LocalDate", () => {
  const date = make({ year: 2024, month: 6, day: 15 });

  it("preserves the model and constructor helper types", () => {
    expect(date).type.toBe<Model>();
    expect(makeOption({ year: 2024, month: 6, day: 15 })).type.toBe<O.Option<Model>>();
    expect(makeEffect({ year: 2024, month: 6, day: 15 })).type.toBe<Effect.Effect<Model, S.SchemaError, never>>();
    expect(today()).type.toBe<Model>();
    expect(todayEffect).type.toBe<Effect.Effect<Model, never, never>>();
  });

  it("preserves conversion helper types", () => {
    expect(fromString("2024-06-15")).type.toBe<Effect.Effect<Model, S.SchemaError, never>>();
    expect(fromDate(new Date("2024-06-15T00:00:00.000Z"))).type.toBe<Model>();
    expect(fromDateTime(date.toDateTime())).type.toBe<Model>();
    expect(date.toDateTime()).type.toBe<DateTime.Utc>();
    expect(date.toDate()).type.toBe<Date>();
  });

  it("preserves ordering and dual helper types", () => {
    expect(Order).type.toBe<Ord.Order<Model>>();
    expect(isBefore(date)).type.toBe<(self: Model) => boolean>();
    expect(isBefore(date, date)).type.toBe<boolean>();
    expect(isAfter(date)).type.toBe<(self: Model) => boolean>();
    expect(isAfter(date, date)).type.toBe<boolean>();
    expect(addDays(1)).type.toBe<(self: Model) => Model>();
    expect(addDays(date, 1)).type.toBe<Model>();
    expect(addMonths(1)).type.toBe<(self: Model) => Model>();
    expect(addYears(1)).type.toBe<(self: Model) => Model>();
    expect(diffInDays(date)).type.toBe<(self: Model) => number>();
    expect(daysInMonth(2)).type.toBe<(year: number) => number>();
  });

  it("preserves the string schema type and encoded boundary", () => {
    const decode = S.decodeUnknownEffect(LocalDateFromString);
    const encode = S.encodeEffect(LocalDateFromString);

    expect<typeof LocalDateFromString.Type>().type.toBe<Model>();
    expect<typeof LocalDateFromString.Encoded>().type.toBe<string>();
    expect<LocalDateFromStringType>().type.toBe<Model>();
    expect<LocalDateFromString.Encoded>().type.toBe<string>();
    expect(decode("2024-06-15")).type.toBe<Effect.Effect<Model, S.SchemaError, never>>();
    expect(encode(date)).type.toBe<Effect.Effect<string, S.SchemaError, never>>();
  });
});
