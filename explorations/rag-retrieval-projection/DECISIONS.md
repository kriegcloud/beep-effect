# RAG Retrieval Projection Layer — Decisions

<!--
Stage 2 (ALIGN) seed. These are pre-drafted branch-closing questions with a
RECOMMENDED answer and grounded rationale — NOT resolutions. The user resolves
them one at a time via `/grill-with-docs rag-retrieval-projection`, which
rewrites each `**Status:** open` entry into a dated resolution (Question /
Answer / Rationale) and syncs `ops/manifest.json` `openQuestions`.

Source of truth for the grounding below: RESEARCH.md (this packet) and its
raw threads under research/. Citations point at the synthesis claims there.
-->

## Q1: Build vs buy — does beep own the RRF fusion service in-repo, or delegate fusion to pgvector / a vector DB's built-in hybrid ranker?

**Recommended:** Build and own the fusion in-repo. beep authors the 3-channel
weighted-RRF combiner (k=60), the empty-channel weight renormalization, and the
literal-match floor; pgvector/PGlite is used only as a per-channel candidate
source (cosine top-k, lexical top-k, literal-phrase top-k), never as the fuser.

**Rationale:** The single most load-bearing reason in RESEARCH to own the fusion
rather than delegate is the **literal-match floor** — "pure RRF does *not*
guarantee an exact lexical hit outranks fuzzy consensus" (softwaredoug,
secondary.ai), and off-the-shelf vector-DB RRF cannot express beep's invariant
that an exact literal-phrase hit must not be outscored by fuzzy consensus
(RESEARCH "Locked decisions": literal floor is a hard guarantee, needs a
dedicated literal-phrase channel **plus a hard tie-break**, not weight alone).
Two further beep-specific policies are externally unspecified and therefore must
live in beep code: **whole-empty-channel weight renormalization** (no surveyed
vendor implements it; OpenSearch explicitly leaves it unimplemented) and the
weighted-RRF contribution `weight × 1/(rank + k)`. The RRF formula itself is a
published method (Cormack et al., SIGIR 2009) with no copyright, so
reimplementation is clean. Owning the fuser also keeps the cold-start behavior
(channels empty before vectors/graph are populated) correct on day one, which is
exactly the local-first case beep ships first. This fork is *near-locked* by
RESEARCH but is restated here so /grill-with-docs can ratify the empty-channel
renormalization policy explicitly rather than leave it implicit.

**Status:** open (for /grill-with-docs)

## Q2: First slice — what is the thin V1 vertical that graduates into a `goals/` packet first?

**Recommended:** The **read-path vertical**: the `vector(768)` + `vector_cosine_ops`
HNSW projection (pgvector wired into `@beep/pglite`) + the offset-preserving
char-span chunker + the 3-channel weighted-RRF service with the literal floor,
proven end-to-end over a **hand-seeded / small fixture corpus**. Defer the full
bounded-concurrency ingestion orchestration, MinHash/LSH dedup, and
citation-graph BFS to follow-on slices (see Q3).

