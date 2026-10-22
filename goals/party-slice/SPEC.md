# Party Slice Spec

## Objective

Graduate the scratchpad party model (`scratchpad/party`) into a domain-agnostic product slice,
`packages/party/{domain,use-cases,server}`. The slice covers persons, organizations and collective agents,
their identifiers, accounts and voices, evidence-gated claims, identity resolution, admission tiers and
the reviewer loop. Claims bind the `@beep/epistemics` `makeClaimEnvelope` and the P1b factories to party
propositions and ids. Governing decision: `standards/architecture/DECISIONS.md` "2026-10-21: Epistemic
Vocabulary Is Foundation; Party Is A Product Slice; Propositions Are Slice-Owned", with its 2026-10-22
amendment.

## Non-Goals

- `@beep/party-tables` and any Postgres persistence. The first goal ships a memory ledger; durable
  storage is a later goal, once the adapters have exercised the row shape.
- client, ui or config packages, and the review page (`scratchpad/party/scripts/ReviewPage.ts`). That stays
  a scratchpad tool.
- Projecting party claims into the epistemic slice's edge authority. If wanted, that is a later
  cross-slice workflow (`10-cross-slice-coordination.md`).
- Moving law-practice's contact, client or matter vocabulary into party.
- Any corpus data. Fixtures stay synthetic; the private corpus (`~/data-home/oppold-corpus`) is never
  committed or copied into tests.

## Source Hierarchy

1. User objective or issue that created this packet.
2. `AGENTS.md`, `CLAUDE.md`, and required skills.
3. Governing architecture/package standards.
4. This `SPEC.md`.
5. `PLAN.md`.
6. `GOAL.md`.
7. Supporting `research/`, `ops/`, and `history/` files.

Higher sources outrank lower sources when they conflict.

## Module Placement (P0, 2026-10-22)

