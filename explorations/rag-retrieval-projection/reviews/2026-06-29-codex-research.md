# Codex research-gate critique — rag-retrieval-projection (2026-06-29)

## Blocking

### PGlite/pgvector runtime version is mis-grounded

**Claim:** `RESEARCH.md:266-268` says "`@beep/pglite` ... root depends on `@electric-sql/pglite@0.5.3`" and treats that as "the local-first Postgres-in-WASM authority store." `RESEARCH.md:332-335` then says pgvector 0.8.0 features and the drizzle PGlite vector fix must be confirmed against "PGlite 0.5.3's pgvector package."

**Why this blocks:** The package catalog does list `@electric-sql/pglite` `0.5.3` (`package.json:44`), but the actual `@beep/pglite` driver does not import that package directly. It imports `@effect/sql-pglite/PgliteClient` (`packages/drivers/pglite/src/PgliteClient.service.ts:15-16`), and the installed `@effect/sql-pglite@4.0.0-beta.91` depends on `@electric-sql/pglite` `^0.4.5` (`bun.lock:2603-2605`), resolved to `0.4.6` (`bun.lock:2629`). The `0.5.3` copy is present as `@electric-sql/pglite-legacy-053` (`bun.lock:2631`), not as the imported runtime. This matters because the extension API differs: the live imported package exposes `@electric-sql/pglite/vector` and `@electric-sql/pglite/pg_textsearch`, while the research discusses a separate external package/import path as unresolved. The vector/HNSW implementation cannot ship until the research names the actual runtime chain and exact extension import path.

### AGPL "clean-room" plan is not clean-room

**Claim:** `RESEARCH.md:213-217` says CourtListener's MinHash/LSH clustering is AGPL-3.0, but recommends reimplementing "the clustering policy from the courtlistener spec." `RESEARCH.md:339-342` repeats that the team should "do the LSH math clean-room from datasketch and the clustering policy from the courtlistener spec." The backing raw note at `research/bounded-concurrency-ingest-and-dedup.md:29-30` reads the AGPL file for constants, tokenization, representative selection, and BFS clustering behavior.

**Why this blocks:** That is a license hazard. The only named "courtlistener spec" is the AGPL implementation file (`cl/citations/group_parentheticals.py`), not an independent standards document or paper. A clean-room implementation cannot be authored by copying the AGPL caller's implementation-specific policy, constants, tokenization sequence, and representative-selection behavior into the build plan. Keep the MIT `datasketch` math, but replace the CourtListener-derived policy with an independently written product spec, or split the work into a real two-person clean-room process where the implementing engineer never reads AGPL source.

### Chunker ownership contradicts itself and the active LangExtract goal

**Claim:** Under "Genuine gaps (this packet builds them)," `RESEARCH.md:308-311` says the "Offset-preserving char-span chunker" is "NET-NEW." But `RESEARCH.md:399-401` says "The chunker piece attaches to `goals/langextract-capability` ... not to this packet's retrieval core." The packet README also frames this packet as owning the bounded-concurrency, offset-preserving chunker (`README.md:12-16`), while the LangExtract spec already requires source-character spans (`goals/langextract-capability/SPEC.md:5-8`) and its accepted contract owns "deterministic alignment" and JavaScript string offsets (`goals/langextract-capability/SPEC.md:77-89`).

**Why this blocks:** This is a false ownership boundary. If the chunker is part of LangExtract P4, this packet should specify the retrieval-facing contract and consume the LangExtract chunk/window output. If this packet owns the chunker, then `goals/langextract-capability` must not be simultaneously treated as the implementation home. Leaving both statements in place invites duplicate chunkers or a gap where neither goal owns the source-offset windowing code.

## Advisory

### `tsvector` is a lexical FTS fallback, not BM25

**Claim:** `RESEARCH.md:314-316` names a "Generated-`tsvector` BM25/FTS channel," and `RESEARCH.md:407-408` says to keep generated `tsvector` + GIN with `ts_rank_cd` as the "safe BM25-channel fallback."

**Why it is problematic:** PostgreSQL generated `tsvector` + GIN is a valid lexical full-text path, but `ts_rank_cd` is cover-density ranking, not BM25. The research is sound when it reserves true BM25 for `pg_textsearch` (`RESEARCH.md:108-113`), but the fallback wording should be tightened to "FTS lexical fallback" so downstream tests do not assert BM25 semantics against `ts_rank_cd`.

### Backing Effect API note overstates `Stream.mapEffect` options

