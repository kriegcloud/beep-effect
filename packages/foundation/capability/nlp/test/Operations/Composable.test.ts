/**
 * Proofs for the composable Operations algebra: Functor identity/composition,
 * Monad left/right identity + associativity, Applicative product/zipWith, and the
 * traverse/aggregate helpers. Laws are checked over `string -> number` style
 * operations so the categorical structure is verified without NLP coupling.
 *
 * Ported from the `adjunct` repo's composable-operations design to Effect v4 +
 * `@effect/vitest`.
 */

import * as Monoid from "@beep/nlp/Algebra/Monoid";
import * as Composable from "@beep/nlp/Operations/Composable";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const len = Composable.makeOperation("len", S.String, S.Number, (s) => Effect.succeed(s.length));
const inc = Composable.makeOperation("inc", S.Number, S.Number, (n) => Effect.succeed(n + 1));
const dbl = Composable.makeOperation("dbl", S.Number, S.Number, (n) => Effect.succeed(n * 2));

describe("Functor laws", () => {
  it.effect(
    "identity: map(id) = id",
    Effect.fn(function* () {
      const mapped = yield* len.map((n) => n, S.Number).run("hello");
      const direct = yield* len.run("hello");
      expect(mapped).toBe(direct);
    })
  );

  it.effect(
    "composition: map(g ∘ f) = map(g) ∘ map(f)",
    Effect.fn(function* () {
      const f = (n: number) => n + 1;
      const g = (n: number) => n * 3;
      const composed = yield* len.map((n) => g(f(n)), S.Number).run("abcd");
      const sequential = yield* len.map(f, S.Number).map(g, S.Number).run("abcd");
      expect(composed).toBe(sequential);
    })
  );
});

describe("Monad laws", () => {
  it.effect(
    "left identity: pure(a).flatMap(f) = f(a)",
    Effect.fn(function* () {
      const viaFlatMap = yield* len.flatMap(inc).run("hey");
      const direct = yield* inc.run("hey".length);
      expect(viaFlatMap).toBe(direct);
    })
  );

  it.effect(
    "right identity: m.flatMap(pure) = m",
    Effect.fn(function* () {
      const idOp = Composable.identity(S.Number);
      const viaFlatMap = yield* len.flatMap(idOp).run("hello");
      const direct = yield* len.run("hello");
      expect(viaFlatMap).toBe(direct);
    })
  );

  it.effect(
    "associativity: (m.flatMap(f)).flatMap(g) = m.flatMap(x => f(x).flatMap(g))",
    Effect.fn(function* () {
      const left = yield* len.flatMap(inc).flatMap(dbl).run("abcd");
      const right = yield* len.flatMap(inc.flatMap(dbl)).run("abcd");
      expect(left).toBe(right);
    })
  );
});

describe("Applicative", () => {
  it.effect(
    "product runs both operations on the same input",
    Effect.fn(function* () {
      const lenA = Composable.makeOperation("lenA", S.String, S.Number, (s) => Effect.succeed(s.length));
      const lenB = Composable.makeOperation("lenB", S.String, S.Number, (s) => Effect.succeed(s.length * 10));
      const paired = lenA.product(lenB, S.Tuple([S.Number, S.Number]));
      const [a, b] = yield* paired.run("abc");
      expect(a).toBe(3);
      expect(b).toBe(30);
      expect(paired.name).toContain("lenA");
    })
  );

  it.effect(
    "zipWith combines both results with a function",
    Effect.fn(function* () {
      const lenA = Composable.makeOperation("lenA", S.String, S.Number, (s) => Effect.succeed(s.length));
      const lenB = Composable.makeOperation("lenB", S.String, S.Number, (s) => Effect.succeed(s.length * 10));
      const summed = lenA.zipWith(lenB, (a, b) => a + b, S.Number);
      expect(yield* summed.run("abc")).toBe(33);
    })
  );
});

describe("compose + traverse + aggregate", () => {
  it.effect(
    "compose threads output into the next operation's input",
    Effect.fn(function* () {
      const pipeline = Composable.compose(len, inc);
      expect(yield* pipeline.run("hello")).toBe(6);
    })
  );

  it.effect(
    "traverse maps an operation over an array of inputs",
    Effect.fn(function* () {
      const lengths = yield* Composable.traverse(len)(["a", "bb", "ccc"]);
      expect(lengths).toEqual([1, 2, 3]);
    })
  );

  it("aggregate folds values with a monoid", () => {
    const total = Composable.aggregate(Monoid.NumberSum, (s: string) => s.length)(["a", "bb", "ccc"]);
    expect(total).toBe(6);
  });
});
