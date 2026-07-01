/**
 * Effect service for Discord REST API proof calls.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $DiscordId } from "@beep/identity";
import { Context, Effect, Layer, pipe, Redacted } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { FetchHttpClient } from "effect/unstable/http";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import { DiscordError } from "./Discord.errors.ts";
import {
  DiscordChannelProof,
  DiscordChannelRequest,
  DiscordConfigInput,
  DiscordCreateMessageRequest,
  DiscordMessageProof,
} from "./Discord.models.ts";
import type * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";

const $I = $DiscordId.create("Discord.service");

const DISCORD_API_URL = "https://discord.com/api/v10";
const normalizeBaseUrl = Str.replace(/\/+$/, "");
const decodeChannelRequest = S.decodeUnknownEffect(DiscordChannelRequest);
const decodeCreateMessageRequest = S.decodeUnknownEffect(DiscordCreateMessageRequest);

class DiscordRawChannel extends S.Class<DiscordRawChannel>($I`DiscordRawChannel`)(
  {
    guild_id: S.optionalKey(S.String),
    id: S.String,
    name: S.optionalKey(S.String),
  },
  $I.annote("DiscordRawChannel", {
    description: "Subset of Discord channel response fields needed for sanitized proof.",
  })
) {}

class DiscordRawMessage extends S.Class<DiscordRawMessage>($I`DiscordRawMessage`)(
  {
    channel_id: S.String,
    id: S.String,
    timestamp: S.optionalKey(S.String),
  },
  $I.annote("DiscordRawMessage", {
    description: "Subset of Discord message response fields needed for sanitized proof.",
  })
) {}

const decodeRawChannel = S.decodeUnknownEffect(DiscordRawChannel);
const decodeRawMessage = S.decodeUnknownEffect(DiscordRawMessage);

/**
 * Runtime shape exposed by the Discord REST driver service.
 *
 * @category services
 * @since 0.0.0
 */
interface DiscordShape {
  readonly createMessage: (
    request: DiscordCreateMessageRequest,
    botToken: Redacted.Redacted
  ) => Effect.Effect<DiscordMessageProof, DiscordError>;
  readonly getChannel: (
    request: DiscordChannelRequest,
    botToken: Redacted.Redacted
  ) => Effect.Effect<DiscordChannelProof, DiscordError>;
}

const errorCause = (cause: unknown): string => (P.isString(cause) ? cause : "unknown");

const discordPath = (path: string): string => (Str.startsWith("/")(path) ? path : `/${path}`);

const authRequest = (
  request: HttpClientRequest.HttpClientRequest,
  botToken: Redacted.Redacted
): HttpClientRequest.HttpClientRequest =>
  pipe(
    request,
    HttpClientRequest.setHeader("Authorization", `Bot ${Redacted.value(botToken)}`),
    HttpClientRequest.accept("application/json")
  );

const ensureSuccess = (
  response: HttpClientResponse.HttpClientResponse,
  path: string,
  method: string
): Effect.Effect<HttpClientResponse.HttpClientResponse, DiscordError> =>
  response.status >= 200 && response.status < 300
    ? Effect.succeed(response)
    : Effect.fail(DiscordError.make({ method, path, reason: "response-status", status: response.status }));

const executeJson = Effect.fn("Discord.executeJson")(function* (
  client: HttpClient.HttpClient,
  baseUrl: string,
  path: string,
  method: "GET" | "POST",
  botToken: Redacted.Redacted,
  body?: unknown
) {
  const fullPath = discordPath(path);
  const rawRequest = HttpClientRequest.make(method)(`${baseUrl}${fullPath}`);
  const request = yield* pipe(
    body === undefined ? Effect.succeed(rawRequest) : HttpClientRequest.bodyJson(rawRequest, body),
    Effect.mapError((cause) =>
      DiscordError.make({ cause: errorCause(cause), method, path: fullPath, reason: "request" })
    ),
    Effect.map((requestWithBody) => authRequest(requestWithBody, botToken))
  );

  const response = yield* client
    .execute(request)
    .pipe(
      Effect.mapError((cause) =>
        DiscordError.make({ cause: errorCause(cause), method, path: fullPath, reason: "transport" })
      )
    );
  const successful = yield* ensureSuccess(response, fullPath, method);

  return yield* successful.json.pipe(
    Effect.mapError((cause) =>
      DiscordError.make({ cause: errorCause(cause), method, path: fullPath, reason: "response-decoding" })
    )
  );
});

