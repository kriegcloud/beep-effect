import { A } from "@beep/utils";
import { pipe } from "effect/Function";
import { describe, expect, it } from "tstyche";

const nonEmpty: A.NonEmptyReadonlyArray<number> = [1, 2, 3];

describe("mapNonEmpty", () => {
  it("data-first returns NonEmptyArray", () => {
    expect(A.mapNonEmpty(nonEmpty, (x) => String(x))).type.toBe<A.NonEmptyArray<string>>();
  });

  it("data-last returns NonEmptyArray", () => {
    expect(
      pipe(
        nonEmpty,
        A.mapNonEmpty((x) => String(x))
      )
    ).type.toBe<A.NonEmptyArray<string>>();
  });

  it("callback receives element and index", () => {
    A.mapNonEmpty(nonEmpty, (a, i) => {
      expect(a).type.toBe<number>();
      expect(i).type.toBe<number>();
      return a;
    });
  });
});

describe("flatMapNonEmpty", () => {
  it("data-first returns NonEmptyArray", () => {
    expect(A.flatMapNonEmpty(nonEmpty, (x): A.NonEmptyReadonlyArray<string> => [String(x)])).type.toBe<
      A.NonEmptyArray<string>
    >();
  });

  it("data-last returns NonEmptyArray", () => {
    expect(
      pipe(
        nonEmpty,
        A.flatMapNonEmpty((x): A.NonEmptyReadonlyArray<string> => [String(x)])
      )
    ).type.toBe<A.NonEmptyArray<string>>();
  });
});

describe("mapNonEmptyReadonly", () => {
  it("data-first returns NonEmptyReadonlyArray", () => {
    expect(A.mapNonEmptyReadonly(nonEmpty, (x) => String(x))).type.toBe<A.NonEmptyReadonlyArray<string>>();
  });

  it("data-last returns NonEmptyReadonlyArray", () => {
    expect(
      pipe(
        nonEmpty,
        A.mapNonEmptyReadonly((x) => String(x))
      )
    ).type.toBe<A.NonEmptyReadonlyArray<string>>();
  });
});

describe("flatMapNonEmptyReadonly", () => {
  it("data-first returns NonEmptyReadonlyArray", () => {
    expect(A.flatMapNonEmptyReadonly(nonEmpty, (x): A.NonEmptyReadonlyArray<string> => [String(x)])).type.toBe<
      A.NonEmptyReadonlyArray<string>
    >();
  });

  it("data-last returns NonEmptyReadonlyArray", () => {
    expect(
      pipe(
        nonEmpty,
        A.flatMapNonEmptyReadonly((x): A.NonEmptyReadonlyArray<string> => [String(x)])
      )
    ).type.toBe<A.NonEmptyReadonlyArray<string>>();
  });
});
