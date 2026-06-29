# stenoai  `[T3]`

- **Purpose:** Privacy-first, 100% on-device meeting recorder/transcriber/summarizer (Electron shell over a PyInstaller-bundled Python CLI) using local ASR (Parakeet/Whisper) and local/cloud LLMs.
- **Stack:** Python (CLI backend: click, pydantic, ollama, openai, anthropic, sounddevice, onnxruntime, parakeet-mlx/onnx-asr, pywhispercpp) + Electron/React/TypeScript/Vite renderer; Playwright e2e.
- **Size / shape:** ~6.7k LOC in src/ plus a ~2.9k-line simple_recorder.py CLI and a ~6.2k-line Electron main; desktop app (recorder/transcriber/summarizer).
- **License:** MIT
- **Maturity:** Active; last commit 2026-06-29 00:05:17 +0100.

**Notes:** Core domain (meeting audio transcription) is unrelated to beep's IP-law proof workbench and the codebase is Python/Electron, not Effect/TS — so most of it is not reusable. Light pass surfaced two algorithm/architecture patterns worth porting conceptually. Tauri+Lexical not present (this uses Electron+React, no Lexical). No legal/ontology/provenance/RDF content.

## Gold nuggets (2)

### 1. Overlapping map-reduce chunking sized to model context
`legal-nlp` · relevance: **adjacent** · verified

_split_into_chunks splits long text into context-budget-sized chunks with a configurable overlap prefix (_OVERLAP_RATIO) and prefers clean newline breaks (scanning backward over the last 20% to avoid tiny leading chunks). Chunk budget is derived from resolve_num_ctx minus prompt/output token overhead. beep needs map-reduce over long legal documents (office actions, patents) for LLM candidate extraction; this is a clean, reusable chunking algorithm (port to TS) that preserves continuity across chunk boundaries — relevant when feeding spans to @beep/langextract before the candidate gate.

- **Source:** `src/summarizer.py:247-284`
- **beep-target:** @beep/langextract span-grounded extraction; long-document summarization in retrieval layer

```
budget = self._chunk_budget_chars()
overlap_chars = int(budget * _OVERLAP_RATIO)
content_budget = budget - overlap_chars
...
split_pos = transcript.rfind('\n', scan_start, end + 1)
...
overlap = prev[-overlap_chars:] if len(prev) >= overlap_chars else prev
result.append(overlap + raw)
```

### 2. Multi-provider LLM abstraction (local/remote/cloud/adapter)
`governance-ops` · relevance: **adjacent** · adjusted

OllamaSummarizer normalizes one summarization interface across local Ollama, remote Ollama, a JWT 'adapter' proxy (desktop never sees the provider key; URL+JWT come from env set by Electron), and cloud providers (anthropic via SDK, bedrock via direct Converse HTTPS, openai/custom base_url). beep already has multi-provider driver skeletons (Anthropic/OpenAI/xAI), but the adapter pattern — desktop holds a JWT to a proxy that holds the real API key server-side — is a useful auth/governance pattern for a solo-attorney local-first app that must not store provider secrets client-side.

- **Source:** `src/summarizer.py:109-179`
- **beep-target:** beep LLM driver auth layer (Anthropic/OpenAI/xAI); secret-proxy adapter pattern

```
self.ai_provider = ai_provider or config.get_ai_provider()
...
if self.ai_provider == "adapter":
    # ... The desktop never sees the provider key. URL + JWT come from
    # env vars set by Electron when a session is active.
elif self.ai_provider == "cloud":
    self.cloud_provider = config.get_cloud_provider()
    if self.cloud_provider == "anthropic":
```
