# P1 Handoff — Staging Port (faithful)

## Objective

Port adjunct 1:1 to Effect v4 as a standalone staging package, validated against its own
property-test proofs, with **full categorical fidelity** preserved.

## Inputs

- `research/v3-to-v4-port-map.md`, `research/gap-vs-beep-nlp.md` (P0 outputs)
- `~/YeeBois/dev/adjunct/{src,test,bin}/**`
- `.repos/effect-v4/.patterns/{effect,testing}.md`, `standards/git-worktrees.md`

## Required Work

1. Create an isolated git worktree for the staging package (avoid disturbing `@beep/nlp`).
2. Port modules in dependency order: Algebra/TypeClass → Schema/Ontology → Graph →
   Operations → Services/Backends → Streaming. (MCP server itself is staged for the P4 driver.)
3. Apply the rename checklist; replace `zod` MCP schemas with effect `Schema`/`McpSchema`.
4. Port the fast-check law suites to `effect/testing/FastCheck` + `@effect/vitest`
   (`it.effect`, `assert`), including `test/arbitraries.ts` generators and every
   `*.laws.test.ts`.
5. Spot-check behavior against adjunct on representative inputs.

### Scope decisions (locked, P0 follow-up)

- **Operations: full faithful port** — port `Composable`/`Definition`/`Extended`/
  `ImplementationProvider`/`OperationCompiler`/`Pipeline`/`SchemaASTMatchers`/`Serialization`.
  `SchemaASTMatchers` needs a **from-scratch `_tag` AST walker** (v4 removed
  `AST.getCompiler`/`AST.Match`). Risk accepted: v4 `SchemaAST` `Union` is a `// TODO`, so a
  faithful Schema-union round-trip may not be fully expressible — port as far as v4 allows and
  document any gap in the P1 output. (`Operations/Registry.ts` is `@deprecated` → still drop.)
- **Streaming: in scope** — port `TextStream`/`Jsonl`/`DatasetLoader`/`Cache`/`Pipeline` on
  `effect/Stream` + `effect/unstable/encoding/Ndjson` + `effect/unstable/http/HttpClient`;
  `Cache` → `effect/Cache`; fix adjunct's `DatasetLoader` missing-import bug.
- **Typeclass algebra:** re-express on `effect/Combiner` (Semigroup) + `effect/Reducer`
  (Monoid) + a small local `Monoid<A>` interface; hand-rewrite Foldable/Traversable/
  Applicative onto `Effect.all`/`zipWith`/`forEach` + `effect/Array` (no shim unless forced).
- **Formatter:** drop (`@effect/printer*` has no v4 home; presentation-only, off the code path).

## Exit Criteria

- [ ] Staging package builds + type-checks under Effect v4
- [ ] All ported categorical/algebraic laws pass (adjunction triangle identities, monoid
      laws, functor/monad/traversable laws, graph round-trips)
- [ ] Behavior parity spot-checked vs adjunct
- [ ] `history/outputs/p1-staging-port.md` records module status, deviations, parity notes

## Handoff Notes

Keep the staging package faithful to adjunct (don't pre-adapt to `@beep/nlp` shapes) — the
adaptation happens in P2. The staging worktree is retired after P2/P5.
