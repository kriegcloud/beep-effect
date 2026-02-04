/**
 * Serializer Service
 *
 * Effect.Service for parsing and serializing RDF content in various formats.
 * Wraps N3.js Parser and Writer with Effect-based error handling.
 *
 * @module knowledge-server/Rdf/Serializer
 * @since 0.1.0
 */
import { SerializerError } from "@beep/knowledge-domain/errors";
import {
  type BlankNode,
  type IRI,
  isBlankNode,
  isIRI,
  Literal,
  makeBlankNode,
  makeIRI,
  Quad,
  QuadPattern,
  type RdfFormat,
  RdfFormatMimeType,
  type Term,
} from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Match from "effect/Match";
import * as Str from "effect/String";
import * as N3 from "n3";
import { RdfStore } from "./RdfStoreService";

/**
 * XSD namespace for literal datatype IRIs
 */
const XSD_STRING = "http://www.w3.org/2001/XMLSchema#string";
const RDF_LANG_STRING = "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString";

/**
 * Convert a domain IRI to N3 NamedNode
 */
const iriToN3 = (iri: IRI.Type): N3.NamedNode => N3.DataFactory.namedNode(iri);

/**
 * Convert a domain BlankNode to N3 BlankNode
 * Domain BlankNode includes "_:" prefix, N3 expects just the identifier
 */
const blankNodeToN3 = (bnode: BlankNode.Type): N3.BlankNode => {
  const id = Str.slice(2)(bnode);
  return N3.DataFactory.blankNode(id);
};

/**
 * Convert a domain Literal to N3 Literal
 * Handles language tags and datatype IRIs according to RDF spec
 */
const literalToN3 = (literal: Literal): N3.Literal => {
  if (literal.language !== undefined) {
    return N3.DataFactory.literal(literal.value, literal.language);
  }

  if (literal.datatype !== undefined) {
    return N3.DataFactory.literal(literal.value, N3.DataFactory.namedNode(literal.datatype));
  }

  return N3.DataFactory.literal(literal.value);
};

/**
 * Convert a domain Subject (IRI | BlankNode) to N3 Subject
 */
const subjectToN3 = (subject: Quad["subject"]): N3.Quad_Subject => {
  if (isBlankNode(subject)) {
    return blankNodeToN3(subject);
  }
  return iriToN3(subject as IRI.Type);
};

/**
 * Convert a domain Predicate (IRI) to N3 Predicate
 */
const predicateToN3 = (predicate: Quad["predicate"]): N3.Quad_Predicate => iriToN3(predicate);

/**
 * Convert a domain Term (IRI | BlankNode | Literal) to N3 Term
 */
const termToN3 = (term: Term): N3.Quad_Object => {
  if (isBlankNode(term)) {
    return blankNodeToN3(term);
  }
  if (isIRI(term)) {
    return iriToN3(term);
  }
  return literalToN3(term as Literal);
};

/**
 * Convert a domain Graph (optional IRI) to N3 Graph
 */
const graphToN3 = (graph: Quad["graph"]): N3.Quad_Graph => {
  if (graph !== undefined) {
    return iriToN3(graph);
  }
  return N3.DataFactory.defaultGraph();
};

/**
 * Convert a domain Quad to N3 Quad
 */
const quadToN3 = (quad: Quad): N3.Quad =>
  N3.DataFactory.quad(
    subjectToN3(quad.subject),
    predicateToN3(quad.predicate),
    termToN3(quad.object),
    graphToN3(quad.graph)
  );

/**
 * RDF/JS Term interface (common interface for all term types)
 */
interface RdfJsTerm {
  readonly termType: string;
  readonly value: string;
}

/**
 * RDF/JS Literal term interface
 */
interface RdfJsLiteral extends RdfJsTerm {
  readonly termType: "Literal";
  readonly language: string;
  readonly datatype: RdfJsTerm;
}

/**
 * RDF/JS Quad interface
 */
interface RdfJsQuad {
  readonly subject: RdfJsTerm;
  readonly predicate: RdfJsTerm;
  readonly object: RdfJsTerm;
  readonly graph: RdfJsTerm;
}

