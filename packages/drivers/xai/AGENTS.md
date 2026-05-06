# @beep/xai Agent Guide

## Purpose & Fit
- XAI driver package

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | `XAi`, `XAiConfigInput`, `XAI_ENDPOINTS`, `XAiRequestOptions`, `XAiLanguageModel`, `VERSION` | package entry point |
| service | `XAi` | Effect `Context.Service` with one method per documented xAI endpoint plus SSE helpers for chat, responses, legacy completions, and Anthropic messages |
| manifest | `XAI_ENDPOINTS`, `XAI_ENDPOINT_COUNT`, `XAI_ENDPOINT_METHOD_NAMES` | checked-in endpoint coverage source |
| language model | `XAiLanguageModel.make`, `XAiLanguageModel.layer`, `XAiLanguageModel.model`, `XAiLanguageModel.XAiLanguageModelOptions` | Effect AI language-model adapter namespace backed by `XAi.createChatCompletion` |
| models/errors | `XAiRequestOptions`, `XAiResponse`, `XAiWebSocketSession`, `XAiError` | schema-first boundary models and typed driver errors |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/xai` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { Effect } from "effect"
import { XAi, XAiRequestOptions } from "@beep/xai"

const program = Effect.gen(function* () {
  const xai = yield* XAi
  return yield* xai.createChatCompletion(
    new XAiRequestOptions({
      body: {
        model: "grok-4",
        messages: [{ role: "user", content: "hello" }]
      }
    })
  )
})
```

## Verifications
- `bunx turbo run test --filter=@beep/xai`
- `bunx turbo run test:integration --filter=@beep/xai`
- `bunx turbo run lint --filter=@beep/xai`
- `bunx turbo run check --filter=@beep/xai`
- `bunx turbo run type-test --filter=@beep/xai`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
