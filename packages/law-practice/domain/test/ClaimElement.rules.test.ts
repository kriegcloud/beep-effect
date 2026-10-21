import { antecedentPolicy, decomposeClaim } from "@beep/law-practice-domain/values/ClaimElement";
import { PatentClaim } from "@beep/law-practice-domain/values/PatentDocument";
import { it } from "@beep/test-runner";
import { fcRuns } from "@beep/test-utils";
import { assert, describe } from "@effect/vitest";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { failureFixtures, ruleFixtures } from "./claimElementFixtures.ts";

const segmentSample = Arbitrary.all({
  determiner: Arbitrary.schema(S.Literals(["a", "an", "the", "said", "at least one", "a plurality of"])),
  head: Arbitrary.schema(S.Literals(["sensor", "first sensor", "sensors", "lens", "housing"])),
  tail: Arbitrary.schema(S.Literals(["", " coupled to the sensor", " comprising:", " mounted in the housing"])),
});

const generatedClaim = Arbitrary.map(
  Arbitrary.array(segmentSample, { minLength: 1, maxLength: 6 }),
  (segments): PatentClaim => {
    const body = `${A.join(
      A.map(segments, ({ determiner, head, tail }) => `${determiner} ${head}${tail}`),
      "; "
    )}.`;
    return PatentClaim.cases.independent.make({
      claimNumber: 1,
      claimText: `A system comprising: ${body}`,
      preamble: "A system",
      transition: "comprising",
      body,
    });
  }
);

