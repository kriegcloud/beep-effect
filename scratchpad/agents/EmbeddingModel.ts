/**
 * Defines the provider-neutral service for text embeddings.
 *
 * An `EmbeddingModel` turns text into numeric vectors. It supports single-input
 * embedding and ordered batch embedding, and represents provider failures as
 * `AiError` values. This module also includes the embedding dimensions service,
 * request and response models, usage metadata, provider contracts, and a
 * constructor that adapts a provider batch implementation into the service.
 * Single `embed` calls can be batched together internally.
 *
 * @since 0.0.0
 */

import { $AgentsDomainId } from "@beep/identity/packages";
import { Context, Effect, Exit, Request, RequestResolver } from "effect";
import * as S from "effect/Schema";
import * as AiError from "./AiError.ts";

const $I = $AgentsDomainId.create("EmbeddingModel");

/**
 * Service tag for embedding model operations.
 *
 * **When to use**
 *
 * Use to retrieve or provide the embedding model service for an `Effect`
 * program that embeds text into vectors.
 *
 * @see {@link Service} for the service contract provided by this tag
 * @see {@link make} for constructing an embedding model service from a provider
 * @see {@link Dimensions} for the current embedding vector size service
 *
 * @category services
 * @since 0.0.0
 */
export class EmbeddingModel extends Context.Service<EmbeddingModel, Service>()($I`EmbeddingModel`) {}

/**
 * Service tag that provides the current embedding dimensions.
 *
 * **When to use**
 *
 * Use to retrieve or provide the configured embedding vector size through
 * context.
 *
 * @see {@link EmbeddingModel} for the embedding service that uses these dimensions
 *
 * @category services
 * @since 0.0.0
 */
export class Dimensions extends Context.Service<Dimensions, number>()($I`Dimensions`) {}

/**
 * Represents token usage metadata for embedding operations.
 *
 * **Details**
 *
 * Contains optional provider-reported `inputTokens`. The value may be
 * `undefined` when the provider does not report usage or when `embedMany([])`
 * bypasses the provider.
 *
 * @category models
 * @since 0.0.0
 */
export class EmbeddingUsage extends S.Class<EmbeddingUsage>($I`EmbeddingUsage`)(
  {
    inputTokens: S.UndefinedOr(S.Finite),
  },
  $I.annote("EmbeddingUsage", {
    description: "Token usage metadata for embedding operations, with optional provider-reported input tokens.",
  })
) {}

/**
 * Response for a single embedding request.
 *
 * @category models
 * @since 0.0.0
 */
export class EmbedResponse extends S.Class<EmbedResponse>($I`EmbedResponse`)(
  {
    vector: S.Array(S.Finite),
  },
  $I.annote("EmbedResponse", {
    description: "Response for a single embedding request.",
  })
) {}

/**
 * Response for batch embedding requests containing per-input embeddings and usage
 * metadata.
 *
 * **Details**
 *
 * `embeddings` preserves batch order, and `usage` carries token metadata for
 * the operation.
 *
 * @see {@link EmbedResponse} for individual embedding responses
 * @see {@link EmbeddingUsage} for token usage metadata
 *
 * @category models
 * @since 0.0.0
 */
export class EmbedManyResponse extends S.Class<EmbedManyResponse>($I`EmbedManyResponse`)(
  {
    embeddings: S.Array(EmbedResponse),
    usage: EmbeddingUsage,
  },
  $I.annote("EmbedManyResponse", {
    description:
      "Response for batch embedding requests, with order-preserving per-input embeddings and usage metadata.",
  })
) {}

/**
 * Provider input options for embedding requests.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface ProviderOptions {
  readonly inputs: ReadonlyArray<string>;
}

/**
 * Provider response for batch embedding requests.
 *
 * @category models
 * @since 0.0.0
 */
export interface ProviderResponse {
  readonly results: Array<Array<number>>;
  readonly usage: {
    readonly inputTokens: number | undefined;
  };
}

/**
 * Represents a tagged request used by request resolvers for embedding operations.
 *
 * **When to use**
 *
 * Use when you need a typed request for one embedding input while building or
 * calling a low-level embedding request resolver.
 *
 * @see {@link Service} for the resolver-bearing service contract
 * @see {@link make} for constructing the request resolver from a provider implementation
 * @see {@link EmbedResponse} for the response produced by this request
 *
 * @category constructors
 * @since 0.0.0
 */
