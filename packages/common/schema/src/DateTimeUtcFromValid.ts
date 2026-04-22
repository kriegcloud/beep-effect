/**
 * DateTimeUtcFromValid - Utilities / schemas for converting any valid date input into an effect/DateTime Utc type.
 *
 * @module
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import { DateTime} from "effect"
const $I = $SchemaId.create("DateTimeUtcFromValid");

/**
 * DateTimeInputKind - The literal string tag used to discriminate valid date input for conversion to effect/DateTime Utc type.
 *
 * @since 0.0.0
 * @category Validation
 */
export const DateTimeInputKind = LiteralKit([
  "number",
  "string",
  "Date",
  "DateTime",
  "Parts",
  "Instant",
  "InstantWithZone",
]).pipe(
  $I.annoteSchema("DateTimeInputKind", {
    description:
      "The literal string tag used to discriminate valid date input for conversion to effect/DateTime Utc type.",
  })
);
/**
 * Companion Type for {@link DateTimeInputKind}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type DateTimeInputKind = typeof DateTimeInputKind.Type;

const isValidDateStrOrNum = (i: string | number): i is number | string => S.is(S.DateValid)(new Date(i));

const isValidDateTimeNumberInput = S.makeFilter((i: number): i is number => isValidDateStrOrNum(i));
const isValidDateTimeStringInput = S.makeFilter((i: string): i is string => isValidDateStrOrNum(i));

export const DateTimeInputNumber = S.Number.pipe(
  S.check(isValidDateTimeNumberInput),
  S.brand("DateTimeInputNumber"),
  $I.annoteSchema("DateTimeInputNumber", {
    description: "A number representing a valid date input for conversion to effect/DateTime Utc type.",
  })
);

export type DateTimeInputNumber = typeof DateTimeInputNumber.Type;

interface InputKindStatics<TKind extends DateTimeInputKind, TSchema extends S.Top> extends Record<string, unknown> {
  makeTagged: (input: TSchema["Type"]) => {
    readonly _tag: TKind;
    readonly value: TSchema["Type"];
  };
  Tagged: S.TaggedStruct<
    TKind,
    {
      value: TSchema;
    }
  >;
}

const makeInputKindStatics: {
  <TKind extends DateTimeInputKind>(
    kind: TKind
  ): <TSchema extends S.Top>(self: TSchema) => InputKindStatics<TKind, TSchema>;
  <TKind extends DateTimeInputKind, TSchema extends S.Top>(
    self: TSchema,
    kind: TKind
  ): InputKindStatics<TKind, TSchema>;
} = dual(
  2,
  <TKind extends DateTimeInputKind, TSchema extends S.Top>(
    self: TSchema,
    kind: TKind
  ): InputKindStatics<TKind, TSchema> => {
    const Tagged = S.TaggedStruct(kind, {
      value: self,
    });

    return {
      Tagged,
      makeTagged: (input: TSchema["Type"]) => ({
        _tag: kind,
        value: input,
      }),
    };
  }
);

export const DateTimeInputString = S.String.check(isValidDateTimeStringInput).pipe(
  S.brand("DateTimeInputString"),
  $I.annoteSchema("DateTimeInputString", {
    description: "A string representing a valid date input for conversion to effect/DateTime Utc type.",
  }),
  SchemaUtils.withStatics(makeInputKindStatics("string"))
);

export type DateTimeInputString = typeof DateTimeInputString.Type;
