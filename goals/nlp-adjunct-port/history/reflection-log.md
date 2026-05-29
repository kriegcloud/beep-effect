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

---

## P1: Staging Port

**Date:**

**What worked:**

**What failed or was unclear:**

**Schema AST / SchemaASTMatchers porting notes:**

**Law-suite (fast-check → effect/testing/FastCheck) porting notes:**

**Behavior parity vs adjunct:**

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
