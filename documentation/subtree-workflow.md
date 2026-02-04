# Git Subtree Workflow

## Overview

Reference repositories are integrated as git subtrees in `.repos/` to provide AI agents with direct access to source code for pattern discovery and implementation reference.

## Repositories

| Repository | Location | Remote | Purpose |
|------------|----------|--------|---------|
| Effect | `.repos/effect/` | `git@github.com:Effect-TS/effect.git` | Core Effect library, platform, schema, AI packages |
| effect-ontology | `.repos/effect-ontology/` | `git@github.com:mepuka/effect-ontology.git` | Effect-based ontology/knowledge graph patterns |
| better-auth | `.repos/better-auth/` | `git@github.com:better-auth/better-auth.git` | Authentication framework reference |
| drizzle-orm | `.repos/drizzle-orm/` | `git@github.com:drizzle-team/drizzle-orm.git` | ORM patterns and SQL generation |
| effect-claude-agent-sdk | `.repos/effect-claude-agent-sdk/` | `git@github.com:mepuka/effect-claude-agent-sdk.git` | Effect-based Claude agent SDK |

## Adding a New Subtree

```bash
# Add a new repository as a subtree
git subtree add --prefix=.repos/<name> <git-url> <branch> --squash

# Example:
git subtree add --prefix=.repos/example git@github.com:org/example.git main --squash
```

**ALWAYS use `--squash`** to avoid importing the entire git history of the upstream repo.

---

## Effect Repository

### Key Packages

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

---

## better-auth Repository

Reference for authentication patterns and Better Auth integration.

### Key Paths

| Path | Purpose |
|------|---------|
| `.repos/better-auth/packages/better-auth/` | Core authentication library |
| `.repos/better-auth/docs/` | Documentation and guides |

### Agent Usage

```bash
# Search for authentication patterns
grep -r "signIn" .repos/better-auth/packages/better-auth/src/

# Find session handling
grep -r "session" .repos/better-auth/packages/better-auth/src/
```

---

## drizzle-orm Repository

Reference for Drizzle ORM patterns and SQL generation.

### Key Paths

| Path | Purpose |
|------|---------|
| `.repos/drizzle-orm/drizzle-orm/` | Core ORM implementation |
| `.repos/drizzle-orm/drizzle-kit/` | Migration toolkit |

### Agent Usage

```bash
# Search for schema patterns
grep -r "pgTable" .repos/drizzle-orm/drizzle-orm/src/

# Find migration patterns
grep -r "migrate" .repos/drizzle-orm/drizzle-kit/src/
```

---

## effect-ontology Repository

Effect-based ontology and knowledge graph patterns.

### Agent Usage

```bash
# Explore ontology patterns
ls .repos/effect-ontology/src/

# Find RDF/graph patterns
grep -r "Triple" .repos/effect-ontology/src/
```

---

## effect-claude-agent-sdk Repository

Effect-based Claude agent SDK for building AI agents.

### Agent Usage

```bash
# Explore agent patterns
ls .repos/effect-claude-agent-sdk/src/

# Find tool definitions
grep -r "Tool" .repos/effect-claude-agent-sdk/src/
```

---

## Update Workflow

Subtrees are updated manually when upgrading dependency versions or needing newer patterns.

### Add Remotes (One-time Setup)

```bash
# Add remotes for each subtree
git remote add effect-upstream https://github.com/Effect-TS/effect.git
git remote add better-auth-upstream git@github.com:better-auth/better-auth.git
git remote add drizzle-upstream git@github.com:drizzle-team/drizzle-orm.git
git remote add ontology-upstream git@github.com:mepuka/effect-ontology.git
git remote add agent-sdk-upstream git@github.com:mepuka/effect-claude-agent-sdk.git
```

### Update a Subtree

```bash
# Generic update pattern
git fetch <remote-name> <branch>
git subtree pull --prefix=.repos/<name> <remote-name> <branch> --squash

# Example: Update Effect
git fetch effect-upstream main
git subtree pull --prefix=.repos/effect effect-upstream main --squash

# Example: Update better-auth
git fetch better-auth-upstream main
git subtree pull --prefix=.repos/better-auth better-auth-upstream main --squash
```

### Verify Update

```bash
# Check version in subtree (varies by repo)
cat .repos/<name>/package.json | grep version

# Verify directory structure
ls .repos/<name>/
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

If a subtree becomes stale or corrupted:

```bash
# Remove subtree
rm -rf .repos/<name>

# Re-add fresh subtree
git subtree add --prefix=.repos/<name> <remote-name> <branch> --squash

# Example: Re-add Effect
rm -rf .repos/effect
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

### Upstream Repositories

- **Effect**: https://github.com/Effect-TS/effect
- **better-auth**: https://github.com/better-auth/better-auth
- **drizzle-orm**: https://github.com/drizzle-team/drizzle-orm
- **effect-ontology**: https://github.com/mepuka/effect-ontology
- **effect-claude-agent-sdk**: https://github.com/mepuka/effect-claude-agent-sdk

### Documentation

- **Effect Documentation**: https://effect.website/
- **better-auth Documentation**: https://www.better-auth.com/
- **Drizzle Documentation**: https://orm.drizzle.team/
- **Git Subtree Documentation**: https://git-scm.com/book/en/v2/Git-Tools-Advanced-Merging#_subtree_merge
