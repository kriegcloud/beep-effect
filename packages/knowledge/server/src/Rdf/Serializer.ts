import { $KnowledgeServerId } from "@beep/identity/packages";
import { SerializerError } from "@beep/knowledge-domain/errors";
import {
  BlankNode,
  IRI,
  Literal,
  makeBlankNode,
  Quad,
  QuadPattern,
  type RdfFormat,
  RdfFormatMimeType,
  type Term,
} from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as N3 from "n3";
import { RdfStore, RdfStoreLive } from "./RdfStoreService";

const $I = $KnowledgeServerId.create("Rdf/Serializer");

const XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";
const RDF_LANG_STRING = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

const iriToN3 = (iri: IRI.Type): N3.NamedNode => N3.DataFactory.namedNode(iri);

const blankNodeToN3 = (bnode: BlankNode.Type): N3.BlankNode => {
  const id = Str.slice(2)(bnode);
  return N3.DataFactory.blankNode(id);
};

const literalToN3 = (literal: Literal): N3.Literal => {
  if (literal.language !== undefined) {
    return N3.DataFactory.literal(literal.value, literal.language);
  }

  if (literal.datatype !== undefined) {
    return N3.DataFactory.literal(literal.value, N3.DataFactory.namedNode(literal.datatype));
  }

  return N3.DataFactory.literal(literal.value);
};

const subjectToN3 = (subject: Quad["subject"]): N3.Quad_Subject => {
  if (S.is(BlankNode)(subject)) {
    return blankNodeToN3(subject);
  }
  return iriToN3(IRI.make(subject));
};

const predicateToN3 = (predicate: Quad["predicate"]): N3.Quad_Predicate => iriToN3(predicate);

const termToN3 = (term: Term.Type): N3.Quad_Object => {
  if (S.is(BlankNode)(term)) {
    return blankNodeToN3(term);
  }
  if (IRI.is(term)) {
    return iriToN3(term);
  }
  return literalToN3(Literal.make(term));
};

const graphToN3 = (graph: Quad["graph"]): N3.Quad_Graph => {
  if (graph !== undefined) {
    return iriToN3(graph);
  }
  return N3.DataFactory.defaultGraph();
};

const quadToN3 = (quad: Quad): N3.Quad =>
  N3.DataFactory.quad(
    subjectToN3(quad.subject),
    predicateToN3(quad.predicate),
    termToN3(quad.object),
    graphToN3(quad.graph)
  );

interface RdfJsTerm {
  readonly termType: string;
  readonly value: string;
}

interface RdfJsLiteral extends RdfJsTerm {
  readonly termType: "Literal";
  readonly language: string;
  readonly datatype: RdfJsTerm;
}

interface RdfJsQuad {
  readonly subject: RdfJsTerm;
  readonly predicate: RdfJsTerm;
  readonly object: RdfJsTerm;
  readonly graph: RdfJsTerm;
}

const rdfJsSubjectToDomain = (term: RdfJsTerm): Quad["subject"] => {
  if (term.termType === "BlankNode") {
    return makeBlankNode(`_:${term.value}`);
  }
  return IRI.make(term.value);
};

const rdfJsPredicateToDomain = (term: RdfJsTerm): Quad["predicate"] => IRI.make(term.value);

const rdfJsObjectToDomain = (term: RdfJsTerm): Term.Type =>
  Match.value(term.termType).pipe(
    Match.when("NamedNode", () => IRI.make(term.value)),
    Match.when("BlankNode", () => BlankNode.make(`_:${term.value}`)),
    Match.when("Literal", () => {
      const lit = term as RdfJsLiteral;
      const datatype = lit.datatype?.value;
      const language = lit.language;

      if (language && Str.length(language) > 0) {
        return new Literal({
          value: lit.value,
          language,
        });
      }

      if (datatype && datatype !== XSD_STRING && datatype !== RDF_LANG_STRING) {
        return new Literal({
          value: lit.value,
          datatype: IRI.make(datatype),
        });
      }

      return new Literal({ value: lit.value });
    }),
    Match.orElse(() => {
      throw new SerializerError({
        operation: "rdfJsObjectToDomain",
        message: `Unexpected term type in object position: ${term.termType}`,
      });
    })
  );

const rdfJsGraphToDomain = (term: RdfJsTerm): Quad["graph"] => {
  if (term.termType === "DefaultGraph" || term.value === "") {
    return undefined;
  }
  return IRI.make(term.value);
};

const rdfJsQuadToDomain = (quad: RdfJsQuad): Quad =>
  new Quad({
    subject: rdfJsSubjectToDomain(quad.subject),
    predicate: rdfJsPredicateToDomain(quad.predicate),
    object: rdfJsObjectToDomain(quad.object),
    graph: rdfJsGraphToDomain(quad.graph),
  });

const getN3Format = (format: RdfFormat.Type): string =>
  Match.value(format).pipe(
    Match.when("Turtle", () => "text/turtle"),
    Match.when("NTriples", () => "application/n-triples"),
    Match.when("JSONLD", () => "application/ld+json"),
    Match.exhaustive
  );

