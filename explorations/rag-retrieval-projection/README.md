# RAG Retrieval Projection Layer

## Status

Stage: `research`
Status: `active`

Source: [`ops/manifest.json`](./ops/manifest.json)

## Spark

Stand up the hybrid 3-channel Reciprocal-Rank-Fusion retrieval layer (k=60:
embedding cosine + FTS/BM25 + literal-phrase) over a rebuildable pgvector HNSW
projection, plus the bounded-concurrency, offset-preserving char-span
ingest/chunker that feeds it between `@beep/md` and `@beep/langextract`. This
packet is the single designated owner of that retrieval/projection tier;
`agent-memory-tiers-bitemporal-edges` and `goals/trustgraph-port` consume it
rather than rebuild it.

## Sources & provenance

Every design decision traces back to its mined gold nugget, upstream repo + license, external
citation, and in-repo capability in [`research/SOURCES.md`](./research/SOURCES.md) — the
provenance ledger for the gold-intake cluster **"RAG ingestion + char-span chunking"** (14
nuggets). Read it before implementing: it carries the AGPL clean-room boundary (courtlistener),
the unknown-license reimplement rule (lawyergpt), and the RRF single-owner mandate.

## Next Open Question

**Q2: First slice — what is the thin V1 vertical that graduates into a `goals/`
packet first?** This is the highest-leverage align fork: it bounds appetite,
decomposition, and what the first goal's definition-of-ready asserts (read-path
vertical vs. shipping all six net-new pieces at once). DECISIONS.md pre-drafts a
recommended answer plus six sibling forks (build-vs-buy, scope boundary,
vendor/auth ×2, package placement). Resolve them with
`/grill-with-docs rag-retrieval-projection`.

## Read This First

1. [`ops/manifest.json`](./ops/manifest.json) - machine state: stage, status, open questions.
2. [`CAPTURE.md`](./CAPTURE.md) - raw dump (stage 0).
3. [`RESEARCH.md`](./RESEARCH.md) - prior art + capability inventory (stage 1, if present).
4. [`DECISIONS.md`](./DECISIONS.md) - grilling log (stage 2, if present).
5. [`BRIEF.md`](./BRIEF.md) - shaped pitch (stage 3, if present).
6. [`MAP.md`](./MAP.md) - decomposition (stage 4, if present).

## Trail

- 2026-06-29: research-complete — RESEARCH.md synthesized, codex gate-1 folded, DECISIONS pre-drafted.
- 2026-06-29: packet opened from gold-intake cluster 'RAG ingestion + char-span chunking' (14 nuggets).
