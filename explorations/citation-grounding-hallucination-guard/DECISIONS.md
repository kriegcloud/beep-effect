# Citation Grounding & Hallucination Guard — Decisions

<!--
Stage 2 (ALIGN) seed, pre-drafted 2026-06-29 from RESEARCH.md + CAPTURE.md.
Each block poses ONE branch-closing question with a RECOMMENDED answer and
rationale. NONE are resolved here — the user resolves them one at a time via
`/grill-with-docs citation-grounding-hallucination-guard`, logging each
resolution and syncing `ops/manifest.json` openQuestions as they close.
-->

## Q1: Build-vs-buy — clean-room TS/Effect reimplementation of the eyecite parser, a vendored port of `eyecite-js`, or wrap the hosted CourtListener lookup as the engine?

**Recommended:** A **clean-room, TS-native, Effect-first reimplementation** of
the eyecite parse pipeline (clean → tokenize → extract → char-spans) over the
BSD-2-Clause data packages (`reporters-db` ~1,167 reporters / 2,102 variations,
`courts-db`) — **not** a verbatim port of `eyecite-js`, and **not** the hosted
CourtListener Citation Lookup API as the primary engine. Skip native Hyperscan
(heavy, x86-bound); use a literal prefilter + per-extractor `RegExp` wrapped in
an `Effect` timeout/interrupt (or RE2) because the regexes carry **no ReDoS
worst-case guarantee** on untrusted document input. `eyecite-js` (alpha,
self-reported v2.7.6 parity, not independently validated) and `CiteURL` (MIT
declarative YAML, 130+ US sources) stay **design references**; the hosted lookup
is a non-privileged enrichment lane only (see Q4). Pin the eyecite version the
behavior is cloned from (the resolver signature set grows across releases, e.g.
`MAX_OPINION_PAGE_COUNT = 150`).

**Rationale:** RESEARCH corrects CAPTURE's caution — `eyecite`, `reporters-db`,
`courts-db`, and `eyecite-js` are **all BSD-2-Clause and port-safe**, so the
choice to reimplement is an *engineering* preference (TS-native, Effect-first,
no native deps), **not** a license obligation; only the CourtListener `cl/`
Django app is AGPL. The parser is genuine gap **netNew #1** (`rg -li eyecite`
over `packages/` returns nothing; the only `*Citation*` symbols are unrelated).
A clean-room reimpl keeps the package on the repo's Effect/Schema spine, avoids
inheriting an unvalidated alpha port's maturity risk, and lets the BSD data
packages supply the reporter/court crosswalk without copyright entanglement. The
ReDoS wrapper is mandatory because source documents are **untrusted data**
(OWASP LLM01, #1 on the 2025/2026 Top 10) and eyecite-class regexes carry no
worst-case guarantee on malicious input.

**Status:** open (for /grill-with-docs)

## Q2: Scope boundary — does this packet ship the full guard (parser + lifecycle + verbatim gate + straddle + matter carrier + fence enforcement + court vocab), or own only the grounding core and compose/defer the rest?

**Recommended:** Own the **four genuine gaps + the matter-tag-on-span
precondition**; defer enforcement, vocab ingest, and good-law to their goal
homes. **In scope:** (1) the eyecite-style citation parser, (2) the persisted
`CitationResolution` lifecycle, (3) the ground-before-cite / verbatim-citation
**guard contract** — i.e. the verbatim-equality gate that *prevents fabricated
quote text and unspanned citations* — (4) cross-chunk/page **straddle**, plus the
net-new `CitationEvidence` / `MatterScopedEvidenceSpan` **carrier model** and the
matter-tag-on-span typed precondition. **Explicitly OUT:** prompt-injection /
answer-composition-steering defenses (classifier/segregation stay
retrieval/context/tool-policy requirements *outside* this gate); the
matter-isolation **fence enforcement** itself (a downstream product/security goal
— the generic `agent-governance-control-plane` supplies inherited *policy* only,
all phases pending); reporter/court vocab + citator **"good-law" feed** (the
guard *consumes* an external `isGoodLaw` flag, never computes it); and any
IP-law vocabulary in the **epistemic/shared slice**.

**Rationale:** RESEARCH's Genuine-gaps list scopes exactly these four netNews as
unowned anywhere in `packages/**/src`, and the governance dossier *explicitly*
scopes prompt-injection out — the verbatim gate "does NOT by itself prevent an
injected document from steering answer composition, tool choice, retrieval, or
non-quoted prose." The matter-fence has no enforcement home: RESEARCH flags a
concrete product/security goal as netNew because no current model carries a
matter id (`EvidenceSpan` is `TextAnchorFields` + `Confidence` only,
`EvidenceSpan.model.ts:76-80`; `@beep/nlp` `Provenance` has
`source`/`generatedBy`/`timestamp`/optional `confidence` but **no matter or wall
boundary**, `Contract.ts:225-236`). This packet owns the carrier-model
precondition; the fence is downstream. Court-vocab routing is logged "NOT yet
settled" (amend `official-data-sync-foundation` *or* stand up
`court-vocabulary-resolver`), and the good-law feed is an explicit external
input. Keeping IP-law vocab out of epistemic/shared is a locked epistemic SPEC
non-goal.

