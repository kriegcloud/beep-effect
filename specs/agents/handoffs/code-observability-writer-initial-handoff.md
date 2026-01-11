# Code Observability Writer Agent — Initial Handoff

> **Priority**: Tier 4 (Writers)
> **Spec Location**: `specs/agents/code-observability-writer/README.md`
> **Target Output**: `.claude/agents/code-observability-writer.md` (350-450 lines)

---

## Mission

Create the **code-observability-writer** agent — an instrumentation specialist that adds logging, tracing, metrics, and error tracking to code using Effect patterns. Focuses on `Schema.TaggedError`, structured logging, and `Cause` tracking.

---

## Critical Constraints

1. **NEVER use `async/await`** — All examples must use `Effect.gen`
2. **NEVER use native array/string methods** — Use `A.map`, `Str.split`, etc.
3. **NEVER use named imports from Effect** — Use `import * as Effect from "effect/Effect"`
4. **Agent definition must be 350-450 lines**
5. **All logging must be structured** — No string concatenation
6. **All errors must extend `S.TaggedError`**

---

## Phase 1: Research (Read-Only)

### Task 1.1: Research Effect Observability Modules

**Use MCP to search Effect docs**:
```typescript
mcp__effect_docs__effect_docs_search({ query: "Cause" })
mcp__effect_docs__effect_docs_search({ query: "Logger" })
mcp__effect_docs__effect_docs_search({ query: "Metric" })
mcp__effect_docs__effect_docs_search({ query: "Tracer" })
mcp__effect_docs__effect_docs_search({ query: "TaggedError" })
```

**Document for each module**:
- Key APIs
- Common usage patterns
- Integration examples

### Task 1.2: Study Existing Error Patterns

**Grep for TaggedError usage**:
```bash
grep -r "TaggedError\|extends.*Error" packages/
```

**Sample 3-5 error definitions** and analyze:
- Naming conventions
- Context properties
- Error hierarchy

### Task 1.3: Study Existing Logging Patterns

**Grep for Effect logging**:
```bash
grep -r "Effect\.log\|Effect\.logInfo\|Effect\.logError" packages/
```

**Document**:
- Structured logging format
- Context passing patterns
- Log level usage

### Task 1.4: Review Effect Patterns

**Read**:
- `/home/elpresidank/YeeBois/projects/beep-effect/documentation/EFFECT_PATTERNS.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/.claude/rules/effect-patterns.md`

### Output: `specs/agents/code-observability-writer/outputs/research-findings.md`

```markdown
# Code Observability Writer Research Findings

## Effect Observability Modules

### Cause
[APIs: pretty, squash, failures, defects]
[Usage patterns]

### Logger
[APIs: logInfo, logDebug, logWarning, logError]
[Structured logging format]

### Metric
[APIs: counter, gauge, histogram]
[Collection patterns]

### Tracer
[APIs: span, withSpan]
[Context propagation]

### Schema.TaggedError
[Definition pattern]
[Context properties]

## Existing Patterns in Codebase
[Error definitions found]
[Logging patterns found]

## Key Effect Imports for Observability
import * as Effect from "effect/Effect"
import * as Cause from "effect/Cause"
import * as S from "effect/Schema"
import * as DateTime from "effect/DateTime"
```

---

## Phase 2: Design

### Task 2.1: Design Error Definition Patterns

```typescript
import * as S from "effect/Schema"

// Simple tagged error
export class UserNotFoundError extends S.TaggedError<UserNotFoundError>()(
  "UserNotFoundError",
  { userId: S.String }
) {}

// Error with rich context
export class ValidationError extends S.TaggedError<ValidationError>()(
  "ValidationError",
  {
    field: S.String,
    message: S.String,
    value: S.Unknown
  }
) {}

// Error hierarchy
export class DatabaseError extends S.TaggedError<DatabaseError>()(
  "DatabaseError",
  {
    operation: S.Literal("read", "write", "connect"),
    cause: S.optional(S.String)
  }
) {}
```

### Task 2.2: Design Logging Patterns

```typescript
import * as Effect from "effect/Effect"
import * as DateTime from "effect/DateTime"

// Structured logging with context
yield* Effect.logInfo("User created", {
  userId: user.id,
  email: user.email,
  timestamp: DateTime.unsafeNow()
})

// Error logging with cause
yield* Effect.catchAllCause(
  program,
  (cause) => Effect.logError("Operation failed", {
    cause: Cause.pretty(cause),
    operation: "createUser"
  })
)

// Scoped logging with context
yield* Effect.annotateLogs(
  Effect.gen(function* () {
    yield* Effect.logInfo("Starting operation")
    // ... operation
    yield* Effect.logInfo("Operation complete")
  }),
  { requestId, userId }
)
```

### Task 2.3: Design Tracing Patterns

