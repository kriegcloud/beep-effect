/**
 * Property-based tests ("proofs") for NLP-specific monoid laws.
 *
 * Verifies the NLP monoids satisfy the monoid laws. Note: `SentenceConcat` is a
 * "near-monoid" — it satisfies the identity laws but NOT strict associativity
 * (punctuation normalization is not associative), so only identity is asserted
 * for it, exactly as in the legacy property suite.
 *
 * Property-based coverage for Effect v4's
 * `effect/testing/FastCheck`.
 */

import * as NLP from "@beep/nlp/Algebra/NLPMonoid";
import { describe, expect, it } from "@effect/vitest";
import * as HashSet from "effect/HashSet";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as R from "effect/Record";
import { FastCheck as fc } from "effect/testing";
import type { BagOfWords } from "@beep/nlp/Algebra/NLPMonoid";

const mutableHashMapEquals = <K, V>(
  a: MutableHashMap.MutableHashMap<K, V>,
  b: MutableHashMap.MutableHashMap<K, V>
): boolean => {
  if (MutableHashMap.size(a) !== MutableHashMap.size(b)) return false;
  for (const [key, value] of a) {
    if (!O.contains(MutableHashMap.get(b, key), value)) return false;
  }
  return true;
};

const lookupNumber = (map: MutableHashMap.MutableHashMap<string, number>, key: string): number =>
  O.getOrElse(MutableHashMap.get(map, key), () => -1);

const hashSetEquals = <A>(a: HashSet.HashSet<A>, b: HashSet.HashSet<A>): boolean => {
  if (HashSet.size(a) !== HashSet.size(b)) return false;
  for (const elem of a) {
    if (!HashSet.has(b, elem)) return false;
  }
  return true;
};

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
      .map((dict) => MutableHashMap.fromIterable(R.toEntries(dict)));
    testMonoidLaws("TokenBagOfWords", NLP.TokenBagOfWords, bowArbitrary, mutableHashMapEquals);
  });

  describe("TokenSetUnion", () => {
    const setArbitrary: fc.Arbitrary<HashSet.HashSet<string>> = fc.array(fc.string()).map(HashSet.fromIterable);
    testMonoidLaws("TokenSetUnion", NLP.TokenSetUnion, setArbitrary, hashSetEquals);
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
    const annotationArbitrary: fc.Arbitrary<MutableHashMap.MutableHashMap<number, string>> = fc
      .array(fc.tuple(fc.integer(), fc.string()))
      .map(MutableHashMap.fromIterable);
    testMonoidLaws("AnnotationMap", NLP.AnnotationMap<number, string>(), annotationArbitrary, mutableHashMapEquals);
  });
});

// Utility functions
describe("Utility Functions", () => {
  it("bagOfWordsToTF normalizes frequencies", () => {
    const bow: BagOfWords = MutableHashMap.make(["the", 2], ["cat", 1], ["sat", 1]);
    const tf = NLP.bagOfWordsToTF(bow);
    expect(lookupNumber(tf, "the")).toBeCloseTo(0.5);
    expect(lookupNumber(tf, "cat")).toBeCloseTo(0.25);
    expect(lookupNumber(tf, "sat")).toBeCloseTo(0.25);
  });

  it("computeTFIDF calculates TF-IDF scores", () => {
    const tf = MutableHashMap.make(["common", 0.5], ["rare", 0.1]);
    const df = MutableHashMap.make(["common", 100], ["rare", 1]);
    const tfidf = NLP.computeTFIDF(tf, df, 100);
    expect(lookupNumber(tfidf, "common")).toBeCloseTo(0);
    expect(lookupNumber(tfidf, "rare")).toBeGreaterThan(0);
  });
});
