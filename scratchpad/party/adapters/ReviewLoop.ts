/**
 * The reviewer loop: collision cases in, reviewed claims out.
 *
 * Each colliding display name becomes a `CollisionCase`: its mailboxes, each
 * with a stable provisional party, identifiers, organization domains and
 * observed span, plus a `basis` digest over exactly that evidence. A reviewer's
 * `CollisionDecision` is bound to the basis it saw and becomes *Accepted*
 * `SameParty` / `DistinctParty` claim versions carrying a `ReviewerDisposition`.
 *
 * On the next run:
 *
 * - decided cases whose basis still matches are settled through
 *   `resolveParties`, so a reviewed `DistinctParty` also vetoes any later
 *   merge between those mailboxes,
 * - decided cases whose evidence changed are `stale-review` and go back to the
 *   queue (a changed basis invalidates acceptance, per evidence-signals/v1),
 * - everything else stays in the queue.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $ScratchpadId } from "@beep/identity";
import { sha256Hex } from "@beep/repo-utils/Sha256Hex";
import { LiteralKit } from "@beep/schema";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { ClaimVersion, ReviewerDisposition } from "../Claim.ts";
import { AssertionId, ClaimVersionId, Digest, IdentifierId, PartyId, PrincipalId } from "../Ids.ts";
import { resolveParties } from "../Resolution.ts";
import { UtcInstant } from "../Time.ts";
import { CollisionOutcome } from "./IdentityEvidence.ts";
import { NameShape, OrgLead } from "./OrgEvidence.ts";

const $I = $ScratchpadId.create("party/adapters/ReviewLoop");

/**
 * One mailbox under a colliding name, as the reviewer sees it.
 *
 * @category review-loop
 * @since 0.0.0
 */
export const CaseMailbox = S.Struct({
  party: PartyId,
  identifiers: S.NonEmptyArray(IdentifierId),
  domains: S.Array(S.String),
  firstSeen: S.OptionFromNullOr(UtcInstant),
  lastSeen: S.OptionFromNullOr(UtcInstant),
}).pipe($I.annoteSchema("CaseMailbox", { description: "One mailbox under a colliding display name." }));
export type CaseMailbox = typeof CaseMailbox.Type;

const CaseEvidence = S.Struct({
  name: S.String,
  shape: NameShape,
  outcome: CollisionOutcome,
  orgLead: OrgLead,
  mailboxes: S.Array(CaseMailbox),
});

/**
 * A collision case: the evidence a reviewer decides on, plus its digest.
 *
 * @category review-loop
 * @since 0.0.0
 */
export const CollisionCase = S.Struct({ ...CaseEvidence.fields, basis: Digest }).pipe(
  $I.annoteSchema("CollisionCase", { description: "Evidence for one colliding name, with its basis digest." })
);
export type CollisionCase = typeof CollisionCase.Type;

/**
 * A reviewer's verdict on one case: either a grouping of the case's mailboxes
 * into people (one group = one person), or a skip. A mailbox may appear in at
 * most one group.
 *
 * @category review-loop
 * @since 0.0.0
 */
export const ReviewVerdict = S.TaggedUnion({
  Grouped: {
    groups: PartyId.pipe(S.NonEmptyArray, S.NonEmptyArray).check(
      S.makeFilter(
        (groups: ReadonlyArray<ReadonlyArray<PartyId>>) => {
          const all = A.flatten(groups);
          return A.length(A.dedupe(all)) === A.length(all);
        },
        { identifier: $I`GroupsDisjointCheck`, message: "Expected each mailbox in at most one group." }
      )
    ),
  },
  Skip: {},
}).pipe($I.annoteSchema("ReviewVerdict", { description: "Grouping of a case's mailboxes into people, or a skip." }));
export type ReviewVerdict = typeof ReviewVerdict.Type;

/**
 * A recorded decision, bound to the basis digest the reviewer saw.
 *
 * @category review-loop
 * @since 0.0.0
 */
export const CollisionDecision = S.Struct({
  name: S.String,
  verdict: ReviewVerdict,
  basis: Digest,
  reviewer: PrincipalId,
  reviewedAt: UtcInstant,
  note: S.String,
}).pipe($I.annoteSchema("CollisionDecision", { description: "Reviewer decision bound to an evidence basis." }));
export type CollisionDecision = typeof CollisionDecision.Type;

/**
 * Stable provisional party for a mailbox: keyed by its smallest identifier, so
 * the same pairing evidence yields the same party on every run.
 *
 * @category review-loop
 * @since 0.0.0
 */
export const mailboxParty = (identifiers: A.NonEmptyReadonlyArray<IdentifierId>): PartyId =>
  PartyId.make(`party:mailbox:${encodeURIComponent(A.min(identifiers, Order.String))}`);

/**
 * Seal a case: canonical evidence (mailboxes sorted by party) → SHA-256 basis.
 *
 * @category review-loop
 * @since 0.0.0
 */
export const sealCase = Effect.fn("ReviewLoop.sealCase")(function* (evidence: typeof CaseEvidence.Type) {
  const canonical = {
    ...evidence,
    mailboxes: A.sort(
      A.map(evidence.mailboxes, (m) => ({
        ...m,
        identifiers: A.sort(m.identifiers, Order.String),
        domains: A.sort(m.domains, Order.String),
      })),
      Order.mapInput(Order.String, (m: CaseMailbox) => m.party)
    ),
  };
  const json = yield* S.encodeEffect(S.fromJsonString(CaseEvidence))(canonical);
  const basis = yield* S.decodeEffect(Digest)(yield* sha256Hex(json));
  return { ...canonical, basis };
});

