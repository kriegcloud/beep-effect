# JSDoc Analyzer

Analyze TypeScript files for missing JSDoc `@example` and `@category` tags across any package or app in the beep-effect monorepo.

## Usage

```bash
node scripts/analyze-jsdoc.mjs [options] [target]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `target` | Path to analyze (relative to repo root) |

## Options

| Option | Description |
|--------|-------------|
| `--file=<filename>` | Analyze a specific file within the target directory |
| `--recursive` | Recursively scan all subdirectories (default: true) |
| `--no-recursive` | Only scan the immediate src directory |
| `--extensions=<ext>` | Comma-separated file extensions to analyze (default: `.ts,.tsx`) |
| `--exclude=<patterns>` | Comma-separated glob patterns to exclude (default: `*.test.ts,*.spec.ts,*.d.ts`) |
| `--json` | Output results as JSON only (no formatted report) |
| `--list` | List all available targets for analysis |
| `--help`, `-h` | Show help message |

## Examples

### List all available targets

```bash
node scripts/analyze-jsdoc.mjs --list
```

### Analyze a package

```bash
# Analyze the identity package
node scripts/analyze-jsdoc.mjs packages/common/identity

# Analyze the IAM domain layer
node scripts/analyze-jsdoc.mjs packages/iam/domain

# Analyze the shared domain package
node scripts/analyze-jsdoc.mjs packages/shared/domain
```

### Analyze an app

```bash
# Analyze the web app
node scripts/analyze-jsdoc.mjs apps/web

# Analyze only .ts files (exclude .tsx)
node scripts/analyze-jsdoc.mjs apps/web --extensions=.ts
```

### Analyze a specific file

```bash
# Analyze a specific file within a package
node scripts/analyze-jsdoc.mjs packages/iam/domain --file=User.ts

# Use relative path from src/ for nested files
node scripts/analyze-jsdoc.mjs packages/common/schema --file=core/core.ts
```

### Analyze a subdirectory

```bash
# Analyze only the entities folder
node scripts/analyze-jsdoc.mjs packages/shared/domain/src/entities
```

### JSON output

```bash
# Get machine-readable JSON output
node scripts/analyze-jsdoc.mjs packages/iam/domain --json

# Pipe to jq for processing
node scripts/analyze-jsdoc.mjs packages/iam/domain --json | jq '.missingItems | length'
```

## Output

### Report Sections

The analyzer produces a report with the following sections:

1. **Summary Statistics** - Total files, exports, and missing documentation counts
2. **Top Files Needing Attention** - Files sorted by missing documentation items
3. **Perfectly Documented Files** - Files with complete documentation
4. **Sample Missing Items** - Example exports needing documentation from the worst file
5. **Breakdown by Export Type** - Missing docs grouped by const, function, type, etc.
6. **Documentation Progress** - Percentage completion for examples and categories

### JSON Output File

After analysis, a JSON file is saved with detailed results:

```
jsdoc-analysis-{target-path}.json
```

The JSON contains:
- `targetPath` - The analyzed directory
- `totalFiles` - Number of files scanned
- `totalExports` - Number of exported members found
- `missingExamples` - Count of exports without `@example`
- `missingCategories` - Count of exports without `@category`
- `fileDetails` - Per-file breakdown
- `missingItems` - List of all exports needing documentation

## What Gets Analyzed

The analyzer looks for these export patterns:

- `export const`
- `export function`
- `export type`
- `export interface`
- `export class`
- `export enum`
- `export namespace`
- `export declare` variants

### Excluded from Analysis

- Re-exports (`export { x } from './module'`)
- Internal exports (names starting with `_`)
- Exports marked with `@internal` JSDoc tag
- Test files (`*.test.ts`, `*.spec.ts`)
- Declaration files (`*.d.ts`)
- Files in `node_modules`, `dist`, `.git`, `coverage`, `.turbo`

## Available Targets

Run `--list` to see all 49+ analyzable targets including:

- `apps/web`, `apps/server`, `apps/notes`
- `packages/common/*` (identity, schema, contract, utils, etc.)
- `packages/iam/*` (domain, infra, sdk, tables, ui)
- `packages/shared/*` (domain, infra, sdk, tables, ui)
- `packages/documents/*`, , etc.