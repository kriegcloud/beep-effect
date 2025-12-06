# Docgen AI Agents

> AI-powered JSDoc documentation system using Anthropic Claude.

The docgen agents system uses Claude to automatically analyze and fix JSDoc documentation across packages. It provides token tracking, cost estimation, and crash-resilient workflow execution.

## Table of Contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Usage](#usage)
- [CLI Options](#cli-options)
- [Supported Models](#supported-models)
- [Token Usage & Pricing](#token-usage--pricing)
- [Workflow Modes](#workflow-modes)
- [Agent Architecture](#agent-architecture)
- [System Prompts](#system-prompts)
- [Tools Available to Agents](#tools-available-to-agents)
- [Best Practices](#best-practices)

---

## Overview

The agents command orchestrates AI to:

1. Analyze packages for missing JSDoc documentation
2. Read source files to understand code context
3. Generate appropriate JSDoc tags (`@category`, `@example`, `@since`)
4. Write updated files with documentation
5. Track token usage and estimate costs

---

## Requirements

### API Key

Set your Anthropic API key:

```bash
export AI_ANTHROPIC_API_KEY=sk-ant-api03-...
```

Or prefix the command:

```bash
AI_ANTHROPIC_API_KEY=sk-ant-... bun run docgen:agents -- -p packages/common/contract
```

### Package Configuration

Packages must have `docgen.json` configured. Run `bun run docgen:init -- -p <package>` first if needed.

---

## Usage

### Dry Run (No Changes)

Preview what would be fixed without making changes:

```bash
bun run docgen:agents -- --dry-run
bun run docgen:agents -- --dry-run -p packages/common/contract
bun run docgen:agents -- --dry-run --verbose
```

### Single Package

Fix documentation for one package:

```bash
AI_ANTHROPIC_API_KEY=sk-ant-... bun run docgen:agents -- -p packages/common/contract
```

### All Packages

Process all configured packages:

```bash
AI_ANTHROPIC_API_KEY=sk-ant-... bun run docgen:agents
```

### Parallel Processing

Process multiple packages concurrently:

```bash
AI_ANTHROPIC_API_KEY=sk-ant-... bun run docgen:agents -- --parallel 4
```

---

## CLI Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--package` | `-p` | Target package path or name | All configured |
| `--parallel` | - | Concurrency level | `2` |
| `--dry-run` | - | Analysis without changes | `false` |
| `--verbose` | `-v` | Detailed output | `false` |
| `--model` | - | Claude model ID | `claude-sonnet-4-20250514` |
| `--durable` | `-d` | Enable crash recovery | `false` |
| `--resume` | - | Resume workflow ID | - |

---

## Supported Models

### Claude Sonnet 4 (Default)

```bash
bun run docgen:agents -- --model claude-sonnet-4-20250514
```

- Fast execution
- Cost-effective
- Good for bulk documentation

### Claude Opus 4

```bash
bun run docgen:agents -- --model claude-opus-4-20250514
```

- Higher quality output
- Better for complex code
- 5x higher cost

---

## Token Usage & Pricing

The system tracks token usage and estimates costs in real-time.

### Current Pricing (December 2025)

| Model | Input | Output | Cached Input |
|-------|-------|--------|--------------|
| Claude Sonnet 4 | $3.00 / 1M | $15.00 / 1M | $0.30 / 1M |
| Claude Opus 4 | $15.00 / 1M | $75.00 / 1M | $1.50 / 1M |

### Output Example

```
Token Usage:
  Input:       12,340 tokens
  Output:      8,920 tokens
  Total:       21,260 tokens
  Est. Cost:   $0.1856
```

### Cost Estimation

For a typical package with ~50 exports needing documentation:

| Model | Estimated Tokens | Estimated Cost |
|-------|------------------|----------------|
| Sonnet | ~20,000 | ~$0.15 |
| Opus | ~20,000 | ~$0.75 |

---

## Workflow Modes

### Standard Mode (Default)

Fast, stateless execution:

```bash
bun run docgen:agents -- -p packages/common/contract
```

### Durable Mode

Crash-resilient with `@effect/workflow`:

```bash
bun run docgen:agents -- -p packages/common/contract --durable
```

Features:
- Automatic checkpointing
- Resume from interruption
- Rate limiting between API calls

### Resume Interrupted Workflow

```bash
bun run docgen:agents -- --durable --resume docgen-packages-common-contract
```

---

## Agent Architecture

### Service Layer

```
DocgenAgentService
├── TokenCounter         # Tracks token usage across interactions
├── LanguageModel        # Anthropic Claude integration
└── FileSystem/Path      # File operations
```

### Processing Flow

```
1. Load docgen.json configuration
2. Analyze package exports (ts-morph)
3. Filter exports missing documentation
4. Group by file
5. For each file:
   a. Read file content
   b. Identify missing tags
   c. Call Claude API with context
   d. Write updated file
   e. Record token usage
6. Aggregate results and report
```

### Activities (Durable Workflow)

| Activity | Purpose |
|----------|---------|
| `ReadConfigActivity` | Load package docgen.json |
| `AnalyzePackageActivity` | Parse exports with ts-morph |
| `ReadFileActivity` | Read source file content |
| `CallAIActivity` | Make Claude API request |
| `WriteFileActivity` | Write updated content |
| `ValidateExamplesActivity` | Verify example compilation |

---

## System Prompts

### DocFixer Agent

The main agent uses a carefully crafted system prompt that encodes:

1. **Required Tags**: `@category`, `@example`, `@since`
2. **Category Patterns**: Constructors, Models, Utils, Errors, Services, Layers, Schemas
3. **Effect Patterns**: `Effect.gen`, `F.pipe`, `A.map`, namespace imports
4. **Import Conventions**: `import * as Effect from "effect/Effect"`
5. **Forbidden Patterns**: Native array methods, async/await, `any` type

### Example Format Guidance

```typescript
/**
 * @example
 * ```typescript
 * import { MyFunction } from "@beep/package-name"
 * import * as Effect from "effect/Effect"
 *
 * const result = MyFunction({ input: "value" })
 * console.log(result)
 * // => Expected output
 * ```
 */
```

---

## Tools Available to Agents

The agent toolkit provides these tools:

### AnalyzePackage

Run JSDoc analysis on a package.

```typescript
{
  packagePath: "packages/common/contract"
}
// Returns: analysisContent, exportCount, missingCount
```

### ReadSourceFile

Read TypeScript source file content.

```typescript
{
  filePath: "/absolute/path/to/file.ts"
}
// Returns: content, lineCount
```

### WriteSourceFile

Write updated content to a file.

```typescript
{
  filePath: "/absolute/path/to/file.ts",
  content: "// Updated file content..."
}
// Returns: success, bytesWritten
```

### ValidateExamples

Verify that @example blocks compile.

```typescript
{
  packagePath: "packages/common/contract"
}
// Returns: valid, errors, moduleCount
```

### SearchEffectDocs

Search Effect documentation for patterns.

```typescript
{
  query: "Effect.gen usage"
}
// Returns: results[{ title, content, documentId }]
```

### ListPackageExports

Get all exports from a package.

```typescript
{
  packagePath: "packages/common/contract"
}
// Returns: exports[{ name, kind, filePath, line, hasJsDoc }]
```

---

## Best Practices

### 1. Always Start with Dry Run

```bash
bun run docgen:agents -- --dry-run -p packages/common/contract
```

### 2. Use Verbose for Debugging

```bash
bun run docgen:agents -- --dry-run --verbose
```

### 3. Process Small Batches

Start with one package before running on all:

```bash
# Single package first
AI_ANTHROPIC_API_KEY=sk-ant-... bun run docgen:agents -- -p packages/common/identity

# Then all packages
AI_ANTHROPIC_API_KEY=sk-ant-... bun run docgen:agents
```

### 4. Validate After Running

Re-run analyze to verify improvements:

```bash
bun run docgen:analyze -- -p packages/common/contract
```

### 5. Use Durable Mode for Large Jobs

For many packages or unreliable networks:

```bash
AI_ANTHROPIC_API_KEY=sk-ant-... bun run docgen:agents -- --durable --parallel 2
```

### 6. Review Generated Documentation

AI-generated documentation should be reviewed:
- Verify examples are accurate
- Check categories are appropriate
- Ensure descriptions match behavior

### 7. Monitor Token Usage

Watch costs especially with Opus:

```
Summary:
  Est. Cost:   $0.1856
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `No packages to process` | No packages with docgen.json | Run `docgen:init` first |
| `API key not set` | Missing ANTHROPIC_API_KEY | Set environment variable |
| `Rate limit exceeded` | Too many API requests | Reduce `--parallel` |
| `Validation failed` | Example doesn't compile | Review generated code |

### Error Recovery

With durable mode, errors are recorded per-package:

```
Results
=======

✓ @beep/contract: 15 fixed, 3 remaining
✗ @beep/utils: Failed - Validation error
```

Check detailed errors with `--verbose`.

---

## Output Schema

### PackageFixResult

```typescript
interface PackageFixResult {
  packageName: string;      // "@beep/contract"
  packagePath: string;      // "packages/common/contract"
  success: boolean;
  exportsFixed: number;
  exportsRemaining: number;
  validationPassed: boolean;
  errors: string[];
  durationMs: number;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    reasoningTokens: number;
    cachedInputTokens: number;
  };
}
```

### WorkflowResult

```typescript
interface DocgenWorkflowResult {
  results: PackageFixResult[];
  totalExportsFixed: number;
  totalTokens: number;
  durationMs: number;
}
```

---

## Related Documentation

- [DOCGEN.md](./DOCGEN.md) - Main command reference
- [DOCGEN_QUICK_START.md](./DOCGEN_QUICK_START.md) - Getting started guide
- [DOCGEN_CONFIGURATION.md](./DOCGEN_CONFIGURATION.md) - Configuration options
- [DOCGEN_TROUBLESHOOTING.md](./DOCGEN_TROUBLESHOOTING.md) - Common issues