describe("ClaimElement rules", () => {
  it.effect("abstains explicitly for a dense dependency DAG instead of expanding every path", () =>
    Effect.gen(function* () {
      const first = PatentClaim.cases.independent.make({
        claimNumber: 1,
        claimText: "A system comprising a sensor.",
        preamble: "A system",
        transition: "comprising",
        body: "a sensor.",
      });
      const claims = A.prepend(
        A.map(A.range(2, 25), (claimNumber) =>
          PatentClaim.cases.dependent.make({
            claimNumber,
            claimReferences: A.range(1, claimNumber - 1),
            claimText: `The system of claims 1 through ${claimNumber - 1} wherein the sensor operates.`,
            preamble: `The system of claims 1 through ${claimNumber - 1}`,
            transition: "wherein",
            body: "the sensor operates.",
          })
        ),
        first
      );
      const tree = yield* decomposeClaim(A.lastNonEmpty(claims), claims);
      const findings = antecedentPolicy([tree], claims);
      assert.isTrue(A.isReadonlyArrayNonEmpty(findings));
      assert.isTrue(
        A.every(findings, ({ kind, rule }) => kind === "pattern-not-covered" && rule === "chain-work-limit")
      );
      assert.deepStrictEqual(antecedentPolicy([tree], claims), findings);
    })
  );

  it.effect("caps dependency depth while preserving a resolvable linear-chain control", () =>
    Effect.gen(function* () {
      const first = PatentClaim.cases.independent.make({
        claimNumber: 1,
        claimText: "A system comprising a sensor; and a controller coupled to the sensor.",
        preamble: "A system",
        transition: "comprising",
        body: "a sensor; and a controller coupled to the sensor.",
      });
      const claims = A.prepend(
        A.map(A.range(2, 129), (claimNumber) =>
          PatentClaim.cases.dependent.make({
            claimNumber,
            claimReferences: [claimNumber - 1],
            claimText: `A system of claim ${claimNumber - 1} wherein a sensor; and a controller coupled to the sensor.`,
            preamble: `A system of claim ${claimNumber - 1}`,
            transition: "wherein",
            body: "a sensor; and a controller coupled to the sensor.",
          })
        ),
        first
      );
      const controlClaim = O.getOrThrow(A.findFirst(claims, ({ claimNumber }) => claimNumber === 64));
      const control = yield* decomposeClaim(controlClaim, claims);
      assert.deepStrictEqual(antecedentPolicy([control], claims), []);
      const deep = yield* decomposeClaim(A.lastNonEmpty(claims), claims);
      const findings = antecedentPolicy([deep], claims);
      assert.isTrue(A.isReadonlyArrayNonEmpty(findings));
      assert.isTrue(
        A.every(findings, ({ kind, rule }) => kind === "pattern-not-covered" && rule === "chain-work-limit")
      );
    })
  );

  it.effect("shares evaluation work across trees and resets the budget for a new invocation", () =>
    Effect.gen(function* () {
      const claims = A.map(A.range(1, 64), (claimNumber) =>
        PatentClaim.cases.independent.make({
          claimNumber,
          claimText: "A system comprising a sensor; and a controller coupled to the sensor.",
          preamble: "A system",
          transition: "comprising",
          body: "a sensor; and a controller coupled to the sensor.",
        })
      );
      const trees = yield* Effect.forEach(claims, (claim) => decomposeClaim(claim, claims));
      for (const tree of trees) assert.deepStrictEqual(antecedentPolicy([tree], claims), []);
      const findings = antecedentPolicy(trees, claims);
      assert.isTrue(A.isReadonlyArrayNonEmpty(findings));
      assert.isTrue(
        A.every(findings, ({ kind, rule }) => kind === "pattern-not-covered" && rule === "chain-work-limit")
      );
      assert.deepStrictEqual(antecedentPolicy(trees, claims), findings);
      for (const tree of trees) assert.deepStrictEqual(antecedentPolicy([tree], claims), []);
    })
  );

  for (const fixture of ruleFixtures) {
    it.effect(`fixture ${fixture.id}: ${fixture.rule}`, () =>
      Effect.gen(function* () {
        const trees = yield* Effect.forEach(fixture.trees, (expected) =>
          Effect.gen(function* () {
            const claim = O.getOrThrow(
              A.findFirst(fixture.context, ({ claimNumber }) => claimNumber === expected.claimNumber)
            );
            const actual = yield* decomposeClaim(claim, fixture.context);
            assert.deepStrictEqual(actual, expected);
            assert.isTrue(Equal.equals(actual, expected));
            return actual;
          })
        );
        assert.deepStrictEqual(antecedentPolicy(trees, fixture.claims), fixture.findings);
      })
    );
  }

  for (const fixture of failureFixtures) {
    it.effect(`fixture ${fixture.id}: ${fixture.rule}`, () =>
      Effect.gen(function* () {
        const error = yield* Effect.flip(decomposeClaim(fixture.claim, fixture.claims));
        assert.strictEqual(error._tag, "ClaimDecompositionError");
        assert.strictEqual(error.reason, fixture.reason);
        assert.strictEqual(error.claimNumber, fixture.claim.claimNumber);
      })
    );
  }

  it.effect("participle-boundary keeps -eed and short words in the head", () =>
    Effect.gen(function* () {
      const body = "a high speed sensor; and a bed frame coupled to the high speed sensor.";
      const claim = PatentClaim.cases.independent.make({
        claimNumber: 1,
        claimText: `A system comprising: ${body}`,
        preamble: "A system",
        transition: "comprising",
        body,
      });
      const tree = yield* decomposeClaim(claim, [claim]);
      const heads = A.flatMap(tree.elements, ({ terms }) => A.map(terms, ({ head }) => head));
      assert.deepStrictEqual(heads, ["system", "high speed sensor", "bed frame", "high speed sensor"]);
      assert.deepStrictEqual(antecedentPolicy([tree], [claim]), []);
    })
  );

  it.effect.prop(
    "decomposes and checks the same claim identically twice",
    { claim: generatedClaim },
    ({ claim }) =>
      Effect.gen(function* () {
        const first = yield* decomposeClaim(claim, [claim]);
        const second = yield* decomposeClaim(claim, [claim]);
        assert.isTrue(Equal.equals(first, second));
        assert.deepStrictEqual(antecedentPolicy([first], [claim]), antecedentPolicy([second], [claim]));
      }),
    { arbitrary: fcRuns(50) }
  );
});
