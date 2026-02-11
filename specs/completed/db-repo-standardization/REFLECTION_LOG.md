# db-repo-standardization: Reflection Log

> Cumulative learnings from spec creation and implementation phases.

---

## Reflection Protocol

After each phase, document:

1. **What Worked** — Techniques that were effective
2. **What Didn't Work** — Approaches that failed or were inefficient
3. **Methodology Improvements** — Changes to apply in future phases
4. **Prompt Refinements** — Updated prompts based on learnings
5. **Codebase-Specific Insights** — Patterns unique to this repo

---

## Reflection Entries

### P0: Scaffolding

1. **What Worked**
   - Reading current factory files to understand exact signatures before writing spec
   - Reading Comment.repo.ts as representative consumer showing both DbRepoSuccess and DbRepo.Method usage
   - Using complexity calculator to determine spec structure level

2. **What Didn't Work**
   - Initial CLI-generated spec was too generic, needed full rewrite

3. **Methodology Improvements**
   - For refactoring specs, always include "target signatures" in README with a before/after table
   - Include concrete code examples in agent prompts, not just descriptions

4. **Prompt Refinements**
   - Agent prompts should reference specific file paths, not generic descriptions
   - Include the exact grep patterns agents should use for inventory

5. **Codebase-Specific Insights**
   - `BaseRepo` is only directly referenced through `DbRepoSuccess` and `DbRepo` type aliases
   - `DbRepo.Method` is used in Comment domain for custom methods — this type may auto-adapt
   - `flow(baseRepo.insert, ...)` pattern in CommentRepo will need special handling
   - ~50 files import DbRepo types, ~49 server-side repo implementations

### P1: Inventory & Research

1. **What Worked**
   - Parallel delegation of inventory and research to separate agents maximized throughput
   - codebase-researcher found 66 unique source files with precise categorization
   - codebase-explorer's direct inspection of `.repos/effect` source code gave definitive answers about SqlSchema internals
   - Categorizing files by impact level (auto-update vs manual-update) immediately clarified migration scope

2. **What Didn't Work**
   - codebase-researcher agent is read-only and couldn't write the inventory file — orchestrator had to delegate a second write pass
   - Initial estimate of ~63 affected files (from P0) was close but understated the service/handler call sites

3. **Methodology Improvements**
   - For inventory tasks, use `general-purpose` agent (has write access) instead of `codebase-researcher` (read-only)
   - Include impact classification in inventory (auto-update / manual-update / special-attention) — this dramatically reduces Phase 5 cognitive load
   - Research agents should answer specific questions (not just "explore the API") to produce actionable findings

4. **Prompt Refinements**
   - Inventory prompts should explicitly exclude `dist/`, `node_modules/`, `.d.ts` files
   - Research prompts should list the key questions upfront and require answers to each

5. **Codebase-Specific Insights**
   - 38 of 46 server repos are "simple" (expose base CRUD unmodified via spread) — they auto-update when interface changes, NO code changes needed
   - Only 5 Documents repos and 5 Knowledge service files need manual call-site updates
   - `AccountRepo.test.ts` has 100+ direct CRUD calls — it's the most impactful test file
   - `CrossBatchEntityResolver.test.ts` has mock stubs that must match BaseRepo interface
   - `Effect.map(data => ({ data }) as const)` is the correct wrapping approach — no schema transforms needed
   - `S.Struct.Context<{ readonly data: Model["Type"] }>` is a TYPE ERROR — must use schema, not plain type
   - `O.map(option, data => ({ data }))` correctly wraps findById results
   - `flow(baseRepo.insert, ...)` pattern in CommentRepo silently changes return type — callers must be audited
   - The `DbRepo.Method` type does NOT need changes — it's independent from BaseRepo
   - `tooling/cli/src/commands/create-slice/utils/file-generator.ts` has a template that should be updated

### P2: Design

1. **What Worked**
   - Providing effect-expert agent with comprehensive context (current code, inventory, research, target signatures) in a single prompt produced a complete design document in one pass
   - The Phase 1 research was thorough enough that the design phase had zero ambiguity — every design question was already answered
   - Documenting 10 distinct consumer migration patterns (A through J) with before/after code for each provides a mechanical playbook for Phase 5
   - Decision log (D-01 through D-06) captures rationale for non-obvious choices, preventing future re-litigation

