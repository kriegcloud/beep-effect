# doc-haus  `[T1]`

- **Purpose:** Local-first, open-source multi-agent legal-AI workbench (a fork of OpenCode retargeted from code onto legal documents): documents stay on disk, every answer is cited to a verbatim clause, and edits land as tracked changes in the .docx.
- **Stack:** TypeScript + Bun. OpenCode agent harness (plugin/tool/agent config layer). Ingest service on Hono. React+Vite web frontend. Per-matter SQLite (bun:sqlite) with FTS5 + a local HuggingFace embedding model (granite-embedding-small via @huggingface/transformers/ONNX). DOCX/PDF via mammoth, unpdf, docxodus. Default model provider Google Vertex (Gemini); also Anthropic/OpenAI/Ollama/vLLM.
- **Size / shape:** ~17.2k LOC across the legal layer that matters here (dochaus/ config+tools+lib+plugin, services/ingest, apps/web); the wider repo carries ~2,500 TS files of upstream OpenCode engine. Kind: desktop/web legal-AI app + standalone ingest microservice + agent-config layer (monorepo fork).
- **License:** MIT
- **Maturity:** Active; last commit 2026-06-13 (file mtimes 2026-06-29). 2026 copyright. Issue-referenced, well-commented production code.

**Notes:** This is a true fork of OpenCode; the upstream engine packages (packages/core, server, llm, sdk) are deliberately left near-untouched and are NOT gold — all reusable legal IP lives additively in dochaus/, services/ingest/, apps/web/. The architecture is a near-perfect mirror of beep's core thesis: a deterministic, regex/offset-only structure-extraction + verbatim-citation layer (the "logic/proof" side) walled off from the fallible LLM agents (the "retrieval" side), with every fact carrying exact char-span provenance and human accept/reject gates before anything is baked into the authoritative .docx. case-law.ts duplicates beep's existing CourtListener driver skeleton (recorded below with that caveat).

