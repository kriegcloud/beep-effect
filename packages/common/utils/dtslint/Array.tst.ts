import {Array} from "@beep/utils";
import {pipe} from "effect/Function";
import {describe, expect, it} from "tstyche";

const nonEmpty: Array.NonEmptyReadonlyArray<number> = [1, 2, 3];

describe("mapNonEmpty", () => {
	it("data-first returns NonEmptyArray", () => {
		expect(Array.mapNonEmpty(nonEmpty, (x) => String(x))).type.toBe<Array.NonEmptyArray<string>>();
	});

	it("data-last returns NonEmptyArray", () => {
		expect(pipe(nonEmpty, Array.mapNonEmpty((x) => String(x)))).type.toBe<Array.NonEmptyArray<string>>();
	});

	it("callback receives element and index", () => {
		Array.mapNonEmpty(nonEmpty, (a, i) => {
			expect(a).type.toBe<number>();
			expect(i).type.toBe<number>();
			return a;
		});
	});
});

describe("flatMapNonEmpty", () => {
	it("data-first returns NonEmptyArray", () => {
		expect(
			Array.flatMapNonEmpty(nonEmpty, (x): Array.NonEmptyReadonlyArray<string> => [String(x)])
		).type.toBe<Array.NonEmptyArray<string>>();
	});

	it("data-last returns NonEmptyArray", () => {
		expect(
			pipe(nonEmpty, Array.flatMapNonEmpty((x): Array.NonEmptyReadonlyArray<string> => [String(x)]))
		).type.toBe<Array.NonEmptyArray<string>>();
	});
});

describe("mapNonEmptyReadonly", () => {
	it("data-first returns NonEmptyReadonlyArray", () => {
		expect(
			Array.mapNonEmptyReadonly(nonEmpty, (x) => String(x))
		).type.toBe<Array.NonEmptyReadonlyArray<string>>();
	});

	it("data-last returns NonEmptyReadonlyArray", () => {
		expect(
			pipe(nonEmpty, Array.mapNonEmptyReadonly((x) => String(x)))
		).type.toBe<Array.NonEmptyReadonlyArray<string>>();
	});
});

describe("flatMapNonEmptyReadonly", () => {
	it("data-first returns NonEmptyReadonlyArray", () => {
		expect(
			Array.flatMapNonEmptyReadonly(nonEmpty, (x): Array.NonEmptyReadonlyArray<string> => [String(x)])
		).type.toBe<Array.NonEmptyReadonlyArray<string>>();
	});

	it("data-last returns NonEmptyReadonlyArray", () => {
		expect(
			pipe(nonEmpty, Array.flatMapNonEmptyReadonly((x): Array.NonEmptyReadonlyArray<string> => [String(x)]))
		).type.toBe<Array.NonEmptyReadonlyArray<string>>();
	});
});
