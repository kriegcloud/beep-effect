/**
 * Cached Article Repository
 *
 * Effect.Cache wrapper around ArticleRepository for frequently accessed queries.
 * Caches single article lookups with TTL.
 *
 * @since 2.0.0
 * @module Repository/CachedArticle
 */

import { Cache, Duration, Effect } from "effect"
import { ArticleRepository } from "./Article.js"
import type { ArticleId } from "./Article.js"
import type { ArticleInsertRow } from "./schema.js"

// =============================================================================
// Cache Configuration
// =============================================================================

const ARTICLE_CACHE_CAPACITY = 5_000
const ARTICLE_CACHE_TTL = Duration.hours(1)

const URI_CACHE_CAPACITY = 5_000
const URI_CACHE_TTL = Duration.hours(1)

// =============================================================================
// Service
// =============================================================================

/**
 * CachedArticleRepository service
 *
 * Wraps ArticleRepository with Effect.Cache for hot-path queries.
 * Maintains same interface as ArticleRepository.
 *
 * @since 2.0.0
 * @category Service
 */
export class CachedArticleRepository extends Effect.Service<CachedArticleRepository>()(
  "CachedArticleRepository",
  {
    effect: Effect.gen(function*() {
      const repo = yield* ArticleRepository

      // Single article lookup by ID cache
      const articleCache = yield* Cache.make({
        capacity: ARTICLE_CACHE_CAPACITY,
        timeToLive: ARTICLE_CACHE_TTL,
        lookup: (id: ArticleId) => repo.getArticle(id)
      })

      // Article lookup by URI cache
      const uriCache = yield* Cache.make({
        capacity: URI_CACHE_CAPACITY,
        timeToLive: URI_CACHE_TTL,
        lookup: (uri: string) => repo.getArticleByUri(uri)
      })

      // Cached single article lookup by ID
      const getArticle = (id: ArticleId) => articleCache.get(id)

      // Cached article lookup by URI
      const getArticleByUri = (uri: string) => uriCache.get(uri)

      // Invalidate caches on insert
      const insertArticle = (article: ArticleInsertRow) =>
        repo.insertArticle(article).pipe(
          Effect.tap((result) =>
            articleCache.invalidate(result.id).pipe(
              Effect.tap(() => uriCache.invalidate(article.uri))
            )
          )
        )

      // Invalidate caches on update
      const updateArticle = (id: ArticleId, updates: Partial<ArticleInsertRow>) =>
        repo.updateArticle(id, updates).pipe(
          Effect.tap(() =>
            articleCache.invalidate(id).pipe(
              Effect.tap(() =>
                // If URI was updated, invalidate old and new URI caches
                updates.uri ? uriCache.invalidate(updates.uri) : Effect.void
              )
            )
          )
        )

      // Invalidate caches on getOrCreate (may insert)
      const getOrCreateArticle = (article: ArticleInsertRow) =>
        repo.getOrCreateArticle(article).pipe(
          Effect.tap((result) =>
            articleCache.invalidate(result.id).pipe(
              Effect.tap(() => uriCache.invalidate(article.uri))
            )
          )
        )

      // Invalidate caches on batch insert
      const insertArticlesBatch = (articleList: Array<ArticleInsertRow>) =>
        repo.insertArticlesBatch(articleList).pipe(
          Effect.tap((results) =>
            Effect.all(
              [
                ...results.map((r) => articleCache.invalidate(r.id)),
                ...articleList.map((a) => uriCache.invalidate(a.uri))
              ],
              { concurrency: "unbounded", discard: true }
            )
          )
        )

      return {
        // Cached operations
        getArticle,
        getArticleByUri,
        insertArticle,
        updateArticle,
        getOrCreateArticle,
        insertArticlesBatch,

        // Pass-through operations (no caching)
        setGraphUri: repo.setGraphUri,
        getArticles: repo.getArticles,
        getArticlesBySource: repo.getArticlesBySource,
        getArticlesInDateRange: repo.getArticlesInDateRange,
        getRecentArticles: repo.getRecentArticles,
        countArticles: repo.countArticles,
        articleExists: repo.articleExists,

        // Cache management
        invalidateAll: () =>
          articleCache.invalidateAll.pipe(
            Effect.tap(() => uriCache.invalidateAll)
          ),
        cacheStats: () =>
          Effect.all({
            articleCacheStats: articleCache.cacheStats,
            uriCacheStats: uriCache.cacheStats
          })
      }
    }),
    dependencies: [ArticleRepository.Default],
    accessors: true
  }
) {}

/**
 * Layer that provides CachedArticleRepository
 *
 * @since 2.0.0
 * @category Layers
 */
export const CachedArticleRepositoryLayer = CachedArticleRepository.Default
