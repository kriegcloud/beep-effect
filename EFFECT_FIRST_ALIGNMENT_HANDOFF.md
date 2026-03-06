# Effect-First Alignment Handoff

Copy the prompt block below into a fresh Codex/GPT session.

```md
Use the `effect-first-development` skill first. Treat `.repos/effect-v4` and established repo code as higher authority than any ad-hoc local patterns.

Start with Graphiti memory lookup:
`mcp__graphiti-memory__search_memory_facts({"query":"repo-memory runtime protocol effect-first schema patterns LiteralKit S.toTaggedUnion OptionFromOptionalKey annotations effect modules sidecar lifecycle","group_ids":"[\"beep-dev\"]","max_facts":10})`

Then inspect these files before editing:
- `packages/repo-memory/domain/src/index.ts`
- `packages/runtime/protocol/src/index.ts`
- `packages/repo-memory/server/src/index.ts`
- `packages/repo-memory/drivers-local/src/index.ts`
- `packages/runtime/server/src/index.ts`

Use these as canonical local style references:
- `tooling/cli/src/commands/TsconfigSync.ts`
- `tooling/cli/src/commands/Graphiti/internal/ProxyServices.ts`
- `packages/ai/sdk/src/core/Diagnose.ts`
- `.repos/effect-v4/packages/effect/SCHEMA.md`

Your job is to directly refactor the newly created `repo-memory` and `runtime` packages so they align with this repo’s `effect-first-development` standards, especially around schema design, tagged unions, `Option` boundaries, and Effect-first runtime style.

Scope:
- Mutate only the new packages unless a tiny shared helper change is strictly required.
- Preserve current sidecar behavior unless a schema-first correction requires a compatible adjustment.
- Do not regress resource/process lifecycle. Finalizers, scope, graceful shutdown, and cleanup remain first-class.

Refactor goals:

1. Literal domains must use repo patterns.
- Replace reusable plain literal unions like `S.Union([S.Literal(...)])` with `LiteralKit(...).annotate(...)`.
- Likely targets:
  - `RepoRunKind`
  - `RepoRunStatus`
  - `SidecarHealthStatus`

2. Tagged unions must use repo-standard construction.
- Replace broad object `S.Union([...])` unions with:
  - `LiteralKit + .mapMembers + Tuple.evolve + S.toTaggedUnion(...)` for non-`_tag` discriminants.
  - `S.TaggedUnion(...)` where `_tag` is the canonical discriminant and that is cleaner.
- Likely targets:
  - `RepoRun`
  - `RunStreamEvent`

3. Nullish/optional values should be modeled with `Option` by default.
- Prefer:
  - `S.OptionFromOptionalKey`
  - `S.OptionFromOptional`
  - `S.OptionFromNullishOr`
  - `S.OptionFromNullOr`
- Replace `S.optional(...)` and `undefined`-driven domain modeling unless you can justify a documented wire-boundary exception.
- Use `effect/Option` in runtime logic instead of `undefined` checks.
- Likely targets:
  - `CitationSpan.startColumn`
  - `CitationSpan.endColumn`
  - `CitationSpan.symbolName`
  - `RepoRegistrationInput.displayName`
  - `IndexRun.completedAt`
  - `IndexRun.errorMessage`
  - `QueryRun.answer`
  - `QueryRun.completedAt`
  - `QueryRun.retrievalPacket`
  - `QueryRun.errorMessage`
  - typed error `cause` fields if retained

4. Keep schemas as the source of truth.
- `S.Class` remains the default for object models.
- Keep meaningful `$I.annote(...)` annotations everywhere.
- For non-class schemas, keep runtime type aliases aligned with repo naming rules.

5. Remove native runtime style where Effect modules fit better.
- Replace mutable arrays and `undefined` branching with Effect-first style where practical.
- Likely hotspot:
  - `buildRunEvents` currently uses a mutable native array and `undefined` checks.
- Prefer `A.make`, `A.append`, `A.appendAll`, `O.match`, `Bool.match`, `Match`, schema equivalence, and other Effect modules over native helpers.

6. Audit time/randomness/runtime boundaries.
- Review `Date.now()` and similar native helpers.
- Prefer `Clock` when not forced to sit at a boundary.
- If `globalThis.crypto.randomUUID()` remains, justify it as a boundary exception or replace it with a repo-consistent Effect approach.

7. Tighten effect/service style while you are there.
- Reusable effectful workflows should use `Effect.fn` / `Effect.fnUntraced` where appropriate.
- Keep service boundaries explicit with `ServiceMap.Service`.
- Audit typed error raising. If you find yielded/returned error objects instead of `Effect.fail(...)`, fix them.
- Do not regress sidecar shutdown semantics.

Execution expectations:
- Inspect and summarize findings first.
- Then patch the code directly.
- Keep the refactor focused on these packages.
- Call out any boundary exceptions left in place and justify each one.

Validation you must run:
- `rg -n "S\\.Union\\(\\[S\\.Literal|S\\.optional\\(|undefined|Date\\.now\\(|globalThis\\.crypto|new Array\\(|\\.push\\(" packages/repo-memory packages/runtime`
- `bunx biome check packages/repo-memory packages/runtime`
- `bunx tsc -b packages/repo-memory/domain packages/runtime/protocol packages/repo-memory/client packages/repo-memory/drivers-local packages/repo-memory/server packages/runtime/server`
- If behavior changed materially, rerun the sidecar smoke path for:
  - health
  - repo registration
  - index run
  - query run
  - SSE stream

Important constraints:
- Aggressive `Option` by default.
- Schema-first over plain runtime types.
- Use Effect modules instead of native array/object/string helpers where repo conventions already demand it.
- Resource/process lifecycle and graceful shutdown are non-negotiable.
- `.repos/effect-v4` is the best source of truth for Effect v4 APIs.

Return format:
1. Findings first.
2. Then concise change summary.
3. Then remaining risks / deferred follow-ups.
4. Include explicit file references.
5. List every intentional boundary exception you left in place.
```
