# sanitize-html-schema: Reflection Log

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

### Phase 1: Discovery (2026-01-25)

#### What Worked

1. **Parallel Agent Execution**: Launching 5 research agents simultaneously (4x codebase-researcher, 1x effect-schema-expert) maximized throughput and completed discovery in a single pass.

2. **Focused Prompts**: Giving each agent a single, specific task with clear output expectations produced comprehensive, well-organized results.

3. **Output Structure**: Specifying exact output file names and formats (markdown tables, ASCII diagrams) ensured consistent deliverables.

4. **Separation of Concerns**: Splitting research into Type Inventory, Options Matrix, Dependency Graph, and Literal-Kit Gaps provided complementary views without overlap.

#### What Didn't Work

1. **Agent File Writing**: Agents returned research as text output rather than writing to files. The orchestrator had to manually create output files from agent results.

2. **Deep S.TaggedClass Research**: The effect-schema-expert agent found limited concrete S.TaggedClass examples in the codebase. The @beep/schema package uses custom utilities (`tagged-class.ts`, `tagged-union.ts`) rather than raw Effect Schema patterns.

#### Methodology Improvements

1. **Add explicit file-writing instruction**: Future agent prompts should include "Write your results to [path] using the Write tool."

2. **Read utility files directly**: For S.TaggedClass patterns, should have directly read `packages/common/schema/src/core/generics/tagged-class.ts` instead of searching.

3. **Verify output creation**: Check for output files immediately after agent completion before proceeding.

#### Codebase-Specific Insights

1. **Custom BS utilities**: `@beep/schema` provides `BS.TaggedStruct`, `BS.TaggedUnion`, `BS.TaggedClass` wrappers - prefer these over raw Effect Schema.

2. **VulnerarbleTag typo**: The literal-kit has a typo "Vulnerarble" → should be "Vulnerable". Migration needed.

3. **Scheme safety gap**: `AllowedScheme` includes `data:` and `cid:` which are NOT in sanitize-html defaults due to security concerns.

4. **NonBooleanAttribute inconsistency**: This class extends `StringLiteralKit` directly instead of deriving from `HtmlAttribute`, breaking type hierarchy.

5. **Zero external deps**: sanitize-html module has no external dependencies beyond Effect - entirely self-contained.

---

## Accumulated Improvements

### Template Updates

1. **Agent prompts should include file-writing**: Add `Write your results to specs/[name]/outputs/[file].md` to all research agent prompts.

### Process Updates

1. **Verify outputs exist**: After agent completion, run `ls specs/[name]/outputs/` before proceeding.
2. **Read utility files for pattern research**: When researching internal patterns, directly read the source files rather than searching.

---

### Phase 2: Design (2026-01-25)

#### What Worked

1. **Parallel Agent Execution (5 agents)**: Launched all 5 design tasks simultaneously (4x effect-schema-expert, 1x mcp-researcher). All completed successfully with comprehensive outputs.

2. **Pre-Reading Context Files**: Reading `tagged-struct.ts`, `tagged-union.ts`, `string-literal-kit.ts`, and existing literal-kits BEFORE launching agents ensured agents had proper context to follow codebase patterns.

3. **Detailed Task Prompts**: Including code snippets, expected API designs, and explicit decision points (wildcard handling, callback exclusion, RegExp serialization) produced focused, actionable designs.

4. **Clear Output Paths**: Specifying exact output file paths (`outputs/design-allowed-tags.md`) ensured consistent structure.

5. **Decision Documentation**: Requiring agents to document decision rationale produced self-documenting designs with clear justification for architectural choices.

#### What Didn't Work

1. **mcp-researcher Agent File Writing**: The mcp-researcher agent for factory patterns researched comprehensively but did NOT write the output file. Had to manually create `design-factory.md` from agent results.

2. **SanitizeConfig Agent Timeout**: The SanitizeConfig agent timed out during retrieval but had already written its output file. Long-running agents need larger timeout buffers.

#### Methodology Improvements

1. **Increase TaskOutput timeout for complex tasks**: Use 180000ms (3 min) instead of 120000ms for schema design tasks that require extensive file reading.

2. **Verify file creation immediately**: Check `ls outputs/` after each agent completes rather than at the end.

3. **Backup agent output manually**: For mcp-researcher agents that may not write files, capture raw output for manual file creation.

#### Codebase-Specific Insights

1. **S.TaggedStruct for simple discriminated unions**: The codebase TaggedStruct helper isn't needed for simple variants. Plain `S.Struct({ _tag: S.Literal("X") })` is cleaner for AllTags/NoneTags variants.

2. **S.Class for complex config**: `SanitizeConfig` should use `S.Class` (not `S.Struct`) to enable factory methods and static properties.

3. **TagKey for wildcard handling**: `S.Union(HtmlTag, S.Literal("*"))` elegantly handles the `*` wildcard key pattern in attribute mappings.

4. **RegExpPattern serialization**: Store as `{ source: string, flags?: string }` for JSON serialization, with `.toRegExp()` helper for runtime conversion.

5. **S.transformOrFail over S.transform**: Sanitization can fail on malformed HTML, so `S.transformOrFail` is required for proper error handling.

#### Key Design Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Callback fields | Exclude from schema | Cannot serialize functions |
| RegExp fields | `{ source, flags }` struct | JSON-serializable |
| Wildcard key `*` | `S.Union(HtmlTag, S.Literal("*"))` | Single unified Record |
| AllowedTags defaults | Handle at options level with `S.optional` | Cleaner separation |
| Factory error handling | `ParseResult.Type` with AST | Effect integration |

---

## Lessons Learned Summary

### Top 3 Most Valuable Techniques
1. Parallel agent execution for independent research tasks
2. Specific output format requirements (tables, diagrams)
3. Task separation by concern (types, options, deps, gaps)
4. **Pre-reading context files before launching design agents**
5. **Detailed decision points in prompts produce self-documenting designs**

### Top 3 Wasted Efforts
1. Generic S.TaggedClass search when custom BS utilities exist
2. Waiting for agent file writes that didn't happen
3. Searching for patterns when direct file reads would be faster
4. **Not increasing timeout for complex design tasks**
