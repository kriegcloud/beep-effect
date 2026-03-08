# recursive-llm

An implementation of the [Recursive Language Model (RLM)](https://arxiv.org/abs/2502.07413) architecture in Effect TypeScript, running on Bun.

RLMs treat inference as a program — the model writes code, executes it in a sandboxed REPL, observes output, and iterates until it produces a verified answer. This turns a single LLM call into an autonomous multi-step reasoning loop with two distinct memory spaces: a **variable space** (the REPL heap) and a **token space** (the LLM context window).

## Features

- **Iterative REPL loop** — Model generates JS code, executes it in a Bun subprocess sandbox, observes output, repeats
- **Depth-limited recursion** — `llm_query()` inside sandbox code spawns sub-LLM calls, each with their own REPL at higher depths
- **Multi-provider** — Anthropic, OpenAI, and Google/Vertex AI via `@effect/ai`
- **Budget enforcement** — Iteration limits, LLM call limits, token budgets, wall-clock timeouts
- **Structured output** — `responseFormat` option on `llm_query()` returns schema-validated JSON objects
- **Typed tool system** — Define custom tools with Effect Schema validation, exposed to the sandbox
- **NLP tools** — Optional BM25 corpus search, entity extraction, text similarity (via `effect-nlp` submodule)
- **Sandboxed execution** — Bun.spawn subprocess with typed JSON IPC, strict mode available
- **Event streaming** — Real-time visibility into iterations, model responses, code execution, bridge calls
- **Run traces** — Persisted execution traces for debugging and analysis
- **CLI** — Full-featured command-line interface with 20+ configuration options

## Current Limitations

- **No crash recovery yet** — In-memory sandbox state (`__vars`), in-flight queue state, and live run progress are not resumable after process crash/kill. A fresh run is required.

## Quickstart

### Prerequisites

- [Bun](https://bun.sh) v1.3+
- An API key for at least one provider (Anthropic, OpenAI, or Google)

### Install

```bash
git clone --recurse-submodules https://github.com/mepuka/recursive-llm.git
cd recursive-llm
bun install
```

If you cloned without `--recurse-submodules`, initialize the optional NLP tools:

```bash
git submodule update --init
bun install
```

### Set your API key

Bun auto-loads `.env`:

```bash
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
# or
echo "OPENAI_API_KEY=sk-..." > .env
# or
echo "GOOGLE_GENERATIVE_AI_API_KEY=..." > .env
```

### Run

```bash
# Simple query
bun run rlm "What is the sum of the first 100 prime numbers?"

# Analyze a document
bun run rlm "Identify all named characters and their relationships" \
  --context-file novel.txt

# Analyze structured data (NDJSON, CSV, JSON)
bun run rlm "Find the top 10 most discussed topics" \
  --context-file articles.ndjson \
  --max-iterations 15 \
  --max-llm-calls 50

# Use OpenAI
bun run rlm "Summarize the key findings" \
  --context-file report.pdf \
  --provider openai \
  --model gpt-4o

# Enable NLP tools (BM25 corpus search, entity extraction, etc.)
bun run rlm "Search for articles about renewable energy policy" \
  --context-file corpus.ndjson \
  --nlp-tools
```

## CLI Reference

```
bun run rlm <query> [options]

Options:
  --context <text>              Inline context string
  --context-file <path>         Read context from file (NDJSON, CSV, JSON, TXT, PDF)
  --provider <name>             Provider: anthropic | openai | google (default: anthropic)
  --model <name>                Model name (default: claude-sonnet-4-5-20250929)
  --sub-model <name>            Model for recursive sub-calls
  --max-iterations <n>          Max REPL iterations (default: 10)
  --max-depth <n>               Max recursion depth (default: 1)
  --max-llm-calls <n>           Max total LLM calls (default: 20)
  --max-total-tokens <n>        Token budget limit
  --max-time-ms <n>             Wall-clock timeout in ms
  --nlp-tools                   Enable built-in NLP tools
  --sandbox-transport <mode>    Transport: auto | worker | spawn (default: auto)
  --named-model <name=prov/m>   Named model mapping (repeatable)
  --media <name=path>           Attach media file (repeatable)
  --media-url <name=url>        Attach media URL (repeatable)
  --no-prompt-caching           Disable Anthropic prompt caching
  --quiet                       Only show final answer and errors
  --no-color                    Disable ANSI colors
  --no-trace                    Disable run trace persistence
  --trace-dir <path>            Custom trace output directory
```

## Programmatic API

```typescript
import { Rlm, rlmBunLayer, RlmConfig, RlmTool } from "recursive-llm"
import { makeAnthropicRlmModel } from "recursive-llm"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "@effect/platform"

// Simple completion
const program = Effect.gen(function*() {
  const rlm = yield* Rlm

  const answer = yield* rlm.complete({
    query: "Analyze the sentiment of each review",
    context: reviewsData
  })

  console.log(answer)
})

// With typed output
import { Schema } from "effect"

const ResultSchema = Schema.Struct({
  topics: Schema.Array(Schema.Struct({
    name: Schema.String,
    count: Schema.Number,
    sentiment: Schema.Literal("positive", "negative", "neutral")
  }))
})

const typed = Effect.gen(function*() {
  const rlm = yield* Rlm

  // Returns typed result, not string
  const result = yield* rlm.complete({
    query: "Extract topics with sentiment",
    context: articlesData,
    outputSchema: ResultSchema
  })

  // result.topics is fully typed
  for (const topic of result.topics) {
    console.log(`${topic.name}: ${topic.sentiment} (${topic.count})`)
  }
})

// Event streaming
const streamed = Effect.gen(function*() {
  const rlm = yield* Rlm

  yield* rlm.stream({
    query: "Process these records",
    context: data
  }).pipe(
    Stream.runForEach((event) =>
      Effect.sync(() => {
        switch (event._tag) {
          case "IterationStarted":
            console.log(`Iteration ${event.iteration}`)
            break
          case "CodeExecutionCompleted":
            console.log(`Output: ${event.output}`)
            break
          case "CallFinalized":
            console.log(`Answer: ${event.answer}`)
            break
        }
      })
    )
  )
})

// Build the layer
const modelLayer = makeAnthropicRlmModel({
  model: "claude-sonnet-4-5-20250929"
})

const configLayer = Layer.succeed(RlmConfig, RlmConfig.of({
  ...RlmConfig.defaultValue,
  maxIterations: 15,
  maxLlmCalls: 50
}))

const appLayer = rlmBunLayer.pipe(
  Layer.provide(modelLayer),
  Layer.provide(configLayer)
)

program.pipe(Effect.provide(appLayer), BunRuntime.runMain)
```

### Custom Tools

```typescript
import { RlmTool } from "recursive-llm"
import { Schema } from "effect"

const searchTool = RlmTool.make("search_database", {
  description: "Search the product database by query",
  parameters: {
    query: Schema.String,
    limit: Schema.optional(Schema.Number)
  },
  returns: Schema.Array(Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    price: Schema.Number
  })),
  handler: (params) =>
    Effect.promise(() => db.search(params.query, params.limit ?? 10))
})

// Pass to complete
rlm.complete({
  query: "Find the cheapest products matching 'wireless keyboard'",
  context: "",
  tools: [searchTool]
})
```

## Architecture

```
                    ┌─────────────┐
                    │   CLI/API   │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │     Rlm     │  ← Public service interface
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │  Scheduler  │  ← Command loop: GenerateStep → ExecuteCode → repeat
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────┴──────┐ ┌──┴───┐ ┌──────┴──────┐
       │   LlmCall   │ │Budget│ │   Sandbox   │
       │ (retry+gate)│ │      │ │ (Bun.spawn) │
       └──────┬──────┘ └──────┘ └──────┬──────┘
              │                        │
       ┌──────┴──────┐          ┌──────┴──────┐
       │  @effect/ai │          │   Worker    │  ← IPC bridge for llm_query, budget, tools
       │  providers  │          │  (sandbox-  │
       │             │          │   worker)   │
       └─────────────┘          └─────────────┘
```

**Core loop**: The Scheduler dequeues commands from a bounded queue. Each iteration:
1. `GenerateStep` — Build prompt with system instructions + transcript, call LLM
2. `ExecuteCode` — Extract code block from response, execute in sandbox subprocess
3. `CodeExecuted` — Append output to transcript, loop back to GenerateStep
4. `Finalize` — When model calls SUBMIT tool, extract and validate answer

**Recursion**: When sandbox code calls `llm_query()`, an IPC bridge message routes through the Scheduler, which spawns a child call at `depth + 1`. At `depth >= maxDepth`, sub-calls are one-shot (single LLM generation). Below max depth, they get their own REPL iteration loop.

**Budget**: Every LLM call and iteration is tracked. When a budget is exhausted, the Scheduler forces an extraction step to salvage partial results.

## Example Outputs

The `examples/` directory contains real outputs from RLM runs:

| Example | Dataset | Result |
|---------|---------|--------|
| [Top 20 Figures](examples/figures-top20.md) | 9,977 Chicago politics posts (NDJSON) | Ranked political figures with evidence |
| [Frankenstein Characters](examples/frankenstein-characters.md) | 446K chars (Project Gutenberg) | 21 characters with relationships |
| [Energy Analysis](examples/breakthrough-energy-analysis.md) | 1,637 articles (NDJSON) | Comparative energy advocacy analysis |
| [Sentiment Analysis](examples/sentiment.md) | Chicago politics corpus | Sentiment breakdown by topic |
| [Rhetorical Framing](examples/rhetorical-framing-nlptools.md) | Politics corpus + NLP tools | Framing patterns with BM25 retrieval |

## Development

```bash
# Run tests (452 tests)
bun test

# Type check
bun run typecheck

# Run property-based tests
bun test:property

# Benchmark sandbox transports
bun run bench:transport
```

## How It Works (RLM Paper)

This project implements the architecture described in ["Recursive Language Models"](https://arxiv.org/abs/2502.07413) (Zhang, Kraska, Khattab, 2025). Key ideas:

- **RLM is an inference-time strategy**, not a new model. Any LLM can be used as the base.
- **Two memory spaces**: The LLM's context window (token space) and the REPL's heap (variable space). Large datasets live in variables; only summaries and code output enter the context.
- **Code as action**: Instead of free-form text reasoning, the model writes executable code. This gives deterministic intermediate results and access to the full JS standard library.
- **Recursive decomposition**: Complex problems are broken into sub-problems via `llm_query()`, each potentially getting their own multi-step REPL loop.

## License

[MIT](LICENSE)