2. **What Didn't Work**
   - Nothing significant — the thorough Phase 1 research meant Phase 2 was straightforward formalization

3. **Methodology Improvements**
   - Design documents should include a Decision Log section with numbered decisions and rationale
   - Consumer migration patterns should be exhaustive — enumerate EVERY call-site shape, not just the most common
   - Migration order should explicitly state which steps can be parallelized vs which are sequential

4. **Prompt Refinements**
   - Design agent prompts should include the exact current code (not just file paths) to avoid requiring the agent to read files
   - Prompts should list all consumer patterns to address, with representative file paths for each
   - Include a "gotchas to address" section in the prompt to ensure known issues aren't overlooked

5. **Codebase-Specific Insights**
   - SplitService uses an implicit Option-as-Effect yield pattern that requires special attention during migration
   - 5 Documents repo `create` methods use `flow(baseRepo.insert, ...)` — the `{ data }` wrapper propagates silently to callers
   - Document.repo.ts has 6 `baseRepo.update` calls — each needs individual destructuring (no shortcut)
   - Handlers are the natural unwrap boundary between repo `{ data }` wrappers and RPC contract expectations
   - `MakeBaseRepoEffect` type alias resolves through `DbRepoTypes.BaseRepo` — no change needed
   - Pipe chain ordering: `SqlSchema.call -> Effect.map (wrap) -> Effect.mapError -> Effect.withSpan` is the cleanest ordering
   - `as const` assertion is necessary to satisfy `readonly data` in the interface — without it TypeScript infers mutable `data`

### P4: Core Refactor (WU-1 + WU-2)

1. **What Worked**
   - Embedding exact before/after code inline in the agent prompt (not by reference) eliminated agent file-reading overhead — the agent applied changes mechanically without needing to consult design.md
   - Combining WU-1 + WU-2 in a single agent invocation ensured atomic execution and avoided intermediate broken states
   - Isolated verification with `tsc --noEmit -p packages/shared/{domain,server}/tsconfig.json` confirmed the 2 modified files compile without triggering downstream cascading failures
   - The Phase 3 methodology improvement (embed code inline) proved correct — agent completed the task in one pass with zero errors

2. **What Didn't Work**
   - Nothing significant — the refactoring was entirely mechanical with all decisions pre-made in Phase 2

3. **Methodology Improvements**
   - For atomic multi-file changes, always run per-package `tsc --noEmit -p tsconfig.json` instead of `bun run check --filter` to avoid cascading downstream failures that are expected at this stage
   - Phase 4 confirms that thorough Phase 2 design + Phase 3 inline code embedding = trivial Phase 4 execution

4. **Prompt Refinements**
   - The "DO NOT change" section in agent prompts (listing types/functions to leave alone) was essential — prevents scope creep
   - Include verification commands in the prompt itself, not just in the plan document

5. **Codebase-Specific Insights**
   - `MakeBaseRepoEffect` type alias resolved correctly through `DbRepoTypes.BaseRepo` — no change needed (as predicted)
   - `summarizeWritePayload` and `isRecord`/`toSpanScalar` helpers required no changes — parameter renames are transparent to them
   - Both `shared-domain` and `shared-server` tsconfigs compile cleanly after changes — the typing is internally consistent

### P3: Implementation Planning

1. **What Worked**
   - Having comprehensive Phase 2 design with exact before/after code for all 10 patterns made work unit decomposition trivial — no ambiguity about what changes each file needs
   - The inventory's impact-level categorization (38 auto-update, 17 manual) directly mapped to work unit scope — Phase 3 planning was essentially mechanical
   - Organizing work units by slice (Documents repos → Documents handlers → Knowledge services) naturally aligns with verification isolation (`--filter @beep/slice-server`)
   - Combining WU-1 + WU-2 as an atomic unit prevents intermediate broken states — agents can verify they compile together
   - Identifying WU-3 → WU-4 dependency upfront prevents handler agents from starting before repo agents finish

