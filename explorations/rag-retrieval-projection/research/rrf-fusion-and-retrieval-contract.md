# rrf-fusion-and-retrieval-contract

External landscape + decision for the owned hybrid 3-channel Reciprocal-Rank-Fusion retrieval service (k=60), and the consumer-facing service contract that `agent-memory-tiers-bitemporal-edges` and `goals/trustgraph-port` must consume rather than rebuild.

## Findings

### 1. RRF origin, formula, and the k=60 constant (PRIMARY, verified twice)

- RRF was introduced by Cormack, Clarke & Büttcher, *"Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods"*, SIGIR 2009. The paper's own text (extracted directly from the PDF) gives the formula `RRFscore(d ∈ D) = Σ over rankings r∈R of 1/(k + r(d))` and states verbatim: *"where k = 60 was fixed during a pilot investigation and not altered during subsequent validation"*, and *"the results of the first … indicated that k = 60 was near-optimal, but that the choice was not critical."* Their intuition: *"while highly-ranked documents are more important, the importance of [lower-ranked documents diminishes slowly]."* — https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf
- So k=60 is an empirically-chosen, deliberately-not-tuned constant from 2009 TREC data, and the original authors explicitly say the exact value is *not critical*. This is the load-bearing primary-source fact behind every vendor default. — https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf
- **Adversarial cross-check — k=60 is the universal vendor default:** Azure AI Search (`1/(rank + k)`, *"performs best when you set k to a small value, such as 60"*) — https://learn.microsoft.com/en-us/azure/search/hybrid-search-ranking ; OpenSearch (*"By default, the rank constant is set to 60"*) — https://opensearch.org/blog/introducing-reciprocal-rank-fusion-hybrid-search/ ; Elasticsearch (`rank_constant` *"Defaults to 60"*) — https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion ; LangChain `EnsembleRetriever` (`c: int = 60`) — https://sj-langchain.readthedocs.io/en/latest/_modules/langchain/retrievers/ensemble.html . CAPTURE notes doc-haus (`RRF_K = 60`) and agentmemory (`RRF_K`) both land on 60. **Decision: keep k=60; it is the well-supported, deliberately-uncritical default — do not spend appetite tuning it.**

### 2. What k actually controls (consensus vs. top-pick)

- Low k gives a single top-ranked result outsized weight; high k flattens the `1/(k+rank)` curve so a document must rank highly across *multiple* systems to win — i.e. high k rewards cross-channel consensus. — https://bigdataboutique.com/blog/reciprocal-rank-fusion-how-it-works-and-when-to-use-it
- Corroborated by the math itself: with k=60, ranks 1 and 2 differ by `1/61 − 1/62 ≈ 0.00026`, a deliberately small gap, so one channel cannot dominate; this is why Azure notes the per-query contribution is bounded by ≈`1/k`. — https://learn.microsoft.com/en-us/azure/search/hybrid-search-ranking
- **Consequence for the contract:** RRF scores are *not* probabilities and are not comparable across queries that fuse different numbers of channels (Azure: upper bound ≈ number-of-queries × `1/k`). Do not threshold on absolute fused score; threshold per-channel (e.g. cosine ≥ 0.25 before fusion, per lawyergpt) and rank after fusion. — https://learn.microsoft.com/en-us/azure/search/hybrid-search-ranking

### 3. Rank fusion (RRF) vs. alpha-weighted score fusion (LegalEase)

