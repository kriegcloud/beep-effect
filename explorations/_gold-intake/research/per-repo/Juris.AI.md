# Juris.AI  `[T2]`

- **Purpose:** Consumer-facing legal AI web app: ask a legal question, pick a jurisdiction + LLM provider, get a markdown legal analysis grounded in (mostly mocked) case-law/statute context, with model comparison and win-estimation.
- **Stack:** TypeScript, Next.js 15 (App Router) + React 18, Tailwind/shadcn-ui, Supabase (auth + Postgres), multi-provider LLM SDKs (@anthropic-ai/sdk, openai, @google/generative-ai, Mistral/Chutes via fetch), @xenova/transformers (InLegalBERT in-browser).
- **Size / shape:** ~30k LOC across 202 TS/TSX files; web app (Next.js) + Supabase backend, not a library/MCP server.
- **License:** MIT
- **Maturity:** Last commit 2025-09-22; version 4.3.0, actively maintained as of mid-2025.

**Notes:** This is a B2C legal-chat web app built around MOCK legal data (legal-apis.ts generates synthetic cases/statutes; calculateLegalRelevanceScore returns Math.random; encryption.ts is insecure XOR explicitly flagged "use proper encryption in production"). It directly contradicts beep's core thesis (no provenance spans, no candidate->approved gate, retrieval and "facts" are blended, fabricated citations). Most code is UI/boilerplate. Gold is thin and mostly adjacent: reusable provider-fallback orchestration, a prompt-assembly template, a jurisdiction taxonomy, and a quota limiter. beep already has Anthropic/OpenAI/xAI driver skeletons, so the multi-provider wrappers largely duplicate existing work. Recorded the clearest reusable patterns below and flagged duplicates/anti-patterns.

