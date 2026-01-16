# Agent Prompts

Pre-configured prompts for spawning specialized agents during spec execution.

---

## effect-researcher Agent

### Task 0.1: Research Effect Match Generics

```
Research Effect Match module for type-safe pattern matching with generic types.

Questions to answer:
1. How does `Match.when` handle generic type parameters?
2. Does the predicate function in `Match.when` properly narrow types?
3. What's the return type inference behavior with `Match.orElse`?
4. Are there examples of Match with schema types?

Search queries:
- "Match exhaustive pattern matching"
- "Match.when predicate narrowing"
- "Match generic type inference"
- "Match with Schema types"

Output format:
Document findings in specs/handler-factory-type-safety/outputs/pattern-analysis.md with:
- Code examples from docs
- Type inference behavior observed
- Limitations discovered
- Recommendations for our use case
```

### Task 0.2: Research Type Guard Patterns

```
Research type guard patterns for narrowing generic union types.

Search for:
1. Type guards that narrow generic union types in TypeScript
2. Patterns for "discriminated union without literal tag field"
3. How Effect packages handle similar conditional types

Search queries:
- "type guard generic union"
- "discriminated union optional property"
- "Effect Predicate type narrowing"
- "conditional type narrowing implementation"

Output format:
Add findings to specs/handler-factory-type-safety/outputs/pattern-analysis.md with:
- Pattern examples
- TypeScript limitations identified
- Effect-specific solutions
- Applicability to handler factory
```

---

## Explore Agent

### Task 0.3: Analyze Call Site Dependencies

```
Find all usages of createHandler in the codebase and analyze dependencies.

Search for:
1. All files importing `createHandler` from handler.factory.ts
2. How the return type is used at each call site
3. Whether any call site relies on specific type inference behaviors

Starting points:
- packages/iam/client/src/sign-in/
- packages/iam/client/src/core/
- packages/iam/client/src/multi-session/

Output format:
Create specs/handler-factory-type-safety/outputs/call-site-analysis.md with:

| File | Pattern | Return Type Usage | Dependencies |
|------|---------|-------------------|--------------|
| ... | with-payload | Used in atom.fn() | Contract.Success type |

Include any type assertions or workarounds found at call sites.
```

---

## effect-code-writer Agent

### Task 0.4: Create Proof of Concept

```
Create a minimal proof of concept demonstrating type-safe handler factory pattern.

Requirements:
1. Type-safe branching without `as` assertions
2. Proper generic parameter flow through Match.when
3. Return type identical to current implementation

Based on research from:
- outputs/pattern-analysis.md
- outputs/call-site-analysis.md

Create: specs/handler-factory-type-safety/outputs/poc-approach.ts

Structure:
- Define ConfigWithPayload<P, S> type
- Define ConfigNoPayload<S> type
- Create hasPayloadSchema type guard
- Implement createWithPayloadImpl
- Implement createNoPayloadImpl
- Wire together with Match

Verification:
- No `as` assertions allowed
- Both variants must type-check
- Comment explaining why each approach works
```

### Task 1.1-1.3: Set Up Scratchpad

```
Create isolated scratchpad for testing refactored factory.

Create directory: specs/handler-factory-type-safety/scratchpad/

Copy files:
1. packages/iam/client/src/_common/handler.factory.ts → scratchpad/handler.factory.ts
2. packages/iam/client/src/_common/errors.ts → scratchpad/errors.ts
3. packages/iam/client/src/_common/common.types.ts → scratchpad/common.types.ts
4. packages/iam/client/src/_common/schema.helpers.ts → scratchpad/schema.helpers.ts
5. Create handlers/ subdirectory with:
   - sign-in-email.handler.ts (from src/sign-in/email/)
   - sign-in-email.contract.ts (from src/sign-in/email/)
   - sign-out.handler.ts (from src/core/sign-out/)
   - sign-out.contract.ts (from src/core/sign-out/)

Create tsconfig.json:
{
  "extends": "../../../../tsconfig.base.jsonc",
  "compilerOptions": {
    "rootDir": ".",
    "noEmit": true,
    "paths": {
      "@beep/iam-client/*": ["./*"]
    }
  },
  "include": ["./**/*.ts"]
}

Adjust imports in copied files to use relative paths within scratchpad.

Verify: bun tsc --noEmit --project scratchpad/tsconfig.json
```

### Task 3.1-3.4: Implement Refactored Factory

