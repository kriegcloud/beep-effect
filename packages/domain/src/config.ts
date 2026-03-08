/**
 * Effect Schema definitions for agent.yaml configuration.
 *
 * Ontology alignment:
 *   PersonaSchema          → pao:Persona (agent identity metadata)
 *   ModelRefSchema         → pao:FoundationModel (hasModelId, hasProvider)
 *   GenerationConfigSchema → pao:GenerationConfiguration (hasTemperature, hasMaxOutputTokens, hasTopP, hasSeed)
 *   ProviderConfigSchema   → pao:ModelProvider (credentials)
 */
import { Schema } from "effect"

import { MemoryRoutinesConfig } from "./memory.js"
import { MemoryTier, SensitivityLevel } from "./status.js"
import {
  DEFAULT_ARTIFACT_COMPRESSION,
  DEFAULT_ARTIFACT_PREVIEW_MAX_BYTES,
  DEFAULT_COMPACTION_ARTIFACT_BYTES,
  DEFAULT_COMPACTION_COOLDOWN_SECONDS,
  DEFAULT_COMPACTION_FILE_TOUCHES,
  DEFAULT_COMPACTION_PRUNING_INCLUDE_ARTIFACT_REFS,
  DEFAULT_COMPACTION_PRUNING_INCLUDE_TOOL_REFS,
  DEFAULT_COMPACTION_PRUNING_KEEP_RECENT_TURNS,
  DEFAULT_COMPACTION_PRUNING_MAX_REFERENCE_ITEMS,
  DEFAULT_COMPACTION_PRUNING_SUMMARY_ENABLED,
  DEFAULT_COMPACTION_PRUNING_SUMMARY_MAX_CHARS,
  DEFAULT_COMPACTION_TOKEN_PRESSURE_RATIO,
  DEFAULT_COMPACTION_TOOL_RESULT_BYTES,
  DEFAULT_INLINE_TOOL_RESULT_MAX_BYTES,
  DEFAULT_MAX_TOOL_ITERATIONS,
  DEFAULT_MEMORY_RETRIEVE_LIMIT,
  DEFAULT_PROMPT_ROOT_DIR,
  DEFAULT_STORAGE_ROOT_DIR,
  DEFAULT_TOKEN_CAPACITY,
  MAX_MEMORY_RETRIEVE_LIMIT
} from "./system-defaults.js"

export const AiProviderName = Schema.Literals([
  "anthropic",
  "openai",
  "openrouter",
  "google"
])
export type AiProviderName = typeof AiProviderName.Type

export const ProviderConfigSchema = Schema.Struct({
  apiKeyEnv: Schema.String
})
export type ProviderConfig = typeof ProviderConfigSchema.Type

export const PromptCatalogEntrySchema = Schema.Struct({
  file: Schema.String
})
export type PromptCatalogEntry = typeof PromptCatalogEntrySchema.Type

export const PromptsConfigSchema = Schema.Struct({
  rootDir: Schema.String.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_PROMPT_ROOT_DIR)
  ),
  entries: Schema.Record(Schema.String, PromptCatalogEntrySchema)
})
export type PromptsConfig = typeof PromptsConfigSchema.Type

export const PersonaSchema = Schema.Struct({
  name: Schema.String
})
export type Persona = typeof PersonaSchema.Type

export const TurnPromptBindingsSchema = Schema.Struct({
  systemPromptRef: Schema.String,
  replayContinuationRef: Schema.String
})
export type TurnPromptBindings = typeof TurnPromptBindingsSchema.Type

export const MemoryTierPromptBindingsSchema = Schema.Struct({
  WorkingMemory: Schema.String,
  EpisodicMemory: Schema.String,
  SemanticMemory: Schema.String,
  ProceduralMemory: Schema.String
})
export type MemoryTierPromptBindings = typeof MemoryTierPromptBindingsSchema.Type

export const MemoryPromptBindingsSchema = Schema.Struct({
  triggerEnvelopeRef: Schema.String,
  tierInstructionRefs: MemoryTierPromptBindingsSchema
})
export type MemoryPromptBindings = typeof MemoryPromptBindingsSchema.Type

export const CompactionPromptBindingsSchema = Schema.Struct({
  summaryBlockRef: Schema.String,
  artifactRefsBlockRef: Schema.String,
  toolRefsBlockRef: Schema.String,
  keptContextBlockRef: Schema.String
})
export type CompactionPromptBindings = typeof CompactionPromptBindingsSchema.Type

export const AgentPromptBindingsSchema = Schema.Struct({
  turn: TurnPromptBindingsSchema,
  memory: MemoryPromptBindingsSchema,
  compaction: CompactionPromptBindingsSchema
})
export type AgentPromptBindings = typeof AgentPromptBindingsSchema.Type

