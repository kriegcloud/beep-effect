---
name: schema-derivation-master-orchestration
version: 2
created: 2025-12-28
iterations: 1
---

# Master Orchestration Prompt: Schema Column Type Derivation Research

## Context

You are coordinating a parallel research effort to investigate how Effect Schema types can be distinguished at the TypeScript type level for SQL column type derivation in the `beep-effect` monorepo.

**The DSL Goal**: Build `DeriveColumnTypeFromSchema<Schema>` that maps Effect Schema types to SQL column type literals (`"string"`, `"integer"`, `"uuid"`, `"datetime"`, `"json"`, `"bigint"`, `"number"`, `"boolean"`).

**The Core Challenge**: TypeScript's `any` type causes conditional checks like `Schema extends typeof S.Int` to fail because `Schema<any, any, never>` matches bidirectionally with all schema types.

**Disambiguation Examples**:
| Schemas | Encoded Type | Desired Column Types |
|---------|--------------|---------------------|
| `S.Int` vs `S.Number` | both `number` | `"integer"` vs `"number"` |
| `S.UUID` vs `S.String` | both `string` | `"uuid"` vs `"string"` |
| `S.Date` vs `S.String` | both `string` | `"datetime"` vs `"string"` |

## Objective

1. Deploy 11 sub-agents in parallel to research each schema type
2. Wait for all sub-agents to complete
3. Synthesize findings into a comprehensive report
4. Recommend the best implementation approach

**Success Criteria**:
- All 11 schema research reports saved to output directory
- Synthesis report includes working implementation code
- Clear recommendation with confidence assessment

## Role

You are a research coordinator orchestrating parallel Effect/TypeScript experts. You do not perform the research yourself - you deploy sub-agents, collect results, and synthesize findings.

## Constraints

### Parallel Deployment

**CRITICAL**: Deploy ALL sub-agents in a SINGLE message with multiple Task tool calls. Do NOT deploy sequentially.

```typescript
// CORRECT: Single message, multiple tool calls
[Task: Int], [Task: UUID], [Task: ULID], [Task: Date], ...  // All in one message

// WRONG: Multiple messages
[Task: Int]  // Message 1
[Task: UUID] // Message 2  <- DON'T DO THIS
```

### Sub-Agent Configuration

Use the `Task` tool with `subagent_type="Explore"` for all sub-agents (they need to read source files).

Example Task tool call:
```json
{
  "description": "Research S.Int schema",
  "prompt": "<constructed prompt with Int specifics>",
  "subagent_type": "Explore"
}
```

### Report Collection

Use `TaskOutput` with `block=true` to wait for each sub-agent to complete before synthesizing.

## Resources

### Sub-Agent Prompt Template

Read the refined sub-agent prompt at:
`/home/elpresidank/YeeBois/projects/beep-effect/.specs/dsl-derived-column-types/default-column-derivation-research/sub-agent-prompt.md`

Each sub-agent prompt should substitute:
- `{SCHEMA_NAME}` - e.g., "Int", "UUID", "Date"
- `{EXPECTED_COLUMN_TYPE}` - e.g., "integer", "uuid", "datetime"
- `{CATEGORY}` - "Primitive" | "Refined" | "Transformation" | "Special"
- `{BASE_SCHEMA}` - e.g., "Number" for Int, "String" for UUID, "N/A" for primitives

### File Locations

| Resource | Path |
|----------|------|
| Effect Schema source | `tmp/effect/packages/effect/src/Schema.ts` |
| Effect SchemaAST source | `tmp/effect/packages/effect/src/SchemaAST.ts` |
| Current DSL types | `packages/common/schema/src/integrations/sql/dsl/types.ts` |
| Sub-agent prompt | `.specs/dsl-derived-column-types/default-column-derivation-research/sub-agent-prompt.md` |
| Output directory | `.specs/dsl-derived-column-types/default-column-derivation-research/` |

## Deployment Manifest

Deploy sub-agents for these 11 schemas in parallel:

### Group 1: Refined Schemas (Priority)

| Schema | Column Type | Category | Base | Report File |
|--------|-------------|----------|------|-------------|
| `Int` | `"integer"` | Refined | `Number` | `int.md` |
| `UUID` | `"uuid"` | Refined | `String` | `uuid.md` |
| `ULID` | `"uuid"` | Refined | `String` | `ulid.md` |

### Group 2: Transformation Schemas

