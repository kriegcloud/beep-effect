# Code Observability Writer Agent Specification

**Status**: Draft
**Created**: 2026-01-10
**Target Output**: `.claude/agents/code-observability-writer.md` (350-450 lines)

---

## Purpose

Create a specialized agent for adding logging, tracing, metrics, and error tracking to code using Effect patterns. Focuses on `Schema.TaggedError`, structured logging, and `Cause` tracking.

---

## Scope

### In Scope
- Agent definition file following `.claude/agents/templates/agents-md-template.md`
- `Schema.TaggedError` error class definitions
- Structured logging via `Effect.log*`
- Tracing spans for operations
- Metrics instrumentation
- `Cause` tracking for debugging

### Out of Scope
- Observability infrastructure setup (Grafana, OTLP)
- Log aggregation configuration
- Alerting rules

---

## Success Criteria

- [ ] Agent definition created at `.claude/agents/code-observability-writer.md`
- [ ] Follows template structure with frontmatter
- [ ] Length is 350-450 lines
- [ ] Uses Effect patterns for all examples
- [ ] Covers TaggedError, Logger, Metric, Tracer, Cause
- [ ] Output integrates with existing code seamlessly
- [ ] Tested with sample observability enhancement

---

## Agent Capabilities

### Core Functions
1. **Define Errors** - Create `Schema.TaggedError` error classes
2. **Add Logging** - Insert structured logging with context
3. **Add Tracing** - Wrap operations with spans
4. **Add Metrics** - Instrument counters, gauges, histograms
5. **Track Causes** - Enhance error handling with Cause analysis

### Knowledge Sources
- `effect/Cause` documentation (via MCP)
- `effect/Logger` documentation
- `effect/Metric` documentation
- `effect/Tracer` documentation
- Existing observability patterns in codebase

### Effect Modules Used
```typescript
import * as Effect from "effect/Effect"
import * as Cause from "effect/Cause"
import * as S from "effect/Schema"
import * as DateTime from "effect/DateTime"
```

### Output Patterns
```typescript
// Error definitions
export class UserNotFoundError extends S.TaggedError<UserNotFoundError>()(
  "UserNotFoundError",
  { userId: S.String }
) {}

// Structured logging
yield* Effect.logInfo("User lookup", { userId, timestamp: DateTime.unsafeNow() })

// Error cause tracking
yield* Effect.catchAllCause(
  program,
  (cause) => Effect.logError("Operation failed", { cause: Cause.pretty(cause) })
)
```

---

## Research Phase

Before creating the agent definition, research:

### 1. Effect Observability Modules
- Search Effect docs for Cause, Logger, Metric, Tracer
- Document common patterns and APIs
- Identify best practices for structured logging

### 2. Existing Patterns in Codebase
- Find existing TaggedError definitions
- Locate current logging patterns
- Review server-side observability setup

### 3. Schema.TaggedError Patterns
- How to define error classes
- Adding context to errors
- Error hierarchy patterns

---

## Implementation Plan

### Phase 1: Research
1. Search Effect docs for observability modules
2. Review existing error definitions in codebase
3. Document current logging patterns
4. Output: `outputs/research-findings.md`

### Phase 2: Design
1. Design instrumentation methodology
2. Define error class patterns
3. Create logging best practices
4. Output: `outputs/agent-design.md`

### Phase 3: Create
1. Create agent definition
2. Include Effect pattern examples
3. Test with sample instrumentation
4. Output: `.claude/agents/code-observability-writer.md`

---

## Dependencies

### Required Reading
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/EFFECT_PATTERNS.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/rules/effect-patterns.md`

### Effect Documentation (via MCP)
- `effect/Cause` - Error cause tracking
- `effect/Logger` - Structured logging
- `effect/Metric` - Metrics collection
- `effect/Tracer` - Distributed tracing

---

## Verification

```bash
# Check agent file exists and length
ls -lh .claude/agents/code-observability-writer.md
wc -l .claude/agents/code-observability-writer.md

# Verify Effect imports in examples
grep "import \* as" .claude/agents/code-observability-writer.md
```

---

## Related Specs

- [new-specialized-agents](../../new-specialized-agents/README.md) - Parent spec
- [code-reviewer](../code-reviewer/README.md) - Code quality agent