## Web enrichment
- **Status:** doc-haus is a fork of OpenCode (SST/Anomaly Innovations) retargeted onto legal docs. OpenCode is healthy and fast-growing (open-source TUI/desktop/VSCode/web + central server; config sections model/provider/lsp/mcp/plugin/agent/tools/permission). MCP was donated to the Linux Foundation (Dec 2025); doc-haus's declarative tool-permission matrix maps cleanly onto OpenCode's native `permission`/`tools` config and MCP. Core dependency-status check for 2026: (1) Free Law Project stack (eyecite + CourtListener API v4) is current and stable; (2) the USPTO/PatentsView side has materially changed — legacy APIs decommissioned, everything migrating to the Open Data Portal (data.uspto.gov); (3) BAML, FastMCP-TS, FalkorDB/TrustGraph are all actively maintained and current. The repo's local-first, on-disk, span-cited design is well aligned with these upstreams; the main external-behavior risks are the patent-data endpoints (not used by the mined nuggets yet) and the CourtListener auth/rate-limit specifics in the one duplicate driver nugget.</statusNotes>
<deprecations">["PatentsView legacy API: discontinued ~Feb–May 2025. The PatentSearch API and patentsview.org are migrating into the USPTO Open Data Portal (data.uspto.gov) on/around March 20, 2026. CRITICAL: previously-issued PatentSearch API keys are NOT compatible with ODP — new ODP keys required.","USPTO legacy Developer Hub (developer.uspto.gov) decommissioned June 5, 2026 — hard-code data.uspto.gov, not developer.uspto.gov.","USPTO PEDS (Patent Examination Data System) discontinued March 14, 2025; replaced by ODP Patent File Wrapper API.","PPUBS (ppubs.uspto.gov) is a web UI, not a stable public REST API — do not treat it as a programmatic endpoint; use ODP APIs for automation.","CourtListener webhooks have NO sender-authentication mechanism (no HMAC signature) — verify payloads out-of-band; default auth rate limits are tight (5/min, 50/hr, 125/day) and will throttle bulk citation enrichment.","No mature pure-JS/TS or WASM OWL2 EL/RL reasoner exists as of 2025 — VEL (verified EL++) is OCaml/Coq; EYE ships as WASM but is N3/rules, not an OWL2-EL profile reasoner. Plan for a non-JS reasoner sidecar or restrict to lightweight rule logic if staying in-process."]</deprecations>
<upstreamDocs>
<value>{"url":"https://data.uspto.gov/support/transition-guide/patentsview","note":"Official USPTO PatentsView→Open Data Portal transition guide (key incompatibility, new endpoints)."}</value>
<value>{"url":"https://www.courtlistener.com/help/api/rest/","note":"CourtListener REST API v4.4 reference: Token auth header, rate limits, result shapes — align the duplicate CourtListener driver here."}</value>
<value>{"url":"https://github.com/freelawproject/eyecite","note":"eyecite (Python) canonical citation parser; current ~2.7.x. No official JS port — wrap as a service or use community npm at your own risk."}</value>
<value>{"url":"https://github.com/punkpeye/fastmcp","note":"FastMCP TS: built on the official MCP SDK; standard-schema (zod/valibot/arktype) tool defs, supports MCP spec 2025-06-18 + OAuth — good pattern for doc-haus tool registration/permission gating."}</value>
<value>{"url":"https://docs.boundaryml.com/guide/installation-language/typescript","note":"BAML: Tier-1 TS support, codegen'd typed LLM functions, zero mandatory network deps — fits local-first grounded extraction nuggets."}</value>
<value>{"url":"https://www.falkordb.com/news-updates/trustgraph-autonomous-knowledge-extraction/","note":"FalkorDB + TrustGraph GraphRAG integration (GraphBLAS-backed); GraphRAG-SDK 1.0 is production-grade — reference for the FalkorDB projection / lineage-edge candidate targets."}</value>
<value>{"url":"https://deepwiki.com/sst/opencode","note":"OpenCode architecture overview (server + TUI/desktop/web, config layer, MCP/plugin/agent/permission) — the upstream doc-haus forks."}</value>
<value>{"url":"https://github.com/google/patents-public-data","note":"Google Patents Public Datasets on BigQuery (SQL, pay-per-query, 1TB/mo free) + EPO OPS v3.2 (OAuth2 consumer key/secret) as alternative patent-data backends."}</value>
</upstreamDocs>
<corrections>
<value>{"nuggetTitle":"CourtListener case-law client (DUPLICATE of beep skeleton — recorded with caveat)","correction":"Pin to CourtListener REST API v4 (current v4.4). Auth is `Authorization: Token <key>` (the literal word 'Token' is required — common failure). Mind default throttles (5/min, 50/hr, 125/day) for any batch citation enrichment. If using webhooks, note there is NO signature/auth on inbound POSTs — must verify out-of-band; retries are 7x with exponential backoff. Confirm the duplicate driver targets v4 paths, not legacy v3."}</value>
<value>{"nuggetTitle":"Amendment-chain resolution + transitive chain building from extracted relations","correction":"For citation normalization feeding chain/lineage logic, anchor on eyecite (FLP), tested against 55M+ citations; there is no official JS port, so run it as a Python sidecar/service rather than relying on unofficial npm forks. Keep FRBR/LRM version resolution conceptual — no JS OWL2 reasoner backs it (see deprecations)."}</value>
<value>{"nuggetTitle":"Tool permission matrix: read=allow / mutate=ask / edit+bash=deny as a declarative gate","correction":"This maps directly onto OpenCode's native `permission`/`tools` config (the fork already provides allow/ask/deny semantics) and onto FastMCP-TS conditional tool registration. Prefer expressing the matrix in OpenCode config + MCP tool-list filtering rather than a bespoke gate; FastMCP/official-SDK both support per-tool exposure and MCP spec 2025-06-18 OAuth scopes."}</value>
<value>{"nuggetTitle":"Config-only jurisdiction packs (profile.json + prompt.md) injected into the system prompt","correction":"If/when patent-jurisdiction packs add data access, do NOT wire to PatentsView legacy or developer.uspto.gov (decommissioned). Target USPTO Open Data Portal (data.uspto.gov, new ODP keys), EPO OPS v3.2 (OAuth2), and/or Google Patents BigQuery. FOLIO alignment remains valid for jurisdiction taxonomy."}</value>
<value>{"nuggetTitle":"Hybrid retrieval with RRF fusion + char-span citations + auto-attached definitions/cross-refs","correction":"The FalkorDB projection / GraphRAG candidate target is current and well-supported (FalkorDB GraphBLAS + GraphRAG-SDK 1.0, TrustGraph extraction agents). Safe to keep as the graph backend for span-grounded retrieval; no deprecation."}</value>
</corrections>
</invoke>


