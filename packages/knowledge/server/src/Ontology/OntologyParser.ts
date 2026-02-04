/**
 * OntologyParser Service
 *
 * N3.js-based parser for OWL/RDFS ontology files.
 * Parses Turtle/RDF-XML content and extracts class and property definitions.
 *
 * @module knowledge-server/Ontology/OntologyParser
 * @since 0.1.0
 */
import { $KnowledgeServerId } from "@beep/identity/packages";
import { OntologyParseError } from "@beep/knowledge-domain/errors";
import { thunkEmptyStr } from "@beep/utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Iterable from "effect/Iterable";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Str from "effect/String";
import * as N3 from "n3";
import { extractLocalName, OWL, RDF, RDFS, SKOS } from "./constants";

const $I = $KnowledgeServerId.create("Ontology/OntologyParser");
/**
 * Parsed class definition (pre-database)
 *
 * @since 0.1.0
 * @category schemas
 */
export interface ParsedClassDefinition {
  readonly iri: string;
  readonly label: string;
  readonly localName: string;
  readonly comment: O.Option<string>;
  readonly properties: ReadonlyArray<string>;
  readonly prefLabels: ReadonlyArray<string>;
  readonly altLabels: ReadonlyArray<string>;
  readonly hiddenLabels: ReadonlyArray<string>;
  readonly definition: O.Option<string>;
  readonly scopeNote: O.Option<string>;
  readonly example: O.Option<string>;
  readonly broader: ReadonlyArray<string>;
  readonly narrower: ReadonlyArray<string>;
  readonly related: ReadonlyArray<string>;
  readonly equivalentClass: ReadonlyArray<string>;
  readonly exactMatch: ReadonlyArray<string>;
  readonly closeMatch: ReadonlyArray<string>;
}

/**
 * Parsed property definition (pre-database)
 *
 * @since 0.1.0
 * @category schemas
 */
export interface ParsedPropertyDefinition {
  readonly iri: string;
  readonly label: string;
  readonly localName: string;
  readonly comment: O.Option<string>;
  readonly domain: ReadonlyArray<string>;
  readonly range: ReadonlyArray<string>;
  readonly rangeType: "object" | "datatype";
  readonly isFunctional: boolean;
  readonly inverseOf: ReadonlyArray<string>;
  readonly prefLabels: ReadonlyArray<string>;
  readonly altLabels: ReadonlyArray<string>;
  readonly hiddenLabels: ReadonlyArray<string>;
  readonly definition: O.Option<string>;
  readonly scopeNote: O.Option<string>;
  readonly example: O.Option<string>;
  readonly broader: ReadonlyArray<string>;
  readonly narrower: ReadonlyArray<string>;
  readonly related: ReadonlyArray<string>;
  readonly exactMatch: ReadonlyArray<string>;
  readonly closeMatch: ReadonlyArray<string>;
}

/**
 * Parsed ontology result
 *
 * @since 0.1.0
 * @category schemas
 */
export interface ParsedOntology {
  readonly classes: ReadonlyArray<ParsedClassDefinition>;
  readonly properties: ReadonlyArray<ParsedPropertyDefinition>;
  readonly classHierarchy: Record<string, ReadonlyArray<string>>;
  readonly propertyHierarchy: Record<string, ReadonlyArray<string>>;
}

/**
 * OntologyParser Effect.Service
 *
 * Provides ontology parsing capabilities using N3.js.
 *
 * @since 0.1.0
 * @category services
 */