2. **What Didn't Work**
   - Minor: the prompt's WU structure was essentially the plan already — Phase 3 added refinement (gotchas, exact patterns per file, verification commands) but the structural decomposition was already done in the prompt itself

3. **Methodology Improvements**
   - Implementation plans should include per-file pattern assignments (not just per-WU) to eliminate agent decision-making
   - Include exact search-and-replace patterns for mechanical migrations (especially test files with 100+ sites)
   - For agents handling WU-3 → WU-4 sequential dependency, consider combining into a single agent assignment to avoid inter-agent coordination overhead
   - Phase 4 orchestrator prompts should embed the exact code from design.md Sections 1 and 3, not just reference the file — this eliminates the agent needing to read and interpret the design

4. **Prompt Refinements**
   - Phase 4 agent prompts should include the FULL target interface and implementation code inline, not by reference
   - Phase 5 agent prompts should list every file with its specific patterns, not just "update files per inventory"
   - Include a "what NOT to change" section in every agent prompt (e.g., "do NOT change Method, MethodSpec, contracts")

5. **Codebase-Specific Insights**
   - ~193 total change sites across 20 files — Phase 5 parallelization is critical for throughput
   - AccountRepo.test.ts alone has 100+ change sites — this single file dominates WU-7 scope
   - SplitService.ts has 3 distinct findById call patterns (Option-as-Effect yield, O.isSome check, explicit O.match) — each requires different handling
   - Recommended execution: 4 parallel agents in Phase 5 (A: WU-3+4, B: WU-5, C: WU-6+8, D: WU-7) balances work distribution

### P5: Consumer Migration

1. **What Worked**
   - 4 parallel agents (A: Documents repos+handlers, B: Knowledge services, C: Shared handler+tooling, D: Test files) completed all work without errors on first attempt
   - Per-file pattern assignments from Phase 3 eliminated all agent decision-making — each agent applied patterns mechanically
   - Combining WU-3+WU-4 (repos+handlers) into Agent A worked perfectly — the agent could verify handlers against repo changes immediately
   - Embedding specific migration patterns (A, B, D, E, H, I, J) with before/after code in each agent prompt produced one-pass execution
   - All 3 verification gates passed clean: lint:fix (64/64), check (118/118), test (118/118)
   - SplitService's Option-as-Effect pattern (H.1) was correctly handled with `O.map(entity, ({ data }) => data)` — the specialized pattern documentation from Phase 2 paid off
   - flow() propagation (D-03) correctly identified: repos using `flow(baseRepo.insert, ...)` needed no changes — handlers unwrapped instead

2. **What Didn't Work**
   - Nothing significant — the combination of thorough Phase 1 inventory, exhaustive Phase 2 patterns, and per-file Phase 3 assignments made Phase 5 entirely mechanical
   - Minor: pre-existing failures baseline was not captured before Phase 4 (the spec template had placeholders), so post-refactor comparison relies on MEMORY.md notes rather than exact baseline data

3. **Methodology Improvements**
   - For future refactoring specs, capture exact baseline (`bun run check`, `bun run test`) output BEFORE Phase 4 core changes — store in `outputs/pre-existing-failures.md` with actual command output
   - 4 parallel agents was the right granularity for ~193 change sites across 20 files — each agent had 2-8 files, completing in comparable time
   - Test file agents (100+ mechanical changes) benefit from explicit search-and-replace patterns rather than "apply Pattern X" instructions
   - The Phase 2 investment in documenting 10 distinct patterns (A-J) was the highest-ROI activity in the entire spec — it converted Phase 5 from "complex migration" to "mechanical application"

4. **Prompt Refinements**
   - Agent prompts should include the exact current state of files (inline code) when the file has complex patterns (e.g., SplitService) — avoids the agent needing to read and interpret
   - Include verification commands specific to each agent's scope (not just global gates) for faster feedback loops
   - For test file agents, provide explicit "find X, replace with Y" patterns since the changes are purely mechanical

