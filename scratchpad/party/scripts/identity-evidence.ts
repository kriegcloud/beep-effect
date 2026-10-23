/**
 * Identity evidence run: mail pairings → claims, drift intervals, contact-card
 * assertions, and name-collision resolution with a review queue.
 *
 * Usage:
 *   bun scratchpad/party/scripts/identity-evidence.ts <out-dir> <graph-contacts.jsonl> \
 *     <practice-contacts.jsonl> <practice-links.jsonl> <filter-regex|-> <mail-index.jsonl>...
 *
 * Writes to <out-dir>: `identity-evidence.json` (counts only),
 * `pairing-claims.jsonl` (schema-encoded Proposed claim versions),
 * `review.html` (local review page for undecided collisions), and
 * `review-claims.jsonl` (Accepted claims from current reviewer decisions).
 * Reads `review-decisions.jsonl` from <out-dir> when present. Everything but
 * the counts contains identifiers: keep <out-dir> outside any repository.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { BunRuntime } from "@effect/platform-bun";
import * as BunCrypto from "@effect/platform-bun/BunCrypto";
import * as BunServices from "@effect/platform-bun/BunServices";
import { MailMessageIndexRecord } from "@beep/repo-cli/commands/Corpus";
import { Contact } from "@beep/law-practice-use-cases/DocumentIdentification";
import { GraphContact } from "@beep/m365/M365.schemas";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as HashSet from "effect/HashSet";
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";
import { ClaimVersion } from "../Claim.ts";
import { ActivityId, AssertionId, ClaimVersionId, PartyId } from "../Ids.ts";
import type { IdentifierId } from "../Ids.ts";
import { resolveParties } from "../Resolution.ts";
import { UtcInstant } from "../Time.ts";
import type { ContactIngest } from "../adapters/ContactEvidence.ts";
import {
  adaptGraphContact,
  adaptLegacyContactKg,
  adaptPracticeContact,
  LegacyContactKgRow,
} from "../adapters/ContactEvidence.ts";
import {
  cardMergeProposals,
  classifyDrift,
  mailboxClusters,
  observedSpan,
  pairingClaims,
  resolveCollisions,
} from "../adapters/IdentityEvidence.ts";
import { emptyCensus, identifiersByName, observe, summarize } from "../adapters/MailCensus.ts";
import type { MailboxEvidence } from "../adapters/OrgEvidence.ts";
import { classifyByOrganization, nameShape, organizationDomain } from "../adapters/OrgEvidence.ts";
import { adaptMailRecord } from "../adapters/MailIndex.ts";
import {
  applyReviews,
  CollisionCase,
  CollisionDecision,
  decisionClaims,
  isSettled,
  mailboxParty,
  sealCase,
} from "../adapters/ReviewLoop.ts";
import { renderReviewPage } from "./ReviewPage.ts";
import { jsonStringifyPretty } from "@beep/repo-utils/JsonUtils";

const countBy = <A>(as: ReadonlyArray<A>, key: (a: A) => string) => R.map(A.groupBy(as, key), A.length);

const readJsonl = Effect.fn("readJsonl")(function* <T>(fs: FileSystem.FileSystem, path: string, decode: (line: string) => Effect.Effect<T, S.SchemaError>) {
  const text = yield* fs.readFileString(path);
  return yield* pipe(
    Str.split(text, "\n"),
    A.filter(Str.isNonEmpty),
    Effect.forEach((line) => Effect.option(decode(line)))
  );
});

const program = Effect.fn("identity-evidence")(function* (args: {
  readonly outDir: string;
  readonly graphContacts: string;
  readonly practiceContacts: string;
  readonly practiceLinks: string;
  readonly filter: O.Option<RegExp>;
  readonly inputs: ReadonlyArray<string>;
}) {
  const fs = yield* FileSystem.FileSystem;
  const now = UtcInstant.make(pipe(yield* DateTime.now, DateTime.formatIso, Str.replace(/\.\d+Z$/, "Z")));
  const mailActivity = ActivityId.make("act:mail-index-adapter@0.0.0");
  const contactActivity = ActivityId.make("act:contact-card-adapter@0.0.0");

  // 1. mail
  const census = emptyCensus();
  const decodeMail = S.decodeUnknownEffect(S.fromJsonString(MailMessageIndexRecord));
  for (const input of args.inputs) {
    yield* fs.stream(input).pipe(
      Stream.decodeText,
      Stream.splitLines,
      Stream.filter((line) => Str.isNonEmpty(line) && O.match(args.filter, { onNone: () => true, onSome: (re) => re.test(line) })),
      Stream.runForEach((line) =>
        decodeMail(line).pipe(
          Effect.match({
            onFailure: () => {
              census.rows += 1;
              census.decodeFailures += 1;
            },
            onSuccess: (record) =>
              observe({
                census,
                ingest: adaptMailRecord({ record, side: "client-file", producedBy: mailActivity, observedAt: now }),
              }),
          })
        )
      )
    );
  }
  const supports = pipe(census.pairingSupport, MutableHashMap.values, A.fromIterable);

  // 2. contact cards
  const graphCards = yield* readJsonl(fs, args.graphContacts, S.decodeUnknownEffect(S.fromJsonString(GraphContact)));
  const practiceCards = yield* readJsonl(fs, args.practiceContacts, S.decodeUnknownEffect(S.fromJsonString(Contact)));
  const linkCards = yield* readJsonl(fs, args.practiceLinks, S.decodeUnknownEffect(S.fromJsonString(LegacyContactKgRow)));
  const sourced: ReadonlyArray<readonly [string, ContactIngest]> = [
    ...A.map(A.getSomes(graphCards), (contact) =>
      ["graph-export", adaptGraphContact({ contact, source: "graph-export", producedBy: contactActivity, recordedAt: now })] as const
    ),
    ...A.map(A.getSomes(practiceCards), (contact) =>
      [
        "practice-contacts",
        adaptPracticeContact({ contact, source: "practice-contacts", producedBy: contactActivity, recordedAt: now }),
      ] as const
    ),
    ...A.map(A.getSomes(linkCards), (row) =>
      [
        "contacts-kg-legacy",
        adaptLegacyContactKg({ row, source: "contacts-kg-legacy", producedBy: contactActivity, recordedAt: now }),
      ] as const
    ),
  ];
  const ingests = A.map(sourced, ([, i]) => i);
  const assertions = A.flatMap(ingests, (i) => i.assertions);

  // personal identifier rows, with identifier kind and card source
  const cardRows = A.flatMap(sourced, ([source, ingest]) =>
    A.flatMap(ingest.assertions, ({ proposition: p }) =>
      p._tag === "IdentifierOf" && p.relation !== "represents"
        ? [
            {
              identifier: p.identifier,
              card: p.party,
              source,
              kind: pipe(
                A.findFirst(ingest.identifiers, (i) => i.id === p.identifier),
                O.map((i) => (i._tag === "EmailAddress" || i._tag === "PhoneNumber" ? i._tag : ("other" as const))),
                O.getOrElse(() => "other" as const)
              ),
            },
          ]
        : []
    )
  );

  // 3. card reconciliation: conservative SameParty proposals → resolveParties
  const proposals = cardMergeProposals(cardRows);
  const absent = { _tag: "Absent", reason: "not-assessed" } as const;
  const sameCardProposals = A.map(proposals, ({ identifier, left, right }): ClaimVersion => ({
    id: ClaimVersionId.make(`cv:same-card:${encodeURIComponent(identifier)}`),
    logicalKey: `SameParty|${left}|${right}`,
    proposition: { _tag: "SameParty", left, right },
    supportedBy: [AssertionId.make(`asrt:shared-email:${encodeURIComponent(identifier)}`)],
    challengedBy: [],
    validTime: { _tag: "Unknown" },
    knowledge: { recordedAt: now, expiredAt: O.none() },
    supersedes: O.none(),
    review: { _tag: "Proposed" },
    signals: { sourceTrust: absent, sourceAssertedConfidence: absent, extractorConfidence: absent, validator: absent, reviewer: absent },
  }));
  const cards = resolveParties(sameCardProposals);
  const contactsOf = A.reduce(cardRows, HashMap.empty<IdentifierId, HashSet.HashSet<PartyId>>(), (m, row) =>
    HashMap.set(
      m,
      row.identifier,
      HashSet.add(O.getOrElse(HashMap.get(m, row.identifier), HashSet.empty<PartyId>), cards.representative(row.card))
    )
  );
  const personal = A.map(cardRows, (r) => [r.identifier, r.card] as const);

  // 4. collisions
  const mailIdentifiers = A.map(A.fromIterable(census.identifierKinds), ([id]) => id);
  const clusters = mailboxClusters({ identifiers: mailIdentifiers, supports });
  const collisions = resolveCollisions({ identifiersByName: identifiersByName(census), clusters, contactsOf });

  // 5. outputs
  const claims = pairingClaims({ supports, recordedAt: now });
  const encodeClaim = S.encodeEffect(S.fromJsonString(ClaimVersion));
  const claimLines = yield* Effect.forEach(claims, (c) => encodeClaim(c));
  yield* fs.writeFileString(`${args.outDir}/pairing-claims.jsonl`, A.join(claimLines, "\n") + "\n");

  const queue = A.filter(collisions, (c) => c.outcome === "unresolved" || c.outcome === "partially-resolved");
  const mailboxEvidence = (ids: ReadonlyArray<IdentifierId>): MailboxEvidence => ({
    domains: HashSet.fromIterable(
      A.flatMap(ids, (i) =>
        Str.startsWith("ident:email:")(i) ? O.toArray(organizationDomain(Str.slice(12)(i))) : []
      )
    ),
    span: A.reduce(
      A.flatMap(ids, (i) => O.toArray(MutableHashMap.get(census.identifierSpans, i))),
      O.none<readonly [UtcInstant, UtcInstant]>(),
      (acc, [from, to]) =>
        O.some(
          O.match(acc, {
            onNone: () => [from, to] as const,
            onSome: ([a, b]) => [from < a ? from : a, to > b ? to : b] as const,
          })
        )
    ),
  });
  const leads = A.map(queue, (c) => ({
    ...c,
    shape: nameShape(c.name),
    orgLead: classifyByOrganization(A.map(c.mailboxes, mailboxEvidence)),
  }));
  // 6. reviewer loop: seal full-name cases, apply recorded decisions, render the page
  const cases = yield* Effect.forEach(
    A.filter(leads, (c) => c.shape === "full-name"),
    (c) =>
      sealCase({
        name: c.name,
        shape: c.shape,
        outcome: c.outcome,
        orgLead: c.orgLead,
        mailboxes: A.map(c.mailboxes, (ids) => {
          const evidence = mailboxEvidence(ids);
          return {
            party: mailboxParty(ids),
            identifiers: ids,
            domains: A.fromIterable(evidence.domains),
            firstSeen: O.map(evidence.span, ([from]) => from),
            lastSeen: O.map(evidence.span, ([, to]) => to),
          };
        }),
      })
  );
  const decisionsPath = `${args.outDir}/review-decisions.jsonl`;
  const decisions = (yield* fs.exists(decisionsPath))
    ? A.getSomes(yield* readJsonl(fs, decisionsPath, S.decodeUnknownEffect(S.fromJsonString(CollisionDecision))))
    : [];
  const reviewed = applyReviews({ cases, decisions });
  const open = A.filter(reviewed, (r) => !isSettled(r.status) && r.status !== "skipped");
  const encodeCases = S.encodeEffect(CollisionCase.pipe(S.Array, S.fromJsonString));
  const encodedCases = yield* encodeCases(A.map(open, (r) => r.case));
  yield* fs.writeFileString(`${args.outDir}/review.html`, renderReviewPage(encodedCases));
  // Accepted claims only for the decision applyReviews actually settled: one per case, latest wins.
  const reviewClaims = A.flatMap(reviewed, (r) =>
    isSettled(r.status) ? O.match(r.decision, { onNone: () => [], onSome: decisionClaims }) : []
  );
  const reviewClaimLines = yield* Effect.forEach(reviewClaims, (c) => encodeClaim(c));
  yield* fs.writeFileString(`${args.outDir}/review-claims.jsonl`, A.join(reviewClaimLines, "\n") + "\n");

  const mailIdentifierSet = HashSet.fromIterable(mailIdentifiers);
  const contactIdentifiers = A.dedupe(A.map(personal, ([identifier]) => identifier));
  const summary = {
    mail: summarize(census),
    pairingClaims: {
      claims: A.length(claims),
      messagesPerPair: countBy(supports, (s) =>
        s.messages === 1 ? "1" : s.messages < 5 ? "2-4" : s.messages < 20 ? "5-19" : "20+"
      ),
      observedSpan: countBy(supports, (s) => observedSpan(s)._tag),
    },
    drift: countBy(classifyDrift(supports), (d) => d.kind),
    contacts: {
      graphCards: A.length(A.getSomes(graphCards)),
      graphDecodeFailures: A.length(A.filter(graphCards, O.isNone)),
      practiceCards: A.length(A.getSomes(practiceCards)),
      practiceDecodeFailures: A.length(A.filter(practiceCards, O.isNone)),
      linkCards: A.length(A.getSomes(linkCards)),
      linkDecodeFailures: A.length(A.filter(linkCards, O.isNone)),
      cardsPerCluster: pipe(
        A.groupBy(ingests, (i) => cards.representative(PartyId.make(i.party.id))),
        R.values,
        A.map(A.length),
        (sizes) => countBy(sizes, (n) => (n === 1 ? "1" : n === 2 ? "2" : n === 3 ? "3" : "4+"))
      ),
      clientContactRoles: countBy(
        A.flatMap(ingests, (i) =>
          A.flatMap(i.assertions, (a) =>
            a.proposition._tag === "ContextRole" ? A.map(a.anchors, (an) => (an._tag === "RecordRow" ? an.rowKey : "")) : []
          )
        ),
        (rowKey) => Str.split(rowKey, "#link:")[1] ?? "unknown"
      ),
      partiesByKind: countBy(ingests, (i) => i.party._tag),
      assertions: countBy(assertions, (a) =>
        a.proposition._tag === "IdentifierOf" ? `IdentifierOf:${a.proposition.relation}` : a.proposition._tag
      ),
      sameCardProposals: A.length(sameCardProposals),
      cardClustersAfterReconciliation: A.length(
        A.dedupe(A.map(ingests, (i) => cards.representative(PartyId.make(i.party.id))))
      ),
      personalContactIdentifiers: A.length(contactIdentifiers),
      contactIdentifiersSeenInMail: A.length(A.filter(contactIdentifiers, (i) => HashSet.has(mailIdentifierSet, i))),
    },
    collisions: {
      total: A.length(collisions),
      byOutcome: countBy(collisions, (c) => c.outcome),
      singleTokenNamesSetAside: A.length(A.filter(leads, (c) => c.shape === "single-token")),
      review: {
        cases: A.length(cases),
        decisionsLoaded: A.length(decisions),
        byStatus: countBy(reviewed, (r) => r.status),
        acceptedReviewClaims: A.length(reviewClaims),
      },
      orgLeadsForUnsettledFullNames: countBy(
        A.filter(leads, (c) => c.shape === "full-name"),
        (c) => c.orgLead
      ),
    },
  };
  yield* fs.writeFileString(`${args.outDir}/identity-evidence.json`, `${yield* jsonStringifyPretty(summary)}\n`);
  yield* Effect.log(`identity evidence written to ${args.outDir}`);
});

const [outDir, graphContacts, practiceContacts, practiceLinks, filterArg, ...inputs] = A.drop(process.argv, 2);
if (
  outDir === undefined ||
  graphContacts === undefined ||
  practiceContacts === undefined ||
  practiceLinks === undefined ||
  filterArg === undefined ||
  A.isReadonlyArrayEmpty(inputs)
) {
  // @effect-diagnostics-next-line globalConsole:off -- the usage error is written before the Effect runtime starts. Owner: @beep/scratchpad. Exit: the party-slice CLI parses arguments with effect/cli.
  console.error("usage: identity-evidence.ts <out-dir> <graph-contacts.jsonl> <practice-contacts.jsonl> <practice-links.jsonl> <filter|-> <mail-index.jsonl>...");
  process.exit(2);
}

program({
  outDir,
  graphContacts,
  practiceContacts,
  practiceLinks,
  filter: filterArg === "-" ? O.none() : O.some(new RegExp(filterArg, "i")),
  inputs,
  // @effect-diagnostics-next-line strictEffectProvide:off -- this is the script's entry point, where the platform layer is provided once. Owner: @beep/scratchpad. Exit: never while this file is a bun entry script.
}).pipe(Effect.provide(Layer.mergeAll(BunServices.layer, BunCrypto.layer)), BunRuntime.runMain);
