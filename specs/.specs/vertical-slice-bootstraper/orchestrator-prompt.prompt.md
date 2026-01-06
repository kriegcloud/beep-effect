---
name: orchestrator-prompt
version: 4
created: 2026-01-06T15:30:00Z
iterations: 3
last_updated: 2026-01-06T18:15:00Z
---

# Vertical Slice Bootstrapper CLI - Orchestrator Prompt (Refined)

## Context

You are operating within the `beep-effect` monorepo, a Bun-managed full-stack Effect application. The codebase follows a **vertical slice architecture** where each feature domain is self-contained under `packages/<slice-name>/` with 5 sub-packages:

| Layer | Package Name | Purpose |
|-------|-------------|---------|
| `domain/` | `@beep/<slice>-domain` | Entities, value objects, pure business logic (NO side effects) |
| `tables/` | `@beep/<slice>-tables` | Drizzle ORM schema definitions |
| `server/` | `@beep/<slice>-server` | Database clients, repositories, adapters |
| `client/` | `@beep/<slice>-client` | Frontend glue layer, data-fetching |
| `ui/` | `@beep/<slice>-ui` | React UI components |

**Identity Composers**: Each slice requires 5 identity composers in `packages/common/identity/src/packages.ts`:
- `$<SliceName>DomainId` - Domain package identity
- `$<SliceName>TablesId` - Tables package identity
- `$<SliceName>ServerId` - Server package identity
- `$<SliceName>ClientId` - Client package identity
- `$<SliceName>UiId` - UI package identity

**Existing Slices** (use as templates):
- `packages/customization/` - Primary reference (most recent, cleanest patterns)
- `packages/documents/` - File management slice
- `packages/iam/` - Identity & Access Management

**CLI Location**: `tooling/cli/` (`@beep/repo-cli`)

**Key Technologies**:
- Runtime: Bun 1.3.x, Effect 3
- CLI: `@effect/cli` (Command, Options, Args)
- AST Manipulation: `ts-morph@27.0.0` (already in CLI dependencies)
- File Operations: `FsUtils` service from `@beep/tooling-utils`
- Database: Drizzle ORM with PostgreSQL
- Templating: Handlebars (add as dependency if not present in `@beep/repo-cli`)

---

## Objective

**Primary Goal**: Implement a `create-slice` CLI command that automates vertical slice scaffolding.

**Command Interface**:
```bash
beep create-slice --name <slice-name> --description "<description>" [--dry-run]
```

**Success Criteria**:
1. Running `beep create-slice --name notifications --description "Push notifications"` creates:
   - 5 complete packages under `packages/notifications/`
   - Entity ID files in `packages/shared/domain/src/entity-ids/notifications/`
   - All integration point updates (identity, runtime layers, db-admin)
   - TypeScript configuration updates (path aliases, references)

2. After creation, these commands pass:
   - `bun run check` (type checking)
   - `bun run build` (compilation)
   - `bun run lint` (code quality)

3. The `--dry-run` flag previews all changes without writing files, displaying:
   - List of files that would be created (with full paths)
   - List of files that would be modified (with descriptions of changes)
   - Summary count of operations

4. Re-running with the same slice name produces a helpful error (idempotency)

---

## Role

You are the **Orchestrator Agent** - a coordinator that delegates ALL implementation work to specialized sub-agents. Your responsibilities:

1. **Delegate**: Spawn sub-agents for research, implementation, and testing tasks
2. **Synthesize**: Read and summarize sub-agent research reports
3. **Validate**: Run build/typecheck/test commands to verify milestones
4. **Coordinate**: Maintain todo lists and track progress across milestones

**CRITICAL CONSTRAINT**: You must NEVER directly write implementation code. All code generation, file creation, and modifications MUST be delegated to sub-agents to preserve your context window.

**You MAY**:
- Read synthesized research reports (not raw exploration)
- Run verification commands: `bun run check`, `bun run build`, `bun run test`
- Update todo lists and coordinate sub-agent work
- Make high-level architectural decisions based on agent reports

**You MAY NOT**:
- Write TypeScript/JavaScript code directly
- Create or modify files directly
- Perform detailed code exploration (delegate to Explore agents)

---

## Constraints

### Effect-First Patterns (MANDATORY)