const parseTurtleToQuads = (content: string, graph?: IRI.Type): Effect.Effect<ReadonlyArray<Quad>, SerializerError> =>
  Effect.async<ReadonlyArray<Quad>, SerializerError>((resume) => {
    const parser = new N3.Parser();
    const quads = A.empty<Quad>();
    let hasError = false;

    parser.parse(content, (error, quad, _prefixes) => {
      if (hasError) return;

      if (error) {
        hasError = true;
        resume(
          Effect.fail(
            new SerializerError({
              operation: "parseTurtle",
              format: "text/turtle",
              message: `Failed to parse Turtle content: ${error.message}`,
              cause: String(error),
            })
          )
        );
      } else if (quad) {
        const conversionResult = Either.try({
          try: () => rdfJsQuadToDomain(quad as RdfJsQuad),
          catch: (convError) =>
            new SerializerError({
              operation: "parseTurtle",
              format: "text/turtle",
              message: `Failed to convert quad: ${String(convError)}`,
              cause: String(convError),
            }),
        });

        if (Either.isLeft(conversionResult)) {
          hasError = true;
          resume(Effect.fail(conversionResult.left));
        } else {
          const domainQuad = conversionResult.right;
          if (graph !== undefined) {
            quads.push(
              new Quad({
                subject: domainQuad.subject,
                predicate: domainQuad.predicate,
                object: domainQuad.object,
                graph,
              })
            );
          } else {
            quads.push(domainQuad);
          }
        }
      } else {
        resume(Effect.succeed(quads as ReadonlyArray<Quad>));
      }
    });
  });

const serializeQuadsToString = (
  quads: ReadonlyArray<Quad>,
  format: RdfFormat.Type
): Effect.Effect<string, SerializerError> =>
  Effect.async<string, SerializerError>((resume) => {
    const n3Format = getN3Format(format);
    const writer = new N3.Writer({ format: n3Format });

    A.forEach(quads, (quad) => {
      writer.addQuad(quadToN3(quad));
    });

    writer.end((error, result) => {
      if (error) {
        resume(
          Effect.fail(
            new SerializerError({
              operation: "serialize",
              format: n3Format,
              message: `Failed to serialize RDF: ${error.message}`,
              cause: String(error),
            })
          )
        );
      } else {
        resume(Effect.succeed(result));
      }
    });
  });

export interface SerializerShape {
  readonly parseTurtle: (content: string, graph?: IRI.Type) => Effect.Effect<number, SerializerError>;
  readonly parseOnly: (content: string, graph?: IRI.Type) => Effect.Effect<ReadonlyArray<Quad>, SerializerError>;
  readonly serialize: (format: RdfFormat.Type, graph?: undefined | IRI.Type) => Effect.Effect<string, SerializerError>;
  readonly serializeQuads: (
    quads: ReadonlyArray<Quad>,
    format: RdfFormat.Type
  ) => Effect.Effect<string, SerializerError>;
}

export class Serializer extends Context.Tag($I`Serializer`)<Serializer, SerializerShape>() {}

const serviceEffect: Effect.Effect<SerializerShape, never, RdfStore> = Effect.gen(function* () {
  const store = yield* RdfStore;

  const parseTurtle = Effect.fn("Serializer.parseTurtle")((content: string, graph?: IRI.Type) =>
    Effect.gen(function* () {
      const quads = yield* parseTurtleToQuads(content, graph);
      yield* store.addQuads(quads);
      return A.length(quads);
    }).pipe(
      Effect.withSpan("Serializer.parseTurtle", {
        attributes: { contentLength: Str.length(content), graph: graph ?? "default" },
      })
    )
  );

  const parseOnly = Effect.fn("Serializer.parseOnly")((content: string, graph?: IRI.Type) =>
    parseTurtleToQuads(content, graph).pipe(
      Effect.withSpan("Serializer.parseOnly", {
        attributes: { contentLength: Str.length(content), graph: graph ?? "default" },
      })
    )
  );

  const serialize = Effect.fn("Serializer.serialize")((format: RdfFormat.Type, graph?: undefined | IRI.Type) =>
    Effect.gen(function* () {
      if (format === "JSONLD") {
        return yield* new SerializerError({
          operation: "serialize",
          format: RdfFormatMimeType.DecodedEnum[format],
          message: "JSON-LD serialization is not supported. Use Turtle or N-Triples instead.",
        });
      }

      const pattern = new QuadPattern({
        graph,
      });
      const quads = yield* store.match(pattern);

      return yield* serializeQuadsToString(quads, format);
    }).pipe(
      Effect.withSpan("Serializer.serialize", {
        attributes: { format, graph: graph ?? "all" },
      })
    )
  );

  const serializeQuads = Effect.fn("Serializer.serializeQuads")((quads: ReadonlyArray<Quad>, format: RdfFormat.Type) =>
    Effect.gen(function* () {
      if (format === "JSONLD") {
        return yield* new SerializerError({
          operation: "serializeQuads",
          format: RdfFormatMimeType.DecodedEnum[format],
          message: "JSON-LD serialization is not supported. Use Turtle or N-Triples instead.",
        });
      }

      return yield* serializeQuadsToString(quads, format);
    }).pipe(
      Effect.withSpan("Serializer.serializeQuads", {
        attributes: { format, quadCount: A.length(quads) },
      })
    )
  );

  return Serializer.of({
    parseTurtle,
    parseOnly,
    serialize,
    serializeQuads,
  });
});

export const SerializerLive = Layer.effect(Serializer, serviceEffect).pipe(Layer.provide(RdfStoreLive));
