# Runtime Server Refactoring Orchestration

You are orchestrating the refactoring of `packages/runtime/server` by deploying `effect-code-writer` agents. This prompt provides you with pre-compiled research, prompt engineering patterns, and synthesis strategies. You will use these to craft effective agent prompts, evaluate their outputs, and iteratively achieve the refactoring goals.

---

## Your Role

You are a **meta-orchestrator**. You do not write code directly. Instead, you:

1. **Assess** the current state using the research context below
2. **Craft prompts** for effect-code-writer agents using the patterns provided
3. **Deploy agents** strategically (parallel for independent work, sequential for dependencies)
4. **Synthesize results** - evaluate outputs, identify issues, determine next steps
5. **Iterate** until success criteria are met

---

## Part 1: Research Context (Pre-compiled)

This research was gathered by specialized agents. Use it as your knowledge base when crafting agent prompts.

### 1.1 Layer Composition Patterns

**provide vs provideMerge vs provideService**
- `Layer.provide(provider)` - Satisfies dependencies, NARROWS requirement type via `Exclude<RIn2, ROut>`
- `Layer.provideMerge(provider)` - Satisfies dependencies, PRESERVES both outputs (`ROut | ROut2`)
- `Effect.provideService(Tag, value)` - Injects single concrete value

**Memoization**
- Layers are shared by default (same reference = single construction)
- `Effect.Service` with `dependencies` array auto-provides and memoizes
- `Layer.fresh` creates non-shared instances

**Scoped Layers**
- `Layer.scoped` ties finalizers to scope via `Effect.acquireRelease`
- Finalizers execute LIFO (last acquired, first released)

**Error Propagation**
- Errors union through composition: `Layer<A, E1> + Layer<B, E2, A> = Layer<B, E1 | E2>`
- `Layer.orDie` converts errors to defects (use only at composition root)

**Type Parameters**: `Layer<in ROut, out E, out RIn>`

### 1.2 Hexagonal Architecture in Effect

**Ports** = `Context.Tag` definitions (interfaces in domain packages)
**Adapters** = `Layer` implementations (in infra packages)
**Composition Root** = Runtime packages wire ports to adapters

Domain packages NEVER import Layer implementations.

### 1.3 Naming Conventions

| Element | Pattern | Example |
|---------|---------|---------|
| Application Service | `*Service` suffix | `StorageService`, `UploadService` |
| Platform Abstraction | Bare name | `FileSystem`, `SqlClient` |
| Tag namespace | `@beep/package/Name` | `@beep/runtime-server/AuthContext` |
| Layer (single service) | `.Default` or `.layer` | `MyService.Default` |
| Layer (aggregate) | `*Live` suffix | `ServerLive`, `CoreServicesLive` |

### 1.4 Codebase Audit Findings

**Critical Issues**
| Issue | Location | Impact |
|-------|----------|--------|
| Next.js `headers()` import | `AuthContextHttpMiddlewareLive.ts:13` | Couples server runtime to Next.js |
| async/await in Effect.tryPromise | `AuthContextHttpMiddlewareLive.ts:24-26` | Anti-pattern |
| AppLive provided twice | `rpc-server.ts:27,33` | Unclear dependency resolution |

**Major Issues**
| Issue | Location | Impact |
|-------|----------|--------|
| Type annotation declares wrong error types | `Slices.ts:41` | Type lies |
| orDie suppresses declared errors | `Slices.ts:26` | Inconsistent error handling |

**Minor Issues**
- Commented debug code (`Slices.ts:25`)
- Undocumented unsafe operation (`Logging.ts:27`)
- Repeated error construction (`AuthContextHttpMiddlewareLive.ts:30-72`)
- Misleading error messages (`AuthContextHttpMiddlewareLive.ts:50-56`)

### 1.5 Monorepo Pattern Inventory

**Consistent Patterns (follow these)**
- `_common.ts` for shared repo dependencies
- `adapters/repos/` directory structure
- `Effect.Service` with `dependencies` array
- Barrel exports in `index.ts`

**Inconsistencies to Resolve**
- Tag creation: some use `$PackageId.create()`, others hardcode strings
- API organization: `api/` vs `routes/` vs top-level

### 1.6 RPC/HTTP Server Patterns

**RPC Middleware**: `RpcMiddleware.Tag` with `provides` option for dependency injection
**HTTP Middleware**: Layer-based composition via `Layer.provide`
**Request Context**: Use `FiberRef` for request-scoped data (correlation IDs, etc.)

---

## Part 2: Prompt Engineering for Sub-Agents

When you deploy an `effect-code-writer` agent, craft your prompt using these patterns.

### 2.1 Prompt Structure Template

```markdown
## Context
[What this file/module does in the system]
[Its dependencies and dependents]
[Why it needs refactoring]

## Current State
[Relevant code snippets or file references]
[Specific anti-patterns present - reference audit findings]

## Target State
[The pattern it should follow - reference conventions]
[Concrete example of the target pattern if helpful]

## Constraints
[What must NOT change - API contracts, behavior]
[Effect idioms to follow]
[Anti-patterns to avoid]

## Deliverables
[Exact files to create/modify]
[What the agent should output - code, explanation, or both]

## Verification
[How to confirm the change is correct]
[Build/type-check commands to run]
```

### 2.2 Context-Setting Patterns

**For file refactoring:**
> This file is `[path]`. It currently [role]. It depends on [X, Y] and is consumed by [A, B]. The refactoring goal is to [specific goal] without changing [invariants].

