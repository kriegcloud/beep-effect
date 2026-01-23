# Quick Start - Knowledge Server @effect/ai Migration

> 5-minute guide to starting this spec.

---

## TL;DR

Replace custom `OpenAiProvider.ts` with official `@effect/ai-openai` package.

---

## Before You Start

Verify the Effect AI source is available:

```bash
ls tmp/effect/packages/ai/ai/src/EmbeddingModel.ts
ls tmp/effect/packages/ai/openai/src/OpenAiEmbeddingModel.ts
```

---

## CRITICAL: Source Files Are Authoritative

The local source files in `tmp/effect/packages/ai/` are the PRIMARY reference for correct implementation:

| Source File | What to Extract |
|-------------|-----------------|
| `tmp/effect/packages/ai/ai/src/EmbeddingModel.ts` | `EmbeddingModel` class, `Service` interface, `Result` type, `make()` constructor |
| `tmp/effect/packages/ai/openai/src/OpenAiEmbeddingModel.ts` | `layerBatched()`, `Config.Batched`, layer composition |
| `tmp/effect/packages/ai/openai/src/OpenAiClient.ts` | `OpenAiClient` class, `layerConfig()` |

**READ THESE FILES DIRECTLY** using the Read tool. MCP documentation is supplementary only.

---

## Start Phase 0

Copy-paste from: `handoffs/P0_ORCHESTRATOR_PROMPT.md`

---

## What You'll Do

| Phase | Task | Duration |
|-------|------|----------|
| P0 | Research @effect/ai APIs | ~1 session |
| P1 | Design migration strategy | ~0.5 session |
| P2 | Implement migration | ~2 sessions |
| P3 | Verify and cleanup | ~1 session |

---

## Key Files to Change

```
packages/knowledge/server/
├── package.json                    # Add @effect/ai deps
├── src/Embedding/
│   ├── EmbeddingProvider.ts        # Adapt or deprecate
│   ├── EmbeddingService.ts         # Use EmbeddingModel
│   └── providers/
│       ├── OpenAiProvider.ts       # Replace with @effect/ai-openai
│       └── MockProvider.ts         # Implement EmbeddingModel
```

---

## Target Code Pattern

```typescript
import * as EmbeddingModel from "@effect/ai/EmbeddingModel"
import * as OpenAiClient from "@effect/ai-openai/OpenAiClient"
import * as OpenAiEmbeddingModel from "@effect/ai-openai/OpenAiEmbeddingModel"

// Layer composition
const OpenAiClientLive = OpenAiClient.layerConfig({
  apiKey: Config.redacted("OPENAI_API_KEY"),
}).pipe(Layer.provide(BunHttpClient.layer))

const EmbeddingLive = OpenAiEmbeddingModel.layerBatched({
  model: "text-embedding-3-small",
  config: { dimensions: 768 },
}).pipe(Layer.provide(OpenAiClientLive))
```

---

## Verification

```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

---

## Help

- Full details: [README.md](README.md)
- Workflow: [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md)
- Agent prompts: [AGENT_PROMPTS.md](AGENT_PROMPTS.md)
