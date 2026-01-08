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

`beep-effect` is a Bun-managed monorepo delivering a full-stack Effect application with Next.js 15 frontend, Effect Platform backend, and vertical slices in `packages/iam/*` and `packages/documents/*`. See [documentation/PACKAGE_STRUCTURE.md](documentation/PACKAGE_STRUCTURE.md) for full package layout.

## Technology Stack

| Category      | Technologies                                                  |
|---------------|---------------------------------------------------------------|
| **Runtime**   | Bun 1.3.x, Node 22                                            |
| **Core**      | Effect 3, `@effect/platform`, dependency injection via Layers |
| **Frontend**  | Next.js 15 App Router, React 19, TanStack Query               |
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
- Effect testing utilities in `@beep/testkit`. Use `Effect.log*` with structured objects.

## Testing

- `bun run test` — Run all tests
- `bun run test --filter=@beep/package` — Run tests for specific package
- Place test files adjacent to source files or in `__tests__/` directories

## Workflow for AI Agents

1. **Clarify Intent**: ALWAYS ask before editing if the request could be interpreted multiple ways
2. **Incremental Changes**: Prefer small, focused diffs
3. **Verify Changes**: Request `bun run check` after modifications
4. **Respect Tooling**: ALWAYS run commands via `bun run <script>` from project root
5. **Keep Docs Updated**: Align with `documentation/patterns/` when introducing new patterns
6. **Do Not Auto-Start**: NEVER launch long-running dev or infra commands without confirmation

## Specifications

Self-improving specification workflow for complex, multi-phase tasks.

| Action            | Location                                                                                              |
|-------------------|-------------------------------------------------------------------------------------------------------|
| Create new spec   | `specs/[name]/` following [META_SPEC_TEMPLATE](specs/ai-friendliness-audit/META_SPEC_TEMPLATE.md)     |
| Standardize specs | [SPEC_STANDARDIZATION_PROMPT](specs/SPEC_STANDARDIZATION_PROMPT.md)                                   |
| View all specs    | `specs/README.md`                                                                                     |

Key patterns:
- **Phase-based workflow**: Discovery → Evaluation → Synthesis → Iterative Execution
- **Self-reflection**: Capture learnings in `REFLECTION_LOG.md` after each phase
- **Multi-session handoffs**: Use `HANDOFF_P[N].md` to preserve context between sessions
- **Skills vs Specs**: `.claude/skills/` for single-session, `specs/` for multi-session orchestration

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
