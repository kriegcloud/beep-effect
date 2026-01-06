# Handoff Prompt for Claude 4.5 Opus

> Use this to continue implementing the `create-slice` CLI command in the `beep-effect` monorepo.

---

## Quick Start

**Read this file first**, then execute:

```
Read /home/elpresidank/YeeBois/projects/beep-effect/specs/.specs/vertical-slice-bootstraper/orchestrator-prompt.prompt.md
```

That file contains the complete specification. This handoff summarizes what's been done and what remains.

---

## Project Summary

**Goal**: Implement `beep create-slice --name <slice-name> --description "<description>" [--dry-run]` CLI command that automates vertical slice scaffolding in the `beep-effect` monorepo.

**Location**: `tooling/cli/` (`@beep/repo-cli`)

**Architecture**: You are the **Orchestrator Agent** - delegate ALL code implementation to sub-agents. Never write code directly.

---

## Completed Work

### Milestone 1: Context Gathering ✅

**Research Documents Created** (`specs/.specs/vertical-slice-bootstraper/outputs/milestone-1/`):
| File | Size | Content |
|------|------|---------|
| `cli-architecture-patterns.md` | 18KB | Command registration, Options API, Effect-first CLI patterns |
| `vertical-slice-patterns.md` | 25KB | 5-sub-package structure, entity ID registration, scaffolding checklist |
| `integration-points-map.md` | 18KB | 9 integration points with before/after examples |
| `tsconfig-patterns.md` | 19KB | TSConfig per layer, path aliases, generation templates |

**Key Findings**:
- 5 sub-packages per slice: domain, tables, server, client, ui
- 9 integration points requiring file creation/modification
- 4 phases of implementation with dependency ordering

### Milestone 2: Technical Research ✅

**Research Documents Created** (`specs/.specs/vertical-slice-bootstraper/research/`):
| File | Size | Efficiency | Content |
|------|------|------------|---------|
| `ts-morph-patterns.md` | 32KB | 8.5/10 | AST manipulation, imports, exports, array modification |
| `handlebars-patterns.md` | 25KB | 9/10 | Template compilation, helpers, Effect integration |
| `effect-cli-patterns.md` | 34KB | 9/10 | Command, Options, Args, Prompt APIs |
| `tooling-utils.md` | 12KB | 9/10 | FsUtils, RepoUtils service patterns |

**Synthesis Document**: `specs/.specs/vertical-slice-bootstraper/research-master.md` (updated with M2 findings)

**Key Technical Decisions**:
1. **Template Storage**: Handlebars `.hbs` files in `tooling/cli/src/templates/`
2. **ts-morph vs Templates**: Handlebars for new files, ts-morph for modifying existing files
3. **JSON/JSONC**: Use `jsonc-parser` (NOT ts-morph) for tsconfig files
4. **Interactive Mode**: Use `@effect/cli/Prompt` for missing options
5. **Error Recovery**: Track created files, rollback on failure

---

## Remaining Work

### Milestone 3: Boilerplate & Stubs Creation (NEXT)

**Objective**: Create command structure with types, schemas, and stubs.

**Deploy Boilerplate Agent** (subagent_type: `effect-code-writer`):
- Create `tooling/cli/src/commands/create-slice/` directory
- Create `errors.ts` with tagged error definitions (SliceExistsError, InvalidSliceNameError, FileWriteError)
- Create `schemas.ts` with input validation schemas
- Create `index.ts` with command stub (handler returns Effect.void)
- Register command in `tooling/cli/src/index.ts`
- Create Handlebars template files in `templates/` subdirectory

**Validation**:
```bash
bun run check --filter=@beep/repo-cli
bun run build --filter=@beep/repo-cli
```

### Milestone 4: Full Implementation

**Objective**: Complete all command functionality.

**Deploy 4 agents IN PARALLEL** (subagent_type: `effect-code-writer`):
1. **Template Engine Agent** - Handlebars template service
2. **ts-morph Agent** - AST modification functions
3. **File Generation Agent** - Directory/file creation with FsUtils
4. **CLI Handler Agent** - Main command handler wiring

### Milestone 5: Testing

**Objective**: Comprehensive test coverage.

**Deploy 2 agents**:
1. **Unit Test Agent** - Tests for validation, templates, ts-morph helpers
2. **Integration Test Agent** - Full command execution tests, dry-run, error cases

---

## Critical Learnings (Apply These!)

### 1. Explore Agents are READ-ONLY

`Explore` agents CANNOT write files. Use `effect-researcher` or `effect-code-writer` for agents that need to produce output files.

### 2. Parallel Agent Deployment

Deploy independent agents in parallel (single message, multiple Task calls). This dramatically reduces execution time.

### 3. Efficiency Shortcut Rule

If ALL agents achieve Efficiency Score ≥ 8/10, SKIP the Revert & Refine phase entirely. M2 achieved 8.5-9/10 on first attempt.

### 4. Todo List Management

Use TodoWrite constantly to track progress. Update when starting tasks, completing tasks, and discovering sub-tasks.

### 5. Context7 for API Research

Use `mcp__context7__resolve-library-id` and `mcp__context7__query-docs` for researching external library APIs (ts-morph, Handlebars, @effect/cli).

---

## Key Files to Reference

| Purpose | Path |
|---------|------|
| **Main Specification** | `specs/.specs/vertical-slice-bootstraper/orchestrator-prompt.prompt.md` |
| **Research Synthesis** | `specs/.specs/vertical-slice-bootstraper/research-master.md` |
| **M1 Research Outputs** | `specs/.specs/vertical-slice-bootstraper/outputs/milestone-1/` |
| **M2 Technical Research** | `specs/.specs/vertical-slice-bootstraper/research/` |
| **Agent Prompts** | `specs/.specs/vertical-slice-bootstraper/agent-prompts/` |
| **Reference Slice** | `packages/customization/` |
| **CLI Entry Point** | `tooling/cli/src/index.ts` |

---

## Current State Summary

```
Milestones:
[✅] 1. Context Gathering - Complete (4 research docs)
[✅] 2. Technical Research - Complete (4 research docs, 8.5-9/10 efficiency)
[  ] 3. Boilerplate & Stubs - NOT STARTED
[  ] 4. Full Implementation - NOT STARTED
[  ] 5. Testing - NOT STARTED
```

**Git Status**: Some modified files exist (unrelated to this task). Research documents are written but not committed.

---

## First Actions for Fresh Session

1. **Read the orchestrator prompt**:
   ```
   Read specs/.specs/vertical-slice-bootstraper/orchestrator-prompt.prompt.md
   ```

2. **Create todo list** with remaining milestones (3, 4, 5)

3. **Start Milestone 3**: Deploy Boilerplate Agent to create command structure

4. **Validate**: Run `bun run check --filter=@beep/repo-cli` after M3 completion

---

## Effect-First Reminders

All generated code MUST follow these patterns:

```typescript
// USE Effect patterns
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as Str from "effect/String";
import * as F from "effect/Function";

F.pipe(items, A.map(x => x.id));     // NOT items.map(x => x.id)
F.pipe(str, Str.trim);               // NOT str.trim()
Effect.gen(function* () { ... });     // NOT async/await
```

No `any`, no `@ts-ignore`, no native Array/String methods, no `async/await`.

---

**Good luck! The research phase is complete - now it's time to build.**
