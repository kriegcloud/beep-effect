/**
 * OntoUML cardinality value model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $OntologyId } from "@beep/identity/packages";
import { LiteralKit, SchemaUtils } from "@beep/schema";
import { Number as Num, pipe, Result } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

// cspell:words OntoUML

const $I = $OntologyId.create("domain/Cardinality/Cardinality.model");

/**
 * Separates lower and upper bounds in an OntoUML cardinality string.
 *
 * @example
 * ```ts
 * import { CARDINALITY_SEPARATOR } from "@beep/ontology"
 *
 * console.log(CARDINALITY_SEPARATOR)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const CARDINALITY_SEPARATOR = ".." as const;

/**
 * OntoUML unbounded upper-bound marker.
 *
 * @example
 * ```ts
 * import { CARDINALITY_MAX } from "@beep/ontology"
 *
 * console.log(CARDINALITY_MAX)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const CARDINALITY_MAX = "*" as const;

/**
 * Numeric representation for the unbounded upper-bound marker.
 *
 * @example
 * ```ts
 * import { CARDINALITY_MAX_AS_NUMBER } from "@beep/ontology"
 *
 * console.log(CARDINALITY_MAX_AS_NUMBER)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const CARDINALITY_MAX_AS_NUMBER = Num.Number.POSITIVE_INFINITY;

/**
 * Named OntoUML cardinality values.
 *
 * @example
 * ```ts
 * import { CardinalityValues } from "@beep/ontology"
 *
 * console.log(CardinalityValues.ZERO_TO_MANY)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const CardinalityValues = {
  ZERO_TO_ONE: "0..1",
  ZERO_TO_MANY: "0..*",
  ONE: "1",
  ONE_TO_ONE: "1..1",
  ONE_TO_MANY: "1..*",
  MANY: CARDINALITY_MAX,
} as const;

/**
 * Built-in OntoUML cardinality shortcuts.
 *
 * @example
 * ```ts
 * import { CardinalityPresetValue } from "@beep/ontology"
 *
 * console.log(CardinalityPresetValue.is["0..*"]("0..*"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const CardinalityPresetValue = LiteralKit([
  CardinalityValues.ZERO_TO_ONE,
  CardinalityValues.ZERO_TO_MANY,
  CardinalityValues.ONE,
  CardinalityValues.ONE_TO_ONE,
  CardinalityValues.ONE_TO_MANY,
  CardinalityValues.MANY,
]).pipe(
  $I.annoteSchema("CardinalityPresetValue", {
    description: "Built-in OntoUML cardinality shortcut values.",
  })
);

/**
 * Runtime type for {@link CardinalityPresetValue}.
 *
 * @example
 * ```ts
 * import type { CardinalityPresetValue } from "@beep/ontology"
 *
 * const value: CardinalityPresetValue = "1..*"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type CardinalityPresetValue = typeof CardinalityPresetValue.Type;

const CARDINALITY_VALUE_PATTERN = /^(?:\*|\d+(?:\.\.(?:\d+|\*))?)$/u;

type CardinalityBounds = {
  readonly lowerBound: string;
  readonly upperBound: string;
};

type CardinalityNumericBounds = {
  readonly lowerBound: number;
  readonly upperBound: number;
};

type CardinalityConstructorObjectInput = {
  readonly value?: CardinalityValue | null | undefined;
};

type CardinalityNew = {
  (): Cardinality;
  (base: CardinalityConstructorObjectInput | Cardinality): Cardinality;
  (cardinality: string | null): Cardinality;
  (lowerBound: string, upperBound: string): Cardinality;
  (lowerBound: number, upperBound: number): Cardinality;
};

const parseBoundAsNumber = (bound: string): number =>
  bound === CARDINALITY_MAX ? CARDINALITY_MAX_AS_NUMBER : Num.Number.parseInt(bound, 10);

const isSafeNonNegativeInteger = (value: number): boolean => Num.Number.isSafeInteger(value) && value >= 0;

const isSafePositiveInteger = (value: number): boolean => Num.Number.isSafeInteger(value) && value > 0;

const parseCardinalityBounds = (value: string): CardinalityBounds | null => {
  if (!CARDINALITY_VALUE_PATTERN.test(value)) {
    return null;
  }

  if (value === CARDINALITY_MAX) {
    return { lowerBound: "0", upperBound: CARDINALITY_MAX };
  }

  if (!pipe(value, Str.includes(CARDINALITY_SEPARATOR))) {
    return { lowerBound: value, upperBound: value };
  }

  const [lowerBound, upperBound] = pipe(value, Str.split(CARDINALITY_SEPARATOR));

  if (lowerBound === undefined || upperBound === undefined) {
    return null;
  }

  return { lowerBound, upperBound };
};

const parseCardinalityBoundsAsNumbers = (value: string): CardinalityNumericBounds | null => {
  const bounds = parseCardinalityBounds(value);

  if (bounds === null) {
    return null;
  }

  return {
    lowerBound: parseBoundAsNumber(bounds.lowerBound),
    upperBound: parseBoundAsNumber(bounds.upperBound),
  };
};

const isCardinalityValueSemanticallyValid = (value: string): boolean => {
  const bounds = parseCardinalityBoundsAsNumbers(value);

  return (
    bounds !== null &&
    isSafeNonNegativeInteger(bounds.lowerBound) &&
    (bounds.upperBound === CARDINALITY_MAX_AS_NUMBER || isSafePositiveInteger(bounds.upperBound)) &&
    bounds.lowerBound <= bounds.upperBound
  );
};

/**
 * Valid OntoUML cardinality string.
 *
 * Accepts single-value shorthand such as `"1"`, range notation such as
 * `"0..*"`, and `"*"` as a many shorthand.
 *
 * @example
 * ```ts
 * import { CardinalityValue } from "@beep/ontology"
 * import * as S from "effect/Schema"
 *
 * console.log(S.is(CardinalityValue)("0..*"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const CardinalityValue = S.String.check(
  S.isPattern(CARDINALITY_VALUE_PATTERN, {
    identifier: $I`CardinalityValuePatternCheck`,
    title: "Cardinality Value Pattern",
    description: "Requires OntoUML cardinality notation such as 1, 0..1, 1..*, or *.",
    message: "Cardinality must be *, a non-negative integer, or lower..upper where upper is a positive integer or *",
  }),
  S.makeFilter(isCardinalityValueSemanticallyValid, {
    identifier: $I`CardinalityValueBoundsCheck`,
    title: "Cardinality Value Bounds",
    description:
      "Requires lower bounds to be finite non-negative integers and upper bounds to be positive or unbounded.",
    message: "Cardinality lower bound must be finite, non-negative, and less than or equal to the upper bound",
  })
).pipe(
  $I.annoteSchema("CardinalityValue", {
    description: "Validated OntoUML cardinality string.",
  })
);

/**
 * Runtime type for {@link CardinalityValue}.
 *
 * @example
 * ```ts
 * import type { CardinalityValue } from "@beep/ontology"
 *
 * const value: CardinalityValue = "0..1"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type CardinalityValue = typeof CardinalityValue.Type;

/**
 * Guard for {@link CardinalityValue}.
 *
 * @example
 * ```ts
 * import { isCardinalityValue } from "@beep/ontology"
 *
 * console.log(isCardinalityValue("1..*"))
 * ```
 *
 * @category guards
 * @since 0.0.0
 */
