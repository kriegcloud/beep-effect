# LegalEase  `[T2]`

- **Purpose:** Web app that uploads legal contracts and uses an LLM to summarize, simplify, extract risk-scored clauses, compare documents, and answer questions via RAG.
- **Stack:** Python (FastAPI, SQLAlchemy, LangChain/LangGraph, pgvector/Chroma, sentence-transformers, BM25, PyMuPDF/python-docx) backend; React 18 + Vite + TypeScript + Tailwind frontend; Bytez LLM gateway.
- **Size / shape:** ~27k LOC across Python backend (FastAPI services/routers) + React/TS frontend; full-stack web app (not a library/MCP server).
- **License:** MIT
- **Maturity:** Last commit 2026-06-28; actively developed.

**Notes:** LegalEase is a consumer-facing contract-analysis web app, not local-first or provenance-grounded, and is India-jurisdiction flavored (Aadhaar/PAN, IPC/BNS). No OWL/SHACL/RDF, no MCP, no Effect/TS-backend, no Tauri. Backend duplicates nothing in beep's driver set. The genuinely reusable assets are retrieval-side: LLM clause/risk prompts, resilient JSON extraction, PII redaction with char offsets, regex entity-graph building, hybrid BM25+dense retrieval, and a deterministic-then-LLM confidence pattern. All would need TS/Effect porting and re-targeting to US IP law.

## Web enrichment
- **Status:** LegalEase's external surface is the Bytez LLM gateway plus a standard Python RAG stack (LangChain/LangGraph, pgvector/Chroma, BM25, sentence-transformers, PyMuPDF). As of mid-2026 all core dependencies are live; no decommissions hit the app directly. Bytez is active and now exposed through LiteLLM (chat + multimodal tasks), so the bespoke Bytez client could be swapped for a LiteLLM-backed provider to gain retries/fallbacks/observability for free. The most fragile nuggets are the hand-rolled JSON-repair extractor (BAML Schema-Aligned Parsing is now the canonical, battle-tested replacement) and the regex/keyword legal-NLP heuristics (eyecite is the canonical citation parser, with a maintained TS port). The patent/IP cross-cutting topics are tangential to a contract-analysis app, but if the WIPO-IPC/statute-classification retarget is pursued, note the USPTO ecosystem churn below.</statusNotes>
<deprecations>["PatentsView legacy API was retired Feb 2025 (replaced by PatentSearch API); the entire PatentsView site is migrating to USPTO Open Data Portal (data.uspto.gov) on March 20, 2026, and the legacy Developer Hub (developer.uspto.gov) was decommissioned June 5, 2026. Old PatentSearch API keys are NOT valid on ODP — must re-issue ODP keys. Only relevant if the statute/IPC classification nugget is retargeted to patent data.","USPTO PTAB API v2 decommissioned January 6, 2026 — use ODP equivalents.","Do not treat the balanced-bracket regex JSON extractor as robust: hand-rolled brace-matching breaks on chain-of-thought preambles, markdown code fences, and type coercion that BAML's SAP handles deterministically. Prefer a parser-based approach over regex repair.","Bytez direct REST client is a single point of failure (no built-in fallback/retry); routing via LiteLLM or a gateway is the current best practice for production LLM access."]</deprecations>
<upstreamDocs>[{"url":"https://docs.litellm.ai/docs/providers/bytez","note":"LiteLLM Bytez provider — drop-in gateway for the existing Bytez key with retries/fallbacks across 200k+ models."},{"url":"https://docs.boundaryml.com/home","note":"BAML docs — Schema-Aligned Parsing (SAP) is the canonical robust structured-output method (fixes broken JSON, markdown wrapping, CoT, type coercion); generates typed Python/TS clients."},{"url":"https://github.com/freelawproject/eyecite","note":"eyecite — canonical legal-citation parser (regex DB from 55M+ formats); use instead of bespoke regex for statute/case citation extraction. TS port exists (@beshkenadze/eyecite)."},{"url":"https://data.uspto.gov/support/transition-guide/patentsview","note":"USPTO ODP transition guide — confirms PatentsView→ODP migration, key re-issuance, and bulk dataset access (only if IP retarget pursued)."},{"url":"https://docs.litellm.ai/docs/providers","note":"LiteLLM provider catalog — reference for multi-provider routing/fallback design for the LLM layer."}]</upstreamDocs>
<corrections>[{"nuggetTitle":"Balanced-bracket JSON extractor for fixing LLM output","correction":"This is reinventing BAML's Schema-Aligned Parsing (SAP), which is now the documented canonical solution and benchmarks 2-4x faster than OpenAI FC-strict while producing valid JSON on every call. SAP additionally handles cases brace-matching misses: markdown code-fence stripping, chain-of-thought reasoning before the object, and type coercion. Frame the nugget as a candidate to replace with BAML (or at minimum note SAP as the upstream reference behavior); pure regex bracket-balancing is brittle on real LLM output."},{"nuggetTitle":"Keyword->statute-section mapping with confidence + LLM fallback (candidate pattern)","correction":"For any statutory/case citation surface, eyecite (Free Law Project) is the canonical extractor — its regex DB is derived from 55M+ citation formats (Caselaw Access Project, CourtListener, Indigo Book, Cardiff Index) and is used in production on millions of documents. Prefer eyecite over hand-rolled keyword regex for citation detection; reserve the LLM fallback for semantic classification only. Note: the WIPO-IPC/patent retarget is now subject to the USPTO PatentsView→Open Data Portal migration (March 20, 2026) requiring new ODP API keys."},{"nuggetTitle":"Risk-scored clause extraction prompt + strict JSON contract","correction":"The 'strict JSON contract' is enforced only by prompt text + downstream regex repair; the upstream-correct pattern is to define the output schema once (BAML or provider-native structured outputs via LiteLLM) so the contract is type-checked at generation time rather than salvaged post-hoc. Bytez chat models are reachable through LiteLLM, which exposes structured-output handling uniformly."}]</corrections>
</invoke>


