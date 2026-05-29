# NLP Adjunct Port — Reflection Log

> Append learnings after each phase completes. Captures surprises, corrections, and decisions.

---

## P0: Reference Capture & Port Audit

**Date:** 2026-05-29 (COMPLETE)

**What worked:** 8-lane parallel audit cross-checked against the vendored v4 source produced
a per-module port map + gap table + proofs inventory. Direct v4-source checks confirmed the
load-bearing facts (see `outputs/p0-port-audit.md`).

**v3→v4 mapping surprises:** `effect/Graph` is in-core and UNCHANGED → the graph port is
mostly a no-op (biggest unique-to-adjunct area is cheaper than expected). `effect/unstable/ai`
already has McpServer/McpSchema/Toolkit/Tool → no new MCP dep.

**No-counterpart APIs found:** `@effect/typeclass` (no in-core dir → `Combiner`/`Reducer` +
local `Monoid` + hand-rewrite Foldable/Traversable/Applicative); `@effect/printer*` (none →
drop Formatter); `AST.getCompiler`/`AST.Match` removed + v4 `SchemaAST` has no
Union/Literal/Refinement/Transformation node classes (Union is `// TODO`).

**Dependency disposition decisions:** drop `zod`/`@modelcontextprotocol/sdk` (→ `effect/unstable/ai`),
`@effect/printer*`, `@effect-atom/atom-react` (web-only), `@effect/ai-google` (no v4 home);
keep wink deps; `@effect/platform-bun` → standardize on node stdio at the driver edge.

**Proofs/laws to preserve:** adjunction triangle identities (`Adjunction.test`), monoid laws
(`Algebra/*`), graph/annotation + operation laws (`*.laws.test`), shared `arbitraries.ts` →
`effect/testing/FastCheck`.

**Decisions for P1 (from user):**
- **Operations: full faithful port** incl. `SchemaASTMatchers` via from-scratch `_tag` AST
  walker — Union-round-trip risk accepted; port as far as v4 allows + document any gap.
- **Streaming: in scope** — rebuild on `effect/Stream` + `Ndjson` + `HttpClient`,
  `Cache` → `effect/Cache`, fix the `DatasetLoader` missing-import bug.

**Open questions carried to P1:** typeclass-shim vs hand-rewrite (lean hand-rewrite); the
~12 low-risk symbol-shape confirmations in the port map (verify-before-porting); public
Map/Set carrier policy (lean: keep `@beep`'s existing seams, don't reintroduce public Map/Set).

## P1: Staging → direct-port pivot + enforced-bar finding

**Date:** 2026-05-29 (in progress)

**Staging pivot:** `standards/git-worktrees.md` reserves worktrees for the main `beep-effect`
checkout (treats `beep-effect2` as a to-be-retired duplicate); and `beep create-package` wires
a new package repo-wide (tsconfig.packages.json + tsconfig.quality.packages.json + root
aliases + an identity composer in identity/packages.ts) with no "leave out of graph" mode —
so a throwaway staging package would need un-wiring for no benefit. **Decision: port directly
into `@beep/nlp`** (new src/ subdirs), git history is the isolation. Old P2 "land & merge"
collapses into in-place reconciliation.

**ENFORCED-BAR FINDING (doctrine drift — important):** `@beep/nlp` **passes `beep:check`
(tsgo, exit 0) and `beep:lint` (biome, exit 0) today** while containing 17 `as` casts, 35
native array methods, `Data.TaggedError` (1 file: Tokenization.ts), and `BS.stringId` for
identity in 18 files — NOT the `$NlpId` composer / `TaggedErrorClass` taxonomy the audit's
gap table claimed. So the real bar is "tsgo + biome pass," not the idealized CLAUDE.md
repo-law. The `@effect/language-service` "error" diagnostics in tsconfig.base.json are not
failing `tsgo -b` for this package. **Port approach: match `@beep/nlp`'s actual idioms**
(`BS.stringId`, pragmatic) and validate against `beep:check` + `beep:lint`, per CLAUDE.md
"write code that reads like the surrounding code" — do not gold-plate to unmet strict law.

**beep-cli create-package signature (verified):** `bun run beep create-package <name>
--type library|tool|app [--family drivers|foundation|tooling] [--parent-dir <rel>] [--dry-run]`
— `name` positional; `--family` does NOT accept `internal`/`apps`.

**Algebra group ported (commits `5cb5793b9a`, next):**
- `src/Algebra/Monoid.ts` — generic `Monoid<A>` + all instances + law checkers; v4 renames
  (namespaced imports, HashMap/Option v4, `null`→`Option` for `SetIntersection`/`Option`
  monoids). 50 proofs. `Algebra/index.ts` barrel uses `.ts` extension (repo
  `allowImportingTsExtensions`); `"./Monoid"` without ext fails tsgo (TS2835).
