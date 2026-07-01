# Gold-intake research note: IP-law domain depth — claim-chart, PTAB, clause taxonomy, prior-art (2026-06-29)

> Provenance ledger (nugget → repo → license → citation → in-repo capability):
> [`research/SOURCES.md`](./SOURCES.md).

> Non-invasive Case-A extend. This is a research note for the goal owner to act
> on later. It does NOT amend this packet's SPEC.md, PLAN.md, GOAL.md, phases,
> or scope. The spike is `completed-retained`; everything below is deferred
> follow-on growth for when the law-practice slice deepens past the one-fixture
> office-action loop.

## Source

- Gold nuggets (cluster "IP-law domain depth (claim-chart, PTAB, clause
  taxonomy, prior-art)", route `extend-goal` → this packet, wave P3):
  - `patent-search-mcp-server#2` — claim-chart model (claim → labeled elements →
    cited prior art); repo MIT; recommend **port**, P2.
  - `patent-search-mcp-server#3` — PTAB validity-challenge record
    (IPR/PGR/CBM, petitioner/owner/outcome); MIT; recommend **study**, P3.
  - `patent-search-mcp-server#4` — risk-verdict signal aggregation
    (`{riskLabel, rationale, signals{...}}` + disclaimer); MIT; **study**, P3.
  - `Legal-AI_Project#1` — CUAD 41-category contract/IP-licensing clause
    taxonomy (41 labeled extraction prompts); ISC repo, dataset CC BY 4.0;
    recommend **adopt**, P2.
  - `uspto_pfw_mcp#8` — claim-evolution tracker (filing→grant amendment chain,
    amendment count, prosecution-complexity bucket); **port**, P2.
  - `Juris.AI#7` — `LegalCase`/`Statute` interfaces with numeric `relevance`
    field; **reference**, P3.
  - `us-legal-tools#8` — CourtListener case-law search response (caseName,
    citation[], court_id, dateFiled, `meta.score.bm25`); **reference**, P3.
  - `LegalEase#6` — keyword→statute-section two-tier lookup (0.9 deterministic /
    0.5 LLM-fallback over a local JSON taxonomy); **study**, P3.
- Synthesis: `explorations/_gold-intake/GOLD_SYNTHESIS.md`, section
  **"Patent / IP-law domain models"** (the `ip-domain-models` theme, 24 nuggets
  across 16 repos; the nuggets above are entries at synthesis lines ~1170,
  ~1294, ~1303, ~1261, ~633, ~1272). The synthesis explicitly frames the slice
  as an "office-action SPIKE" and routes most IP-domain nuggets as **partial /
  gap** against the existing `@beep/law-practice-domain` stubs.
- Routing: `explorations/_gold-intake/routing.json`, cluster
  `IP-law domain depth (claim-chart, PTAB, clause taxonomy, prior-art)`
  (`route: extend-goal`, `primaryTarget: goals/law-practice-office-action-spike`,
  `wave: P3`, themeSpan `[ip-domain-models, provenance-evidence]`).

## What goals/law-practice-office-action-spike already covers

This packet graduated the slice from domain-only to minimum-viable and landed
green (PR #262, 2026-06-18; all four phases complete, see `README.md` Latest
Evidence). The relevant existing surface this note builds on:

- **Domain entities** (`packages/law-practice/domain/src/entities/**`,
  verified on disk): `OfficeAction`, `Claim`
  (`claimNumber`/`independent`/`text` + `patentAssetFixtureKey`), `Rejection`
  (tagged union on `statute` §101/§102/§103/§112 with per-statute prior-art
  cardinality, in `Rejection.values.ts`), `PriorArtReference`
  (`documentNumber`/`title` + `officeActionFixtureKey` — a thin stub, no
  citation/court/date/score), `Distinction` (tagged union on `kind`,
  `lifecycleState` typed from the shared-kernel `ClaimLifecycle`, evidence via
  `@beep/provenance` `TextAnchor`), plus pre-existing `PatentAsset`, `Matter`,
  `LegalClient`, `LegalContact`.
- **Use-cases** (`packages/law-practice/use-cases`): typed `IrToLaw`
  (`ReadonlyArray<GroundedExtraction> => Effect<LawEntities>`) and
  `OfficeActionReview` `Context.Service` ports.
- **Server** (`packages/law-practice/server`): `LawPracticeServerLive`, the
  office-action review loop wired through `@beep/file-processing` + `@beep/tika`
  + `@beep/langextract`, with admission via the epistemic
  `ClaimGate`/`ClaimLifecycle`/`ClaimProjection` public surface.
