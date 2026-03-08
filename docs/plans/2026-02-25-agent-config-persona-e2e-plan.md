# Agent Config, Persona & E2E Foundation — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace ad-hoc env-var config with a YAML-driven AgentConfig service, wire system prompts into chat, add a ModelRegistry for per-turn model resolution, and create an E2E smoke test for the full chat flow.

**Architecture:** Single `agent.yaml` parsed via `yaml` npm package into `ConfigProvider.fromUnknown()`. `AgentConfig` service validates with Effect Schema and exposes a registry of named agent profiles. `ModelRegistry` lazily caches `LanguageModel` instances keyed by `provider:modelId`. System prompt injected in `TurnProcessingWorkflow` on first turn. OpenRouter and Google use the OpenAI-compatible client with custom `apiUrl`.

**Tech Stack:** Effect (Config, Schema, ServiceMap, Layer), `yaml` npm package, `@effect/ai-anthropic`, `@effect/ai-openai` (with `apiUrl` for OpenRouter/Google), vitest with `it.live`.

---

### Task 1: Add `yaml` dependency

**Files:**
- Modify: `package.json` (root or packages/server)

**Step 1: Install yaml package**

Run: `cd packages/server && bun add yaml`

**Step 2: Verify installation**

Run: `bun run -e "import { parse } from 'yaml'; console.log(parse('a: 1'))"`
Expected: `{ a: 1 }`

**Step 3: Commit**

```bash
git add packages/server/package.json bun.lock
git commit -m "chore: add yaml dependency for config parsing"
```

---

### Task 2: Create domain config schemas

**Files:**
- Create: `packages/domain/src/config.ts`
- Test: `packages/domain/test/ConfigSchema.test.ts`

**Step 1: Write the failing test**

```typescript
// packages/domain/test/ConfigSchema.test.ts
import { describe, expect, it } from "@effect/vitest"
import { Schema } from "effect"
import { AgentProfileSchema, AgentConfigFileSchema, ProviderConfigSchema } from "../src/config.js"

describe("Config Schemas", () => {
  it("decodes a valid provider config", () => {
    const input = { apiKeyEnv: "PA_ANTHROPIC_API_KEY" }
    const result = Schema.decodeUnknownSync(ProviderConfigSchema)(input)
    expect(result.apiKeyEnv).toBe("PA_ANTHROPIC_API_KEY")
  })

  it("decodes a valid agent profile", () => {
    const input = {
      persona: { name: "Test", systemPrompt: "You are helpful." },
      model: { provider: "anthropic", modelId: "claude-sonnet-4-20250514" },
      generation: { temperature: 0.7, maxOutputTokens: 4096 }
    }
    const result = Schema.decodeUnknownSync(AgentProfileSchema)(input)
    expect(result.persona.name).toBe("Test")
    expect(result.model.provider).toBe("anthropic")
    expect(result.generation.temperature).toBe(0.7)
  })

  it("decodes a full config file", () => {
    const input = {
      providers: {
        anthropic: { apiKeyEnv: "PA_ANTHROPIC_API_KEY" }
      },
      agents: {
        default: {
          persona: { name: "Assistant", systemPrompt: "You are helpful." },
          model: { provider: "anthropic", modelId: "claude-sonnet-4-20250514" },
          generation: { temperature: 0.7, maxOutputTokens: 4096 }
        }
      },
      server: { port: 3000 }
    }
    const result = Schema.decodeUnknownSync(AgentConfigFileSchema)(input)
    expect(Object.keys(result.agents)).toEqual(["default"])
    expect(result.server.port).toBe(3000)
  })

  it("rejects invalid provider string", () => {
    const input = {
      persona: { name: "Test", systemPrompt: "x" },
      model: { provider: "invalid-provider", modelId: "x" },
      generation: { temperature: 0.7, maxOutputTokens: 4096 }
    }
    expect(() => Schema.decodeUnknownSync(AgentProfileSchema)(input)).toThrow()
  })

  it("applies defaults for optional generation fields", () => {
    const input = {
      persona: { name: "Test", systemPrompt: "x" },
      model: { provider: "openai", modelId: "gpt-4o" },
      generation: { temperature: 0.5, maxOutputTokens: 2048 }
    }
    const result = Schema.decodeUnknownSync(AgentProfileSchema)(input)
    expect(result.generation.topP).toBeUndefined()
    expect(result.generation.seed).toBeUndefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run packages/domain/test/ConfigSchema.test.ts`
