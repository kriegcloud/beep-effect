# pgvector HNSW projection under PGlite+Drizzle

Scope: rebuildable vector-projection schema — HNSW `vector_cosine_ops` tuning, column-dimension/model coupling, thresholded top-k, FTS keep-in-sync (FTS5→Postgres), scale-driven side indexes, and the embedding-model version guard + projection-rebuild strategy (vectors as projection, never authority).

## Findings

### HNSW index: parameters, defaults, syntax (PRIMARY: pgvector README)

- HNSW has two build-time params and one query-time param. Defaults from the source README: `m` = "max number of connections per layer (16 by default)"; `ef_construction` = "size of the dynamic candidate list for constructing the graph (64 by default)"; `hnsw.ef_search` = "size of the dynamic candidate list for search (40 by default)". Index syntax: `CREATE INDEX ON items USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);` — https://github.com/pgvector/pgvector/blob/master/README.md
- Cosine distance operator is `<=>`; ANN query shape is `ORDER BY embedding <=> '[3,1,2]' LIMIT k`. `ef_search` is set globally `SET hnsw.ef_search = 100;` or per-transaction `SET LOCAL hnsw.ef_search = 100;` — https://github.com/pgvector/pgvector/blob/master/README.md
- Tuning trade-off: higher `m`/`ef_construction` improve recall at the cost of index size and build time; higher `ef_search` improves recall at the cost of query latency. Community default for ~1536-dim embeddings is `m=16`, with `ef_construction` 128–200 as a production starting point; raise `ef_search` before raising `m` to fix recall. Reasonable `m` range 5–48 — https://www.paradedb.com/learn/postgresql/tuning-pgvector , https://neon.com/blog/understanding-vector-search-and-hnsw-index-with-pgvector
- Build HNSW *after* loading initial data ("it's faster to create an index after loading your initial data") — matches the projection-rebuild model where you bulk-load vectors then index — https://github.com/pgvector/pgvector/blob/master/README.md

### GOTCHA: `ef_search` must be ≥ k, and over-filtering can silently return too few rows

- `hnsw.ef_search` should be ≥ the `LIMIT k` you want returned; the index fetches `ef_search` candidates, then Postgres applies the `WHERE` clause, so a selective filter can drop you below `LIMIT` (or to empty) with no error. pgvector 0.8.0 added iterative index scans (`SET hnsw.iterative_scan = strict_order;` or `relaxed_order;`) to auto-expand the search and prevent over-filtering — https://neon.com/docs/ai/ai-vector-search-optimization , https://github.com/pgvector/pgvector/blob/master/README.md , https://www.postgresql.org/about/news/pgvector-080-released-2952/
- For the CAPTURE thresholded pattern (`limit 8`, `gt(similarity, 0.25)`), set `ef_search ≥ 8` (in practice much higher, e.g. 40–100) so the post-filter threshold has candidates to keep.

### GOTCHA: opclass/operator mismatch silently degrades to a sequential scan

- The HNSW index only accelerates the operator matching its opclass. An index built `vector_cosine_ops` but queried with `<->` (L2) or `<#>` (ip) falls back to a full seq scan "with no warning" — a 5 ms indexed lookup becomes a ~30 s scan on 1M rows. Diagnose with `EXPLAIN` (look for `Index Scan` vs `Seq Scan`). For Drizzle this means the column op (`vector_cosine_ops`) and the query helper (`cosineDistance`, i.e. `<=>`) MUST agree — https://www.paradedb.com/learn/postgresql/tuning-pgvector , https://dev.to/philip_mcclarence_2ef9475/pgvector-distance-functions-cosine-vs-l2-vs-inner-product-57pd

### CRITICAL: HNSW indexed-dimension caps vs. embedding-model dimension