- `src/Algebra/NLPMonoid.ts` — NLP instances on the local framework; `BagOfWords` defined
  locally as `Map<string,number>` (NLPService is a later MERGE). `SentenceConcat` preserved
  as a **near-monoid** (identity-only proof, no associativity — matches adjunct's own test).
  26 proofs.
- **`src/Algebra/NLPMonoids.ts` (the `@effect/typeclass` duplicate) DROPPED** per the gap
  table's "consolidate into ONE impl" disposition — its structures (BagOfWords,
  DocumentStatistics, NamedEntity, DependencyEdge, TextAnalysis, monoid instances) are
  duplicates of NLPMonoid, so nothing genuinely-new to fold. This avoids pulling in
  `@effect/typeclass`/`Combiner`/`Reducer` for the algebra layer entirely.
- `TypeClass.ts` deferred to the Graph group (it depends on `EffectGraph`).
- Validation loop per increment: `beep:lint:fix` → `beep:check` (tsgo) → `beep:lint` (biome)
  → scoped `vitest run`. All green.

**Ontology + Graph-schema groups ported:**
- `src/Ontology/Kind.ts` — 11-stratum TextKind ontology via `LiteralKit` (not
  `S.Union(S.Literal)` → trips `schemaUnionOfLiterals`), TypedText + smart constructors +
  containment poset. adjunct's `unsafeCast` (`any`) → `recast` over `TypedText<TextKind>`.
  11 poset/constructor proofs.
- `src/Graph/Schema.ts` — graph node/edge classes (TextNode/TextEdge/NLPAnalysis + POS/
  Entity/Lemma/Dependency/Relation nodes) = handoff-contract basis. `Schema.Class("Name")`
  → `S.Class($I\`Name\`)`; multi-arm `Schema.Literal` → `S.Literals`; `Schema.optional` →
  `S.optionalKey`; positional `S.Record`. 10 decode/encode round-trip proofs.
- Export subpaths added (`/Algebra /Ontology /Graph`); `beep tsconfig-sync` registers root
  aliases + docgen managed fields automatically.
- **Gotcha:** `S.Literals([...])` type-checks but throws at decode time in this v4 beta
  (`_a.length` on undefined). Fixed by using `@beep/schema` `LiteralKit([...]).Schema` for the
  graph node/edge vocabularies — the proven repo idiom (WinkVectorizer/Pattern). Tests are the
  real gate: `tsgo`+`biome` both passed while decode was broken, so scoped `vitest` must run
  before each commit (pre-commit hooks do NOT run tests).
- **P1 progress: 4 of ~6 groups done; full nlp suite 124 tests / 11 files green; tree clean.**
- **Process miss + recovery:** the Graph/Schema feat was first committed (`efa2534f67`) while its
  vitest was red (`LiteralKit(...).Schema` doesn't exist — the kit IS the schema; and the proof
  used non-existent `S.decodeUnknown`/`S.encode` → v4 `decodeUnknownEffect`/`encodeEffect`).
  Pre-commit hooks run biome+commitlint but NOT vitest, so it slipped. Fixed forward
  (`858b1366f0`). Reinforced rule: scoped `vitest run` is mandatory before every commit.

**CHECKPOINT — Graph engine is the inflection point.** The next group (Graph engine +
TypeClass) is **3,408 LOC across 12 files**: `EffectGraph`/`TextGraph`/`AnnotatedTextGraph`/
`GraphOps` + `GraphOperations/{Operation,Executor,Catalog,ResultStore,Schemas,Types,Errors}`
+ `TypeClass`. It must be remapped onto v4's in-core `effect/Graph` (`Graph<N,E>` /
`MutableGraph<N,E>` — a mutation-builder API materially different from adjunct's v3 wrapper),
and its type-changing `GraphOps.mapNodes<A→B>`/`bimap`/`merge` need reconstruction-based
reimplementation (v4 `Graph.mapNodes` is type-preserving). It carries the load-bearing law
suites (Adjunction triangle identities, AnnotatedTextGraph.laws, NLPOperations.laws,
TextGraph, GraphOperations/Executor). This is the highest-fidelity-risk group and deserves a
focused session with the v4 `Graph.ts` API read in full first — not a tail-end rush.

---

## P1: Staging Port

**Date:** 2026-05-29 (Graph subsystem + TypeClass COMPLETE)

**Graph subsystem fully ported (5 green commits this session):**
- `Graph/TextGraph.ts` (`d496bd6d71`) — structural text graph over `effect/Graph`; effectful
  node ctors (Clock), `addChildren` fails with tagged `GraphCycleError`, `rebuild` helper for
  type-preserving map/filter (v4 `Graph.mapNodes` mutates in place). The fix that made it green
  was adding the `./Graph` package.json **exports** subpath (tsgo uses tsconfig paths; vitest
  uses package.json exports — every new subpath needs an exports entry or vitest 404s).
