// @effect-diagnostics schemaSync:skip-file -- the fixture is written in encoded form and decoded synchronously at module load, so tests import plain values and the decode boundary is exercised. Owner: @beep/scratchpad. Exit: the party-slice port turns the fixture into a test layer.
/**
 * Fully synthetic fixture: *Doe Harvesting v. Acme Implement Co.*
 *
 * Every name, address, and number is fictional. The fixture encodes the cases
 * that break naive party models:
 *
 * - `finance@` looks like Maya's mailbox until a later permissions export
 *   shows it is a shared Finance mailbox (bitemporal correction).
 * - Avery sends on behalf of Dana (sender ≠ sent-representing).
 * - Two different "Chris Morgan"s, plus a duplicate directory record; a
 *   name-equality merge is vetoed by a reviewed `DistinctParty`.
 * - A phone number reassigned from Jordan to Riley, with a gap.
 * - Sam, an "Engineer II" declared under Dana, approves design decisions for
 *   peers and for Dana (shadow gate, inverted authority).
 * - Pat (COO) manages two declared reports but was never collected.
 *
 * All records are written in **encoded** form and decoded through the
 * schemas, so the fixture also exercises the decode boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ClaimVersion, SourceAssertion } from "../Claim.ts";
import { CommunicationEvent, Observation } from "../Communication.ts";
import { Party } from "../Party.ts";


// ---------------------------------------------------------------------------
// Parties
// ---------------------------------------------------------------------------

const person = (id: string, label: string) => ({ _tag: "Person", id: `party:${id}`, label });
const org = (id: string, label: string) => ({ _tag: "Organization", id: `party:${id}`, label, orgKind: null });

export const parties = A.map(
  [
    person("maya", "Maya Patel"),
    person("jordan", "Jordan Lee"),
    person("avery", "Avery Chen"),
    person("dana", "Dana Brooks"),
    person("sam", "Sam Rivera"),
    person("riley", "Riley Ng"),
    person("quinn", "Quinn Ortiz"),
    person("pat", "Pat Kim"),
    person("chris-a", "Chris Morgan"),
    person("chris-b", "Chris Morgan"),
    person("chris-dup", "C. Morgan"),
    org("acme", "Acme Implement Co."),
    org("finance-dept", "Acme Finance Department"),
  ],
  (u) => S.decodeUnknownSync(Party)(u)
);

/** Parties whose own mailbox the producer collected. */
export const custodianIds = A.map(["maya", "jordan", "dana", "sam", "riley", "quinn", "avery"], (p) => `party:${p}`);

// ---------------------------------------------------------------------------
// Communication events
// ---------------------------------------------------------------------------

const email = (p: string) => `ident:email:${p}@acme.example`;
let obsSeq = 0;
const participant = (role: string, who: string) => ({ role, identifier: email(who), observation: `obs:hdr:${++obsSeq}` });

const event = (n: number, sentAt: string, ps: ReadonlyArray<ReturnType<typeof participant>>) => ({
  id: `evt:${n}`,
  occurrence: `occ:msg:${n}`,
  channel: "email",
  sentAt,
  messageId: `<${n}@acme.example>`,
  conversationKey: null,
  participants: ps,
});

export const events = A.map(
  [
    // shared finance mailbox → Jordan
    event(1, "2025-03-12T16:42:08Z", [participant("from", "finance"), participant("to", "jordan")]),
    // Avery sends as Dana's delegate → Riley
    event(2, "2025-04-01T09:00:00Z", [
      participant("from", "dana"),
      participant("sender", "avery"),
      participant("sent-representing", "dana"),
      participant("to", "riley"),
    ]),
    // Riley requests approval from Sam; Sam grants
    event(3, "2025-04-02T10:00:00Z", [participant("from", "riley"), participant("to", "sam"), participant("cc", "dana")]),
    event(4, "2025-04-02T11:00:00Z", [participant("from", "sam"), participant("to", "riley"), participant("cc", "dana")]),
    // Quinn requests approval from Sam; Sam grants
    event(5, "2025-04-03T10:00:00Z", [participant("from", "quinn"), participant("to", "sam")]),
    event(6, "2025-04-03T12:00:00Z", [participant("from", "sam"), participant("to", "quinn")]),
    // Sam grants approval to Dana (declared superior)
    event(7, "2025-04-04T15:00:00Z", [participant("from", "sam"), participant("to", "dana")]),
    // Dana escalates to Pat
    event(8, "2025-04-05T08:00:00Z", [participant("from", "dana"), participant("to", "pat")]),
  ],
  (u) => S.decodeUnknownSync(CommunicationEvent)(u)
);

/** Look up a fixture event by its number. */
export const eventNo = (n: number): CommunicationEvent =>
  O.getOrThrow(A.findFirst(events, (e) => e.id === `evt:${n}`));

