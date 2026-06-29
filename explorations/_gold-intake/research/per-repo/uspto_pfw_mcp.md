# uspto_pfw_mcp  `[T1]`

- **Purpose:** A Python MCP server exposing the USPTO Patent File Wrapper (PFW) API as 12 progressive-disclosure tools for patent prosecution-history search, document retrieval, OCR, and litigation-grade prior-art/invalidity analysis prompts.
- **Stack:** Python 3.10+; MCP (FastMCP), httpx[http2], FastAPI/uvicorn/starlette (local download proxy), PyYAML, PyPDF2, cryptography (Fernet/DPAPI), Mistral OCR API; uv/hatchling build.
- **Size / shape:** ~23.6k LOC Python (~20.3k excluding tests); MCP server + local FastAPI proxy. Largest: main.py (2952), enhanced_client.py (2433), invalidity prompt (1863), proxy/server.py (1603), helpers.py (836).
- **License:** MIT
- **Maturity:** Active; last commit 2026-03-02.

**Notes:** Python MCP server, so no Effect/TS to lift directly, but the architecture maps well to beep: progressive field tiers + server instructions are a strong template for beep's MCP context-reduction requirement, and the USPTO document-code taxonomy / claim-evolution / identifier-normalization are reusable domain assets for the law-practice and PatentAsset slices. beep already has a USPTO skeleton driver, so the raw PFW endpoint wrappers (search/documents/XML/download) and the PTAB/FPD/Citations prompt orchestration partially duplicate that scope; the high-value, non-duplicative gold is the identifier disambiguation heuristics, Lucene escaping/field-mapping, doc-code tiers, claim-evolution derivation, and the resilience/secure-key patterns.

