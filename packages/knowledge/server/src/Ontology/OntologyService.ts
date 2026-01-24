/**
 * OntologyService
 *
 * High-level ontology operations combining parsing, caching, and database persistence.
 * Provides the main API for ontology management.
 *
 * @module knowledge-server/Ontology/OntologyService
 * @since 0.1.0
 */
import { Entities, ValueObjects } from "@beep/knowledge-domain";
import { KnowledgeEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Iterable from "effect/Iterable";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { OntologyCache } from "./OntologyCache";
import {
  OntologyParser,
  type ParsedClassDefinition,
  type ParsedOntology,
  type ParsedPropertyDefinition,
} from "./OntologyParser";

/**
 * OntologyContext represents a fully loaded ontology with lookup capabilities
 *
 * @since 0.1.0
 * @category schemas
 */
export interface OntologyContext {
  readonly classes: ReadonlyArray<ParsedClassDefinition>;
  readonly properties: ReadonlyArray<ParsedPropertyDefinition>;
  readonly classHierarchy: Record<string, ReadonlyArray<string>>;
  readonly propertyHierarchy: Record<string, ReadonlyArray<string>>;

  /**
   * Get properties applicable to a class (by domain)
   */
  getPropertiesForClass(classIri: string): ReadonlyArray<ParsedPropertyDefinition>;

  /**
   * Check if a class is a subclass of another (using rdfs:subClassOf)
   */
  isSubClassOf(childIri: string, parentIri: string): boolean;

  /**
   * Get all ancestor classes (transitive rdfs:subClassOf)
   */
  getAncestors(classIri: string): ReadonlyArray<string>;

  /**
   * Find class by IRI
   */
  findClass(iri: string): O.Option<ParsedClassDefinition>;

  /**
   * Find property by IRI
   */
  findProperty(iri: string): O.Option<ParsedPropertyDefinition>;
}

/**
 * Create OntologyContext from parsed ontology
 */
const createOntologyContext = (parsed: ParsedOntology): OntologyContext => {
  // Build lookup maps
  const classMap = MutableHashMap.empty<string, ParsedClassDefinition>();
  for (const cls of parsed.classes) {
    MutableHashMap.set(classMap, cls.iri, cls);
  }

  const propertyMap = MutableHashMap.empty<string, ParsedPropertyDefinition>();
  for (const prop of parsed.properties) {
    MutableHashMap.set(propertyMap, prop.iri, prop);
  }

  // Build class -> properties index
  const classPropertiesMap = MutableHashMap.empty<string, ParsedPropertyDefinition[]>();
  for (const prop of parsed.properties) {
    for (const domainIri of prop.domain) {
      if (!MutableHashMap.has(classPropertiesMap, domainIri)) {
        MutableHashMap.set(classPropertiesMap, domainIri, []);
      }
      O.getOrThrow(MutableHashMap.get(classPropertiesMap, domainIri)).push(prop);
    }
  }

  // Memoized ancestor computation
  const ancestorCache = MutableHashMap.empty<string, MutableHashSet.MutableHashSet<string>>();

  const getAncestorsSet = (
    classIri: string,
    visited: MutableHashSet.MutableHashSet<string> = MutableHashSet.empty<string>()
  ): MutableHashSet.MutableHashSet<string> => {
    const cachedOpt = MutableHashMap.get(ancestorCache, classIri);
    if (O.isSome(cachedOpt)) {
      return cachedOpt.value;
    }

    if (MutableHashSet.has(visited, classIri)) {
      return MutableHashSet.empty<string>(); // Cycle detection
    }

    MutableHashSet.add(visited, classIri);
    const ancestors = MutableHashSet.empty<string>();
    const parents = parsed.classHierarchy[classIri] ?? [];

    for (const parentIri of parents) {
      MutableHashSet.add(ancestors, parentIri);
      const parentAncestors = getAncestorsSet(parentIri, visited);
      Iterable.forEach(parentAncestors, (ancestor) => {
        MutableHashSet.add(ancestors, ancestor);
      });
    }

    MutableHashMap.set(ancestorCache, classIri, ancestors);
    return ancestors;
  };

  return {
    classes: parsed.classes,
    properties: parsed.properties,
    classHierarchy: parsed.classHierarchy,
    propertyHierarchy: parsed.propertyHierarchy,

    getPropertiesForClass(classIri: string): ReadonlyArray<ParsedPropertyDefinition> {
      const directProps = O.getOrElse(
        MutableHashMap.get(classPropertiesMap, classIri),
        A.empty<ParsedPropertyDefinition>
      );

      // Include properties from ancestor classes
      const ancestors = getAncestorsSet(classIri);
      const inheritedProps = A.empty<ParsedPropertyDefinition>();
      Iterable.forEach(ancestors, (ancestorIri) => {
        const ancestorProps = O.getOrElse(
          MutableHashMap.get(classPropertiesMap, ancestorIri),
          A.empty<ParsedPropertyDefinition>
        );
        inheritedProps.push(...ancestorProps);
      });

      // Deduplicate by IRI
      const allPropsMap = MutableHashMap.empty<string, ParsedPropertyDefinition>();
      for (const prop of [...directProps, ...inheritedProps]) {
        MutableHashMap.set(allPropsMap, prop.iri, prop);
      }

      const result = A.empty<ParsedPropertyDefinition>();
      MutableHashMap.forEach(allPropsMap, (prop) => {
        result.push(prop);
      });
      return result;
    },

    isSubClassOf(childIri: string, parentIri: string): boolean {
      if (childIri === parentIri) return true;
      const ancestors = getAncestorsSet(childIri);
      return MutableHashSet.has(ancestors, parentIri);
    },

    getAncestors(classIri: string): ReadonlyArray<string> {
      return A.fromIterable(getAncestorsSet(classIri));
    },

    findClass(iri: string): O.Option<ParsedClassDefinition> {
      return MutableHashMap.get(classMap, iri);
    },

    findProperty(iri: string): O.Option<ParsedPropertyDefinition> {
      return MutableHashMap.get(propertyMap, iri);
    },
  };
};

/**
 * OntologyService Effect.Service
 *
 * Main API for ontology operations.
 *
 * @since 0.1.0
 * @category services
 */
export class OntologyService extends Effect.Service<OntologyService>()("@beep/knowledge-server/OntologyService", {
  effect: Effect.gen(function* () {
    const parser = yield* OntologyParser;
    const cache = yield* OntologyCache;

    return {
      /**
       * Parse ontology content and return OntologyContext
       *
       * Uses caching to avoid repeated parsing.
       *
       * @param key - Cache key (e.g., ontology path or IRI)
       * @param content - Turtle/RDF content
       * @returns OntologyContext with lookup methods
       */
      load: Effect.fn((key: string, content: string) =>
        Effect.gen(function* () {
          // Check cache first
          const cached = yield* cache.getIfValid(key, content);
          if (O.isSome(cached)) {
            yield* Effect.logDebug("Using cached ontology", { key });
            return createOntologyContext(cached.value);
          }

          // Parse and cache
          yield* Effect.logInfo("Parsing ontology", { key, contentLength: content.length });
          const parsed = yield* parser.parse(content);

          yield* cache.set(key, parsed, content);

          yield* Effect.logInfo("Ontology loaded", {
            key,
            classCount: parsed.classes.length,
            propertyCount: parsed.properties.length,
          });

          return createOntologyContext(parsed);
        })
      ),

      /**
       * Parse ontology with external vocabulary content
       *
       * @param key - Cache key
       * @param content - Main ontology content
       * @param externalContent - External vocabulary content to merge
       * @returns OntologyContext with merged vocabularies
       */
      loadWithExternal: Effect.fn((key: string, content: string, externalContent: string) =>
        Effect.gen(function* () {
          const combinedKey = `${key}:with-external`;

          // Check cache first
          const cached = yield* cache.getIfValid(combinedKey, content + externalContent);
          if (O.isSome(cached)) {
            yield* Effect.logDebug("Using cached ontology with externals", { key });
            return createOntologyContext(cached.value);
          }

          // Parse with externals
          yield* Effect.logInfo("Parsing ontology with external vocabularies", { key });
          const parsed = yield* parser.parseWithExternal(content, externalContent);

          yield* cache.set(combinedKey, parsed, content + externalContent);

          yield* Effect.logInfo("Ontology with externals loaded", {
            key,
            classCount: parsed.classes.length,
            propertyCount: parsed.properties.length,
          });

          return createOntologyContext(parsed);
        })
      ),

      /**
       * Convert parsed class to domain model insert data
       *
       * @param organizationId - Organization ID
       * @param ontologyId - Ontology ID
       * @param parsed - Parsed class definition
       * @returns Insert-ready model data
       */
      toClassInsert: (
        organizationId: SharedEntityIds.OrganizationId.Type,
        ontologyId: KnowledgeEntityIds.OntologyId.Type,
        parsed: ParsedClassDefinition
      ) =>
        Effect.sync(() => {
          const id = KnowledgeEntityIds.ClassDefinitionId.create();

          return Entities.ClassDefinition.Model.insert.make({
            id,
            organizationId,
            ontologyId,
            iri: ValueObjects.makeClassIri(parsed.iri),
            label: parsed.label,
            localName: O.some(parsed.localName),
            comment: parsed.comment,
            properties: O.some(parsed.properties),
            prefLabels: O.some(parsed.prefLabels),
            altLabels: O.some(parsed.altLabels),
            hiddenLabels: O.some(parsed.hiddenLabels),
            definition: parsed.definition,
            scopeNote: parsed.scopeNote,
            example: parsed.example,
            broader: O.some(parsed.broader),
            narrower: O.some(parsed.narrower),
            related: O.some(parsed.related),
            equivalentClass: O.some(parsed.equivalentClass),
            exactMatch: O.some(parsed.exactMatch),
            closeMatch: O.some(parsed.closeMatch),
          });
        }),

      /**
       * Convert parsed property to domain model insert data
       *
       * @param organizationId - Organization ID
       * @param ontologyId - Ontology ID
       * @param parsed - Parsed property definition
       * @returns Insert-ready model data
       */
      toPropertyInsert: (
        organizationId: SharedEntityIds.OrganizationId.Type,
        ontologyId: KnowledgeEntityIds.OntologyId.Type,
        parsed: ParsedPropertyDefinition
      ) =>
        Effect.sync(() => {
          const id = KnowledgeEntityIds.PropertyDefinitionId.create();

          return Entities.PropertyDefinition.Model.insert.make({
            id,
            organizationId,
            ontologyId,
            iri: ValueObjects.makeClassIri(parsed.iri),
            label: parsed.label,
            localName: O.some(parsed.localName),
            comment: parsed.comment,
            domain: O.some(parsed.domain),
            range: O.some(parsed.range),
            rangeType: parsed.rangeType,
            isFunctional: parsed.isFunctional,
            inverseOf: O.some(parsed.inverseOf),
            prefLabels: O.some(parsed.prefLabels),
            altLabels: O.some(parsed.altLabels),
            hiddenLabels: O.some(parsed.hiddenLabels),
            definition: parsed.definition,
            scopeNote: parsed.scopeNote,
            example: parsed.example,
            broader: O.some(parsed.broader),
            narrower: O.some(parsed.narrower),
            related: O.some(parsed.related),
            exactMatch: O.some(parsed.exactMatch),
            closeMatch: O.some(parsed.closeMatch),
          });
        }),

      /**
       * Search classes by label (simple text match)
       *
       * @param context - OntologyContext
       * @param query - Search query
       * @param limit - Max results
       * @returns Matching classes
       */
      searchClasses: (context: OntologyContext, query: string, limit = 10) =>
        Effect.sync(() => {
          const lowerQuery = Str.toLowerCase(query);

          return A.take(
            A.filter(context.classes, (cls) => {
              // Search in label, prefLabels, altLabels
              if (F.pipe(cls.label, Str.toLowerCase, Str.includes(lowerQuery))) return true;
              if (A.some(cls.prefLabels, (l) => F.pipe(l, Str.toLowerCase, Str.includes(lowerQuery)))) return true;
              return !!A.some(cls.altLabels, (l) => F.pipe(l, Str.toLowerCase, Str.includes(lowerQuery)));
            }),
            limit
          );
        }),

      /**
       * Search properties by label (simple text match)
       *
       * @param context - OntologyContext
       * @param query - Search query
       * @param limit - Max results
       * @returns Matching properties
       */
      searchProperties: (context: OntologyContext, query: string, limit = 10) =>
        Effect.sync(() => {
          const lowerQuery = Str.toLowerCase(query);

          return A.take(
            A.filter(context.properties, (prop) => {
              // Search in label, prefLabels, altLabels
              if (F.pipe(prop.label, Str.toLowerCase, Str.includes(lowerQuery))) return true;
              if (A.some(prop.prefLabels, (l) => F.pipe(l, Str.toLowerCase, Str.includes(lowerQuery)))) return true;
              return !!A.some(prop.altLabels, (l) => F.pipe(l, Str.toLowerCase, Str.includes(lowerQuery)));
            }),
            limit
          );
        }),

      /**
       * Invalidate cached ontology
       *
       * @param key - Cache key to invalidate
       */
      invalidateCache: cache.invalidate,

      /**
       * Clear all cached ontologies
       */
      clearCache: cache.clear,

      /**
       * Get cache statistics
       */
      getCacheStats: cache.stats,
    };
  }),
  dependencies: [OntologyParser.Default, OntologyCache.Default],
  accessors: true,
}) {}

/**
 * Default layer for OntologyService with all dependencies
 *
 * @since 0.1.0
 * @category layers
 */
export const OntologyServiceLive = Layer.mergeAll(
  OntologyParser.Default,
  OntologyCache.Default,
  OntologyService.Default
);