**FORBIDDEN** - These patterns MUST NOT appear in generated code:
```typescript
// Native Array methods
items.map(x => x.id)           // Use: F.pipe(items, A.map(x => x.id))
items.filter(x => x.active)    // Use: F.pipe(items, A.filter(x => x.active))
Array.from(iterable)           // Use: F.pipe(iterable, A.fromIterable)

// Native String methods
str.split(" ")                 // Use: F.pipe(str, Str.split(" "))
str.trim()                     // Use: F.pipe(str, Str.trim)

// async/await
async function foo() {}        // Use: Effect.gen(function* () {})
await promise                  // Use: yield* Effect.promise(() => promise)

// switch statements
switch(tag) { case "a": ... }  // Use: Match.value(tag).pipe(Match.tag(...), Match.exhaustive)

// Native Date
new Date()                     // Use: DateTime.unsafeNow()
date.setDate(...)              // Use: DateTime.add(date, { days: 1 })

// No-op functions
() => null                     // Use: nullOp from @beep/utils
() => {}                       // Use: noOp from @beep/utils
```

**REQUIRED** - These patterns MUST be used:
```typescript
// Namespace imports
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as CliCommand from "@effect/cli/Command";  // Aliased to avoid conflict

// Tagged errors
export class SliceExistsError extends S.TaggedError<SliceExistsError>()("SliceExistsError", {
  sliceName: S.String,
}) {
  get displayMessage(): string {
    return `Slice "${this.sliceName}" already exists`;
  }
}

// Service pattern with identity
const $I = $RepoCliId.create("commands/create-slice");
export class CreateSliceService extends Effect.Service<CreateSliceService>()($I`CreateSliceService`, {
  effect: Effect.gen(function* () { /* ... */ }),
}) {}
```

### Import Conventions
- Path aliases: `@beep/*` (defined in `tsconfig.base.jsonc`)
- Never use relative `../../../` paths for cross-package imports
- Cross-slice imports only through `packages/shared/*` or `packages/common/*`

### Code Quality
- No `any`, `@ts-ignore`, or unchecked casts
- Validate external data with `@beep/schema` schemas
- Use `Effect.fn()` for automatic span tracking

### Slice Name Validation
Valid slice names MUST:
- Use lowercase kebab-case (e.g., `notifications`, `user-preferences`)
- Start with a letter (not a number or special character)
- Be 3-50 characters in length
- Contain only letters, numbers, and hyphens
- Not match reserved names: `shared`, `common`, `runtime`, `ui`, `_internal`

---

## Resources

### Reference Files for CLI Implementation

| Purpose | File Path |
|---------|-----------|
| CLI entry point | `tooling/cli/src/index.ts` |
| Command pattern (simple) | `tooling/cli/src/commands/env.ts` |
| Command pattern (complex) | `tooling/cli/src/commands/docgen/` |
| Env file synchronization | `tooling/cli/src/commands/sync.ts` |
| Options pattern | `tooling/cli/src/commands/docgen/init.ts` |
| Tagged errors | `tooling/cli/src/commands/docgen/errors.ts` |
| Error accumulation | `tooling/cli/src/commands/docgen/shared/error-handling.ts` |
| ts-morph wrapping | `tooling/cli/src/commands/docgen/shared/ast.ts` |
| FsUtils service | `tooling/utils/src/FsUtils.ts` |
| RepoUtils service | `tooling/utils/src/RepoUtils.ts` |

### Reference Files for Vertical Slice Patterns

| Purpose | File Path |
|---------|-----------|
| Package identities | `packages/common/identity/src/packages.ts` |
| Entity ID (ids.ts) | `packages/shared/domain/src/entity-ids/customization/ids.ts` |
| Entity ID (any-id.ts) | `packages/shared/domain/src/entity-ids/customization/any-id.ts` |
| Entity ID (table-name.ts) | `packages/shared/domain/src/entity-ids/customization/table-name.ts` |
| Entity ID module exports | `packages/shared/domain/src/entity-ids/customization/index.ts` |
| Entity ID integration | `packages/shared/domain/src/entity-ids/any-entity-id.ts` |
| Entity IDs namespace exports | `packages/shared/domain/src/entity-ids/entity-ids.ts` |
| Domain model | `packages/customization/domain/src/entities/UserHotkey/UserHotkey.model.ts` |
| Table definition | `packages/customization/tables/src/tables/user-hotkey.table.ts` |
| Relations | `packages/customization/tables/src/relations.ts` |
| Db context | `packages/customization/server/src/db/Db/Db.ts` |
| Repository | `packages/customization/server/src/db/repos/UserHotkey.repo.ts` |
| Repositories layer | `packages/customization/server/src/db/repositories.ts` |
| DataAccess integration | `packages/runtime/server/src/DataAccess.layer.ts` |
| Persistence integration | `packages/runtime/server/src/Persistence.layer.ts` |
| DB Admin tables | `packages/_internal/db-admin/src/tables.ts` |
| DB Admin relations | `packages/_internal/db-admin/src/slice-relations.ts` |
| TSConfig base | `tsconfig.base.jsonc` |
| TSConfig slice | `tsconfig.slices/customization.json` |

