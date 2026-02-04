/**
 * Test Layers for EntityResolution Tests
 *
 * Provides composable test layers for EntityResolution services.
 * Separates unit test layers (mocked dependencies) from integration
 * test layers (real database operations).
 *
 * @module knowledge-server/test/EntityResolution/_shared/TestLayers
 * @since 0.1.0
 */
import { BloomFilter } from "@beep/knowledge-server/EntityResolution/BloomFilter";
import * as Layer from "effect/Layer";

// =============================================================================
// Unit Test Layers
// =============================================================================

/**
 * Test layer with only BloomFilter for unit tests
 *
 * Use this for testing BloomFilter in isolation without any
 * external dependencies. The BloomFilter.Default creates an
 * in-memory filter that resets between test runs.
 *
 * @example
 * ```typescript
 * import { effect, strictEqual } from "@beep/testkit";
 * import * as Effect from "effect/Effect";
 * import { BloomFilterUnitLayer } from "./_shared/TestLayers";
 * import { BloomFilter } from "@beep/knowledge-server/EntityResolution/BloomFilter";
 *
 * effect("bloom filter contains added item", () =>
 *   Effect.gen(function* () {
 *     const bf = yield* BloomFilter;
 *     yield* bf.add("test-entity");
 *     const result = yield* bf.contains("test-entity");
 *     strictEqual(result, true);
 *   }).pipe(Effect.provide(BloomFilterUnitLayer))
 * );
 * ```
 *
 * @since 0.1.0
 * @category layers
 */
export const BloomFilterUnitLayer = BloomFilter.Default;

/**
 * Combined unit test layer for EntityResolution services
 *
 * Provides BloomFilter service for unit tests that don't require
 * database access or embedding services. Suitable for testing
 * pure functions and in-memory data structures.
 *
 * @since 0.1.0
 * @category layers
 */
export const EntityResolutionUnitLayer = Layer.mergeAll(BloomFilter.Default);
