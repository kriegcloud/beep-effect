# effect-langextract

Effect-native LLM-powered structured extraction with source-grounded character spans.

An [Effect](https://effect.website) TypeScript port of [google/langextract](https://github.com/google/langextract) — use LLMs to extract structured information from unstructured text, with every extraction mapped to exact character positions in the source.

## Features

- **Source grounding** — extractions map to exact `CharInterval` positions in the original text
- **Schema-constrained output** — structured JSON enforced by the LLM provider
- **Long document support** — chunking, parallel processing, multiple extraction passes
- **Fuzzy alignment** — handles paraphrased/reworded extractions via token-level matching
- **Multi-provider** — Gemini, OpenAI, Anthropic, Ollama (extensible via services)
- **Interactive visualization** — self-contained HTML with color-coded highlights
- **Effect-native** — services, layers, typed errors, structured concurrency throughout

## Installation

```bash
npm install effect-langextract
# or
bun add effect-langextract
```

Peer dependency: `typescript ^5`

## Quick Start — Library API

```typescript
import { extract } from "effect-langextract"
import { makeExtractionExecutionLayer } from "effect-langextract"
import { BunHttpClient } from "@effect/platform-bun"
import { Effect } from "effect"

const program = extract({
  ingestion: {
    source: { _tag: "text", text: "Alice visited Paris last summer." },
    format: "text"
  },
  prompt: {
    description: "Extract people and places mentioned in the text.",
    examples: [
      {
        text: "Bob went to London.",
        extractions: [
          { class: "person", text: "Bob" },
          { class: "place", text: "London" }
        ]
      }
    ]
  },
  annotate: {
    maxCharBuffer: 50000,
    batchLength: 5,
    batchConcurrency: 2,
    providerConcurrency: 4,
    extractionPasses: 1
  }
})

const layer = makeExtractionExecutionLayer({
  provider: "openai",
  modelId: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY ?? "",
  providerConcurrency: 4,
  primedCacheNamespace: "openai"
})

program.pipe(
  Effect.provide(layer),
  Effect.provide(BunHttpClient.layer),
  Effect.runPromise
).then(console.log)
```

### Streaming

Use `extractStream` for incremental `AnnotatedDocument` output:

```typescript
import { extractStream } from "effect-langextract"
import { Stream } from "effect"

extractStream(request).pipe(
  Stream.runForEach((doc) => Effect.log(doc.documentId))
)
```

### Rendering

```typescript
import { renderDocuments } from "effect-langextract"

// JSON, JSONL, or self-contained HTML visualization
renderDocuments({ documents, format: "html" })
```

## CLI Usage

The CLI provides two subcommands: `extract` and `visualize`.

```bash
# Extract entities from text
effect-langextract extract \
  --input "Alice visited Paris last summer." \
  --input-format text \
  --examples-file ./examples.json \
  --provider openai \
  --prompt "Extract people and places."

# Generate HTML visualization from extraction output
effect-langextract visualize \
  --input ./annotated-document.json \
  --output-path ./output.html
```

## Provider Configuration

Each provider reads configuration from environment variables:

| Provider | API Key Env Var | Optional Env Vars |
|---|---|---|
| OpenAI | `OPENAI_API_KEY` | `OPENAI_MODEL_ID`, `OPENAI_BASE_URL`, `OPENAI_ORGANIZATION` |
| Gemini | `GEMINI_API_KEY` | `GEMINI_MODEL_ID`, `GEMINI_BASE_URL` |
| Anthropic | `ANTHROPIC_API_KEY` | `ANTHROPIC_MODEL_ID`, `ANTHROPIC_BASE_URL` |
| Ollama | *(none)* | `OLLAMA_MODEL_ID`, `OLLAMA_BASE_URL` |

## Core Pipeline

```
Input Text -> Chunking -> Prompt Building -> LLM Inference -> Parsing -> Alignment -> Output
```

1. **Chunking** — split documents into chunks respecting `maxCharBuffer`, optional context windows
2. **Prompting** — few-shot prompts with description + examples + query chunk
3. **Inference** — batch LLM calls with parallel workers
4. **Parsing** — extract JSON/YAML from LLM output
5. **Alignment** — map extraction text to source character positions using token-level matching
6. **Merge** — combine results from multiple passes

## Key Data Types

- `Extraction` — class, text, charInterval, attributes, alignmentStatus
- `Document` — text, documentId, additionalContext
- `AnnotatedDocument` — document + extractions + tokenizedText
- `CharInterval` — startPos, endPos
- `AlignmentStatus` — `match_exact` | `match_greater` | `match_lesser` | `match_fuzzy`

## Attribution

This project is an Effect TypeScript port of [google/langextract](https://github.com/google/langextract), originally written in Python. The core extraction pipeline, alignment algorithm, and data model are derived from that work.

---

## Development

### Run

```bash
bun install
bun run typecheck
bun run test
bun run build
```

### CLI (development)

```bash
bun run cli -- extract --input "Alice visited Paris" --input-format text --examples-file ./examples.json --provider anthropic
bun run cli -- visualize --input ./annotated-document.json --output-path ./output.html
```

Node-ready runtime:

```bash
bun run cli:node -- extract --input "Alice visited Paris" --input-format text --examples-file ./examples.json --provider anthropic
```

### Performance Harness

```bash
bun run perf:annotator
bun run perf:annotator:report
```

### Parity Diff Harness

Fixture-driven parity regression checks against the Python reference:

```bash
bun run parity:diff
bun run parity:diff:report
bun run parity:diff:update   # refresh baselines after intentional changes
```

### Testing Convention

Services expose canonical `Effect.Service` test APIs:
- Stateless/simple services: `static readonly Test`
- Configurable/stateful services: `static testLayer(...)`

Live provider smoke tests are opt-in:

```bash
LANGEXTRACT_LIVE_PROVIDER_SMOKE=true bun run test
bun run test:smoke:providers
```

## License

MIT