**Status:** open (for /grill-with-docs)

## Q3: First slice — which thin vertical proves the substrate end-to-end first?

**Recommended:** The **verbatim-verification gate, not the parser.** Slice 1
extends the Apache-2.0 in-repo `@beep/langextract` `Alignment`
(`packages/foundation/capability/langextract/src/Alignment/index.ts`) to
**collapse to VERIFIED-with-location | NOT-FOUND** (drop `match_fuzzy`, and per
Q7 `match_lesser`) and ships the net-new **verified `TextAnchor`
constructor/decoder** that fails unless `source.slice(startChar, endChar)`
exactly equals `quote`. This needs no parser, no driver, and no vocab. Slice 2 is
the eyecite-style parser (netNew #1) over local text. Slice 3 wires **straddle**
(the `chunk → [globalStart, globalEnd)` map + `[[PAGE_BREAK]]` sentinel,
extending `@beep/nlp` `TextChunk`/`AnnotatedDocument`). The `CitationResolution`
lifecycle and any hosted lookup come **last**.

**Rationale:** RESEARCH shows the grounding substrate already exists and the
verbatim gate is the **spine** of ground-before-cite — **LegalCiteBench**
quantifies the payoff (models score 6.80/100 *authoring* citations from memory
but ~90 *verifying* a supplied one, with a >94% "Misleading Answer Rate" on
retrieval), so "never let the model author a cite, only verify one" makes the
verify gate the highest-leverage, lowest-risk first brick. It composes existing
Apache-2.0 bricks (`langextract` Alignment's `lowerWithSourceOffsets`
normalized→source map, `@beep/provenance` `TextAnchor`) rather than all four
netNews at once. The verified constructor closes RESEARCH's flagged hole that
"`text.slice(startChar, endChar)` reproduces `quote`" is **documented intent in
prose, NOT a schema-enforced guarantee** (`TextAnchor.ts:4-9`; the only validator
today is `isWellOrdered`).

**Status:** open (for /grill-with-docs)

## Q4: Vendor/auth — depend on the hosted CourtListener Citation Lookup API in v1, or ship local-only?

**Recommended:** **Local-only for v1** on the privilege-safe path; the hosted
CourtListener lookup is an **opt-in, non-privileged enrichment/verification
lane** gated behind an explicit privilege flag and deferred past the local
slices. Run the BSD-data + clean-room TS parser **locally** so privileged
document text never leaves the box. When the hosted lane is enabled, the token
is a managed secret (`Authorization: Token <token>` — literal Token, **NOT**
Bearer) via `Config.redacted`, and the factual rate/cost constraints (60 valid
cites/min, 250/request, char cap = **min(client cap, 64k)** given the
64k-vs-10k discrepancy) are encoded with **token-bucket + idempotency-key
dedupe** ("parse-once / charge-per-citation"). Decode the throttle-timestamp
field behind a **`wait_until` / `wait_util` compatibility codec** and confirm
against a real 429 before trusting either spelling.

**Rationale:** RESEARCH is explicit that the hosted lookup **leaks document text
off-box** ("unacceptable for privileged legal text") and was **membership-gated
as of 2026-05-07**, and that it only matches **full case citations** (not
statutes/journals/id/supra) — so it cannot be the privilege-safe primary engine.
The factual rate/cost limits are non-copyrightable and safe to encode, but the
field spelling and per-citation status wire type (int vs string) are **open
verification items**, so the decoder must tolerate both spellings. The local
path is unblocked today (BSD data + clean-room TS); the hosted lane is a
downstream enrichment, not a v1 dependency. Token auth is a managed secret per
the auth/secret boundary in RESEARCH.

**Status:** open (for /grill-with-docs)

## Q5: Package placement — where do the parser, the guard/straddle contract, the citation lifecycle, and the matter-scoped evidence model live?

**Recommended:** A **three-home split.** (1) **Domain-agnostic grounding** — the
verbatim-verification + straddle extension — lands as a **foundation capability**
(extending `@beep/langextract` under `packages/foundation/capability/*`, where
`nlp`, `file-processing`, and `observability` already live), since verbatim
grounding verifies *any* quote against *any* source and is not legal-specific.
(2) **Legal-specific surface** — the eyecite-style parser, the
`CitationResolution` lifecycle, and the `CitationEvidence` /
`MatterScopedEvidenceSpan` model — lives in the **law-practice slice**
(`packages/law-practice/*`), sibling to `law-practice-office-action-spike` /
`ip-law-knowledge-graph`, keeping citation/IP vocab out of epistemic/shared.
(3) The **hosted lookup wrap** (if/when Q4's lane is built) lands in the existing
`@beep/courtlistener` driver skeleton (`packages/drivers/courtlistener`, MIT,
currently `VERSION`-only). All three **compose** `@beep/epistemic-domain`
`EvidenceSpan` + `@beep/provenance` `TextAnchor` via public surface, never by
forking.

**Rationale:** RESEARCH locks "**keep citation/IP-law vocabulary OUT of the
epistemic/shared slice**" (epistemic SPEC non-goal) and frames the packet as a
downstream consumer composing epistemic + langextract + provenance. The verbatim
gate is domain-agnostic, so it belongs with the cross-cutting capabilities under
`foundation/capability` (mirroring the gov-legal packet's reasoning that shared
capabilities live there). The legal vocab and lifecycle are legal-domain and
belong in law-practice next to the existing IP entities (`Claim`,
`OfficeAction`, `PatentAsset`, `PriorArtReference`, `Rejection` all exist in
`packages/law-practice/domain/src/entities/`). The `@beep/courtlistener` driver
already exists as a skeleton, with its citation-lookup slice routed to this
packet (the driver itself routes to `gov-legal-data-driver-codegen`).

**Status:** open (for /grill-with-docs)

## Q6: Lifecycle modeling — one citation status type, or two distinct vocabularies (persisted resolution vs transient lookup status)?

**Recommended:** **Two distinct types, never conflated.** Model a net-new
**persisted `CitationResolution` `LiteralKit`** mirroring CourtListener's 5-state
`UnmatchedCitation` (`NO_CITATION → FOUND → RESOLVED` + `FAILED_AMBIGUOUS` /
`FAILED`) for the resolution lifecycle, and a **separate transient
lookup-status codec** for the HTTP-valued per-citation status (200 found / 300
ambiguous / 400 reporter-unknown / 404 not-in-DB / 429 too-many). Mirror the
`@beep/epistemic-domain` `ClaimGateResult` tagged-union *pattern*
(`ClaimGateVerdict.toTaggedUnion("verdict")`) for the result type — e.g.
resolved / ambiguous / unresolved — and reuse the `ClaimLifecycle` /
`ClaimLifecycleTransition` *pattern* but author a net-new enum. Do **NOT** bend
the 4-state forward-only `ClaimLifecycle` to fit the FAILED/AMBIGUOUS exits.

**Rationale:** RESEARCH establishes that the persisted lifecycle and the
HTTP-valued lookup status are "**two distinct status vocabularies [that] must
not be conflated**," and that the citation RESOLUTION lifecycle is **orthogonal**
to the shared 4-state `ClaimLifecycle` (`["candidate","shape_valid",
"consistency_checked","admitted"]`, strictly-forward) because FAILED_AMBIGUOUS /
FAILED have no home in a forward pipeline. The locked decision is "**reuse, do
not fork the lifecycle**" — mirror the `ClaimGateResult` tagged-union and the
`ClaimLifecycleTransition` value-object patterns without mutating shared
vocabulary. eyecite itself has **no persisted FAILED/AMBIGUOUS state** (ambiguous
cites are simply *dropped* in `resolve_citations`), which is exactly the
bookkeeping CourtListener's side table adds — so the persisted 5-state is
genuinely **netNew #2** (NOT FOUND in `packages/`).

**Status:** open (for /grill-with-docs)

## Q7: Verbatim strictness — how strict is the "match" that lets a citation through the gate?

**Recommended:** **Exact equality after deterministic normalization — no
case-fold, no fuzzy — collapsing to VERIFIED-with-location | NOT-FOUND.**
Normalize only **whitespace and curly→straight quotes** (the doc-haus
`normalizeWithMap` *shape*) while keeping a per-character
**normalized-index → source-offset map** (extend the Apache-2.0
`lowerWithSourceOffsets`), so every verified hit reports **true source offsets**.
**Reject** `match_fuzzy` and `match_lesser` (case-folded) for court-attributed
quotes. Treat reject-near-match as a **deliberate beep guard policy, not an
Anthropic/API guarantee**.

**Rationale:** RESEARCH mandates the collapse to "**VERIFIED-with-location or
NOT-FOUND, never a near match**" and flags `match_fuzzy` (and arguably
case-folded `match_lesser`) as too lenient for a quote attributed to a court —
**CLERC** confirms "exact matches with grep are expected to achieve near-perfect
accuracy" while loose verbatim matching "surfaces a model's hallucinative
tendencies." The normalized-index → source-offset map is **required** because
Unicode `normalize` changes string length (ñ↔n+◌̃, ﬀ→ff), so naive index
arithmetic breaks. RESEARCH is explicit that reject-near-match is a **beep
stance** (doc-haus + CLERC grep-exact bar), not a universal API guarantee
(Anthropic guarantees `cited_text` is verbatim but does not forbid fuzzy), so it
must be encoded as packet policy. Extending the MIT/Apache-clean in-repo
`lowerWithSourceOffsets` is preferred over porting the **unknown-license**
doc-haus `normalizeWithMap`.

**Status:** open (for /grill-with-docs)