- **SPEC's own deferral list** already names the natural homes for this note:
  the first slice is deliberately shallow (one §102 / one claim / one ref / one
  `missing_limitation` distinction), and SPEC Non-Goals + Decision Log defer
  multi-ref §103, §101/§112 breadth, the §132 response ladder, court/jurisdiction
  vocab, and the 7-source ontology grounding (`goals/ip-law-knowledge-graph`
  stays PENDING/referenced). The gold below slots into exactly those deferred
  axes — it is depth on an existing slice, not a rebuild.

## Net-new this contributes

Each item is a concrete capability/pattern from the gold, tied to nugget ids.
External shapes are cited; reimplement as `effect/Schema` with provenance spans,
never copy source.

- **Element-level claim decomposition (`ClaimElement` value object)** —
  `patent-search-mcp-server#2`. Split an independent `Claim` into labeled
  elements, each carrying `citedReferences {patentNumber, rejectionStatute,
  examinerReasoning}` and a `dependsOn` claim-dependency edge. beep's `Claim`
  has no element granularity today; element-level is the natural target for
  `GroundedExtraction.span` / `Evidence(char-span)` — each element anchors its
  own source span rather than the whole claim. This is the highest-fit P2 port.
- **PTAB validity-challenge entity + controlled vocab** —
  `patent-search-mcp-server#3`. A compact trial record `{trialNumber, type,
  petitioner, patentOwner, petitionFilingDate, status, outcome}`. The
  challenge-type set is the AIA proceeding vocabulary: **IPR** (inter partes
  review), **PGR** (post-grant review), **CBM** (covered business method), and
  **derivation** — the four fast-track trials the America Invents Act created at
  the USPTO. [1] No IP-litigation/validity entity exists in law-practice today.
- **CUAD 41-category contract/IP-licensing clause taxonomy** —
  `Legal-AI_Project#1`. An expert-curated controlled vocabulary (Document Name,
  Parties, Governing Law, Non-Compete, **IP Ownership Assignment**, **Joint IP
  Ownership**, **License Grant**, **Non-Transferable License**,
  **Irrevocable/Perpetual License**, **Source Code Escrow**, Cap on Liability,
  …), each label with a plain-language definition, drawn from 510 SEC EDGAR
  contracts. [2] law-practice has no contract/clause/license model anywhere; the
  IP-licensing subset (License Grant / IP Ownership) maps cleanly to
  IPRonto/Copyright-Ontology concepts and seeds a span-grounded clause-extraction
  label set.
- **Claim-evolution / version lineage** — `uspto_pfw_mcp#8`. Sort dated CLM
  documents by official date → derive `original` vs `final` claims,
  `intermediate_amendments`, `amendment_count`, and a prosecution-complexity
  bucket (minimal/standard/moderate/high). A provenance-grounded temporal chain
  of dated claim versions — the exact derivation shape beep favors — feeding
  `PatentAsset`/`Claim` lineage. Today `Claim` is a flat fixtureKey stub with no
  lineage.
- **Keyword→statute-section two-tier confidence lookup** — `LegalEase#6`. A
  deterministic-high-confidence (0.9, local JSON taxonomy keyword match) →
  fallible-LLM-low-confidence (0.5) fallback, mirroring beep's
  retrieval-vs-candidate wall. A clean template for a classification lookup
  table (retarget the Indian IPC/BNS dataset to WIPO-IPC/CPC). Pattern, not data.
- **Composite risk-verdict, AI rationale separable from sound signals** —
  `patent-search-mcp-server#4`. `verdict {riskLabel, rationale, signals{inForce,
  expirationDate, challengeCount, litigationCount, currentAssignee}}` +
  disclaimer. The fallible AI rationale stays explicitly separable from the
  sound signal bundle — a direct fit for the epistemic candidate-vs-authoritative
  separation. The shape for a future FTO/risk assessment model (no such model
  exists today).
- **Richer `PriorArtReference` field-set + relevance scoring** — `Juris.AI#7`,
  `us-legal-tools#8`. Add citation metadata (caseName, `citation[]`, `court_id`,
  `dateFiled`, `docketNumber`) and an explicit numeric ranking field
  (`relevance` / `meta.score.bm25`) to the current `documentNumber`/`title` stub,
  for GraphRAG ranking and citing-reference provenance. CourtListener's Zod
  shape is the field-set reference; re-express as `effect/Schema` with spans.

## Recommended integration (non-invasive)

For the goal owner — no SPEC rewrite implied; these are candidate folds when the
slice grows past the spike:

- **When the slice deepens claims (P2 domain extend):** add a `ClaimElement`
  value object under `entities/Claim/` linking `Claim` → `PriorArtReference`
  with per-element `Evidence(char-span)` provenance (`patent-search-mcp-server#2`).
  This is the single best-fit, lowest-risk port and directly extends the
  packet's existing TextAnchor-grounded `Distinction` granularity.
