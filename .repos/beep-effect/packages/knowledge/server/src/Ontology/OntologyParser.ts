import { $KnowledgeServerId } from "@beep/identity/packages";
import { PropertyDefinition } from "@beep/knowledge-domain/entities";
import { OntologyParseError } from "@beep/knowledge-domain/errors";
import { thunkEmptyStr, thunkFalse } from "@beep/utils";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Iterable from "effect/Iterable";
import * as Layer from "effect/Layer";
import * as MutableHashMap from "effect/MutableHashMap";
import * as MutableHashSet from "effect/MutableHashSet";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as N3 from "n3";
import { extractLocalName, OWL, RDF, RDFS, SKOS } from "./constants";

const $I = $KnowledgeServerId.create("Ontology/OntologyParser");

const EmptyStringArray = (): ReadonlyArray<string> => [];
const EmptyClassArray = (): ReadonlyArray<ParsedClassDefinition> => [];
const EmptyPropertyArray = (): ReadonlyArray<ParsedPropertyDefinition> => [];

export class ParsedClassDefinition extends S.Class<ParsedClassDefinition>($I`ParsedClassDefinition`)(
  {
    iri: S.String,
    label: S.String,
    localName: S.String,

    comment: S.optionalWith(S.OptionFromUndefinedOr(S.String), { default: O.none<string> }),

    properties: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),
    prefLabels: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),
    altLabels: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),
    hiddenLabels: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),

    definition: S.optionalWith(S.OptionFromUndefinedOr(S.String), { default: O.none<string> }),
    scopeNote: S.optionalWith(S.OptionFromUndefinedOr(S.String), { default: O.none<string> }),
    example: S.optionalWith(S.OptionFromUndefinedOr(S.String), { default: O.none<string> }),

    broader: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),
    narrower: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),
    related: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),

    equivalentClass: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),
    exactMatch: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),
    closeMatch: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),
  },
  $I.annotations("ParsedClassDefinition", {
    description: "Parsed ontology class definition extracted from RDF/OWL metadata (labels, notes, relationships).",
  })
) {}

export class ParsedPropertyDefinition extends S.Class<ParsedPropertyDefinition>($I`ParsedPropertyDefinition`)(
  {
    iri: S.String,
    label: S.String,
    localName: S.String,

    comment: S.optionalWith(S.OptionFromUndefinedOr(S.String), { default: O.none<string> }),

    domain: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),
    range: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),
    rangeType: PropertyDefinition.PropertyRangeType,
    isFunctional: S.optionalWith(S.Boolean, { default: thunkFalse }),
    inverseOf: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),

    prefLabels: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),
    altLabels: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),
    hiddenLabels: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),

    definition: S.optionalWith(S.OptionFromUndefinedOr(S.String), { default: O.none<string> }),
    scopeNote: S.optionalWith(S.OptionFromUndefinedOr(S.String), { default: O.none<string> }),
    example: S.optionalWith(S.OptionFromUndefinedOr(S.String), { default: O.none<string> }),

    broader: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),
    narrower: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),
    related: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),

    exactMatch: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),
    closeMatch: S.optionalWith(S.Array(S.String), { default: EmptyStringArray }),
  },
  $I.annotations("ParsedPropertyDefinition", {
    description: "Parsed ontology property definition extracted from RDF/OWL metadata (domain/range, labels, flags).",
  })
) {}

const HierarchySchema = S.Record({ key: S.String, value: S.Array(S.String) });

export class ParsedOntology extends S.Class<ParsedOntology>($I`ParsedOntology`)(
  {
    classes: S.optionalWith(S.Array(ParsedClassDefinition), { default: EmptyClassArray }),
    properties: S.optionalWith(S.Array(ParsedPropertyDefinition), { default: EmptyPropertyArray }),
    classHierarchy: S.optionalWith(HierarchySchema, { default: R.empty<string, Array<string>> }),
    propertyHierarchy: S.optionalWith(HierarchySchema, { default: R.empty<string, Array<string>> }),
  },
  $I.annotations("ParsedOntology", {
    description: "Parsed ontology bundle (classes/properties plus hierarchy maps) produced by OntologyParser.",
  })
) {}