## Gold nuggets (14)

### 1. Hybrid retrieval with RRF fusion + char-span citations + auto-attached definitions/cross-refs
`provenance-evidence` · relevance: **direct** · verified

A read-only retrieval tool that fuses three channels over the same chunks (embedding cosine for meaning, FTS5/BM25 for exact tokens, and a whole-query phrase channel for literal section/term/party hits) via reciprocal-rank fusion, returns each hit with doc/section/charStart/charEnd, then auto-attaches verbatim defined-term definitions and resolves numbered cross-references appearing inside the excerpts. Directly maps to beep's GraphRAG + GroundedExtraction.span retrieval, including the span-grounded citation shape and the 'literal hit must not be outscored by fuzzy hits' insight.

- **Source:** `dochaus/tool/search-document.ts:42-121`
- **beep-target:** @beep/semantic-web / @beep/langextract span-grounded retrieval; epistemic Evidence + FalkorDB projection GraphRAG

```
// Hybrid retrieval (issue #67): two channels over the same chunks — embedding
// cosine for meaning, FTS5/BM25 for exact tokens ... — fused with reciprocal-rank fusion.
const CANDIDATES = 20
const RRF_K = 60
```

### 2. Verbatim quote verification with normalized→raw offset mapping and cross-chunk straddle
`provenance-evidence` · relevance: **direct** · verified

A tool that proves a quote appears verbatim in stored source before it is presented: it normalizes whitespace/curly-quotes (no case folding), keeps a normalized-index→raw-offset map so a match can be relocated to real char offsets, and reconstructs document text across chunk boundaries to catch quotes that straddle chunks. Returns VERIFIED-with-location or NOT FOUND — never a near match. This is precisely beep's 'only proof crosses the wall' + exact-character-span provenance requirement.

- **Source:** `dochaus/tool/verify-quote.ts:37-56`
- **beep-target:** @beep/provenance span verification; epistemic ClaimGate (verbatim-grounding check)

```
function normalizeWithMap(raw: string) {
  let out = ""
  const map: number[] = []
  ...
    out += ch === "“" || ch === "”" ? '"' : ch === "‘" || ch === "’" ? "'" : ch
    map.push(i)
  }
  return { text: out, map }
}
```

### 3. Deterministic regex contract-structure extraction (defined terms, cross-refs, parties, amendments) with char offsets
`legal-nlp` · relevance: **direct** · verified

Pure-regex extraction of a contract's self-describing graph — quoted/parenthetical defined terms, numbered Section/Article/Exhibit references, corporate-suffix party names + their parenthetical roles, and amendment recitals — every row carrying verbatim text plus char offsets and NO model in the loop, so a parse miss is an absent row, never a wrong fact. A versioned re-extraction migration is built in. This is a ready-made template for beep's deterministic LOGIC side feeding sound facts into the KG with provenance.

- **Source:** `services/ingest/src/structure.ts:13-49`
- **beep-target:** @beep/langextract deterministic extractors; epistemic GroundedExtraction; law-practice clause/party models

