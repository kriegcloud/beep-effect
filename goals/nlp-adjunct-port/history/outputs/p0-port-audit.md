# P0 — Port Audit Summary

**Status:** COMPLETE (2026-05-29)
**Method:** 8-lane parallel audit of `~/YeeBois/dev/adjunct` (Effect v3.17.7) + current
`@beep/nlp` (Effect v4) + dependency disposition, each lane cross-checked against the
vendored v4 source at `.repos/effect-v4/packages/effect/src`, then synthesized.

## Deliverables

- [`research/v3-to-v4-port-map.md`](../../research/v3-to-v4-port-map.md) — full per-module
  port map + cross-cutting rename checklist (every v3 import/API → v4 target, with source
  citations to the migration map + v4 source lines).
- [`research/gap-vs-beep-nlp.md`](../../research/gap-vs-beep-nlp.md) — capability-area gap
  table (PORT NEW / MERGE / KEEP / SUPERSEDE), `@beep/nlp`-unique surface to preserve, and
  the ordered "what to build" list for P1.
- [`research/adjunct-architecture.md`](../../research/adjunct-architecture.md) — module map
  + FP/proofs analysis (written from the grill).

## Verified facts (checked directly against `.repos/effect-v4`)

| Claim | Result |
|---|---|
| `effect/Graph` is in-core (graph port ≈ no-op) | ✅ `Graph.ts` present |
| `effect/unstable/ai/{McpServer,McpSchema,Toolkit,Tool}` exist (MCP needs no new dep) | ✅ all four present |
| `effect/FileSystem`, `effect/Path`, `effect/unstable/encoding/Ndjson` in core | ✅ present |
| `@effect/typeclass` has an in-core dir | ❌ **no** `typeclass/`, no top-level `Monoid.ts`/`Semigroup.ts` |
| `@effect/printer` / `-ansi` have a v4 home | ❌ **none** in core |
| `SchemaAST` exists but `getCompiler`/`Match` survive | ⚠️ `SchemaAST.ts` present, but `getCompiler`/`Match` removed |

## Disposition headline

- **KEEP @beep/nlp (don't regress):** wink backend wrappers, vectorizer/similarity/corpus,
  the `effect/unstable/ai` toolkit + `ToolExport`, brand text types, `$NlpId`/`TaggedErrorClass`
  discipline, Clock-correct stateful services, the 19 Tools, the 7 green test suites.
- **PORT NEW (the real work):** the **Graph subsystem** (`EffectGraph`/`TextGraph`/
  `AnnotatedTextGraph`/`GraphOps`/`GraphOperations`), the graph **node schemas**
  (`TextNode`/`TextEdge`/`POSNode`/…/`NLPAnalysis`), **Ontology/Kind**, and the
  **law/adjunction proofs**. Conditionally: Streaming subsystem, multi-backend Composition.
- **MERGE:** adjunct `NLPService` ops missing from `@beep`'s `Core/Tokenization` + wink seam.
- **SUPERSEDE / DROP:** adjunct's MCP server + `zod` + `@modelcontextprotocol/sdk`
  (superseded by `effect/unstable/ai`); `Operations/Registry.ts` (@deprecated); demos; `web/`.

## Top risks → P1 decisions (the 4 that gate work)

1. **Typeclass algebra (largest fidelity risk).** v4 gives `Combiner` (Semigroup) +
   `Reducer` (Monoid) only; `Foldable`/`Traversable`/`SemiApplicative`/`Applicative`/`Functor`
   + `data/{Array,Effect}` have **no counterpart**. Decision: re-express on
   `Combiner`/`Reducer` + a small local `Monoid<A>` interface (for `combineMany`/`combineAll`)
   and hand-rewrite the higher typeclasses onto `Effect.all`/`zipWith`/`forEach` + `effect/Array`,
   **vs** vendor a minimal typeclass shim.
2. **`SchemaASTMatchers.ts` (biggest single blocker).** `AST.getCompiler`/`AST.Match` removed;
   v4 has no `Union`/`Literal`/`Refinement`/`Transformation` node classes (Union is `// TODO`).
   A faithful Schema round-trip may not be expressible in this v4 checkout → needs a from-scratch
   `_tag` walker, and the Operations registry/serialization depends on it. **This is the part of
   adjunct most at risk of not porting faithfully.**
3. **Formatter / `@effect/printer*`** — no v4 home; drop terminal formatters (presentation-only,
   off the capability code path) or hand-roll.
4. **Public Map/Set carriers** (`BagOfWords = Map`, `CorpusStatistics`) — doctrine-compliant
   `MutableHashMap`/`MutableHashSet` rewrites would break exported types and ripple through
   callers/laws. Decide: repo-wide carrier swap **vs** keep `@beep`'s existing seams.

Plus pervasive mechanical renames (`Either→Result`, `Effect.catchAll→catch`,
`Date.now→Clock`, native Map/Set/Array → effect collections, `Context.GenericTag→Context.Service`,
`Schema.decodeUnknown→decodeUnknownEffect`) and ~12 low-risk symbol-shape confirmations listed
in the port map.

## Open questions carried to P1

See the full list in the port map's "Open questions / risks" section. The four above are the
ones that change *what we build*; the rest are verify-before-porting symbol checks. Two scope
questions for the user: (a) is the **Operations registry/compiler/serialization** a product
requirement, or do we skip it given `SchemaASTMatchers` is the biggest blocker and `@beep`
already expresses operations as `effect/unstable/ai` Tools? (b) is the **Streaming subsystem**
(corpus ingestion) in scope for P1, or deferred with the rest of ingestion?

## Exit gate

✅ Every adjunct `src/` module mapped to a v4 target or explicit no-counterpart mitigation;
✅ gap table assigns a disposition to every capability area; ✅ proofs/laws inventoried;
✅ dependency disposition resolved. **P0 complete — pending user review before P1.**