## Gold nuggets (7)

### 1. Risk-scored clause extraction prompt + strict JSON contract
`legal-nlp` · relevance: **direct** · verified

analyze_clauses() asks the LLM to return a JSON array of clauses each with riskLevel/riskReason/liability_score, plus stub-mode exemplars and graceful-degradation fallbacks. Near-ready template for beep's epistemic CandidateClaim generation from contract/office-action prose: exact prompt shaping, 'respond ONLY with valid JSON' contract, severity scoring. beep should require it to also emit source character spans (it echoes 'exact text of the clause' but no offsets) to satisfy the provenance wall.

- **Source:** `backend/services/ai_service.py:278-296`
- **beep-target:** @beep epistemic slice — CandidateClaim extraction (clause -> candidate w/ risk); retrieval-side LLM prompt

```
"Analyze the following legal text and extract up to 5 key clauses. "
"For each clause, assign a riskLevel ('High', 'Medium', or 'Low') and a riskReason "
"explaining the risk assignment. Additionally, assign a liability_score from 1 to 100 representing the severity.\n\n"
"You MUST respond ONLY with a valid JSON array of objects, where each object has these exact keys:\n"
"  - \"clause\": the exact text of the contract clause\n"
```

### 2. Balanced-bracket JSON extractor for fixing LLM output
`legal-nlp` · relevance: **adjacent** · adjusted

_extract_json_array_balanced() parses the first valid JSON array out of noisy LLM text using bracket counting with string/escape awareness instead of greedy regex. beep's retrieval layer constantly has to recover structured data from chatty model output; robust, dependency-free recovery routine worth porting to TS for the langextract/nlp-mcp boundary.

- **Source:** `backend/services/ai_service.py:338-369`
- **beep-target:** @beep/langextract or @beep/nlp-mcp — resilient structured-output parsing

```
def _extract_json_array_balanced(self, text: str) -> Optional[str]:
    start_idx = text.find('[')
    if start_idx == -1:
        return None
    bracket_count = 0
    in_string = False
    escape_next = False
```

### 3. PII redaction patterns with position-tracked match auditing
`provenance-evidence` · relevance: **direct** · adjusted

redaction.ts is a pure-function PII redactor: ordered, extensible labeled regex patterns (SSN, credit card, Aadhaar/PAN, email, phone, etc.) plus findPiiMatches() returning {label, match, index} sorted by character offset. label+index output is effectively span-grounded detection — reusable for beep's provenance/redaction (ethical-wall redaction before LLM calls, char-span anchored evidence). India-centric IDs (Aadhaar/PAN) can be dropped. Line corrected: function is at 161-181, not 183-205.

- **Source:** `src/utils/redaction.ts:161-181`
- **beep-target:** @beep/provenance — char-span PII detection / pre-LLM redaction in the ethical wall