- **When `PriorArtReference` graduates past a stub:** widen its field-set with
  citation/court/date + a numeric relevance score (`Juris.AI#7`,
  `us-legal-tools#8`). Pairs with `court-vocabulary-resolver` /
  `official-data-sync-foundation` (the court/jurisdiction vocab home named in
  the tree snapshot), not this packet's domain alone.
- **When `OfficeActionReview` output widens:** the risk-verdict shape
  (`patent-search-mcp-server#4`) is the template for keeping a fallible candidate
  verdict separable from its sound signal bundle — reuse the epistemic
  candidate/claim wall this packet already composes, rather than a new mechanism.
- **PTAB validity-challenge** (`patent-search-mcp-server#3`) and **CUAD clause
  taxonomy** (`Legal-AI_Project#1`) are genuinely new sub-domains
  (litigation/validity; contracts/licensing). They are better routed to the
  secondary targets the routing record lists — `packages/law-practice/domain`,
  `goals/ip-law-knowledge-graph`, `packages/drivers/uspto`,
  `packages/drivers/nlp-mcp` (for the clause-extraction label set) — than folded
  into the office-action loop. Treat them as "study/seed" until a driver-tier
  PTAB feed (USPTO ODP) and a contract vertical actually exist.
- **Claim-evolution lineage** (`uspto_pfw_mcp#8`) and the statute-lookup pattern
  (`LegalEase#6`) are driver/use-case patterns; pair the lineage port with
  `uspto-patent-driver-depth` (ODP `/documents` + transactions) so the dated CLM
  source documents are real before modeling lineage in the domain.

Suggested non-invasive surface to land these later: a follow-on packet (e.g.
the routing-named `goals/law-practice-office-action-extraction-rung` or a new
"law-practice-ip-domain-depth" packet), or staged additive entities/values under
`packages/law-practice/domain/src/entities/**`, each gated behind its own
schema→contract→impl→verify sequence per this packet's BINDING sequencing rule.

## Cautions

- **Licensing — reimplement, do not copy.**
  - `patent-search-mcp-server` is **MIT** (per routing record); the claim-chart,
    PTAB, and risk-verdict shapes can be ported, but re-express as
    `effect/Schema`, do not vendor source.
  - **CUAD is CC BY 4.0** — free for commercial and non-commercial use **with
    attribution**; cite The Atticus Project if the taxonomy/labels are shipped.
    [2] The underlying 510 contracts come from SEC EDGAR and carry no warranty;
    only the *clause-category vocabulary* is the reusable asset here.
  - `LegalEase#6` is a **pattern** (two-tier confidence lookup), not data — its
    dataset is Indian IPC/BNS and must be retargeted to WIPO-IPC/CPC; do not
    import the foreign statute taxonomy.
- **CBM is sunset.** The covered-business-method review program **sunsetted
  2020-09-16** — model CBM as a historical/closed challenge type in any PTAB
  controlled vocab, not an active filing option; IPR and PGR are the live AIA
  trials. [1][3] (Also consistent with the gold-intake note that USPTO Developer
  Hub PTAB API v2 was decommissioned 2026-01-06; PTAB now comes from ODP.)
- **Scope / locked-decision conflicts (do not breach this packet):** the SPEC
  Non-Goals explicitly defer multi-ref §103, §101/§112 breadth, the §132
  response ladder, court/jurisdiction vocab, and the 7-source ontology grounding
  (`goals/ip-law-knowledge-graph` stays PENDING). PTAB/clause/risk/court items
  here therefore must NOT be smuggled into the office-action spike's one-fixture
  loop; they are P2/P3 growth gated behind the spike having landed (it has).
- **Slice ownership invariant holds.** Any new domain entity stays
  `foundation` + shared-kernel only (zero `@beep/epistemic-*` at the domain
  tier); the epistemic candidate/gate mechanism is composed only at the
  use-cases/server tier (the Exception Ledger). The risk-verdict "AI rationale
  separable from sound signals" pattern is to be expressed through the existing
  candidate-vs-authoritative wall, not a re-implemented mechanism.
- **Privilege wall.** Any fixtures added for PTAB/contract/claim-evolution work
  remain synthetic/public only — never a real client matter in this public repo.

---

### External citations

1. USPTO, "What are AIA proceedings?" / "AIA trial types" — IPR, PGR, CBM, and
   derivation are the four AIA fast-track trials. https://www.uspto.gov/patents/ptab/trials/aia-proceedings
   · https://www.uspto.gov/patents/ptab/trials/aia-trial-types
2. The Atticus Project, CUAD — 41 clause categories across 510 SEC EDGAR
   contracts; licensed **CC BY 4.0** (commercial + non-commercial, attribution).
   https://www.atticusprojectai.org/cuad/ ·
   https://huggingface.co/datasets/theatticusproject/cuad-qa
3. CBM review program **sunsetted 2020-09-16** (AIA transitional program).
   https://www.greyb.com/blog/pgr-ipr-cbm/
