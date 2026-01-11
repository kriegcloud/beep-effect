# Test Writer Agent — Initial Handoff

> **Priority**: Tier 4 (Writers)
> **Spec Location**: `specs/agents/test-writer/README.md`
> **Target Output**: `.claude/agents/test-writer.md` (500-600 lines)

---

## Mission

Create the **test-writer** agent — an Effect-first testing specialist that writes unit and integration tests using `@beep/testkit`. Covers layer-based testing, property-based testing, and time control.

---

## Critical Constraints

1. **NEVER use `async/await`** — All tests must use Effect patterns
2. **NEVER use native array/string methods** — Use `A.map`, `Str.split`, etc.
3. **Agent definition must be 500-600 lines**
4. **All tests must use `@beep/testkit`** helpers
5. **No `describe` blocks** — Use `effect()` and `layer()` directly

---

## Phase 1: Research (Read-Only)

### Task 1.1: Study Testkit Infrastructure

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/tooling/testkit/AGENTS.md`

**Extract**:
- Available helpers: `effect`, `scoped`, `layer`, `flakyTest`
- Layer composition patterns
- Test timeout configuration

### Task 1.2: Research Effect Testing Modules

**Use MCP to search**:
```typescript
mcp__effect_docs__effect_docs_search({ query: "Arbitrary" })
mcp__effect_docs__effect_docs_search({ query: "TestClock" })
mcp__effect_docs__effect_docs_search({ query: "ConfigProvider" })
mcp__effect_docs__effect_docs_search({ query: "TestContext" })
```

**Document**:
- Property-based testing with Arbitrary
- Time control with TestClock
- Configuration injection

### Task 1.3: Sample Existing Tests

**Glob for test files**:
```
packages/**/*.test.ts
```

**Sample 5-10 diverse tests** and analyze:
- Test structure patterns
- Layer setup approaches
- Assertion styles
- Error testing patterns

### Task 1.4: Study Effect Patterns

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/EFFECT_PATTERNS.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/rules/effect-patterns.md`

### Output: `specs/agents/test-writer/outputs/research-findings.md`

```markdown
# Test Writer Research Findings

## Testkit Helpers

### effect()
[Signature and usage]

### scoped()
[For scoped resources]

### layer()
[Layer-based integration tests]

### flakyTest()
[Retry for flaky tests]

## Effect Testing Modules

### Arbitrary
[Property-based testing patterns]

### TestClock
[Time control APIs]

### ConfigProvider
[Test configuration injection]

## Test Patterns Found

### Unit Test Pattern
[From codebase samples]

### Integration Test Pattern
[From codebase samples]

### Error Test Pattern
[Testing failures]

### Layer Test Pattern
[With dependencies]
```

---

## Phase 2: Design

### Task 2.1: Design Unit Test Pattern

```typescript
import * as Effect from "effect/Effect"
import { effect } from "@beep/testkit"
import { expect } from "vitest"

// Unit test - pure function
effect("validates email format", () =>
  Effect.gen(function* () {
    const result = yield* validateEmail("test@example.com")
    expect(result).toBe(true)
  })
)

// Unit test - Effect that can fail
effect("rejects invalid email", () =>
  Effect.gen(function* () {
    const result = yield* Effect.either(validateEmail("invalid"))
    expect(result._tag).toBe("Left")
  })
)
```

### Task 2.2: Design Integration Test Pattern

```typescript
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Duration from "effect/Duration"
import { layer } from "@beep/testkit"
import { expect } from "vitest"

// Layer-based integration test
layer(
  Layer.mergeAll(UserRepoTestLayer, DbTestLayer),
  { timeout: Duration.seconds(30) }
)(
  "UserRepo integration",
  (it) => {
    it.effect("creates and retrieves user", () =>
      Effect.gen(function* () {
        const repo = yield* UserRepo
        const created = yield* repo.create({ name: "Alice" })
        const retrieved = yield* repo.findById(created.id)
        expect(retrieved).toEqual(created)
      })
    )

    it.effect("handles not found", () =>
      Effect.gen(function* () {
        const repo = yield* UserRepo
        const result = yield* Effect.either(repo.findById("nonexistent"))
        expect(result._tag).toBe("Left")
      })
    )
  }
)
```

### Task 2.3: Design Property-Based Test Pattern

```typescript
import * as Effect from "effect/Effect"
import * as Arbitrary from "effect/Arbitrary"
import * as fc from "fast-check"
import { effect } from "@beep/testkit"
import { expect } from "vitest"

// Property-based test
effect("roundtrips encode/decode", () =>
  Effect.gen(function* () {
    const arb = Arbitrary.make(UserSchema)
    fc.assert(
      fc.property(arb, (user) => {
        const encoded = S.encodeSync(UserSchema)(user)
        const decoded = S.decodeSync(UserSchema)(encoded)
        return decoded.id === user.id
      })
    )
  })
)
```

### Task 2.4: Design Time Control Pattern

```typescript
import * as Effect from "effect/Effect"
import * as TestClock from "effect/TestClock"
import * as Duration from "effect/Duration"
import { effect } from "@beep/testkit"
import { expect } from "vitest"

// Time-controlled test
effect("expires token after 1 hour", () =>
  Effect.gen(function* () {
    const token = yield* createToken()

    // Advance time by 59 minutes - still valid
    yield* TestClock.adjust(Duration.minutes(59))
    expect(yield* isTokenValid(token)).toBe(true)

    // Advance time by 2 more minutes - expired
    yield* TestClock.adjust(Duration.minutes(2))
    expect(yield* isTokenValid(token)).toBe(false)
  })
)
```