Expected: FAIL — modules not found

**Step 3: Write the schemas**

```typescript
// packages/domain/src/config.ts
import { Schema } from "effect"

export const AiProviderName = Schema.Literal(
  "anthropic",
  "openai",
  "openrouter",
  "google"
)
export type AiProviderName = typeof AiProviderName.Type

export const ProviderConfigSchema = Schema.Struct({
  apiKeyEnv: Schema.String,
  apiUrl: Schema.optionalWith(Schema.String, { as: "Option" })
})
export type ProviderConfig = typeof ProviderConfigSchema.Type

export const PersonaSchema = Schema.Struct({
  name: Schema.String,
  systemPrompt: Schema.String
})
export type Persona = typeof PersonaSchema.Type

export const ModelRefSchema = Schema.Struct({
  provider: AiProviderName,
  modelId: Schema.String
})
export type ModelRef = typeof ModelRefSchema.Type

export const GenerationConfigSchema = Schema.Struct({
  temperature: Schema.Number,
  maxOutputTokens: Schema.Number,
  topP: Schema.optional(Schema.Number),
  seed: Schema.optional(Schema.Number)
})
export type GenerationConfig = typeof GenerationConfigSchema.Type

export const AgentProfileSchema = Schema.Struct({
  persona: PersonaSchema,
  model: ModelRefSchema,
  generation: GenerationConfigSchema
})
export type AgentProfile = typeof AgentProfileSchema.Type

export const ServerConfigSchema = Schema.Struct({
  port: Schema.Number
})
export type ServerConfig = typeof ServerConfigSchema.Type

export const AgentConfigFileSchema = Schema.Struct({
  providers: Schema.Record({ key: Schema.String, value: ProviderConfigSchema }),
  agents: Schema.Record({ key: Schema.String, value: AgentProfileSchema }),
  server: ServerConfigSchema
})
export type AgentConfigFile = typeof AgentConfigFileSchema.Type
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run packages/domain/test/ConfigSchema.test.ts`
Expected: PASS (all 5 tests)

**Step 5: Commit**

```bash
git add packages/domain/src/config.ts packages/domain/test/ConfigSchema.test.ts
git commit -m "feat(domain): add Effect Schema definitions for agent config"
```

---

### Task 3: Create AgentConfig service

**Files:**
- Create: `packages/server/src/ai/AgentConfig.ts`
- Test: `packages/server/test/AgentConfig.test.ts`

**Step 1: Write the failing test**

