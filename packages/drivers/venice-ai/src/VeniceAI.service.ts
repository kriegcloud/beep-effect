/**
 * Venice AI chat service backed by Effect's OpenAI-compatible AI adapter.
 */

import { $VeniceAiId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { OpenAiClient, OpenAiLanguageModel } from "@effect/ai-openai-compat";
import { Config, Context, Effect, Layer, Ref } from "effect";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import { AiError, Chat, LanguageModel, Prompt } from "effect/unstable/ai";
import { FetchHttpClient } from "effect/unstable/http";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";

const $I = $VeniceAiId.create("VeniceAI.service");

/**
 * OpenAI-compatible Venice API base URL.
 *
 * @example
 * ```ts
 * import { VENICE_API_URL } from "@beep/venice-ai"
 *
 * console.log(VENICE_API_URL)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const VENICE_API_URL = "https://api.venice.ai/api/v1" as const;

/**
 * Default Venice text model used by the demo chat service.
 *
 * @example
 * ```ts
 * import { VENICE_CHAT_MODEL } from "@beep/venice-ai"
 *
 * console.log(VENICE_CHAT_MODEL)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const VENICE_CHAT_MODEL = "venice-uncensored-1-2" as const;

/**
 * Prompt used by the runnable Venice demo.
 *
 * @example
 * ```ts
 * import { VENICE_FAVORITE_JOKE_PROMPT } from "@beep/venice-ai"
 *
 * console.log(VENICE_FAVORITE_JOKE_PROMPT)
 * ```
 *
 * @category configuration
 * @since 0.0.0
 */
export const VENICE_FAVORITE_JOKE_PROMPT = "What is your favorite joke?" as const;

const isVeniceJsonChatResponse = (response: HttpClientResponse.HttpClientResponse) =>
  Str.endsWith("/chat/completions")(response.request.url) &&
  Str.includes("application/json")(response.headers["content-type"] ?? "");

const normalizeVeniceServiceTier = (body: unknown): unknown =>
  P.isObject(body) && P.isNull(body.service_tier) ? { ...body, service_tier: undefined } : body;

const normalizeVeniceChatResponse = (response: HttpClientResponse.HttpClientResponse) =>
  isVeniceJsonChatResponse(response)
    ? response.json.pipe(
        Effect.map(normalizeVeniceServiceTier),
        Effect.map((body) =>
          HttpClientResponse.fromWeb(response.request, Response.json(body, { status: response.status }))
        )
      )
    : Effect.succeed(response);

const VeniceOpenAiClientLayer = OpenAiClient.layerConfig({
  apiKey: Config.redacted("AI_VENICE_API_KEY"),
  apiUrl: Config.succeed(VENICE_API_URL),
  transformClient: HttpClient.transformResponse(Effect.flatMap(normalizeVeniceChatResponse)),
}).pipe(Layer.provide(FetchHttpClient.layer));

const VeniceLanguageModelLayer = OpenAiLanguageModel.model(VENICE_CHAT_MODEL).pipe(
  Layer.provide(VeniceOpenAiClientLayer)
);

/**
 * Typed error returned when the Venice chat service cannot generate text.
 *
 * @example
 * ```ts
 * import type { VeniceAiChatError } from "@beep/venice-ai"
 *
 * const tag = (error: VeniceAiChatError) => error._tag
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class VeniceAiChatError extends TaggedErrorClass<VeniceAiChatError>($I`VeniceAiChatError`)(
  "VeniceAiChatError",
  {
    reason: AiError.AiErrorReason,
  },
  $I.annote("VeniceAiChatError", {
    description: "A typed Venice chat generation failure.",
  })
) {
  static fromAiError(error: AiError.AiError) {
    return new VeniceAiChatError({ reason: error.reason });
  }
}

/**
 * Stateful Venice chat service.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { VeniceAiChat } from "@beep/venice-ai"
 *
 * const program = Effect.gen(function* () {
 *   const venice = yield* VeniceAiChat
 *   return yield* venice.chat("What is your favorite joke?")
 * })
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class VeniceAiChat extends Context.Service<
  VeniceAiChat,
  {
    readonly chat: (message: string) => Effect.Effect<string, VeniceAiChatError>;
  }
>()($I`VeniceAiChat`) {
  /**
   * Live Venice chat service layer.
   *
   * @example
   * ```ts
   * import { Effect } from "effect"
   * import { VeniceAiChat } from "@beep/venice-ai"
   *
   * const program = Effect.gen(function* () {
   *   const venice = yield* VeniceAiChat
   *   return yield* venice.chat("What is your favorite joke?")
   * }).pipe(Effect.provide(VeniceAiChat.layer))
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly layer = Layer.effect(
    VeniceAiChat,
    Effect.gen(function* () {
      const languageModel = yield* LanguageModel.LanguageModel;
      const session = yield* Chat.fromPrompt(
        Prompt.empty.pipe(Prompt.setSystem("You are Venice AI. Answer directly and keep jokes concise."))
      );

      const chat = Effect.fn("VeniceAiChat.chat")(function* (message: string) {
        const response = yield* session
          .generateText({ prompt: message })
          .pipe(Effect.provideService(LanguageModel.LanguageModel, languageModel));
        const history = yield* Ref.get(session.history);
        yield* Effect.logInfo(`Venice chat history has ${history.content.length} messages`);

        return response.text;
      }, Effect.mapError(VeniceAiChatError.fromAiError));

      return VeniceAiChat.of({
        chat,
      });
    })
  ).pipe(Layer.provide(VeniceLanguageModelLayer));
}
