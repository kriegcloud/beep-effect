# Capture

<!--
Stage 0. Append-only raw dump: thoughts, links, screenshots (drop files in
assets/ and reference them), half-sentences, contradictions. Nobody tidies
this file; cleaning it up destroys provenance. New material goes under a new
dated heading at the bottom.
-->

## 2026-06-29 — Gold-intake seed

Seeded from the gold-intake pass. Full synthesis prose for these nuggets lives
in
[`explorations/_gold-intake/GOLD_SYNTHESIS.md`](../_gold-intake/GOLD_SYNTHESIS.md)
— see the sections **"Hybrid BM25 + dense-vector retrieval & pgvector HNSW
projection"** (L353-365), **"Triple-stream hybrid retrieval (BM25 + vector +
graph) fused via RRF"** (L383-395), **"Hybrid retrieval with RRF fusion +
char-span citations"** (L576-585), and **"Clause-aware sectionizer + char-offset
chunker with breadcrumb embeddings"** (L231-235), plus the gap-map row
**"FalkorDB graph projection + GraphRAG RRF fusion + citation-graph BFS —
PLANNED, not built"** (L78).

**Cluster:** RAG ingestion + char-span chunking
**Route:** mixed · **primaryTarget:** `rag-retrieval-projection` (targetExists:
false → this new packet) · **wave:** P3 (histogram P1:3 / P2:5 / P3:6) ·
**themeSpan:** data-ingestion, effect-ts, kg-ontology-reasoning, legal-nlp,
mcp-design, provenance-evidence · **secondaryTargets:**
`goals/langextract-capability`, `goals/ip-law-knowledge-graph`,
`packages/foundation/capability/semantic-web`,
`packages/foundation/capability/langextract`.

**Rationale (from routing.json):** All three named candidates are the wrong
home: `goals/file-processing-capability` is extraction-only and explicitly lists
"knowledge-graph extraction or assembly" and OCR out of scope;
`goals/oppold-corpus-pipeline` is completed-retained salvage/catalog/extract and
explicitly excludes embeddings, LLM processing, and KG/epistemic ingestion;
`explorations/solo-firm-docketing` is PACER/docketing, unrelated. The repo's own
GOLD_SYNTHESIS.md (L231-235, L353-355, L383-386) routes these exact nuggets to a
planned-but-unbuilt FalkorDB/GraphRAG retrieval projection over
`@beep/semantic-web` plus a char-span chunker between `@beep/md` and the active
`goals/langextract-capability` (currently P4 Implement); the
retrieval/RRF/pgvector/bounded-concurrency-ingestion projection layer has no
execution packet, so it needs a new exploration while the chunker piece attaches
to langextract. This packet is the **DESIGNATED single owner** of the hybrid
3-channel RRF retrieval layer (k=60) + pgvector HNSW projection;
`agent-memory-tiers-bitemporal-edges` and `goals/trustgraph-port` CONSUME it,
they do not rebuild it.

### Nuggets (14)

- **agentmemory#1** (agentmemory) — Triple-stream hybrid retrieval (BM25 +
  vector + graph) fused via Reciprocal Rank Fusion. `src/state/hybrid-search.ts:194-219`.
  → feeds netNew #1 (the owned hybrid 3-channel RRF retrieval fusion, k=60); the
  graceful weight renormalization when a stream is empty is exactly the
  local-first behavior needed before vector/graph projections are populated.
  P1 · port. Snippet: `combinedScore = effectiveBm25W*(1/(RRF_K+bm25Rank)) + effectiveVectorW*(1/(RRF_K+vectorRank)) + effectiveGraphW*(1/(RRF_K+graphRank))` with `totalW` renormalization when `hasVector`/`hasGraph` are false.
- **doc-haus#1** (doc-haus) — Hybrid retrieval with RRF fusion + char-span
  citations + auto-attached definitions/cross-refs. `dochaus/tool/search-document.ts:42-121`.
  → feeds netNew #1 (3-channel RRF: embedding cosine + FTS5/BM25 + whole-query
  literal-phrase channel; returns doc/section/charStart/charEnd; carries the
  "a literal hit must not be outscored by fuzzy hits" insight). P1 · study.
  Snippet: `const CANDIDATES = 20`, `const RRF_K = 60`.
- **LegalEase#5** (LegalEase) — Hybrid BM25 + dense-vector retrieval with
  weighted score fusion. `backend/services/hybrid_search.py:44-58`. → feeds
  netNew #1 (alpha-weighted BM25+dense fusion as the alternative to pure
  rank-fusion; where keyword precision on statute/section/claim terms must
  combine with semantic recall). P3 · study. Snippet: `final_scores = (alpha*bm25_score) + ((1-alpha)*dense_score)`, `alpha = 0.5`.