```typescript
import * as Effect from "effect/Effect"

// Wrap operation with span
const tracedOperation = Effect.withSpan("createUser")(
  Effect.gen(function* () {
    yield* Effect.annotateCurrentSpan("userId", userId)
    // ... operation
  })
)
```

### Task 2.4: Design Metrics Patterns

```typescript
import * as Metric from "effect/Metric"

// Counter for operations
const userCreatedCounter = Metric.counter("users.created")

// Histogram for latency
const requestLatency = Metric.histogram("request.latency.ms")

// Usage
yield* Metric.increment(userCreatedCounter)
yield* Metric.record(requestLatency, elapsedMs)
```

### Output: `specs/agents/code-observability-writer/outputs/agent-design.md`

---

## Phase 3: Create

### Task 3.1: Write Agent Definition

Create `.claude/agents/code-observability-writer.md`:

```markdown
---
description: Observability instrumentation agent for logging, tracing, metrics, and error tracking using Effect
tools: [Read, Edit, mcp__effect_docs__effect_docs_search]
---

# Code Observability Writer Agent

[Purpose statement]

## Effect Observability Reference

### Cause Module
[Key APIs and usage]

### Logger APIs
[Effect.log*, structured format]

### Metric Module
[Counters, gauges, histograms]

### Tracer Integration
[Spans, annotations]

## Patterns

### Error Definition Pattern
[Schema.TaggedError template]

### Structured Logging Pattern
[Context objects, no string concat]

### Cause Tracking Pattern
[catchAllCause, pretty printing]

### Span Pattern
[withSpan, annotateCurrentSpan]

### Metrics Pattern
[Counter, histogram, gauge]

## Methodology

### Step 1: Identify Instrumentation Points
[Where to add logging/tracing]

### Step 2: Define Error Types
[Create TaggedError classes]

### Step 3: Add Logging
[Structured logging insertion]

### Step 4: Add Tracing
[Span wrapping]

### Step 5: Add Metrics
[Counter/histogram placement]

## Output Format
[Instrumented code examples]

## Examples
[Before/after instrumentation]
```

### Task 3.2: Include Pattern Templates

```markdown
## Error Template

```typescript
import * as S from "effect/Schema"

export class {{ErrorName}}Error extends S.TaggedError<{{ErrorName}}Error>()(
  "{{ErrorName}}Error",
  {
    {{contextField}}: S.{{SchemaType}}
  }
) {}
```

## Logging Template

```typescript
yield* Effect.logInfo("{{message}}", {
  {{key}}: {{value}},
  timestamp: DateTime.unsafeNow()
})
```

## Cause Tracking Template

```typescript
yield* F.pipe(
  program,
  Effect.catchAllCause((cause) =>
    Effect.logError("{{operation}} failed", {
      cause: Cause.pretty(cause)
    })
  )
)
```
```

---

## Phase 4: Validate

### Verification Commands

```bash
# Check file exists and length
ls -lh .claude/agents/code-observability-writer.md
wc -l .claude/agents/code-observability-writer.md

# Verify no async/await
grep -i "async\|await" .claude/agents/code-observability-writer.md && echo "FAIL" || echo "PASS"

# Verify Effect imports
grep "import \* as Effect\|import \* as Cause\|import \* as S" .claude/agents/code-observability-writer.md

# Verify TaggedError pattern
grep "TaggedError" .claude/agents/code-observability-writer.md
```

### Success Criteria

- [ ] Agent definition at `.claude/agents/code-observability-writer.md`
- [ ] Length is 350-450 lines
- [ ] Covers Cause, Logger, Metric, Tracer
- [ ] Includes TaggedError patterns
- [ ] All examples use Effect patterns
- [ ] Includes pattern templates
- [ ] Tested with sample instrumentation

---

## Ready-to-Use Orchestrator Prompt

```
You are executing the code-observability-writer agent creation spec.

Your goal: Create `.claude/agents/code-observability-writer.md` (350-450 lines) — an observability instrumentation agent.

CRITICAL RULES:
1. All examples MUST use Effect.gen (no async/await)
2. All errors MUST extend S.TaggedError
3. All logging MUST be structured (no string concatenation)

PHASE 1 - Research:
1. Search Effect docs for Cause, Logger, Metric, Tracer, TaggedError
2. Grep codebase for existing error patterns
3. Grep codebase for existing logging patterns
4. Read documentation/EFFECT_PATTERNS.md
5. Output to specs/agents/code-observability-writer/outputs/research-findings.md

PHASE 2 - Design:
1. Design error definition patterns
2. Design structured logging patterns
3. Design tracing patterns
4. Design metrics patterns
5. Output to specs/agents/code-observability-writer/outputs/agent-design.md

PHASE 3 - Create:
1. Write .claude/agents/code-observability-writer.md
2. Include pattern templates
3. Include before/after examples
4. Test with sample instrumentation task

PHASE 4 - Validate:
1. Run verification commands
2. Update REFLECTION_LOG.md

Begin with Phase 1.
```