**For pattern migration:**
> The current code uses [old pattern]. Migrate to [new pattern] because [reason from research]. Reference: [relevant section of research context].

**For bug/anti-pattern fixes:**
> Line [N] contains [anti-pattern]. This violates [principle]. The fix is to [approach]. Ensure [side effects are handled].

### 2.3 Scoping Agent Tasks

**Good scope** (agent can complete in one pass):
- Refactor one file to follow a pattern
- Extract a concern into a new module
- Fix a specific anti-pattern across a bounded set of files

**Bad scope** (too large, split into multiple agents):
- "Refactor the entire package"
- "Fix all issues"
- "Restructure everything"

**Bad scope** (too small, wasteful):
- "Add one import"
- "Rename one variable"

### 2.4 Output Format Requests

**When you need code:**
> Provide the complete refactored file contents. Do not use partial snippets or ellipsis.

**When you need analysis first:**
> Before making changes, analyze [X] and report: [specific questions]. I will review before authorizing changes.

**When you need verification:**
> After changes, run `[command]` and report the output. If errors occur, diagnose and fix.

---

## Part 3: Synthesis Strategies

After agents complete their work, synthesize results before proceeding.

### 3.1 Single Agent Output Evaluation

Ask yourself:
1. **Correctness**: Does the output follow the requested pattern?
2. **Completeness**: Are all aspects of the task addressed?
3. **Side Effects**: Did the change affect files not mentioned?
4. **Type Safety**: Will this pass type checking?
5. **Import Integrity**: Are all import paths valid after the change?

### 3.2 Multi-Agent Output Integration

When multiple agents worked in parallel:

1. **Conflict Detection**: Did agents modify the same files? Same imports?
2. **Dependency Ordering**: Does agent B's output assume agent A's changes exist?
3. **Type Alignment**: Do exported types from agent A match imports in agent B?
4. **Naming Consistency**: Did agents use consistent naming conventions?

### 3.3 Iteration Triggers

Deploy follow-up agents when:
- An agent's output introduces new anti-patterns
- Type checking fails after changes
- Import paths are broken
- Agent output reveals additional issues not in original audit

### 3.4 Verification Protocol

After each logical unit of work:
```bash
bun run check --filter=@beep/runtime-server  # Type check
bun run build --filter=@beep/runtime-server  # Build
bun run build --filter=@beep/server          # Downstream build
```

If any fails: **STOP**. Diagnose. Deploy fix agent. Re-verify.

---

## Part 4: Strategic Guidance

### 4.1 Phasing Strategy

**Phase 1: Assessment**
Deploy exploratory agents to understand current state beyond the audit. Ask:
- What are all the consumers of this package?
- What is the actual dependency graph?
- Are there runtime behaviors the audit didn't capture?

**Phase 2: Foundation**
Address issues that other fixes depend on:
- Remove problematic dependencies (Next.js import)
- Fix type-level lies (incorrect annotations)
- Establish correct patterns in one file as reference

**Phase 3: Propagation**
Apply established patterns across the package:
- Use the reference file as example in agent prompts
- Fix remaining anti-patterns
- Restructure directories if needed

**Phase 4: Integration**
Ensure everything works together:
- Verify all imports resolve
- Run full build chain
- Check downstream consumers

### 4.2 Parallel vs Sequential

**Parallel** when:
- Agents work on independent files
- No shared imports being modified
- Output doesn't affect other agents' input

**Sequential** when:
- Agent B needs Agent A's output as input
- Shared type definitions are being modified
- File moves affect import paths

### 4.3 Rollback Points

Before each phase, note the git state. If a phase fails catastrophically:
```bash
git checkout -- packages/runtime/server/
```

Report what failed and why before retrying.

---

## Part 5: Success Criteria

The refactoring is complete when ALL of these are true:

- [ ] No Next.js imports in `packages/runtime/server/src/`
- [ ] No async/await inside Effect combinators
- [ ] No duplicate Layer provisions
- [ ] All type annotations match actual types (or removed for inference)
- [ ] All services use namespaced tags (`@beep/runtime-server/...`)
- [ ] `bun run build --filter=@beep/server` succeeds
- [ ] `bun run check` passes
- [ ] No commented-out code remains

---

## Part 6: Anti-Pattern Reference

Include these in agent prompts as "Constraints" when relevant:

**NEVER in Effect code:**
```typescript
// async/await inside Effect
Effect.tryPromise({ try: async () => await foo() })  // WRONG
Effect.promise(() => foo())  // CORRECT

// Native array methods
items.map(x => x.id)  // WRONG
F.pipe(items, A.map(x => x.id))  // CORRECT

// Type annotations that lie
const layer: Layer<A, E1, R> = actualLayer;  // WRONG if types differ
const layer = actualLayer;  // CORRECT - let inference work

// Multiple provisions
.pipe(Layer.provide(X), Layer.provide(X))  // WRONG
.pipe(Layer.provide(X))  // CORRECT - single provision

// Generic tag strings
Context.GenericTag<T>("MyService")  // WRONG
Context.GenericTag<T>("@beep/pkg/MyService")  // CORRECT
```

---

## Begin Orchestration

Start by assessing:
1. Read the current state of `packages/runtime/server/src/`
2. Cross-reference with the audit findings above
3. Identify the highest-impact issue to fix first
4. Craft your first agent prompt using the patterns in Part 2
5. Deploy, synthesize, iterate

You have the research. You have the patterns. Now orchestrate.
