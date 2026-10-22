/**
 * Usage-tier admission: a proof that is minted, not a flag that is stored.
 *
 * An `AdmissionPolicy` is versioned data: a tier plus a conjunction of
 * clauses, each reading one evidence channel. `admit` evaluates a claim
 * version against a policy and either mints an `Admitted<Tier>` (a branded
 * value only this module can construct) or returns the exact unmet clauses.
 * Work-product builders accept only `Admitted<"deposition-ready">`, so the
 * compiler refuses a weak attribution.
 *
 * There is deliberately no schema decoder for `Admitted`. A persisted
 * admission is an `AdmissionRecord`; rehydrating it means re-running `admit`
 * at the recorded knowledge time and checking the basis digest still matches.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $ScratchpadId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as A from "effect/Array";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import {
  type ClaimVersion,
  type DependenceAssessment,
  ReviewState,
} from "./Claim.ts";
import type { EvidenceKind } from "./Communication.ts";
import type { AssertionId } from "./Ids.ts";
import { ClaimVersionId } from "./Ids.ts";
import { CollectionSide } from "./Provenance.ts";
import { knownAt, UtcInstant } from "./Time.ts";
import { thunkEmptyArray } from "@beep/utils";

const $I = $ScratchpadId.create("party/Admission");

/**
 * Usage tiers, weakest first.
 *
 * @category admission
 * @since 0.0.0
 */
export const AdmissionTier = LiteralKit(["analyst-lead", "client-facing", "deposition-ready"]).pipe(
  $I.annoteSchema("AdmissionTier", { description: "Usage tier an admission authorizes." })
);
export type AdmissionTier = typeof AdmissionTier.Type;

/**
 * One requirement of a policy. Each clause reads one channel; no clause
 * blends signals into a score.
 *
 * @category admission
 * @since 0.0.0
 */
export const AdmissionClause = S.TaggedUnion({
  /** Count support clusters after merging dependent (and, if configured, unknown) pairs. */
  MinIndependentSupport: {
    n: S.Int.check(S.isGreaterThanOrEqualTo(1)),
    unknownCountsAs: LiteralKit(["dependent", "independent"]),
  },
  RequireReviewerAcceptance: {},
  NoOpenChallenge: {},
  /** At least one supporting assertion classified as distinctive behavior. */
  RequireDistinctiveEvidence: {},
  /** At least one supporting assertion from a side other than `side` (testimonial-tier guard). */
  RequireSupportOutsideSide: { side: CollectionSide },
  /** Every cited support is in the version's `supportedBy`. `admit` always enforces it. */
  SupportsInVersion: {},
  /** The version is part of the system's knowledge at the admission's knowledge time. `admit` always enforces it. */
  KnownAtKnowledgeTime: {},
}).pipe($I.annoteSchema("AdmissionClause", { description: "One admission requirement." }));
export type AdmissionClause = typeof AdmissionClause.Type;

/**
 * Versioned admission policy.
 *
 * @category admission
 * @since 0.0.0
 */
export const AdmissionPolicy = S.Struct({
  id: S.NonEmptyString,
  version: S.NonEmptyString,
  tier: AdmissionTier,
  clauses: S.NonEmptyArray(AdmissionClause),
}).pipe($I.annoteSchema("AdmissionPolicy", { description: "Versioned admission policy." }));
export type AdmissionPolicy = typeof AdmissionPolicy.Type;

/**
 * What one supporting assertion contributes to admission.
 *
 * @category admission
 * @since 0.0.0
 */
export interface SupportFacts {
  readonly assertion: AssertionId;
  readonly side: CollectionSide;
  readonly kind: EvidenceKind;
}

/**
 * Evidence an admission is evaluated against.
 *
 * @category admission
 * @since 0.0.0
 */
export interface AdmissionEvidence {
  readonly version: ClaimVersion;
  readonly supports: ReadonlyArray<SupportFacts>;
  readonly dependence: ReadonlyArray<DependenceAssessment>;
}

