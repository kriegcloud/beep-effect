# Court Vocabulary Resolver — Decisions

<!--
Stage 2 (align) seed. Each entry is a branch-closing fork with a RECOMMENDED
answer, posed for resolution via `/grill-with-docs court-vocabulary-resolver`.
These are PRE-DRAFTED, not resolved: the recommendation is the starting
position to attack, not a settled decision. Resolve one branch at a time,
recommendation first; log the outcome and sync `ops/manifest.json` openQuestions.
-->

## Q1: Build-vs-buy — reimplement the courts-db resolver in Effect, or adopt an existing JS citation library?

**Recommended:** Clean-room reimplement the span-gated resolver as a schema-first
Effect module and re-derive the data tables; do **not** wrap eyecite/CourtListener
or copy server source. Vendor only narrow, single-purpose utilities (regex engine,
fuzzy matcher — see Q4), never the resolver logic itself.

**Rationale:** No production-grade JS port of courts-db exists; eyecite is Python
(Hyperscan + regex DB) and CourtListener's resolver lives in AGPL-3.0-only server
code (`cl/search/models.py`, verified via `pyproject.toml` `license =
"AGPL-3.0-only"`). The underlying *facts* are uncopyrightable (Feist v. Rural
Telephone, 499 U.S. 340), and courts-db/reporters-db/eyecite are BSD-2-Clause —
copy-with-attribution would be legally permitted — but the locked posture is
"re-derive data, reimplement logic, attribute FLP" to keep clean provenance and
avoid AGPL-adjacency confusion for a legal-AI product. The repo already owns the
composition substrate to build rather than buy: `LiteralKit` (`@beep/schema`),
`Alignment`/`GroundedExtraction` (`@beep/langextract`), `Contract.Span`
(`@beep/nlp`), and the `SyncDataTarget` engine (`official-data-sync-foundation`).
The resolver's high-level order (`strip_punc → find_court_ids_by_name →
filter_by_bankruptcy → filter_by_date → _filter_parents_from_list`), span gate,
exact-name fallback, and parent/child reduction are source-confirmed and portable.

**Status:** open (for /grill-with-docs)

## Q2: Scope boundary — confirm this packet stays the vocabulary + resolver vertical only, with the three-way ownership split?

**Recommended:** Yes. This packet owns the **controlled-vocabulary + court-string
resolver vertical only**: it adds one `targets/Courts.ts` to the existing sync
engine, lands the court/reporter vocabulary in `@beep/data` + `@beep/schema`, and
ports the resolver. It does **not** own the abstract `_tag:"Court"`/`"Jurisdiction"`
graph nodes (those stay in `goals/ip-law-knowledge-graph`), does **not** rebuild
the dataset-sync engine (stays in `goals/official-data-sync-foundation`), and does
**not** build the CourtListener API client (that is `gov-legal-data-driver-codegen`).
The fuzzy tier and SKOS emitter are **in scope but later slices** (see Q3), not cut.

**Rationale:** The split is a locked decision in CAPTURE (cluster cautions) and
RESEARCH ("Scope discipline"), and the in-repo inventory confirms the boundaries:
`ip-law-knowledge-graph/history/outputs/p1-schema-design.md` owns the TBox nodes
(this packet supplies the ABox/value layer those nodes point at); the sync engine
(`SyncDataTarget`, 4-field contract, 4 registered targets) is reused verbatim with
courts as a 5th target; `@beep/courtlistener` is a bare `VERSION`-only stub and
building its client is explicitly a different packet. Keeping the boundary tight is
what makes this a coherent, gradable packet rather than an open-ended effort.

**Status:** open (for /grill-with-docs)

## Q3: First slice — what ships in slice 1, and in what order do the rest land?

**Recommended:** Slice 1 = **data layer**: the `targets/Courts.ts` sync target
(render the templated `courts.json` → flat table) + the `LiteralKit` vocabularies
(`CourtSystem`/`CourtType`/`CourtLevel`/`CourtJurisdictionCode`/`ReporterType`) +
branded court/reporter `EntityId` schemas. Slice 2 = **deterministic resolver**
(span-gate, exact-name fallback, parent/child reduce). Slice 3 = **fuzzy tier +
SKOS emitter** (token-sort matcher + `LiteralKit → skos:Concept` triples).

**Rationale:** The vocabulary is the dependency root — RESEARCH's gold-intake
framing ("Unblocks every citation/venue feature") and the downstream consumers in
`@beep/law-practice-domain` (`Claim`, `OfficeAction`, `PriorArtReference`) all need
the closed enums + stable join keys before anything else, and none currently define
court/jurisdiction/reporter values (`NOT FOUND` in the inventory). The resolver
*consumes* an already-expanded flat table (dataset-build logic belongs in the ingest
target, not runtime), so it strictly follows slice 1. The fuzzy tier carries a
calibration trap (three disagreeing "ratio" definitions) and the SKOS emitter only
needs a single new mapping function over existing RDF constructors — both are
genuine but deferrable, so they land last where their risk is isolated.

**Status:** open (for /grill-with-docs)

## Q4: Vendor/auth — which regex engine and fuzzy matcher, and confirm the acquire boundary?

**Recommended:** Runtime deps: **`re2js`** (Apache-2.0, pure-JS RE2 port, Bun-safe,
linear-time) for the 2,100+ ported patterns over untrusted OCR text, and
**`fuzzball.js`** (MIT, pure-JS) for `token_sort_ratio` in the fuzzy tier. Reject
`node-re2` (native node-gyp addon → Bun/cross-platform risk). Dev/offline-only:
`safe-regex` + `recheck` for ReDoS auditing, `pyre-to-regexp` as a one-shot porting
aid. The sync `acquire` stays **fetch-over-HTTP + SHA-256 hash only**
(`SyncDataTargetServices = HttpClient | Crypto`), pinned to a **git commit SHA** on
`raw.githubusercontent.com`, no secrets, no other ambient capability; the runtime
resolver is fully offline/deterministic with no API round-trips.

**Rationale:** Running 2,100 hand-crafted patterns on V8's native NFA is a
demonstrated DoS surface (>1m45s hang vs ~454ms on RE2JS) with no per-regex timeout
in Node; a linear-time engine is required hardening. `re2js`'s pure-JS profile fits
the Bun runtime where a native addon is a portability liability; RE2 also rejects
backreferences/lookaround, which doubles as a porting lint (flag any pattern using
them). The in-repo `similarity` helper is full-Levenshtein, **not** `token_sort_ratio`
— a literal `>95` short-circuit ported onto it would mis-rank, so `fuzzball.js` (a
JS port of thefuzz) is the faithful choice, with a calibration test mandatory either
way. All of these are net-new deps (`rg` found none checked in) requiring SPDX +
maintenance + Bun-compat vetting under repo dependency law before MAP. The fetch+hash
acquire boundary and pinned-SHA reproducibility are confirmed against the engine's
`Source.ts` contract (`bytes` + `text`) and match the legal-AI local-first,
privilege-safe posture.

**Status:** open (for /grill-with-docs)

## Q5: Package placement — which slice owns the court/reporter IDs, the vocabulary schemas, and the resolver module?

**Recommended:** Court/reporter IDs via `EntityId.factory("law_practice", $I)`
(the `law_practice` slice). Raw rendered data lands in `@beep/data`
(`packages/foundation/primitive/data/src/generated/courts.ts` + `.data.json`). The
closed-enum `LiteralKit` vocabularies + branded IDs live in the `law-practice`
domain (or a `@beep/schema`-derived module if cross-slice reuse emerges). The
**resolver module lives in/alongside the `@beep/courtlistener` driver**
(`packages/drivers/courtlistener`), not in the law-practice domain and not in a new
package — without building the API client.

**Rationale:** `law_practice` is the consuming slice (the IP entities that reference
court values live there) and `EntityId.factory("law_practice", $I)` is the verified
per-slice pattern (`packages/shared/domain/src/identity/LawPractice.ts:12`).
`@beep/data` is the established generated landing zone (4 shipped datasets follow the
`CldrTerritories` copy-pattern). The CourtListener driver is the data-source-aligned
home for court-string resolution — CAPTURE frames the deliverable as landing
"in/alongside the courtlistener driver," and keeping the offline resolver next to
its (future) API client groups the FLP/CourtListener surface coherently. **Open
sub-fork to attack:** whether the resolver instead belongs in the `law-practice`
domain (consumer-aligned) — defensible if the resolver is treated as a domain
service rather than a driver capability.

**Status:** open (for /grill-with-docs)

## Q6: Canonical taxonomy — how is the court `jurisdiction` field modeled, and which reporter-type enum is canonical?

**Recommended:** Model jurisdiction as the three orthogonal `LiteralKit`s
`(system, type, level)` as **canonical**, derive the CourtListener 23-code composite
(`F`/`FD`/`TRS`/…) via a static-HashMap-backed crosswalk codec, and **carry both** —
retain the raw courts-db state postal token (e.g. `"A.L."`) as a separate
`stateToken` field rather than discarding it. For reporters, make the reporters-db
string `cite_type` (8 values) **canonical** and treat the CourtListener 9-value
integer enum as a derived downstream encoding.

**Rationale:** courts-db already normalizes the CL composite into the three
orthogonal fields, so `(system,type,level) ⇄ CL code` is a derivable crosswalk, not
two unrelated enums — modeling against the normalized fields matches the live file
and preserves a clean round-trip. Carrying the state token too keeps provenance
(the two "jurisdiction" taxonomies must not be conflated). The reporters-db string
enum ships *with* the records, while the CL integer enum (`FEDERAL=1 … JOURNAL=9`)
does not line up 1:1 (`specialty_west`/`specialty_lexis` vs `WEST`/`LEXIS`; CL's
`JOURNAL=9` has no reporters-db counterpart) and lives in AGPL server code — so the
string enum is both the safer-provenance and better-fit source of truth. Build the
crosswalk codec with the current Effect v4 beta.91 forms
(`SchemaTransformation.transformOrFail` / `SchemaGetter.transformOrFail`); the legacy
`S.transformOrFail` top-level helper does not exist in this version.

**Status:** open (for /grill-with-docs)

## Q7: Attribution artifact — where does the Free Law Project BSD-2 notice live?

**Recommended:** Create a net-new root `THIRD_PARTY_NOTICES.md` and discharge the
whole BSD-2 obligation with **one** entry: the BSD-2 license text + "Copyright (c)
2020, Free Law Project" + the pinned source URL/commit SHA for courts-db and
reporters-db. Confirm the path/convention with the repo owner before MAP; if an
existing repo licensing convention surfaces, adopt that instead.

**Rationale:** BSD-2 imposes exactly two duties on redistribution — retain the
copyright notice + conditions/disclaimer — and the regex patterns, `variables.json`
template dictionary, and `places/` gazetteers are **authored creative expression**
(copyrightable; attribution genuinely bites here, beyond just the uncopyrightable
facts). There is **no** root `THIRD_PARTY_NOTICES`/`NOTICE` file in the repo today
(`rg -l "THIRD_PARTY_NOTICES"` finds only plugin licenses + exploration prose), so
this is a net-new artifact whose path/convention is undecided — MAP acceptance
criteria must either adopt an existing convention or explicitly create this file and
record the obligation there. Pinning the commit SHA in the notice doubles as the
re-derivation provenance anchor.

**Status:** open (for /grill-with-docs)
