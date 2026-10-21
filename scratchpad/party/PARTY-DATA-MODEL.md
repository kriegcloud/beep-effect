# Party Data Model — evidence-gated parties, identities, and organization graphs

Status: experiment (scratchpad), 2026-10-21. Module: `scratchpad/party/`. Tests: `test/*.test.ts` (37 competency, adapter, and identity-evidence tests, all passing). Real-corpus run: `bun scratchpad/party/scripts/mail-census.ts <out.json> <filter|-> <index.jsonl>...`. Typecheck: `node_modules/.bin/tsgo -p scratchpad/party/tsconfig.json --noEmit`. Run: `node_modules/.bin/vitest run --config scratchpad/party/vitest.config.ts`.

## 1. The short answer

Yes, the instinct is right, and the current law-practice model is the wrong shape for it. `Party`, `LegalContact`, and `LegalClient` in `@beep/law-practice-domain` are fixture-keyed rows: a display name plus a reference. Nothing in them can say *"this mailbox was attributed to this person during this interval, on this evidence, and we changed our minds on Oct 19."* That sentence is the unit of work for client identification, enrichment, and discovery analysis alike, and it is domain-agnostic. Nothing about it is legal.

What the six reports, the new research, and this experiment converge on:

```text
preserved bytes ─► occurrence ─► observation ─► source assertion ─► claim version ─► admission ─► projection
   (sha256)       (Bates/path)    (header,       (one proposition,   (bitemporal,     (tiered      (effect/Graph,
                                   metadata,      one source,         supersedes,      proof,       rebuildable,
                                   speech act)    exact anchor)       review state)    not a flag)  purpose-scoped)
```

And the identity rule the whole model enforces by omission:

```text
Party ≠ Account ≠ Identifier ≠ Voice ≠ Observation ≠ Claim ≠ Admission
```

A `Party` has no email, phone, title, or employer field. Everything that changes, gets shared, or gets recycled lives in its own record and reaches a party only through a claim.

## 2. Decisions from the grilling round

