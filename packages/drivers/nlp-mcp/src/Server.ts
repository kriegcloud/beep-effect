/**
 * MCP server wiring for the `@beep/nlp` MCP driver.
 *
 * Binds the {@link NlpToolkit} handlers to the pluggable
 * {@link @beep/nlp/Backend#NLPBackend} (defaulting to the wink-nlp backend) and
 * composes the stdio-transport MCP server layer. Each handler maps a backend
 * operation's result into its flat MCP output schema and translates backend
 * failures into {@link Schemas.NlpToolError}.
 *
 * Effect v4 driver note: handlers back onto `NLPBackend` (the granular
 * contract), use `Effect.fn` + `Effect.mapError`, and keep node ids/timestamps
 * inside `@beep/nlp`.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import * as Backend from "@beep/nlp/Backend/NLPBackend";
import { A, O } from "@beep/utils";
import * as WinkEngine from "@beep/wink";
import { WinkBackendLive } from "@beep/wink";
import { Effect, Layer } from "effect";
import * as McpServer from "effect/unstable/ai/McpServer";
import * as Schemas from "./Schemas.ts";
import { NlpToolkit } from "./Tools.ts";
import type { Stdio } from "effect/Stdio";

const toToolError =
  (operation: string) =>
  (error: Backend.NLPBackendError): Schemas.NlpToolError =>
    Schemas.NlpToolError.make({ message: error.message, operation });

/**
 * Build the {@link NlpToolkit} handler record from an
 * {@link @beep/nlp/Backend#NLPBackend}. Each handler maps a backend operation's
 * result into its flat MCP output schema and translates backend failures into
 * {@link Schemas.NlpToolError}. Exposed directly (not only as a layer) so tests
 * can invoke handlers with their concrete success/failure types.
 *
 * @example
 * ```ts
 * import { makeNlpHandlers } from "@beep/nlp-mcp/Server"
 *
 * console.log(makeNlpHandlers)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const makeNlpHandlers = Effect.gen(function* () {
  const backend = yield* Backend.NLPBackend;

  return {
    nlp_entities: Effect.fn("nlp-mcp.nlp_entities")(function* (params: Schemas.TextInput) {
      const entities = yield* Effect.mapError(backend.extractEntities(params.text), toToolError("extractEntities"));
      const result = A.map(entities, (entity) =>
        Schemas.EntityEntry.make({
          entityType: entity.entityType,
          text: entity.text,
          ...O.getSomesStruct({
            confidence: O.fromUndefinedOr(entity.confidence),
            span: O.map(O.fromUndefinedOr(entity.span), (span) => ({ end: span.end, start: span.start })),
          }),
        })
      );
      return Schemas.EntityOutput.make({ count: A.length(result), result });
    }),

    nlp_lemmatize: Effect.fn("nlp-mcp.nlp_lemmatize")(function* (params: Schemas.TextInput) {
      const lemmas = yield* Effect.mapError(backend.lemmatize(params.text), toToolError("lemmatize"));
      const result = A.map(lemmas, (lemma) =>
        Schemas.LemmaEntry.make({ lemma: lemma.lemma, position: lemma.position, token: lemma.token })
      );
      return Schemas.LemmaOutput.make({ count: A.length(result), result });
    }),

    nlp_pos_tag: Effect.fn("nlp-mcp.nlp_pos_tag")(function* (params: Schemas.TextInput) {
      const tags = yield* Effect.mapError(backend.posTag(params.text), toToolError("posTag"));
      const result = A.map(tags, (tag) =>
        Schemas.POSEntry.make({ position: tag.position, tag: tag.tag, text: tag.text })
      );
      return Schemas.POSOutput.make({ count: A.length(result), result });
    }),

    nlp_sentencize: Effect.fn("nlp-mcp.nlp_sentencize")(function* (params: Schemas.TextInput) {
      const sentences = yield* Effect.mapError(backend.sentencize(params.text), toToolError("sentencize"));
      return Schemas.TextArrayOutput.make({ count: A.length(sentences), result: A.fromIterable(sentences) });
    }),

    nlp_tokenize: Effect.fn("nlp-mcp.nlp_tokenize")(function* (params: Schemas.TextInput) {
      const tokens = yield* Effect.mapError(backend.tokenize(params.text), toToolError("tokenize"));
      return Schemas.TextArrayOutput.make({ count: A.length(tokens), result: A.fromIterable(tokens) });
    }),
  };
});

/**
 * The handler layer binding each {@link NlpToolkit} tool to an
 * {@link @beep/nlp/Backend#NLPBackend} operation. Requires an `NLPBackend` in context.
 *
 * @example
 * ```ts
 * import { NlpToolkitHandlersLive } from "@beep/nlp-mcp/Server"
 *
 * console.log(NlpToolkitHandlersLive)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const NlpToolkitHandlersLive = NlpToolkit.toLayer(makeNlpHandlers);

/**
 * The live wink-nlp backend layer (the default {@link @beep/nlp/Backend#NLPBackend}
 * implementation) with its `WinkEngine` dependency provided. Engine initialization
 * failures are promoted to defects, so the resolved layer has no error channel.
 *
 * @example
 * ```ts
 * import { BackendLive } from "@beep/nlp-mcp/Server"
 *
 * console.log(BackendLive)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const BackendLive: Layer.Layer<Backend.NLPBackend> = Layer.provide(
  WinkBackendLive,
  WinkEngine.WinkEngineLive
).pipe(Layer.orDie);

/**
 * Configuration for the MCP server identity advertised to clients.
 *
 * @since 0.0.0
 * @category models
 */
export interface NlpMcpServerConfig {
  readonly name: string;
  readonly version: string;
}

/**
 * Build the stdio-transport MCP server layer exposing the NLP toolkit.
 *
 * Registers {@link NlpToolkit} (with its wink-backed handlers) into an MCP
 * server served over stdio with NDJSON-RPC framing. The resulting layer still
 * requires a `Stdio` service — provide `NodeStdio.layer` (from
 * `@effect/platform-node`) at the entrypoint (see `./bin.ts`). Keeping the node
 * transport out of this module leaves the server layer platform-agnostic and
 * testable.
 *
 * @example
 * ```ts
 * import { makeServerLayer } from "@beep/nlp-mcp/Server"
 *
 * console.log(makeServerLayer({ name: "beep-nlp", version: "0.0.0" }))
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const makeServerLayer = (config: NlpMcpServerConfig): Layer.Layer<never, never, Stdio> =>
  McpServer.toolkit(NlpToolkit).pipe(
    Layer.provide(NlpToolkitHandlersLive),
    Layer.provide(BackendLive),
    Layer.provide(McpServer.layerStdio({ name: config.name, version: config.version }))
  );