5. **Codebase-Specific Insights**
   - AccountRepo.test.ts had 100+ change sites but all followed a single mechanical pattern — `insert(x)` → `{ data } = insert(x)`, `findById(id)` → `findById({ id })` + unwrap `{ data }`
   - CrossBatchEntityResolver.test.ts mock stubs needed `Effect.as({ data: entity })` instead of `Effect.as(entity)` — mock interfaces must mirror real BaseRepo signatures
   - DocumentVersion.repo.ts and DocumentFile.repo.ts `create` methods use `Effect.fn` with `flow(baseRepo.insert, ...)` — the `{ data }` wrapper propagates transparently, no repo change needed
   - Knowledge server's `generate.ts` (meetingprep) accesses `bullet.id` after insert — needed `const { data: bullet } = yield*` destructuring
   - `tooling/cli/src/commands/create-slice/utils/file-generator.ts` template generates code that calls `DbRepo.make` but doesn't call base methods directly — no template changes needed

### P6: Final Verification & Spec Completion

1. **What Worked**
   - All 4 quality gates passed clean: build (65/65), check (118/118), test (118/118), lint:fix (64/64)
   - Phase 5's thorough per-agent verification meant Phase 6 was a formality — no surprises
   - The 6-phase structure (inventory → design → plan → core → consumers → verify) scaled well for a ~67 complexity score refactoring spec

2. **What Didn't Work**
   - Nothing — Phase 6 was purely verification with no issues

3. **Methodology Improvements**
   - For future specs, Phase 6 could be folded into Phase 5's final verification step if Phase 5 already runs all gates
   - The separate build gate was the only gate not covered by Phase 5 — consider adding `bun run build` to Phase 5's verification gate

4. **Codebase-Specific Insights**
   - 58/65 build tasks were cached — the refactoring only invalidated 7 package builds
   - Build took 2m41s — the todox Next.js app dominates build time

---

## Accumulated Improvements

### Template Updates
- Refactoring specs should always include target signatures with before/after table

### Process Updates
- For cross-cutting refactors, inventory phase is critical — do not skip
- Design documents should include numbered Decision Log and exhaustive consumer migration patterns
- Thorough Phase 1 research eliminates ambiguity in Phase 2 — invest heavily in research
- Implementation plans should assign per-file patterns, not just per-WU patterns
- Combine sequential dependent WUs (e.g., repos → handlers) into single agent assignments
- For atomic multi-file changes, use per-package `tsc --noEmit -p tsconfig.json` instead of turbo cascading checks
- Embed exact before/after code inline in agent prompts — eliminates file-reading overhead and produces one-pass execution
- Capture exact baseline gate output BEFORE core changes to enable precise regression comparison
- 4 parallel agents is optimal for ~193 change sites across ~20 files — balances work distribution and completion time

---

## Lessons Learned Summary

### Top Valuable Techniques
1. Reading representative consumer code (Comment.repo.ts) to understand impact
2. Complexity calculator to set appropriate spec structure
3. Before/after signature tables for clarity
4. Impact-level categorization (auto-update vs manual) reduces migration scope analysis
5. Direct inspection of Effect source code in `.repos/effect/` gives definitive API answers
6. Exhaustive consumer migration patterns (A-J) with before/after code creates a mechanical Phase 5 playbook
7. Decision log prevents re-litigation of non-obvious choices across sessions
8. Per-file pattern assignment in implementation plans eliminates agent decision-making overhead
9. Combining dependent WUs into single agent assignments avoids inter-agent coordination
10. Embedding exact before/after code inline in agent prompts produces one-pass mechanical execution with zero errors

11. Capturing pre-existing failure baselines before making changes enables precise regression comparison
12. 4 parallel agents for ~193 change sites across 20 files achieves optimal throughput without coordination overhead

### Top 3 Wasted Efforts
1. Not capturing exact baseline gate output before Phase 4 — made post-refactor comparison less precise (relied on MEMORY.md notes instead of actual data)
2. Phase 3 prompt structure largely duplicated Phase 2 design — the structural decomposition was already done, Phase 3 mostly added per-file pattern assignments (could be folded into Phase 2 for simpler specs)
3. Initial CLI-generated spec was too generic and required full rewrite — for refactoring specs, the template should include mandatory "target signatures" and "before/after" sections