const collectN3Subjects = (
  store: N3.Store,
  predicate: string,
  object: string
): MutableHashSet.MutableHashSet<string> => {
  const result = MutableHashSet.empty<string>();
  for (const quad of store.match(null, N3.DataFactory.namedNode(predicate), N3.DataFactory.namedNode(object))) {
    if (!Str.startsWith("_:")(quad.subject.value)) {
      MutableHashSet.add(result, quad.subject.value);
    }
  }
  return result;
};

const collectPredicateValues = (
  store: N3.Store,
  predicate: string
): MutableHashMap.MutableHashMap<string, string[]> => {
  const map = MutableHashMap.empty<string, string[]>();
  for (const quad of store.match(null, N3.DataFactory.namedNode(predicate), null)) {
    const subject = quad.subject.value;
    if (Str.startsWith("_:")(subject)) continue;

    const value = quad.object.value;

    if (!MutableHashMap.has(map, subject)) {
      MutableHashMap.set(map, subject, []);
    }
    O.getOrThrow(MutableHashMap.get(map, subject)).push(value);
  }
  return map;
};

const getFirstValue = (map: MutableHashMap.MutableHashMap<string, string[]>, subject: string): O.Option<string> =>
  O.flatMap(MutableHashMap.get(map, subject), A.head);

const getAllValues = (map: MutableHashMap.MutableHashMap<string, string[]>, subject: string): ReadonlyArray<string> =>
  O.getOrElse(MutableHashMap.get(map, subject), A.empty<string>);

const buildClassDef = (
  iri: string,
  metadata: {
    labels: MutableHashMap.MutableHashMap<string, string[]>;
    comments: MutableHashMap.MutableHashMap<string, string[]>;
    classProperties: MutableHashMap.MutableHashMap<string, string[]>;
    prefLabels: MutableHashMap.MutableHashMap<string, string[]>;
    altLabels: MutableHashMap.MutableHashMap<string, string[]>;
    hiddenLabels: MutableHashMap.MutableHashMap<string, string[]>;
    definitions: MutableHashMap.MutableHashMap<string, string[]>;
    scopeNotes: MutableHashMap.MutableHashMap<string, string[]>;
    examples: MutableHashMap.MutableHashMap<string, string[]>;
    broaders: MutableHashMap.MutableHashMap<string, string[]>;
    narrowers: MutableHashMap.MutableHashMap<string, string[]>;
    relateds: MutableHashMap.MutableHashMap<string, string[]>;
    equivalentClasses: MutableHashMap.MutableHashMap<string, string[]>;
    exactMatches: MutableHashMap.MutableHashMap<string, string[]>;
    closeMatches: MutableHashMap.MutableHashMap<string, string[]>;
    subClassOf: MutableHashMap.MutableHashMap<string, string[]>;
  }
): O.Option<ParsedClassDefinition> => {
  const label = getFirstValue(metadata.labels, iri).pipe(
    O.getOrElse(() => getFirstValue(metadata.prefLabels, iri).pipe(O.getOrElse(thunkEmptyStr)))
  );

  if (!label) return O.none();

  return O.some(
    new ParsedClassDefinition({
      iri,
      label,
      localName: extractLocalName(iri),
      comment: getFirstValue(metadata.comments, iri),
      properties: O.getOrElse(MutableHashMap.get(metadata.classProperties, iri), A.empty<string>),
      prefLabels: getAllValues(metadata.prefLabels, iri),
      altLabels: getAllValues(metadata.altLabels, iri),
      hiddenLabels: getAllValues(metadata.hiddenLabels, iri),
      definition: getFirstValue(metadata.definitions, iri),
      scopeNote: getFirstValue(metadata.scopeNotes, iri),
      example: getFirstValue(metadata.examples, iri),
      broader: A.appendAll(getAllValues(metadata.broaders, iri), getAllValues(metadata.subClassOf, iri)),
      narrower: getAllValues(metadata.narrowers, iri),
      related: getAllValues(metadata.relateds, iri),
      equivalentClass: getAllValues(metadata.equivalentClasses, iri),
      exactMatch: getAllValues(metadata.exactMatches, iri),
      closeMatch: getAllValues(metadata.closeMatches, iri),
    })
  );
};