/**
 * Convert an RDF/JS Subject term to domain Subject (IRI | BlankNode)
 */
const rdfJsSubjectToDomain = (term: RdfJsTerm): Quad["subject"] => {
  if (term.termType === "BlankNode") {
    return makeBlankNode(`_:${term.value}`);
  }
  return makeIRI(term.value);
};

/**
 * Convert an RDF/JS Predicate term to domain Predicate (IRI)
 */
const rdfJsPredicateToDomain = (term: RdfJsTerm): Quad["predicate"] => makeIRI(term.value);

/**
 * Convert an RDF/JS Object term to domain Term (IRI | BlankNode | Literal)
 */
const rdfJsObjectToDomain = (term: RdfJsTerm): Term => {
  if (term.termType === "NamedNode") {
    return makeIRI(term.value);
  }

  if (term.termType === "BlankNode") {
    return makeBlankNode(`_:${term.value}`);
  }

  if (term.termType === "Literal") {
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
        datatype: makeIRI(datatype),
      });
    }

    return new Literal({ value: lit.value });
  }

  // Defect: unexpected term type - fail with SerializerError
  throw new SerializerError({
    operation: "rdfJsObjectToDomain",
    message: `Unexpected term type in object position: ${term.termType}`,
  });
};

/**
 * Convert an RDF/JS Graph term to domain Graph (optional IRI)
 */
const rdfJsGraphToDomain = (term: RdfJsTerm): Quad["graph"] => {
  if (term.termType === "DefaultGraph" || term.value === "") {
    return undefined;
  }
  return makeIRI(term.value);
};

/**
 * Convert an RDF/JS Quad to domain Quad
 */
const rdfJsQuadToDomain = (quad: RdfJsQuad): Quad =>
  new Quad({
    subject: rdfJsSubjectToDomain(quad.subject),
    predicate: rdfJsPredicateToDomain(quad.predicate),
    object: rdfJsObjectToDomain(quad.object),
    graph: rdfJsGraphToDomain(quad.graph),
  });

/**
 * Get N3.js format string from RdfFormat
 */
const getN3Format = (format: RdfFormat): string =>
  Match.value(format).pipe(
    Match.when("Turtle", () => "text/turtle"),
    Match.when("NTriples", () => "application/n-triples"),
    Match.when("JSONLD", () => "application/ld+json"),
    Match.exhaustive
  );

/**
 * Parse Turtle content into domain quads (pure parsing, no store interaction)
 */
const parseTurtleToQuads = (content: string, graph?: IRI.Type): Effect.Effect<ReadonlyArray<Quad>, SerializerError> =>
  Effect.async<ReadonlyArray<Quad>, SerializerError>((resume) => {
    const parser = new N3.Parser();
    const quads: Quad[] = [];
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
        // Convert N3 quad to domain Quad using Either.try
        const conversionResult = Either.try({
          try: () => rdfJsQuadToDomain(quad as RdfJsQuad),
          catch: (error) =>
            new SerializerError({
              operation: "parseTurtle",
              format: "text/turtle",
              message: `Failed to convert quad: ${String(error)}`,
              cause: String(error),
            }),
        });

        if (Either.isLeft(conversionResult)) {
          hasError = true;
          resume(Effect.fail(conversionResult.left));
        } else {
          const domainQuad = conversionResult.right;
          // Override graph if specified
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
        // Parsing complete
        resume(Effect.succeed(quads as ReadonlyArray<Quad>));
      }
    });
  });

/**
 * Serialize quads to RDF string (pure serialization)
 */