**Claim:** `research/bounded-concurrency-ingest-and-dedup.md:10` says `Stream.mapEffect` in repo-pinned Effect v4 accepts `{ concurrency, unordered, bufferSize }`.

**Why it is problematic:** The installed `effect@4.0.0-beta.91` signature only exposes `concurrency?: number | "unbounded"` and `unordered?: boolean` (`node_modules/effect/src/Stream.ts:2221-2227`, `2268-2275`). The synthesized `RESEARCH.md:194-202` recommendation only depends on bounded `concurrency`, so this is not blocking, but the raw evidence should drop `bufferSize` or move it to a separate verified operator if needed.

### Gemini Embedding 2 status needs precise wording

**Claim:** `research/local-first-embedding-models.md:10` says "Current GA is now `gemini-embedding-2`"; `RESEARCH.md:130-132` calls it the replacement for `gemini-embedding-001`.

**Why it is problematic:** Google's official launch page for `gemini-embedding-2` labels it "Public Preview" (https://blog.google/technology/developers/gemini-embedding-2/), and the API examples use `v1beta` (https://ai.google.dev/gemini-api/docs/embeddings). The research's default local-first conclusion still holds, but the version/API note should avoid calling `gemini-embedding-2` GA and should pin the deprecation evidence if any hosted fallback remains in scope.

### Packet stage metadata was not advanced with the research artifact

**Claim:** `RESEARCH.md:3-6` identifies the file as Stage 1 research, but `ops/manifest.json:6-8` still says status active, stage `capture`, open questions empty, and `README.md:20-22` says "None — ready for research."

**Why it is problematic:** Cold-session routing will resume this packet at capture even though the research file and raw research lanes exist. This is not a content blocker for the research conclusions, but it should be fixed before the packet leaves the research gate so future agents do not re-run or skip the wrong stage.

## Confirmed sound

- `RESEARCH.md:19-38` is sound on RRF's origin, formula, k=60 default, and the warning that fused RRF scores are not probabilities and should not be thresholded across queries. The raw RRF lane also correctly distinguishes vendor/default RRF from beep-owned empty-channel renormalization and literal-floor policy.
- `RESEARCH.md:75-121` is sound on pgvector's core HNSW constraints: `vector_cosine_ops` must match cosine `<=>`, indexed `vector` dimensions cap at 2000, 3072-dim embeddings require truncation or `halfvec`, and model identity must be stored because embedding spaces are not interchangeable.
- `RESEARCH.md:157-163` and `RESEARCH.md:239-249` hold up against source: `@beep/provenance` `TextAnchor` documents the `text.slice(startChar, endChar) === quote` invariant, and `@beep/langextract` alignment uses JS `indexOf`/`.length` offsets, so UTF-16 code-unit offsets are the right declared unit.
- `RESEARCH.md:250-254` is correct that `@beep/nlp/Handoff` defines a half-open `Span` with `start`/`end` `NonNegativeInt`, and `@beep/langextract` imports that `Contract.Span`.
- `RESEARCH.md:258-265` is correct that the epistemic Claim/Evidence/Gate spine and the listed law-practice IP entities exist. Live source has `CandidateClaim`, `Evidence`, `EvidenceSpan`, `ClaimGateResult`, `ClaimLifecycle`, and use-case `ClaimGate` exports, plus `Claim`, `OfficeAction`, `PatentAsset`, `PriorArtReference`, `Rejection`, `Matter`, `Distinction`, `LegalClient`, and `LegalContact`.
- `RESEARCH.md:294-316` is broadly correct on repo gaps. Targeted `rg` over `packages/**` found no executable pgvector/HNSW schema, no RRF/hybrid-search service, no local text-embedding pipeline beyond image face-detection ONNX, no standalone offset-preserving retrieval chunker, and no generated `tsvector`/`pg_textsearch` channel.
- `RESEARCH.md:274-280` and `RESEARCH.md:287-290` are source-backed. The repo is on `effect@4.0.0-beta.91`, has `Semaphore.make`, `Stream.mapEffect`, Drizzle transaction usage, DuckDB transaction precedent, and `@beep/uspto` defaults to `https://api.uspto.gov`.
- The scratchpad tree snapshot existed and was read. Its routing posture matches the research's broad reuse/gap framing: existing span/provenance/langextract/epistemic/law-practice substrate should be reused, while `rag-retrieval-projection` is a legitimate proposed new exploration for the retrieval projection tier.