const buildPropertyDef = (
  iri: string,
  rangeType: "object" | "datatype",
  metadata: {
    labels: MutableHashMap.MutableHashMap<string, string[]>;
    comments: MutableHashMap.MutableHashMap<string, string[]>;
    domains: MutableHashMap.MutableHashMap<string, string[]>;
    ranges: MutableHashMap.MutableHashMap<string, string[]>;
    functionalPropertyIris: MutableHashSet.MutableHashSet<string>;
    inverseOfs: MutableHashMap.MutableHashMap<string, string[]>;
    prefLabels: MutableHashMap.MutableHashMap<string, string[]>;
    altLabels: MutableHashMap.MutableHashMap<string, string[]>;
    hiddenLabels: MutableHashMap.MutableHashMap<string, string[]>;
    definitions: MutableHashMap.MutableHashMap<string, string[]>;
    scopeNotes: MutableHashMap.MutableHashMap<string, string[]>;
    examples: MutableHashMap.MutableHashMap<string, string[]>;
    broaders: MutableHashMap.MutableHashMap<string, string[]>;
    narrowers: MutableHashMap.MutableHashMap<string, string[]>;
    relateds: MutableHashMap.MutableHashMap<string, string[]>;
    exactMatches: MutableHashMap.MutableHashMap<string, string[]>;
    closeMatches: MutableHashMap.MutableHashMap<string, string[]>;
    subPropertyOf: MutableHashMap.MutableHashMap<string, string[]>;
  }
): O.Option<ParsedPropertyDefinition> => {
  const label = getFirstValue(metadata.labels, iri).pipe(
    O.getOrElse(() => getFirstValue(metadata.prefLabels, iri).pipe(O.getOrElse(thunkEmptyStr)))
  );

  if (!label) return O.none();

  return O.some(
    new ParsedPropertyDefinition({
      iri,
      label,
      localName: extractLocalName(iri),
      comment: getFirstValue(metadata.comments, iri),
      domain: getAllValues(metadata.domains, iri),
      range: getAllValues(metadata.ranges, iri),
      rangeType,
      isFunctional: MutableHashSet.has(metadata.functionalPropertyIris, iri),
      inverseOf: getAllValues(metadata.inverseOfs, iri),
      prefLabels: getAllValues(metadata.prefLabels, iri),
      altLabels: getAllValues(metadata.altLabels, iri),
      hiddenLabels: getAllValues(metadata.hiddenLabels, iri),
      definition: getFirstValue(metadata.definitions, iri),
      scopeNote: getFirstValue(metadata.scopeNotes, iri),
      example: getFirstValue(metadata.examples, iri),
      broader: A.appendAll(getAllValues(metadata.broaders, iri), getAllValues(metadata.subPropertyOf, iri)),
      narrower: getAllValues(metadata.narrowers, iri),
      related: getAllValues(metadata.relateds, iri),
      exactMatch: getAllValues(metadata.exactMatches, iri),
      closeMatch: getAllValues(metadata.closeMatches, iri),
    })
  );
};

export interface OntologyParserShape {
  readonly parse: (content: string) => Effect.Effect<ParsedOntology, OntologyParseError>;
  readonly parseWithExternal: (
    content: string,
    externalContent: string
  ) => Effect.Effect<ParsedOntology, OntologyParseError>;
}

export class OntologyParser extends Context.Tag($I`OntologyParser`)<OntologyParser, OntologyParserShape>() {}

