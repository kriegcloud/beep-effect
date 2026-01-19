/**
 * OntologyCache Service
 *
 * TTL-based cache for parsed ontology contexts.
 * Prevents repeated parsing of ontology files.
 *
 * @module knowledge-server/Ontology/OntologyCache
 * @since 0.1.0
 */
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Ref from "effect/Ref";
import type { ParsedOntology } from "./OntologyParser";

/**
 * Cached ontology entry with metadata
 *
 * @since 0.1.0
 * @category schemas
 */
interface CachedOntology {
  readonly data: ParsedOntology;
  readonly loadedAt: number;
  readonly contentHash: string;
}

/**
 * OntologyCache Effect.Service
 *
 * Provides caching for parsed ontologies with TTL support.
 *
 * @since 0.1.0
 * @category services
 */
export class OntologyCache extends Effect.Service<OntologyCache>()("@beep/knowledge-server/OntologyCache", {
  effect: Effect.gen(function* () {
    // Default TTL of 5 minutes
    const defaultTtl = Duration.minutes(5);
    const ttlMs = Duration.toMillis(defaultTtl);

    // Cache storage
    const cacheRef = yield* Ref.make(HashMap.empty<string, CachedOntology>());

    /**
     * Simple hash function for content
     */
    const hashContent = (content: string): string => {
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash.toString(16);
    };

    return {
      /**
       * Get cached ontology if not expired
       *
       * @param key - Cache key (typically ontology IRI or path)
       * @returns Option of cached ontology
       */
      get: Effect.fn((key: string) =>
        Effect.gen(function* () {
          const cache = yield* Ref.get(cacheRef);
          const entry = HashMap.get(cache, key);

          if (O.isNone(entry)) {
            return O.none<ParsedOntology>();
          }

          const now = Date.now();
          if (now - entry.value.loadedAt > ttlMs) {
            // Expired, remove from cache
            yield* Ref.update(cacheRef, HashMap.remove(key));
            return O.none<ParsedOntology>();
          }

          return O.some(entry.value.data);
        })
      ),

      /**
       * Get cached ontology if content hash matches
       *
       * @param key - Cache key
       * @param content - Current content to check hash against
       * @returns Option of cached ontology if hash matches
       */
      getIfValid: Effect.fn((key: string, content: string) =>
        Effect.gen(function* () {
          const cache = yield* Ref.get(cacheRef);
          const entry = HashMap.get(cache, key);

          if (O.isNone(entry)) {
            return O.none<ParsedOntology>();
          }

          const now = Date.now();
          const currentHash = hashContent(content);

          // Check both TTL and content hash
          if (now - entry.value.loadedAt > ttlMs || entry.value.contentHash !== currentHash) {
            yield* Ref.update(cacheRef, HashMap.remove(key));
            return O.none<ParsedOntology>();
          }

          return O.some(entry.value.data);
        })
      ),

      /**
       * Store ontology in cache
       *
       * @param key - Cache key
       * @param ontology - Parsed ontology to cache
       * @param content - Original content (for hash calculation)
       */
      set: Effect.fn((key: string, ontology: ParsedOntology, content: string) =>
        Effect.sync(() => {
          const entry: CachedOntology = {
            data: ontology,
            loadedAt: Date.now(),
            contentHash: hashContent(content),
          };
          return entry;
        }).pipe(Effect.tap((entry) => Ref.update(cacheRef, HashMap.set(key, entry))))
      ),

      /**
       * Remove entry from cache
       *
       * @param key - Cache key to remove
       */
      invalidate: Effect.fn((key: string) => Ref.update(cacheRef, HashMap.remove(key))),

      /**
       * Clear all cached entries
       */
      clear: Effect.fn(() => Ref.set(cacheRef, HashMap.empty<string, CachedOntology>())),

      /**
       * Get cache statistics
       */
      stats: Effect.fn(() =>
        Ref.get(cacheRef).pipe(
          Effect.map((cache) => {
            const now = Date.now();
            let total = 0;
            let expired = 0;

            for (const [_, entry] of cache) {
              total++;
              if (now - entry.loadedAt > ttlMs) {
                expired++;
              }
            }

            return {
              total,
              active: total - expired,
              expired,
            };
          })
        )
      ),
    };
  }),
  accessors: true,
}) {}
