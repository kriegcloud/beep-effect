# effect-langextract

An Effect TypeScript clone of [google/langextract](https://github.com/google/langextract) — an LLM-powered structured extraction library that maps extractions to exact character positions in source text.

## Project Scope & Goals

### What This Project Does

Use LLMs to extract structured information from unstructured text, with:

- **Precise source grounding** — every extraction maps to exact character positions (`CharInterval`) in the source
- **Schema-constrained output** — structured JSON output enforced by the LLM provider
- **Long document support** — chunking, parallel processing, multiple extraction passes
- **Fuzzy alignment** — handles paraphrased/reworded extractions via token-level matching
- **Multi-provider** — Gemini, OpenAI, Ollama, extensible via services
- **Interactive visualization** — self-contained HTML with color-coded highlights

### Core Pipeline

```
Input Text → Chunking → Prompt Building → LLM Inference → Parsing → Alignment → Output
```

1. **Chunking** — split documents into chunks respecting `maxCharBuffer`, optional context windows for cross-chunk coreference
2. **Prompting** — few-shot prompts with description + examples + query chunk
3. **Inference** — batch LLM calls with parallel workers
4. **Parsing** — extract JSON/YAML from LLM output (code fences, raw)
5. **Alignment** — map extraction text → source character positions using token-level difflib-style matching (exact, fuzzy, partial)
6. **Merge** — combine results from multiple passes (first-pass wins for overlaps)

### Key Data Types

- `Extraction` — class, text, charInterval, attributes, alignmentStatus
- `Document` — text, documentId, additionalContext
- `AnnotatedDocument` — document + extractions + tokenizedText
- `ExampleData` — text + extractions (for few-shot prompting)
- `CharInterval` — startPos, endPos
- `AlignmentStatus` — MATCH_EXACT | MATCH_GREATER | MATCH_LESSER | MATCH_FUZZY

### CLI Interface

Build as a CLI tool using `@effect/cli`:
- Accept text input, URLs, or file paths
- Prompt description and examples
- Model selection and provider config
- Output as JSONL or HTML visualization

### Architecture (Effect Style)

- **Services**: `LanguageModel`, `Tokenizer`, `Resolver`, `Annotator`, `Visualizer`
- **Layers**: Provider-specific implementations (Gemini, OpenAI, Ollama)
- **Schema**: Use `effect/Schema` for data models (Extraction, Document, etc.)
- **Errors**: `Schema.TaggedError` for typed error handling
- **Config**: `effect/Config` for API keys, model settings
- **Concurrency**: Effect fibers for parallel chunk processing

### Reference Material

- `.reference/langextract/` — original Python implementation (the source of truth for behavior)
- `.reference/effect/` — Effect monorepo for API patterns and examples

## Searching Reference Code

`.reference/` is gitignored, so `colgrep` cannot index it directly. Use these paths instead:

- **langextract (Python original)**: `colgrep "query" ~/Dev/langextract-ref`
- **Effect monorepo**: `colgrep "query" ~/Dev/effect`
- **This project**: `colgrep "query"` (no path needed)

For exact text/regex searches in `.reference/`, use `Grep` or `Read` tools directly — those are not affected by gitignore.

## Runtime

- Use `bun` as the package manager and runtime
- Use `bun run <script>` for scripts, `bun <file>` to run files
- Use `bun run test` for testing, `bun install` for dependencies

<!-- effect-solutions:start -->
## Effect Best Practices

**IMPORTANT:** Always consult effect-solutions before writing Effect code.

1. Run `effect-solutions list` to see available guides
2. Run `effect-solutions show <topic>...` for relevant patterns (supports multiple topics)
3. Search `.reference/effect/` for real implementations (run `effect-solutions setup` first)

Topics: quick-start, project-setup, tsconfig, basics, services-and-layers, data-modeling, error-handling, config, testing, cli.

Never guess at Effect patterns - check the guide first.
<!-- effect-solutions:end -->
