# Git Subtree Workflow

## Overview

The Effect repository is integrated as a git subtree at `.repos/effect/` to provide AI agents with direct access to Effect source code for pattern discovery and implementation reference.

**Location**: `.repos/effect/`

**Purpose**: Reference source for AI agents to discover Effect patterns, internals, and best practices.

**Contents**: Complete Effect monorepo with all packages (`effect`, `platform`, `schema`, `ai`, etc.)

## Key Packages

| Package | Path | Purpose |
|---------|------|---------|
| `effect` | `.repos/effect/packages/effect/` | Core Effect library (Effect, Layer, Context, etc.) |
| `@effect/platform` | `.repos/effect/packages/platform/` | Cross-platform abstractions (FileSystem, Http, etc.) |
| `@effect/platform-bun` | `.repos/effect/packages/platform-bun/` | Bun-specific platform implementations |
| `@effect/platform-node` | `.repos/effect/packages/platform-node/` | Node-specific platform implementations |
| `@effect/schema` | `.repos/effect/packages/schema/` | Schema validation and transformation |
| `@effect/ai` | `.repos/effect/packages/ai/` | AI/LLM integrations |
| `@effect/sql` | `.repos/effect/packages/sql/` | SQL abstractions |
| `@effect/sql-pg` | `.repos/effect/packages/sql-pg/` | PostgreSQL driver |
| `@effect/sql-drizzle` | `.repos/effect/packages/sql-drizzle/` | Drizzle ORM integration |
| `@effect/rpc` | `.repos/effect/packages/rpc/` | RPC layer |
| `@effect/cli` | `.repos/effect/packages/cli/` | CLI framework |
| `@effect/opentelemetry` | `.repos/effect/packages/opentelemetry/` | OpenTelemetry integration |

## Usage for Agents

### Search for Effect Patterns

```bash
# Search for specific Effect patterns
grep -r "Effect.gen" .repos/effect/packages/effect/src/

# Find Layer composition examples
grep -r "Layer.provide" .repos/effect/packages/platform/src/

# Search for Service implementations
grep -r "Context.Tag" .repos/effect/packages/platform/src/
```

### Browse Module Structure

```bash
# List core Effect modules
ls .repos/effect/packages/effect/src/

# List platform abstractions
ls .repos/effect/packages/platform/src/

# List platform-bun implementations
ls .repos/effect/packages/platform-bun/src/
```

### Read Implementation Details

```bash
# Read Effect module implementation
cat .repos/effect/packages/effect/src/Effect.ts | head -100

# Read FileSystem service interface
cat .repos/effect/packages/platform/src/FileSystem.ts

# Read Bun FileSystem implementation
cat .repos/effect/packages/platform-bun/src/BunFileSystem.ts
```

### Find Test Examples

```bash
# Find test patterns
find .repos/effect/packages/effect/test -name "*.test.ts"

# Read test implementation
cat .repos/effect/packages/effect/test/Effect.test.ts | head -50
```

## Update Workflow

The Effect subtree is updated manually when upgrading to a newer Effect version.

### Add Remote (One-time Setup)

```bash
# Add Effect upstream remote (if not already added)
git remote add effect-upstream https://github.com/Effect-TS/effect.git
```

### Update Subtree

```bash
# Fetch latest Effect changes
git fetch effect-upstream main

# Update Effect subtree (uses --squash to avoid history bloat)
git subtree pull --prefix=.repos/effect effect-upstream main --squash

# Commit the update
git add .repos/effect
git commit -m "chore(subtree): update Effect to latest main"
```

### Verify Update

```bash
# Check Effect version in subtree
cat .repos/effect/packages/effect/package.json | grep version

# Verify directory structure
ls .repos/effect/packages/
```

## Maintenance Notes

### History Management

- **ALWAYS use `--squash`** when pulling subtree updates to avoid importing entire Effect git history
- Subtree updates create a single merge commit instead of thousands of commits

### Tooling Configuration

The following tools are configured to exclude `.repos/`:

- **Knip**: `.repos/` excluded from dependency analysis
- **Biome**: `.repos/` excluded from linting
- **TypeScript**: `.repos/` excluded from compilation
- **Git**: `.repos/effect/.git/` excluded via `.gitignore` patterns

### Update Strategy

- Updates are **manual**, not automatic
- Update when upgrading `effect` dependency version in `package.json`
- Update when needing newer Effect patterns or implementations
- Test project after subtree updates to ensure compatibility

### Cleanup

If the subtree becomes stale or corrupted:

```bash
# Remove subtree
rm -rf .repos/effect

# Re-add fresh subtree
git subtree add --prefix=.repos/effect effect-upstream main --squash
```

## Common Agent Queries

### "Show me how Effect implements X"

```bash
# Search Effect source for implementation
grep -r "functionName" .repos/effect/packages/effect/src/
```

### "Find examples of Layer composition"

```bash
# Search platform packages for Layer.provide usage
grep -r "Layer.provide" .repos/effect/packages/platform*/src/
```

### "How does Effect handle errors?"

```bash
# Read error handling modules
cat .repos/effect/packages/effect/src/Cause.ts
cat .repos/effect/packages/effect/src/Exit.ts
```

### "Show FileSystem implementation in Bun"

```bash
# Read Bun FileSystem implementation
cat .repos/effect/packages/platform-bun/src/BunFileSystem.ts
```

## References

- **Effect Repository**: https://github.com/Effect-TS/effect
- **Git Subtree Documentation**: https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging#_subtree_merge
- **Effect Documentation**: https://effect.website/