| # | Question | Answer | Rationale |
|---|---|---|---|
| D1 | Root name | **Party** | Matches the existing `party-kinds` SKOS seed ("a real-world person or organization identified independently of its legal roles"), MDM tradition, and law-practice's `Party`/`LegalRole` split. Litigation status is a `ContextRole`, never a subtype. |
| D2 | First-pass scope | **Identity + discovery graph** | Parties, identifiers, accounts, voices, observations, claims, admission, declared/operational hierarchy, Graph projections. Media/face/OSINT are deferred. |
| D3 | Relation to `@beep/epistemic-domain` | **Mirror now, place later** | Operator: epistemic-domain increasingly looks like foundation modeling (it's built on PROV/SHACL/standard vocabularies), not a product slice. Open question O1 below. |
| D4 | Fixtures | **Synthetic + private corpus census** | The repo is public. Module fixtures are fictional; the corpus census lives only in the session scratchpad. |

## 3. What the research added (verified, 3-vote adversarial pass)

Only the gaps the six reports left open were researched. Confidence is the verifier's.

**Hierarchy from email is weak evidence. Treat it as leads, not as an org chart.** (high)
On the Enron gold hierarchy, degree centrality picks the senior member of an *already related* pair 83.88% of the time. It is 79% between collected custodians, and 94% for mixed pairs, a figure inflated because investigators collected senior people. On roughly 200k employees at a large software company, tree-reconstruction methods did not beat a spanning-tree baseline. Most of the literature is Enron: 158 mostly senior people at a failing firm. [Agarwal et al., ACL 2012](https://aclanthology.org/P12-2032.pdf); [Josephs et al. 2022](https://arxiv.org/pdf/2208.01208v1).
→ The model stores operational hierarchy as `OperationalAssessment` with custodian coverage. It surfaces divergences from the declared hierarchy and never infers `ReportsTo`.

**Commercial eDiscovery separates alias from entity, then over-merges anyway.** (high)
Relativity's name normalization turns every From/To/Cc/Bcc string into typed aliases (proper name, email, extended email, phone, **Exchange X.500/X.400**) linked to entities. It then auto-merges entities that share a first and last name, which the vendor itself flags as risky. Clearwell admits that its display-name resolution "might … resolve different people who have the same name as the same participant." [Relativity name normalization](https://help.relativity.com/RelativityOne/Content/Relativity/Analytics/Name_normalization.htm); [Clearwell participants](https://supportenterprisevault.cloud.com/external/article/100038514/how-clearwell-handles-email-participants.html).
→ `Identifier` has an `ExchangeDn` case. Name equality is never merge evidence by itself, and the fixture's two Chris Morgans are the test.

**Transitive closure is unsafe unless the matcher is precise; one veto must block a merge.** (medium; single 2026 preprint)
With low matcher precision, connected-components clustering collapsed pair-F1 from 0.540 to 0.000 (MusicBrainz 200K) and from 0.667 to 0.002 (NCV 5M). A "verified merge" that blocks on any hard veto among representative cross-cluster pairs did best or tied on 4 of 6 datasets. [arXiv 2607.26298](https://arxiv.org/pdf/2607.26298). Provenance-preserving entity resolution with must-link/cannot-link repair is prior art: [Wang, Schewe & Wang, DASFAA 2015](https://openresearch-repository.anu.edu.au/entities/publication/a6809186-2daf-44d6-8041-2b73aa719870).
→ `resolveParties` applies `SameParty` merges deterministically and records any merge vetoed by a `DistinctParty` claim.

**Threading uses headers plus body segments, and role mailboxes are handled crudely.** (high)
Relativity threading treats all of a sender's aliases as one participant. A substring exclusion list forces `notifications@`/`no-reply@` into separate participants, which is a crude stand-in for modeling role mailboxes. [Relativity threading](https://help.relativity.com/RelativityOne/Content/Relativity/Analytics/Email_threading.htm).
→ `MailboxKind` is a claim, so a shared mailbox can be learned late and corrected bitemporally.

**Not covered by verified sources.** Splink/Zingg/Senzing internals, survivorship and the critique of golden records, EDRM threading standards, and how litigation teams actually use people graphs (custodian selection, key players, privilege logs). One refuted claim, "Relativity merges are irreversible and lose data", was voted down 0–3, but a verifier separately noted that Relativity has no split operation. Re-check before citing either way.

## 4. Divergent ideation (`/adhd`) — what survived

Five isolated frames: regulator, hostile producer, 3am on-call, remove-the-assumption, biology. Each produced 6 ideas, so 30 in total. Scores below are [Novelty Viability Fit].

**Clusters**

- *Adversarial-production plays.* `ProductionArtifact` layer recording how the producer's tooling rewrote headers [N7 V8 F9]. `AbsenceObservation` for expected custodians or thread hops that are missing [N8 V7 F9]. `RedactedPartySlot` as a placeholder party [N8 V7 F8]. Bates-anchored locators [N5 V9 F9]. Adversary self-descriptions held in a testimonial tier [N7 V8 F9].
- *Identity-unit plays.* A **Voice** node between mailbox and person [N8 V8 F10]. Evidence-kind classes (distinctive / shared-template / bulk) so signatures and footers can't found a merge [N8 V8 F9]. Reviewed `DistinctParty` vetoes [N4 V9 F9]. Party as a standing merge/split hypothesis resolved lazily [N8 V6 F8].
- *Hierarchy plays.* **Declared vs operational hierarchy as competing projections**, with the divergence as the lead [N8 V8 F10]. Hebbian-decay working-relationship graphs [N7 V7 F7].
- *Knowledge-flow plays.* The accused-feature concept as the root node, tracing who carried it and when [N9 V7 F9]. Contact-tracing "R0" curves per concept [N9 V7 F9].
- *Governance plays.* **Branded usage-tier admission (`DepositionReady`)** [N9 V8 F9]. Privilege-taint lattice propagated to projections [N6 V8 F9]. Protective-order audience tier (AEO / Confidential) [N6 V9 F9]. A conflict-check firewall between client-side and adversary-side parties [N7 V7 F8]. Per-projection replay manifests [N5 V9 F8]. Work product subscribing to the claims it cites ("your citation moved") [N8 V7 F8].

**Shortlist (built into the module)**

1. ★ **Usage-tier admission proof**: `Admission.ts`. Non-obvious but viable: the compiler refuses a weak attribution in a deposition outline.
2. **Voice**: `Communication.ts`. It closes the classic wrong-person error, where an executive is credited with a message their assistant wrote.
3. **Declared vs operational divergence**: `Hierarchy.ts`. It turns weak hierarchy inference (§3) into leads instead of facts.

**Traps**

- *Stylometric "microbiome" author fingerprints.* Defensibility under expert challenge is poor, and the signal drifts across email clients. Useful later as a *candidate-ranking* input, never as merge evidence.
- *Mailbox-session as the identity unit.* The granularity explodes, and keyboard-level attribution is rarely provable from a production.
- *Phylogenetic reconstruction of never-produced ancestor documents.* Speculative inference that the other side will attack. Keep it out of anything that is cited.
- *A single "influence score" column.* Every report already rejects this, and §3 shows why.

**Focus notes (deepening agents)**

- *Admission.* The load-bearing risk is staleness: a proof minted at time *t* is cited at time *t'* after a contradiction arrives. Mitigation: work products pin an as-of time, and rehydration re-runs `admit`. That is why there is no schema decoder for `Admitted`.
- *Voice.* Evidence kind is itself an inference. A "distinctive" phrase turns out to be a department template once enough of the corpus is seen. So `EvidenceKindAssessment` is a revisable record, not a field on the observation.
- *Hierarchy.* The confound is custodian selection, because operational centrality partly measures who was collected. Every assessment therefore carries `actorCoverage` and `counterpartyCoverage`, and a `CoverageGap` divergence turns the confound into a lead that can support a motion to compel.

**Provocation.** Make the accused technical concept the root node instead of a person. Ask *"which parties carried the term `X` (codename, part number, claim term), in what order, from which first appearance?"* The people graph then becomes a by-product of tracing knowledge, which is closer to what willfulness and copying arguments actually need.

## 5. The module

```text
scratchpad/party/
  Ids.ts           scheme-prefixed branded ids (party:, ident:, acct:, voice:, occ:, act:, obs:, evt:, asrt:, cv:, ...)
  Time.ts          TemporalExtent (Instant | Interval | OpenEnded | Unknown), KnowledgeInterval, holdsAt/knownAt/overlaps
  Party.ts         Party (Person | Organization | CollectiveAgent), Identifier (EmailAddress | PhoneNumber | ExchangeDn |
                   Username | NativeAccountId | ExternalId), Account (Mailbox | SocialAccount | PhoneLine | ChatAccount)
  Provenance.ts    CollectionSide, Locator (Bates | ContainerChild | FilePath | Url), ArtifactOccurrence, Activity,
                   Producer (Software | Model | Human), EvidenceAnchor (HeaderField | TextSpan | MetadataTag | RecordRow)
  Communication.ts ParticipantRole, EvidenceKind, SpeechAct, Observation (HeaderParticipant | MetadataTag | SignatureBlock |
                   DirectoryRow | MailboxPermission | SpeechActLabel | Absence), CommunicationEvent, Voice, voiceOf,
                   isDelegated, RedactedPartySlot
  Proposition.ts   role-named algebra: IdentifierOf, AccountIdentifier, MailboxKind, AccountControl, VoiceAuthor,
                   SameParty, DistinctParty, PartyName, Membership, ReportsTo, DelegateOf, ContextRole, External;
                   logicalKey, partiesOf
  Claim.ts         SourceAssertion, evidence-signals/v1 mirror (EvidenceSignals, Measurement, ReviewerDisposition,
                   DependenceAssessment), StructuralVerdict vs ReviewState, ClaimVersion, versionsAt
  Resolution.ts    resolveParties: undirected effect/Graph of admitted SameParty edges; Graph.bfs component check
                   for DistinctParty vetoes; clusters = Graph.connectedComponents
  Admission.ts     AdmissionTier, AdmissionClause, AdmissionPolicy, admit → Admitted<Tier> | AdmissionRefused,
                   independentSupportCount, depositionOutlineEntry (accepts only deposition-ready)
  Hierarchy.ts     AttributedEvent, OperationalAssessment, Divergence (InvertedAuthority | ShadowGate |
                   PhantomManager | CoverageGap), assessOperational, divergences
  Projection.ts    identityView, attributeEvents, declaredLines, orgGraph, reportingGraph (Graph.filterEdges),
                   chainOfCommand (Graph.dfs), declaredHierarchyCycle (Graph.findCycle), orgMermaid (Graph.toMermaid),
                   selectorGraph, selectorReach (Graph.unweightedDistances: k-hop contact chaining)
  Hierarchy.ts     (+) declaredGraph / approvalsGraph projections; InvertedAuthority = approval up the declared
                   chain (Graph.hasPath); ShadowGate via Graph.outDegree; CoverageGap via Graph.inDegree
  Ledger.ts        PartyLedger Context.Service (append | supersede | snapshot), LedgerConflict, PartyLedgerMemory Layer
  adapters/
    MailIndex.ts   MailMessageIndexRecord (the corpus provenance index row, reused from @beep/repo-cli) →
                   occurrence + HeaderParticipant observations + identifiers + CommunicationEvent + X.500↔SMTP
                   alias pairings + data-quality issues; recovers the swapped addressType/emailAddress export flaw
    MailCensus.ts  count-only census accumulator (alias spread, unification, delegation, collision risk)
    IdentityEvidence.ts  pairing support → Proposed AccountIdentifier claims; drift classification;
                   mailbox clusters (Graph.connectedComponents); collision resolution; cardMergeProposals
    ContactEvidence.ts   GraphContact / Contact / LegacyContactKgRow cards → provisional parties + assertions
  scripts/
    mail-census.ts streams index JSONL through the adapter; writes counts only
    identity-evidence.ts mail + contacts → counts, encoded claim versions, review queue (private outputs)
  fixtures/acme.ts fully synthetic "Doe Harvesting v. Acme Implement Co." production, encoded and decoded
```

Conventions this module follows (operator rulings 2026-10-21): inline tagged unions are `S.TaggedUnion({...})`, and `S.Union + toTaggedUnion` is kept only where a member carries its own `.check` (`TemporalExtent.Interval`, `EvidenceAnchor.TextSpan`, the distinct-role propositions). There are no `as` casts and no `!` assertions. `Admitted` is a nominal class whose constructor requires a module-private mint token. Graph algorithms come from `effect/Graph` and are never hand-rolled.

Design order was schema → service contract (`PartyLedger`) → implementation (in-memory Layer, pure projections).

### Decisions made while building (and how to reverse them)

| Decision | Reason | Reverse by |
|---|---|---|
| IDs carry a scheme prefix that is checked at decode | Brands vanish at runtime, and a prefix check makes "person id in an account slot" a decode failure | Drop the `isPattern` check in `Ids.ts` |
| `Unknown` valid time never holds | An undated source must not count as "always valid" | Change `holdsAt.Unknown` |
| `IdentifierOf(... "represents")` is excluded from personal attribution | A role mailbox representing a department is not a person's use | Include the relation in `identityView` |
| An identifier mapped to >1 party in scope maps to none | Ambiguity is not resolved by picking one | Return all candidates |
| Authorship only via admitted `VoiceAuthor`; never from the `from` header | Delegates, shared mailboxes, assistants | — (load-bearing) |
| `MailboxKind` has one logical key per mailbox | A new kind supersedes; kinds don't coexist | Include `kind` in the key |
| `unknownCountsAs: "dependent"` in the default policy | Matches evidence-signals/v1: unknown dependence is never independence | Policy data, per tier |
| No decoder for `Admitted` | A persisted proof would bypass re-evaluation | — (load-bearing) |

### Mapping to shipped contracts

| Scratch type | Shipped counterpart | Gap to close on promotion |
|---|---|---|
| `ClaimVersion` | `EdgeVersion` (`packages/epistemic/domain/src/entities/EdgeVersion`) | EdgeVersion endpoint kinds are claim/evidence/entity/observation; party propositions need either typed endpoints or `payload = Proposition` |
| `StructuralVerdict` | `ClaimGateResult` (`values/ClaimGate`) | Direct reuse; SHACL shapes per proposition variant |
| `EvidenceSignals`, `DependenceAssessment` | `evidence-signals/v1` (explorations/evidence-source-policy-calibration) | Reuse the ratified envelope; this mirror drops basis digests and per-signal provenance |
| `Party` | law-practice `Party` (fixture reference) | law-practice `Party` becomes a `ContextRole` player referencing a party id; `LegalRole` stays in law-practice |
| `LegalContact` / `LegalClient` | — | Decompose into `Party` + `IdentifierOf` + `ContextRole(client)` claims; existing rows become source assertions (`side: client-file`) |
| `Observation.HeaderParticipant` | `MailMessageIndexRecord` (`tooling/.../ProvenanceIndex.schemas.ts`) | Adapter: `outlook.sender*`, `sentRepresenting*`, `recipients[].addressType=EX` → `ExchangeDn` |
| `MentionRecord` / `ResolvedEntity` | `scratchpad/effect-ontology/Domain/Model/EntityResolution.ts` | Same two-tier idea; this module adds vetoes and bitemporality |

Ontology alignment for export only, never as the stored hierarchy: `Party.Person` → `foaf:Person` (not `crm:E21`); `Account` → `sioc:UserAccount` (name the SIOC version); `Membership` → `org:Membership`; `Activity` → `prov:Activity`; `SourceAssertion` → `prov:Entity` with qualified derivation; relationship kinds in `External` → AgRelOn via SKOS `exactMatch`/`closeMatch`.

## 6. Competency questions ↔ tests

| Question | Test |
|---|---|
| Can a person id sit in an account slot? | rejects a person id in an account slot |
| Can a gate verdict pass as acceptance? | does not let a structural gate verdict pass as a review decision |
| Who wrote a message sent from Dana's mailbox by Avery? | separates a delegate sender from the represented mailbox |
| Who sent the `finance@` message? | attributes a shared-mailbox message to nobody rather than guessing |
| What did we believe on Oct 12, before the Oct 19 correction? | reproduces what we believed on Oct 12 |
| Whose phone was it in 2023, mid-2024, and 2025? | follows a reassigned phone number through valid time, including the gap |
| Are the two Chris Morgans one person? | vetoes the name-equality merge |
| Can the adversary's own records alone support a deposition attribution? | refuses …, naming each gap |
| What would make it admissible? | admits once testimony from outside the production corroborates independently |
| Can a signature block found an attribution? | never founds an attribution on a signature block alone |
| Can a weaker proof reach a deposition outline? | does not compile (`@ts-expect-error`) |
| Who gates decisions despite a junior title? | finds the junior engineer … (ShadowGate, InvertedAuthority, PhantomManager) |
| Which declared manager's mailbox is missing? | flags the declared manager whose mailbox was never collected |
| What is Sam's chain of command? | walks the declared chain on an `effect/Graph` projection |
| Does correction rewrite history? | supersession closes the old knowledge interval instead of rewriting it |

## 7. Reality check against the motivating matter

A read-only metadata census of the firm corpus is in the private session scratchpad, not in this repo, because the repo is public. Its conclusion matters for planning: **the corpus holds the firm's own correspondence about the matter, not the adversary's production.** The adversary-production use case can only be exercised against synthetic fixtures until a production arrives. The firm's own mail is still a good first real ingestion target. Its index already carries MAPI sender vs sent-representing, X.500 vs SMTP address types, and many more display names than addresses, which is exactly the Voice, `ExchangeDn`, and alias problem this model targets. The census also found a parser hazard: `addressType` sometimes holds an email address.

### 7.1 First real ingestion: the firm's own mail index (aggregate counts only)

The adapter ran over both provenance mail indexes: 241,501 rows in about 9 seconds, with **0 decode failures**. It also ran over one matter's subset (5,207 rows). Raw outputs are in the private session scratchpad.

| Measure | Whole index | One matter subset | What it says about the model |
|---|---:|---:|---|
| Rows → events | 241,501 → 240,087 | 5,207 → 5,201 | 81 rows have no readable `from`; they stay rows, not events |
| Identifiers (SMTP / X.500 DN) | 17,115 / 1,037 | 652 / 147 | X.500 is a real identifier kind, not an edge case |
| Distinct display names | 33,107 | 1,026 | **More names than identifiers.** A display name is an alias observation, never identity |
| Identifiers seen under ≥ 3 display names | 3,332 (max 531 on one address) | 90 (max 19) | Role and list addresses carry many names; that is shared-template evidence |
| Display names spanning ≥ 2 identifiers | 2,567 (max 26) | 145 (max 6) | One name, many addresses: alias spread that resolution must handle |
| X.500 DNs unified to SMTP by same-message pairing | 870 of 1,037 (84%) | 134 of 147 (91%) | The pairing heuristic recovers most Exchange identities without a directory export |
| SMTP addresses paired to > 1 DN | 179 | 22 | **Legacy DNs change over time** (org or tenant migrations). An identifier → mailbox link needs valid time, which is direct empirical support for bitemporal `AccountIdentifier` claims |
| DNs paired to > 1 SMTP | 44 | 2 | Aliases or reassignment: a proposal, not a merge |
| Delegated messages (sender ≠ represented mailbox) | 2,795 across 650 voices | 55 across 9 voices | Delegation exists even in a small firm; a large company's executive assistants will multiply it |
| Display names a name-equality merger would collapse across unlinked mailboxes | 1,852 | 32 | Upper bound on what Relativity-style name merging would fuse. Each is either one person with several addresses or several people with one name; only evidence tells which |
| Parser hazards | 9,786 swapped `addressType`/`emailAddress` rows (recovered); 3,292 genuinely unparsed | 355 / 74 | Bad data stays as data issues instead of disappearing |

Two corrections came out of this run. First, the export swaps `addressType` and `emailAddress`: every one of the 9,786 affected rows carries the literal `SMTP` in `emailAddress`. The adapter now recovers the address and still records the issue. Second, the earlier census figure of 941 display names was a count over raw strings; normalized per header, the subset has 1,026.

### 7.2 Pairings → claims, drift, contact evidence, collision resolution

`scripts/identity-evidence.ts` runs the mail index plus three client-file contact exports: a Graph contact export, the deduplicated practice contacts, and a legacy contacts-kg export. It writes counts plus two private files: schema-encoded claim versions, and a review queue.

| Step | Result | Reading |
|---|---:|---|
| X.500↔SMTP pairs → Proposed `AccountIdentifier` claims | 918 claims; 809 with an observed `Interval`, 109 with a single `Instant` | Valid time is the observed span, a lower bound. 415 pairs rest on 20 or more messages and 109 on a single one, so support differs a lot and the review queue can rank by it |
| SMTP addresses on several DNs | **163 sequential migrations**, 16 concurrent aliases | The legacy DN changes cleanly over time for most addresses, giving valid-time successors rather than conflicts. These are the first measured identifier validity intervals in this corpus |
| Contact cards (3 sources) | 1,726 cards, 0 decode failures; 3,771 `used-by`, 2 `represents`, 112 client-contact `ContextRole`s | Link provenance kept: 36 `attorney-filed-email`, 26 `email-subject-ref`, 50 `org-name-match` (the weakest) |
| Card reconciliation (`cardMergeProposals` → `resolveParties`) | 925 proposals → 867 clusters (415 singletons, 76 pairs, 363 triples, 13 with ≥ 4) | The 363 triples are the same person exported by all three systems. The 13 clusters of four or more are spot-check candidates |
| Name collisions across mailboxes (Graph clusters) | 1,781 | Down from 1,852 once pairing components replaced the first-SMTP shortcut |
| … settled by contact evidence | 18 same person, 3 distinct people, 42 conflicting contacts, 249 partial, **1,469 unresolved** | Contact books cover only 463 of the 18,152 mail identifiers (2.6%). They help with clients but cannot settle collisions among opposing counsel, examiners and vendors |

Three things this run surfaced, each now handled in code:

1. **pffexport timestamps** (`Mar 12, 2025 16:42:08.000000000 UTC`) are not ISO-8601. The strict `UtcInstant` decoder rejected every one, and the first run reported every span as `Unknown`. `parseExportTime` now reads the format, and anything it can't read stays unknown rather than invented.
2. **Phones chain unrelated people.** One office line appears on 13 cards. The first merge rule, "any shared identifier", collapsed 1,131 cards into 503 clusters: the mega-cluster failure the research predicted. The rule is now: only an email listed by at most one card per source, across at least two sources, proposes `SameParty`. Phones and team inboxes are template evidence.
3. **Schema drift in the legacy contacts export.** The rows use free-form ids and `csv`/`vcf` sources, and the shipped `ContactProjection` correctly refused all 595 of them. `LegacyContactKgRow` decodes that format explicitly and reuses the shipped `ClientNumber`, `ContactEmail` and `ContactLinkSource`.

## 8. Open questions and next steps

- **O1 — placement (architecture).** Does `@beep/epistemic-domain` belong under `foundation/modeling`? And does Party become a product slice (`packages/party/*`) or a foundation modeling package? Proposed test: if no type in it names a product concept (matter, client, docket), it is foundation, so `ClaimVersion`, signals and admission machinery qualify. `Party` + `Proposition` arguably qualify too. `ContextRole` vocabularies stay with their slices. Route through `/grill-with-docs` against `07-non-slice-families.md` and `02-shared-kernel.md` before any package is created with `bun run beep create-package`.
- **O2 — `EdgeVersion` endpoint shape.** Typed per-proposition endpoints, or a `Proposition` payload with a derived logical key?
- **O3b — collision evidence beyond the address book.** 1,469 collisions are unresolved because contact books cover only 2.6% of mail identifiers. Next evidence sources, in order of expected yield:
  - SMTP domain → organization claims (two "Chris Morgan"s at different firms' domains are a `DistinctParty` lead),
  - signature-block observations,
  - the review queue itself: reviewer `SameParty`/`DistinctParty` decisions become the vetoes `resolveParties` already honors.
- **O3 — first real adapter (done, §7.1; pairings → claims done, §7.2).** Earlier plan, kept for reference:
  - Turn `AliasPairing`s into `SourceAssertion`s (`AccountIdentifier`, anchored to header fields) and aggregate support per pair across messages.
  - Time-bound the 179 SMTP→multi-DN cases by first and last seen dates, which gives the first measured identifier valid-time intervals.
  - Feed the existing contact exports (Graph contact shape, box-onboarding contacts) in as `side: client-file` assertions for `IdentifierOf` and `ContextRole(client)`.
  - Measure how many of the 1,852 name collisions the pairings plus contact assertions resolve, and route the rest to a review queue.
- **O4 — evidence-kind reclassifier.** Corpus-frequency reclassification of signature and disclaimer spans, which re-opens dependent claims.
- **O5 — governance fields.** Privilege-taint propagation and protective-order audience tiers on projections, and a conflict firewall between `client-file` and `adversary-production` parties.
- **O6 — research still owed.** Splink/Zingg/Senzing match-evidence and audit models. Court and EDRM treatment of inferred people graphs used for custodian selection and privilege logs.
