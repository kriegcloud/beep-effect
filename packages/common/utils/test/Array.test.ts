import {Array} from "@beep/utils";
import {pipe} from "effect/Function";
import {describe, expect, it} from "vitest";

const nonEmpty: Array.NonEmptyReadonlyArray<number> = [1, 2, 3];

describe("@beep/utils Array.mapNonEmpty", () => {
	it("data-first: maps elements", () => {
		const result = Array.mapNonEmpty(nonEmpty, (x) => x * 2);
		expect(result).toEqual([2, 4, 6]);
	});

	it("data-last: maps elements", () => {
		const result = pipe(nonEmpty, Array.mapNonEmpty((x) => x * 2));
		expect(result).toEqual([2, 4, 6]);
	});

	it("provides index to callback", () => {
		const result = Array.mapNonEmpty(nonEmpty, (_, i) => i);
		expect(result).toEqual([0, 1, 2]);
	});

	it("throws on empty array at runtime", () => {
		const empty: Array.NonEmptyReadonlyArray<number> = [] as unknown as Array.NonEmptyReadonlyArray<number>;
		expect(() => Array.mapNonEmpty(empty, (x) => x)).toThrow();
	});
});

describe("@beep/utils Array.flatMapNonEmpty", () => {
	it("data-first: flatMaps elements", () => {
		const result = Array.flatMapNonEmpty(nonEmpty, (x): Array.NonEmptyReadonlyArray<number> => [x, x * 2]);
		expect(result).toEqual([1, 2, 2, 4, 3, 6]);
	});

	it("data-last: flatMaps elements", () => {
		const result = pipe(nonEmpty, Array.flatMapNonEmpty((x): Array.NonEmptyReadonlyArray<number> => [x, x * 2]));
		expect(result).toEqual([1, 2, 2, 4, 3, 6]);
	});

	it("provides index to callback", () => {
		const result = Array.flatMapNonEmpty(nonEmpty, (_, i): Array.NonEmptyReadonlyArray<number> => [i]);
		expect(result).toEqual([0, 1, 2]);
	});

	it("throws on empty array at runtime", () => {
		const empty: Array.NonEmptyReadonlyArray<number> = [] as unknown as Array.NonEmptyReadonlyArray<number>;
		expect(() => Array.flatMapNonEmpty(empty, (x): Array.NonEmptyReadonlyArray<number> => [x])).toThrow();
	});
});

describe("@beep/utils Array.mapNonEmptyReadonly", () => {
	it("data-first: maps elements", () => {
		const result = Array.mapNonEmptyReadonly(nonEmpty, (x) => x * 2);
		expect(result).toEqual([2, 4, 6]);
	});

	it("data-last: maps elements", () => {
		const result = pipe(nonEmpty, Array.mapNonEmptyReadonly((x) => x * 2));
		expect(result).toEqual([2, 4, 6]);
	});

	it("throws on empty array at runtime", () => {
		const empty: Array.NonEmptyReadonlyArray<number> = [] as unknown as Array.NonEmptyReadonlyArray<number>;
		expect(() => Array.mapNonEmptyReadonly(empty, (x) => x)).toThrow();
	});
});

describe("@beep/utils Array.flatMapNonEmptyReadonly", () => {
	it("data-first: flatMaps elements", () => {
		const result = Array.flatMapNonEmptyReadonly(nonEmpty, (x): Array.NonEmptyReadonlyArray<number> => [x, x * 2]);
		expect(result).toEqual([1, 2, 2, 4, 3, 6]);
	});

	it("data-last: flatMaps elements", () => {
		const result = pipe(nonEmpty, Array.flatMapNonEmptyReadonly((x): Array.NonEmptyReadonlyArray<number> => [x, x * 2]));
		expect(result).toEqual([1, 2, 2, 4, 3, 6]);
	});

	it("throws on empty array at runtime", () => {
		const empty: Array.NonEmptyReadonlyArray<number> = [] as unknown as Array.NonEmptyReadonlyArray<number>;
		expect(() => Array.flatMapNonEmptyReadonly(empty, (x): Array.NonEmptyReadonlyArray<number> => [x])).toThrow();
	});
});