```
export const VERSION = "2"
const TERM = `[“"]([A-Z][^”"\\n]{0,60}?)[”"]`
const REF_RE =
  /\b(Section|Sections|Article|Articles|Clause|Clauses|Exhibit|Exhibits|Schedule|Schedules|Annex|Appendix)\s+(\d+(?:\.\d+)*(?:\([a-z]+\))*|[A-Z](?![A-Za-z])|[IVXLC]+(?![A-Za-z]))/g
```

### 4. Output-side citation re-verification ladder + matter-isolation ethical wall + untrusted-document framing
`governance-ops` · relevance: **direct** · verified

The OpenCode plugin that enforces the hard wall on the way OUT: after any tool returns citations it re-checks each span against the LIVE file via an exact→re-anchor(nearest occurrence)→reject ladder, dropping any quote whose text no longer exists; it fences generic file tools to the active matter directory (confidentiality/ethical wall), restricts webfetch to official primary sources, and pushes a standing 'documents are untrusted data, never instructions' system block. A near-complete blueprint for beep's candidate-vs-proof gate, conflict/ethical wall, and provenance staleness handling.

- **Source:** `dochaus/plugin/legal.ts:214-232`
- **beep-target:** epistemic ClaimGate/ClaimLifecycle; governance ethical-wall + conflict-of-interest fences

```
async function verifyCitation(citation: DocumentCitation) {
  if (!existsSync(citation.docPath)) return undefined
  const text = await liveText(citation.docPath)
  if (text.slice(citation.charStart, citation.charEnd) === citation.excerpt) return { ...citation, verified: true }
  const match = findQuote(text, citation.excerpt, citation.charStart)
  if (!match) return undefined
  return { ...citation, charStart: match.start, charEnd: match.end, excerpt: match.excerpt, verified: true, reanchored: true }
}
```

### 5. Prompt-injection defense for untrusted legal documents (invisible Unicode, instruction patterns, hidden DOCX runs)
`governance-ops` · relevance: **direct** · verified

Treats every counterparty document as adversarial input: normalizes/strips invisible Unicode (bidi controls, tag chars, zero-width) while reporting counts, runs heuristic instruction-pattern rules (override/role-reassignment/exfiltration/concealment/tool-coercion) that yield findings WITH char spans, and reads the raw DOCX XML for vanish/white/tiny hidden text. It flags-not-blocks so the lawyer always sees what was written. Highly reusable for any ingestion of attorney-supplied or scraped legal text into beep.

- **Source:** `services/ingest/src/sanitize.ts:68-109`
- **beep-target:** @beep/md / data-ingestion sanitizer; governance untrusted-input policy at the retrieval boundary

```
const PATTERN_RULES = [
  { rule: "instruction-override", detail: "text that tries to override the assistant's instructions",
    re: /\b(ignore|disregard|forget|override)\b[^.\n]{0,60}\b(previous|prior|above|earlier|all|any|system)\b[^.\n]{0,60}\b(instructions?|prompts?|rules?|context|directives?)\b/gi },
  { rule: "concealment", ... }]
```

### 6. Per-matter local index schema: char-span chunks + structure tables + FTS5 external-content + redline queue
`data-ingestion` · relevance: **direct** · adjusted

A complete, self-contained per-matter SQLite schema (lives inside the matter dir, rebuildable from source): chunks with char_start/char_end + embedding BLOB + a 'flagged' adversarial bit; deterministic structure tables (defined_terms, section_refs, parties, doc_relations) each with offsets; an external-content FTS5 index kept in sync by triggers with integrity-check/rebuild self-healing; a meta key-value (embedding-model version guard); and a redlines proposal queue with status. Maps closely to beep's PGlite authority + provenance columns and the FalkorDB-as-projection split. (Note: cited snippet is the chunks table at 27-40; the structure tables and redlines queue it also describes live at lines 106-161 of the same file, confirmed present.)

- **Source:** `services/ingest/src/db.ts:27-161`
- **beep-target:** @beep/provenance + PGlite/Drizzle authority schema; FalkorDB projection of structure tables

```
CREATE TABLE IF NOT EXISTS chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT, document_id INTEGER NOT NULL,
  doc_path TEXT NOT NULL, doc_name TEXT NOT NULL, section TEXT NOT NULL,
  chunk_index INTEGER NOT NULL, text TEXT NOT NULL,
  char_start INTEGER NOT NULL, char_end INTEGER NOT NULL,
  embedding BLOB NOT NULL, flagged INTEGER NOT NULL DEFAULT 0)
