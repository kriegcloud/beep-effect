# courtlistener  `[T1]`

- **Purpose:** CourtListener: Free Law Project's production Django platform for ingesting, parsing, searching, and serving American case law, dockets, judges, and citations.
- **Stack:** Python 3.13, Django 6, Django REST Framework, Celery, Elasticsearch, PostgreSQL; eyecite + reporters_db + courts_db for citation parsing; Instructor + OpenAI/Anthropic/Mistral for LLM tasks; datasketch (MinHash LSH); React/Tailwind frontend.
- **Size / shape:** Large Django monolith, ~819 Python files across ~30 apps (search/citations/people_db/api/recap/scrapers/corpus_importer); search/models.py alone is ~4300 LOC.
- **License:** AGPL-3.0-only
- **Maturity:** Active/production. Last commit 2026-06-27; classifier "Development Status :: 5 - Production/Stable".

**Notes:** AGPL-3.0 is copyleft and network-triggering — patterns/architecture are safe to learn from, but verbatim code reuse in beep-effect would impose AGPL obligations; reimplement rather than copy. beep already has a CourtListener driver skeleton, so the API-client/auth/pagination nuggets partly duplicate that, but the citation-parsing, span-annotation, and candidate->resolved lifecycle patterns are the real gold and transcend the driver. Citation parsing itself lives in the external eyecite/reporters_db/courts_db libraries (also Free Law Project) — worth mining those directly for beep's @beep/langextract and legal-nlp work.

## Web enrichment
- **Status:** CourtListener is actively maintained; current REST API is v4.4 (eyecite 2.7.x, reporters_db, Hyperscan tokenizer). Key recent change: as of May 2026, full API data access is bundled with a Free Law Project membership, and default rate limits for unauthenticated users were LOWERED to protect infrastructure (callers making 1,000+ historical requests are grandfathered). This directly affects the pagination/throttle nugget. v3 and earlier APIs are not yet deprecated but FLP urges migration to v4. The SCOTUS network Visualization feature is largely deprecated (Dec 2025): API CRUD endpoints still exist, but on-site rendering at courtlistener.com is gone. Cross-cutting USPTO note (for sibling patent repos, not courtlistener itself): PatentsView is migrating to the USPTO Open Data Portal (data.uspto.gov) starting March 20, 2026, with expected outages of the legacy PatentSearch API (search.patentsview.org); old API keys are NOT compatible with ODP and must be reissued; legacy Developer Hub was decommissioned June 5, 2026; ODP requires a USPTO.gov sign-in as of June 18, 2026; PTAB API v2 decommissioned Jan 6, 2026.</statusNotes>
<deprecations>["CourtListener: unauthenticated API rate limits lowered May 2026 — design any CourtListener driver to authenticate (membership token) and not rely on prior generous anonymous quotas; only pre-existing 1,000+ request users are grandfathered.","CourtListener: SCOTUS Visualization network feature largely deprecated (Dec 2025); on-site display removed though API endpoints persist.","CourtListener v3/earlier REST API: not yet removed but officially discouraged; build against v4.4.","USPTO PatentsView PatentSearch API (search.patentsview.org) migrating to ODP starting 2026-03-20 with expected interruptions; legacy API keys invalid on ODP — affects any PatentsView-based nugget in sibling repos, not courtlistener.","USPTO legacy Developer Hub decommissioned 2026-06-05; PTAB API v2 decommissioned 2026-01-06; ODP login (USPTO.gov account) required from 2026-06-18."]</deprecations>
<upstreamDocs>[{"url":"https://www.courtlistener.com/help/api/rest/","note":"Canonical CourtListener REST API v4.4 reference (current version)."},{"url":"https://www.courtlistener.com/help/api/rest/changes/","note":"REST API change log — authoritative source for rate-limit and deprecation changes."},{"url":"https://free.law/2026/05/07/api-included-in-memberships/","note":"May 2026 announcement: full API access bundled with membership + lowered anon rate limits."},{"url":"https://github.com/freelawproject/eyecite","note":"eyecite source — two-step extract+resolve, Hyperscan tokenizer, reporters_db (~55M citations)."},{"url":"https://free.law/2025/05/01/citator/","note":"FLP 'Building a Citator with AI' progress report — direction for UnmatchedCitation resolution lifecycle."},{"url":"https://data.uspto.gov/support/transition-guide/patentsview","note":"USPTO ODP PatentsView transition guide (cross-repo patent context)."}]</upstreamDocs>
<corrections>[{"nuggetTitle":"Versioned cursor/page pagination + citation-aware rate throttle","correction":"Update to reflect May 2026 reality: CourtListener LOWERED default unauthenticated rate limits to protect infra; only callers with 1,000+ prior requests are grandfathered, and full API access is now gated behind FLP membership. A driver must authenticate by default and treat anonymous access as severely throttled — not assume the older generous limits. Target API is v4.4 (cursor pagination)."},{"nuggetTitle":"Citation lookup API: eyecite parse + exact character spans","correction":"eyecite is a two-step extract-then-resolve pipeline (handles supra/id/short-form aggregation) backed by reporters_db (~55M citations) and a Hyperscan regex tokenizer; current version 2.7.x. Span grounding comes from eyecite's token spans, not custom offset math — cite the upstream tokenizer as the provenance source."},{"nuggetTitle":"UnmatchedCitation status lifecycle (candidate -> resolved/failed gate)","correction":"Align with FLP's public citator direction (free.law 2025-05-01 'Building a Citator with AI'): resolution is a distinct second stage after extraction, and unresolved citations are an expected steady-state class, not merely transient failures — model the gate accordingly."},{"nuggetTitle":"Multi-provider structured-output LLM wrapper (Instructor + Pydantic)","correction":"No external deprecation, but note Instructor + Pydantic strict mode (additionalProperties=false) maps cleanly to Anthropic tool-use/structured outputs and OpenAI structured outputs; keep provider abstraction since CourtListener already targets OpenAI/Anthropic/Mistral. No API breakage found."}]</corrections>
</invoke>