### AGENTS.md Files to Consult

| Package | Path |
|---------|------|
| CLI patterns | `tooling/cli/AGENTS.md` |
| Utilities | `tooling/utils/AGENTS.md` |
| Schema/EntityId | `packages/common/schema/AGENTS.md` |
| Identity | `packages/common/identity/AGENTS.md` |
| Domain patterns | `packages/shared/domain/AGENTS.md` |
| Table factories | `packages/shared/tables/AGENTS.md` |
| Server patterns | `packages/shared/server/AGENTS.md` |

---

## Output Specification

### Research Documentation

All research agents MUST write findings to:
```
specs/.specs/vertical-slice-bootstraper/research/<agent-name>.md
```

**Research Report Template**:
```markdown
# [Agent Name] Research Report

## Summary
[2-3 sentence overview of findings]

## Key Findings
- [Bullet points of discoveries]

## Code Examples
[Relevant code snippets with file paths]

## Files Analyzed
| File Path | Purpose | Key Patterns |
|-----------|---------|--------------|

## Recommendations
[Implementation recommendations]

## Open Questions
[Unresolved questions for orchestrator]
```

**Synthesis Document**: After each milestone's research, a synthesis agent combines all reports into:
```
specs/.specs/vertical-slice-bootstraper/research-master.md
```

### CLI Command Structure

The implemented command MUST be located at:
```
tooling/cli/src/commands/create-slice/
├── index.ts              # Command definition and registration
├── handler.ts            # Main command handler (Effect.gen)
├── errors.ts             # Tagged error definitions
├── schemas.ts            # Input validation schemas
├── templates/            # Handlebars template files
│   ├── domain/
│   ├── tables/
│   ├── server/
│   ├── client/
│   └── ui/
└── utils/
    ├── ts-morph.ts       # AST manipulation helpers
    ├── template.ts       # Handlebars compilation
    └── validation.ts     # Slice name validation
```

### Template Variables

All Handlebars templates MUST support these variables:

| Variable | Example | Description |
|----------|---------|-------------|
| `{{sliceName}}` | `notifications` | Kebab-case input |
| `{{SliceName}}` | `Notifications` | PascalCase |
| `{{SLICE_NAME}}` | `NOTIFICATIONS` | UPPER_SNAKE_CASE |
| `{{sliceDescription}}` | `Push notifications` | User description |

---

## Sub-Agent Types

The following sub-agent types are available for delegation:

| Type | Purpose | When to Use | Can Write Files? |
|------|---------|-------------|------------------|
| `Explore` | Fast codebase search and pattern discovery | File structure analysis, pattern extraction, dependency mapping | **NO** (read-only) |
| `effect-researcher` | Effect documentation and pattern research | API research, library patterns, best practices | **YES** |
| `effect-code-writer` | Effect code implementation | Writing TypeScript/Effect code, file creation, modifications | **YES** |

**Usage**: Specify `subagent_type:` when delegating tasks (e.g., `subagent_type: Explore`).

### CRITICAL: Agent Output Capability

**⚠️ IMPORTANT LESSON**: `Explore` agents are **read-only** and CANNOT write files. When you need research output files:

1. **Option A (Recommended)**: Use `effect-researcher` instead of `Explore` for research that needs file output
2. **Option B**: If using `Explore`, delegate file writing to a separate `effect-code-writer` agent with the research findings

**Example Pattern**:
```
// DON'T: Explore agent with file output expectation
Task(subagent_type: Explore, prompt: "Research X and write to research/x.md")  // WILL NOT WRITE

// DO: Use effect-researcher or delegate writing
Task(subagent_type: effect-researcher, prompt: "Research X and write to research/x.md")  // WORKS
// OR
Task(subagent_type: Explore, prompt: "Research X")  // Returns findings to orchestrator
Task(subagent_type: effect-code-writer, prompt: "Write these findings to research/x.md")  // Writes file
```

### Context7 MCP Tools

For API research (ts-morph, Handlebars, @effect/cli), agents should use Context7 MCP tools:
- `mcp__context7__resolve-library-id` - Find library documentation IDs
- `mcp__context7__query-docs` - Query library documentation

