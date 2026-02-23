---
path: tooling/cli
summary: Unified Effect CLI for repo automation - docgen, slices, sync, verification
tags: [tooling, cli, automation, scaffolding, verification]
---

# @beep/repo-cli

Unified `@effect/cli`-based command-line interface for repository automation. Consolidates documentation generation, slice scaffolding, dependency management, workspace synchronization, and codebase verification into a single entry point. All commands are Effect-based and run with BunRuntime.

## Architecture

```
|-------------------|
|    repo-cli       |
|-------------------|
        |
        +---> docgen (init, analyze, generate, aggregate, agents)
        |
        +---> create-slice (domain, tables, server, client, ui)
        |
        +---> tsconfig-sync (references, paths, deps)
        |
        +---> verify (entityids, patterns, all)
        |
        +---> bootstrap-spec (simple, medium, complex)
        |
        +---> prune-unused-deps
        |
        +---> topo-sort
        |
        +---> agents-validate
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `src/index.ts` | Main CLI entry point exposing `runRepoCli` |
| `src/commands/docgen.ts` | Documentation generation with AI analysis |
| `src/commands/create-slice/` | Vertical slice scaffolding (5 sub-packages) |
| `src/commands/tsconfig-sync/` | TypeScript config synchronization |
| `src/commands/verify/` | EntityId and Effect pattern verification |
| `src/commands/bootstrap-spec/` | Specification scaffolding |
| `src/commands/prune-unused-deps.ts` | Dependency cleanup automation |
| `src/commands/topo-sort.ts` | Topological dependency sorting (Kahn's algorithm) |
| `src/commands/agents-validate.ts` | Agent manifest validation |

## Usage Patterns

### Slice Scaffolding

```bash
# Create new vertical slice with all 5 sub-packages
bun run repo-cli create-slice -n notifications -d "User notification system"

# Preview changes without writing
bun run repo-cli create-slice --name billing --description "Billing" --dry-run
```

### TypeScript Sync

```bash
# Sync all tsconfig files and package.json dependencies
bun run repo-cli tsconfig-sync

# CI validation mode (no modifications)
bun run repo-cli tsconfig-sync --check

# Sync specific package only
bun run repo-cli tsconfig-sync --filter @beep/schema
```

### Codebase Verification

```bash
# Run all verification checks
bun run repo-cli verify all

# Check specific package with CI exit codes
bun run repo-cli verify all --filter @beep/iam-* --ci

# Show only critical violations
bun run repo-cli verify patterns --severity critical
```

### Documentation Generation

```bash
# Initialize docgen for package
bun run repo-cli docgen init -p packages/common/schema

# Generate docs with parallel workers
bun run repo-cli docgen generate --parallel 8
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Effect-based commands | Consistent error handling and dependency injection |
| BunRuntime execution | Fast startup and native Bun integration |
| Tagged errors | Meaningful error context for debugging |
| Dry-run modes | Safe preview of changes before execution |
| CI-friendly output | Non-zero exit codes and machine-readable formats |

## Dependencies

**Internal**: `@beep/tooling-utils`, `@beep/schema`, `@beep/identity`

**External**: `@effect/cli`, `@effect/ai-anthropic`, `@effect/platform`, `@effect/platform-bun`, `ts-morph`, `handlebars`, `picocolors`, `glob`

## Related

- **AGENTS.md** - Detailed contributor guidance and command authoring patterns
- **Root package.json** - Exposes CLI via `bun run repo-cli <command>`
