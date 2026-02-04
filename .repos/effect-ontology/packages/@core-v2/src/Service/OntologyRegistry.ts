/**
 * Service: Ontology Registry
 *
 * Loads and queries the ontology registry (registry.json) from storage.
 * Enables multi-ontology deployments where requests can specify their own ontology.
 *
 * The registry provides:
 * - Ontology metadata (IRI, version, paths)
 * - Resolution of ontology URIs to storage paths
 * - Validation that required files exist
 *
 * @since 2.0.0
 * @module Service/OntologyRegistry
 */

import { Effect, Option, Schema } from "effect"
import type { OntologyRegistry } from "../Domain/Schema/OntologyRegistry.js"
import { OntologyRegistryJson } from "../Domain/Schema/OntologyRegistry.js"
import { ConfigService, ConfigServiceDefault } from "./Config.js"
import { StorageService } from "./Storage.js"

/**
 * Error types for registry operations
 *
 * @since 2.0.0
 * @category Errors
 */
export class RegistryNotFoundError {
  readonly _tag = "RegistryNotFoundError"
  constructor(readonly path: string) {}
}

export class RegistryParseError {
  readonly _tag = "RegistryParseError"
  constructor(
    readonly path: string,
    readonly cause: unknown
  ) {}
}

export class OntologyNotFoundError {
  readonly _tag = "OntologyNotFoundError"
  constructor(
    readonly identifier: string,
    readonly type: "id" | "iri"
  ) {}
}

export type RegistryError = RegistryNotFoundError | RegistryParseError | OntologyNotFoundError

/**
 * Default path to registry.json in storage
 */
const DEFAULT_REGISTRY_PATH = "registry.json"

/**
 * OntologyRegistryService - Load and query the ontology registry
 *
 * Provides methods to:
 * - Load registry from storage
 * - Look up ontologies by ID or IRI
 * - Resolve ontology URIs to storage paths
 *
 * @since 2.0.0
 * @category Services
 */
export class OntologyRegistryService extends Effect.Service<OntologyRegistryService>()(
  "OntologyRegistryService",
  {
    effect: Effect.gen(function*() {
      const storage = yield* StorageService
      const config = yield* ConfigService

      // Registry path from config or default
      const registryPath = Option.getOrElse(
        config.ontology.registryPath,
        () => DEFAULT_REGISTRY_PATH
      )

      // Cache the loaded registry
      let cachedRegistry: OntologyRegistry | null = null

      /**
       * Load the registry from storage
       */
      const loadRegistry = Effect.gen(function*() {
        if (cachedRegistry) {
          return cachedRegistry
        }

        yield* Effect.logInfo("Loading ontology registry", { path: registryPath })

        const contentOpt = yield* storage.get(registryPath).pipe(
          Effect.mapError(() => new RegistryNotFoundError(registryPath))
        )

        if (Option.isNone(contentOpt)) {
          return yield* Effect.fail(new RegistryNotFoundError(registryPath))
        }

        const registry = yield* Schema.decode(OntologyRegistryJson)(contentOpt.value).pipe(
          Effect.mapError((cause) => new RegistryParseError(registryPath, cause))
        )

        yield* Effect.logInfo("Ontology registry loaded", {
          version: registry.version,
          ontologyCount: registry.ontologies.length,
          ontologies: registry.ontologies.map((o) => o.id)
        })

        cachedRegistry = registry
        return registry
      })

      /**
       * Get ontology entry by short ID (e.g., "seattle")
       */
      const getById = (id: string) =>
        Effect.gen(function*() {
          const registry = yield* loadRegistry
          const entry = registry.ontologies.find((o) => o.id === id)
          return Option.fromNullable(entry)
        })

      /**
       * Get ontology entry by IRI (e.g., "http://effect-ontology.dev/seattle")
       */
      const getByIri = (iri: string) =>
        Effect.gen(function*() {
          const registry = yield* loadRegistry
          const entry = registry.ontologies.find((o) => o.iri === iri)
          return Option.fromNullable(entry)
        })

      /**
       * Resolve an ontology URI to its storage path
       *
       * Accepts:
       * - Full IRI: "http://effect-ontology.dev/seattle" -> looks up in registry
       * - Short ID: "seattle" -> looks up in registry
       * - Direct path: "canonical/seattle/ontology.ttl" -> returns as-is
       * - GCS URI: "gs://bucket/path" -> strips prefix, returns path
       */
      const resolveToPath = (uri: string) =>
        Effect.gen(function*() {
          // Direct GCS path - strip prefix
          if (uri.startsWith("gs://")) {
            return uri.replace(/^gs:\/\/[^/]+\//, "")
          }

          // Direct storage path (contains slash or ends in .ttl/.owl)
          if (uri.includes("/") || uri.endsWith(".ttl") || uri.endsWith(".owl")) {
            return uri
          }

          // Try as IRI first
          if (uri.startsWith("http")) {
            const entry = yield* getByIri(uri)
            if (Option.isSome(entry)) {
              return entry.value.storagePath
            }
            return yield* Effect.fail(new OntologyNotFoundError(uri, "iri"))
          }

          // Try as short ID
          const entry = yield* getById(uri)
          if (Option.isSome(entry)) {
            return entry.value.storagePath
          }

          return yield* Effect.fail(new OntologyNotFoundError(uri, "id"))
        })

      /**
       * Resolve an ontology URI to its full entry (if in registry)
       */
      const resolveToEntry = (uri: string) =>
        Effect.gen(function*() {
          // Try as IRI first
          if (uri.startsWith("http")) {
            return yield* getByIri(uri)
          }

          // Try as short ID (if no slashes)
          if (!uri.includes("/")) {
            return yield* getById(uri)
          }

          // Direct path - look up by storagePath
          const registry = yield* loadRegistry
          const entry = registry.ontologies.find((o) => o.storagePath === uri)
          return Option.fromNullable(entry)
        })

      /**
       * List all available ontologies
       */
      const list = Effect.gen(function*() {
        const registry = yield* loadRegistry
        return registry.ontologies
      })

      /**
       * Clear the cached registry (for testing or forced refresh)
       */
      const clearCache = Effect.sync(() => {
        cachedRegistry = null
      })

      return {
        loadRegistry,
        getById,
        getByIri,
        resolveToPath,
        resolveToEntry,
        list,
        clearCache
      }
    }),
    dependencies: [
      ConfigServiceDefault
      // StorageService provided by parent scope (runtime-selected storage type)
    ],
    accessors: true
  }
) {}
