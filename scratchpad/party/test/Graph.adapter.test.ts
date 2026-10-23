/**
 * effect/Graph projections and the mail-index adapter.
 */
import { MailMessageIndexRecord } from "@beep/repo-cli/commands/Corpus";
import { describe, expect, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Graph from "effect/Graph";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { adaptMailRecord } from "../adapters/MailIndex.ts";
import { isDelegated, voiceOf } from "../Communication.ts";
import { ActivityId, IdentifierId, PartyId } from "../Ids.ts";
import { declaredHierarchyCycle, identityView, orgGraph, orgMermaid, selectorGraph, selectorReach } from "../Projection.ts";
import { resolveParties } from "../Resolution.ts";
import { UtcInstant } from "../Time.ts";
import { versionsAt } from "../Claim.ts";
import * as Fx from "../fixtures/acme.ts";

const at = UtcInstant.make;
const scope = { asOf: at("2026-10-21T00:00:00Z"), validAt: at("2025-04-15T00:00:00Z"), states: ["Accepted"] as const };
const email = (p: string) => IdentifierId.make(`ident:email:${p}@acme.example`);

describe("effect/Graph projections", () => {
  it("resolution graph holds only admitted, unvetoed merges", () => {
    const { graph, vetoed } = resolveParties(versionsAt(Fx.ledger, scope));
    expect(Graph.nodeCount(graph)).toBe(3);
    expect(Graph.edgeCount(graph)).toBe(1);
    expect(A.length(vetoed)).toBe(1);
  });

  it("answers 'which selectors are within two hops of Riley's address?'", () => {
    const reach = selectorReach({ selectors: selectorGraph(Fx.events), seed: email("riley"), hops: 2 });
    expect(HashMap.get(reach, email("sam"))).toEqual(O.some(1));
    expect(HashMap.get(reach, email("dana"))).toEqual(O.some(1));
    expect(HashMap.get(reach, email("quinn"))).toEqual(O.some(2));
    expect(HashMap.get(reach, email("pat"))).toEqual(O.some(2));
    expect(O.isNone(HashMap.get(reach, email("riley")))).toBe(true);
  });

  it("surfaces contradictory declared reporting lines as a cycle", () => {
    const view = identityView({ ledger: Fx.ledger, scope });
    expect(O.isNone(declaredHierarchyCycle(orgGraph({ ledger: Fx.ledger, scope, view })))).toBe(true);
    const contradictory = [
      ...Fx.ledger,
      Fx.version({
        id: "cv:rt:pat-under-sam",
        logicalKey: "ReportsTo|party:pat|party:sam",
        proposition: { _tag: "ReportsTo", subordinate: "party:pat", superior: "party:sam", organization: null },
        recordedAt: "2026-10-10T00:00:00Z",
      }),
    ];
    const cycle = declaredHierarchyCycle(orgGraph({ ledger: contradictory, scope, view }));
    expect(O.map(cycle, (ps) => A.contains(ps, PartyId.make("party:sam")))).toEqual(O.some(true));
  });

  it("renders the declared org chart as Mermaid for review documents", () => {
    const view = identityView({ ledger: Fx.ledger, scope });
    const mermaid = orgMermaid({ org: orgGraph({ ledger: Fx.ledger, scope, view }), label: Str.slice(6) });
    expect(mermaid).toContain("reports-to");
    expect(mermaid).toContain("sam");
  });
});

describe("mail-index adapter", () => {
  // @effect-diagnostics-next-line schemaSync:off -- plain Vitest cases decode encoded test records synchronously. Owner: @beep/scratchpad. Exit: the party-slice port moves these cases to it.effect.
  const decode = S.decodeUnknownSync(MailMessageIndexRecord);
  const dn = (cn: string) => `/O=ACME/OU=EXCHANGE ADMINISTRATIVE GROUP (FYDIBOHF23SPDLT)/CN=RECIPIENTS/CN=${cn}`;
  const base = {
    attachments: [],
    embeddedDepth: 0,
    folderPath: "Top of Outlook data file/Inbox",
    sourceArtifactId: "artifact:pst-1",
    tree: "extract",
  };
  const adapt = (record: unknown) =>
    adaptMailRecord({
      record: decode(record),
      side: "adversary-production",
      producedBy: ActivityId.make("act:mail-adapter"),
      observedAt: at("2026-10-21T00:00:00Z"),
    });

  it("keeps the delegate sender, the represented mailbox, and the RFC From apart", () => {
    const ingest = adapt({
      ...base,
      messagePath: "Inbox/Message00001",
      outlook: {
        senderEmailAddress: dn("ACHEN"),
        senderName: "Avery Chen",
        sentRepresentingEmailAddress: dn("DBROOKS"),
        sentRepresentingName: "Dana Brooks",
        clientSubmitTime: "2025-04-01T09:00:00Z",
      },
      internet: { from: "Dana Brooks <dana@acme.example>", to: ["Riley Ng <riley@acme.example>"], cc: [], references: [] },
      recipients: [{ kind: "to", addressType: "EX", displayName: "Riley Ng", emailAddress: dn("RNG") }],
    });
    const event = O.getOrThrow(ingest.event);
    expect(isDelegated(voiceOf(event))).toBe(true);
    expect(A.sort(A.map(ingest.identifiers, (i) => i._tag), Order.String)).toEqual([
      "EmailAddress",
      "EmailAddress",
      "ExchangeDn",
      "ExchangeDn",
      "ExchangeDn",
    ]);
    // X.500 ↔ SMTP proposals: Dana (representing ↔ From) and Riley (To ↔ To); never Avery ↔ Dana
    expect(A.sort(A.map(ingest.pairings, (p) => p.displayName), Order.String)).toEqual(["Dana Brooks", "Riley Ng"]);
    expect(ingest.issues).toEqual([]);
  });

  it("records parser hazards as issues instead of guessing", () => {
    const ingest = adapt({
      ...base,
      messagePath: "Inbox/Message00002",
      outlook: { senderEmailAddress: "jordan@acme.example", senderName: "Jordan Lee" },
      recipients: [
        { kind: "to", addressType: "maya@acme.example", displayName: "Maya", emailAddress: "maya@acme.example" },
        { kind: "cc", displayName: "Undisclosed", emailAddress: "Undisclosed recipients" },
      ],
    });
    expect(A.sort(A.map(ingest.issues, (i) => i._tag), Order.String)).toEqual(["AddressTypeHoldsAddress", "UnparsedAddress"]);
    expect(O.isSome(ingest.event)).toBe(true);
  });

  it("recovers the address from the swapped addressType/emailAddress export flaw", () => {
    const ingest = adapt({
      ...base,
      messagePath: "Inbox/Message00004",
      outlook: { senderEmailAddress: "jordan@acme.example" },
      recipients: [{ kind: "to", addressType: "maya@acme.example", displayName: "Maya", emailAddress: "SMTP" }],
    });
    expect(A.map(ingest.issues, (i) => i._tag)).toEqual(["AddressTypeHoldsAddress"]);
    expect(A.some(ingest.identifiers, (i) => i.id === email("maya"))).toBe(true);
  });

  it("anchors a sender-only fallback from to PR_SENDER_EMAIL_ADDRESS", () => {
    const ingest = adapt({
      ...base,
      messagePath: "Inbox/Message00005",
      outlook: { senderEmailAddress: "jordan@acme.example", senderName: "Jordan Lee" },
      recipients: [{ kind: "to", emailAddress: "riley@acme.example" }],
    });
    const from = A.findFirst(ingest.observations, (o) => o._tag === "HeaderParticipant" && o.role === "from");
    expect(
      O.map(from, (o) => (o._tag === "HeaderParticipant" && o.anchor._tag === "HeaderField" ? o.anchor.field : ""))
    ).toEqual(O.some("PR_SENDER_EMAIL_ADDRESS"));
  });

  it("produces no event when no from participant can be read", () => {
    const ingest = adapt({
      ...base,
      messagePath: "Inbox/Message00003",
      outlook: {},
      recipients: [{ kind: "to", emailAddress: "riley@acme.example" }],
    });
    expect(O.isNone(ingest.event)).toBe(true);
    expect(A.map(ingest.issues, (i) => i._tag)).toEqual(["NoFromParticipant"]);
  });
});
