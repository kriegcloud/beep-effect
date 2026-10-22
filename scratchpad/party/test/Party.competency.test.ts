/**
 * Competency questions as executable tests. Each `it` is a question the party
 * model must answer without collapsing a distinction.
 */
import { describe, expect, it, layer } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Graph from "effect/Graph";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Result from "effect/Result";
import * as Order from "effect/Order";
import * as S from "effect/Schema";
import type { AdmissionPolicy } from "../Admission.ts";
import { admit, depositionOutlineEntry } from "../Admission.ts";
import { ReviewState, StructuralVerdict } from "../Claim.ts";
import { CommunicationEvent, isDelegated, voiceOf } from "../Communication.ts";
import { assessOperational, divergences } from "../Hierarchy.ts";
import { AccountId, ActivityId, AssertionId, ClaimVersionId, PartyId } from "../Ids.ts";
import { LedgerConflict, PartyLedger, PartyLedgerMemory } from "../Ledger.ts";
import { partiesOf, Proposition } from "../Proposition.ts";
import { attributeEvents, chainOfCommand, declaredLines, identityView, orgGraph, selectorGraph } from "../Projection.ts";
import { UtcInstant } from "../Time.ts";
import * as Fx from "../fixtures/acme.ts";

const at = UtcInstant.make;
const pid = PartyId.make;
const accepted = ["Accepted"] as const;
const scope = (asOf: string, validAt = "2025-04-15T00:00:00Z") => ({
  asOf: at(asOf),
  validAt: at(validAt),
  states: accepted,
});
const fails = (schema: Parameters<typeof S.decodeUnknownExit>[0], input: unknown) =>
  Exit.isFailure(S.decodeUnknownExit(schema)(input));

describe("boundary: the schema refuses category mistakes", () => {
  it("rejects a person id in an account slot", () => {
    expect(
      fails(Proposition, { _tag: "AccountControl", account: "party:maya", controller: "party:maya", relation: "used-by" })
    ).toBe(true);
  });

  it("rejects a reporting line from a party to itself", () => {
    expect(
      fails(Proposition, { _tag: "ReportsTo", subordinate: "party:sam", superior: "party:sam", organization: null })
    ).toBe(true);
  });

  it("does not let a structural gate verdict pass as a review decision", () => {
    expect(Exit.isSuccess(S.decodeExit(StructuralVerdict)({ _tag: "Admitted" }))).toBe(true);
    expect(fails(ReviewState, { _tag: "Admitted" })).toBe(true);
  });

  it("lists no parties (as an array) for account-only propositions", () => {
    const parties = partiesOf(Proposition.cases.MailboxKind.make({ account: AccountId.make("acct:x"), kind: "shared" }));
    expect(Array.isArray(parties) && A.isReadonlyArrayEmpty(parties)).toBe(true);
  });

  it("accepts only whole-second instants so string order is time order", () => {
    expect(fails(UtcInstant, "2025-03-12T16:42:08Z")).toBe(false);
    expect(fails(UtcInstant, "2025-03-12T16:42:08.5Z")).toBe(true);
  });

  it("cannot represent acceptance without a reviewer disposition", () => {
    expect(fails(ReviewState, { _tag: "Accepted" })).toBe(true);
  });

  it("rejects a message with two from headers", () => {
    expect(
      fails(CommunicationEvent, {
        id: "evt:x",
        occurrence: "occ:x",
        channel: "email",
        sentAt: null,
        messageId: null,
        conversationKey: null,
        participants: [
          { role: "from", identifier: "ident:a", observation: "obs:a" },
          { role: "from", identifier: "ident:b", observation: "obs:b" },
        ],
      })
    ).toBe(true);
  });
});