export const ModelRefSchema = Schema.Struct({
  provider: AiProviderName,
  modelId: Schema.String
})
export type ModelRef = typeof ModelRefSchema.Type

export const ModelOverrideSchema = Schema.Struct({
  provider: AiProviderName,
  modelId: Schema.String
})
export type ModelOverride = typeof ModelOverrideSchema.Type

export const GenerationConfigSchema = Schema.Struct({
  temperature: Schema.Number,
  maxOutputTokens: Schema.Number,
  topP: Schema.optional(Schema.Number),
  seed: Schema.optional(Schema.Number)
})
export type GenerationConfig = typeof GenerationConfigSchema.Type

export const GenerationConfigOverrideSchema = Schema.Struct({
  temperature: Schema.optionalKey(Schema.Number),
  maxOutputTokens: Schema.optionalKey(Schema.Number),
  topP: Schema.optionalKey(Schema.Number)
})
export type GenerationConfigOverride = typeof GenerationConfigOverrideSchema.Type

export const MemoryLimitsSchema = Schema.Struct({
  defaultRetrieveLimit: Schema.Number.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_MEMORY_RETRIEVE_LIMIT)
  ),
  maxRetrieveLimit: Schema.Number.pipe(
    Schema.withDecodingDefaultKey(() => MAX_MEMORY_RETRIEVE_LIMIT)
  )
})
export type MemoryLimits = typeof MemoryLimitsSchema.Type

const defaultMemoryLimits = Schema.decodeUnknownSync(MemoryLimitsSchema)({})

export const RuntimeConfigSchema = Schema.Struct({
  tokenBudget: Schema.Number.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_TOKEN_CAPACITY)
  ),
  maxToolIterations: Schema.Number.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_MAX_TOOL_ITERATIONS)
  ),
  memory: MemoryLimitsSchema.pipe(
    Schema.withDecodingDefaultKey(() => defaultMemoryLimits)
  )
})
export type RuntimeConfig = typeof RuntimeConfigSchema.Type

const defaultRuntimeConfig = Schema.decodeUnknownSync(RuntimeConfigSchema)({})

export const MemoryInjectionConfigSchema = Schema.Struct({
  enabled: Schema.optionalKey(Schema.Boolean),
  maxTokens: Schema.optionalKey(Schema.Int),
  tiers: Schema.optionalKey(Schema.Array(MemoryTier)),
  perTierFetchLimit: Schema.optionalKey(Schema.Int),
  allowedSensitivities: Schema.optionalKey(Schema.Array(SensitivityLevel))
})
export type MemoryInjectionConfig = typeof MemoryInjectionConfigSchema.Type

export const AgentProfileSchema = Schema.Struct({
  persona: PersonaSchema,
  promptBindings: AgentPromptBindingsSchema,
  model: ModelRefSchema,
  generation: GenerationConfigSchema,
  runtime: RuntimeConfigSchema.pipe(
    Schema.withDecodingDefaultKey(() => defaultRuntimeConfig)
  ),
  memoryInjection: Schema.optionalKey(MemoryInjectionConfigSchema),
  memoryRoutines: Schema.optionalKey(MemoryRoutinesConfig)
})
export type AgentProfile = typeof AgentProfileSchema.Type

export const ArtifactCompressionSchema = Schema.Literals([
  "none",
  "gzip"
])
export type ArtifactCompression = typeof ArtifactCompressionSchema.Type

export const ServerStorageArtifactsConfigSchema = Schema.Struct({
  inlineToolResultMaxBytes: Schema.Number.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_INLINE_TOOL_RESULT_MAX_BYTES)
  ),
  previewMaxBytes: Schema.Number.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_ARTIFACT_PREVIEW_MAX_BYTES)
  ),
  compression: ArtifactCompressionSchema.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_ARTIFACT_COMPRESSION)
  )
})
export type ServerStorageArtifactsConfig = typeof ServerStorageArtifactsConfigSchema.Type

export const ServerStorageCompactionThresholdsSchema = Schema.Struct({
  tokenPressureRatio: Schema.Number.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_COMPACTION_TOKEN_PRESSURE_RATIO)
  ),
  toolResultBytes: Schema.Number.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_COMPACTION_TOOL_RESULT_BYTES)
  ),
  artifactBytes: Schema.Number.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_COMPACTION_ARTIFACT_BYTES)
  ),
  fileTouches: Schema.Number.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_COMPACTION_FILE_TOUCHES)
  )
})
export type ServerStorageCompactionThresholds =
  typeof ServerStorageCompactionThresholdsSchema.Type

const defaultServerStorageCompactionThresholds = Schema.decodeUnknownSync(
  ServerStorageCompactionThresholdsSchema
)({})