const serviceEffect: Effect.Effect<OntologyParserShape> = Effect.gen(function* () {
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
                cause: `${error}`,
              })
            )
          );
        } else if (quad) {
          store.addQuad(quad);
        } else {
          resume(Effect.succeed(store));
        }
      });
    });

  const parseFromStore = (store: N3.Store): ParsedOntology => {
    const labels = collectPredicateValues(store, RDFS.label);
    const comments = collectPredicateValues(store, RDFS.comment);
    const domains = collectPredicateValues(store, RDFS.domain);
    const ranges = collectPredicateValues(store, RDFS.range);
    const subClassOf = collectPredicateValues(store, RDFS.subClassOf);
    const subPropertyOf = collectPredicateValues(store, RDFS.subPropertyOf);
    const prefLabels = collectPredicateValues(store, SKOS.prefLabel);
    const altLabels = collectPredicateValues(store, SKOS.altLabel);
    const hiddenLabels = collectPredicateValues(store, SKOS.hiddenLabel);
    const definitions = collectPredicateValues(store, SKOS.definition);
    const scopeNotes = collectPredicateValues(store, SKOS.scopeNote);
    const examples = collectPredicateValues(store, SKOS.example);
    const broaders = collectPredicateValues(store, SKOS.broader);
    const narrowers = collectPredicateValues(store, SKOS.narrower);
    const relateds = collectPredicateValues(store, SKOS.related);
    const exactMatches = collectPredicateValues(store, SKOS.exactMatch);
    const closeMatches = collectPredicateValues(store, SKOS.closeMatch);
    const inverseOfs = collectPredicateValues(store, OWL.inverseOf);
    const equivalentClasses = collectPredicateValues(store, OWL.equivalentClass);

    const classIris = MutableHashSet.empty<string>();
    const owlClassSubjects = collectN3Subjects(store, RDF.type, OWL.Class);
    Iterable.forEach(owlClassSubjects, (iri) => MutableHashSet.add(classIris, iri));
    const rdfsClassSubjects = collectN3Subjects(store, RDF.type, RDFS.Class);
    Iterable.forEach(rdfsClassSubjects, (iri) => MutableHashSet.add(classIris, iri));

    const objectPropertyIris = collectN3Subjects(store, RDF.type, OWL.ObjectProperty);
    const datatypePropertyIris = collectN3Subjects(store, RDF.type, OWL.DatatypeProperty);
    const functionalPropertyIris = collectN3Subjects(store, RDF.type, OWL.FunctionalProperty);

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

    const classHierarchy = R.empty<string, ReadonlyArray<string>>();
    MutableHashMap.forEach(subClassOf, (parentIris, childIri) => {
      classHierarchy[childIri] = parentIris;
    });

    const propertyHierarchy = R.empty<string, ReadonlyArray<string>>();
    MutableHashMap.forEach(subPropertyOf, (parentIris, childIri) => {
      propertyHierarchy[childIri] = parentIris;
    });

    const classMetadata = {
      labels,
      comments,
      classProperties,
      prefLabels,
      altLabels,
      hiddenLabels,
      definitions,
      scopeNotes,
      examples,
      broaders,
      narrowers,
      relateds,
      equivalentClasses,
      exactMatches,
      closeMatches,
      subClassOf,
    };

    const classes = A.filterMap(A.fromIterable(classIris), (iri) => buildClassDef(iri, classMetadata));

    const propMetadata = {
      labels,
      comments,
      domains,
      ranges,
      functionalPropertyIris,
      inverseOfs,
      prefLabels,
      altLabels,
      hiddenLabels,
      definitions,
      scopeNotes,
      examples,
      broaders,
      narrowers,
      relateds,
      exactMatches,
      closeMatches,
      subPropertyOf,
    };

    const objectProps = A.filterMap(A.fromIterable(objectPropertyIris), (iri) =>
      buildPropertyDef(iri, "object", propMetadata)
    );

    const datatypeProps = A.filterMap(
      A.filter(A.fromIterable(datatypePropertyIris), (iri) => !MutableHashSet.has(objectPropertyIris, iri)),
      (iri) => buildPropertyDef(iri, "datatype", propMetadata)
    );

    const properties = A.appendAll(objectProps, datatypeProps);

    return new ParsedOntology({
      classes,
      properties,
      classHierarchy,
      propertyHierarchy,
    });
  };

  return OntologyParser.of({
    parse: Effect.fn("OntologyParser.parse")(function* (content: string) {
      return yield* F.pipe(content, parseTurtle, Effect.map(parseFromStore), Effect.withSpan("OntologyParser.parse"));
    }),

    parseWithExternal: Effect.fn("OntologyParser.parseWithExternal")(function* (
      content: string,
      externalContent: string
    ) {
      const mainStore = yield* parseTurtle(content);
      const externalStore = yield* parseTurtle(externalContent).pipe(
        Effect.catchAll((error) =>
          Effect.gen(function* () {
            yield* Effect.logWarning("Failed to parse external vocabularies").pipe(
              Effect.annotateLogs({ error: error.message })
            );
            return new N3.Store();
          })
        )
      );

      for (const quad of externalStore.getQuads(null, null, null, null)) {
        mainStore.addQuad(quad);
      }

      return parseFromStore(mainStore);
    }, Effect.withSpan("OntologyParser.parseWithExternal")),
  });
});

export const OntologyParserLive = Layer.effect(OntologyParser, serviceEffect);
