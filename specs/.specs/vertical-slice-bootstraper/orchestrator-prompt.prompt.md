---
name: orchestrator-prompt
version: 1
created: 2026-01-06T15:30:00Z
iterations: 0
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

3. The `--dry-run` flag previews all changes without writing files

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

---

## Resources

### Reference Files for CLI Implementation

| Purpose | File Path |
|---------|-----------|
| CLI entry point | `tooling/cli/src/index.ts` |
| Command pattern (simple) | `tooling/cli/src/commands/env.ts` |
| Command pattern (complex) | `tooling/cli/src/commands/sync.ts` |
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
| Entity ID integration | `packages/shared/domain/src/entity-ids/any-entity-id.ts` |
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

## Milestone Implementation Plan

### Milestone 1: Context Gathering & Todo Creation

**Objective**: Comprehensive context collection via parallel sub-agents.

**Deploy these agents IN PARALLEL**:

1. **CLI Architecture Agent** (subagent_type: Explore)
   - Analyze `tooling/cli/src/` structure
   - Document command registration pattern
   - Find Options/Args usage examples
   - Output: `research/cli-architecture.md`

2. **Vertical Slice Agent** (subagent_type: Explore)
   - Analyze `packages/customization/` completely
   - Document all file patterns and contents
   - Identify any patterns missing from templates
   - Output: `research/vertical-slice-patterns.md`

3. **Integration Points Agent** (subagent_type: Explore)
   - Document all files requiring modification
   - Extract exact line numbers and patterns
   - Map dependency graph
   - Output: `research/integration-points.md`

4. **TSConfig Agent** (subagent_type: Explore)
   - Analyze `tsconfig.base.jsonc` path alias patterns
   - Document `tsconfig.slices/*.json` structure
   - Map all tsconfig files needing updates
   - Output: `research/tsconfig-patterns.md`

**After all agents complete**:
- Deploy **Synthesis Agent** to create `research-master.md`
- Review synthesis and create comprehensive todo list

---

### Milestone 2: Technical Research

**Objective**: Deep technical research for implementation details.

**Deploy these agents IN PARALLEL**:

1. **ts-morph Research Agent** (subagent_type: effect-researcher)
   - Research ts-morph API for TypeScript AST manipulation
   - Focus on: addImport, addExport, modifySourceFile
   - Find existing ts-morph usage in codebase
   - Output: `research/ts-morph-patterns.md`

2. **Handlebars Research Agent** (subagent_type: effect-researcher)
   - Research Handlebars template compilation
   - Document helper registration
   - Find any existing template usage
   - Output: `research/handlebars-patterns.md`

3. **Effect CLI Research Agent** (subagent_type: effect-researcher)
   - Deep dive into `@effect/cli` Command patterns
   - Document Options, Args, Prompt APIs
   - Research error handling in CLI context
   - Output: `research/effect-cli-patterns.md`

4. **Tooling Utils Agent** (subagent_type: Explore)
   - Document `FsUtils` service API completely
   - Document `RepoUtils` service API
   - Find workspace discovery patterns
   - Output: `research/tooling-utils.md`

**After all agents complete**:
- Deploy **Synthesis Agent** to update `research-master.md`

---

### Milestone 3: Boilerplate & Stubs Creation

**Objective**: Create command structure with types, schemas, and stubs.

**Deploy Implementation Agent** (subagent_type: effect-code-writer):
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

**Deploy these agents IN PARALLEL**:

1. **Template Engine Agent** (subagent_type: effect-code-writer)
   - Implement Handlebars compilation service
   - Create template loading and rendering
   - Implement variable substitution

2. **ts-morph Agent** (subagent_type: effect-code-writer)
   - Implement AST modification functions
   - Handle: identity package, entity-ids, runtime layers, db-admin
   - Wrap all operations in Effect with proper errors

3. **File Generation Agent** (subagent_type: effect-code-writer)
   - Implement directory creation
   - Implement template file writing
   - Handle dry-run mode

4. **CLI Handler Agent** (subagent_type: effect-code-writer)
   - Wire up main command handler
   - Implement input validation
   - Implement conflict detection (slice exists check)
   - Add user-friendly output messages

**Orchestrator Validation**:
```bash
bun run check --filter=@beep/repo-cli
bun run build --filter=@beep/repo-cli
bun run lint:fix --filter=@beep/repo-cli
```

---

### Milestone 5: Testing

**Objective**: Comprehensive test coverage.

**Deploy Test Agents**:

1. **Unit Test Agent** (subagent_type: effect-code-writer)
   - Tests for validation utilities
   - Tests for template rendering
   - Tests for ts-morph helpers

2. **Integration Test Agent** (subagent_type: effect-code-writer)
   - Test full command execution with mock filesystem
   - Test dry-run mode
   - Test error cases (invalid name, existing slice)

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
- [ ] `tsconfig.build.json` references added
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
