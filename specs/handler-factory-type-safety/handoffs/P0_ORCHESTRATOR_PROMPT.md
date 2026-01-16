# Phase 0 Orchestrator Prompt - Discovery & Pattern Research

## Your Mission

You are implementing the **Handler Factory Type Safety** specification. Your goal in Phase 0 is to research Effect patterns and design a type-safe refactoring approach that eliminates unsafe assertions while preserving backward compatibility.

## Context

Read these files to understand the problem:

1. **Spec Overview**: `specs/handler-factory-type-safety/README.md`
2. **Initial Analysis**: `specs/handler-factory-type-safety/outputs/initial-analysis.md`
3. **Current Implementation**: `packages/iam/client/src/_common/handler.factory.ts`
4. **Test Coverage**: `packages/iam/client/src/_common/__tests__/handler.factory.test.ts`

## Phase 0 Tasks

### Task 0.1: Research Effect Match Generics

Use the `effect-researcher` agent or Effect docs MCP tool to answer:

1. How does `Match.when` handle generic type parameters?
2. Does the predicate function in `Match.when` properly narrow types?
3. What's the return type inference behavior with `Match.orElse`?
4. Are there examples of Match with schema types?

**Output**: Add findings to `outputs/pattern-analysis.md`

### Task 0.2: Research Type Guard Patterns

Search the Effect ecosystem and TypeScript patterns for:

1. Type guards that narrow generic union types
2. Patterns for "discriminated union without literal tag field"
3. How other Effect packages handle similar conditional types

**Output**: Add findings to `outputs/pattern-analysis.md`

### Task 0.3: Analyze Call Site Dependencies

Use `codebase-researcher` agent to verify:

1. All files importing `createHandler`
2. How return types are used at call sites
3. Whether any call site relies on specific type inference behaviors

**Output**: `outputs/call-site-analysis.md`

### Task 0.4: Proof of Concept

Create a minimal proof of concept (can be in a scratch file) that demonstrates:

1. Type-safe branching without assertions
2. Proper generic parameter flow
3. Identical return type to current implementation

**Output**: `outputs/poc-approach.ts` (can be pseudo-code or real TypeScript)

### Task 0.5: Design Proposal

Based on research, write a design proposal covering:

1. Recommended approach (with rationale)
2. Type definitions for config variants
3. Implementation skeleton
4. Risk assessment (what could break?)
5. Rollback plan

**Output**: `outputs/design-proposal.md`

## Success Criteria for Phase 0

- [ ] `outputs/pattern-analysis.md` documents Match/Predicate findings
- [ ] `outputs/call-site-analysis.md` lists all usages and dependencies
- [ ] `outputs/poc-approach.ts` demonstrates feasibility
- [ ] `outputs/design-proposal.md` provides clear implementation path
- [ ] `REFLECTION_LOG.md` updated with Phase 0 learnings

## Agents to Use

| Agent | Task | Purpose |
|-------|------|---------|
| `effect-researcher` | 0.1, 0.2 | Query Effect documentation |
| `codebase-researcher` | 0.3 | Analyze current usages |
| `effect-code-writer` | 0.4 | Create proof of concept |
| `reflector` | End | Document learnings |

## Key Constraints

1. **No changes to public API** - Overload signatures must remain identical
2. **All existing tests must pass** - No behavioral changes
3. **Effect patterns required** - Use namespace imports, PascalCase constructors
4. **No new dependencies** - Only use existing Effect modules

## Handoff to Phase 1

After completing Phase 0, create `handoffs/P1_ORCHESTRATOR_PROMPT.md` with:

1. Summary of chosen approach
2. **Scratchpad setup instructions** - files to copy, dependencies needed
3. Specific implementation tasks for scratchpad refactoring
4. Expected challenges

### Phase 1 Will Create Scratchpad

Phase 1 creates an isolated testing environment:

```
specs/handler-factory-type-safety/scratchpad/
├── handler.factory.ts           # Exact copy to refactor
├── errors.ts                    # Dependency
├── common.types.ts              # Dependency
├── schema.helpers.ts            # Dependency
├── handlers/
│   ├── sign-in-email.handler.ts # With-payload test case
│   ├── sign-in-email.contract.ts
│   ├── sign-out.handler.ts      # No-payload test case
│   └── sign-out.contract.ts
└── tsconfig.json                # Isolated type checking
```

This allows validating the refactored factory against real handler patterns before touching production code.

## Reference Commands

```bash
# Search Effect docs for Match patterns
# Use effect_docs_search MCP tool with queries like:
# - "Match exhaustive pattern matching"
# - "type narrowing predicates"

# Type check after changes
bun run check --filter @beep/iam-client

# Run tests
bun run test --filter @beep/iam-client
```

## Critical Rules

From `.claude/rules/effect-patterns.md`:

- **Namespace imports required**: `import * as Match from "effect/Match"`
- **PascalCase constructors**: `S.Struct`, not `S.struct`
- **No native JS methods**: Use `P.isNotUndefined`, not `!== undefined`

---

**Start by reading the README and initial-analysis, then proceed with Task 0.1.**