export class OntologyParser extends Effect.Service<OntologyParser>()($I`OntologyParser`, {
  effect: Effect.gen(function* () {
    /**
     * Parse Turtle content into N3.Store
     */
    const parseTurtle = (content: string) =>
      Effect.async<N3.Store, OntologyParseError>((resume) => {
        const parser = new N3.Parser();
        const store = new N3.Store();

        parser.parse(content, (error, quad, _prefixes) => {
          if (error) {
            resume(
              Effect.fail(
                new OntologyParseError({
                  message: `Failed to parse Turtle content: ${error.message}`,
                  format: "text/turtle",
                  cause: String(error),
                })
              )
            );
          } else if (quad) {
            store.addQuad(quad);
          } else {
            // Parsing complete
            resume(Effect.succeed(store));
          }
        });
      });

    /**
     * Get all values for a predicate from the store
     */
    const getPredicateValues = (
      store: N3.Store,
      predicate: string
    ): MutableHashMap.MutableHashMap<string, string[]> => {
      const map = MutableHashMap.empty<string, string[]>();
      for (const quad of store.match(null, N3.DataFactory.namedNode(predicate), null)) {
        const subject = quad.subject.value;
        // Skip blank nodes
        if (Str.startsWith("_:")(subject)) continue;

        const value = quad.object.termType === "Literal" ? quad.object.value : quad.object.value;

        if (!MutableHashMap.has(map, subject)) {
          MutableHashMap.set(map, subject, []);
        }
        O.getOrThrow(MutableHashMap.get(map, subject)).push(value);
      }
      return map;
    };

    /**
     * Get first value for a predicate (for single-valued predicates)
     */
    const getFirstValue = (map: MutableHashMap.MutableHashMap<string, string[]>, subject: string): O.Option<string> =>
      O.flatMap(MutableHashMap.get(map, subject), A.head);

    /**
     * Get all values for a predicate (for multi-valued predicates)
     */
    const getAllValues = (
      map: MutableHashMap.MutableHashMap<string, string[]>,
      subject: string
    ): ReadonlyArray<string> => {
      return O.getOrElse(MutableHashMap.get(map, subject), A.empty<string>);
    };

    /**
     * Parse ontology from N3 Store
     */
    const parseFromStore = (store: N3.Store): ParsedOntology => {
      // Fetch all predicate metadata
      const labels = getPredicateValues(store, RDFS.label);
      const comments = getPredicateValues(store, RDFS.comment);
      const domains = getPredicateValues(store, RDFS.domain);
      const ranges = getPredicateValues(store, RDFS.range);
      const subClassOf = getPredicateValues(store, RDFS.subClassOf);
      const subPropertyOf = getPredicateValues(store, RDFS.subPropertyOf);
      const prefLabels = getPredicateValues(store, SKOS.prefLabel);
      const altLabels = getPredicateValues(store, SKOS.altLabel);
      const hiddenLabels = getPredicateValues(store, SKOS.hiddenLabel);
      const definitions = getPredicateValues(store, SKOS.definition);
      const scopeNotes = getPredicateValues(store, SKOS.scopeNote);
      const examples = getPredicateValues(store, SKOS.example);
      const broaders = getPredicateValues(store, SKOS.broader);
      const narrowers = getPredicateValues(store, SKOS.narrower);
      const relateds = getPredicateValues(store, SKOS.related);
      const exactMatches = getPredicateValues(store, SKOS.exactMatch);
      const closeMatches = getPredicateValues(store, SKOS.closeMatch);
      const inverseOfs = getPredicateValues(store, OWL.inverseOf);
      const equivalentClasses = getPredicateValues(store, OWL.equivalentClass);

      // Find all OWL classes
      const classIris = MutableHashSet.empty<string>();
      for (const quad of store.match(null, N3.DataFactory.namedNode(RDF.type), N3.DataFactory.namedNode(OWL.Class))) {
        if (!Str.startsWith("_:")(quad.subject.value)) {
          MutableHashSet.add(classIris, quad.subject.value);
        }
      }
      // Also check rdfs:Class
      for (const quad of store.match(null, N3.DataFactory.namedNode(RDF.type), N3.DataFactory.namedNode(RDFS.Class))) {
        if (!Str.startsWith("_:")(quad.subject.value)) {
          MutableHashSet.add(classIris, quad.subject.value);
        }
      }

      // Find all OWL properties
      const objectPropertyIris = MutableHashSet.empty<string>();
      const datatypePropertyIris = MutableHashSet.empty<string>();
      const functionalPropertyIris = MutableHashSet.empty<string>();

      for (const quad of store.match(
        null,
        N3.DataFactory.namedNode(RDF.type),
        N3.DataFactory.namedNode(OWL.ObjectProperty)
      )) {
        if (!Str.startsWith("_:")(quad.subject.value)) {
          MutableHashSet.add(objectPropertyIris, quad.subject.value);
        }
      }

      for (const quad of store.match(
        null,
        N3.DataFactory.namedNode(RDF.type),
        N3.DataFactory.namedNode(OWL.DatatypeProperty)
      )) {
        if (!Str.startsWith("_:")(quad.subject.value)) {
          MutableHashSet.add(datatypePropertyIris, quad.subject.value);
        }
      }

      for (const quad of store.match(
        null,
        N3.DataFactory.namedNode(RDF.type),
        N3.DataFactory.namedNode(OWL.FunctionalProperty)
      )) {
        if (!Str.startsWith("_:")(quad.subject.value)) {
          MutableHashSet.add(functionalPropertyIris, quad.subject.value);
        }
      }

      // Build class -> properties mapping
      const classProperties = MutableHashMap.empty<string, string[]>();
      const allPropertyIris = A.appendAll(A.fromIterable(objectPropertyIris), A.fromIterable(datatypePropertyIris));
      for (const propIri of allPropertyIris) {
        const propDomains = O.getOrElse(MutableHashMap.get(domains, propIri), A.empty<string>);
        for (const domainIri of propDomains) {
          if (!MutableHashMap.has(classProperties, domainIri)) {
            MutableHashMap.set(classProperties, domainIri, []);
          }
          O.getOrThrow(MutableHashMap.get(classProperties, domainIri)).push(propIri);
        }
      }

      // Build class hierarchy
      const classHierarchy = R.empty<string, ReadonlyArray<string>>();
      MutableHashMap.forEach(subClassOf, (parentIris, childIri) => {
        classHierarchy[childIri] = parentIris;
      });

      // Build property hierarchy
      const propertyHierarchy = R.empty<string, ReadonlyArray<string>>();
      MutableHashMap.forEach(subPropertyOf, (parentIris, childIri) => {
        propertyHierarchy[childIri] = parentIris;
      });

      // Build class definitions
      const classes = A.empty<ParsedClassDefinition>();
      Iterable.forEach(classIris, (iri) => {
        // Must have a label or prefLabel to be included
        const label = getFirstValue(labels, iri).pipe(
          O.getOrElse(() => getFirstValue(prefLabels, iri).pipe(O.getOrElse(thunkEmptyStr)))
        );

        if (label) {
          classes.push({
            iri,
            label,
            localName: extractLocalName(iri),
            comment: getFirstValue(comments, iri),
            properties: O.getOrElse(MutableHashMap.get(classProperties, iri), A.empty<string>),
            prefLabels: getAllValues(prefLabels, iri),
            altLabels: getAllValues(altLabels, iri),
            hiddenLabels: getAllValues(hiddenLabels, iri),
            definition: getFirstValue(definitions, iri),
            scopeNote: getFirstValue(scopeNotes, iri),
            example: getFirstValue(examples, iri),
            broader: [...getAllValues(broaders, iri), ...getAllValues(subClassOf, iri)],
            narrower: getAllValues(narrowers, iri),
            related: getAllValues(relateds, iri),
            equivalentClass: getAllValues(equivalentClasses, iri),
            exactMatch: getAllValues(exactMatches, iri),
            closeMatch: getAllValues(closeMatches, iri),
          });
        }
      });

      // Build property definitions
      const properties = A.empty<ParsedPropertyDefinition>();
      Iterable.forEach(objectPropertyIris, (iri) => {
        const label = getFirstValue(labels, iri).pipe(
          O.getOrElse(() => getFirstValue(prefLabels, iri).pipe(O.getOrElse(thunkEmptyStr)))
        );

        if (label) {
          properties.push({
            iri,
            label,
            localName: extractLocalName(iri),
            comment: getFirstValue(comments, iri),
            domain: getAllValues(domains, iri),
            range: getAllValues(ranges, iri),
            rangeType: "object",
            isFunctional: MutableHashSet.has(functionalPropertyIris, iri),
            inverseOf: getAllValues(inverseOfs, iri),
            prefLabels: getAllValues(prefLabels, iri),
            altLabels: getAllValues(altLabels, iri),
            hiddenLabels: getAllValues(hiddenLabels, iri),
            definition: getFirstValue(definitions, iri),
            scopeNote: getFirstValue(scopeNotes, iri),
            example: getFirstValue(examples, iri),
            broader: [...getAllValues(broaders, iri), ...getAllValues(subPropertyOf, iri)],
            narrower: getAllValues(narrowers, iri),
            related: getAllValues(relateds, iri),
            exactMatch: getAllValues(exactMatches, iri),
            closeMatch: getAllValues(closeMatches, iri),
          });
        }
      });

      Iterable.forEach(datatypePropertyIris, (iri) => {
        // Skip if already added as object property (shouldn't happen but defensive)
        if (MutableHashSet.has(objectPropertyIris, iri)) return;

        const label = getFirstValue(labels, iri).pipe(
          O.getOrElse(() => getFirstValue(prefLabels, iri).pipe(O.getOrElse(thunkEmptyStr)))
        );

        if (label) {
          properties.push({
            iri,
            label,
            localName: extractLocalName(iri),
            comment: getFirstValue(comments, iri),
            domain: getAllValues(domains, iri),
            range: getAllValues(ranges, iri),
            rangeType: "datatype",
            isFunctional: MutableHashSet.has(functionalPropertyIris, iri),
            inverseOf: getAllValues(inverseOfs, iri),
            prefLabels: getAllValues(prefLabels, iri),
            altLabels: getAllValues(altLabels, iri),
            hiddenLabels: getAllValues(hiddenLabels, iri),
            definition: getFirstValue(definitions, iri),
            scopeNote: getFirstValue(scopeNotes, iri),
            example: getFirstValue(examples, iri),
            broader: [...getAllValues(broaders, iri), ...getAllValues(subPropertyOf, iri)],
            narrower: getAllValues(narrowers, iri),
            related: getAllValues(relateds, iri),
            exactMatch: getAllValues(exactMatches, iri),
            closeMatch: getAllValues(closeMatches, iri),
          });
        }
      });

      return {
        classes,
        properties,
        classHierarchy,
        propertyHierarchy,
      };
    };

    return {
      /**
       * Parse Turtle content into structured ontology data
       *
       * @param content - Turtle/RDF content as string
       * @returns Parsed ontology with classes and properties
       *
       * @example
       * ```ts
       * const ontology = yield* OntologyParser.parse(turtleContent);
       * console.log(ontology.classes.length);
       * ```
       */
      parse: Effect.fn((content: string) => parseTurtle(content).pipe(Effect.map(parseFromStore))),

      /**
       * Parse Turtle content and merge with additional vocabulary content
       *
       * @param content - Main ontology Turtle content
       * @param externalContent - External vocabulary content to merge
       * @returns Parsed ontology with merged vocabularies
       */
      parseWithExternal: Effect.fn((content: string, externalContent: string) =>
        Effect.gen(function* () {
          const mainStore = yield* parseTurtle(content);
          const externalStore = yield* parseTurtle(externalContent).pipe(
            Effect.catchAll((error) =>
              Effect.gen(function* () {
                yield* Effect.logWarning("Failed to parse external vocabularies", {
                  error: error.message,
                });
                return new N3.Store();
              })
            )
          );

          // Merge external quads into main store
          for (const quad of externalStore.getQuads(null, null, null, null)) {
            mainStore.addQuad(quad);
          }

          return parseFromStore(mainStore);
        })
      ),
    };
  }),
  accessors: true,
}) {}