```typescript
// packages/server/test/AgentConfig.test.ts
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { AgentConfig } from "../src/ai/AgentConfig.js"

const testYaml = {
  providers: {
    anthropic: { apiKeyEnv: "PA_ANTHROPIC_API_KEY" },
    openai: { apiKeyEnv: "PA_OPENAI_API_KEY" }
  },
  agents: {
    default: {
      persona: { name: "Test Assistant", systemPrompt: "You are helpful." },
      model: { provider: "anthropic", modelId: "claude-sonnet-4-20250514" },
      generation: { temperature: 0.7, maxOutputTokens: 4096 }
    },
    summarizer: {
      persona: { name: "Summarizer", systemPrompt: "Summarize concisely." },
      model: { provider: "openai", modelId: "gpt-4o-mini" },
      generation: { temperature: 0.2, maxOutputTokens: 1024 }
    }
  },
  server: { port: 3000 }
}

const testLayer = AgentConfig.layerFromParsed(testYaml)

describe("AgentConfig", () => {
  it.effect("getAgent returns the default profile", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      const profile = yield* config.getAgent("default")
      expect(profile.persona.name).toBe("Test Assistant")
      expect(profile.model.provider).toBe("anthropic")
    }).pipe(Effect.provide(testLayer))
  )

  it.effect("getAgent returns named profiles", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      const profile = yield* config.getAgent("summarizer")
      expect(profile.persona.name).toBe("Summarizer")
      expect(profile.model.provider).toBe("openai")
    }).pipe(Effect.provide(testLayer))
  )

  it.effect("getAgent fails for unknown agent", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      const exit = yield* config.getAgent("nonexistent").pipe(Effect.flip)
      expect(exit._tag).toBe("AgentProfileNotFound")
    }).pipe(Effect.provide(testLayer))
  )

  it.effect("defaultAgent returns the default profile", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      expect(config.defaultAgent.persona.name).toBe("Test Assistant")
    }).pipe(Effect.provide(testLayer))
  )

  it.effect("providers map is populated", () =>
    Effect.gen(function*() {
      const config = yield* AgentConfig
      expect(config.providers.size).toBe(2)
      expect(config.providers.get("anthropic")?.apiKeyEnv).toBe("PA_ANTHROPIC_API_KEY")
    }).pipe(Effect.provide(testLayer))
  )
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run packages/server/test/AgentConfig.test.ts`
Expected: FAIL — module not found

**Step 3: Write AgentConfig service**

```typescript
// packages/server/src/ai/AgentConfig.ts
import type { AgentConfigFile, AgentProfile, ProviderConfig } from "@template/domain/config"
import { AgentConfigFileSchema } from "@template/domain/config"
import { Effect, Layer, Schema, ServiceMap } from "effect"
import { parse as parseYaml } from "yaml"
import { readFileSync } from "node:fs"

export class AgentProfileNotFound extends Schema.ErrorClass<AgentProfileNotFound>(
  "AgentProfileNotFound"
)({
  _tag: Schema.tag("AgentProfileNotFound"),
  agentId: Schema.String
}) {}

export interface AgentConfigService {
  readonly providers: Map<string, ProviderConfig>
  readonly agents: Map<string, AgentProfile>
  readonly server: { readonly port: number }
  readonly defaultAgent: AgentProfile
  readonly getAgent: (agentId: string) => Effect.Effect<AgentProfile, AgentProfileNotFound>
}

const makeFromParsed = (raw: unknown): Effect.Effect<AgentConfigService> =>
  Effect.gen(function*() {
    const config = yield* Schema.decodeUnknown(AgentConfigFileSchema)(raw).pipe(
      Effect.mapError((e) => new Error(`Invalid agent config: ${e.message}`)),
      Effect.orDie
    )

    const providers = new Map(Object.entries(config.providers))
    const agents = new Map(Object.entries(config.agents))

    const defaultAgent = agents.get("default")
    if (!defaultAgent) {
      return yield* Effect.die(new Error("agent.yaml must define a 'default' agent profile"))
    }

    const getAgent = (agentId: string): Effect.Effect<AgentProfile, AgentProfileNotFound> => {
      // Try exact match first, then fall back to "default" for IDs like "agent:bootstrap"
      const profile = agents.get(agentId) ?? agents.get("default")
      if (!profile) {
        return Effect.fail(new AgentProfileNotFound({ agentId }))
      }
      return Effect.succeed(profile)
    }

    return {
      providers,
      agents,
      server: config.server,
      defaultAgent,
      getAgent
    } satisfies AgentConfigService
  })

export class AgentConfig extends ServiceMap.Service<AgentConfig>()(
  "server/ai/AgentConfig",
  {
    make: Effect.gen(function*() {
      const configPath = process.env.PA_CONFIG_PATH ?? "agent.yaml"
      const yamlContent = yield* Effect.try(() =>
        readFileSync(configPath, "utf-8")
      ).pipe(
        Effect.mapError(() =>
          new Error(
            `Could not read ${configPath}. Run 'agent init' to create one.`
          )
        ),
        Effect.orDie
      )

      const raw = yield* Effect.try(() => parseYaml(yamlContent)).pipe(
        Effect.mapError((e) =>
          new Error(`Failed to parse ${configPath}: ${e instanceof Error ? e.message : String(e)}`)
        ),
        Effect.orDie
      )

      return yield* makeFromParsed(raw)
    })
  }
) {
  static layer = Layer.effect(this, this.make)

  static layerFromParsed(raw: unknown) {
    return Layer.effect(this, makeFromParsed(raw))
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run packages/server/test/AgentConfig.test.ts`
Expected: PASS (all 5 tests)