describe("voices: whose name is on it vs who wrote it", () => {
  it("separates a delegate sender from the represented mailbox", () => {
    const delegated = voiceOf(Fx.eventNo(2));
    expect(isDelegated(delegated)).toBe(true);
    expect(delegated.id).toBe(Fx.delegatedVoice);
    expect(isDelegated(voiceOf(Fx.eventNo(1)))).toBe(false);
  });

  it("shares one voice across messages with the same channel configuration", () => {
    expect(voiceOf(Fx.eventNo(4)).id).toBe(voiceOf(Fx.eventNo(6)).id);
  });

  it("attributes a shared-mailbox message to nobody rather than guessing", () => {
    const view = identityView({ ledger: Fx.ledger, scope: scope("2026-10-21T00:00:00Z") });
    const first = A.findFirst(
      attributeEvents({ events: Fx.events, observations: Fx.speechActs, view }),
      (e) => e.event === Fx.eventNo(1).id
    );
    expect(O.flatMap(first, (e) => e.author)).toEqual(O.none());
  });
});

describe("bitemporal identity", () => {
  it("reproduces what we believed on Oct 12 after the Oct 19 correction", () => {
    const finance = A.headNonEmpty(Fx.eventNo(1).participants).identifier;
    const before = identityView({ ledger: Fx.ledger, scope: scope("2026-10-15T00:00:00Z") });
    const after = identityView({ ledger: Fx.ledger, scope: scope("2026-10-21T00:00:00Z") });
    expect(HashMap.get(before.partyOfIdentifier, finance)).toEqual(O.some(pid("party:maya")));
    // "represents Finance" is not personal use: the mailbox maps to no person now
    expect(O.isNone(HashMap.get(after.partyOfIdentifier, finance))).toBe(true);
  });

  it("follows a reassigned phone number through valid time, including the gap", () => {
    const phone = Fx.phoneJordan.proposition;
    if (phone._tag !== "IdentifierOf") throw new Error("fixture");
    const who = (validAt: string) =>
      HashMap.get(
        identityView({ ledger: Fx.ledger, scope: scope("2026-10-21T00:00:00Z", validAt) }).partyOfIdentifier,
        phone.identifier
      );
    expect(who("2023-01-01T00:00:00Z")).toEqual(O.some(pid("party:jordan")));
    expect(O.isNone(who("2024-07-01T00:00:00Z"))).toBe(true);
    expect(who("2025-01-01T00:00:00Z")).toEqual(O.some(pid("party:riley")));
  });
});

describe("entity resolution without transitive collapse", () => {
  it("merges a duplicate record but vetoes the name-equality merge of a different Chris Morgan", () => {
    const view = identityView({ ledger: Fx.ledger, scope: scope("2026-10-21T00:00:00Z") });
    expect(view.representative(pid("party:chris-dup"))).toBe(pid("party:chris-a"));
    expect(view.representative(pid("party:chris-b"))).toBe(pid("party:chris-b"));
    expect(A.map(view.vetoed, (v) => v.vetoedBy)).toEqual(["cv:distinct:chris-a-b"]);
  });
});

