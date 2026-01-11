# Test Writer Agent Specification

**Status**: Draft
**Created**: 2026-01-10
**Target Output**: `.claude/agents/test-writer.md` (500-600 lines)

---

## Purpose

Create a specialized agent for writing Effect-first unit and integration tests using `@beep/testkit`. Covers layer-based testing, property-based testing, and time control.

---

## Scope

### In Scope
- Agent definition file following `.claude/agents/templates/agents-md-template.md`
- Unit tests with `effect` helper
- Integration tests with `layer` helper
- Property-based tests with `effect/Arbitrary`
- Time control with `effect/TestClock`
- Test config injection with `effect/Config`

### Out of Scope
- E2E/browser testing
- Performance testing
- Test infrastructure setup

---

## Success Criteria

- [ ] Agent definition created at `.claude/agents/test-writer.md`
- [ ] Follows template structure with frontmatter
- [ ] Length is 500-600 lines
- [ ] Uses `@beep/testkit` patterns correctly
- [ ] Covers unit, integration, and property-based testing
- [ ] Examples use Effect patterns (no async/await)
- [ ] Tested with sample test generation

---

## Agent Capabilities

### Core Functions
1. **Write Unit Tests** - Tests for pure functions and effects
2. **Write Integration Tests** - Layer-based tests with dependencies
3. **Write Property Tests** - Arbitrary-based property testing
4. **Control Time** - TestClock-based time manipulation
5. **Inject Config** - Test-specific configuration

### Knowledge Sources
- `tooling/testkit/AGENTS.md`
- `effect/Arbitrary` documentation (via MCP)
- `effect/TestClock` documentation
- Existing test files in repository

### Testing Patterns
```typescript
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { effect, layer } from "@beep/testkit"
import * as Duration from "effect/Duration"

// Unit test
effect("validates user input", () =>
  Effect.gen(function* () {
    const result = yield* validateUser({ name: "Alice" })
    expect(result).toEqual({ name: "Alice" })
  })
)

// Integration test
layer(Layer.mergeAll(UserRepoLive, DbTestLayer), {
  timeout: Duration.seconds(30)
})(
  "UserRepo integration",
  (it) => {
    it.effect("creates and retrieves user", () =>
      Effect.gen(function* () {
        const repo = yield* UserRepo
        const created = yield* repo.create({ name: "Bob" })
        const retrieved = yield* repo.findById(created.id)
        expect(retrieved).toEqual(created)
      })
    )
  }
)
```

### Output Locations
- Test files: `*.test.ts` adjacent to source files
- Test utilities: `test/` directory in package

---

## Research Phase

Before creating the agent definition, research:

### 1. Testkit Infrastructure
- Read `tooling/testkit/AGENTS.md`
- Document available helpers: effect, scoped, layer, flakyTest
- Understand layer-based test orchestration

### 2. Effect Testing Modules
- Search Effect docs for Arbitrary, TestClock, TestConfig
- Document property-based testing patterns
- Review time control APIs

### 3. Existing Test Patterns
- Sample test files across packages
- Identify common patterns
- Note any anti-patterns to avoid

---

## Implementation Plan

### Phase 1: Research
1. Read testkit documentation
2. Search Effect testing modules
3. Sample existing tests
4. Output: `outputs/research-findings.md`

### Phase 2: Design
1. Design test writing methodology
2. Create test templates
3. Document testing patterns
4. Output: `outputs/agent-design.md`

### Phase 3: Create
1. Create agent definition
2. Include comprehensive examples
3. Test with sample generation
4. Output: `.claude/agents/test-writer.md`

---

## Dependencies

### Required Reading
- `/home/elpresidank/YeeBois/projects/beep-effect/tooling/testkit/AGENTS.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/EFFECT_PATTERNS.md`

### Effect Documentation (via MCP)
- `effect/Arbitrary` - Property-based testing
- `effect/TestClock` - Time control
- `effect/Config` & `effect/ConfigProvider` - Configuration injection

### Existing Tests for Reference
- `packages/common/schema/test/**/*.test.ts`
- `packages/shared/domain/test/**/*.test.ts`

---

## Verification

```bash
# Check agent file exists and length
ls -lh .claude/agents/test-writer.md
wc -l .claude/agents/test-writer.md

# Verify testkit imports in examples
grep "@beep/testkit\|effect\|layer" .claude/agents/test-writer.md
```

---

## Related Specs

- [new-specialized-agents](../../new-specialized-agents/README.md) - Parent spec
- [code-reviewer](../code-reviewer/README.md) - Code quality agent
