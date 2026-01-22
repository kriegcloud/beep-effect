# Agent Signatures Composition Guide

This guide explains how to use DSPy-style signatures to compose agents into pipelines for spec execution.

## Overview

Agent signatures define input/output contracts that enable:
- **Composition**: Chain agents by connecting outputs to inputs
- **Validation**: Verify agent invocations have required fields
- **Planning**: Design multi-agent workflows with clear data flow
- **Documentation**: Understand what each agent needs and produces

## Signature Quick Reference

### Read-Only Agents (sideEffects: none)

| Agent | Input | Output |
|-------|-------|--------|
| **codebase-researcher** | question, scope?, depth? | findings, gaps, recommendations |
| **mcp-researcher** | query, adaptToCodebase? | documentation, codebaseAdaptation, sources |
| **web-researcher** | questions, yearFilter?, domainFilters? | findings, crossReference, recommendations, sources |

### Report-Writing Agents (sideEffects: write-reports)

| Agent | Input | Output |
|-------|-------|--------|
| **reflector** | specName?, scope?, focusArea? | patterns, promptRefinements, documentationUpdates, cumulativeLearnings |
| **code-reviewer** | target, categories?, excludePatterns? | report, violations, statistics |
| **architecture-pattern-enforcer** | scope, target | report, layerViolations, crossSliceViolations, structureIssues |

### File-Writing Agents (sideEffects: write-files)

| Agent | Input | Output |
|-------|-------|--------|
| **doc-writer** | targetFiles, contentType, context?, packagePath? | filesCreated, filesModified, summary, validationResults |
| **test-writer** | sourceFiles, testType?, context?, layerDependencies? | filesCreated, filesModified, testCases, layerSetup |
| **code-observability-writer** | sourceFiles, instrumentationType?, context? | filesModified, errorsCreated, metricsAdded, spansAdded |

## Composition Patterns

### Pattern 1: Research → Document

```
┌─────────────────────┐     ┌──────────────────┐
│ codebase-researcher │     │    doc-writer    │
├─────────────────────┤     ├──────────────────┤
│ Input:              │     │ Input:           │
│   question          │     │   targetFiles    │
│   scope             │     │   contentType    │
├─────────────────────┤     │   context ◄──────┼── findings
│ Output:             │     ├──────────────────┤
│   findings ─────────┼────►│ Output:          │
│   gaps              │     │   filesCreated   │
│   recommendations   │     │   filesModified  │
└─────────────────────┘     └──────────────────┘
```

**Use Case**: Research codebase patterns, then generate documentation.

**Example Orchestration**:
```markdown
### Step 1: Research
**Agent**: codebase-researcher
**Input**:
  - question: "How does the authentication flow work?"
  - scope: ["packages/iam/"]
  - depth: deep
**Output → Step 2**: findings, recommendations

### Step 2: Document
**Agent**: doc-writer
**Input**:
  - targetFiles: ["packages/iam/server/README.md"]
  - contentType: readme
  - context: [findings from Step 1]
**Output**: filesCreated, filesModified
```

### Pattern 2: Review → Reflect → Improve

```
┌──────────────┐     ┌───────────┐     ┌────────────┐
│ code-reviewer│     │ reflector │     │ doc-writer │
├──────────────┤     ├───────────┤     ├────────────┤
│ target       │     │ specName  │     │ targetFiles│
│ categories   │     │ scope     │     │ contentType│
├──────────────┤     │ focusArea │     │ context ◄──┼── patterns
│ report ──────┼────►│           │     ├────────────┤
│ violations   │     │ patterns ─┼────►│ summary    │
│ statistics   │     │ updates   │     │ validation │
└──────────────┘     └───────────┘     └────────────┘
```

**Use Case**: Review code, extract patterns, update documentation.

### Pattern 3: External Research → Implementation

```
┌────────────────┐     ┌───────────────┐     ┌─────────────┐
│ web-researcher │     │ mcp-researcher│     │ test-writer │
├────────────────┤     ├───────────────┤     ├─────────────┤
│ questions      │     │ query ◄───────┼──┐  │ sourceFiles │
│ yearFilter     │     │ adaptToCodebase│  │  │ testType    │
├────────────────┤     ├───────────────┤  │  │ context ◄───┼──
│ findings ──────┼────►│ documentation │  │  ├─────────────┤
│ recommendations│  ┌──┤ adaptation ───┼──┼─►│ testCases   │
└────────────────┘  │  └───────────────┘  │  │ layerSetup  │
                    │                      │  └─────────────┘
                    └──────────────────────┘
```

**Use Case**: Research external patterns, adapt to codebase, write tests.

### Pattern 4: Architecture Audit → Fix

