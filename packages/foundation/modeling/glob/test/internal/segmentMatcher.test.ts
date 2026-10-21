import { Minimatch } from "@beep/glob/internal/minimatch";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { Minimatch as OracleMinimatch } from "minimatch";

const repeatedSegmentPatterns = [
  "*+(a)",
  ".?*(a)",
  "[.]*(a)",
  "?(*(a)|b)",
  "*(|a)",
  "*(a|[[:alpha:]])",
  "*([[:alpha:]]|a)",
  "[[:alpha:]]*(a)",
  "!(a)*(b)",
  "!(a*(b))",
  "!(a*(b)c)",
  "a!(*(b))",
  "*(a)!()",
  "*(a)!(b)",
  "*(a)@(b|c)",
  "?(*(a)b)",
  "*(!(a))",
  "*(!())",
  "!(+(a))",
  "+(!(a|b))",
];

const repeatedSegmentCandidates = ["", ".", "..", ".a", "a", "b", "aa", "ab", "ac", "abc", "a.b", "a/b", "A", "é", "α"];

const assertRepeatedSegmentParity = (pattern: string, dot: boolean, nocase: boolean) => {
  const options = { dot, nocase, nonegate: true };
  const actual = new Minimatch(pattern, options);
  const expected = new OracleMinimatch(pattern, options);
  for (const candidate of repeatedSegmentCandidates) {
    assert.strictEqual(
      actual.match(candidate),
      expected.match(candidate),
      `${pattern}, ${candidate}, dot=${dot}, nocase=${nocase}`
    );
  }
};

it.effect("repeated segments preserve contextual dots, negation tails, optional branches and Unicode classes", () =>
  Effect.sync(() => {
    for (const pattern of repeatedSegmentPatterns)
      for (const dot of [false, true])
        for (const nocase of [false, true]) assertRepeatedSegmentParity(pattern, dot, nocase);
  })
);