describe("admission tiers", () => {
  const depositionPolicy = {
    id: "attribution",
    version: "1.0.0",
    tier: "deposition-ready",
    clauses: [
      { _tag: "MinIndependentSupport", n: 2, unknownCountsAs: "dependent" },
      { _tag: "RequireReviewerAcceptance" },
      { _tag: "NoOpenChallenge" },
      { _tag: "RequireDistinctiveEvidence" },
      { _tag: "RequireSupportOutsideSide", side: "adversary-production" },
    ],
  } as const satisfies AdmissionPolicy;

  const knowledgeTime = at("2026-10-21T00:00:00Z");

  it("refuses an attribution resting only on the adversary's own, possibly dependent records, naming each gap", () => {
    const result = admit({
      policy: depositionPolicy,
      knowledgeTime,
      evidence: {
        version: Fx.averyAuthorship,
        supports: [
          { assertion: Fx.averyAssertions.header.id, side: "adversary-production", kind: "distinctive-behavior" },
          { assertion: Fx.averyAssertions.permissions.id, side: "adversary-production", kind: "distinctive-behavior" },
        ],
        dependence: [],
      },
    });
    expect(Result.isFailure(result)).toBe(true);
    if (Result.isFailure(result)) {
      expect(A.map(result.failure.unmet, (u) => u.clause._tag)).toEqual([
        "MinIndependentSupport",
        "RequireSupportOutsideSide",
      ]);
    }
  });

  it("admits once testimony from outside the production corroborates independently", () => {
    const { header, permissions, testimony } = Fx.averyAssertions;
    const independent = (left: typeof header.id, right: typeof header.id) => ({
      left,
      right,
      dependence: "independent" as const,
      basis: "different systems and witnesses",
      producedBy: ActivityId.make("act:dependence-review"),
    });
    const result = admit({
      policy: depositionPolicy,
      knowledgeTime,
      evidence: {
        version: Fx.averyAuthorship,
        supports: [
          { assertion: header.id, side: "adversary-production", kind: "distinctive-behavior" },
          { assertion: permissions.id, side: "adversary-production", kind: "distinctive-behavior" },
          { assertion: testimony.id, side: "third-party-production", kind: "distinctive-behavior" },
        ],
        dependence: [independent(header.id, testimony.id), independent(permissions.id, testimony.id)],
      },
    });
    expect(Result.isSuccess(result)).toBe(true);
    if (Result.isSuccess(result)) {
      const entry = depositionOutlineEntry({ admitted: result.success, note: "Avery drafted Dana's 4/1 reply" });
      expect(entry.claimVersion).toBe(Fx.averyAuthorship.id);
    }
  });

  it("refuses support the version does not cite, and a version not yet known at the knowledge time", () => {
    const outside = admit({
      policy: { ...depositionPolicy, tier: "analyst-lead", clauses: [{ _tag: "RequireDistinctiveEvidence" }] },
      knowledgeTime,
      evidence: {
        version: Fx.averyAuthorship,
        supports: [{ assertion: AssertionId.make("asrt:finance:v1"), side: "client-file", kind: "distinctive-behavior" }],
        dependence: [],
      },
    });
    expect(Result.isFailure(outside) ? A.map(outside.failure.unmet, (u) => u.clause._tag) : []).toEqual([
      "SupportsInVersion",
    ]);
    const early = admit({
      policy: { ...depositionPolicy, tier: "analyst-lead", clauses: [{ _tag: "RequireDistinctiveEvidence" }] },
      knowledgeTime: at("2026-10-01T00:00:00Z"),
      evidence: {
        version: Fx.averyAuthorship,
        supports: [{ assertion: Fx.averyAssertions.header.id, side: "client-file", kind: "distinctive-behavior" }],
        dependence: [],
      },
    });
    expect(Result.isFailure(early) ? A.map(early.failure.unmet, (u) => u.clause._tag) : []).toEqual([
      "KnownAtKnowledgeTime",
    ]);
  });

  it("never founds an attribution on a signature block alone", () => {
    const result = admit({
      policy: { ...depositionPolicy, tier: "analyst-lead", clauses: [{ _tag: "RequireDistinctiveEvidence" }] },
      knowledgeTime,
      evidence: {
        version: Fx.averyAuthorship,
        supports: [{ assertion: Fx.averyAssertions.header.id, side: "client-file", kind: "shared-template" }],
        dependence: [],
      },
    });
    expect(Result.isFailure(result)).toBe(true);
  });

  it("does not compile a client-facing admission into a deposition outline", () => {
    const lower = admit({
      policy: { ...depositionPolicy, tier: "client-facing", clauses: [{ _tag: "RequireReviewerAcceptance" }] },
      knowledgeTime,
      evidence: { version: Fx.averyAuthorship, supports: [], dependence: [] },
    });
    if (Result.isSuccess(lower)) {
      // @ts-expect-error client-facing proof cannot enter a deposition outline
      depositionOutlineEntry({ admitted: lower.success, note: "nope" });
    }
    expect(Result.isSuccess(lower)).toBe(true);
  });
});

