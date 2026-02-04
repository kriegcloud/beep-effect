/**
 * Test Fixtures
 *
 * Centralized test utilities and mocks.
 *
 * @example
 * ```typescript
 * import {
 *   TestConfigProviderLayer,
 *   MockEmbeddingProvider768
 * } from "../fixtures/index.js"
 *
 * const TestLayer = MyService.Default.pipe(
 *   Layer.provide(MockEmbeddingProvider768),
 *   Layer.provide(TestConfigProviderLayer)
 * )
 * ```
 *
 * @module test/fixtures
 */

export {
  makeTestConfigProvider,
  makeTestConfigProviderLayer,
  TestConfigProvider,
  TestConfigProviderLayer
} from "./TestConfig.js"

export {
  makeMockEmbeddingProvider,
  mockEmbed,
  MockEmbeddingProvider5,
  MockEmbeddingProvider768,
  type MockEmbeddingProviderOptions
} from "./MockEmbeddingProvider.js"
