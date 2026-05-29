# P2 — Reconciliation: new spine vs existing Core/Wink/Tools

**Status:** complete.
**Date:** 2026-05-29 (absolute).

## Goal

Reconcile the ported adjunct spine (`Algebra`, `Ontology`, `Graph`,
`Graph/GraphOperations`, `Backend`, `Operations`, `NLPService`) with the
pre-existing `@beep/nlp` surface (`Core`, `Wink`, `Tools`): ensure nothing is
duplicated or lost, the dependency direction is sound, and the root export stays
product-neutral / browser-safe.

## Findings

### 1. The spine LAYERS on Core/Wink — it does not duplicate them

The dependency direction is strictly downward, verified by import inspection:

```
Core/* , Wink/*            raw wink-nlp wrappers; WinkEngine owns the model
        ^
Backend/WinkBackend        imports Wink/WinkEngine — implements NLPBackend on it
        ^
Backend/NLPBackend         the pluggable contract
        ^
Graph/GraphOperations/Catalog , NLPService   import Backend/NLPBackend
        ^
Graph/AnnotatedTextGraph   imports Backend/NLPBackend
```

- `WinkBackend` imports `Wink/WinkEngine` and delegates to it — one shared model
  lifecycle, no second `winkNLP(model)`.
- `Catalog` and `NLPService` import `Backend/NLPBackend` (the contract), never the
  raw wink wrappers.
- The apparent "tokenize/sentencize" overlap across `Core/Tokenization`,
  `Wink/WinkTokenizer`, `Backend/WinkBackend`, and `GraphOperations/Catalog` is
  **layering, not duplication**: each consumes the layer below and re-exposes it at
  a higher level of abstraction (raw wrapper -> backend contract -> graph
  operation). `Core/Tokenization` is itself a `Context.Service`; the spine does not
  reimplement it.

No symbol in the new spine reimplements a Core/Wink primitive; they compose them.

### 2. Root export stays product-neutral / browser-safe

`src/index.ts` re-exports only product-neutral namespaces (Algebra, Backend, Core,
Graph, IdentifierText, Layers, NLPService, Ontology, PathText, QueryText, Tools,
VariantText, Wink — 13 in total). A grep across `Backend/`, `Graph/`,
`Operations/`, and `NLPService.ts` for node-only / MCP imports (`node:*`,
`@effect/platform-node`, `effect/unstable/ai`, `McpServer`) returns nothing — the
spine pulls no node-only or MCP surface. The MCP server is correctly deferred to
the driver-tier `drivers/nlp-mcp` package (P4), keeping the capability root
browser-safe.

### 3. Nothing lost

`bun run repo-exports:catalog` produces only metadata churn (timestamps / commit
sha; the catalogued export set is unchanged) against HEAD — the spine's additions
are additive and the existing `Core`/`Wink`/`Tools` exports are untouched.

## Conscious deferrals

### Tools -> Operations registry convergence — DEFERRED

The goal contemplated converging the ~20 `Tools/*` onto the `Operations` registry.
This is **intentionally not done**, for three reasons:

1. **Different concern.** The `Tools` are schema-first *AI tool-call definitions*
   (`Tool.make(...)` with input/output schemas + handlers for LLM
   function-calling, surfaced via `NlpToolkit`/`ToolExport`). The `Operations`
   algebra is *graph morphisms* (`A -> Effect<B,E,R>` over graph nodes). A `Tool`
   is a callable contract for an agent; an `Operation` is a composable graph
   transform. Forcing one onto the other loses the distinct purpose of each.
2. **adjunct's registry was itself deprecated.** The `Operations/Registry` adjunct
   shipped is marked `@deprecated` in its own header (superseded by
   `ImplementationProvider`, which exists only to feed the deferred serialization
   layer — see `operations-serialization-gap.md`). There is no live registry to
   converge onto.
3. **Surgical-change discipline.** The Tools are a green, working, separately
   consumed surface. A mass refactor onto a new registry would churn working code
   for marginal benefit and risk regressions.

If a unified registry is later wanted, the sound path is a thin adapter presenting
`Catalog` operations *as* Tools (or vice versa) without rewriting either — a future
follow-up, not part of this port.

### Text-utility catalog ops — DEFERRED (noted in Catalog module)

adjunct's `paragraphize`/`normalizeWhitespace`/`removePunctuation`/
`removeStopWords`/`stem`/`ngrams` graph operations are backed by text utilities on
`Core`/`Wink`, not on `NLPBackend`. They are documented as deferred in
`Graph/GraphOperations/Catalog.ts`; folding them in would require widening the
backend contract or wiring Core directly, out of scope for the linguistic catalog.

## Conclusion

The spine is cleanly layered, nothing is duplicated or lost, and the root is
product-neutral. P2 requires no code change beyond this reconciliation record; the
two deferrals are conscious and documented. Ready for P3 (handoff contract).