## Gold nuggets (11)

### 1. Citation lookup API: eyecite parse + exact character spans
`provenance-evidence` · relevance: **direct** · verified

CitationLookupViewSet.create runs eyecite over free text and returns each citation's matched_text, corrected (normalized) form, and start_index/end_index character offsets — exactly beep's PROSE IN model: NLP proposes a candidate citation carrying provenance as exact spans into the source. Directly reusable shape for a @beep/langextract span-grounded citation extractor and the CourtListener driver's lookup endpoint.

- **Source:** `cl/citations/api_views.py:56-63`
- **beep-target:** @beep/langextract span-grounded extraction; epistemic.GroundedExtraction.span; CourtListener driver citation lookup

```
for idx, citation in enumerate(self.citation_list):
    start_index, end_index = citation.span()
    citation_data = {
        "citation": citation.matched_text(),
        "normalized_citations": [citation.corrected_citation()],
        "start_index": start_index,
        "end_index": end_index,
    }
```

### 2. UnmatchedCitation status lifecycle (candidate -> resolved/failed gate)
`provenance-evidence` · relevance: **direct** · verified

BaseUnmatchedCitation is a persisted state machine for citations that NLP found but couldn't authoritatively resolve: NO_CITATION -> FOUND -> RESOLVED, plus FAILED_AMBIGUOUS / FAILED. A real-world analog of beep's ClaimLifecycle / candidate->approved gate: fallible extractions are tracked with explicit resolution status and only 'resolved' ones become authoritative links. Also keeps eyecite-derived context (court_id, year, raw citation_string) for unresolved parses.

- **Source:** `cl/citations/models.py:11-55`
- **beep-target:** epistemic.ClaimLifecycle / ClaimGate; CandidateClaim status enum

```
class BaseUnmatchedCitation(BaseCitation):
    NO_CITATION = 1
    FOUND = 2
    RESOLVED = 3
    FAILED_AMBIGUOUS = 4
    FAILED = 5
    status: models.SmallIntegerField = models.SmallIntegerField(
        help_text="Status of resolution of the initially unmatched citation",
        choices=STATUS,
    )
```

### 3. Span-grounded HTML annotation with plain<->markup offset mapping
`provenance-evidence` · relevance: **direct** · verified

create_cited_html / generate_annotations insert link markup back into source text using citation spans (span_with_pincite, full_span for Id/Supra to avoid unbalanced HTML) and an offset_updater (document.plain_to_markup) that maps offsets from plain text into the original markup, with unbalanced_tags='skip'. This is the round-trip beep needs: keep provenance spans against plain text but render annotations into the rich (Lexical) source without corrupting it.

- **Source:** `cl/citations/annotate_citations.py:77-128`
- **beep-target:** @beep/provenance span mapping; Lexical editor annotation overlay

```
if isinstance(citation, (IdCitation | SupraCitation)):
    annotation_span = citation.full_span()
else:
    annotation_span = citation.span_with_pincite()
...
new_html = annotate_citations(
    plain_text=document.plain_text,
    annotations=generate_annotations(citation_resolutions),
    source_text=document.markup_text,
    unbalanced_tags="skip",
    offset_updater=document.plain_to_markup,
)
```