**Step 5: Commit**

```bash
git add packages/server/src/ai/AgentConfig.ts packages/server/test/AgentConfig.test.ts
git commit -m "feat(server): add AgentConfig service with YAML parsing and validation"
```

---

### Task 4: Create ModelRegistry service

**Files:**
- Create: `packages/server/src/ai/ModelRegistry.ts`
- Test: `packages/server/test/ModelRegistry.test.ts`

**Step 1: Write the failing test**

```typescript
// packages/server/test/ModelRegistry.test.ts
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import * as LanguageModel from "effect/unstable/ai/LanguageModel"
import { ModelRegistry } from "../src/ai/ModelRegistry.js"
import { AgentConfig } from "../src/ai/AgentConfig.js"

// Mock LanguageModel for testing — we just verify the registry resolves
// without actually calling an LLM
const testConfig = {
  providers: {
    anthropic: { apiKeyEnv: "PA_ANTHROPIC_API_KEY" }
  },
  agents: {
    default: {
      persona: { name: "Test", systemPrompt: "x" },
      model: { provider: "anthropic", modelId: "claude-sonnet-4-20250514" },
      generation: { temperature: 0.7, maxOutputTokens: 4096 }
    }
  },
  server: { port: 3000 }
}

describe("ModelRegistry", () => {
  it.effect("caches LanguageModel instances by provider:modelId", () =>
    Effect.gen(function*() {
      const registry = yield* ModelRegistry
      // Calling get twice with same key should return same instance
      // (We can't easily test this without real providers, so just verify the service loads)
      expect(typeof registry.get).toBe("function")
    }).pipe(
      Effect.provide(
        ModelRegistry.layer.pipe(
          Layer.provide(AgentConfig.layerFromParsed(testConfig))
        )
      )
    )
  )
})
```

Note: Full integration testing of ModelRegistry happens in the E2E test (Task 7) since it needs real or mock LanguageModel providers. This unit test verifies the service wires correctly.

**Step 2: Run test to verify it fails**

Run: `npx vitest run packages/server/test/ModelRegistry.test.ts`
Expected: FAIL — module not found

**Step 3: Write ModelRegistry service**