```

### 7. Candidate→approved redline gate: pending proposal queue, ctx.ask permission, conflict/supersede logic
`agent-memory` · relevance: **direct** · verified

The redline tool never edits the canonical .docx; it locates the clause, captures its current text, and records a PENDING proposal that a human accepts/rejects in the app — gated on an explicit ctx.ask permission prompt. The redlines lib adds conflict detection (same anchor/overlapping find-text) and a distinct 'superseded' status so only the newest edit on a paragraph stays pending. This is a working implementation of beep's candidate→approved human gate before persistence, including the lifecycle states.

- **Source:** `dochaus/lib/redlines.ts:86-108`
- **beep-target:** epistemic ClaimLifecycle (pending/accepted/rejected/superseded); ClaimGate human approval

```
export function conflictingRedlines(pending: PendingRedline[], next: { anchorId: string; scope: "phrase" | "clause"; findText: string }) {
  return pending.filter((p) => {
    if (p.anchor_id !== next.anchorId) return false
    if (p.scope === "clause" || next.scope === "clause") return true
    const existing = p.find_text.trim()
    const incoming = next.findText.trim()
    return existing.includes(incoming) || incoming.includes(existing)
  })
}
```

### 8. Tool permission matrix: read=allow / mutate=ask / edit+bash=deny as a declarative gate
`mcp-design` · relevance: **direct** · verified

opencode.json declares a per-tool permission policy where every read-only retrieval tool is 'allow', every write/mutating tool (draft, redline, redact, create/update/delete-template/skill/agent/workflow) is 'ask' (human-in-the-loop), and raw edit/bash/websearch are 'deny'. Also wires MCP servers (remote CourtListener MCP, a sandboxed Python MCP) and disables generic coding agents. A clean, copyable governance pattern for beep's MCP tool registration and approval-gate config.

- **Source:** `dochaus/opencode.json:87-134`
- **beep-target:** @beep/nlp-mcp conditional tool registration + permission policy; governance approval gates

```
"permission": {
  "read": "allow", "search-document": "allow", "cite": "allow",
  "draft-document": "ask", "tracked-changes": "ask", "redline": "ask", "redact": "ask",
  "edit": "deny", "bash": "deny", "websearch": "deny"
}
```

### 9. Config-only jurisdiction packs (profile.json + prompt.md) injected into the system prompt
`ip-domain-models` · relevance: **adjacent** · verified

A jurisdiction is a swappable, code-free bundle under jurisdiction/<code>/: profile.json (code, name, citationStyle, preferredModel) + prompt.md (a system-prompt fragment for citation conventions, binding-vs-persuasive authority). A matter declares its jurisdictions in matter.json (it can span several, e.g. cross-border), the loader path-sanitizes the code, and the plugin appends matching fragments per turn. Reusable for beep's jurisdiction/classification taxonomies and per-matter reasoning steering across the 7-ontology TBox.

- **Source:** `dochaus/lib/jurisdiction.ts:13-34`
- **beep-target:** law-practice jurisdiction taxonomy + per-matter prompt steering; FOLIO jurisdiction alignment

```
export type JurisdictionProfile = {
  code: string
  name: string
  citationStyle: string
  preferredModel?: string | null
}
export type JurisdictionPack = JurisdictionProfile & { prompt: string }
```

### 10. Amendment-chain resolution + transitive chain building from extracted relations
`kg-ontology-reasoning` · relevance: **adjacent** · verified

Reads deterministic doc_relations 'amends' rows and resolves each stated target to an indexed document by token-subset name match OR by defined-term definer, explicitly excluding the amender itself and reporting resolved/ambiguous/unmatched honestly (never forced). It then groups by target and flattens transitively (amendment-of-an-amendment lands in the base's chain, with a cycle guard) and tells the agent which version is operative. A strong model for KG entity resolution + lineage that refuses to fabricate edges.

- **Source:** `dochaus/tool/amendment-chain.ts:42-65`
- **beep-target:** FalkorDB lineage edges (amends/supersedes); FRBR/LRM version resolution; entity-resolution without fabrication

```
function resolveTarget(db, target, docs, relations): Resolution {
  ...
  const candidates = docs.filter((d) => d.doc_path !== target.doc_path &&
      (tokens.every((t) => d.name.toLowerCase().includes(t)) || definerPaths.has(d.doc_path)))
  const nonAmending = candidates.filter((d) => !amenderPaths.has(d.doc_path))
  const pool = nonAmending.length > 0 ? nonAmending : candidates
  if (pool.length === 1) return { kind: "resolved", doc: pool[0] }
  if (pool.length > 1) return { kind: "ambiguous", names: pool.map((d) => d.name) }
  return { kind: "unmatched" }
}
```

### 11. Clause-aware sectionizer + char-offset chunker with breadcrumb-prefixed embeddings
`data-ingestion` · relevance: **direct** · verified

sectionize() splits extracted text into labeled sections by clause-number/markdown-heading/all-caps-heading lines while accumulating exact char offsets; chunkSection() slices ~2000-char chunks preserving charStart/charEnd; flagged-overlap propagates injection findings onto chunks. The companion embed.ts prepends a 'docName › section' breadcrumb to the chunk body before embedding (queries embed raw) to keep near-identical boilerplate across documents separable — a concrete chunking recipe for beep's span-grounded ingestion.

- **Source:** `services/ingest/src/ingest.ts:20-49`
- **beep-target:** @beep/md + @beep/langextract chunking with char-span offsets; section breadcrumb embedding

```
export function sectionize(text: string): Section[] {
  ...
  const clause = trimmed.match(CLAUSE_RE)
  const isHeading = clause || isMdHeading || (trimmed.length > 0 && HEADING_RE.test(trimmed))
  ...
  const label = clause?.[1] ?? trimmed
  current = { label, text: line + "\n", charStart: offset, charEnd: 0 }
```

### 12. Retrieval-grounded legal agent prompt with per-agent tool allowlist and 'handoff not workaround' boundaries
`agent-memory` · relevance: **adjacent** · verified

The Q&A agent definition shows a reusable legal prompt-engineering pattern: a strict per-agent tool allowlist ('*': false then explicit enables), mandatory grounding (search before answering, never from general knowledge), a preference for deterministic exact-lookup tools (define/get-section/matter-parties/amendment-chain/grep-matter) that 'hit or say not found', mandatory cite-before-quote with confidence, and explicit capability boundaries that are handoffs rather than improvised workarounds. Directly informs beep's Agent/Skill prompts and the retrieval-vs-logic discipline.

- **Source:** `dochaus/agent/qa.md:65-93`
- **beep-target:** @beep/agents Skill prompt templates; NLP-tool gating that enforces retrieval→logic separation

```
<retrieval>
- Always ground answers in the matter's documents. Call `search-document` ... never answer contract questions from general knowledge alone.
- Prefer the exact-lookup tools when the question names something the index tracks — they return verbatim document text and either hit or say "not found", never a near-miss
</retrieval>
```

### 13. OOXML redaction scrub with audit log and residue verification
`governance-ops` · relevance: **serendipitous** · verified

Redaction support that (1) records a per-matter audit log row (redacted_text, label, reason, author, occurrence counts) — the work product alongside a redacted doc — and (2) scrubs the needle from every XML part of the DOCX package across all serialization escape variants (text-node AND attribute encodings, plus w:author/w:initials identity attributes), then a residue check confirms nothing remains and reports binary parts (images/embeddings) it cannot reach rather than claiming clean. Useful for beep's provenance-preserving redaction/PII handling and defensible audit trails.

- **Source:** `dochaus/lib/redactions.ts:86-128`
- **beep-target:** @beep/provenance redaction audit log; desktop-portal DOCX export with defensible scrubbing

```
function xmlVariants(text: string) {
  const textNode = text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  const attribute = textNode.replaceAll('"', "&quot;").replaceAll("'", "&apos;")
  return [...new Set([textNode, attribute])]
}
```

### 14. CourtListener case-law client (DUPLICATE of beep skeleton — recorded with caveat)
`data-ingestion` · relevance: **adjacent** · verified

A read-only tool hitting CourtListener's REST search API for citable opinions, with optional COURTLISTENER_API_TOKEN Authorization header and 'never cite a case this tool did not return' framing; note dochaus also wires the official CourtListener remote MCP server in opencode.json. beep ALREADY has a CourtListener driver skeleton, so this largely duplicates it — but the result-shaping (caseName/citation/court/citeCount/snippet) and the unauthenticated-vs-token rate-limit pattern, plus the choice to use the remote MCP rather than a hand-rolled client, are worth comparing against beep's driver.

- **Source:** `dochaus/tool/case-law.ts:45-58`
- **beep-target:** existing @beep CourtListener driver (compare auth + result shape; consider remote MCP option)

```
const params = new URLSearchParams({ q: args.query, type: "o", order_by: "score desc" })
if (args.court) params.set("court", args.court)
const token = process.env.COURTLISTENER_API_TOKEN
const res = await fetch(`${SEARCH_URL}?${params}`, {
  headers: token ? { Authorization: `Token ${token}` } : {},
})
```