### Task 2.5: Design Error Testing Pattern

```typescript
import * as Effect from "effect/Effect"
import * as Cause from "effect/Cause"
import { effect } from "@beep/testkit"
import { expect } from "vitest"

// Test specific error type
effect("throws UserNotFoundError", () =>
  Effect.gen(function* () {
    const result = yield* Effect.exit(findUser("nonexistent"))
    expect(result._tag).toBe("Failure")
    if (result._tag === "Failure") {
      const failures = Cause.failures(result.cause)
      expect(failures[0]._tag).toBe("UserNotFoundError")
    }
  })
)
```

### Output: `specs/agents/test-writer/outputs/agent-design.md`

---

## Phase 3: Create

### Task 3.1: Write Agent Definition

Create `.claude/agents/test-writer.md`:

```markdown
---
description: Effect-first test writer using @beep/testkit for unit and integration testing
tools: [Read, Write, Edit, mcp__effect_docs__effect_docs_search]
---

# Test Writer Agent

[Purpose statement]

## Testkit Reference

### effect()
[Usage and examples]

### scoped()
[For scoped resources]

### layer()
[Layer-based testing]

### flakyTest()
[Retry configuration]

## Effect Testing Reference

### Arbitrary
[Property-based testing]

### TestClock
[Time control]

### ConfigProvider
[Test configuration]

## Test Patterns

### Unit Test
[Pattern and example]

### Integration Test
[Pattern and example]

### Property-Based Test
[Pattern and example]

### Time-Controlled Test
[Pattern and example]

### Error Testing
[Pattern and example]

## Methodology

### Step 1: Analyze Code Under Test
[Understand what to test]

### Step 2: Identify Test Types
[Unit vs integration vs property]

### Step 3: Set Up Dependencies
[Layers, mocks, test doubles]

### Step 4: Write Tests
[Apply patterns]

### Step 5: Validate Coverage
[Ensure edge cases covered]

## Output Format
[Test file structure]

## Examples
[Complete test file example]
```

### Task 3.2: Include Test Template Library

```markdown
## Test Templates

### Unit Test File Template
```typescript
import * as Effect from "effect/Effect"
import { effect } from "@beep/testkit"
import { expect, describe } from "vitest"
import { functionUnderTest } from "./module"

effect("description of behavior", () =>
  Effect.gen(function* () {
    const result = yield* functionUnderTest(input)
    expect(result).toEqual(expected)
  })
)
```

### Integration Test File Template
```typescript
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Duration from "effect/Duration"
import { layer } from "@beep/testkit"
import { expect } from "vitest"
import { ServiceLive, Service } from "./service"
import { TestDependencies } from "./test-utils"

const TestLayer = Layer.provide(ServiceLive, TestDependencies)

layer(TestLayer, { timeout: Duration.seconds(30) })(
  "Service integration",
  (it) => {
    it.effect("performs operation", () =>
      Effect.gen(function* () {
        const service = yield* Service
        const result = yield* service.operation()
        expect(result).toBeDefined()
      })
    )
  }
)
```
```

---

## Phase 4: Validate

### Verification Commands

```bash
# Check file exists and length
ls -lh .claude/agents/test-writer.md
wc -l .claude/agents/test-writer.md

# Verify no async/await
grep -i "async\|await" .claude/agents/test-writer.md && echo "FAIL" || echo "PASS"

# Verify testkit imports
grep "@beep/testkit" .claude/agents/test-writer.md

# Verify all test patterns present
grep -E "effect\(\"|layer\(\"|TestClock|Arbitrary" .claude/agents/test-writer.md

# Verify Effect imports
grep "import \* as Effect" .claude/agents/test-writer.md
```

### Success Criteria

- [ ] Agent definition at `.claude/agents/test-writer.md`
- [ ] Length is 500-600 lines
- [ ] Covers all testkit helpers (effect, scoped, layer, flakyTest)
- [ ] Includes unit test pattern
- [ ] Includes integration test pattern
- [ ] Includes property-based test pattern
- [ ] Includes time control pattern
- [ ] Includes error testing pattern
- [ ] All examples use Effect patterns
- [ ] Tested with sample test generation

---

## Ready-to-Use Orchestrator Prompt

```
You are executing the test-writer agent creation spec.

Your goal: Create `.claude/agents/test-writer.md` (500-600 lines) — an Effect-first test writer agent.

CRITICAL RULES:
1. All tests MUST use @beep/testkit helpers (effect, layer, scoped)
2. All tests MUST use Effect.gen (no async/await)
3. No describe blocks - use effect() and layer() directly
4. All examples MUST use namespace imports

PHASE 1 - Research:
1. Read tooling/testkit/AGENTS.md — understand helpers
2. Search Effect docs for Arbitrary, TestClock, ConfigProvider
3. Sample 5-10 existing test files
4. Read documentation/EFFECT_PATTERNS.md
5. Output to specs/agents/test-writer/outputs/research-findings.md

PHASE 2 - Design:
1. Design unit test pattern
2. Design integration test pattern (with layers)
3. Design property-based test pattern
4. Design time control pattern
5. Design error testing pattern
6. Output to specs/agents/test-writer/outputs/agent-design.md

PHASE 3 - Create:
1. Write .claude/agents/test-writer.md
2. Include all test patterns
3. Include template library
4. Test with sample test generation

PHASE 4 - Validate:
1. Run verification commands
2. Update REFLECTION_LOG.md

Begin with Phase 1.
```
