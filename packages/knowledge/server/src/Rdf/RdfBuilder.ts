/**
 * RdfBuilder Service
 *
 * Fluent builder API for constructing RDF quads.
 * Provides type-safe chainable methods for building triples/quads.
 *
 * @module knowledge-server/Rdf/RdfBuilder
 * @since 0.1.0
 */
import { type BlankNode, type IRI, Literal, Quad } from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import { RdfStore } from "./RdfStoreService";

/**
 * Context for building quads with an optional named graph
 */
interface SubjectContext {
  readonly graph: O.Option<IRI.Type>;
}

/**
 * Context after subject has been specified
 */
interface PredicateContext extends SubjectContext {
  readonly subject: Quad["subject"];
}

/**
 * Context after predicate has been specified
 */
interface ObjectContext extends PredicateContext {
  readonly predicate: IRI.Type;
}

/**
 * Context with complete quad information
 */
interface QuadContext extends ObjectContext {
  readonly object: Quad["object"];
}

/**
 * Builder for completing a quad after subject, predicate, and object are set.
 * Provides methods to either add the quad to the store or just build it.
 */
export interface QuadBuilder {
  /**
   * Add the constructed quad to the RdfStore
   *
   * @returns Effect that adds the quad to the store
   */
  readonly add: () => Effect.Effect<void>;

  /**
   * Build the quad without adding it to the store
   *
   * @returns The constructed Quad
   */
  readonly build: () => Quad;

  /**
   * Continue with another predicate for the same subject
   *
   * @param p - The predicate IRI
   * @returns ObjectBuilder for the new predicate
   */
  readonly predicate: (p: IRI.Type) => ObjectBuilder;
}

/**
 * Builder for specifying the object of a triple.
 * Provides methods for different object types: literals, typed literals, and resources.
 */
export interface ObjectBuilder {
  /**
   * Complete with a plain string literal or language-tagged literal
   *
   * @param value - The literal value
   * @param language - Optional BCP 47 language tag
   * @returns QuadBuilder for finalizing
   */
  readonly literal: (value: string, language?: string) => QuadBuilder;

  /**
   * Complete with a typed literal (e.g., xsd:integer, xsd:date)
   *
   * @param value - The literal value
   * @param datatype - The datatype IRI
   * @returns QuadBuilder for finalizing
   */
  readonly typedLiteral: (value: string, datatype: IRI.Type) => QuadBuilder;

  /**
   * Complete with an IRI or BlankNode object
   *
   * @param o - The object IRI or BlankNode
   * @returns QuadBuilder for finalizing
   */
  readonly object: (o: IRI.Type | BlankNode.Type) => QuadBuilder;
}

/**
 * Builder for specifying the predicate after subject is set.
 */
export interface PredicateBuilder {
  /**
   * Specify the predicate IRI
   *
   * @param p - The predicate IRI
   * @returns ObjectBuilder for specifying the object
   */
  readonly predicate: (p: IRI.Type) => ObjectBuilder;
}

/**
 * Builder for specifying subject after graph context is set.
 */
export interface SubjectBuilder {
  /**
   * Specify the subject IRI or BlankNode
   *
   * @param s - The subject IRI or BlankNode
   * @returns PredicateBuilder for specifying the predicate
   */
  readonly subject: (s: Quad["subject"]) => PredicateBuilder;
}

/**
 * RdfBuilder Effect.Service
 *
 * Fluent builder API for constructing and adding RDF quads to the store.
 * Provides a chainable interface for type-safe triple construction.
 *
 * @since 0.1.0
 * @category services
 */
export class RdfBuilder extends Effect.Service<RdfBuilder>()("@beep/knowledge-server/RdfBuilder", {
  accessors: true,
  effect: Effect.gen(function* () {
    const store = yield* RdfStore;

    /**
     * Create a QuadBuilder from a complete quad context
     */
    const createQuadBuilder = (ctx: QuadContext): QuadBuilder => {
      const buildQuad = (): Quad =>
        new Quad({
          subject: ctx.subject,
          predicate: ctx.predicate,
          object: ctx.object,
          graph: O.getOrUndefined(ctx.graph),
        });

      return {
        add: (): Effect.Effect<void> =>
          store.addQuad(buildQuad()).pipe(
            Effect.withSpan("RdfBuilder.add", {
              attributes: {
                subject: ctx.subject,
                predicate: ctx.predicate,
              },
            })
          ),

        build: buildQuad,

        predicate: (p: IRI.Type): ObjectBuilder =>
          createObjectBuilder({
            graph: ctx.graph,
            subject: ctx.subject,
            predicate: p,
          }),
      };
    };

    /**
     * Create an ObjectBuilder from predicate context
     */
    const createObjectBuilder = (ctx: ObjectContext): ObjectBuilder => ({
      literal: (value: string, language?: string): QuadBuilder => {
        const literalObj = language !== undefined ? new Literal({ value, language }) : new Literal({ value });

        return createQuadBuilder({
          ...ctx,
          object: literalObj,
        });
      },

      typedLiteral: (value: string, datatype: IRI.Type): QuadBuilder =>
        createQuadBuilder({
          ...ctx,
          object: new Literal({ value, datatype }),
        }),

      object: (o: IRI.Type | BlankNode.Type): QuadBuilder =>
        createQuadBuilder({
          ...ctx,
          object: o,
        }),
    });

    /**
     * Create a PredicateBuilder from subject context
     */
    const createPredicateBuilder = (ctx: PredicateContext): PredicateBuilder => ({
      predicate: (p: IRI.Type): ObjectBuilder =>
        createObjectBuilder({
          ...ctx,
          predicate: p,
        }),
    });

    /**
     * Create a SubjectBuilder from graph context
     */
    const createSubjectBuilder = (ctx: SubjectContext): SubjectBuilder => ({
      subject: (s: Quad["subject"]): PredicateBuilder =>
        createPredicateBuilder({
          ...ctx,
          subject: s,
        }),
    });

    return {
      /**
       * Start building a quad with the given subject
       *
       * @param s - The subject IRI or BlankNode
       * @returns PredicateBuilder for chaining
       */
      subject: (s: Quad["subject"]): PredicateBuilder =>
        createPredicateBuilder({
          graph: O.none(),
          subject: s,
        }),

      /**
       * Set a named graph context for subsequent quads
       *
       * @param g - The named graph IRI
       * @returns SubjectBuilder for specifying subject
       */
      inGraph: (g: IRI.Type): SubjectBuilder =>
        createSubjectBuilder({
          graph: O.some(g),
        }),

      /**
       * Add multiple quads to the store at once
       *
       * @param quads - The quads to add
       * @returns Effect that adds all quads
       */
      batch: (quads: ReadonlyArray<Quad>): Effect.Effect<void> =>
        store.addQuads(quads).pipe(
          Effect.withSpan("RdfBuilder.batch", {
            attributes: { count: A.length(quads) },
          })
        ),
    };
  }),
}) {}