const serializeQuadsToString = (
  quads: ReadonlyArray<Quad>,
  format: RdfFormat
): Effect.Effect<string, SerializerError> =>
  Effect.async<string, SerializerError>((resume) => {
    const n3Format = getN3Format(format);
    const writer = new N3.Writer({ format: n3Format });

    // Add all quads to writer
    for (const quad of quads) {
      writer.addQuad(quadToN3(quad));
    }

    // End and get result
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

/**
 * Serializer Effect.Service
 *
 * Provides parsing and serialization capabilities for RDF content.
 * Uses N3.js for Turtle and N-Triples format support.
 *
 * @since 0.1.0
 * @category services
 *
 * @example
 * ```ts
 * import { Serializer, RdfStore } from "@beep/knowledge-server/Rdf";
 *
 * const program = Effect.gen(function* () {
 *   const serializer = yield* Serializer;
 *
 *   // Parse Turtle content into store
 *   const count = yield* serializer.parseTurtle(`
 *     @prefix ex: <http://example.org/> .
 *     ex:alice ex:knows ex:bob .
 *   `);
 *
 *   // Serialize store contents to N-Triples
 *   const ntriples = yield* serializer.serialize("NTriples");
 * });
 * ```
 */
export class Serializer extends Effect.Service<Serializer>()("@beep/knowledge-server/Serializer", {
  accessors: true,
  effect: Effect.gen(function* () {
    const store = yield* RdfStore;

    return {
      /**
       * Parse Turtle content and load into RdfStore
       *
       * @param content - Turtle content as string
       * @param graph - Optional named graph to load quads into
       * @returns Effect yielding the count of quads loaded
       *
       * @since 0.1.0
       */
      parseTurtle: (content: string, graph?: IRI.Type): Effect.Effect<number, SerializerError> =>
        Effect.gen(function* () {
          const quads = yield* parseTurtleToQuads(content, graph);
          yield* store.addQuads(quads);
          return A.length(quads);
        }).pipe(
          Effect.withSpan("Serializer.parseTurtle", {
            attributes: { contentLength: Str.length(content), graph: graph ?? "default" },
          })
        ),

      /**
       * Parse Turtle content without loading into store
       *
       * @param content - Turtle content as string
       * @param graph - Optional named graph to assign to quads
       * @returns Effect yielding parsed quads
       *
       * @since 0.1.0
       */
      parseOnly: (content: string, graph?: IRI.Type): Effect.Effect<ReadonlyArray<Quad>, SerializerError> =>
        parseTurtleToQuads(content, graph).pipe(
          Effect.withSpan("Serializer.parseOnly", {
            attributes: { contentLength: Str.length(content), graph: graph ?? "default" },
          })
        ),

      /**
       * Serialize quads from RdfStore to RDF string
       *
       * @param format - Target serialization format
       * @param graph - Optional graph filter (undefined matches all graphs)
       * @returns Effect yielding serialized RDF string
       *
       * @since 0.1.0
       */
      serialize: (format: RdfFormat, graph?: IRI.Type): Effect.Effect<string, SerializerError> =>
        Effect.gen(function* () {
          // JSON-LD is not supported by N3.js
          if (format === "JSONLD") {
            return yield* new SerializerError({
              operation: "serialize",
              format: RdfFormatMimeType[format],
              message: "JSON-LD serialization is not supported. Use Turtle or N-Triples instead.",
            });
          }

          // Get quads from store, optionally filtered by graph
          const pattern = new QuadPattern({
            graph,
          });
          const quads = yield* store.match(pattern);

          return yield* serializeQuadsToString(quads, format);
        }).pipe(
          Effect.withSpan("Serializer.serialize", {
            attributes: { format, graph: graph ?? "all" },
          })
        ),

      /**
       * Serialize specific quads to RDF string (without reading from store)
       *
       * @param quads - Quads to serialize
       * @param format - Target serialization format
       * @returns Effect yielding serialized RDF string
       *
       * @since 0.1.0
       */
      serializeQuads: (quads: ReadonlyArray<Quad>, format: RdfFormat): Effect.Effect<string, SerializerError> =>
        Effect.gen(function* () {
          // JSON-LD is not supported by N3.js
          if (format === "JSONLD") {
            return yield* new SerializerError({
              operation: "serializeQuads",
              format: RdfFormatMimeType[format],
              message: "JSON-LD serialization is not supported. Use Turtle or N-Triples instead.",
            });
          }

          return yield* serializeQuadsToString(quads, format);
        }).pipe(
          Effect.withSpan("Serializer.serializeQuads", {
            attributes: { format, quadCount: A.length(quads) },
          })
        ),
    };
  }),
}) {}
