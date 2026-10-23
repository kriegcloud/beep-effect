/**
 * Pairing claims, drift, collision resolution, and contact-card adapters.
 */
import { Contact } from "@beep/law-practice-use-cases/DocumentIdentification";
import { describe, expect, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Exit from "effect/Exit";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as S from "effect/Schema";
import { ClaimVersion } from "../Claim.ts";
import { AccountId, ActivityId, EventId, IdentifierId, PartyId } from "../Ids.ts";
import { UtcInstant } from "../Time.ts";
import { adaptPracticeContact, toE164 } from "../adapters/ContactEvidence.ts";
import type { PairingSupport } from "../adapters/IdentityEvidence.ts";
import {
  cardMergeProposals,
  classifyDrift,
  mailboxClusters,
  pairingClaims,
  resolveCollisions,
} from "../adapters/IdentityEvidence.ts";
import { parseExportTime } from "../adapters/MailIndex.ts";

const at = UtcInstant.make;
const ident = IdentifierId.make;
const support = (dn: string, smtp: string, from: O.Option<string>, to: O.Option<string>): PairingSupport => ({
  mailbox: AccountId.make(`acct:exchange:${dn}`),
  exchangeDn: ident(`ident:x500:${dn}`),
  smtp: ident(`ident:email:${smtp}`),
  messages: 3,
  firstSeen: O.map(from, at),
  lastSeen: O.map(to, at),
  sample: [EventId.make(`evt:${dn}`)],
});
const y = (year: number) => O.some(`${year}-01-01T00:00:00Z`);

describe("pairing claims", () => {
  it("emits a Proposed AccountIdentifier whose valid time is the observed span, and it round-trips the schema", () => {
    const claims = pairingClaims({
      supports: [support("DNA", "a@acme.example", y(2019), y(2021))],
      recordedAt: at("2026-10-21T00:00:00Z"),
    });
    expect(A.map(claims, (c) => [c.review._tag, c.validTime._tag, c.proposition._tag])).toEqual([
      ["Proposed", "Interval", "AccountIdentifier"],
    ]);
    expect(A.every(claims, (c) => Exit.isSuccess(S.encodeExit(ClaimVersion)(c)))).toBe(true);
  });
});

describe("drift", () => {
  it("tells a sequential DN migration from concurrent aliases and from undated pairs", () => {
    const kinds = classifyDrift([
      support("OLD", "m@acme.example", y(2015), y(2018)),
      support("NEW", "m@acme.example", y(2019), y(2026)),
      support("X1", "c@acme.example", y(2015), y(2020)),
      support("X2", "c@acme.example", y(2018), y(2022)),
      support("U1", "u@acme.example", O.none(), O.none()),
      support("U2", "u@acme.example", y(2020), y(2021)),
    ]);
    expect(A.sort(A.map(kinds, (k) => k.kind), Order.String)).toEqual([
      "concurrent-aliases",
      "sequential-migration",
      "undated",
    ]);
  });
});

describe("collision resolution", () => {
  const supports = [support("CM1", "chris.morgan@acme.example", y(2020), y(2021))];
  const ids = {
    dn: ident("ident:x500:CM1"),
    work: ident("ident:email:chris.morgan@acme.example"),
    other: ident("ident:email:cmorgan@acme-sales.example"),
  };
  const clusters = mailboxClusters({ identifiers: [ids.dn, ids.work, ids.other], supports });
  const run = (contacts: ReadonlyArray<readonly [IdentifierId, string]>) =>
    A.map(
      resolveCollisions({
        identifiersByName: [["chris morgan", [ids.dn, ids.work, ids.other]]],
        clusters,
        contactsOf: A.reduce(contacts, HashMap.empty<IdentifierId, HashSet.HashSet<PartyId>>(), (m, [i, p]) =>
          HashMap.set(m, i, HashSet.make(PartyId.make(p)))
        ),
      }),
      (c) => c.outcome
    );

  it("treats a DN and its paired SMTP address as one mailbox", () => {
    expect(HashMap.get(clusters, ids.dn)).toEqual(HashMap.get(clusters, ids.work));
  });

  it("separates the outcomes evidence can and cannot settle", () => {
    expect(run([])).toEqual(["unresolved"]);
    expect(run([[ids.work, "party:card:a"]])).toEqual(["partially-resolved"]);
    expect(run([[ids.work, "party:card:a"], [ids.other, "party:card:a"]])).toEqual(["same-person"]);
    expect(run([[ids.work, "party:card:a"], [ids.other, "party:card:b"]])).toEqual(["distinct-people"]);
  });
});

describe("contact cards", () => {
  it("normalizes North American and E.164 phones and refuses the rest", () => {
    expect(toE164("(515) 555-0100")).toEqual(O.some("+15155550100"));
    expect(toE164("+44 20 7946 0958")).toEqual(O.some("+442079460958"));
    expect(toE164("ext 12")).toEqual(O.none());
  });

  it("asserts role mailboxes as `represents` and client links as context roles", () => {
    // @effect-diagnostics-next-line schemaSync:off -- plain Vitest cases decode encoded test records synchronously. Owner: @beep/scratchpad. Exit: the party-slice port moves these cases to it.effect.
    const contact = S.decodeSync(Contact)({
      contactId: "a".repeat(64),
      displayName: "Riley Ng",
      organization: "Acme Implement Co.",
      titles: [],
      emails: [
        { address: "riley@acme.example", role: false },
        { address: "info@acme.example", role: true },
      ],
      domains: ["acme.example"],
      phones: [{ e164: "+15155550101", areaCode: "515" }],
      addresses: [],
      sources: ["vcard"],
      links: [{ clientNumber: "12345", familyKey: null, source: "attorney-answer", evidence: "fixture" }],
    });
    const ingest = adaptPracticeContact({
      contact,
      source: "practice-contacts",
      producedBy: ActivityId.make("act:contacts"),
      recordedAt: at("2026-10-21T00:00:00Z"),
    });
    expect(ingest.party._tag).toBe("Person");
    expect(
      A.sort(
        A.map(ingest.assertions, (a) =>
          a.proposition._tag === "IdentifierOf" ? `IdentifierOf:${a.proposition.relation}` : a.proposition._tag
        ),
        Order.String
      )
    ).toEqual(["ContextRole", "IdentifierOf:represents", "IdentifierOf:used-by", "IdentifierOf:used-by"]);
  });
});

describe("export times", () => {
  it("parses the pffexport timestamp format and passes ISO through", () => {
    expect(parseExportTime("Mar 12, 2025 16:42:08.000000000 UTC")).toEqual(O.some(at("2025-03-12T16:42:08Z")));
    expect(parseExportTime("Jan 5, 2014 09:03:01.123456789 UTC")).toEqual(O.some(at("2014-01-05T09:03:01Z")));
    expect(parseExportTime("2025-03-12T16:42:08Z")).toEqual(O.some(at("2025-03-12T16:42:08Z")));
    expect(parseExportTime("sometime last spring")).toEqual(O.none());
  });
});

describe("card reconciliation", () => {
  const row = (identifier: string, kind: "EmailAddress" | "PhoneNumber", card: string, source: string) => ({
    identifier: ident(identifier),
    kind,
    card: PartyId.make(card),
    source,
  });

  it("chains one card per source across three sources", () => {
    const proposals = cardMergeProposals([
      row("ident:email:quinn@acme.example", "EmailAddress", "party:card:graph:1", "graph"),
      row("ident:email:quinn@acme.example", "EmailAddress", "party:card:practice:2", "practice"),
      row("ident:email:quinn@acme.example", "EmailAddress", "party:card:legacy:3", "legacy"),
    ]);
    expect(A.length(proposals)).toBe(2);
  });

  it("proposes a merge only for an email on one card per source, across sources", () => {
    const proposals = cardMergeProposals([
      // same person exported twice: merge
      row("ident:email:riley@acme.example", "EmailAddress", "party:card:graph:1", "graph"),
      row("ident:email:riley@acme.example", "EmailAddress", "party:card:practice:9", "practice"),
      // office main line on many cards: never merge
      row("ident:tel:+15155550100", "PhoneNumber", "party:card:graph:1", "graph"),
      row("ident:tel:+15155550100", "PhoneNumber", "party:card:graph:2", "graph"),
      row("ident:tel:+15155550100", "PhoneNumber", "party:card:practice:7", "practice"),
      // team inbox on three cards: shared, never merge
      row("ident:email:team@acme.example", "EmailAddress", "party:card:graph:3", "graph"),
      row("ident:email:team@acme.example", "EmailAddress", "party:card:graph:4", "graph"),
      row("ident:email:team@acme.example", "EmailAddress", "party:card:practice:8", "practice"),
      // two cards in one source sharing an email: ambiguous, never merge
      row("ident:email:pat@acme.example", "EmailAddress", "party:card:graph:5", "graph"),
      row("ident:email:pat@acme.example", "EmailAddress", "party:card:graph:6", "graph"),
    ]);
    expect(A.map(proposals, (p) => [p.left, p.right])).toEqual([["party:card:graph:1", "party:card:practice:9"]]);
  });
});