### 4. Few-shot LLM prompt for docket-number normalization
`legal-nlp` · relevance: **adjacent** · adjusted

F_PROMPT (= F_GENERAL_GUIDELINES + OUTPUT_FORMAT + ~55 real F_EXAMPLES) turns messy legal docket strings into normalized arrays keyed by unique_id; a sibling F_TIE_BREAKER prompt adjudicates between two prior attempts. Excellent template pattern for beep's legal-NLP MCP tools: explicit guidelines, exhaustive input->output examples, and a JSON output contract. The example corpus alone is reusable as eval/test fixtures for any docket/serial-number normalizer (USPTO application numbers behave similarly).

- **Source:** `cl/search/llm_prompts.py:77-92`
- **beep-target:** @beep/nlp-mcp prompt templates; docket/serial-number normalization skill

```
F_PROMPT = f"""
You are an expert assistant that cleans and standardizes legal case docket numbers.
...
## General Cleaning Guidelines:
{F_GENERAL_GUIDELINES}
## Output Format:
{OUTPUT_FORMAT}
## Examples:
{F_EXAMPLES}
"""
```

### 5. Multi-provider structured-output LLM wrapper (Instructor + Pydantic)
`mcp-design` · relevance: **adjacent** · verified

call_llm uses Instructor's from_provider so a single 'provider/model' string (openai/anthropic/mistral) selects the backend, with a Pydantic response_model enforcing typed output, temperature=0 default, and content-part normalization (to_content_part) for multi-part prompts. Mirrors beep's multi-provider (Anthropic/OpenAI/xAI) driver goal and schema-first extraction; the response_model pattern maps cleanly to effect/Schema-validated structured outputs.

- **Source:** `cl/lib/llm.py:8-58`
- **beep-target:** multi-provider LLM driver abstraction (Anthropic/OpenAI/xAI); schema-validated structured output

```
def call_llm(
    system_prompt: str,
    user_prompt: str | list[str] | list[dict],
    model: str = "openai/gpt-4o-mini",
    response_model: type[BaseModel] | None = None,
    temperature: float = 0.0,
...
    client = instructor.from_provider(model, api_key=api_key)
```

### 6. Pydantic structured-extraction models with strict additionalProperties=false
`legal-nlp` · relevance: **adjacent** · adjusted

DocketItem/CleanDocketNumber show schema-first structured extraction: constrained string lengths (constr max_length), descriptions used as LLM field guidance, and extra='forbid' (== JSON Schema additionalProperties:false) to reject hallucinated keys. This is the Pydantic analog of beep's effect/Schema candidate-claim contracts; the 'forbid extra' discipline is exactly what a CandidateClaim schema needs to keep an LLM from inventing fields.

- **Source:** `cl/search/llm_models.py:4-22`
- **beep-target:** epistemic.CandidateClaim effect/Schema; structured-output guardrails

```
class DocketItem(BaseModel):
    unique_id: constr(max_length=20) = Field(..., description="Unique identifier for the case.")
    cleaned_nums: list[constr(max_length=200)] = Field(..., description="...")
    class Config:
        extra = "forbid"  # equivalent to additionalProperties=false
```

### 7. Court jurisdiction taxonomy (federal/state/tribal/territory/military)
`kg-ontology-reasoning` · relevance: **direct** · verified

Court enumerates a jurisdiction taxonomy with short codes (F, FD, FB, FBP, S, SA, TRS, TS, MA...) plus grouping lists (FEDERAL_JURISDICTIONS, STATE_JURISDICTIONS, BANKRUPTCY_JURISDICTIONS, TRIBAL_JURISDICTIONS, etc.). Directly reusable as a controlled vocabulary / SKOS-style taxonomy for beep's court/jurisdiction dimension on Matter, OfficeAction, and case-law evidence, and as alignment targets for the FOLIO/JudO ontologies.

- **Source:** `cl/search/models.py:1872-1937`
- **beep-target:** law-practice jurisdiction taxonomy; FOLIO/JudO TBox alignment; CourtListener driver schema

```
FEDERAL_APPELLATE = "F"
FEDERAL_DISTRICT = "FD"
FEDERAL_BANKRUPTCY = "FB"
STATE_SUPREME = "S"
TRIBAL_SUPREME = "TRS"
MILITARY_APPELLATE = "MA"
JURISDICTIONS = (
    (FEDERAL_APPELLATE, "Federal Appellate"),
    ...)
```

### 8. Citation reporter-type taxonomy + reporter data model
`ip-domain-models` · relevance: **direct** · adjusted

