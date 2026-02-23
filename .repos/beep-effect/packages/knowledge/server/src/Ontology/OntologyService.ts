import { $KnowledgeServerId } from "@beep/identity/packages";
import { Entities, ValueObjects } from "@beep/knowledge-domain";
import { KnowledgeEntityIds, type SharedEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Iterable from "effect/Iterable";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { OntologyCache, OntologyCacheLive } from "./OntologyCache";
import {
  OntologyParser,
  OntologyParserLive,
  ParsedClassDefinition,
  type ParsedOntology,
  ParsedPropertyDefinition,
} from "./OntologyParser";

const $I = $KnowledgeServerId.create("Ontology/OntologyService");

const HierarchySchema = S.Record({ key: S.String, value: S.Array(S.String) });

export class OntologyContext extends S.Class<OntologyContext>($I`OntologyContext`)({
  classes: S.Array(ParsedClassDefinition),
  properties: S.Array(ParsedPropertyDefinition),
  classHierarchy: HierarchySchema,
  propertyHierarchy: HierarchySchema,
}) {
  // Effect Schema classes must not override the constructor; derived caches are initialized here.
  private readonly classMap = (() => {
    const map = MutableHashMap.empty<string, ParsedClassDefinition>();
    for (const cls of this.classes) {
      MutableHashMap.set(map, cls.iri, cls);
    }
    return map;
  })();

  private readonly propertyMap = (() => {
    const map = MutableHashMap.empty<string, ParsedPropertyDefinition>();
    for (const prop of this.properties) {
      MutableHashMap.set(map, prop.iri, prop);
    }
    return map;
  })();

  private readonly classPropertiesMap = (() => {
    const map = MutableHashMap.empty<string, Array<ParsedPropertyDefinition>>();
    for (const prop of this.properties) {
      for (const domainIri of prop.domain) {
        if (!MutableHashMap.has(map, domainIri)) {
          MutableHashMap.set(map, domainIri, []);
        }
        O.getOrThrow(MutableHashMap.get(map, domainIri)).push(prop);
      }
    }
    return map;
  })();

  private readonly ancestorCache = MutableHashMap.empty<string, MutableHashSet.MutableHashSet<string>>();

  private readonly getAncestorsSet = (
    classIri: string,
    visited: MutableHashSet.MutableHashSet<string> = MutableHashSet.empty<string>()
  ): MutableHashSet.MutableHashSet<string> => {
    const cachedOpt = MutableHashMap.get(this.ancestorCache, classIri);
    if (O.isSome(cachedOpt)) {
      return cachedOpt.value;
    }

    if (MutableHashSet.has(visited, classIri)) {
      return MutableHashSet.empty<string>();
    }

    MutableHashSet.add(visited, classIri);
    const ancestors = MutableHashSet.empty<string>();
    const parents = this.classHierarchy[classIri] ?? [];

    for (const parentIri of parents) {
      MutableHashSet.add(ancestors, parentIri);
      const parentAncestors = this.getAncestorsSet(parentIri, visited);
      Iterable.forEach(parentAncestors, (ancestor) => {
        MutableHashSet.add(ancestors, ancestor);
      });
    }

    MutableHashMap.set(this.ancestorCache, classIri, ancestors);
    return ancestors;
  };

  getPropertiesForClass(classIri: string): ReadonlyArray<ParsedPropertyDefinition> {
    const directProps = O.getOrElse(
      MutableHashMap.get(this.classPropertiesMap, classIri),
      A.empty<ParsedPropertyDefinition>
    );

    const ancestors = this.getAncestorsSet(classIri);
    const inheritedProps = A.empty<ParsedPropertyDefinition>();
    Iterable.forEach(ancestors, (ancestorIri) => {
      const ancestorProps = O.getOrElse(
        MutableHashMap.get(this.classPropertiesMap, ancestorIri),
        A.empty<ParsedPropertyDefinition>
      );
      inheritedProps.push(...ancestorProps);
    });

    const allPropsMap = MutableHashMap.empty<string, ParsedPropertyDefinition>();
    for (const prop of [...directProps, ...inheritedProps]) {
      MutableHashMap.set(allPropsMap, prop.iri, prop);
    }

    const result = A.empty<ParsedPropertyDefinition>();
    MutableHashMap.forEach(allPropsMap, (prop) => {
      result.push(prop);
    });
    return result;
  }

  isSubClassOf(childIri: string, parentIri: string): boolean {
    if (childIri === parentIri) return true;
    return MutableHashSet.has(this.getAncestorsSet(childIri), parentIri);
  }

  getAncestors(classIri: string): ReadonlyArray<string> {
    return A.fromIterable(this.getAncestorsSet(classIri));
  }

  findClass(iri: string): O.Option<ParsedClassDefinition> {
    return MutableHashMap.get(this.classMap, iri);
  }

  findProperty(iri: string): O.Option<ParsedPropertyDefinition> {
    return MutableHashMap.get(this.propertyMap, iri);
  }
}

const createOntologyContext = (parsed: ParsedOntology): OntologyContext =>
  new OntologyContext({
    classes: parsed.classes,
    properties: parsed.properties,
    classHierarchy: parsed.classHierarchy,
    propertyHierarchy: parsed.propertyHierarchy,
  });

export interface OntologyServiceShape {
  readonly load: (
    key: string,
    content: string
  ) => Effect.Effect<OntologyContext, import("@beep/knowledge-domain/errors").OntologyParseError>;
  readonly loadWithExternal: (
    key: string,
    content: string,
    externalContent: string
  ) => Effect.Effect<OntologyContext, import("@beep/knowledge-domain/errors").OntologyParseError>;
  readonly toClassInsert: (
    organizationId: SharedEntityIds.OrganizationId.Type,
    ontologyId: KnowledgeEntityIds.OntologyId.Type,
    parsed: ParsedClassDefinition
  ) => Effect.Effect<typeof Entities.ClassDefinition.Model.insert.Type>;
  readonly toPropertyInsert: (
    organizationId: SharedEntityIds.OrganizationId.Type,
    ontologyId: KnowledgeEntityIds.OntologyId.Type,
    parsed: ParsedPropertyDefinition
  ) => Effect.Effect<typeof Entities.PropertyDefinition.Model.insert.Type>;
  readonly searchClasses: (
    context: OntologyContext,
    query: string,
    limit?: number
  ) => Effect.Effect<ReadonlyArray<ParsedClassDefinition>>;
  readonly searchProperties: (
    context: OntologyContext,
    query: string,
    limit?: number
  ) => Effect.Effect<ReadonlyArray<ParsedPropertyDefinition>>;
  readonly invalidateCache: (key: string) => Effect.Effect<void>;
  readonly clearCache: () => Effect.Effect<void>;
  readonly getCacheStats: () => Effect.Effect<{
    readonly total: number;
    readonly active: number;
    readonly expired: number;
  }>;
}

export class OntologyService extends Context.Tag($I`OntologyService`)<OntologyService, OntologyServiceShape>() {}

const serviceEffect: Effect.Effect<OntologyServiceShape, never, OntologyParser | OntologyCache> = Effect.gen(
  function* () {
    const parser = yield* OntologyParser;
    const cache = yield* OntologyCache;

    return OntologyService.of({
      load: Effect.fn("OntologyService.load")((key: string, content: string) =>
        Effect.gen(function* () {
          const cached = yield* cache.getIfValid(key, content);
          if (O.isSome(cached)) {
            yield* Effect.logDebug("Using cached ontology").pipe(Effect.annotateLogs({ key }));
            return createOntologyContext(cached.value);
          }

          yield* Effect.logInfo("Parsing ontology").pipe(
            Effect.annotateLogs({ key, contentLength: Str.length(content) })
          );
          const parsed = yield* parser.parse(content);

          yield* cache.set(key, parsed, content);

          yield* Effect.logInfo("Ontology loaded").pipe(
            Effect.annotateLogs({
              key,
              classCount: A.length(parsed.classes),
              propertyCount: A.length(parsed.properties),
            })
          );

          return createOntologyContext(parsed);
        }).pipe(Effect.withSpan("OntologyService.load", { attributes: { key } }))
      ),

      loadWithExternal: Effect.fn("OntologyService.loadWithExternal")(
        (key: string, content: string, externalContent: string) =>
          Effect.gen(function* () {
            const combinedKey = `${key}:with-external`;
            const combinedContent = content + externalContent;

            const cached = yield* cache.getIfValid(combinedKey, combinedContent);
            if (O.isSome(cached)) {
              yield* Effect.logDebug("Using cached ontology with externals").pipe(Effect.annotateLogs({ key }));
              return createOntologyContext(cached.value);
            }

            yield* Effect.logInfo("Parsing ontology with external vocabularies").pipe(Effect.annotateLogs({ key }));
            const parsed = yield* parser.parseWithExternal(content, externalContent);

            yield* cache.set(combinedKey, parsed, combinedContent);

            yield* Effect.logInfo("Ontology with externals loaded").pipe(
              Effect.annotateLogs({
                key,
                classCount: A.length(parsed.classes),
                propertyCount: A.length(parsed.properties),
              })
            );

            return createOntologyContext(parsed);
          }).pipe(Effect.withSpan("OntologyService.loadWithExternal", { attributes: { key } }))
      ),

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
            iri: ValueObjects.ClassIri.make(parsed.iri),
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
            iri: ValueObjects.ClassIri.make(parsed.iri),
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

      searchClasses: (context: OntologyContext, query: string, limit = 10) =>
        Effect.sync(() => {
          const lowerQuery = Str.toLowerCase(query);

          return F.pipe(
            context.classes,
            A.filter((cls) => {
              if (F.pipe(cls.label, Str.toLowerCase, Str.includes(lowerQuery))) return true;
              if (A.some(cls.prefLabels, (l) => F.pipe(l, Str.toLowerCase, Str.includes(lowerQuery)))) return true;
              return A.some(cls.altLabels, (l) => F.pipe(l, Str.toLowerCase, Str.includes(lowerQuery)));
            }),
            A.take(limit)
          );
        }),

      searchProperties: (context: OntologyContext, query: string, limit = 10) =>
        Effect.sync(() => {
          const lowerQuery = Str.toLowerCase(query);

          return F.pipe(
            context.properties,
            A.filter((prop) => {
              if (F.pipe(prop.label, Str.toLowerCase, Str.includes(lowerQuery))) return true;
              if (A.some(prop.prefLabels, (l) => F.pipe(l, Str.toLowerCase, Str.includes(lowerQuery)))) return true;
              return A.some(prop.altLabels, (l) => F.pipe(l, Str.toLowerCase, Str.includes(lowerQuery)));
            }),
            A.take(limit)
          );
        }),

      invalidateCache: cache.invalidate,

      clearCache: cache.clear,

      getCacheStats: cache.stats,
    });
  }
);

export const OntologyServiceLive = Layer.effect(OntologyService, serviceEffect).pipe(
  Layer.provide(Layer.mergeAll(OntologyParserLive, OntologyCacheLive))
);

export const OntologyFullLive = Layer.mergeAll(OntologyParserLive, OntologyCacheLive, OntologyServiceLive);
