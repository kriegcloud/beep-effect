/**
 * NLPService - high-level facade over a pluggable {@link Backend.NLPBackend}.
 *
 * The main entry point for NLP in the categorical text-processing framework:
 * abstracts the backend behind a clean API ({@link NLPServiceShape.processText}
 * builds an annotated text graph; the other methods surface entities, relations,
 * and POS tags). The service depends on an {@link Backend.NLPBackend} provided via
 * a layer (e.g. `WinkBackendLive`).
 *
 * Ported from the `adjunct` repo (Effect v3) to Effect v4 / `@beep/nlp`:
 * `Context.GenericTag` becomes the `Context.Service` class form; `getBackend`
 * becomes a bare `Effect` (no zero-arg thunk).
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $NlpId } from "@beep/identity";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Backend from "./Backend/NLPBackend.ts";
import * as ATG from "./Graph/AnnotatedTextGraph.ts";
import type { NLPBackendError, NLPBackendShape } from "./Backend/NLPBackend.ts";
import type { AnnotatedTextGraph } from "./Graph/AnnotatedTextGraph.ts";
import type { EntityNode, POSNode, RelationNode } from "./Graph/Schema.ts";

const $I = $NlpId.create("NLPService");

/**
 * Structural shape of the {@link NLPService}.
 *
 * @since 0.0.0
 * @category models
 */
export interface NLPServiceShape {
  /** Extract named entities from text. */
  readonly extractEntities: (text: string) => Effect.Effect<ReadonlyArray<EntityNode>, NLPBackendError>;
  /** Extract semantic relations from text. */
  readonly extractRelations: (text: string) => Effect.Effect<ReadonlyArray<RelationNode>, NLPBackendError>;
  /** The underlying backend. */
  readonly getBackend: Effect.Effect<NLPBackendShape>;
  /** Process text into an annotated text graph. */
  readonly processText: (text: string) => Effect.Effect<AnnotatedTextGraph, NLPBackendError>;
  /** Tag parts of speech. */
  readonly tagPartsOfSpeech: (text: string) => Effect.Effect<ReadonlyArray<POSNode>, NLPBackendError>;
}

/**
 * Service tag for the {@link NLPServiceShape} facade.
 *
 * @example
 * ```ts
 * import { NLPService } from "@beep/nlp/NLPService"
 *
 * console.log(NLPService.key)
 * ```
 *
 * @since 0.0.0
 * @category services
 */
export class NLPService extends Context.Service<NLPService, NLPServiceShape>()($I`NLPService`) {}

/**
 * Build an {@link NLPServiceShape} facade from a backend.
 *
 * @example
 * ```ts
 * import { make } from "@beep/nlp/NLPService"
 *
 * console.log(typeof make)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const make = (backend: NLPBackendShape): NLPServiceShape =>
  NLPService.of({
    extractEntities: Effect.fn("NLPService.extractEntities")(function* (text: string) {
      return yield* backend.extractEntities(text);
    }),
    extractRelations: Effect.fn("NLPService.extractRelations")(function* (text: string) {
      return yield* backend.extractRelations(text);
    }),
    getBackend: Effect.succeed(backend),
    processText: Effect.fn("NLPService.processText")(function* (text: string) {
      return yield* Effect.provideService(ATG.fromDocumentAnnotated(text), Backend.NLPBackend, backend);
    }),
    tagPartsOfSpeech: Effect.fn("NLPService.tagPartsOfSpeech")(function* (text: string) {
      return yield* backend.posTag(text);
    }),
  });

/**
 * Construct an {@link NLPService} layer from a backend layer.
 *
 * @example
 * ```ts
 * import { layer } from "@beep/nlp/NLPService"
 *
 * console.log(typeof layer)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const layer = <E, R>(backendLayer: Layer.Layer<Backend.NLPBackend, E, R>): Layer.Layer<NLPService, E, R> =>
  Layer.provide(Layer.effect(NLPService, Effect.map(Backend.NLPBackend, make)), backendLayer);

/**
 * Process text into an annotated graph using the {@link NLPService} from context.
 *
 * @since 0.0.0
 * @category accessors
 */
export const processText = (text: string): Effect.Effect<AnnotatedTextGraph, NLPBackendError, NLPService> =>
  Effect.flatMap(NLPService, (service) => service.processText(text));

/**
 * Extract entities using the {@link NLPService} from context.
 *
 * @since 0.0.0
 * @category accessors
 */
export const extractEntities = (text: string): Effect.Effect<ReadonlyArray<EntityNode>, NLPBackendError, NLPService> =>
  Effect.flatMap(NLPService, (service) => service.extractEntities(text));

/**
 * Extract relations using the {@link NLPService} from context.
 *
 * @since 0.0.0
 * @category accessors
 */
export const extractRelations = (
  text: string
): Effect.Effect<ReadonlyArray<RelationNode>, NLPBackendError, NLPService> =>
  Effect.flatMap(NLPService, (service) => service.extractRelations(text));

/**
 * Tag parts of speech using the {@link NLPService} from context.
 *
 * @since 0.0.0
 * @category accessors
 */
export const tagPartsOfSpeech = (text: string): Effect.Effect<ReadonlyArray<POSNode>, NLPBackendError, NLPService> =>
  Effect.flatMap(NLPService, (service) => service.tagPartsOfSpeech(text));