**Rationale:** The packet has six net-new pieces (RESEARCH "Genuine gaps":
pgvector schema, RRF fusion, local embedding pipeline, char-span chunker, dedup,
generated-`tsvector` channel) plus two satellites (dedup, BFS). Shipping all of
them in one goal blows the appetite. The retrieval contract is the packet's
*reason to exist* — it is the one service the consumers (`agent-memory-tiers-
bitemporal-edges`, `goals/trustgraph-port`) inject — so proving
embed → project → fuse → rank with provenance spans is the highest-leverage
thin vertical and de-risks the two unverified substrate claims (HNSW build
memory under WASM; opclass/operator agreement) early against a small corpus.
Ingestion-at-scale, dedup, and BFS are throughput/quality refinements layered on
a working read path, not prerequisites for it. This is the highest-leverage open
fork and bounds everything downstream (appetite, decomposition, what the first
goal's definition-of-ready asserts).

**Status:** open (for /grill-with-docs)

## Q3: Scope boundary — do MinHash/LSH evidence-cluster dedup and citation-graph BFS live inside this packet's first graduating goal, or split into separate follow-on goal slices?

**Recommended:** Keep both **owned by this packet's research/design**, but split
them into **separate follow-on goal slices**, out of the first graduating goal.
Dedup graduates as its own slice (it carries a clean-room obligation); BFS
graduates as a graph-projection slice gated on the optional graph channel.

**Rationale:** Both are explicitly "feed the same retrieval/projection tier"
(CAPTURE netNew), but neither is on the critical path of the read-path vertical
(Q2). Dedup "sits *before* the candidate→approved ClaimGate, not on a
retrieval-feeds-LLM path" (RESEARCH), so it is a pre-gate ranking refinement, not
a retrieval primitive. It also carries a **clean-room hazard** — courtlistener's
clustering *policy* is AGPL-3.0 and "there is no separate non-AGPL courtlistener
spec"; the policy must be independently authored (math is clean from MIT
`datasketch`). That authoring cost is real and should not be smuggled into the
first slice. Citation-graph BFS depends on the optional graph channel /
`@beep/semantic-web` projection and must source edges from USPTO ODP
(`api.uspto.gov`), never the sunset PatentsView API (410 Gone since 2025-05-01) —
a separable concern with its own driver surface. Splitting keeps the first goal's
appetite honest while preserving single-owner provenance for both satellites.

**Status:** open (for /grill-with-docs)

## Q4: Lexical channel — ship the generated-`tsvector` + GIN path (`ts_rank_cd`), or the external `pg_textsearch` BM25 extension?

**Recommended:** Ship the **generated `tsvector` STORED column + GIN index**
(ranked by `ts_rank_cd`) as the default lexical channel. Treat true `pg_textsearch`
BM25 as an **opt-in upgrade gated on a PGlite-WASM load/stability spike**, behind
a stable channel interface so it can swap in without touching the fuser.

**Rationale:** RESEARCH flags `pg_textsearch` BM25 load/stability inside the
shipped PGlite WASM build as **UNVERIFIED**, and recommends generated-`tsvector` +
GIN as the safe fallback (self-syncing via a STORED generated column, no triggers,
Postgres `textsearch-tables` precedent). The hard caveat: `ts_rank_cd` is
**cover-density ranking, NOT BM25** — so downstream tests must not assert BM25
semantics against the fallback. Because the fuser consumes *ranks*, not raw
scores (RRF is rank-based and normalization-free), the lexical channel's internal
scorer is an implementation detail the fuser is insulated from — which is exactly
why a clean channel interface lets BM25 land later without reworking fusion. This
keeps the first slice on verified substrate while reserving the BM25 quality win
for when the WASM build is proven.

**Status:** open (for /grill-with-docs)

## Q5: Vendor / license — which embedding model is the default, and is the projection column locked to `vector(768)` regardless?

**Recommended:** Lock the projection column to **`vector(768)` + `vector_cosine_ops`**
(provider-neutral) unconditionally. Default the encoder to **EmbeddingGemma-300m
(ONNX, 768 native)** *subject to a one-time Gemma-Terms-of-Use acceptance for the
firm's commercial use*; if that license gate is unacceptable, fall back to
**`nomic-embed-text-v1.5` (Apache-2.0)** or **`bge-base-en-v1.5` (MIT)**, both
768-dim ONNX. Do **not** pin Gemini.