- Per-type indexable dimension limits (from README): `vector` stores up to 16,000 dims but HNSW/IVFFlat index only up to **2,000**; `halfvec` stores up to 16,000, indexes up to **4,000**; `bit` indexes up to 64,000; `sparsevec` indexes up to **1,000 non-zero** elements — https://github.com/pgvector/pgvector/blob/master/README.md
- To index >2000 dims, cast to half-precision: `CREATE INDEX ON items USING hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops);` with matching query cast `embedding::halfvec(3072) <=> '[...]'`. Opclasses: `halfvec_cosine_ops` / `halfvec_l2_ops` / `halfvec_ip_ops` / `halfvec_l1_ops` — https://github.com/pgvector/pgvector/blob/master/README.md
- Consequence for model choice: `gemini-embedding-001` defaults to **3072** dims, which EXCEEDS the 2000 cap for a plain `vector` HNSW index — you must either truncate via Matryoshka (`output_dimensionality` 768/1536, both ≤2000) or index as `halfvec(3072)`. The CAPTURE local-first picks (InLegalBERT, 768 dims; lawyergpt#3 schema `vector("embedding",{dimensions:768})`) sit safely under 2000 and need no halfvec trick — https://ai.google.dev/gemini-api/docs/embeddings , https://github.com/pgvector/pgvector/blob/master/README.md
- Matryoshka caveat: with `gemini-embedding-001`, only the full 3072-dim output is pre-normalized; any truncated dimensionality must be **manually L2-normalized** before storage so cosine distance is meaningful (gemini-embedding-2 auto-normalizes truncated output, -001 does not) — https://ai.google.dev/gemini-api/docs/embeddings , https://tokenmix.ai/blog/gemini-embedding-001-dimensions-pricing-guide-2026

### Thresholded top-k (1 − cosineDistance) in Drizzle (PRIMARY: Drizzle docs)

- Schema: `embedding: vector('embedding', { dimensions: 1536 })` + `index('embeddingIndex').using('hnsw', table.embedding.op('vector_cosine_ops'))` — https://orm.drizzle.team/docs/guides/vector-similarity-search
- Query: `const similarity = sql<number>\`1 - (${cosineDistance(guides.embedding, embedding)})\`;` then `.where(gt(similarity, 0.5)).orderBy(t => desc(t.similarity)).limit(4)`. Drizzle ships distance helpers `cosineDistance`, `l2Distance`, `l1Distance`, `innerProduct`, `hammingDistance`, `jaccardDistance` — https://orm.drizzle.team/docs/guides/vector-similarity-search , https://orm.drizzle.team/docs/extensions/pg
- `1 - cosineDistance` yields cosine *similarity* (cosine distance is in [0,2]; similarity in [−1,1]). The CAPTURE `gt(similarity, 0.25)` cutoff is a calibrated, corpus/model-dependent constant, not a universal — different from the Drizzle-doc `0.5`. Treat the threshold as a tunable per embedding model, not a magic number — https://orm.drizzle.team/docs/guides/vector-similarity-search
- Drizzle-docs caveat: the guide's similarity expression historically did not always hit the HNSW index because ordering by `1 - distance DESC` is not directly the indexed `distance ASC` ordering — verify with `EXPLAIN` that the plan is an Index Scan, and order by raw distance ASC if needed — https://github.com/drizzle-team/drizzle-orm-docs/issues/436

### PGlite specifics: PG17 base, pgvector as external package, FTS options (PRIMARY: pglite.dev)

- PGlite is "Postgres in WASM" (no Linux VM), under ~3 MB gzipped, runs in browser/Node/Bun; the fork is based on **PostgreSQL 17** — https://pglite.dev/docs/about , https://github.com/electric-sql/postgres-pglite
- pgvector ("vector") is an **external** extension package, ~42.9 KB, not core-bundled; enable with `CREATE EXTENSION IF NOT EXISTS vector;` after registering it in the PGlite `extensions` map. The current docs reference the separate npm package `@electric-sql/pglite-pgvector` (older builds exposed it at `@electric-sql/pglite/vector` — pin the import to the installed PGlite version) — https://pglite.dev/extensions/ . UNVERIFIED: the exact bundled pgvector version number is not stated in PGlite docs (npm page returned 403 to the fetcher).
- PGlite ships 41 extensions (33 contrib + 8 external). Relevant to hybrid retrieval: external `pg_textsearch` (BM25 ranking, ~542.5 KB), `Apache AGE` (graph/Cypher), `PostGIS`, `pg_ivm` (incremental matview); contrib `pg_trgm`, `fuzzystrmatch`, `unaccent`, `btree_gin`, `tsm_system_rows` — https://pglite.dev/extensions/
- HNSW build memory in WASM: build holds the graph in `maintenance_work_mem` (Postgres default 64 MB); exceeding it falls back to a slower disk build (10–50× slower on server Postgres). In a browser/WASM PGlite process the memory ceiling is tighter, so HNSW builds over large corpora are the main scaling risk locally — reinforces "build after bulk load," keep corpora per-matter, and rebuild the projection rather than maintaining a giant single index — https://www.crunchydata.com/blog/hnsw-indexes-with-postgres-and-pgvector , https://dev.to/philip_mcclarence_2ef9475/scaling-pgvector-memory-quantization-and-index-build-strategies-8m2

### Drizzle + PGlite + pgvector integration gotcha (dated)

- Error `"$libdir/vector": No such file or directory` hit Drizzle Studio/`push` when a schema contained `vector` columns under PGlite; fixed by drizzle-orm PR #3824 (opened 2024-12-22, resolving issues #2995/#3222) which adds pgvector support specifically for PGlite contexts (studio + push to new PGlite DBs). Use a drizzle-orm version that includes this fix when running migrations/studio against a vector-enabled PGlite schema — https://github.com/drizzle-team/drizzle-orm/pull/3824

### FTS keep-in-sync: FTS5 is SQLite-only — translate to Postgres under PGlite

- The CAPTURE "FTS5 external-content kept in sync by triggers" (doc-haus#6) is a **SQLite** construct. SQLite FTS5 external-content tables require user-maintained INSERT/UPDATE/DELETE triggers AND a manual one-time backfill ("creating the triggers does not copy existing rows") to stay consistent, or "query results may be unpredictable" — https://www.sqlite.org/fts5.html
- Under PGlite (Postgres) the equivalent is one of:
  - **Generated `tsvector` STORED column + GIN index** — the modern, recommended keep-in-sync mechanism: `ADD COLUMN tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', body)) STORED;` then `CREATE INDEX ... USING gin(tsv);`. Postgres auto-maintains the column on write (no triggers, no manual sync) — https://www.postgresql.org/docs/current/textsearch-tables.html , https://danielabaron.me/blog/speed-up-pg-fts-with-persistent-ts-vectors/
  - **`pg_textsearch` BM25** (external PGlite extension) for true BM25 (IDF, TF saturation, length normalization) closer to FTS5/Elasticsearch ranking, with the index transactionally maintained on UPDATE/DELETE (no separate sync job). Caveat: pg_textsearch targets PG 17/18 — PGlite is PG17, so availability hinges on the shipped PGlite build; verify before depending on it — https://www.tigerdata.com/blog/introducing-pg_textsearch-true-bm25-ranking-hybrid-retrieval-postgres , https://pglite.dev/extensions/
- Net: the "external-content + triggers" sync burden mostly disappears on Postgres (generated column self-syncs); reserve trigger-maintained `tsvector` only for legacy/derived cases. The BM25 channel of the hybrid retriever maps to `pg_textsearch` (if shipped) or `ts_rank_cd` on the generated column as the fallback.

### Scale-driven side indexes (agentmemory#12 → projection side-tables)

- The agentmemory#12 pattern (name-index `type|name→nodeId`, edge-key `src|tgt|type→edgeId`, node-degree `nodeId→count`, precomputed top-degree snapshot) is the graph-projection analogue of targeted btree/GIN side indexes so retrieval never does O(n) scans over a 75K+ node scope (CAPTURE, in-repo port reference — `src/state/schema.ts:24-39`). On the PGlite side this is btree indexes on lookup keys + a materialized top-degree subgraph; `pg_ivm` (shipped) can keep such a precomputed snapshot incrementally fresh — https://pglite.dev/extensions/

### Embedding-model version guard + projection rebuild/migration (vectors as projection, never authority)

- Record the embedding identity — **provider + model name + dimension + version** — in projection metadata next to the vectors. Silent model swaps (or same-dim-different-space models) corrupt similarity with "no error, just bad results"; the version row is what lets you *detect* drift and decide to re-embed — https://zilliz.com/ai-faq/how-do-i-handle-versioning-of-embedding-models-in-production , https://mixpeek.com/guides/embedding-portability-versioning
- This matches doc-haus#6's `meta` embedding-model version guard and beep's "vectors are a rebuildable projection, not authority" stance: the authoritative text + char-span offsets are source of truth; the vector column + HNSW index are derived and reconstructable.
- Migration rules when the model changes: never mix models in one index even at equal dimension; treat each index as an atomic unit and **re-embed from source + rebuild the index** (do not rolling-update in place); use a blue-green / new-projection-then-atomic-pointer-switch to avoid degraded search during rebuild. A dimension change (e.g. 768→3072) is a hard schema migration — drop/recreate the `vector(N)` column and HNSW index — https://callsphere.ai/blog/migrating-vector-databases-pinecone-pgvector-weaviate-embeddings , https://medium.com/data-science-collective/different-embedding-models-different-spaces-the-hidden-cost-of-model-upgrades-899db24ad233
- Because the projection is rebuildable, the local-first beep flow can drop the HNSW index, re-embed all chunks with the new model into a fresh `vector(N)`/`halfvec(N)` column, then `CREATE INDEX ... hnsw` after the bulk load — cheaper than maintaining model-version compatibility in place.

### Provider/deprecation watch (from CAPTURE, dated)

- lawyergpt pins Gemini embeddings that are now dead: `embedding-001`/`embedding-gecko-001`/`gemini-embedding-exp-03-07` (shut down Oct 2025) and `text-embedding-004` (shut down 2026-01-14); current GA is `gemini-embedding-001` (3072 default, Matryoshka-truncatable). Reinforces provider-neutral/local-first (ONNX, e.g. InLegalBERT 768) so the pgvector column dimension is owned locally, not dictated by a remote model's lifecycle — CAPTURE.md L172-179 ; https://ai.google.dev/gemini-api/docs/embeddings

## Sources

- pgvector README (PRIMARY): https://github.com/pgvector/pgvector/blob/master/README.md
- pgvector 0.8.0 release (iterative scans, filter perf): https://www.postgresql.org/about/news/pgvector-080-released-2952/
- ParadeDB — Tuning pgvector (opclass mismatch → seq scan; m/ef ranges): https://www.paradedb.com/learn/postgresql/tuning-pgvector
- Neon — Understanding HNSW with pgvector: https://neon.com/blog/understanding-vector-search-and-hnsw-index-with-pgvector
- Neon — Optimize pgvector search (ef_search ≥ k, over-filtering): https://neon.com/docs/ai/ai-vector-search-optimization
- Crunchy Data — HNSW indexes / maintenance_work_mem: https://www.crunchydata.com/blog/hnsw-indexes-with-postgres-and-pgvector
- DEV — Scaling pgvector memory/quantization/build: https://dev.to/philip_mcclarence_2ef9475/scaling-pgvector-memory-quantization-and-index-build-strategies-8m2
- DEV — pgvector distance functions (operator/opclass coupling): https://dev.to/philip_mcclarence_2ef9475/pgvector-distance-functions-cosine-vs-l2-vs-inner-product-57pd
- PGlite extensions catalog (PRIMARY): https://pglite.dev/extensions/
- PGlite about / PG17 base: https://pglite.dev/docs/about
- postgres-pglite fork: https://github.com/electric-sql/postgres-pglite
- Drizzle — Vector similarity search guide (PRIMARY): https://orm.drizzle.team/docs/guides/vector-similarity-search
- Drizzle — PostgreSQL extensions / distance helpers: https://orm.drizzle.team/docs/extensions/pg
- Drizzle docs issue #436 (similarity expr vs index usage): https://github.com/drizzle-team/drizzle-orm-docs/issues/436
- Drizzle PR #3824 ($libdir/vector PGlite fix, 2024-12-22): https://github.com/drizzle-team/drizzle-orm/pull/3824
- SQLite FTS5 external-content + triggers (PRIMARY): https://www.sqlite.org/fts5.html
- PostgreSQL FTS — tables & indexes / generated tsvector (PRIMARY): https://www.postgresql.org/docs/current/textsearch-tables.html
- Daniela Baron — persistent tsvectors (generated column vs trigger): https://danielabaron.me/blog/speed-up-pg-fts-with-persistent-ts-vectors/
- Tiger Data — pg_textsearch BM25 intro: https://www.tigerdata.com/blog/introducing-pg_textsearch-true-bm25-ranking-hybrid-retrieval-postgres
- pg_textsearch repo: https://github.com/timescale/pg_textsearch
- Google — Gemini embeddings docs (3072 default, MRL, normalization): https://ai.google.dev/gemini-api/docs/embeddings
- TokenMix — gemini-embedding-001 dimensions/normalization guide: https://tokenmix.ai/blog/gemini-embedding-001-dimensions-pricing-guide-2026
- Zilliz — versioning embedding models in production: https://zilliz.com/ai-faq/how-do-i-handle-versioning-of-embedding-models-in-production
- Mixpeek — embedding portability & versioning: https://mixpeek.com/guides/embedding-portability-versioning
- CallSphere — migrating vector databases (re-embed vs copy, atomic index): https://callsphere.ai/blog/migrating-vector-databases-pinecone-pgvector-weaviate-embeddings
- Medium (Stafford) — different embedding models, different spaces: https://medium.com/data-science-collective/different-embedding-models-different-spaces-the-hidden-cost-of-model-upgrades-899db24ad233
- CAPTURE.md (in-repo gold nuggets): /home/elpresidank/YeeBois/projects/beep-effect/explorations/rag-retrieval-projection/CAPTURE.md

## Open / Unverified

- UNVERIFIED: the exact pgvector version bundled by the current `@electric-sql/pglite-pgvector` package (npm page returned 403 to the fetcher; PGlite docs don't state it). Confirm against the installed package's lockfile before relying on 0.8.0-only features (iterative_scan, improved filter cost estimates).
- UNVERIFIED: whether `pg_textsearch` (BM25) actually loads and is stable inside the shipped PGlite WASM build — it is listed in the PGlite extensions catalog, but pg_textsearch upstream targets PG 17/18 and is young (v1.x). Until verified, treat the generated-`tsvector` + GIN (`ts_rank_cd`) path as the safe BM25-channel fallback for the hybrid retriever.
- UNVERIFIED (local-perf): real HNSW build time / memory ceiling for a per-matter corpus inside PGlite-WASM at the target chunk count — no published PGlite-specific benchmark found. Needs a local spike (e.g. 10k–100k chunks at 768 dims) measuring build time vs `maintenance_work_mem` and whether parallel workers are available in WASM.
- UNVERIFIED: exact import path for the vector extension on the PGlite version beep pins (`@electric-sql/pglite/vector` vs `@electric-sql/pglite-pgvector`) — the docs/examples disagree across versions; resolve from the installed version.
- OPEN (design): the `gt(similarity, 0.25)` cutoff and `limit 8` from lawyergpt#3 are model/corpus-specific; calibrate against the chosen local embedding model rather than porting the constants. Also decide vector vs halfvec column type up front, since it is coupled to the model's output dimensionality and the 2000-dim HNSW cap.