```typescript
// packages/server/src/ai/ModelRegistry.ts
import * as Anthropic from "@effect/ai-anthropic"
import * as OpenAi from "@effect/ai-openai"
import { Config, Effect, Layer, Redacted, ServiceMap } from "effect"
import type * as LanguageModel from "effect/unstable/ai/LanguageModel"
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient"
import { AgentConfig, AgentProfileNotFound } from "./AgentConfig.js"

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1"
const GOOGLE_GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/openai"

export interface ModelRegistryService {
  readonly get: (
    provider: string,
    modelId: string
  ) => Effect.Effect<LanguageModel.LanguageModel, AgentProfileNotFound>
}

export class ModelRegistry extends ServiceMap.Service<ModelRegistry>()(
  "server/ai/ModelRegistry",
  {
    make: Effect.gen(function*() {
      const agentConfig = yield* AgentConfig
      const cache = new Map<string, LanguageModel.LanguageModel>()

      const resolveApiKey = (provider: string): Effect.Effect<Redacted.Redacted<string>> => {
        const providerConfig = agentConfig.providers.get(provider)
        if (!providerConfig) {
          return Effect.die(new Error(`No provider config for: ${provider}`))
        }
        return Config.redacted(providerConfig.apiKeyEnv).pipe(
          Effect.orDie
        )
      }

      const buildModel = (
        provider: string,
        modelId: string
      ): Effect.Effect<LanguageModel.LanguageModel, never, never> => {
        switch (provider) {
          case "anthropic":
            return Effect.gen(function*() {
              const apiKey = yield* resolveApiKey(provider)
              return yield* Anthropic.AnthropicLanguageModel.layer({
                model: modelId
              }).pipe(
                Layer.provide(
                  Anthropic.AnthropicClient.layer({ apiKey })
                ),
                Layer.provide(FetchHttpClient.layer),
                Layer.build,
                Effect.map((ctx) => ctx.pipe(ServiceMap.get(LanguageModel.LanguageModel)))
              )
            })

          case "openai":
          case "openrouter":
          case "google": {
            const apiUrl = provider === "openrouter"
              ? OPENROUTER_API_URL
              : provider === "google"
                ? GOOGLE_GEMINI_API_URL
                : undefined
            return Effect.gen(function*() {
              const apiKey = yield* resolveApiKey(provider)
              return yield* OpenAi.OpenAiLanguageModel.layer({
                model: modelId
              }).pipe(
                Layer.provide(
                  OpenAi.OpenAiClient.layer({ apiKey, apiUrl })
                ),
                Layer.provide(FetchHttpClient.layer),
                Layer.build,
                Effect.map((ctx) => ctx.pipe(ServiceMap.get(LanguageModel.LanguageModel)))
              )
            })
          }

          default:
            return Effect.die(new Error(`Unsupported provider: ${provider}`))
        }
      }

      const get: ModelRegistryService["get"] = (provider, modelId) => {
        const key = `${provider}:${modelId}`
        const cached = cache.get(key)
        if (cached) {
          return Effect.succeed(cached)
        }
        return buildModel(provider, modelId).pipe(
          Effect.tap((model) => Effect.sync(() => cache.set(key, model)))
        )
      }

      return { get } satisfies ModelRegistryService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
```

Note: The `Layer.build` + `ServiceMap.get` pattern to extract a service from a layer into a value may need adjustment based on how Effect's ServiceMap works at runtime. The implementer should verify this pattern compiles and consider using `Effect.provideService` at the call site instead if `Layer.build` doesn't work cleanly. The key architectural point is: cache `LanguageModel` instances by `provider:modelId`.

**Step 4: Run test to verify it passes**

Run: `npx vitest run packages/server/test/ModelRegistry.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/server/src/ai/ModelRegistry.ts packages/server/test/ModelRegistry.test.ts
git commit -m "feat(server): add ModelRegistry service for per-turn model resolution"
```

---

### Task 5: Wire AgentConfig and ModelRegistry into server.ts

**Files:**
- Modify: `packages/server/src/server.ts`
- Delete: `packages/server/src/ai/AiConfig.ts`
- Modify: `packages/server/src/ai/LanguageModelLive.ts` (delete)

**Step 1: Update server.ts imports and layers**

Replace `AiConfig` and `LanguageModelLive` references with `AgentConfig` and `ModelRegistry`:

- Remove imports: `AiConfig`, `LanguageModelLive`
- Add imports: `AgentConfig`, `ModelRegistry`
- Replace `aiConfigLayer` with `agentConfigLayer = AgentConfig.layer`
- Replace `languageModelLayer` with `modelRegistryLayer = ModelRegistry.layer.pipe(Layer.provide(agentConfigLayer))`
- Update `PortsLive` to include `agentConfigLayer` and `modelRegistryLayer` instead of `aiConfigLayer` and `languageModelLayer`
- Remove the `LanguageModel` from the layer composition since the workflow will get it via `ModelRegistry` now

**Step 2: Delete AiConfig.ts and LanguageModelLive.ts**

These are fully replaced by `AgentConfig` and `ModelRegistry`.

**Step 3: Create agent.yaml.example**

```yaml
# agent.yaml — Personal Agent Configuration
# Copy this to agent.yaml and customize.
# API keys are loaded from environment variables (never put secrets in this file).

providers:
  anthropic:
    apiKeyEnv: PA_ANTHROPIC_API_KEY
  openai:
    apiKeyEnv: PA_OPENAI_API_KEY
  # openrouter:
  #   apiKeyEnv: PA_OPENROUTER_API_KEY
  # google:
  #   apiKeyEnv: PA_GOOGLE_API_KEY

agents:
  default:
    persona:
      name: "Personal Assistant"
      systemPrompt: |
        You are a helpful personal assistant.
        You have access to tools for time, math, and text processing.
        Be concise and direct in your responses.
    model:
      provider: anthropic
      modelId: claude-sonnet-4-20250514
    generation:
      temperature: 0.7
      maxOutputTokens: 4096

  # Example: background workflow agent
  # summarizer:
  #   persona:
  #     name: "Summarizer"
  #     systemPrompt: |
  #       You produce concise summaries. Output only the summary.
  #   model:
  #     provider: openai
  #     modelId: gpt-4o-mini
  #   generation:
  #     temperature: 0.2
  #     maxOutputTokens: 1024

server:
  port: 3000
```

**Step 4: Add agent.yaml to .gitignore**

Append `agent.yaml` to `.gitignore` (the example file is tracked, the real config is not).

**Step 5: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors (may need to update imports in files that referenced AiConfig)

**Step 6: Commit**

```bash
git add packages/server/src/server.ts packages/server/src/ai/ agent.yaml.example .gitignore
git rm packages/server/src/ai/AiConfig.ts packages/server/src/ai/LanguageModelLive.ts
git commit -m "refactor(server): replace AiConfig/LanguageModelLive with AgentConfig/ModelRegistry"
```

---

### Task 6: Integrate system prompt into TurnProcessingWorkflow

**Files:**
- Modify: `packages/server/src/turn/TurnProcessingWorkflow.ts`

**Step 1: Add AgentConfig and ModelRegistry dependencies**

In `TurnProcessingWorkflow.toLayer`, add:
```typescript
const agentConfig = yield* AgentConfig
const modelRegistry = yield* ModelRegistry
```

**Step 2: Resolve agent profile and model**

Before the LLM call, resolve the agent profile:
```typescript
const profile = yield* agentConfig.getAgent(payload.agentId)
const languageModel = yield* modelRegistry.get(
  profile.model.provider,
  profile.model.modelId
)
```

**Step 3: Inject system prompt on first turn**

After `chatPersistence.getOrCreate(payload.sessionId)`, check if chat is empty and inject system prompt:
```typescript
const chat = yield* chatPersistence.getOrCreate(payload.sessionId)
// Inject system prompt on first turn
const history = yield* chat.history.get
if (/* history is empty — check Prompt API */) {
  yield* chat.history.update((h) =>
    Prompt.concat(
      Prompt.make([{ role: "system", content: profile.persona.systemPrompt }]),
      h
    )
  )
}
```

Note: The implementer needs to check the exact `Prompt` API — whether it's `Prompt.isEmpty()`, checking `content.length === 0`, or similar. Read the Prompt module source to determine the right check.

**Step 4: Provide the resolved LanguageModel to the chat call**

