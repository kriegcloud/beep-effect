/**
 * Property-based tests ("proofs") for NLP-specific monoid laws.
 *
 * Verifies the NLP monoids satisfy the monoid laws. Note: `SentenceConcat` is a
 * "near-monoid" — it satisfies the identity laws but NOT strict associativity
 * (punctuation normalization is not associative), so only identity is asserted
 * for it, exactly as in the source `adjunct` suite.
 *
 * Ported from the `adjunct` repo (fast-check) to Effect v4's
 * `effect/testing/FastCheck`.
 */

import { describe, expect, it } from "@effect/vitest";
import { FastCheck as fc } from "effect/testing";
import * as NLP from "../../src/Algebra/NLPMonoid.ts";
import type { BagOfWords } from "../../src/Algebra/NLPMonoid.ts";

const testMonoidLaws = <A>(
  name: string,
  monoid: { empty: A; combine: (x: A, y: A) => A },
  arbitrary: fc.Arbitrary<A>,
  equals: (a: A, b: A) => boolean = (a, b) => a === b
) => {
  describe(`${name} Monoid Laws`, () => {
    it("satisfies left identity", () => {
      fc.assert(fc.property(arbitrary, (x) => equals(monoid.combine(monoid.empty, x), x)));
    });
    it("satisfies right identity", () => {
      fc.assert(fc.property(arbitrary, (x) => equals(monoid.combine(x, monoid.empty), x)));
    });
    it("satisfies associativity", () => {
      fc.assert(
        fc.property(arbitrary, arbitrary, arbitrary, (x, y, z) => {
          const left = monoid.combine(monoid.combine(x, y), z);
          const right = monoid.combine(x, monoid.combine(y, z));
          return equals(left, right);
        })
      );
    });
  });
};

// Token monoids
describe("Token Monoids", () => {
  testMonoidLaws("TokenConcat", NLP.TokenConcat, fc.string());

  describe("TokenBagOfWords", () => {
    const bowArbitrary: fc.Arbitrary<BagOfWords> = fc
      .dictionary(fc.string(), fc.integer({ min: 1, max: 100 }))
      .map((dict) => new Map(Object.entries(dict)));
    const bowEquals = (a: BagOfWords, b: BagOfWords): boolean => {
      if (a.size !== b.size) return false;
      for (const [key, value] of a) {
        if (b.get(key) !== value) return false;
      }
      return true;
    };
    testMonoidLaws("TokenBagOfWords", NLP.TokenBagOfWords, bowArbitrary, bowEquals);
  });

  describe("TokenSetUnion", () => {
    const setArbitrary: fc.Arbitrary<ReadonlySet<string>> = fc.array(fc.string()).map((arr) => new Set(arr));
    const setEquals = (a: ReadonlySet<string>, b: ReadonlySet<string>): boolean => {
      if (a.size !== b.size) return false;
      for (const elem of a) {
        if (!b.has(elem)) return false;
      }
      return true;
    };
    testMonoidLaws("TokenSetUnion", NLP.TokenSetUnion, setArbitrary, setEquals);
  });
});

// Sentence monoids
describe("Sentence Monoids", () => {
  describe("SentenceConcat (near-monoid: identity only)", () => {
    it("satisfies left identity", () => {
      fc.assert(fc.property(fc.string(), (x) => NLP.SentenceConcat.combine(NLP.SentenceConcat.empty, x) === x));
    });
    it("satisfies right identity", () => {
      fc.assert(fc.property(fc.string(), (x) => NLP.SentenceConcat.combine(x, NLP.SentenceConcat.empty) === x));
    });
  });

  testMonoidLaws(
    "SentenceArray",
    NLP.SentenceArray,
    fc.array(fc.string()),
    (a, b) => a.length === b.length && a.every((x, i) => x === b[i])
  );
});

// Document monoids
describe("Document Monoids", () => {
  testMonoidLaws("DocumentText", NLP.DocumentText, fc.string());

  describe("DocumentStats", () => {
    const statsArbitrary = fc.record({
      wordCount: fc.integer({ min: 0, max: 1000 }),
      sentenceCount: fc.integer({ min: 0, max: 100 }),
      charCount: fc.integer({ min: 0, max: 10000 }),
    });
    const statsEquals = (a: NLP.DocumentStatistics, b: NLP.DocumentStatistics): boolean =>
      a.wordCount === b.wordCount && a.sentenceCount === b.sentenceCount && a.charCount === b.charCount;
    testMonoidLaws("DocumentStats", NLP.DocumentStats, statsArbitrary, statsEquals);
  });
});

// Linguistic monoids
describe("Linguistic Monoids", () => {
  describe("AnnotationMap", () => {
    const annotationArbitrary: fc.Arbitrary<Map<number, string>> = fc
      .array(fc.tuple(fc.integer(), fc.string()))
      .map((pairs) => new Map(pairs));
    const annotationEquals = (a: Map<number, string>, b: Map<number, string>): boolean => {
      if (a.size !== b.size) return false;
      for (const [key, value] of a) {
        if (b.get(key) !== value) return false;
      }
      return true;
    };
    testMonoidLaws("AnnotationMap", NLP.AnnotationMap<number, string>(), annotationArbitrary, annotationEquals);
  });
});

// Utility functions
describe("Utility Functions", () => {
  it("bagOfWordsToTF normalizes frequencies", () => {
    const bow: BagOfWords = new Map([
      ["the", 2],
      ["cat", 1],
      ["sat", 1],
    ]);
    const tf = NLP.bagOfWordsToTF(bow);
    expect(tf.get("the")).toBeCloseTo(0.5);
    expect(tf.get("cat")).toBeCloseTo(0.25);
    expect(tf.get("sat")).toBeCloseTo(0.25);
  });

  it("computeTFIDF calculates TF-IDF scores", () => {
    const tf = new Map([
      ["common", 0.5],
      ["rare", 0.1],
    ]);
    const df = new Map([
      ["common", 100],
      ["rare", 1],
    ]);
    const tfidf = NLP.computeTFIDF(tf, df, 100);
    expect(tfidf.get("common")).toBeCloseTo(0);
    expect(tfidf.get("rare")).toBeGreaterThan(0);
  });
});