BaseCitation enumerates citation reporter types (FEDERAL, STATE, STATE_REGIONAL, SPECIALTY, SCOTUS_EARLY, LEXIS, WEST, NEUTRAL, JOURNAL) with volume/reporter/page fields and a SmallIntegerField type choice. Reusable as beep's citation/PriorArtReference data model; the controlled type enum is a candidate for a SHACL/logic-rule classification rather than NLP. NOTE: the 'sort_cites / Bluebook ordering' part of the original claim is not in this BaseCitation block; only the reporter-type taxonomy and reporter fields were confirmed here.

- **Source:** `cl/search/models.py:2883-2941`
- **beep-target:** PriorArtReference / citation domain model; reporter-type enum as logic rule

```
FEDERAL = 1
STATE = 2
STATE_REGIONAL = 3
SPECIALTY = 4
SCOTUS_EARLY = 5
LEXIS = 6
WEST = 7
NEUTRAL = 8
JOURNAL = 9
CITATION_TYPES = (...)
```

### 9. Additive bitmask provenance for multi-source records (DocketSources)
`provenance-evidence` · relevance: **serendipitous** · verified

DocketSources tracks which upstream sources contributed to a record using an additive bitmask (RECAP=1, SCRAPER=2, COLUMBIA=4, IDB=8, HARVARD=16, DIRECT_INPUT=32, ANON_2020=64, SCANNING_PROJECT=128) with every combination 0-255 pre-enumerated. A compact, queryable provenance-of-origin scheme: any record's source mix is decodable from one integer. Serendipitous pattern for beep's multi-source evidence — beep's typed Evidence/PROV-O graph is richer, but this bitmask is a neat fast-filter index. Code comment itself notes it 'should eventually re-do it as a bitfield'.

- **Source:** `cl/search/docket_sources.py:10-47`
- **beep-target:** Evidence source-mix index; PROV-O wasDerivedFrom fast-filter

```
# this is a bitmask. We should eventually re-do it as a
# bitfield using, e.g. https://github.com/disqus/django-bitfield
DEFAULT = 0
RECAP = 1
SCRAPER = 2
RECAP_AND_SCRAPER = 3
COLUMBIA = 4
...
IDB = 8
...
HARVARD = 16
```

### 10. MinHash/LSH clustering of near-duplicate holding summaries (parentheticals)
`legal-nlp` · relevance: **adjacent** · verified

group_parentheticals uses datasketch MinHash + MinHashLSH to approximate Jaccard similarity and cluster textually-similar case 'parentheticals' (one-line holding summaries), with a deepcopy trick to clone a pre-seeded empty LSH/MinHash (num_perm=64, threshold 0.5) to avoid re-paying the expensive RNG seeding. Reusable for beep: dedup/cluster candidate holdings or prior-art assertions before the human gate; the goal (collapse repetitive summaries, rank most-described ideas higher) maps to evidence-cluster ranking.

- **Source:** `cl/citations/group_parentheticals.py:39-59`
- **beep-target:** candidate holding/prior-art dedup before human gate; @beep/nlp-mcp similarity tool

```
from datasketch import MinHash, MinHashLSH
from Stemmer import Stemmer
from cl.lib.stop_words import STOP_WORDS
GERUND_WORD = re.compile(r"(?:\S+ing)", re.IGNORECASE)
SIMILARITY_THRESHOLD = 0.5
_EMPTY_SIMILARITY_INDEX = MinHashLSH(threshold=SIMILARITY_THRESHOLD, num_perm=64)
```

### 11. Citation-aware rate throttle (eyecite parse reused downstream)
`data-ingestion` · relevance: **adjacent** · adjusted

CitationCountRateThrottle pre-parses citations with eyecite's HYPERSCAN_TOKENIZER inside get_citation_count_from_request, stores the parsed list on view.citation_list so the cost is charged per-citation and the parse is reused by the API view (avoiding double parsing), with DB-backed per-user overrides. Useful for beep's CourtListener/USPTO drivers: metering expensive parse work once and charging by output volume. NOTE: this throttle lives in cl/api/utils.py; the related VersionBasedPagination (V4 CursorPagination vs PageNumberPagination switch) cited in the original nugget actually lives in cl/api/pagination.py, not utils.py.

- **Source:** `cl/api/utils.py:1078-1136`
- **beep-target:** CourtListener/USPTO driver cost-metering; pagination in cl/api/pagination.py

```
class CitationCountRateThrottle(ExceptionalUserRateThrottle):
    def get_citation_count_from_request(self, request, view) -> int:
        ...
        citation_objs = filter_out_non_case_law_and_non_valid_citations(
            eyecite.get_citations(text, tokenizer=HYPERSCAN_TOKENIZER)
        )
        view.citation_list = citation_objs
        return len(citation_objs)
```
