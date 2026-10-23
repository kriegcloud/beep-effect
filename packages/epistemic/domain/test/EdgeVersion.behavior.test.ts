import {
  EdgeEndpoint,
  flattenEdgeSource,
  flattenEdgeTarget,
  unflattenEdgeSource,
  unflattenEdgeTarget,
} from "@beep/epistemic-domain";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import { assertNone, assertSome } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const cases = [
  { endpoint: { kind: "claim", claimId: 17 }, references: [17, undefined, undefined, undefined] },
  { endpoint: { kind: "evidence", evidenceId: 23 }, references: [undefined, undefined, 23, undefined] },
  {
    endpoint: { kind: "entity", entityRef: "entity:patent-42" },
    references: [undefined, "entity:patent-42", undefined, undefined],
  },
  {
    endpoint: { kind: "observation", observationRef: "observation:office-action-9" },
    references: [undefined, undefined, undefined, "observation:office-action-9"],
  },
] satisfies ReadonlyArray<{
  readonly endpoint: typeof EdgeEndpoint.Encoded;
  readonly references: ReadonlyArray<string | number | undefined>;
}>;

describe("EdgeVersion endpoint projections", () => {
  for (const { endpoint: input, references } of cases) {
    it.effect(`places the ${input.kind} reference in exactly one source and target column`, () =>
      Effect.gen(function* () {
        const endpoint = yield* S.decodeUnknownEffect(EdgeEndpoint)(input);
        const [claimId, entityRef, evidenceId, observationRef] = references;

        expect(flattenEdgeSource(endpoint)).toStrictEqual({
          sourceKind: input.kind,
          sourceClaimId: O.fromUndefinedOr(claimId),
          sourceEntityRef: O.fromUndefinedOr(entityRef),
          sourceEvidenceId: O.fromUndefinedOr(evidenceId),
          sourceObservationRef: O.fromUndefinedOr(observationRef),
        });
        expect(flattenEdgeTarget(endpoint)).toStrictEqual({
          targetKind: input.kind,
          targetClaimId: O.fromUndefinedOr(claimId),
          targetEntityRef: O.fromUndefinedOr(entityRef),
          targetEvidenceId: O.fromUndefinedOr(evidenceId),
          targetObservationRef: O.fromUndefinedOr(observationRef),
        });
      })
    );

    it.effect(`reconstructs the ${input.kind} endpoint from either side's stored columns`, () =>
      Effect.gen(function* () {
        const endpoint = yield* S.decodeUnknownEffect(EdgeEndpoint)(input);

        assertSome(unflattenEdgeSource(flattenEdgeSource(endpoint)), endpoint);
        assertSome(unflattenEdgeTarget(flattenEdgeTarget(endpoint)), endpoint);
      })
    );

    it(`returns absence when the ${input.kind} row has no matching reference`, () => {
      assertNone(
        unflattenEdgeSource({
          sourceKind: input.kind,
          sourceClaimId: O.none(),
          sourceEntityRef: O.none(),
          sourceEvidenceId: O.none(),
          sourceObservationRef: O.none(),
        })
      );
      assertNone(
        unflattenEdgeTarget({
          targetKind: input.kind,
          targetClaimId: O.none(),
          targetEntityRef: O.none(),
          targetEvidenceId: O.none(),
          targetObservationRef: O.none(),
        })
      );
    });
  }
});
