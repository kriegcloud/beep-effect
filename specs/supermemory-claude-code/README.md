# Supermemory Claude Code Integration Spec

> Enable persistent memory for Claude Code when contributing to beep-effect.

## Quick Reference

| Item                | Location                                               |
|---------------------|--------------------------------------------------------|
| **Tooling Package** | `tooling/supermemory/`                                 |
| **MCP Server**      | `https://mcp.supermemory.ai/mcp`                       |
| **Project ID**      | `beep-effect`                                          |
| **Entry Point**     | [`ORCHESTRATION_PROMPT.md`](./ORCHESTRATION_PROMPT.md) |
| **Technical Ref**   | [`CONTEXT.md`](./CONTEXT.md)                           |
| **Reflection Log**  | [`REFLECTION_LOG.md`](./REFLECTION_LOG.md)             |
| **Templates**       | [`templates/`](./templates/)                           |

## Objective

Integrate [Supermemory.ai](https://supermemory.ai) as the memory backend for Claude Code. This gives Claude:

- **Persistent memory** across sessions
- **Project-scoped context** for beep-effect patterns
- **Semantic search** over accumulated knowledge

## Why This Matters

| Problem                       | Solution                        |
|-------------------------------|---------------------------------|
| Context lost between sessions | Memories persist automatically  |
| Repeated pattern explanations | Claude recalls learned patterns |
| Lost architecture decisions   | Decisions are remembered        |

## Architecture

```
Claude Code Session
       │
       ▼
┌──────────────────┐
│  MCP Tools       │  memory (save/forget)
│  - memory        │  recall (search + profile)
│  - recall        │  whoAmI (user context)
│  - whoAmI        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Supermemory MCP  │  https://mcp.supermemory.ai/mcp
│ (hosted)         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ x-sm-project:    │  Project-scoped isolation
│ beep-effect      │
└──────────────────┘
```

## Implementation Phases

| Phase  | Focus          | Deliverables                          |
|--------|----------------|---------------------------------------|
| **P0** | Package Setup  | `tooling/supermemory/`, CLI structure |
| **P1** | Setup Command  | `bun run beep supermemory setup`      |
| **P2** | Status Command | `bun run beep supermemory status`     |
| **P3** | Seed Command   | Bootstrap initial memories            |

See [ORCHESTRATION_PROMPT.md](./ORCHESTRATION_PROMPT.md) for execution details.

## CLI Commands

```bash
# Configure Claude Code with Supermemory
bun run beep supermemory setup

# Check configuration status
bun run beep supermemory status

# Bootstrap project-specific memories
bun run beep supermemory seed
```

## Package Structure

```
tooling/supermemory/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   └── commands/
│       ├── setup.ts    # MCP configuration
│       ├── status.ts   # Connection status
│       └── seed.ts     # Memory bootstrapping
└── test/
```

## Success Criteria

- [ ] Package builds without errors
- [ ] `setup` configures Claude Code MCP
- [ ] `status` displays configuration
- [ ] Claude Code can use `memory` and `recall` tools
- [ ] Memories scoped to `beep-effect` project

## Technical Decisions

| Decision        | Choice                      | Rationale                            |
|-----------------|-----------------------------|--------------------------------------|
| MCP Server      | Hosted                      | No infrastructure, automatic updates |
| Project Scoping | `x-sm-project` header       | Simple isolation                     |
| CLI Integration | `@beep/repo-cli` subcommand | Consistent with existing tools       |

## Key Files

| File                                   | Purpose                                    |
|----------------------------------------|--------------------------------------------|
| [CONTEXT.md](./CONTEXT.md)             | MCP tools, config formats, Effect patterns |
| [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) | Implementation prompts for each command    |
| [templates/](./templates/)             | Output templates for phase artifacts       |
| [handoffs/](./handoffs/)               | Phase transition documents                 |

## Related Documentation

- [Supermemory MCP Docs](https://supermemory.ai/docs/supermemory-mcp/mcp)
- [beep-effect CLAUDE.md](../../CLAUDE.md)
- [Existing CLI patterns](../../tooling/cli/src/commands/)