## Web enrichment
- **Status:** Juris.AI is a reference/demo consumer legal-AI app (Next.js 15 + Supabase + multi-provider LLM SDKs, with mostly mocked case-law/statute context). No upstream "Juris.AI" canonical project to track; status concerns are driven entirely by the third-party SDKs and ML libs it depends on. Two of its core dependencies are now hard-deprecated (Google's @google/generative-ai EOL 2025-11-30; @xenova/transformers superseded by @huggingface/transformers v3). These directly affect the provider-dispatch and in-browser-embeddings nuggets. For the citation/jurisdiction nuggets, the regex catalog is a hand-rolled subset of what the Free Law Project ecosystem (eyecite + reporters-db + courts-db) already solves canonically and should be the BEEP target rather than bespoke regex.</statusNotes>
<parameter name="deprecations">["@google/generative-ai (the JS SDK Juris.AI uses for Gemini) is DEPRECATED and reached end-of-life on 2025-11-30. Repo archived as google-gemini/deprecated-generative-ai-js. Must migrate to the unified @google/genai SDK (GA since May 2025), which uses a central Client object instead of GoogleGenerativeAI/getGenerativeModel.","@xenova/transformers (used for in-browser InLegalBERT) is the legacy v1/v2 package name; Transformers.js moved to the official @huggingface/transformers org package (v3, adds WebGPU/ONNX improvements). The @xenova package is effectively unmaintained and community has asked for it to be marked deprecated — new work should import @huggingface/transformers.","Hand-rolled regex legal-entity/citation extraction is brittle vs. canonical tooling: eyecite (Python, Hyperscan-backed, built from 55M+ citation formats via reporters-db + courts-db) is the reference. For a TS/JS port note the unofficial @beshkenadze/eyecite npm package, or call CourtListener's Citation Lookup API — but neither is an official FLP JS release, so treat as caution."]
- **Upstream docs:**
  - https://ai.google.dev/gemini-api/docs/migrate — Official Google guide migrating @google/generative-ai -> @google/genai (Client-based API), with before/after examples.
  - https://github.com/google-gemini/deprecated-generative-ai-js — Archived/deprecated JS SDK repo confirming EOL 2025-11-30.
  - https://huggingface.co/blog/transformersjs-v3 — Transformers.js v3 announcement: new @huggingface/transformers package name, WebGPU support — basis for the in-browser embeddings nugget.
  - https://github.com/freelawproject/eyecite — Canonical legal citation extractor (reporters-db + courts-db); reference design for the jurisdiction/citation and regex-extraction nuggets.
  - https://www.courtlistener.com/help/api/rest/citation-lookup/ — CourtListener Citation Lookup & Verification REST API — server-side alternative to bespoke regex parsing.
- **Corrections:**
  - *Multi-provider LLM dispatch with key-resolution + automatic fallback*: The Gemini provider layer almost certainly uses @google/generative-ai, which is deprecated and EOL as of 2025-11-30. The dispatch abstraction should target the unified @google/genai SDK (Client object, models.generateContent) when reimplemented as a BEEP driver; otherwise the Google fallback path is on borrowed time. Anthropic (@anthropic-ai/sdk) and OpenAI SDKs remain current.
  - *In-browser legal embeddings via InLegalBERT (transformers.js, local-first)*: Built on @xenova/transformers (legacy v1/v2 name). The maintained package is @huggingface/transformers (v3) under the official HF org, adding WebGPU acceleration and ONNX improvements — the local embedding-service BEEP target should standardize on @huggingface/transformers, not @xenova.
  - *Regex-based legal-entity extraction catalog (statute / case / court / legal-term)*: This bespoke regex catalog overlaps the Free Law Project's eyecite, which is built from 55M+ real citation formats and backed by reporters-db/courts-db (court + reporter normalization). The deterministic pre-tagger BEEP target should wrap eyecite (or its unofficial JS port @beshkenadze/eyecite / CourtListener Citation Lookup API) rather than maintain regex, gaining supra/id/short-cite resolution for free.
  - *Jurisdiction taxonomy + per-jurisdiction court/reporter/principle maps*: The court/reporter lookup tables duplicate FLP's courts-db and reporters-db, which are the canonical, continuously-maintained sources for court identifiers and reporter abbreviations. The jurisdiction-enum + reporter-lookup BEEP target should be sourced from / aligned to reporters-db + courts-db instead of a hand-curated map.

## Gold nuggets (7)

### 1. Multi-provider LLM dispatch with key-resolution + automatic fallback
`mcp-design` · relevance: **adjacent** · verified

getAIResponse() resolves a per-provider API key (user-supplied map -> env fallback via getApiKey) then switch-dispatches across openai/anthropic/gemini/mistral/cohere/together/openrouter/huggingface/replicate/custom/chutes and, on any failure, retries against a default provider (Mistral). The getApiKey() helper (from ./api-key-service) centralizes user-key-over-env precedence. beep already has Anthropic/OpenAI/xAI driver skeletons, so this DUPLICATES existing work, but the user-key->env precedence + graceful fallback chain is a useful pattern to port into a @beep Effect Layer (typed errors + Layer.orElse instead of try/catch).

- **Source:** `src/lib/ai-services.ts:381-457`
- **beep-target:** drivers/anthropic + openai/xAI provider Layers; shared LLM-dispatch with key precedence + fallback

```
switch (provider) {
  case 'mistral':
    return await mistralChat(message, apiKey || undefined);
  case 'anthropic':
    return await claudeChat(message, apiKey || undefined);
  ...
} catch (error) {
  if (provider !== 'mistral') {
    const fallbackApiKey = getApiKey(apiKeyMap, 'mistral', defaultMistralApiKey);
    return await mistralChat(message, fallbackApiKey || undefined);
  }
```

### 2. Legal-advice prompt template: assemble retrieved case-law + statute context + mandatory disclaimer
`legal-nlp` · relevance: **adjacent** · adjusted

getLegalAdvice() fetches case law and statutes in parallel, formats them into a numbered context block, injects jurisdiction, asks for a structured markdown analysis, then appends a Sources Referenced section and a fixed LEGAL_DISCLAIMER constant. The disclaimer constant and the source-attribution footer are directly reusable as a prompt-template + output-contract pattern. NOTE: here the 'sources' are fabricated mock data with no spans, which is exactly what beep must NOT do; for beep this template should be re-grounded on real provenance-spanned evidence before the LLM sees it.

- **Source:** `src/lib/ai-services.ts:566-668`
- **beep-target:** agents/Skill prompt templates; @beep/langextract -> grounded context block builder

```
if (caseLaw.length > 0) {
  legalContext += "\nRelevant Case Law:\n";
  caseLaw.forEach((caseItem, index) => {
    legalContext += `${index + 1}. "${caseItem.name}" (${caseItem.decision_date}) - ${caseItem.court}\n`;
    if (caseItem.citation) legalContext += `   Citation: ${caseItem.citation}\n`;
  });
}
...
return `${finalResponse}\n\n${LEGAL_DISCLAIMER}`;
```

### 3. Regex-based legal-entity extraction catalog (statute / case / court / legal-term)
`legal-nlp` · relevance: **adjacent** · verified

extractLegalEntities() ships a small typed catalog of regex patterns each tagged with a type and a hand-tuned confidence, returning {type,text,confidence}[]. Useful as a cheap deterministic CANDIDATE-claim seeder / pre-tagger in beep's retrieval tier (before LLM): e.g. a case-citation pattern (`X v. Y`) and statute pattern (`... Act of 2019`). Uses text.matchAll so it trivially extends to capture match indices for character-span provenance, which is what beep's GroundedExtraction.span needs.

- **Source:** `src/app/legal-bert/model.ts:82-100`
- **beep-target:** @beep/nlp-mcp deterministic pre-tagger feeding epistemic.CandidateClaim with spans

```
const patterns = [
  { type: 'statute', regex: /\b([A-Z][a-z]+ Act( of \d{4})?)\b/g, confidence: 0.85 },
  { type: 'case', regex: /\b([A-Z][a-z]+ v\. [A-Z][a-z]+)\b/g, confidence: 0.9 },
  { type: 'court', regex: /\b(Supreme Court|District Court|Court of Appeals)\b/g, confidence: 0.95 },
  { type: 'legal_term', regex: /\b(plaintiff|defendant|tort|liability|damages|contract|negligence)\b/gi, confidence: 0.8 }
];
```

### 4. In-browser legal embeddings via InLegalBERT (transformers.js, local-first)
`legal-nlp` · relevance: **serendipitous** · verified

LegalBertModel wraps @xenova/transformers feature-extraction pipeline loading the law-ai/InLegalBERT model fully client-side (mean pooling + normalize), returning embeddings + dims. This is a genuinely local-first NLP pattern that fits beep's local-first thesis: domain-specific legal embeddings with zero server round-trip, runnable in Tauri's webview. (Caveat: the relevance scoring calculateLegalRelevanceScore is a Math.random stub, so only the embedding-pipeline wiring is gold.)

- **Source:** `src/app/legal-bert/model.ts:12-39`
- **beep-target:** desktop-portal local embedding service; @beep/nlp-mcp local semantic similarity tool

```
const pipe = await pipeline("feature-extraction", "law-ai/InLegalBERT");
this.model = pipe;
this.isInitialized = true;
...
const result = await this.model(text, {
  pooling: "mean",
  normalize: true,
});
```

### 5. Sliding-window per-key API quota limiter with tier config
`governance-ops` · relevance: **adjacent** · adjusted

quota-manager.ts implements an in-memory keyed (last-8-chars of API key) quota tracker with windowMs reset, retryAfter computation, remaining-count reporting, and a free/paid tier config (passed as a param). Self-contained and easy to port to an Effect-based rate-limit Layer for beep's outbound government/LLM API drivers (USPTO/CourtListener/Anthropic) to avoid tripping upstream limits. Notes it should use Redis/persistent store in production.

- **Source:** `src/lib/quota-manager.ts:28-79`
- **beep-target:** drivers/* shared rate-limit + quota Layer for outbound API clients

```
const key = `quota:${provider}:${apiKey.slice(-8)}`; // Use last 8 chars for anonymity
...
if (entry.count >= entry.dailyLimit) {
  return {
    allowed: false,
    remaining: 0,
    resetTime: entry.resetTime,
    retryAfter: Math.ceil((entry.resetTime - now) / 1000),
  };
}
```

### 6. Jurisdiction taxonomy + per-jurisdiction court/reporter/principle maps
`ip-domain-models` · relevance: **adjacent** · adjusted

A compact jurisdiction value/label list (us/uk/ca/au/in/np/cn/eu) plus, in legal-apis.ts, parallel maps from jurisdiction code to court names, citation reporters (U.S./UKSC/HCA/SCC...), and constitutional/procedural references. The reporter-abbreviation and court-name lookup tables are reusable seed data for beep's citation parsing / jurisdiction normalization, even though the surrounding case generator is synthetic mock data.

- **Source:** `src/components/jurisdiction-select.tsx:19-28`
- **beep-target:** law-practice jurisdiction enum; citation reporter lookup table for parser

```
export const localJurisdictions = [
  { value: "us", label: "United States" },
  { value: "uk", label: "United Kingdom" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
  { value: "in", label: "India" },
  { value: "np", label: "Nepal" },
  { value: "cn", label: "China" },
  { value: "eu", label: "European Union" },
];
```

### 7. LegalCase / Statute data-model interfaces with relevance scoring
`ip-domain-models` · relevance: **adjacent** · verified

Plain TS interfaces for a legal case (id, name, citation, court, decision_date, jurisdiction, summary, full_text_url, relevance) and statute (id, title, code, section, jurisdiction, content, effective_date, relevance). A reasonable minimal shape to compare against beep's law-practice PriorArtReference / case models; the explicit numeric relevance field is a useful ranking-score convention. beep would re-express these as effect/Schema with provenance spans rather than free-text summaries.

- **Source:** `src/lib/legal-apis.ts:18-39`
- **beep-target:** law-practice PriorArtReference schema; epistemic relevance/ranking field convention

```
export interface LegalCase {
  id: string;
  name: string;
  citation: string;
  court: string;
  decision_date: string;
  jurisdiction: string;
  summary?: string;
  full_text_url?: string;
  relevance: number;
}
```