```
┌─────────────────────────┐     ┌─────────────────────────┐
│ architecture-pattern-   │     │ code-observability-     │
│ enforcer                │     │ writer                  │
├─────────────────────────┤     ├─────────────────────────┤
│ Input:                  │     │ Input:                  │
│   scope                 │     │   sourceFiles ◄─────────┼── violations.file
│   target                │     │   instrumentationType   │
├─────────────────────────┤     │   context               │
│ Output:                 │     ├─────────────────────────┤
│   layerViolations ──────┼────►│ Output:                 │
│   crossSliceViolations  │     │   filesModified         │
│   structureIssues       │     │   errorsCreated         │
└─────────────────────────┘     └─────────────────────────┘
```

## Composition Rules

### 1. Type Compatibility

Output types must be compatible with connected input types:

| Output Type | Compatible Input Types |
|-------------|------------------------|
| `string` | `string`, `string[]` (as single element) |
| `string[]` | `string[]` |
| `object` | `object`, `string` (via JSON.stringify) |
| `array` | `array`, `string[]` (if array of strings) |

### 2. Side Effect Escalation

Pipelines inherit the highest side effect level:

```
none + none = none
none + write-reports = write-reports
none + write-files = write-files
write-reports + write-files = write-files
```

### 3. Required vs Optional

- **Required inputs** (`required: true`) must be provided by user or previous agent
- **Optional inputs** (`required: false`) can be omitted
- Chains should only depend on required outputs

### 4. No Circular Dependencies

Invalid: Agent A → Agent B → Agent A

## Orchestrator Prompt Patterns

### Sequential Pipeline

```markdown
## Pipeline: [Name]

### Step 1: [Phase Name]
**Agent**: [agent-name]
**Input**:
  - field1: [value or reference]
  - field2: [value or reference]
**Expected Output**: field1, field2

### Step 2: [Phase Name]
**Agent**: [agent-name]
**Input**:
  - field1: [Step 1 output reference]
  - field2: [literal value]
**Expected Output**: field1, field2
```

### Parallel Execution

```markdown
## Pipeline: [Name]

### Step 1a: [Phase Name] (parallel)
**Agent**: codebase-researcher
**Input**: question: "How does X work?"
**Expected Output**: findings

### Step 1b: [Phase Name] (parallel)
**Agent**: web-researcher
**Input**: questions: ["Best practices for X"]
**Expected Output**: findings, recommendations

### Step 2: [Synthesis]
**Agent**: doc-writer
**Input**:
  - context: [Step 1a findings + Step 1b findings]
  - targetFiles: ["README.md"]
**Expected Output**: filesCreated
```

### Conditional Branching

```markdown
## Pipeline: [Name]

### Step 1: Review
**Agent**: code-reviewer
**Input**: target: "packages/iam/"
**Expected Output**: report, violations

### Step 2a: If violations.length > 0
**Agent**: reflector
**Input**:
  - specName: "current-spec"
  - focusArea: "code-quality"
**Expected Output**: patterns, updates

### Step 2b: If violations.length == 0
**Agent**: doc-writer
**Input**: targetFiles: ["CHANGELOG.md"]
**Expected Output**: filesModified
```

## Validation Checklist

Before executing a composed pipeline:

- [ ] All required inputs are provided or connected
- [ ] Output types match connected input types
- [ ] No circular dependencies exist
- [ ] Side effect level is acceptable for the context
- [ ] Parallel steps are truly independent

## Common Composition Mistakes

### Mistake 1: Missing Required Input

```markdown
### Step 2: Document
**Agent**: doc-writer
**Input**:
  - context: [findings from Step 1]
  # ERROR: Missing required 'targetFiles' and 'contentType'
```

**Fix**: Always provide all required inputs.

### Mistake 2: Type Mismatch

```markdown
### Step 1
**Output**: violations (array of objects)

### Step 2
**Input**: sourceFiles (expects string[])
# ERROR: Cannot connect array of objects to string[]
```

**Fix**: Transform output or use compatible field.

### Mistake 3: Circular Reference

```markdown
### Step 1
**Agent**: reflector
**Input**: context: [Step 3 output]

### Step 2
**Agent**: doc-writer

### Step 3
**Agent**: code-reviewer
**Input**: target: [Step 1 output files]
# ERROR: Step 1 depends on Step 3, Step 3 depends on Step 1
```

**Fix**: Break cycle by making one step independent.

## See Also

- [Agent Signature Template](../specs/spec-creation-improvements/templates/AGENT_SIGNATURE.template.md)
- [DSPy Signatures Research](../specs/spec-creation-improvements/outputs/dspy-signatures-research.md)
- [Spec Guide](../specs/_guide/README.md)
