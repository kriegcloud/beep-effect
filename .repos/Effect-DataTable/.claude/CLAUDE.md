# Claude Agent Guidelines

## Task Management Principles

### Avoid Task Jags

**Critical**: Avoid task jags at all cost. Jags are semantic changes in task direction:

- Going from implementing A to testing A
- Switching from implementing A to implementing B
- Any mid-stream change in the core task focus

Stay focused on the current task until completion. Delegate tasks to sub agents agressively (3+ agents at a time), and remain at a higher level of abstraction and coordination, resisting the temptation of jumping in yourself for quick fixes.

### Delegation Strategy

**Always delegate orthogonal tasks to sub-agents**. Use the most appropriate agent from `agents/` for each task:

- Break down complex work into focused sub-tasks
- Route each sub-task to the specialist agent best suited for it
- Maintain clear task boundaries between agents
- Give agents all the context they need, and instruction on where to gather more context if needed.

## Context Awareness

### Library Implementation Details

`.context` contains git submodules of libraries used (e.g., Effect). Agents are **highly encouraged** to grep for implementation details of the files they work with:

- `Graph.ts` for graph structures
- `Layer.ts` for dependency injection
- Other library sources as needed

This provides authoritative implementation patterns and ensures consistency with library conventions.

## Use Skills and Ask Questions

Use all skills that make semantic sense for the task.
Ask clarifying questions often to fill gaps. Better to clarify upfront than to implement the wrong solution.

## Code Quality Standards

### High Signal-to-Noise Ratio

Strive for high signal-to-noise ratio in code:

- Clear, purposeful implementations
- Direct, readable solutions
- Declarative over imperative styles

### Structural Preferences

- **Avoid nested loops**: Prefer flat, pipeline-style code
- **Avoid deep nesting**: Keep nesting shallow (max 2-3 levels)
- **Prefer pipelines**: Use `pipe` for composing operations
- **Use ADTs with pattern matching**: Leverage tagged enums with `$match` for control flow

### Example Pipeline Style

```typescript
const result = pipe(
  data,
  Array.map(transform),
  Array.filter(predicate),
  Array.reduce(combine)
)
```

### Example Pattern Matching

```typescript
const result = pipe(
  matcher,
  match({
    Exact: () => exactMatch(value),
    Fuzzy: ({ scorer }) => fuzzyMatch(value, scorer)
  })
)
```

## Testability Requirements

### Use Effect Services for Side Effects

**CRITICAL**: Never use `Date.now()` or `Math.random()` directly. Always use Effect's built-in services:

- **Clock service** instead of `Date.now()` - Use `Clock.currentTimeMillis` or `Clock.currentTimeNanos`. Same goes for `Clock.sleep`.
- **Random service** instead of `Math.random()` - Use `Random.next`, `Random.nextInt`, `Random.nextRange`, etc.

**Why this matters**: Direct calls to `Date.now()` and `Math.random()` are impure and non-deterministic, making tests flaky or impossible to write correctly. Effect services allow:

- Controlled time in tests via `TestClock`
- Deterministic random values in tests via `TestRandom`
- Proper dependency injection and composition

```typescript
// ❌ WRONG - untestable
const timestamp = Date.now()
const randomValue = Math.random()

// ✅ CORRECT - testable
const timestamp = yield* Clock.currentTimeMillis
const datetime = yield* DateTime.bow
const randomValue = yield* Random.next
```

## Feature Implementation Workflow

**CRITICAL**: Every feature implementation MUST follow this exact workflow. No shortcuts.

### Phase 1: Requirements Clarification

1. **Ask clarifying questions** before any design work
   - Understand the full scope
   - Identify edge cases
   - Clarify ambiguous requirements
   - Better to over-ask than under-deliver

### Phase 2: Interface Design

2. **Design interfaces for EVERY component**
   - UI state/logic interfaces
   - Backend service interfaces
   - Domain model interfaces
   - **Everything starts as an interface** - no implementation yet
   - Use `Context.Tag` for service interfaces
   - Use `Schema` for data interfaces

3. **Verify interfaces with user**
   - Present all interfaces for review
   - Iterate until interfaces are locked
   - Get explicit approval before proceeding
   - **No moving forward until interfaces are finalized**

### Phase 3: Behavioral Specification

4. **Write test structure as behavioral interface**
   - Create `describe`/`it` blocks with clear names
   - **Bodies are empty** - just the structure
   - Tests define the expected behavior contract
   - Get verification that test cases cover requirements

### Phase 4: Test Implementation

5. **Write tests using interfaces only**
   - Use `Layer.mock(Tag, {})` for all dependencies
   - Tests must compile against interfaces
   - **No real implementation exists yet**
   - Tests define the contract implementations must fulfill

---

**⚠️ CHECKPOINT: Up until now, NOT A SINGLE LINE of real logic has been written.**

---

### Phase 5: Parallel Implementation

6. **Implement all test bodies** (extreme parallelism)
   - Spawn 10+ agents simultaneously
   - Each agent owns a specific test file/module
   - Tests remain interface-bound

7. **Implement all logic** (extreme parallelism)
   - Spawn 10+ agents simultaneously
   - Each agent owns a specific implementation
   - Run until all tests pass
   - **NO interface changes allowed** unless:
     - Explicitly requested to user
     - Motivation for change is provided
     - User approves the change

### Workflow Enforcement

- Agents MUST refuse to skip phases
- Each phase requires explicit completion before next
- Interface changes after Phase 3 require user approval with justification
- Parallelism is MANDATORY in Phases 6-7, not optional

## Documentation Standards

### Minimal Documentation During Prototyping

**CRITICAL**: Forego all @example writing unless specifically asked to. Examples pollute context unnecessarily.

- **NO @example blocks** - They add significant context overhead
- **NO excessive JSDoc** - Keep it minimal unless requested
- **NO detailed comments** for self-explanatory code
- Focus on clean, self-documenting implementations
- Add documentation only when:
  - Explicitly requested by the user
  - Code is ready for production/publishing
  - Public API requires clarification

**Rationale**: During prototyping and development, examples and verbose documentation significantly bloat context. Write clear, readable code first. Documentation can be added later when actually needed.