/** Module-private mint token: code outside this module cannot obtain it, so cannot construct a proof. */
const mintToken: unique symbol = Symbol("party/Admission/mint");

/**
 * Proof that a claim version met a tier's policy at a knowledge time.
 * Constructible only by `admit`: the constructor demands a token that never
 * leaves this module. The private `#tier` field makes the class nominal.
 *
 * @category admission
 * @since 0.0.0
 */
export class Admitted<T extends AdmissionTier> {
  readonly #tier: T;
  readonly tier: T;
  readonly claimVersion: ClaimVersion;
  readonly policy: { readonly id: string; readonly version: string };
  readonly knowledgeTime: UtcInstant;
  readonly basis: ReadonlyArray<AssertionId>;

  constructor(
    token: typeof mintToken,
    fields: {
      readonly tier: T;
      readonly claimVersion: ClaimVersion;
      readonly policy: { readonly id: string; readonly version: string };
      readonly knowledgeTime: UtcInstant;
      readonly basis: ReadonlyArray<AssertionId>;
    }
  ) {
    void token;
    this.#tier = fields.tier;
    this.tier = fields.tier;
    this.claimVersion = fields.claimVersion;
    this.policy = fields.policy;
    this.knowledgeTime = fields.knowledgeTime;
    this.basis = fields.basis;
  }

  /** The tier this proof was minted for (nominal: not forgeable by structural typing). */
  get provenTier(): T {
    return this.#tier;
  }
}

/**
 * Serializable record of an admission. Not a proof: re-admit to rehydrate.
 *
 * @category admission
 * @since 0.0.0
 */
export const AdmissionRecord = S.Struct({
  tier: AdmissionTier,
  claimVersion: ClaimVersionId,
  policyId: S.NonEmptyString,
  policyVersion: S.NonEmptyString,
  knowledgeTime: UtcInstant,
}).pipe($I.annoteSchema("AdmissionRecord", { description: "Serializable admission record; not a proof." }));

/**
 * The refusal names every unmet clause with what it saw. It doubles as an
 * analyst worklist: find a second independent channel, resolve challenge X.
 *
 * @category admission
 * @since 0.0.0
 */
export interface AdmissionRefused {
  readonly _tag: "AdmissionRefused";
  readonly policy: { readonly id: string; readonly version: string };
  readonly unmet: ReadonlyArray<{ readonly clause: AdmissionClause; readonly saw: string }>;
}

/**
 * Number of independent support clusters. Pairs assessed `dependent`, and
 * pairs with no assessment or `unknown` when `unknownCountsAs = "dependent"`,
 * are merged into one cluster.
 *
 * @category admission
 * @since 0.0.0
 */
export const independentSupportCount = ({
  supports,
  dependence,
  unknownCountsAs,
}: {
  readonly supports: ReadonlyArray<AssertionId>;
  readonly dependence: ReadonlyArray<DependenceAssessment>;
  readonly unknownCountsAs: "dependent" | "independent";
}): number => {
  const parent = MutableHashMap.empty<AssertionId, AssertionId>();
  const find = (a: AssertionId): AssertionId => {
    const up = O.getOrElse(MutableHashMap.get(parent, a), () => a);
    return up === a ? a : find(up);
  };
  const lookup = (a: AssertionId, b: AssertionId) =>
    A.findFirst(dependence, (d) => (d.left === a && d.right === b) || (d.left === b && d.right === a));
  A.forEach(supports, (a, i) =>
    A.forEach(A.drop(supports, i + 1), (b) => {
      const verdict = O.match(lookup(a, b), { onNone: () => "unknown" as const, onSome: (d) => d.dependence });
      const merge = verdict === "dependent" || (verdict === "unknown" && unknownCountsAs === "dependent");
      if (merge) {
        const ra = find(a);
        const rb = find(b);
        if (ra !== rb) MutableHashMap.set(parent, rb, ra);
      }
    })
  );
  return A.length(A.dedupe(A.map(supports, find)));
};