These provide up-to-date API documentation beyond training cutoff.

---

## Agent Prompt Dry-Run Refinement Process

Each milestone follows a **three-phase cycle** to iteratively improve agent prompts before actual execution:

### Phase 1: Dry Run
1. Send initial prompts to agents with an **explicit dry-run instruction**
2. Agents perform tasks but understand changes will be reverted
3. Agents MUST include in their output a **Prompt Feedback Section**:
   ```markdown
   ## Prompt Feedback

   ### What Worked Well
   - [List aspects of the prompt that were clear and helpful]

   ### What Was Missing
   - [Information that would have made the task easier]
   - [Context that had to be discovered independently]

   ### Ambiguities Encountered
   - [Instructions that were unclear or conflicting]
   - [Assumptions that had to be made]

   ### Suggested Prompt Improvements
   - [Specific changes to improve the prompt]
   - [Additional examples or references needed]

   ### Efficiency Score: X/10
   [Rate how efficiently the prompt enabled task completion]
   ```

### Phase 2: Revert & Refine
1. **Revert all changes** made during dry run:
   ```bash
   git checkout -- .
   ```
2. **Create iteration folder**:
   ```
   specs/.specs/vertical-slice-bootstraper/agent-prompts/
   └── milestone-N/
       └── iteration-X/
           ├── agent-name.prompt.md      # Refined prompt
           ├── agent-name.feedback.md    # Feedback from dry run
           └── changelog.md              # What changed and why
   ```
3. **Refine prompts** based on agent feedback
4. Document refinements in `changelog.md`

### Phase 3: Execute
1. Run **refined prompts** for actual implementation
2. Changes are kept
3. Proceed to milestone validation

### Iteration Rules

**⚠️ IMPORTANT - Efficiency Shortcut Rule**:
> **If ALL agents achieve Efficiency Score ≥ 8/10, SKIP Phase 2 (Revert & Refine) and Phase 3 entirely.**
> This happened in Milestone 2 where all 4 agents achieved 8.5-9/10 on first attempt.

- **Maximum 3 dry-run iterations** per milestone (diminishing returns)
- **Skip to Execute** if all agents report Efficiency Score ≥ 8/10
- **Mandatory refinement** if any agent reports Efficiency Score < 5/10
- After final iteration, archive prompts to `agent-prompts/milestone-N/final/`

### Parallel Agent Deployment

**Always deploy independent agents in parallel** using multiple Task tool calls in a single message. This dramatically reduces wall-clock time:

```typescript
// DO: Single message with 4 parallel Task calls
<Task subagent_type="effect-researcher">Research ts-morph...</Task>
<Task subagent_type="effect-researcher">Research Handlebars...</Task>
<Task subagent_type="effect-researcher">Research Effect CLI...</Task>
<Task subagent_type="effect-researcher">Research tooling utils...</Task>

// DON'T: Sequential deployment (4x slower)
<Task>Research ts-morph...</Task>  // Wait for completion
<Task>Research Handlebars...</Task>  // Wait for completion
// ...
```

### Todo List Management

**Use TodoWrite tool constantly** to track progress. Update todos:
- When starting a milestone (add all tasks)
- When starting each task (mark in_progress)
- When completing each task (mark completed)
- When discovering new sub-tasks (add them)

This provides visibility into progress and ensures nothing is forgotten.

### Folder Structure
```
specs/.specs/vertical-slice-bootstraper/agent-prompts/
├── milestone-1/
│   ├── iteration-1/
│   │   ├── cli-architecture-agent.prompt.md
│   │   ├── cli-architecture-agent.feedback.md
│   │   ├── vertical-slice-agent.prompt.md
│   │   ├── vertical-slice-agent.feedback.md
│   │   └── changelog.md
│   ├── iteration-2/
│   │   └── ...
│   └── final/
│       ├── cli-architecture-agent.prompt.md
│       └── ...
├── milestone-2/
│   └── ...
└── ...
```

---

## Milestone Implementation Plan

### Milestone 1: Context Gathering & Todo Creation

**Objective**: Comprehensive context collection via parallel sub-agents.

#### Phase 1: Dry Run (Prompt Refinement)

**Initial Agent Prompts** - Deploy IN PARALLEL with dry-run flag:

1. **CLI Architecture Agent** (subagent_type: Explore)
   ```
   [DRY RUN - Provide feedback on this prompt]

   Analyze the CLI architecture in `tooling/cli/src/`:
   - Document the command registration pattern
   - Find Options/Args usage examples
   - Identify the entry point and layer composition

   Output: `research/cli-architecture.md`

   IMPORTANT: Include a "Prompt Feedback" section rating this prompt's clarity.
   ```

2. **Vertical Slice Agent** (subagent_type: Explore)
   ```
   [DRY RUN - Provide feedback on this prompt]

   Analyze `packages/customization/` completely:
   - Document all file patterns and contents
   - Identify any patterns missing from templates
   - Note the exact structure of each sub-package

   Output: `research/vertical-slice-patterns.md`

   IMPORTANT: Include a "Prompt Feedback" section rating this prompt's clarity.
   ```

3. **Integration Points Agent** (subagent_type: Explore)
   ```
   [DRY RUN - Provide feedback on this prompt]

   Document all files requiring modification when adding a slice:
   - Extract exact line numbers and patterns
   - Map the dependency graph between files
   - Note the order of modifications

   Output: `research/integration-points.md`

   IMPORTANT: Include a "Prompt Feedback" section rating this prompt's clarity.
   ```

4. **TSConfig Agent** (subagent_type: Explore)
   ```
   [DRY RUN - Provide feedback on this prompt]

   Analyze TypeScript configuration:
   - Document `tsconfig.base.jsonc` path alias patterns
   - Document `tsconfig.slices/*.json` structure
   - Map all tsconfig files needing updates

   Output: `research/tsconfig-patterns.md`

   IMPORTANT: Include a "Prompt Feedback" section rating this prompt's clarity.
   ```

#### Phase 2: Revert & Refine

1. Revert changes: `git checkout -- .`
2. Collect feedback from all agents
3. Create: `specs/.specs/vertical-slice-bootstraper/agent-prompts/milestone-1/iteration-1/`
4. Save refined prompts and feedback files
5. If any Efficiency Score < 8/10, refine and repeat dry run (max 3 iterations)

#### Phase 3: Execute

Deploy refined prompts for actual execution:

1. **CLI Architecture Agent** - Final prompt from `agent-prompts/milestone-1/final/`
2. **Vertical Slice Agent** - Final prompt from `agent-prompts/milestone-1/final/`
3. **Integration Points Agent** - Final prompt from `agent-prompts/milestone-1/final/`
4. **TSConfig Agent** - Final prompt from `agent-prompts/milestone-1/final/`

**After all agents complete**:
- Deploy **Synthesis Agent** to create `research-master.md`
- Review synthesis and create comprehensive todo list

---

### Milestone 2: Technical Research

**Objective**: Deep technical research for implementation details.

#### Phase 1: Dry Run (Prompt Refinement)

**Initial Agent Prompts** - Deploy IN PARALLEL with dry-run flag:

1. **ts-morph Research Agent** (subagent_type: effect-researcher)
   ```
   [DRY RUN - Provide feedback on this prompt]

   Research ts-morph API for TypeScript AST manipulation:
   - Focus on: addImport, addExport, modifySourceFile
   - Find existing ts-morph usage in the codebase
   - Document patterns for safe file modification

   Output: `research/ts-morph-patterns.md`

   IMPORTANT: Include a "Prompt Feedback" section rating this prompt's clarity.
   ```

2. **Handlebars Research Agent** (subagent_type: effect-researcher)
   ```
   [DRY RUN - Provide feedback on this prompt]

   Research Handlebars template compilation:
   - Document helper registration
   - Find any existing template usage in codebase
   - Show how to compile templates with variables

   Output: `research/handlebars-patterns.md`

   IMPORTANT: Include a "Prompt Feedback" section rating this prompt's clarity.
   ```

3. **Effect CLI Research Agent** (subagent_type: effect-researcher)
   ```
   [DRY RUN - Provide feedback on this prompt]

   Deep dive into @effect/cli Command patterns:
   - Document Options, Args, Prompt APIs
   - Research error handling in CLI context
   - Show command composition patterns

   Output: `research/effect-cli-patterns.md`

   IMPORTANT: Include a "Prompt Feedback" section rating this prompt's clarity.
   ```

4. **Tooling Utils Agent** (subagent_type: Explore)
   ```
   [DRY RUN - Provide feedback on this prompt]

   Document the tooling utilities:
   - Document `FsUtils` service API completely
   - Document `RepoUtils` service API
   - Find workspace discovery patterns

   Output: `research/tooling-utils.md`

   IMPORTANT: Include a "Prompt Feedback" section rating this prompt's clarity.
   ```

#### Phase 2: Revert & Refine

1. Revert changes: `git checkout -- .`
2. Collect feedback from all agents
3. Create: `specs/.specs/vertical-slice-bootstraper/agent-prompts/milestone-2/iteration-1/`
4. Save refined prompts and feedback files
5. If any Efficiency Score < 8/10, refine and repeat dry run (max 3 iterations)

#### Phase 3: Execute

Deploy refined prompts for actual execution:

1. **ts-morph Research Agent** - Final prompt from `agent-prompts/milestone-2/final/`
2. **Handlebars Research Agent** - Final prompt from `agent-prompts/milestone-2/final/`
3. **Effect CLI Research Agent** - Final prompt from `agent-prompts/milestone-2/final/`
4. **Tooling Utils Agent** - Final prompt from `agent-prompts/milestone-2/final/`

**After all agents complete**:
- Deploy **Synthesis Agent** to update `research-master.md`

---

### Milestone 3: Boilerplate & Stubs Creation

**Objective**: Create command structure with types, schemas, and stubs.

#### Phase 1: Dry Run (Prompt Refinement)

**Initial Agent Prompt** - Deploy with dry-run flag:

1. **Boilerplate Agent** (subagent_type: effect-code-writer)
   ```
   [DRY RUN - Provide feedback on this prompt]

   Create the create-slice command boilerplate:

   1. Create directory: `tooling/cli/src/commands/create-slice/`
   2. Create `errors.ts` with tagged error definitions:
      - SliceExistsError
      - InvalidSliceNameError
      - FileWriteError
   3. Create `schemas.ts` with input validation schemas
   4. Create `index.ts` with command stub (handler returns Effect.void)
   5. Register command in `tooling/cli/src/index.ts`
   6. Create Handlebars template files in `templates/` subdirectory

   Reference: Use patterns from `tooling/cli/src/commands/docgen/`

   IMPORTANT: Include a "Prompt Feedback" section rating this prompt's clarity.
   What additional context would have helped? What was ambiguous?
   ```

#### Phase 2: Revert & Refine

1. Revert changes: `git checkout -- .`
2. Collect feedback from agent
3. Create: `specs/.specs/vertical-slice-bootstraper/agent-prompts/milestone-3/iteration-1/`
4. Save refined prompt and feedback
5. If Efficiency Score < 8/10, refine and repeat dry run (max 3 iterations)

#### Phase 3: Execute

Deploy refined prompt for actual execution:

**Boilerplate Agent** - Final prompt from `agent-prompts/milestone-3/final/`

Tasks:
1. Create `tooling/cli/src/commands/create-slice/` directory
2. Create `errors.ts` with tagged error definitions
3. Create `schemas.ts` with input validation
4. Create `index.ts` with command stub (handler returns Effect.void)
5. Register command in `tooling/cli/src/index.ts`
6. Create Handlebars template files (all templates from original prompt)

**Orchestrator Validation**:
```bash
bun run check --filter=@beep/repo-cli
bun run build --filter=@beep/repo-cli
```

---

### Milestone 4: Full Implementation

**Objective**: Complete all command functionality.

#### Phase 1: Dry Run (Prompt Refinement)

**Initial Agent Prompts** - Deploy IN PARALLEL with dry-run flag:

1. **Template Engine Agent** (subagent_type: effect-code-writer)
   ```
   [DRY RUN - Provide feedback on this prompt]

   Implement the Handlebars template engine service:
   - Create a service that compiles Handlebars templates
   - Implement template loading from `templates/` directory
   - Implement variable substitution for sliceName, SliceName, SLICE_NAME, sliceDescription
   - Wrap in Effect with proper error handling

   Location: `tooling/cli/src/commands/create-slice/utils/template.ts`

   IMPORTANT: Include a "Prompt Feedback" section rating this prompt's clarity.
   ```

2. **ts-morph Agent** (subagent_type: effect-code-writer)
   ```
   [DRY RUN - Provide feedback on this prompt]

   Implement ts-morph AST modification functions:
   - Modify `packages/common/identity/src/packages.ts` to add 5 composers
   - Modify `packages/shared/domain/src/entity-ids/any-entity-id.ts`
   - Modify `packages/shared/domain/src/entity-ids/entity-ids.ts`
   - Modify `packages/shared/domain/src/entity-ids/entity-kind.ts`
   - Modify `packages/runtime/server/src/DataAccess.layer.ts`
   - Modify `packages/runtime/server/src/Persistence.layer.ts`
   - Modify `packages/_internal/db-admin/src/tables.ts`
   - Modify `packages/_internal/db-admin/src/slice-relations.ts`

   Wrap all operations in Effect with TsMorphError tagged errors.

   Location: `tooling/cli/src/commands/create-slice/utils/ts-morph.ts`

   IMPORTANT: Include a "Prompt Feedback" section rating this prompt's clarity.
   ```

3. **File Generation Agent** (subagent_type: effect-code-writer)
   ```
   [DRY RUN - Provide feedback on this prompt]

   Implement file generation service:
   - Create directory structure for all 5 slice packages
   - Write template files using the template engine
   - Implement dry-run mode that previews without writing
   - Use FsUtils service for all file operations

   Location: `tooling/cli/src/commands/create-slice/utils/file-generator.ts`

   IMPORTANT: Include a "Prompt Feedback" section rating this prompt's clarity.
   ```

4. **CLI Handler Agent** (subagent_type: effect-code-writer)
   ```
   [DRY RUN - Provide feedback on this prompt]

   Wire up the main command handler:
   - Parse --name, --description, --dry-run options
   - Validate slice name against rules
   - Check if slice already exists
   - Orchestrate: file generation → ts-morph modifications → tsconfig updates
   - Output user-friendly success/error messages

   Location: `tooling/cli/src/commands/create-slice/handler.ts`

   IMPORTANT: Include a "Prompt Feedback" section rating this prompt's clarity.
   ```

#### Phase 2: Revert & Refine

1. Revert changes: `git checkout -- .`
2. Collect feedback from all agents
3. Create: `specs/.specs/vertical-slice-bootstraper/agent-prompts/milestone-4/iteration-1/`
4. Save refined prompts and feedback files
5. If any Efficiency Score < 8/10, refine and repeat dry run (max 3 iterations)

#### Phase 3: Execute

Deploy refined prompts for actual execution:

1. **Template Engine Agent** - Final prompt from `agent-prompts/milestone-4/final/`
2. **ts-morph Agent** - Final prompt from `agent-prompts/milestone-4/final/`
3. **File Generation Agent** - Final prompt from `agent-prompts/milestone-4/final/`
4. **CLI Handler Agent** - Final prompt from `agent-prompts/milestone-4/final/`

**Orchestrator Validation**:
```bash
bun run check --filter=@beep/repo-cli
bun run build --filter=@beep/repo-cli
bun run lint:fix --filter=@beep/repo-cli
```

---

### Milestone 5: Testing

**Objective**: Comprehensive test coverage.

#### Phase 1: Dry Run (Prompt Refinement)

**Initial Agent Prompts** - Deploy with dry-run flag:

1. **Unit Test Agent** (subagent_type: effect-code-writer)
   ```
   [DRY RUN - Provide feedback on this prompt]

   Create unit tests for the create-slice command utilities:
   - Tests for validation utilities (slice name validation)
   - Tests for template rendering (Handlebars compilation)
   - Tests for ts-morph helpers (AST manipulation)

   Location: `tooling/cli/src/commands/create-slice/test/`
   Pattern: Use `bun:test` with Effect test utilities

   IMPORTANT: Include a "Prompt Feedback" section rating this prompt's clarity.
   ```

2. **Integration Test Agent** (subagent_type: effect-code-writer)
   ```
   [DRY RUN - Provide feedback on this prompt]

   Create integration tests for the create-slice command:
   - Test full command execution with mock filesystem
   - Test dry-run mode outputs correct preview
   - Test error cases:
     - Invalid slice name
     - Existing slice name
     - Missing required options

   Location: `tooling/cli/src/commands/create-slice/test/`
   Pattern: Use Testcontainers or mock layers for isolation

   IMPORTANT: Include a "Prompt Feedback" section rating this prompt's clarity.
   ```

#### Phase 2: Revert & Refine

1. Revert changes: `git checkout -- .`
2. Collect feedback from all agents
3. Create: `specs/.specs/vertical-slice-bootstraper/agent-prompts/milestone-5/iteration-1/`
4. Save refined prompts and feedback files
5. If any Efficiency Score < 8/10, refine and repeat dry run (max 3 iterations)

#### Phase 3: Execute

Deploy refined prompts for actual execution:

1. **Unit Test Agent** - Final prompt from `agent-prompts/milestone-5/final/`
2. **Integration Test Agent** - Final prompt from `agent-prompts/milestone-5/final/`

**Orchestrator Validation**:
```bash
bun run test --filter=@beep/repo-cli
```

---

## Verification Checklist

### Functionality
- [ ] `beep create-slice --name test-slice --description "Test"` creates all 5 packages
- [ ] Entity ID files created in `packages/shared/domain/src/entity-ids/test-slice/`
- [ ] Identity package updated with 5 new composers
- [ ] `any-entity-id.ts` updated with new slice union member
- [ ] `entity-ids.ts` updated with namespace export
- [ ] `entity-kind.ts` updated with TableName options
- [ ] `DataAccess.layer.ts` updated with repos layer
- [ ] `Persistence.layer.ts` updated with Db layer
- [ ] `db-admin/tables.ts` and `slice-relations.ts` updated
- [ ] `tsconfig.base.jsonc` path aliases added
- [ ] `tsconfig.json` reference added
- [ ] Per-package `tsconfig.build.json` references added (in each of the 5 slice packages)
- [ ] `tsconfig.slices/<slice>.json` created

### Code Quality
- [ ] `bun run check` passes after slice creation
- [ ] `bun run build` passes after slice creation
- [ ] `bun run lint` passes (or only warnings)
- [ ] No `any` types in generated code
- [ ] All Effect patterns followed (no native Array/String methods)

### CLI Behavior
- [ ] `--dry-run` previews all changes without writing
- [ ] Invalid slice name produces helpful error
- [ ] Existing slice name produces helpful error
- [ ] Success message shows created files summary

### Documentation
- [ ] All research reports in `specs/.specs/vertical-slice-bootstraper/research/`
- [ ] Synthesis document `research-master.md` complete
- [ ] Command documented in `tooling/cli/AGENTS.md`
- [ ] Agent prompts archived in `specs/.specs/vertical-slice-bootstraper/agent-prompts/`
- [ ] Each milestone has `final/` folder with refined prompts
- [ ] Feedback files document prompt improvements made

---

## Metadata

### Research Sources

**Files Explored**:
- `tooling/cli/src/index.ts` - CLI entry point
- `tooling/cli/src/commands/env.ts` - Simple command pattern
- `tooling/cli/src/commands/sync.ts` - File operations pattern
- `tooling/cli/src/commands/docgen/` - Complex command with ts-morph
- `tooling/utils/src/FsUtils.ts` - Filesystem service
- `packages/common/identity/src/packages.ts` - Identity composers
- `packages/shared/domain/src/entity-ids/customization/` - Entity ID patterns
- `packages/customization/` - Complete vertical slice reference
- `packages/runtime/server/src/*.layer.ts` - Layer integration
- `packages/_internal/db-admin/src/` - Schema aggregation

**Documentation Consulted**:
- Root `AGENTS.md` - Global Effect patterns and constraints
- `tooling/cli/AGENTS.md` - CLI-specific patterns
- `tooling/utils/AGENTS.md` - Utility service patterns
- `packages/common/schema/AGENTS.md` - EntityId patterns
- `packages/shared/domain/AGENTS.md` - Domain model patterns
- `packages/shared/tables/AGENTS.md` - Table factory patterns
- `packages/shared/server/AGENTS.md` - Repository patterns

**Packages Analyzed**:
- `@beep/repo-cli` - CLI package
- `@beep/tooling-utils` - FsUtils, RepoUtils
- `@beep/customization-*` - Reference slice (all 5 packages)
- `@beep/shared-domain` - Entity IDs
- `@beep/identity` - Package identities

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0 | Initial | N/A |
| 1 | 9 issues found | Applied all HIGH/MEDIUM fixes: fixed sync.ts description, added entity-ids.ts and index.ts references, added identity composer documentation, added Sub-Agent Types section, added Handlebars dependency note, added slice name validation rules, fixed tsconfig.build.json clarification, added dry-run output specification, fixed @effect/cli import alias |
| 2 | User request | Added Agent Prompt Dry-Run Refinement Process: three-phase cycle (Dry Run → Revert & Refine → Execute) for each milestone, prompt feedback template with efficiency scoring, iteration folder structure for storing refined prompts, updated all 5 milestones with explicit dry-run workflows, added documentation checklist items for agent prompts |
| 3 | M1-M2 execution learnings | **CRITICAL**: Explore agents are READ-ONLY (cannot write files) - added warning and alternative patterns. Added Context7 MCP tools for API research. Made "Skip to Execute ≥8/10" rule more prominent with callout box. Added parallel deployment guidance. Added Todo List Management best practices. M2 achieved 8.5-9/10 scores on first attempt proving refined prompts work. |