describe("declared vs operational hierarchy", () => {
  const s = scope("2026-10-21T00:00:00Z");
  const view = identityView({ ledger: Fx.ledger, scope: s });
  const custodians = HashSet.fromIterable(A.map(Fx.custodianIds, (p) => pid(p)));
  const operational = assessOperational({
    events: attributeEvents({ events: Fx.events, observations: Fx.speechActs, view }),
    producedBy: ActivityId.make("act:assessor-v1"),
    custodians,
  });
  const leads = divergences({
    declared: declaredLines({ ledger: Fx.ledger, scope: s, view }),
    operational,
    custodians,
    shadowGateMinimum: 2,
  });

  it("finds the junior engineer who gates decisions for peers and for the declared manager", () => {
    expect(A.sort(A.map(leads, (d) => d._tag), Order.String)).toEqual([
      "CoverageGap",
      "InvertedAuthority",
      // Dana→Riley and Dana→Quinn (Sam approves instead), Pat→Dana (Sam approves Dana)
      "PhantomManager",
      "PhantomManager",
      "PhantomManager",
      "ShadowGate",
    ]);
    const shadow = A.findFirst(leads, (d) => d._tag === "ShadowGate");
    expect(O.map(shadow, (d) => (d._tag === "ShadowGate" ? d.party : ""))).toEqual(O.some(pid("party:sam")));
  });

  it("flags the declared manager whose mailbox was never collected", () => {
    const gap = A.findFirst(leads, (d) => d._tag === "CoverageGap");
    expect(O.map(gap, (d) => (d._tag === "CoverageGap" ? d.party : ""))).toEqual(O.some(pid("party:pat")));
  });

  it("walks the declared chain of command on an effect/Graph projection", () => {
    const org = orgGraph({ ledger: Fx.ledger, scope: s, view });
    expect(chainOfCommand({ org, party: pid("party:sam") })).toEqual([pid("party:dana"), pid("party:pat")]);
  });

  it("keeps selector traversal over identifiers, not people", () => {
    const { graph } = selectorGraph(Fx.events);
    // avery appears only as `sender`, so 7 identifiers carry from→recipient edges
    expect(Graph.nodeCount(graph)).toBe(7);
    expect(Graph.edgeCount(graph)).toBe(10);
  });
});

layer(PartyLedgerMemory)("ledger service: append-only authority", (it) => {
  it.effect("supersession closes the old knowledge interval instead of rewriting it", () =>
    Effect.gen(function* () {
      const ledger = yield* PartyLedger;
      yield* ledger.append(Fx.financeV1);
      yield* ledger.supersede(Fx.financeV2);
      const snap = yield* ledger.snapshot;
      const v1 = A.findFirst(snap.versions, (v) => v.id === Fx.financeV1.id);
      expect(O.flatMap(v1, (v) => v.knowledge.expiredAt)).toEqual(O.some(Fx.financeV2.knowledge.recordedAt));
      expect(O.map(v1, (v) => v.proposition)).toEqual(O.some(Fx.financeV1.proposition));
      const again = yield* Effect.flip(ledger.supersede(Fx.financeV2));
      expect(again).toBeInstanceOf(LedgerConflict);
      // a successor reusing a recorded id is refused even when its target is open
      const reused = yield* Effect.flip(ledger.supersede({ ...Fx.financeV2, supersedes: O.some(Fx.financeV2.id) }));
      expect(reused.reason).toBe("version id already recorded");
      // a successor recorded before its target would empty the target's interval and erase it from history
      const backdated = yield* Effect.flip(
        ledger.supersede({
          ...Fx.financeV2,
          id: ClaimVersionId.make("cv:finance:v3"),
          supersedes: O.some(Fx.financeV2.id),
          knowledge: { ...Fx.financeV2.knowledge, recordedAt: Fx.financeV1.knowledge.recordedAt },
        })
      );
      expect(backdated.reason).toBe("successor must be recorded after the version it supersedes");
    })
  );
});