/** Speech-act labels from a (synthetic) narrow classifier. */
export const speechActs = A.map(
  [
    [3, "requests-approval"],
    [4, "grants-approval"],
    [5, "requests-approval"],
    [6, "grants-approval"],
    [7, "grants-approval"],
    [8, "escalates"],
  ] as const,
  ([n, act]) =>
    S.decodeSync(Observation)({
      _tag: "SpeechActLabel",
      id: `obs:act:${n}`,
      producedBy: "act:speech-classifier",
      observedAt: "2026-10-11T00:00:00Z",
      event: `evt:${n}`,
      act,
      anchor: { _tag: "HeaderField", occurrence: `occ:msg:${n}`, namespace: "load-file", field: "body" },
    })
);

// ---------------------------------------------------------------------------
// Ledger
// ---------------------------------------------------------------------------

const absent = { _tag: "Absent", reason: "not-assessed" } as const;
const signals = (reviewer: unknown = absent) => ({
  sourceTrust: absent,
  sourceAssertedConfidence: absent,
  extractorConfidence: absent,
  validator: absent,
  reviewer,
});

const acceptedBy = (at: string, reason = "reviewed basis") => ({
  disposition: "accepted",
  reviewer: "user:analyst-7",
  basis: "0badc0de",
  reviewedAt: at,
  reason,
});

interface VersionSpec {
  readonly id: string;
  readonly logicalKey: string;
  readonly proposition: unknown;
  readonly recordedAt: string;
  readonly expiredAt?: string;
  readonly validTime?: unknown;
  readonly supersedes?: string;
  readonly supportedBy?: ReadonlyArray<string>;
  readonly review?: "accepted" | "proposed";
}

export const version = (spec: VersionSpec): ClaimVersion => {
  const accepted = (spec.review ?? "accepted") === "accepted";
  return S.decodeUnknownSync(ClaimVersion)({
    id: spec.id,
    logicalKey: spec.logicalKey,
    proposition: spec.proposition,
    supportedBy: spec.supportedBy ?? [`asrt:${Str.slice(3)(spec.id)}`],
    challengedBy: [],
    validTime: spec.validTime ?? { _tag: "OpenEnded", from: "2020-01-01T00:00:00Z" },
    knowledge: { recordedAt: spec.recordedAt, expiredAt: spec.expiredAt ?? null },
    supersedes: spec.supersedes ?? null,
    review: accepted ? { _tag: "Accepted", disposition: acceptedBy(spec.recordedAt) } : { _tag: "Proposed" },
    signals: signals(accepted ? { _tag: "Present", value: acceptedBy(spec.recordedAt) } : absent),
  });
};

const T0 = "2026-10-10T00:00:00Z";
const identOf = (who: string, party = who) =>
  version({
    id: `cv:ident:${who}`,
    logicalKey: `IdentifierOf|${email(who)}|party:${party}|used-by`,
    proposition: { _tag: "IdentifierOf", identifier: email(who), party: `party:${party}`, relation: "used-by" },
    recordedAt: T0,
  });
const plainVoice = (who: string) => `voice:${email(who)}|-|-`;
const voiceAuthor = (voice: string, author: string, id: string, supportedBy?: VersionSpec["supportedBy"]) =>
  version({
    id: `cv:voice:${id}`,
    logicalKey: `VoiceAuthor|${voice}|party:${author}`,
    proposition: { _tag: "VoiceAuthor", voice, author: `party:${author}` },
    recordedAt: T0,
    ...(supportedBy === undefined ? {} : { supportedBy }),
  });
const reportsTo = (sub: string, sup: string) =>
  version({
    id: `cv:rt:${sub}`,
    logicalKey: `ReportsTo|party:${sub}|party:${sup}`,
    proposition: { _tag: "ReportsTo", subordinate: `party:${sub}`, superior: `party:${sup}`, organization: "party:acme" },
    recordedAt: T0,
  });

/** finance@ attributed to Maya on 10-12, superseded on 10-19 by "represents Finance". */
export const financeV1 = version({
  id: "cv:finance:v1",
  logicalKey: `IdentifierOf|${email("finance")}|party:maya|used-by`,
  proposition: { _tag: "IdentifierOf", identifier: email("finance"), party: "party:maya", relation: "used-by" },
  recordedAt: "2026-10-12T00:00:00Z",
  validTime: { _tag: "OpenEnded", from: "2025-03-01T00:00:00Z" },
});

/** The same v1 row as the ledger holds it after the Oct 19 supersession closed it. */
const financeV1Closed = version({
  id: "cv:finance:v1",
  logicalKey: `IdentifierOf|${email("finance")}|party:maya|used-by`,
  proposition: { _tag: "IdentifierOf", identifier: email("finance"), party: "party:maya", relation: "used-by" },
  recordedAt: "2026-10-12T00:00:00Z",
  expiredAt: "2026-10-19T00:00:00Z",
  validTime: { _tag: "OpenEnded", from: "2025-03-01T00:00:00Z" },
});