const makeService = (client: HttpClient.HttpClient, config: DiscordConfigInput): DiscordShape => {
  const baseUrl = normalizeBaseUrl(config.baseUrl ?? DISCORD_API_URL);

  return {
    createMessage: Effect.fn("Discord.createMessage")(function* (rawRequest, botToken) {
      const request = yield* decodeCreateMessageRequest(rawRequest).pipe(
        Effect.mapError((cause) => DiscordError.make({ cause: errorCause(cause), reason: "request" }))
      );
      const body = {
        allowed_mentions: {
          parse: [],
        },
        content: request.content,
      };
      const raw = yield* executeJson(
        client,
        baseUrl,
        `/channels/${request.channelId}/messages`,
        "POST",
        botToken,
        body
      );
      const decoded = yield* decodeRawMessage(raw).pipe(
        Effect.mapError((cause) => DiscordError.make({ cause: errorCause(cause), reason: "response-decoding" }))
      );

      return DiscordMessageProof.make({
        channelId: decoded.channel_id,
        messageId: decoded.id,
        status: 200,
        ...R.getSomes({
          timestamp: O.fromUndefinedOr(decoded.timestamp),
        }),
      });
    }),
    getChannel: Effect.fn("Discord.getChannel")(function* (rawRequest, botToken) {
      const request = yield* decodeChannelRequest(rawRequest).pipe(
        Effect.mapError((cause) => DiscordError.make({ cause: errorCause(cause), reason: "request" }))
      );
      const raw = yield* executeJson(client, baseUrl, `/channels/${request.channelId}`, "GET", botToken);
      const decoded = yield* decodeRawChannel(raw).pipe(
        Effect.mapError((cause) => DiscordError.make({ cause: errorCause(cause), reason: "response-decoding" }))
      );

      return DiscordChannelProof.make({
        channelId: decoded.id,
        status: 200,
        ...R.getSomes({
          guildId: O.fromUndefinedOr(decoded.guild_id),
          name: O.fromUndefinedOr(decoded.name),
        }),
      });
    }),
  };
};

/**
 * Discord REST boundary for channel liveness checks and proof message creation.
 *
 * @remarks
 * The service validates request objects before issuing HTTP, maps transport and
 * decoding failures into {@link DiscordError}, and returns sanitized proof
 * models instead of raw Discord payloads.
 *
 * @example
 * ```ts
 * import {
 *   Discord,
 *   DiscordChannelRequest,
 *   DiscordConfigInput
 * } from "@beep/discord"
 * import { Effect, Layer, Redacted } from "effect"
 * import * as HttpClient from "effect/unstable/http/HttpClient"
 * import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse"
 *
 * const TestHttpClient = Layer.succeed(
 *   HttpClient.HttpClient,
 *   HttpClient.make((request) =>
 *     Effect.succeed(
 *       HttpClientResponse.fromWeb(
 *         request,
 *         Response.json({
 *           guild_id: "guild-1",
 *           id: "channel-1",
 *           name: "proof-channel"
 *         })
 *       )
 *     )
 *   )
 * )
 *
 * const DiscordTest = Discord.makeLayer(
 *   DiscordConfigInput.make({
 *     baseUrl: "https://discord.example.test/api/v10"
 *   })
 * ).pipe(Layer.provide(TestHttpClient))
 *
 * const program = Effect.gen(function* () {
 *   const discord = yield* Discord
 *   const proof = yield* discord.getChannel(
 *     DiscordChannelRequest.make({ channelId: "channel-1" }),
 *     Redacted.make("bot-token")
 *   )
 *   return proof.name ?? "unnamed"
 * }).pipe(Effect.provide(DiscordTest))
 *
 * const channelName = await Effect.runPromise(program)
 * console.log(channelName) // "proof-channel"
 * ```
 *
 * @effects
 * - Sends authenticated `GET /channels/:id` and
 *   `POST /channels/:id/messages` requests through the provided HTTP client.
 * - Reads the redacted bot token to set Discord's `Authorization` header.
 * - Creates proof messages with Discord mentions disabled.
 *
 * @see {@link DiscordConfigInput} for base URL configuration.
 * @see {@link DiscordError} for typed failures.
 * @category services
 * @since 0.0.0
 */
export class Discord extends Context.Service<Discord, DiscordShape>()($I`Discord`) {
  /**
   * Build a Discord REST driver layer with an injected HTTP client.
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly makeLayer = (
    config = DiscordConfigInput.make({})
  ): Layer.Layer<Discord, never, HttpClient.HttpClient> =>
    Layer.effect(
      Discord,
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        return Discord.of(makeService(client, config));
      })
    );

  /**
   * Live Discord REST driver layer backed by the platform fetch client.
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly layer: Layer.Layer<Discord> = Discord.makeLayer().pipe(Layer.provide(FetchHttpClient.layer));
}
