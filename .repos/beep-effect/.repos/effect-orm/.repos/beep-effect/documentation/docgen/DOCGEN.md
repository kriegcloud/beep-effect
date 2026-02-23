# Docgen CLI Reference

> Complete documentation generation system for the beep-effect monorepo.

The docgen system provides tools for generating, analyzing, and maintaining JSDoc documentation across all packages. It integrates with `@effect/docgen` and provides AI-powered documentation assistance.

## Table of Contents

- [Overview](#overview)
- [Commands](#commands)
  - [init](#init)
  - [analyze](#analyze)
  - [generate](#generate)
  - [aggregate](#aggregate)
  - [status](#status)
  - [agents](#agents)
- [Exit Codes](#exit-codes)
- [Related Documentation](#related-documentation)

---

## Overview

The docgen CLI is accessed through the `beep` command:

```bash
beep docgen <subcommand> [options]
```

Or using the package.json scripts:

```bash
bun run docgen:init -- -p packages/common/contract
bun run docgen:analyze -- -p packages/common/contract
bun run docgen:generate
bun run docgen:aggregate
bun run docgen:status
bun run docgen:agents -- --dry-run
```

---

## Commands

### init

Bootstrap docgen configuration for a package.

```bash
beep docgen init -p <package-path> [--dry-run] [--force]
```

**Options:**

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--package` | `-p` | Target package path (required) | - |
| `--dry-run` | `-d` | Preview without writing | `false` |
| `--force` | `-f` | Overwrite existing config | `false` |

**Behavior:**

1. Validates the package path and locates `package.json`
2. Finds the best tsconfig (precedence: `tsconfig.src.json` > `tsconfig.build.json` > `tsconfig.json`)
3. Extracts `@beep/*` path mappings from tsconfig
4. Discovers `@beep/*` workspace dependencies
5. Generates `docgen.json` with appropriate compiler options

**Example:**

```bash
# Preview configuration
beep docgen init -p packages/common/contract --dry-run

# Generate configuration
beep docgen init -p packages/common/contract

# Overwrite existing configuration
beep docgen init -p packages/common/contract --force
```

**Output:**

```
✓ Initializing docgen for @beep/contract (packages/common/contract)
✓ Found tsconfig.json with 15 path mappings
✓ Detected 8 @beep/* workspace dependencies
✓ Generated docgen.json
```

---

### analyze

Analyze JSDoc coverage and generate reports.

```bash
beep docgen analyze [-p <package-path>] [--output <path>] [--json] [--fix-mode]
```

**Options:**

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--package` | `-p` | Target package (default: all configured) | - |
| `--output` | `-o` | Custom output path | `<package>/JSDOC_ANALYSIS.md` |
| `--json` | - | Also output JSON results | `false` |
| `--fix-mode` | - | Agent-actionable checklist format | `false` |

**Behavior:**

1. Uses ts-morph to parse TypeScript files
2. Extracts all exported symbols and their JSDoc blocks
3. Checks for required tags: `@category`, `@example`, `@since`
4. Computes priority (high: all missing, medium: 1-2 missing, low: none)
5. Generates markdown report with agent instructions

**Example:**

```bash
# Analyze single package
beep docgen analyze -p packages/common/contract

# Analyze all configured packages
beep docgen analyze

# Generate JSON output
beep docgen analyze -p packages/common/contract --json
```

**Output Files:**

- `JSDOC_ANALYSIS.md` - Agent-friendly markdown report
- `JSDOC_ANALYSIS.json` - Machine-readable JSON (with `--json`)

**Report Structure:**

```markdown
# JSDoc Analysis Report: @beep/contract

> **Generated**: 2025-12-06T10:30:00Z
> **Package**: packages/common/contract
> **Status**: 12 exports need documentation

## Instructions for Agent

[Documentation standards and workflow]

## Progress Checklist

### High Priority (Missing all required tags)

- [ ] `src/contract.ts:42` — **Contract** (type)
  - Missing: @category, @example, @since

### Medium Priority (Missing some tags)
...

## Summary Statistics

| Metric | Count |
|--------|-------|
| Total Exports | 35 |
| Fully Documented | 23 |
| Missing Documentation | 12 |
```

---

### generate

Run @effect/docgen for packages.

```bash
beep docgen generate [-p <package-path>] [--validate-examples] [--parallel <n>] [--json]
```

**Options:**

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--package` | `-p` | Target package (default: all configured) | - |
| `--validate-examples` | - | Type-check @example blocks | `false` |
| `--parallel` | `-j` | Concurrency limit | `4` |
| `--json` | - | Output as JSON | `false` |

**Behavior:**

1. Discovers target packages
2. Runs `bunx @effect/docgen` for each package
3. Counts generated markdown files in `docs/modules/`
4. Reports success/failure per package

**Example:**

```bash
# Generate docs for all packages
beep docgen generate

# Generate with example validation
beep docgen generate --validate-examples

# Generate single package
beep docgen generate -p packages/common/contract

# Parallel generation
beep docgen generate --parallel 8
```

**Output:**

```
ℹ Generating documentation for 8 package(s)...

Generation Results
==================

✓ @beep/contract (42 modules)
✓ @beep/schema (38 modules)
✗ @beep/utils
  → Run: beep docgen analyze -p packages/common/utils

Generated docs for 7/8 packages
```

---

### aggregate

Aggregate docs to central `./docs` folder.

```bash
beep docgen aggregate [--clean] [-p <package-path>]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--clean` | Remove existing docs before aggregating | `false` |
| `--package` | Aggregate specific package only | - |

**Behavior:**

1. Optionally removes existing `docs/` directory
2. Discovers packages with `docs/modules/` directories
3. Copies and transforms markdown files
4. Rewrites frontmatter for navigation
5. Generates root `docs/index.md`

**Example:**

```bash
# Aggregate all docs
beep docgen aggregate

# Clean and aggregate
beep docgen aggregate --clean

# Aggregate single package
beep docgen aggregate -p packages/common/contract
```

**Output Structure:**

```
docs/
├── index.md                    # Main navigation
├── identity/
│   ├── index.md
│   └── BeepId.ts.md
├── contract/
│   ├── index.md
│   └── Contract.ts.md
└── schema/
    └── EntityId.ts.md
```

---

### status

Show docgen configuration status.

```bash
beep docgen status [--verbose] [--json]
```

**Options:**

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--verbose` | `-v` | Show config details | `false` |
| `--json` | - | Output as JSON | `false` |

**Behavior:**

1. Discovers all workspace packages
2. Categorizes by docgen status
3. Reports coverage statistics

**Status Categories:**

- **Configured & Generated**: Has `docgen.json` AND `docs/modules/`
- **Configured (not generated)**: Has `docgen.json` only
- **Not Configured**: No `docgen.json`

**Example:**

```bash
# Quick status
beep docgen status

# Detailed status
beep docgen status --verbose

# JSON for CI/CD
beep docgen status --json
```

**Output:**

```
Docgen Status Report
====================

Configured & Generated (6):
  ✓ @beep/identity         packages/common/identity
  ✓ @beep/contract         packages/common/contract

Configured (not generated) (2):
  ⚠ @beep/utils            packages/common/utils

Not Configured (28):
  ◯ @beep/invariant        packages/common/invariant

Coverage: 8/36 packages (22%)
```

---

### agents

Run AI-powered JSDoc documentation fixes.

```bash
beep docgen agents [-p <package-path>] [--dry-run] [--parallel <n>] [--model <id>] [--verbose]
```

**Options:**

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--package` | `-p` | Target package | All configured |
| `--parallel` | - | Concurrency level | `2` |
| `--dry-run` | - | Analysis without changes | `false` |
| `--verbose` | `-v` | Detailed output | `false` |
| `--model` | - | Claude model ID | `claude-sonnet-4-20250514` |
| `--durable` | `-d` | Enable crash recovery | `false` |
| `--resume` | - | Resume workflow ID | - |

**Environment Variables:**

```bash
AI_ANTHROPIC_API_KEY=sk-ant-...  # Required for actual execution
```

**Example:**

```bash
# Dry run to see what would be fixed
bun run docgen:agents -- --dry-run

# Fix single package
AI_ANTHROPIC_API_KEY=sk-ant-... bun run docgen:agents -- -p packages/common/contract

# Verbose output
bun run docgen:agents -- --dry-run --verbose

# Use Opus for higher quality
AI_ANTHROPIC_API_KEY=sk-ant-... bun run docgen:agents -- --model claude-opus-4-20250514
```

**Output:**

```
Docgen Agents
=============

ℹ Processing 8 package(s)

Results
=======

✓ @beep/contract: 15 fixed, 3 remaining
✓ @beep/schema: 22 fixed, 1 remaining

Summary:
  Packages:    8/8 succeeded
  Fixed:       37 exports
  Remaining:   4 exports
  Duration:    45s

Token Usage:
  Input:       12,340 tokens
  Output:      8,920 tokens
  Total:       21,260 tokens
  Est. Cost:   $0.1856
```

See [DOCGEN_AGENTS.md](./DOCGEN_AGENTS.md) for detailed agent documentation.

---

## Exit Codes

All docgen commands use consistent exit codes:

| Code | Name | Description |
|------|------|-------------|
| `0` | Success | Command completed without errors |
| `1` | InvalidInput | Missing package.json, invalid path |
| `2` | ConfigurationError | Malformed docgen.json, schema validation failure |
| `3` | ExecutionError | docgen process failed, ts-morph parsing error |
| `4` | PartialFailure | Some packages succeeded, others failed |

---

## Related Documentation

- [DOCGEN_QUICK_START.md](./DOCGEN_QUICK_START.md) - Tutorial for getting started
- [DOCGEN_AGENTS.md](./DOCGEN_AGENTS.md) - AI agent system details
- [DOCGEN_CONFIGURATION.md](./DOCGEN_CONFIGURATION.md) - Configuration reference
- [DOCGEN_TROUBLESHOOTING.md](./DOCGEN_TROUBLESHOOTING.md) - Common issues and solutions