```
Refactor scratchpad/handler.factory.ts to eliminate all `as` assertions.

Implementation steps:

1. Add type definitions after imports:
   - ConfigWithPayload<PayloadSchema, SuccessSchema>
   - ConfigNoPayload<SuccessSchema>

2. Add type guard:
   const hasPayloadSchema = <P extends S.Schema.Any, S extends S.Schema.Any>(
     config: ConfigWithPayload<P, S> | ConfigNoPayload<S>
   ): config is ConfigWithPayload<P, S> =>
     P.isNotUndefined(config.payloadSchema);

3. Extract createWithPayloadImpl:
   - Move lines 143-177 to dedicated function
   - Remove all `as` assertions
   - Ensure proper generic types

4. Extract createNoPayloadImpl:
   - Move lines 179-210 to dedicated function
   - Remove all `as` assertions
   - Ensure proper generic types

5. Refactor main createHandler:
   return Match.value(config).pipe(
     Match.when(hasPayloadSchema, createWithPayloadImpl),
     Match.orElse(createNoPayloadImpl)
   );

Constraints:
- Zero `as` assertions allowed
- Overload signatures unchanged
- Effect patterns (namespace imports, PascalCase)

Verify: bun tsc --noEmit --project scratchpad/tsconfig.json
```

---

## reflector Agent

### End of Phase Reflection

```
Document learnings from completed phase in REFLECTION_LOG.md.

Template:
## Session N - Phase [X] Completion

**Date**: YYYY-MM-DD
**Phase**: [Phase Name]

### What Worked
- [Specific patterns that succeeded]
- [Tools/approaches that were effective]

### What Didn't Work
- [Approaches that failed and why]
- [Time sinks to avoid]

### Patterns Discovered
- [New patterns applicable to other code]
- [TypeScript insights]

### Methodology Improvements
- [Process improvements for future phases]
- [Agent coordination learnings]

### Questions Raised
- [Unresolved questions]
- [Areas needing more research]

---

Include specific code examples where patterns were discovered.
Reference file paths and line numbers for context.
```

---

## doc-writer Agent

### Task 6.1: Update Package Documentation

```
Update packages/iam/client/CLAUDE.md with type-safe factory documentation.

Add new section "### Type-Safe Handler Factory Pattern" under "Implemented Handler Patterns":

Include:
1. Explanation of Match-based dispatch
2. Type guard pattern used
3. How to extend with new variants
4. Migration guide for other factories

Example format:
### Type-Safe Handler Factory Pattern

The handler factory uses Effect's Match module for type-safe dispatch:

```typescript
// Type guard narrows config to specific variant
const hasPayloadSchema = ...

// Match dispatches to type-specific implementations
return Match.value(config).pipe(
  Match.when(hasPayloadSchema, createWithPayloadImpl),
  Match.orElse(createNoPayloadImpl)
);
```

Benefits:
- Zero unsafe type assertions
- Compile-time exhaustiveness checking
- Proper generic parameter flow

To add a new variant:
1. Define ConfigNewVariant<...> type
2. Create hasNewVariantProperty type guard
3. Implement createNewVariantImpl
4. Add Match.when clause
```

Also update any "Gotchas" section if the refactoring introduces new considerations.
```

---

## Usage

### Spawning Agents

Use the Task tool with appropriate subagent_type:

```typescript
// Research agent
Task({
  subagent_type: "effect-researcher",
  prompt: "<paste prompt from above>",
  description: "Research Match generics"
})

// Exploration agent
Task({
  subagent_type: "Explore",
  prompt: "<paste prompt from above>",
  description: "Find createHandler usages"
})

// Code writing agent
Task({
  subagent_type: "effect-code-writer",
  prompt: "<paste prompt from above>",
  description: "Create POC factory"
})

// Reflection agent
Task({
  subagent_type: "reflector",
  prompt: "<paste prompt from above>",
  description: "Document phase learnings"
})

// Documentation agent
Task({
  subagent_type: "doc-writer",
  prompt: "<paste prompt from above>",
  description: "Update CLAUDE.md"
})
```

### Parallel Execution

Independent tasks can be spawned in parallel:

```typescript
// Phase 0 parallel research
Task({ subagent_type: "effect-researcher", prompt: "Task 0.1...", description: "Match research" })
Task({ subagent_type: "effect-researcher", prompt: "Task 0.2...", description: "Type guard research" })
Task({ subagent_type: "Explore", prompt: "Task 0.3...", description: "Call site analysis" })
```

Sequential tasks (where output feeds into next):
```typescript
// Wait for research before POC
await Task({ subagent_type: "effect-researcher", ... })
await Task({ subagent_type: "Explore", ... })
// Now create POC with research results
Task({ subagent_type: "effect-code-writer", prompt: "Task 0.4...", description: "Create POC" })
```
