import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { deepEqual } from "@beep/utils/equality/deepEqual";
import * as Effect from "effect/Effect";

effect("deepEqual compares primitives, arrays, and objects", () =>
  Effect.gen(function* () {
    expect(deepEqual({ a: 1 }, { a: 1 })).toBe(true);
    expect(deepEqual({ a: 1 }, { a: 2 })).toBe(false);

    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);

    expect(deepEqual(Number.NaN, Number.NaN)).toBe(true);
    expect(deepEqual(undefined, null)).toBe(false);
  })
);

effect("deepEqual handles dates, symbols, bigints, sets, and maps", () =>
  Effect.gen(function* () {
    expect(deepEqual(new Date("2024-01-01"), new Date("2024-01-01"))).toBe(true);
    expect(deepEqual(Symbol.for("a"), Symbol.for("a"))).toBe(true);
    expect(deepEqual(1n, 1n)).toBe(true);

    const setA = new Set([1, 2]);
    const setB = new Set([1, 2]);
    const setC = new Set([2, 3]);

    expect(deepEqual(setA, setB)).toBe(true);
    expect(deepEqual(setA, setC)).toBe(false);

    const mapA = new Map<string, number>([
      ["x", 1],
      ["y", 2],
    ]);
    const mapB = new Map<string, number>([
      ["x", 1],
      ["y", 2],
    ]);
    const mapC = new Map<string, number>([
      ["x", 1],
      ["y", 3],
    ]);

    expect(deepEqual(mapA, mapB)).toBe(true);
    expect(deepEqual(mapA, mapC)).toBe(false);
  })
);

effect("deepEqual supports ArrayBuffer, DataView, and typed arrays", () =>
  Effect.gen(function* () {
    const bufferA = new Uint8Array([1, 2, 3]).buffer;
    const bufferB = new Uint8Array([1, 2, 3]).buffer;
    const bufferC = new Uint8Array([1, 2, 4]).buffer;

    expect(deepEqual(bufferA, bufferB)).toBe(true);
    expect(deepEqual(bufferA, bufferC)).toBe(false);

    const viewA = new DataView(bufferA);
    const viewB = new DataView(bufferB);
    const viewC = new DataView(bufferC);

    expect(deepEqual(viewA, viewB)).toBe(true);
    expect(deepEqual(viewA, viewC)).toBe(false);

    const typedA = new Uint16Array([5, 6]);
    const typedB = new Uint16Array([5, 6]);
    const typedC = new Uint16Array([5, 7]);

    expect(deepEqual(typedA, typedB)).toBe(true);
    expect(deepEqual(typedA, typedC)).toBe(false);
  })
);

effect("deepEqual detects prototype differences and cycles", () =>
  Effect.gen(function* () {
    const base = { value: 1 };
    const withProto = Object.create({ proto: true });
    withProto.value = 1;

    expect(deepEqual(base, withProto)).toBe(false);

    const a: { self?: unknown } = {};
    const b: { self?: unknown } = {};
    a.self = a;
    b.self = b;

    expect(deepEqual(a, b)).toBe(true);
  })
);

effect("deepEqual covers mismatch branches across collections", () =>
  Effect.gen(function* () {
    expect(deepEqual([1, 2], [1, 3])).toBe(false);

    const bufferShort = new Uint8Array([1, 2]).buffer;
    const bufferLong = new Uint8Array([1, 2, 3]).buffer;
    expect(deepEqual(bufferShort, bufferLong)).toBe(false);

    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEqual(/abc/i, /abc/g)).toBe(false);
    expect(deepEqual(new Set([1, 2, 3]), new Set([1, 2]))).toBe(false);
    expect(
      deepEqual(
        new Map([["a", 1]]),
        new Map([
          ["a", 1],
          ["b", 2],
        ])
      )
    ).toBe(false);
    expect(deepEqual(new Int8Array([1, 2]), new Int8Array([1, 2, 3]))).toBe(false);
  })
);
