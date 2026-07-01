# Law-Practice Office-Action Spike - Sources & Provenance

Provenance ledger for the gold-intake research note folded into this packet. It
derives from the gold-intake cluster **"IP-law domain depth (claim-chart, PTAB,
clause taxonomy, prior-art)"** and joins each mined nugget to its upstream repo
+ `file:line`, the upstream license, the external citations on disk, and the
`@beep/*` capabilities this packet composes.

- **Cluster:** IP-law domain depth (claim-chart, PTAB, clause taxonomy, prior-art)
- **Route:** `extend-goal` -> `goals/law-practice-office-action-spike` (wave P3;
  themeSpan `[ip-domain-models, provenance-evidence]`; 8 nuggets)
- **Gold-intake provenance:**
  - `explorations/_gold-intake/ROUTING.md` (219/219 routed)
  - `explorations/_gold-intake/routing.json` (cluster id above)
  - `explorations/_gold-intake/GOLD_SYNTHESIS.md` -> section
    **"Patent / IP-law domain models"** (`ip-domain-models` theme)
- **Folded note (the acted-on artifact):**
  [`research/gold-intake-ip-domain-depth.md`](./gold-intake-ip-domain-depth.md)
- **Source exploration:** `explorations/atlas-synthesis` (this packet graduated
  from it; see `explorations/atlas-synthesis/MAP.md`)
- **Packet codex review:** no `reviews/` dir; P3 adversarial review summarized in
  [`../README.md`](../README.md) (Latest Evidence) and
  [`../history/reflections/2026-06-18-claude.md`](../history/reflections/2026-06-18-claude.md).