- RRF deliberately throws away raw scores and fuses *ranks*, which sidesteps the core failure of score fusion: BM25 is unbounded while cosine lives in [0,1], so `alpha*bm25 + (1-alpha)*dense` (LegalEase's `alpha=0.5`) requires normalizing two incompatible distributions and is brittle to score drift. — https://www.maxpetrusenko.com/blog/rrf-vs-weighted-fusion-for-hybrid-ranking and https://avchauzov.github.io/blog/2025/hybrid-retrieval-rrf-rank-fusion/
- MongoDB names the two canonical techniques precisely: *Reciprocal Rank Fusion* (rank-based, normalization-free) vs *Relative Score Fusion* (normalize each score set to [0,1] then weight-combine). RRF is the safer default; Relative Score Fusion retains score *magnitude* (a 0.95 vs 0.55 cosine gap survives) which rank fusion discards. — https://medium.com/mongodb/reciprocal-rank-fusion-and-relative-score-fusion-classic-hybrid-search-techniques-3bf91008b81d
- **Decision:** RRF is the primary fusion for the owned service (no cross-scale normalization, robust, matches doc-haus + agentmemory). Keep alpha/Relative-Score fusion as a documented *alternative mode* only where score magnitude on calibrated statute/section/claim-term matches must be preserved — but it is opt-in, not the default, because it reintroduces the normalization problem RRF exists to avoid.

### 4. Weighted RRF — per-channel weights (the 3-channel control surface)

- The standard extension multiplies each channel's reciprocal rank by a weight: `contribution = weight × 1/(rank + k)`. This is GA in Elasticsearch (*"Each retriever contributes: weight × 1/(rank + rank_constant)"*) — https://www.elastic.co/search-labs/blog/weighted-reciprocal-rank-fusion-rrf ; Azure applies a per-vector-query `weight` multiplier before RRF — https://learn.microsoft.com/en-us/azure/search/hybrid-search-ranking ; LangChain's canonical implementation is `rrf_score = weight * (1 / (rank + self.c))` with `weights` defaulting to equal — https://sj-langchain.readthedocs.io/en/latest/_modules/langchain/retrievers/ensemble.html
- This matches agentmemory's captured snippet exactly: `effectiveBm25W*(1/(RRF_K+bm25Rank)) + effectiveVectorW*(1/(RRF_K+vectorRank)) + effectiveGraphW*(1/(RRF_K+graphRank))`. **Decision: the 3 channels (literal-phrase, FTS/BM25, embedding-cosine — plus optional graph) each carry a tunable weight; default to weights that satisfy the literal-floor invariant in §6, not naive equality.**
- Vendor guidance on *how* to weight: boost lexical/keyword weight for precise-term and identifier queries; boost semantic weight for conceptual queries. — https://www.elastic.co/search-labs/blog/weighted-reciprocal-rank-fusion-rrf

### 5. Empty-stream handling & graceful weight renormalization (beep's cold-start)

- RRF natively tolerates a document missing from a channel: it simply contributes 0 to that channel's sum (LangChain initializes every doc at `0.0`; Elasticsearch: absent docs contribute zero). — https://sj-langchain.readthedocs.io/en/latest/_modules/langchain/retrievers/ensemble.html and https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion
- **But a *whole empty channel* is under-specified by the standards.** OpenSearch states plainly: *"Currently, missing items default to a score of 0.0, but this may not be optimal for all use cases"* and lists configurable-default / `max_rank+1` / ignore-missing as unimplemented options. — https://opensearch.org/blog/introducing-reciprocal-rank-fusion-hybrid-search/ No surveyed vendor renormalizes weights when an entire stream is empty.
- agentmemory's captured `totalW` renormalization (`effectiveW = w / totalW` over only the present channels via `hasVector`/`hasGraph` flags) is therefore a *justified beep design decision, not an industry standard*. It matters for beep specifically because the vector/graph projections are local-first and may be unpopulated at cold-start; without renormalization, an empty channel silently shrinks every doc's fused score and shifts the effective lexical/semantic balance. **Decision: renormalize surviving channel weights to sum to 1 when a channel is empty, so the fused scale and the lexical/semantic balance stay stable as projections populate.** (Mark as beep-owned policy, externally unspecified.)

### 6. The "literal hit must not be outscored by fuzzy hits" invariant (doc-haus core insight)

- **Pure RRF does NOT guarantee this.** Because RRF rewards cross-channel consensus, a document that no channel ranks #1 can be lifted above an exact lexical match if several fuzzy channels agree on it. The benchmark practitioner softwaredoug concludes *"RRF is not enough"* and abandons plain RRF for a scheme that *explicitly tiers candidates by match quality (all-terms exact > partial match > pure-vector fallback)* with name-boosting. — https://softwaredoug.com/blog/2025/03/13/elasticsearch-hybrid-search-strategies
- Independent corroboration of the routing fix: when a query is an identifier or quoted phrase, boost keyword weight or skip semantic retrieval entirely so exact matches win. — https://secondary.ai/blog/hybrid-keyword-search
- This is exactly doc-haus's design: a dedicated *whole-query literal-phrase channel* alongside FTS5/BM25 and embedding-cosine, carrying the invariant. **Decision: implement the invariant as a hard post-fusion floor/tie-break — a candidate containing the exact literal phrase must rank above any candidate lacking it, regardless of fuzzy-channel consensus. Use a dedicated literal channel with a dominating weight AND a tie-break, not weight alone (weight is probabilistic; the invariant requires a guarantee).** This is the single most important deviation from off-the-shelf RRF and the reason beep owns the fusion rather than delegating to a vector DB's built-in RRF.

### 7. Source-authority weighting (research-squad#9)

- The external landscape treats source authority as a *publisher-level credibility signal independent of query relevance*. AuthorityBench (arXiv 2026) defines it as *"how much a source should be trusted by default when relevance is held constant"* and operationalizes it via domain-graph PageRank. — https://arxiv.org/html/2603.25092v1
- `.gov`/`.edu` are inherently high-authority TLDs (restricted registration; treated as hand-picked high-trust seeds in TrustRank-style schemes). — https://backlinko.com/google-trustrank
- Trust-based ranking applies the trust factor *multiplicatively to the base IR score* (linear/sigmoid/asymptotic weighting variants). — https://businessnucleus.com/trust-based-ranking-tbr/
- This validates research-squad's `inferSourceType(url)` / `isPrimarySource()` (.gov || .edu || arxiv.org || sec.gov). **Decision: apply source authority as a *post-fusion multiplicative weight* on the fused candidate (or a per-doc prior), NOT baked into the RRF rank constant — keep relevance and authority orthogonal so they can be tuned/audited independently. Extend the taxonomy with legal-primary domains (courtlistener/court sites, uspto.gov, ecfr.gov, federalregister.gov). Constraint: authority weighting must never override the §6 literal-match floor.**

### 8. Reranking & diversification (the optional precision stage)

- Production pattern is a two-stage cascade: cheap first-stage retrieval (hybrid RRF) → precise second-stage cross-encoder rerank. Cross-encoders (query+doc scored jointly) are more accurate than bi-encoder embeddings but too expensive for first-stage. — https://www.pinecone.io/learn/series/rag/rerankers/ and https://towardsdatascience.com/advanced-rag-retrieval-cross-encoders-reranking/
- Concrete options: Cohere Rerank (commercial API, v3.5) vs self-hosted `bge-reranker-v2-m3` (open, multilingual); benchmark accuracy is close, both beat pure vector search. — https://www.analyticsvidhya.com/blog/2025/06/top-rerankers-for-rag/
- Diversification via MMR: `MMR = (1−λ)·rel(d) − λ·max sim(d, selected)`, λ≈0.5, to cut near-duplicate candidates before the human gate. — https://docs.opensearch.org/latest/vector-search/specialized-operations/vector-search-mmr/ and https://www.researchgate.net/publication/2269571_The_Use_of_MMR_Diversity-Based_Reranking_for_Reordering_Documents_and_Producing_Summaries
- Azure runs semantic rerank *after* RRF and reports its score *separately* (`@search.rerankerScore`, range 0–4) rather than folding it back into the fused score. — https://learn.microsoft.com/en-us/azure/search/hybrid-search-ranking
- **Decision: rerank/diversify is an OPTIONAL, pluggable post-fusion stage that consumes the fused candidate list and returns a reordered list, carrying its own separate score (à la Azure). Default to local `bge-reranker`-class models for privilege-safety/local-first (Cohere cloud is opt-in for non-privileged work only, consistent with beep's provider-neutral stance). MMR dedup pairs with the AGPL-clean MinHash/LSH cluster step from CAPTURE.**

### 9. The consumer-facing retrieval service contract (the fix `agent-memory…` and `trustgraph-port` consume)

Synthesizing the above into the single owned contract (Effect service / `Context.Tag`) so downstream packets inject rather than rebuild:

- **Request:** `query` + per-channel enable flags + per-channel `weight`s + `k` (default 60) + per-channel candidate window (doc-haus `CANDIDATES = 20`) + final `topK` + optional `authorityWeights` + optional `rerank` stage selector + optional `minScore` per channel (e.g. cosine ≥ 0.25, lawyergpt).
- **Each channel returns** a ranked candidate list of *stable IDs* carrying char-span provenance (`doc / section / charStart / charEnd`) — never bare text (doc-haus shape; lawyergpt's raw-chunks-to-LLM is the explicit anti-pattern). — CAPTURE doc-haus#1 / lawyergpt#4
- **Fusion** = weighted RRF (§4) with empty-channel renormalization (§5) and the literal-match floor (§6).
- **Response:** ranked candidates, each carrying: `id`, fused `score`, *per-channel ranks + contributions* as debuggable subscores (Azure-style `debug` unpacking — essential for the legal-audit trail), char-span provenance, source-authority tag (§7), optional separate `rerankerScore` (§8). — https://learn.microsoft.com/en-us/azure/search/hybrid-search-ranking
- **Downstream boundary:** outputs flow as `CandidateClaim` + `Evidence` spans through the ClaimGate (reuse `@beep/epistemic-domain` + `@beep/provenance` TextAnchor), NOT as bare chunks to an LLM. This is the hard wall the contract enforces on every consumer. — CAPTURE alreadyCovered + lawyergpt#4 anti-pattern
- **Why a single owner:** consumers (`agent-memory-tiers-bitemporal-edges`, `goals/trustgraph-port`) get the *same* fusion/invariant/provenance guarantees by injecting one service; re-implementing RRF in each would let the literal-floor invariant and renormalization policy drift apart.

### 10. Licensing (for any port)

- **The RRF algorithm itself is a published method (SIGIR 2009) — free to implement; there is no copyright on the formula.** Reimplement from the paper, which is the public primary source. — https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf
- LangChain `EnsembleRetriever` (weighted-RRF reference implementation) is MIT — safe to study/adapt. — https://sj-langchain.readthedocs.io/en/latest/_modules/langchain/retrievers/ensemble.html
- doc-haus is MIT (per CAPTURE) → safe to study/adapt for the 3-channel + literal-floor design. agentmemory's license is unverified in CAPTURE → reimplement the renormalization from the formula (which is public). courtlistener (MinHash dedup) is AGPL-3.0 → reimplement from spec, do not copy. Cohere Rerank = commercial cloud API (not privilege-safe); `bge-reranker-v2-m3` open-weights license should be confirmed before bundling (see Open/Unverified).

## Sources

- Cormack, Clarke & Büttcher, *Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods*, SIGIR 2009 (PRIMARY, full text) — https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf
- Azure AI Search — Hybrid Search Scoring (RRF), Microsoft Learn (updated 2026-06-08) — https://learn.microsoft.com/en-us/azure/search/hybrid-search-ranking
- OpenSearch — Introducing reciprocal rank fusion for hybrid search — https://opensearch.org/blog/introducing-reciprocal-rank-fusion-hybrid-search/
- Elasticsearch — Reciprocal rank fusion reference — https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion
- Elasticsearch Labs — Weighted reciprocal rank fusion (RRF) — https://www.elastic.co/search-labs/blog/weighted-reciprocal-rank-fusion-rrf
- LangChain `EnsembleRetriever` source (weighted_reciprocal_rank, MIT) — https://sj-langchain.readthedocs.io/en/latest/_modules/langchain/retrievers/ensemble.html
- LangChain reference — weighted_reciprocal_rank — https://reference.langchain.com/python/langchain-classic/retrievers/ensemble/EnsembleRetriever/weighted_reciprocal_rank
- MongoDB — Reciprocal Rank Fusion and Relative Score Fusion — https://medium.com/mongodb/reciprocal-rank-fusion-and-relative-score-fusion-classic-hybrid-search-techniques-3bf91008b81d
- BigData Boutique — Reciprocal Rank Fusion: How It Works and When to Use It — https://bigdataboutique.com/blog/reciprocal-rank-fusion-how-it-works-and-when-to-use-it
- Max Petrusenko — RRF vs Weighted Fusion for Hybrid Ranking — https://www.maxpetrusenko.com/blog/rrf-vs-weighted-fusion-for-hybrid-ranking
- Andrey Chauzov — Hybrid retrieval with RRF: solving the score normalization problem — https://avchauzov.github.io/blog/2025/hybrid-retrieval-rrf-rank-fusion/
- softwaredoug — Elasticsearch Hybrid Search Strategies (benchmark; "RRF is not enough") — https://softwaredoug.com/blog/2025/03/13/elasticsearch-hybrid-search-strategies
- secondary.ai — Hybrid Keyword Search: Balancing Precision and Recall — https://secondary.ai/blog/hybrid-keyword-search
- Pinecone — Rerankers and Two-Stage Retrieval — https://www.pinecone.io/learn/series/rag/rerankers/
- Towards Data Science — Advanced RAG Retrieval: Cross-Encoders & Reranking — https://towardsdatascience.com/advanced-rag-retrieval-cross-encoders-reranking/
- Analytics Vidhya — Top 7 Rerankers for RAG (Cohere v3.5 / bge-reranker-v2-m3) — https://www.analyticsvidhya.com/blog/2025/06/top-rerankers-for-rag/
- OpenSearch — Vector search with MMR reranking — https://docs.opensearch.org/latest/vector-search/specialized-operations/vector-search-mmr/
- Carbonell & Goldstein — The Use of MMR, Diversity-Based Reranking — https://www.researchgate.net/publication/2269571_The_Use_of_MMR_Diversity-Based_Reranking_for_Reordering_Documents_and_Producing_Summaries
- AuthorityBench: Benchmarking LLM Authority Perception for Reliable RAG (arXiv 2026) — https://arxiv.org/html/2603.25092v1
- Backlinko — Google TrustRank guide (.gov/.edu seed trust) — https://backlinko.com/google-trustrank
- Business Nucleus — Trust-Based Ranking (trust factor multiplied into IR score) — https://businessnucleus.com/trust-based-ranking-tbr/

## Open / Unverified

- **Whole-empty-channel weight renormalization is NOT an industry standard.** RRF natively zeroes missing *documents*, but no surveyed vendor renormalizes weights when an entire channel is empty (OpenSearch explicitly leaves this open). beep's `totalW` renormalization (from agentmemory) is a justified beep-owned policy, not externally validated — treat as a design decision to ratify in DECISIONS, not a borrowed standard.
- **The literal-match floor is a beep invariant, not a spec.** Off-the-shelf RRF (and vector-DB built-in RRF) do not guarantee an exact phrase outranks fuzzy consensus; softwaredoug + secondary.ai corroborate the *need* and the tiering fix, but the exact floor/tie-break mechanism is beep's to design (dedicated literal channel + hard tie-break recommended).
- **Exact RRF weight ratios** (literal vs FTS vs cosine vs graph) are not prescribed by any source — Elastic/Azure give only directional guidance ("boost lexical for precise terms"). Needs empirical tuning on the legal corpus; do this *after* the contract lands, not before.
- **`bge-reranker-v2-m3` open-weights license** (and current Cohere Rerank model id/version) not verified in this pass — confirm license terms before bundling any reranker into the privilege-safe local path.
- **agentmemory repository license** unverified (CAPTURE flags it) — the RRF formula is public so reimplementation is safe regardless, but confirm before copying any non-formula code (e.g. its graph index design from agentmemory#12).
- **Source-authority legal-domain taxonomy** (which court/agency/reporter domains count as "primary") is not given by research-squad#9 — must be authored for the IP/legal corpus, ideally reusing court-vocab datasets from `goals/official-data-sync-foundation`.
</content>
</invoke>