- **lawyergpt#3** (lawyergpt) — pgvector HNSW cosine-similarity schema +
  thresholded top-k retrieval (Drizzle). `frontend/src/lib/db/schema/embeddings.ts:5-20`.
  → feeds netNew #2 (pgvector HNSW `vector_cosine_ops` projection schema +
  thresholded top-k cosine; beep keeps vectors as rebuildable projection, not
  authority, and attaches provenance spans to each returned chunk). P3 · study.
  Snippet: `vector("embedding",{dimensions:768}).notNull()` + `index("hnsw", table.embedding.op("vector_cosine_ops"))`; retrieval `1 - cosineDistance`, `gt(similarity,0.25)`, limit 8.
- **doc-haus#11** (doc-haus) — Clause-aware sectionizer + char-offset chunker
  with breadcrumb-prefixed embeddings. `services/ingest/src/ingest.ts:20-49`.
  → feeds netNew #5 (offset-preserving char-span chunker) + netNew #3
  (breadcrumb-prefixed embedding: prepend `docName › section` to chunk body
  before embedding while queries embed raw, to keep boilerplate separable). P2 ·
  port. Snippet: `sectionize()` accumulates exact char offsets by
  clause-number/markdown/all-caps heading; `chunkSection()` slices ~2000-char
  chunks preserving `charStart/charEnd`.
- **doc-haus#6** (doc-haus) — Per-matter local index schema: char-span chunks +
  structure tables + FTS5 external-content + redline queue. `services/ingest/src/db.ts:27-161`.
  → feeds netNew #2 (projection schema shape: char_start/char_end + embedding
  BLOB + adversarial `flagged` bit; deterministic structure tables with offsets;
  FTS5 external-content kept in sync by triggers; `meta` embedding-model version
  guard — maps to PGlite authority + provenance columns vs FalkorDB-as-projection
  split). P2 · study. Snippet: `CREATE TABLE chunks (... char_start INTEGER NOT NULL, char_end INTEGER NOT NULL, embedding BLOB NOT NULL, flagged INTEGER NOT NULL DEFAULT 0)`.
- **lawyergpt#2** (lawyergpt) — Bounded-concurrency async ingestion with
  semaphore + per-file transaction. `api/main.go:176-298`. → feeds netNew #4
  (bounded-concurrency ingestion workflow re-expressed as Effect
  `Stream.mapEffect` with bounded parallelism + per-chunk transactional
  persistence; returns 202 immediately then processes in a pool). P2 · study.
  Snippet: `numSemaphore := int(math.Ceil(float64(len(files)) / 2.0))`, `sem.acquire()` / `defer sem.release()` per goroutine; each chunk resource+embedding insert in its own DB transaction.
- **lawyergpt#6** (lawyergpt) — Rune-aware fixed-size text chunker. `api/pkg/main.go:21-35`.
  → feeds netNew #5 as a baseline only (correct multibyte handling but no offset
  tracking; beep's span-grounded extraction needs char/byte offsets added). P3 ·
  skip. Snippet: `runes := []rune(text)` then fixed-size slice (7500 chars for
  files, 4000 for scraped text).
- **Juris.AI#4** (Juris.AI) — In-browser legal embeddings via InLegalBERT
  (transformers.js, local-first). `src/app/legal-bert/model.ts:12-39`. → feeds
  netNew #2/#3 as the provider-neutral local embedding source (domain-specific
  legal embeddings, zero server round-trip, runnable in Tauri's webview — the
  local-first alternative to pinning Gemini; the column dimension + HNSW index
  must match whatever model is chosen). Caveat: `calculateLegalRelevanceScore` is
  a `Math.random` stub — only the embedding-pipeline wiring is gold. P3 · study.
  Snippet: `pipeline("feature-extraction","law-ai/InLegalBERT")` then `model(text,{pooling:"mean",normalize:true})`.
- **agentmemory#12** (agentmemory) — Scale-driven graph index design: name-index,
  edge-key, node-degree side indexes to avoid O(n) scans. `src/state/schema.ts:24-39`.
  → feeds netNew #2 (projection-side index design so graph-extract never
  enumerates a 75K+ node scope; targeted lookup indexes + precomputed top-degree
  snapshot keep the FalkorDB/PGlite projection performant locally). P2 · study.
  Snippet: `graphNameIndex` (`type|name`→nodeId), `graphEdgeKey`
  (`src|tgt|type`→edgeId), `graphNodeDegree` (nodeId→incident count), `graphSnapshot` top-degree subgraph.
- **courtlistener#10** (courtlistener) — MinHash/LSH clustering of near-duplicate
  holding summaries (parentheticals). `cl/citations/group_parentheticals.py:39-59`.
  → feeds the net-new dedup/evidence-cluster-ranking step (collapse repetitive
  candidate holdings/prior-art assertions before the human gate; rank
  most-described ideas higher). **AGPL-3.0 → reimplement the dedup from spec, do
  NOT copy source.** P2 · port. Snippet: `datasketch` MinHash + MinHashLSH,
  `num_perm=64`, `SIMILARITY_THRESHOLD = 0.5`, deepcopy of a pre-seeded empty LSH to avoid re-paying RNG seeding.