/** Clauses `admit` checks before any policy clause, so no policy can omit them. */
const integrityClauses: ReadonlyArray<AdmissionClause> = [{ _tag: "SupportsInVersion" }, { _tag: "KnownAtKnowledgeTime" }];

const evaluate = (clause: AdmissionClause, evidence: AdmissionEvidence, knowledgeTime: UtcInstant): O.Option<string> =>
  AdmissionClause.match(clause, {
    MinIndependentSupport: ({ n, unknownCountsAs }) => {
      const count = independentSupportCount({
        supports: A.map(evidence.supports, (s) => s.assertion),
        dependence: evidence.dependence,
        unknownCountsAs,
      });
      return count >= n ? O.none() : O.some(`${count} independent support cluster(s), need ${n}`);
    },
    RequireReviewerAcceptance: () =>
      ReviewState.guards.Accepted(evidence.version.review) ? O.none() : O.some(`review state is ${evidence.version.review._tag}`),
    NoOpenChallenge: () =>
      A.isReadonlyArrayEmpty(evidence.version.challengedBy) && !ReviewState.guards.Disputed(evidence.version.review)
        ? O.none()
        : O.some(`${A.length(evidence.version.challengedBy)} challenging assertion(s)`),
    RequireDistinctiveEvidence: () =>
      A.some(evidence.supports, (s) => s.kind === "distinctive-behavior")
        ? O.none()
        : O.some("all support is shared-template or bulk-distribution evidence"),
    RequireSupportOutsideSide: ({ side }) =>
      A.some(evidence.supports, (s) => s.side !== side) ? O.none() : O.some(`all support comes from ${side}`),
    SupportsInVersion: () => {
      const outside = A.filter(evidence.supports, (s) => !A.contains(evidence.version.supportedBy, s.assertion));
      return A.isReadonlyArrayEmpty(outside)
        ? O.none()
        : O.some(`${A.length(outside)} support(s) not in the version's supportedBy`);
    },
    KnownAtKnowledgeTime: () =>
      knownAt(evidence.version.knowledge, knowledgeTime)
        ? O.none()
        : O.some(`version ${evidence.version.id} is not known at ${knowledgeTime}`),
  });

/**
 * Evaluate a policy and mint an admission or a refusal.
 *
 * @category admission
 * @since 0.0.0
 */
export const admit = <T extends AdmissionTier>({
  policy,
  evidence,
  knowledgeTime,
}: {
  readonly policy: AdmissionPolicy & { readonly tier: T };
  readonly evidence: AdmissionEvidence;
  readonly knowledgeTime: UtcInstant;
}): Result.Result<Admitted<T>, AdmissionRefused> => {
  const unmet = A.flatMap(A.appendAll(integrityClauses, policy.clauses), (clause) =>
    O.match(evaluate(clause, evidence, knowledgeTime), { onNone: thunkEmptyArray(), onSome: (saw) => [{ clause, saw }] })
  );
  const ref = { id: policy.id, version: policy.version };
  return A.isReadonlyArrayNonEmpty(unmet)
    ? Result.fail({ _tag: "AdmissionRefused", policy: ref, unmet })
    : Result.succeed(
        new Admitted(mintToken, {
          tier: policy.tier,
          claimVersion: evidence.version,
          policy: ref,
          knowledgeTime,
          basis: A.map(evidence.supports, (s) => s.assertion),
        })
      );
};

/**
 * One line of a deposition outline. Accepts only deposition-ready proofs.
 *
 * @category admission
 * @since 0.0.0
 */
export const depositionOutlineEntry = ({
  admitted,
  note,
}: {
  readonly admitted: Admitted<"deposition-ready">;
  readonly note: string;
}) => ({
  claimVersion: admitted.claimVersion.id,
  proposition: admitted.claimVersion.proposition,
  policy: admitted.policy,
  knowledgeTime: admitted.knowledgeTime,
  basis: admitted.basis,
  note,
});
