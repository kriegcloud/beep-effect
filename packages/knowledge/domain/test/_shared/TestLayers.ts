/**
 * Test Layers for Knowledge Domain Tests
 *
 * Provides test layers for EntityRegistry and MergeHistory services.
 *
 * CRITICAL: Uses Layer.merge for Phase 2.
 * Phase 3 will add Layer.provideMerge with EntityRepo.
 *
 * @module knowledge-domain/test/_shared/TestLayers
 * @since 0.1.0
 */

import { EntityRegistry, MergeHistory } from "@beep/knowledge-domain/services";
import * as Layer from "effect/Layer";

/**
 * Test layer for EntityRegistry (stub implementation)
 *
 * @since 0.1.0
 * @category test layers
 */
export const EntityRegistryTestLayer = EntityRegistry.Default;

/**
 * Test layer for MergeHistory (stub implementation)
 *
 * @since 0.1.0
 * @category test layers
 */
export const MergeHistoryTestLayer = MergeHistory.Default;

/**
 * Combined test layer for entity resolution services
 *
 * Provides both EntityRegistry and MergeHistory for integration testing.
 *
 * @since 0.1.0
 * @category test layers
 */
export const EntityResolutionTestLayer = Layer.merge(EntityRegistryTestLayer, MergeHistoryTestLayer);