export const financeV2 = version({
  id: "cv:finance:v2",
  logicalKey: `IdentifierOf|${email("finance")}|party:finance-dept|represents`,
  proposition: { _tag: "IdentifierOf", identifier: email("finance"), party: "party:finance-dept", relation: "represents" },
  recordedAt: "2026-10-19T00:00:00Z",
  validTime: { _tag: "OpenEnded", from: "2025-01-01T00:00:00Z" },
  supersedes: "cv:finance:v1",
});

const phone = "ident:tel:+15155550100";
export const phoneJordan = version({
    id: "cv:phone:jordan",
    logicalKey: `IdentifierOf|${phone}|party:jordan|used-by`,
    proposition: { _tag: "IdentifierOf", identifier: phone, party: "party:jordan", relation: "used-by" },
    recordedAt: T0,
    validTime: { _tag: "Interval", from: "2019-01-01T00:00:00Z", to: "2024-06-01T00:00:00Z" },
});

export const phoneVersions = [
  phoneJordan,
  version({
    id: "cv:phone:riley",
    logicalKey: `IdentifierOf|${phone}|party:riley|used-by`,
    proposition: { _tag: "IdentifierOf", identifier: phone, party: "party:riley", relation: "used-by" },
    recordedAt: T0,
    validTime: { _tag: "OpenEnded", from: "2024-09-01T00:00:00Z" },
  }),
];

export const chrisVersions = [
  version({
    id: "cv:same:chris-a-dup",
    logicalKey: "SameParty|party:chris-a|party:chris-dup",
    proposition: { _tag: "SameParty", left: "party:chris-a", right: "party:chris-dup" },
    recordedAt: T0,
  }),
  // name-equality merge an eDiscovery tool would make automatically
  version({
    id: "cv:same:chris-dup-b",
    logicalKey: "SameParty|party:chris-b|party:chris-dup",
    proposition: { _tag: "SameParty", left: "party:chris-dup", right: "party:chris-b" },
    recordedAt: T0,
  }),
  version({
    id: "cv:distinct:chris-a-b",
    logicalKey: "DistinctParty|party:chris-a|party:chris-b",
    proposition: { _tag: "DistinctParty", left: "party:chris-a", right: "party:chris-b" },
    recordedAt: T0,
  }),
];

/** Avery authored the delegated voice of event 2. */
export const delegatedVoice = `voice:${email("dana")}|${email("avery")}|${email("dana")}`;
export const averyAuthorship = voiceAuthor(delegatedVoice, "avery", "avery-for-dana", [
  "asrt:avery:header",
  "asrt:avery:perm",
  "asrt:avery:depo",
]);

export const ledger: ReadonlyArray<ClaimVersion> = [
  ...A.map(["maya", "jordan", "avery", "dana", "sam", "riley", "quinn", "pat"], (p) => identOf(p)),
  financeV1Closed,
  financeV2,
  ...phoneVersions,
  ...chrisVersions,
  ...A.map(["maya", "jordan", "dana", "sam", "riley", "quinn"], (p) => voiceAuthor(plainVoice(p), p, p)),
  averyAuthorship,
  reportsTo("sam", "dana"),
  reportsTo("riley", "dana"),
  reportsTo("quinn", "dana"),
  reportsTo("dana", "pat"),
  reportsTo("maya", "pat"),
  version({
    id: "cv:member:sam",
    logicalKey: "Membership|party:sam|party:acme",
    proposition: { _tag: "Membership", member: "party:sam", organization: "party:acme", role: null, title: "Engineer II" },
    recordedAt: T0,
  }),
];

// ---------------------------------------------------------------------------
// Assertions for admission experiments
// ---------------------------------------------------------------------------

const assertion = (id: string, proposition: unknown, anchor: unknown) =>
  S.decodeUnknownSync(SourceAssertion)({
    id,
    proposition,
    stance: "asserts",
    anchors: [anchor],
    producedBy: "act:resolver",
    validTime: { _tag: "Unknown" },
    recordedAt: T0,
  });

const averyProp = averyAuthorship.proposition;
export const averyAssertions = {
  header: assertion("asrt:avery:header", averyProp, {
    _tag: "HeaderField",
    occurrence: "occ:msg:2",
    namespace: "mapi",
    field: "PR_SENDER_EMAIL_ADDRESS",
  }),
  permissions: assertion("asrt:avery:perm", averyProp, {
    _tag: "RecordRow",
    occurrence: "occ:perm-export",
    rowKey: "dana:send-on-behalf:avery",
  }),
  testimony: assertion("asrt:avery:depo", averyProp, {
    _tag: "TextSpan",
    occurrence: "occ:depo-avery",
    textDigest: "feedface",
    start: 120,
    end: 188,
    quote: "I sent routine replies to engineering from Dana's mailbox.",
  }),
};
