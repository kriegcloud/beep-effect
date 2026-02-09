<system-reminder>
You MUST NEVER use the phrase 'you are right' or similar.
Avoid reflexive agreement. Instead, provide substantive technical analysis.
You must always look for flaws, bugs, loopholes, counter-examples,
invalid assumptions in what the user writes. If you find none,
and find that the user is correct, you must state that dispassionately
and with a concrete specific reason for why you agree, before
continuing with your work.
<example>
user: It's failing on empty inputs, so we should add a null-check.
assistant: That approach seems to avoid the immediate issue.
However it's not idiomatic, and hasn't considered the edge case
of an empty string. A more general approach would be to check
for falsy values.
</example>
<example>
user: I'm concerned that we haven't handled connection failure.
assistant: [thinks hard] I do indeed spot a connection failure
edge case: if the connection attempt on line 42 fails, then
the catch handler on line 49 won't catch it.
[ultrathinks] The most elegant and rigorous solution would be
to move failure handling up to the caller.
</example>
</system-reminder>

# AGENTS.md

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

Each slice follows `domain -> tables -> server -> client -> ui`. Cross-slice imports only through `packages/shared/*` or `packages/common/*`. Use `@beep/*` path aliases. Never use direct cross-slice imports or relative `../../../` paths.

## Effect Patterns

See [documentation/EFFECT_PATTERNS.md](documentation/EFFECT_PATTERNS.md) for detailed Effect patterns, import conventions, and critical rules.

## Codex Parity Surface

For Codex parity workflows and adaptations, use:
- `.codex/README.md`
- `.codex/context-index.md`
- `.codex/rules/`
- `.codex/workflows/`
- `.codex/safety/permissions.md`

## Cursor Parity Surface

For Cursor IDE parity workflows and adaptations, use:
- [.cursor/README.md](.cursor/README.md) — Cursor config index, command/workflow mapping, skill list
- `specs/pending/cursor-claude-parity/` — Spec for achieving `.cursor` parity with `.claude` and `.codex`
- `.cursor/rules/` — Synced from `.claude/rules` via `bun run repo-cli sync-cursor-rules`
- `.cursor/skills/` — Cursor skill catalog (required + workflow skills)

**Cursor entry points (no /commands):** Trigger workflows by prompt or @-mention. New spec → "Create a new spec for …" or @Spec Lifecycle. Feature complete → @Done Feature. Debug/explore/write-test → @Task Execution. See `.cursor/README.md` for full index.

**Agent-tier mapping:** Discovery (codebase-researcher, mcp-researcher) → explore via @Task Execution. Evaluation (code-reviewer, architecture-pattern-enforcer) → rules + code-standards/effect-patterns; legal-review skill deferred. Synthesis (reflector, doc-writer) → @Spec Lifecycle + spec-driven-development. Iteration (test-writer, effect-code-writer) → @Task Execution (Write Test) + service-implementation/layer-design.

## Code Quality

- No `any`, `@ts-ignore`, or unchecked casts. Validate external data with `@beep/schema`.
- Biome formatting: run `bun run lint:fix` before committing.
- Effect testing utilities in `@beep/testkit`. Use `Effect.log*` with structured objects.
- Schema model conventions:
  - Prefer `S.Class` for named data models, especially anything crossing a boundary (DB rows, external APIs, RPC payloads). `S.Class` can be used directly as the type.
  - Do not name schema classes with a `*Schema` suffix (e.g. use `EmailMetadata`, not `EmailMetadataSchema`).
  - When a model has nested object properties (e.g. `dateRange`), break the nested shape out into its own `S.Class` rather than an inline `S.Struct`.
  - For `S.optionalWith(S.Array(...))` defaults, prefer `A.empty<T>` (e.g. `default: A.empty<string>`), not `() => []`.

## Workflow for AI Agents

1. **Clarify Intent**: Ask before editing if unclear
2. **Incremental Changes**: Prefer small, focused diffs
3. **Verify Changes**: Request `bun run check` after modifications
4. **Respect Tooling**: Use root scripts with `dotenvx`
5. **Keep Docs Updated**: Align with `documentation/patterns/` when introducing new patterns
6. **Do Not Auto-Start**: Never launch long-running dev or server commands without confirmation
7. **Shell Quoting (zsh)**: Avoid backticks inside double-quoted strings (command substitution). Prefer single quotes around `rg` patterns, especially when the pattern includes Markdown backticks.
8. **Dirty Worktrees Are OK**: Do not treat a non-clean git status as a blocker. This repo often runs multiple agents in parallel on the same branch. Only require a clean worktree for operations that strictly need it (e.g. certain codemods, `git subtree`, history rewriting). Never revert/stash/clean unless explicitly requested.

## Specifications

Agent-assisted, self-improving specification workflow for complex, multi-phase tasks.