The `chat.generateText()` call needs the resolved `LanguageModel` in scope. Use `Effect.provideService`:
```typescript
return yield* chat.generateText({
  prompt: toPromptText(payload.content, payload.contentBlocks),
  toolkit: toolkitBundle.toolkit
}).pipe(
  Effect.provide(toolkitBundle.handlerLayer),
  Effect.provideService(LanguageModel.LanguageModel, languageModel)
)
```

**Step 5: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 6: Run existing tests**

Run: `npx vitest run`
Expected: All tests pass (some may need updated layer composition if they mock AiConfig)

**Step 7: Commit**

```bash
git add packages/server/src/turn/TurnProcessingWorkflow.ts
git commit -m "feat(server): wire agent profile and system prompt into turn processing"
```

---

### Task 7: Add `agent init` CLI command

**Files:**
- Modify: `packages/cli/src/Cli.ts`

**Step 1: Add init command**

```typescript
const init = Command.make("init").pipe(
  Command.withDescription("Generate a starter agent.yaml config file"),
  Command.withHandler(() =>
    Effect.gen(function*() {
      const fs = yield* Effect.promise(() => import("node:fs"))
      const path = "agent.yaml"

      if (fs.existsSync(path)) {
        yield* Console.log(`${path} already exists. Use --force to overwrite.`)
        return
      }

      const template = yield* Effect.promise(() => import("node:fs"))
        .pipe(Effect.flatMap((fs) =>
          Effect.try(() => fs.readFileSync("agent.yaml.example", "utf-8"))
        ))

      yield* Effect.try(() => fs.writeFileSync(path, template))
      yield* Console.log(`Created ${path}. Edit persona.systemPrompt to customize your agent.`)
    })
  )
)
```

Add `init` to the root command's subcommands: `Command.withSubcommands([chat, status, init])`.

**Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add packages/cli/src/Cli.ts
git commit -m "feat(cli): add agent init command to generate starter config"
```

---

### Task 8: Create E2E smoke test for full chat flow

**Files:**
- Create: `packages/server/test/ChatFlow.e2e.test.ts`

**Step 1: Write the E2E test**

This test exercises the complete flow: config loading → channel creation → message sending → SSE streaming → turn persistence. Uses `it.live` (not `it.effect`) because SingleRunner needs real clock.

```typescript
// packages/server/test/ChatFlow.e2e.test.ts
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Stream } from "effect"
import * as LanguageModel from "effect/unstable/ai/LanguageModel"
import * as Response from "effect/unstable/ai/LanguageModel/Response"
import { SingleRunner } from "effect/unstable/cluster"
import { rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { AgentConfig } from "../src/ai/AgentConfig.js"
import { ModelRegistry } from "../src/ai/ModelRegistry.js"
import * as SqliteRuntime from "../src/persistence/SqliteRuntime.js"
import * as DomainMigrator from "../src/persistence/DomainMigrator.js"
// ... import all port layers, entity layers, etc.
// ... import ChannelEntity, TurnProcessingWorkflow, TurnProcessingRuntime

const testConfigData = {
  providers: { anthropic: { apiKeyEnv: "PA_ANTHROPIC_API_KEY" } },
  agents: {
    default: {
      persona: { name: "Test Bot", systemPrompt: "You are a test bot. Always respond with 'Hello from test bot!'" },
      model: { provider: "anthropic", modelId: "test-model" },
      generation: { temperature: 0.0, maxOutputTokens: 100 }
    }
  },
  server: { port: 3000 }
}

// Mock ModelRegistry that returns a mock LanguageModel
const mockModelRegistry = Layer.succeed(ModelRegistry, {
  get: (_provider, _modelId) =>
    Effect.succeed(makeMockLanguageModel())
})

// Mock LanguageModel returning synthetic response
const makeMockLanguageModel = () => ({ /* same pattern as TurnProcessingWorkflow.e2e.test.ts */ })

describe("ChatFlow E2E", () => {
  it.live("full chat flow: create channel → send message → get response → verify history", () => {
    const dbPath = join(tmpdir(), `pa-chatflow-${crypto.randomUUID()}.sqlite`)

    // Build full layer stack with AgentConfig from test data + mock model
    const testLayer = /* compose all layers */

    return Effect.gen(function*() {
      // 1. Create channel
      const makeChannelClient = yield* ChannelEntity.client
      const channelClient = makeChannelClient("test-channel-1")
      yield* channelClient.createChannel({ channelType: "CLI", agentId: "default" })

      // 2. Send message and collect stream events
      const events = yield* channelClient.sendMessage({ content: "Hello!" }).pipe(
        Stream.runCollect
      )
      const eventArray = Array.from(events)

      // 3. Verify event sequence
      expect(eventArray[0].type).toBe("turn.started")
      expect(eventArray[eventArray.length - 1].type).toBe("turn.completed")

      // 4. Verify we got assistant content
      const deltas = eventArray.filter(e => e.type === "assistant.delta")
      expect(deltas.length).toBeGreaterThan(0)

      // 5. Verify history is persisted
      const history = yield* channelClient.getHistory({})
      expect(history.length).toBe(2) // user turn + assistant turn
      expect(history[0].participantRole).toBe("UserRole")
      expect(history[1].participantRole).toBe("AssistantRole")
    }).pipe(
      Effect.provide(testLayer),
      Effect.ensuring(Effect.sync(() => rmSync(dbPath, { force: true })))
    )
  }, { timeout: 15000 })
})
```

Note: The implementer will need to adapt the exact layer composition from the existing `ChannelRoutes.e2e.test.ts` and `TurnProcessingWorkflow.e2e.test.ts` patterns. The mock `LanguageModel` pattern is already established in the codebase.

**Step 2: Run the test**

Run: `npx vitest run packages/server/test/ChatFlow.e2e.test.ts`
Expected: PASS

**Step 3: Commit**

```bash
git add packages/server/test/ChatFlow.e2e.test.ts
git commit -m "test(server): add E2E smoke test for full chat flow with agent config"
```

---

### Task 9: Update existing tests and cleanup

**Files:**
- Modify: any test files that reference `AiConfig` or `LanguageModelLive`
- Modify: `packages/server/test/TurnProcessingWorkflow.e2e.test.ts` (update layer to provide AgentConfig)
- Modify: `packages/server/test/ChannelRoutes.e2e.test.ts` (update layer)

**Step 1: Find all references to AiConfig**

Run: `grep -r "AiConfig" packages/server/ --include="*.ts" -l`

Update each file to use `AgentConfig` instead. Test layer factories need to provide `AgentConfig.layerFromParsed(testConfig)` and mock `ModelRegistry`.

**Step 2: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass, no regressions

**Step 3: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor(test): migrate all tests from AiConfig to AgentConfig"
```

---

## Task Summary

| Task | Description | Estimated Steps |
|------|-------------|-----------------|
| 1 | Add `yaml` dependency | 3 |
| 2 | Domain config schemas + tests | 5 |
| 3 | AgentConfig service + tests | 5 |
| 4 | ModelRegistry service + tests | 5 |
| 5 | Wire into server.ts, delete AiConfig | 6 |
| 6 | System prompt in TurnProcessingWorkflow | 7 |
| 7 | `agent init` CLI command | 3 |
| 8 | E2E smoke test | 3 |
| 9 | Update existing tests, cleanup | 4 |

## Verification

After all tasks complete:

```bash
npx tsc --noEmit                          # typecheck
npx vitest run                            # full suite — no regressions
npx vitest run ChatFlow.e2e              # new E2E smoke test
npx vitest run AgentConfig               # config service tests
npx vitest run ConfigSchema              # domain schema tests
npx vitest run ModelRegistry             # model registry tests
```
