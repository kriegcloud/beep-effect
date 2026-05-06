# @beep/venice-ai Agent Guide

## Purpose & Fit
- Product-neutral Effect driver for the Venice AI API.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | `VeniceAI`, `VeniceAiChat`, `VeniceAiLanguageModel`, `VeniceAIRequestOptions`, `VeniceAIError`, `VENICE_AI_OPERATION_DESCRIPTORS`, `VERSION` | package entry point |
| service | `VeniceAI` | one method per `swagger.yaml` operation plus SSE helpers |
| compatibility | `VeniceAiChat` | delegates chat text convenience to `VeniceAI.createChatCompletion` |
| language model | `VeniceAiLanguageModel.make`, `VeniceAiLanguageModel.layer`, `VeniceAiLanguageModel.model`, `VeniceAiLanguageModel.VeniceAiLanguageModelOptions` | Effect AI language-model adapter namespace backed by `VeniceAI.createChatCompletion` |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/venice-ai` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VeniceAI } from "@beep/venice-ai"
```

## Verifications
- `bunx turbo run test --filter=@beep/venice-ai`
- `bunx turbo run test:integration --filter=@beep/venice-ai`
- `bunx turbo run lint --filter=@beep/venice-ai`
- `bunx turbo run check --filter=@beep/venice-ai`
- `bunx turbo run type-test --filter=@beep/venice-ai`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