export class EmbeddingRequest extends Request.TaggedClass("EmbeddingRequest")<
  { readonly input: string },
  EmbedResponse,
  AiError.AiError
> {}

/**
 * Defines the service interface for embedding operations.
 *
 * @category models
 * @since 0.0.0
 */
export interface Service {
  readonly resolver: RequestResolver.RequestResolver<EmbeddingRequest>;
  readonly embed: (input: string) => Effect.Effect<EmbedResponse, AiError.AiError>;
  readonly embedMany: (input: ReadonlyArray<string>) => Effect.Effect<EmbedManyResponse, AiError.AiError>;
}

const invalidProviderResponse = (description: string): AiError.AiError =>
  AiError.make({
    module: "EmbeddingModel",
    method: "embedMany",
    reason: AiError.InvalidOutputError.make({ description }),
  });

/**
 * Creates an EmbeddingModel service from a provider embedMany implementation.
 *
 * **When to use**
 *
 * Use to adapt a provider's batch embedding implementation into an
 * `EmbeddingModel.Service` that offers single-input and batch embedding
 * operations.
 *
 * **Details**
 *
 * The returned service builds single-input `embed` calls through a request
 * resolver, so concurrent `embed` requests can be batched into one provider
 * `embedMany` call. Direct `embedMany` calls pass the input array to the
 * provider, while `embedMany([])` returns an empty response without calling the
 * provider.
 *
 * **Gotchas**
 *
 * Provider responses are interpreted positionally and must contain exactly one
 * result for each requested input. If the provider returns a different number
 * of results, `embed` and `embedMany` fail with `AiError.InvalidOutputError`.
 *
 * @see {@link Service} for the service shape returned by this constructor
 * @see {@link ProviderOptions} for the input passed to the provider implementation
 * @see {@link ProviderResponse} for the provider response contract consumed by this constructor
 *
 * @category constructors
 * @since 0.0.0
 */
export const make: (params: {
  readonly embedMany: (options: ProviderOptions) => Effect.Effect<ProviderResponse, AiError.AiError>;
}) => Effect.Effect<Service> = Effect.fnUntraced(function* (params) {
  const resolver = RequestResolver.make<EmbeddingRequest>((entries) =>
    Effect.flatMap(
      params.embedMany({
        inputs: entries.map((entry) => entry.request.input),
      }),
      (response) =>
        Effect.map(mapProviderResults(entries.length, response.results), (embeddings) => {
          for (let i = 0; i < entries.length; i++) {
            entries[i].completeUnsafe(Exit.succeed(embeddings[i]));
          }
        })
    )
  ).pipe(RequestResolver.withSpan("EmbeddingModel.resolver"));

  return EmbeddingModel.of({
    resolver,
    embed: Effect.fn("EmbeddingModel.embed")(function* (input) {
      return yield* Effect.request(new EmbeddingRequest({ input }), resolver).pipe(
        Effect.withSpan("EmbeddingModel.embed")
      );
    }),
    embedMany: Effect.fn("EmbeddingModel.embedMany")(function* (input) {
      return yield* (
        input.length === 0
          ? Effect.succeed(
              EmbedManyResponse.make({
                embeddings: [],
                usage: EmbeddingUsage.make({ inputTokens: undefined }),
              })
            )
          : params.embedMany({ inputs: input }).pipe(
              Effect.flatMap((response) =>
                mapProviderResults(input.length, response.results).pipe(
                  Effect.map((embeddings) =>
                    EmbedManyResponse.make({
                      embeddings,
                      usage: EmbeddingUsage.make({
                        inputTokens: response.usage.inputTokens,
                      }),
                    })
                  )
                )
              )
            )
      ).pipe(Effect.withSpan("EmbeddingModel.embedMany"));
    }),
  });
});

const mapProviderResults = (
  inputLength: number,
  results: Array<Array<number>>
): Effect.Effect<Array<EmbedResponse>, AiError.AiError> => {
  const embeddings = new Array<EmbedResponse>(inputLength);
  if (results.length !== inputLength) {
    return Effect.fail(
      invalidProviderResponse(`Provider returned ${results.length} embeddings but expected ${inputLength}`)
    );
  }
  for (let i = 0; i < results.length; i++) {
    const vector = results[i];
    embeddings[i] = EmbedResponse.make({ vector });
  }
  return Effect.succeed(embeddings);
};