```
export function findPiiMatches(
  text: string,
  patterns: PiiPattern[] = PII_PATTERNS
): PiiMatch[] {
  if (!text || typeof text !== 'string') return [];
  const matches: PiiMatch[] = [];
  for (const { label, pattern } of patterns) {
    const cloned = new RegExp(pattern.source, pattern.flags);
    while ((m = cloned.exec(text)) !== null) {
      matches.push({ label, match: m[0], index: m.index });
    }
  }
  return matches.sort((a, b) => a.index - b.index);
```

### 4. Regex entity-and-relationship extraction into a node/link graph
`kg-ontology-reasoning` · relevance: **adjacent** · adjusted

extract_entities() pulls parties, jurisdictions, dates, and 'shall/must/agrees to' obligations from contract text and emits a {nodes, links} graph with typed nodes (party/jurisdiction/date/obligation) and labeled edges (party to, governed by, obligated to, effective). Cheap deterministic candidate-graph builder mapping onto beep's FalkorDB projection layer and ontology classes. Useful as fast non-LLM first pass before OWL/SHACL proof. Line corrected: 'obligated to' link is at 110, so range spans 72-110.

- **Source:** `backend/services/entity_extraction.py:72-110`
- **beep-target:** FalkorDB projection / @beep/semantic-web — deterministic candidate node-link extraction

```
obligation_patterns = [
    r'shall\s+([\w\s]+?)(?:\.|,|;)',
    r'must\s+([\w\s]+?)(?:\.|,|;)',
    r'agrees?\s+to\s+([\w\s]+?)(?:\.|,|;)',
]
...
links.append({"source": p["id"], "target": o["id"], "label": "obligated to", "strength": 0.6})
```

### 5. Hybrid BM25 + dense-vector retrieval with weighted score fusion
`data-ingestion` · relevance: **adjacent** · verified

get_hybrid_results() runs BM25Okapi (sparse) and sentence-transformer cosine (dense) over a doc list, normalizes each, and fuses with a tunable alpha weight, returning per-result scores. Compact, transplantable GraphRAG/retrieval recipe for beep's retrieval side where keyword precision (statute/section numbers, claim terms) must combine with semantic recall.

- **Source:** `backend/services/hybrid_search.py:44-58`
- **beep-target:** retrieval layer — hybrid search ranking before candidate proposal

```
alpha = 0.5  # Weight for BM25 vs Dense
final_scores = [
    (alpha * bm25_score) + ((1 - alpha) * dense_score)
    for bm25_score, dense_score in zip(norm_bm25, norm_dense)
]
ranked_indices = np.argsort(final_scores)[::-1][:top_k]
```

### 6. Keyword->statute-section mapping with confidence + LLM fallback (candidate pattern)
`ip-domain-models` · relevance: **serendipitous** · verified

map_problem_to_sections() maps free text to statute sections via a local JSON taxonomy (keyword lists -> section/title/summary/severity, confidence 0.9) and falls back to an LLM (confidence 0.5) when no deterministic hit. The two-tier 'deterministic-high-confidence then fallible-LLM-low-confidence' shape mirrors beep's retrieval->candidate model; JSON taxonomy schema is a clean template for classification lookup tables. Dataset is Indian IPC/BNS, so retarget to WIPO-IPC/CPC.

- **Source:** `backend/services/legal_mapping.py:26-43`
- **beep-target:** law-practice classification taxonomy + epistemic confidence on candidates (WIPO-IPC retarget)

```
out = {
    "section": entry.get("section"),
    "title": entry.get("title"),
    "summary": entry.get("summary"),
    "severity": entry.get("severity", "unknown"),
    "matched_keywords": matched,
    "confidence": 0.9,
}
```

### 7. Conversation branching via parent_id + branch_index tree
`agent-memory` · relevance: **adjacent** · verified

ChatMessage models a message tree (parent_id self-FK, branch_index for regeneration/edit variants) rather than a flat list, enabling alternate-history threads. Relevant to beep's workspace Thread/Task memory and to keeping multiple candidate-extraction attempts as branches before the human approval gate picks one.

- **Source:** `backend/models.py:40-52`
- **beep-target:** @beep workspace — Thread message branching / candidate variant tracking

```
# parent_id points to the message this one was generated in response to,
# enabling a tree structure rather than a flat list.
parent_id = Column(Integer, ForeignKey("chat_messages.id"), nullable=True, index=True)
# branch_index tracks which regeneration/edit variant this message represents (0-based).
branch_index = Column(Integer, nullable=False, default=0)
```
