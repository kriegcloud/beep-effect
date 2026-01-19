/**
 * OntologyService
 *
 * High-level ontology operations combining parsing, caching, and database persistence.
 * Provides the main API for ontology management.
 *
 * @module knowledge-server/Ontology/OntologyService
 * @since 0.1.0
 */
import { Entities } from "@beep/knowledge-domain";
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import { OntologyCache } from "./OntologyCache";
import { OntologyParser, type ParsedClassDefinition, type ParsedOntology, type ParsedPropertyDefinition } from "./OntologyParser";

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
  const classMap = new Map<string, ParsedClassDefinition>();
  for (const cls of parsed.classes) {
    classMap.set(cls.iri, cls);
  }

  const propertyMap = new Map<string, ParsedPropertyDefinition>();
  for (const prop of parsed.properties) {
    propertyMap.set(prop.iri, prop);
  }

  // Build class -> properties index
  const classPropertiesMap = new Map<string, ParsedPropertyDefinition[]>();
  for (const prop of parsed.properties) {
    for (const domainIri of prop.domain) {
      if (!classPropertiesMap.has(domainIri)) {
        classPropertiesMap.set(domainIri, []);
      }
      classPropertiesMap.get(domainIri)!.push(prop);
    }
  }

  // Memoized ancestor computation
  const ancestorCache = new Map<string, Set<string>>();

  const getAncestorsSet = (classIri: string, visited: Set<string> = new Set()): Set<string> => {
    if (ancestorCache.has(classIri)) {
      return ancestorCache.get(classIri)!;
    }

    if (visited.has(classIri)) {
      return new Set(); // Cycle detection
    }

    visited.add(classIri);
    const ancestors = new Set<string>();
    const parents = parsed.classHierarchy[classIri] ?? [];

    for (const parentIri of parents) {
      ancestors.add(parentIri);
      const parentAncestors = getAncestorsSet(parentIri, visited);
      for (const ancestor of parentAncestors) {
        ancestors.add(ancestor);
      }
    }

    ancestorCache.set(classIri, ancestors);
    return ancestors;
  };

  return {
    classes: parsed.classes,
    properties: parsed.properties,
    classHierarchy: parsed.classHierarchy,
    propertyHierarchy: parsed.propertyHierarchy,

    getPropertiesForClass(classIri: string): ReadonlyArray<ParsedPropertyDefinition> {
      const directProps = classPropertiesMap.get(classIri) ?? [];

      // Include properties from ancestor classes
      const ancestors = getAncestorsSet(classIri);
      const inheritedProps: ParsedPropertyDefinition[] = [];
      for (const ancestorIri of ancestors) {
        const ancestorProps = classPropertiesMap.get(ancestorIri) ?? [];
        inheritedProps.push(...ancestorProps);
      }

      // Deduplicate by IRI
      const allPropsMap = new Map<string, ParsedPropertyDefinition>();
      for (const prop of [...directProps, ...inheritedProps]) {
        allPropsMap.set(prop.iri, prop);
      }

      return Array.from(allPropsMap.values());
    },

    isSubClassOf(childIri: string, parentIri: string): boolean {
      if (childIri === parentIri) return true;
      const ancestors = getAncestorsSet(childIri);
      return ancestors.has(parentIri);
    },

    getAncestors(classIri: string): ReadonlyArray<string> {
      return Array.from(getAncestorsSet(classIri));
    },

    findClass(iri: string): O.Option<ParsedClassDefinition> {
      const cls = classMap.get(iri);
      return cls ? O.some(cls) : O.none();
    },

    findProperty(iri: string): O.Option<ParsedPropertyDefinition> {
      const prop = propertyMap.get(iri);
      return prop ? O.some(prop) : O.none();
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
      load: (key: string, content: string) =>
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
        }),

      /**
       * Parse ontology with external vocabulary content
       *
       * @param key - Cache key
       * @param content - Main ontology content
       * @param externalContent - External vocabulary content to merge
       * @returns OntologyContext with merged vocabularies
       */
      loadWithExternal: (key: string, content: string, externalContent: string) =>
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
        }),

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
          const id = KnowledgeEntityIds.ClassDefinitionId.make(
            `knowledge_class_definition__${crypto.randomUUID()}`
          );

          return Entities.ClassDefinition.Model.insert.make({
            id,
            organizationId,
            ontologyId,
            iri: parsed.iri,
            label: parsed.label,
            localName: O.some(parsed.localName),
            comment: parsed.comment,
            properties: O.some(parsed.properties as string[]),
            prefLabels: O.some(parsed.prefLabels as string[]),
            altLabels: O.some(parsed.altLabels as string[]),
            hiddenLabels: O.some(parsed.hiddenLabels as string[]),
            definition: parsed.definition,
            scopeNote: parsed.scopeNote,
            example: parsed.example,
            broader: O.some(parsed.broader as string[]),
            narrower: O.some(parsed.narrower as string[]),
            related: O.some(parsed.related as string[]),
            equivalentClass: O.some(parsed.equivalentClass as string[]),
            exactMatch: O.some(parsed.exactMatch as string[]),
            closeMatch: O.some(parsed.closeMatch as string[]),
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
          const id = KnowledgeEntityIds.PropertyDefinitionId.make(
            `knowledge_property_definition__${crypto.randomUUID()}`
          );

          return Entities.PropertyDefinition.Model.insert.make({
            id,
            organizationId,
            ontologyId,
            iri: parsed.iri,
            label: parsed.label,
            localName: O.some(parsed.localName),
            comment: parsed.comment,
            domain: O.some(parsed.domain as string[]),
            range: O.some(parsed.range as string[]),
            rangeType: parsed.rangeType,
            isFunctional: parsed.isFunctional,
            inverseOf: O.some(parsed.inverseOf as string[]),
            prefLabels: O.some(parsed.prefLabels as string[]),
            altLabels: O.some(parsed.altLabels as string[]),
            hiddenLabels: O.some(parsed.hiddenLabels as string[]),
            definition: parsed.definition,
            scopeNote: parsed.scopeNote,
            example: parsed.example,
            broader: O.some(parsed.broader as string[]),
            narrower: O.some(parsed.narrower as string[]),
            related: O.some(parsed.related as string[]),
            exactMatch: O.some(parsed.exactMatch as string[]),
            closeMatch: O.some(parsed.closeMatch as string[]),
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
      searchClasses: (context: OntologyContext, query: string, limit: number = 10) =>
        Effect.sync(() => {
          const lowerQuery = query.toLowerCase();

          return A.take(
            A.filter(context.classes, (cls) => {
              // Search in label, prefLabels, altLabels
              if (cls.label.toLowerCase().includes(lowerQuery)) return true;
              if (A.some(cls.prefLabels, (l) => l.toLowerCase().includes(lowerQuery))) return true;
              if (A.some(cls.altLabels, (l) => l.toLowerCase().includes(lowerQuery))) return true;
              return false;
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
      searchProperties: (context: OntologyContext, query: string, limit: number = 10) =>
        Effect.sync(() => {
          const lowerQuery = query.toLowerCase();

          return A.take(
            A.filter(context.properties, (prop) => {
              // Search in label, prefLabels, altLabels
              if (prop.label.toLowerCase().includes(lowerQuery)) return true;
              if (A.some(prop.prefLabels, (l) => l.toLowerCase().includes(lowerQuery))) return true;
              if (A.some(prop.altLabels, (l) => l.toLowerCase().includes(lowerQuery))) return true;
              return false;
            }),
            limit
          );
        }),

      /**
       * Invalidate cached ontology
       *
       * @param key - Cache key to invalidate
       */
      invalidateCache: (key: string) => cache.invalidate(key),

      /**
       * Clear all cached ontologies
       */
      clearCache: () => cache.clear(),

      /**
       * Get cache statistics
       */
      getCacheStats: () => cache.stats(),
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