- **uspto-patents-mcp#2** (uspto-patents-mcp) — Bounded BFS over the patent
  citation graph (forward/backward/both). `src/patentsview.ts:89-149`. → seeds
  the graph-projection traversal that lands in FalkorDB as a Cypher projection
  (depth-capped BFS with per-level frontier ceiling; explicit `{from,to}` edge
  list maps cleanly onto the projection layer). P1 · port. Snippet: `for (d<depth && frontier.length>0)` with `frontier.slice(0,50)` CPU-budget ceiling, depth cap 2, `edges.push({from:cur,to:c.patent_id})`.
- **research-squad#9** (research-squad) — Source-authority inference from URL
  (primary-source taxonomy). `src/services/MultiAgentOrchestratorService.ts:962-981`.
  → feeds a retrieval-ranking input (weight .gov/court/uspto/.edu/arxiv domains
  as primary authority when ranking citations/prior-art; extend with
  legal-specific domains). P3 · adopt. Snippet: `inferSourceType()` →
  github=code_repository, arxiv/.edu=academic, .gov=government; `isPrimarySource()` = .gov || .edu || arxiv.org || sec.gov.
- **lawyergpt#4** (lawyergpt) — Vercel AI SDK tool-calling RAG route (the
  un-gated pattern beep rejects). `frontend/src/app/api/chat/[id]/route.ts:50-58`.
  → **NEGATIVE reference / explicit anti-pattern**: records the
  RETRIEVAL-feeds-LLM-directly design beep's hard wall forbids (raw chunks to
  LLM, no span provenance, no candidate→approved gate). Re-implement under
  `@effect-rpc` with provenance-carrying outputs (CandidateClaim+Evidence spans
  through the ClaimGate, not bare chunks). P3 · reference. Snippet: `getInformation: tool({ ..., execute: async ({question}) => findRelevantContent(question) })`, `maxSteps:3`.

### netNew (build list)

1. Hybrid 3-channel RRF retrieval fusion (embedding cosine + FTS/BM25 +
   literal-phrase) with char-span citations — the GraphRAG retrieval service is
   PLANNED, not built. **This packet is the designated single owner; k=60.**
2. pgvector HNSW `vector_cosine_ops` projection schema + thresholded top-k cosine
   retrieval (vectors as rebuildable projection, not authority).
3. Breadcrumb-prefixed embedding strategy (`docName › section` prefix to keep
   boilerplate separable).
4. Bounded-concurrency ingestion workflow (semaphore + per-file/per-chunk
   transaction) re-expressed as Effect `Stream.mapEffect` with bounded
   parallelism.
5. Offset-preserving char-span chunker (~2000-char chunks carrying
   charStart/charEnd) sitting between `@beep/md` and `@beep/langextract`.

(Plus the net-new evidence-cluster dedup via AGPL-clean MinHash/LSH
reimplementation, and the citation-graph BFS projection traversal — both feed
the same retrieval/projection tier.)

### alreadyCovered (reuse, do not rebuild)

- Span-grounded extraction substrate with char offsets and fuzzy alignment —
  `@beep/langextract` GroundedExtraction/AlignmentStatus already exists.
- Char-span provenance contract — `@beep/provenance` TextAnchor
  (`text.slice(start,end) === quote`).
- PDF/DOCX text extraction + OCR-capable ingestion plumbing —
  `@beep/file-processing` + `@beep/tika` P1 vertical already merged (PR #262).
- Local corpus extraction/cataloging — `goals/oppold-corpus-pipeline` completed.

### Cautions

- **lawyergpt license is UNKNOWN** — reimplement patterns, do not copy source.
  lawyergpt pins Gemini embeddings: `embedding-001`/`embedding-gecko-001`/
  `gemini-embedding-exp-03-07` shut down Oct 2025 and `text-embedding-004` shut
  down Jan 14 2026; current GA is `gemini-embedding-001` (3072-dim default,
  Matryoshka-truncatable) so any pgvector column dimension + HNSW index must
  match chosen `output_dimensionality`. beep is provider-neutral/local-first
  (PGlite+Drizzle, local ONNX embeddings) so do NOT pin Gemini and keep vectors
  as projection, not authority. doc-haus is MIT (safe to study/adapt).
  lawyergpt's un-gated tool-calling RAG (raw chunks to LLM, "use your own
  knowledge") is an explicit ANTI-PATTERN beep rejects — outputs must carry
  CandidateClaim+Evidence provenance spans through the ClaimGate, not bare
  chunks.
- **License: courtlistener#10** (MinHash/LSH near-dup clustering, rec=port) is
  AGPL-3.0 → reimplement the dedup from spec, do not copy AGPL source.
- **RRF retrieval fusion:** this packet is the DESIGNATED single owner of the
  hybrid 3-channel RRF retrieval layer; `agent-memory-tiers-bitemporal-edges`
  and `goals/trustgraph-port` must consume it, not rebuild it.

<dump>
