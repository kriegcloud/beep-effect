/**
 * Test Setup
 *
 * Global test configuration and fixtures re-exports.
 *
 * @module test/setup
 */

// Re-export config fixtures
export {
  makeTestConfigProvider,
  makeTestConfigProviderLayer,
  TestConfigProvider,
  TestConfigProviderLayer
} from "./fixtures/TestConfig.js"

// Re-export mock embedding provider
export {
  makeMockEmbeddingProvider,
  mockEmbed,
  MockEmbeddingProvider5,
  MockEmbeddingProvider768,
  type MockEmbeddingProviderOptions
} from "./fixtures/MockEmbeddingProvider.js"

// Re-export PostgreSQL test layers
export {
  DrizzleAndSqlTestLayer,
  DrizzleTestLayer,
  makePostgresTestLayer,
  PgClientTestLayer,
  PostgresTestConfig
} from "./fixtures/PostgresTestLayer.js"
