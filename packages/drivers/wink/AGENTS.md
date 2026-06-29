# @beep/wink Agent Guide

## Purpose & Fit
- Driver-level wink-nlp runtime for the product-neutral `@beep/nlp` contracts.
- Keep reusable NLP schemas and contracts in `@beep/nlp`; keep wink model loading, FFI, and live handler layers here.

## Surface Map

| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | `WinkEngine`, `WinkLayerLive`, `WinkLayerAllLive` | Runtime entry point and layer bundles. |
| backend | `WinkBackendLive` | Implements `@beep/nlp-processing/Backend/NLPBackend`. |
| tools | `WinkNlpToolkitLive` | Implements `@beep/nlp-processing/Tools/NlpToolkit`. |
| retrieval | `WinkCorpusManager`, `WinkVectorizer`, `WinkSimilarity` | Uses core vectorization/similarity schemas from `@beep/nlp/Core`. |
| observability | `observeWinkWorkflow`, `observeWinkTool`, `mapWinkToolError` | Wraps spans, workflow metrics, and structured AI-tool failures. |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Keep driver code free of product-domain vocabulary.
- Keep expected driver failures in typed error channels; do not convert them to defects before AI tool handling.
- Use `AiToolError` for NLP tool failure schemas and return failures with `failureMode: "return"`.
- Annotate traces with counts, ids, and text lengths; do not add raw text to span attributes or metric dimensions.
- In `test/` and `dtslint/`, import package source through `@beep/wink` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes

```ts
import { WinkLayerLive, WinkNlpToolkitLive } from "@beep/wink"
```

## Verifications
- `bunx turbo run check --filter=@beep/wink`
- `bunx turbo run test --filter=@beep/wink`
- `bun run lint` from this package directory

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
