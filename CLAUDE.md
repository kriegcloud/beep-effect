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

Each slice follows `domain -> tables -> infra -> client -> ui`. Cross-slice imports only through `packages/shared/*` or `packages/common/*`. ALWAYS use `@beep/*` path aliases. NEVER use direct cross-slice imports or relative `../../../` paths.

## Effect Patterns

See [documentation/EFFECT_PATTERNS.md](documentation/EFFECT_PATTERNS.md) for detailed Effect patterns, import conventions, and critical rules.

## Code Quality

- NEVER use `any`, `@ts-ignore`, or unchecked casts. ALWAYS validate external data with `@beep/schema`.
- Biome formatting: run `bun run lint:fix` before committing.
- Use `Effect.log*` with structured objects for logging.

## Testing

ALWAYS use `@beep/testkit` for Effect-based tests. NEVER use raw `bun:test` with manual `Effect.runPromise`.

### Quick Reference

```typescript
// REQUIRED - @beep/testkit
import { effect, layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";

// Unit test
effect("test name", () =>
  Effect.gen(function* () {
    const result = yield* someEffect();
    strictEqual(result, expected);
  })
);

// Integration test with shared Layer
layer(TestLayer, { timeout: Duration.seconds(60) })("suite name", (it) => {
  it.effect("test name", () =>
    Effect.gen(function* () {
      const repo = yield* MemberRepo;
      const result = yield* repo.findAll();
      strictEqual(result.length, 0);
    })
  );
});
```

### Test Commands

- `bun run test` — Run all tests
- `bun run test --filter=@beep/package` — Run tests for specific package

### Test Organization

- Place test files in `./test` directory mirroring `./src` structure
- NEVER place tests inline with source files
- Use path aliases (`@beep/*`) instead of relative imports in tests

See `.claude/rules/effect-patterns.md` Testing section and `.claude/commands/patterns/effect-testing-patterns.md` for comprehensive patterns.

## Workflow for AI Agents

1. **Clarify Intent**: ALWAYS ask before editing if the request could be interpreted multiple ways
2. **Incremental Changes**: Prefer small, focused diffs
3. **Verify Changes**: Request `bun run check` after modifications
4. **Respect Tooling**: ALWAYS run commands via `bun run <script>` from project root
5. **Keep Docs Updated**: Align with `documentation/patterns/` when introducing new patterns
6. **Do Not Auto-Start**: NEVER launch long-running dev or infra commands without confirmation

## Specifications

Agent-assisted, self-improving specification workflow for complex, multi-phase tasks.

| Action            | Location                                                                                          |
|-------------------|---------------------------------------------------------------------------------------------------|
| Create new spec   | `specs/[name]/` following [Spec Guide](specs/_guide/README.md)                                    |
| Pattern reference | [PATTERN_REGISTRY](specs/_guide/PATTERN_REGISTRY.md)                                              |
| View all specs    | [specs/README.md](specs/README.md)                                                                |
| Agent specs       | [specs/agents/](specs/agents/README.md)                                                           |

### Specialized Agents

9 purpose-built agents assist spec creation:

| Tier | Agents | Purpose |
|------|--------|---------|
| Foundation | `reflector`, `codebase-researcher` | Meta-learning, code exploration |
| Research | `mcp-researcher`, `web-researcher` | Effect docs, external research |
| Quality | `code-reviewer`, `architecture-pattern-enforcer` | Guidelines, structure |
| Writers | `doc-writer`, `test-writer`, `code-observability-writer` | Docs, tests, observability |

### Key Patterns

- **Agent-phase mapping**: Match agents to Discovery → Evaluation → Synthesis → Iteration
- **Self-reflection**: Capture learnings in `REFLECTION_LOG.md` after each phase
- **Multi-session handoffs**: Use `HANDOFF_P[N].md` to preserve context between sessions
- **Skills vs Specs**: `.claude/skills/` for single-session, `specs/` for multi-session orchestration

## IDE Compatibility

This project supports both **Claude Code** and **Cursor IDE** with shared rule configuration.

### Claude Code Configuration

Rules are defined in `.claude/rules/` and automatically loaded by Claude Code.

### Cursor IDE Configuration

Rules are automatically synced from `.claude/rules/` to `.cursor/rules/` in MDC format.

**Setup**:
1. Run the sync script: `bun run scripts/sync-cursor-rules.ts`
2. Open the project in Cursor IDE
3. Rules will be automatically loaded from `.cursor/rules/*.mdc`

**Note**: The sync script transforms `.md` files to `.mdc` format with required frontmatter:
- Adds `description:` field (required by Cursor)
- Adds `alwaysApply:` field (controls activation mode)
- Transforms `paths:` → `globs:` (field rename for scoped rules)

**Maintenance**: Re-run the sync script whenever `.claude/rules/` files are updated.

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
