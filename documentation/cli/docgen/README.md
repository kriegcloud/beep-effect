# Docgen Documentation

> Documentation generation system for the beep-effect monorepo.

## Overview

The docgen system provides tools for generating, analyzing, and maintaining JSDoc documentation across all packages in the monorepo. It integrates with `@effect/docgen` and includes AI-powered documentation assistance using Anthropic Claude.

## Documentation

| Document | Description |
|----------|-------------|
| [DOCGEN.md](DOCGEN.md) | Complete CLI command reference |
| [DOCGEN_QUICK_START.md](DOCGEN_QUICK_START.md) | Getting started tutorial |
| [DOCGEN_AGENTS.md](DOCGEN_AGENTS.md) | AI agent system documentation |
| [DOCGEN_CONFIGURATION.md](DOCGEN_CONFIGURATION.md) | Configuration file reference |
| [DOCGEN_TROUBLESHOOTING.md](DOCGEN_TROUBLESHOOTING.md) | Common issues and solutions |

## Quick Reference

### Commands

```bash
# Check documentation status
bun run docgen:status

# Initialize a package
bun run docgen:init -- -p packages/common/contract

# Analyze JSDoc coverage
bun run docgen:analyze -- -p packages/common/contract

# Generate documentation
bun run docgen:generate -- -p packages/common/contract

# Aggregate to docs folder
bun run docgen:aggregate

# AI-powered fixes (dry run)
bun run docgen:agents -- --dry-run

# AI-powered fixes (with API key)
AI_ANTHROPIC_API_KEY=sk-ant-... bun run docgen:agents -- -p packages/common/contract
```

### Common Workflows

**Document a new package:**
```bash
bun run docgen:init -- -p packages/common/my-package
bun run docgen:analyze -- -p packages/common/my-package
# Add documentation...
bun run docgen:generate -- -p packages/common/my-package --validate-examples
```

**Use AI to fix documentation:**
```bash
bun run docgen:agents -- --dry-run -p packages/common/my-package
AI_ANTHROPIC_API_KEY=sk-ant-... bun run docgen:agents -- -p packages/common/my-package
```

**Generate all documentation:**
```bash
bun run docgen:generate -- --parallel 8
bun run docgen:aggregate -- --clean
```

## Features

- **JSDoc Analysis**: Identify missing `@category`, `@example`, `@since` tags
- **AI-Powered Fixes**: Automatically generate documentation using Claude
- **Token Tracking**: Monitor API usage and estimate costs
- **Parallel Processing**: Process multiple packages concurrently
- **Durable Workflows**: Crash-resilient execution with resume capability
- **Path Mappings**: Automatic resolution of `@beep/*` imports in examples

## Required JSDoc Tags

Every public export must have:

| Tag | Purpose | Example |
|-----|---------|---------|
| `@category` | Group exports in docs | `@category Constructors` |
| `@example` | Show usage code | TypeScript code block |
| `@since` | Version tracking | `@since 0.1.0` |

## Source Code

The docgen system is implemented in:

```
tooling/cli/src/commands/docgen/
├── init.ts          # Initialize configuration
├── analyze.ts       # Analyze JSDoc coverage
├── generate.ts      # Run @effect/docgen
├── aggregate.ts     # Aggregate to docs folder
├── status.ts        # Show configuration status
├── agents/          # AI agent system
│   ├── index.ts     # CLI command
│   ├── service.ts   # Agent service
│   ├── workflow.ts  # Durable workflow
│   ├── tools.ts     # Agent tools
│   └── prompts.ts   # System prompts
├── shared/          # Shared utilities
│   ├── ast.ts       # TypeScript parsing
│   ├── config.ts    # Configuration loading
│   ├── discovery.ts # Package discovery
│   ├── markdown.ts  # Report generation
│   └── output.ts    # CLI formatting
├── types.ts         # Type definitions
└── errors.ts        # Error classes
```
