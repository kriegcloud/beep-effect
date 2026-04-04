/**
 * Pattern string parsers.
 *
 * @since 0.0.0
 * @module @beep/nlp/Core/PatternParsers
 */

import { $NlpId } from "@beep/identity";
import { Effect, SchemaGetter, SchemaIssue } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  EntityPatternElement,
  LiteralPatternElement,
  Pattern,
  POSPatternElement,
  WinkEntityType,
  WinkPOSTag,
} from "./Pattern.ts";

const $I = $NlpId.create("Core/PatternParsers");

type NonEmptyChoices<A> = readonly [A, ...A[]];

const invalidBracketString = (input: string, message: string): SchemaIssue.InvalidValue =>
  new SchemaIssue.InvalidValue(O.some(input), { message });

const ensureNonEmpty = <A>(values: ReadonlyArray<A>): O.Option<NonEmptyChoices<A>> => {
  const [head, ...tail] = values;
  return head === undefined ? O.none() : O.some([head, ...tail]);
};

const parseBracketValues = (input: string): O.Option<NonEmptyChoices<string>> => {
  if (!Str.startsWith("[")(input) || !Str.endsWith("]")(input)) {
    return O.none();
  }

  const content = Str.slice(1, -1)(input);
  if (Str.isEmpty(content)) {
    return O.none();
  }

  return ensureNonEmpty(Str.split(content, "|"));
};

const hasMeaningfulChoice = (values: ReadonlyArray<string>): boolean => A.some(values, (value) => value !== "");

const isPOSChoice = (part: string): part is WinkPOSTag | "" => part === "" || S.is(WinkPOSTag)(part);

const isPOSChoices = (parts: NonEmptyChoices<string>): parts is NonEmptyChoices<WinkPOSTag | ""> =>
  A.every(parts, isPOSChoice);

const isEntityChoice = (part: string): part is WinkEntityType | "" => part === "" || S.is(WinkEntityType)(part);

const isEntityChoices = (parts: NonEmptyChoices<string>): parts is NonEmptyChoices<WinkEntityType | ""> =>
  A.every(parts, isEntityChoice);

const hasNonBlankLiteralChoices = (parts: NonEmptyChoices<string>): boolean =>
  A.every(parts, (part) => part === "" || Str.isNonEmpty(Str.trim(part))) && hasMeaningfulChoice(parts);

const decodePOSPatternElement = (input: string): O.Option<POSPatternElement> =>
  O.map(
    O.filter(O.filter(parseBracketValues(input), isPOSChoices), hasMeaningfulChoice),
    (parts) => new POSPatternElement({ value: parts })
  );

const decodeEntityPatternElement = (input: string): O.Option<EntityPatternElement> =>
  O.map(
    O.filter(O.filter(parseBracketValues(input), isEntityChoices), hasMeaningfulChoice),
    (parts) => new EntityPatternElement({ value: parts })
  );

const decodeLiteralPatternElement = (input: string): O.Option<LiteralPatternElement> =>
  O.map(
    O.filter(parseBracketValues(input), hasNonBlankLiteralChoices),
    (parts) => new LiteralPatternElement({ value: parts })
  );

/**
 * Decode a POS bracket string into a pattern element.
 *
 * @since 0.0.0
 * @category Validation
 */
export const BracketStringToPOSPatternElement = S.String.pipe(
  S.decodeTo(POSPatternElement, {
    decode: SchemaGetter.transformOrFail((input) =>
      O.match(decodePOSPatternElement(input), {
        onNone: () =>
          Effect.fail(invalidBracketString(input, "POS pattern must be bracketed and contain valid wink POS tags.")),
        onSome: Effect.succeed,
      })
    ),
    encode: SchemaGetter.transform((element) => Pattern.POS.toBracketString(element.value)),
  }),
  S.annotate(
    $I.annote("BracketStringToPOSPatternElement", {
      description: "Decoder for POS bracket strings such as [ADJ|NOUN].",
    })
  )
);

/**
 * Decode an entity bracket string into a pattern element.
 *
 * @since 0.0.0
 * @category Validation
 */
export const BracketStringToEntityPatternElement = S.String.pipe(
  S.decodeTo(EntityPatternElement, {
    decode: SchemaGetter.transformOrFail((input) =>
      O.match(decodeEntityPatternElement(input), {
        onNone: () =>
          Effect.fail(
            invalidBracketString(input, "Entity pattern must be bracketed and contain valid wink entity types.")
          ),
        onSome: Effect.succeed,
      })
    ),
    encode: SchemaGetter.transform((element) => Pattern.Entity.toBracketString(element.value)),
  }),
  S.annotate(
    $I.annote("BracketStringToEntityPatternElement", {
      description: "Decoder for entity bracket strings such as [DATE|TIME].",
    })
  )
);

/**
 * Decode a literal bracket string into a pattern element.
 *
 * @since 0.0.0
 * @category Validation
 */
export const BracketStringToLiteralPatternElement = S.String.pipe(
  S.decodeTo(LiteralPatternElement, {
    decode: SchemaGetter.transformOrFail((input) =>
      O.match(decodeLiteralPatternElement(input), {
        onNone: () =>
          Effect.fail(
            invalidBracketString(input, "Literal pattern must be bracketed and contain non-empty literal choices.")
          ),
        onSome: Effect.succeed,
      })
    ),
    encode: SchemaGetter.transform((element) => Pattern.Literal.toBracketString(element.value)),
  }),
  S.annotate(
    $I.annote("BracketStringToLiteralPatternElement", {
      description: "Decoder for literal bracket strings such as [Apple|Google].",
    })
  )
);

/**
 * Decode any supported bracket string element.
 *
 * @since 0.0.0
 * @category Validation
 */
export const BracketStringToPatternElement = S.Union([
  BracketStringToPOSPatternElement,
  BracketStringToEntityPatternElement,
  BracketStringToLiteralPatternElement,
]);

/**
 * Runtime type for {@link BracketStringToPatternElement}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type BracketStringToPatternElement = typeof BracketStringToPatternElement.Type;

/**
 * Decode a string array into ordered pattern elements.
 *
 * @since 0.0.0
 * @category Validation
 */
export const PatternFromString = S.decodeUnknownSync(S.NonEmptyArray(BracketStringToPatternElement));
