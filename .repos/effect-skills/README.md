# ⚡ Effect-TS Plugin for Pi

Comprehensive [Effect](https://effect.website) v4 skills and smart context injection for [pi](https://github.com/badlogic/pi-mono). Detects Effect projects, injects relevant patterns when you're reading Effect code, and provides scaffold tools and slash commands.

## Install

```bash
# Pi (extension + skills)
pi install https://github.com/joelhooks/effectts-skills

# Claude Code (plugin + skills)
npx plugins add joelhooks/effectts-skills

# Just the skills (any agent)
npx skills add joelhooks/effectts-skills
```

## What It Does

### Smart Context Injection

The extension detects when you're working in an Effect project (scans `package.json` for `effect` dependency) and automatically:

- Shows "Effect v4" in the status bar
- Detects Effect patterns in files you read (services, schemas, errors, testing, HTTP, CLI, etc.)
- Appends hints about which reference docs are relevant

### Commands

| Command | Description |
|---------|-------------|
| `/effect:docs <topic>` | Load a specific reference doc into context |
| `/effect:service <Name>` | Generate a service scaffold with layer and test layer |
| `/effect:test <Name>` | Generate a test scaffold with @effect/vitest |

**Available topics:** services, layers, data-modeling, schema, errors, testing, http, cli, config, processes, setup

### Tools (LLM-callable)

| Tool | Description |
|------|-------------|
| `effect_scaffold` | Generate Effect v4 boilerplate (service, schema, error, test) |
| `effect_docs` | Load Effect reference docs on a specific topic |

### Skills

The full `effect-ts` skill with progressive disclosure:

| Reference | Topics |
|-----------|--------|
| `SKILL.md` | Core patterns: ServiceMap.Service, Effect.fn/gen, Schema.Class, TaggedErrorClass, Layer composition |
| `services-and-layers.md` | Service-driven development, test layers, memoization, provide vs provideMerge |
| `data-modeling.md` | Schema.Class, branded types, variants, Match.valueTags, JSON encoding |
| `schema-decisions.md` | Class vs Struct vs TaggedClass decision flowchart, migration patterns |
| `error-handling.md` | TaggedErrorClass, yieldable errors, catch/catchTag/catchTags, TypeId/refail |
| `testing.md` | @effect/vitest, it.effect/live/layer, TestClock, FiberRef isolation, worked example |
| `http-clients.md` | effect/unstable/http, requests, responses, middleware, retries, typed API service |
| `cli.md` | effect/unstable/cli, Arguments, Flags, subcommands, task manager example |
| `config.md` | Config service pattern, schema validation, ConfigProvider, Redacted secrets |
| `processes.md` | Fork types, Scope.extend, Command for child processes, killable tasks |
| `setup.md` | tsconfig, Effect Language Service, module settings, dev workflow |

## Sources

Built from three excellent repos:

- **[kitlangton/effect-solutions](https://github.com/kitlangton/effect-solutions)** - Effect best practices by [Kit Langton](https://github.com/kitlangton). Primary source for v4 patterns. Also at [effect.solutions](https://effect.solutions).
- **[effect-ts/effect](https://github.com/effect-ts/effect)** - The canonical Effect monorepo.
- **[artimath/effect-skills](https://github.com/artimath/effect-skills)** (MIT) - Schema decision matrix, process/scope patterns, layer gotchas, TypeId/refail, FiberRef isolation.

## License

MIT
