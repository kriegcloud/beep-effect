# semantic-web-idna-schema-refactor: Reflection Log

> Cumulative learnings from spec creation and implementation phases.

---

## Reflection Protocol

After each phase, document:

1. **What Worked** - Techniques that were effective
2. **What Didn't Work** - Approaches that failed or were inefficient
3. **Methodology Improvements** - Changes to apply in future phases
4. **Prompt Refinements** - Updated prompts based on learnings
5. **Codebase-Specific Insights** - Patterns unique to this repo

---

## Reflection Entries

### P0: Spec Scaffolding Review (Spec-Reviewer Loop)

1. **What Worked**
   - Treating `IDNAFromString` as the critical boundary contract clarified the whole design: strict `S.transformOrFail` + `ParseIssue` errors forces exhaustiveness.
   - Adding explicit delegation prompts (`AGENT_PROMPTS.md`) makes Phase 1 research reproducible and avoids sequential orchestrator context bloat.
2. **What Didn't Work**
   - A spec without `handoffs/` and an initial dual handoff (`HANDOFF_P1.md` + `P1_ORCHESTRATOR_PROMPT.md`) fails the multi-session standards even if the intent is “one orchestrator run”.
3. **Methodology Improvements**
   - For high-complexity specs, always scaffold: `handoffs/`, `MASTER_ORCHESTRATION.md`, `AGENT_PROMPTS.md`, and a minimal `RUBRICS.md` up front.
   - Run the spec-reviewer rubric immediately after scaffolding and fix before any implementation starts.
4. **Prompt Refinements**
   - Require explicit delegation in the orchestrator prompt (sub-agents write discovery outputs).
   - Add a context-budget stop rule (checkpoint handoff in Yellow/Red zones) to prevent “lost in middle” failures.
5. **Codebase-Specific Insights**
   - This repo already has strong `transformOrFail` exemplars (`URLFromString`, `LocalDateFromString`, service-backed transforms). Specs should always point to at least one in-repo exemplar plus one upstream Effect exemplar.

---

### P1: Implementation + Verification

1. **What Worked**
   - Keeping the algorithm core pure and returning `Either<_, ParseIssue>` made it easy to reuse the same logic for Effect APIs and Schema transforms without hidden throws.
   - Adding explicit `*Result` APIs (`toASCIIResult`, etc.) prevented `Effect.runSync` from creeping into sync consumers (`uri.ts`, `mailto.ts`) while keeping call sites straightforward.
   - Using `ParseResult.TreeFormatter.formatIssueSync(issue)` in sync paths preserved stable, structured errors without relying on `Error` stringification.
   - Migrating Effectful tests to `@beep/testkit`’s `effect(...)` harness made error assertions explicit via `Effect.either(...)`.
2. **What Didn't Work**
   - The plan language `ParseResult.ParseResult<_>` is misleading for this Effect version; the practical shape is `Either<_, ParseIssue>` plus helpers (`ParseResult.succeed/fail/try`).
   - Bun module evaluation order can surface subtle TDZ-style issues when building static surfaces that reference local exports; using namespace imports for internal helpers avoided runtime surprises.
3. **Methodology Improvements**
   - Include a tiny runtime smoke-check in the plan for modules with static surfaces (ex: `bun -e 'import { IDNA } ...'`) to catch Bun-specific evaluation quirks early.
   - In plans, spell the error surface precisely (`Either<_, ParseIssue>` + `ParseResult.parseError`) to prevent type-name confusion.
4. **Prompt Refinements**
   - When specifying “pure core helpers”, name the concrete return type (`Either.Either<A, ParseIssue>`) instead of a non-existent alias.
   - Add an explicit requirement for consumers: “use `*Result` + `TreeFormatter` for sync paths”.
5. **Codebase-Specific Insights**
   - `S.transformOrFail` decode’s `ast` parameter is load-bearing: issues must be constructed with it so Schema tooling attributes failures to the transform stage.
   - `TreeFormatter.formatIssueSync` is the most stable way to surface `ParseIssue` to legacy string-based error fields (like `components.error`).

---

## Accumulated Improvements

### Template Updates
*(None yet)*

### Process Updates
*(None yet)*

---

## Lessons Learned Summary

### Top 3 Most Valuable Techniques
1. Pure core returning `Either<_, ParseIssue>` with `ast` threaded to all failures.
2. Dual surface: Effect API (`ParseError`) + sync `*Result` API for non-Effect consumers.
3. `@beep/testkit` `effect(...)` tests + `Effect.either(...)` for failure assertions.

### Top 3 Wasted Efforts
1. Treating `ParseResult.ParseResult` as a real type alias instead of using `Either` directly.
2. Discovering Bun evaluation quirks late instead of smoke-checking the module import early.
3. N/A
