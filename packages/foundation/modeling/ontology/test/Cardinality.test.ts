import { CARDINALITY_MAX_AS_NUMBER, Cardinality, CardinalityValues, isCardinalityValue } from "@beep/ontology";
import { describe, expect, it } from "@effect/vitest";
import { pipe, Result } from "effect";
import * as S from "effect/Schema";

describe("Cardinality", () => {
  it("defaults to zero to many", () => {
    const cardinality = Cardinality.new();

    expect(cardinality.value).toBe(CardinalityValues.ZERO_TO_MANY);
    expect(cardinality.toJSON()).toBe(CardinalityValues.ZERO_TO_MANY);
    expect(cardinality.getCardinalityBounds()).toEqual({ lowerBound: "0", upperBound: "*" });
    expect(cardinality.getCardinalityBoundsAsNumbers()).toEqual({
      lowerBound: 0,
      upperBound: CARDINALITY_MAX_AS_NUMBER,
    });
    expect(cardinality.isZeroToMany()).toBe(true);
    expect(cardinality.isOptional()).toBe(true);
    expect(cardinality.isMandatory()).toBe(false);
  });

  it("supports OntoUML shorthand values", () => {
    const one = Cardinality.new(CardinalityValues.ONE);
    const many = Cardinality.new(CardinalityValues.MANY);

    expect(one.getCardinalityBounds()).toEqual({ lowerBound: "1", upperBound: "1" });
    expect(one.isOneToOne()).toBe(true);
    expect(one.isBounded()).toBe(true);

    expect(many.toJSON()).toBe(CardinalityValues.MANY);
    expect(many.getCardinalityBounds()).toEqual({ lowerBound: "0", upperBound: "*" });
    expect(many.isZeroToMany()).toBe(true);
    expect(many.isBounded()).toBe(false);
  });

  it("constructs and mutates from numeric bounds", () => {
    const cardinality = Cardinality.new(1, CARDINALITY_MAX_AS_NUMBER);

    expect(cardinality.value).toBe(CardinalityValues.ONE_TO_MANY);
    expect(cardinality.isOneToMany()).toBe(true);

    cardinality.setCardinalityFromNumbers(2, 3);

    expect(cardinality.value).toBe("2..3");
    expect(cardinality.lowerBound).toBe("2");
    expect(cardinality.upperBound).toBe("3");
    expect(cardinality.getLowerBoundAsNumber()).toBe(2);
    expect(cardinality.getUpperBoundAsNumber()).toBe(3);
    expect(cardinality.isBounded()).toBe(true);
  });

  it("supports null cardinality compatibility", () => {
    const cardinality = Cardinality.new(null);

    expect(cardinality.value).toBeNull();
    expect(cardinality.toJSON()).toBeNull();
    expect(cardinality.getCardinalityBounds()).toBeNull();
    expect(cardinality.isValid()).toBe(false);
    expect(cardinality.isOptional()).toBe(false);
    expect(cardinality.isMandatory()).toBe(false);
  });

  it("validates cardinality values through the schema", () => {
    const decoded = pipe(S.decodeUnknownResult(Cardinality)({ value: "0..1" }), Result.getOrThrow);

    expect(decoded).toBeInstanceOf(Cardinality);
    expect(decoded.isZeroToOne()).toBe(true);
    expect(Cardinality.make({}).value).toBe(CardinalityValues.ZERO_TO_MANY);
    expect(isCardinalityValue("1..*")).toBe(true);
    expect(isCardinalityValue("2..1")).toBe(false);
  });

  it("rejects malformed or impossible bounds", () => {
    expect(() => Cardinality.new("abc")).toThrow();
    expect(() => Cardinality.new("2..1")).toThrow();
    expect(() => Cardinality.new(0, 0)).toThrow();
    expect(() => Cardinality.new(1, -1)).toThrow();
  });
});
