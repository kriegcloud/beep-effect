# .cursor Configuration

Cursor IDE configuration for the beep-effect monorepo. This directory provides rules, skills, and discoverability so Cursor sessions match the capabilities of `.claude/` and `.codex/`.

## Why .cursor Looks Different from .claude

`.claude/` has **agents/**, **commands/**, **hooks/**, **prompts/** and similar surfaces. Cursor does not expose equivalent first-class features:

| .claude (or .codex) | Cursor equivalent | Where it lives |
|---------------------|-------------------|----------------|
| **Commands** (e.g. `/new-spec`, `/done-feature`) | No slash commands | **Skills** + this README; trigger by prompt or @-mention (e.g. @Spec Lifecycle) |
| **Agents** (registry, delegation) | No agent model | **AGENTS.md** entry points; agent intents mapped to skills and rules |
| **Hooks** (agent-init, telemetry, self-healing) | No documented hook/lifecycle API | **Deferred** in parity; see `specs/pending/cursor-claude-parity/outputs/parity-decision-log.md` |
| **Prompts** (e.g. repo-consistency-audit) | No dedicated prompts dir | Content folded into skills or docs; invoke via natural language |

So parity is achieved by **adaptation**: same intents (spec lifecycle, done-feature, debug/explore/write-test) are triggered via Cursor’s rules + skills + README index, not by replicating .claude’s folder structure. Full rationale: `specs/pending/cursor-claude-parity/outputs/P1_GAP_ANALYSIS.md` and `parity-decision-log.md`.

## Entry Points

| Resource | Purpose |
|----------|---------|
| [AGENTS.md](../AGENTS.md) | Project overview, commands, architecture, skills index |
| [CLAUDE.md](../CLAUDE.md) | Cross-tool quick reference and rules |
| [specs/](../specs/) | Specification library and phase handoffs |
| [documentation/](../documentation/) | Internal contributor docs and patterns |

## Rules

Rules are synced from `.claude/rules/` and must not be edited here.

- **Sync command:** `bun run repo-cli sync-cursor-rules`
- **Source:** `.claude/rules/` → **Target:** `.cursor/rules/*.mdc`
- Re-run after any change to `.claude/rules/`.

## Skills

Skills live in `.cursor/skills/<name>/SKILL.md`. Use them by @-mentioning the skill or describing the task; Cursor has no `/command` prefix.

### Required (parity with .claude)

| Skill | When to Use |
|-------|-------------|
| domain-modeling | Entities, value objects, ADTs with Schema.TaggedStruct + Schema.Data |
| layer-design | Effect layers, dependency composition |
| schema-composition | Schema.compose/pipe, transformations, validation |
| error-handling | TaggedError, catchTag, recovery |
| pattern-matching | $match, Match.typeTags, Effect.match |
| service-implementation | Effect services, capability-based design |
| spec-driven-development | Full spec workflow (instructions → plan) |
| effect-concurrency-testing | Testing PubSub, Deferred, Latch, Stream |
| onboarding | First contribution, environment and patterns |

### Workflow (command adaptation)

| Skill | Replaces | Trigger by |
|-------|----------|------------|
| Spec Lifecycle | /new-spec, handoff | "Create a new spec for …" or "Execute Phase N per HANDOFF_PN" |
| Done Feature | /done-feature | "Feature is done, run completion workflow" |
| Task Execution | /debug, /explore, /write-test | "Debug …", "Explore …", "Write tests for …" |

### Other

| Skill | When to Use |
|-------|-------------|
| Better Auth Best Practices | better-auth integration |
| Create Auth Skill | New auth service setup |

## Command/Workflow Index

Cursor does not support slash commands. Use prompts or @-mentions:

| Intent | How to invoke |
|--------|----------------|
| New spec | "Create a new spec for [name] following the spec guide" or @Spec Lifecycle |
| Phase handoff | "Execute Phase N of specs/pending/[spec]; read handoffs/HANDOFF_PN.md and P[N]_ORCHESTRATOR_PROMPT.md" |
| Feature complete | "Run done-feature workflow" or @Done Feature |
| Debug bug | "Debug: [description]" or @Task Execution (Debug) |
| Explore codebase | "Explore: [question]" or @Task Execution (Explore) |
| Write tests | "Write tests for [module]" or @Task Execution (Write Test) |

## Safety and Permissions

Critical denies and safety expectations are encoded in project rules (e.g. no `any`, no direct cross-slice imports). Cursor-specific permission or sandbox settings (if any) should align with `.codex/safety/permissions.md` where applicable; document any Cursor-specific overrides here if they are introduced.

## Spec Parity

This configuration is maintained as part of `specs/pending/cursor-claude-parity`. For gap analysis, decision log, and validation reports see `specs/pending/cursor-claude-parity/outputs/`.