## Web enrichment
- **Status:** uspto_pfw_mcp targets the live USPTO Open Data Portal (ODP, https://data.uspto.gov) Patent File Wrapper APIs (search, application-data, documents, assignments, associated-documents). As of mid-2026 the core PFW endpoints are CURRENT and actively expanded (Smart Search added for PFW; Office Action / Enriched Citation / PTAB / PEDS APIs migrated onto ODP). However, the surrounding auth and access model is in active flux and the repo's assumptions about plain API-key access are at risk: (1) the legacy Developer Hub (developer.uspto.gov) was DECOMMISSIONED June 5, 2026 — any base URLs or key-issuance flows pointing there are dead; (2) starting June 18, 2026 ODP requires a signed-in USPTO.gov account to access the portal, and effective Aug 18, 2026 ODP requires four additional registration fields — key provisioning is no longer anonymous; (3) PatentsView (patentsview.org / search.patentsview.org/api) began migrating into ODP March 20, 2026, old PatentSearch keys are NOT compatible with ODP keys, and interruptions were expected — so any nugget treating PatentsView as a separate live source is stale. The Mistral OCR dependency is current and healthy (newer OCR 3/4 generations shipped 2025-2026; pin to a dated model rather than a moving 'latest' alias). The PFW search 'q' parameter is NOT classic Lucene — USPTO documents it as an OpenSearch simple_query_string DSL ('Simplified Query Syntax'), which has narrower operator semantics than full Lucene; the escaping/field-mapping nuggets should be validated against the official ODP-API-Query-Spec rather than generic Lucene rules.</statusNotes>
<deprecations">["Legacy USPTO Developer Hub (developer.uspto.gov) decommissioned June 5, 2026 — do not depend on its base URLs, API catalog, or key issuance; all PFW/OA/PTAB/PEDS APIs now live under data.uspto.gov.","ODP access now gated: signed-in USPTO.gov account required as of June 18, 2026; four extra registration fields required as of Aug 18, 2026. Anonymous/static API-key resolution may break — auth nugget should account for account-bound ODP keys.","PatentsView (patentsview.org, search.patentsview.org/api) is migrating into ODP (began March 20, 2026); old PatentSearch API keys are incompatible with ODP keys and service interruptions were expected. Treat PatentsView as folding into ODP, not a stable parallel source.","ODP data coverage is 2001-present only; pre-Jan-2001 prosecution/file-wrapper data is NOT in the PFW APIs (use Patent Center / Bulk Data Directory). Invalidity/prior-art nuggets must not assume full historical coverage.","PFW search 'q' is OpenSearch simple_query_string DSL ('Simplified Query Syntax'), not full Apache Lucene — reserved-char escaping and operator support differ; validate the escaping-policy and field-name-mapping nuggets against the official query spec.","Avoid pinning Mistral OCR to a floating model alias; OCR 3/4 generations shipped 2025-2026 with changed output schema (bounding boxes, confidence, block types) — pin a dated model id to keep the OCR-parsing nugget stable."]
- **Upstream docs:**
  - https://data.uspto.gov/apis/patent-file-wrapper/search — Canonical PFW Search API reference (request/response, q parameter, pagination) on the live ODP.
  - https://data.uspto.gov/documents/documents/ODP-API-Query-Spec.pdf — Official 'Simplified Query Syntax' spec: field dictionary, q-parameter operators, reserved keywords — authoritative for the escaping/field-mapping nuggets.
  - https://data.uspto.gov/apis/api-syntax-examples — Worked ODP API query examples (phrases, ranges, field-scoped terms).
  - https://data.uspto.gov/support/transition-guide/patentsview — PatentsView -> ODP transition guide; confirms key incompatibility and migration timeline.
  - https://data.uspto.gov/apis/getting-started — ODP getting-started: API key acquisition and the new USPTO.gov account/auth requirements.
  - https://data.uspto.gov/apis/patent-file-wrapper/documents — PFW Documents API (document-code metadata + retrieval) backing the doc-code taxonomy and download-proxy nuggets.
  - https://mistral.ai/solutions/document-ai/ — Mistral Document AI / OCR current product + model lineage; basis for pinning a dated OCR model id.
- **Corrections:**
  - *Lucene query-term escaping with documented safe/unsafe character policy*: USPTO ODP PFW search is not classic Lucene — the 'q' parameter uses an OpenSearch simple_query_string DSL that USPTO calls 'Simplified Query Syntax'. Its operator set and reserved/special characters differ from Apache Lucene (e.g., simple_query_string silently tolerates some syntax errors and supports +|-*~() with different semantics). Re-derive the safe/unsafe character policy from ODP-API-Query-Spec.pdf rather than a generic Lucene table.
  - *User-friendly to API field-name mapping for Lucene queries*: Anchor the field-name map to the official ODP field dictionary in ODP-API-Query-Spec.pdf and the patent-data-schema.json (data.uspto.gov/documents/documents/patent-data-schema.json), which define the exact PFW attribute names; legacy Patents.../PEDS field names are being remapped during the ODP migration and should not be hardcoded as canonical.
  - *Multi-source secure API-key resolution (secure storage -> env, with placeholder rejection)*: Update for the 2026 ODP auth model: keys are now bound to a signed-in USPTO.gov account (sign-in required since June 18, 2026; four extra fields since Aug 18, 2026) and legacy Developer Hub keys/PatentSearch keys are NOT valid for ODP. Resolution logic should target ODP-issued keys only and surface a clear error when a legacy key is supplied.
  - *Claim evolution tracker (filing -> grant amendment history)*: Note coverage boundary: ODP PFW prosecution/document data spans 2001-present only. Pre-2001 applications have no file-wrapper history via these APIs, so claim-evolution/invalidity outputs must flag missing-history rather than imply completeness.
  - *Multi-step invalidity-analysis prompt template (multi-MCP orchestration)*: Prior-art breadth caveat: PFW alone gives prosecution history, not full prior-art corpus; for litigation-grade invalidity the 2001-present ODP limit plus reliance on a single office means cross-checking EPO OPS / Google Patents BigQuery / PatentsView-on-ODP is advisable. Flag this scope limit in the template.

## Gold nuggets (14)

### 1. Smart patent identifier normalization (disambiguates app vs patent vs publication numbers)
`ip-domain-models` · relevance: **direct** · verified

A self-contained dataclass + heuristic that takes any user identifier (11/752,072, 7971071B2, US 7,971,071, 20080141381) and classifies it as application/patent/publication with a confidence level, cleaned value, and the correct USPTO Lucene field query. Directly reusable for beep's USPTO driver and for normalizing identifiers in PatentAsset; the kind-code stripping and the 8-digit ambiguity heuristic (USPTO series 08-17 vs ~11.5M issued patents) is domain knowledge that is expensive to rediscover.

- **Source:** `src/patent_filewrapper_mcp/util/identifier_normalization.py:36-165`
- **beep-target:** @beep USPTO driver + law-practice PatentAsset identifier normalization

```
cleaned = re.sub(r'^(US|USPTO)\s*', '', cleaned)
# Remove patent kind codes (A1, A2, B1, B2, ...) at END like "7971071B2"
cleaned = re.sub(r'\s*[A-Z]\d+\s*$', '', cleaned)
cleaned = re.sub(r'[^\d/,]', '', cleaned)
...
identifier_type="application",
search_query=f'applicationNumberText:{cleaned_no_slash}',
```

### 2. Lucene query-term escaping with documented safe/unsafe character policy
`data-ingestion` · relevance: **direct** · verified

escape_lucene_query_term escapes Lucene metacharacters to prevent query injection while deliberately leaving colon, quotes, brackets, dash, and wildcards unescaped (with documented rationale because they are legitimate in value positions). Plus a length cap to prevent DoS. beep's FalkorDB/Oxigraph and USPTO-style full-text query builders need exactly this; the rationale comments are the gold.

- **Source:** `src/patent_filewrapper_mcp/api/helpers.py:45-78`
- **beep-target:** @beep USPTO/CourtListener driver query builders

```
specials = r'[\\\+&|\!\(\)\{\}\^~]'
escaped = re.sub(specials, lambda m: '\\' + m.group(0), str(term))
if len(escaped) > 1000:
    raise ValidationError(f"Query term too long after escaping: {len(escaped)} characters")
```

### 3. User-friendly to API field-name mapping for Lucene queries
`data-ingestion` · relevance: **adjacent** · verified

map_query_field_names rewrites friendly field names (patentNumber:) into nested USPTO API paths (applicationMetaData.patentNumber:) via regex over field:value pairs, passing through already-qualified names. This is a clean pattern for offering attorney-facing query vocabulary while targeting the real API schema; useful for beep's retrieval layer where candidate queries are authored in human terms.

- **Source:** `src/patent_filewrapper_mcp/api/helpers.py:621-676`
- **beep-target:** @beep USPTO driver query-vocabulary layer

```
field_pattern = r'(\w+(?:\.\w+)*)\s*:'
def replace_field(match):
    field_name = match.group(1)
    if '.' in field_name:
        return match.group(0)
    api_field = field_mapping.get(field_name, field_name)
    return f"{api_field}:"
```

### 4. Progressive field tiers (minimal/balanced/complete) for context reduction
`mcp-design` · relevance: **direct** · verified

YAML-driven field-set config plus FieldConfigManager give named tiers ('95-99% context reduction' minimal, balanced, complete) over the USPTO response schema, with commented-out fields users can enable and explicit warnings about documentBag causing 100x token blowups. A concrete, battle-tested pattern for beep's MCP context-reduction / progressive-disclosure requirement and a real catalogue of USPTO PFW fields.

- **Source:** `field_configs.yaml:12-42`
- **beep-target:** @beep/nlp-mcp + USPTO driver field projection

```
predefined_sets:
  applications_minimal:
    description: "Ultra-minimal fields for application searches (95-99% context reduction)"
    fields:
      - applicationNumberText
      - applicationMetaData.inventionTitle
      - applicationMetaData.inventorBag
      # - documentBag  # WARNING: Can cause 100x token increase
```

### 5. Resilience stack: circuit breaker + retry budget + response cache + bulkhead pools
`governance-ops` · relevance: **adjacent** · verified

enhanced_client.py defines a CircuitBreaker (CLOSED/OPEN/HALF_OPEN) and a ResponseCache served while the circuit is open, plus retry/budget and per-workload httpx pool limits used by EnhancedPatentClient. A reusable resilience blueprint for beep's external API drivers (USPTO, CourtListener, GovInfo) where rate limits and outages are real.

- **Source:** `src/patent_filewrapper_mcp/api/enhanced_client.py:38-101`
- **beep-target:** @beep driver resilience layer (Effect retry/Schedule equivalents)

```
class CircuitBreaker:
    def can_execute(self) -> bool:
        if self.state == CircuitState.CLOSED:
            return True
        elif self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time > self.timeout:
                self.state = CircuitState.HALF_OPEN
                return True
            return False
```

### 6. Multi-source secure API-key resolution (secure storage -> env, with placeholder rejection)
`governance-ops` · relevance: **direct** · verified

The Mistral OCR service resolves keys via an ordered chain (encrypted secure storage get_mistral_api_key -> MISTRAL_API_KEY env var) and actively rejects common placeholder strings ('your_mistral_api_key_here', 'placeholder', 'optional', etc.) plus suspiciously short keys, so a half-configured key is treated as missing. Mirrors beep's multi-provider auth + onepassword secret-ref needs and the placeholder-detection idea is a nice defensive touch.

- **Source:** `src/patent_filewrapper_mcp/services/ocr_service.py:23-89`
- **beep-target:** @beep multi-provider auth / identity secret resolution

```
try:
    from ..shared_secure_storage import get_mistral_api_key
    raw_mistral_key = get_mistral_api_key()
except Exception:
    pass
if not raw_mistral_key:
    raw_mistral_key = os.getenv("MISTRAL_API_KEY")
self.mistral_api_key = self._validate_mistral_api_key(raw_mistral_key)
...
placeholder_patterns = ["your_mistral_api_key_here", "placeholder", "optional", ...]
```

### 7. USPTO prosecution document-code litigation importance tiers
`ip-domain-models` · relevance: **direct** · adjusted

PackageManager classifies USPTO documentBag codes into critical/important/standard/administrative tiers (CRITICAL_DOCS=NOA,CTFR,CTNF,CLM,ABST; IMPORTANT_DOCS=892,1449,REM,FWCLM,DRW,SPEC; STANDARD_DOCS=RCEX,EXIN,CTAV,IDS,WFEE) with a _categorize helper mapping unknowns to administrative. Note: CTNF is actually Non-Final Rejection and CTFR is Final Rejection (the original nugget description had these labels swapped). Directly feeds beep's law-practice OfficeAction/Rejection/PriorArtReference models and document-prioritization logic.

- **Source:** `src/patent_filewrapper_mcp/util/package_manager.py:57-60`
- **beep-target:** @beep law-practice OfficeAction/Rejection taxonomy

```
CRITICAL_DOCS = ["NOA", "CTFR", "CTNF", "CLM", "ABST"]
IMPORTANT_DOCS = ["892", "1449", "REM", "FWCLM", "DRW", "SPEC"]
STANDARD_DOCS = ["RCEX", "EXIN", "CTAV", "IDS", "WFEE"]
```

### 8. Claim evolution tracker (filing -> grant amendment history)
`provenance-evidence` · relevance: **direct** · verified

get_claim_evolution pulls all CLM documents, sorts by official date, and derives original vs final claims, intermediate amendments, amendment count, and a prosecution-complexity bucket (minimal/standard/moderate/high). This is exactly the kind of provenance-grounded derivation beep wants: a temporal chain of claim versions tied to dated source documents, feeding PatentAsset claim lineage and prosecution analytics.

- **Source:** `src/patent_filewrapper_mcp/util/package_manager.py:361-425`
- **beep-target:** @beep law-practice PatentAsset claim-version lineage

```
sorted_claims = sorted(claims_docs, key=lambda x: x.get('officialDate', ''))
...
amendment_count = len(sorted_claims) - 1
return {
    "original_claims": sorted_claims[0],
    "final_claims": sorted_claims[-1],
    "intermediate_amendments": sorted_claims[1:-1],
    "amendment_count": amendment_count,
    "prosecution_complexity": complexity,
```

### 9. Server-instructions block guiding progressive MCP tool discovery
`mcp-design` · relevance: **direct** · verified

The FastMCP server is initialized with a SERVER_INSTRUCTIONS string that tells the client which tools are always-available vs deferred, the recommended discovery workflow, and explains tiers (minimal/balanced/complete). A concrete template for beep's MCP progressive-disclosure / conditional-tool-registration design and how to steer a tool-search client without exposing 12 tools at once.

- **Source:** `src/patent_filewrapper_mcp/main.py:29-60`
- **beep-target:** @beep/nlp-mcp server instructions + tool gating

```
SERVER_INSTRUCTIONS = """
PFW MCP provides USPTO Patent File Wrapper data through 12 tools.
ALWAYS-AVAILABLE TOOLS (non-deferred, immediate access):
1. search_applications_minimal ...
PROGRESSIVE WORKFLOW:
1. Discovery: Use search_applications_minimal ...
TOOL TIERS:
- minimal: Fast, essential fields only (~10 fields)"""
mcp = FastMCP("patent-filewrapper-mcp", instructions=SERVER_INSTRUCTIONS)
```

### 10. Reflection/guidance system delivered as MCP Resources (context-on-demand)
`mcp-design` · relevance: **adjacent** · verified

BaseReflection (ABC) packages guidance content as versioned, tagged, typed MCP Resources (name/description/version/created_at/tags/mcp_type via abstract _get_tags and _get_mcp_type) rather than baking it into every tool description, supporting on-demand retrieval. A clean pattern for beep to externalize prompt/guidance content and keep tool surfaces lean while staying client-compatible.

- **Source:** `src/patent_filewrapper_mcp/reflections/base_reflection.py:12-37`
- **beep-target:** @beep/nlp-mcp guidance-as-resources pattern

```
class BaseReflection(ABC):
    def __init__(self, name, description, version="1.0"):
        self.name = name
        self.description = description
        self.version = version
        self.created_at = datetime.now().isoformat()
        self.tags = self._get_tags()
        self.mcp_type = self._get_mcp_type()
```

### 11. Secure local download proxy with encrypted opaque links (Fernet/DPAPI)
`desktop-portal` · relevance: **adjacent** · verified

SecureLinkCache stores app/document IDs encrypted in SQLite (Fernet), issues opaque non-business-revealing URLs, and auto-expires them (default 7 days) with optional Windows DPAPI key protection, keeping the API key server-side. Strong precedent for beep's local-first desktop pattern where a Tauri UI needs to fetch authoritative documents without leaking secrets or identifiers.

- **Source:** `src/patent_filewrapper_mcp/proxy/secure_link_cache.py:24-55`
- **beep-target:** @beep Tauri local-first document fetch / secure link layer

```
class SecureLinkCache:
    """Features:
    - Encrypted storage of application numbers and document IDs
    - Opaque URLs that don't reveal business data
    - Configurable link expiration (default 7 days)
    - Windows DPAPI integration for encryption keys"""
    def __init__(self, cache_duration_days: int = 7, db_path=None):
```

### 12. Patent-domain prompt-injection detector (detect-secrets plugin)
`governance-ops` · relevance: **serendipitous** · verified

A detect_secrets BasePlugin subclass with curated regex banks for instruction-override, prompt-extraction, persona-switching, and patent-specific exfiltration vectors (patent data extraction, examiner-info disclosure, API-bypass). Run as a pre-commit/CI secret-scan. beep ingests untrusted source text into LLM extraction, so a domain-tuned injection detector at the retrieval boundary is directly on-thesis for guarding the candidate pipeline.

- **Source:** `.security/patent_prompt_injection_detector.py:22-51`
- **beep-target:** @beep retrieval-boundary input sanitization / CI secret-scan

```
self.instruction_override_patterns = [
    r'ignore\s+(?:the\s+)?(?:above|previous|prior)\s+(?:prompt|instructions?|commands?)\s+(?:and|then|now)',
    r'disregard\s+(?:the\s+)?(?:above|previous|prior)\s+(?:prompt|instructions?|commands?)\s+(?:and|then|now)',
    r'you\s+are\s+(?:now\s+)?(?:a\s+)?(?:different|new|evil|malicious|unrestricted)\s+(?:ai|assistant|bot)',
```

### 13. Multi-step invalidity-analysis prompt template (multi-MCP orchestration)
`legal-nlp` · relevance: **adjacent** · verified

A large structured prompt orchestrating PFW + PTAB + FPD + Enriched Citations + Pinecone RAG MCPs to run 102/103/101 invalidity analysis with explicit data-availability gating (citations only Oct 2017+), token budgeting, and a mandatory ultra-minimal verification first step. A reusable scaffold for beep's agent prompts that compose multiple drivers and respect provenance/coverage windows. Note: PTAB/FPD/Citations scope overlaps beep's existing USPTO skeleton driver.

- **Source:** `src/patent_filewrapper_mcp/prompts/patent_invalidity_analysis_defense_Pinecone_PTAB_FPD_Citations.py:31-58`
- **beep-target:** @beep agents invalidity/prior-art analysis prompt scaffold

```
PATENT_INVALIDITY_ANALYSIS_DEFENSE_PINECONE_PTAB_FPD_CITATIONS = """
# PATENT INVALIDITY ANALYSIS & DEFENSE STRATEGY
...
**MANDATORY FIRST STEPS**:
1. **Validate Patent Identifiers**: Use any non-empty identifier to begin analysis.
```

### 14. Parameter-object pattern with invariant validation for search APIs
`effect-ts` · relevance: **adjacent** · verified

SearchParameters / InventorSearchParameters dataclasses collapse many search args into validated objects (limit>0, limit<=500, offset>=0; InventorSearchParameters validates strategy in {exact,fuzzy,comprehensive}) via __post_init__, plus attorney-friendly convenience filters (art_unit, examiner_name, customer_number, filing/grant date ranges). Maps cleanly to beep's effect/Schema-validated request models and the attorney-facing filter vocabulary for USPTO search.

- **Source:** `src/patent_filewrapper_mcp/models/search_params.py:11-57`
- **beep-target:** @beep USPTO driver request Schema models

```
@dataclass
class SearchParameters:
    query: Optional[str] = None
    limit: int = 10
    art_unit: Optional[str] = None
    examiner_name: Optional[str] = None
    filing_date_start: Optional[str] = None
    def __post_init__(self):
        if self.limit > 500:
            raise ValueError("Limit cannot exceed 500")
```
