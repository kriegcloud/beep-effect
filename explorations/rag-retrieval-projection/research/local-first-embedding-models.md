# local-first-embedding-models

Scope: pick the default embedding model the pgvector projection schema is sized against — provider-neutral local encoders (InLegalBERT/transformers.js, EmbeddingGemma, general ONNX retrievers) vs hosted Gemini, judged on legal-retrieval quality, pgvector HNSW dimensional fit, breadcrumb-prefix strategy, and Tauri-webview runnability.

## Findings

### Hosted Gemini sunset risk is acute, dated, and migration-hostile

- Google's embedding line shuts models down on a ~6-month cadence and the embedding spaces are mutually incompatible (every swap = full corpus re-embed). Per the official deprecations table: `embedding-001`, `embedding-gecko-001`, and `gemini-embedding-exp-03-07` all shut down **2025-10-30**; `text-embedding-004` shut down **2026-01-14**; `gemini-embedding-001` (released 2025-07-14) is scheduled to shut down **2026-07-14** — i.e. the "current GA" model the CAPTURE referenced is itself ~2 weeks from retirement as of this research (2026-06-29). All point to `gemini-embedding-2` as the replacement. (https://ai.google.dev/gemini-api/docs/deprecations.md.txt)
- Current GA is now `gemini-embedding-2` (natively multimodal, **3072-dim default**, MRL-truncatable, recommended sizes 3072/1536/768, full range 128–3072; 8192-token text input). (https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-embedding-2/ ; https://ai.google.dev/gemini-api/docs/embeddings)
- Migration is not free: Google states embeddings from one model "cannot be directly compared" with another model's — so each forced shutdown costs a complete re-embedding of the whole corpus. (https://ai.google.dev/gemini-api/docs/embeddings) This is the decisive argument for a provider-neutral local default and for keeping vectors as a rebuildable projection, not authority.

### pgvector HNSW caps the dimensional budget at 2000 (vector) / 4000 (halfvec)

- The `vector` type stores up to **16,000 dims** but HNSW/IVFFlat indexes are capped at **2,000 dims**; `halfvec` raises the *indexable* cap to **4,000** (half the bytes/dim), and binary `bit` to **64,000**. The 2000 cap exists because every index tuple must fit in PostgreSQL's 8KB page. (https://github.com/pgvector/pgvector ; https://github.com/pgvector/pgvector/issues/461)
- Consequence: Gemini's **3072-dim default cannot be HNSW-indexed on the `vector` type** — it forces either `halfvec(3072)` or MRL truncation to ≤2000 (768 or 1536). A native ≤768-dim local model fits `vector(768)` + `vector_cosine_ops` HNSW cleanly, matches the studied lawyergpt `vector("embedding",{dimensions:768})` schema (CAPTURE lawyergpt#3), and leaves huge headroom.

### 768 is the convergent interop dimension — size the projection schema against `vector(768)`

- Every leading local candidate is natively 768-dim: InLegalBERT (BERT-base, https://huggingface.co/law-ai/InLegalBERT), EmbeddingGemma-300m (MRL→512/256/128, https://huggingface.co/blog/embeddinggemma), `bge-base-en-v1.5`, `gte-base`, and `nomic-embed-text-v1.5` (Apache, MRL, https://huggingface.co/nomic-ai/nomic-embed-text-v1.5). 768 is also one of Gemini's recommended MRL truncation targets. (https://ai.google.dev/gemini-api/docs/embeddings)
- So `vector(768)` HNSW `vector_cosine_ops` is the recommended column size: it fits the HNSW cap with margin, matches lawyergpt's existing shape, is the native size of the strongest local options, and lets a future hosted Gemini provider drop into the *same* column via `output_dimensionality=768`. MRL also lets you later shrink storage to 512/256/128 without changing the model or re-embedding (truncate-then-renormalize). (https://huggingface.co/blog/embeddinggemma)

### InLegalBERT is a wiring reference, not the quality default

- 768-dim, BERT-base config (12 layers, ~110M params), **MIT license**, pretrained MLM+NSP on **5.4M Indian legal documents (1950–2019)**. No native ONNX or sentence-transformers export; would need an Optimum→ONNX conversion to run under transformers.js. (https://huggingface.co/law-ai/InLegalBERT)
- Two quality problems for beep's US-IP/patent retrieval: (a) it's a masked-LM, not retrieval-tuned — raw BERT mean/CLS pooling yields poor sentence embeddings, "worse than average pooling of static GloVe" out-of-the-box, the founding motivation of Sentence-BERT (Reimers & Gurevych 2019). (https://arxiv.org/abs/1908.10084) (b) Wrong jurisdiction (Indian case law, not US patent/IP). The Juris.AI nugget itself flags only the transformers.js feature-extraction *wiring* is gold (its relevance score is a `Math.random` stub) — so InLegalBERT demonstrates the local-first in-webview embedding pattern, not a retrieval-quality default.
- Hub reality check: only `law-ai/InLegalBERT` (PyTorch, 11k downloads) plus community fine-tunes exist; a low-adoption `amixh/sentence-embedding-model-InLegalBERT` (~64 downloads) is the only sentence-embedding variant, and generic `*/legal-bert-onnx` exports of nlpaueb Legal-BERT are unmaintained/low-trust. (HF Hub `models?search=InLegalBERT` / `legalbert+onnx`, queried 2026-06-29)

### Recommended default: EmbeddingGemma-300m (ONNX) at 768-dim — the local twin of Gemini

- 300M params (~622MB; QAT cuts RAM to sub-200MB), built from Gemma 3 "and the same research and technology used to create Gemini models"; **768-dim native, MRL→512/256/128**; 2048-token context; 100+ languages; MTEB English v2 ≈ **69.67**. Official support across Sentence Transformers, **transformers.js (browser)**, ONNX Runtime, and TEI; `onnx-community/embeddinggemma-300m-ONNX` ships quantized (q8/q4) variants for WASM. (https://huggingface.co/blog/embeddinggemma ; https://ai.google.dev/gemma/docs/embeddinggemma/model_card ; https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX)
- It is the provider-neutral local counterpart to Gemini embeddings: same lineage/quality bar, runs fully in the Tauri webview, zero API/sunset dependency, native 768 fits the HNSW `vector` column, and MRL trades storage without re-embedding.
- **License caveat (verify before ship):** sources conflict — one summarizer reported Apache 2.0, but the Gemma family ships under the **Gemma Terms of Use** (gated acceptance on HF), which permits commercial use but carries Google's prohibited-use policy. Treat as Gemma-license/gated until confirmed. (https://ai.google.dev/gemma/docs/embeddinggemma/model_card)
- Fully-permissive fallbacks if license purity is mandatory (all 768-dim, all ONNX-in-transformers.js): `bge-base-en-v1.5` (MIT), `gte-base`, `nomic-embed-text-v1.5` (Apache, MRL). For tiny WASM footprints, 384-dim `bge-small-en-v1.5` / `all-MiniLM-L6-v2` are the lightweight tier. (https://huggingface.co/blog/transformersjs-v3 ; https://www.snowflake.com/en/blog/engineering/arctic-embed-m-v1-5-enterprise-retrieval/)

### Breadcrumb-prefix strategy maps onto native asymmetric document prompts

- doc-haus prepends `docName › section` to the chunk body before embedding while queries embed raw (CAPTURE doc-haus#11) — an asymmetric document-context prefix. This aligns with the now-standard asymmetric task-prefix convention: nomic `search_document:` vs `search_query:` (https://huggingface.co/nomic-ai/nomic-embed-text-v1.5), bge/e5 `passage:` vs `query:`, and EmbeddingGemma's retrieval prompts **query = `"task: search result | query: "`** vs **document = `"title: {title} | text: "`**. (https://huggingface.co/blog/embeddinggemma)
- EmbeddingGemma's document prompt has a native `title:` slot, so the breadcrumb (`docName › section`) maps directly into `title:` — the model-blessed way to inject document context — rather than being jammed into the body. This is lighter than Anthropic-style Contextual Retrieval (LLM-generated context sentence per chunk) and deterministic, fitting beep's provenance discipline.
- Gotcha: with an instruction-tuned model the breadcrumb must compose *with* the mandatory task prefix (prefix first, then title/breadcrumb), and queries must use the *query* prefix; getting the query/document asymmetry wrong silently degrades recall. InLegalBERT has no instruction tuning → breadcrumb-only and weaker for it.

### Tauri webview runnability: WASM is the portable backend; WebGPU is not universal

- Tauri/WRY uses the system webview: WebView2 (Chromium) on Windows, WKWebView on macOS/iOS, WebKitGTK on Linux. (https://v2.tauri.app/reference/webview-versions/) transformers.js runs on onnxruntime-web; the **WASM backend (q8 default) works in every webview**, while WebGPU (`device: 'webgpu'`, up to ~64x faster) is opportunistic. (https://huggingface.co/blog/transformersjs-v3 ; https://huggingface.co/docs/transformers.js/guides/webgpu)
- WebGPU coverage across Tauri's webviews is uneven: enabled in WebView2 (Chromium) and in Safari/WKWebView 26+ (macOS Tahoe / iOS 26, on by default — https://webkit.org/blog/16993/), but **WebKitGTK on Linux has no WebGPU** (its WebGPU impl is Metal-based; a Vulkan backend was never prioritized). (https://www.mail-archive.com/webkit-gtk@lists.webkit.org/msg03883.html) The original Tauri WebGPU request (#6381) was closed as not-planned. (https://github.com/tauri-apps/tauri/issues/6381)
- Consequence for a Linux-first desktop (the user's CachyOS box): **do not rely on WebGPU in the Tauri webview on Linux** — size performance against the WASM (q8/q4) path, where a 300M model (EmbeddingGemma) or smaller (384-dim bge-small/MiniLM) is the realistic ceiling. This surfaces an architecture fork to settle in align: webview-WASM embeddings (small model, zero native dep, the Juris.AI/transformers.js pattern) vs a Rust-side ONNX sidecar (`ort`/Candle, any model, native perf, IPC the vectors). The sidecar sidesteps both the WASM perf ceiling and the WebGPU portability gap.

## Sources

- InLegalBERT model card (768-dim, MIT, Indian corpus, MLM/NSP): https://huggingface.co/law-ai/InLegalBERT
- HF Hub model search (no first-party ONNX InLegalBERT), queried 2026-06-29: https://huggingface.co/api/models?search=InLegalBERT
- pgvector README (dim caps, HNSW 2000 limit): https://github.com/pgvector/pgvector
- pgvector issue #461 (why 2000; halfvec/bit workarounds): https://github.com/pgvector/pgvector/issues/461
- Gemini deprecations (shutdown dates): https://ai.google.dev/gemini-api/docs/deprecations.md.txt
- Gemini embeddings docs (3072 default, MRL, space incompatibility): https://ai.google.dev/gemini-api/docs/embeddings
- Gemini Embedding 2 announcement: https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-embedding-2/
- EmbeddingGemma HF blog (prompts, 768/MRL, framework support, MTEB): https://huggingface.co/blog/embeddinggemma
- EmbeddingGemma Google model card: https://ai.google.dev/gemma/docs/embeddinggemma/model_card
- EmbeddingGemma launch (on-device, QAT sub-200MB): https://developers.googleblog.com/en/introducing-embeddinggemma/
- onnx-community EmbeddingGemma ONNX (q8/q4 for transformers.js): https://huggingface.co/onnx-community/embeddinggemma-300m-ONNX
- transformers.js v3 (WebGPU, dtype q8/q4, model list): https://huggingface.co/blog/transformersjs-v3
- transformers.js WebGPU guide: https://huggingface.co/docs/transformers.js/guides/webgpu
- Sentence-BERT (raw BERT pooling is a poor retriever): https://arxiv.org/abs/1908.10084
- nomic-embed-text-v1.5 (asymmetric prefixes, 768, MRL, Apache): https://huggingface.co/nomic-ai/nomic-embed-text-v1.5
- Snowflake arctic-embed-m-v1.5 (MRL truncation, MTEB): https://www.snowflake.com/en/blog/engineering/arctic-embed-m-v1-5-enterprise-retrieval/
- Tauri webview versions (WebView2/WKWebView/WebKitGTK): https://v2.tauri.app/reference/webview-versions/
- Tauri WebGPU request #6381 (closed not-planned): https://github.com/tauri-apps/tauri/issues/6381
- Safari 26 WebGPU default-on: https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/
- WebKitGTK has no WebGPU (Metal-bound impl): https://www.mail-archive.com/webkit-gtk@lists.webkit.org/msg03883.html
- Legal-document embedding guidance (domain models need fine-tuning): https://milvus.io/ai-quick-reference/what-types-of-embedding-models-are-best-for-legal-documents

## Open / Unverified

- **EmbeddingGemma license** — conflicting signals (one source said Apache 2.0; Gemma family is normally **Gemma Terms of Use**, gated on HF). Confirm the exact license text and gating before adopting as default; affects whether a fully-permissive fallback (bge/gte/nomic MIT/Apache) is mandatory. UNVERIFIED.
- **EmbeddingGemma legal-domain retrieval quality** — strong general MTEB (~69.67 English v2) is verified, but no US-patent/IP-specific retrieval benchmark was found. Whether a general SOTA small retriever beats a (retrieval-fine-tuned) legal encoder on US IP corpora is UNVERIFIED — recommend a small in-repo eval on real Oppold-corpus queries before locking the default.
- **WASM webview throughput for a 300M model** — no measured tokens/sec for EmbeddingGemma-300m under onnxruntime-web/WASM (q8) inside WebKitGTK was found; the webview-WASM vs Rust-`ort`-sidecar fork is an align-stage decision, not yet measured. UNVERIFIED.
- **Hosted legal embedders** (e.g. voyage-law-2) deliberately excluded as out-of-scope for the provider-neutral/local-first default; noted only as a quality ceiling reference, not evaluated. Out of scope.
- **gemini-embedding-2 exact GA date and whether `gemini-embedding-001`'s 2026-07-14 shutdown slips** — dates are from the live deprecations page (post knowledge-cutoff); re-verify near any decision to (not) depend on Gemini.
