# CLAUDE.md

Configuration and guardrails for AI collaborators working in the `beep-effect` monorepo.

## Quick Reference

| Category     | Command                                                          |
|--------------|------------------------------------------------------------------|
| **Install**  | `bun install`                                                    |
| **Dev**      | `bun run dev`                                                    |
| **Build**    | `bun run build`                                                  |
| **Check**    | `bun run check`                                                  |
| **Lint**     | `bun run lint` / `bun run lint:fix`                              |
| **Test**     | `bun run test`                                                   |
| **DB**       | `bun run db:generate` / `bun run db:migrate` / `bun run db:push` |
| **Services** | `bun run services:up`                                            |
| **Sync**     | `bun run repo-cli tsconfig-sync`                                 |

## Project Overview

`beep-effect` is a Bun-managed monorepo delivering a full-stack Effect application with Next.js 16 frontend, Effect Platform backend, and vertical slices in `packages/{iam,documents,calendar,knowledge,comms,customization}/*`. See [documentation/PACKAGE_STRUCTURE.md](documentation/PACKAGE_STRUCTURE.md) for full package layout.

## Technology Stack

| Category      | Technologies                                                  |
|---------------|---------------------------------------------------------------|
| **Runtime**   | Bun 1.3.x, Node 22                                            |
| **Core**      | Effect 3, `@effect/platform`, dependency injection via Layers |
| **Frontend**  | Next.js 16 App Router, React 19, TanStack Query               |
| **Backend**   | `@effect/platform-bun`, `@effect/rpc`, `@effect/sql-pg`       |
| **Database**  | PostgreSQL, Drizzle ORM                                       |
| **Auth**      | better-auth with Redis persistence                            |
| **Telemetry** | `@effect/opentelemetry`, Grafana OTLP                         |
| **Storage**   | AWS S3                                                        |
| **Linting**   | Biome                                                         |

## Architecture & Boundaries

Each slice follows `domain -> tables -> server -> client -> ui`. Cross-slice imports only through `packages/shared/*` or `packages/common/*`. ALWAYS use `@beep/*` path aliases. NEVER use direct cross-slice imports or relative `../../../` paths.

## Detailed Rules

For comprehensive guidelines, see:

| Rule File | Purpose |
|-----------|---------|
| [Behavioral Rules](.claude/rules/behavioral.md) | Critical thinking, workflow standards |
| [General Project Rules](.claude/rules/general.md) | Code quality, boundaries, commands |
| [Effect Patterns](.claude/rules/effect-patterns.md) | Effect conventions, testing, EntityIds |
| [Meta-Thinking Patterns](.claude/rules/meta-thinking.md) | Effect algebra, uncertainty handling |
| [Code Standards](.claude/rules/code-standards.md) | Style, patterns, documentation |

## Specifications

Agent-assisted, self-improving specification workflow for complex, multi-phase tasks.

| Action            | Location                                                                                          |
|-------------------|---------------------------------------------------------------------------------------------------|
| Create new spec   | `specs/[name]/` following [Spec Guide](specs/_guide/README.md)                                    |
| Pattern reference | [PATTERN_REGISTRY](specs/_guide/PATTERN_REGISTRY.md)                                              |
| View all specs    | [specs/README.md](specs/README.md)                                                                |
| Agent specs       | [specs/agents/](specs/agents/README.md)                                                           |

### Agent Registry

See [`.claude/agents-manifest.yaml`](.claude/agents-manifest.yaml) for complete agent capability matrix.

| Tier | Purpose | Example Agents |
|------|---------|----------------|
| 1: Foundation | Exploration, reflection | `codebase-researcher`, `reflector` |
| 2: Research | Documentation, patterns | `mcp-researcher`, `effect-expert` |
| 3: Quality | Review, validation | `code-reviewer`, `architecture-pattern-enforcer` |
| 4: Writers | Docs, tests, code | `doc-writer`, `test-writer`, `doc-maintainer` |

## IDE Compatibility

This project supports both **Claude Code** and **Cursor IDE** with shared rule configuration.

### Claude Code Configuration

Rules are defined in `.claude/rules/` and automatically loaded by Claude Code.

### Cursor IDE Configuration

Rules are automatically synced from `.claude/rules/` to `.cursor/rules/` in MDC format.

**Setup**:
1. Run the sync command: `bun run repo-cli sync-cursor-rules`
2. Open the project in Cursor IDE
3. Rules will be automatically loaded from `.cursor/rules/*.mdc`

**Maintenance**: Re-run the sync command whenever `.claude/rules/` files are updated.

### Windsurf IDE Configuration

Windsurf uses symlinks to `.claude/rules/` and `.claude/skills/`.

## Key References

| Document                       | Purpose                          |
|--------------------------------|----------------------------------|
| `README.md`                    | Onboarding & summary             |
| `docs/`                        | Generated API docs (via docgen)  |
| `documentation/`               | Internal contributor docs        |
| `documentation/patterns/`      | Implementation recipes           |
| `specs/`                       | Specification library            |
| `turbo.json`                   | Pipeline graph                   |
| `tsconfig.base.jsonc`          | Path aliases                     |
