# Agent Config, Persona & E2E Foundation Slice

**Date**: 2026-02-25
**Scope**: AgentConfig service, system prompt integration, ModelRegistry, `agent init` CLI, E2E smoke test

## Context

The server has a working end-to-end chat flow but lacks:
- Agent persona / system prompt (LLM has no identity)
- Typed configuration (ad-hoc env vars via AiConfig)
- Multi-agent support (background workflow agents need their own model configs)
- E2E smoke tests that exercise the full stack

This slice builds the configuration foundation that unblocks TUI setup wizard, gateway deployment config, and keychain secret store in future slices.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Config source | Single `agent.yaml` with nested sections | Version-controllable, local-first, maps to Effect Config.nested() |
| Config validation | Effect Schema.Config() | Maximum type safety, reusable schemas |
| Secrets | Env vars only (PA_*_API_KEY) | Simple, never touches LLM context, Config.redacted() prevents logging |
| Multi-agent | Named agent profiles in YAML | Supports user-facing agent + background workflow agents |
| Model selection | ModelRegistry (lazy cache) | Dynamic per-turn model resolution, extensible |
| System prompt injection | At workflow level, on first turn | Persona persists with chat, different sessions can use different agents |
| E2E test strategy | Mock LLM, full stack | Fast, deterministic, no API key needed |
| Test runner | it.live (not it.effect) | TestClock freezes Effect.delay in SingleRunner polling loop |
| First-run UX | `agent init` generates starter config | Explicit, no magic auto-generation |
| Providers | anthropic, openai, openrouter, google | Extensible via provider catalog in YAML |

## Config File Shape

```yaml
# agent.yaml

providers:
  anthropic:
    apiKeyEnv: PA_ANTHROPIC_API_KEY
  openai:
    apiKeyEnv: PA_OPENAI_API_KEY
  openrouter:
    apiKeyEnv: PA_OPENROUTER_API_KEY
  google:
    apiKeyEnv: PA_GOOGLE_API_KEY

agents:
  default:
    persona:
      name: "My Assistant"
      systemPrompt: |
        You are a helpful personal assistant.
    model:
      provider: anthropic
      modelId: claude-sonnet-4-20250514
    generation:
      temperature: 0.7
      maxOutputTokens: 4096

  summarizer:
    persona:
      name: "Summarizer"
      systemPrompt: |
        You produce concise summaries. Output only the summary.
    model:
      provider: openai
      modelId: gpt-4o-mini
    generation:
      temperature: 0.2
      maxOutputTokens: 1024

server:
  port: 3000
```

## Architecture

### AgentConfig Service

Replaces current `AiConfig`. Defined as `ServiceMap.Service`.

```
AgentConfig
  providers: Map<string, { apiKeyEnv: string }>
  agents: Map<string, AgentProfile>
  server: { port: number }
  getAgent(agentId: string): Effect<AgentProfile, AgentProfileNotFound>
  defaultAgent: AgentProfile
```

Loading: `ConfigProvider.fromUnknown(yaml.parse(readFile("agent.yaml")))` with env var fallbacks via `ConfigProvider.orElse`. API keys resolved from the `apiKeyEnv` indirection in each provider config using `Config.redacted()`.

### AgentProfile

```
AgentProfile
  persona: { name: string, systemPrompt: string }
  model: { provider: string, modelId: string }
  generation: { temperature: number, maxOutputTokens: number, topP?: number, seed?: number }
```

Mirrors ontology concepts: Persona, FoundationModel, GenerationConfiguration.

### ModelRegistry Service

```
ModelRegistry (ServiceMap.Service)
  get(provider: string, modelId: string): Effect<LanguageModel.Service>
```

Lazily creates and caches LanguageModel instances keyed by `provider:modelId`. Replaces the single global LanguageModel layer in server.ts.

### System Prompt Integration

In TurnProcessingWorkflow, after resolving the agent profile:

1. Get or create persisted chat for session
2. If chat history is empty (first turn), prepend system prompt from persona
3. System prompt persists with chat — subsequent turns already have it

### Runtime Flow

```
HTTP POST /channels/:id/messages
  -> ChannelEntity.sendMessage (routing, concurrency)
    -> SessionEntity.processTurn (session concurrency)
      -> TurnProcessingRuntime.processTurnStream
        -> TurnProcessingWorkflow:
          1. agentConfig.getAgent(payload.agentId) -> AgentProfile
          2. modelRegistry.get(profile.model.provider, profile.model.modelId) -> LanguageModel
          3. chatPersistence.getOrCreate(sessionId)
          4. If first turn: inject profile.persona.systemPrompt
          5. chat.generateText({ prompt, toolkit }) with resolved LanguageModel
```

The agentId already flows through the entire chain. Config resolution happens at the workflow level where the LLM is invoked.

### `agent init` CLI Command

Generates a starter `agent.yaml` with sensible defaults and comments. Refuses to overwrite without `--force`. No interactive wizard in this slice.

### E2E Smoke Test

`packages/server/test/ChatFlow.e2e.test.ts`:
- Uses `it.live` (TestClock fix)
- Writes temporary `agent.yaml` with test persona
- Full layer stack: HTTP, entities, persistence, streaming, mock LanguageModel
- Verifies: channel creation, message sending, SSE stream events, system prompt injection, turn history persistence
- Cleanup: temp DB + config file

## Files

| File | Action |
|------|--------|
| `packages/domain/src/config.ts` | Create — Effect Schemas for config validation |
| `packages/server/src/ai/AgentConfig.ts` | Create — replaces AiConfig |
| `packages/server/src/ai/ModelRegistry.ts` | Create — lazy LanguageModel cache |
| `packages/server/src/ai/AiConfig.ts` | Delete — replaced by AgentConfig |
| `packages/server/src/ai/ChatPersistence.ts` | No change |
| `packages/server/src/turn/TurnProcessingWorkflow.ts` | Modify — resolve agent profile, inject system prompt, use ModelRegistry |
| `packages/server/src/server.ts` | Modify — wire AgentConfig + ModelRegistry, remove AiConfig |
| `packages/cli/src/Cli.ts` | Modify — add `init` subcommand |
| `agent.yaml.example` | Create — template config |
| `packages/server/test/ChatFlow.e2e.test.ts` | Create — full-flow E2E smoke test |

## Ontology Alignment

| YAML Section | Ontology Concept | Property |
|-------------|-----------------|----------|
| `agents.*.persona` | `pao:Persona` | `hasContent` (system prompt) |
| `agents.*.model` | `pao:FoundationModel` | `hasModelId`, `hasProvider` |
| `agents.*.generation` | `pao:GenerationConfiguration` | `hasTemperature`, `hasMaxOutputTokens`, `hasTopP`, `hasSeed` |
| `providers.*` | `pao:ModelProvider` | Provider credentials |

## Future Slices (Unblocked by This)

- TUI setup wizard (interactive agent.yaml creation)
- Gateway deployment config (host binding, CORS, TLS)
- Keychain / vault secret store (replace env var API keys)
- Per-turn model overrides (payload.modelOverride in workflow)
- Memory integration (retrieve context before LLM, encode learnings after)
