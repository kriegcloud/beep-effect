/**
 * Test Configuration Fixtures
 *
 * Centralized test config with proper pathDelim for env var format.
 *
 * @module test/fixtures/TestConfig
 */

import { ConfigProvider, Layer } from "effect"

/**
 * Base test configuration values
 *
 * These match the environment variable naming convention (underscore-delimited).
 * Use makeTestConfigProvider() to override specific values.
 */
const BaseTestConfig = new Map([
  // Ontology
  ["ONTOLOGY_PATH", "/tmp/test-ontology.ttl"],
  ["ONTOLOGY_EXTERNAL_VOCABS_PATH", "__SKIP__"],
  ["ONTOLOGY_CACHE_TTL", "3600"],
  ["ONTOLOGY_STRICT_VALIDATION", "false"],

  // LLM
  ["LLM_PROVIDER", "anthropic"],
  ["LLM_API_KEY", "test-key-for-testing"],
  ["LLM_MODEL", "claude-haiku-4-5"],
  ["LLM_TIMEOUT_MS", "60000"],
  ["LLM_MAX_TOKENS", "4096"],
  ["LLM_TEMPERATURE", "0.1"],
  ["LLM_ENABLE_PROMPT_CACHING", "true"],

  // Storage
  ["STORAGE_TYPE", "memory"],
  ["STORAGE_PREFIX", ""],

  // Runtime
  ["RUNTIME_CONCURRENCY", "4"],
  ["RUNTIME_LLM_CONCURRENCY", "2"],
  ["RUNTIME_RETRY_MAX", "3"],
  ["RUNTIME_RETRY_INITIAL_DELAY", "1000"],
  ["RUNTIME_RETRY_MAX_DELAY", "30000"],
  ["RUNTIME_ENABLE_TRACING", "false"],

  // Embedding
  ["EMBEDDING_PROVIDER", "nomic"],
  ["EMBEDDING_MODEL", "nomic-embed-text-v1.5"],
  ["EMBEDDING_DIMENSION", "768"],
  ["EMBEDDING_TRANSFORMERS_MODEL_ID", "Xenova/nomic-embed-text-v1"],
  ["EMBEDDING_VOYAGE_MODEL", "voyage-3.5-lite"],
  ["EMBEDDING_TIMEOUT_MS", "30000"],
  ["EMBEDDING_RATE_LIMIT_RPM", "100"],
  ["EMBEDDING_MAX_CONCURRENT", "10"],
  ["EMBEDDING_CACHE_TTL_HOURS", "24"],
  ["EMBEDDING_CACHE_MAX_ENTRIES", "10000"],

  // Grounder
  ["GROUNDER_ENABLED", "true"],
  ["GROUNDER_THRESHOLD", "0.8"],
  ["GROUNDER_BATCH_SIZE", "5"],

  // Extraction
  ["EXTRACTION_RUNS_DIR", "/tmp/test-runs"],
  ["EXTRACTION_STRICT_PERSISTENCE", "true"],

  // Entity Registry
  ["ENTITY_REGISTRY_ENABLED", "false"],
  ["ENTITY_REGISTRY_CANDIDATE_THRESHOLD", "0.6"],
  ["ENTITY_REGISTRY_RESOLUTION_THRESHOLD", "0.8"],
  ["ENTITY_REGISTRY_MAX_CANDIDATES", "20"],
  ["ENTITY_REGISTRY_MAX_BLOCKING", "100"],
  ["ENTITY_REGISTRY_CANONICAL_NAMESPACE", "http://example.org/entities/"],

  // Inference
  ["INFERENCE_ENABLED", "false"],
  ["INFERENCE_PROFILE", "rdfs"],
  ["INFERENCE_PERSIST_DERIVED", "true"],

  // Validation
  ["VALIDATION_LOG_ONLY", "false"],
  ["VALIDATION_FAIL_ON_VIOLATION", "true"],
  ["VALIDATION_FAIL_ON_WARNING", "false"],

  // RDF
  ["RDF_BASE_NAMESPACE", "http://example.org/kg/"],
  ["RDF_OUTPUT_FORMAT", "Turtle"],

  // API
  ["API_REQUIRE_AUTH", "false"],

  // Jina
  ["JINA_RATE_LIMIT_RPM", "20"],
  ["JINA_TIMEOUT_MS", "30000"],
  ["JINA_MAX_CONCURRENT", "5"],
  ["JINA_BASE_URL", "https://r.jina.ai"]
])

/**
 * Create a test config provider with optional overrides
 *
 * @example
 * ```typescript
 * // Use defaults
 * const provider = makeTestConfigProvider()
 *
 * // Override specific values
 * const provider = makeTestConfigProvider({
 *   "ONTOLOGY_PATH": "/custom/path.ttl",
 *   "EMBEDDING_DIMENSION": "5"
 * })
 * ```
 */
export const makeTestConfigProvider = (
  overrides?: Record<string, string>
): ConfigProvider.ConfigProvider => {
  const merged = new Map(BaseTestConfig)
  if (overrides) {
    Object.entries(overrides).forEach(([k, v]) => merged.set(k, v))
  }
  return ConfigProvider.fromMap(merged, { pathDelim: "_" })
}

/**
 * Default test config provider
 *
 * Pre-configured with sane defaults for testing.
 * Use makeTestConfigProvider() for custom overrides.
 */
export const TestConfigProvider = makeTestConfigProvider()

/**
 * Layer that sets the test config provider
 *
 * Provide this layer to make Effect.Config read from test values.
 */
export const TestConfigProviderLayer = Layer.setConfigProvider(TestConfigProvider)

/**
 * Create a layer with custom test config overrides
 *
 * @example
 * ```typescript
 * const CustomConfigLayer = makeTestConfigProviderLayer({
 *   "EMBEDDING_DIMENSION": "5"
 * })
 * ```
 */
export const makeTestConfigProviderLayer = (
  overrides: Record<string, string>
): Layer.Layer<never> => Layer.setConfigProvider(makeTestConfigProvider(overrides))
