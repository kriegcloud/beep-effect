/**
 * Reviewer loop: sealing, groupings → claims, and re-application.
 */
import * as NodeCrypto from "@effect/platform-node/NodeCrypto";
import { describe, expect, it, layer } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { IdentifierId, PartyId, PrincipalId } from "../Ids.ts";
import { UtcInstant } from "../Time.ts";
import type { CollisionCase, CollisionDecision, ReviewVerdict } from "../adapters/ReviewLoop.ts";
import { applyReviews, decisionClaims, mailboxParty, ReviewVerdict as Verdict, sealCase } from "../adapters/ReviewLoop.ts";

const at = UtcInstant.make;
const ident = IdentifierId.make;
const mailbox = (email: string, domain: string) => {
  const identifiers = [ident(`ident:email:${email}`)] as const;
  return {
    party: mailboxParty(identifiers),
    identifiers,
    domains: [domain],
    firstSeen: O.some(at("2020-01-01T00:00:00Z")),
    lastSeen: O.some(at("2022-01-01T00:00:00Z")),
  };
};
const evidence = (name: string, boxes: ReadonlyArray<ReturnType<typeof mailbox>>) => ({
  name,
  shape: "full-name" as const,
  outcome: "unresolved" as const,
  orgLead: "different-orgs-concurrent" as const,
  mailboxes: boxes,
});
const decide = (c: CollisionCase, verdict: ReviewVerdict, reviewedAt = "2026-10-21T10:00:00Z"): CollisionDecision => ({
  name: c.name,
  verdict,
  basis: c.basis,
  reviewer: PrincipalId.make("user:reviewer"),
  reviewedAt: at(reviewedAt),
  note: "",
});
const nonEmpty = <X>(xs: ReadonlyArray<X>): A.NonEmptyReadonlyArray<X> =>
  O.getOrThrow(A.match(xs, { onEmpty: () => O.none(), onNonEmpty: (ne) => O.some(ne) }));
const partyAt = (c: CollisionCase, i: number) => O.getOrThrow(A.get(c.mailboxes, i)).party;
/** Group mailboxes by index into people. */
const grouped = (
  c: CollisionCase,
  groups: A.NonEmptyReadonlyArray<A.NonEmptyReadonlyArray<number>>
): ReviewVerdict => Verdict.cases.Grouped.make({ groups: A.map(groups, (g) => A.map(g, (i) => partyAt(c, i))) });
const indices = (c: CollisionCase) => A.map(c.mailboxes, (_, i) => i);
const allSame = (c: CollisionCase) => grouped(c, [nonEmpty(indices(c))]);
const allDifferent = (c: CollisionCase) => grouped(c, nonEmpty(A.map(indices(c), (i) => [i] as const)));
const skip = Verdict.cases.Skip.make({});

describe("mailbox parties", () => {
  it("are stable across runs and independent of identifier order", () => {
    expect(mailboxParty([ident("ident:email:b@x.example"), ident("ident:email:a@x.example")])).toBe(
      PartyId.make("party:mailbox:ident%3Aemail%3Aa%40x.example")
    );
  });

  it("rejects a grouping that lists a mailbox twice", () => {
    const p = "party:mailbox:x";
    expect(Exit.isFailure(S.decodeExit(Verdict)({ _tag: "Grouped", groups: [[p], [p]] }))).toBe(true);
  });
});

layer(NodeCrypto.layer)("reviewer loop", (it) => {
  const chrisA = mailbox("chris.morgan@acme.example", "acme.example");
  const chrisB = mailbox("cmorgan@other.example", "other.example");

  it.effect("seals the same evidence to the same basis regardless of mailbox order", () =>
    Effect.gen(function* () {
      const one = yield* sealCase(evidence("chris morgan", [chrisA, chrisB]));
      const two = yield* sealCase(evidence("chris morgan", [chrisB, chrisA]));
      expect(one.basis).toBe(two.basis);
      const changed = yield* sealCase(evidence("chris morgan", [chrisA, chrisB, mailbox("c@third.example", "third.example")]));
      expect(changed.basis).not.toBe(one.basis);
    })
  );

  it.effect("turns a grouping into same-person claims within groups and different-person claims across them", () =>
    Effect.gen(function* () {
      const c = yield* sealCase(
        evidence("chris morgan", [chrisA, mailbox("chris@acme.example", "acme.example"), chrisB])
      );
      const claims = decisionClaims(decide(c, grouped(c, [[0, 1], [2]])));
      expect(A.map(claims, (v) => v.proposition._tag)).toEqual(["SameParty", "DistinctParty", "DistinctParty"]);
      expect(A.every(claims, (v) => v.review._tag === "Accepted" && v.review.disposition.basis === c.basis)).toBe(true);
      expect(decisionClaims(decide(c, skip))).toEqual([]);
    })
  );

  it.effect("settles reviewed cases, re-queues stale ones, rejects bad partitions, and leaves the rest", () =>
    Effect.gen(function* () {
      const same = yield* sealCase(
        evidence("dana brooks", [mailbox("dana@acme.example", "acme.example"), mailbox("dbrooks@acme.example", "acme.example")])
      );
      const distinct = yield* sealCase(evidence("chris morgan", [chrisA, chrisB]));
      const split = yield* sealCase(
        evidence("sam rivera", [
          mailbox("sam@acme.example", "acme.example"),
          mailbox("srivera@acme.example", "acme.example"),
          mailbox("sam.rivera@other.example", "other.example"),
        ])
      );
      const pending = yield* sealCase(
        evidence("pat kim", [mailbox("pat@acme.example", "acme.example"), mailbox("pkim@other.example", "other.example")])
      );
      const partial = yield* sealCase(
        evidence("quinn ortiz", [mailbox("quinn@acme.example", "acme.example"), mailbox("qo@other.example", "other.example")])
      );
      const before = yield* sealCase(
        evidence("riley ng", [mailbox("riley@acme.example", "acme.example"), mailbox("rng@other.example", "other.example")])
      );
      const after = yield* sealCase(
        evidence("riley ng", [
          mailbox("riley@acme.example", "acme.example"),
          mailbox("rng@other.example", "other.example"),
          mailbox("riley.ng@third.example", "third.example"),
        ])
      );
      const statuses = applyReviews({
        cases: [same, distinct, split, pending, partial, after],
        decisions: [
          decide(same, allSame(same)),
          decide(distinct, allDifferent(distinct)),
          decide(split, grouped(split, [[0, 1], [2]])),
          decide(partial, grouped(partial, [[0]])),
          decide(before, allSame(before)),
        ],
      });
      expect(A.map(statuses, (s) => [s.case.name, s.status])).toEqual([
        ["dana brooks", "reviewed-same"],
        ["chris morgan", "reviewed-distinct"],
        ["sam rivera", "reviewed-grouped"],
        ["pat kim", "unreviewed"],
        ["quinn ortiz", "invalid-decision"],
        ["riley ng", "stale-review"],
      ]);
    })
  );

  it.effect("lets one review's separation veto another review's merge", () =>
    Effect.gen(function* () {
      const byName = yield* sealCase(evidence("chris morgan", [chrisA, chrisB]));
      const byInitial = yield* sealCase(evidence("c. morgan", [chrisA, chrisB]));
      const statuses = applyReviews({
        cases: [byName, byInitial],
        decisions: [decide(byName, allDifferent(byName)), decide(byInitial, allSame(byInitial), "2026-10-21T11:00:00Z")],
      });
      expect(A.map(statuses, (s) => s.status)).toEqual(["reviewed-distinct", "conflicting-review"]);
    })
  );
});
