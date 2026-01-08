# Docgen Quick Start Guide

> Get your packages documented in 5 minutes.

This guide walks you through the complete documentation workflow for a package in the beep-effect monorepo.

## Prerequisites

- Bun installed (`bun --version` returns 1.3.x+)
- You're in the beep-effect repository root

## Step 1: Check Current Status

First, see which packages have documentation configured:

```bash
bun run docgen:status
```

Output shows packages in three categories:
- **Configured & Generated** - Fully set up and documented
- **Configured (not generated)** - Has config but no docs yet
- **Not Configured** - Needs initialization

## Step 2: Initialize a Package

If your package isn't configured, initialize it:

```bash
# Preview what would be generated
bun run docgen:init -- -p packages/common/contract --dry-run

# Generate the configuration
bun run docgen:init -- -p packages/common/contract
```

This creates `packages/common/contract/docgen.json` with:
- Source directory settings
- TypeScript compiler options
- Path mappings for `@beep/*` imports
- Exclusion patterns for internal files

## Step 3: Analyze Documentation Coverage

See what needs documentation:

```bash
bun run docgen:analyze -- -p packages/common/contract
```

This generates `packages/common/contract/JSDOC_ANALYSIS.md` containing:
- Prioritized list of exports needing documentation
- Missing tags for each export (`@category`, `@example`, `@since`)
- Instructions for AI agents or manual fixing

## Step 4: Add Documentation

### Option A: Manual Documentation

Open your source files and add JSDoc comments:

```typescript
/**
 * Creates a new Contract instance with type-safe validation.
 *
 * @example
 * ```typescript
 * import { Contract } from "@beep/contract"
 * import * as S from "effect/Schema"
 *
 * const UserContract = Contract.make({
 *   input: S.Struct({ name: S.String }),
 *   output: S.Struct({ id: S.String }),
 * })
 * ```
 *
 * @category Constructors
 * @since 0.1.0
 */
export const make = <I, O>(config: ContractConfig<I, O>): Contract<I, O> => {
  // ...
}
```

### Option B: AI-Powered Documentation

Use the agents command to automatically add documentation:

```bash
# First, dry run to see what would be fixed
bun run docgen:agents -- -p packages/common/contract --dry-run

# Then run with API key to actually fix
AI_ANTHROPIC_API_KEY=sk-ant-... bun run docgen:agents -- -p packages/common/contract
```

## Step 5: Generate Documentation

Run the docgen tool to create markdown documentation:

```bash
bun run docgen:generate -- -p packages/common/contract
```

This runs `@effect/docgen` and creates files in `packages/common/contract/docs/modules/`.

### Validate Examples (Recommended)

Add `--validate-examples` to type-check your @example blocks:

```bash
bun run docgen:generate -- -p packages/common/contract --validate-examples
```

## Step 6: Aggregate Documentation

Collect all package docs into the central `docs/` folder:

```bash
bun run docgen:aggregate
```

Or clean and regenerate everything:

```bash
bun run docgen:aggregate -- --clean
```

## Complete Workflow Example

Here's the full workflow for documenting a new package:

```bash
# 1. Initialize configuration
bun run docgen:init -- -p packages/iam/domain

# 2. Analyze what needs docs
bun run docgen:analyze -- -p packages/iam/domain

# 3. Add documentation (choose one approach)
# Manual: Edit source files directly
# AI-powered:
AI_ANTHROPIC_API_KEY=sk-ant-... bun run docgen:agents -- -p packages/iam/domain

# 4. Re-analyze to verify improvements
bun run docgen:analyze -- -p packages/iam/domain

# 5. Generate the docs
bun run docgen:generate -- -p packages/iam/domain --validate-examples

# 6. Aggregate to central location
bun run docgen:aggregate

# 7. Check final status
bun run docgen:status
```

## Batch Processing

Process all packages at once:

```bash
# Analyze all configured packages
bun run docgen:analyze

# Generate docs for all packages (parallel)
bun run docgen:generate -- --parallel 8

# Use agents on all packages
AI_ANTHROPIC_API_KEY=sk-ant-... bun run docgen:agents -- --parallel 4
```

## Required JSDoc Tags

Every public export **must** have these tags:

### @category

Hierarchical grouping for the export:

```typescript
/**
 * @category Constructors
 * @category Models
 * @category Models/User
 * @category Utils
 * @category Errors
 * @category Services
 * @category Layers
 * @category Schemas
 */
```

### @example

Complete, compilable TypeScript example:

```typescript
/**
 * @example
 * ```typescript
 * import { MyFunction } from "@beep/package-name"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* MyFunction({ input: "value" })
 *   console.log(result)
 * })
 * ```
 */
```

### @since

Version when the export was added:

```typescript
/**
 * @since 0.1.0
 */
```

## Tips

### Use `--dry-run` First

Always preview changes before making them:

```bash
bun run docgen:init -- -p my-package --dry-run
bun run docgen:agents -- -p my-package --dry-run
```

### Check JSON Output for CI/CD

Use `--json` flag for machine-readable output:

```bash
bun run docgen:status -- --json > status.json
bun run docgen:generate -- --json > results.json
```

### Exclude Internal Files

Configure your `docgen.json` to skip internal implementations:

```json
{
  "exclude": [
    "src/internal/**/*.ts",
    "src/__tests__/**/*.ts"
  ]
}
```

## Next Steps

- [DOCGEN.md](DOCGEN.md) - Full command reference
- [DOCGEN_AGENTS.md](DOCGEN_AGENTS.md) - AI agent details
- [DOCGEN_CONFIGURATION.md](DOCGEN_CONFIGURATION.md) - Configuration options
- [DOCGEN_TROUBLESHOOTING.md](DOCGEN_TROUBLESHOOTING.md) - Common issues
