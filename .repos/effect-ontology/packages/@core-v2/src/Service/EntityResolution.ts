/**
 * Service: Entity Resolution
 *
 * Service wrapper for entity resolution operations.
 *
 * @since 2.0.0
 * @module Service/EntityResolution
 */

import { Effect, Option } from "effect"
import { KnowledgeGraph } from "../Domain/Model/Entity.js"
import type { EntityResolutionConfig } from "../Domain/Model/EntityResolution.js"
import { buildEntityResolutionGraph } from "../Workflow/EntityResolutionGraph.js"
import { EmbeddingService, EmbeddingServiceDefault } from "./Embedding.js"

/**
 * EntityResolutionService - Entity resolution operations
 *
 * @since 2.0.0
 * @category Services
 */
const makeEntityResolutionService = Effect.gen(function*() {
  const _embedding = yield* EmbeddingService
  return {
    resolve: (graphs: ReadonlyArray<KnowledgeGraph>, config: EntityResolutionConfig) =>
      Effect.gen(function*() {
        // Merge all graphs
        const mergedEntities = graphs.flatMap((g) => g.entities)
        const mergedRelations = graphs.flatMap((g) => g.relations)

        const mergedGraph = new KnowledgeGraph({
          entities: mergedEntities,
          relations: mergedRelations
        })

        return yield* buildEntityResolutionGraph(mergedGraph, config)
      })
  }
})

export class EntityResolutionService
  extends Effect.Service<EntityResolutionService>()("@core-v2/EntityResolutionService", {
    effect: makeEntityResolutionService,
    dependencies: [EmbeddingServiceDefault],
    accessors: true
  })
{
  /**
   * Live layer for EntityResolutionService
   */
  static readonly Live = EntityResolutionService.Default
}