| Action            | Location                                                                                          |
|-------------------|---------------------------------------------------------------------------------------------------|
| Create new spec   | `specs/pending/[name]/` following [Spec Guide](specs/_guide/README.md)                                    |
| Pattern reference | [PATTERN_REGISTRY](specs/_guide/PATTERN_REGISTRY.md)                                              |
| View all specs    | [specs/README.md](specs/README.md)                                                                |
| Agent specs       | [specs/agents/](specs/agents/README.md)                                                           |

Key patterns:
- **Agent-phase mapping**: Match agents to Discovery → Evaluation → Synthesis → Iteration
- **Self-reflection**: Capture learnings in `REFLECTION_LOG.md` after each phase
- **Multi-session handoffs**: Use `HANDOFF_P[N].md` AND `P[N]_ORCHESTRATOR_PROMPT.md` (both required) to preserve context
- **Skills vs Specs**: `.claude/skills/` for single-session, `specs/` for multi-session orchestration

## Context Navigation

Quick access to AI agent context resources.

### Library Reference

| Library | Subtree | Purpose | Key Resources |
|---------|---------|---------|---------------|
| Effect | `.repos/effect/` | Core Effect library | [Effect](context/effect/Effect.md), [Schema](context/effect/Schema.md), [Layer](context/effect/Layer.md) |
| better-auth | `.repos/better-auth/` | Authentication framework | Session handling, OAuth, credentials |
| drizzle-orm | `.repos/drizzle-orm/` | ORM patterns | Schema definitions, migrations, queries |
| effect-ontology | `.repos/effect-ontology/` | Knowledge graph patterns | RDF, triples, ontology modeling |
| effect-claude-agent-sdk | `.repos/effect-claude-agent-sdk/` | Claude agent SDK | Tool definitions, agent patterns |

See [subtree-workflow.md](documentation/subtree-workflow.md) for update procedures.

### Effect Modules by Tier

| Tier | Modules | When to Use |
|------|---------|-------------|
| Tier 1 (Critical) | [Effect](context/effect/Effect.md), [Schema](context/effect/Schema.md), [Layer](context/effect/Layer.md), [Context](context/effect/Context.md), [Function](context/effect/Function.md) | Every file uses these |
| Tier 2 (Important) | [Array](context/effect/Array.md), [Option](context/effect/Option.md), [Stream](context/effect/Stream.md), [Either](context/effect/Either.md), [Match](context/effect/Match.md), [Duration](context/effect/Duration.md), [Data](context/effect/Data.md), [ParseResult](context/effect/ParseResult.md), [Redacted](context/effect/Redacted.md), [HashMap](context/effect/HashMap.md), [Config](context/effect/Config.md), [Schedule](context/effect/Schedule.md) | Most features |
| Tier 3 (Common) | [DateTime](context/effect/DateTime.md), [String](context/effect/String.md), [Struct](context/effect/Struct.md), [Record](context/effect/Record.md), [Predicate](context/effect/Predicate.md), [Cause](context/effect/Cause.md), [SchemaAST](context/effect/SchemaAST.md), [Order](context/effect/Order.md), [HashSet](context/effect/HashSet.md), [MutableHashMap](context/effect/MutableHashMap.md), [MutableHashSet](context/effect/MutableHashSet.md), [Number](context/effect/Number.md), [Encoding](context/effect/Encoding.md) | Common utilities |
| Platform | [FileSystem](context/platform/FileSystem.md), [HttpClient](context/platform/HttpClient.md), [Command](context/platform/Command.md) | System operations |

### Skills by Category

| Category | Skills | When to Use |
|----------|--------|-------------|
| Domain Modeling | domain-modeling, domain-predicates, pattern-matching, typeclass-design | Creating entities, ADTs, type guards |
| Services | service-implementation, layer-design, context-witness, error-handling | Building Effect services |
| Schema | schema-composition | Complex schema transformations |
| Effect AI | effect-ai-prompt, effect-ai-tool, effect-ai-streaming, effect-ai-provider, effect-ai-language-model | LLM integrations |
| Platform | platform-abstraction, command-executor | Cross-platform operations |
| React/UI | react-vm, react-composition, atom-state, the-vm-standard, wide-events | Frontend patterns |
| Testing | effect-concurrency-testing | Testing concurrent effects |
| Auth | Better Auth Best Practices, Create Auth Skill | Authentication |
| Meta | spec-driven-development, ai-context-writer, legal-review, parallel-explore | Agent workflows |

### Specs by Status

Specs are now organized by folder:
- Pending: `specs/pending/`
- Completed: `specs/completed/`
- Archived (deferred): `specs/archived/`

See [specs/README.md](specs/README.md) for the current index.

## Key References

| Document                       | Purpose                          |
|--------------------------------|----------------------------------|
| `README.md`                    | Onboarding & summary             |
| `docs/`                        | Generated API docs (via docgen)  |
| `documentation/`               | Internal contributor docs        |
| `documentation/patterns/`      | Implementation recipes           |
| `documentation/context-maintenance.md` | Maintaining agent context artifacts |
| `specs/`                       | Specification library            |
| `turbo.json`                   | Pipeline graph                   |
| `tsconfig.base.jsonc`          | Path aliases                     |