> NON-INVASIVE: this packet is `completed-retained` (PR #262, 2026-06-18). This
> ledger and the note are reference-only follow-on growth; they do NOT amend
> SPEC.md / PLAN.md / GOAL.md or the spike's landed scope.

## 1. Mined source corpus (gold nuggets)

| Nugget | Title | Upstream (repo) | Source (file:line) | Theme | Priority | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| `patent-search-mcp-server#2` | Claim-chart model: claim -> labeled elements -> cited prior art | patent-search-mcp-server | `src/tools/claimChart.ts:47-64` | ip-domain-models | P2 | port |
| `Legal-AI_Project#1` | CUAD 41-category contract/IP-licensing clause taxonomy | Legal-AI_Project | `server/data/questions.txt:1-41` | ip-domain-models | P2 | adopt |
| `uspto_pfw_mcp#8` | Claim-evolution tracker (filing -> grant amendment lineage) | uspto_pfw_mcp | `src/patent_filewrapper_mcp/util/package_manager.py:361-425` | provenance-evidence | P2 | port |
| `patent-search-mcp-server#3` | PTAB validity-challenge record (IPR/PGR/CBM, petitioner/owner/outcome) | patent-search-mcp-server | `src/tools/challenges.ts:34-41` | ip-domain-models | P3 | study |
| `patent-search-mcp-server#4` | Risk-verdict signal aggregation (Low/Moderate/High + derived signals) | patent-search-mcp-server | `src/tools/riskProfile.ts:42-47` | ip-domain-models | P3 | study |
| `Juris.AI#7` | `LegalCase`/`Statute` interfaces with numeric `relevance` field | Juris.AI | `src/lib/legal-apis.ts:18-39` | ip-domain-models | P3 | reference |
| `us-legal-tools#8` | CourtListener case-law search response (+ `meta.score.bm25`) | us-legal-tools | `packages/courtlistener-sdk/src/mcp/tool-schemas.zod.ts:23-52` | ip-domain-models | P3 | reference |
| `LegalEase#6` | Keyword -> statute-section two-tier confidence lookup (0.9 / 0.5 LLM-fallback) | LegalEase | `backend/services/legal_mapping.py:26-43` | ip-domain-models | P3 | study |

### How these inform this packet

**Claim depth (P2, the highest-fit ports).**
`patent-search-mcp-server#2` is the lead port: split an independent `Claim`
into labeled elements, each carrying `citedReferences {patentNumber,
rejectionStatute, examinerReasoning}` and a `dependsOn` edge. The load-bearing
contract is element-level granularity, which is exactly where
`GroundedExtraction.span` / `Evidence(char-span)` want to anchor - take the
shape, re-express as `effect/Schema`, leave the TS interfaces and the hosted-API
plumbing. `uspto_pfw_mcp#8` pairs with it: sort dated CLM documents by official
date -> derive `original`/`final`/`intermediate_amendments`/`amendment_count` +
a prosecution-complexity bucket. Take the provenance-grounded temporal-chain
derivation; leave the Python and the raw USPTO payload coupling (gate behind a
real ODP `/documents` feed before modeling lineage).

**Prior-art enrichment (P3, reference shapes).**
`Juris.AI#7` and `us-legal-tools#8` are field-set references for widening the
current `PriorArtReference` stub: add citation metadata (caseName, `citation[]`,
`court_id`, `dateFiled`, `docketNumber`) and an explicit numeric ranking field
(`relevance` / `meta.score.bm25`) for GraphRAG ranking. Take the field set and
the score convention; leave the free-text `summary` and the Zod typing - this
pairs with `court-vocabulary-resolver`, not this packet's domain alone.

**New sub-domains (P3, study/seed only).**
`patent-search-mcp-server#3` (PTAB validity-challenge `{trialNumber, type,
petitioner, patentOwner, petitionFilingDate, status, outcome}`) and
`Legal-AI_Project#1` (CUAD 41-category clause taxonomy) are genuinely new
verticals (litigation/validity; contracts/licensing) with no home in
law-practice today. Take the controlled vocabulary - but route them to the
secondary targets (`packages/law-practice/domain`, `goals/ip-law-knowledge-graph`,
`packages/drivers/nlp-mcp` for the clause label set), NOT into the office-action
loop. CBM is a sunset program (model as historical, not an active filing type).

**Patterns, not data (P3 study).**
`patent-search-mcp-server#4` (composite risk-verdict `{riskLabel, rationale,
signals{...}}` + disclaimer) is the template for keeping a fallible AI rationale
**separable** from the sound signal bundle - express it through the epistemic
candidate-vs-authoritative wall this packet already composes, not a new
mechanism. `LegalEase#6` (two-tier 0.9-deterministic / 0.5-LLM-fallback lookup)
is the retrieval-vs-candidate pattern; take the confidence-tier shape, retarget
the Indian IPC/BNS dataset to WIPO-IPC/CPC, import no foreign statute data.

## 2. Upstream repositories & licenses

| Repo | Tier | License | Port discipline | What we take |
| --- | --- | --- | --- | --- |
| patent-search-mcp-server | T2 | MIT | Port with attribution (re-express as `effect/Schema`, do not vendor) | Claim-chart element model (#2), PTAB challenge record (#3), risk-verdict signal aggregation (#4) |
| uspto_pfw_mcp | T1 | MIT | Port with attribution | Claim-evolution / version-lineage derivation (#8) |
| us-legal-tools | T1 | MIT | Port with attribution | CourtListener case-law response field-set + BM25 score (#8) |
| Juris.AI | T2 | MIT | Port with attribution | `LegalCase`/`Statute` field-set + numeric `relevance` convention (#7) |
| LegalEase | T2 | MIT | Port with attribution (pattern only; data is foreign) | Two-tier confidence lookup pattern (#6) |
| Legal-AI_Project | T3 | ISC | Port with attribution (permissive) - but the CUAD taxonomy itself is CC BY 4.0, attribute The Atticus Project | CUAD 41-category clause taxonomy (#1) |

> **Cautions (echoed from the bundle):**
> - Mostly P2/P3 domain modeling - gated behind the office-action spike landing
>   first (it has: PR #262).
> - `patent-search-mcp-server` is MIT; **CUAD is a public research dataset
>   (CC BY 4.0) requiring attribution** - cite The Atticus Project if the
>   taxonomy/labels ship; the underlying 510 SEC EDGAR contracts carry no
>   warranty and only the clause-category vocabulary is the reusable asset.
> - Keep the AI rationale separable from the deterministic signals in the risk
>   verdict (the candidate-vs-authoritative wall).
> - All six upstreams here are permissive (MIT/ISC) - no AGPL/GPL/MPL copyleft
>   in this cluster, so port-with-attribution is allowed; still re-express
>   shapes as `effect/Schema`, do not copy source.

## 3. External research sources

These external citations actually appear in
[`research/gold-intake-ip-domain-depth.md`](./gold-intake-ip-domain-depth.md)
(its "External citations" block):

1. USPTO, "AIA proceedings" / "AIA trial types" - IPR, PGR, CBM, and derivation
   are the four AIA fast-track trials.
   https://www.uspto.gov/patents/ptab/trials/aia-proceedings ·
   https://www.uspto.gov/patents/ptab/trials/aia-trial-types
2. The Atticus Project, CUAD - 41 clause categories across 510 SEC EDGAR
   contracts; licensed **CC BY 4.0** (commercial + non-commercial, attribution).
   https://www.atticusprojectai.org/cuad/ ·
   https://huggingface.co/datasets/theatticusproject/cuad-qa
3. CBM review program **sunsetted 2020-09-16** (AIA transitional program).
   https://www.greyb.com/blog/pgr-ipr-cbm/

In-repo claim grounding (no external URL): the office-action spike's own scope
and deferral set are carried in this packet's `SPEC.md` (Non-Goals, Decision
Log) and `README.md` (Latest Evidence), referenced throughout the note.

## 4. In-repo capability references

The `@beep/*` bricks this cluster composes or extends (from the bundle
`secondaryTargets` + the note's "What already covers" inventory):

| Capability | Package path | Status |
| --- | --- | --- |
| `@beep/law-practice-domain` (OfficeAction/Claim/Rejection/PriorArtReference/Distinction) | `packages/law-practice/domain` | reuse (extend: `ClaimElement`, richer `PriorArtReference`, PTAB/clause vocab are NET-NEW additive entities) |
| `@beep/law-practice` use-cases (`IrToLaw`, `OfficeActionReview`) | `packages/law-practice/use-cases` | reuse (extend output with risk-verdict shape) |
| `@beep/epistemic-domain` (Evidence char-span, candidate/authoritative wall) | `packages/epistemic/domain` | reuse (risk-verdict + two-tier confidence compose this, not a new mechanism) |
| `@beep/uspto` driver | `packages/drivers/uspto` | extend (ODP feed for claim-evolution lineage + PTAB) - NET-NEW depth |
| `@beep/nlp-mcp` driver | `packages/drivers/nlp-mcp` | extend (CUAD clause-extraction label set) - NET-NEW |
| `court-vocabulary-resolver` / official-data-sync | (secondary target) | extend (court/jurisdiction vocab home for `PriorArtReference` enrichment) |
| `rag-retrieval-projection` | (secondary target) | reference (BM25 / relevance ranking) |

Related goal packets (secondary targets, not edited here):
`goals/epistemic-claim-lifecycle-gate` (dependency, public surface only),
`goals/ip-law-knowledge-graph` (PTAB/clause routing home),
`goals/law-practice-office-action-extraction-rung` (suggested follow-on landing
site), `goals/ontology-modeling-foundation`.

## 5. Cross-links & provenance

- **Cluster id:** `IP-law domain depth (claim-chart, PTAB, clause taxonomy,
  prior-art)` (`explorations/_gold-intake/routing.json`)
- **Exploration -> goal:** `explorations/atlas-synthesis`
  (`explorations/atlas-synthesis/MAP.md`) graduated this packet (2026-06-17).
- **Gold synthesis:** `explorations/_gold-intake/GOLD_SYNTHESIS.md` section
  "Patent / IP-law domain models" (synthesis lines ~633, ~1170, ~1261, ~1272,
  ~1294, ~1303 per the note).
- **This packet's own artifacts:**
  - Folded note: [`research/gold-intake-ip-domain-depth.md`](./gold-intake-ip-domain-depth.md)
  - Normative contract (read-only here): [`../SPEC.md`](../SPEC.md),
    [`../PLAN.md`](../PLAN.md), [`../GOAL.md`](../GOAL.md)
  - Closeout reflection / review evidence:
    [`../history/reflections/2026-06-18-claude.md`](../history/reflections/2026-06-18-claude.md)
  - Manifest (read-only): [`../ops/manifest.json`](../ops/manifest.json)
- **Sibling / referenced packets:** `goals/epistemic-claim-lifecycle-gate`
  (dependsOn), `goals/ip-law-knowledge-graph`, `goals/oppold-corpus-pipeline`
  (reference, per manifest `relatedPackets`).
- No `DECISIONS.md` in this packet; decision history lives in `SPEC.md`'s
  Decision Log.