| Scratchpad module | Home | Notes |
| --- | --- | --- |
| `Ids.ts` | `PartyId` from `@beep/shared-domain/identity/Party` (integer surrogate, #2025); the deterministic `PartyKey` and the other party ids in `@beep/party-domain` | the scratchpad's evidence-minted `party:` strings become `PartyKey`s. A `KeyAssignment` claim maps a `PartyKey` to a `PartyId`, and `SameParty` redirects the absorbed party's keys to the surviving id (Decision Log) |
| `Party.ts`, `Communication.ts`, `Provenance.ts` | `@beep/party-domain` | parties, identifiers, accounts, voices, evidence anchors, collection sides |
| `Proposition.ts` | `@beep/party-domain` | the slice-owned proposition union (`IdentifierOf`, `SameParty`, `DistinctParty`, `Membership`, `ReportsTo`, `VoiceAuthor`, ...) |
| `Claim.ts` | `@beep/party-domain` | `makeClaimEnvelope({ $I, proposition, ids })`; the scratchpad mirror of evidence-signals is deleted |
| `Time.ts` | removed | `@beep/epistemics` `ValidTime` / `KnowledgeInterval` (epoch millis) replace the string `UtcInstant` |
| `Admission.ts`, `Hierarchy.ts`, `Resolution.ts`, `Projection.ts` | `@beep/party-domain` | pure behavior: admission proofs, declared vs operational hierarchy, `effect/Graph` resolution, projections |
| `Ledger.ts` | port in `@beep/party-use-cases`; `PartyLedgerMemory` in `@beep/party-server` | append-only bitemporal ledger, a `Context.Service` port |
| `adapters/MailIndex.ts`, `MailCensus.ts`, `IdentityEvidence.ts`, `OrgEvidence.ts`, `ReviewLoop.ts` | `@beep/party-server` | generic ingestion over the mail drivers (`libpff`, `m365`) |
| `adapters/ContactEvidence.ts` | split | the generic contact-card path goes to `@beep/party-server`; the law-practice `contacts-kg` / client-number path stays in law-practice and feeds party through a `@beep/party-use-cases` port |
| law-practice `entities/Party` (`Party extends ProductEntity.Entity(PartyId)`) | renamed `LegalPartyReference` in `@beep/law-practice-domain` | party owns party identity and resolution; law-practice keeps a role-player reference record keyed by the shared `PartyId` (Decision Log) |
| `scripts/*`, `fixtures/acme.ts` | scripts stay in scratchpad; fixtures move to `@beep/party-domain/test` | fixtures stay fully synthetic |

## Target Surfaces

- New `packages/party/domain`, `packages/party/use-cases`, `packages/party/server`, created only with
  `bun run beep create-package`.
- `@beep/law-practice-server`: the contact-source port adapter and its Layer wiring only (bounded exception, see the Exception Ledger).
- `@beep/law-practice-domain`: the `Party` -> `LegalPartyReference` rename and its importers.
- `scratchpad/party`: remove or repoint modules once they have graduated.

## Constraints

- Party never imports law-practice. Only `@beep/law-practice-server` may depend on `@beep/party-use-cases`,
  to implement the contact-source port (bounded exception, see the Exception Ledger). Law-practice
  `domain`, `use-cases` and `tables` never import any `@beep/party-*` package.
- Party claims depend on `@beep/epistemics` only, never on `@beep/epistemic-domain` or other epistemic
  product code.
- Schema-first, then `Context.Service` contracts, then implementation. Effect v4 laws: `S.TaggedUnion`;
  `$I.annote` on checks and `.pipe($I.annoteSchema(...))` on schemas; no `as`/`!`; effect collections.
- Before each publish, run the hosted-only gates locally (lessons from #2017):
  - `bun run beep lint schema-catalog --write`
  - root `bun run lint:oxlint`
  - `bun run beep docgen check --package <pkg>`
  - the JSDoc ratchet over a regenerated inventory
  - `bun run audit:github repo-sanity`

  `@category` values come from `JSDocCategories`.
- Push the final head through `yeet publish`, so a publish verdict binds it, and keep the lane's
  `.beep/yeet/runs/<run-id>/verdict.json` for the completion gate.

## Acceptance Criteria

- [ ] `@beep/shared-domain/identity/Party` exports `PartyId`; no `LawPractice.PartyId` importer remains
  (separate prerequisite PR).
- [ ] `@beep/party-domain`, `@beep/party-use-cases` and `@beep/party-server` exist, created by
  `beep create-package`, with the module placement above.
- [ ] Party claims bind `makeClaimEnvelope` and the P1b factories to party ids. A test proves the binding
  emits identifiers distinct from the epistemic slice's.
- [ ] The scratchpad competency tests (identity, admission, hierarchy, ledger, resolution) pass against
  the slice packages on the synthetic fixtures.
- [ ] The ingestion adapters run end to end on a synthetic mail index through the memory ledger, and the
  law-practice contact port is implemented in law-practice.
- [ ] Law-practice's `Party` aggregate is renamed `LegalPartyReference` (no table, so no migration). No
  second aggregate named `Party` exists outside `@beep/party-domain`.
- [ ] All four boundary checks in the Verification Matrix return no matches. `@beep/law-practice-server` is the
  only law-practice package that imports from party, and it imports `@beep/party-use-cases` and nothing else.
  The contact-source port's input and output types reach it through the use-cases public surface.
- [ ] Parties carry an integer `PartyId` plus deterministic `PartyKey`s, and resolution follows the identity
  rules in the Decision Log. Tests cover:
  - the surviving-id choice, and replay producing the same view;
  - an absorbed `PartyId` and its `LegalPartyReference` resolving to the survivor;
  - `DistinctParty` vetoing a merge;
  - a retracted `SameParty` restoring the split.
- [ ] `bun run beep quality package-verify` passes for the three party packages.
- [ ] No unrelated refactors or formatting churn.

## Verification Matrix

| Check | Command or evidence | Required result |
| --- | --- | --- |
| Packet launcher size | `test "$(wc -m < goals/party-slice/GOAL.md)" -le 4000` | Passes |
| Manifest JSON | `jq . goals/party-slice/ops/manifest.json` | Passes |
| Whitespace | `git diff --check -- goals/party-slice` | Passes |
| Party packages | `bun run beep quality package-verify @beep/party-domain` (and use-cases, server) | Passes |
| Hosted-only gates | `beep lint schema-catalog`, root `lint:oxlint`, `beep docgen check`, the JSDoc ratchet over a regenerated inventory, `audit:github repo-sanity` | Pass locally before publish |
| Boundary: law-practice | `rg -n '@beep/law-practice' packages/party` | No matches |
| Boundary: law-practice server | `rg -n '@beep/party-' packages/law-practice/server \| rg -v '@beep/party-use-cases'` | No matches |
| Boundary: law-practice tiers | `rg -n '@beep/party-' packages/law-practice/domain packages/law-practice/use-cases packages/law-practice/tables` | No matches |
| Boundary: epistemic product | `rg -n '@beep/epistemic-' packages/party` (does not match `@beep/epistemics`) | No matches |

## Stop Conditions

- Required source files are missing or materially contradictory.
- Any spend: purchases, paid services, quota top-ups or plan changes need the
  operator.
- The same blocker repeats after reasonable investigation.

Scope growth, destructive side effects and policy calls are not stops: decide
them and record each in the Decision Log.

## Decision Log

| Date | Decision | Reason | How to reverse |
| --- | --- | --- | --- |
| 2026-10-22 | First goal creates `domain`, `use-cases`, `server` only | smallest legal slice (doc 13); tables wait for a persistence shape the adapters have exercised | add packages in a later goal |
| 2026-10-22 | `PartyId` moves to a neutral `identity/Party` kit in a separate prerequisite PR, with no re-export | keeps the slice PR reviewable and lands the shared-kernel change alone; nothing persists the old derived names | restore it to `identity/LawPractice` |
| 2026-10-22 | Party claims persist in a party-owned bitemporal ledger bound from `makeClaimEnvelope` | avoids depending on epistemic product code; any cross-slice projection is a later workflow | write party claims as epistemic edge versions |
| 2026-10-22 | `PartyId` stays the integer surrogate from the neutral kit (#2025). Party identity evidence uses a separate deterministic `PartyKey` (`pk:` + SHA-256 of the evidence basis) in `@beep/party-domain`, mapped to a `PartyId` by `KeyAssignment` claims. `SameParty` redirects the absorbed party's keys to the surviving id; the memory ledger allocates ids from a counter. Operator ruling 2026-10-22 | every product entity uses the integer surrogate and `LegalPartyReference` keys by it. A stable surrogate survives merges and splits, while keys stay deterministic for ingestion; minting the id from evidence would force a winner-take-all rewrite on every merge | make the kit carry the deterministic string as the id |
| 2026-10-22 | Identity rules. `KeyAssignment` maps a `PartyKey` to a `PartyId`; `SameParty` and `DistinctParty` relate `PartyId`s. Resolution is a read-time view over the accepted claim versions at a bitemporal scope, and no claim or reference is rewritten. In each merged component the smallest `PartyId` (earliest allocated) survives. Merges apply in `ClaimVersion` order (knowledge `recordedAt`, then id), so a replay gives the same view, and a `DistinctParty` between two components vetoes their merge. An absorbed `PartyId`, any `LegalPartyReference` keyed by it, and the absorbed party's keys all resolve to the survivor through the view. Retracting or superseding a `SameParty` recomputes the view, so the absorbed id and its keys resolve to themselves again | keeps resolution replayable and reversible (the scratchpad's `resolveParties` picked the smallest id and merged in claim order), keeps law-practice references stable without rewrites, and lets a mistaken merge be undone by a retraction | persist merges as rewrites of `KeyAssignment` and reference rows |
| 2026-10-22 | Law-practice's `Party` aggregate is renamed `LegalPartyReference` in this goal | party owns party identity and `SameParty` resolution. The law-practice record is already a role-player reference that never resolves identity (its own Gotchas), so two aggregates named `Party` over one `PartyId` would leave ownership unclear. Applies the 2026-10-21 decision ("other slices refer to parties by id and attach their own role vocabularies") | keep the name and add an ownership note instead |
| 2026-10-22 | Generic adapters live in party server; law-practice sources feed party through a use-case port | party never learns law-practice vocabulary, and ingestion stays domain-agnostic | move the adapters back into law-practice |

## Exception Ledger

| Exception | Scope | Owner | Rationale | Removal condition |
| --- | --- | --- | --- | --- |
| `@beep/law-practice-server` imports `@beep/party-use-cases` to implement the contact-source port | law-practice server tier only (the contact adapter and its Layer wiring); never law-practice domain or use-cases, never party importing law-practice | this goal (party-slice) | `01-hexagonal-vertical-slices.md:71-74` forbids slice-to-slice imports; DECISIONS 2026-06-18 allows one at the use-cases/server tier as a bounded exception recorded here | a third consumer of contact sources justifies a `shared/use-cases` contact-source contract, or law-practice emits a contact event party consumes (`10-cross-slice-coordination.md`) |