export const ServerStorageCompactionPruningConfigSchema = Schema.Struct({
  keepRecentTurns: Schema.Number.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_COMPACTION_PRUNING_KEEP_RECENT_TURNS)
  ),
  includeArtifactRefs: Schema.Boolean.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_COMPACTION_PRUNING_INCLUDE_ARTIFACT_REFS)
  ),
  includeToolRefs: Schema.Boolean.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_COMPACTION_PRUNING_INCLUDE_TOOL_REFS)
  ),
  maxReferenceItems: Schema.Number.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_COMPACTION_PRUNING_MAX_REFERENCE_ITEMS)
  ),
  summaryEnabled: Schema.Boolean.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_COMPACTION_PRUNING_SUMMARY_ENABLED)
  ),
  summaryMaxChars: Schema.Number.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_COMPACTION_PRUNING_SUMMARY_MAX_CHARS)
  )
})
export type ServerStorageCompactionPruningConfig =
  typeof ServerStorageCompactionPruningConfigSchema.Type

const defaultServerStorageCompactionPruningConfig = Schema.decodeUnknownSync(
  ServerStorageCompactionPruningConfigSchema
)({})

export const ServerStorageCompactionConfigSchema = Schema.Struct({
  cooldownSeconds: Schema.Number.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_COMPACTION_COOLDOWN_SECONDS)
  ),
  thresholds: ServerStorageCompactionThresholdsSchema.pipe(
    Schema.withDecodingDefaultKey(() => defaultServerStorageCompactionThresholds)
  ),
  pruning: ServerStorageCompactionPruningConfigSchema.pipe(
    Schema.withDecodingDefaultKey(() => defaultServerStorageCompactionPruningConfig)
  )
})
export type ServerStorageCompactionConfig = typeof ServerStorageCompactionConfigSchema.Type

const defaultServerStorageArtifactsConfig = Schema.decodeUnknownSync(
  ServerStorageArtifactsConfigSchema
)({})

const defaultServerStorageCompactionConfig = Schema.decodeUnknownSync(
  ServerStorageCompactionConfigSchema
)({})

export const ServerStorageConfigSchema = Schema.Struct({
  rootDir: Schema.String.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_STORAGE_ROOT_DIR)
  ),
  artifacts: ServerStorageArtifactsConfigSchema.pipe(
    Schema.withDecodingDefaultKey(() => defaultServerStorageArtifactsConfig)
  ),
  compaction: ServerStorageCompactionConfigSchema.pipe(
    Schema.withDecodingDefaultKey(() => defaultServerStorageCompactionConfig)
  )
})
export type ServerStorageConfig = typeof ServerStorageConfigSchema.Type

const defaultServerStorageConfig = Schema.decodeUnknownSync(ServerStorageConfigSchema)({})

export const ServerConfigSchema = Schema.Struct({
  port: Schema.Number,
  storage: ServerStorageConfigSchema.pipe(
    Schema.withDecodingDefaultKey(() => defaultServerStorageConfig)
  )
})
export type ServerConfig = typeof ServerConfigSchema.Type

export const ChannelConfigSchema = Schema.Struct({
  enabled: Schema.Boolean
})
export type ChannelConfig = typeof ChannelConfigSchema.Type

export const ChannelsConfigSchema = Schema.Struct({
  cli: ChannelConfigSchema.pipe(
    Schema.withDecodingDefaultKey(() => ({ enabled: true }))
  ),
  webchat: ChannelConfigSchema.pipe(
    Schema.withDecodingDefaultKey(() => ({ enabled: true }))
  )
})
export type ChannelsConfig = typeof ChannelsConfigSchema.Type

const defaultChannelsConfig = Schema.decodeUnknownSync(ChannelsConfigSchema)({})

export const IntegrationConfigSchema = Schema.Struct({
  serviceId: Schema.String,
  name: Schema.String,
  endpoint: Schema.String,
  transport: Schema.Literals(["stdio", "sse", "http"]),
  identifier: Schema.optional(Schema.String)
})
export type IntegrationConfig = typeof IntegrationConfigSchema.Type

export const IntegrationsConfigSchema = Schema.Array(IntegrationConfigSchema)
export type IntegrationsConfig = typeof IntegrationsConfigSchema.Type

export const AgentConfigFileSchema = Schema.Struct({
  prompts: PromptsConfigSchema,
  providers: Schema.Record(Schema.String, ProviderConfigSchema),
  agents: Schema.Record(Schema.String, AgentProfileSchema),
  server: ServerConfigSchema,
  channels: ChannelsConfigSchema.pipe(
    Schema.withDecodingDefaultKey(() => defaultChannelsConfig)
  ),
  integrations: IntegrationsConfigSchema.pipe(
    Schema.withDecodingDefaultKey(() => [] as IntegrationsConfig)
  )
})
export type AgentConfigFile = typeof AgentConfigFileSchema.Type
