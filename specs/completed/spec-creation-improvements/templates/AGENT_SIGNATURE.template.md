# Agent Signature Template

This template defines the standard format for DSPy-style signatures in agent definitions.

## Format Definition

Agent signatures are defined in the YAML frontmatter using the `signature` key:

```yaml
---
name: agent-name
description: Brief description
tools: [Tool1, Tool2]
signature:
  input:
    fieldName:
      type: string|string[]|enum|object
      description: What this field contains
      required: true|false
  output:
    fieldName:
      type: string|string[]|object|array
      description: What this field produces
  sideEffects: none|write-reports|write-files
---
```

## Type Reference

### Input/Output Types

| Type | JSON Equivalent | Example |
|------|-----------------|---------|
| `string` | `"string"` | Single text value |
| `string[]` | `["string"]` | Array of strings |
| `object` | `{}` | Structured data |
| `array` | `[]` | Generic array |
| Literal enum | `"a"\|"b"\|"c"` | Fixed choices |

### Side Effects Classification

| Value | Meaning | Examples |
|-------|---------|----------|
| `none` | Read-only, no file modifications | codebase-researcher, mcp-researcher |
| `write-reports` | Creates analysis reports, doesn't modify code | reflector, code-reviewer |
| `write-files` | Creates or modifies source files | doc-writer, test-writer |

## Field Descriptions

### Input Fields

Required fields that the agent expects to receive:

```yaml
input:
  question:
    type: string
    description: Research question to investigate
    required: true
  scope:
    type: string[]
    description: Package paths to limit search
    required: false
  depth:
    type: shallow|medium|deep
    description: Exploration thoroughness
    required: false
```

### Output Fields

What the agent produces:

```yaml
output:
  findings:
    type: object
    description: Structured research results with sources
  gaps:
    type: string[]
    description: Unanswered questions requiring further research
  recommendations:
    type: string[]
    description: Actionable next steps
```

## Examples

### Read-Only Agent (Researcher)

```yaml
signature:
  input:
    question:
      type: string
      description: Research question to investigate
      required: true
    scope:
      type: string[]
      description: Package paths to limit search
      required: false
  output:
    findings:
      type: object
      description: "{ files: string[], patterns: string[], dependencies: string[] }"
    gaps:
      type: string[]
      description: Unanswered questions
  sideEffects: none
```

### Analysis Agent (Write Reports)

```yaml
signature:
  input:
    target:
      type: string|string[]
      description: Files or packages to analyze
      required: true
    categories:
      type: string[]
      description: Violation categories to check
      required: false
  output:
    report:
      type: object
      description: "{ violations: Violation[], summary: string, status: string }"
    recommendations:
      type: string[]
      description: Suggested fixes
  sideEffects: write-reports
```

### Writer Agent (Write Files)

```yaml
signature:
  input:
    targetFiles:
      type: string[]
      description: Files to create or modify
      required: true
    contentType:
      type: readme|agents|jsdoc
      description: Type of documentation to write
      required: true
    context:
      type: string
      description: Background information and requirements
      required: false
  output:
    filesCreated:
      type: string[]
      description: Paths of newly created files
    filesModified:
      type: string[]
      description: Paths of modified files
    summary:
      type: string
      description: Description of changes made
  sideEffects: write-files
```

## Composition Pattern

Signatures enable agent chaining by matching output → input:

```
┌─────────────────────┐     ┌──────────────────┐
│ codebase-researcher │     │    doc-writer    │
├─────────────────────┤     ├──────────────────┤
│ output.findings ────┼────►│ input.context    │
│ output.gaps         │     │ input.targetFiles│
└─────────────────────┘     └──────────────────┘
```

### Composition Examples

| Source Agent | Source Output | Target Agent | Target Input |
|--------------|---------------|--------------|--------------|
| codebase-researcher | findings | doc-writer | context |
| code-reviewer | report | reflector | phaseOutcome |
| mcp-researcher | patterns | test-writer | context |

## Validation Rules

1. **Required fields**: Input fields with `required: true` must be provided
2. **Type compatibility**: Output types must be compatible with connected input types
3. **Side effect escalation**: Pipelines inherit highest side effect level
4. **No circular deps**: Agent A → B → A is invalid

## Usage in Orchestration

When composing agents in orchestrator prompts:

```markdown
### Step 1: Research
**Agent**: codebase-researcher
**Input**:
  - question: "How does authentication work?"
  - scope: ["packages/iam/"]
**Expected Output**: findings, gaps

### Step 2: Document
**Agent**: doc-writer
**Input**:
  - context: [findings from Step 1]
  - targetFiles: ["packages/iam/server/README.md"]
  - contentType: readme
**Expected Output**: filesCreated, filesModified
```

## See Also

- [Agent Composition Guide](../../../documentation/patterns/agent-signatures.md)
- [DSPy Signatures Research](../outputs/dspy-signatures-research.md)
