import {
  AntecedentPolicyInput,
  antecedentPolicy,
  DecomposeClaimInput,
  decomposeClaim,
} from "@beep/law-practice-domain/values/ClaimElement";
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
import type { ClaimElementTree } from "@beep/law-practice-domain/values/ClaimElement";
import type { PatentClaims } from "@beep/law-practice-domain/values/PatentDocument";

// Fixtures 15, 20 and 21 read deliberately inconsistent claim sets to reach the
// defensive paths, so their inputs skip the claim-set structure check.
const fixtureDecompose = (claim: PatentClaim, claims: PatentClaims) =>
  decomposeClaim(DecomposeClaimInput.make({ claim, claims }, { disableChecks: true }));
const fixturePolicy = (trees: ReadonlyArray<ClaimElementTree>, claims: PatentClaims) =>
  antecedentPolicy(AntecedentPolicyInput.make({ trees, claims }, { disableChecks: true }));
const decomposeAlone = (claim: PatentClaim) => decomposeClaim(DecomposeClaimInput.make({ claim, claims: [claim] }));
const policyAlone = (tree: ClaimElementTree, claim: PatentClaim) =>
  antecedentPolicy(AntecedentPolicyInput.make({ trees: [tree], claims: [claim] }));

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
  for (const fixture of ruleFixtures) {
    it.effect(`fixture ${fixture.id}: ${fixture.rule}`, () =>
      Effect.gen(function* () {
        const trees = yield* Effect.forEach(fixture.trees, (expected) =>
          Effect.gen(function* () {
            const claim = O.getOrThrow(
              A.findFirst(fixture.context, ({ claimNumber }) => claimNumber === expected.claimNumber)
            );
            const actual = yield* fixtureDecompose(claim, fixture.context);
            assert.deepStrictEqual(actual, expected);
            assert.isTrue(Equal.equals(actual, expected));
            return actual;
          })
        );
        assert.deepStrictEqual(fixturePolicy(trees, fixture.claims), fixture.findings);
      })
    );
  }

  for (const fixture of failureFixtures) {
    it.effect(`fixture ${fixture.id}: ${fixture.rule}`, () =>
      Effect.gen(function* () {
        const error = yield* Effect.flip(fixtureDecompose(fixture.claim, fixture.claims));
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
      const tree = yield* decomposeAlone(claim);
      const heads = A.flatMap(tree.elements, ({ terms }) => A.map(terms, ({ head }) => head));
      assert.deepStrictEqual(heads, ["system", "high speed sensor", "bed frame", "high speed sensor"]);
      assert.deepStrictEqual(policyAlone(tree, claim), []);
    })
  );

  it.effect.prop(
    "decomposes and checks the same claim identically twice",
    { claim: generatedClaim },
    ({ claim }) =>
      Effect.gen(function* () {
        const first = yield* decomposeAlone(claim);
        const second = yield* decomposeAlone(claim);
        assert.isTrue(Equal.equals(first, second));
        assert.deepStrictEqual(policyAlone(first, claim), policyAlone(second, claim));
      }),
    { arbitrary: fcRuns(50) }
  );
});