const absent = { _tag: "Absent", reason: "not-assessed" } as const;

const orFallback = (s: string, fallback: string) => (Str.isNonEmpty(Str.trim(s)) ? s : fallback);

/**
 * Accepted claim versions for one decision. `skip` yields nothing.
 *
 * @category review-loop
 * @since 0.0.0
 */
export const decisionClaims = (decision: CollisionDecision): ReadonlyArray<ClaimVersion> => {
  const disposition: ReviewerDisposition = {
    disposition: "accepted",
    reviewer: decision.reviewer,
    basis: decision.basis,
    reviewedAt: decision.reviewedAt,
    reason: orFallback(decision.note, `reviewed collision: ${decision.verdict._tag}`),
  };
  const version = (tag: "SameParty" | "DistinctParty", a: PartyId, b: PartyId): ClaimVersion => {
    const [left, right] = a < b ? [a, b] : [b, a];
    return {
      id: ClaimVersionId.make(
        `cv:review:${decision.basis}:${tag}:${encodeURIComponent(left)}:${encodeURIComponent(right)}`
      ),
      logicalKey: `${tag}|${left}|${right}`,
      proposition: { _tag: tag, left, right },
      supportedBy: [AssertionId.make(`asrt:review:${decision.basis}`)],
      challengedBy: [],
      validTime: { _tag: "Unknown" },
      knowledge: { recordedAt: decision.reviewedAt, expiredAt: O.none() },
      supersedes: O.none(),
      review: { _tag: "Accepted", disposition },
      signals: {
        sourceTrust: absent,
        sourceAssertedConfidence: absent,
        extractorConfidence: absent,
        validator: absent,
        reviewer: { _tag: "Present", value: disposition },
      },
    };
  };
  return ReviewVerdict.match(decision.verdict, {
    Skip: () => [],
    Grouped: ({ groups }) => {
      const sorted = A.map(groups, (g) => A.sort(g, Order.String));
      const within = A.flatMap(sorted, (g) => A.map(A.zip(g, A.drop(g, 1)), ([l, r]) => version("SameParty", l, r)));
      const across = A.flatMap(sorted, (g, i) =>
        A.flatMap(A.drop(sorted, i + 1), (h) => A.flatMap(g, (l) => A.map(h, (r) => version("DistinctParty", l, r))))
      );
      return [...within, ...across];
    },
  });
};

/**
 * Review status of a case after applying decisions.
 *
 * @category review-loop
 * @since 0.0.0
 */
export const ReviewStatus = LiteralKit([
  "reviewed-same",
  "reviewed-distinct",
  "reviewed-grouped",
  "conflicting-review",
  "invalid-decision",
  "skipped",
  "stale-review",
  "unreviewed",
]);
export type ReviewStatus = typeof ReviewStatus.Type;

/**
 * Apply recorded decisions to the current cases. The latest decision per name
 * wins; a decision whose basis no longer matches the case is stale.
 *
 * @category review-loop
 * @since 0.0.0
 */
export const applyReviews = ({
  cases,
  decisions,
}: {
  readonly cases: ReadonlyArray<CollisionCase>;
  readonly decisions: ReadonlyArray<CollisionDecision>;
}): ReadonlyArray<{ readonly case: CollisionCase; readonly status: ReviewStatus }> => {
  const latest = R.map(A.groupBy(decisions, (d) => d.name), (ds) =>
    A.max(ds, Order.mapInput(Order.String, (d: CollisionDecision) => d.reviewedAt))
  );
  const current = A.filter(R.values(latest), (d) =>
    A.some(cases, (c) => c.name === d.name && c.basis === d.basis)
  );
  const claims: ReadonlyArray<ClaimVersion> = A.flatMap(current, decisionClaims);
  const resolved = resolveParties(claims);
  const vetoes = A.flatMap(claims, ({ proposition: p }) =>
    p._tag === "DistinctParty" ? [[p.left, p.right] as const] : []
  );
  const separated = (a: PartyId, b: PartyId) =>
    A.some(vetoes, ([l, r]) => (l === a && r === b) || (l === b && r === a));

  return A.map(cases, (c) => {
    const decision = R.get(latest, c.name);
    const parties = A.map(c.mailboxes, (m) => m.party);
    const status: ReviewStatus = O.match(decision, {
      onNone: () => "unreviewed",
      onSome: (d) =>
        d.basis !== c.basis
          ? "stale-review"
          : ReviewVerdict.match(d.verdict, {
              Skip: (): ReviewStatus => "skipped",
              Grouped: ({ groups }): ReviewStatus => {
                const listed = A.flatten(groups);
                const partition =
                  A.length(listed) === A.length(parties) && A.every(parties, (p) => A.contains(listed, p));
                if (!partition) return "invalid-decision";
                // within a group: one representative; across groups: separated and not merged elsewhere
                const coherent =
                  A.every(groups, (g) => pipe(A.map(g, resolved.representative), A.dedupe, A.length) === 1) &&
                  A.every(groups, (g, i) =>
                    A.every(A.drop(groups, i + 1), (h) =>
                      A.every(g, (a) => A.every(h, (b) => separated(a, b) && resolved.representative(a) !== resolved.representative(b)))
                    )
                  );
                return !coherent
                  ? "conflicting-review"
                  : A.length(groups) === 1
                    ? "reviewed-same"
                    : A.every(groups, (g) => A.length(g) === 1)
                      ? "reviewed-distinct"
                      : "reviewed-grouped";
              },
            }),
    });
    return { case: c, status };
  });
};