| Schema | Column Type | Category | Base | Report File |
|--------|-------------|----------|------|-------------|
| `Date` | `"datetime"` | Transformation | N/A | `date.md` |
| `DateFromString` | `"datetime"` | Transformation | N/A | `datefromstring.md` |
| `DateTimeUtc` | `"datetime"` | Transformation | N/A | `datetimeutc.md` |
| `BigInt` | `"bigint"` | Transformation | N/A | `bigint.md` |

### Group 3: Special Schemas (Problematic)

| Schema | Column Type | Category | Issue | Report File |
|--------|-------------|----------|-------|-------------|
| `Any` | `"json"` | Special | `any` variance | `any.md` |
| `Unknown` | `"json"` | Special | Top type | `unknown.md` |

### Group 4: Primitive Baseline

| Schema | Column Type | Category | Report File |
|--------|-------------|----------|-------------|
| `String` | `"string"` | Primitive | `string.md` |
| `Number` | `"number"` | Primitive | `number.md` |

## Sub-Agent Prompt Construction

For each schema, construct the prompt by reading the template and substituting variables:

**Example for S.Int**:
```
Research the Effect Schema type `S.Int` for SQL column type derivation.

**Your Assignment**:
- Schema: `Int`
- Expected column type: `"integer"`
- Category: `Refined`
- Base schema: `Number`

[... rest of sub-agent prompt template ...]
```

## Post-Deployment: Synthesis

After all sub-agents complete:

### Step 1: Collect Reports

```
TaskOutput(task_id=int_task, block=true)
TaskOutput(task_id=uuid_task, block=true)
// ... for all 11 tasks
```

### Step 2: Read Individual Reports

Read each report file from the output directory:
- `.specs/dsl-derived-column-types/default-column-derivation-research/int.md`
- `.specs/dsl-derived-column-types/default-column-derivation-research/uuid.md`
- ... etc.

### Step 3: Create Synthesis Report

Write the synthesis report to:
`/home/elpresidank/YeeBois/projects/beep-effect/.specs/dsl-derived-column-types/default-column-derivation-research.md`

### Synthesis Report Structure

```markdown
# Default Column Type Derivation Research Report

## Executive Summary

[2-3 sentence summary of key findings]

**Bottom Line**: [One sentence recommendation]

## Approach Evaluation

### 1. Class Identity Checks (`typeof S.X`)

**Verdict**: [WORKS / FAILS / PARTIAL]

[Explanation with evidence from sub-agent reports]

### 2. SchemaId Annotation Checks (Runtime)

**Verdict**: [WORKS / FAILS / PARTIAL]

| Schema | Has SchemaId | Symbol | Access Path |
|--------|--------------|--------|-------------|
| Int | YES | IntSchemaId | `AST.getSchemaIdAnnotation(ast)` |
| UUID | YES | UUIDSchemaId | `AST.getSchemaIdAnnotation(ast)` |
| ... | ... | ... | ... |

### 3. Encoded Type Fallback

**Verdict**: [WORKS / FAILS / PARTIAL]

| Schema | Encoded | Fallback Result | Correct? |
|--------|---------|-----------------|----------|
| Int | number | "number" | NO |
| UUID | string | "string" | NO |
| ... | ... | ... | ... |

## Per-Schema Findings

### Refined Schemas (Int, UUID, ULID)

[Summary from individual reports]

### Transformation Schemas (Date, DateFromString, DateTimeUtc, BigInt)

[Summary from individual reports]

### Special Schemas (Any, Unknown)

[Summary from individual reports - why these cause problems]

### Primitives (String, Number)

[Summary - baseline behavior]

## Recommended Implementation

### Approach

[Name of recommended approach]

### Confidence

[HIGH / MEDIUM / LOW] - [reason]

### Implementation

```typescript
// Complete, working type definition
import * as S from "effect/Schema";

type DeriveColumnTypeFromSchema<Schema> =
  // ... implementation
```

### Known Limitations

1. [Limitation 1]
2. [Limitation 2]

## Action Items

1. [ ] [Specific next step]
2. [ ] [Specific next step]
```

### Step 4: Notify User

Summarize:
- Total schemas researched: 11
- Key finding: [one sentence]
- Recommended approach: [approach name]
- Report location: `.specs/dsl-derived-column-types/default-column-derivation-research.md`

## Verification Checklist

Before completing, verify:

- [ ] All 11 sub-agents deployed in a single parallel batch
- [ ] All 11 reports collected (check for files in output directory)
- [ ] Synthesis report includes working implementation code
- [ ] Recommendation is actionable with clear next steps

---

## Metadata

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0 | Initial draft | N/A |
| 1 | Lacked parallel deployment emphasis, missing synthesis structure, vague sub-agent instructions | Added CRITICAL parallel note, detailed synthesis structure, complete deployment manifest |