export const isCardinalityValue = S.is(CardinalityValue);

const decodeCardinalityValueResult = S.decodeUnknownResult(CardinalityValue);

const schemaIssueToError = (cause: S.SchemaError | S.SchemaError["issue"]): S.SchemaError => {
  if (cause instanceof S.SchemaError) {
    return cause;
  }

  return new S.SchemaError(cause);
};

const makeCardinalityValue = (value: string): CardinalityValue =>
  pipe(decodeCardinalityValueResult(value), Result.getOrThrowWith(schemaIssueToError));

const isCardinalityConstructorObjectInput = (input: unknown): input is CardinalityConstructorObjectInput =>
  P.isObject(input);

const cardinalityValueFromLowerBound = (lowerBound: string | number): string => `${lowerBound}`;

const cardinalityValueFromUpperBoundNumber = (upperBound: number): string =>
  upperBound === CARDINALITY_MAX_AS_NUMBER ? CARDINALITY_MAX : `${upperBound}`;

const cardinalityValueFromUpperBound = (upperBound: string | number): string =>
  P.isNumber(upperBound) ? cardinalityValueFromUpperBoundNumber(upperBound) : upperBound;

const formatCardinalityBounds = (lowerBound: string | number, upperBound: string | number): CardinalityValue =>
  makeCardinalityValue(
    `${cardinalityValueFromLowerBound(lowerBound)}${CARDINALITY_SEPARATOR}${cardinalityValueFromUpperBound(upperBound)}`
  );

