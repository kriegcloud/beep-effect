import { $KnowledgeServerId } from "@beep/identity/packages";
import { type BlankNode, type IRI, Literal, Quad } from "@beep/knowledge-domain/value-objects";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import { RdfStore, RdfStoreLive } from "./RdfStoreService";

const $I = $KnowledgeServerId.create("Rdf/RdfBuilder");

interface SubjectContext {
  readonly graph: O.Option<IRI.Type>;
}

interface PredicateContext extends SubjectContext {
  readonly subject: Quad["subject"];
}

interface ObjectContext extends PredicateContext {
  readonly predicate: IRI.Type;
}

interface QuadContext extends ObjectContext {
  readonly object: Quad["object"];
}

export interface QuadBuilder {
  readonly add: () => Effect.Effect<void>;
  readonly build: () => Quad;
  readonly predicate: (p: IRI.Type) => ObjectBuilder;
}

export interface ObjectBuilder {
  readonly literal: (value: string, language?: string) => QuadBuilder;
  readonly typedLiteral: (value: string, datatype: IRI.Type) => QuadBuilder;
  readonly object: (o: IRI.Type | BlankNode.Type) => QuadBuilder;
}

export interface PredicateBuilder {
  readonly predicate: (p: IRI.Type) => ObjectBuilder;
}

export interface SubjectBuilder {
  readonly subject: (s: Quad["subject"]) => PredicateBuilder;
}

export interface RdfBuilderShape {
  readonly subject: (s: Quad["subject"]) => PredicateBuilder;
  readonly inGraph: (g: IRI.Type) => SubjectBuilder;
  readonly batch: (quads: ReadonlyArray<Quad>) => Effect.Effect<void>;
}

export class RdfBuilder extends Context.Tag($I`RdfBuilder`)<RdfBuilder, RdfBuilderShape>() {}

const serviceEffect: Effect.Effect<RdfBuilderShape, never, RdfStore> = Effect.gen(function* () {
  const store = yield* RdfStore;

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

  const createObjectBuilder = (ctx: ObjectContext): ObjectBuilder => ({
    literal: (value: string, language?: undefined | string): QuadBuilder => {
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

  const createPredicateBuilder = (ctx: PredicateContext): PredicateBuilder => ({
    predicate: (p: IRI.Type): ObjectBuilder =>
      createObjectBuilder({
        ...ctx,
        predicate: p,
      }),
  });

  const createSubjectBuilder = (ctx: SubjectContext): SubjectBuilder => ({
    subject: (s: Quad["subject"]): PredicateBuilder =>
      createPredicateBuilder({
        ...ctx,
        subject: s,
      }),
  });

  const subject = (s: Quad["subject"]): PredicateBuilder =>
    createPredicateBuilder({
      graph: O.none(),
      subject: s,
    });

  const inGraph = (g: IRI.Type): SubjectBuilder =>
    createSubjectBuilder({
      graph: O.some(g),
    });

  const batch = Effect.fn("RdfBuilder.batch")((quads: ReadonlyArray<Quad>) =>
    store.addQuads(quads).pipe(
      Effect.withSpan("RdfBuilder.batch", {
        attributes: { count: A.length(quads) },
      })
    )
  );

  return RdfBuilder.of({
    subject,
    inGraph,
    batch,
  });
});

export const RdfBuilderLive = Layer.effect(RdfBuilder, serviceEffect).pipe(Layer.provide(RdfStoreLive));