- `Backend/NLPBackend.ts` (`89adf355ce`) — pluggable backend interface; 3 `TaggedErrorClass`
  errors (init/op carry `cause: S.DefectWithStack`), `Context.Service` class tag, `Struct.keys`.
- `Graph/AnnotatedTextGraph.ts` (`d92f2abb9b`) — annotation strata (POS/entity/lemma/dep) over
  the NLPBackend; **implemented `addDependencyAnnotations`** (adjunct left it a TODO).
- `Graph/GraphOps.ts` (`a3a552e75e`) — generic categorical ops; type-changing
  map/bimap/filter/mapNodesEffect go through one `reconstruct` index-remap helper (no casts);
  `merge` remaps+copies edges (adjunct left edges a TODO); HashMap/HashSet not Map/Set.
- `Graph/TypeClass.ts` (`cc10de32a4`) — TextOperation Kleisli morphisms + Functor/Monad/
  Applicative/Traversable/Foldable/adjunction; effectful node minting; `Foldable<F,A>` (not
  `Foldable<F>`) so the instance needs no `any`; covariant widening replaces adjunct's
  `as EffectGraph<A|B>`.

**CRITICAL correction (pre-compaction plan was wrong):** the carried-over "convert the 6 graph
node classes to `S.TaggedClass`" step was a **deviation, not fidelity**. adjunct's `Schema.ts`
defines ALL nodes as plain `Schema.Class` and `AnnotatedTextGraph` discriminates the union via
`instanceof` guards. Faithful port = keep `S.Class` (already green) and translate the guards to
**`S.is(Schema)`** (the repo bans `instanceof` on schema types via the `instanceOfSchema`
diagnostic). `Graph/Schema.ts` was left untouched; no churn on the already-green TextGraph.

**Repo-law is STRICTER than the P1 "enforced-bar finding" claimed.** The earlier note said the
bar is just "tsgo + biome pass" and `@beep/nlp` tolerates `as`/native arrays. In practice the
`@effect/language-service` diagnostics DO fire as tsgo errors for the new Graph code:
`instanceOfSchema` (instanceof on a Schema type) and the biome `useSortedInterfaceMembers` /
`organizeImports` / formatter rules all block `beep:check`/`beep:lint`. So new code must obey
full repo-law (S.is, sorted members, HashMap/Set, no casts) — gold-plating was correct here.

**typos hook false-positive:** the pre-commit `typos` hook flags `bimap` as a misspelling of
`bitmap`. Fixed by allowlisting `bimap = "bimap"` in `_typos.toml` under "Effect-TS API names".
Pre-commit runs gitleaks+biome+typos+commitlint but NOT vitest — scoped `pkg:verify` first.

**Reliability win:** `bun run pkg:verify @beep/nlp` (lint+check+test, failed-only output) as a
SEPARATE step before each commit caught every red before it landed — 5/5 groups committed green
on the verified attempt. Recurring trap: after `cd <pkg>`, the root-level `pkg:verify` script is
"not found" — always run it from the repo root.

**Bash channel:** degraded to ~5-call delayed-flush batches all session; mitigated by capturing
command output to `/tmp/*.txt` + reading via the (reliable) Read tool, and padding with
throwaway echo "flush" probes. No red commits resulted.

**Schema AST / SchemaASTMatchers porting notes:** (not yet — next: GraphOperations 2167 LOC,
then Operations 2829 LOC incl. SchemaASTMatchers `_tag` walker, the top fidelity risk)

**Law-suite (fast-check → effect/testing/FastCheck) porting notes:** proofs so far are
`@effect/vitest` example-based (functor identity/composition, monoid laws, adjunction-shaped
round-trips); no FastCheck property suites ported yet.

**Behavior parity vs adjunct:** node ctors are effectful (Clock/Random) where adjunct used
`Date.now()`/`crypto.randomUUID()`; otherwise structural parity (same node/edge shapes, same
annotation relations, same query semantics).

**Open questions carried to P2:**

---

## P2: Land & Merge

**Date:**

**Merge/reconciliation decisions (Token/Schema/wink/Tools):**

**Catalog diff — anything lost?:**

**Export-surface changes:**

**Open questions carried to P3:**

---

## P3: Handoff Contract

**Date:**

**IR shape decisions:**

**Alignment with KG consumption shape:**

**Property-test results (round-trip, provenance):**

**Open questions carried to P4:**

---

## P4: MCP Driver

**Date:**

**Tool list + wiring:**

**zod → McpSchema/Schema migration notes:**

**Open questions carried to P5:**

---

## P5: Verification & Docs

**Date:**

**Command results summary:**
- `pnpm check`:
- `pnpm lint-fix`:
- `pnpm test`:
- `pnpm build`:
- `bun run docgen`:
- `knip`:
- `repo-exports:catalog:check`:

**Final readiness assessment:**