const cardinalityValueFromConstructorInput = (
  arg1?: CardinalityConstructorObjectInput | string | number | null,
  arg2?: string | number | null
): CardinalityValue | null => {
  if (arg1 === undefined && arg2 === undefined) {
    return CardinalityValues.ZERO_TO_MANY;
  }

  if (arg1 === null && arg2 === undefined) {
    return null;
  }

  if (isCardinalityConstructorObjectInput(arg1) && arg2 === undefined) {
    if (!P.hasProperty(arg1, "value") || arg1.value === undefined) {
      return CardinalityValues.ZERO_TO_MANY;
    }

    return arg1.value === null ? null : makeCardinalityValue(arg1.value);
  }

  if (P.isString(arg1) && arg2 === undefined) {
    return makeCardinalityValue(arg1);
  }

  if ((P.isString(arg1) || P.isNumber(arg1)) && (P.isString(arg2) || P.isNumber(arg2))) {
    return formatCardinalityBounds(arg1, arg2);
  }

  throw new TypeError("Bad cardinality input");
};

/**
 * Schema-backed OntoUML cardinality value object.
 *
 * @example
 * ```ts
 * import { Cardinality } from "@beep/ontology"
 *
 * const cardinality = Cardinality.new(0, Infinity)
 * console.log(cardinality.toJSON())
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Cardinality extends S.Class<Cardinality>($I`Cardinality`)(
  {
    value: SchemaUtils.withKeyDefaults(S.NullOr(CardinalityValue), CardinalityValues.ZERO_TO_MANY).pipe(S.mutableKey),
  },
  $I.annote("Cardinality", {
    description: "Schema-backed OntoUML cardinality value object.",
  })
) {
  /**
   * Constructs cardinalities from OntoUML-compatible inputs while preserving
   * the generated Effect Schema class constructor.
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly new: CardinalityNew = (
    arg1?: CardinalityConstructorObjectInput | string | number | null,
    arg2?: string | number | null
  ): Cardinality => Cardinality.make({ value: cardinalityValueFromConstructorInput(arg1, arg2) });

  private setValue(value: string | null): void {
    this.value = value === null ? null : makeCardinalityValue(value);
  }

  /**
   * Returns lower and upper bounds as strings.
   *
   * @category getters
   * @since 0.0.0
   */
  getCardinalityBounds(): CardinalityBounds | null {
    return this.value === null ? null : parseCardinalityBounds(this.value);
  }

  /**
   * Returns lower and upper bounds as numbers.
   *
   * @category getters
   * @since 0.0.0
   */
  getCardinalityBoundsAsNumbers(): CardinalityNumericBounds | null {
    return this.value === null ? null : parseCardinalityBoundsAsNumbers(this.value);
  }

  /**
   * Lower cardinality bound.
   *
   * @category getters
   * @since 0.0.0
   */
  get lowerBound(): string | null {
    return this.getCardinalityBounds()?.lowerBound ?? null;
  }

  /**
   * Lower cardinality bound.
   *
   * @category setters
   * @since 0.0.0
   */
  set lowerBound(lowerBound: string) {
    const bounds = this.getCardinalityBounds() ?? { upperBound: CARDINALITY_MAX };
    this.setValue(formatCardinalityBounds(lowerBound, bounds.upperBound));
  }

  /**
   * Lower cardinality bound as a number.
   *
   * @category getters
   * @since 0.0.0
   */
  getLowerBoundAsNumber(): number | null {
    return this.getCardinalityBoundsAsNumbers()?.lowerBound ?? null;
  }

  /**
   * Updates the lower cardinality bound from a number.
   *
   * @category setters
   * @since 0.0.0
   */
  setLowerBoundFromNumber(lowerBound: number): void {
    if (!isSafeNonNegativeInteger(lowerBound)) {
      throw new RangeError("Lower bound must be a finite non-negative integer");
    }

    this.lowerBound = `${lowerBound}`;
  }

  /**
   * Upper cardinality bound.
   *
   * @category getters
   * @since 0.0.0
   */
  get upperBound(): string | null {
    return this.getCardinalityBounds()?.upperBound ?? null;
  }

  /**
   * Upper cardinality bound.
   *
   * @category setters
   * @since 0.0.0
   */
  set upperBound(upperBound: string) {
    const bounds = this.getCardinalityBounds() ?? { lowerBound: "0" };
    this.setValue(formatCardinalityBounds(bounds.lowerBound, upperBound));
  }

  /**
   * Upper cardinality bound as a number.
   *
   * @category getters
   * @since 0.0.0
   */
  getUpperBoundAsNumber(): number | null {
    return this.getCardinalityBoundsAsNumbers()?.upperBound ?? null;
  }

  /**
   * Updates the upper cardinality bound from a number.
   *
   * @category setters
   * @since 0.0.0
   */
  setUpperBoundFromNumber(upperBound: number): void {
    if (upperBound !== CARDINALITY_MAX_AS_NUMBER && !isSafePositiveInteger(upperBound)) {
      throw new RangeError("Upper bound must be a positive integer or Infinity");
    }

    this.upperBound = cardinalityValueFromUpperBoundNumber(upperBound);
  }

  /**
   * Returns whether the current value is a valid cardinality.
   *
   * @category guards
   * @since 0.0.0
   */
  isValid(): boolean {
    return this.value !== null && isCardinalityValue(this.value);
  }

  /**
   * Returns whether the lower bound is valid.
   *
   * @category guards
   * @since 0.0.0
   */
  isLowerBoundValid(): boolean {
    const lowerBound = this.getLowerBoundAsNumber();

    return lowerBound !== null && isSafeNonNegativeInteger(lowerBound);
  }

  /**
   * Returns whether the upper bound is valid.
   *
   * @category guards
   * @since 0.0.0
   */
  isUpperBoundValid(): boolean {
    const upperBound = this.getUpperBoundAsNumber();

    return upperBound !== null && (upperBound === CARDINALITY_MAX_AS_NUMBER || isSafePositiveInteger(upperBound));
  }

  /**
   * Returns whether the cardinality has a finite upper bound.
   *
   * @category guards
   * @since 0.0.0
   */
  isBounded(): boolean {
    return this.upperBound !== null && this.upperBound !== CARDINALITY_MAX;
  }

  /**
   * Encodes the cardinality as its OntoUML JSON value.
   *
   * @category encoding
   * @since 0.0.0
   */
  toJSON(): CardinalityValue | null {
    return this.value;
  }

  /**
   * Updates both cardinality bounds from numbers.
   *
   * @category setters
   * @since 0.0.0
   */
  setCardinalityFromNumbers(lowerBound: number, upperBound = CARDINALITY_MAX_AS_NUMBER): void {
    if (lowerBound > upperBound) {
      throw new RangeError("Lower bound cannot be greater than upper bound");
    }

    this.setValue(formatCardinalityBounds(lowerBound, upperBound));
  }

  /**
   * Returns whether lower bound is zero.
   *
   * @category guards
   * @since 0.0.0
   */
  isOptional(): boolean {
    return this.getLowerBoundAsNumber() === 0;
  }

  /**
   * Returns whether lower bound is greater than zero.
   *
   * @category guards
   * @since 0.0.0
   */
  isMandatory(): boolean {
    const lowerBound = this.getLowerBoundAsNumber();

    return lowerBound !== null && lowerBound > 0;
  }

  /**
   * Returns whether this cardinality is `0..1`.
   *
   * @category guards
   * @since 0.0.0
   */
  isZeroToOne(): boolean {
    const cardinality = this.getCardinalityBoundsAsNumbers();

    return cardinality !== null && cardinality.lowerBound === 0 && cardinality.upperBound === 1;
  }

  /**
   * Returns whether this cardinality is `0..*`.
   *
   * @category guards
   * @since 0.0.0
   */
  isZeroToMany(): boolean {
    const cardinality = this.getCardinalityBoundsAsNumbers();

    return cardinality !== null && cardinality.lowerBound === 0 && cardinality.upperBound === CARDINALITY_MAX_AS_NUMBER;
  }

  /**
   * Returns whether this cardinality is `1..1`.
   *
   * @category guards
   * @since 0.0.0
   */
  isOneToOne(): boolean {
    const cardinality = this.getCardinalityBoundsAsNumbers();

    return cardinality !== null && cardinality.lowerBound === 1 && cardinality.upperBound === 1;
  }

  /**
   * Returns whether this cardinality is `1..*`.
   *
   * @category guards
   * @since 0.0.0
   */
  isOneToMany(): boolean {
    const cardinality = this.getCardinalityBoundsAsNumbers();

    return cardinality !== null && cardinality.lowerBound === 1 && cardinality.upperBound === CARDINALITY_MAX_AS_NUMBER;
  }

  /**
   * Sets cardinality to `0..1`.
   *
   * @category setters
   * @since 0.0.0
   */
  setZeroToOne(): void {
    this.setValue(CardinalityValues.ZERO_TO_ONE);
  }

  /**
   * Sets cardinality to `0..*`.
   *
   * @category setters
   * @since 0.0.0
   */
  setZeroToMany(): void {
    this.setValue(CardinalityValues.ZERO_TO_MANY);
  }

  /**
   * Sets cardinality to `1..1`.
   *
   * @category setters
   * @since 0.0.0
   */
  setOneToOne(): void {
    this.setValue(CardinalityValues.ONE_TO_ONE);
  }

  /**
   * Sets cardinality to `1..*`.
   *
   * @category setters
   * @since 0.0.0
   */
  setOneToMany(): void {
    this.setValue(CardinalityValues.ONE_TO_MANY);
  }
}
