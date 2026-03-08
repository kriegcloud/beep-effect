import type {
  AgentProfile,
  ChannelsConfig,
  IntegrationsConfig,
  PromptsConfig,
  ProviderConfig,
  ServerConfig
} from "@template/domain/config"
import { AgentConfigFileSchema } from "@template/domain/config"
import { Effect, FileSystem, Layer, Schema, ServiceMap } from "effect"

export class AgentProfileNotFound extends Schema.ErrorClass<AgentProfileNotFound>(
  "AgentProfileNotFound"
)({
  _tag: Schema.tag("AgentProfileNotFound"),
  agentId: Schema.String
}) {}

export interface AgentConfigService {
  readonly prompts: PromptsConfig
  readonly providers: Map<string, ProviderConfig>
  readonly agents: Map<string, AgentProfile>
  readonly server: ServerConfig
  readonly channels: ChannelsConfig
  readonly integrations: IntegrationsConfig
  readonly defaultAgent: AgentProfile
  readonly getAgent: (agentId: string) => Effect.Effect<AgentProfile, AgentProfileNotFound>
}

const makeFromParsed = (raw: unknown): Effect.Effect<AgentConfigService> =>
  Effect.gen(function*() {
    const config = yield* Schema.decodeUnknownEffect(AgentConfigFileSchema)(raw).pipe(
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
      // Exact match first, then fall back to default profile
      const profile = agents.get(agentId) ?? defaultAgent
      return Effect.succeed(profile)
    }

    return {
      prompts: config.prompts,
      providers,
      agents,
      server: config.server,
      channels: config.channels,
      integrations: config.integrations,
      defaultAgent,
      getAgent
    } satisfies AgentConfigService
  })

export class AgentConfig extends ServiceMap.Service<AgentConfig>()(
  "server/ai/AgentConfig",
  {
    make: Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const configPath = process.env.PA_CONFIG_PATH ?? "agent.yaml"
      const yamlContent = yield* fs.readFileString(configPath).pipe(
        Effect.mapError(() =>
          new Error(
            `Could not read ${configPath}. Run 'agent init' to create one.`
          )
        ),
        Effect.orDie
      )

      const raw = yield* Effect.sync(() => Bun.YAML.parse(yamlContent)).pipe(
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