**Rationale:** 768 is "the convergent interop dimension" — EmbeddingGemma-300m,
bge-base, gte-base, nomic-embed-text-v1.5 are all natively 768, it fits the HNSW
≤2000-dim cap with margin, and a future Gemini provider can drop into the same
column via `output_dimensionality=768`. Locking the *column* (not the model)
realizes the "vectors are a rebuildable projection, not authority" decision: a
model swap is a re-embed-from-source + rebuild-index, never a schema migration.
On the model: EmbeddingGemma-300m has the best quality/runnability fit (Gemma-3
lineage, MTEB-English-v2 ≈ 69.67, q8/q4 WASM ONNX variants), but RESEARCH is
explicit that it ships under the **Gemma Terms of Use (gated), NOT Apache** —
"confirm before adopting as default" — and the privilege-safety wall means the
encoder must run in-process with no API round-trip and no secret. Gemini is
ruled out on deprecation grounds: the only GA-stable hosted line
(`gemini-embedding-001`) shuts down 2026-07-14 (~2 weeks out) and `gemini-embedding-2`
is Public Preview on `v1beta`, not GA — every forced swap costs a full corpus
re-embed. InLegalBERT is a wiring reference only (masked-LM, wrong jurisdiction).

**Status:** open (for /grill-with-docs)

## Q6: Vendor / runtime — does the embedding encoder run as webview-WASM (transformers.js / onnxruntime-web), or as a Rust-side ONNX sidecar (`ort` / Candle)?

**Recommended:** **WASM-first** (onnxruntime-web, q8) as the default runtime, with
the **Rust `ort` sidecar gated behind a measured perf spike** on the user's Linux
box. Keep the encoder behind a service interface so the runtime can swap without
touching the chunker or projection.

**Rationale:** RESEARCH calls this an explicit "unmeasured align-stage fork." The
decisive constraint is that **WebGPU is NOT available in WebKitGTK** (the Linux
Tauri webview), so on the user's box the only webview path is WASM, where "a 300M
model is the realistic ceiling" — which EmbeddingGemma-300m sits right at. WASM-
first wins on portability (works in every webview, no second process, no IPC) and
is sufficient for the small-corpus first slice (Q2). The Rust sidecar "sidesteps
both the WASM ceiling and the WebGPU gap" and is the right escape hatch *if and
only if* a measured ingest throughput spike on a real corpus shows WASM is the
bottleneck — so the decision should be data-gated, not made blind at align time.
Holding the encoder behind an interface keeps that swap cheap.

**Status:** open (for /grill-with-docs)

## Q7: Package placement — where do the net-new pieces live in the repo topology?

**Recommended:** Land the **compute** as a new foundation capability
`@beep/retrieval` at `packages/foundation/capability/retrieval` (the
offset-preserving char-span chunker, the local embedding encoder, and the
weighted-RRF fusion service). Land the **persistence** in the epistemic slice:
the `vector(768)` HNSW projection schema + thresholded top-k query in
`@beep/epistemic-tables`, with the pgvector extension wired into the
`@beep/pglite` driver. The generated-`tsvector` lexical channel co-locates with
the projection schema in `@beep/epistemic-tables`.

**Rationale:** The repo's foundation capabilities (`packages/foundation/capability/`:
file-processing, langextract, nlp, semantic-web, observability) are the
established home for net-new compute that composes over drivers — a new
`@beep/retrieval` capability matches that pattern and is the single injectable
service the consumers want. The chunker is confirmed as **this packet's**
ownership (RESEARCH "Routing cautions": `goals/langextract-capability` SPEC
non-goals decline standalone `chunk`/`window` primitives), and it sits *between*
`@beep/md` and `@beep/langextract`, so a capability package upstream of
langextract is the correct seam — only the UTF-16 offset contract is shared. The
pgvector projection is persistence and is a *derived projection of the
Claim/Evidence spine the epistemic slice already owns* (`@beep/epistemic-domain`/
`-tables`/`-server`/`-use-cases`), so the `vector(768)` schema + HNSW index belong
in `@beep/epistemic-tables`, and enabling the extension belongs in the
`@beep/pglite` driver (currently the vector extension is "NOT yet wired" — the
named gap). This split keeps the rebuildable-projection-over-authority boundary
aligned to the existing slice boundary instead of inventing a new vertical slice.

**Status:** open (for /grill-with-docs)
