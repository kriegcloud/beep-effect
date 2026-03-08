import { Config } from "effect"

export const ExtractionConfig = Config.all({
  modelId: Config.string("MODEL_ID").pipe(Config.withDefault("gemini-2.5-flash")),
  maxCharBuffer: Config.integer("MAX_CHAR_BUFFER").pipe(Config.withDefault(1000)),
  temperature: Config.number("TEMPERATURE").pipe(Config.option),
  batchLength: Config.integer("BATCH_LENGTH").pipe(Config.withDefault(10)),
  batchConcurrency: Config.integer("BATCH_CONCURRENCY").pipe(Config.withDefault(1)),
  providerConcurrency: Config.integer("PROVIDER_CONCURRENCY").pipe(Config.withDefault(8)),
  maxBatchInputTokens: Config.integer("MAX_BATCH_INPUT_TOKENS").pipe(Config.option),
  extractionPasses: Config.integer("EXTRACTION_PASSES").pipe(Config.withDefault(1)),
  contextWindowChars: Config.integer("CONTEXT_WINDOW_CHARS").pipe(Config.option),
  formatType: Config.literal("json", "yaml")("FORMAT_TYPE").pipe(
    Config.withDefault("json" as const)
  ),
  useFences: Config.boolean("USE_FENCES").pipe(Config.option),
  useSchemaConstraints: Config.boolean("USE_SCHEMA_CONSTRAINTS").pipe(
    Config.withDefault(true)
  ),
  primedCacheEnabled: Config.boolean("PRIMED_CACHE_ENABLED").pipe(
    Config.withDefault(true)
  ),
  primedCacheDir: Config.string("PRIMED_CACHE_DIR").pipe(
    Config.withDefault(".cache/langextract/primed")
  ),
  primedCacheNamespace: Config.string("PRIMED_CACHE_NAMESPACE").pipe(
    Config.withDefault("langextract")
  ),
  primedCacheTtlSeconds: Config.integer("PRIMED_CACHE_TTL_SECONDS").pipe(
    Config.withDefault(86400)
  ),
  primedCacheDeterministicOnly: Config.boolean(
    "PRIMED_CACHE_DETERMINISTIC_ONLY"
  ).pipe(Config.withDefault(true)),
  clearPrimedCacheOnStart: Config.boolean("CLEAR_PRIMED_CACHE_ON_START").pipe(
    Config.withDefault(false)
  ),
  debug: Config.boolean("DEBUG").pipe(Config.withDefault(false))
})
